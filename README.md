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
| Reminders | `reminders/index.html` | `react/src/RemindersPage.jsx`, `reminders/reminders.css` | Main React app |
| Workday | `workday/index.html` | `react/src/WorkdayPage.jsx`, `workday.css` | Main React app |
| Garage | `garage/index.html` | `garage/garage.js`, `garage-model.js` | Native JavaScript modules |
| Creator Studio | `creator/index.html`, `project.html` | `creator/creator.js`, `project.js`, `scene-tools.js` | Native JavaScript modules |
| Journal | `journal/index.html` | `journal/journal-strokes-hook.js`, `advanced-tools.js`; existing `assets/journal-v11.js` | Separate bundled React app |
| LIC | `lic/index.html`, `lic/bima-platinum/index.html` | `lic/` | Static/native pages |
| Portfolio | External Apps Script link; separate legacy `portfolio.html` URL | Apps Script deployment; local viewer remains supported | Separate origin/backend |

The main React app chooses its page in `react/src/App.jsx`. Its HTML entry points load the same generated JS/CSS assets. Garage, Creator, Journal, and LIC have their own entry points; they are not silently redirected through React.

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

Dashboard style order is explicit: `dashboard-base.css` → generated app CSS → `dashboard.css` → `mobile-dashboard.css`. Base rules were extracted from the old inline HTML without changing their order. Preserve this cascade until dashboard styles are consolidated with visual coverage.

The main app's HTML asset query versions must change when JS/CSS is rebuilt. Native navigation is an ES module; every native page must load it with `type="module"`.

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
npm run test:browser   # Garage and React/native navigation browser integration
```

Browser tests need Playwright and Chromium. Set `CHROMIUM_EXECUTABLE` to an installed browser executable when the provided runtime path is unavailable. Browser fixtures use a controlled Firestore adapter, not production account data. Optional live-rule tests use `npm --prefix functions run test:emulator`.

After changing a feature, run the checks relevant to its behavior. Never interpret a mock test or successful build as proof of production Firebase permissions.

## Work completed and next steps

The October 3 cleanup removed 15 obsolete files, including seven old Journal bundles, unused pre-React Workday/Reminders scripts and styling, and the unused Today's Plan card. It removed unused focus-queue methods, an unused Garage helper, an unused import/worker constant, and exact duplicate CSS rules. Navigation configuration is shared, old inline navigation copies are gone, ignore rules are centralized, and Dashboard HTML is now a small entry point.

The [code review](docs/code-review.md) records validation and remaining risks. The next work should follow this order:

1. Verify Google-session reuse and read/write/edit/delete access against deployed Firebase with a real signed-in account.
2. Resolve the AI's status-derived focus versus the dashboard's daily queue, and review overdue/reminder completion behavior.
3. Add conflict handling for simultaneous Creator edits before broadening collaboration.
4. Migrate Garage and Creator into the main React app while preserving paths, record IDs, and saved data.
5. Recover Journal's source, migrate its drawing UI, then review CSS coverage and split the main bundle by page.

This cleanup changes code organization and removes unreachable implementations. It does not delete user database records or claim that every remaining product issue is resolved.
