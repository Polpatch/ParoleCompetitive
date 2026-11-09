# Result share

A repeatable sharing attempt for a completed game. A private result presentation is used; the live game itself is not altered. A withdrawn challenge no longer has a shareable result.

## States

### Unavailable (initial)
- `player.SHARE_REQUESTED` → Unavailable: while no won or lost result exists, explains that a completed result is required.
- `daily-game.WON` → Available: the victory can be shared after the final feedback reveal, unless it belongs to a withdrawn challenge.
- `daily-game.LOST` → Available: the defeat can be shared after the final feedback reveal, unless it belongs to a withdrawn challenge.

### Available
- `player.SHARE_REQUESTED` → Preparing: prepares a letter-free result with the current first-row privacy preference.
- `calendar.DAY_CHANGED` → Unavailable: the new daily game has no shareable result yet.
- `daily-word.CHALLENGE_REPLACED` → Unavailable: only when the shareable result belongs to the superseded challenge, withdraws it and any prepared presentation.

### Preparing
- `NATIVE_READY` → Sharing: the result image is ready and native image sharing is available.
- `TEXT_REQUIRED` → Copying: native image sharing is unavailable, so offers the equivalent letter-free text result.
- `FAILED` → Available: reports the failure and permits retry without changing the game or its result.
- `daily-word.CHALLENGE_REPLACED` → Unavailable: discards preparation for the superseded challenge; a late completion cannot restore it or trigger sharing or copying.

### Sharing
- `SHARED` → Available: reports native sharing completion without claiming delivery to a recipient.
- `CANCELLED` → Available: returns quietly without copying or downloading anything.
- `TEXT_REQUIRED` → Copying: native image sharing is unsupported, so uses the text alternative.
- `FAILED` → Available: reports the error and permits retry.
- `daily-word.CHALLENGE_REPLACED` → Unavailable: withdraws the superseded result and ignores later completion for it; an already handed-off external share cannot be revoked, and no fallback is initiated for the withdrawn result.

### Copying
- `COPIED` → Available: confirms the text was copied.
- `COPY_UNAVAILABLE` → Available: exposes the same private text for manual copying and reports that automatic copying was unavailable.
- `daily-word.CHALLENGE_REPLACED` → Unavailable: withdraws the superseded result and manual-copy presentation; a late completion cannot restore them. An external copy already handed off cannot be revoked.

## Events

### NATIVE_READY
The private result image is ready and can be offered to native image sharing.

### TEXT_REQUIRED
The current device cannot share the result as an image.

### SHARED
The native sharing operation completed.

### CANCELLED
The player dismissed native sharing.

### FAILED
Preparation or native sharing failed for a reason other than cancellation or unsupported image sharing.

### COPIED
The private text result was copied successfully.

### COPY_UNAVAILABLE
Automatic copying failed or is unavailable; the result remains available for manual copying.
