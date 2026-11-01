# App update release — November 1, 2026

Applied the approved cyan orb lowercase i artwork. Profile picture opens Settings and Sign out. Settings checks the current release and offers Update and reload; open work should be saved first. Saved records and drafts are preserved. Connection errors can be retried. Existing launcher icon changes may still need Chrome's Review app update approval.

For future releases, bump the matching version values in shared/app-release.js and app-version.json and the service-worker release marker. The icon uses new PNG URLs and a maskable variant.

Local main/V2 builds, stage/reference checks and 106 unit/Functions checks passed (one additional test skipped). Local browser launch is restricted; browser verification runs in the existing GitHub Actions workflow. Physical Android launcher approval is not tested here.


## Compact dashboard and task deletion

Removed the normal connected banner and rectangular tab focus treatment; keyboard focus uses an underline. Actual task titles are compact and the empty state is a short hint. The colour selector sits at the top right of the orb area. Workspace cards now offer Delete with confirmation, pending/error feedback, attachment cleanup and draft cleanup after success, reusing the existing task deletion flow. Failed deletion retains the card for retry. Daily-plan references remain as missing historical references, matching the existing task page behavior.

Build/unit/reference checks and the full browser workflow verify this release. Real Firebase permissions and physical-phone behavior remain outside the controlled fixtures.


## Full-screen background and denser orb

Moved the stars/connector canvas from the orb scene into a fixed viewport layer on Main Dashboard. It measures the viewport layer on resize and listens for pointer movement through the shell. The orb and page links remain centred independently. The rich dashboard orb has more streams, crossing filaments and flecks, with separate bounded mobile/low-capability budgets. Base/compact orb counts, frame-rate caps, pause/reduced-motion behavior and account data are unchanged. Browser checks verify canvas bounds at 1536, 1920 and 2560px widths; unit checks bound the rich particle budgets. The royal-blue/gold icon is a separate preview, not part of this app release.


## Journal canvas cards

Journal opens with soft translucent Daily diary, Personal notes and Ideas sections on the existing unbounded canvas. Arrange cards enables typed writing, title/colour edits, drag and keyboard movement/resizing; Done returns the surface to pen input. Add card places another section in the current view. Removing a populated card confirms first and keeps independent ink. Cards and connector lines follow the camera; area captures include cards beneath ink.

Layout metadata is a points-empty canvas-layout record on the existing account/date stroke path, with the existing offline pending queue and retry behavior. Read-only defaults do not seed records, and editing waits for initial Journal loading. No auth, rules, Firebase configuration or existing stroke formats changed. The legacy bundle only exposes its existing loading state through the bridge. Whole-layout simultaneous edits use the existing last-write behavior; typed card text and independent handwritten ink are not grouped for movement. Limits: 80 cards and 5,000 typed characters per card.

Validation: storage regressions cover layout metadata through denied saves, reload and reconnect; browser fixtures cover defaults without writes, editing, colouring, moving/resizing, camera alignment, date/account isolation, initial-load editing lock and restored metadata. Cards share the ink camera transform on every rendered frame. Full repository/browser checks run in CI. Real production Firebase permissions and physical stylus behavior remain unverified. The dark navy glass icon is an image preview, separate from this app release.


## Writing-first Journal notebook

The existing Journal canvas now fills the viewport. Its original header and app bars are hidden only on this page; a small date badge and collapsible floating tool launcher provide dates, existing drawing/eraser/highlighter/box selection, a freehand lasso, undo/redo, card library, icon wheel, Home, Invincible AI, canvas grid/camera/capture controls and the shared app/account menu. Menus float over the surface and never resize or reset its camera. The existing embedded Chat/voice assistant is hidden until requested through the floating controls, then opens over Journal; closing it preserves the writing camera. The full AI page remains a fallback. The initial date uses the browser's local calendar date; all historical dates remain directly accessible.

Existing card records, unknown fields, saved text, positions, ink and date/account storage paths are preserved. No automatic migration or seed writes run. Empty pages get a small optional mood/special starter; pages with ink and no layout get no cards. New cards use vacant world space away from known ink; explicit insertion can reveal the new object by panning, while opening/closing tools never pans. Six card templates include per-date mood and separate To-Do/Tomorrow checklists. Hide/remove are reversible presentation flags; Restore retains all writing. Handwriting remains independent of cards.

Module wheel names and fallback symbols come from shared navigation, with existing rendered module SVGs reused when available. Custom symbols, names and colours, independent icon instances and card/stroke/point connections are stored on the existing layout record. Connected cards match the icon colour, and connector anchors follow moved cards/icons or transformed ink. Missing or erased targets retain their connection data without drawing an invalid connector. The icon wheel is optional and paged for larger libraries. No card is created by icon insertion.

Explicit user writes use a single undo/redo timeline over the existing stroke save/delete API; incoming cloud snapshots are never recorded as local actions. Layout/ink edits are grouped by interaction, account/date changes clear in-memory history, and loaded ink can still be undone. The existing pending queue retains denied/offline edits and handles retries. Pen hover/down exits object arrangement so stylus input reaches the existing live canvas; the original palm guard and touch camera remain active. No engine replacement, new Firebase project, permission-rule changes or data deletion/migration is included. Whole-layout concurrent device edits retain the existing last-write behavior. New edits have an 800KB layout budget; reading never trims existing records.

Validation: layout/history unit tests, storage failure/reload/retry tests, existing drawing/capture/pan tests, and notebook browser scenarios cover full viewport and camera stability at desktop, portrait tablet and phone sizes, mood/checklists, reversible cards, icon/custom-icon links, reload, history and date/account isolation. Full repository checks and screenshot review run before publication. Physical Samsung S Pen latency/palm classification and signed-in production Firebase permissions cannot be established by synthetic fixtures.


## Everyday Journal cards

Each daily canvas now supplies Daily Planner, To-Do, Today's Idea and Today's Mood, including phone layouts. Diary, special events, Tomorrow and other extra cards remain available through Add card. Missing daily cards are offered alongside saved layouts without moving, renaming or resetting any existing card, mood, checklist, icon or connection. Hidden/removed daily cards stay hidden and can be restored explicitly. Defaults are read-only until an explicit edit and initially use vacant world space away from ink. Their positions stay stable while writing during the session. Saved content is not migrated or overwritten on opening a date.

Unit checks cover four defaults across screen sizes, safe placement, retained fields/positions/hidden choices and idempotent reopening. The notebook browser suite covers daily defaults, persistence, date/account isolation and existing controls; the full repository checks run before publication.
