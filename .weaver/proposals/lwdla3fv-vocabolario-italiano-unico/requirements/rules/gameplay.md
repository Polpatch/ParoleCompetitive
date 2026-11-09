---
description: Use when implementing daily selection, guesses, scoring, hard mode or local outcomes.
---
# Daily puzzle rules

## daily-word

- Use the Gregorian calendar day in IANA time zone Europe/Rome, including daylight-saving changes, independent of the device's chosen time zone. The same date and shipped schedule give everyone the same word.
- For the new schedule, every canonical allowed guess is eligible as a five-letter Italian solution, and every eligible solution is an allowed guess. Include inflections, rare words, Italian-use loanwords and vulgar/offensive terms. AUDIO and OZONO belong to the common set. There is no separate reduced solution list, runtime feed, scraping, API or claim of official Wordle affiliation.
- From the explicit activation date onward, select the entry at the nonnegative Rome-calendar-day offset from that date modulo the frozen permutation's length. The complete permutation covers the common set once before cycling. Fix the source snapshot, permutation, seed, identity and activation date; no randomization on opening, rebuilding or refreshing.
- Dates before activation retain the v1 date-to-word assignments. On activation, replace that day's previous challenge for everyone, including players who already finished it. Withdraw only that challenge's progress and result, without a loss, then offer one new empty game; preserve earlier dates and preferences. Repeated application cannot reset the new challenge.
- Reconcile the date and outstanding cutover on open, visibility return and a day boundary while visible. Apply any missed withdrawal before ordinary expiry, even after several days away. Expire other preceding unfinished games before showing the current challenge; do not invent games or losses for intervening unplayed days. Future schedule changes preserve this release's assignments through their own explicitly agreed cutover.

## daily-game
- Exactly six guesses, each exactly five A–Z letters. Normalize case only; reject accented letters, nonletters, proper names and words absent from the allowed dictionary. Every solution must be an allowed guess.
- Rejected or incomplete submissions consume no guess, do not start or reset time, and explain the rejection in Italian. A correct sixth guess wins; only a sixth incorrect accepted guess loses.
- Evaluate duplicates in two passes: assign greens for exact positions and consume those occurrences, then assign yellows left-to-right from the remaining solution occurrences; all unmatched occurrences are gray. Never award more positive occurrences of a letter than the solution contains.
- Cumulative keyboard knowledge uses green > yellow > gray and never downgrades. Disable letters proved wholly absent in both standard and hard mode, on both on-screen and physical keyboards. A gray surplus duplicate does not disable a letter with positive evidence. Never use unrevealed solution knowledge to disable a key.
- Hard mode adds fixed green positions, inclusion of observed yellow letters outside every position already excluded by yellow feedback, and a minimum occurrence count equal to the maximum green-plus-yellow count for that letter within any one prior accepted row. Do not sum rows, infer unseen duplicates, or enforce a secret upper bound. Gray-only letters are already blocked in both modes.
- The first accepted submission fixes startedAt. A terminal accepted submission fixes endedAt immediately, before animation. elapsed seconds t=max(0,(endedAt-startedAt)/1000), including hidden-tab time and browser closure. The initial correct guess therefore has t=0. Rejections and page reopening do not reset startedAt.
- For each accepted row, G and Y count greens and yellows. With prior counts initially zero, ΔG=max(0,G-currentPreviousG), ΔY=max(0,Y-currentPreviousY). Set s=0 if either delta is positive, otherwise increment the consecutive stagnation count s (initially zero). Regressing or unchanged counts with neither positive delta are stagnation. The first stagnating row has no penalty; later consecutive rows pay 50·(s−1) each.
- B=1000+Σ over accepted rows of (100·ΔG+40·ΔY−50·max(0,s−1)). For a win in n accepted guesses, raw=max(0,B)/(n·(1+t/60)). Score=Math.round(raw·m), with m=1.10 only if the game started hard and never downgraded, otherwise m=1. Round once, after multiplication. A loss or expiry scores zero.
- A submitted guess and its outcome are committed once, before the reveal; prevent duplicate Invio, edits and new guesses during the reveal. Ignore guesses after any terminal result. Reduced-motion presentation preserves the same commit and unlocking order.
- A started unfinished game expires at day change with endedAt at the actual Europe/Rome day boundary, score zero and one loss. An unstarted game expires without a result. A missed boundary discovered later must not extend yesterday's play.
- Dictionary admission uses the same complete canonical set as solution eligibility; membership does not bypass known-gray or hard-mode restrictions. AUDIO and OZONO are accepted with ordinary feedback in an otherwise eligible fresh game, regardless of input case; an absent word remains rejected without an attempt or clock change.
- Withdrawing an activation-day challenge is neither a win, loss nor ordinary expiry. Even a previously won or lost challenge is removed from active play and gives no surviving result; its replacement begins with six guesses and no solving time until its first accepted submission. Earlier completed games remain immutable.

## game-preferences
- Defaults: standard difficulty and spoiler-free sharing enabled. Persist preferences across days.
- Before the first accepted guess, changing difficulty in either direction is allowed. Once a game has started, hard→standard is allowed and irrevocably forfeits that game's hard bonus; standard→hard is forbidden. A rejected guess does not lock difficulty.
- After a game has ended, either difficulty can be selected for the next game; the completed game's difficulty, score and statistics remain unchanged. A new day's game takes the then-current preference.
- Spoiler-free can change at any time and affects only subsequent sharing, never the game score or previous outcomes.

## statistics
- Count each daily terminal outcome at most once, across refreshes, reopening and multiple tabs. Wins increment total wins and the matching one-through-six guess bucket. Exhausted guesses and started expiries increment total losses. Unstarted expiry changes nothing.
- Display total wins, total losses, win distribution in 1–6 guesses and latest concluded game's score. A started expiry makes the latest score zero. No per-person ranking, online leaderboard, ordered game history or extra streak system is required.
- Client clocks and local results are trusted; do not claim authoritative timing, anti-cheat, tamper resistance or cross-device synchronization.
- Subtract no arbitrary counters on replacement: recompute from surviving daily outcomes so a removed win also removes its correct guess bucket, a removed loss reduces losses, and the latest score returns to the latest remaining concluded game or the no-result state. Ignore repeated withdrawals and delayed results from the superseded challenge without disturbing the new challenge's outcome.
