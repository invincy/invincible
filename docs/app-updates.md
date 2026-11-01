# App update release — November 1, 2026

Applied the approved cyan orb lowercase i artwork. Profile picture opens Settings and Sign out. Settings checks the current release and offers Update and reload; open work should be saved first. Saved records and drafts are preserved. Connection errors can be retried. Existing launcher icon changes may still need Chrome's Review app update approval.

For future releases, bump the matching version values in shared/app-release.js and app-version.json and the service-worker release marker. The icon uses new PNG URLs and a maskable variant.

Local main/V2 builds, stage/reference checks and 106 unit/Functions checks passed (one additional test skipped). Local browser launch is restricted; browser verification runs in the existing GitHub Actions workflow. Physical Android launcher approval is not tested here.


## Compact dashboard and task deletion

Removed the normal connected banner and rectangular tab focus treatment; keyboard focus uses an underline. Actual task titles are compact and the empty state is a short hint. The colour selector sits at the top right of the orb area. Workspace cards now offer Delete with confirmation, pending/error feedback, attachment cleanup and draft cleanup after success, reusing the existing task deletion flow. Failed deletion retains the card for retry. Daily-plan references remain as missing historical references, matching the existing task page behavior.

Build/unit/reference checks and the full browser workflow verify this release. Real Firebase permissions and physical-phone behavior remain outside the controlled fixtures.


## Full-screen background and denser orb

Moved the stars/connector canvas from the orb scene into a fixed viewport layer on Main Dashboard. It measures the viewport layer on resize and listens for pointer movement through the shell. The orb and page links remain centred independently. The rich dashboard orb has more streams, crossing filaments and flecks, with separate bounded mobile/low-capability budgets. Base/compact orb counts, frame-rate caps, pause/reduced-motion behavior and account data are unchanged. Browser checks verify canvas bounds at 1536, 1920 and 2560px widths; unit checks bound the rich particle budgets. The royal-blue/gold icon is a separate preview, not part of this app release.
