# Invincible

Invincible is a personal dashboard for projects, focus sessions, work, finance, reminders, vehicles, journaling, and an AI assistant. The public site is served from this repository through GitHub Pages at `https://invincy.github.io/invincible/`.

This document is the starting point for understanding what runs today, where to edit it, and what we are doing next. The React migration is **partial**.

## Current structure

| Area | Entry point | Code to edit | Runtime |
| --- | --- | --- | --- |
| Dashboard | `index.html` | `react/v2/SpatialApp.jsx` | Main React app |
| Invincible AI | `ai/index.html` | `react/src/features/invincible-ai/` | Main React app + Firebase callable Function |
| Task workspace | `task/index.html` | `react/src/TaskPage.jsx`, `task-model.js`, `useTasks.js` | Main React app |
| Finance | `journal/finance.html` | `react/src/FinancePage.jsx`, `finance-storage.js` | Main React app |
| Reminders | `reminders/index.html` | `react/src/RemindersPage.jsx`, `reminder-model.js`, `reminders/reminders.css` | Main React app |
| Workday | `workday/index.html` | `react/src/WorkdayPage.jsx`, `workday.css` | Main React app |
| Garage | `garage/index.html` | `garage/garage.js`, `garage-model.js` | Native JavaScript modules |
| Creator Studio | `creator/index.html`, `project.html` | `creator/creator.js`, `project.js`, `scene-tools.js` | Native JavaScript modules |
| Journal | `journal/index.html` | `journal/journal-strokes-hook.js`, `advanced-tools.js`; existing `assets/journal-v11.js` | Separate bundled React app |
| LIC | `lic/index.html`, `lic/bima-platinum/index.html`, `lic/follow-up/index.html` | `lic/` | Native pages; follow-ups use Firebase |
| Portfolio | External Apps Script link; separate legacy `portfolio.html` URL | Apps Script deployment; local viewer remains supported | Separate origin/backend |

The main React app chooses and lazily loads its page in `react/src/App.jsx`. Its HTML entry points load the same generated JS/CSS assets. Garage, Creator, Journal, and LIC have their own entry points; they are not silently redirected through React.

## Shared code and ownership

- `shared/navigation.js` owns page links, route matching, mobile-tab defaults, and preference validation. React's `AppShell.jsx` and native `site-nav.js` render that same data. Native HTML contains only a navigation mount and a Dashboard fallback link.
- `shared/firebase-config.js` owns the Firebase project configuration. `react/src/firebase.js` adapts the installed SDK; `shared/firebase-client.js` adapts the browser CDN SDK. These runtime adapters share configuration and persistence policy, but do not duplicate the app's database state.
- `react/src/features/today-plan/useTodayPlan.js` still stores the daily focus queue used by the timer and Task workspace. The removed **Today's Plan card** is no longer part of the UI; removing its data hook would break the active focus workflow.
- `react/src/task-model.js` owns browser task normalization. Backend validation/domain code lives in `functions/src/domain/` and `functions/src/tools/`. Their different validation rules are intentional.
- `react-dist/` is generated deployment output. Rebuild it from `react/src/`; do not fix the compiled main-app bundle by hand.

## Firebase and sign-in

LIC → **Follow-up Manager** opens the native customer workspace at `lic/follow-up/`. Upload or paste CSV, map columns, preview every row, then import. Policy number and name are required; the standard `858.csv` headers map automatically. `OP_Neft1`, `OP_Neft2`, and `OP_Neft3` are **OP-NAPped linked policy numbers**, never banking/NEFT status. Search includes all three linked numbers. The dedicated missing/invalid-mobile + OP-NAPped view finds policyholders who need contact details; reported wrong numbers are also included in the broader Uncontactable view. Not yet contacted means a valid mobile with no logged attempt, while No answer records an attempt without claiming contact.

Click a valid mobile to open the device's calling app. Select a quick response, optionally edit notes and the next follow-up date, then save. History and schedules persist in the existing Firebase account. Corrected mobiles survive CSV reimports. Reimports match the complete policy-number string, preserving leading zeroes, workflow fields and history; blank cells do not clear existing details, and linked policy lists are combined. Conflicting duplicate rows and malformed dates/amounts block import; identical duplicate rows collapse. Imports are limited to 5 MB / 5,000 rows and save in 100-policy transactions, with safe retry after partial failure. No customer CSV or customer details are checked into this public repository.

The default view is **Active cases**. Saving **Completed** or using **Remove from active list** archives the case without deleting remarks or history. Use **Archived cases** (or **All saved cases + history**) to find it, then **Restore to active list** to reopen it. CSV import defaults to **Replace active list**: after all incoming rows save, absent active cases move to the archive. The preview shows the number to remove. **Add/update only** keeps other cases active. Cases previously archived because they were missing return automatically when their policy number reappears; completed or manually removed cases remain archived until explicitly restored. Matching policies always retain past remarks/history.

Run `node --test tests/lic-follow-up.mjs` and `node tests/lic-follow-up-browser.cjs` for focused coverage. Optionally set `LIC_SAMPLE_CSV` to a local sample file to validate the original 104-policy sample without adding it to Git. Browser fixtures exercise the actual page/storage adapter with synthetic data; they do not establish production Firebase access.

Internal pages use Firebase project `life-by-adichimp` and the same persisted Google account on the site origin. Authentication must finish restoring before protected data loads. Native and React SDK adapters prefer browser local persistence and fall back to IndexedDB. The external Apps Script Portfolio runs on a different origin and cannot inherit this browser Firebase session.

Personal data belongs under `users/{uid}`. Shared Creator and Workday records have explicit owner/editor fields. [Firebase storage notes](docs/firebase-storage.md) contain the path map and recovery behavior; [AI architecture](docs/invincible-ai-phase-1.md) describes the callable/tool boundary.

Legacy task `subtasks` mirrors are still written alongside `steps` for compatibility. Removing that stored duplication requires a planned data migration and verification of all consumers; it is not a source-file cleanup.

## Styles and generated assets

The main Dashboard is the spatial workspace in `react/v2/SpatialApp.jsx`, mounted by the root React router without the older AppShell. Other React modules keep their existing shell; native modules retain their own entry points. Dashboard/orb styles remain in `dashboard.css`, with the spatial shell in `react/v2/spatial.css` and scene layout in `dashboard-guide.css`.

`npm run build` clears generated assets, builds content-hashed entry/chunk/CSS filenames, and refreshes all six HTML loaders automatically. Do not add query versions to the JavaScript entry: lazy chunks must import the identical entry URL. JavaScript is split by page and the shared Firebase SDK; CSS intentionally remains one generated asset to preserve existing cross-page style order. Native navigation is an ES module; every native page must load it with `type="module"`.

Journal contains one active application bundle. Its original React source/build project is not present in this repository. The readable stroke hook adapter controls drawing persistence; recovering Journal's source is required before a complete integration into the main React app. Older bundles remain recoverable through Git history.

`manifest.webmanifest`, `pwa-register.js`, and `service-worker.js` are the main PWA entry points. `reminders/service-worker.js` is a deliberate retirement endpoint for old installations: it deletes only old Reminders caches and unregisters itself. Do not delete that URL while old installations may still request it. Reliable offline app loading and scheduled notification delivery are not verified features of the current main worker.

## Local development and checks

The spatial workspace (formerly V2) is now the main Dashboard at `/invincible/`. The former V1 Dashboard component and generated chunk are removed; its shared hooks and Firebase services remain for other modules. Its Kanban supports saved lane moves, project creation/editing and structured plan imports. Run `npm ci`, `npm ci --prefix react`, then `npm run dev:v2` and open the printed `/invincible/v2/` URL (normally `http://localhost:5173/invincible/v2/`). Do not open the HTML file directly. `npm run build:v2` writes only to `v2-dist/`; `npm run preview:v2` serves that build. See [V2 implementation and stability audit](docs/v2-spatial-workspace.md) for the two-region scope, shared authentication/data boundary, verification and remaining phases. `npm run build` builds the canonical home and existing React module entries. `/invincible/v2/` remains a compatible entry to the same spatial component.

V2 uses an open focus scene: Main Dashboard places one compact project focus, timer and Workspace entry around a large interactive Orb. Nine icon glows on the Orb use the shared navigation registry; the current task opens its project editor from the center. The top navigation shows two connected spaces, and the full four-lane Kanban board lives in My Workspace. V2 scene rules are in `react/src/dashboard-guide.css`; shared dashboard/orb styles remain in `react/src/dashboard.css`.

In My Workspace, drag a card between lanes or use its Move menu. The grip supports touch dragging while the rest of each card keeps normal scrolling. Moves update the existing owner's task status; entering Today atomically adds/activates the next unfinished step in the existing daily plan. Failed saves restore the original lane. Lane moves preserve notes, steps and unknown fields, and do not persist card order within a lane.

Choose **Paste plan** to preview the [custom GPT plan format](docs/plan-format.md), then create a project or append to an existing one. Numbered steps contain checkbox substeps and optional notes. **New project** uses a compact editor; selecting a saved project opens its flowing task workbench, where steps appear as connected spatial nodes and the selected node reveals its title, notes, subtasks, status and completion controls. The workbench supports pan, zoom, node repositioning, fit-to-workflow and a touch-friendly mobile route. Drafts are stored per account on this device until an explicit successful save or discard. Existing-project saves check for concurrent content edits; append transactions read the latest record and retain existing content. Child records are stored in the task's `stepSubsteps` map, keyed by parent step ID, so legacy writers of the parent `steps`/`subtasks` arrays cannot erase them. Parent completion drives the existing project progress; lane status is still controlled by Kanban moves.

`npm run stage:v2` prepares the separate `v2/` publishing directory for a same-origin GitHub Pages preview. The canonical home is deployed by the existing Pages workflow from `master`; the same-origin Firebase session is reused in the same browser profile.

Install dependencies using the checked-in locks:

```sh
npm ci --prefix react
npm ci --prefix functions
```

The Functions deployment targets Node 22. The cleanup checks here also ran under the available Node 24 runtime; deployment compatibility still needs its own Node 22 environment.

```sh
npm run build          # Vite build into react-dist/
npm run check          # local asset references and module navigation loaders
npm run test           # navigation, storage, worker retirement, and backend tools
npm run test:browser   # Garage, navigation, dashboard and reminder browser integration
```

Browser tests need Playwright and Chromium. Set `CHROMIUM_EXECUTABLE` to an installed browser executable when the provided runtime path is unavailable. Browser fixtures use a controlled Firestore adapter, not production account data. Optional live-rule tests use `npm --prefix functions run test:emulator`.

After changing a feature, run the checks relevant to its behavior. Never interpret a mock test or successful build as proof of production Firebase permissions.

The Task workspace shows a Copy button beside Add to today for every open step. It copies that step's complete Working notes text, including line breaks, to the clipboard and briefly confirms success. Copying does not save, edit, or change a step's status. `tests/task-copy-browser.cjs` exercises the shared step view with controlled data, including the Test Runs step, a denied clipboard write, and 320px/393px phone widths. For this change, `npm run test`, `npm run build`, `npm run check`, and the targeted Chromium browser test passed on a GitHub Actions runner. Clipboard behavior in other browsers and a signed-in production session remains unverified.

## Work completed and next steps

The October 3 cleanup removed 15 obsolete files, including seven old Journal bundles, unused pre-React Workday/Reminders scripts and styling, and the unused Today's Plan card. It removed unused focus-queue methods, an unused Garage helper, an unused import/worker constant, and exact duplicate CSS rules. Navigation configuration is shared, old inline navigation copies are gone, ignore rules are centralized, and Dashboard HTML is now a small entry point.

The [code review](docs/code-review.md) records validation and remaining risks. The next work should follow this order:

1. Verify Google-session reuse and read/write/edit/delete access against deployed Firebase with a real signed-in account.
2. Resolve the AI's status-derived focus versus the dashboard's daily queue. Overdue reminders and atomic daily completion are now covered by regression tests.
3. Add conflict handling for simultaneous Creator edits before broadening collaboration.
4. Migrate Garage and Creator into the main React app while preserving paths, record IDs, and saved data.
5. Recover Journal's source and migrate its drawing UI. Route splitting and Dashboard CSS consolidation are complete; remaining pages need their own responsive/style audit.

This cleanup changes code organization and removes unreachable implementations. It does not delete user database records or claim that every remaining product issue is resolved.

## Tablet and reminders follow-up

Overdue reminders have their own visible group. Daily completion reads the latest reminder and atomically marks it complete plus creates one deterministic next occurrence. Repeated completion is a no-op. Completing a missed daily reminder schedules the next calendar day at its original local time, skipping missed dates; historical duplicates are not deleted. Save failures retain the card/form for retry. Loading states appear while auth, routes, tasks and reminders restore.

The responsive browser check uses 24 realistic long-text task records across 14 viewports, including 1024×768, 1180×820, 768×1024, 820×1180, and 320–507px split-screen widths. These are controlled records in Chromium, not actual user data or iPad Safari. Signed-in production permissions and physical-device checks remain outstanding.

## Particle orb rendering

`react/src/FocusOrb.jsx` owns the WebGL renderer and interaction lifecycle; `orb-particles.js` owns the deterministic particle tiers. All three stream families taper from a 3.4-point head to a 45% tail, with a power-curve alpha fade and sampling that tightens with the radius. The globe motion, tilt, breathing, pointer/drag/inertia formulas, palettes, fallback dots, reduced-motion fixed time and `theme` prop remain unchanged.

| Setting | Previous | Current |
| --- | --- | --- |
| Desktop particles | 59,120 | 19,456 |
| Particles at ≤1024px | 55,520 | 14,544 |
| Low-capability desktop / mobile | Same budgets as above | 14,544 / 11,112 |
| Desktop vertex buffer | 1,182,400 bytes | 389,120 bytes |
| Mobile vertex buffer | 1,110,400 bytes | 290,880 bytes (222,240 at low tier) |
| Idle / interactive desktop cadence | 45 fps cap, rAF with skipped frames | 24 / 40 fps target, timer then rAF |
| Idle / interactive mobile cadence | 30 fps cap, rAF with skipped frames | 24 / 30 fps target, timer then rAF |
| Maximum pixel ratio, desktop / mobile | 1.5 / 1 | 1.25 / 1 |
| WebGL antialias | Enabled | Disabled; low-power preference retained |

These orb tiers apply only where the orb is mounted (700px and wider); phones below 700px create no orb canvas or WebGL resources. Low capability means a reported `hardwareConcurrency <= 4` or `deviceMemory <= 4`; absent values do not force that tier. Cadence figures are scheduling targets: display refresh and device load can lower actual fps. Static GL state is initialized once and projection/viewport/point scale update only on resize. Context restoration rebuilds program/buffer/state while keeping interaction and time state. Visibility and intersection pause both scheduling stages; unmount removes observers/listeners and releases GPU resources.

`npm run test:browser` includes `tests/focus-orb-browser.cjs`, which records before/after cyan/emerald/gold screenshots at 280, 480 and 800 CSS pixels with reduced motion and fixed shader time 8. The baseline defaults to PR #59's merged commit; `ORB_BASELINE_REF` can select another baseline, and `ORB_CAPTURE_BASELINE_ONLY=1` captures just that baseline. Comparison images and counts are in ignored `.test-output/orb/`. Browser checks cover paced idle/hover and mobile interaction, context loss/restoration, resize/DPR, drag/inertia, low tiers, reduced motion, offscreen/document visibility pause and unmount cleanup. These are Chromium software-rendering checks, not real-device power, battery, total-memory or Safari measurements.

## Creator Studio storyboard

In New Content, paste the complete recording narration into **Full voiceover**. Use **Storyboard → Paste a table from ChatGPT** for tab-separated columns **Voiceover, Visual/Animation, Assets, Duration**. Headers may be included (and reordered); without headers, use that exact column order. Quoted cells support multiline text. Preview the table, then append the shots or explicitly replace existing shots. Invalid columns/durations are rejected before changing any shots.

Tables headed **Visual / Animation**, **Assets Required**, and **Timeline** also work. A range such as `4–11s` becomes a seven-second shot and remains visible as its source timeline. Pasting a complete table immediately shows a preview and an import button; the shots are added only after you choose that button. If you pasted the table into Full voiceover, use **Preview it as shots** beside that field. The table stays there while you review; after you add the shots, its Voiceover column becomes the separate full narration. The project page's advanced import accepts the same four-column table as well.

In **New Content**, adding reviewed shots puts them in the unsaved form. The footer stays visible as you scroll, shows the shot count and total duration, and has **Save and open project**. Enter a working title and use that button to save the project. Once the project opens, later storyboard edits use the project's automatic save flow.

On the project page, **Scenes** is the main workspace. Paste the four-column table there; an empty project opens the paste panel automatically. Each scene keeps its voiceover, visual plan, assets and duration together. Open **Scene production** below that plan to edit Character, Image and Video prompts. **Draft prompts from plan** fills blank prompts using that scene's Visual/Animation and Assets plus the shared visual settings; it leaves written prompts alone. The focused scene view and asset tracker remain one click away. If Full voiceover is blank, imported shot narration creates a continuous recording script. Full voiceover and visual settings stay editable below the scenes. The old plain-script quick split sits under **Have only a plain script?**; importing a completed prompt table is under **More tools**. **Copy generator brief** uses the current shot plan without changing shot order or timing.

Every shot can be edited, added, removed or moved with the arrow buttons. Desktop shows four planning columns; phones stack the fields into shot cards. Saving opens the project workspace, where the same scenes remain editable and autosave. Full narration, production notes, workflow stages, advanced prompt import and asset tracking remain available. Pasting directly into the storyboard leaves an existing full narration unchanged.

Run `node --test tests/creator-storyboard.mjs` for import/compatibility tests and `node tests/creator-storyboard-browser.cjs` for the controlled storage/browser workflow. The latter is also part of `npm run test:browser` and accepts `CHROMIUM_EXECUTABLE`, or uses Playwright's installed Chromium.


## Creator production workbench

Open a content project to use **Storyboard**, **Production**, **Assets** and **Overview**. Paste a four-column TSV or six-column Markdown table into Storyboard, review column mapping and every row, then append scenes. Exact duplicates are skipped. Assign multiple production methods, switch to Blender or AI Video queues, and group Blender scenes under one animation project with shared file/resources and modeling/animation/rendering flags. Editing includes scenes needing final assembly. Producing an asset never completes its scene automatically.

Assets keeps file/URL metadata with scene and animation-group associations. Overview shows required work and a chronological script derived from narration; full-script edits are applied to scenes only after a review. Existing project scripts, hooks, notes, sharing, focused prompt editing and asset links remain available. Details and storage constraints are recorded in [Firebase storage notes](docs/firebase-storage.md).

Run the repository checks and Creator browser suite: npm run test, npm run build, npm run check, npm run test:browser. CI runs these for Creator changes. Signed-in Firebase access needs separate verification.

Recorded voiceover timing can be pasted in an optional final **Timestamp** column. For the planning TSV use `Voiceover`, `Visual / Animation`, `Assets Required`, `Timeline`, `Timestamp`; prompt Markdown tables may append Timestamp after Video Prompt. Example audio timing: `00:31.250–00:40.800`. This stays separate from the planned Timeline and is editable beside scene narration. Creator stores the supplied timing exactly; it does not analyze or align the audio itself. Existing tables without Timestamp still work.


### Direct Creator scene completion

Use **Complete** at the bottom right of the active scene, or select **Completed**, to finish a scene immediately. Asset links/uploads, task flags, narration readiness and checklists are optional bookkeeping, not completion gates. Completed changes to a **Completed** button that can reopen the scene. Task and shared-asset states remain independent; finishing Blender work never finishes a scene automatically. The existing project autosave and recovery draft persist the decision. Project progress counts completed scenes and remaining tracked work without requiring already completed scenes to be backfilled.

### Free dashboard and saved ideas

Drag the main dashboard background or swipe to pan in any direction. Wheel moves the camera; Ctrl-wheel, pinch or the compact +/− controls zoom it. Home returns to the starting view. Select an area, choose **Save area**, then add a title and Future idea, YouTube idea or custom category. **Ideas** reopens saved images and notes, downloads a capture, or returns to its camera view. Only an explicit save writes a new idea. Today’s Plan is accessible in the orb centre on desktop and mobile and uses the existing queue.

Journal’s drawing toolbar now has consistent icons, a 24-colour palette plus custom colour/hex entry, width and opacity previews, separate pen/highlighter preferences, and adjustable whole-stroke/area erasers. Existing handwriting, selection, undo/redo, Pencil guard and stroke syncing remain. Run `node tests/journal-tools-browser.cjs` for the controlled settings/renderer checks.
