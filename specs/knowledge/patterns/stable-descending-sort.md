---
title: "Stable descending sort needs a swapped comparator, not sort-then-reverse"
type: domain-note
status: active
as_of: 2026-07-29
tags:
  - sorting
  - javascript
  - correctness
related_spec: specs/stories.md
---

# Stable descending sort needs a swapped comparator, not sort-then-reverse

## Summary
COLL-04 (sort the Collection grid by name, A–Z / Z–A) required same-named entries to keep their existing relative order regardless of sort direction — two owned copies of the same card shouldn't visibly swap places just because the sort direction changed. The naive way to get a descending sort in JS — sort ascending, then call `.reverse()` — breaks exactly this requirement: reversing an already-sorted array also reverses the order of any tied (equal-key) elements, which is the one thing that was supposed to stay stable.

## Evidence
- `Array.prototype.sort` is specified as stable in modern JS engines (guaranteed since ES2019) — equal-key elements keep their relative input order after sorting ascending.
- `[...ascendingSorted].reverse()` does **not** preserve that property for ties, because reversing the whole array reverses every pair's order, tied or not.
- The fix used in both the prototype (`specs/prototype/dashboard.html`) and the real implementation (`lib/collection/sortByName.ts`) is to sort **once**, with a comparator that swaps its arguments for descending (`(a, b) => collator.compare(b.name, a.name)`) rather than sorting ascending and reversing. This lets the sort's own stability guarantee do the work in both directions.
- Verified directly: `lib/collection/sortByName.test.ts`'s "keeps the relative order of same-named entries stable in both directions" test constructs two same-named entries with distinguishing IDs and asserts their relative order is identical under both `asc` and `desc`.

## Lesson / guidance
- Whenever a descending sort is needed anywhere else in this codebase (Set Overview card lists, a future Trade history view, etc.) and tie-stability matters even slightly, reach for the swapped-comparator form, not `.sort().reverse()`. It's the same amount of code either way — this isn't a performance trade-off, just a correctness one that's easy to get wrong because both forms look equally reasonable and only differ on inputs with duplicate keys, which are easy to not think to test.
- `Intl.Collator` (used here with `sensitivity: 'base'` for case/accent-insensitive comparison) composes cleanly with this pattern — `collator.compare(a, b)` and `collator.compare(b, a)` are the two directions, same as a plain numeric/string comparator would be.

## Links
- lib/collection/sortByName.ts, lib/collection/sortByName.test.ts
- specs/prototype/dashboard.html (the prototype's `compareNames`/sort wiring, same pattern)
