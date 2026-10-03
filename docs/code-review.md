# Cleanup review — 2026-10-03

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
