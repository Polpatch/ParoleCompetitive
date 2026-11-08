---
description: Use when preparing the Italian word lists or persisting browser games, preferences and statistics.
---
# Local data

## daily-word
- Vendor a pinned snapshot from https://github.com/napolux/paroleitaliane rather than fetching a mutable branch at runtime. Record the exact upstream revision, source file, acquisition date, transformations and MIT attribution. Do not use the separately CC-BY-SA verb conjugation dataset under an MIT-only claim.
- The upstream README acknowledges partly unknown provenance. Record that limitation honestly; do not label the list official, authoritative or legally guaranteed. Do not copy code, artwork or the daily schedule from the unofficial Par🇮🇹le game.
- Produce a normalized, deduplicated allowed-guess list containing only five ASCII letters; use the candidate common-word list without proper-name lists. Review the smaller solution list to remove names, obscure/non-Italian entries, offensive terms and malformed words. Document retained forms and editorial decisions; do not replace the real list with a demonstration fixture.
- Keep source data, solution schedule version and reproducible transformation instructions in the repository. All word data required by a loaded game is available locally.

## daily-game
- Use namespaced, versioned localStorage for dated games, accepted guesses and feedback, startedAt, endedAt, status, word/schedule identity, difficulty eligibility and committed score. Also retain the current draft so a closure does not erase entered but unsubmitted letters.
- Persist each accepted guess and its terminal result as one coherent state change before visual reveal. Restoring must reconstruct keyboard knowledge, known-letter constraints and the exact next row without adding an attempt or changing time.
- Treat one browser storage origin as the device-local scope; data is not synchronized across browsers, devices or accounts. Clearing site data resets it, and private browsing may discard it.
- Reconcile competing tabs before accepting a guess; a tab with stale progress must reload the authoritative stored daily record rather than silently append a second outcome. Use a serialized write strategy for supported target browsers so a result cannot be counted twice.
- If storage is unavailable or malformed, show an honest Italian persistence warning and keep a playable in-memory session without claiming successful saving; do not silently clear unrelated site data. Document that daily enforcement and durable statistics require usable browser storage.

## game-preferences
- Store selected future difficulty and spoiler-free preference independently from immutable completed game results. A downgrade changes the active game eligibility and future preference together.

## statistics
- Keep outcomes keyed by challenge date and aggregate totals or derive them from that ledger. Deduplicate by date rather than by animation or component lifecycle. Keep only data needed for counts, the six-bucket win distribution, latest score and daily restoration; no ordered-history UI.

## result-share
- Build image and text from a snapshot of a won or lost result after its reveal, including challenge date, win/loss, accepted-guess count out of six and score. Do not include answer text, guess letters, keyboard labels, hidden DOM text, alt text with guesses, or solution metadata in the exported artifact.
- Reopening a completed current-day game restores sharing availability. Expired unfinished games have no share action. Sharing never changes progress, timestamps, score or totals.
