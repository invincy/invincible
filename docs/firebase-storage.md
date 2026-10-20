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

V2's My Workspace writes explicit Kanban lane moves to the same task documents. Each move reads the latest task in a transaction, rejects missing records, and updates only status/timestamp. Entering Today atomically merges the existing daily plan to add and activate the next unfinished step, preserving existing queue entries. Viewing V2 still performs no automatic business writes.

V2 project editing and plan import also use `users/{uid}/tasks/{id}`. Parent steps and the legacy text/done `subtasks` mirror remain compatible. Substeps and their notes are canonical in `stepSubsteps[parentStepId]`, within that same document; V2 combines them into its editable tree. Keeping child data outside the parent arrays prevents older V1/backend normalizers from deleting it. Existing inline `steps[].substeps` are accepted on read and placed into this map on an explicit V2 save. No bulk migration runs. A completed legacy parent displays its children as completed in V2; completion still counts parent steps for the existing progress model.

Append imports read the latest server record, add only fresh step IDs, preserve existing project metadata/notes/unknown fields and reject deleted targets. Stable import IDs and creation tokens make retries after an unconfirmed commit idempotent. Full content edits compare a normalized content signature (including children) in a transaction; a concurrent content change aborts the save with the draft retained. Status/timestamp-only changes do not conflict and are preserved. Drafts are account/document-scoped local browser storage, not cloud records; they survive reload and failure, and clear only on explicit discard or successful save. No Firebase configuration, rules, Functions deployment or collection path changed.

Validation: `cd react && npm run build`; `node --test tests/storage-regressions.mjs`; `node tests/storage-browser.cjs` (requires Playwright and Chromium; executable path can be overridden via `CHROMIUM_EXECUTABLE`).

Journal's original source project is not included here. Only the active v11 application bundle is retained in the working tree; previous versions remain in Git history. The v11 bundle redirects its stroke hook to the readable adapter, adjusts auth persistence order, observes account changes, and displays sync status. A future Journal rebuild must retain that adapter or port its behavior into its source hook.

Daily reminders use a `seriesId` on newly generated occurrences under the existing `users/{uid}/reminders` collection. Completion uses a Firestore transaction, reads current server fields, and writes both the completed source and the next occurrence atomically. Already completed/deleted sources are no-ops; successor IDs use the original series ID and next due timestamp, so IDs do not grow each day. No stored paths or existing record IDs are migrated. Missed daily dates are skipped when completing an overdue occurrence; previously created duplicate records are left untouched. The reminder listener reports cached data separately from server sync and clears account state when the UID changes.

## Creator storyboard — October 19, 2026

The New Content dialog and project storyboard use the existing `creatorProjects/{projectId}` document. The full voiceover remains in `script`; storyboard rows are the existing ordered `scenes` array. Each scene adds optional free-text `visual` (Visual/Animation) and `assets` fields alongside `voiceover` and numeric `duration`. Duration retains the production workspace's 1–60 second range. Missing durations are estimated only when importing or creating a scene. No migration, new collection, security-rule change or automatic conversion of old scripts is required.

Scene normalization now retains unknown fields, existing IDs, prompt fields, completion flags, generated asset URLs and project metadata. Old scene prompt fields are not moved into the new planning fields. New Content saves after confirmation from the existing merge write; failures retain the form and the same document ID for retry. Project edits reuse the existing debounced save queue and per-account recovery draft. Table import previews every cell, defaults to append, and confirms replacement; direct storyboard imports leave the full voiceover unchanged. A table transferred from Full voiceover becomes joined narration only after the user confirms the shot import.

The existing whole-document concurrent-edit limitation still applies. Controlled storage tests do not establish production Firebase permissions; a signed-in production write was not performed.

Timeline imports store the original range in an optional scene `timeline` string and derive `duration` from its end minus start. Editing a shot's numeric duration clears that source range. The extra field stays in the same scene array and requires no database migration.

Direct storyboard imports now initialize an empty `script` field from the shot voiceovers, joined in shot order, in New Content and the project editor. Existing nonempty scripts are never overwritten. The derived script and shot edits continue to use the existing `creatorProjects/{projectId}` document and save queue; no migration or new collection is needed.

The project page now edits `characterPrompt`, `imagePrompt`, and `videoPrompt` within each storyboard scene instead of a second scene list. Drafting prompts fills only blank values using scene `visual` and `assets` plus project visual settings. These remain fields of the existing ordered `scenes` array; focused production state, completion flags and asset links continue to use the same document and save queue.


## Creator production workbench — October 20, 2026

Creator remains a native page, not a new React app. The existing ordered scenes array is canonical for narration and chronological order. Additive scene fields: productionMethods[], animationGroupId, blenderFile, blenderPrompt, camera, technicalNotes, assetReferences, production[method], voiceoverReady, editingDone, sceneState and checklist[]. Existing IDs, unknown fields, scripts, hooks, notes, legacy prompt fields and URL/done flags are retained.

The same creatorProjects document adds animationGroups[] (id, name, blenderFile, resources, shared Blender production flags) and assets[] (id, name, type, path, sceneIds[], groupIds[], status, notes). Only metadata and references are stored. Local Windows paths can be copied; only HTTP(S) references receive open links. No uploads, new collections, indexes, authentication changes or rule changes were added.

Storyboard, Production, Assets and Overview read this single project. Blender and AI Video filter multi-select scene methods. Editing includes all scenes requiring final editing (needsEditing defaults true). Blender tasks use group-level production when a scene has a group; other method tasks stay on the scene. Ready Blender work does not complete scenes. Scene completion requires declared method work, referenced assets, voiceover, checklist and editing. Untouched completed legacy scenes remain completed. Project percentage counts actual task flags and explicit scene review; shared Blender tasks count once per group.

TSV, Markdown and voiceover-only imports are deterministic, previewed and append-only in the project workbench. The retained New Content editor also accepts both table formats and retains its explicit, confirmed replacement action. Optional field mapping is available in the project workbench. Duplicate detection compares narration, visual instructions, source timing and generation prompts. Status text is retained for review; an imported Completed label never claims production is finished.

Overview derives the chronological script from scene narration. The existing script property remains an editable full-script draft. Review scenes-to-draft and draft-to-scenes before applying changes; draft-to-scenes requires one blank-line-separated paragraph per scene. Changed narration clears voiceover readiness and scene completion. The older full-script editor, splitter, generator brief, focused prompt editor, sharing and generated-asset tracker remain available.

Persistence reuses the existing authenticated save queue, live snapshot and per-account recovery draft. This still writes the whole project and does not resolve simultaneous edits by multiple editors. Firestore document size limits still apply to metadata-heavy projects. Existing scene durations remain limited to 1–60 seconds. Production permissions and cross-device writes require a real signed-in check.

Verification is recorded in docs/code-review.md. No production data or Firebase configuration was changed.
