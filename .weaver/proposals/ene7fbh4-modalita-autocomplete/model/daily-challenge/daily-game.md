# Daily game

One player's attempt to solve one daily challenge. Each new challenge has its own game, including a replacement challenge offered on the same day. Feedback and conclusions are committed when a valid guess is submitted; their visual reveal does not postpone the conclusion. Returning restores the same situation and does not repeat a result. A withdrawn challenge is no longer playable, even if it had already concluded. Each new game takes the current autocomplete preference; the first accepted guess locks that game's choice. With autocomplete enabled, every subsequent attempt keeps all previously discovered correct letters in their correct positions, fixed against deletion or replacement. Entry and deletion skip those positions. Returning preserves both fixed letters and unsubmitted manual letters without replaying feedback.

## States

### Awaiting challenge (initial)
- `daily-word.DAY_READY` → Ready: for a new challenge, offers an empty game with the current autocomplete preference; an existing challenge instead resumes its saved situation and autocomplete choice.

### Ready
- `player.AUTOCOMPLETE_SELECTED` → Ready: changes this game's autocomplete choice before any accepted guess, without changing the draft, spending a guess or starting solving time.
- `player.GUESS_SUBMITTED` → Ready: when the guess is incomplete, unknown, or violates known-letter restrictions, explains the rejection without consuming a guess or starting the solving time; does not lock the autocomplete choice or incur its score reduction.
- `player.GUESS_SUBMITTED` → Playing: when the first accepted guess is incorrect, starts the solving time, locks the autocomplete choice and records feedback; when enabled, incurs the autocomplete score reduction. After all feedback is shown, permits another guess and fills its known correct positions when autocomplete is enabled.
- `player.GUESS_SUBMITTED` → Won: when the first accepted guess is correct, starts and ends the solving time at submission, records feedback, locks the autocomplete choice and fixes the winning score, including the autocomplete reduction when enabled even though no letters were prefilled. Offers no further attempt.
- `calendar.DAY_CHANGED` → Expired: closes the unstarted challenge without recording a loss.
- `daily-word.CHALLENGE_REPLACED` → Replaced: only for the superseded activation-day challenge, withdraws its draft and progress without a result; the replacement challenge gets a separate empty game with the current autocomplete preference.

### Playing
- `player.AUTOCOMPLETE_SELECTED` → Playing: declines the change because the first accepted guess already locked this game's choice; leaves the current and future choices unchanged.
- `player.GUESS_SUBMITTED` → Playing: when the guess is incomplete, unknown, or violates known-letter restrictions, explains the rejection without consuming a guess or changing the start of solving time; preserves the draft and fixed positions.
- `player.GUESS_SUBMITTED` → Playing: when an accepted guess is incorrect and guesses remain, records feedback; only after all feedback is shown, permits another guess and, with autocomplete enabled, fills every correct position discovered in any accepted guess. These letters cannot be deleted or replaced.
- `player.GUESS_SUBMITTED` → Won: when an accepted guess is correct, including the last allowed guess, records feedback, stops solving time at submission, and fixes the winning score with the locked autocomplete choice. Offers no further attempt.
- `player.GUESS_SUBMITTED` → Lost: when the last allowed guess is incorrect, records feedback, stops solving time at submission, and fixes a zero score. Offers no further attempt.
- `calendar.DAY_CHANGED` → Expired: closes the started unfinished challenge and fixes a zero score and one loss. Offers no further attempt for that challenge.
- `daily-word.CHALLENGE_REPLACED` → Replaced: only for the superseded activation-day challenge, withdraws its draft, attempts and solving time without a loss or score; the replacement challenge gets a separate empty game with the current autocomplete preference and no inherited correct positions.

### Won (final)
A completed victory cannot accept guesses or be replayed. Later preference changes cannot alter its autocomplete choice or score. Withdrawing this challenge also withdraws its result; a replacement is a different challenge, not a replay of the victory.

### Lost (final)
A completed defeat cannot accept guesses or be replayed. Later preference changes cannot alter its autocomplete choice or score. Withdrawing this challenge also withdraws its result; a replacement is a different challenge, not a replay of the defeat.

### Expired (final)
The previous day's challenge can no longer be played. An unstarted challenge contributes no result. A superseded activation-day challenge contributes no result after its withdrawal, including when replacement is discovered later.

### Replaced (final)
The superseded challenge can no longer be played and contributes no score, loss or shareable result. The replacement challenge is independent and inherits no fixed or manual letters from the withdrawn challenge.

## Events

### WON
An accepted guess solved the challenge; the immutable result and score are available once.

### LOST
The allowed guesses were exhausted without solving; the immutable zero-score result is available once.

### EXPIRED
An unfinished challenge ended at a day change; only a challenge with an accepted guess contributes a zero-score loss. A vocabulary replacement is not an expiry.

### RESULT_REVEALED
The final feedback of a victory or defeat submitted during this visit has finished being shown. Emitted once for that newly completed current-day challenge, never for a restored result, a result received from another visit, an expired challenge, or a withdrawn challenge, including one replaced on the same day before its reveal finished. The result and solving time were already fixed at submission.
