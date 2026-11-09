# Game interface

The game view and its mutually exclusive settings, guide and statistics panels. Panels never pause solving time or alter the draft, accepted guesses, score or counted outcomes. A new visit begins on the game view, without restoring an open panel.

## States

### Game view (initial)
The game is available without an open panel.
- `player.SETTINGS_REQUESTED` → Settings open: opens settings and moves focus into the panel.
- `player.GUIDE_REQUESTED` → Guide open: opens the playing guide and moves focus into the panel.
- `player.STATISTICS_REQUESTED` → Statistics open: opens local statistics, including today's result when a victory or defeat has been revealed, and moves focus into the panel.
- `daily-game.RESULT_REVEALED` → Statistics open: for a new victory or defeat submitted during this visit, automatically opens the result and local statistics once after the final feedback is shown; closing it returns focus to the statistics action.

### Settings open
Settings include difficulty, sharing privacy and appearance. Changes keep the panel open. The game behind the panel cannot receive input.
- `player.PANEL_DISMISSED` → Game view: closes the panel without losing the draft and returns focus to the settings action.
- `daily-game.RESULT_REVEALED` → Statistics open: for a new victory or defeat submitted during this visit, immediately replaces settings with the result and local statistics after the final feedback is shown; closing it returns focus to the statistics action.

### Guide open
The player can read the existing playing rules while the game behind the panel cannot receive input.
- `player.PANEL_DISMISSED` → Game view: closes the panel without losing the draft and returns focus to the guide action.
- `daily-game.RESULT_REVEALED` → Statistics open: for a new victory or defeat submitted during this visit, immediately replaces the guide with the result and local statistics after the final feedback is shown; closing it returns focus to the statistics action.

### Statistics open
Local statistics remain available before and after play. A revealed victory or defeat for today's challenge also shows its fixed solving duration and score, with sharing available from the panel. Updated content stays in the same panel; a new day's unfinished challenge or a replacement challenge has no result summary or share action until its own result is revealed. A withdrawn challenge's result cannot be presented again. The game behind the panel cannot receive input.
- `player.PANEL_DISMISSED` → Game view: closes the panel and returns focus to the statistics action; the same completed result does not automatically reopen it.
- `daily-game.RESULT_REVEALED` → Statistics open: for a new victory or defeat submitted during this visit, shows the newly revealed result and local statistics once without opening a second panel.
- `calendar.DAY_CHANGED` → Statistics open: keeps the panel open with refreshed local totals, removes the previous day's current-result summary and sharing action, and presents the new unfinished challenge without a result.
- `daily-word.CHALLENGE_REPLACED` → Statistics open: keeps the panel open, removes the withdrawn challenge's result, duration and sharing presentation, and refreshes local totals from surviving outcomes; only the replacement challenge's own revealed result can supply a new summary.
