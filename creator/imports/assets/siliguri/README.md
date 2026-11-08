# Siliguri supplied artwork

All five original PNG files supplied by the user are included without alteration. These are illustrative images, not geographic source data. The mountain image does not establish the appearance or location of any specific peak, and the railway bridge image is not evidence of a particular bridge.

`../../siliguri-assets.library.json` imports the five images into the existing Map Editor asset library. The portrait animation JSON includes the same five HTTPS asset references, so importing that animation also adds them to the library. URLs point to the immutable asset commit to keep references stable across later branch edits.

## Draft scene placements

| Artwork | Visibility (seconds) |
| --- | --- |
| Mountain Illustration | 25–31 |
| Northeast Supply Convoy | 32–36.5 |
| Cargo Truck | 36.5–40 |
| Freight Train | 51–56 |
| Railway Bridge | 56–62 |

These are illustrative placements, not surveyed infrastructure locations or a particular peak. Each image has an illustration caption and 0.35-second entrance/exit fades. Geographic corners respect the original PNG aspect ratio in Mercator coordinates. Road and rail camera holds keep the artwork in frame; regional labels are sized for portrait viewing.

Narration alignment remains provisional. The full animation stays 70.58 seconds in 9:16. No saved Creator project or Firebase data was changed.

Verification: original/copy SHA-256 equality; the real animation compiler accepts five assets and sixteen layers; library import preserves existing assets and deduplicates repeated imports; native MapLibre browser preview loads all five images without renderer errors and checks that each is inside the 540×960 portrait frame; five representative frames visually reviewed. Visibility boundaries are checked against the compiled layer timeline. This does not establish final narration synchronization or a full audiovisual review.
