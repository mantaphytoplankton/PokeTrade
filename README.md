# PokeTrade

An AI-assisted Pokémon TCG collection and trade helper. It helps collectors track owned and wanted cards, compare market prices, and judge whether a trade is reasonable — combining an LLM agent, MCP catalog/price tools, and a RAG knowledge base. It does not execute trades, process payments, or replace official Pokémon Company rules, store policies, or marketplace terms.

See [specs/brd.md](specs/brd.md) for the full business requirements and [specs/stories.md](specs/stories.md) for the current build status of every feature (Product Backlog table, Status column).

## Status

MVP-1 ("Build & Browse a Collection" — register/log in, search the catalog, add a card, browse the grid, view details) is mostly built. Check [specs/stories.md](specs/stories.md) for the authoritative, code-verified Status per feature — some MVP-1 acceptance criteria are still partial (e.g. search only matches by card name today, not set code/number; Card Details has no literal "outside click to close"). MVP-2 (AI trade analysis), MVP-3 (photos, want list), and MVP-4 (set overview, alerts) are designed but not yet implemented.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Query · Zustand · Zod · local JSON under `data/` (no database) · OpenAI SDK (DashScope-compatible) · `@modelcontextprotocol/server` for the catalog MCP server · TCGdex as the catalog/price provider.

## Getting started

1. **Install dependencies**

   ```bash
   make install
   # or: npm install
   ```

2. **Set up environment variables.** Copy the keys below into `.env.local` (gitignored — never commit real values). See [specs/tech-spec.md](specs/tech-spec.md) for what each one is for.

   ```env
   # LLM
   OPENAI_API_KEY=
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_CHAT_MODEL=gpt-5.4
   OPENAI_IMAGE_MODEL=gpt-image-1.5
   # Maps
   GOOGLE_MAPS_API_KEY=
   # Places / email / finance
   TRIPADVISOR_API_KEY=
   TRIPADVISOR_BASE_URL=https://terra.tripadvisor.com/api
   RESEND_API_KEY=
   # MCP / optional
   PANDORIUM_MCP_URL=https://pandorium.app/mcp
   # Auth (session cookie signing — see specs/app/app-design.md §2)
   SESSION_SECRET=
   # poke-catalog-mcp (see specs/mcp/mcp-design.md) — MCP_API_KEY unset = open access
   MCP_API_KEY=
   MCP_ALLOWED_HOSTS=localhost:3000,127.0.0.1:3000
   # No key needed: Open-Meteo, TCGdex
   ```

   `SESSION_SECRET` can be any random string for local dev, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

3. **Verify third-party connectivity** (OpenAI, DashScope, TCGdex — no key needed for TCGdex):

   ```bash
   make smoke
   ```

4. **Run the dev server:**

   ```bash
   make dev        # foreground
   make up         # background; make down to stop
   ```

   Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` — register an account to get to the collection.

## Project structure

```
app/              Next.js App Router routes
  (auth)/         login, register, reset-password
  (app)/          dashboard, search, cards/[entryId], wantlist, trade — session-gated
  api/catalog/    search + card detail Route Handlers consumed by the client
  mcp/            poke-catalog-mcp — the MCP server route
lib/              Business logic (no framework code): auth, catalog, persistence, schemas
components/
  ui/             Design-system primitives (Button, Chip, Modal, NavRail, ...)
  features/       Feature-specific components (CardSlot, SearchPanel, FilterBar, ...)
actions/          Server Actions (auth, collection mutations)
proxy.ts          Session gate + MCP rate limiting (Next 16's renamed middleware.ts)
data/             Local JSON persistence + cache — gitignored, created at runtime
specs/            All product and technical specs — see below
e2e/              Playwright end-to-end tests
```

## Specs & docs map

| Doc | What it's for |
| --- | --- |
| [specs/brd.md](specs/brd.md) | Business requirements — what the product does |
| [specs/tech-spec.md](specs/tech-spec.md) | Shared stack, third-party capabilities, environment variables |
| [specs/architecture-design.md](specs/architecture-design.md) | System architecture — how WebApp/MCP/Agent/RAG fit together |
| [specs/ui-guideline.md](specs/ui-guideline.md) | Design system — tokens, layout, accessibility, copy voice |
| [specs/stories.md](specs/stories.md) | Product backlog, MVP batches, acceptance criteria, **build status** |
| [specs/app/app-design.md](specs/app/app-design.md), [specs/mcp/mcp-design.md](specs/mcp/mcp-design.md), [specs/rag/rag-design.md](specs/rag/rag-design.md), [specs/agent/agent-design.md](specs/agent/agent-design.md) | Detailed technical design per component |
| [specs/prototype/](specs/prototype/) | Static HTML prototype of the UI — run it standalone, see its own README |
| [specs/adr/](specs/adr/) | Architecture decision records |
| [specs/knowledge/](specs/knowledge/) | Reusable research/ops/domain notes |
| [specs/workflows/new-requirement.md](specs/workflows/new-requirement.md) | The process for adding a new requirement (also encoded as the `/new-feature` project skill) |

## Testing

```bash
make test        # unit/integration (Vitest)
npm run test:e2e # end-to-end (Playwright) — hits live TCGdex, no key needed
make lint
make typecheck
```

See [specs/tech-spec.md](specs/tech-spec.md) and the global `common-test-strategy` rule for the project's testing bar.

## Adding a new feature

Use the `/new-feature` skill rather than editing specs ad hoc — it runs the BRD → stories → prototype (human checkpoint) → design → implementation pipeline described in [specs/workflows/new-requirement.md](specs/workflows/new-requirement.md), and keeps `specs/stories.md` consistent with what's actually in the backlog.
