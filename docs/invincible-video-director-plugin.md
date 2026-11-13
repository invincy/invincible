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
- `compile_creator_plan`: validates one semantic scene per locked segment and
  compiles the existing Creator Studio, Map Editor and Motion Studio shapes.
- `apply_creator_plan`: recompiles the reviewed semantic plan against the latest
  project catalog and saves it only with `creator.write`, explicit confirmation
  and an exact `writeRevision`. Existing scenes require a separate explicit
  replacement confirmation.

It cannot delete projects, publish videos or upload assets. The connection is
private because it is not submitted to a public plugin directory. Add its
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
