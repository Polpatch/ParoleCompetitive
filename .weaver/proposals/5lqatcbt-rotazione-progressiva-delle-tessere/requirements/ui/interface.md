---
description: Use when building the Italian game screen, keyboard, settings, statistics and share feedback.
---
# Interface

## General
- User-facing interface language is Italian; title is ParoleCompetitive. Use a restrained responsive layout for phone and desktop: centered grid, keyboard beneath, reachable settings and statistics, completed result and share action. No reference image or custom brand artwork is required.
- Provide a short Italian explanation of six guesses, duplicate-letter feedback, daily reset in Europe/Rome, time starting with the first accepted guess, local-only data and the difference between standard and hard rules.
- Use semantic buttons, visible keyboard focus, descriptive accessible names, live feedback for rejection/result, and sufficient contrast. Color is not the sole accessible indicator of tile state. No new theme selector or high-contrast setting is required.

## daily-game
- Always render six rows of five tiles, never the five-row layout from the initial request. Show the active draft and retain all accepted rows.
- Provide an embedded QWERTY A–Z keyboard, Invio and delete. Physical A–Z, Enter and Backspace have equivalent behavior; do not hijack typing in other editable controls or shortcuts with modifiers.
- On each accepted submission, reveal only that row with tile rotations ordered from left to right: gray absent, yellow misplaced, green correct. Each rotation lasts 1 s; starts are staggered by 0.3 s at 0, 0.3, 0.6, 0.9 and 1.2 s from the start of the row reveal. Rotations intentionally overlap; the full sequence ends when the fifth rotation finishes, nominally at 2.2 s.
- Each tile remains neutral, with no feedback in its accessible description, until the midpoint of its own rotation. At that midpoint, reveal its feedback color and matching accessible description together; keep that feedback visible afterward, while later tiles reveal in turn. Do not expose the entire row's feedback at once.
- Prevent repeat submits, edits and new guesses until the fifth rotation finishes. Keep cumulative keyboard feedback, visible statistics, result messaging and sharing availability at their pre-reveal presentation until the whole sequence finishes, then present the committed outcome. The accepted guess and any terminal result remain committed before animation, without extending solving time or changing score.
- With the system reduced-motion preference enabled, reveal all five feedback colors and matching accessible descriptions immediately after the accepted guess is committed, with no rotations or artificial delays. Complete the same reveal-dependent updates and input unlocking order immediately; terminal games remain locked.
- Keyboard keys show cumulative best feedback green > yellow > gray, and wholly absent keys are visibly and functionally disabled in both modes. Enter and delete remain usable when appropriate.
- Explain invalid length, unknown word, absent-letter use and hard-mode violations without spending a guess. A completed game shows win/loss and its fixed score; a day transition explains the reset and shows the new empty game. No solution letters appear in share artifacts even if the live result shows the answer.

## game-preferences
- Settings expose hard mode and spoiler-free sharing. Explain observed-duplicate minimums, the 10% hard bonus and losing that bonus on downgrade. Disable an in-game standard→hard switch with an explanation, but allow pre-game and post-game changes in both directions. Spoiler-free remains editable.

## statistics
- Show wins, losses, a labeled distribution of wins in one through six guesses, and the latest game's score. Correctly render the empty state and zero-height buckets without implying an online ranking.

## result-share
- Enable sharing only for a won/lost game after its feedback reveal. Export a clean result card image, not the whole live page: title, date, outcome/attempt count, score and a six-by-five grid. Unused cells are neutral. No letters, solution or keyboard.
- With spoiler-free enabled, the entire first row is neutral, including green/yellow/gray information; with it disabled, preserve first-row feedback colors but still omit letters. Apply the same concealment to the text fallback, using neutral placeholders instead of colored cells in its first row.
- Show meaningful Italian success, failure or manual-copy feedback. Native cancellation is quiet and never triggers clipboard copying or a PNG download. No automatic PNG download fallback.
