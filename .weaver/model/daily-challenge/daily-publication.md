# Daily publication

Publication of the common challenge for the current day. The first fixed assignment is immutable, including across failed publication, recovery and code releases. Earlier assignments survive day changes; future challenges are not published.

## States

### Awaiting publication (initial)
- `automation.PUBLICATION_REQUESTED` → Publishing: fixes the current day's assignment once, or reuses its already fixed assignment; never replaces an existing assignment.
- `calendar.DAY_CHANGED` → Awaiting publication: awaits publication for the new day without altering earlier assignments.

### Publishing
- `automation.PUBLICATION_SUCCEEDED` → Published: only for the current day's active publication attempt; makes that day's fixed challenge available to compatible players.
- `automation.PUBLICATION_FAILED` → Publication failed: when no publication for the current day has succeeded; retains any fixed assignment for recovery.
- `automation.PUBLICATION_FAILED` → Published: when the current day's challenge was already published; retains that same published challenge.
- `automation.PUBLICATION_REQUESTED` → Publishing: serializes requests and reuses the same fixed assignment; no duplicate draw occurs.
- `calendar.DAY_CHANGED` → Awaiting publication: keeps earlier fixed assignments but prevents an obsolete completion from publishing the preceding day as current.

### Published
- `automation.PUBLICATION_REQUESTED` → Publishing: republishes the same challenge, including with a verified code release; never draws again.
- `calendar.DAY_CHANGED` → Awaiting publication: retains the preceding day's assignment without offering it as the new day's challenge.

### Publication failed
- `automation.PUBLICATION_REQUESTED` → Publishing: retries only after another authorized request, reusing any fixed assignment.
- `calendar.DAY_CHANGED` → Awaiting publication: no loss or invented challenge is created for an unpublished day.
