---
description: Use when creating the frontend, repository, automated checks or GitHub Pages release.
---
# Static platform

## General
- TypeScript with strict type checking, Vite, DOM APIs and CSS; no React or other UI framework. Keep pure word evaluation, score calculation and day selection separate from DOM effects without introducing a second state store or unnecessary abstractions.
- Use npm and a committed lockfile. Use Vitest for deterministic rule tests and Playwright for an actual built-site browser smoke. Choose mutually compatible stable versions and record the Node.js LTS version used by both local tooling and CI.
- Initialize Git in this folder and automatically create a public GitHub repository named ParoleCompetitive under the authenticated GitHub CLI account. Install GitHub CLI if absent and require authorized authentication rather than fake credentials. The initial checkout is not a Git repository and gh is absent from PATH.
- Do not overwrite an existing remote repository or an unexpected existing checkout. A name collision, missing authorized GitHub identity, missing permissions or unavailable Pages provisioning must produce an explicit actionable blocker, not a made-up repository, URL or successful deployment claim.
- Main branch is main. Commit the project and lockfile and connect origin to the actual created repository. Keep generated output, secrets, node_modules and local agent runtime state out of version control; retain the project's intended Weaver definitions according to its workflow.
- GitHub Actions runs on pull requests and main pushes: install from lockfile, type-check, deterministic tests, production build, built-site browser smoke. Deploy the verified build automatically only from main with official Pages artifact/deploy actions, GitHub environment and least-privilege permissions. No third-party deployment token or application secret is needed.
- Configure the Pages project-site base path for ParoleCompetitive, including assets and any result links. Verify by serving the production build under that prefix; no server-side route rewrites. Configure the repository's Pages build source and environment as part of provisioning when permissions allow.
- No Terraform, Bicep, serverless functions, database service or other cloud infrastructure. GitHub workflow files are the only release automation infrastructure needed.
- Maintain English project documentation for local prerequisites, install/run/check/build, source list provenance and license caveat, deterministic daily schedule, exact score, hard/standard behavior, browser storage limitations, native-sharing fallback, GitHub provisioning and Pages release. Include a short changelog for the delivered initial application. Document executable verification commands and accurately describe the coverage present in the checked-in test suite.
