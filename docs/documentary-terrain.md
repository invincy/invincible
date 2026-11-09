# Documentary Terrain — architecture inspection

The main native editor uses map-defaults.js for saved new-project presentation, map-style-library.js for NASA raster imagery/Terrarium DEM, map-editor-model.js for layers, history-model.js for absolute scene time/cameras/routes, map-labels.js for screen-facing cards, and history-player.js for a shared preview/export compositor. Deterministic H.264 MP4 uses map-video-export.js and settled WebGL frames at 30 fps. Native-map Studio scenes use that player too; fallback preview cannot certify HD output.

Existing gaps: one-size card typography, no priority hierarchy, no scene presentation overrides, no optional editorial counters/captions, preview-sized route strokes, no Shorts guide, and no bundled Hindi font. Existing route reveal and smooth camera interpolation are reusable; they must not be replaced by wall-clock effects.

The reference is an artistic appearance reference, not geographic source data. Blue Marble is a regional composite capped at source zoom 8; ASTER relief reaches source zoom 12. Terrarium provides actual elevation. Real Panipat–Delhi geography is predominantly plain; invented mountains or river paths will not be added to match the image. The mobile earthquake recording was unavailable; the user confirmed the supplied image is the visual direction.

## Implemented

Documentary Terrain is the version-2 default in creator/map-defaults.js, exposed through the existing Style panel. Classic version-1 snapshots remain valid and are not migrated. Applying a preset to an existing project is explicit.

The shared compositor in creator/map-documentary.js provides hierarchy with bold, compact rounded cards for location names, English casing/tracking, Hindi shaping with locally bundled licensed Noto faces, halo/card/callout treatments (cards are the default; regional terrain text remains unboxed), coordinate-anchored markers, one entrance pulse, fade/slide entrances, collision/priority placement and optional terrain-oriented regional text. This last mode is a local tangent approximation, not text draped as a mesh over every mountain. Dense lower-priority labels are hidden instead of overlapping or being shrunk.

Thin route strokes scale from the 1080-pixel short edge. New route colours/widths inherit the saved preset until explicitly overridden. Existing progressive geographic routes and authored smooth cameras are retained. If a new Documentary project has no authored cameras, scene locations/routes are framed automatically with a short transition and hold. No narration alignment is inferred.

Optional visual.overlays entries support type:number (heading/startValue/endValue/decimals) and type:caption (text/highlight), with sceneId/offset/duration/visible. Counters use absolute timeline time with fixed numeric allocation; captions default off and never come from narration automatically. UI additions are in Information graphics. Scene mapPresentation overrides merge into the saved project presentation; they can be authored in existing project/Studio JSON.

Phone review increased secondary labels to 48 px by default; the connection test uses 52 px for Delhi. Primary labels remain 56 px. These are saved centrally, not repeated in project instructions.

Safe margins reserve space for portrait platform controls and metadata. The Shorts guide is a DOM-only preview element, so neither MP4 nor WebM/native composition can capture it. The guide is conservative and advisory; platform controls vary. Camera rotation/pitch and assets remain editable.

## Technical demonstration

The existing editor loads tests/fixtures/documentary-terrain-project.json for overview → Panipat focus → Delhi connection → year change. It is test data, not a film-specific renderer or a new demo page. Panipat [76.97,29.39] comes from https://panipat.gov.in/geographical-status/ ; the Delhi metropolitan locator uses the UN New Delhi point from https://ungegn.un.org/dashboard/cities/details?id=100 . The straight connector is labelled illustrative, not a historical itinerary. The dates test typography rather than assert a historical event.

## Sources and limits

NASA GIBS service: https://nasa-gibs.github.io/gibs-api-docs/ . MapLibre's installed project() implementation projects with the active terrain; API reference: https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#project . Local font sources, hashes and SIL licences live in creator/fonts/.

NASA imagery has finite source resolution; a 1080p/4K export cannot invent detail. The image reference is more stylised than the real data. Very dense labels may be suppressed; terrain-aligned text is approximate; the Shorts guide is not a platform certification. The short technical export is silent. Existing Studio audio composition is retained and regression-tested. No earthquake recording was supplied, and audiovisual comparison to it is not claimed.
