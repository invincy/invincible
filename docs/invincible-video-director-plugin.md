# Invincible Creator Studio connection

The existing private MCP connection keeps its installed identity and endpoint:

`https://asia-south1-life-by-adichimp.cloudfunctions.net/creatorPluginMcp/mcp`

It uses OAuth 2.1 authorization code with PKCE and the existing Invincible
Firebase session. No project, asset, OAuth token, or connection data is deleted
by this update.

## Current bounded tools

- `get_creator_contract` returns the planning schema and renderer capabilities.
- `get_my_profile`, `list_creator_projects`, and `get_creator_project_context`
  read the signed-in account and existing project state.
- `get_creator_video_draft` reads the saved Motion Studio manifest, revision,
  stable scene IDs, timing, and private asset catalogue.
- `get_creator_resolved_scene` reads one scene and its resolved map source at
  the same saved revision shown in the AI Agent Panel. Use it for focused edits.
- `list_creator_assets` lists existing private assets without uploading or
  duplicating files. Creator media IDs are content-addressed, so exact bytes
  reuse the same asset ID.
- `apply_creator_scene_patch` validates and saves one scene patch with an
  exact `expectedRevision`. Unmentioned scenes and layers remain unchanged.
  A map edit under `changes.engineData.project` detaches that scene from a
  shared map source, so sibling scenes keep their map unchanged.
- `request_creator_scene_jpg` and `get_creator_scene_jpg_status` queue and
  poll a timestamped selected-scene JPG through the paired renderer. A blank
  offset means the scene midpoint; the timeline itself is never changed.
- `get_creator_workflow_status` reports the saved project phase without
  invoking a transcription provider.
- `list_creator_style_presets`, `get_creator_style_preset`,
  `apply_creator_style_preset` and `update_creator_style_preset` read and
  apply built-in or custom visual styles.

The old full-plan Director registrations are no longer exposed. The server
does not create projects, replace a full timeline, or publish a video. Existing
project IDs, voiceover timing, stable scene IDs, and unrelated layers remain
the source of truth.

The **Agent Notebook** opens from the project workflow strip in a dialog.
It contains the runbook, a read-only project context and scene index, private
media IDs, full or per-scene JSON, validation without saving, and cloud save.
Opening it leaves the current project step in place. Loading data can open
Motion & export if its agent API is unavailable. Notebook and plugin edits
use the same saved Motion Studio draft and revision. Agents can read and patch
scene JSON through the plugin without a browser. The plugin JPG request needs
a connected renderer, and MP4 export runs in Motion & export.

## Next plugin improvements

1. Add a compact scene index with stable IDs, names, time ranges, engine types
   and the draft revision. This lets an agent find a scene before using the
   existing resolved-scene read.
2. Add a dry-run scene patch that reuses save validation and returns field-level
   changes and missing asset IDs without committing them. Return the resulting
   revision and changed scene IDs after a real save.
3. Let a scene patch attach existing private media by validated asset ID, so
   adding one image does not require importing a full manifest.
4. Extend the existing JPG flow with a few requested timestamps and explicit
   renderer availability, for checking motion across a scene.

## Selected-scene preview

Motion Studio now includes **Export selected scene JPG** beside the existing
all-scenes preview export. It renders only the currently selected scene using
the same renderer and timeline timing, making map, formation, elephant, asset,
and colour checks quick before a full MP4 export.

## Production rules

Reuse the project's final MP3 and measured timing. If new timing is needed,
use the configured OpenAI timing service. Use supplied assets and
verified geography, label estimates or reconstructions, and never invent
precise troop movements. For the Second Battle of Panipat, prefer the existing
top-down battlefield formations, elephant assets, commander assets, and
symbolic routes. Use browser control only for visual review; scene JSON changes
go through the revision-safe tool.

## Verification and deployment

Run `node --test functions/test/creator-plugin-oauth.test.js` for the cloud
tool surface and patch/manifest guards. Run `node --check` on the changed
server and Motion Studio files. Deploy only the existing Firebase function
`creatorPluginMcp`; do not change the OAuth resource URL or create a second
plugin connection.

## Connection entry point — November 22, 2026

Creator Studio exposes **Connect ChatGPT** in its header. The existing
`creator/plugin-connect.html` page now shows setup actions without an OAuth
request, links to ChatGPT settings, and lets users copy the canonical MCP address.
The OAuth consent action still requires a request initiated by ChatGPT. An
Invincible Firebase sign-in alone does not establish a ChatGPT connection.

Malformed OAuth input remains an error after account restoration. Callback
navigation stops if the signed-in account changes during authorization. The
permission description includes scene writes supported by the current plugin.
The page never infers ChatGPT account linking from Firebase sign-in.

Verification: JavaScript syntax and six focused Node tests passed for the entry
link, signed-out/signed-in setup, malformed requests, the callback, account change
and clipboard fallback. The full repository build/browser checks could not run
in the partial connector checkout. Live authenticated linking and refresh still
require an actual ChatGPT OAuth request. No Firebase deployment is included.


## Session connection diagnosis — November 25, 2026

The packaged workflow now discovers live tools before selecting operations and
distinguishes missing host tools, an authenticated authorization error, and a
signed-out Creator browser. Anonymous MCP probes establish server availability
only. They cannot establish whether the host holds a valid saved connection.
The source OAuth implementation issues one-hour access tokens and rotating
90-day refresh tokens. An authenticated cross-session refresh remains unverified.

The skill feature-detects optional tools, uses native creation for new films when
the live server lacks a creation tool, and retains the selected timing provider.
Verification covers package JSON/YAML, live tool names, retained connection
configuration and source diff checks. No server authentication logic changed.
