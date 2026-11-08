# Siliguri supplied artwork

All five original PNG files supplied by the user are included without alteration. These are illustrative images, not geographic source data. The mountain image does not establish the appearance or location of any specific peak, and the railway bridge image is not evidence of a particular bridge.

`../../siliguri-assets.library.json` imports the five images into the existing Map Editor asset library. The portrait animation JSON includes the same five HTTPS asset references, so importing that animation also adds them to the library. URLs point to the immutable asset commit to keep references stable across later branch edits.

This update adds library assets only. The existing camera positions, labels, duration and aspect ratio are retained; no image placements or narration timings have been invented. No saved Creator project or Firebase data was changed. Image placement and final narration synchronization remain unfinished.

Verification: original/copy SHA-256 equality; real animation compiler accepts five assets; library import preserves existing assets and deduplicates repeated imports; existing animation content is preserved.
