# ADR-003: Server Actions + useActionState for MVP-1 forms, not React Hook Form

## Status
Accepted

## Context
specs/app/app-design.md §6 specified React Hook Form + Zod for "all forms," matching tech-spec.md's listed stack (`react-hook-form`, `@hookform/resolvers`, `zod`). During implementation of the Register, Login, Reset Password, and Add-to-Collection forms, wiring RHF's `handleSubmit` to invoke a Server Action (which requires either a manual `FormData` reconstruction or a client-side fetch-like call, since RHF's default flow assumes a JS-driven submit handler) added a layer of glue code on top of what Next.js's own `useActionState` + a native `<form action={serverAction}>` already provides directly, with equivalent type safety (the Server Action still validates with the same Zod schemas from `lib/schemas.ts`) and better default behavior (progressive enhancement, built-in pending state, no extra client JS for form serialization).

## Decision
MVP-1's forms (Register, Login, Reset Password request/complete, Add-to-Collection's condition/quantity fields) use plain HTML forms bound directly to Server Actions via React's `useActionState`, with Zod validation inside the Server Action returning `{ error?, fieldErrors? }`. `react-hook-form` and `@hookform/resolvers` were not installed for MVP-1 — no form in this batch needed them.

## Rationale
- **Alternatives considered:** RHF wrapping a Server Action call in `onSubmit` (adds a client component + manual `startTransition`/result-handling for every form, without a matching UX or type-safety benefit for these particular forms — all of which are simple, single-step, non-multi-field-array forms); RHF with its own client-side submit to a Route Handler instead of a Server Action (rejected — loses the CSRF-safe, same-origin-enforced behavior Server Actions get for free, called out in app-design.md §10's security checklist).
- `useActionState` + Server Actions is the more idiomatic Next.js 15+/React 19 pattern for exactly this shape of form (single POST, server-validated, redirect-or-error), and is what Next.js's own docs demonstrate for this case.
- This is a **deviation from a written design doc** (app-design.md §6), which is why it's recorded here rather than silently diverging — the design doc's RHF recommendation likely still holds for a more complex, client-heavy form (e.g. a future multi-card Trade Scratchpad builder in MVP-2), so this ADR scopes the deviation to MVP-1's simple forms rather than overturning the design doc wholesale.

## Consequences
- `react-hook-form` / `@hookform/resolvers` remain unused dependencies in `package.json` after this story — either remove them if no MVP-2+ form ends up needing client-side field arrays/complex validation UX, or keep them for the Trade Scratchpad work where they're more likely to earn their keep. Decide at that point, not now.
- Any future simple form (single-step, server-validated) should default to this Server Action + `useActionState` pattern for consistency, rather than alternating patterns per form without reason.

## Date
2026-07-29
