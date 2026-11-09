---
status: discarded
kind: change
base:
  model/daily-challenge/daily-word.md: 65fd910b7cf44a010a9828245ec468760b4288f2752c9c263840abccc2a22517
  requirements/data/local-data.md: 5d87601f06b506a8fa29c7c678f7ea86ef83b5ce174bb700aa93594df5a165de
created: 2026-11-08T22:39:10.136Z
label: Daily game
job: p7csgf06
---
# Later public game coexistence

A public-calendar game saved after activation can share a date with the newly acquired challenge. The current Model preserves the later record while requiring the acquired challenge, but does not determine how both are retained and counted.

Proposed decisions for review:
- Retain the later public game and its already recorded result as historical data; do not perform a second cutover or erase it.
- Keep that historical game distinct from the acquired challenge for the same date, so the acquired challenge can be played and restored.
- Apply ordinary expiry to a later public game that was started but unfinished when its actual day ended; retain an unstarted expiry without a loss. Count each retained historical outcome once, independently of the acquired challenge.
