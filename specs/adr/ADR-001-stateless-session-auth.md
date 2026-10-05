# ADR-001: Stateless HMAC-signed session and reset tokens (no auth library, no session store)

## Status
Accepted

## Context
architecture-design.md §9.3 flagged the WebApp's session/auth mechanism as an open decision blocking the Account Management story (ACCT-01/02/03/04). tech-spec.md mandates no database (local JSON under `data/` only) and a minimum-dependencies policy ("prefer platform, stdlib, and existing stack before adding packages"). A session mechanism was needed before Register/Login/Reset password could be implemented for MVP-1.

## Decision
Sessions and password-reset links are both **stateless, HMAC-SHA256-signed tokens** built entirely from Node's built-in `crypto` module (`lib/auth/signedToken.ts`) — no `next-auth`, `iron-session`, or `jsonwebtoken` dependency, and no server-side session store (no `data/sessions/` directory). A session cookie carries `{ kind: "session", userId, issuedAt }`, base64url-encoded and HMAC-signed with a server-only `SESSION_SECRET` env var; verification recomputes the HMAC and does a `timingSafeEqual` comparison, then checks a max-age window. Password reset uses the same primitive with `kind: "reset"` and a 1-hour window, sharing the same signing/verification code but never accepted as a session token (and vice versa) because `kind` is checked on every verify. Passwords are hashed with `crypto.scrypt` (also built-in) — no `bcrypt` dependency.

## Rationale
- **Alternatives considered:** `next-auth`/`Auth.js` (overkill — no OAuth providers, no multi-provider identity linking needed for MVP-1); `iron-session` (a good library, but it does exactly what ~80 lines of built-in `crypto` already does for this project's needs — the minimum-dependencies policy tips the balance); a JSON-file-backed session store (rejected — adds a `data/sessions/` write on every login for a benefit, server-side revocation, that no MVP-1 story requires).
- One signing primitive covers both sessions and reset links, avoiding two separate token schemes.
- `server-only` guards `lib/auth/*` so a secret-holding module can't be accidentally bundled into a Client Component (verified empirically to work through Next.js 16's `proxy.ts` bundling too — see `specs/knowledge/nextjs/server-only-in-proxy.md`).

## Consequences
- **Accepted limitation:** no server-side "kill this session now" — a leaked session cookie is valid until it expires (14 days) or `SESSION_SECRET` is rotated (which invalidates *every* session, a blunt instrument). This is acceptable for MVP-1's threat model (no payment data, no PII beyond email/optional photo) but should be revisited if the product ever needs per-session revocation (e.g. "log out all other devices").
- Session state is entirely client-side (in the cookie); the server does zero session lookups, which also means zero session-related I/O on every authenticated request — a performance/simplicity win that came along with the minimal-deps choice, not just a side effect to tolerate.
- Follow-up: `SESSION_SECRET` must be a real secret in any non-local environment (currently a locally-generated dev value in `.env.local`); no rotation tooling exists yet.

## Date
2026-07-29
