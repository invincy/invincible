# Invincible Video Director plugin

## Private cloud connection

The primary MCP endpoint is
`https://asia-south1-life-by-adichimp.cloudfunctions.net/creatorPluginMcp/mcp`.
It is always online and uses an OAuth 2.1 authorization-code flow with PKCE.
The approval screen uses the existing Invincible Firebase session, so there is
no second password or plugin account.

Access and refresh tokens are random, revocable and expiring. Only hashes are
stored in server-only Firebase collections. OAuth client registration is limited
to supported ChatGPT and OpenAI HTTPS callback hosts, authorization codes are
one-use and short-lived, and every MCP request is authorized against the exact
Invincible resource URL.

The cloud connection separates review from mutation. Its tools are:

- `get_my_profile`: confirms the connected Invincible account.
- `get_creator_contract`: returns the semantic planning schema, style profile,
  examples, renderer capabilities and compiler rules.
- `list_creator_projects`: lists projects owned by or shared with the account.
- `get_creator_project_context`: returns bounded script, timing, instructions,
  assets and reviewed geography for one accessible project.
- `create_creator_project`: idempotently creates one fresh project with the
  complete narration and animation brief, without opening Creator Studio.
- `update_creator_project_brief`: saves the complete brief into an existing
  empty project while refusing to invalidate locked timing or scenes.
- `get_creator_workflow_status`: resumes from saved state and returns the exact
  next phase plus one consolidated laptop checkpoint when local media work is
  unavoidable.
- `start_creator_local_timing`: queues a privately stored final MP3 directly to
  the paired laptop's free local Whisper worker without browser control.
- `get_creator_local_timing_status`: reports the job and the updated project
  phase after its locked timestamps are saved.
- `compile_creator_plan`: validates one semantic scene per locked segment and
  compiles the existing Creator Studio, Map Editor and Motion Studio shapes.
- `apply_creator_plan`: recompiles the reviewed semantic plan against the latest
  project catalog and saves it only with `creator.write`, explicit confirmation
  and an exact `writeRevision`. Existing scenes require a separate explicit
  replacement confirmation.

It cannot delete projects or publish videos. Creator Studio saves the selected
final MP3 in the existing account-private media library. The Director can queue
that MP3 to the paired laptop's free local Whisper worker; only the transcript
and locked timing are written back to the project. Native map review and MP4
rendering still run on the paired laptop. The connection is private because it
is not submitted to a public plugin directory. Add its
MCP endpoint as a personal custom connection in ChatGPT, then approve it on the
Invincible connection page using the existing Firebase account.

## Timed transcript sync

Local Whisper still runs on the laptop and the MP3 stays in the browser's
device-local audio store. After timing is ready, Creator saves only a bounded
project workspace to the existing `creatorProjects/{projectId}` document:
segment text/start/end, animation instructions, duration, filename and speed.
Word-level timing and audio bytes are deliberately omitted. This makes the
timing visible to the cloud plugin without adding a second storage system or a
Firebase Storage upload. Opening the project on another device restores the
timed text, but Motion Studio still requires the original MP3 on the device
that will export the video.

## Local development endpoint

The optional local endpoint is `http://127.0.0.1:8791/mcp`. Image Studio starts
it alongside the restricted local worker. It binds only to loopback and keeps
the original contract and compile tools for offline development.

The portable package in `plugins/invincible-video-director` points to the cloud
endpoint. The repo marketplace entry is `.agents/plugins/marketplace.json`.

## Automatic workflow activation

The bundled `direct-invincible-video` skill is available for implicit use in
ChatGPT and Codex. Its description deliberately covers the complete Creator
Studio workflow: new or existing projects, narration, MP3 generation, local
Whisper timing, Director compilation and application, Map Editor review, Motion
Studio preview and MP4 export. New chats should not treat an empty plugin
transcript as a blocker. They must complete the project's local MP3 and Whisper
checkpoint first, then reload that project through the Director tools.

During a Director workflow, Creator Studio remains responsible for audio,
timing and the native editing/export surfaces. The Director plugin remains
responsible for contract-grounded semantic planning and compilation. The
ordinary OpenAI and Qwen scene planners are not used unless the user explicitly
requests a non-plugin comparison.

## Cloud voiceover fallback

Script & scenes still tries the paired laptop's local Whisper service first.
When OpenAI planning is selected and the local service is unavailable, the
authenticated `creatorOpenAiVideo` Function can send the final MP3 to OpenAI
transcription and restore the locked transcript checkpoint. That fallback is
billable OpenAI API usage. Local Whisper remains local and free. The browser
never receives the API key.

## Compiler boundary

ChatGPT makes bounded editorial choices; the existing deterministic compiler
owns timing validation, geography, camera framing, labels, bands, routes and
renderer JSON. This prevents the model from inventing unsupported internals,
but it does not guarantee a polished render. A poor deterministic preset must
still be improved once in the shared compiler.

## Verification

Run `npm run test:creator-plugin` for local streamable-HTTP discovery and native
map compilation. Run `npm test` for repository regressions and the Firebase
OAuth security tests. Deployment acceptance also checks metadata discovery,
unauthorized MCP rejection, responsive consent UI and the personal ChatGPT
sign-in flow.
