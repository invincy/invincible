---
name: github-release
description: Review, package, and release Invincible changes through GitHub pull requests safely.
---
# GitHub release
1. Read AGENTS.md and README.md; inspect existing release conventions and relevant PRs.
2. Work on a dedicated branch, preserve unrelated changes, and never expose tokens or credentials.
3. If React source changes, run npm run build and include generated react-dist assets and updated HTML loaders.
4. Execute npm run check, npm run test, relevant browser checks, and npm run build where applicable; report any checks that could not run.
5. Open a PR with affected files, compatibility impacts, test evidence, and rollback guidance.
6. Never merge, publish, deploy functions/rules, or alter production data without explicit authorization.
7. Never report that production is fixed unless its behavior was actually verified.
