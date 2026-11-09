---
description: Use when preparing the Italian word lists or persisting browser games, preferences and statistics.
---
# Local data

## daily-word

- Vendor the existing common and 60k sources plus `paroleitaliane/660000_parole_italiane.txt` from https://github.com/napolux/paroleitaliane at revision `2951524b6d5b67986f542937cef16a54af63ff84`. Record exact source paths, acquisition date, checksums, transformations and MIT attribution. Do not import dedicated proper-name lists, `coniugazione_verbi.txt` with its separate CC-BY-SA license, or aggregates containing those datasets under an MIT-only claim.
- Retain the upstream caveat that some provenance is unknown; the list is not official, authoritative, exhaustive or legally guaranteed. Do not copy code, artwork or a schedule from the unofficial Par🇮🇹le game.
- Build one canonical vocabulary from the union of the pinned sources and documented, reviewed local additions, including AUDIO and OZONO. Preserve every previously allowed guess. Retain only exactly five ASCII letters, uppercase, deduplicate and sort reproducibly. Do not strip accents, transliterate or add input-specific bypasses. Record the additions' provenance and editorial decisions.
- Use exactly this vocabulary as both the allowed-guess set and the complete eligible-solution set for the new schedule. No smaller common-word solution subset remains active. Italian inflections, rare words, Italian-use loanwords and vulgar or offensive Italian terms are eligible for both uses. Reject malformed and non-Italian entries and exclusively proper names; a normal Italian meaning is sufficient even when also used as a name. Do not use initial capitalization alone as evidence of a proper name.
- Generate and freeze a deterministic permutation containing every canonical entry exactly once. Record its schedule identity, activation Rome date, algorithm, fixed seed and reproducible output fingerprint. Bundle only the normalized vocabulary and frozen schedule needed at runtime; retain original source snapshots, additions, provenance, generation instructions and the historical v1 solution order in the repository. Loaded gameplay requires no source fetch.
- Keep the complete v1 epoch, algorithm, ordering and identity for dates before activation. Activate the new schedule on the explicit Europe/Rome date of its introducing release, including replacement of that day's old challenge; never derive a new activation date or seed when opening or rebuilding. Later rebuilds retain that date and order and cannot repeat the cutover.

## daily-game
- Use namespaced, versioned localStorage for dated games, accepted guesses and feedback, startedAt, endedAt, status, word/schedule identity, difficulty eligibility and committed score. Also retain the current draft so a closure does not erase entered but unsubmitted letters.
- Persist each accepted guess and its terminal result as one coherent state change before visual reveal. Restoring must reconstruct keyboard knowledge, known-letter constraints and the exact next row without adding an attempt or changing time.
- Treat one browser storage origin as the device-local scope; data is not synchronized across browsers, devices or accounts. Clearing site data resets it, and private browsing may discard it.
- Reconcile competing tabs before accepting a guess; a tab with stale progress must reload the authoritative stored daily record rather than silently append a second outcome. Use a serialized write strategy for supported target browsers so a result cannot be counted twice.
- If storage is unavailable or malformed, show an honest Italian persistence warning and keep a playable in-memory session without claiming successful saving; do not silently clear unrelated site data. Document that daily enforcement and durable statistics require usable browser storage.
- Reconcile the vocabulary cutover before restoring, expiring or accepting a game. Replace only the activation date's old-schedule record with a fresh new-schedule game when that date is current: no draft, accepted rows, feedback, startedAt, endedAt, terminal result or score survive. Use the retained player preferences for the new game. Other dates' complete records and preferences remain unchanged.
- Persist a stable cutover identity/completion marker with the affected game change, under the existing serialized reconciliation discipline. Distinguish old and new challenges by schedule identity, even if their solution text happens to match. Reopening, rebuilds, repeated reconciliation and competing tabs must not erase the replacement game's progress or result, or resurrect a stale old-schedule activation-day record.
- If the cutover is first discovered after its activation date, withdraw only that date's superseded record/result before ordinary expiry reconciliation. Do not create an unplayed replacement game for that past date, invent a loss for the withdrawal, or alter intervening dates. Retain old dictionaries/schedule compatibility needed to read earlier saved games; the expanded allowed set remains a superset of the old set.

## game-preferences
- Store selected future difficulty and spoiler-free preference independently from immutable completed game results. A downgrade changes the active game eligibility and future preference together.

## statistics
- Keep outcomes keyed by challenge date and aggregate totals or derive them from that ledger. Deduplicate by date rather than by animation or component lifecycle. Keep only data needed for counts, the six-bucket win distribution, latest score and daily restoration; no ordered-history UI.
- Withdrawal removes only the superseded activation-day game's contribution. Derive totals, histogram and latest score from the surviving games rather than clearing all statistics. No separate negative result is recorded. A replacement game's eventual result is counted once; delayed old-challenge outcomes cannot be reintroduced.

## result-share
- Build image and text from a snapshot of a won or lost result after its reveal, including challenge date, win/loss, accepted-guess count out of six and score. Do not include answer text, guess letters, keyboard labels, hidden DOM text, alt text with guesses, or solution metadata in the exported artifact.
- Reopening a completed current-day game restores sharing availability. Expired unfinished games have no share action. Sharing never changes progress, timestamps, score or totals.
- Tie prepared images, text and manual-copy content to the current challenge identity, not date alone. Invalidate only presentations belonging to the withdrawn challenge; late preparation or share/copy completion cannot restore its availability or trigger a new fallback. Already handed-off external shares or copies cannot be revoked.

## game-appearance
- Persist the selected appearance as system, light or dark in the existing versioned device-local session preferences, independently of difficulty, spoiler-free choice and completed outcomes. Persist the selection rather than the currently resolved system color scheme; remember it across reloads and challenge days.
- Read otherwise-valid older sessions without an appearance preference as system. Preserve their saved games, draft, difficulty, spoiler-free preference, timestamps, scores and statistics; adding the preference must not reject or reset such sessions or introduce a second runtime preference store.
- If persistence cannot be used, apply appearance choices in memory while keeping the existing honest Italian saving warning. Do not claim that the choice will survive a reload and do not clear unrelated site data. Keep the existing malformed-session failure policy for other invalid session data.
