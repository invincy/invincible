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
