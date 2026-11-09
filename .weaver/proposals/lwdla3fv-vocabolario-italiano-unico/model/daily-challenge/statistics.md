# Local statistics

The playing device's accumulated outcomes, updated once per completed or started-and-expired challenge. No shared leaderboard or account is involved. Withdrawing the superseded activation-day challenge removes only that challenge's contribution.

## States

### Available (initial)
- `daily-game.WON` → Available: counts the win and its guess count once, and makes this game's score the latest result; ignores a result belonging to a withdrawn challenge.
- `daily-game.LOST` → Available: counts the loss once and makes zero the latest result score; ignores a result belonging to a withdrawn challenge.
- `daily-game.EXPIRED` → Available: only for a challenge that had begun, counts one loss and makes zero the latest result score; an unstarted or withdrawn challenge changes no totals.
- `daily-word.CHALLENGE_REPLACED` → Available: withdraws only the superseded activation-day challenge's win or loss, guess-distribution contribution and score; derives the latest score from the remaining concluded games, or shows no result if none remain. Repeated replacement leaves the new challenge's result and all other dates unchanged.
