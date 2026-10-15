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

### Published same-origin preview

GitHub Pages currently publishes the root of `master` at `https://invincy.github.io/invincible/`.
`npm run stage:v2` generates a separate, checked-in `v2/` directory for a preview at `https://invincy.github.io/invincible/v2/`.
This command only builds local publishing files; it does not merge, push to master, change Pages settings or deploy.
CI rebuilds those files, checks that they match the source, and runs the V2 production smoke checks against that exact package.

On the existing origin, V2 uses the same Firebase project, default app and browser-local auth persistence as V1.
It should reuse a restored V1 session **in the same browser profile**. A session in Chrome is not automatically available in the Codex in-app browser, even on the same URL.
PR #65 was merged after explicit publication approval and deployed at the existing `/invincible/v2/` route. The user's subsequent signed-in screenshot confirms the connected Dashboard renders on that origin. Automated checks still use controlled records, not the user's account.
No Firebase domain authorization was changed.

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
- Task lanes for Backlog/In Progress/Today/Completed with saved drag/drop and Move-menu actions, active mission, next action, saved working notes inspector and a step-based project journey.
- My Workspace uses the same task summary, journey and timer state through a small widget registry; it does not copy business records.
- The V2 timer uses a deadline and account-scoped session storage. It survives region navigation and reload, without marking any task complete or recording a business-data write. It is not synchronized with V1's timer.
- Startup/auth/loading/empty/error/cached-data states, retry, sign-out cleanup and account-keyed component lifetime.

The writable `DashboardPage` is not mounted in V2: its `useTodayPlan` seeds a daily plan and other effects write records. The V2 presentation reuses its authoritative task/step/progress model and existing Orb instead. Its daily-plan resolver mirrors the existing active-item rule, without falling back to fabricated task-status focus after a plan is loaded. Only explicit Kanban moves write records through the separate `move-task.js` action; mounting V2 still performs no business writes.

## Data and safety boundary

The only business reads are:
- `users/{uid}/tasks`
- `users/{uid}/dailyPlans/{local-date}`

Reads begin only after the existing AuthProvider restores a user. Listeners unsubscribe and ignore late callbacks when disposed; changing UID replaces the whole signed-in subtree. Listener failures clear the affected records. Retry reconnects both sources. The local date is checked on focus and every 15 seconds for daily-plan rollover.

Explicit Kanban moves transactionally update `status` and `updatedAt` on the existing task. Moving into Today also merges the current local day's plan, preserving existing items and activating the next unfinished step (or the task when no step is available). A missing task is rejected rather than recreated. Other lane moves leave plan items and task steps intact, matching V1's lane semantics. There are no automatic seed writes, callable requests, migrated IDs or copied production records.
The in-place project editor now supports explicit title, description, notes, parent-step and substep saves. The plan importer previews structured text before creating or appending. Draft recovery, content-conflict checks and idempotent append/create transactions are described below.
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

The initial V2 read-only boundary avoided these writes. Current V2 task editing adds durable account-scoped drafts, explicit save/retry, transactional content-conflict checks and a child-data map compatible with legacy parent-array writers. The legacy step mirror retains its existing extra fields during V2 edits. These targeted changes do not close the broader V1/Creator/Workday findings above. Completed projects are excluded from V2's active focus even when their saved step reference is unfinished.

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

The initial publication was approved separately. Rules, account data and the backend remain unchanged.

## Dashboard proportions correction (2026-10-13)

The initial mission section and stacked timer/journey cards placed the Kanban below the first screen. The Dashboard now places its compact timer beside the mission and Orb, with a slim journey progress strip. At desktop heights of 700px or less, timer and journey share the right column. Phones place the timer in a single row and prioritize the board before the journey. Long mission, action and card text is clamped; full task content remains available in the inspector. The new View milestones action opens that same inspector. My Workspace retains its expanded widgets.

All layout changes are scoped to V2 in `react/src/dashboard.css`. Verification passed: 19 frontend/domain and eight backend tests, site-reference check, V2 publishing build, isolated V1 build/check, and existing Dashboard/reminders browser checks over 14 viewports. V2 Chromium and Firefox checks cover 320×640, 393×852, 768×1024, 1024×768, 1280×600, 1366×768, 1500×674, 1870×842 and 1440×900, including long titles. They assert the full first card in all four desktop lanes is visible before scrolling; larger phones show the first two cards, while the smallest phone shows headings and the start of each card. Navigation, touch, timer, milestone inspection and account isolation still pass. Screenshots were inspected. Actual account contents and physical devices were not manipulated or retested.

## Coherent Spatial Workspace Redesign (2026-10-14)

Redesigned the frontend composition and visual hierarchy across both Main Dashboard and My Workspace into a unified, polished spatial environment:

1. **Integrated Cockpit Composition**:
   - Replaced disjointed cards with a harmonious 3-column cockpit:
     - **Left Column**: Active Mission card with clean daily plan context, next action badge, direct "Resume work ↗" trigger, and integrated Project Journey with a compact progress track and "View milestones" inspector trigger.
     - **Center Column**: Dedicated Focus Orb stage (`.v2-orb-stage`) with subtle aperture ring, centered 3D living Orb, and an interactive theme switcher (`◐ theme · change theme`) responsive to column width.
     - **Right Column**: Compact Focus Session timer with status indicator dot, crisp high-contrast golden tabular numerals (`24:59`), and accessible Start/Pause and Reset controls.
2. **First-Screen Kanban Board**:
   - Four distinct lanes (`Backlog`, `In progress`, `Today`, `Completed`) with status badges and restrained status color accents (cyan, gold, emerald).
   - High data-density task cards with progress tracks, step counters, and clean typography.
   - All 4 lane headers and top task cards remain visible simultaneously without scrolling the outer canvas across standard 16:9/16:10 displays (1440×900, 1920×1080, 2560×1440) as well as constrained laptop viewports (1280×600, 1366×768, 1500×674).
   - Long task lists scroll independently within `.v2-lane-cards`.
3. **Dedicated Mobile & Tablet Compositions**:
   - **Mobile (≤ 600px)**: Active mission and compact Orb anchor share row 1 side-by-side, followed by a streamlined full-width timer bar in row 2, and 2-column Kanban lanes in rows 3-4 so task cards are reachable before scrolling.
   - **Tablet (601px - 1000px)**: 2-column header adapting mission/journey and Orb alongside a horizontal timer strip and 4-column board.
4. **Coherent My Workspace Region**:
   - Consistent visual architecture, typography, and card treatments with Main Dashboard.
   - Detailed milestone roadmap with step-by-step progress, completion statuses, and expandable task details.
   - Pipeline overview showing task distributions across all four workflow stages with status badges.
   - Shared timer state and real-time synchronization between regions.
5. **Verification**:
   - Passed all 19 domain and 8 cloud function unit tests (`npm run test`).
   - Passed full browser suite (`npm run test:v2:browser`) in Chromium and Firefox across 9 viewports (320×640, 393×852, 768×1024, 1024×768, 1280×600, 1366×768, 1500×674, 1870×842, 1440×900).
   - Verified free horizontal stopping, region seam alignment, history restoration, keyboard navigation, and production auth gate.

## Orb-as-guide focus scene (2026-10-14, review branch)

This branch replaces the cockpit described immediately above. Main Dashboard now shows one mission, its next saved action, project progress, a focus timer and a direct route to My Workspace as separate foreground fragments around the existing interactive Orb. The Orb is one fixed renderer aligned with a responsive anchor and remains draggable; horizontal wheel input over it still moves the continuous canvas. The four-lane Kanban board is in My Workspace, where task selection opens the same read-only notes and steps inspector. The Workspace also retains the shared journey and timer.

The desktop focus scene uses viewport-aware Orb sizing and positions the fragments without enclosing panel outlines. Long project titles clamp visually while their full text remains in the saved-work inspector. At widths of 900px and below, content follows a vertical tablet/phone composition; phone screens show the Orb first and can scroll vertically. The board uses four columns on desktop and two on narrower screens, with internal lane scrolling. These are deliberately different layouts for different ranges, not separate pages or duplicate data sources.

Source: `react/v2/DashboardRegion.jsx`, `react/v2/KanbanBoard.jsx`, `react/v2/WorkspaceRegion.jsx`, `react/src/dashboard-guide.css` and `react/v2/spatial.css`. Unused V2 cockpit rules were removed from `react/src/dashboard.css`; the V1 rules before that section remain intact. The staged `v2/` assets are review output only and have not been deployed.

Validation: `npm run test:v2`, `npm run test`, `npm run build`, `npm run stage:v2`, `npm run check`, `npm run test:browser`, and the staged V2 Chromium/Firefox browser suite passed. The V2 suite covers 320–2560px widths, short 1280×600 viewports, live fixture updates, history, account isolation, timer continuity, direct Orb dragging when WebGL is available, the non-WebGL fallback and zero writes. Fixture screenshots were inspected. This does not establish visual parity with the illustrative reference, physical-device performance or production Firebase permissions; those need later review.

### Focus hierarchy and space navigation revision

The first review showed repeated copy around the active project and an Orb that was still too small. The Dashboard now keeps project title, next step, one Resume action and a compact progress readout in a single left cluster. It removes the second notes/milestones actions and explanatory copy. Desktop Orb anchor sizing rises from a maximum of 520px to 780px (150%); narrow screens use a separate viewport-aware cap. The Orb may extend behind the foreground content while navigation and account controls stay above it.

At that review stage, the top navigation was the only visible map: two labeled space destinations with an active node and underline. The duplicated region headings were visually hidden for semantics, and navigation focus moved to the active visible link. The footer explained sideways exploration. My Workspace used one short title above its board. Chromium/Firefox responsive checks covered the enlarged Orb, task inspection, history/focus behavior and the unchanged read-only data boundary. The Dashboard map introduced below supersedes that two-destination wayfinding concept.

## Floating-islands navigation (2026-10-14)

The Main Dashboard now serves as the entry map. Three stable, named islands (Create, Organize, Grow) connect to the pulsing Orb with fine paths. Selecting or scrolling toward an island reveals three connected page points; scrolling outward, pressing Escape, or choosing Back to map restores the overview. Mobile/tablet use tap targets and a vertical destination list instead of trapping page scroll. The Orb renderer is still singular; V2 disables rigid spin and drag rotation so spatial points stay visually stable while particle/hover motion remains. V1 keeps the original Orb behavior.

Each point takes its label and URL from `shared/navigation.js`, so it opens an existing page rather than a placeholder. The same-origin pages currently use their existing V1 runtimes; Portfolio opens its external origin in a new tab. A brief approach transition precedes same-origin navigation, and browser Back returns to the V2 dashboard. This is a first navigation layer, not a migration of those modules into V2 or a continuous camera through their interiors. My Workspace remains the separate working view with Kanban and existing widgets, not an island on the map. Widget arrangement and pinning are future work.

The new `ConstellationNav` contains only the spatial groupings; the shared navigation registry continues to own page identities and links. No account records, Firebase paths, rules, backend functions, or write permissions changed. V2 remains read only. Verification: V2/unit/backend tests, V1 and V2 production builds, site reference check, V2 Chromium/Firefox browser suite, and the V1 browser suites passed with the installed Windows Chromium path. Browser checks cover named destinations, actual link URLs, wheel approach/return, 320–2560px layouts, phone branch reveal, reduced motion, task/timer continuity and zero writes. Signed-in production permissions, physical-device motion/performance and Safari remain unverified.

## Page glows on the Orb (2026-10-14)

The three grouped islands and the lines drawn from the Orb center have been replaced with nine soft page glows. Their labels and URLs come directly from `shared/navigation.js`; Dashboard is the home view and My Workspace remains separate. The points sit at varied positions on and partly across the irregular Orb silhouette. The active task title is a central button that opens the existing read-only inspector. Same-origin page links retain the brief travel overlay before opening their existing runtimes; Portfolio still opens in a new tab. This is not yet a continuous camera zoom into page interiors.

V2 adds a denser particle field to the existing Orb renderer without changing V1's default density. Each page glow now contains a small semantic line icon, with no surrounding button ring. Pointer movement anywhere on the page gently influences the V2 Orb, while its shader motion continues without pointer input. A separate low-density 2D canvas adds slowly drifting background particles and faint lines only when they pass near each other. It stops animating when hidden or when reduced motion is preferred. The Orb remains a single WebGL canvas and keeps its fallback; no Firebase paths, permissions, account records or backend functions changed.

Verification uses the V2 Chromium/Firefox browser suite to check all nine links, varied marker positions, the central task inspector, removal of route-line elements, one background canvas, responsive layout, page travel, account isolation, and zero writes. Fixture screenshots were inspected at laptop, desktop and phone widths. Physical-device performance, production sign-in and Safari remain to be checked.

## Writable Kanban lanes (2026-10-15)

My Workspace now supports native desktop card dragging, a pointer-based grip for touch/mouse, and a native Move menu for keyboard and touch alternatives. Lanes highlight while dragging. Card-body scrolling remains available on phones; the grip reserves its gesture for dragging. Move-menu focus follows the task after a lane change. Cards show pending feedback and return to the original lane with a visible error when a save fails. This is movement between status lanes; manual ordering within a lane is not persisted.

The read subscription stays separate from the explicit transaction action. Only the signed-in account's existing `users/{uid}/tasks/{id}` and, for Today, `users/{uid}/dailyPlans/{local-date}` are written. Notes, steps, legacy subtasks and other fields are preserved. No rules or backend changes are required. Earlier zero-write checks in this document describe browsing without an explicit move.

Browser fixtures verify desktop drag/drop, same-lane no-op, saved status after reload, Today activation and atomic failure, denied-write rollback/retry, preserved task notes, deleted-task rejection and touch-grip movement. Production Firebase permissions and physical-device behavior require a real signed-in check; fixtures do not establish them.

Validation: `npm test`, `npm run build:v2`, `npm run stage:v2`, `npm run check` and `npm run test:v2:browser` passed locally. The browser suite covers Chromium and Firefox, with actual emulated touch input for the phone grip; desktop and phone screenshots were inspected.

## Project editor and structured plan import (2026-10-15)

My Workspace adds New project and Paste plan. Existing card/current-task selection opens the project editor. The importer accepts the documented [custom GPT format](plan-format.md): project metadata, numbered parent steps, one level of indented checkbox substeps, and optional working notes. It parses locally with no model/API call. Malformed lines and deeper ambiguous hierarchy produce visible errors; saving is disabled until the format is corrected. Preview content is editable before saving. New projects start in Backlog; appending preserves the selected project's title, description, notes, lane and existing steps.

Parent steps retain their existing IDs and unknown properties. Child records are stored in an additive `stepSubsteps` map keyed by parent ID in the same task document, instead of relying on legacy parent-array writers to preserve a new nested field. The V2 content adapter combines these records for editing. The compatibility mirror retains existing legacy fields, while keeping text/done current. No new backend service or rules changes are needed. Older pages still show parent steps; V2 owns child editing. Manual lane status remains separate from step completion.

Editor and importer drafts persist locally under account-scoped keys. Closing/reloading retains drafts; no cloud write occurs before an explicit save. Inputs are disabled during save. Task edits compare current content to the opening version inside a Firestore transaction and refuse a conflicting overwrite; the user can copy their changes or explicitly discard the draft to load current data. Appends read current server content, never replace an array from a stale preview, reject missing targets and de-duplicate stable imported IDs on retries. New-project creation uses a stable document ID/token across an interrupted save. Existing steps/notes and unrelated lane changes are preserved.

Verification includes parser/compatibility unit tests and Chromium/Firefox UI scenarios for preview, create, append, child completion, explicit saves, denied writes, draft reload recovery, concurrent-content conflicts, status-only changes, legacy-field preservation, retry after committed-but-unconfirmed append, manual project creation, invalid format rejection, account isolation and phone dialog overflow. Fixture screenshots were inspected. Production permissions, cross-device synchronization with a real account and physical-device/Safari behavior still require live checks.

Validation: 24 frontend/domain tests and eight backend tests passed, along with V2 production build/stage and site-reference checks. The full V2 Chromium/Firefox suite and focused importer/editor scenarios passed locally. V1 source, generated loaders, rules, Firebase config and backend code are unchanged.
