# ParoleCompetitive

A browser-based daily Italian word puzzle. This is not an official dictionary or an official Wordle product. All game data stays in the browser; there is no account, backend, online leaderboard, analytics, or cross-device sync.

## Development

Use Node.js 24 LTS (the exact development and CI version is in `.nvmrc`) and npm. From the project root:

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run smoke
```

The Playwright smoke runs against the production build through Vite preview at `/ParoleCompetitive/`; run the build first. `npm run preview` serves the build locally. The Vite base path is the GitHub Pages project-site prefix; assets and links must retain it.

## Daily challenge and rules

The day is the Gregorian calendar date in `Europe/Rome`, including daylight saving time, regardless of the device time zone. The frozen v1 schedule uses 2026-01-01 as its epoch; the integer calendar-day difference, modulo the length of the ordered v1 solution list using a nonnegative remainder, is the zero-based solution index. No network or randomness is used. Earlier assignments must remain unchanged when schedules are extended. See [word data](data/README.md) for the pinned revision, license, transformation, editorial decisions and provenance limitations. The upstream list has partly unknown provenance; its MIT attribution is not a guarantee of the provenance of every word. Separately licensed verb conjugations are excluded.

Each game allows six five-letter ASCII guesses. Exact matches consume letters first; misplaced matches consume remaining occurrences left to right. The keyboard retains the strongest evidence, and letters shown to be entirely absent cannot be used again. In hard mode, greens remain fixed, yellow letters must occur outside their previously excluded positions, and each revealed letter must appear at least as many times as the highest positive count in any one prior row. A game may be downgraded from hard to standard after starting, but it cannot switch back and loses the hard bonus; before the first accepted guess either choice is allowed.
The Italian interface includes an on-screen keyboard and physical keyboard input, a rules guide, settings and local statistics. A submitted row is revealed before further input is accepted; reduced-motion settings remove the flip animation without shortening that interval. Difficulty and spoiler-free sharing can be selected in Settings; spoiler-free changes only later shares.

For each accepted row let G and Y be its green and yellow counts; compare each with the immediately preceding row, initially zero: ΔG=max(0,G−previous G), ΔY=max(0,Y−previous Y). If either delta is positive, set consecutive stagnation s to zero; otherwise increment s from zero. The base is `B = 1000 + Σ(100·ΔG + 40·ΔY − 50·max(0,s−1))`. For a win in n guesses, with elapsed seconds t from the first accepted submission to the terminal submission, `score = round(max(0,B)/(n·(1+t/60))·m)`, where m is 1.10 only for a game started hard and never downgraded, otherwise 1. Losses and started expiries score zero. Time includes time away; the first accepted correct guess has t=0.

## Storage and sharing

Games, preferences and date-deduplicated outcomes are stored locally in versioned browser storage. Statistics show wins, losses, the six win buckets and the latest score; they are not an online ranking. Clearing site data, private browsing, unavailable storage, or switching browser/device can lose or isolate progress. The local clock and stored results are trusted and are not tamper-proof. If storage is unavailable, persistence and daily enforcement cannot be guaranteed.

Result sharing uses a dedicated Canvas image without answer or guess letters. Spoiler-free sharing also conceals the first row's feedback. Native file sharing is capability-detected; where unavailable the text fallback uses clipboard or manual copy. Cancellation does not trigger copying or an automatic download.

The dedicated sharing browser checks run with `npx playwright test --config share.playwright.config.ts`; they inspect pixels decoded from the actual PNG and exercise preparation retry. Native share behavior depends on the browser and device: headless Chromium left the native operation pending, so native panel completion and delivery were not verified there.

## GitHub Pages

Install the [GitHub CLI](https://cli.github.com/) and authenticate an authorized account with `gh auth login`; confirm with `gh auth status`. For a new installation, ensure the project is not an unexpected existing checkout and the account has no repository with the same name. Initialize `main`, commit the project and lockfile, and use `gh repo create ParoleCompetitive --public --source=. --remote=origin` without overwriting an existing repository. Configure the repository's Pages build source as GitHub Actions, for example with `gh api --method POST repos/OWNER/ParoleCompetitive/pages -f build_type=workflow` when Pages is not yet enabled. Replace OWNER with the authenticated account; a name collision or missing permission requires resolution, not a fabricated remote.

Push `main` after committing the complete project. Pull requests run installation, type checking, deterministic tests, build and the browser smoke without deployment. Successful main pushes upload the verified build and deploy with the official Pages actions and `github-pages` environment; repository Pages and Actions permissions must permit this. No external deployment token is required. Inspect the Actions run and the repository's Pages settings for the actual release status and URL.
