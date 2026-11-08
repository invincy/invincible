# Siliguri supplied artwork

All five original PNG files supplied by the user are included without alteration. These are illustrative images, not geographic source data. The mountain image does not establish the appearance or location of any specific peak, and the railway bridge image is not evidence of a particular bridge.

`../../siliguri-assets.library.json` imports the five images into the existing Map Editor asset library. The portrait animation JSON includes the same five HTTPS asset references, so importing that animation also adds them to the library. URLs point to the immutable asset commit to keep references stable across later branch edits.

## Map-only revision

The animation now uses the documentary house map, matching India Border portrait v4: Blue Marble satellite imagery, low relief lighting, persistent country overlays, white sourced reference borders, country names and flat camera motion. All truck, train, mountain and bridge placements and their captions have been removed. The five supplied files and separate library remain available for future explicit requests; they are not loaded by the map-only animation.

The animation remains 70.58 seconds in 9:16. Narration synchronization remains provisional. The documentary preset requires the accompanying Map Editor update; the currently published editor does not yet recognize it. No saved Creator/Firebase project has been changed.

For the currently published editor, use `../../siliguri-map-only.animation.json`. It packages the same satellite look, five geographic country-flag overlays and source-noted reference borders directly, so it needs no new preset support. Review the cited geometry in the existing import dialog. Its only images are the geographic country overlays, not the supplied truck/train/mountain/bridge artwork.

## Width and transport revision

A schematic double-headed width marker is shown at 10–21s. Selected mapped NH27/NH327 geometry is gold at 31–41s; existing main broad-gauge railway geometry is cyan/dashed at 51–62s. On-map OpenStreetMap credit accompanies transport segments. These are geographic overlays, not decorative vehicle artwork. Source catalog and precision limits: `../../siliguri-transport-sources.md`. Narration timing remains provisional.
