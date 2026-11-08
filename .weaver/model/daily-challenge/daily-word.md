# Daily word

The challenge offered for the current day. Returning on the same day preserves the challenge; a new day creates a new daily game.

## States

### Awaiting day (initial)
- `player.OPENED` → Available: establishes the current day's word, announces the available challenge, and restores any existing game for that day instead of starting a second one.

### Available
- `player.OPENED` → Available: presents the same day's challenge and restores its progress; when the day has changed, first treats the missed change as a new challenge day.
- `calendar.DAY_CHANGED` → Available: expires the preceding unfinished game before offering the new day's word; announces the new challenge.

## Events

### DAY_READY
A daily challenge is available. A new day starts a new daily game; returning to a known day restores its existing game and never resets a completed result.
