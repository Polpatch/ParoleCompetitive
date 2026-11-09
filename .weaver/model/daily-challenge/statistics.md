# Local statistics

The playing device's accumulated outcomes and read-only concluded matches, updated once per completed or started-and-expired challenge. No shared leaderboard or account is involved. Withdrawing the superseded activation-day challenge removes only that challenge's contribution and history.

## States

### Available (initial)
Local totals include wins, losses, the winning-attempt distribution and cumulative score. Concluded matches can be consulted without replaying or changing them. Empty or unfinished days provide no history entry.
- `daily-game.WON` → Available: counts the win and its guess count once, adds its fixed score to the cumulative score and makes the concluded match available for history after its feedback is fully revealed; ignores a withdrawn challenge.
- `daily-game.LOST` → Available: counts the loss once, adds zero to cumulative score and makes the concluded match available for history after its feedback is fully revealed; ignores a withdrawn challenge.
- `daily-game.EXPIRED` → Available: only for a challenge that had begun, counts one loss, adds zero to cumulative score and makes the concluded match available for history; an unstarted or withdrawn challenge changes neither totals nor history.
- `daily-word.CHALLENGE_REPLACED` → Available: withdraws only the superseded activation-day challenge's outcome, guess-distribution contribution, score and historical match; derives totals and cumulative score from surviving concluded challenges. Repeated replacement leaves the new challenge's result and all other dates unchanged.
