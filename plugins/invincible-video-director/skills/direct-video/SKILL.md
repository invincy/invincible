---
name: direct-invincible-video
description: Use for Invincible Creator Studio video-production requests involving existing projects, scene JSON, private assets, Motion Studio previews or selected-scene JPG export. Preserve the existing project and use bounded, revision-safe operations.
---

# Operate an Invincible Creator Studio project

Use the saved Creator Studio project as the source of truth. Reuse the named project for edits. For an explicitly requested new film, inspect the project list first and use the native Creator Studio project-creation flow if the live tool catalogue has no creation action.

## Start each session with connection discovery

Discover the live Invincible tool catalogue before choosing a workflow. Reuse the host's existing authenticated connection and call get_my_profile when exposed.

When tools are absent, report that the current session has not exposed the connection. Search the installed plugin once. A skill attachment alone does not establish that its tools are available. Do not ask the user to resend the same attachment, reinstall the plugin, or restart the workspace repeatedly.

Distinguish the host's OAuth connection from a Creator Studio browser sign-in. A signed-out browser alone does not prove that the plugin authorization has expired. An anonymous HTTP probe can check server availability but cannot test the host's saved authorization. Never use its invalid_token response to diagnose the user's connection.

If an authenticated tool reports an authorization error, use the host's connection recovery flow once and explain the observed error. Open the existing plugin connection settings when needed. The public plugin-connect page requires an OAuth request initiated by the host to finish linking. Preserve the existing plugin identity, endpoint and account connection. Do not create a duplicate connector or change credentials to repair discovery.

Use the browser for operations the live tools cannot perform, new-project setup, audio generation and visual review. Explain any required sign-in before starting it. Continue independent script and asset work while account access is blocked. Treat the host's credential handling and session availability as unverified until an authenticated get_my_profile succeeds.

## Discover supported operations

Use only tools exposed in the current session. The deployed server may lag behind repository source. Inspect get_creator_contract when available. Feature-detect resolved-scene reads and visual-style tools before invoking them. If absent, use get_creator_video_draft for supported scene reads and the existing native editor for remaining work.

Legacy create_creator_project, compile_creator_plan, apply_creator_plan and local timing tools may be retired. Their names in an older skill are not evidence that they are available. Use the live schema and the saved native workflow.

## Read first

1. Call `get_my_profile`, `list_creator_projects`, and `get_creator_project_context` for the named project.
2. Call `get_creator_video_draft` to read the canonical Motion Studio manifest, revision, stable scene IDs and asset catalogue.
   For a focused edit, when exposed, call `get_creator_resolved_scene` with the existing scene ID to read its overlays, resolved map project and current revision without opening the browser.
3. Call `list_creator_assets` before requesting a new upload. Asset IDs are stable and exact duplicate bytes reuse the existing private asset rather than creating another one.
4. Preserve the final MP3, measured timing, scene IDs and all unrelated layers. Do not ask the user to repeat narration or animation instructions already present in the chat or project.

## Reuse visual styles

When exposed, call `list_creator_style_presets` before describing low-level colors, fonts, plates, corners, image treatments or map contrast. Use `get_creator_style_preset` when a preset needs inspection, then `apply_creator_style_preset` with the current draft revision at video or scene scope. Use `update_creator_style_preset` only for a validated `user-` preset derived from a built-in base. Prefer the curated History and Geography presets when they fit; keep element-level overrides limited to genuine exceptions.

Style application must preserve scene IDs, timing, engine types, maps, assets and layout. After applying a preset, request a selected-scene JPG and inspect labels, portrait grounding, ornament corners and terrain contrast before full export.

## Patch scenes safely

Use `apply_creator_scene_patch` for one existing scene at a time. Always pass the revision returned by `get_creator_video_draft` as `expectedRevision`. Change only the requested fields. Keep a scene's `id`, timing and engine type unless the user explicitly requests that change. Arrays of overlays, labels or keyframes are ID-merged; use an explicit replacement only when the user clearly requests a full-array replacement.
For a map scene backed by a shared map source, put a scene-specific map change under `changes.engineData.project`. The plugin detaches that scene before saving so other scenes using the shared source keep their maps. Read the new revision after every patch. The on-page AI Agent Panel and plugin use the same saved draft.

Historical visuals must remain cautious: use supplied assets and verified geography, label estimates or reconstructions, and do not invent precise troop movements. For the Second Battle of Panipat, prefer top-down battlefield formations, the existing elephant and commander assets, and symbolic routes over unsupported tactical detail.

## Preview and export

After a patch, refresh the Creator Studio project and preview the affected scene in Motion Studio. Use the selected-scene JPG export for visual QA before exporting a full video. Verify that the JPG shows the intended map, formations, elephants, overlays and colour treatment. Continue through the complete Motion Studio preview and MP4 export when the user asks for the finished video.

## Audio and timing

Reuse the project's final MP3 and measured timing. If audio is genuinely missing, use the Creator Studio Script flow. Preserve the project's selected Local Whisper or OpenAI timing mode. Check the live capabilities and worker availability before scheduling timing. Follow the user's cost preference before switching providers. Do not regenerate timing for an unchanged narration.

Only interrupt for authentication, a revision conflict that requires rereading, an explicitly destructive full replacement, or a missing asset that cannot be supplied. Do not pause for routine confirmations.
