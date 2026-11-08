---
description: Use when implementing daily selection, guesses, scoring, hard mode or local outcomes.
---
# Daily puzzle rules

## daily-word
- Use the Gregorian calendar day in IANA time zone Europe/Rome, including daylight-saving changes, independent of the device's chosen time zone. The same date and shipped solution schedule give everyone the same word.
- Select a five-letter Italian solution from a reviewed, stable local solution list. Bundle the broader allowed-guess dictionary separately. There is no runtime feed, scraping, API, or claim of official Wordle affiliation.
- Pin the source snapshot and solution ordering. Document an epoch and deterministic selection algorithm; do not randomize on opening, rebuilding, or refreshing. Future list changes must preserve already published day-to-word assignments and the current day's solution.
- Reconcile the date on open, visibility return and a day boundary while visible. Expire the preceding unfinished game before showing the new challenge, even after several days away. Do not invent losses for intervening unplayed days.

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

## game-preferences
- Defaults: standard difficulty and spoiler-free sharing enabled. Persist preferences across days.
- Before the first accepted guess, changing difficulty in either direction is allowed. Once a game has started, hard→standard is allowed and irrevocably forfeits that game's hard bonus; standard→hard is forbidden. A rejected guess does not lock difficulty.
- After a game has ended, either difficulty can be selected for the next game; the completed game's difficulty, score and statistics remain unchanged. A new day's game takes the then-current preference.
- Spoiler-free can change at any time and affects only subsequent sharing, never the game score or previous outcomes.

## statistics
- Count each daily terminal outcome at most once, across refreshes, reopening and multiple tabs. Wins increment total wins and the matching one-through-six guess bucket. Exhausted guesses and started expiries increment total losses. Unstarted expiry changes nothing.
- Display total wins, total losses, win distribution in 1–6 guesses and latest concluded game's score. A started expiry makes the latest score zero. No per-person ranking, online leaderboard, ordered game history or extra streak system is required.
- Client clocks and local results are trusted; do not claim authoritative timing, anti-cheat, tamper resistance or cross-device synchronization.
