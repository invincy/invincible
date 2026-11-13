# Creator Studio AI planning — complete consultation report

Date: 2026-11-13  
Repository: `invincy/invincible`  
Scope: Creator Studio, Script/Sync Plan, Local Whisper, Qwen, OpenAI planning, Map Editor, Motion Studio and MP4 export

## 1. Purpose of this report

This report is intended to be shared with external reviewers such as Gemini, ChatGPT or another engineering team. It explains:

- what the current Creator Studio project is trying to achieve;
- the current user workflow;
- what instructions and data are sent to each AI;
- what every tool is responsible for;
- the JSON contracts and renderer boundaries;
- what worked in the controlled trial;
- where the first relevant failure occurs;
- why the current prompt cannot produce the requested visual style reliably;
- whether JSON should be placed inside the instructions;
- what can be hardcoded safely;
- how Qwen can eventually be adapted or fine-tuned;
- the recommended implementation sequence.

The timing/transcription stage is not the main subject. For planning evaluation, the timestamps and segment text should be treated as already locked input.

## 2. Project objective

Creator Studio is meant to convert an approved narration into an editable and exportable video without sending the user through disconnected tools.

The intended visible workflow is:

1. **Script** — write or paste narration, generate/upload the final MP3 and choose the exact playback speed.
2. **Sync plan** — obtain locked timestamps, paste animation direction and generate one visual plan per timed narration segment.
3. **Review maps** — open every generated geographic scene in the real Map Editor, in timeline order, for review or correction.
4. **Motion & export** — combine Map, Canvas, Battlefield, Image, Video and 3D scenes on one timeline with the exact MP3, preview and export an MP4.

The system is not supposed to generate a separate demo page or a second renderer. It must use the existing Creator Studio, Map Editor and Motion Studio schemas and renderers.

## 3. The specific AI task

Once timestamps are locked, the AI does not need to rediscover timing. Its job should be narrowly defined:

> For every locked narration segment, choose the correct supported editor engine and return an executable visual plan that follows the Invincible style, uses only known capabilities/assets and preserves the exact segment timing.

For the ITCZ trial the planner should have received four locked segments, one creative brief, the available tools/assets and a versioned style/capability contract. It should have returned four plans with unchanged timing.

The AI should not be responsible for:

- changing narration;
- generating or estimating timestamps;
- changing playback speed;
- exporting the MP4;
- inventing assets or durable asset IDs;
- inventing factual geography;
- deciding undocumented renderer fields;
- manually reproducing application-owned colour and typography constants.

## 4. Controlled trial

Two projects were created with the same script, animation instructions, voice family, style selection and final playback speed:

- **Invincible AI** — OpenAI cloud planning.
- **Quan** — Local Whisper plus Qwen3 4B planning.

Raw outputs and MP4s are stored locally under `.test-output/itcz-ai-comparison/`:

- `invincible-ai.json`
- `invincible-ai.mp4`
- `quan-qwen.json`
- `quan-qwen.mp4`
- `trial-notes.md`

The important planning result was:

- OpenAI returned an atmospheric prose concept but compiled it as a single generic Canvas scene, not an executable Map Editor scene.
- Qwen retained four locked segments but returned an unsupported intent. The application correctly produced four safe static fallback cards.
- Neither result produced the expected map, wind streams, atmospheric belt, styled ITCZ pill, framed composition or map-to-cross-section transition.

The trial proved that project persistence, safety validation, audio handoff and MP4 rendering work. The broken layer is the translation from creative direction to supported editor operations.

## 5. Exact animation instructions used in the trial

The following 3,045-character brief was saved in both trial projects:

```markdown
## Animation Instructions — ITCZ Hook

Create a premium, minimalistic 2.5D geography animation in **9:16 portrait format**.

Automatically synchronize all animations with the uploaded voiceover. Use the narration timestamps as the source of truth. Do not generate additional narration or change the script.

**Visual Style:** Clean satellite-inspired terrain map, dark navy oceans, realistic land boundaries, subtle atmospheric glow, smooth camera movements and animated wind-flow particles. No clutter, unnecessary text or cartoon effects.

### Shot 1 — भारत के Monsoon का रास्ता कौन बदलता है?

Open immediately on a map showing India and the Indian Ocean.

Animate multiple flowing blue wind streams approaching India from the southwest, representing South-West Monsoon Winds.

Camera gently pushes toward India. Wind streams remain moving, creating immediate visual interest.

Briefly highlight their curved paths to establish the question.

### Shot 2 — हर साल एक विशाल Low Pressure Belt अपनी जगह बदलती है।

Camera smoothly zooms out to include the Equator and surrounding Indian Ocean.

Reveal a translucent, softly glowing atmospheric belt near the Equator.

Label it **Low Pressure Belt**.

Animate the belt gradually shifting northward toward the Indian subcontinent. Show its position changing, with a faint trail indicating the earlier position.

The belt must appear as a broad, irregular atmospheric zone, not a rigid straight line.

### Shot 3 — और इसका नाम है — ITCZ!

Highlight the atmospheric belt.

Reveal large, elegant typography:

**ITCZ**

Below it, in smaller text:

Inter-Tropical Convergence Zone

Animate subtle wind streams converging into the belt from the northeast and southeast, using geographically correct directions.

Keep the map visible behind the title.

### Shot 4 — लेकिन आखिर ये ITCZ है क्या, और कैसे काम करता है?

Smoothly transition from the geographical map into a simplified 2.5D atmospheric cross-section near the Equator.

Show warm, moist air rising from the surface as two opposing surface wind streams converge.

As the air rises, introduce subtle cloud formation.

End with this atmospheric cross-section ready for the next explanation.

## Animation Rules

- Match every visual transition to its corresponding spoken phrase.
- No fixed scene durations; derive timing from voiceover.
- Preserve geographical accuracy, including the Equator, Indian landmass and wind directions.
- Use smooth camera movements, continuous animation and minimal transitions.
- Prioritize visual storytelling over text overlays.
- Use only essential labels: Equator, Low Pressure Belt and ITCZ.
- Do not add unrelated countries, weather systems or explanatory sections.
- Do not show ITCZ as the sole cause of the Indian Monsoon.
- Use registered map, wind, typography and 2.5D assets wherever available.
- If an animation is unsupported, use a simpler supported equivalent rather than inventing assets or skipping the scene.
- Export the final animation as a 1080 × 1920 MP4 synchronized with the uploaded narration.
```

## 6. Analysis of the current instructions

The brief is creatively clear, but it mixes four different responsibilities:

1. **Editorial direction** — what each shot should explain.
2. **Style direction** — premium, minimal, navy, atmospheric and smooth.
3. **Technical orchestration** — synchronization, duration and engine behavior.
4. **Delivery instruction** — export a 1080×1920 MP4.

Only the first category should primarily come from the user. The application already knows the aspect ratio, timestamps, export format and available renderer capabilities. Repeating those requirements in every creative brief increases prompt length and creates conflicts.

### Instructions that should remain user-editable

- narrative purpose of each shot;
- what relationship or process must be shown;
- authorized on-screen labels;
- factual cautions, such as not presenting ITCZ as the sole cause of monsoon;
- desired visual emphasis;
- topic-specific geography or source notes.

### Instructions that should be injected automatically by the application

- exact segment IDs and timestamps;
- aspect ratio, frame rate and resolution;
- style-profile ID;
- permitted engines and operations;
- current asset and map IDs;
- JSON Schema;
- validation limits;
- output must contain one plan per segment;
- unchanged narration/timing policy;
- source/geometry safety rules;
- fallback and missing-information behavior.

### Instructions that should be removed from the creative brief

- "Automatically synchronize" — timestamps are already locked.
- "No fixed scene durations" — exact durations already exist.
- "Export the final animation" — the planner does not export.
- generic requests to use registered assets — the application should send the exact permitted IDs.
- vague "use a simpler supported equivalent" — the application must enumerate permitted equivalents.

### Current feasibility conflicts

Several requested effects are not expressible through the current AI planning contract:

- Continuous wind-flow particles are not a Map Editor layer type.
- A broad irregular moving atmospheric belt is not represented by the current local intent vocabulary.
- A sourced `highlight` polygon is intended for reviewed geography; an illustrative moving atmospheric zone needs a distinct supported treatment.
- A map-to-2.5D cross-section transition is not an available local intent.
- The current AI map compiler produces no Motion Studio screen overlays, so frames, borders and pills cannot appear on map scenes.
- The loaded asset catalog contains historical army/commander and flag-map assets, not verified wind, cloud or atmospheric cross-section assets.

The instruction is therefore asking for a visual result that the AI contract cannot currently encode.

## 7. Current end-to-end architecture

```text
Approved script
    ↓
Google Gemini TTS or uploaded MP3
    ↓
Exact final-speed MP3
    ↓
Whisper/OpenAI timing (locked segments)
    ↓
Animation instructions + locked transcript
    ↓
Provider choice
    ├── OpenAI callable → Zod structured scene ideas
    └── Local worker → Qwen compact intent JSON
    ↓
Provider-specific compiler
    ↓
Creator AI storyboard scenes
    ↓
Map review (only when executable mapAnimation exists)
    ↓
Motion Studio schema-version-2 manifest
    ↓
Map/Canvas/etc. compositor + exact MP3
    ↓
Native MP4 export
```

The two provider branches do not currently use the same planning schema or compiler. This makes comparison and training difficult.

## 8. What each tool does

| Tool/component | Current responsibility | What it should not do |
| --- | --- | --- |
| Creator project page | Project navigation, revisions, save/recovery and workflow steps | Generate visual choreography |
| Script/TTS page (`creator/tts.js`) | Script, voice settings, final MP3, timing checkpoint, instructions and provider selection | Define renderer internals in user text |
| Local Whisper | Convert MP3 to timed text/words | Choose visuals or style |
| OpenAI transcription | Cloud alternative for timed transcript | Choose visuals during transcription |
| OpenAI planner callable | Produce one Zod-validated map/canvas idea per supplied segment | Export video or invent unavailable assets |
| Local paired worker | Secure browser-to-local bridge, catalog loading, Qwen request, validation and compilation | Become a second editor/renderer |
| Qwen3 4B | Choose compact scene intentions | Invent schema fields, geometry or assets |
| Style profile | Store reusable Invincible visual decisions | Contain film-specific narration or coordinates |
| Asset/context catalog | Declare usable IDs and reviewed geography | Imply that an asset is appropriate or sourced merely because it exists |
| Plan compiler | Convert supported semantic choices into canonical JSON | Make unreviewed creative/factual decisions silently |
| Map animation validator/importer | Validate and compile native Map Editor instructions | Interpret vague prose |
| Map Editor | Edit and render geographic cameras/layers | Render Canvas-only diagrams automatically |
| Motion Studio | Compose all engines, screen-space overlays and audio | Infer missing AI intent from prose |
| MP4 exporter | Render the canonical timeline and synchronized audio | Repair planning mistakes |

## 9. Current Local Qwen implementation

### 9.1 Installed runtime

- Ollama
- `qwen3:4b`
- `qwen3:4b-instruct`
- Local Faster-Whisper service
- Local paired worker at the protected loopback API

The laptop has a GTX 1650 Max-Q with 4 GB VRAM. This is sufficient for quantized 4B inference but not a practical dependable training setup.

### 9.2 Existing style profile

The repository already contains `creator/creative-style-profile.json` with:

- ID `invincible-documentary-v1`;
- 9:16 safe areas;
- navy, warm-white and gold palette;
- Hindi-capable font family;
- card label style;
- smooth, restrained camera limits;
- Documentary overlay preset;
- verified-asset and no-invented-coordinate rules.

This is valuable, but incomplete for the current user preference. It does not define:

- outer composition frame;
- fine-border treatment;
- named pill treatments;
- screen-overlay layering over maps;
- atmospheric-belt treatment;
- wind-flow treatment;
- cross-section scene treatment;
- scene-to-scene continuity tokens.

Its minimum label size of 26 also does not express the production standard's normal 48–64 px key-label target at a 1080-pixel short edge.

### 9.3 Critical live-path issue

The richer `buildQwenPrompt()` function includes the style profile, verified example, assets and animation presets. However, the active Step 2 local planning route does **not** call that function.

The live route calls `buildCreativePlanPrompt()`, which asks Qwen for only:

```json
{
  "scenes": [
    {
      "sourceSegmentId": "segment-1",
      "intent": "advance|reveal|hold|title",
      "assetId": "",
      "locationId": "",
      "routeId": "",
      "title": "short label"
    }
  ]
}
```

That live prompt includes segments, verified locations, reviewed routes, filtered military assets and the free-text creative direction. It does **not** include the installed style profile or the complete Map/Motion capability contract.

This is the clearest first implementation defect.

### 9.4 Output constraint issue

The current Ollama request uses:

```json
"format": "json"
```

This requests valid JSON but does not constrain the response to the exact plan schema. Ollama supports supplying a full JSON Schema object in `format`; the current local planner is not using that stronger mechanism.

### 9.5 Intent vocabulary issue

Only four local intents are accepted:

- `advance`
- `reveal`
- `hold`
- `title`

The ITCZ brief needs concepts such as:

- establish-region;
- illustrative-flow;
- reveal-zone;
- shift-zone;
- converge-flows;
- emphasize-term;
- geographic-map;
- atmospheric-cross-section;
- transition-map-to-diagram.

Qwen cannot select operations it has never been permitted to name.

### 9.6 Compiler issue

The local compiler maps:

- `advance` + reviewed route → one Map Editor route;
- other intents + reviewed location → one label and slow zoom;
- missing geometry → context-map attempt or fallback card.

It cannot compile wind systems, atmospheric zones, map overlays, frames, pills, Canvas diagrams or transitions. Even a perfect Qwen response within the current schema could not generate the requested ITCZ film.

### 9.7 Retry issue

The worker makes up to two targeted attempts, but both use the same prompt at temperature zero. This is useful for transient/parser failures, but it is not a meaningful semantic repair loop. The second attempt is not supplied with field-level validation errors and permitted corrections.

## 10. Current OpenAI implementation

The OpenAI planner is stronger structurally:

- it uses a Zod schema with OpenAI structured output;
- it requires one scene per supplied segment;
- it supports `map` and `canvas` engine selection;
- it supports map camera start/end, labels and illustrative routes;
- it compiles map ideas into `invincible-map-animation` version 1.

However, its planning schema still lacks:

- the versioned Invincible style-profile object;
- project asset IDs;
- Motion Studio screen overlays;
- frame/border/pill definitions;
- moving atmospheric zones;
- map-plus-overlay compositions;
- Map/Canvas transition choreography;
- Battlefield, Image, Video and 3D selection;
- source-backed highlight/boundary structures;
- the same intermediate schema used by Qwen.

Its map compiler creates only labels and routes. A map idea is downgraded to Canvas when it lacks labels/routes. Therefore, an atmospheric map composition can easily become a generic Canvas card even when the creative brief requests a real map.

## 11. Current Map Editor contract

The canonical map instruction format is `invincible-map-animation` version 1. It supports:

- aspect ratio, basemap and terrain;
- camera and lighting keys;
- registered assets;
- layers: `symbol`, `label`, `route`, `boundary`, `highlight`, `image`, `glb`;
- optional information overlays;
- reviewed sources for factual boundary/highlight geometry;
- absolute instruction timing.

The importer validates the instruction file before changing project state. It rejects unsupported keys, invalid timing, missing assets, unknown symbols and unsourced factual geometry.

The Map Editor also exposes a complete `animationBrief()` containing its accepted schema. That brief is currently used for manual ChatGPT import, but it is not the shared machine-readable contract for both AI providers.

## 12. Current Motion Studio contract

Motion Studio schema version 2 supports:

- engines: Map, Canvas/graphic, Battlefield, Image, Video, 3D and LIC;
- ordered non-overlapping scenes;
- screen-space overlays: text, image, rectangle, circle, line and arrow;
- overlay timing and keyframes;
- brand presets;
- audio clips;
- map source snapshots or map-animation instructions;
- native MP4 export.

This is where frames, borders and pills should be represented. They are screen-space composition elements, not necessarily geographic Map Editor layers.

The present AI compiler creates map scenes with:

```json
"overlays": []
```

Therefore, the desired frame, border and pill treatment cannot appear on AI-generated map scenes today.

The Canvas compiler is also fixed to a simple circle, title and subtitle composition. It does not compile the AI's prose visual description into actual Canvas objects.

## 13. Where the problem arises

The first relevant failure is not Whisper. It is the planner contract.

The failure chain is:

```text
Good locked timestamps
    +
Good topic-specific creative brief
    ↓
Provider receives an incomplete/different capability contract
    ↓
Model returns prose or an unsupported compact intent
    ↓
Compiler supports only a small subset of the requested visuals
    ↓
Map/pill/frame/atmospheric effects are lost
    ↓
Canvas card or safe fallback is produced
```

### Root causes

1. Local and cloud providers use different schemas.
2. The live local route bypasses the installed style profile.
3. Local output uses generic JSON mode instead of JSON Schema-constrained generation.
4. The local intent enum is much too small.
5. The compiler cannot express the requested style/effects.
6. Map AI scenes receive no Motion Studio overlays.
7. The current asset catalog does not contain the requested atmospheric artwork.
8. The user brief includes requirements outside the planner's responsibility.
9. There is no deterministic, shared semantic-to-renderer compiler.
10. There is no approved-example dataset or held-out planner evaluation.

## 14. Should JSON be included in the instructions?

### Short answer

Yes, the AI should receive a hardcoded JSON Schema and capability/style data. No, the user should not paste the complete renderer JSON schema manually into every animation brief.

### Recommended separation

The application should assemble four inputs automatically:

1. **Locked cue sheet** — segment IDs, text, start and end times.
2. **Creative brief** — only the topic-specific visual/editorial request.
3. **Style and capability contract** — versioned application-owned JSON.
4. **Available resources** — exact asset, map and source IDs for the current project.

The model should return a small intermediate JSON plan. Application code should compile it into final Map Editor and Motion Studio JSON.

### Why not request final renderer JSON directly?

- The final schema is large and changes with editor capabilities.
- Small models struggle to preserve many nested constraints.
- Style constants become duplicated training facts.
- Model mistakes can create unusable or unsafe geometry.
- Cloud and local providers drift into different interpretations.
- A deterministic compiler is easier to test and migrate.

### When direct final JSON is useful

Direct `invincible-map-animation` JSON remains useful for the manual Copy ChatGPT brief workflow and for high-capability models during expert review. It should not be the only automated production path.

## 15. Proposed shared intermediate schema

Both OpenAI and Qwen should return the same compact schema. A possible direction is:

```json
{
  "plannerVersion": "creator-semantic-plan-v1",
  "styleProfileId": "invincible-documentary-v2",
  "scenes": [
    {
      "segmentId": "segment-1",
      "engine": "map",
      "sceneKind": "geographic-process",
      "objective": "Establish southwest monsoon flow toward India",
      "mapContextId": "india-indian-ocean",
      "cameraPreset": "regional-gentle-push",
      "operations": [
        {
          "type": "illustrative-flow",
          "flowPresetId": "southwest-monsoon",
          "treatment": "cool-blue-streams"
        }
      ],
      "screenTreatment": {
        "frame": "documentary-fine-border",
        "primaryLabel": "none"
      },
      "missingInformation": []
    }
  ]
}
```

Every selectable value must be an enum or a verified catalog ID. The model must not supply arbitrary renderer keys.

The compiler would resolve:

- exact colours;
- font and size;
- padding, radius and border;
- camera values;
- layer and overlay JSON;
- timing relative to the locked segment;
- transition details;
- final schema version.

## 16. Proposed Invincible style profile v2

The next style profile should extend—not duplicate—the existing Documentary Terrain and AdiChimp brand settings.

Suggested semantic tokens:

```json
{
  "id": "invincible-documentary-v2",
  "mapPresentation": "documentary-terrain-v2",
  "brandPreset": "adichimp",
  "composition": {
    "frame": "fine-rounded-border",
    "safeArea": "portrait-platform-safe",
    "maximumPrimaryIdeas": 1
  },
  "labels": {
    "primary": "large-pill",
    "secondary": "compact-card",
    "geographic": "anchored-map-card"
  },
  "palette": {
    "surface": "deep-navy",
    "text": "warm-white",
    "accent": "muted-gold",
    "flowCool": "atmospheric-blue",
    "flowWarm": "rising-air-amber"
  },
  "motion": {
    "camera": "gentle-arrive-hold",
    "labelEntrance": "fade-slide-settle",
    "avoid": ["bounce", "spin", "word-by-word-animation"]
  }
}
```

These values should resolve to existing renderer constants or new tested reusable capabilities. Film-specific words such as ITCZ must not be stored globally.

## 17. Proposed ITCZ planning result

With the same four locked segments, the correct semantic result would be approximately:

### Segment 1

- Engine: Map.
- Context: India and Indian Ocean.
- Camera: regional overview → gentle push toward India.
- Geographic operation: illustrative southwest-flow preset.
- Screen treatment: fine documentary frame.
- No unnecessary text.

### Segment 2

- Engine: Map plus screen/geographic overlay.
- Camera: widen to include Equator.
- Operation: reveal illustrative atmospheric-zone preset and animate its northward seasonal shift.
- Label: `Low Pressure Belt` in compact pill/card.
- Treatment must explicitly say illustrative, not a factual political boundary.

### Segment 3

- Engine: Map plus Motion Studio overlays.
- Keep map visible.
- Emphasize belt.
- Display `ITCZ` in a large primary pill/title treatment.
- Optional smaller authorized expansion.
- Add opposing illustrative convergence flows.

### Segment 4

- Engine: Canvas/2.5D diagram.
- Use a registered atmospheric cross-section template or supported Canvas objects.
- Opposing arrows converge; warm-air arrow rises; cloud layer fades in.
- Carry the same frame/palette forward for continuity.

This plan requires reusable map-flow and atmospheric-diagram capabilities that do not currently exist in the shared compiler.

## 18. Possible solution paths

### Option A — instruction-only improvement

Add the full Map Editor brief, style profile and examples to the current prompt.

**Benefit:** fastest experiment.  
**Problem:** still asks a 4B model to produce a large final schema; does not add unsupported renderer capabilities.  
**Use:** temporary baseline only.

### Option B — immediate contract repair

1. Send the existing style profile through the live Qwen route.
2. Replace `format: "json"` with an actual JSON Schema.
3. Require exactly one scene per locked segment.
4. Add field-level error repair.

**Benefit:** should eliminate unsupported labels and malformed plans quickly.  
**Problem:** visual vocabulary/compiler remains too small.  
**Recommendation:** do immediately, but do not stop here.

### Option C — shared semantic planner and deterministic mapper

1. Define one intermediate schema for OpenAI and Qwen.
2. Define style/capability/resource manifests.
3. Compile semantic plans into Map/Motion JSON in application code.
4. Validate and render both providers through the same path.

**Benefit:** most reliable, comparable and trainable architecture.  
**Cost:** requires deliberate compiler work.  
**Recommendation:** primary solution.

### Option D — add missing reusable renderer capabilities

Implement reusable, validated capabilities for:

- screen frame/border overlay;
- pill/card label presets;
- illustrative wind-flow preset;
- atmospheric-zone preset;
- map-to-diagram transition;
- atmospheric cross-section Canvas template.

These must be generic capabilities, not ITCZ-specific hardcoding.

**Benefit:** makes the requested visual language actually renderable.  
**Recommendation:** required alongside Option C.

### Option E — few-shot approved examples

Store user-approved semantic plan + canonical JSON + rendered preview examples. Retrieve the closest examples for each new segment.

**Benefit:** improves style without training.  
**Risk:** examples must be versioned and approved; failed outputs must not enter the set.  
**Recommendation:** implement before fine-tuning.

### Option F — Qwen LoRA fine-tuning

Train Qwen on approved planning examples after the contract stabilizes.

**Benefit:** teaches recurring engine selection, restraint, scene composition and Invincible vocabulary.  
**Risk:** training on unstable schemas or fallback outputs permanently teaches mistakes.  
**Recommendation:** later phase.

## 19. Can Qwen be trained to this style and schema?

Yes. Qwen3 supports supervised fine-tuning through LoRA/QLoRA using frameworks such as MS-SWIFT, Axolotl and LLaMA-Factory.

Training should teach semantic planning decisions, not low-level renderer constants.

### Good training targets

- correct engine selection;
- one plan per locked segment;
- supported enum/ID usage;
- Invincible composition patterns;
- when to use map labels, screen pills and Canvas diagrams;
- restraint and hierarchy;
- explicit missing-information behavior;
- avoidance of invented assets/geography.

### Poor training targets

- raw failed Qwen outputs;
- fallback context cards as ideal answers;
- duplicated colour/font constants;
- unstable final renderer schemas;
- arbitrary coordinates without reviewed sources;
- one film's fixed choreography as a universal rule.

### Training record format

Each example should contain:

```text
System:
  planner version
  style profile
  capability manifest
  safety/source rules

User:
  locked segment(s)
  topic-specific brief
  available resource IDs

Assistant:
  strict semantic-plan JSON
```

Maintain a holdout set before training. Evaluate JSON validity, timestamp preservation, executable-plan rate, engine selection, asset hallucination, style adherence, geography safety and human approval.

### Hardware plan

The current 4 GB GPU should be used for quantized inference and evaluation. Build the dataset locally, train a LoRA adapter on cloud or larger-GPU hardware, evaluate it, then quantize/deploy the approved result through the local runtime. Keep JSON Schema constraints and validators after training.

## 20. Recommended implementation sequence

### Phase 1 — unify and constrain

1. Treat saved locked timestamps as the only timing input.
2. Define one provider-neutral semantic plan schema.
3. Pass a real JSON Schema to Ollama.
4. Pass the existing style profile through the live Qwen route.
5. Make OpenAI return the same semantic schema.
6. Add exact one-plan-per-segment validation.
7. Add targeted repair using validator errors.

### Phase 2 — make the style renderable

8. Create style profile v2 with frame, border and pill tokens.
9. Add generic frame/pill Motion Studio overlay presets.
10. Add generic illustrative flow and atmospheric-zone map capabilities.
11. Add an atmospheric cross-section Canvas template.
12. Build the deterministic semantic-plan compiler.
13. Produce map scenes with approved screen overlays rather than `overlays: []`.

### Phase 3 — benchmark

14. Rerun OpenAI and Qwen with byte-identical locked input.
15. Compile both through the same mapper.
16. Render MP4s and compare frames, motion and editability.
17. Save accepted/corrected examples.

### Phase 4 — adapt Qwen

18. Build a curated training and holdout dataset.
19. Train a LoRA adapter on suitable hardware.
20. Accept it only if it improves held-out executable-plan and style scores without increasing hallucinations.

## 21. My recommendation

Do not solve this by placing a huge final Map Editor JSON example into every user instruction. Do not fine-tune Qwen on the current outputs.

The recommended design is:

```text
User writes only topic-specific creative direction
    +
Application injects locked cue sheet
    +
Application injects style/capability/resource JSON
    ↓
AI returns a small strict semantic plan
    ↓
Deterministic mapper creates canonical Map/Motion JSON
    ↓
Existing validators reject or precisely repair errors
    ↓
Map review → Motion Studio → MP4
```

This approach makes OpenAI and Qwen directly comparable, makes Qwen training feasible, preserves editor safety and allows the style to improve without retraining for every colour or schema change.

## 22. Questions for external reviewers

1. Is the proposed semantic-plan/mapper separation preferable to direct final renderer JSON for a local 4B model?
2. What is the smallest useful semantic enum set for geography, illustrative flows, labels and Canvas diagrams?
3. Should screen frame/pill styling be compiled entirely from a style profile, or should the model choose among a small set of named treatments?
4. What constrained-decoding and repair strategy is recommended for Qwen3 4B through Ollama?
5. How many high-quality examples would be a sensible LoRA pilot for this narrow planner task?
6. Should the first adapter target engine/intent selection only, with renderer compilation remaining fully deterministic?
7. How should illustrative atmospheric geography be represented so it is visually useful without being confused with sourced political/factual geometry?
8. What evaluation rubric best predicts whether a generated plan will produce a good editable video rather than merely valid JSON?

## 23. Relevant implementation files

- `creator/tts.js` — timing/instruction/planning UI and provider selection.
- `local-ai/agent-server.mjs` — paired local API and live Qwen planning route.
- `local-ai/voiceover-analysis.mjs` — prompts, local compiler, validators and Creator import conversion.
- `creator/creative-style-profile.json` — existing style profile.
- `functions/src/creator/openai-video-callables.js` — OpenAI structured planner and compiler.
- `creator/map-animation-import.js` — canonical Map Editor animation schema/importer.
- `creator/ai-preview.js` — AI storyboard to Motion Studio manifest conversion.
- `creator/video-studio/model.js` — canonical Motion Studio schema/validation.
- `creator/map-defaults.js` — Documentary Terrain defaults.
- `CREATIVE_BIBLE.md` — editorial and visual identity.
- `docs/map-editor-production-standard.md` — map production and acceptance standard.
- `docs/creator-ai-planner-style-report.md` — earlier findings and training strategy.

## 24. Primary external references

- [Qwen3 repository and fine-tuning frameworks](https://github.com/QwenLM/Qwen3)
- [Qwen3 MS-SWIFT LoRA example](https://github.com/QwenLM/Qwen3/blob/main/docs/source/training/ms_swift.md)
- [Qwen function-calling limitations and prompt/fine-tuning guidance](https://qwen.readthedocs.io/en/v2.5/framework/function_call.html)
- [Ollama structured outputs and JSON Schema](https://docs.ollama.com/capabilities/structured-outputs)

## 25. Final decision statement

The product already has most of the required editors, validators, style foundations, persistence and exporter. The immediate problem is not the absence of tools; it is that the live AI planning contract does not expose those tools consistently or compile creative intent into them.

Fix the shared contract and compiler first. Add the missing reusable visual capabilities second. Collect approved examples third. Fine-tune Qwen fourth.
