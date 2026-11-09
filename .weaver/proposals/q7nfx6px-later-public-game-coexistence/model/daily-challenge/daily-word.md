# Daily word

The challenge acquired for the current day. From the agreed secret-selection activation onward, a compatible published selection is required unless the same day's selection has already been acquired. Returning preserves the same challenge and game. The activation day's superseded public challenge is withdrawn once, never a later day's valid game. A later saved public-calendar game is retained separately from an acquired challenge of the same date; its unfinished play expires at the ordinary day boundary, and its result remains in statistics.

## States

### Awaiting day (initial)
- `player.OPENED` → Available: when a valid selection for the current day is already retained, or a historical day uses its preserved public assignment; applies any outstanding activation-day withdrawal before restoring the corresponding game.
- `player.OPENED` → Acquiring: otherwise applies any outstanding activation-day withdrawal and expires preceding unfinished games before acquiring today's published selection; creates no current game yet.

### Acquiring
- `challenge-source.SELECTION_RECEIVED` → Available: only when the selection is valid, compatible and belongs to the still-current requested day; retains it and announces the challenge, restoring an existing game instead of creating a second one.
- `challenge-source.SELECTION_RECEIVED` → Acquiring: ignores a completion for an obsolete day or superseded acquisition.
- `challenge-source.SELECTION_FAILED` → Unavailable: when no valid current-day selection is retained; explains unavailability or the need to update without creating a game or result.
- `challenge-source.SELECTION_FAILED` → Available: when another visit has already retained the valid current-day selection; restores that same challenge.
- `player.OPENED` → Acquiring: reconciles the current day and joins or supersedes acquisition without accepting duplicate or obsolete completion.
- `calendar.DAY_CHANGED` → Acquiring: expires preceding unfinished games and acquires the new day's selection; ignores the previous acquisition's later completion.

### Unavailable
- `player.SELECTION_RETRY_REQUESTED` → Acquiring: makes one new acquisition on the player's explicit request, without a timed retry.
- `player.OPENED` → Available: when a valid current-day selection is now retained, restores it without resetting its game.
- `player.OPENED` → Acquiring: otherwise acquires the current day's selection once.
- `calendar.DAY_CHANGED` → Acquiring: reconciles the new day and acquires its selection without inventing games for missed days.

### Available
- `player.OPENED` → Available: while the day is unchanged, restores the same acquired challenge and its progress even without a network connection; first applies any outstanding activation-day withdrawal.
- `player.OPENED` → Acquiring: when a missed day change is discovered, first applies any outstanding activation-day withdrawal and ordinary expiry, then acquires today's selection.
- `calendar.DAY_CHANGED` → Acquiring: expires preceding unfinished games at their actual day boundary, clears obsolete current-result presentation and acquires today's selection; no alternative challenge is invented.

## Events

### CHALLENGE_REPLACED
On the explicit secret-selection activation day, the previous public challenge is withdrawn once, including its draft, attempts and any concluded result. A later discovery withdraws only that day's superseded record before ordinary expiry, without inventing a past replacement game or a loss. Earlier dates and preferences remain unchanged. The secret challenge becomes a separate game only when acquired; repeating reconciliation never erases that game's progress or result. The abandoned following-day vocabulary cutover cannot withdraw another challenge.

### DAY_READY
A valid current challenge is available. A newly acquired challenge starts one new game; an already acquired challenge restores its existing situation, including its own autocomplete choice and concluded result, without resetting it.
