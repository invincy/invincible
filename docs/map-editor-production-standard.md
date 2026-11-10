# Map Editor production standard — every film

This is the standing production standard for **all** Invincible Map Editor work: geography, borders, country overlays, history, routes, explainers and future topics. It is not a Panipat-only brief. Apply it before planning, editing, importing, previewing or exporting map scenes. Explicit instructions for the current film override stylistic defaults; preserve the existing editor and source accuracy.

## Built-in Creator Studio defaults

New projects on the main Creator Studio page save a resolved default map immediately. The same defaults initialize a project's first map if it has none. Existing map JSON is not restyled or migrated.

The central configuration is `creator/map-defaults.js`. New maps use NASA GIBS Blue Marble, attributed Terrarium terrain, north-up/smooth camera defaults and portrait 9:16. Their `historicalMap.presentation` contains a complete versioned snapshot. New projects use Documentary Terrain (version 2): 56 px primary labels, 48 px secondary labels, 34 px regional labels, bundled Hindi-capable typography, restrained gold routes, compact rounded location cards and portrait-safe framing. Saved version-1 card projects remain unchanged. No film names, narration, locations or timings belong in this configuration.

Use the main editor's **Style** controls to apply a preset explicitly or override typography, routes, markers, captions, automatic framing, margins, colors and date visibility; change an individual label size in its inspector. Remaining presentation properties can be edited in the existing map JSON panel. Explicit map, camera, layer scale/color/font size, image corners and terrain settings remain authoritative. Show dates defaults off; narration is never turned into captions. New image placement fits the original proportions to 220 reference pixels; imported geographic image corners are retained. GLB scale remains an authored physical scale.

Saved projects read their own snapshot, not today's defaults, so later configuration changes do not change an older film. Legacy maps without a presentation snapshot retain the original rendering. New label cards use the same compositor in editor preview, WebM, deterministic MP4 and native-map Studio composition. Map MP4 remains silent; this change does not add audio alignment or generation.

Run `npm run test:map-defaults` with Chrome available through `CHROMIUM_EXECUTABLE` for main-page creation, save/reload, overrides, responsive layout and a real 1080×1920 MP4 test. The new scene uses synthetic content and real NASA tiles; it does not certify geographic research or editorial quality of any film.

## 1. Read the real implementation before building

Start with [the repository README](../README.md), [Creator map architecture](creator-history-phase1.md), and the current project/scene JSON. Inspect these existing components rather than rebuilding the editor:

- `creator/map-style-library.js`: actual imagery, terrain sources and credits.
- `creator/map-animation-import.js`: accepted instruction schema and copied brief.
- `creator/map-editor-model.js`, `creator/map-editor-renderer.js`: normalization, layers and artwork rendering.
- `creator/history-model.js`, `creator/history-player.js`, `creator/map-video-export.js`: timeline, camera, preview and export.
- `creator/map-animation-example.json`: reusable declarative reference for the main Map Editor, not a final visual-quality benchmark.
- `creator/history-data/border-flags-v3/manifest.json` and `SOURCES.md`: the existing sourced flag-map treatment the user wants to build on. Read each texture's corners, regional coverage and source notes.

The earlier border/country-overlay work is a visual reference for real NASA imagery, georeferenced artwork, separate boundaries and deliberate camera movement. Do not copy one film's territorial claims, country list, timing or colours into every other film. Some flag textures cover only regional clips, not entire countries. Use their recorded geographic corners and never stretch a regional clip across a whole country.

If a desired label/card/animation feature is not supported, implement it in the actual renderer, schema/normalization and relevant tests. Adding unused JSON properties is not implementation. Preview and export must consume the same canonical scene state.

## 2. Preserve the existing Map Editor

Keep current tools, library reuse, named asset references, imports/exports, camera controls, terrain controls, layer ordering, scene timing, undo/redo, dragging, cancellation, resolution/aspect controls, save/recovery and project compatibility.

Validate imports on an isolated copy before mutation. Append with fresh IDs where appropriate. Never silently replace existing scenes/assets, clear recovery history, change another project's appearance or alter Firebase/auth/storage rules to make a film work. Any explicit replacement must follow the existing reviewed replacement flow and retain a recoverable original.

Keep film-specific art and styling scoped to that project. Do not add a global overlay that leaks a film's titles, dates, sources or narration into other exports.

## 3. Imagery and terrain: use the existing NASA treatment

Prefer the existing imagery library over fabricated backgrounds or generated maps:

| Existing style | Appropriate use | Actual source/limit |
| --- | --- | --- |
| `satellite` | Regional/country overview, country overlays and the earlier natural-imagery look | NASA GIBS Blue Marble shaded relief/bathymetry; maximum source zoom 8; a composite, not live or street-resolution imagery |
| `terrain` | Passes, mountain barriers and terrain-led explanations | NASA GIBS ASTER GDEM colour shaded relief; maximum source zoom 12 |
| Terrain elevation | Subtle real relief beneath either treatment | Existing Mapzen/AWS Terrarium DEM, with its own attribution |
| `atlas` | Explicitly requested modern reference cartography | OpenFreeMap; modern labels/borders must be intentional |
| `physical` | Deliberate simplified treatment or clearly reported fallback | Generalized Natural Earth coastline |

Retain a saved project's selected style. For a new film, choose natural imagery for regional country/border composition and topography for relief-led shots; show representative frames before a long render. Use restrained saturation/contrast so the terrain remains readable beneath overlays.

Do not substitute concentric ellipses, random noise or an attractive gradient for real geographic relief. Do not use a separate fake-map harness to certify the production map. Stay within source detail limits: a 4K export does not create high-resolution terrain or imagery. Check tile/DEM readiness at the actual camera positions and output size. Report provider failures instead of presenting an unnoticed fallback as the finished shot.

Keep required source/provider/license attribution correct. A NASA basemap is not evidence for a historical boundary, battle deployment or sovereign claim.

## 4. Geographic overlays and boundaries

Use properly georeferenced Polygon/MultiPolygon/LineString data and image corners. Country highlights and flag fills follow reviewed masks; no hand-drawn screen-space approximations presented as factual borders.

Keep these meanings separate:
- geographic basemap;
- sourced political/historical boundaries for the stated date;
- territorial claims and actual administration/control;
- illustrative routes, thematic shading and decorative artwork.

Use the existing IB/LoC/LAC/claim semantics and distinct line patterns where relevant. Boundary lines never receive travel arrowheads. Avoid coincident outlines and flag textures that hide the boundary distinctions. Generalized geometry must retain its precision/source caveat in project metadata.

For every factual boundary/highlight record source URL, relevant date and precision note, and preserve the editor's independent geometry review. A JSON `reviewed: true` flag is not evidence of review. Never invent a border from a place name or silently substitute modern state borders for historical territories.

Starting treatments, adjustable to the film:
- rivers: blue `#65B7E6`, clean directional geographic paths where warranted;
- arid/desert regions: warm yellow `#E2B75D`, roughly 0.18–0.28 opacity;
- fertile/resource regions: muted green with restrained opacity;
- country/flag fills: enough transparency to retain terrain, with reviewed masks and legible borders;
- routes: contrasting, smoothly revealed lines; arrowheads indicate travel only.

Do not show every layer continuously. Reveal the feature when its meaning is introduced, hold for comprehension, then remove or subordinate it. Show generalized regional shading as regional shading, not a surveyed historical frontier or an inescapable travel funnel.

## 5. Large typography and polished cards

Default film text is **essential geographic labels only**. Add short opening titles, years, statistics or other text only when the current user brief authorizes them. Do not automatically turn narration into captions, paragraphs, fact cards, equipment notes, debugging labels or editorial footers. Required provider attribution remains.

Use one coherent type family with good shaping for the requested language. At a 1080-pixel **short edge** (`min(width,height)`), start with:
- key city/capital/location labels: 48–64 px, semibold/bold;
- secondary geographic/region labels: 40–48 px;
- explicitly requested short opening years/titles: 72–96 px for dominant type, with a legible supporting title.

Scale with output resolution, not editor panel width. Treat these as readability targets; if the renderer's current 12/20 px defaults cannot achieve them, fix that rendering path. Do not claim compliance from a large JSON `scale` value without measuring the actual output.

Use restrained rounded navy cards (`rgba(16,27,43,0.86)`), warm white text, a fine muted gold border/accent, comfortable padding and roughly 16–24 px corner radius at the reference size. Use a dark local halo where a card would hide important geography. No broad opaque dashboard panels over the map.

Place labels near their anchors with short leaders when needed. Prioritize the main location; de-conflict labels and keep them clear of routes, border distinctions, commander faces and destination UI. Reposition, shorten an authorized label, or show fewer labels before shrinking type. Check long names and Hindi shaping.

Make label/card entrances intentional: usually a short 0.2–0.4 s fade/slide/settle and a quiet exit. Labels must be readable when their feature is named. No perpetual bouncing, repeated zoom pulses, typewriter narration or decorative motion on every word. Inspect transition bounds as well as settled positions.

## 6. Camera, routes and visual pacing

Build a shot sequence around the recorded explanation. Establish the location, widen to explain a relationship, move to the relevant pass/river/country, then return to the anchor when the story requires it.

For each shot specify its source cue, camera start/arrival/hold, active overlays and exit. Arrive at the relevant geographic feature by the important spoken cue. Choose transition lengths for the actual available speech; do not force a fixed duration on every move.

Use smooth acceleration/deceleration, a readable hold and a clear focal point. Reveal routes progressively with the narration rather than drawing a finished line at once. Keep geography north-up by default; intentional bearing changes must preserve orientation. Avoid random spinning, violent zoom jumps, drifting targets, excessive pitch and a zoom so broad the named location becomes tiny.

Use the same projection and camera evaluation in preview and export. Never certify camera quality using a harness that ignores bearing/pitch or uses a different coordinate transform.

## 7. Assets and army scenes, whenever applicable

Inventory actual PNG/GLB files before placement: dimensions, alpha, crop, facing, provenance, resolution and intended role. Use the named library assets when supplied. Missing files, low-resolution previews, baked-in nameplates and matte fringes must be resolved or explicitly retained as unfinished work; do not silently replace them with text badges.

Register images consistently by asset ID and resolved URL. Preload required artwork and fail clearly if it cannot load. Preserve aspect ratio, full intended subject and clean alpha. A repaired/generated artistic likeness must not be described as a verified historical portrait.

For armies, declare whether a scene is a **schematic comparison** or a **geographic deployment**. A left/right comparison does not establish west/east historical positions. Geographic deployments follow source-supported sectors and directions; do not invent exact troop coordinates or unit-type percentages.

Use a common personnel scale within each comparison, retain ranges/uncertainty, compare like-for-like forces and keep equipment separate from personnel. If qualifications are needed to avoid a misleading comparison but the user has prohibited such screen text, redesign the visual instead of hiding the qualification. Animate assembly, route following, deployment and settling deliberately; do not use endless formation oscillation as a substitute for tactical storytelling.

## 8. Audio is the master clock

Use the actual supplied MP3/WAV and the approved script. Deduplicate pasted script copies. Inspect/decode the recording and preserve its existing speed. TTS speed settings describe how a recording was made; never apply them a second time. Do not regenerate narration unless requested.

Store an audio-derived cue sheet with spoken anchor, source start/end, visual action, animation start/arrival/exit and review status. Use actual alignment/listening, never equally spaced words, character-count timing or a duration match alone. Keep estimates and weak alignments visibly marked. A supplied script helps reference alignment but is not proof that every word is present in the recording.

Evaluate animation from absolute timeline time so direct seeking and sequential playback agree. Confirm pauses, transitions, onset and tail. Narration remains metadata/audio unless captions were explicitly requested.

## 9. Real export and acceptance evidence

Render every output frame at its actual timeline timestamp using the real Map Editor map, camera, assets and overlays. Encoding 13 held scene screenshots at 30 fps is a slideshow, not animated video. Representative stills are useful for layout review only.

Use the existing native framebuffer/resolution handling and asset/tile readiness checks. Do not upscale a small editor screenshot, ignore failed assets, or label a fallback render complete. Preserve cancellation and restoration of the editor state.

Match the agreed output ratio/resolution; portrait Full HD is 1080×1920 and landscape Full HD is 1920×1080. Use the intended frame rate (normally 30 fps). The current deterministic Map Editor MP4 path is silent: add the original narration with an explicitly aligned finishing/mux step, or implement and test an audio-capable path. Do not claim that merely attaching an audio metadata path makes a silent export synchronized.

Before delivery:
1. Import/validate the production JSON and exercise affected editor tools, save/recovery and old-project compatibility.
2. Inspect full-resolution and phone-size frames, including the busiest shot, longest label and every transition.
3. Play continuous motion with the real audio; correct late labels, routes, camera arrivals, dropped words, jumps, collisions and missing artwork.
4. Check encoded dimensions, frame rate, stream durations, all-stream decode and motion through relevant intervals.
5. Run the focused map model/animation/browser suites and broader checks required by the root instructions for the changes made. Useful commands include `npm run test:map-editor`, `npm run test:map-animation`, the affected `tests/creator-history-browser.cjs` scenario and `npm run check`.
6. Record actual results and unreviewed portions. Mock drawing-call tests and attractive screenshots cannot establish audiovisual quality. If listening was unavailable, state that limitation.

Fix demonstrated problems, then recheck affected passages. Do not claim “perfect”, “fully synced” or “production ready” without evidence. Preserve the user's current publishing/approval instructions.

## 10. Durable project handoff

For every film, keep a project-specific production brief beside its assets under `creator/history-data/<project>/` (or the project's existing location). Include:
- original audio reference/hash, deduplicated approved script and unchanged-speed policy;
- reviewed cue sheet, plus clearly separated pending/estimated cues;
- canonical importable editor JSON, camera/overlay schedule and required assets;
- source/date/precision and asset/license manifest;
- preview/output references, completed checks and remaining work;
- exact branch/commit and a short next-action list.

Commit authorized project materials or provide durable artifact references so another agent can continue. Do not leave the only copy in a chat, temporary sandbox link, one machine's absolute path or an unnamed local draft. Project plans and review prototypes are not finished native editor sessions. Keep this universal guide separate from each film's content.

## Reusable asset library

Before generating new military or commander artwork, read [the reusable asset catalog](../creator/asset-libraries/README.md). The Historical Army & Commanders v1 library contains 19 named PNG references from the Panipat project. Import its native library JSON through Images & 3D assets → Import asset library; preserve source/rights notes. Keep new reusable collections and manifests in that directory so future films can discover them.

## Discovery and maintenance

The root `AGENTS.md`, README and `.agents/rules/map-editor-production.md` route future agents here. Keep the detailed standard in this one file; update project-specific briefs separately.

Antigravity rule discovery/activation format was checked against its [official Rules documentation](https://antigravity.google/docs/rules/). Repository rules are available after the agent opens an up-to-date checkout; stale checkouts/older branches need the latest rules brought forward. A configured rule is guidance, not a guarantee that an agent's output passed the acceptance checks above.


## History films: kingdom and polity overlays

Every future history film must include date-appropriate kingdom/polity overlays for the powers relevant to the narration. Plan their reveal, terrain transparency, boundary treatment and camera framing as part of the map sequence. Use sourced historical extents with dates and precision notes; label schematic influence/extent in metadata and never present it as a surveyed frontier. Do not substitute modern borders or invent exact boundaries. Current user instructions remain authoritative.

The current Panipat geography v7 revision is explicitly unchanged in this respect: the user asked to save this rule for future videos, not add kingdom overlays to that export.
