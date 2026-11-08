# Bundled geographic/reference data

- `land.geojson`: Natural Earth 1:110m physical land polygons, fetched 2026-11-04 from https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson . Public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Generalized physical coastline only; no modern or historical political boundaries. Zooming does not add detail.
- `india-1765-1805.jpg`: https://upload.wikimedia.org/wikipedia/commons/a/ae/India1765and1805b.jpg . File/source/rights: https://commons.wikimedia.org/wiki/File:India1765and1805b.jpg . Edinburgh Geographical Institute, *Imperial Gazetteer of India*, Oxford University Press, 1907. Public domain scan. Retrospective colonial source requiring critical review; not georeferenced and not a depiction of every intervening year. This image is shown as a reference, never stretched onto geographic coordinates.

Event sources and precision notes are embedded individually in `../history-demo.js`. Approximate city/regional anchors are locators, not surveyed battlefield or factory footprints. The Diwani marker denotes revenue rights, not full sovereignty over modern states.

No historical territorial polygons or military routes are bundled: none was verified to event-level fidelity. Do not substitute modern state polygons. Import reviewed GeoJSON with the source, date, provenance/uncertainty note and `reviewed: true`. The application verifies structure/provenance presence; a human must verify historical truth and reuse rights.

## Modern appearance reference data (November 8, 2026)

`countries.geojson` and `countries-labels.geojson` derive from Natural Earth's
`ne_110m_admin_0_countries.geojson`; `india-states.geojson` and its labels derive
from the India subset of `ne_50m_admin_1_states_provinces.geojson`.
Sources: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
and https://www.naturalearthdata.com/about/terms-of-use/ (public domain).
Only geometry, stable region ID, English name, label position and palette index
are retained. Dataset snapshot downloaded November 8, 2026. Country overrides
use ADM0_A3 (`IND`, `CHN`); states use ISO 3166-2 (`IN-GJ`, `IN-MP`).

These are generalized modern reference boundaries, not authoritative Indian
political/claim boundaries or verified historical control. State polygons use a
different cartographic scale from countries; coastlines can differ slightly.
Do not infer a contemporary boundary revision from this snapshot. Existing
reviewed boundary/claim artwork remains separate and is never replaced.
