# Game appearance

The player's chosen appearance for the live game, independent of difficulty, progress, scores and sharing privacy. The choice is remembered on the playing device. Without a saved choice, the game follows the device appearance.

## States

### Following system (initial)
The game uses the device's current light or dark appearance and follows later changes immediately.
- `player.OPENED` → Following system: when the saved choice follows the device or no appearance choice has been saved, uses the device's current appearance.
- `player.OPENED` → Light appearance: when the saved choice is light, restores that choice without changing any game result.
- `player.OPENED` → Dark appearance: when the saved choice is dark, restores that choice without changing any game result.
- `player.APPEARANCE_SELECTED` → Following system: when following the device is selected, remembers the choice and immediately uses its current appearance.
- `player.APPEARANCE_SELECTED` → Light appearance: when light is selected, remembers and applies the choice immediately.
- `player.APPEARANCE_SELECTED` → Dark appearance: when dark is selected, remembers and applies the choice immediately.
- `device.APPEARANCE_CHANGED` → Following system: immediately updates the live game to the device's new appearance without closing the current panel or changing play.

### Light appearance
The game stays light regardless of changes to the device's preferred appearance.
- `player.APPEARANCE_SELECTED` → Following system: when following the device is selected, remembers the choice and immediately uses its current appearance.
- `player.APPEARANCE_SELECTED` → Light appearance: selecting light again keeps the current choice.
- `player.APPEARANCE_SELECTED` → Dark appearance: when dark is selected, remembers and applies the choice immediately.

### Dark appearance
The game stays dark regardless of changes to the device's preferred appearance.
- `player.APPEARANCE_SELECTED` → Following system: when following the device is selected, remembers the choice and immediately uses its current appearance.
- `player.APPEARANCE_SELECTED` → Light appearance: when light is selected, remembers and applies the choice immediately.
- `player.APPEARANCE_SELECTED` → Dark appearance: selecting dark again keeps the current choice.
