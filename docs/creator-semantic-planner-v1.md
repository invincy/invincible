# Creator semantic planner v1

## Purpose

Creator Studio now gives the local Qwen planner and the hosted OpenAI planner the same provider-neutral scene contract. The model selects editorial meaning; the application remains responsible for timing, geography, style tokens and renderer JSON.

The canonical planning pack is `functions/src/creator/planner-pack/manifest.json`. It loads:

- `semantic-plan.schema.json` — the only accepted model output shape.
- `style-profile.json` — reusable visual rules distilled from the approved Panipat and monsoon reference films.
- `renderer-capabilities.json` — engines and generic presets the application understands.
- `approved-examples.json` — compact Panipat and monsoon planning examples.

Both providers receive the same schema as a real structured-output constraint. Ollama receives it through `format`; OpenAI receives it through Responses API `text.format`. Application validation runs again after generation.

The schema is narrowed for each request. It fixes the exact scene count and segment IDs, limits assets to the supplied catalog, and makes unavailable location and route IDs empty-only. This prevents a smaller local model from satisfying the general JSON shape while inventing a plausible-looking catalog ID.

## Model responsibility

For every locked narration segment the model returns exactly one scene containing:

- engine and scene kind;
- a generic preset ID;
- short title and visual intent;
- label treatment and camera intent;
- registered asset, location and route IDs only;
- an optional historical year, supported region and narration-relevant polity names;
- semantic emphasis and missing-information notes;
- explicit resource requests, safe fallbacks and only materially necessary clarification questions.

The model cannot return timestamps, coordinates, colours, font sizes, political boundaries, keyframes or final Map/Motion JSON.

## Compiler responsibility

The deterministic compiler:

- preserves the transcript timestamps and MP3 duration;
- rejects missing, duplicate or unknown segment IDs;
- rejects invented assets, locations, routes, engines and presets;
- compiles grounded locations and reviewed routes through the existing Map Editor format;
- resolves dated polity names against the bundled Cliopatria reference pack and creates a label-only locator automatically;
- sends factual territory polygons to Map Editor for source review instead of silently approving them;
- compiles supported semantic presets into editable Motion Studio primitives;
- keeps unsupported or ungrounded ideas visible for review without discarding narration timing;
- reuses matching project assets and gives each missing resource a direct Map Editor or Assets action while retaining the model-declared safe fallback.

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

## Resource resolution

Both Qwen and OpenAI use the same `creator-semantic-plan-v1` fields. A dated
scene can request a `historical-territory`, `historical-route`, place, image,
portrait, flag, video, audio, model or source. Each request states whether it is
factually required, visually required or optional, plus one supported fallback.
The application—not the model—then matches the request to the open project's
catalog and the bundled historical reference pack.

The sync-plan review shows **Ready**, **Review in Map Editor** or **Missing**.
A missing item never deletes or merges a locked scene. The declared fallback is
kept in the draft, and the user can open the correct tool to add the resource.
Clarifications contain a conservative default, so a non-critical unanswered
question also does not stop compilation.

For a year such as 1526, Map Editor can load every active territory outline in
the connected South Asia pack into one colour-coded GeoJSON review form. The
review checkbox remains off. This is a preparation shortcut, not automatic
historical verification.

## Current boundary

This increment establishes the shared contract, reusable Motion Studio primitives and the first dated-history resource resolver. A real factual boundary still requires Map Editor review, while automatic locator scenes use labels and approximate reference centers only. The planners are not allowed to fabricate coordinates. Expanding the verified geography catalog beyond the connected South Asia pack and compiling `opposing-formations` directly into Battlefield Editor are the next renderer increments.

Existing Creator project schemas, saved projects, native maps, Motion Studio manifests and renderers remain compatible. The semantic fields are additive handoff data.

## Verification

Required focused checks:

- `node --test local-ai/voiceover-analysis.test.mjs`
- `npm --prefix functions test`
- `node --test tests/creator-video-studio.mjs tests/creator-studio-composition.mjs`
- `STUDIO_LAYOUT_ONLY=1 node tests/creator-video-studio-browser.cjs`

The full encoded-browser export remains an environment-sensitive acceptance check because it requires a working browser H.264 download path.

## ITCZ A/B retest — November 13, 2026

The published UI was tested with the same four corrected transcript segments, locked timestamps and animation instructions for both providers. OpenAI completed in about 35 seconds and returned `framed-title`, `shifting-zone`, `pressure-driven-flow` and `documentary-diagram`. It preserved all timings, selected no unrelated assets and explicitly listed the geographic or scientific review still required.

The first updated Qwen replay completed in about 245 seconds and preserved the same four locked segments, but selected `india-flag-map` for three meteorology scenes and chose ungrounded locator maps. That isolated two deterministic catalog/compiler problems rather than a timing problem: the planner was being shown assets that matched only the word “India,” and an ungrounded map selection was allowed to survive compilation.

The corrected replay completed in 149 seconds. It returned four valid Motion scenes using only `shifting-zone` and `pressure-driven-flow`, selected zero assets, preserved the locked timestamps and invented no geography. Request-specific asset filtering now exposes flag overlays only when the narration or instructions explicitly request a flag, and exposes commander artwork only when its named subject is present. The compiler also converts a map choice without a verified location or route into a generic supported Motion or Canvas scene and records that downgrade for review.

OpenAI remains faster and more editorially varied; Qwen is now a safe local fallback. Neither provider can create the requested factual India/Indian Ocean map until reviewed geography is present in the catalog. The remaining acceptance step is the normal reviewed-plan handoff into Motion Studio and MP4 export.
