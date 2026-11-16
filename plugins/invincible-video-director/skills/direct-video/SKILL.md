---
name: direct-invincible-video
description: Use for Invincible Creator Studio video-production requests involving existing projects, scene JSON, private assets, Motion Studio previews or selected-scene JPG export. Preserve the existing project and use bounded, revision-safe operations.
---

# Operate an Invincible Creator Studio project

Use the existing Creator Studio project as the source of truth. Do not create a replacement project, delete scenes, or invoke a separate Director workflow.

## Read first

1. Call `get_my_profile`, `list_creator_projects`, and `get_creator_project_context` for the named project.
2. Call `get_creator_video_draft` to read the canonical Motion Studio manifest, revision, stable scene IDs and asset catalogue.
3. Call `list_creator_assets` before requesting a new upload. Asset IDs are stable and exact duplicate bytes reuse the existing private asset rather than creating another one.
4. Preserve the final MP3, measured timing, scene IDs and all unrelated layers. Do not ask the user to repeat narration or animation instructions already present in the chat or project.

## Patch scenes safely

Use `apply_creator_scene_patch` for one existing scene at a time. Always pass the revision returned by `get_creator_video_draft` as `expectedRevision`. Change only the requested fields. Keep a scene's `id`, timing and engine type unless the user explicitly requests that change. Arrays of overlays, labels or keyframes are ID-merged; use an explicit replacement only when the user clearly requests a full-array replacement.

Historical visuals must remain cautious: use supplied assets and verified geography, label estimates or reconstructions, and do not invent precise troop movements. For the Second Battle of Panipat, prefer top-down battlefield formations, the existing elephant and commander assets, and symbolic routes over unsupported tactical detail.

## Preview and export

After a patch, refresh the Creator Studio project and preview the affected scene in Motion Studio. Use the selected-scene JPG export for visual QA before exporting a full video. Verify that the JPG shows the intended map, formations, elephants, overlays and colour treatment. Continue through the complete Motion Studio preview and MP4 export when the user asks for the finished video.

## Audio and timing

Reuse the project's final MP3 and measured timing. If audio is genuinely missing, use the Creator Studio Script flow and the configured OpenAI timing service; do not invoke Whisper or a Director tool. Do not regenerate timing for an unchanged narration.

Only interrupt for authentication, a revision conflict that requires rereading, an explicitly destructive full replacement, or a missing asset that cannot be supplied. Do not pause for routine confirmations.
