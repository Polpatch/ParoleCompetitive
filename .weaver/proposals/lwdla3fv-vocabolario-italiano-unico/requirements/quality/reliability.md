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
- Verify real bundled vocabulary behavior, not only synthetic word sets: AUDIO and OZONO are eligible both as guesses and solutions; representative Italian inflections, loanwords and uncommon terms from the chosen source remain eligible. The new frozen permutation contains exactly the canonical set, without omissions, duplicates or extra candidates.
- Verify reproducible generation from pinned inputs and fixed seed, historical v1 assignments before activation, the new entry on activation and subsequent dates, and unchanged current assignments after rebuild. The larger source must not become an unfiltered full-length runtime payload or require any runtime network request.

## daily-game
- Deterministic rule tests cover duplicate-letter allocation, a winning sixth guess, six incorrect guesses, rejection without spending a guess or starting time, hard-mode observed multiplicity, gray-surplus keys, score deltas/stagnation, first-guess t=0 and time across closure.
- Include boundaries for difficult-mode downgrade and 1.10 bonus applied before a single final rounding. Browser smoke must exercise real input, a reveal, reload restoration, terminal locking and a day rollover using controlled time/data rather than waiting for midnight.
- Browser verification must observe the accepted row's left-to-right 0.3 s start offsets and 1 s rotations, per-tile color and accessible feedback at each rotation's midpoint, and input locking through the fifth rotation's completion at 2.2 s. Verify that cumulative keyboard feedback, visible statistics, result messaging and sharing do not expose the new outcome before the complete reveal, and that reduced motion shows feedback immediately without rotation or artificial waiting. Preserve submission-time timestamps and score, committed-guess restoration without replay, and terminal locking.
- Verify cross-tab reconciliation and exactly-once outcomes. Do not add arbitrary retries, telemetry or anti-cheat mechanisms.
- Add real-dictionary regression coverage through the production admission path for AUDIO and OZONO in fresh games, case normalization, and an actually absent five-letter word. Assert accepted feedback and clock/attempt transitions, and continued rejection for known-letter or hard-mode violations rather than only checking list lengths.
- Verify activation-day withdrawal of unstarted, playing, won, lost and already-expired old-schedule records, including first discovery after activation. Other dates and preferences stay intact. Repeated open/reconcile, reload, competing tabs and stale old-schedule records cannot erase or resurrect the replacement game or count a withdrawal as a loss.
- Browser smoke exercises actual input with the real dictionary and the cutover using controlled calendar/storage: reset notice, empty board, restored earlier statistics, correct share locking, and persistence of the replacement game's new progress after reload. Keep all existing reveal timing, reduced-motion and terminal-locking behavior.

## statistics
- Verify one counted result after reload, repeated delivery or competing tabs, histogram placement for wins at one and six guesses, and started versus unstarted expiry. Empty days add neither wins nor losses.
- Verify removal of an activation-day win and its bucket, removal of a loss, latest-score fallback to an earlier outcome or no-result state, preservation of other dates, and exactly one new result after replacement. Repeated withdrawal and delayed old-challenge delivery leave the replacement result intact.

## result-share
- Verify native image capability, text fallback, clipboard denial/manual copying, cancellation and generic failure. Exercise the actual export and inspect its pixels or drawn content: no guess/solution letters, and a completely neutral first row with spoiler-free enabled. Do not rely on a test that merely checks that a sharing API was called.
- Preserve native share user activation: prepare the result image before the share gesture where necessary; do not lose activation during asynchronous rasterization. Observe actual behavior in a supporting browser/device when available and document any device-specific verification limit without claiming delivery. Describe available automated tests accurately; do not claim pixel-level or preparation-retry coverage unless those checks exist in the checked-in suite.
- Verify that vocabulary replacement removes the old result's share action, prepared artifact and visible manual-copy text; delayed preparation or completion cannot re-enable it or start a fallback. The new challenge enables sharing only after its own completed result reveal. Do not claim revocation of external shares/copies already handed off.
