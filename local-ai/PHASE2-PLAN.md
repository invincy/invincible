# Phase 2: Import and Preview

The secure TTS → Whisper → Qwen → JSON path has passed its first restricted-identity smoke test. Phase 2 should consume the returned `creatorStudio` object without reserializing or manually copying JSON.

## 2A — review and JPG previews

1. Keep the generated `creatorStudio` draft in a review-only client state.
2. Show a scene list with narration, exact timestamps, selected asset IDs, animation and missing-information warnings.
3. Require explicit approval before appending scenes to the current project.
4. Reuse the existing Creator Studio import parser and project `onChange` path.
5. Render selected scenes through the existing map/video preview renderer into controlled `E:\Invincible\Renders` scratch output.
6. Verify image dimensions, missing asset references, clipping bounds and timeline continuity before marking a preview ready.

## 2B — short MP4 verification

1. Use only an approved scene plan and its validated narration asset.
2. Render a 10–20 second isolated preview, never directly into production output.
3. Verify the MP4 duration, audio presence, scene ordering and output path.
4. Keep automatic cleanup and deployment disabled until the preview is reviewed.

The restricted upload endpoint already returns `analysis` plus `creatorStudio`; Phase 2 should add the review/import/preview layer on top of that response.
