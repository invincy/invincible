# Unified Studio composition — November 9, 2026

Current workflow: [one video flow and shared cloud library](creator-single-flow.md). The historical local-only/undeployed-upload notes below describe earlier implementations and are superseded for shared uploads and owner draft sync.

Review branch: `codex/unified-studio-battlefield`. No merge, deployment, Firebase write, security-rule change or automatic migration.

## Project experience

Saved projects open in Studio. The three primary destinations are Studio, Script and Assets; More retains Production, Overview, Maps and Clips. Script keeps the existing focused workbench and all its import, save/recovery, completion and production controls. New Content keeps its existing interface.

Studio opens with a scene list, portrait preview and master timeline. Add a title, map, battlefield, uploaded image or MP4/WebM clip. Use project maps reviews an append of native snapshots; the source project is untouched. Scene move, duplicate, remove, duration, trim, framing and cut/fade controls work on the selected scene. A timing review lists old/new scene intervals before applying; recordings retain their absolute content positions. Duration changes retime authored battlefield camera/path keys and overlay animations. Native map/video source trims cannot exceed their source.

Edit scene opens the existing Map Editor on an isolated snapshot, or the new Battlefield editor. Map editing begins at the selected source time. Save scene & return commits the copy; Discard & return retains the original. Both restore the master playhead and scene selection. Project navigation is disabled during focused editing. Mobile switches between Preview and Scenes & audio rather than shrinking both beside each other. JSON and branding remain under Advanced.

## Shared state and rendering

- Manifest version 1 continues to load, save and export. The first visual assembly edit explicitly upgrades the local draft to version 2; a legacy recording becomes one voiceover clip using its decoded source duration. Unsupported versions reject without downgrade.
- Version 2 adds `audioClips`, optional `mapSources`, optional scene names and image/video/battlefield engines. Assets still reference original `fileId`, HTTPS `url` or existing map `libraryId`; optional `credit` retains library notes.
- A native map source is `{id, project: {scenes: [{id,duration}], historicalMap}}`. Map engine data can reference `{sourceId,sourceStart}` or an isolated `{project,sourceStart}`; existing animation instructions remain accepted. Shared immutable source snapshots avoid copying the whole map once per shot. Editing a shot creates its own copy. The existing 1 MB manifest, 240 KB map and ten-minute film limits remain explicit.
- Scene engines share the renderer's async `draw(absoluteSeconds, {exporting,signal})` and `destroy()` lifecycle. Native maps use the real history player and readiness guard; one map WebGL context is retained at a time. Images and artwork preload. Video uses the pinned MediaBunny `Input`/`CanvasSink` to retrieve decoded frames at source time, including backward seeks. Preview and export consume the same state.
- MediaBunny 1.65.2 remains pinned. Its dedicated Studio bundle adds decoding exports; the Map Editor vendor bundle and silent exporter remain unchanged. Video frames use exact 30-fps timestamps; audio is mixed and interleaved in bounded 1,024-sample chunks. Final encoded bytes and decoded originals still occupy browser memory.

Each audio clip stores `id,fileId,name,role,startSeconds,trimStart,durationSeconds,gain,fadeIn,fadeOut`; roles are voiceover, music and effect. Source bytes are immutable. Mono/stereo inputs resample to 48 kHz, mono duplicates into stereo when needed, overlapping clips sum and the final samples clamp to the valid range. Piecewise-linear fade envelopes are identical in preview scheduling and export. Intro branding shifts scenes and all recordings together; the outro follows both content and audio tails. Missing media, invalid source trims or unavailable encoders fail explicitly.

## Battlefield v1

The Canvas 2D implementation is a tactical 2.5D schematic, not a geographic reconstruction or automatic battle simulation. It provides grouped sprites, icon count, columns, spacing, scale, facing and timed movement waypoints. Pan/zoom/tilt/bearing camera keys and terrain are evaluated from absolute time. No elapsed-frame integration or unseeded visual randomness is used.

Authored terrain includes hills, raised cliffs, forest areas, river/road polylines and obstacles. Elevation lifts formations onto hills/plateaus; sprites sort by projected depth. Forest placement is deterministic. Manual paths can cross obstacles: pathfinding, collision, combat and automatic terrain avoidance are deliberately deferred. Limits are 100 formations, 3,000 total visible sprites, 100 terrain objects and 150 keys per path/camera.

Load Panipat army library reuses the 19 pinned images and their credits without replacing existing assets. See the reusable catalog and provenance manifest before adding art. Artwork does not establish verified likenesses, army totals or deployment coordinates. No new generated artwork was needed for this implementation.

## Evidence and reproduction

Run `npm run test:video-studio` in Chrome with H.264 support. This includes existing media acceptance and new composition unit/browser coverage: v1 compatibility, native map copies, scene boundaries, preserved narration positions, trimmed/overlapping audio and fades, focused-editor return, multiple uploaded voices through save/reload, reviewed duplication, cancellation, deterministic backward seeks and 320/390/820/1440-pixel layouts. Existing storyboard, history, Map Editor and map-animation browser suites also run separately.

The short integration exports contain two native maps plus synthetic narration, then two maps + two battlefields + image + trimmed video + overlapping recordings. FFmpeg independently decodes all streams: 60 and 150 H.264 frames, 1080×1920, 30 fps, audible AAC, expected 0.300-second onset. Selected motion/scene frames have distinct decoded hashes. Run `node tests/creator-studio-ffmpeg.cjs` after the browser suite to reproduce independent checks.

The original Panipat proof uses the first two existing map scenes from `codex/panipat-film-20261109` commit `e38233480e692141e056ec9fb12874ad1ba5cc63`; the native snapshot is retained in `tests/fixtures/studio-panipat-project.json`. The original MP3 comes from shared-input commit `eb7476ee7a49d2a3cf8b8b32f3222364b3a4d536`, path `creator/history-data/panipat/Panipat.MP3`, SHA-256 `d55c5114f834bcdcce18588c3fcff486fd22434c9818b770fa37ece8e7a92a12`. Its source bytes and playback speed are unchanged. This proof deliberately selects seconds 0–20.66; it is not the complete 151.249-second narration or a finished historical film.

To reproduce the Panipat proof, place that original MP3 at `.test-output/panipat-original.mp3`, set `STUDIO_PANIPAT_PROOF=1`, and run `node tests/creator-studio-composition-browser.cjs` with `CHROMIUM_EXECUTABLE` pointing to Chrome. The real NASA imagery/DEM, native cameras and layers render; provider failures are not replaced by a fake-map harness. FFmpeg decoded 620 frames and AAC without errors. Source/export audio correlation was 0.999849 at zero measured lag. Frame samples at 0.5, 3, 9.5, 10.5, 15 and 20 seconds were distinct. Representative full-resolution output and Studio screenshots were inspected; speech perception and final editorial cue alignment are not certified by these measurements.

## Limits and handoff

Save continues to use account-scoped IndexedDB, original Blobs, immutable manifest versions and a project draft pointer. JSON transfers references, not original media. No cloud media synchronization or new Firestore paths are introduced. Missing files can be removed and their originals added again through Audio/media controls. Imported video picture is used with source audio muted, reported in the UI; add desired audio separately. Transitions are cuts or fades through the background, not overlapping cross-dissolves. Physical mobile/Safari, maximum-length memory use and production private-asset permissions require separate verification.

Next production work is editorial: build the actual Panipat battle deployment using the named assets and source-reviewed positions, align actions to approved speech cues, and review the complete film. The synthetic integration fixtures prove composition and rendering, not historical accuracy or final visual polish.
