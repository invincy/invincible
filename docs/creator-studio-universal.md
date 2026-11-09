# Universal Creator Studio

## Architecture contract

Creator Studio is one production workspace for independent videos. A video is a project, not a branch of the product or a renderer mode selected by its title. New topics use project JSON, asset references, narration and scene timing. New reusable capabilities extend the common schema/renderer once; film-specific choreography stays outside shared source.

The main editor and Studio map scenes use the same map engine. New maps persist their resolved versioned presentation and camera defaults from creator/map-defaults.js. Explicit project and layer overrides remain editable. The overlay-presets module is the compatibility/extension policy bridge; it describes the saved presentation when a new map has one, and retains legacy policies for old JSON. It is not a second production default.

## Optional extensions

Overlay plugins are trusted registered JavaScript factories selected by an explicit ID, preferably versioned. Imported JSON supplies only an ID and data options, never executable code or module URLs. Each player receives a new instance; duplicate IDs cannot silently replace a registered factory. Missing required plugins block preview instead of silently dropping visuals. Readiness, errors, rendering and cleanup use the same lifecycle in preview and export.

Scene packages export only declared scene/map dependencies. Unknown project-wide fields do not travel into another project. Plugin-dependent scenes require the full project or an explicit plugin scene exporter; copying an entire film's absolute-time overlay into one scene is rejected. Full-map/project exports retain existing project metadata.

## Imports and persistence

Animation binding preserves narration, IDs, timing and completion. Selected scenes must be adjacent; nonadjacent selections are rejected rather than compressing narration gaps. Binding is additive for animation objects and is not yet a scene-regeneration/replacement service. Editor imports commit only after the renderer accepts the draft; failure retains the old project, selection and recovery history.

Project writes use Firestore transactions and writeRevision. Stale edits surface a conflict with reload, download-draft or explicit overwrite choices. Deleted projects cannot be silently recreated, including by force overwrite. Creator legacy imports are guarded against account switches. Draft keys include the account, project and tab identity. No data migration runs automatically beyond the existing reviewed legacy import flow.

Rules enforce revision progression, writer timestamps and immutable ownership. Verified invited editors retain collaboration access. New/changed bounded fields are checked while unchanged oversized legacy fields can be retained. Emulator tests use demo projects only.

## Deployment boundary

This branch is local and undeployed. Client updates can be reviewed under existing rules first; strict revision rules require a coordinated separate deployment approval and real signed-in owner/editor checks. Older open clients without revision-aware writes will be denied by the stricter rules and must reload while preserving their draft. No cloud billing service, Gemini call, secret provisioning or paid generation is enabled by this refactor.

Gemini orchestration, audio alignment, immutable production-package approvals and scene regeneration remain subsequent work. The new foundation is generic; it does not certify production throughput for 100 rendered videos.

## Verification

Run npm test, npm run build, npm run check, npm run test:universal-map, npm run test:map-defaults, the existing Map Editor/map-animation/history/Studio browser suites, and npm run test:creator:rules. Browser tests need Chrome/WebCodecs; the rules test needs a supported Java runtime. Node syntax checks of the test file alone do not validate Firestore rules. See the dated code-review entry and the output verification report for actual results and environment limitations.
