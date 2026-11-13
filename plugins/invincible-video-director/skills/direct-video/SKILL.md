---
name: direct-invincible-video
description: Plan, diagnose, or refine an Invincible Creator Studio video from locked narration timing and animation direction using the registered compiler contract. Use for Invincible map, Motion Studio, scene-plan, asset-request, and video-quality work; do not use for unrelated video tools.
---

# Direct an Invincible video

Use Invincible as a guarded compiler, not as a free-form JSON target.

1. Obtain the locked timed transcript and the user's animation direction. Never rewrite or retime narration without an explicit request.
2. Call `get_creator_contract` before making scene decisions. Use only its engines, scene kinds, presets, registered geography and supplied project assets.
3. Return exactly one semantic scene for every transcript segment. Do not author coordinates, boundaries, colours, font sizes, keyframes, timestamps or renderer internals.
4. When factual geography or artwork is absent, add a resource request and supported fallback. Do not drop or merge the affected scene.
5. Call `compile_creator_plan`. If it rejects the plan or reports a fallback, revise the semantic choice or explain the missing verified resource and compile again. Stop after two materially different corrections unless the user asks to continue.
6. Summarize the compiled engines, native map scenes, fallbacks and review items. Applying the draft to a project remains an explicit action in Invincible.

Prefer native Map Editor scenes for verified geographic relationships, Canvas/Motion for explanatory diagrams, and Battlefield Editor only when its formations are actually supported. Treat a successful compile as an editable draft, not proof of a polished MP4; preview and export verification remain required.
