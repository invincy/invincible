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
