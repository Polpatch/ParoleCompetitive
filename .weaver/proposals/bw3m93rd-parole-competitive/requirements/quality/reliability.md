---
description: Use when verifying accessibility, clock boundaries, persistence, static deployment and sharing privacy.
---
# Reliability and privacy

## General
- No backend, authentication, analytics, tracking, external runtime fonts or application cloud services. After static assets load, gameplay requires no network. No PWA, service worker, install flow or promised cold-start offline support.
- Support current stable Chromium, Firefox and Safari, including mobile layouts; do not require native Web Share to play. Use platform feature detection for optional sharing and clipboard features.
- Keyboard operation, focus visibility, screen-reader feedback and reduced motion must work. Exercise the actual narrow-screen and desktop surface, not only unit tests.

## daily-word
- Verify determinism for the same Rome date, midnight and both daylight-saving changes, reopening after a missed boundary, and preserving the currently published word across a rebuild. No random runtime daily selection.

## daily-game
- Deterministic rule tests cover duplicate-letter allocation, a winning sixth guess, six incorrect guesses, rejection without spending a guess or starting time, hard-mode observed multiplicity, gray-surplus keys, score deltas/stagnation, first-guess t=0 and time across closure.
- Include boundaries for difficult-mode downgrade and 1.10 bonus applied before a single final rounding. Browser smoke must exercise real input, a reveal, reload restoration, terminal locking and a day rollover using controlled time/data rather than waiting for midnight.
- Verify cross-tab reconciliation and exactly-once outcomes. Do not add arbitrary retries, telemetry or anti-cheat mechanisms.

## statistics
- Verify one counted result after reload, repeated delivery or competing tabs, histogram placement for wins at one and six guesses, and started versus unstarted expiry. Empty days add neither wins nor losses.

## result-share
- Verify native image capability, text fallback, clipboard denial/manual copying, cancellation and generic failure. Exercise the actual export and inspect its pixels or drawn content: no guess/solution letters, and a completely neutral first row with spoiler-free enabled. Do not rely on a test that merely checks that a sharing API was called.
- Preserve native share user activation: prepare the result image before the share gesture where necessary; do not lose activation during asynchronous rasterization. Observe actual behavior in a supporting browser/device when available and document any device-specific verification limit without claiming delivery.
