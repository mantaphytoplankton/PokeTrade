---
title: "Playwright E2E gotcha: filling a form before client JS hydrates"
type: ops-lesson
status: active
as_of: 2026-07-29
tags:
  - playwright
  - e2e
  - nextjs
  - hydration
related_spec: specs/app/app-design.md
---

# Playwright E2E gotcha: filling a form before client JS hydrates

## Summary
An MVP-1 E2E test (`e2e/mvp1.spec.ts`) filled the Search input and clicked Submit immediately after navigating to `/search`, and the Search button stayed disabled forever (30s timeout). This looked like an app bug at first but was a test-side hydration race: Playwright's `.fill()` set the DOM value and dispatched a native `input` event before React had finished hydrating and attaching its `onChange` listener, so the controlled input's state never updated — the button's `disabled={inputValue.trim().length === 0}` stayed true because `inputValue` never left its initial empty string.

## Evidence
- Symptom: `locator.click` retried ~57 times over 30s, always logging "element is not enabled."
- Root cause confirmed by reproducing with an explicit wait: adding `await expect(button).toBeDisabled()` then `fill()` then `await expect(button).toBeEnabled()` before the click made the test pass reliably — proving the button *does* become interactive once given a moment past the initial SSR paint.
- This is a known category of flake for E2E against SSR/RSC apps generally (any Server-Component-rendered page with a client-hydrated interactive island), not specific to this form.

## Lesson / guidance
- Don't reach for a blind `page.waitForTimeout(...)` sleep to paper over this — assert on the actual interactive signal (the element becoming enabled, or any other state change that only happens post-hydration) before interacting, per common-test-strategy's "avoid hardcoded sleeps" rule. That assertion is also a **useful regression check on its own** — it fails loudly if a future change makes the control's initial disabled state never resolve.
- Apply the same pattern to any other freshly-navigated page with an initially-disabled control before the first interaction in a test.
- This is a test-authoring lesson, not a production concern — real users don't type fast enough to hit this race in practice, but automated tools can.

## Links
- e2e/mvp1.spec.ts (the fixed assertions)
- components/features/SearchPanel.tsx (the button whose disabled state exposed the race)
