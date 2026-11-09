# Invincible Map Editor workflow

Read [AGENTS.md](AGENTS.md), [CREATIVE_BIBLE.md](CREATIVE_BIBLE.md) and [docs/map-editor-production-standard.md](docs/map-editor-production-standard.md) before map work. The permanent standard owns detailed visual/source acceptance requirements. This file describes where to perform the work in the existing product.

## Architecture to preserve

Creator Studio is native JavaScript at `creator/index.html` / `creator/project.html`. Existing project scenes and `historicalMap` are canonical. Reuse the shared player rather than adding a film-specific page, duplicated timeline or new map renderer.

| Concern | Existing implementation |
| --- | --- |
| Project loading, revisions, save/recovery | `creator/project.js`, `creator/history-workspace.js` |
| Map tools and panels | `creator/map-editor.js`, `creator/map-editor-panels.js` |
| Map validation, scene clock and camera evaluation | `creator/history-model.js`, `creator/map-editor-model.js` |
| Shared preview and deterministic export drawing | `creator/history-player.js`, `creator/map-editor-renderer.js` |
| Declarative animation import and copied brief | `creator/map-animation-import.js`, `creator/map-animation-example.json` |
| Versioned presentation, labels and fonts | `creator/map-defaults.js`, `creator/map-labels.js`, `creator/map-fonts.js` |
| Imagery, terrain and optional trusted overlays | `creator/map-style-library.js`, `creator/map-overlay-presets.js` |
| Native silent H.264 MP4 export | `creator/map-video-export.js` |
| Library and media references | `creator/map-assets-client.js`, `creator/media-library.js` |

For Studio integration, follow [one video flow](docs/creator-single-flow.md), [universal architecture](docs/creator-studio-universal.md) and [composition](docs/unified-studio-composition.md). Studio map scenes use the real history player and immutable source snapshots. Focused scene editing works on a copy, then Save scene & return or Discard & return restores selection/playhead. Tactical Battlefield coordinates are schematic, not geographic longitude/latitude.

Preserve current tools, scene IDs/order, narration, layer selection/order/timing, keyframes, terrain, asset references, undo/redo, cancellation, exports and legacy JSON compatibility. Retain transactional revision/conflict handling, owner/editor access and account-scoped recovery. Never weaken Firebase rules or replace data to get an import/export to work.

## Use the existing import routes

1. Inspect the destination project, scenes, assets and timing; retain a recoverable original. Copy ChatGPT brief from the current editor to obtain the accepted schema and available IDs. Do not invent unsupported JSON keys or treat JSON as executable instructions.
2. Use `invincible-map-animation` version 1 for declarative camera/layer animation. Use Check instructions and review before Add animation. Imports append canonical scenes with fresh linked IDs, preserving destination content and established appearance. Camera keys use absolute instruction seconds; canonical layer timing uses scene IDs/offsets. Confirm the appended start time rather than assuming the new animation begins at project zero.
3. Full map JSON is bound to existing scene IDs. `invincible-map-scene` version 1 appends a reusable scene with remapped IDs. `invincible-map-assets` version 1 transfers asset references. Choose the route that matches the task; never use replacement to simulate append.
4. Validate on an isolated copy before mutation. Invalid imports must retain the old project and recovery state. Boundary/highlight imports require source metadata and independent geometry review; a `reviewed: true` field is not a review.
5. For a complete Studio video, use its current versioned manifest and Review import / Apply reviewed import. Do not confuse that schema with a map-animation file. JSON contains references, not the original media bytes.

Read current validators for limits. At this inspection, animation instructions are limited to 500 KB, 1–600 seconds, 150 camera keys and 100 layers; canonical map data retains its 240 KB limit. Do not split into duplicate production pages to evade limits. If a reusable feature is missing, extend the actual schema, normalization and shared renderer with focused validation; unused JSON fields do not implement a feature.

## Geographic accuracy and asset reuse

Coordinates are `[longitude, latitude]`, never reversed. Check actual locations, river courses, passes, distances, orientation and route direction at the shot's scale. Keep north-up unless an intentional bearing change remains understandable. Image corners are TL, TR, BR, BL in geographic coordinates. Do not stretch regional flag masks to national extents.

Prefer the existing NASA satellite/terrain library and attributed DEM. Source zoom/detail limits still apply at high export resolutions. Distinguish modern terrain/basemap, dated historical boundaries, territorial claims, administration/control and illustrative movement. Preserve separate IB/LoC/LAC/claim line semantics; borders never get travel arrowheads. Record source URL, date and precision/uncertainty, and review the geometry independently. Never infer a frontier or exact troop deployment from a place name.

Reuse named library assets with the current `libraryName` / `libraryId` reference format; resolve ambiguous names by ID. Keep shared cloud identity (`cloudAssetId` / Studio `fileId`) and legacy references intact. Expiring signed URLs are playback results, not persistent asset identities. Inspect `creator/asset-libraries/` and `creator/history-data/border-flags-v3/manifest.json` plus `SOURCES.md` before using existing artwork. Asset catalogues do not certify historical likenesses or army totals.

## Native export and focused checks

Use the editor's Render silent MP4 or Studio's existing audio-capable export. The native map encoder renders each frame at `frame / fps`, uses WebCodecs/MediaBunny H.264 and supports 30 fps, up to ten minutes and selectable portrait/landscape resolutions. It does not encode audio. Preserve native framebuffer sizing, tile/asset readiness, progress, cancellation and state restoration. Do not substitute screenshot loops, small-canvas upscaling or held stills. Follow AGENTS.md before proposing any alternative pipeline.

Choose affected suites from the checked-in scripts: `npm run test:map-editor`, `npm run test:map-animation`, `npm run test:map-defaults`, `npm run test:documentary`, `npm run test:universal-map`; history changes also use `node tests/creator-history-browser.cjs`. Composition/audio changes use `npm run test:video-studio`. Persistence/rules changes require the existing Creator rules/emulator checks and broader root requirements. Run `npm run check` for affected site references. Documentation-only updates need link/path and diff review, not these media suites.

For film production, use a short representative native export first, then inspect the full encoded video as specified in [VIDEO_PRODUCTION.md](VIDEO_PRODUCTION.md). Fixtures establish behavior; they cannot certify geography, live account permissions or finished audiovisual quality.
