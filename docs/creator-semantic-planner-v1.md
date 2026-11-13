# Creator semantic planner v1

## Purpose

Creator Studio now gives the local Qwen planner and the hosted OpenAI planner the same provider-neutral scene contract. The model selects editorial meaning; the application remains responsible for timing, geography, style tokens and renderer JSON.

The canonical planning pack is `functions/src/creator/planner-pack/manifest.json`. It loads:

- `semantic-plan.schema.json` — the only accepted model output shape.
- `style-profile.json` — reusable visual rules distilled from the approved Panipat and monsoon reference films.
- `renderer-capabilities.json` — engines and generic presets the application understands.
- `approved-examples.json` — compact Panipat and monsoon planning examples.

Both providers receive the same schema as a real structured-output constraint. Ollama receives it through `format`; OpenAI receives it through Responses API `text.format`. Application validation runs again after generation.

## Model responsibility

For every locked narration segment the model returns exactly one scene containing:

- engine and scene kind;
- a generic preset ID;
- short title and visual intent;
- label treatment and camera intent;
- registered asset, location and route IDs only;
- semantic emphasis and missing-information notes.

The model cannot return timestamps, coordinates, colours, font sizes, political boundaries, keyframes or final Map/Motion JSON.

## Compiler responsibility

The deterministic compiler:

- preserves the transcript timestamps and MP3 duration;
- rejects missing, duplicate or unknown segment IDs;
- rejects invented assets, locations, routes, engines and presets;
- compiles grounded locations and reviewed routes through the existing Map Editor format;
- compiles supported semantic presets into editable Motion Studio primitives;
- keeps unsupported or ungrounded ideas visible for review without discarding narration timing.

The first editable semantic presets are:

- `pressure-driven-flow` — high/low pressure zones and staged wind arrows;
- `shifting-zone` — an atmospheric belt and directional movement;
- `temperature-comparison` — warm/cool comparison fields;
- `opposing-formations` — opposing colour-coded unit formations;
- `terrain-barrier` — a schematic terrain barrier;
- `geographic-locator` — framed locator treatment;
- `revealed-route` — staged route treatment;
- framed title and documentary diagram fallbacks.

All generated Canvas scenes use the reference-film border, top title plaque, safe layout, semantic palette and narration-ordered reveals.

## Current boundary

This increment establishes the shared contract and reusable Motion Studio primitives. A real Map Editor scene is generated only when Creator supplies a reviewed `locationId` or `routeId`; the planners are no longer allowed to fabricate coordinates. Expanding the verified geography catalog and compiling `opposing-formations` directly into Battlefield Editor are the next renderer increments.

Existing Creator project schemas, saved projects, native maps, Motion Studio manifests and renderers remain compatible. The semantic fields are additive handoff data.

## Verification

Required focused checks:

- `node --test local-ai/voiceover-analysis.test.mjs`
- `npm --prefix functions test`
- `node --test tests/creator-video-studio.mjs tests/creator-studio-composition.mjs`
- `STUDIO_LAYOUT_ONLY=1 node tests/creator-video-studio-browser.cjs`

The full encoded-browser export remains an environment-sensitive acceptance check because it requires a working browser H.264 download path.
