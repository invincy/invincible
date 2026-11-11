"""Build the Map Editor's compact South Asia reference from the pinned archive."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

from shapely.geometry import box, mapping, shape


EXPECTED_SHA256 = "e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4"
REGION = box(60, 5, 98, 38)
START_YEAR, END_YEAR = 1450, 1600
OUTPUT = Path(__file__).resolve().parents[1] / "creator/history-data/cliopatria-south-asia-v021.json"


def main(archive):
    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != EXPECTED_SHA256:
        raise ValueError("Use the unmodified Cliopatria v0.2.1 GeoJSON archive.")

    with zipfile.ZipFile(archive) as zipped:
        features = json.load(zipped.open("cliopatria_polities_only_v021.geojson"))["features"]
    records = []
    for feature in features:
        props = feature["properties"]
        start, end = props["FromYear"], props["ToYear"]
        if props["Type"] != "POLITY" or end < START_YEAR or start > END_YEAR:
            continue
        geometry = shape(feature["geometry"])
        if geometry.is_empty or not geometry.is_valid or not geometry.intersects(REGION):
            continue
        simplified = geometry.simplify(0.035, preserve_topology=True)
        records.append({
            "name": props["Name"],
            "start": start,
            "end": end,
            "locator": list(simplified.representative_point().coords[0]),
            "geometry": mapping(simplified),
        })
    records.sort(key=lambda row: (row["name"].casefold(), row["start"], row["end"]))
    payload = {"version": "0.2.1", "start": START_YEAR, "end": END_YEAR, "records": records}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(records)} reference records, {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
