---
status: proposal-accepted
refs:
- requirements/tech#General
- requirements/quality#result-share
proposal: kqrvnh04
job: j9vpx32d
created: 2026-11-08T15:07:25.547Z
decided: 2026-11-08T16:46:33.197Z
---
# README names removed sharing test

## What happens

The documentation directs maintainers to run `npx playwright test --config share.playwright.config.ts` and says that command inspects the exported PNG and retries preparation, but that config and `tests-browser/share.spec.ts` were removed. Following the documented command fails, and the claimed pixel-test coverage is not part of the checked-in suite.

## What should happen

Project documentation must give executable verification commands, and result-sharing reliability requires verification of the actual letter-free export and fallback behavior. The documented command and coverage must match what the repository can run.

## Fix options

### Integrate pixel verification into the normal smoke suite

Restore the actual PNG pixel and retry checks as a Playwright spec under the existing `e2e/` test directory, include it in `npm run smoke`, and keep the README command aligned with that suite. This retains reproducible browser coverage and adds a small amount of smoke time.

### Document only the checked-in checks

Remove the obsolete separate-config command and pixel-test claim, document the actual `npm test` and `npm run smoke` commands, and state precisely which share behaviors those current tests exercise. This avoids promising a removed test, but keeps verification limited to the coverage the repository retains.

## Where in the code

README.md, sharing verification instructions

## Prepared question

```json
{
  "question": {
    "id": "ei1w2l27",
    "question": "How should the documented sharing checks match the available browser-test coverage?",
    "context": "The README names a removed Playwright configuration and claims PNG pixel inspection and preparation-retry coverage. The checked-in browser suite instead contains site, interface, and statistics specs; existing sharing unit tests and source implement result preparation and fallback behavior.",
    "options": [
      {
        "label": "Integrate pixel verification",
        "description": "Restore pixel and preparation-retry checks in the normal smoke suite and align the README command."
      },
      {
        "label": "Document checked-in checks",
        "description": "Remove the obsolete command and unsupported claims; document executable tests and actual checked-in coverage."
      },
      {
        "label": "Keep current sharing behavior",
        "description": "Document the present implementation: result preparation and retry behavior, with current automated coverage accurately stated."
      }
    ],
    "recommended": 2,
    "multi": false
  },
  "decisions": [
    {
      "decision": "fix-code",
      "option": 1
    },
    {
      "decision": "fix-code",
      "option": 2
    },
    {
      "decision": "proposal"
    }
  ],
  "fingerprint": "sha256:e00f8362ce33fdae101a95af92677f1e2eb497b30062e0bbdefd61cd201798b0",
  "prepared": "2026-11-08T15:13:52.587Z"
}
```
