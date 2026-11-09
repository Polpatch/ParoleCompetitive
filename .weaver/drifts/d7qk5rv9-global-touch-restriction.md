---
status: fixed
refs:
- requirements/ui#daily-game
task: w3fqu4q7
option: 1
job: aljzeog8
created: 2026-11-09T12:47:31.687Z
decided: 2026-11-09T15:06:53.949Z
---
# Global touch restriction

## What happens

The game page applies `touch-action: manipulation` globally, restricting gestures outside embedded keys as well as on them.

## What should happen

The interface requirement limits selection and touch-callout suppression to embedded keys and explicitly says not to disable page gestures for that purpose; other page content and gestures must remain unaffected.

## Fix options

### Remove global touch rule

Remove the page-wide touch-action restriction and retain only the embedded-key selection and callout rules. This preserves browser gestures across the page.

### Scope to embedded keys

Apply touch-action behavior only to embedded keyboard controls while leaving the rest of the page with browser-default gestures.

## Where in the code

src/style.css: global html touch-action rule
