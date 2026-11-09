# Changelog

## 2026-11-09

- Replace the abandoned v2 schedule with an immutable, secret-selected daily publication from 8 November 2026, preserving earlier v1 assignments.
- Acquire only the published current-day selection; unavailable challenges wait without creating a game, with one acquisition per explicit retry and retained same-day offline play after assets and selection are acquired.
- Publish at 00:07 Europe/Rome when scheduling permits, with authorized manual recovery from an append-only daily-data record; secret provisioning and prospective key rotation require authorization.
- Document that old public-calendar clients cannot be revoked, future offline challenges are not available, daily answers can repeat and today's answer is exposed in the browser.
- Keep sharing preparation and selectable manual-copy feedback in the statistics dialog, with an unobscured scrolling area and visible keyboard focus.
- Add per-game autocomplete with fixed discovered greens, positional draft restoration and a single-rounded 0.98 score factor.
- Bind prepared shares and asynchronous feedback to the active challenge, clearing withdrawn results without disturbing replacement results.
- Replace accordions with accessible modal settings, guide and statistics; show the fixed solving duration and share action in the automatic or manually opened result recap.
- Add system, light and dark appearance choices and a responsive three-row keyboard.
- Withdraw superseded activation-day games before expiry, preserve replacement progress and later-day reveals across reconciliation, and report late withdrawals in already-open tabs.
- Reveal accepted tiles progressively, with immediate feedback for reduced motion.

## 1.0.0

- Introduced the daily Italian word puzzle, local preferences and statistics, and letter-free result sharing.
- Added deterministic rule tests, a production-site browser smoke, and GitHub Pages release automation.
