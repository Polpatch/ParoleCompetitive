---
description: Use when building loading, unavailable or incompatible daily-challenge presentation.
---
# Daily selection interface

## daily-word

- While acquiring a selection with no valid retained current-day record, show the usual six-by-five board with neutral empty cells and the three-row keyboard disabled. Do not present yesterday's letters, feedback or result as today's game. Block both physical and on-screen game input, without creating an active draft or starting the solving clock.
- Provide concise Italian accessible status for loading and unavailability, such as “Caricamento della sfida di oggi…” and “La sfida di oggi non è ancora disponibile. Riprova più tardi.” A failed acquisition must not suggest that the player lost or that saving succeeded. Expose a semantic “Riprova” button after failure; while acquiring, disable it and prevent duplicate requests. No automatic retry countdown.
- For an incompatible schema or vocabulary, explain in Italian that the game must be updated, offer “Ricarica pagina” as well as a deliberate retry, and retain saved games and preferences. A stale-date payload instead explains that today's publication is unavailable, never relabeling it as today.
- Keep header actions, settings, appearance, guide and historical statistics available during loading and failure. Keep an already open modal open with usable focus and scrolling; loading feedback must not steal focus. No current-game duration, current result summary, recap auto-opening or sharing action appears without today's revealed result. Aggregate historical statistics remain visible, including correctly applied expiry or one-time withdrawal.
- On successful acquisition, offer the new empty game or restore that same challenge's saved board and result without replaying reveals or resetting progress. A valid retained selection keeps the same-day game playable offline; explain the offline/new-day limit in the guide. Preserve theme, keyboard accessibility, modal navigation and reveal behavior.
- Explain the one-time 2026-11-08 replacement in Italian when it withdraws a saved old-calendar game: that day's challenge and result were replaced, earlier results and settings were retained, and the new game awaits its published selection if necessary. Delayed discovery identifies the withdrawn day without creating a past game. Do not imply another replacement on 2026-11-09.
