# Game interface

The game view and its mutually exclusive settings, guide and statistics panels. Panels never pause solving time or alter the draft, accepted guesses, score or counted outcomes. A new visit begins on the game view, without restoring an open panel. Brief feedback never opens or closes a panel, interrupts editing or changes the game. It is presented in the current game view or open panel without taking focus; feedback belonging to an expired or withdrawn challenge cannot return.

## States

### Game view (initial)
The game surface is shown without an open panel, including while the current challenge is being acquired or is unavailable.
- `player.SETTINGS_REQUESTED` → Settings open: opens settings and moves focus into the panel.
- `player.GUIDE_REQUESTED` → Guide open: opens the playing guide and moves focus into the panel.
- `player.STATISTICS_REQUESTED` → Statistics summary: opens local statistics on the summary, including today's result when a victory or defeat has been revealed, and moves focus into the panel.
- `daily-game.RESULT_REVEALED` → Statistics summary: for a new victory or defeat submitted during this visit, automatically opens the result and local statistics once after the final feedback is shown; closing it returns focus to the statistics action.

### Settings open
Settings include difficulty, sharing privacy and appearance. Changes keep the panel open. The game behind the panel cannot receive input.
- `player.PANEL_DISMISSED` → Game view: closes the panel without losing the draft and returns focus to the settings action.
- `daily-game.RESULT_REVEALED` → Statistics summary: for a new victory or defeat submitted during this visit, immediately replaces settings with the result and local statistics after the final feedback is shown; closing it returns focus to the statistics action.

### Guide open
The player can read the playing introduction, complete rules and explanation of device-local data while the game behind the panel cannot receive input.
- `player.PANEL_DISMISSED` → Game view: closes the panel without losing the draft and returns focus to the guide action.
- `daily-game.RESULT_REVEALED` → Statistics summary: for a new victory or defeat submitted during this visit, immediately replaces the guide with the result and local statistics after the final feedback is shown; closing it returns focus to the statistics action.

### Statistics open
The same panel offers a statistics summary and a read-only local match history before and after play. Each opening begins on the summary with historical matches collapsed. Switching views does not alter progress, solving time, results or scores. During the same opening, valid historical expansions survive view changes and ordinary updates. The game behind the panel cannot receive input. A withdrawn challenge's result cannot be presented again.
- `player.PANEL_DISMISSED` → Game view: closes the panel and returns focus to the statistics action; the same completed result does not automatically reopen it.
- `daily-game.RESULT_REVEALED` → Statistics summary: for a new victory or defeat submitted during this visit, selects the summary and shows the newly revealed result and local statistics once without opening a second panel.

#### Statistics summary (initial)
Shows local cumulative statistics. A revealed victory or defeat for today's challenge also shows its fixed solving duration and score and permits sharing only that result.
- `player.STATISTICS_SUMMARY_SELECTED` → Statistics summary: keeps the summary selected without changing results.
- `player.HISTORY_SELECTED` → Match history: shows surviving concluded matches, preserving valid expansions from this panel opening; does not offer sharing or its feedback here.
- `calendar.DAY_CHANGED` → Statistics summary: keeps the panel open on the summary, refreshes totals and history, and removes the previous day's current-result summary and sharing action.
- `daily-word.CHALLENGE_REPLACED` → Statistics summary: keeps the panel open and usable, removes the withdrawn result and sharing presentation, and refreshes totals and history from surviving challenges; delayed feedback cannot restore withdrawn content.

#### Match history
Shows all locally retained concluded victories, defeats and started expiries, most recent first. Today's victory or defeat is eligible only after its full reveal. Each match begins collapsed and can be expanded independently to inspect the complete match; multiple matches may remain expanded. Empty history is explained without inventing missing games. All consultation is read-only.
- `player.HISTORY_SELECTED` → Match history: keeps history and valid expansions unchanged.
- `player.STATISTICS_SUMMARY_SELECTED` → Statistics summary: returns to the summary, retaining valid expansions for the same opening and offering sharing only for today's revealed victory or defeat.
- `player.HISTORY_MATCH_TOGGLED` → Match history: expands a collapsed eligible match or collapses an expanded match without closing any other match; a missing or withdrawn match cannot be opened.
- `calendar.DAY_CHANGED` → Match history: stays on history, refreshes concluded matches including started expiries, preserves valid expansions, and removes obsolete current-result sharing presentation.
- `daily-word.CHALLENGE_REPLACED` → Match history: stays on history, removes only the withdrawn match and any expansion of it, refreshes surviving totals and history, and preserves other valid expansions and usable focus.
