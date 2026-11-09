---
status: proposal-accepted
refs:
- requirements/rules#daily-word
- requirements/rules#daily-publication
- requirements/tech#daily-publication
origin: eekji9l7
proposal: o252al5s
job: hfrbgnvj
created: 2026-11-09T12:03:34.156Z
decided: 2026-11-09T12:15:26.184Z
---
# Missed activation date

## What happens

The authorized production publication has a fixed selection for 2026-11-09, but no durable secret assignment was fixed or published for 2026-11-08. Publication refuses to create a record for a date other than the current Rome date.

## What should happen

The Task requires the public challenge to be replaced on 2026-11-08, while the rules forbid backfilling a missed date. That day has passed, so neither the required real-world replacement nor a compliant retrospective assignment can now be performed. The documented activation must not be presented as a production event that happened on that date.

## Where in the code

scripts/publish-daily.mjs (publish and assertPromotion); .github/workflows/pages.yml (record and deploy jobs); durable daily-data branch

## Prepared question

```json
{
  "question": {
    "id": "sbvwtjdq",
    "question": "How should the missed 2026-11-08 activation be represented?",
    "context": "The required activation date passed without a durable assignment. Current-day-only publication cannot create a retrospective record, and the current 2026-11-09 assignment is already fixed.",
    "options": [
      {
        "label": "Adopt missed activation policy",
        "description": "Acknowledge the missed date and retain current-day-only publication."
      },
      {
        "label": "Close without changes",
        "description": "Leave the activation requirements unchanged."
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
  "fingerprint": "sha256:c2f38c92dd5a196ad0efa982fccc0606f3e5460bf9dda4ef29604e9c8c0ce7cf",
  "prepared": "2026-11-09T12:11:02.320Z"
}
```
