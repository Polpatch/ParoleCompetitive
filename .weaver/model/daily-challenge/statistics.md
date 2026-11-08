# Local statistics

The playing device's accumulated outcomes, updated once per completed or started-and-expired challenge. No shared leaderboard or account is involved.

## States

### Available (initial)
- `daily-game.WON` → Available: counts the win and its guess count once, and makes this game's score the latest result.
- `daily-game.LOST` → Available: counts the loss once and makes zero the latest result score.
- `daily-game.EXPIRED` → Available: only for a challenge that had begun, counts one loss and makes zero the latest result score; an unstarted challenge changes no totals.
