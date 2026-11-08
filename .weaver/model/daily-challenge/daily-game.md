# Daily game

One player's attempt to solve one daily challenge. Each new challenge has its own game. Feedback and conclusions are committed when a valid guess is submitted; their visual reveal does not postpone the conclusion. Returning restores the same situation and does not repeat a result.

## States

### Awaiting challenge (initial)
- `daily-word.DAY_READY` → Ready: for a new challenge, offers an empty game; an existing challenge instead resumes its saved situation.

### Ready
- `player.GUESS_SUBMITTED` → Ready: when the guess is incomplete, unknown, or violates known-letter restrictions, explains the rejection without consuming a guess or starting the solving time.
- `player.GUESS_SUBMITTED` → Playing: when the first accepted guess is incorrect, starts the solving time, records feedback, and permits another guess after feedback is shown.
- `player.GUESS_SUBMITTED` → Won: when the first accepted guess is correct, starts and ends the solving time at submission, records feedback, and fixes the winning score.
- `calendar.DAY_CHANGED` → Expired: closes the unstarted challenge without recording a loss.

### Playing
- `player.GUESS_SUBMITTED` → Playing: when the guess is incomplete, unknown, or violates known-letter restrictions, explains the rejection without consuming a guess or changing the start of solving time.
- `player.GUESS_SUBMITTED` → Playing: when an accepted guess is incorrect and guesses remain, records feedback and permits another guess after feedback is shown.
- `player.GUESS_SUBMITTED` → Won: when an accepted guess is correct, including the last allowed guess, records feedback, stops solving time at submission, and fixes the winning score.
- `player.GUESS_SUBMITTED` → Lost: when the last allowed guess is incorrect, records feedback, stops solving time at submission, and fixes a zero score.
- `calendar.DAY_CHANGED` → Expired: closes the started unfinished challenge and fixes a zero score and one loss.

### Won (final)
A completed victory cannot accept guesses or be replayed that day.

### Lost (final)
A completed defeat cannot accept guesses or be replayed that day.

### Expired (final)
The previous day's challenge can no longer be played. An unstarted challenge contributes no result.

## Events

### WON
An accepted guess solved the challenge; the immutable result and score are available once.

### LOST
The allowed guesses were exhausted without solving; the immutable zero-score result is available once.

### EXPIRED
An unfinished challenge ended at a day change; only a challenge with an accepted guess contributes a zero-score loss.
