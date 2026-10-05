# PokeTrade — UI/UX Guideline

Extends [brd.md](./brd.md) (product scope) and [architecture-design.md](./architecture-design.md) (system design). Governs visual identity, interaction, and copy for the WebApp. Covers MVP-1 (per [stories.md](./stories.md)) in full; later MVPs extend this system rather than introduce a new one.

## 1. Who this is for

Primary audience: Pokémon TCG collectors, including kids managing their own collection and parents helping them (per brd.md "Who it's for"). Casual adult traders and local-shop regulars use the same screens. The design has to work for an 8-year-old tapping through their binder **and** carry real price data precisely enough for the adult helping them decide on a trade. Resolution: keep the default surface simple and warm; put full precision (exact prices, sources, confidence) one tap away in Card Details and Trade Analysis, never hidden, never dumbed down — just not on the grid by default.

## 2. Why this direction, not the obvious one

Two choices were deliberately made against the obvious default, stated here so they aren't re-litigated later:

- **The palette is not the Pokémon Company's brand colors (blue/yellow).** Those are the trademarked logo, not a design system, and cloning them is both the generic choice and a trademark-adjacent risk — brd.md is explicit that PokeTrade "does not replace official Pokémon Company... rules." Instead, the palette is drawn from the TCG's own **Energy Type color wheel** — the actual material collectors already sort, trade, and value cards by. It's real subject vocabulary, not a logo reference.
- **The layout is not a generic dashboard with a top nav bar.** It's built around the **card-binder** metaphor: a physical trading-card album, tabbed dividers down the side, cards sitting in soft pocket slots. This is a real artifact from the collector's own world, and it gives the left-rail navigation a reason to exist beyond convention.

## 3. Design tokens

### 3.1 Color

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#241F3D` | Primary text, outlines, icon strokes — warm near-black, violet-leaning (not flat black; cartoon ink is never pure black) |
| `paper` | `#FFF8EC` | Page background — warm binder-page cream, not clinical white |
| `ember-500` | `#FF6B4A` | Primary accent (Fire-energy derived) — decorative use only: large icons, hover glows, the holo signature. **Never as text or a text-bearing fill** (fails contrast) |
| `ember-700` | `#C7401A` | Primary accent, interactive-safe — button fills, links-on-white, anywhere accent meets text-size content |
| `sky-500` | `#2F86D6` | Secondary accent (Water-energy derived) — decorative use only: borders, icon strokes, large non-text fills. **Never as text or a small/bold text-bearing fill** |
| `sky-700` | `#1F5C99` | Secondary accent, interactive-safe — selected nav tab background (with `paper` text), pressed-pill text on `sky-100` |
| `leaf-100` / `leaf-700` | `#DFF3E1` / `#1F7A3F` | Green signal (Grass-energy derived) — tint fill / text-icon pair |
| `spark-100` / `spark-700` | `#FFF1CE` / `#8A5B00` | Yellow signal (Lightning-energy derived) — tint fill / text-icon pair |
| `coral-100` / `coral-700` | `#FBDFDD` / `#B23327` | Red signal — tint fill / text-icon pair; distinct hue from `ember` so "warning" never reads as "primary action" |

**Rule:** every accent and signal color follows a **500/700 (or 100/700) pair** — the `500`/`100` value is for decoration only (large fills, icon strokes, borders); the `700` value is the one that ever sits under or over text. This is what keeps saturated, kid-friendly color AA-compliant across every hue without one-off exceptions. Verified contrast ratios (WCAG AA, small/bold text needs ≥4.5:1, large text ≥3:1): `ink` on `paper` 14.9:1 · `ink-soft` on `paper` 6.95:1 · `paper` on `ember-700` 4.76:1 · `paper` on `sky-700` 6.52:1 · `sky-700` on `sky-100` 5.99:1 · `leaf-700` on `leaf-100` 4.61:1 · `spark-700` on `spark-100` 5.23:1 · `coral-700` on `coral-100` 4.92:1. `ember-500` and `sky-500` measured below 3:1 for text and are restricted to non-text decoration for exactly that reason — don't reach for them under a label.

### 3.2 Typography

| Role | Face | Weight | Usage |
| --- | --- | --- | --- |
| Display | Baloo 2 | 700 | Wordmark, screen titles, big numbers (price, gap). Large sizes only — restraint is the point. |
| Body / UI | Nunito | 400 / 700 / 800 | Everything else: labels, buttons, nav, body copy, form fields. |
| Data | IBM Plex Mono | 500 / 600 | Prices, card numbers, quantities, timestamps. `font-variant-numeric: tabular-nums` so columns of numbers align. |

Type scale: `2rem` (display H1) / `1.5rem` (H2) / `1.125rem` (H3/lead) / `1rem` (body) / `0.875rem` (caption/meta) — stay on these five sizes; don't introduce one-off font sizes per component.

### 3.3 Shape, elevation, spacing

- Radius: `12px` on cards and inputs, `999px` (pill) on chips and the nav rail's tab buttons. Rounded is a deliberate response to "cartoon style," not a default — don't add more roundness than this scale.
- Outline: every card slot, button, and modal panel gets a **2.5px solid `ink` outline** (the "cartoon ink" line). This one device does triple duty: cartoon look, card-frame reference, and — at focus — the accessibility win (see §5).
- Elevation: one soft shadow token (`0 4px 0 0 rgba(36,31,61,0.15)`, a flat "sticker" drop, not a blurred realistic shadow) — consistent with the cartoon-outline language, never a generic blurred box-shadow.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px. Lay out sibling groups with flex/grid `gap`, not stacked margins.

### 3.4 Iconography

Simple, thick-stroke line icons (2.5px stroke, rounded joins, matching the ink-outline language) — not emoji as structural markers. Emoji are fine in conversational copy ("Hi, Ash 👋") but never stand in for a functional icon (a status chip needs a real check/alert/stop icon, not ✅/⚠️/🛑, which don't have a consistent visual weight against the rest of the UI and aren't reliably legible at small sizes).

## 4. Layout system

**Card-binder metaphor.** A left rail styled like a binder's tabbed dividers holds the four sections — Collection, Want List, Search, Trade — each a distinct tab with icon + label. On mobile it collapses to a bottom tab bar (thumb-reachable, ≥44px targets). The main canvas is the "page" of the binder: warm `paper` background, cards sitting in rounded pocket slots in a responsive grid.

```
Desktop                                   Mobile
┌───┬─────────────────────────────┐       ┌─────────────────────┐
│ 📘│ PokeTrade      Hi, Ash 👋 ⏻ │       │ PokeTrade   Ash 👋 ⏻│
│ 🔍│ ───────────────────────────  │       ├─────────────────────┤
│ ⭐│ Set▾  Rarity▾  Language▾    │       │ Set▾ Rarity▾ Lang▾  │
│ 🔁│ ┌───────┬───────┬───────┐   │       ├─────────────────────┤
│   │ │ card  │ card  │ card  │   │       │ ┌────────┬────────┐ │
│   │ │ slot  │ slot  │ slot  │   │       │ │  card  │  card  │ │
│   │ ├───────┼───────┼───────┤   │       │ ├────────┼────────┤ │
│   │ │  ...  │  ...  │  ...  │   │       │ │  ...   │  ...   │ │
└───┴─────────────────────────────┘       ├─────────────────────┤
                                           │ 📘  🔍  ⭐  🔁     │
                                           └─────────────────────┘
```

Numbered steps (01 / 02 / 03) are reserved for the **first-time onboarding sequence only** (search → pick a printing → add to collection), because that is a genuine ordered sequence a new user follows once. They do not appear as decoration on the dashboard, Card Details, or anywhere else — those aren't sequences.

## 5. Accessibility (non-negotiable, not a checklist added at the end)

- **Color is never the only signal.** Every price/fairness signal chip pairs its color with a text label, a description, and an icon — this is both an explicit BRD requirement (Price Status Classification, DQ-01) and this brief's "Accessibility" ask; one mechanism satisfies both.
- **Focus is the ink outline, thicker.** Keyboard focus uses the same 2.5px `ink` outline as the rest of the design language, at 3px with a 2px offset, plus a soft `spark-500` glow behind it for low-vision visibility. Focus states aren't a bolted-on browser default — they're the same visual grammar as everything else.
- **Contrast:** body text meets 4.5:1, large text/UI meets 3:1, verified per token pair in §3.1.
- **Tap targets:** minimum 44×44px — larger than a typical adult-only app, deliberately, for kids' motor skills as much as for touch accessibility generally.
- **Motion respects `prefers-reduced-motion`:** the holo-shimmer signature, hover-lift, and any transition collapse to an instant/static equivalent. No animation loops on page load or autoplays ambiently — sensory-friendly by default, not just spec-compliant.
- **Semantics:** nav rail uses `role="tablist"`/`role="tab"`, modals trap focus and close on Escape/outside-click/Close button (per CARD-05), live regions announce search result counts and empty states.

## 6. Signature element: the holo corner

Rare or notable cards (flagged by the catalog's rarity/foil data) get a small corner treatment: a soft conic-gradient "holo" swatch that shifts hue on hover/focus — a digital nod to tilting a real foil card in the light. It appears **only** on that one corner, **only** on cards that are actually rare, and collapses to a static soft-gradient badge under reduced motion. This is the one place the design spends its boldness; everything else stays quiet and disciplined around it.

## 7. Components (MVP-1)

- **Nav rail / tab bar** — 4 tabs (Collection, Want List, Search, Trade), icon + label, selected state = `sky-500` fill + `ink` outline.
- **Card slot** — thumbnail (user photo > catalog image > placeholder, per SRCH-06), name, set + number, condition + quantity, price signal chip, last-updated caption, holo corner if rare.
- **Signal chip** — icon + label + one-line description, 100/700 color pair, pill shape.
- **Search bar & results list** — text input, result cards showing enough to disambiguate printings (language/set/variant tags), "Add" action per result.
- **Add-to-collection panel** — condition picker, quantity stepper, optional photo upload (camera/file), confirm button labeled "Add to collection" (not "Submit").
- **Card Details panel** — full art, identity, price history summary, signal chip, "Analyze in a trade" link, Remove action (with confirm), closes via Close / Escape / outside-click.
- **Empty & error states** — written as invitations and plain fixes, never blame or apology (see §8).

## 8. Copy voice

Plain, warm, specific — sentence case, active voice, no hype, no filler. Match brd.md's collector-experience-level language: instead of clinical labels like "Beginner/Intermediate/Advanced," use **New Trainer / Collector / Pro**, since that's how this audience already talks about itself.

- Buttons name the action and its result stays consistent: "Add to collection" → confirmation says "Added to your collection."
- Empty states invite action: "Your binder's empty — search for your first card." not "No data."
- Errors state what happened and the fix, in the interface's voice: "We couldn't find that card. Try the exact name or a set code." not "Error: no results" or an apology.
- Data-quality language stays plain for the kid-facing surface and precise for the adult one: the grid says "Updated 2 hours ago"; Card Details additionally shows the full source and confidence value, per DQ-01/DQ-02.

## 9. Production notes (woodensword)

- All copy in this guideline and the prototype is placeholder text ready to become i18n keys — no component should hard-code English strings once this becomes real Next.js code.
- Keyboard focus, responsive breakpoints (mobile bottom-tab collapse), and the signal-chip pattern are the critical-path items `common-test-strategy`/`webapp-testing` should cover first.
- This guideline and the accompanying prototype are a **visual/interaction reference**, not production component code — real implementation follows the Next.js/Tailwind stack in tech-spec.md and wires these tokens into `app/globals.css` / Tailwind theme config as its own implementation story.
