# Shared Panipat production inputs

This branch is a shared input baseline for independent Codex and Antigravity versions. It starts from current master, including the permanent Map Editor production standard. Create a separate working branch for each version. Do not overwrite the other version or merge/publish before user comparison.

Read [the universal standard](../../../docs/map-editor-production-standard.md) and [the full production brief](production-brief.md).

## Inputs

- `Panipat.MP3`: original audio master, approximately 151.249 seconds, mono 44.1 kHz. Preserve its existing speed. The settings in `voice-settings.json` are creation notes, not a second speed effect.
- `approved-script.txt`: one deduplicated copy of the exact user-supplied Hindi/English script.
- `audio-cues-draft.csv` and `audio-alignment-draft.json`: 35 reference-conditioned audio cue candidates and underlying alignment. Listening review was not performed; flagged matches require playback confirmation. Do not advertise them as finally verified timestamps.
- `visual-design-review.json`: agreed visual direction. Its historical working ratios remain qualified estimates, not exact army breakdowns.
- `Panipat_Commanders/` and `Historical_Army_Assets/`: original source illustrations.
- `Panipat_Commanders/1761_Ahmad_Shah_Abdali_v2.png`: repaired full-horse/rider transparent cutout, without the original brown backdrop/nameplate. Original preview retained. See `Abdali-asset-notes.md`.
- `panipat_final_storyboard_v2.json`: legacy specification; timing is approximate and its old text-card direction is superseded by the production brief. It is not itself a verified finished editor session.

## Legacy implementation

Inspect branch `feature/panipat-historical-atlas-v2` at commit `97f4a5eac4cf8740a1c3e4a2d710e0852de77f16`. Its adapter, overlay renderer, harness and export script need repair; do not copy that branch over unrelated current master changes. Shared inputs do not implement the finished film.

Known issues include the 13-held-frame slideshow export, synthetic harness geography, 20px harness labels, generic small square editor labels, unwanted narrative cards, commander cache key mismatch, unsynchronized audio attachment, and destructive special-case imports. The full production brief lists required corrections and acceptance evidence.

## Delivery

Each agent produces a full-length 1080×1920/30-fps MP4, native editable session, reproducible source, reviewed timing and verification notes on its own branch. Only requested opening titles/years and essential geography labels appear; the user adds narrative captions. The winner is compared from the actual encoded video, not just screenshots or claims.
