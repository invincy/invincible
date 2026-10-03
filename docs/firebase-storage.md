# Invincible storage and migration audit

All internal pages use the Firebase project `life-by-adichimp`, the default Firebase app, and the same persisted Google account on `invincy.github.io`. React and native modules prefer browser local persistence, with IndexedDB as a migration/fallback store. Auth restoration finishes before protected data loads. Separate origins (including the external Apps Script Portfolio) cannot inherit this session.

| Page | Runtime | Personal data path |
| --- | --- | --- |
| Dashboard / Tasks | Main React app | `users/{uid}/tasks`, `streaks`, `countdowns`, `dailyPlans` |
| Finance | Main React app | `users/{uid}/finance/{month}` |
| Reminders | Main React app | `users/{uid}/reminders` |
| Workday | Main React app | `users/{uid}/workdaySpaces/main` and invited `workdaySpaces` |
| Invincible AI | Main React app | Existing authenticated Functions tools and private user data |
| Garage | Native JavaScript | `users/{uid}/garage/main` |
| Creator Studio | Native JavaScript | Owned/invited `creatorProjects`; legacy `users/{uid}/creator/main` import |
| Journal | Separate React bundle | `users/{uid}/journals/{date}/strokes/{id}` |

This is a partial React migration. Garage and Creator have not been moved into the main React app. LIC landing/product pages are static content, without editable user records. The separately hosted Portfolio is outside this repository and has not been migrated to Firebase here.

Garage applies each operation transactionally to the latest stored document, waits for confirmation before changing the displayed data, keeps forms open on failure, and cascades vehicle deletion to that vehicle's records. Finance transactions merge this tab's record changes into the latest month; errors retain form input. Journal keeps per-account pending writes/deletes across reload and retries them on reconnect. Creator project drafts remain on this device after failure; an unchanged cloud version can restore a draft on reload. Newer Creator edits remain dirty when an older save completes.

The repository rules allow authenticated owners of `users/{uid}/**`, and limit shared Creator/Workday documents to their owner and invited editors. Rules were not weakened. Code tests use a controlled Firestore adapter; they do not prove production permission configuration or account access. No signed-in production write/delete test or Firebase rules deployment was performed. If production returns `permission-denied` for the correct UID, the deployed rules must be checked against `firestore.rules` by a project administrator.

Validation: `cd react && npm run build`; `node --test tests/storage-regressions.mjs`; `node tests/storage-browser.cjs` (requires Playwright and Chromium; executable path can be overridden via `CHROMIUM_EXECUTABLE`).

Journal's original source project is not included here. Only the active v11 application bundle is retained in the working tree; previous versions remain in Git history. The v11 bundle redirects its stroke hook to the readable adapter, adjusts auth persistence order, observes account changes, and displays sync status. A future Journal rebuild must retain that adapter or port its behavior into its source hook.

Daily reminders use a `seriesId` on newly generated occurrences under the existing `users/{uid}/reminders` collection. Completion uses a Firestore transaction, reads current server fields, and writes both the completed source and the next occurrence atomically. Already completed/deleted sources are no-ops; successor IDs use the original series ID and next due timestamp, so IDs do not grow each day. No stored paths or existing record IDs are migrated. Missed daily dates are skipped when completing an overdue occurrence; previously created duplicate records are left untouched. The reminder listener reports cached data separately from server sync and clears account state when the UID changes.
