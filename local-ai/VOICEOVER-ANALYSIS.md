# Voiceover Analysis Engine (Phase 1)

This path converts a local MP3/WAV into an importable Creator Studio scene draft. It deliberately stops before rendering or changing a project.

1. The audio path is checked against the restricted agent workspace.
2. `transcribeWithWhisper` calls a private localhost Whisper service with word and segment timestamps enabled. Set `INVINCIBLE_WHISPER_URL` only when that service is installed and running.
3. The transcript is normalized and timing is validated. Qwen receives segment IDs and the supplied asset catalog; it is not allowed to author timestamps or asset IDs.
4. `assembleSceneDraft` derives scene timing from Whisper segments, rejects unknown asset IDs, and flags missing visual/asset information.
5. `toCreatorStudioImport` produces the existing storyboard-compatible JSON shape for review/import.

No Whisper package/model is installed by this change, and no MP4 renderer is invoked. Until a local Whisper service is configured, the engine fails closed with an explicit configuration error.
