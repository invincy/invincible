# Working on Invincible

Read README.md first. Use docs/firebase-storage.md for persistence paths and docs/code-review.md for the outstanding review findings.

## Map Editor — permanent standard for every film

For **any** Map Editor or map-video task, read and follow [docs/map-editor-production-standard.md](docs/map-editor-production-standard.md) before planning, editing, importing, previewing or exporting. This applies to every project and future video, not only Panipat. It defines the existing NASA imagery/country-overlay reference, source accuracy, large typography and rounded cards, intentional camera/layer animation, audio timing, preservation of editor features and actual-video acceptance checks. Current user instructions override style defaults. Keep film-specific content in its own brief.


- Main React source is in react/src; react-dist is generated and checked in for GitHub Pages. Rebuild using npm run build; it refreshes every active HTML loader with content-hashed JS/CSS names. Keep the entry URL identical to lazy imports; do not add a query alias. Dashboard layout belongs only in dashboard.css.
- Native pages still exist. Keep shared/navigation.js as the single page/tab configuration and load site-nav.js as an ES module. Do not paste navigation lists into HTML.
- Firebase config lives in shared/firebase-config.js. React and CDN auth adapters must use the same project, default app, and persistence policy. Restore auth before protected reads; stop stale account listeners on account changes.
- Preserve existing database paths and steps/subtasks compatibility unless the task explicitly includes a data migration. Do not remove ownership checks or broaden rules to fix an access error.
- Keep one active Journal bundle. Its original source project is missing; do not assume react's build regenerates it. Review the readable Journal stroke adapter before changing persistence.
- Keep reminders/service-worker.js as a retirement endpoint until legacy installations no longer need it.
- Match verification to the risk of the change. For cosmetic V2 edits limited to `react/src/dashboard-guide.css`, `react/v2/ConstellationNav.jsx`, or `react/v2/PageIcon.jsx`, run the V2 build/stage checks, `npm run test:v2`, and `npm run test:v2:smoke`; do not wait for Firebase/editor scenarios, Firefox, the full responsive matrix, or V1 regressions. For V2 interaction or state changes, run the relevant unit tests and full V2 browser suite. For auth, persistence, shared navigation, build tooling, test infrastructure, or V1 changes, run the full repository checks. Check dynamic UI states before pruning CSS or event handlers. Add tests for meaningful behavior changes, not cosmetic edits alone.
- Record what changed, what was verified, and what remains uncertain in the existing documentation. Production Firebase permissions require a real signed-in check; fixtures and builds cannot establish them.

## Shared Antigravity / Codex project instructions

These rules belong to `invincy/invincible`. Keep project knowledge in this repository; do not copy its creative style, film content or architecture into global agent settings. No global configuration change is needed for a task here.

### Read only the context the task needs

- Creative direction: [CREATIVE_BIBLE.md](CREATIVE_BIBLE.md).
- Map editing, geography, JSON, assets or export: [MAP_EDITOR.md](MAP_EDITOR.md) and the permanent production standard linked above.
- Narration, timing, composition or video delivery: [VIDEO_PRODUCTION.md](VIDEO_PRODUCTION.md).
- Existing Creator contracts: [one video flow](docs/creator-single-flow.md) and [universal architecture](docs/creator-studio-universal.md). Older phase notes describe history; inspect current code before treating a deferred feature as unavailable.

Explicit current user instructions override creative defaults. Preserve existing safety, data and compatibility requirements. The permanent map standard remains the detailed quality authority; these companion files route work through the current implementation rather than creating a competing standard. Respect applicable nested instructions. Check the checked-out branch and actual files; do not assume another checkout's capabilities or uncommitted work are present.

### Execution boundaries

- Inspect `git status`, relevant diffs, current entry points, schema and tests before editing. Preserve unrelated tracked, untracked and staged changes, including edits within a file you touch. Do not reset, clean, switch branches or rewrite another agent's work to simplify a task.
- Creator is native JavaScript. Reuse its existing scenes, timeline, Map Editor, media library, JSON import/review, save/recovery and MP4 export. Extend common capabilities once; keep film choreography in project data. Do not migrate Creator to React as a side effect.
- Do not create duplicate editors, standalone film/demo pages, title-selected renderer modes or parallel production pipelines without explicit user approval. Existing examples are reference/test data, not permission to create another Panipat page. Never bypass this by renaming a demo a harness.
- Production browser screenshot loops, screen recording and browser-frame capture require explicit user approval after documenting the specific native-export limitation and the smallest proposed remedy. Inspect and fix the native path first when within scope. Native deterministic frame rendering is required and is not screenshot capture; browser automation may drive the real editor/exporter or verify UI.
- Keep UI concise: short action labels, useful status/errors and advanced controls in the existing disclosure areas. Keep implementation notes in documentation, not film overlays or long UI explanations. Preserve accessibility, mobile operation and existing controls.
- Make reasonable reversible choices and finish the authorized work. Ask only for missing decisions that affect correctness, approval of a prohibited alternative, or genuinely destructive/out-of-scope actions. Do not commit, push, merge, publish or deploy unless requested.

### Bounded verification and completion

Choose checks by affected behavior before running them. Documentation-only work needs source/path/link consistency and diff/whitespace review, not app rebuilds or a full browser matrix. Focused Creator/map changes need the affected unit and browser checks from MAP_EDITOR.md; shared auth, persistence, navigation, build or test-infrastructure changes still require the broader checks specified above. This is not permission to skip those checks.

Run each required check once; repeat only after a relevant fix or a diagnosed transient failure. Investigate a failure, then report an evidenced baseline/environment limitation rather than looping installs, renders or unrelated repairs. For video work, verify a short representative segment before the complete native export; do not repeatedly export the full film for minor iteration.

Before declaring completion, compare the result with the requested acceptance criteria, review the final diff/status and list changed files, checks/results, output references and any unfinished verification. A plan, JSON file, passing fixture or attractive still alone does not establish a finished video. Preserve durable project handoff data so either agent can resume without reconstructing the chat.
