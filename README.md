# Invincible

Invincible is a personal dashboard for projects, focus sessions, work, finance, reminders, vehicles, journaling, and an AI assistant. The public site is served from this repository through GitHub Pages at `https://invincy.github.io/invincible/`.

This document is the starting point for understanding what runs today, where to edit it, and what we are doing next. The React migration is **partial**.

## Current structure

| Area | Entry point | Code to edit | Runtime |
| --- | --- | --- | --- |
| Dashboard | `index.html` | `react/src/DashboardPage.jsx` | Main React app |
| Invincible AI | `ai/index.html` | `react/src/features/invincible-ai/` | Main React app + Firebase callable Function |
| Task workspace | `task/index.html` | `react/src/TaskPage.jsx`, `task-model.js`, `useTasks.js` | Main React app |
| Finance | `journal/finance.html` | `react/src/FinancePage.jsx`, `finance-storage.js` | Main React app |
| Reminders | `reminders/index.html` | `react/src/RemindersPage.jsx`, `reminder-model.js`, `reminders/reminders.css` | Main React app |
| Workday | `workday/index.html` | `react/src/WorkdayPage.jsx`, `workday.css` | Main React app |
| Garage | `garage/index.html` | `garage/garage.js`, `garage-model.js` | Native JavaScript modules |
| Creator Studio | `creator/index.html`, `project.html` | `creator/creator.js`, `project.js`, `scene-tools.js` | Native JavaScript modules |
| Journal | `journal/index.html` | `journal/journal-strokes-hook.js`, `advanced-tools.js`; existing `assets/journal-v11.js` | Separate bundled React app |
| LIC | `lic/index.html`, `lic/bima-platinum/index.html` | `lic/` | Static/native pages |
| Portfolio | External Apps Script link; separate legacy `portfolio.html` URL | Apps Script deployment; local viewer remains supported | Separate origin/backend |

The main React app chooses and lazily loads its page in `react/src/App.jsx`. Its HTML entry points load the same generated JS/CSS assets. Garage, Creator, Journal, and LIC have their own entry points; they are not silently redirected through React.

## Shared code and ownership

- `shared/navigation.js` owns page links, route matching, mobile-tab defaults, and preference validation. React's `AppShell.jsx` and native `site-nav.js` render that same data. Native HTML contains only a navigation mount and a Dashboard fallback link.
- `shared/firebase-config.js` owns the Firebase project configuration. `react/src/firebase.js` adapts the installed SDK; `shared/firebase-client.js` adapts the browser CDN SDK. These runtime adapters share configuration and persistence policy, but do not duplicate the app's database state.
- `react/src/features/today-plan/useTodayPlan.js` still stores the daily focus queue used by the timer and Task workspace. The removed **Today's Plan card** is no longer part of the UI; removing its data hook would break the active focus workflow.
- `react/src/task-model.js` owns browser task normalization. Backend validation/domain code lives in `functions/src/domain/` and `functions/src/tools/`. Their different validation rules are intentional.
- `react-dist/` is generated deployment output. Rebuild it from `react/src/`; do not fix the compiled main-app bundle by hand.

## Firebase and sign-in

Internal pages use Firebase project `life-by-adichimp` and the same persisted Google account on the site origin. Authentication must finish restoring before protected data loads. Native and React SDK adapters prefer browser local persistence and fall back to IndexedDB. The external Apps Script Portfolio runs on a different origin and cannot inherit this browser Firebase session.

Personal data belongs under `users/{uid}`. Shared Creator and Workday records have explicit owner/editor fields. [Firebase storage notes](docs/firebase-storage.md) contain the path map and recovery behavior; [AI architecture](docs/invincible-ai-phase-1.md) describes the callable/tool boundary.

Legacy task `subtasks` mirrors are still written alongside `steps` for compatibility. Removing that stored duplication requires a planned data migration and verification of all consumers; it is not a source-file cleanup.

## Styles and generated assets

Dashboard owns one mobile-first stylesheet, `react/src/dashboard.css`, imported by its React page. The previous base/mobile override files are removed. Phone widths below 700px use four compact lanes in a 2×2 board, tablets from 700–1100px use two, and desktop widths above 1100px use three. Focus controls and project progress use grid flow; the active project/action heading sits inside the orb, and smaller task titles share a row with their movement arrows. The shared shell owns navigation only. Lanes retain distinct grey/gold/blue/green glass with fading top and bottom, and side rails only; phone lanes scroll internally and expand on tap. Phones below 700px never mount the orb renderer; they retain the clock and wide gold timer strip, show real focus titles when available, and omit empty focus instructions. Dashboard preserves its dark visual theme across device colour preferences and supports reduced motion; the other pages still need a wider visual audit.

`npm run build` clears generated assets, builds content-hashed entry/chunk/CSS filenames, and refreshes all six HTML loaders automatically. Do not add query versions to the JavaScript entry: lazy chunks must import the identical entry URL. JavaScript is split by page and the shared Firebase SDK; CSS intentionally remains one generated asset to preserve existing cross-page style order. Native navigation is an ES module; every native page must load it with `type="module"`.

Journal contains one active application bundle. Its original React source/build project is not present in this repository. The readable stroke hook adapter controls drawing persistence; recovering Journal's source is required before a complete integration into the main React app. Older bundles remain recoverable through Git history.

`manifest.webmanifest`, `pwa-register.js`, and `service-worker.js` are the main PWA entry points. `reminders/service-worker.js` is a deliberate retirement endpoint for old installations: it deletes only old Reminders caches and unregisters itself. Do not delete that URL while old installations may still request it. Reliable offline app loading and scheduled notification delivery are not verified features of the current main worker.

## Local development and checks

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
