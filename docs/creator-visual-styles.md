# Creator Studio visual styling library

Motion Studio owns one renderer-native visual styling library. It is part of the existing complete-video manifest and compositor; it is not a separate editor, film template or alternate export path.

## Curated presets

The built-in library is deliberately small:

| ID | Theme | Purpose |
| --- | --- | --- |
| `history-archive-gold` | Historical Archive | Archival typography, navy label plates, clean L-shaped gold corner brackets, grounded portrait PNGs and higher-contrast documentary terrain. |
| `geography-field-atlas` | Field Atlas | Natural terrain, blue geographic accents, crisp map labels and restrained survey marks. |
| `science-signal-blueprint` | Signal Blueprint | Diagram-friendly cyan hierarchy, technical corners and quick settled entrances. |
| `finance-ledger-green` | Executive Ledger | Deep-green surfaces, numeric hierarchy, restrained gold accents and disciplined dividers. |

History and Geography are the primary production presets. Science and Finance provide coherent tokens without adding topic-specific compositions.

## Manifest contract and inheritance

Optional fields are additive and valid in existing version 1 and version 2 Motion Studio manifests:

- `manifest.visualStylePresetId`: video default.
- `manifest.visualStylePresets[]`: up to 20 project/user presets. Saved IDs begin with `user-` and inherit from one built-in `baseId`.
- `scene.visualStylePresetId` and `scene.styleOverrides`: scene exceptions.
- `overlay.visualStylePresetId`, `overlay.styleRole` and `overlay.styleOverrides`: element exceptions. Roles are `title`, `subtitle`, `date`, `label`, `body`, `number`, `portrait`, `ornament` and `divider`.

Resolution order is built-in preset → saved preset tokens → video preset → scene preset/overrides → element preset/overrides → explicit legacy element properties. Applying a preset changes only styling fields. It does not change scene IDs, start/duration, engine type, layout coordinates, assets, native map snapshots or audio.

Manifests without style fields resolve no style and retain their previous renderer output. No bulk migration or Firestore collection change is required. The style library travels with the existing account-scoped Motion Studio draft and its revision.

## Deterministic rendering

The existing Canvas compositor renders text plates, typography, image frames/ground shadows, entrances and ornament corners. Corners are one L-shaped path per corner and never two crossing lines. Motion uses the scene clock, so seeking, preview and MP4 export agree.

For native map scenes, the renderer clones the scene's immutable source snapshot and applies the selected map tokens only to that render copy: basemap saturation/contrast, Documentary Terrain label/card colors, relief tint/strength and camera easing. Saved geography, boundaries, routes, camera keys and scene type are not rewritten. Existing authored boundary semantics remain authoritative; a visual preset does not invent political geometry.

## Studio and agent access

The inline **Visual styles** gallery provides preview, Apply video, Apply scene and a compact custom-preset editor. One-click Apply saves through the existing canonical draft/revision path.

The browser agent exposes `listStylePresets`, `getStylePreset`, `applyStylePreset` and `updateStylePreset`. The authenticated cloud plugin exposes matching tools:

- `list_creator_style_presets`
- `get_creator_style_preset`
- `apply_creator_style_preset`
- `update_creator_style_preset`

Apply/update require the current draft revision. Scene application preserves the target engine, timing and all unmentioned content. The planning contract advertises the same preset IDs so Codex and Gemini can request a preset instead of repeating low-level style parameters.

## Verification and limits

Automated coverage validates schema bounds, legacy no-op behavior, inheritance, custom-preset persistence, revision conflicts, map non-mutation and plugin metadata. The actual Motion Studio browser regression applies Historical Archive, saves/reloads it, captures the renderer, exports 1080×1920 H.264/AAC MP4 and decodes the full output.

The library improves existing labels and imagery but does not perform semantic collision detection, identify a PNG's face automatically, create missing boundary sources or repair a poor source crop. Element roles can be set explicitly when inference is insufficient. Live production Firebase permissions and physical-device/Safari rendering remain separate checks.
