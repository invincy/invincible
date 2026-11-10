# Voiceover Analysis Engine (Phase 1)

This path converts a local MP3/WAV into an importable Creator Studio scene draft. It deliberately stops before rendering or changing a project.

1. The audio path is checked against the restricted agent workspace.
2. `transcribeWithWhisper` calls `http://127.0.0.1:8790/transcribe`, a private localhost Whisper service with word and segment timestamps enabled. Start it with `start-whisper.cmd`; set `INVINCIBLE_WHISPER_URL` to that URL for the Node adapter.
3. The transcript is normalized and timing is validated. Qwen receives segment IDs, creative instructions, the supplied asset catalog, and registered animation presets; it is not allowed to author timestamps or asset IDs.
4. `assembleSceneDraft` derives scene timing from Whisper segments, rejects unknown asset IDs, and flags missing visual/asset information.
5. `toCreatorStudioImport` produces the existing storyboard-compatible JSON shape for review/import.

The recommended model is `faster-whisper` `small` with INT8 CPU inference (about 461 MB) for this laptop. Dependencies and model files belong under `E:\AI\Whisper`, not the repository. No MP4 renderer is invoked.

The service enforces `E:\Invincible\AgentWorkspace` and localhost-only access. The hardened ACL currently permits the `MSI\InvincibleAgent` identity to write there; a regular `MSI\vaibh` process is intentionally denied. Uploads must therefore be performed by the restricted agent identity before the service can process them.

Use `start-local-ai-restricted.ps1` to launch the agent and Whisper service with a local Windows credential prompt. The password is not stored. Do not use the ordinary launcher for the secure upload test; it runs under the interactive user and will be denied by the hardened ACL.
