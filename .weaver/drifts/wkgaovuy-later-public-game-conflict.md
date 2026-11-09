---
status: proposal-accepted
refs:
- daily-word
- daily-game
origin: krnznzec
proposal: q7nfx6px
job: p7csgf06
created: 2026-11-08T22:39:16.130Z
decided: 2026-11-08T23:32:44.167Z
---
# Later public game conflict

## What happens

A saved public-calendar game after the activation date prevents a valid acquired challenge for that same date from starting. When discovered on a later date, an unfinished public game is retained without ordinary expiry.

## What should happen

A valid acquired challenge must be playable, unfinished preceding games must expire at the actual day boundary, and the abandoned next-day cutover must not withdraw that day's record. The Model does not say how the retained public game and acquired challenge coexist for one date or how their outcomes contribute to statistics.

## Where in the code

src/session.ts: reconcile and reconcileCutover; src/statistics.ts: deriveStatistics

## Prepared question

```json
{
  "question": {
    "id": "wkgaovuy",
    "question": "How should a later public-calendar game be handled when an acquired challenge has the same date?",
    "context": "A saved public-calendar game can occupy the date needed by the acquired challenge, and a later discovery can leave an unfinished game unexpired. The Model requires the acquired challenge but does not define how both games or their outcomes coexist.",
    "options": [
      {
        "label": "Adopt the coexistence rules",
        "description": "Keep the later public game and its result as separate historical data, expire unfinished games at the actual day boundary, and count each retained outcome once alongside the acquired challenge."
      },
      {
        "label": "Close without changes",
        "description": "Leave the Model and Requirements unchanged."
      }
    ],
    "recommended": 0,
    "multi": false
  },
  "decisions": [
    {
      "decision": "proposal"
    },
    {
      "decision": "dismissed"
    }
  ],
  "fingerprint": "sha256:4dada022ebaaf1d275fc69a724d0eaf65d3fbd24a1e902a045fa18c1b0b9be18",
  "prepared": "2026-11-08T22:43:07.568Z"
}
```
