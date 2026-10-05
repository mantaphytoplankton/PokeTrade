---
title: Real TCGdex API response shapes (search, card detail, pricing, images)
type: research-note
status: active
as_of: 2026-07-29
tags:
  - tcgdex
  - catalog
  - mcp
related_spec: specs/mcp/mcp-design.md
related:
  - adr/ADR-002-card-details-routable-page-by-entry-id.md
---

# Real TCGdex API response shapes

## Summary
TCGdex (`api.tcgdex.net/v2/{lang}`) has no published TypeScript types. `lib/catalog/normalize.ts` was built and tested against live responses captured during MVP-1 implementation, not documentation — this note records the actual shapes so later work (SET-02's `list_set_cards`, the Trade Agent's tool calls) doesn't have to re-derive them from scratch.

## Evidence

**Search** (`GET /cards?name=X`) returns a bare array, each item minimal:
```json
{ "id": "base1-4", "localId": "4", "name": "Charizard", "image": "https://assets.tcgdex.net/en/base/base1/4" }
```
No `set`, no `rarity`, no language variants — a card can appear many times across sets/eras under the same name. `image` may be **absent** for some cards even when they exist (used as the real trigger for the "no photo yet" placeholder, not a hypothetical). Some cards have literal rarity value `"None"` from the full detail endpoint (e.g. promotional cards) — this is real data, not a bug, and is displayed as-is rather than mapped to something else.

**Full card detail** (`GET /cards/{id}`) embeds `set: { id, name, cardCount: { official, total } }`, `rarity`, and `pricing`. Confirmed real shape (Charizard, base1-4):
```json
{
  "pricing": {
    "cardmarket": { "updated": "...", "unit": "EUR", "avg": 446.7, "trend": 350.99, "avg1": 285, "avg7": 286.21, "avg30": 457.43 },
    "tcgplayer": { "unit": "USD", "updated": "...", "holofoil": { "productId": 42382, "lowPrice": 510, "midPrice": 919.49, "highPrice": 4590.63, "marketPrice": 800.43 } }
  }
}
```
Key facts that shaped normalization:
- **Cardmarket** gives real trailing averages (`avg1`/`avg7`/`avg30`) — this is the *only* provider that does, in this API.
- **TCGPlayer** gives point-in-time `lowPrice`/`midPrice`/`highPrice`/`marketPrice` **per printing variant** (`normal`, `holofoil`, `reverseHolofoil`, `1stEditionHolofoil`, ...), never trailing averages. A card can have several of these variant keys simultaneously.
- Either provider block can be `null` (not just absent) when no pricing exists for that card/provider.

**Image URLs**: the `image` field is a *base* URL with no extension — append `/low.{ext}` or `/high.{ext}` (`ext` ∈ `png`/`webp`/`jpg`, all confirmed 200). The base already includes the correct nested set-family path (e.g. `en/pl/pl4/1`, `en/gym/gym2/2`, `en/lc/lc/3`) — **do not** try to reconstruct this path from `setCode` + card number; always use the `image` field verbatim and just append the suffix. An earlier manual check that guessed the path structure (`en/gym2/2`) 404'd; the API's own returned base URL was correct all along.

## Lesson / guidance
- `lib/catalog/normalize.ts` collapses TCGPlayer's multiple variants to one representative price (priority: holofoil > reverseHolofoil > 1stEditionHolofoil > unlimitedHolofoil > normal) — a deliberate MVP-1 simplification (see specs/mcp/mcp-design.md §7), not full variant-level pricing. Revisit if a story ever needs per-variant price display.
- When adding `get_set`/`list_set_cards` (MVP-4, SET-02), expect the same minimal-search-result vs. rich-detail-endpoint split — set card listings will likely need the same "don't N+1 the detail endpoint" discipline already applied in search result rendering (full details are fetched only for the one card a user actually picks, not for every row).
- Search results search across **all sets/languages under the `/en` index**; a name like "Charizard" can return 15+ printings. UI copy and layout should assume long result lists are normal, not an edge case.

## Links
- specs/mcp/mcp-design.md §5–§7 (tool schemas, normalization, price signal algorithm)
- lib/catalog/normalize.ts, lib/catalog/normalize.test.ts (fixtures mirror the shapes above)
