# Unified Video Studio — Phase 1 implementation contract

Status: Phase 1 implemented on the review branch; not merged or deployed.

## Verified baseline
- Creator Studio is a native JavaScript app with separate project and production workbench modules.
- Map Editor already imports animation JSON, supports timeline/keyframes and image assets.
- `creator/map-video-export.js` encodes **silent** H.264 MP4 from a canvas with MediaBunny/WebCodecs, at 30 fps, maximum 600 seconds.
- Portrait export is supported via `exportDimensions('9:16','1080p')` (1080 × 1920).
- The legacy Map Editor encoder does **not** mux voiceover audio. Do not advertise an audio-inclusive MP4 until implemented and tested.

## Safety invariants
1. Do not modify the existing Map Editor's rendering behavior or existing LIC pages in Phase 1.
2. Introduce Video Studio as an opt-in workspace; never migrate or rewrite saved projects automatically.
3. Store brand presets and video manifests separately from existing storyboard and map schemas.
4. Preserve uploaded voiceover bytes; never silently trim or replace audio.
5. Do not include copyrighted or LIC official brand assets unless supplied or authorized; keep brand preset slots configurable.
6. Use feature detection and actionable errors for unsupported browsers/codecs.
7. Do not merge, deploy or publish without approval.

## Common project manifest (proposal)
- schemaVersion
- title, aspectRatio, fps
- brandPresetId (optional)
- scenes: id, startSeconds, durationSeconds, engineType (map/lic/graphic), engineData, overlays
- audio: user-selected local/uploaded recording, startSeconds, gain
- intro/outro: optional reusable scene templates

## Phased delivery
A. Extract non-destructive shared export dimensions, timing and JSON validation utilities with tests.
B. Add opt-in Video Studio UI with brand preset slots, scene import, audio upload, preview and scrubbing.
C. Implement deterministic audio+video MP4 muxing and verify actual playback, A/V sync and export duration.
D. Adapt map engine through an adapter, keeping its existing editor unchanged.
E. Add LIC graph and benefit animation adapters; validate policy data against supplied official illustrations.
F. Optional saved brand library and cloud asset persistence.

## Acceptance tests
- Existing map editor and creator tests continue to pass.
- Portrait output exactly 1080 × 1920 at 30 fps.
- Import rejects malformed JSON without mutating existing projects.
- Uploaded voiceover is audible in exported MP4 and sync stays within one video frame for a test fixture.
- Brand intro/outro render only when explicitly enabled.
- No change to existing LIC presentation rendering or saved data.

## Phase 1 implementation — 8 November 2026

Video Studio is opt-in on a **saved project's** workbench (`Video Studio` tab).
The creation/edit dialog keeps its existing six areas. It is still native JS.
No existing storyboard, map or LIC page is rebuilt or migrated.

### Data and workflow

- Video manifests use schemaVersion 1, 30 fps, 9:16 by default (1080 × 1920),
  or 16:9 (1920 × 1080). Imports are strict, bounded, reviewed and applied to a
  separate video draft. Unknown fields, invalid times, overlapping scenes,
  dangling assets and malformed keyframes reject before state changes.
- Timeline rows and scrubber share seconds with preview and deterministic export.
  Scenes are ordered; gaps render the brand background. Per-layer keyframes
  interpolate x/y (fractions of frame), opacity, scale and rotation (degrees).
  Easing is linear, smooth or hold. Fade transitions fade through the brand
  background rather than overlapping adjacent engines. Text uses explicit newlines.
- Asset references accept exactly one of `fileId` (original local upload),
  HTTPS `url` (requires CORS), or `libraryId` (existing map image). Uploads accept
  PNG/JPEG/WebP; the existing private map resolver retains its authorization checks.
  Map engineData can also reference existing map library assets by name or ID
  through the original map instruction importer.
- Voiceover accepts MP3/WAV. Its original bytes are retained, independent of the
  decoded/resampled export stream. `audio.startSeconds` is relative to content;
  an enabled brand intro shifts both content and audio. Full audio can extend
  the video, with background after the last scene. Outro begins after content
  AND audio end. The full result must fit ten minutes; no silent trimming.
- AdiChimp, LIC and Custom presets contain colors and configurable font/logo/
  graphic intro/outro slots. No official logo or advisor artwork is bundled.
  Enable intro/outro explicitly; adding templates alone does not apply them.
  Brand profile JSON can create another ID. Image overlays/keyframes animate
  uploaded advisor poses without changing existing LIC presentation code.
- Explicit Save stores original Blobs, manifests and presets in separate
  IndexedDB `invincible-video-studio-v1` records prefixed by authenticated UID.
  Manifest saves create immutable versions and then update a project-scoped
  pointer. In-memory state survives tab changes. There are no automatic cloud
  writes, migrations, rule changes or auth changes. JSON download transfers
  instructions/references only; media must be supplied on the receiving device.
  Local storage can be cleared by the browser and does not establish cross-device
  Firebase persistence. Shared-project editors have their own local video drafts.

### Adapters and export

- `creator/video-studio/adapters.js` composes independent graphics, LIC and map
  adapters into the common canvas. The map adapter compiles instructions into
  an isolated project and uses the existing `createHistoryPlayer`. Its sole API
  extension exposes the already-existing `settledFrame` guard as `settleFrame`;
  rendering, camera, controls and the legacy silent exporter are unchanged.
  The adapter waits for native tiles, terrain, assets and custom models through
  that existing guard. HD maps require WebGL2 and working provider/CORS access.
- LIC graphs consume **explicit supplied milestones**, with a mandatory
  illustration source. They display premium, addition, income, booster and
  maturity values without calculating benefits or extrapolating premiums.
  The adapter does not certify an imported source/figure as official; reconcile
  actual sales illustrations before use. Existing Bima Platinum examples and
  narration are untouched. No policy amounts from earlier chat memories were used.
- `export.js` uses the pinned MediaBunny 1.65.2 library in a separate vendor
  bundle. It encodes H.264 at exact 30-fps timestamps and interleaves encoded
  audio samples with video. AAC is preferred; Opus-in-MP4 is the feature-detected
  fallback (requires a compatible playback application). Missing audio encoding
  rejects rather than falling back to a silent file. Chunking bounds temporary
  PCM memory; final MP4 bytes and decoded voiceover still occupy browser memory.
  Cancellation discards partial output and releases sample/renderer resources.
- Source-only work; no publishing, deployment, merge or Firebase writes.

### Reusable example

Start with **Load example**, or import `creator/video-studio/example.json`.
Replace timing with actual narration timestamps; asset IDs refer to the library
shown in the workspace. Map scenes use `engineData.animation` with the existing
`invincible-map-animation` version 1 schema. Geographic geometry still requires
an explicit review flag and source provenance. Financial scenes use
`engineType: "lic"` and `engineData: {title, source, points}`; each point contains
`timeSeconds`, `year`, `label` and optional nonnegative `premium`, `addition`,
`income`, `booster`, `maturity`. Their time is scene-local, like overlay keyframes.

### Verification and remaining limits

- `node --test tests/creator-video-studio.mjs`: 16 focused tests pass, including
  reusable brand assets. Local UI regression also covers uploaded PNG placement,
  profile reuse in a second video, byte-identical WAV persistence and account isolation.
- Feature branch local repository tests: 187 passed, two existing skips;
  15 Functions tests passed. Production build, V2 build/stage, Chromium V2 browser coverage and site-reference checks passed.
- GitHub Chrome media acceptance passed on final implementation commit `ab5ebb0` in run
  https://github.com/invincy/invincible/actions/runs/42440360556 . Actual encoded
  files were decoded, not mocked. Portrait is 1080 × 1920 and landscape
  1920 × 1080. Both used H.264 + Opus. Measured tone onset was 0.79179s for an
  expected 0.80000s cue; the branded UI export measured 2.29018s versus 2.30000s.
  Error is under 10 ms, below one 30-fps frame. Branding, financial graphics,
  native Map adapter/framebuffer, cancellation and original bytes all passed.
  The final run also passed uploaded PNG overlays and saved logo reuse in another video.
- Downloaded CI output was independently inspected with FFprobe/FFmpeg:
  180 decoded H.264 frames, 1080 × 1920, 30/1 fps, six seconds of video,
  an Opus track (6.0135s including codec padding), and no decode errors.
  Evidence: https://github.com/invincy/invincible/actions/runs/42440360556/artifacts/13601346484 .
- Existing Creator storyboard, history, native map editor and animation browser
  regressions passed locally and in CI. Journal and LIC CRM CI jobs passed.
- The broader CI job fails five **pre-existing master** LIC Page 6 unit tests
  (`tests/lic-presentation.mjs`, lines 320, 352, 408, 447 and 467). The same five
  failures were reproduced in an isolated, unchanged `master` worktree at
  `7bca110c83dc76c3c52fb7292bb89760d7771381` (Page 6 journey PR #153).
  They concern removed journey DOM selectors. This branch changes no LIC files
  or those tests. That CI job stops before its later build/V2/V1 browser steps;
  it must not be described as an all-green repository run.
- The local broad V1 browser command passed Garage, navigation, reminders, Orb,
  Task Copy and Creator, then stopped at the unchanged Journal browser test's
  `page.addStyleTag` error at line 56. Later scenarios were not reached locally;
  the separate Journal CI job passed. Its initial shallow Orb baseline prerequisite
  was fetched before this run. Full Chrome cannot launch under local socket
  restrictions; local bundled Chromium lacks H.264 encoding. Managed HTTP preview
  lacks WebCodecs, so real MP4 evidence comes from Chrome CI.
- AAC encoding, Safari, physical mobile devices, maximum-duration memory/throughput,
  actual voiceover speech perception and live Firebase/private asset permissions
  are not established by synthetic fixtures. Opus MP4 requires compatible players.
  No cloud voiceover storage, automatic speech alignment, arbitrary 3D graphics,
  official benefit calculation or automatic advisor lip-sync is implemented.
  The local feature has no API key, generation endpoint or paid generation.
- `tests/fixtures/video-studio-verification.html` runs the media verification
  interactively from localhost/HTTPS. Synthetic WAV, finance and geography only;
  it does not touch production Firebase. `npm run test:video-studio` is strict:
  missing H.264 fails media acceptance instead of silently skipping it. The
  optional `STUDIO_SKIP_ENCODING=1` flag is local UI-only evidence, explicitly
  reporting that media assertions were not run; CI never sets it.

### Changed files

| Area | Files |
| --- | --- |
| Workspace and domain | `creator/video-studio/{workspace,model,storage,audio,adapters,export}.js`, `studio.css`, `example.json` |
| Integration | `creator/production-workbench.js`, `project.js`, `creator.js`, `project.html`, `index.html`, read-only readiness method in `history-player.js` |
| Existing dependency bundle | `creator/vendor/studio-video.mjs`, `scripts/vendor-studio-video.mjs` (pinned MediaBunny; no new dependency) |
| Tests and CI | `tests/creator-video-studio.mjs`, `creator-video-studio-browser.cjs`, `tests/fixtures/video-studio-verification.{html,js}`, `.github/workflows/v2-prototype.yml`, `package.json` |
| Documentation | This document, `docs/code-review.md`, `README.md` |

No LIC presentation source, existing Map Editor schema/importer/exporter,
Firebase security rule, authentication, backend or generated React output changes.
