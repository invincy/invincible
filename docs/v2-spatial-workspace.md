# Invincible V2: spatial prototype

Baseline: `master` at `3579614` (PR #64). Branch: `codex/invincible-v2-spatial-prototype`.
This is the initial two-region technical prototype, not the completion of all six phases.

## Run the actual application

From the repository root:

```sh
npm ci
npm ci --prefix react
npm run dev:v2
```

Open **http://localhost:5173/invincible/v2/**. Use the URL printed by Vite if that port is occupied.
Do not double-click the HTML source or build output: ES modules and the existing Firebase auth adapter require an HTTP origin.
The entry document has a dark startup screen and explicit recovery text for missing modules, slow startup or a file URL; it does not leave an empty white document.

For a production-build preview:

```sh
npm run build:v2
npm run preview:v2
```

The default preview URL is **http://localhost:4173/invincible/v2/**.
The source entry is `react/v2/index.html`; the separate Vite config emits only to ignored `v2-dist/`.
V2 does not run the V1 asset-cleaning/HTML-sync scripts or register a service worker.
No V1 generated assets, HTML loaders, routes, workers, Functions, Firebase config or rules are changed.

### Prepared same-origin preview (not published)

GitHub Pages currently publishes the root of `master` at `https://invincy.github.io/invincible/`.
`npm run stage:v2` generates a separate, checked-in `v2/` directory for a preview at `https://invincy.github.io/invincible/v2/`.
This command only builds local publishing files; it does not merge, push to master, change Pages settings or deploy.
CI rebuilds those files, checks that they match the source, and runs the V2 production smoke checks against that exact package.

On the existing origin, V2 uses the same Firebase project, default app and browser-local auth persistence as V1.
It should reuse a restored V1 session **in the same browser profile**. A session in Chrome is not automatically available in the Codex in-app browser, even on the same URL.
Publishing requires separate approval because merging this PR into the Pages source branch would deploy the new route.
No additional Firebase domain authorization is expected for this existing hostname; actual signed-in session reuse remains to be verified after approved publication.

Authentication uses the existing `AuthProvider`, default Firebase app and persistence policy, which in turn use `shared/firebase-config.js` for `life-by-adichimp`.
Localhost has its own browser session, separate from the production origin; using the same Firebase project does not transfer a Google session across origins.
No new credential or project is needed. If Firebase reports an unauthorized preview domain, obtain approval for that specific domain before changing its authorization. No domain change was made here.

## What works

- Main Dashboard immediately followed by My Workspace in a real horizontal overflow canvas.
- Free stopping at arbitrary offsets; adjacent regions remain visible together. No CSS scroll snap or page-switch animation.
- Native horizontal trackpad/wheel and touch input, scrollbar, direct navigation, keyboard arrows/Home/End on the canvas.
- `#dashboard` and `#workspace` direct links, browser back/forward and exact fractional-position restoration within history; viewport resizing preserves that position.
- Independent vertical region scrolling. Lazy region chunks mount when their region is visible or within a 20% viewport margin. Region shells retain their position; shared data, timer and inspector selection live above transient content. With only two adjacent regions, both may be nearby and mounted together.
- One existing, unchanged `FocusOrb` renderer: prominent in the Dashboard, compact in the reserved header space elsewhere. Cyan/gold/emerald, hover/drag/inertia, reduced motion and cleanup remain in the existing component.
- Read-only task lanes for Backlog/In Progress/Today/Completed, active mission, next action, saved working notes inspector and a step-based project journey.
- My Workspace uses the same task summary, journey and timer state through a small widget registry; it does not copy business records.
- The V2 timer uses a deadline and account-scoped session storage. It survives region navigation and reload, without marking any task complete or recording a business-data write. It is not synchronized with V1's timer.
- Startup/auth/loading/empty/error/cached-data states, retry, sign-out cleanup and account-keyed component lifetime.

The writable `DashboardPage` is not mounted in the read-only prototype: its `useTodayPlan` seeds a daily plan and other effects write records. The V2 presentation reuses its authoritative task/step/progress model and existing Orb instead. Its read-only daily-plan resolver mirrors the existing active-item rule, without falling back to fabricated task-status focus after a plan is loaded. Full reuse of writable Dashboard controls awaits the stability work below.

## Data and safety boundary

The only business reads are:
- `users/{uid}/tasks`
- `users/{uid}/dailyPlans/{local-date}`

Reads begin only after the existing AuthProvider restores a user. Listeners unsubscribe and ignore late callbacks when disposed; changing UID replaces the whole signed-in subtree. Listener failures clear the affected records. Retry reconnects both sources. The local date is checked on focus and every 15 seconds for daily-plan rollover.

There are no V2 Firestore writes, seed transactions, callable requests, migrated IDs or copied production records.
No editable business form is exposed. Resume Work opens saved notes in an in-place read-only inspector.
Layout editing and layout persistence are not implemented; no layout records are mixed with tasks.
Orb theme reuses the existing local preference key. Timer state stores only duration/deadline, under a separate per-account V2 key.

## Foundation stability audit: unresolved on this baseline

| Risk | Source evidence | Gate before enabling V2 writes |
| --- | --- | --- |
| Creator concurrent overwrites | `creator/project.js` saves whole project fields/scene arrays with `setDoc`; local drafts do not perform revision conflict checks | Revision-aware transactions and explicit conflict handling |
| Workday lost updates | `react/src/WorkdayPage.jsx` persists whole arrays and performs automatic carry-forward writes | Operation-based transactions against latest server state |
| Task drafts lost after reload | `react/src/TaskPage.jsx` keeps pending edits in refs; Dashboard NewTask keeps form state in memory | Durable account/document drafts, retry and conflict recovery |
| Timer reset across V1 navigation | `react/src/DashboardPage.jsx` owns seconds/running in component state | Shared timer service and a deliberate V1/V2 session contract |
| Dashboard/AI focus mismatch | Dashboard follows dailyPlans; status-based AI tool focus remains documented in `docs/code-review.md` | One shared active-focus resolver across client and tools |
| Legacy step-field truncation | `stepFields` preserves fields in steps but maps the legacy subtasks mirror down to text/done | Lossless compatibility and round-trip tests before any write/migration |

V2's read-only boundary avoids these writes; it does **not** fix or close these existing findings.

## Verification (2026-10-13)

- `npm run test`: 19 frontend/domain tests (including six V2 regressions) and eight backend tests passed.
- `npm run build:v2` and `npm run check`: passed. V2 startup includes the existing Firebase SDK, approximately 591 KB before gzip / 155 KB gzip; Vite reports the large-entry advisory. Region chunks load separately.
- V1 `npm run build` and `npm run check`: passed in an isolated scratch copy so the working branch's V1 generated assets and HTML loaders remain byte-for-byte unchanged.
- V2 browser integration: Chromium and Firefox passed horizontal wheel scrolling, free 43% stopping, simultaneous adjacent regions, resize preservation, direct navigation, keyboard focus, back/forward/reload, shared timer/reload, live read updates, read-only notes, error/retry, account switching, sign-out, single Orb canvas and actual production-bundle anonymous auth startup.
- Responsive coverage: 320×640, 393×852, 768×1024, 1024×768 and 1440×900. Captured and inspected phone, desktop and between-region screenshots.
- Chromium simulated touch swipe passed. This is not physical-device testing.
- Existing Garage, native navigation, Dashboard/reminders (14 viewports), Orb and Task copy browser suites passed. The Orb harness needed Windows path normalization; one concurrent-run cadence assertion measured 24 frames against a 25-frame lower bound, then the isolated rerun passed unchanged assertions.
- Existing Orb regression covers 18 fixed-time renders, palettes, particle tiers, motion, drag/inertia, context loss/restore, DPR/resize, visibility pauses and GPU cleanup.
- Test fixtures use controlled records and **never production data**. Signed-in production Firebase permissions, real Google session reuse, Safari/iPad, actual-device animation/power behavior and cross-device data synchronization are unverified.
- Existing locked React/Functions dependencies report audit findings; no unrelated dependency migration or backend change was attempted. Functions tests ran under local Node 24, while deployment targets Node 22.

The first remote Node 22 run passed unit/backend, build, reference and V2 Chromium/Firefox checks. The existing Orb regression failed because the CI runner reported a low-capability tier while the test expected the desktop tier. Its desktop fixture now explicitly supplies 8 cores/8 GB; the separate 4-core/4-GB fixture continues to verify the lower tier. Production Orb code and particle budgets are unchanged.

Cadence assertions now check the requested 24/40/30 fps scheduling delays, ongoing rendering and upper frame-count bounds, rather than requiring a minimum achieved frame rate from the test machine. Local execution of the updated Orb regression and both browser engines against the exact `v2/` publishing package passed. Rendering throughput and battery use still require real-device verification.

Reproduce:

```sh
npm ci
npm ci --prefix react
npm ci --prefix functions
npx playwright install chromium firefox
npm run test
npm run build:v2
npm run check
npm run test:v2:browser
```

For the older browser suites on Windows, set `CHROMIUM_EXECUTABLE` to the installed Playwright Chromium executable before `npm run test:browser`.

## Remaining phases

1. Resolve shared persistence risks and verify authenticated production access before allowing V2 business writes.
2. Extract shared Dashboard controls behind stable state services; retain all V1 functionality.
3. Workspace editor: drag handles, keyboard reorder, responsive positions, resize, compact/standard/expanded views, minimize/remove, restore defaults and separate layout persistence.
4. Integrate dedicated React module regions incrementally, then native modules. Do not mount every heavy module at once.
5. Preserve Journal's functioning bundle until source/parity is recovered, and preserve Portfolio's external Apps Script integration.
6. Add AI/Orb access and project resumption only through the existing authorized backend; no new API keys.
7. Physical-device, Safari, signed-in integration and performance verification.

No production deployment, merge, rules change, account-data deletion or replacement backend is included.
