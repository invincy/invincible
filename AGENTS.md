# Working on Invincible

Read README.md first. Use docs/firebase-storage.md for persistence paths and docs/code-review.md for the outstanding review findings.

- Main React source is in react/src; react-dist is generated and checked in for GitHub Pages. Rebuild using npm run build; it refreshes every active HTML loader with content-hashed JS/CSS names. Keep the entry URL identical to lazy imports; do not add a query alias. Dashboard layout belongs only in dashboard.css.
- Native pages still exist. Keep shared/navigation.js as the single page/tab configuration and load site-nav.js as an ES module. Do not paste navigation lists into HTML.
- Firebase config lives in shared/firebase-config.js. React and CDN auth adapters must use the same project, default app, and persistence policy. Restore auth before protected reads; stop stale account listeners on account changes.
- Preserve existing database paths and steps/subtasks compatibility unless the task explicitly includes a data migration. Do not remove ownership checks or broaden rules to fix an access error.
- Keep one active Journal bundle. Its original source project is missing; do not assume react's build regenerates it. Review the readable Journal stroke adapter before changing persistence.
- Keep reminders/service-worker.js as a retirement endpoint until legacy installations no longer need it.
- Match verification to the risk of the change. For cosmetic V2 edits limited to `react/src/dashboard-guide.css`, `react/v2/ConstellationNav.jsx`, or `react/v2/PageIcon.jsx`, run the V2 build/stage checks, `npm run test:v2`, and `npm run test:v2:smoke`; do not wait for Firebase/editor scenarios, Firefox, the full responsive matrix, or V1 regressions. For V2 interaction or state changes, run the relevant unit tests and full V2 browser suite. For auth, persistence, shared navigation, build tooling, test infrastructure, or V1 changes, run the full repository checks. Check dynamic UI states before pruning CSS or event handlers. Add tests for meaningful behavior changes, not cosmetic edits alone.
- Record what changed, what was verified, and what remains uncertain in the existing documentation. Production Firebase permissions require a real signed-in check; fixtures and builds cannot establish them.
