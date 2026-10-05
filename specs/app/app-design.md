# WebApp — Detailed Technical Design

Implements the WebApp component defined in [../architecture-design.md](../architecture-design.md) §4.1, styled per [../ui-guideline.md](../ui-guideline.md), scoped to MVP-1 per [../stories.md](../stories.md) with hooks for later MVPs noted where relevant. This document also **resolves the session/auth ADR** architecture-design.md §9.3 left open — that decision was blocking the User Account story; §2 below settles it.

## 1. Stack recap (from tech-spec.md, not repeated in full)

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, React Query, Zustand, React Hook Form + Zod, local JSON under `data/` (no database).

## 2. Auth decision (resolves architecture-design.md §9.3)

**Stateless, signed session cookie — no session store, no new dependency.**

Node's built-in `crypto` covers everything needed:

- **Password hashing**: `crypto.scrypt` (built-in, no `bcrypt` dependency) with a random 16-byte salt per user, stored alongside the derived key in the user's profile JSON: `{ salt: hex, hash: hex }`.
- **Session token**: a JSON payload `{ userId, issuedAt }`, HMAC-SHA256-signed with a server-only `SESSION_SECRET` env var, base64url-encoded as `payload.signature`. Verifying is `recompute HMAC, crypto.timingSafeEqual` — no session table to look up, so there's nothing to invalidate server-side (accepted trade-off, see below).
- **Cookie**: `HttpOnly; Secure; SameSite=Strict; Path=/`, containing the signed token, with a fixed expiry (e.g. 14 days) baked into `issuedAt` + max-age rather than a separate revocation check.

Why this over `iron-session`/`next-auth`/`NextAuth`: tech-spec.md's minimum-dependencies policy says "prefer platform, stdlib, and existing stack before adding packages" — a stateless HMAC cookie is exactly what those libraries do internally, and this product has no OAuth providers, no multi-provider identity linking, and no database to back a session table anyway (session revocation without a DB would need one more file-based lookup layer for a benefit — instant logout-everywhere — that no BRD story asks for). Password reset (ACCT-03) already requires a separate, single-use, short-lived signed token using the same HMAC primitive, so this is one mechanism covering both needs, not two.

**Accepted limitation**: a stolen/leaked session cookie remains valid until it expires; there's no server-side "kill this session now" beyond rotating `SESSION_SECRET` (which invalidates *every* session, a blunt instrument). Acceptable for MVP-1's threat model (no payment data, no PII beyond an email + optional photo); revisit if the product ever needs per-session revocation — that's the point at which a small `data/sessions/` JSON-backed denylist would earn its complexity, not before.

```
lib/auth/
  password.ts   — hashPassword(), verifyPassword() (scrypt)
  session.ts    — signSession(), verifySession(), COOKIE_NAME, cookie options
  resetToken.ts — signResetToken(), verifyResetToken() (short 1h expiry, single-purpose payload)
```

## 3. Persistence layer

Local JSON under `data/` (gitignored), per tech-spec.md. No query engine, so PokeTrade maintains its own minimal indexes by hand:

```
data/
  users/
    _index/email-to-id.json         — { [email]: userId } — manual lookup index (no DB to query by email)
    {userId}/
      profile.json                  — name, email, { salt, hash }, collectorLevel, avatarUrl
      collection.json               — CollectionEntry[]
      want-list.json                — WantListEntry[]
      trade-drafts/{draftId}.json
      uploads/{entryId}.{ext}        — user-uploaded card photos
  cache/                             — owned by lib/catalog and lib/rules, not the WebApp (see mcp-design.md §8, rag-design.md §3.2)
```

**Atomic writes** (`lib/persistence/atomicWrite.ts`): write to `{path}.tmp-{random}`, then `fs.rename()` over the target. `rename` is atomic on the same filesystem, so a crash mid-write never leaves a half-written `collection.json` a subsequent read could choke on. Every write in the app goes through this helper — no direct `fs.writeFile` to a `data/` path anywhere else in the codebase (worth a lint rule or code-review checklist item once implementation starts).

**Registration** must update two files together (the profile and the email index) — not a transaction (no DB), so the order matters: write `profile.json` first (source of truth), then update the index; if the process crashes between the two, the index is rebuildable by scanning `data/users/*/profile.json` (a small repair script, not needed day-to-day, worth having before this ships).

## 4. Route structure

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    reset-password/page.tsx
  (app)/                              — everything below requires a valid session (checked in a shared layout, §2)
    layout.tsx                        — nav rail + header shell (ui-guideline.md §4), session check
    dashboard/page.tsx                — Collection grid (COLL-01/02/03)
    search/page.tsx                   — Search & Add (SRCH-01…07)
    cards/[cardId]/page.tsx           — Card Details (CARD-01…05)
    wantlist/page.tsx                 — stub for MVP-1, real in MVP-3
    trade/page.tsx                    — stub for MVP-1, real in MVP-2
  api/
    agent/trade/route.ts              — streaming chat, MVP-2 (agent-design.md §9)
    agent/set/route.ts                — streaming chat, MVP-4
    uploads/[entryId]/route.ts        — serves user-uploaded photos (§7)
  mcp/route.ts                        — mcp-design.md §3
  proxy.ts                            — session gate on (app)/*, rate limiting on /mcp and /api/agent/* (Next 16's renamed middleware.ts)
actions/
  auth.ts        — 'use server': registerUser, loginUser, requestPasswordReset, completePasswordReset, logout
  collection.ts  — 'use server': addCard, removeCard, updateCondition/quantity
  wantlist.ts    — 'use server': addWant, removeWant (MVP-3)
  trade.ts       — 'use server': saveDraft, clearDraft (MVP-2)
```

This mirrors the file layout architecture-design.md §7 already proposed; the additions here are the concrete route/action split.

## 5. Server Actions vs. Route Handlers

**Server Actions** (`'use server'`, file-level directive per Next.js's documented convention) for every form mutation: register, login, add-to-collection, remove-from-collection, save/clear trade draft, want-list add/remove. These integrate directly with React Hook Form (`useActionState` / direct `action={...}` binding) without hand-rolling a REST endpoint per mutation, and get Next.js's built-in same-origin CSRF protection for free — satisfying common-test-strategy's "mutations use CSRF-safe patterns" without extra code.

**Route Handlers** reserved for what genuinely isn't a form submission:
- `/mcp` — must be a Route Handler; it's a protocol endpoint, not a page mutation (mcp-design.md §3).
- `/api/agent/trade`, `/api/agent/set` — streaming SSE responses, which Server Actions don't model well (a Server Action returns one value, not a stream).
- `/api/uploads/[entryId]` — serves binary file content with specific headers; simplest as a GET Route Handler.

Every Server Action **re-checks the session itself** (`await requireSession()` as the first line) rather than trusting that the UI only renders the button when logged in — common-test-strategy's "authorization enforced on server/BFF; UI hiding is not the control," applied literally.

## 6. State management wiring

| Concern | Tool | Why |
| --- | --- | --- |
| Server-cache reads (search results, price snapshots) | React Query | Handles loading/error/stale states and refetch-on-focus for data that changes outside the user's own actions |
| Trade scratchpad draft in progress | Zustand, persisted to `localStorage` | Local, ephemeral working state before an explicit "Save draft" commits to `data/` — matches SCRATCH-03's save/clear semantics; nothing here needs server round-trips until Save |
| All forms | React Hook Form + Zod | One shared validation schema source (`lib/schemas.ts`, extended per-form) between client-side validation and the Server Action's own re-validation — never trust client validation alone |

## 7. Photo upload (SRCH-05/06/07, CARD-02)

Server Action accepts a `FormData` with the file; validates **server-side** regardless of any client-side `accept`/size hint (client checks are UX only, never the control):

1. Type allowlist (`image/jpeg`, `image/png`, `image/webp`) checked by sniffing actual file bytes' magic number, not the browser-supplied MIME string (which is client-controlled and spoofable).
2. Size limit (e.g. 8MB) rejected before the file is fully buffered where possible.
3. Stored as `data/users/{userId}/uploads/{entryId}.{ext}` — `entryId` is the collection entry's own server-generated ID, never a client-supplied filename, closing the path-traversal class of bug entirely (no filename to sanitize because none is ever accepted as a path component).
4. Served via `app/api/uploads/[entryId]/route.ts`, which re-derives the path from the authenticated session's userId + the route's `entryId` param — never from a raw client path — mirroring the same "construct paths from known-safe pieces, not client input" pattern already used in the MCP catalog's cache lookups.
5. Replace/remove (SRCH-07) follow the same atomic-write discipline as §3.

## 8. Wiring the design system

- `ui-guideline.md`'s tokens (§3) become Tailwind v4 `@theme` custom properties in `app/globals.css` (Tailwind 4's CSS-first config, replacing the current placeholder `--background`/`--foreground` pair from the create-next-app scaffold) — same token names as the prototype's `tokens.css` (specs/prototype/assets/tokens.css) and the shipped-code version should not drift into different hex values without updating both.
- Fonts via `next/font/local`, pointed at the same three font files already vetted and downloaded for the prototype (`specs/prototype/assets/fonts/`) — copy into `public/fonts/` or `app/fonts/`, do not re-fetch from Google Fonts at request time (self-hosted, per the same CSP-safety reasoning as the artifact prototype's inlined fonts, and also better for the ≤20s/parallel-fetch performance contract — no third-party font-CDN round trip on the critical path).
- Component structure: `components/ui/` (Chip, CardSlot, NavRail, Modal, Stepper, Toast — direct translations of the prototype's CSS component classes into typed React components) and `components/features/` (CollectionGrid, SearchPanel, CardDetailsPanel, AuthForm) — the prototype (`specs/prototype/`) is the interaction reference to translate from, not a starting point to import code from (it's plain JS/localStorage; real components are typed React bound to Server Actions/React Query).

## 9. Data fetching pattern for the Collection dashboard (PERF-01/PERF-02)

**Corrected from the original design below** (as built): `dashboard/page.tsx` is an async Server Component that reads `data/users/{userId}/collection.json` directly and renders each card slot immediately; each slot wraps its price-dependent bits in `<Suspense>` around an async `<PriceChip cardId>` Server Component that calls `getPriceSnapshot` directly (`lib/catalog`). Next.js streams each chip in as its own fetch resolves — no client-side React Query fan-out was needed for this, since the per-card async Server Component + Suspense boundary already gives "render immediately, patch in as data arrives" for free, with one slow/failed card's `<Suspense>` boundary isolating it from the rest (DQ-04) without any client JS. The paragraph originally here described a `<PriceRefresh>` client island doing this via React Query — that was the plan before implementation; it was never built that way, and this doc drifted from the code. Filtering (COLL-01) reads `set`/`rarity`/`language` from the URL's search params (`components/features/FilterBar.tsx` pushes router updates on change); the 10s/20s soft-tip/target contract (PERF-02) still applies but is currently only a design intent for the Suspense fallback, not yet built as a timed "still checking…" caption — flagged as an open item in §12.

**Sort (COLL-04)** follows the exact same URL-driven pattern as the existing filters, not a new mechanism: a `sort` search param (`asc` | `desc` | absent) read by the same Server Component, alongside `set`/`rarity`/`language`. Order of operations in the page component: **read the full collection → apply filters → sort the filtered subset → render.** Sorting never changes which cards are shown, only their order, so it composes with any filter combination for free rather than needing its own interaction logic. Comparison uses `Intl.Collator` (or `String.localeCompare` with `{ sensitivity: 'base' }`) so case and accented characters sort the way a person alphabetizing by hand would (COLL-04's AC), not raw code-point order. This is pure server-side computation over data already in memory — no new fetch, no change to the Suspense/streaming price-chip design at all, since price data plays no part in ordering.

## 10. Security checklist mapping (common-test-strategy, applied to concrete decisions above)

| Item | How this design satisfies it |
| --- | --- |
| Authorization enforced server-side | Every Server Action re-checks the session (§5); `proxy.ts` gates `(app)/*` as a second layer, not the only one |
| No secrets in client code | `OPENAI_API_KEY`, `SESSION_SECRET`, `TCGDEX`-adjacent config only ever imported in Server Actions/Route Handlers/`lib/*` modules; mark provider-client modules with the `server-only` package import guard (one small, standard dependency worth adding specifically because it turns "accidentally imported a secret-holding module into a Client Component" from a silent bundling mistake into a build error) |
| Input/URL params validated | Every Server Action and Route Handler validates with the shared Zod schemas before touching `data/` or an upstream call |
| CSRF-safe mutations | Server Actions' built-in same-origin enforcement (§5) |
| No secrets in errors | Server Action/Route Handler error responses are user-facing plain messages (per ui-guideline.md §8's copy voice), never a raw thrown error's message or stack |

## 11. Testing (common-test-strategy applied)

- **Unit (critical path, 100%)**: `lib/auth/*` (hash/verify round-trip, session sign/verify including tamper and expiry rejection), `lib/persistence/atomicWrite.ts`, all Zod schemas.
- **Integration**: each Server Action against a temp `data/` directory fixture (real file I/O, isolated per test per common-test-strategy's "test DB or isolated data dir over silent no-op mocks for persistence") — register→login round trip, add-to-collection reflecting in a subsequent read, photo upload rejecting a bad file.
- **E2E (Playwright)**: the MVP-1 critical journey — register → search → add → browse grid → open details — directly adapting the flow already scripted and passing against `specs/prototype/` (proto-smoke.mjs), now driving the real app instead of the static prototype. This reuses validated assertions (auth guard redirect, filter narrowing, add-then-appears-in-grid, remove-then-flash-toast) rather than re-deriving them from scratch.
- **Accessibility regression**: keyboard focus order and `Escape`/outside-click on the Card Details modal-or-page (whichever the real implementation chooses — see Open Questions), per ui-guideline.md §5 and CARD-05.

## 12. Open questions

- Card Details as a true modal overlay (matching CARD-05's literal "outside click" requirement) vs. the prototype's full-page-with-Escape-as-back adaptation — architecture-design.md didn't settle this either; recommend the modal-over-grid pattern for the real implementation (closer to BRD's "pop-up or screen" and CARD-05's literal wording) while keeping `/cards/[cardId]` as a real, directly-navigable, shareable route via Next.js [parallel routes / intercepting routes](https://nextjs.org/docs) so both are true at once — needs a short spike before committing, flagged rather than guessed here.
- Exact session cookie max-age (14 days is a placeholder) and whether "remember me" should vary it.
- Repair-script for `email-to-id.json` (§3) — worth having before real registrations happen, not yet written.
- PERF-02's "still checking…" caption after 10s (§9) isn't built yet — the Suspense fallback is a static skeleton today, not a timed message. Low priority while price fetches are fast in practice, but worth doing before this is trusted as a real latency-contract implementation rather than a placeholder.
