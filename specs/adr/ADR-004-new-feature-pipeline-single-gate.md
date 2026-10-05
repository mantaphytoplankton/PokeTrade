# ADR-004: Spec-driven `new-feature` pipeline as a project skill, with a single confirmation gate at the prototype stage

## Status
Accepted

## Context
`specs/workflows/new-requirement.md` defines PokeTrade's intended process for adding any new requirement: BRD entry → stories/acceptance criteria → static prototype → technical design docs → implementation. The file existed but needed expanding into something Claude could actually execute consistently across many future feature additions, rather than being manually re-read and manually followed (and manually reinterpreted, inconsistently) each time. This was built as a project-scoped skill (`.claude/skills/new-feature/`) and then run twice on a real, small requirement (COLL-04, "sort collection by name") — once as a deliberate dry run stopping at the prototype checkpoint, once continuing through to full implementation after explicit confirmation — to prove the shape works before it's trusted for larger features.

Several parts of the source workflow file were under-specified and needed a decision during implementation:
- How many times should the pipeline stop and wait for a human, given it chains BRD edits, story writing, prototyping, design-doc updates, and code changes?
- What does "check if already implemented" mean operationally — text presence in `brd.md`, or something more reliable?
- How does a new backlog row get numbered/positioned without churning the whole `stories.md` table on every addition?

## Decision
1. **Exactly one hard stop**: after the prototype is built (end of Step 3), before any technical design doc or real code is touched. Everything before that point (BRD, stories, prototype) is treated as safe-to-run-without-asking because it's all reversible spec/mockup editing; everything after is either expensive (real code) or binds an architecture decision, so it needs a human to have actually looked at the interaction/visual result first. No second gate was added before Step 5 (implementation) — DoD's existing "do you confirm this feature is usable?" check already covers that moment for every story regardless of this skill, so a second pipeline-specific gate there would be redundant process, not added safety.
2. **"Already implemented" is checked against `stories.md`'s Status column (and code, if that's still ambiguous), not just text presence in `brd.md`.** A requirement can be named in the BRD and still be `ToDo` — brd.md text alone can't answer "is this built."
3. **New backlog rows append at the end of the Product Backlog table** rather than renumbering to stay module-contiguous; a feature's Feature Code (e.g. `COLL-04`), not its table Index, is what groups it with its module. (This convention is also documented inline in `stories.md` itself at the point the first appended row was added.)

## Rationale
- **Alternatives considered for the gate count**: stopping after every step (rejected — five confirmations for one requirement is friction without a matching safety benefit, since Steps 1-2 produce nothing but reversible spec text); stopping only before implementation, not after the prototype (rejected — this is exactly backwards; the prototype is the one artifact a person can actually judge by feel, and letting the technical design get written against an unconfirmed interaction is the expensive mistake to avoid, not the code itself).
- **Alternatives considered for backlog numbering**: renumbering the whole table on every addition to keep module grouping visually contiguous (rejected — mechanically renumbering 50+ unrelated rows for one new feature doesn't scale and creates unnecessary diff noise every time; the code already gives correct grouping when sorted/filtered by Module).
- Running the skill twice on a real requirement (not a synthetic test) before considering it done follows this project's own testing bias toward real integrations over hypothetical dry runs — the re-invocation on an already-in-progress requirement was not scripted as a test case, it happened naturally, and confirmed a real property worth keeping: the skill's Step 1 existing-check protects against accidental duplicate work even when the "existing" thing is its own not-yet-finished prior run, not just an unrelated older feature.

## Consequences
- Every future feature added to PokeTrade should go through this skill rather than an ad hoc mix of edits, for consistency — but the skill explicitly declines requests that are actually bug fixes/refactors/in-progress-story changes rather than forcing them through five spec-writing steps they don't need.
- If a future feature turns out to need a second confirmation point (e.g., a change large or risky enough that "prototype looked fine" doesn't imply "implementation approach is fine too"), that's a reason to revisit this ADR, not to silently add an extra ad hoc pause inside one run.
- `specs/workflows/new-requirement.md` remains the source of truth the skill defers to; if that file changes, the skill (and this ADR's reasoning) should be re-checked against it rather than left to drift.

## Date
2026-07-29
