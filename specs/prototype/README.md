# PokeTrade — MVP-1 prototype

A working, multi-page prototype of MVP-1 ("Build & Browse a Collection", see [../stories.md](../stories.md)). Plain HTML/CSS/JS, no build step, no backend — pages are connected to each other through `localStorage`/`sessionStorage` so the flow is genuinely functional, not just a set of static mockups.

Implements the visual system from [../ui-guideline.md](../ui-guideline.md): the Energy Type color palette, the card-binder layout, the holo-corner signature on rare cards, and the accessibility rules (color-plus-icon signal chips, visible focus, `prefers-reduced-motion` support).

## Run it

Some browsers partition `localStorage` per `file://` URL, which breaks the cross-page connection (adding a card in Search won't show up in Collection). Serve the folder over HTTP instead:

```bash
npx serve specs/prototype
# or
python3 -m http.server --directory specs/prototype 8080
```

Then open `http://localhost:<port>/index.html`.

Opening the files directly (`file://`) still works for reviewing each page in isolation — you just won't see data persist between pages.

## Pages

| File | Demonstrates | Notes |
| --- | --- | --- |
| `index.html` | — | Menu linking to every page; not part of the product itself |
| `login.html` | ACCT-01, ACCT-02, ACCT-04 | Tabbed Log in / Register. Either form "signs in" (no real backend) and sets a session flag the other pages check |
| `dashboard.html` | COLL-01, COLL-02, COLL-03, COLL-04 | Filterable and sortable grid read from `localStorage`; empty-state and no-matches states are real, not just designed. Sort (Name A–Z / Z–A) composes with the set/rarity/language filters — it reorders whatever the current filter shows, never changes which cards appear |
| `search.html` | SRCH-01 – SRCH-07 | Search "Charizard" for a real printing-disambiguation case (Shadowless vs. Unlimited); search "Mew" to see a single-printing result skip that UI entirely; "Add" writes into the same `localStorage` collection the grid reads |
| `card-details.html` | CARD-01 – CARD-05 | Its own page (not just a modal), reached via `?id=`; Escape and the Back link both return to the collection; Remove actually removes the card and flashes a confirmation toast back on the grid |
| `wantlist.html`, `trade.html` | — | Stub pages so the nav rail is complete and honest about what's in scope. Want List is MVP-3, Trade is MVP-2 — building working versions here would misrepresent MVP-1 as bigger than it is |

## What's deliberately not real

- No backend, no real auth, no real TCGdex/MCP calls — `assets/app.js` seeds a small fixed data set standing in for what `poke-catalog-mcp` would return.
- Copy is placeholder text, written ready to become i18n keys (see `ui-guideline.md` §9) — not yet wired to a real i18n library.
- Photo upload is a visual stub (button present, no file handling) — SRCH-05/07's actual upload/validation logic belongs to real implementation.

## Relationship to the other MVP-1 artifact

An earlier single-file interactive artifact covered the same screens for quick visual review. This folder supersedes it for anything requiring real navigation, shareable URLs per screen, or cross-page state — the things a single self-contained file can't do.
