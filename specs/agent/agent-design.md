# poke-trade-agent — Detailed Technical Design

Implements the Agent component defined in [../architecture-design.md](../architecture-design.md) §4.4. That document set the shape (one runtime, two prompt configurations, in-process tool execution); this document makes it buildable.

Per agent-builder's core philosophy — "the model already knows how to be an agent; your job is to get out of the way" — this design deliberately stays boring: one loop, five capabilities, no planning layer, no subagents. That's the "Basic" tier in agent-builder's progressive-complexity table, and nothing about Trade Analysis or Set Overview chat needs more than that.

## 1. Confirmed API surface (checked against the installed SDK, not assumed)

`openai@6.39.0` is already installed. Its types confirm, directly from `node_modules/openai/resources/chat/completions/completions.d.ts`:

- `max_completion_tokens` is the live field; `max_tokens` is `@deprecated` — tech-spec.md's pitfall table is not stale advice, it's current.
- `tools?: Array<ChatCompletionTool>`, where a function tool is `{ type: 'function', function: FunctionDefinition }` (`FunctionDefinition = { name, description, parameters }`).
- `tool_choice` accepts `'auto' | 'required' | { type: 'function', function: { name } }` — the last form **forces** a specific tool call, which §4 relies on to guarantee the final structured answer.
- Streaming: `stream: true` yields `ChatCompletionChunk`s with `delta.tool_calls` and `delta.content` pieces to accumulate.
- `parallel_tool_calls?: boolean` exists — set `false` (§6) so tool-call ordering stays simple to reason about and cache.

The SDK's README also documents a newer `responses.create` API as its new "primary" surface. **Not used here** — tech-spec.md's capability contract is specifically `/chat/completions` with `max_completion_tokens`, and that contract overrides general SDK guidance for this project.

## 2. The five capabilities

Per agent-builder's "start with 3–5, add only when the agent consistently fails without one":

| Tool | Backs | Executes |
| --- | --- | --- |
| `search_cards` | mcp-design.md §5.2 | `lib/catalog/search.ts` |
| `get_card` | mcp-design.md §5.3 | `lib/catalog/card.ts` |
| `get_set` | mcp-design.md §5.4 | `lib/catalog/set.ts` |
| `get_price_snapshot` | mcp-design.md §5.6 | `lib/catalog/price.ts` |
| `retrieve_rules` | rag-design.md §5 | `lib/rules/retrieve.ts` |

Executed **in-process** — the tool's `function.name`/`parameters` match the MCP tool schemas 1:1 (same Zod source in `lib/schemas.ts`), but the handler calls the `lib/catalog`/`lib/rules` functions directly, not over HTTP to the app's own `/mcp` route. This is architecture-design.md §3's decision restated concretely: one schema, two execution paths (HTTP for external MCP clients, direct import for this agent), no self-referential network hop burning the ≤20s latency budget.

A sixth, structurally different tool closes every turn:

| Tool | Purpose |
| --- | --- |
| `respond` | Terminal tool — its `parameters` schema **is** `AgentAnswer` (§4). Calling it ends the loop. |

## 3. Knowledge (loaded on demand, not upfront)

Per agent-builder's "make knowledge available, not mandatory": the system prompt does **not** inline the generic RAG corpus or catalog data. It states the agent's role, constraints, and tool list; actual trade-practice knowledge and card facts arrive only when the model calls `retrieve_rules` / `get_card` / etc. This keeps the prompt small and keeps every fact in context traceable to a specific tool call the model chose to make — which is also what makes AGENT-03's fact/assessment/prediction split honest rather than pre-baked.

## 4. The `AgentAnswer` schema — enforced structurally, not by prompt wording

```ts
// lib/agent/schema.ts
import { z } from 'zod';
import { Signal } from '@/lib/schemas';

export const AgentAnswer = z.object({
  facts: z.array(z.object({
    statement: z.string(),
    source: z.enum(['catalog', 'rag']),
    citation: z.string(), // cardId, or rag chunk's `source (date)`
  })),
  assessment: z.string(),           // fairness / value judgement — explicitly non-authoritative (DQ-03)
  predictions: z.array(z.string()).optional(), // explicitly labeled, never phrased as guaranteed
  tradeFairness: z.object({ value: Signal, label: z.string(), description: z.string() }).optional(), // Trade Analysis only
  confidence: z.number().min(0).max(1),
  lastUpdated: z.string().datetime(),
});
```

AGENT-03 requires facts, assessment, and predictions to be **structurally separated**, and DQ-03 requires the assessment to never read as an official valuation. Relying on prompt instructions alone ("please separate these...") is exactly the kind of thing that degrades under paraphrase or a model upgrade. Forcing the model to call `respond(...)` with this schema as the tool's `parameters` — and setting `tool_choice: { type: 'function', function: { name: 'respond' } }` once the loop decides to terminate (§6) — makes the separation a parse-time guarantee: if the model doesn't produce valid `AgentAnswer` JSON, the SDK/Zod validation fails loudly rather than shipping a blended paragraph to the UI.

## 5. Prompt files

```
prompts/trade-analysis.system.md
prompts/set-overview.system.md
```

Version-controlled, per AGENT-04/AGENT-05's explicit requirement. Loaded by `lib/agent/prompts.ts` at request time (cheap file read, or cached in-memory after first read — no reason to hit disk every request for content that only changes on deploy).

Both share the same non-negotiable constraints (kept as a common fragment `prompts/_shared-constraints.md`, concatenated in at load time — avoids copy-pasted drift between the two prompts):

- Never state a market estimate as a guaranteed sale price.
- Call `retrieve_rules` before making a claim that trade-practice knowledge would inform (grading impact, reprint awareness, etc.) — don't answer from parametric memory when a tool exists for it.
- If a tool call comes back with a data-quality flag or low confidence, say so explicitly rather than presenting the number as solid.
- End every turn by calling `respond`.

`trade-analysis.system.md` additionally: the trade draft (offered/requested cards, quantities) is provided in the first user-turn context block as JSON; explain the fairness signal on request per PRICE-02's thresholds.

`set-overview.system.md` additionally: the selected set's code/name is in context; ground set-specific commentary in `retrieve_rules({ setCode })` and say plainly when no set-specific notes exist yet (rag-design.md §3.2) rather than inventing set trivia.

## 6. The loop

```ts
// lib/agent/run.ts
async function* runAgentTurn(params: {
  systemPrompt: string;
  history: ChatCompletionMessageParam[]; // prior turns, client-scoped (§8)
  userMessage: string;
  toolExecutors: Record<string, (args: unknown) => Promise<unknown>>;
}): AsyncGenerator<AgentStreamEvent> {
  const turnCache = new Map<string, unknown>(); // §7
  const messages = [...params.history, { role: 'user', content: params.userMessage }];
  const MAX_ROUNDS = 6;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const forceRespond = round === MAX_ROUNDS - 1;
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL, // gpt-5.4, tech-spec.md
      max_completion_tokens: 1200,
      parallel_tool_calls: false,
      messages,
      tools: TOOL_DEFINITIONS, // includes `respond`
      tool_choice: forceRespond ? { type: 'function', function: { name: 'respond' } } : 'auto',
      stream: true,
    });

    const { content, toolCalls } = await accumulateStream(stream, (chunk) => {
      if (chunk.delta.content) yield_({ type: 'text-delta', text: chunk.delta.content }); // streamed to client, §9
    });

    if (!toolCalls.length) { messages.push({ role: 'assistant', content }); continue; } // shouldn't happen with tool_choice, but don't trust it blindly

    messages.push({ role: 'assistant', content, tool_calls: toolCalls });

    for (const call of toolCalls) {
      if (call.function.name === 'respond') {
        const answer = AgentAnswer.parse(JSON.parse(call.function.arguments)); // throws -> caught by caller, surfaced as a structured error, not a crash
        yield { type: 'final', answer };
        return;
      }
      const result = await executeToolCached(call, params.toolExecutors, turnCache); // §7
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
}
```

`MAX_ROUNDS = 6` with a forced `respond` on the last round is the guardrail against a runaway tool-calling loop — a real failure mode for tool-calling agents, and cheap insurance against an unbounded cost/latency tail on a ≤20s budget.

## 7. Context is precious (agent-builder's principle, applied concretely)

- **Turn-scoped tool cache** (PERF-04/PERF-05): `executeToolCached` hashes `(toolName, args)` and reuses the result within the same `runAgentTurn` call if the model calls the same tool with the same arguments twice in one turn — a real pattern with tool-calling models re-deriving something they already fetched two rounds ago.
- **Truncate before appending**: `list_set_cards` can return up to 100 cards; the tool executor summarizes before it goes back into `messages` (counts by rarity/price-coverage, not all 100 card objects) unless the model's arguments explicitly ask for the raw list. Full card dumps into a chat context is exactly the kind of context bloat agent-builder warns against, and it's not what a "how many am I missing" question needs anyway.
- **Isolate, don't accumulate across screens**: Trade Analysis and Set Overview each start a fresh `history` scoped to their own draft/set (architecture-design.md §4.4) — switching from analyzing one trade to browsing a different set doesn't drag the first conversation's tool results along.

## 8. Conversation state

Per-conversation `history` lives **server-side, in-memory, keyed by a session-scoped conversation id** (not persisted to `data/` — trade drafts themselves are persisted by the WebApp per SRCH/SCRATCH stories, but the chat transcript is not a product requirement to retain past the browser session). A `Map<conversationId, ChatCompletionMessageParam[]>` in `lib/agent/sessions.ts`, evicted on an idle timeout (e.g. 30 minutes) — single-instance-appropriate for MVP-2, with the same "shared store if horizontally scaled" caveat already flagged for the MCP rate limiter (architecture-design.md §8).

## 9. Streaming to the client

The Route Handler (app-design.md §5) wraps `runAgentTurn`'s async generator in a `ReadableStream`, emitting Server-Sent Events:

- `{"type":"text-delta", "text": "..."}` — assistant prose as it's generated, for the rare case the model narrates before calling `respond` (most turns will go straight to tool calls with little/no interstitial text).
- `{"type":"status", "message": "Checking current prices…"}` — emitted when a tool call starts, so the client can show a concrete per-tool-call progress tick instead of a generic spinner, feeding PERF-02's "more time is needed" pattern with something more specific.
- `{"type":"final", "answer": AgentAnswer}` — terminal event; the client renders facts/assessment/predictions/signal in their own visually distinguished regions per ui-guideline.md's chip/section patterns.
- `{"type":"error", "reason": "..."}` — any unrecoverable failure (schema validation failure on `respond`'s arguments, OpenAI API error) — never a raw stack trace to the client, matching mcp-server-patterns' "structured, model-safe" error posture applied to this boundary too.

## 10. Error handling

- A tool executor throwing (e.g. `lib/catalog` returns its typed `{ ok: false, ... }` — see mcp-design.md §5.1) is **not** an exception; it's serialized straight into the `tool` message as-is, so the model can react ("price data unavailable, noting the gap in my answer") rather than the loop crashing.
- An actual OpenAI API error (rate limit, timeout, 5xx) aborts the turn and yields `{"type":"error"}` — no silent retry loop inside the request; a single explicit retry may be added at the Route Handler level if empirically needed, not assumed upfront.
- `AgentAnswer.parse()` failing on the model's `respond` arguments (malformed JSON, schema violation) is treated the same as an API error — surfaced, not silently patched or defaulted, since guessing at a broken structured answer is worse than telling the user the answer generation failed.

## 11. Testing (common-test-strategy applied)

- **Unit**: `executeToolCached`'s hashing/reuse logic; `AgentAnswer` schema parsing (valid and deliberately malformed fixtures); the round-limit/forced-`respond` guard.
- **Integration, stubbed model boundary**: the OpenAI client is the one thing worth stubbing here — it's a paid third party and its output isn't deterministic — but every tool executor underneath it runs for real against `lib/catalog`/`lib/rules` (fixture-backed per mcp-design.md/rag-design.md's own test layers), so the only mocked seam is the model call itself, not the business logic behind it. A scripted stub model response (`tool_calls: [get_price_snapshot, ...]` then `respond(...)`) verifies the loop executes real tools, accumulates real results, and produces a schema-valid `AgentAnswer` end to end.
- **Prompt regression**: a small fixture set of (system prompt + user message) pairs with an assertion only on structure (facts present, assessment present, no `predictions` phrased with "guaranteed"/"will sell for exactly") — not exact wording, since LLM output isn't byte-stable; assert the *contract*, not the *prose*.

## 12. Sequence — Trade Analysis turn

```mermaid
sequenceDiagram
  participant UI as Trade Analysis chat (WebApp)
  participant Route as app/api/agent/trade/route.ts
  participant Loop as lib/agent/run.ts
  participant Cat as lib/catalog
  participant Rules as lib/rules
  participant LLM as OpenAI (gpt-5.4)

  UI->>Route: POST { message, tradeDraftId }
  Route->>Loop: runAgentTurn(history, message, executors)
  Loop->>LLM: chat.completions.create (stream, tools)
  LLM-->>Loop: tool_calls: get_price_snapshot x2
  Loop->>Cat: getPriceSnapshot(cardA), getPriceSnapshot(cardB)
  Cat-->>Loop: PriceSnapshot x2
  Loop->>LLM: tool results appended, next round
  LLM-->>Loop: tool_calls: retrieve_rules
  Loop->>Rules: retrieveRules({ query })
  Rules-->>Loop: chunks (or empty, gracefully)
  Loop->>LLM: tool result appended, next round
  LLM-->>Loop: tool_calls: respond(AgentAnswer)
  Loop-->>Route: { type: 'final', answer }
  Route-->>UI: SSE stream (status ticks, then final)
```

## 13. Open questions

- Idle-timeout value for in-memory conversation state (§8) — 30 minutes is a placeholder, not user-tested.
- Whether a single explicit client-triggered retry (tech-spec.md's general retry policy) should live in the Route Handler or the loop itself — leaning Route Handler, since the loop's job is one clean turn.
- DashScope as an alternate model provider (tech-spec.md) would need its own `tools`/`tool_choice` compatibility check before this design could switch to it — OpenAI-compatible-mode doesn't guarantee identical tool-calling semantics.
