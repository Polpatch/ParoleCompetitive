---
description: Use when building the Italian game screen, keyboard, settings, statistics and share feedback.
---
# Interface

## General
- User-facing interface language is Italian; title is ParoleCompetitive. Use a restrained responsive layout for phone and desktop: centered grid, keyboard beneath, reachable settings and statistics, completed result and share action. No reference image or custom brand artwork is required.
- Provide a short Italian explanation of six guesses, duplicate-letter feedback, daily reset in Europe/Rome, time starting with the first accepted guess, local-only data and the difference between standard and hard rules.
- Use semantic buttons, visible keyboard focus, descriptive accessible names, live feedback for rejection/result, and sufficient contrast. Color is not the sole accessible indicator of tile state. No separate high-contrast setting is required.

## daily-game
- Always render six rows of five tiles, never the five-row layout from the initial request. Show the active draft and retain all accepted rows.
- Provide an embedded A–Z keyboard in exactly three centered, non-wrapping rows: QWERTYUIOP; ASDFGHJKL; then Invio, ZXCVBNM and Cancella. Preserve these letter groups and order on phone and desktop, including a 320 px viewport without horizontal page scrolling. Inset the shorter rows and make action keys wider where space permits; do not add digits, punctuation or accent keys.
- Physical A–Z, Enter and Backspace have equivalent behavior; do not hijack typing in other editable controls or shortcuts with modifiers, and do not send game input while a modal panel is open.
- On each accepted submission, reveal only that row with tile rotations ordered from left to right: gray absent, yellow misplaced, green correct. Each rotation lasts 1 s; starts are staggered by 0.3 s at 0, 0.3, 0.6, 0.9 and 1.2 s from the start of the row reveal. Rotations intentionally overlap; the full sequence ends when the fifth rotation finishes, nominally at 2.2 s.
- Each tile remains neutral, with no feedback in its accessible description, until the midpoint of its own rotation. At that midpoint, reveal its feedback color and matching accessible description together; keep that feedback visible afterward, while later tiles reveal in turn. Do not expose the entire row's feedback at once.
- Prevent repeat submits, edits and new guesses until the fifth rotation finishes. Keep cumulative keyboard feedback, visible statistics, result messaging and sharing availability at their pre-reveal presentation until the whole sequence finishes, then present the committed outcome. The accepted guess and any terminal result remain committed before animation, without extending solving time or changing score.
- With the system reduced-motion preference enabled, reveal all five feedback colors and matching accessible descriptions immediately after the accepted guess is committed, with no rotations or artificial delays. Complete the same reveal-dependent updates and input unlocking order immediately; terminal games remain locked.
- Keyboard keys show cumulative best feedback green > yellow > gray, and wholly absent keys are visibly and functionally disabled in both modes. Enter and delete remain usable when appropriate.
- Explain invalid length, unknown word, absent-letter use and hard-mode violations without spending a guess. A completed game shows win/loss and its fixed score; a day transition explains the reset and shows the new empty game. No solution letters appear in share artifacts even if the live result shows the answer.
- Explain the vocabulary cutover in Italian when it withdraws a saved activation-day game: that day's challenge and result were replaced, while earlier results and settings were retained. Show the replacement's empty six-by-five board, fresh keyboard knowledge and unlocked eligible input; no old reveal, score or result message may reappear. A delayed cutover discovery explains the withdrawn day without presenting a new game for that past day.

## game-preferences
- Settings expose hard mode and spoiler-free sharing. Explain observed-duplicate minimums, the 10% hard bonus and losing that bonus on downgrade. Disable an in-game standard→hard switch with an explanation, but allow pre-game and post-game changes in both directions. Spoiler-free remains editable.

## statistics
- Show wins, losses, a labeled distribution of wins in one through six guesses, and the latest game's score. Correctly render the empty state and zero-height buckets without implying an online ranking.

## result-share
- Enable sharing only for a won/lost game after its feedback reveal. Export a clean result card image, not the whole live page: title, date, outcome/attempt count, score and a six-by-five grid. Unused cells are neutral. No letters, solution or keyboard.
- With spoiler-free enabled, the entire first row is neutral, including green/yellow/gray information; with it disabled, preserve first-row feedback colors but still omit letters. Apply the same concealment to the text fallback, using neutral placeholders instead of colored cells in its first row.
- Show meaningful Italian success, failure or manual-copy feedback. Native cancellation is quiet and never triggers clipboard copying or a PNG download. No automatic PNG download fallback.
- When the displayed result belongs to the withdrawn challenge, disable sharing and remove its obsolete manual-copy text and share-status feedback. Keep sharing disabled until the replacement game reaches a revealed won/lost result.
- The only Condividi risultato action is in the statistics/result modal's bottom footer, available for the current day's revealed win/loss and absent for unfinished or expired games. Remove the duplicate game-page action. Keep the footer visible outside the scrolling information area; reserve its full height so every item, including the final item, can scroll entirely above it rather than underneath it.
- Keep preparation, success, failure and manual-copy feedback within the modal. Place selectable manual-copy text in its scrollable area, reachable with keyboard and touch without obscuring it with the footer. Preserve existing capability detection, preparation/retry behavior and native user activation. Application appearance changes do not restyle the exported image or text.

## game-appearance
- Add an Aspetto control to the settings modal with the Italian choices Sistema, Chiaro and Scuro. Start with Sistema when no choice is saved; visibly identify the selected preference, not just the resolved light/dark appearance.
- Apply selection changes immediately to the whole live interface, including panels, backdrop, board, keyboard, disabled controls, focus indicators, notices and sharing footer. With Sistema selected, immediately follow changes to the device's preferred color scheme; manual Chiaro and Scuro override those changes.
- Preserve the current light appearance. Use a neutral very-dark-gray background with slightly lighter surfaces for dark appearance. Maintain readable text, distinct controls and visible focus in both palettes, preserving green/yellow/gray meanings and non-color tile descriptions. Do not add a separate high-contrast mode.
- Changing appearance does not close the open modal, reset focus or scrolling unnecessarily, alter the game or its score, or redesign share artifacts.

## game-interface
- Replace the settings, playing guide and statistics accordions with three semantic icon buttons at the top right of the header: gear for Impostazioni, question mark for Come si gioca, and chart for Statistiche. Supply descriptive Italian accessible names; keep all three reachable on narrow screens.
- Open one centered modal at a time, with an accessible title, an explicit Chiudi button, a dimmed backdrop and a height constrained to the viewport. Its content scrolls vertically on phone and desktop. Keep background content inert and prevent background scrolling while open.
- Move focus into the modal, contain keyboard focus within it and close on Chiudi, Escape or a click/tap directly on the backdrop, never from interacting inside the panel. Return focus to its opener; after automatic result opening return focus to the Statistiche icon. Do not let modal keystrokes reach the game.
- Preserve the current draft and the running solving clock when opening or closing panels. Retain the same panel during preference changes, appearance changes, result preparation and ordinary game/day/storage rerenders; keep its contents current and focus usable. A reload begins without an open panel.
- Keep the existing complete guide, local-data explanations, difficulty rules and spoiler-free controls in their respective modals. Do not change difficulty locks, results, scores or statistic counting.

## game-interface/Statistics open
- Use the same statistics modal for manual opening and the automatic final recap. Before the current challenge is won/lost and revealed, show the existing statistics and empty states without a current-result duration or share action. Afterwards also show the current challenge outcome, fixed score and fixed solving duration, followed by the existing local totals and one-through-six distribution; keep the Condividi risultato footer visible at the bottom.
- Display elapsed solving time from the recorded first accepted submission to the terminal submission, not to the end of the animation. Use m:ss below one hour and h:mm:ss from one hour, truncating fractional seconds for display only; a first-guess win shows 0:00. Do not add start/end clock times or alter score precision.
- Automatically open once after the final feedback reveal of a newly won/lost game submitted in this tab. Immediately replace any other open modal. Do not automatically open for a reload, a restored result, a result observed from another tab, a dismissed recap, a nonterminal row, a day expiry or a withdrawn challenge. An old reveal finishing after a day change or a same-day challenge replacement must not open the obsolete recap.
- Manual opening after restoring today's completed game includes the same fixed duration, score, statistics and sharing action. When the day changes while this modal remains open, update to the new challenge, removing the old current-result summary and sharing action while retaining aggregate statistics.
- A vocabulary replacement keeps the modal open with usable focus, removes the withdrawn challenge's outcome, duration, score, share action, manual-copy text and share-status feedback, and refreshes aggregate statistics from surviving outcomes. This also applies when withdrawal is discovered after the activation day. Only the replacement challenge's own revealed won/lost result may supply a new recap and share action; delayed feedback from the withdrawn challenge must not restore either.
