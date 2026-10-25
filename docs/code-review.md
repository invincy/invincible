# Cleanup review — 2026-10-03

## LIC Follow-up Manager — October 26, 2026

Publication follow-up adds reversible case removal, automatic archiving on completion, archive/all-saved views and explicit restoration. Replacement CSV import is the default, with a visible removal count and an add/update-only alternative. Incoming rows must all save before missing cases are archived; imports preserve earlier remarks/history and reactivate only cases previously removed due to CSV absence. Ten focused model/sample tests and the expanded browser suite pass, including completion/removal/restore, reimport of archived cases, uncertain archive acknowledgements and retries after both row-import and archive-phase failures. Publication and the initial private sample import were explicitly requested; the CSV remains outside Git.

Added a native module under the existing LIC hub, using shared navigation and Firebase auth. It supports paste/upload CSV, editable column mapping, per-row preview/errors, policy details, valid-mobile call links, quick responses, notes, schedules, separate persistent history, search, plan/work views, and duplicate-safe imports. The OP-Neft columns are explicitly linked OP-NAPped policies, searchable and available in a dedicated missing/invalid-mobile view. Contactability and call attempts are independent. The source CSV is not part of the public repository.

Focused model tests cover CSV quoting/BOM/newlines, mapping, identifiers with leading zeroes, duplicate conflicts, date/amount/mobile validation, OP search, contact states, merge preservation and scheduling. The original `858.csv` validates as 104 unique policies with one row containing three linked OP policies. Browser checks use the actual storage adapter with synthetic Firestore fixtures, covering file/paste imports, manual mapping, logging/reload/reimport, phone correction, failed saves, lost acknowledgements, partial-import retry, pagination, account isolation, real shared navigation and layouts from 320 to 1440px. Production Firebase permissions, real call-app dispatch and physical-device Safari are not established by these fixtures.

Local verification: all eight focused model/sample tests, the LIC browser suite, full repository unit/Functions tests, full V1 browser suite, main production build, V2 build/stage, site reference check and diff whitespace check passed. The broader V2 browser suite passed its Chromium scenarios, then failed the existing Firefox assertion `workflow nodes can be repositioned` in `tests/v2-browser.cjs:173`; this change does not edit V2 code or that test. The new native-page test caught and fixed interference with the shared navigation's More dialog by limiting handlers and controls to the two LIC dialogs. Generated React/V2 build files have no source changes and are not included in the feature commit.

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

### Timeline table import follow-up

The pasted Gaganyaan format exposed two gaps: `Assets Required`/`Timeline` headers and ranges such as `0–4s` were rejected, while paste alone gave no preview. The importer now accepts those headers, derives and preserves each shot's timing, previews complete tables automatically, and offers a transfer when a table lands in Full voiceover. The project page's advanced import also recognizes the four-column storyboard. Import still requires an explicit confirmation, and replacement still asks before removing shots. Focused tests use representative Hindi voiceover and the full 15-range, 154-second timing sequence without publishing the full user script as a repository fixture.

Verification: 34 frontend/domain tests and eight backend tests passed. The production build, site-reference check, and all six browser suites passed. Creator browser coverage includes automatic preview, source-field transfer, project advanced import, Firestore-shaped persistence, legacy metadata, failed save/retry, and 320/393/768/1280px layouts. No production account write was performed.

### New Content save visibility

A 15-shot import made the New Content save action difficult to find because it followed every editable shot. The dialog now scrolls beneath a visible action footer with the shot count, total duration, and a **Save and open project** action. The storyboard confirms that imported shots still need that save action. The project editor retains its automatic save behavior. Browser coverage checks footer visibility at the top and bottom of a 15-shot form at 320, 393, 768, and 1280 pixels, then saves and reopens all 15 shots in the controlled Firestore fixture.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. The new 15-shot save check passed at each viewport. No signed-in production write was performed.

### Table-first project page

The project page previously presented Script, Visual Bible, Import, and Produce as the main sequence, then wrapped the Storyboard editor in a second Storyboard heading. It now leads with one Shot table and removes the repeated column heading. Full voiceover and visual settings follow as optional panels; the old script splitter is retained in a closed alternative. The advanced prompt import and production workspace remain available. When an imported table meets an empty full script, narration is derived from the rows without overwriting existing scripts. The optional generator brief preserves each planned shot's order and duration rather than splitting the narration again.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. Creator browser coverage includes the table-first empty-project state, recording-script derivation, the prompt brief's preserved shot durations, hidden legacy splitter, existing metadata, and 320/393px project layouts. No signed-in production write was performed.

### Unified scene workspace

The project page now has one scene list. Each shot's four planning fields are followed by its Character, Image and Video prompt section, with an action to draft only blank prompts from the scene plan and shared visual settings. The separate production-card list was removed; its focused editor and asset tracker are available from the scene list. The advanced prompt importer remains under More tools. This reuses the current `scenes` array and Firestore save queue without migrating project data.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. Creator browser coverage checks prompt drafting without overwriting a manual character prompt, persistence after reload, focused production access, legacy metadata, failed-save recovery and 320/393px layouts. A local browser screenshot was visually reviewed. No signed-in production write was performed.


## Creator production workbench — October 20, 2026

Replaced the project storyboard composition with four shared-data views: Storyboard, Production, Assets and Overview. Added a desktop seven-column planning grid, mobile scene cards, editable prompts and task checklists, drag and keyboard-button reordering, duplication/insertion, method tags, Blender/AI/Editing queues, shared animation projects, local/external asset references, independent scene completion and reviewed script synchronization. The native page, authentication adapters, collection paths and rules remain unchanged. Legacy tools remain reachable below the new workspace.

New files: creator/production-model.js, creator/production-workbench.js, creator/production-workbench.css and tests/creator-production.mjs. Integration changes: creator/project.js, project.html, creator.js, index.html and storyboard-editor.js. Updated the Creator browser suite for the new interactions, and extended existing CI to include creator changes and the production build.

Verification before CI: all changed JavaScript modules and the browser test parse successfully in the available JavaScript runtime. Ten pure model scenarios pass, including 16 Hindi/English TSV scenes, Markdown, quoted multiline narration, mapping, duplicates, mixed workspace queues, shared Blender work without scene completion, linked assets/checklists, reviewed scripts and legacy JSON round trips. These checks ran with an isolated UUID stub; they are not browser, Firestore or Node production-build tests.

The session has no shell execution environment. A pull request runs the existing full unit/Functions checks, production build, site-reference checks and Chromium/Firefox browser workflows. CI results must be checked before merge. Browser screenshots and real signed-in Firebase permissions have not been established by the pure-model checks.

Remaining constraints: existing whole-document concurrent editing can overwrite another editor's work; project metadata shares Firestore's document limit; scene duration remains 1–60 seconds; no large-file upload/storage service was introduced; paragraph-based script synchronization needs one paragraph per scene. Local paths are references, and production account access is unverified.

### Browser verification follow-up

The native Creator browser workflow passed on CI run 39466128892: project creation with denied-save recovery, 16 Hindi storyboard rows, exact duplicate prevention, drag/button reordering, Blender/AI/Editing filtering, shared group tasks, independent scene completion, canonical generator briefs, reviewed script changes, local asset paths, Markdown import, duplication/insertion/deletion, reload/recovery drafts and legacy records. Layout assertions passed at 320, 393, 768, 1280 and 1920 pixels. Four fixture screenshots were captured; they do not establish physical-device or signed-in production behavior.

Browser testing exposed and fixed an asset metadata blur handler that could detach the next input and lose a typed path. The form now preserves focus and updates external-reference links inline. A test interaction was corrected to keep an already-expanded scene open while selecting its animation group. Duplicate matching now includes asset requirements and detailed prompt content so distinct production plans are not discarded. Full repository builds/unit/site/V2 checks have passed in CI; the final full regression run remains the merge gate.


## New Content workbench — October 20, 2026

The saved project page used the new production workbench, but + New Content still opened the old script-led dialog and four-field scene editor. Creation and metadata editing now embed the same four-view workbench as saved projects. Project title leads the form; format, stage, series, date, hook, script draft and notes remain under optional Project details. The wide responsive dialog keeps its create/save footer visible.

The dialog edits an isolated draft of scenes, animation groups and asset metadata. It performs no workbench autosaves before the explicit create/save action. Failed writes retain the same draft and ID; Cancel cannot mutate nested data on an existing project. Group and asset metadata are included in the existing creatorProjects write. Ownership, authentication, collection paths and rules are unchanged. Workbench buttons explicitly use type=button so adding/importing scenes cannot submit the creation form. Reopening the dialog resets it to Storyboard.

Extended Creator browser coverage checks TSV import with method/group columns before creation, prompt edits, Blender/AI queues, asset paths, no writes during preparation, persistence after create, cancellation isolation, default view on reopen, 320–1280px overflow and save-footer visibility, plus the existing full project workflow. Syntax checks passed in the session runtime; CI validation is pending. Signed-in production access remains unverified.


Removed the three redundant standalone panels below the saved-project workbench: Full-script draft, Visual settings and More tools. Canonical narration and reviewed draft synchronization remain in Overview; visual style, aspect ratio, language, character bible and continuity settings now live there too. The generator brief and explicit rough-script splitter remain available inside Overview. The single storyboard importer now accepts JSON scene arrays as well as TSV, Markdown and voiceover-only text. Removed the obsolete page-panel event wiring rather than leaving hidden duplicate controls.


### Interactive scene production table and combined filters

Replaced the old focused scene overlay with the same structured scene table used for planning. Open production table, scene details and restored legacy production state all stay in the modern workbench. Both Storyboard and Production now filter by method, asset/animation readiness, scene completion and narration/asset/group/file text. Blender + Ready shows only ready Blender work while retaining original scene numbering; readiness remains independent of final scene completion. Production keeps animation-project/scene/status grouping and inline phase controls around the table. The redundant full-script, settings and import panels are removed; their useful controls live in Overview or the single importer. Legacy generated-asset flags/links remain editable in expanded scene details.

New and edit dialogs share this complete workbench. Nested draft groups/assets are isolated until save, metadata fields remain optional, all non-submit workbench controls have explicit button types, and new/edit always open on Storyboard. Unit coverage adds mixed Blender/AI readiness and file search plus JSON import; browser coverage checks creation, cancellation, filtering, original scene state, modern production entry and responsive save controls. CI results remain pending for this revision.


## Compact Creator workflow — October 20, 2026

Reviewed creation, planning, production, assets and overview for repeated controls and unnecessary vertical space. Removed the second production-method selector, duplicated row/detail method controls, duplicated Editing checkbox, repeated top-level Production/Assets actions and duplicate hook/script/notes inputs from the creation form. These values remain editable in Overview and preserve the same document fields.

Scene rows now use compact one-line editors with optional manual resizing and stable focus height, with prompt/direction fields folded until requested. Phase buttons appear only for the active scene and selected production method. Tables default to eight scenes per page with Previous/Next and 8/16/All row choices; row-count preference is local display state only. Original scene ordering/numbering and method/readiness filters are unchanged. Assets use collapsed summaries; Overview shows four summary actions and five pending scenes instead of another complete scene-card list. The chronological script is a compact read-only preview, with one editable draft.

Updated the Creator browser workflow to exercise compact editor height, eight-row paging, original scene numbers on page two, retained All-row preference, a single method selector, focused progress controls, collapsed prompts, create/edit/cancel, imports, shared groups/assets, readiness filters, draft recovery and mobile/desktop layouts. Syntax checks passed in the session runtime. CI results pending; no signed-in production access claimed.


## Icon-led Creator controls — October 21, 2026

Replaced written method chips and repeated scene action labels with inline SVG controls, retaining accessible labels, native tooltips and visible checked/focus states. Desktop scenes keep methods, readiness, completion and actions on one row. Move up/down remains in expanded actions; drag ordering remains in the row. Production grouping joins the existing filter bar. Import and shared projects use short toolbar disclosures; repeated tab headings, slogans and helper paragraphs are removed. The creation form retains one title, the shared workbench, optional metadata and concise save actions. Mobile uses icon navigation and compact scene cards with touch-sized controls. No cloud fields, paths, rules, imports or production flags changed.

Extended the existing full browser workflow to check accessible copy actions, one-row desktop filters/methods, compact row height and expanded reorder actions. All existing import/group/progress/persistence/recovery/legacy/responsive checks remain. Session JavaScript syntax checks passed; CI validation pending. Production signed-in access and physical devices remain unverified.


## Readable selected scenes and compact project chrome — October 21, 2026

Selected scene rows now grow narration, visual, asset and opened prompt fields to their full text, with a 100px minimum for planning fields. Other rows stay compact. Opening another scene exits Expand all and keeps only that scene open. The explicit Expand all control applies to the filtered, paginated scene list; method, readiness, completion and search filters remain in force. Growth recalculates on edits, disclosure and viewport width changes. No scene content or production flags change when expanding.

The saved-project header removes the repeated format/series/stage string and access/email lines. Existing metadata is retained. Title, counts, sharing/access and sync use one desktop row and two mobile rows. Routine sync feedback is an accessible icon with a tooltip; failures still show text, and sharing still requires the existing owner permission. Own-account/owner emails no longer appear in routine page chrome. Workbench tabs and Import/Projects/expand/add actions now share one row, with filters beneath; opening Import/Projects deliberately reveals its editor.

Browser coverage adds long-text growth without internal overflow, single-scene switching, filtered Expand all, icon sharing, routine email-free sync and readable failed-save feedback. Existing creation, imports, production, grouping, script, assets, recovery, legacy and responsive tests remain. Session JavaScript syntax checks passed; full CI pending. Real signed-in permissions and physical devices remain unverified.


## Scene navigator and active editor — October 21, 2026

Replaced the spreadsheet scene table with a default focused workspace: an independently scrollable 22% navigator and one active editor. Sidebar entries keep original scene numbers, timing and narration previews; drag grips reorder the existing scene array. Sidebar collapse, scene jump and Previous/Next use the same filtered queue. Production uses the same editor, with animation-project/scene/status groups in its navigator. Selection, filters and edits survive mode/tab changes.

All Scenes is an explicit alternate overview: every filtered scene in original chronological order (Production retains its selected grouping), collapsed by default. Individual expansion and Expand/Collapse All use the same scene renderer. Removed table columns and row pagination. New scenes, duplicate/delete, method tags, scene state, imports, shared group tasks, asset metadata, canonical script review and save/recovery all reuse existing model/events and Firestore paths. No schema or permission changes.

The editor has full-width voiceover, visual and asset fields; prompt fields are directly available in an open section. All expanded scene textareas grow on edits, disclosure and width changes without internal scrolling, with restrained minimum heights. Compact method/status/duplicate/delete controls sit above the writing. Styling uses Roboto/Noto Devanagari/system fonts and restrained purple/cyan Material-style surfaces. No media/upload/preview panels were added.

Updated the full Creator browser workflow for one-scene defaults, 16-entry navigator, filtered Previous/Next, sidebar collapse, long Unicode/multiline text across viewport changes, navigator drag, mode/selection retention, collapsed/all expansion and no table markup. Existing TSV/Markdown, create/edit/cancel, copy, group/progress, assets, script review, failed-save recovery, legacy and responsive coverage remain. JavaScript syntax checks passed in-session; CI pending. Real signed-in Firebase permissions and physical devices remain unverified.


## Viewport scene desk and numbered rail — October 21, 2026

Routine scene work now uses Plan / Prompts / Progress sections rather than stacking every field and phase control beneath narration. Prompts shows one selected prompt with a direct copy action; all existing prompt fields, metadata and phase/checklist actions remain accessible. Focused saved-project editing fills the viewport, with fixed controls and one editor overflow fallback for unusually long text. Individual scene textareas still grow to full content without their own scrollbars. All Scenes, Assets and Overview retain their appropriate list layouts.

The scene rail displays only original scene numbers. Completed scenes are green, scenes with production/editing work are purple, and planned scenes are neutral. The color uses existing actual task and completion state; Blender readiness alone never becomes scene completion. Native tooltips and accessible labels retain readable state; a border distinguishes selection. Drag reordering remains on the numbered button.

Creator opts into a 48px compact navigation using the existing shared registry and More dialog. The app-menu button exposes the same destinations on desktop and mobile; other pages keep their existing navigation and saved mobile preferences. The routine bottom bar is omitted only in compact Creator navigation.

Added viewport checks at 1440×1000, 1366×768, 1280×720, 1024×768, 393×852 and 320×700, plus normal-plan fit, section switching, prompt copy and completion colors. Navigation tests cover the compact app menu at desktop/mobile widths as well as unchanged standard navigation/preferences. JavaScript syntax checks passed; full CI pending. Live browser inspection confirmed the old top bar, but this cloud browser is signed out and blocks local file previews. No production account data was changed. Extremely long scene text may require scrolling the editor pane; it is never clipped to force a fixed screen. Real signed-in permissions remain unverified.

## Creator Studio approved design — October 21, 2026

The storyboard now follows the agreed graphite/cyan design: a scene navigator with timeline, status and narration preview, a single active scene, and two writing columns with Voiceover/Visual on the left and Assets/References on the right. Fields continue to auto-expand without inner scrolling; long content remains reachable in the editor. Laptop-height layouts use compact spacing. Previous/next, ordering, duplicate/delete, prompt and production controls continue using the existing workbench state and project save queue. Copy buttons copy the exact field text, and sidebar previews update without moving the editing caret.

Creator opts into a direct icon navigation rail through a data attribute. All links still come from shared/navigation.js; other modules retain their navigation. Desktop project tabs and actions occupy the existing two header rows. On mobile, page icons remain directly reachable, scene numbers retain status colours, and a filter toggle exposes the existing method/asset/completion/search controls. Scrollbars use a thin blue/cyan thumb and dark track in both Firefox and Chromium.

The same workbench is used when creating content and editing projects. No Firebase schema, rules, auth, asset upload, narration format, or storage path changes. Browser coverage includes TSV/Markdown import, filtered queues, groups, independent completion, draft recovery/reload, long expanding text, direct navigation, copy, and responsive widths. Real signed-in production permissions still require a manual check; fixtures do not establish them.

## LIC Scene 1 loading, Hindi-English and footer — October 25, 2026

Updated only the existing Bima Platinum presentation. Scene 1 now uses Hindi-English visible copy, Devanagari fonts, advisor script and Stage 2 placeholder. Growth/Opportunity/Control and risk-factor chips remain absent; the businessman remains silent. The advisor and Stability controls flow within one footer, so translated text cannot overlap the audio control. Calculator links outside the scene remain available only in developer mode.

The initial scene PNG is 2,304,794 bytes. Same-scene WebP variants are 44,558 and 96,422 bytes, selected by viewport/DPR, preloaded with high fetch priority. The original source PNG is retained. The supplied screenshot showed image alt text; live inspection loaded the original PNG successfully, so the historical failed request's exact cause cannot be established. The change reduces transfer cost; no measured network speedup is claimed. A top-edge mask conceals a baked-in icon fragment in the supplied scene.

The professional Hindi female MP3 belongs at `lic/bima-platinum/assets/audio/advisor-scene-1-hindi.mp3`; it is not supplied or generated. Browser speech is explicitly opt-in, preventing an arbitrary voice when the recording is absent. Audio loads on tap, supports pause/resume/replay, and stops on Stage 2, hidden document and page exit. Pending failures cannot start late speech. The Stage 2 placeholder restores focus on dismissal; native button keyboard behavior is preserved.

Validation: production build, all 50 existing frontend tests and 8 backend tests, 5 focused presentation tests, site-reference checks, JavaScript syntax and diff whitespace checks passed. Full browser regression command was attempted but cannot launch the repository's missing Chromium executable. The cloud browser cannot reach the local preview server. Mobile layout and actual MP3 playback on physical devices remain unverified; no signed-in Firebase data or auth changes are involved.


## Direct Creator scene completion — October 25, 2026

Removed the scene-completion gate from the status selector and the derived completion check. The existing completed flag is now an explicit creator decision. A 44px-high Complete action lives at the lower right of every expanded scene, outside the focused editor scroll pane, with space for the shared assistant launcher. It changes to Completed and supports reopening. No asset uploads, linked files, production flags, voiceover/editing flags or checklists are required or silently marked done. Group tasks and other scenes remain independent. Project progress counts completed scenes plus tracked tasks for pending scenes; shared-task totals no longer depend on scene ordering. Existing edits that invalidate completion still reopen the scene.

Model and browser regressions cover direct completion with unfinished mixed-method work, shared groups, missing asset references and checklists; button/dropdown consistency; reopen; Completed rail state; project progress; reload; failed-save draft recovery; All Scenes; and reachable unobscured actions at 320/393px and desktop widths. Compact laptop field spacing preserves the existing normal-plan no-scroll check. Native import versions are bumped so existing browser sessions receive the change.

The full browser run found a pre-existing navigation fixture expecting shared dashboard chrome on the now-isolated Bima Platinum presentation. That case now verifies the existing Back/Home exits and absence of shared chrome; six other native mounts keep their original assertions. No LIC runtime or shared navigation code changed.

Validation: 61 frontend/domain tests and 8 Functions tests, production build, site reference check, V2 build/stage reproducibility and Chromium V2 smoke passed locally. The full Creator and repository browser workflows passed locally. CI also passed the V2 Chromium/Firefox suite; an existing timestamp wait was made safe while the first imported scene is still awaiting its asynchronous save. Final CI verification is being completed before merge. Tests use controlled storage; production Firebase permissions and physical-device checks remain unverified.

## Dashboard canvas, ideas and Journal tools — October 26, 2026

Added free panning/zooming to the main Dashboard scene, compact Home/zoom/select/Ideas tools, local area capture and account-owned saved ideas. Existing two-region navigation and all task workflows are retained. A snapshot is an image plus view metadata, not an editable copy of its source widgets. The capture module is lazy-loaded; WebGL supplies a fresh frame on request without enabling preserveDrawingBuffer or changing idle rendering budgets. The on-demand idea shelf supports title, category, notes, failed-write retry with a retained draft, image download and return-to-view. Today’s Plan now has an orb-centre entry on phone and desktop, with the current task preview on phones and a shared queue drawer.

Refined Journal icons and added 24 presets, unrestricted custom RGB/hex colours, recent colours, independent pen/highlighter width/opacity and whole-stroke/area erasers with size and cursor feedback. This uses the existing renderer and stroke persistence. The original Journal React source is missing; a narrowly scoped settings extension to its existing bundle bridge connects the new readable adapter. It does not rebuild or replace the Journal app.

Validation is in progress. New pure tests cover unbounded signed camera positions, point-preserving zoom, reverse-direction crop selection and bounded idea records. Chromium feature scenarios cover pan/zoom/reload, real DOM crop rendering, explicit save, denied-write retry, draft recovery, account separation, phone plan access and atomic plan changes. Journal fixtures execute the exact active bundle settings bridge and stroke renderer, checking custom ink pixels, transparent area erasure, whole-stroke mode, per-tool preferences, selection-mode synchronisation and phone/tablet panel bounds. These fixtures do not establish production Firebase permissions or physical Pencil behaviour. Existing full repository and Chromium/Firefox V2 checks remain the merge gate.

Limits: snapshots capture the current visible dashboard area and may use system-font fallbacks; Safari and physical-device capture are unverified. The shelf shows the latest 40 records, and previews are deliberately compressed. The main dashboard camera is free; My Workspace retains its existing board layout. No Journal canvas geometry migration is included.

## Journal free canvas — October 26, 2026

Applied the requested free movement specifically to Journal: unbounded signed panning, bounded zoom, Home/Fit, touch pan/pinch and a compact capture action. The readable viewport adapter shares the existing Journal API and storage. A narrow patch to the single active bundle connects its renderer, pointer mapping, live eraser and existing authenticated Firestore SDK. The missing original Journal React source remains a maintenance limitation; the main React build does not regenerate this bundle. Existing Dashboard improvements remain.

Journal captures reuse Dashboard Ideas, with Future idea / YouTube idea / custom category, notes, draft recovery and retry. Dashboard return actions now distinguish Journal captures from Dashboard captures. Selection/text overlays follow the camera, and cross-date/account text commits are guarded. No auth/rule broadening or destructive migration.

Verification: Journal browser fixtures execute the active bundle bridge and renderer and cover camera movement without stroke mutation, world mapping, mode transitions, compressed capture, denied-write retry, draft resume, saved date/view restoration, phone finger panning without ink and finger capture. Full repository checks and V2 browser verification are the merge gate. Native-style layout checks at 320, 393 and 1440px verify that the legacy 1,800/2,200px page is replaced with a screen-sized canvas and its backing store resizes with the viewport. Other Journal sections retain their existing scrolling. Production signed-in permissions, physical Pencil and Safari remain manual checks. Fit uses stroke-point bounds; text can extend beyond those bounds. Saved captures contain the visible selected area only; camera settings are local per account/day.
