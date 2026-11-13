# Creator AI planner: findings, solutions and Qwen adaptation

Date: 2026-11-13  
Trial projects: `Invincible AI` (`39dcf840-58b1-4a7c-83cb-10cf50e636ba`) and `Quan` (`1f94f216-f90d-48ee-b2b4-65788210bac1`)

## Executive finding

Whisper is not the issue being evaluated. The reusable input is the already locked narration segments and timestamps. The real task begins after timing:

> Given locked segments, animation instructions, available assets, the Invincible visual language and the editors' actual capabilities, produce valid JSON that the Map Editor and Motion Studio can render.

Both tested planners failed that task, in different ways:

- Invincible AI returned an attractive prose concept, but only as one Canvas scene. It did not produce executable Map Editor choreography.
- Qwen preserved the four locked segments but returned unsupported animation intents. Creator Studio correctly rejected them and substituted safe static context cards.
- Neither output used the existing Documentary Terrain defaults, native map layers, camera schedule, label/card system or Motion Studio overlay contract to produce the requested visual language.

The failure is therefore not primarily a lack of general intelligence. The planner is being asked to jump directly from a creative brief to renderer JSON without a sufficiently explicit style contract, capability vocabulary, deterministic compiler or constrained output boundary.

## What worked

The following parts of the product behaved correctly:

1. The same script, animation brief, aspect ratio and voice configuration could be stored in separate projects.
2. Locked timing could be preserved and passed into scene planning.
3. Unsafe or unsupported planner output did not silently enter the renderer.
4. Creator Studio produced schema-safe fallbacks instead of inventing geography or assets.
5. Motion Studio preserved the audio timeline and exported valid MP4 containers with synchronized audio.
6. Saved projects and raw planner results remained recoverable.

These are important foundations. The missing layer is the translation between editorial intent and canonical editor operations.

## First relevant deviation

For this evaluation, transcription accuracy is outside scope because timestamps are already locked. The first relevant deviation occurs when each model converts the same timed segment and animation brief into a scene plan.

### Invincible AI

The returned visual description was directionally reasonable: equatorial cross-section, converging airflow, rising moist air and a cloud layer. However, it was compiled as a generic Canvas scene with prose in `visual`. It did not select the native Map Editor or provide its required version-1 map animation with validated camera keys and layers.

### Qwen

Qwen returned an intent label that the application does not support. The current recovery path in `creator/tts.js` then created one safe `contextCard` per timestamp with `mapAnimation: null`. This is correct defensive behavior, but it demonstrates that Qwen does not yet know the editor's permitted vocabulary.

## The required Invincible visual contract

The model should not infer the house style from a phrase such as "premium documentary." It needs a named, versioned contract that resolves to existing renderer settings.

### Composition

- Portrait 9:16 by default, with presentation safe areas.
- One dominant explanatory idea per shot.
- A clear frame or bounded composition rather than loose objects floating without hierarchy.
- Geographic anchor first, relationship/process second, consequence third.
- Readable holds after camera arrivals and label entrances.

### Colour and surface

- Deep navy/dark documentary surfaces.
- Warm white primary text.
- Selective muted gold for emphasis, frames and fine borders.
- Semantic geographic colours for rivers, borders, atmospheric flow and highlighted regions.
- Restrained glow and transparency; natural terrain must remain readable.

### Typography and labels

- Bundled Hindi-capable fonts and verified Devanagari shaping.
- Large output-scaled labels, not editor-panel-sized text.
- Rounded navy cards or pills for important names and terms.
- Fine border/accent, comfortable padding and local halo where a card would hide geography.
- Important names such as `ITCZ` should receive a deliberate pill/card treatment, not become an unstyled subtitle.

### Motion

- Camera movement must explain the spoken idea.
- Smooth arrival, readable hold and quiet exit.
- Routes and airflow reveal progressively.
- No arbitrary orbit, constant bouncing, violent zoom or animation on every word.
- Absolute timing must remain tied to the locked segments.

### Map-specific rules

- Use the existing Documentary Terrain presentation and NASA imagery where appropriate.
- Use real `[longitude, latitude]` coordinates and supported layer types.
- Distinguish factual geography from illustrative atmospheric diagrams.
- Use native Map Editor camera/layer instructions for geographic scenes; use Canvas only for genuinely non-geographic diagrams.
- Do not invent asset IDs, geometry, sources or unsupported editor actions.

## Recommended architecture

The strongest solution is not "make the prompt longer" and not "fine-tune immediately." It is a layered planner with deterministic boundaries.

### Layer 1: versioned style profile

Create a shared profile such as `invincible-documentary-v1`. It should reference existing Documentary Terrain defaults and Motion Studio brand values rather than duplicate them in every prompt. The model selects semantic options such as `labelTreatment: "pill"`; application code resolves the exact colours, fonts, padding and border values.

This prevents colour drift and avoids teaching the model dozens of low-level constants that the product already owns.

### Layer 2: generated capability manifest

Build the model's allowed vocabulary from the real validators and schemas. The manifest should state:

- supported engines: Map, Canvas, Battlefield, Image, Video and 3D;
- valid Map Editor camera and layer fields;
- valid Motion Studio overlay/object fields;
- valid asset IDs available to the current project;
- maximum counts, duration boundaries and required fields;
- operations that are unavailable.

The capability manifest must be versioned. A model response for another schema version should fail clearly rather than being interpreted approximately.

### Layer 3: two-stage planning and compilation

Do not ask the language model to author the complete renderer manifest directly.

1. **Editorial planner:** choose the engine, explanatory objective, focal geography, label treatment, motion intention and required assets for each locked segment.
2. **Deterministic compiler:** convert only the supported planning vocabulary into canonical Map Editor/Motion Studio JSON, applying style-profile values and defaults.

This makes the AI responsible for creative choices while application code remains responsible for exact schema construction.

### Layer 4: schema-constrained local generation

Ollama supports a JSON Schema in the `format` request field. Use that facility, a temperature of zero and the same schema in the prompt. This provides a much stronger boundary than requesting "JSON" in prose. Ollama recommends Pydantic or Zod-style schema reuse and validation.

Schema-constrained decoding guarantees structure, not editorial correctness. The result must still pass the existing Creator validators.

### Layer 5: validation and targeted repair

Validate every segment before applying anything:

- exactly one plan per locked segment;
- unchanged start/end times;
- permitted engine and intent enums;
- known asset references only;
- valid camera/layer values;
- complete timeline coverage;
- no invented geography or sources;
- style-profile compatibility.

If validation fails, send Qwen a compact error object naming the exact failed fields and allowed replacements. Do not rerun the entire creative request with a vague "try again." After a bounded number of repair attempts, keep the inputs and show a precise review state.

### Layer 6: approved-example retrieval

Before training, maintain a small library of user-approved scene plans. Retrieve the closest examples by scene purpose, such as:

- establish a location;
- reveal a belt or region;
- show converging flows;
- introduce a named term in a pill;
- compare two regions;
- transition from map to explanatory cross-section.

Examples should contain the locked input, abstract plan, canonical JSON, rendered preview and approval/rejection notes. Failed outputs must not enter the approved set.

## Can Qwen be trained to the Invincible style and schema?

Yes. Qwen supports supervised fine-tuning, including LoRA and QLoRA. The Qwen team recommends frameworks such as MS-SWIFT, Axolotl and LLaMA-Factory for Qwen3 fine-tuning. A practical adaptation would train a small LoRA adapter instead of changing every base-model weight.

However, fine-tuning should happen only after the style profile, capability schema, compiler and evaluator exist. Otherwise the model will learn inconsistent prompts, accidental fallbacks and obsolete JSON.

### Training unit

Each supervised example should contain:

**System input**

- planner version;
- style-profile ID;
- supported capability manifest;
- strict safety/source rules.

**User input**

- one or more locked segments;
- animation brief;
- aspect ratio;
- available asset and map IDs;
- known geography/source status.

**Assistant target**

- one abstract executable plan per segment;
- only supported enum values;
- explicit `needsReview` or `missingInformation` instead of invention;
- no prose outside the structured response.

### Data quality

Start with a carefully reviewed pilot set, not bulk synthetic data. Include positive examples, difficult boundary cases and explicit safe refusals. Preserve a separate evaluation set that never enters training. A useful production dataset will probably grow to hundreds or thousands of diverse, approved segments; the exact amount should be decided by held-out results rather than a fixed number.

The dataset should test:

- schema validity;
- segment-count and timing preservation;
- correct engine selection;
- executable map percentage;
- asset hallucination rate;
- style adherence;
- geography/source safety;
- rendered-frame readability;
- human approval without manual repair.

### Training methods

1. **SFT with LoRA:** teach the supported planning vocabulary and recurring Invincible composition patterns.
2. **Preference tuning later:** once there are enough paired user choices, use preferred versus rejected plans to improve restraint and style consistency.
3. **Do not train renderer constants as facts:** keep colours, typography sizes and schema defaults in versioned application profiles so they can change without retraining.

### Current hardware constraint

The current laptop has a GTX 1650 Max-Q with 4 GB VRAM. It can run the installed quantized `qwen3:4b`/`qwen3:4b-instruct` models for inference, but it is not a practical machine for the documented Qwen3 LoRA training workflow. The official Qwen3 MS-SWIFT example reports 22 GB GPU memory for an 8B LoRA example. A 4B adapter may require less, but 4 GB remains too constrained for a dependable local training workflow.

The practical route is:

1. build and validate the dataset locally;
2. train the LoRA adapter on suitable cloud or larger-GPU hardware;
3. evaluate against the locked holdout set;
4. merge or deploy the adapter in a supported format;
5. quantize and run the approved model locally through Ollama;
6. retain schema-constrained decoding and validators even after training.

## Solution options

| Option | Benefit | Limitation | Recommendation |
| --- | --- | --- | --- |
| Longer prompt only | Fastest experiment | Brittle; repeats constants; still produces unsupported fields | Use only as a short baseline |
| Few-shot approved examples | Teaches style without training | Context grows; examples can conflict | Implement early |
| Ollama JSON Schema output | Prevents malformed structure | Does not guarantee semantic/editor correctness | Implement immediately |
| Deterministic plan compiler | Guarantees canonical renderer JSON | Requires a well-designed abstract plan schema | Highest priority |
| Validator plus targeted repair | Converts errors into actionable retries | Needs bounded retry and precise diagnostics | Highest priority |
| Versioned style profile | Makes visual identity consistent and editable | Requires consolidation of existing values | Highest priority |
| LoRA/QLoRA fine-tuning | Teaches recurring decisions and style patterns | Needs curated data, evaluation and stronger hardware | Do after the contract is stable |
| Preference tuning | Improves taste and restraint | Requires many reliable preference pairs | Later phase |

## Recommended implementation order

### Phase 1 — make the task learnable

1. Freeze the locked timestamp input used by both planners.
2. Define `invincible-documentary-v1` as a semantic style profile backed by existing editor defaults.
3. Define a small abstract scene-plan schema with strict enums.
4. Generate the capability manifest from current validators.
5. Implement a deterministic compiler from abstract plans to canonical editor JSON.

### Phase 2 — make local Qwen reliable

6. Use Ollama JSON Schema structured output at temperature zero.
7. Add field-level validation and targeted repair.
8. Add approved few-shot examples and a regression benchmark.
9. Rerun OpenAI and Qwen using identical locked segments, instructions, capabilities and style profile.

### Phase 3 — adapt Qwen

10. Collect accepted and corrected plans from real projects.
11. Create a held-out evaluation set before training.
12. Train a Qwen3 LoRA adapter on suitable hardware.
13. Accept the adapter only if it improves executable-plan rate and style adherence without increasing invented geography/assets.

## Acceptance criteria for the next trial

The next comparison should be considered successful only when both planners:

- receive byte-identical locked input data;
- return exactly one plan per segment;
- preserve all timestamps;
- select the correct editor engine;
- pass the canonical validators without fallback;
- use the named Invincible style profile;
- produce at least one real Map Editor scene where geography is required;
- generate no unknown assets, unsupported intents or invented factual geometry;
- render an MP4 whose frames visibly contain the planned map, labels/pills, borders/frame treatment and purposeful motion.

## Decision

Train Qwen, but not yet. First make the product contract explicit and deterministic. Then use approved Creator Studio examples to fine-tune a LoRA adapter. Training can improve Qwen's editor selection, visual vocabulary and recurring composition decisions; the schema, compiler and validators must remain the source of truth.

## Primary references

- [Qwen3 repository and supported fine-tuning frameworks](https://github.com/QwenLM/Qwen3)
- [Qwen3 MS-SWIFT LoRA example](https://github.com/QwenLM/Qwen3/blob/main/docs/source/training/ms_swift.md)
- [Qwen function-calling limitations and recommendation to try prompting/examples before fine-tuning](https://qwen.readthedocs.io/en/v2.5/framework/function_call.html)
- [Ollama structured outputs with JSON Schema](https://docs.ollama.com/capabilities/structured-outputs)
- Repository standards: `CREATIVE_BIBLE.md`, `MAP_EDITOR.md`, `VIDEO_PRODUCTION.md` and `docs/map-editor-production-standard.md`
