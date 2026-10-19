# Cleanup review — 2026-10-03

## V2 read-only prototype — 2026-10-13

The initial V2 branch adds a separate React entry/build, continuous Dashboard/My Workspace canvas, existing auth/config and FocusOrb, shared read-only tasks/daily-plan widgets, and a local persistent focus interval. [The V2 audit](v2-spatial-workspace.md) records source evidence for all six Foundation Stability risks, the write gate, checks and remaining phases. Those risks remain unresolved in V1; V2 does not call the auto-seeding daily-plan hook or expose business writes. V1 HTML, generated assets, workers, Firebase rules/config and backend code remain unchanged. Chromium/Firefox fixture checks supplement unit, backend, V1 regression and isolated-build verification; authenticated production permissions and physical-device behavior remain unverified.

The draft now includes a separate `v2/` publishing package for the existing Pages origin, where the same browser profile can restore V1's Firebase session. It is not published. Remote V2 checks passed; the first full CI run exposed a machine-dependent capability assumption in the old Orb test. That test now explicitly models the desktop tier while retaining separate low-capability coverage; the actual Orb remains unchanged.

Baseline: `master` at `0aaa969` (shared auth/Garage fixes). This review covers source organization, active entry points, asset references, and preservation of existing flows. It is not a signed-in production Firebase audit.

## Cleanup completed

- Removed 15 obsolete application files: seven historical Journal bundles; the unused Workday native script/two stylesheets; the unused Reminders native script/manifest/icon; and the unused Today's Plan component/stylesheet.
- Consolidated the two nested ignore files into one root `.gitignore` (17 deleted files overall, approximately 4.75 MB of deleted file content).
- Shared page links, route matching, tab preferences, and validation through `shared/navigation.js`. The native navigation renderer remains separate from the React renderer because their mounting/lifecycle code differs.
- Replaced seven copied native HTML navigation lists with small mounts. All native loaders now use ES modules, including the previously older LIC product loader.
- Removed unused daily-plan remove/activate/reorder methods; the active queue's add/complete behavior remains. Removed the unused Garage `resetEdit` helper, Creator auth import, and root worker version constant.
- Removed four exact duplicate CSS rules and consolidated the avatar's sphere styling. Intentional later style overrides remain.
- Extracted Dashboard's inline CSS to `react/src/dashboard-base.css`, preserving the load order; removed the duplicate theme-color meta tag.
- Kept the old Reminders worker URL as a retirement endpoint instead of removing a resource that browsers may still request.
- Added common build/check/test commands, reference checking, navigation tests, worker-retirement tests, and developer guidance.

No Firestore data, rules, paths, task IDs, scene IDs, or saved user preferences were migrated or deleted in this cleanup. Previous source and bundles remain recoverable in Git history.

## Validation

| Check | Result | Limits |
| --- | --- | --- |
| Vite production build | Passed; generated main assets refreshed | Single main bundle remains approximately 757 KB before gzip |
| Site reference/module-loader check | Passed | Checks local resource references; does not prove external APIs are reachable |
| Navigation/storage/worker unit regressions | 7 passed | Controlled adapters and in-memory state |
| Backend task/project/tool tests | 8 passed | Functions code unchanged; Node 24 test runtime, deployment targets Node 22 |
| Functions syntax check | Passed | No deployment or live callable request |
| Garage browser integration | Passed add/edit/reload/delete, failed-save form recovery, account sign-out isolation | Mock Firestore backend |
| Navigation browser integration | Passed on all seven native pages and shared React/native tab preferences | Native page-specific application scripts are excluded from navigation fixtures |
| AI avatar browser check | Motion and reduced-motion behavior passed | CSS/render check; does not test voice or the AI provider |
| Dashboard layout | Passed nine viewport sizes, timer start/pause/reset, no returned Today's Plan card or timer/progress overlap | Auth/tasks are fixture data |
| Diff and edited-module syntax checks | Passed | Not a complete static type/lint audit |

The dashboard fixture check covered 1280×800, 1280×600, 1025×600, 1440×900, 1920×1080, 834×1112, 768×1024, 393×852, and 360×640. Existing tablet scrolling behavior remains; this pass did not redesign it.

## Remaining findings and next work (updated after the tablet/reminders follow-up)

| Priority | Finding | Evidence / impact | Next action |
| --- | --- | --- | --- |
| P1 | Live Firebase permissions remain unverified | Frontend fixtures cannot establish deployed rules, provider configuration, or real account UID access | Test one real account across internal pages, including Garage create/edit/delete and reload |
| P1 | Creator collaboration can overwrite concurrent scene edits | `creator/project.js` autosaves whole project fields/scene arrays; local draft recovery does not merge simultaneous server edits | Add revision/conflict handling before expanding collaboration |
| P2 | Some AI focus tools use a different source than Dashboard | `get_current_focus` and `dashboardState().focus` select by task status. Dashboard uses daily plans. AI's initial `contextSnapshot()` already prefers the daily plan, so this is a tool-specific inconsistency | Use one active-focus resolver for context and tool responses; preserve daily-plan IDs |
| P2 | Journal's original source/build is absent | Active Journal is a bundled React app plus a readable persistence adapter | Recover the source before folding it into the main React app |

The remaining rows are unresolved review findings. Keep follow-up work separate from this behavior-preserving cleanup so its effects can be tested and reviewed clearly.

## Maintenance baseline

Use [README.md](../README.md) as the main project map and [AGENTS.md](../AGENTS.md) for editing instructions. Keep [Firebase storage](firebase-storage.md) and [AI architecture](invincible-ai-phase-1.md) aligned with the implementation. Do not reintroduce archived bundles, native pre-React scripts, copied navigation lists, or generated main-app bundle edits.

## Tablet/reminders follow-up — 2026-10-03

Baseline: `master` at `53cda787` (cleanup).

- Replaced 819 lines of base/mobile CSS and the later layout overrides with one Dashboard stylesheet. Removed absolute panel positions and fixed viewport heights. Introduced independent phone (<700), tablet (700–1100) and desktop (>1100) grids, wrapping content, `min-width:0`, `min-height:100dvh`, fluid type, and container-aware task cards. Decorative canvases and floating overlays retain positioned rendering.
- Timer, orb metadata and board occupy independent cells. Tablet focus text appears beside the orb instead of being duplicated inside it. Boards grow and scroll naturally; the last task remains reachable. Shared React navigation collapses at 1100px. Touch scrolling cancels a task's pending drag; long-press dragging and explicit movement buttons remain.
- Added a subtle red Overdue reminder group, calendar rollover refresh, cached/cloud loading status, inline save recovery, and an in-flight completion guard. Daily completion is atomic and idempotent, reads current fields and produces one next-calendar-day occurrence. No historical duplicates or user records were deleted.
- Loaded all six main React pages via `React.lazy`/`Suspense`, with route/auth/task/reminder skeletons and empty states. Content-hashed filenames and automatic HTML synchronization prevent stale chunks and duplicate entry module instances. CSS remains one generated asset intentionally; page CSS isolation is future work.
- Dashboard uses an 8px spacing scale, 16px card radius, layered shadows, at least 44px controls, light/dark preferences and reduced motion. Reminder styles were also cleaned of unreachable pre-React dialog/auth selectors and small targets. These changes do not assert every existing page meets those conventions.

### Verification

| Check | Result | Limits |
| --- | --- | --- |
| Site reference/module graph check | Passed | Local files and entry consistency |
| Frontend/domain regressions | 11 passed | Controlled/in-memory adapters |
| Backend tools/project tests | 8 passed | Node 24; deployment target remains Node 22 |
| Garage/navigation browser integration | Passed existing CRUD, recovery, account isolation and native/React navigation checks | Mock Firestore; native app scripts excluded from navigation fixtures |
| Dashboard browser integration | Passed 14 viewports, long titles, 24 tasks, timer start/pause/complete, lane expansion and new-task/subtask form | Chromium, controlled realistic records |
| Reminders browser integration | Passed initial skeleton, overdue/today groups, failed transaction recovery, retry and exactly one next daily record | Controlled Firestore adapter, not deployed rules |
| Production bundle smoke | Actual hashed entry shows one Google auth gate without runtime errors | Anonymous startup only |
| Production build | Passed; shared app entry ~163 KB + Firebase ~462 KB = ~626 KB initial JS, with page chunks ~5–39 KB | Firebase still loads globally; Dashboard adds ~33 KB plus shared task/plan chunks; shared CSS ~111 KB |

Viewport coverage: 320×640, 393×852, 507×768, 699×900, 700×1024, 768×1024, 820×1180, 834×1112, 1024×768, 1100×820, 1101×768, 1180×820, 1280×600, 1440×900. Tests verify horizontal overflow, timer/clock/progress/board separation, board columns, reachable final tasks and 44px Dashboard buttons. Light preference and reduced-motion styling are exercised. These fixtures do not replace a signed-in test with real data or an iPad Safari check.

Live Firebase permissions, Creator simultaneous-edit conflicts, the AI focus-tool mismatch and missing Journal source remain unresolved. React migration remains partial.

## Dashboard styling restoration — October 3

PR #58 replaced the compact phone board and status glass styling. Restored four compact lanes in a 2×2 phone grid, internal scrolling and tap expansion, grey/gold/blue/green lane backgrounds, fading top/bottom surfaces with side rails only, and the original dark theme regardless of device preference. Desktop retains three project lanes and tablets two columns, with flow-based timer/clock separation. Removed the enclosing focus card appearance and restored the wide gold timer glow. Long titles are visually clamped while complete task content stays available in the workspace. No storage, reminder or auth logic changed.

Validation: production build, asset references, eleven frontend/domain tests, and Chromium fixture checks across fourteen viewports passed, including lane expansion, timer controls, form, scrolling, borders, failed reminder retry and daily recurrence. Fixture screenshots were inspected; live account data and physical iPad Safari were not tested.

## Orb filaments and compact focus/task layout — October 3

Baseline: PR #59, merged commit `2acf40fa6ad3f65f9ccb540dcb92bf213f4def94`.

- Replaced constant-width ribbon trails and oversized cell heads with equally sized 3.4-point heads, 45% tapered tails and power-curve alpha. Tightened sampling as radius shrinks; packet size boost is now `1 + .26*packet + .12*secondary`. Added resize-only `pointScale` clamped to .85–1.5. Palettes, all spatial/motion shader formulas, fallback dots and public props are retained.
- Particle budgets: desktop 59,120 → 19,456; ≤1024px 55,520 → 14,544; low-capability desktop/mobile 14,544/11,112. The typed vertex buffers shrink from 1,182,400/1,110,400 bytes to 389,120/290,880 bytes (222,240 for low mobile). Those are allocation sizes, not measured total-memory or power savings.
- Replaced the skipping rAF loop with timeout then rAF presentation: ~24 fps idle, up to ~40 desktop/~30 mobile during hover, drag or coasting. Static GL setup/color/style occurs once, and viewport/projection/DPR/point scale only on resize. DPR caps are 1.25 desktop and 1 mobile; antialias is disabled with low-power preference retained.
- Added context restoration rebuilding, immediate eligible resize draws, both-stage cancellation and full observer/listener/GPU cleanup, including initialization failure. Reduced motion still uses time 8 and discrete interaction-triggered draws.
- Moved project/action text into the existing orb container on tablet/desktop, preserving the phone summary and hidden phone orb. Task titles are smaller and sit beside the movement arrows. Kept 44px controls and the coloured fading lanes/compact 2×2 phone board. Tablet focus surfaces remain open rather than enclosed cards.
- Rebuilt `react-dist` with the build script and refreshed all six HTML entries to new content hashes, without query aliases or compiled-bundle edits.

Verification: `npm run build`, `npm run check`, `npm run test` (13 frontend/domain + 8 backend), `npm run test:browser` and diff check passed. Browser suite includes the Dashboard's fourteen viewports (specifically 834×1112 and 768×1024), title/arrow alignment and focus heading containment, storage/navigation/reminder checks, plus all eighteen orb screenshots (three themes × three widths × before/after) at fixed time. Images were visually inspected for thin, continuous tapered lines and spherical form. Separate WebGL checks passed cadence, static GL setup, DPR/resize, loss/restoration and fallback display, drag/inertia, low-capability tiers, reduced motion, visibility/intersection pause and resource cleanup. No real-hardware GPU/CPU/power/battery measurements, physical iPad Safari verification, or signed-in production-data changes were performed.

## Phone focus cleanup — October 3

PR #60 is the baseline. Dashboard now mounts the orb stage only at widths ≥700px, using the same breakpoint as its stylesheet. Phones create no hidden orb canvas, program, buffer or animation scheduler; crossing to tablet restores the component and crossing back cleans it up. The wide gold timer strip remains below the clock. The phone summary renders only a real focus task/action; the empty “Current focus / Move a task to Today” block is removed. No task-selection, daily-plan or database behaviour changed, and the floating AI launcher is a separate control.

Validation: build, site references, diff check and the fourteen-viewport Dashboard/reminders browser check passed, including 834×1112 and 768×1024. Added empty-plan coverage and phone↔tablet mount/unmount assertions. Signed-in data and physical devices were not tested.

## V2 Dashboard proportions — October 13

On the published V2 Dashboard, the mission section and large support cards pushed every Kanban lane below the initial viewport. Reduced spacing and title sizes, moved a compact timer alongside the mission/Orb, and condensed the journey into a progress summary with access to full milestones. Short desktop screens stack timer and journey in the right column; phones use a timer strip and prioritize the board. V1 selectors, generated assets, auth and persistence are unchanged.

Validation: 19 frontend/domain + eight backend tests, V2 staged build, site references, isolated V1 build/check and the existing 14-viewport Dashboard/reminders browser suite passed. Chromium and Firefox V2 checks now assert initial Kanban visibility across nine screen sizes from 320×640 to 1870×842, including 1280×600 and long project names. Milestone inspection and existing timer/navigation/account checks passed. Screenshots were inspected with fixture records. Physical-device rendering and live account permissions were not retested; the shared foundation findings above remain open.

## V2 Coherent Spatial Workspace Redesign — October 14

Redesigned the frontend composition across Main Dashboard and My Workspace into a unified, high-density living spatial environment. Integrated the mission, Orb stage, compact focus timer, and milestone journey into an intentional cockpit layout. Aligned all 4 Kanban lanes (`Backlog`, `In progress`, `Today`, `Completed`) with status accents, card progress bars, step counts, and independent internal scrolling. Enhanced My Workspace with consistent visual identity, pipeline volume summary, and expanded milestone roadmap. Mobile view arranges active mission and compact Orb side-by-side with a condensed timer and direct task access before scrolling.

Validation: 19 frontend/domain + 8 backend tests, site references (`npm run check`), V2 production build/stage (`v2/`), Chromium and Firefox browser test suite covering nine viewports (320×640 to 1870×842, including constrained 1280×600 and long titles), free horizontal stopping, region seam, history restoration, and live read lifecycle passed. No database writes or schema modifications. Screenshots inspected for visual hierarchy and responsiveness.

## V2 Orb-as-guide focus scene — October 14 review branch

The previous V2 cockpit kept the Orb in a separate stage and placed the complete board in Dashboard. This branch gives the Orb a shared visual layer and places mission, next action, timer, progress and a Workspace entry around it. My Workspace owns the full four-lane read-only board. This keeps the Dashboard's purpose focused and removes the large empty lanes and enclosing dashboard panels from its first screen. The old cockpit-specific CSS was removed; V1 Dashboard selectors and data paths remain unchanged.

Validation passed: 19 frontend/domain plus eight backend tests, V1 build/site check/browser regressions, V2 staged build and Chromium/Firefox V2 integration at 320–2560px widths, including 1280×600 and long-title cases. Browser checks cover Orb dragging where WebGL is available and its fallback elsewhere, first-screen scene sizing, accessible board entry, task inspector, timer sharing, navigation/history, live updates, account isolation, and no writes. Fixture screenshots were inspected. Real signed-in data, physical devices, Safari and the visual ambition of the supplied reference remain follow-up work; no publication occurred from this branch.

### Orb scale and navigation follow-up

Review feedback identified too much repeated project text, an undersized Orb and weak page discoverability. Consolidated project title, next step, resume and progress on the left; removed duplicate notes/milestones actions and helper sentences. Increased desktop Orb anchor to 150% of the prior maximum. Replaced visible duplicate region headings with a two-node top navigation map, kept the headings available to assistive technology and moved navigation focus to the visible active link. Short laptop and phone fixture screenshots were inspected; V2 browser checks verify large Orb sizing, no horizontal document spill, both destinations and keyboard/history navigation. The published site remains unchanged.

## Creator Studio storyboard — October 19, 2026

Added separate Full voiceover and a four-column Storyboard to New Content and the existing project page. A shared editor previews tab-separated imports, supports quoted multiline cells and header mapping, defaults to append, confirms replacement/removal, and allows manual edits/addition/reordering with touch-friendly buttons. Phone widths stack each shot's fields. Existing scripts, production notes, workflow stages, prompts, asset links and completion state remain stored in the original project document; new planning fields are additive. Scene normalization retains unknown metadata. New Content waits for save acknowledgement, keeps one ID across retries, and retains the form on failure. Project edits use the existing autosave/draft path.

Verification: 33 frontend/domain tests plus eight backend tests passed, including five new storyboard/legacy-import cases. The production build and site-reference check passed. All six browser scripts passed: storage, navigation, Dashboard/reminders (14 viewports), Orb, Task copy and the new Creator workflow. Creator covers preview without mutation, malformed input, append, cancelled and accepted replacement, edit/reorder/add/remove, failed save/retry, project reload, local draft recovery, legacy metadata and 320/393/768/1280px layouts. Screenshots were visually reviewed.

Windows protected-folder writes interrupted the initial build/browser harness; verification completed using the identical source in an isolated temporary checkout with locked dependencies and repository history. React source was untouched; the rebuilt React hashes were not included in this native-only change. Production Firebase access, physical iOS/Safari behavior and the pre-existing simultaneous-edit conflict limitation remain unverified/unresolved. No production data or rules were changed.
