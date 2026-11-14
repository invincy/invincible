---
name: direct-invincible-video
description: Use automatically for any Invincible Creator Studio video-production request, including a new or existing project, narration, voiceover MP3, local Whisper timing, sync or scene planning, Map Editor, Motion Studio, assets, preview, export, or video-quality diagnosis. Coordinate Creator Studio for audio and timing and Invincible Video Director for contract validation, compilation, review, and application. Do not use for unrelated video apps.
---

# Direct an Invincible video

Own the complete Invincible workflow. Use Creator Studio as the local production surface and Invincible Video Director as the guarded semantic compiler. Never treat an empty plugin transcript as the end of the task.

## Start from the real project state

1. Call `get_my_profile`, `get_creator_contract`, and the relevant project-list/context tools before making scene decisions. Call `get_creator_workflow_status` whenever resuming work; follow its saved phase instead of asking the user what comes next.
2. Respect the user's project intent. For a requested fresh project, call `create_creator_project` exactly once with the complete supplied narration and animation direction and a stable idempotency key. For an existing empty project, use `update_creator_project_brief`. For an existing named project, never create, rename, replace, or repair a different project.
3. Reuse narration and animation direction already supplied in the chat or project. Do not ask the user to paste them again.
4. Never rewrite narration or invent timing unless the user explicitly requests a script change.

## Recover missing audio or timing instead of stopping

When the project context has no final MP3 or locked transcript, inspect `workflow.audioReady`. A generated final MP3 is saved privately in the existing Creator media library. When `audioReady` is true, call `start_creator_local_timing`, poll `get_creator_local_timing_status`, then reload project context and continue without opening Creator Studio or using paid transcription. Only when no final MP3 exists, treat audio creation as one consolidated checkpoint:

1. Open the project's Script page in Creator Studio.
2. Put the already-approved narration and animation direction into the existing fields.
3. Generate the final MP3 with the project's chosen voice settings, or reuse its existing final MP3.
4. Let the Director queue that private MP3 to the paired laptop's local Whisper service, never the microphone.
5. Correct only obvious transcript words while preserving Whisper's start and end times.
6. Save the locked timing checkpoint, then reload the project context through the Director tools.

Do not turn these actions into multiple user questions. Open the returned project URL only when the final MP3 genuinely does not exist. Local Whisper is the free default; never switch to cloud transcription merely to avoid the local checkpoint. After timing is saved, call `get_creator_workflow_status` and continue automatically.

Do not use Creator Studio's ordinary OpenAI or Qwen scene planner during a Director workflow. Creator Studio owns MP3 generation, local Whisper, map review, Motion Studio, preview, and export. Invincible Video Director owns semantic planning, contract validation, compilation, and reviewed application.

## Compile through the registered contract

1. Use only engines, scene kinds, presets, registered geography, reviewed routes, and supplied project assets returned by `get_creator_contract` and the project context.
2. Return exactly one semantic scene for every locked transcript segment. Never author coordinates, boundaries, colours, font sizes, keyframes, timestamps, or renderer internals.
3. Prefer native Map Editor scenes for verified geographic relationships, Canvas/Motion for explanatory diagrams, and Battlefield Editor only for supported formations.
4. When factual geography or artwork is absent, add a resource request and supported fallback. Never drop or merge the affected locked segment.
5. Call `compile_creator_plan`. If rejected, make up to two materially different contract-grounded corrections. Do not replace a supported map with a generic card merely to avoid validation.
6. Present a concise review of timings, engines, presets, fallbacks, and genuine missing resources.

## Apply and finish the video

An explicit request to create, assemble, apply, or export the video end to end authorizes application to a new empty project after a valid compile. Replacing existing scenes always requires separate explicit confirmation.

1. Apply only the exact reviewed semantic plan using the current `writeRevision`.
2. Report the returned revision and confirm `mutatedProject` is true.
3. Open every generated map in the real Map Editor. Save or deliberately discard each map and continue in timeline order.
4. Open Motion Studio with the exact final MP3, preview the complete timeline, verify there are no black or empty gaps, and export the requested MP4.
5. Do not stop after JSON, compilation, application, or a review table when the user requested a finished video.

Only interrupt for an unavoidable login, payment approval, destructive replacement of existing scenes, unresolved factual decision, or genuinely unsupported required capability. A successful compile is an editable draft; only preview and export verification establish a finished video.
