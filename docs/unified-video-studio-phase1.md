# Unified Video Studio — Phase 1 implementation contract

Status: architecture and safety specification; not yet implemented.

## Verified baseline
- Creator Studio is a native JavaScript app with separate project and production workbench modules.
- Map Editor already imports animation JSON, supports timeline/keyframes and image assets.
- `creator/map-video-export.js` encodes **silent** H.264 MP4 from a canvas with MediaBunny/WebCodecs, at 30 fps, maximum 600 seconds.
- Portrait export is supported via `exportDimensions('9:16','1080p')` (1080 × 1920).
- Current encoder does **not** mux voiceover audio. Do not advertise an audio-inclusive MP4 until implemented and tested.

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
