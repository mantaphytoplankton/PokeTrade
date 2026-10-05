---
title: Design docs written before code drift from what actually got built — check before extending
type: ops-lesson
status: active
as_of: 2026-07-29
tags:
  - design-docs
  - process
  - app-design
related_spec: specs/app/app-design.md
related:
  - adr/ADR-004-new-feature-pipeline-single-gate.md
---

# Design docs drift from implementation — check before extending

## Summary
`specs/app/app-design.md` §9 originally described the Collection dashboard's price-loading pattern as a client-side island (`<PriceRefresh>`) using React Query to fan out price fetches after the page loads. When MVP-1 was actually implemented, that's not what got built — the simpler, better-fitting pattern turned out to be per-card async Server Components wrapped in `<Suspense>`, calling `getPriceSnapshot` directly server-side, with no client-side fetch orchestration at all. Nobody went back to update §9 after making that call during implementation, so the design doc silently described a pattern the running code didn't use. This was only caught because a later, unrelated feature (COLL-04, sorting) needed to add a paragraph to that exact section, and reading it first for context surfaced the mismatch.

## Evidence
- `app/(app)/dashboard/page.tsx` and `components/features/PriceChip.tsx` (the real code) use the Suspense-streamed async Server Component pattern.
- `specs/app/app-design.md` §9 (before correction) described a `<PriceRefresh>` client island with React Query — a plan from the design phase that implementation improved on but never reported back.
- The mismatch was invisible until someone had a reason to open that section again for something else — it doesn't surface on its own.

## Lesson / guidance
- **Before adding to an existing design-doc section, read it as a claim about the current code, not just as background — and verify it against the actual implementation if you're about to build on top of it.** A design doc is a plan made *before* code exists; implementation routinely makes better real-time calls than the plan anticipated, and nothing automatically syncs the doc afterward.
- When a mismatch like this is found, fix it in place with a short explanation of what changed and why (see the corrected §9), rather than either (a) silently leaving it, which would compound the drift for the next reader, or (b) deleting the history of what was originally planned, which loses the reasoning trail.
- This is a general risk for every `*-design.md` in this project (`rag-design.md`, `mcp-design.md`, `agent-design.md` included) — none of them have been checked against real code yet since only the WebApp has been implemented so far (MVP-1). Expect to find similar drift in the others once MVP-2+ implementation starts, and budget a quick doc-vs-code check as part of picking that work up, not as a surprise partway through.

## Links
- specs/app/app-design.md §9 (the corrected section)
- adr/ADR-004-new-feature-pipeline-single-gate.md (the `new-feature` skill step that surfaced this, by having a reason to reread the section)
