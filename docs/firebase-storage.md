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
| LIC Follow-up Manager | Native JavaScript | `users/{uid}/licFollowups/{policyId}` and `history/{eventId}` beneath each policy |

This is a partial React migration. Garage and Creator have not been moved into the main React app. LIC landing/product pages are static content; its Follow-up Manager adds private, editable policy records through the shared Firebase adapter. The separately hosted Portfolio is outside this repository and has not been migrated to Firebase here.

## LIC follow-ups — October 26, 2026

The Follow-up Manager restores shared auth before listening, disposes policy/history subscriptions on account changes, rejects stale callbacks and checks the active account before each transaction. Policies use deterministic `p-` + URL-encoded normalized policy-number IDs; normalization trims whitespace and uppercases letters without numeric conversion. One policy is one record; customers are not merged by name or shared phone. `opPolicies` contains linked OP-NAPped policy numbers derived from `OP_Neft1/2/3`, with no bank-status field.

Import transactions read at most 100 current documents before writing, merge nonblank source fields and union linked policies, preserving unknown fields, phone overrides and all follow-up state. Repeating any completed or partially completed import does not create another policy. Imported source status is separate from follow-up outcome. Empty source values never erase saved values. No automatic import runs on page load.

Response transactions read the latest policy and a stable event ID, then atomically update the current outcome/schedule and append `history/{eventId}` with a server timestamp, note, response, follow-up date and optional phone correction. A response ID is held across failed/uncertain acknowledgements; retries cannot append the event twice. Forms retain and freeze that response until retry or close. History is stored as separate documents so it does not grow the policy toward Firestore's document-size limit. Simultaneous response transactions preserve all history; the latest committed response controls the current schedule/outcome. Reimport never touches history.

Case removal is reversible: `archived`, `archiveReason` (`manual`, `completed`, or `missing_csv`) and `archivedAt` live on the same policy document. Manual archive/restore writes an idempotent history event transactionally; completion archives in the existing response transaction. Restoring a completed case changes its current outcome to `reopened`, leaving the completed event in history. No policy/history deletion API is used.

Replacement imports read candidate missing documents from the server before importing. They save all incoming rows first, then archive missing active cases in chunks of 100 with removal-history events. Each archive transaction reads the latest document, preserving remarks, schedules and unknown fields. It skips already archived cases or cases updated by another import since the initial read. Partial archive failures can be retried; existing archived cases are skipped. A failed incoming-row phase never starts archiving. A returning `missing_csv` case is reactivated by import; `manual`/`completed` archives are preserved. Add/update-only imports do not archive absent cases. Empty input cannot replace a list. This is a resumable multi-transaction import, not an atomic replacement of the entire collection.

Missing/invalid mobiles and a reported wrong number define contactability independently of attempted/contacted timestamps. Opening a `tel:` link does not assume a call happened. No answer counts as attempted, not contacted; note/schedule-only logs do not count as calls. Completing a policy clears its pending follow-up. Correcting a phone clears its wrong-number marker without erasing past attempts.

Existing owner-only `users/{uid}/**` rules cover these paths. No Firebase project, authentication configuration, rules, Functions deployment, existing records or migration changed. The sample CSV stays outside the repository. Controlled tests cover import retries, history preservation, stale accounts and denied/uncertain saves; a real signed-in production permission check remains outstanding.

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

Storyboard, Production, Assets and Overview read this single project. Blender and AI Video filter multi-select scene methods. Editing includes all scenes requiring final editing (needsEditing defaults true). Blender tasks use group-level production when a scene has a group; other method tasks stay on the scene. Ready Blender work does not complete scenes. Scene completion is an explicit creator decision stored in the existing completed boolean and sceneState. The Complete button and Completed selector work without asset links/uploads or production, voiceover, editing and checklist bookkeeping. They do not mark shared tasks, assets or other scenes ready. Untouched completed legacy scenes remain completed. Project percentage counts completed scenes plus actual task flags for pending scenes; shared Blender tasks count once per group.

TSV, Markdown and voiceover-only imports are deterministic, previewed and append-only in the project workbench. The retained New Content editor also accepts both table formats and retains its explicit, confirmed replacement action. Optional field mapping is available in the project workbench. Duplicate detection compares narration, visual instructions, source timing and generation prompts. Status text is retained for review; an imported Completed label never claims production is finished.

Overview derives the chronological script from scene narration. The existing script property remains an editable full-script draft. Review scenes-to-draft and draft-to-scenes before applying changes; draft-to-scenes requires one blank-line-separated paragraph per scene. Changed narration clears voiceover readiness and scene completion. The older full-script editor, splitter, generator brief, focused prompt editor, sharing and generated-asset tracker remain available.

Persistence reuses the existing authenticated save queue, live snapshot and per-account recovery draft. This still writes the whole project and does not resolve simultaneous edits by multiple editors. Firestore document size limits still apply to metadata-heavy projects. Existing scene durations remain limited to 1–60 seconds. Production permissions and cross-device writes require a real signed-in check.

Verification is recorded in docs/code-review.md. No production data or Firebase configuration was changed.


New Content and Edit content now use the same production workbench over an isolated in-memory project draft. Only the explicit Create and open project / Save changes action writes scenes, animationGroups and assets to the existing creatorProjects document. Nested arrays are cloned on open, so cancelling changes to shared groups/assets does not mutate the pipeline's live records. Metadata timestamps and unknown fields continue to come from the original document. No storage paths or rules changed.


The standalone script/settings/import panels were removed from the saved-project page. Overview edits the same script, visualStyle, aspectRatio, language, characterBible and continuityNotes properties; no project data is removed. The generator brief and rough-script action use the canonical project state rather than duplicate DOM fields. New Content persists these optional visual properties alongside the isolated scenes/groups/assets draft.


The legacy focused scene overlay and standalone duplicate panels are no longer the project entry flow. All scene work stays in the shared structured table. Method/readiness/completion/search filters are view state only; they do not copy or reorder stored scenes. Shared Blender readiness can be Ready while a scene remains incomplete because voiceover, AI clips or editing are pending. Visual settings, script review and the generator brief use the same existing project fields in Overview. Legacy asset booleans and links remain in scene details. No collection, rule or auth changes.


Compact-workflow follow-up: pagination, active row, collapsed asset rows and section folds are presentation state. Only the 8/16/All row-count preference is saved under invincible.creator.pageSize in local browser storage; no cloud scene list is shortened or reordered by paging. The creation dialog's script/hook/notes controls are now hidden serialization fields synchronized with Overview, removing duplicate visible editors while preserving existing project properties. No migration, collection, security-rule or auth changes.


Scene-navigator follow-up: focused/all mode, active scene, sidebar visibility and expansion are in-memory presentation state over the existing scenes array. No scene copies or per-mode persistence systems were introduced. Previous/Next and the sidebar read the same method/readiness/completion/search filter result; reordering writes canonical scene IDs in their new array order. Legacy local row-count preferences are no longer read because the table/pagination UI has been removed. Sharing, saves, group tasks and imports retain existing document fields and permissions.


Viewport editor follow-up: Plan/Prompts/Progress and prompt selection are local view state. Numbered-rail colors derive from existing production flags and scene completion; they add no persisted status or migration. Compact Creator app navigation reuses the existing shared page registry and mobile-tab preferences. Data writes, permission checks and Firebase document paths are unchanged.

## Recorded voiceover timestamps — October 25, 2026

Creator scenes now support optional `voiceoverTimestamp` text within the existing `creatorProjects/{projectId}.scenes[]` array. This stores exact externally aligned audio timing, including decimal seconds, without changing `timeline` or planned `duration`. Old scenes default to a blank audio timestamp; no bulk migration runs. The usual create/save/autosave/draft flow persists the value, and normalization retains it with unknown metadata.

The unified importer maps a final Timestamp / Timestamps / Voiceover timestamp / Audio timecode column for TSV or Markdown. Headerless TSV may append a fifth timestamp cell to the existing four-column format. Preview, manual column mapping, narration-only importing and old prompt tables remain available. Duplicate identity includes audio timing so repeated narration at a different audio position is not silently discarded. Scene narration and the canonical script never include timing annotations.

The recorded time is editable next to Voiceover, visible in the desktop navigator and all-scene summary, and searchable through the existing filter. The copied production brief includes existing audio timing, requests Timestamp as the last Markdown column, and explicitly forbids invented alignment when audio timing is absent. No audio upload, transcription service, API integration, Firebase rule or collection change is involved. Controlled tests cover create/import/edit/reload and precision; real production Firebase permissions are not established by these fixtures.

## Dashboard canvas ideas and daily-plan access — October 26, 2026

The main dashboard now has a signed, unbounded pan camera with zoom. The camera is view state only, stored in per-account sessionStorage; it does not move or duplicate tasks. My Workspace, task editors, existing hashes and inter-region navigation stay intact. Home resets the camera. Pointer dragging, touch panning/pinching, wheel panning, Ctrl-wheel zoom and keyboard navigation use the same camera. Keyboard focus brings offscreen controls back into view. The surface clips native scrolling to avoid hidden scroll offsets competing with its camera.

An explicit area selection can be captured into a small WebP preview and saved to `users/{uid}/dashboardIdeas/{id}`. Each independent document stores title, category (Future idea / YouTube idea / free text), note, image, view, selected area and timestamps. The image data URL is capped at 180,000 characters and 1,100 pixels on its longest edge; full-resolution media and blobs are not stored in a shared project document. Capture is entirely local, with the renderer loaded on demand. The shelf subscribes only while open and requests the newest 40 records. Existing owner-only users rules cover this collection; no rules are broadened. Snapshot drafts use the existing account-scoped draft helper and a stable ID for retry. They can be reviewed, downloaded and reopened at their saved camera position. Responsive layout changes mean returning to a view on another screen may show a different composition; the saved image itself stays unchanged.

Today’s Plan is reachable from the orb centre on mobile and desktop. It reads the existing dailyPlans queue through the existing workspace subscription, without auto-seeding a second plan. Focus changes validate the latest plan item and task in a transaction. Adding an existing project reuses the Today lane action, including an explicit ensurePlan option for projects already marked Today but absent from this day’s queue. Source task/step completion remains unchanged.

## Journal drawing controls — October 26, 2026

The active Journal bundle remains the same application. Its existing __journalApi bridge now exposes the renderer’s current colour, width, opacity and eraser setters to `journal/drawing-tools.js`. The original React source is still unavailable; the small bridge extension is the only direct bundle change. The readable adapter supplies consistent SVG icons, 24 colour presets, native custom colour and hex input, recent colours, separate pen/highlighter settings, width/opacity sliders, and whole-stroke/area eraser controls with a cursor preview. Existing selection, handwriting, undo/redo and Pencil palm rejection remain. A tool-change event synchronises the existing advanced selection mode after choosing a native drawing tool.

Preferences remain local display/tool settings under `invincible.journal.tools.v1`. Resulting stroke colour/opacity/width use the existing stroke records and save/recovery adapter under users/{uid}/journals/{date}/strokes/{id}; no duplicate stroke store or Firebase permission change is introduced.

## Journal free canvas and saved ideas — October 26, 2026

Journal now uses a viewport camera over the same world-coordinate stroke records. Pan and zoom never rewrite or migrate strokes; the physical canvases remain viewport-sized. Per-account/day camera preferences live locally at `invincible.journal.camera.<uid>.<date>`. Drawing, pixel erasing, selection and text map through the camera. Finger input pans/pinches through the existing Pencil palm guard; Hand/Space and wheel gestures support mouse/trackpad use.

Journal area capture saves a compressed image and metadata to the existing `users/{uid}/dashboardIdeas/{id}` collection through the active Journal SDK/auth bridge. Records add `source: journal` and `journalDate`, plus the existing title/category/notes/image/view/area fields. Images are bounded to 1,100 pixels and 180,000 data-URL characters. A stable-ID, account-scoped local draft survives a denied write and closing the capture. Changing accounts closes the capture; save checks the authenticated UID before writing. No new collection, rule, storage service or stroke schema is introduced. Dashboard Ideas opens Journal captures at their original date/camera; existing Dashboard captures retain their previous return action.

Local camera preferences do not sync across devices. Saved drawings and idea records continue through existing Firestore paths. Snapshot images capture visible ink/text on white, not an editable stroke selection or the page toolbar. Real signed-in production permissions and physical Pencil/Safari gestures remain unverified.

## Dashboard camera removal — October 26, 2026

The dashboard no longer reads or writes `invincible.dashboard.camera.<uid>` or creates area captures. Existing camera preferences are harmless and ignored. Journal camera/stroke/capture persistence is unchanged. The header Ideas action still reads the same account-owned `dashboardIdeas` collection; previous images and recoverable drafts remain available. Journal idea links restore their date/camera, while legacy Dashboard ideas return to the fixed dashboard. No data is deleted or migrated.
