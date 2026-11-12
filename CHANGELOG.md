# Changelog

## 2026-11-12

- Integrate the approved visual design into the production game, retaining real daily selections, local progress, rules, statistics and sharing.
- Add a larger title with a short underline and an animated, contrasting capsule menu with minimal SVG icons and consistent focus return.
- Restyle settings, guide, statistics and history dialogs while preserving their content, input locks and visible sharing footer.
- Move the compact date below the board; place SVG Cancella on the left and Invio on the right of the last keyboard row.
- Present softer top-center toasts with a small upper-right close icon and a 200 ms exit fade, preserving active lifetime, hover/focus pauses and immediate reduced-motion dismissal.
- Release pointer capture when cancelling an embedded-key hold so navigation remains usable.
- Adapt the built-site browser checks to the menu, accessible icon controls, board/date positioning and toast lifecycle.

## 2026-11-09

- Anchor the keyboard above the bottom safe area, center the live board, and allow independent upper-area or whole-page scrolling as space requires. Playwright viewport tests ran against the development server at 320×568, 360×640, 390×844, 1280×800, 640×320 and 320×160.
- Shorten historical match grids to the saved accepted attempts; live and shared grids retain six rows.
- Preserve page touch gestures while keeping embedded keyboard keys protected from selection and touch callouts.
- Size the compact board from the space left by the header and keyboard, preserving scrolling for larger text.
- Run browser smoke against a dedicated production preview, with a configurable port and no reuse of unrelated servers.
- Preserve a current challenge's reveal and sharing feedback when an unrelated retired challenge is reconciled.
- Add immediate embedded-key press feedback and controlled hold repetition, with cancellation across reveal, modal, and challenge changes.
- Add cumulative-score cards and a six-column win histogram to the Statistiche tab, alongside a read-only expandable local match history in the Storico tab.
- Adapt the compact game view to the visible viewport, move local-data guidance into the guide, and present brief feedback as a single pausable, dismissible toast.
- Request touch zoom suppression where permitted; browser and system magnification overrides remain outside application control.
- Replace the abandoned v2 schedule with an immutable, secret-selected daily publication from 8 November 2026, preserving earlier v1 assignments.
- Wait for game input readiness before typing in browser verification.
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
