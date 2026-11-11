# Voiceover Analysis Engine (Phase 1)

This path converts a local MP3/WAV into an importable Creator Studio scene draft. It deliberately stops before rendering or changing a project.

1. The audio path is checked against the restricted agent workspace.
2. `transcribeWithWhisper` calls `http://127.0.0.1:8790/transcribe`, a private localhost Whisper service with word and segment timestamps enabled. Start it with `Start-All.cmd`; set `INVINCIBLE_WHISPER_URL` to that URL for the Node adapter.
3. The transcript is normalized and timing is validated. Qwen receives segment IDs, creative instructions, the supplied asset catalog, and registered animation presets; it is not allowed to author timestamps or asset IDs.
4. `assembleSceneDraft` derives scene timing from Whisper segments, rejects unknown asset IDs, and flags missing visual/asset information.
5. `toCreatorStudioImport` produces the existing storyboard-compatible JSON shape for review/import.

The recommended model is `faster-whisper` `small` with INT8 CPU inference (about 461 MB) for this laptop. Dependencies and model files belong under `E:\AI\Whisper`, not the repository. No MP4 renderer is invoked.

The service enforces `E:\Invincible\AgentWorkspace` and localhost-only access. The hardened ACL currently permits the `MSI\InvincibleAgent` identity to write there; a regular `MSI\vaibh` process is intentionally denied. Uploads must therefore be performed by the restricted agent identity before the service can process them.

## Local startup on this laptop

Double-click Start-All.cmd in this directory to start Ollama, the restricted agent, CPU Whisper, and ComfyUI. Restart-All.cmd restarts those services and their child processes. Status.cmd checks their localhost APIs and shows the listener PID, identity, port, and log locations.

The launchers reuse a matching limited scheduled task when it is visible. Otherwise the agent and Whisper start as MSI\InvincibleAgent using the existing Windows-encrypted Image Studio login. Whisper loads the cached small INT8 model on CPU before reporting ready. Agent and Whisper logs are in E:\Invincible\AgentWorkspace\local-ai-logs. Ollama and ComfyUI logs are in E:\Invincible\ImageGen\logs.

Ollama runs Qwen on CPU. ComfyUI uses the GTX 1650 for sampling and CPU for VAE decoding. The Image Studio worker still coordinates jobs, unloads Qwen before image generation, and asks ComfyUI to release the image model afterward. The earlier square job reached VAE decoding, logged CUDA out-of-memory during both regular and tiled decode, and left the ComfyUI health endpoint returning HTTP 500. The worker now checks that endpoint before queuing a prompt and while waiting for it to complete.

Open the existing Invincible Image Studio shortcut to use the image interface. ComfyUI saves generated PNGs to E:\Invincible\ImageGen\output. Image Studio keeps its verified copy in the restricted agent workspace.
