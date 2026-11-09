# Daily word

The challenge offered for the current day. Returning on the same day preserves the challenge, except when the expanded shared vocabulary replaces that day's challenge. Each newly offered challenge has its own game.

## States

### Awaiting day (initial)
- `player.OPENED` → Available: establishes the current day's word, announces the available challenge, and restores any existing game for that challenge instead of starting a second one; first withdraws the superseded activation-day challenge and its result if the vocabulary replacement has not yet been applied, even when discovered on a later day.

### Available
- `player.OPENED` → Available: presents the same day's challenge and restores its progress; first applies any outstanding vocabulary replacement, withdrawing only the superseded activation-day challenge and its result; when the day has changed, then treats the missed change as a new challenge day.
- `calendar.DAY_CHANGED` → Available: applies any outstanding vocabulary replacement without counting the withdrawn challenge as a loss, expires any other preceding unfinished game, and offers the new day's word; announces the new challenge.

## Events

### CHALLENGE_REPLACED
The expanded shared vocabulary replaces the activation day's previous challenge. The superseded game and any result for that challenge are withdrawn before a replacement challenge is offered. Earlier dates and player preferences are unchanged. Applying the same replacement again never withdraws the replacement game's progress or result. A missed replacement is applied when the player returns, without inventing an intervening game.

### DAY_READY
A daily challenge is available. A new day or the activation-day replacement starts a new daily game; returning to the same challenge restores its existing game and never resets its completed result.
