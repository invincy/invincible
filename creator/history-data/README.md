# Bundled geographic/reference data

- `land.geojson`: Natural Earth 1:110m physical land polygons, fetched 2026-11-04 from https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson . Public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Generalized physical coastline only; no modern or historical political boundaries. Zooming does not add detail.
- `india-1765-1805.jpg`: https://upload.wikimedia.org/wikipedia/commons/a/ae/India1765and1805b.jpg . File/source/rights: https://commons.wikimedia.org/wiki/File:India1765and1805b.jpg . Edinburgh Geographical Institute, *Imperial Gazetteer of India*, Oxford University Press, 1907. Public domain scan. Retrospective colonial source requiring critical review; not georeferenced and not a depiction of every intervening year. This image is shown as a reference, never stretched onto geographic coordinates.

Event sources and precision notes are embedded individually in the internal `tests/fixtures/history-project.js` regression fixture. Approximate city/regional anchors are locators, not surveyed battlefield or factory footprints. The Diwani marker denotes revenue rights, not full sovereignty over modern states.

## Historical territory reference

Map Editor → **Historical GeoJSON → Find a historical territory** searches a local copy of 314 dated polity outlines from [Cliopatria v0.2.1](https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1), by the Seshat Global History Databank and its contributors, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The pack selects polity records overlapping 1450–1600 and intersecting the South Asia search box (60–98° E, 5–38° N). Invincible simplifies the outlines for display and retains their source year ranges. Outlines may extend outside the search region. The dataset represents approximate extents and can miss changes within a year. Check the specific event and date before importing. Include attribution in publication credits and label the extent as approximate on screen.

Load a result into the existing GeoJSON form. The source, date and precision note are filled in for review. Importing adds the geometry at the current playhead. Military routes and event-level battle geometry require separate sources.

The picker also accepts comma-separated polity names and can load every active
outline for a selected year into one colour-coded review pack. This is useful
for establishing a 1526 political context, but it deliberately leaves the
review checkbox off. Colours distinguish overlapping records; they do not
assert sovereignty, exact borders or historical certainty.

When a dynasty is missing, first try a spelling variant and the relevant year. If a historical map supplies a usable extent, digitize and import it as an approximate reconstruction with a citation. If the source only mentions places or regions, show named, sourced points or soft regional shading labeled “Regional context · modern geography.” For a claim such as “parts of present-day Gujarat and Rajasthan,” use the states as orientation and highlight only the areas the source supports. Keep modern administrative outlines separate from any historical extent. Use a visibly illustrative route only when supported endpoints or waypoints make that useful.

Rebuild with `python scripts/build-cliopatria-reference.py <cliopatria-v0.2.1.zip>` (Python 3.11+ and Shapely). The script verifies the archive SHA-256. The original 46 MB archive is kept separately from the web app. The shared Creator semantic planner now names the historical year and relevant polities explicitly. Its resource resolver checks this pack, creates only a label-based approximate locator automatically and links the factual outline request back to this manual Map Editor review. Hosted and local planners use the same contract.

Video Studio's **Create with AI** also checks this pack automatically. It looks
for matching polity names and a matching year in the timed narration or brief.
It can render an approximate locator derived from a matching polygon. The
polygon itself still uses the Map Editor's independent review workflow.
Present-day Gujarat and Rajasthan locators come from GeoNames, and Panipat's
modern locator comes from the district's geographic reference. These points
provide orientation. If a segment has no usable match, Video Studio uses a
graphic context card while retaining the original audio and timings.

For video production on the Windows laptop, run the updated
`local-ai/start-image-studio.ps1 -VideoOnly` launcher. It uses the existing
Windows-encrypted login and laptop pairing, starts Whisper and Ollama when
needed, and checks readiness before opening Creator Studio. An already
running worker from an older checkout needs to be closed first. The video
flow checks Whisper and the installed Qwen model before requesting Google TTS.
