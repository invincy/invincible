# App update release — November 1, 2026

Applied the approved cyan orb lowercase i artwork. Profile picture opens Settings and Sign out. Settings checks the current release and offers Update and reload; open work should be saved first. Saved records and drafts are preserved. Connection errors can be retried. Existing launcher icon changes may still need Chrome's Review app update approval.

For future releases, bump the matching version values in shared/app-release.js and app-version.json and the service-worker release marker. The icon uses new PNG URLs and a maskable variant.

Local main/V2 builds, stage/reference checks and 106 unit/Functions checks passed (one additional test skipped). Local browser launch is restricted; browser verification runs in the existing GitHub Actions workflow. Physical Android launcher approval is not tested here.
