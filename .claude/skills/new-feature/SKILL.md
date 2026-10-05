---
name: new-feature
description: Runs PokeTrade's spec-driven workflow for adding a brand-new requirement to the product — BRD entry, user stories with acceptance criteria, a static prototype with a mandatory human feedback checkpoint, technical design updates, then implementation. Use this whenever the user asks to add a new feature or requirement to PokeTrade, wants to extend brd.md, says something like "new feature", "new requirement", "let's add X to the app", or describes a capability PokeTrade doesn't have yet — even if they don't name this skill directly. Do not use for bug fixes, refactors, or work on a story that already exists in stories.md — this skill is specifically for introducing something new to the spec chain.
---

# New Feature — PokeTrade's spec-driven feature pipeline

PokeTrade builds every feature through one spec chain, in order: `brd.md` (what) → `stories.md` (acceptance criteria) → `specs/prototype/` (a look-and-feel and interaction check with a real person before code) → the four `*-design.md` docs (how) → code. This skill runs that chain for one new requirement at a time, in that order, because each stage answers a question the next stage needs settled first — you can't write acceptance criteria for a feature whose scope isn't agreed, and you can't design the technical implementation of a UI no one has confirmed looks and feels right yet.

**Source of truth for the steps below:** `specs/workflows/new-requirement.md`. If that file changes, re-read it — this SKILL.md is a faithful expansion of it, not an independent process. If the two ever disagree, the workflow file wins; update this SKILL.md to match rather than silently diverging.

## The one hard rule: stop at the prototype checkpoint

Everything through Step 3 is safe to run without asking permission along the way — it's editing specs and building a static HTML mockup, all reversible. **Step 3 ends with a mandatory stop.** Do not touch `specs/rag/rag-design.md`, `specs/app/app-design.md`, `specs/agent/agent-design.md`, `specs/mcp/mcp-design.md`, or any actual application code until the person using this skill has looked at the prototype and said it's good. This isn't caution for its own sake — the whole point of building the prototype before the technical design is to catch "wait, that's not what I meant" while it's still just HTML, before it's baked into an architecture decision or real code.

## Step 1 — Add the requirement to the BRD

1. Ask the user to name the new requirement in one line (what it lets a collector do, not how it's built). Use a question, not an assumption — the name is what you'll search `brd.md` for next, so a vague name here causes a vague search.
2. Read `specs/brd.md` and check whether this requirement (or something close enough to it) already exists there.
   - **If it already exists:** don't assume it's unimplemented. Cross-check `specs/stories.md`'s Product Backlog table for matching feature rows and their Status column, and skim the relevant code paths if the status is ambiguous. Tell the user what you found — "this looks like it's already SRCH-04, and stories.md marks it Done" or "it's in the BRD but stories.md still shows it ToDo" — and ask whether they want to proceed as a new requirement anyway (maybe they want to change it, not just add it), treat it as a fix to the existing one, or drop it. Don't silently create a duplicate feature.
   - **If it's genuinely new:** add it to `specs/brd.md` under the module it best fits (or a new module heading if none fits), matching the terse bullet style already used there — look at a neighboring module's entries for the level of detail expected, don't over- or under-specify relative to them.

## Step 2 — Turn it into stories with acceptance criteria

Invoke the **atdd** skill to write Given-When-Then (or rule-oriented, per atdd's own guidance) acceptance criteria for the new requirement.

Add the result to `specs/stories.md` following the conventions already established there — don't invent a new format:
- One row per component that implements a piece of the feature (App / MCP / Agent / RAG), same as the existing rows, splitting a feature across rows when it genuinely spans components (see stories.md's own header note on this).
- Feature Code = module abbreviation + next available number in that module (check the existing codes in the Feature Code Legend before inventing one, so you don't collide with or duplicate an existing prefix).
- MVP Batch: `TBD` by default, matching the convention already used for unbatched rows — assigning it to a specific MVP is a product-sequencing call for the user to make later, not something to guess here.
- Status: `ToDo`.
- Append the full Given-When-Then story detail in the same "Stories & Acceptance Criteria" section, grouped under the right module heading (create a new module heading if this is the first feature in a module that doesn't have one yet).

If the new requirement changes the meaning or scope of an *existing* story (not just adds a new one), update that story's acceptance criteria too, and say so explicitly to the user — silently leaving a contradicted AC in place is worse than not touching it.

## Step 3 — Build a prototype and stop for feedback

Invoke the **frontend-design** skill to build a static HTML/CSS/JS prototype of the new feature's screens, added into `specs/prototype/` alongside the existing pages.

Match what's already there rather than starting a fresh visual language:
- Reuse `specs/prototype/assets/tokens.css` and `components.css` — the color/type/spacing system and component classes (card slots, chips, modals, nav rail, buttons) already exist; a new feature should look like it belongs to the same product, not like a different design pass.
- Reuse `specs/prototype/assets/app.js`'s patterns (the shared data/localStorage helpers, the shell-rendering function) rather than duplicating that plumbing per page.
- Read `specs/ui-guideline.md` if you need the reasoning behind a token or pattern, not just its value.
- Update `specs/prototype/index.html`'s page list and `specs/prototype/README.md` to include the new page(s), so the prototype folder stays an accurate map of itself.

Once the prototype is up, **stop.** Tell the user concretely what to look at (which file(s), what to click through) and ask for feedback. This is the one step in the whole pipeline that a person, not a process, is best placed to judge — does it feel right, not just "does it meet the acceptance criteria." Revise the prototype (and, if the feedback reveals the AC or BRD entry was wrong, go back and fix those too — don't let the spec and the prototype drift apart) and ask again. Repeat until they confirm. Do not proceed to Step 4 on your own judgment that it's "probably fine."

## Step 4 — Technical design

Once the prototype is confirmed, update the technical design docs for whichever components the feature touches — not all four reflexively if the feature only touches one or two:

| Component touched | Design doc | Skill to invoke |
| --- | --- | --- |
| WebApp (pages, Server Actions, routes) | `specs/app/app-design.md` | **Fullstack** |
| Catalog/price MCP tools | `specs/mcp/mcp-design.md` | **mcp-server-patterns** |
| Knowledge retrieval | `specs/rag/rag-design.md` | **rag-implementation** |
| Trade/chat agent behavior | `specs/agent/agent-design.md` | **agent-builder** |

Follow the existing design docs' own structure and depth (concrete schemas, file layout, algorithms, sequence diagrams, open questions) rather than a lighter pass — these are the documents implementation will actually be built from. Where the new feature changes a decision an existing ADR or design doc already made, note the conflict to the user rather than quietly overwriting settled reasoning.

## Step 5 — Implementation

Implement the feature using the same skills as Step 4 (**Fullstack**, **mcp-server-patterns**, **rag-implementation**, **agent-builder**, as relevant to what the feature touches), against the design docs just written.

This project's standing rules already govern how implementation work should go — `common-test-strategy`/`tdd` for test coverage, `incremental-delivery` for keeping scope to this one requirement, and `dod` for the completion checklist (tests passing, lint/typecheck clean, and pausing to ask "do you confirm this feature is usable?" before calling it done). This skill doesn't repeat those rules; it just hands off to them once the spec chain above is settled. Run the `retrospective` skill at the end if anything ADR- or knowledge-worthy came out of building this feature, same as any other completed piece of work.

## When something doesn't fit this shape

Not every request is a clean new requirement. If the user's ask is actually a bug fix, a refactor, or a change to a story still in progress, this skill is the wrong tool — say so and suggest working on it directly instead of forcing it through five spec-writing steps it doesn't need.
