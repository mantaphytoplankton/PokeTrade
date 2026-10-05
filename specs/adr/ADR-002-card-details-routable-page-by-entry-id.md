# ADR-002: Card Details is a real routable page keyed by collection entryId, not a modal or cardId

## Status
Accepted

## Context
brd.md describes Card Details as a "Pop-up or screen," and CARD-05 requires it to close via Close button, Escape, or outside click — language that reads as modal-shaped. specs/app/app-design.md §12 explicitly left this open: "Card Details as a true modal overlay ... vs the prototype's full-page-with-Escape-as-back adaptation ... needs a short spike before committing." Separately, a user can own the same catalog card (`cardId`) in more than one condition (e.g. two Charizards, one Near Mint and one Lightly Played) as two distinct `CollectionEntry` records — routing by `cardId` alone would be ambiguous about which owned copy is being viewed.

## Decision
Card Details is a real, directly navigable route: `/cards/[entryId]/page.tsx`, keyed by the collection entry's own generated `entryId` (not the catalog `cardId`). It is not a modal. "Close" is satisfied by: a visible "← Back to collection" link, and a client-side `Escape` handler (`EscapeToBack`) that navigates back to `/dashboard`. The literal "outside click" affordance from CARD-05 is not implemented, since a full page has no "outside" — this is a deliberate adaptation of the requirement's *intent* (an easy, low-friction way to leave the screen) to a page context, not a partial implementation of it.

## Rationale
- **Alternatives considered:** a modal overlay on top of the dashboard grid (matches CARD-05's literal wording most closely, and was the pattern used in the earlier static prototype at `specs/prototype/`) — rejected for the real app because it can't be deep-linked or shared as a URL, and BRD's "or screen" wording explicitly allows the page form.
- Keying by `entryId` instead of `cardId` resolves the two-conditions-of-the-same-card ambiguity for free — the route always points at exactly one owned copy.
- A hybrid (modal *and* a deep-linkable route to the same content) was considered and rejected as unnecessary duplication for MVP-1; revisit only if user feedback specifically wants the in-context modal feel back.

## Consequences
- Every "open this card" action in the UI (the Collection grid's `CardSlot`) is a real `<Link href="/cards/{entryId}">`, not a client-side state toggle — this is simpler to reason about and matches Next.js App Router idioms (Server Component page, no client-side modal state to manage across the grid).
- If a future story wants the modal-over-grid feel back (e.g. for a snappier "peek" interaction from the grid), it would need to be added as an enhancement layered on top of the existing route, not a replacement — the route must remain the source of truth since it's the shareable/bookmarkable form.

## Date
2026-07-29
