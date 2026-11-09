# Invincible reusable map assets

## Historical Army & Commanders — v1

19 named PNG references: 6 commanders, 5 infantry, 3 cavalry, 2 elephants and 3 artillery. Original files remain unchanged and durable URLs are pinned to the shared-input commit. The clean Abdali cutout is the preferred version.

Download [the native asset library](historical-army-commanders-v1.json). In any existing Map Editor project, expand **Images & 3D assets**, choose **Import asset library**, and select this JSON. Search the library by name or category, then choose **Place**. Importing adds references without replacing scenes or layers; repeated imports of the same URLs are deduplicated. Save the destination project through its normal save controls afterward.

The initial Panipat project with the same named references is saved on branch `codex/panipat-film-20261109` at `creator/history-data/panipat/codex-native-project.json`. These files are durable GitHub/project exports; no account-owned cloud project was edited.

| Category | Asset name | Stable ID |
| --- | --- | --- |
| Commander | Commander · Babur · 1526 | `commander_babur` |
| Commander | Commander · Ibrahim Lodi · 1526 | `commander_ibrahim_lodi` |
| Commander | Commander · Bairam Khan · 1556 | `commander_bairam_khan` |
| Commander | Commander · Hemu · 1556 | `commander_hemu` |
| Commander | Commander · Ahmad Shah Abdali · 1761 · Clean cutout | `commander_ahmad_shah_abdali` |
| Commander | Commander · Sadashivrao Bhau · 1761 | `commander_sadashivrao_bhau` |
| Infantry | Infantry · Swordsman | `troop_infantry_sword` |
| Infantry | Infantry · Shield bearer | `troop_infantry_shield` |
| Infantry | Infantry · Spearman | `troop_infantry_spear` |
| Infantry | Infantry · Archer | `troop_archer` |
| Infantry | Infantry · Matchlock musketeer | `troop_matchlock` |
| Cavalry | Cavalry · Swordsman | `troop_cavalry_sword` |
| Cavalry | Cavalry · Lancer | `troop_cavalry_lancer` |
| Cavalry | Cavalry · Horse archer | `troop_cavalry_archer` |
| Elephant | Elephant · War elephant | `troop_war_elephant` |
| Elephant | Elephant · Command elephant | `troop_command_elephant` |
| Artillery | Artillery · Field cannon | `troop_field_cannon` |
| Artillery | Artillery · Heavy cannon | `troop_heavy_cannon` |
| Artillery | Artillery · Camel-mounted zamburak | `troop_camel_zamburak` |

See [the integrity/provenance manifest](historical-army-commanders-v1-manifest.json) for original paths, immutable URLs, SHA-256 hashes and crop hints. Commanders are artistic interpretations; miniatures are schematic and do not establish exact historical army equipment, likenesses, totals or deployment positions. Original supplier/creation and redistribution rights have not been independently documented. Narration MP3, approved script, cue files and map source notes remain in the Panipat shared-input project rather than this reusable image-only library.

Future map projects: inspect this catalog before generating duplicate artwork. Keep new collections in this directory using the native `invincible-map-assets` version 1 format. Use clear category/person/equipment names and preserve original provenance and stable references.

Verification: all 19 image files were read and hashed; native library import and repeated-import deduplication passed; existing layers and the source map stayed unchanged; the renamed initial project passed visual schema validation. No runtime code or cloud records were changed.
