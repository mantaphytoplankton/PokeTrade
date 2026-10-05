---
title: "`server-only` guard works through Next.js 16's proxy.ts bundling"
type: ops-lesson
status: active
as_of: 2026-07-29
tags:
  - nextjs
  - server-only
  - proxy
  - middleware
related_spec: specs/app/app-design.md
related:
  - adr/ADR-001-stateless-session-auth.md
---

# `server-only` guard works through Next.js 16's `proxy.ts` bundling

## Summary
Before wiring `proxy.ts` (Next 16's renamed `middleware.ts`) to gate authenticated routes, there was a real open question: `proxy.ts`/`lib/auth/session.ts` needed to import `lib/auth/signedToken.ts`, which has `import "server-only"` at the top. The `server-only` package's no-op behavior is normally gated on the `react-server` export condition, which is a React Server Components bundling concept — `proxy.ts`/middleware is a *different* compilation target (not part of the RSC module graph in the same sense), so it was genuinely unclear whether Next.js's proxy bundler sets that condition too, or whether it would hit `server-only`'s throwing branch at runtime.

## Evidence
- `npx next build` was run specifically to check this empirically rather than guessing from documentation (which doesn't cover this interaction explicitly). The build compiled cleanly, including the `ƒ Proxy (Middleware)` bundle, with no `server-only` throw.
- Confirmed further at actual runtime via the Playwright E2E suite: the unauthenticated-redirect test (`proxy.ts` running its session check via `lib/auth/session.ts` → `lib/auth/signedToken.ts`) passes, meaning the guarded import path executes without error on real requests, not just at build time.

## Lesson / guidance
- It's safe to import `server-only`-guarded modules from `proxy.ts` in this Next.js version (16.2.11) — no special-casing or module duplication needed to keep secret-holding auth code out of the proxy bundle.
- Don't assume this generalizes to all future Next.js versions without re-checking — this was verified empirically for a reason (the theoretical risk was real enough to check, not dismiss), and an upgrade is exactly the kind of change that could alter proxy bundling behavior. Re-run this same build+E2E check after any Next.js major/minor upgrade that touches proxy/middleware.
- If a future version *does* break this, the fix is straightforward: extract the pure HMAC verify logic into a sibling module without the `server-only` import (the guard is redundant for a file that's proxy-only by construction anyway — `server-only`'s value is catching an *accidental* Client Component import, which can't happen to a file `proxy.ts` alone imports).

## Links
- proxy.ts, lib/auth/session.ts, lib/auth/signedToken.ts
- e2e/mvp1.spec.ts — "unauthenticated users are redirected to login"
