# Game preferences

Difficulty, autocomplete and sharing preferences on the playing device. Standard difficulty is the initial preference. Autocomplete is initially disabled and is independent of difficulty. First-row privacy is initially enabled and can change at any time without changing the score.

## States

### Standard (initial)
- `player.DIFFICULTY_SELECTED` → Hard: only before the first accepted guess or after the game has ended; after an ended game this changes the future preference only.
- `player.DIFFICULTY_SELECTED` → Standard: selecting standard keeps the current preference.
- `player.SPOILER_PREFERENCE_SELECTED` → Standard: changes whether the first guess feedback is concealed during sharing, without changing any game result.
- `player.AUTOCOMPLETE_SELECTED` → Standard: before the first accepted guess, changes autocomplete for the current game and future games; after the game has ended, changes only the future preference. During a started unfinished game, declines the change and keeps both choices unchanged.

### Hard
- `player.DIFFICULTY_SELECTED` → Standard: always allowed; during an unfinished started game it removes hard restrictions and permanently forfeits that game's hard bonus. After the game has ended it changes the future preference only.
- `player.DIFFICULTY_SELECTED` → Hard: selecting hard keeps the current preference.
- `player.SPOILER_PREFERENCE_SELECTED` → Hard: changes whether the first guess feedback is concealed during sharing, without changing any game result.
- `player.AUTOCOMPLETE_SELECTED` → Hard: before the first accepted guess, changes autocomplete for the current game and future games; after the game has ended, changes only the future preference. During a started unfinished game, declines the change and keeps both choices unchanged.
