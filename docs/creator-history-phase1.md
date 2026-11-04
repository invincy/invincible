# Creator historical production — Phase 1 draft

## Inspection and implementation plan

Creator is **native JavaScript**, not React. `creator/production-workbench.js` is reused by New Content and saved projects. `creator/project.js` owns authenticated loading, whole-document debounced autosave and account-scoped recovery drafts. `creatorProjects/{id}.scenes[]` is canonical, with additive group/assets metadata. React 18/Firebase 10.14.1 and existing Functions remain intact; no Creator migration or unrelated redesign.

Preserve import layouts including the final Timestamp column. Extend the existing method/filter registry, add Maps and Clips tabs, and reuse existing save/draft behavior. MapLibre is loaded only upon opening Maps. Local pinned distribution is reproducible with `npm ci && npm run vendor:creator-map`; React builds need no changes. BSD license is included. No generated React/V2 files differ after builds.

## Implemented

- Maps: physical basemap without modern political borders, scene-relative dated events, collision-aware labels, sourced/reviewed Polygon/MultiPolygon and animated LineString imports, directional arrowheads, deterministic scrubbing, camera interpolation, editable JSON, current-camera keyframe capture and Codex handoff brief. MapLibre GL JS 6.16.0 is primary; Canvas Mercator fallback works when WebGL2 is unavailable. MapLibre provides pan/zoom; fallback camera values can be edited in JSON. Pitch in the fallback is a planar approximation, not 3D terrain.
- Local audio preview plus real-time WebM recording with optional voiceover, 720×1280 / 1280×720 output, date/event/attribution compositor. Pause/visibility loss ends the recording as a partial clip. MP4, offline deterministic rendering and stitched multimodal sequences are deferred. Browser export must stay visible; 30 fps is a requested capture rate, not a guarantee. Voiceover file is session-only and is never silently uploaded. Add durable Audio references through existing Assets; manifest preserves explicit scene voiceoverAssetId fields.
- Clips: adjacent scene ID grouping, independent image/video prompts, Start/Middle/End planning references, immutable manual-upload versions with active-version selection, signed playback URLs, explicit invalid-group warnings after storyboard reorder, JSON handoff and editing manifest. Storyboard reordering remains canonical; no duplicate clip-based scene list. Full sequence playback/reorder/assembly is deferred.
- Workspaces: new Animated Maps, 3D Civilizations, Canva and Voiceover method filters share existing scenes/assets/readiness. 3D/Canva/voice integrations are planning queues only in this phase, not generation tools.
- Secure optional backend: authenticated project access, account-bound Kling read-only discovery, immutable manual MP4/WebM uploads ≤5 MB through Admin Storage, fresh 15-minute signed playback URLs. Credentials never reach browser code. Stored object paths are durable; signed URLs are temporary. Metadata attaches through the existing client save/draft queue. If the tab closes after the upload but before that save, an orphan object may remain; no destructive cleanup runs automatically.
- Unsaved standalone `creator/history-demo.html`, and an explicit Append British India demo action inside Maps. Existing scenes are retained, while the map is switched after confirmation. Four 8-second scenes: trading bases, Plassey, Buxar, Diwani. No production project is automatically created.

## Historical fidelity limitation

Demo animation shows sourced event locators and camera transitions. The archival 1765/1805 scan is a separate reference. **Event-specific territorial vector geometry has not been verified or included, so the requested animated territorial-expansion demonstration is still incomplete.** No guessed boundaries, modern-state proxies or invented troop paths are displayed. Geometry import/reveal is implemented and unit-tested using explicitly synthetic test fixtures, separate from the demonstration. Exact field-source fidelity still requires a historian/editor review.

## Official integration findings (checked 2026-11-04)

| Integration | Official reference | Finding / consequence |
| --- | --- | --- |
| MapLibre | https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-line/ | GeoJSON source updates support line animation. Uses local physical data and source updates, not a paid map service. |
| Three.js | https://threejs.org/docs/pages/GLTFLoader.html | GLB/glTF imports supported by GLTFLoader. Genuine 3D walkthrough/Blender import UI deferred to P4; not added to the 2D map engine. |
| Kling | https://kling.ai/app/mcp/guide | Official global MCP endpoint `https://kling.ai/mcp`, OAuth, streamable HTTP; CLI `@klingai/cli-global`, browser login. `who_am_i` first exposes model/parameter capability, `query_tasks` tracks generation IDs. |
| Kling credits | same official guide | Paid Personal-workspace credits are supported. Bonus credits and Team benefits are excluded; off-peak free generation unavailable. This does **not** establish this user's Standard account/credit eligibility. Generated URLs expire after 24h; submitted tasks cannot be canceled. API billing is not assumed equivalent to MCP billing. |

Backend probe performs MCP initialize/initialized, tools/list and who_am_i, and queries membership only if its discovered schema requires no arguments. Otherwise it reports the required schema for review, not a fabricated user-ID argument. Tools pagination, token refresh and automated per-user OAuth onboarding remain deferred. Probe never asserts billing eligibility. **No generation callable or paid Submit button exists.** This is intentional while the actual account, current tool schemas and cost approval contract remain unverified. Automatic generation, polling and generated-video retrieval are not implemented; use the manual handoff/upload path.

## Optional backend setup (not deployed)

1. Provision a dedicated authorized Kling OAuth credential server-side using the official flow. Do not scrape CLI credential files or put tokens in frontend, Git or logs. Save the access token in Secret Manager as `CREATOR_KLING_OAUTH_TOKEN`; configure `CREATOR_KLING_ACCOUNT_UID` to the linked Firebase UID. Current probe has no refresh flow: expired tokens fail closed and require reauthorization. Other users cannot borrow this account through shared-project membership.
2. Configure `CREATOR_STORAGE_BUCKET` with the project's real, administrator-approved bucket. Manual upload/read only uses Admin SDK, with owner/verified-editor authorization on each call. No public bucket permission/rule change is required. Signed URL creation needs the service account's existing signing permissions; verify before enabling. No Storage setup, subscription change or backend deployment was performed.
3. Following separate deployment approval, deploy only `creatorKlingCapabilities`, `creatorManualClipUpload`, `creatorAssetUrl`; verify real signed-in owner/editor/denied cases. Access checks alone do not establish deployed rules or IAM.
4. Any later paid implementation must obtain per-request cost approval, recheck account/credit type and current model schema, use server-side idempotency/reservation, persist a generation ID immediately, poll failures/retries, download results before 24h expiry into validated durable storage and associate immutable outputs with original scenes/clip. Never automatically resubmit after an uncertain billed response.

## Persistence and operational limits

Only additive `historicalMap`, `productionClips`, optional scene audio references and normal `assets[]` metadata. Existing project/scene IDs, script, unknown metadata, editor lists and import order survive. Existing whole-project collaborative overwrite risk is unchanged, as documented in the repository audit. Map metadata is limited to 240 KB, but the combined project may still approach Firestore's 1 MiB limit; split large productions. Geometry structural validation cannot prove historical correctness.

## Validation

See the dated entry in `docs/code-review.md` for actual commands/results. No paid generation, production deployment, account token provisioning, production Firestore mutation or credit purchase took place.

## Historical visual map editor — November 5, 2026

Open **Creator Studio → Maps → Open visual editor**. The existing map workspace,
JSON editor, playback and recording remain available through **Advanced / recording**.
The visual editor reuses `history-player.js`, the local MapLibre 6.16 distribution,
physical coastline, canonical storyboard clock and existing project save callbacks.
It does not change React, authentication, Firebase rules/paths, storyboard imports,
production clips or provider integrations.

### Editing

- Drag a gold/ship/fort/army icon onto the map, or select it and tap a location.
  Select a placed object and drag its anchor; numeric longitude/latitude fields
  provide precise and keyboard-accessible placement. A drag ghost previews the
  destination. Labels and drawn routes are explicitly illustrative.
- Drop PNG/JPEG/WebP/GLB files to capture a position and prepare their asset form.
  Images have a local preview. Supply a durable, CORS-enabled HTTPS asset URL before
  saving the placement; there is no new upload backend. GLB requires embedded
  resources and uses metres per model unit. A pinned, locally bundled Three.js
  renderer loads only when a GLB layer is present (`npm run vendor:map-model`).
- Images use four geographic corners (TL, TR, BR, BL), editable as coordinates,
  plus scale and rotation. GLB models have scale, rotation and altitude above the
  supplied terrain. Image/model errors are reported without replacing their references.
- The stack supports selection, visibility, color, opacity, order and deletion.
  Illustrative layers have scene-relative start and duration. Undo/redo retains
  up to 30 in-session map states. Deleting a historical layer also removes its
  corresponding event/feature; Undo restores it. Unused asset references remain
  available for reuse. Historical event callouts remain an annotation overlay above
  geographic layers; their order controls callout collision priority. 3D models
  also obey the shared depth buffer.
- Import GeoJSON polygons/multipolygons/routes with a historical date, HTTPS source,
  provenance/precision note and explicit geometry review. Validation checks structure
  and records the editor's review; it does not independently establish historical
  accuracy. No new historical boundaries or claimed troop routes are bundled.
- Terrain accepts an attributed raster DEM TileJSON URL, Mapbox/Terrarium encoding
  and 0–5 exaggeration. No provider credentials or endpoint are preconfigured.
  Coverage, CORS, licensing and dataset age remain provider responsibilities. A
  modern elevation surface is not represented as verified historical topography.
- Scrub/play the existing storyboard timeline, pan/zoom/tilt the camera, capture
  keyframes at the playhead, edit their scene offset, replace their view or delete
  them. Camera controls support numeric editing as well as MapLibre navigation.

### Data and scene reuse

Existing version-1 maps are accepted without migration. Optional
`historicalMap.visual = {version: 1, layers: [], assets: [], terrain?: {...}}`
is additive. Historical layers reference existing feature/event IDs; illustrative
layers declare `classification: "illustrative"`. Assets contain IDs, names, types,
HTTPS URLs and optional rights notes, never local file/blob/data URLs. Map size
validation counts UTF-8 bytes and keeps the existing 240 KB limit.

**Download map JSON** is a complete map specification bound to current scene IDs.
**Export scene** creates an `invincible-map-scene` version-1 package containing
the selected storyboard scene, its map content, initial camera and referenced
assets. Importing that package in another Creator project's visual editor appends
a new scene, remaps linked IDs and preserves all existing scenes and project fields.
The destination's existing basemap/terrain settings take precedence when merging.
JSON validation completes before mutation. Scene-package append clears map-only
undo history because undo does not own the canonical storyboard.

The existing explicit New Content save and saved-project autosave/recovery flows
persist the metadata. Their prior collaboration/whole-document and Firestore size
limits remain. A URL labeled durable still needs to be genuinely durable; expiring
signed URLs are unsuitable for long-term reuse. No asset is silently uploaded.

### Verification and remaining limits

`npm run test:map-editor` covers model invariants and real Chromium/MapLibre behavior,
including synthetic image, GLB and DEM responses, drop/drag placement, undo/redo,
layer ordering/visibility, route drawing, camera playback, GeoJSON review, atomic
bad-import rejection, scene reimport and 320/390/820/1440px layouts. Test coordinates
and assets are expressly synthetic and are not historical examples. The existing
history browser regression also checks opening and closing the editor. The Creator
CI job runs these checks and uploads screenshots.

WebGL2 is required for images, GLB, terrain and direct dragging. The existing 2D
fallback supports historical geometry plus illustrative icons, labels and routes;
it clearly reports its limits. GLB animation clips, Draco/KTX2 decoders, terrain
offline caching, automatic asset uploads and historical territory datasets are not
included. Camera keyframes have an editable list and playhead capture; the list is
not a draggable multi-track video timeline. Existing WebM recording remains real
time and should start only after visible assets have finished loading.

Official implementation references: [MapLibre custom layers](https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/),
[MapLibre image and raster DEM sources](https://maplibre.org/maplibre-style-spec/sources/),
and [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).
