# ANTIGRAVITY — FINAL PANIPAT HISTORICAL ATLAS (V2)

Repository: invincy/invincible. Upgrade the EXISTING Map Editor; do not rebuild it.

## Inputs
- `Panipat.MP3` (verified 151.248938 s, audio master)
- `panipat_final_storyboard_v2.json` (DESIGN SPEC, NOT confirmed native session schema)
- `Historical_Army_Assets/` (13 individual PNGs)
- `Panipat_Commanders/` (6 commander PNGs; Abdali is LOW-RES PREVIEW)

## First inspect before changing anything
Locate existing Map Editor architecture, MapLibre style/layers, actual JSON import/export format, audio timeline, camera/keyframes, PNG asset registry, formation overlays, portrait viewport, MP4 exporter. List exact existing vs missing features and files affected. Build an adapter to the actual existing session schema; do NOT pretend this JSON imports natively. Preserve all old projects and controls.

## Deliverable
Create a complete Panipat portrait 9:16 historical atlas session with 13 scenes and the exact original MP3. Synchronize scene boundaries to audio waveform/phrases: current times are ESTIMATES only. Do not speed audio. Render and visually inspect MP4 frames and check audio sync.

## Camera and story
Start tight on Panipat with year chips 1526/1556/1761; pull out to Kurukshetra; widen to NW India Hindu Kush/Himalaya and Khyber; reveal Punjab–Haryana–Delhi strategic corridor; Yamuna/dry region; sweep east over Ganga–Yamuna Doab and Gangetic Plain; show resources; return to Panipat for terrain and formations; Panipat–Delhi distance; quick three-battle army comparison; final corridor-wide pullback ending on Panipat. Camera north-up in all GEOGRAPHIC scenes. Do not create a false compulsory chokepoint or precise invented historic road.

## Typography and cards — high priority
Use V2 JSON `visualSystem`: premium dark navy and restrained gold, clean Devanagari + Latin fonts, translucent rounded 16px cards with subtle border/shadow, sufficient contrast and 9:16 title-safe margins. Cards are context-specific, no generic opaque rectangles, no overlapping commander/route/critical locations. Years are big readable pills. Animate cards with subtle 300ms fade/slide, never distracting bounces. Test on phone-scale preview.

## Military visualization — two distinct modes
1. COMPARISON: Left/West column vs Right/East column, opposing commanders face inward. Clearly marked SCHEMATIC, not actual geographical deployments. Strength shown by number of main units using same per-battle scale, NEVER by making soldier icons larger.
2. HISTORICAL: North-up terrain, only approximate sourced formation sectors. In 1761 Marathas advanced SOUTH from Panipat toward Durrani forces; never distort to West/East to fit schematic comparison.

Each sub-unit = 4 identical 2D illustrated icons; each main unit = 4 sub-units = 16 icons. Square 4x4, line 8x2. Support formation morph without changing represented strength. The troop icon itself is not a literal soldier count. Artillery pieces and elephants are EQUIPMENT with their own counts, never add to personnel totals. Unknown cavalry/infantry splits must remain UNKNOWN; show neutral personnel blocks plus illustrative supported detachments, not fabricated precise compositions.

### Battle presets
- 1526 Babur ~15,000 vs Ibrahim Lodi ~35,000 COMBATANTS (range and uncertainty visible); at 2,500 per main unit display 6 vs 14. Babur linked cart line, protected cannon/matchlockmen, cavalry wings and flanking maneuver; Lodi elephants. 20–24 Babur guns and ~1,000 Lodi elephants are source estimates, not 1:1 icons in army headcount.
- 1556 Mughal VANGUARD cavalry ~10,000 vs Hemu cavalry ~30,000 (4 vs 12 at 2,500/unit). These are NOT whole-army totals. Hemu's 500–1,500 elephant reports conflict; display disputed range or omit numeric elephant count. Hemu on elephant; Bairam Khan represents Mughal leadership but was not necessarily in the frontline.
- 1761 Durrani coalition ~60,000 vs Maratha coalition ~45,000 is ONE illustrative reconstruction, NOT settled; show 12 vs 9 at 5,000/unit and prominent estimated labels. Show Gardi infantry/Maratha cavalry/artillery, Afghan cavalry/Rohillas/zamburaks as illustrated types without invented numerical splits.

Keep battle comparisons short: the narration explains geography, not full tactical reenactments. All formations and commander illustrations must be legible but not obscure the map. Commander assets are artistic, not verified likenesses. Abdali PNG is a preview: flag for replacement and do not falsely mark final-quality.

## Technical safeguards
- Inspect PNG alpha; do not assume sprite-sheet extracted assets are clean. Flag edge artifacts.
- Keep all existing presets, map overlays, Chakra, camera animations, JSON session import/export, asset handling, and video export untouched except additive compatibility changes.
- Version adapter and include migration tests. Never rewrite existing session files.
- Implement a simple missing-asset fallback and asset-path validation.
- Add small source/uncertainty footnotes for military numbers, not large obstructive disclaimers.
- Preserve 30fps 9:16 output and full 151.248938 s audio.

## Acceptance tests
1. Existing Map Editor projects load, edit and export.
2. New Panipat session loads via ACTUAL editor schema/adapter, audio exactly synced.
3. 4x4 and 8x2 = 16 icons; four groups of four; smooth morph.
4. Unit counts 1526 6:14, 1556 4:12 cavalry/vanguard only, 1761 12:9 estimated.
5. Equipment counts are separate and source caveats displayed.
6. Historical geographic map always north-up; 1761 geographic direction north-to-south, comparison is side-by-side.
7. Cards are attractive rounded dark translucent with excellent contrast, phone legibility and safe margins.
8. Render 9:16 MP4, check representative frames from all 13 scenes and audio tail.
9. Report actual changes, tested features, unsupported items, and preview/asset-quality warnings.

DO NOT deploy/publish without separate explicit approval. The user has authorized preparation and implementation of this Panipat session, but not production deployment.

## Historical references
- https://panipat.gov.in/first-battle/
- https://panipat.gov.in/second-battle/
- https://panipat.gov.in/third-battle/
- https://ignca.gov.in/Asi_data/38167.pdf
