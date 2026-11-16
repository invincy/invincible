# Invincible Creator Studio connection

The existing private MCP connection keeps its installed identity and endpoint:

`https://asia-south1-life-by-adichimp.cloudfunctions.net/creatorPluginMcp/mcp`

It uses OAuth 2.1 authorization code with PKCE and the existing Invincible
Firebase session. No project, asset, OAuth token, or connection data is deleted
by this update.

## Current bounded tools

- `get_my_profile`, `list_creator_projects`, and `get_creator_project_context`
  read the signed-in account and existing project state.
- `get_creator_video_draft` reads the saved Motion Studio manifest, revision,
  stable scene IDs, timing, and private asset catalogue.
- `list_creator_assets` lists existing private assets without uploading or
  duplicating files. Creator media IDs are content-addressed, so exact bytes
  reuse the same asset ID.
- `apply_creator_scene_patch` validates and saves one scene patch with an
  exact `expectedRevision`. Unmentioned scenes and layers remain unchanged.
- `get_creator_workflow_status`, `start_creator_local_timing`, and
  `get_creator_local_timing_status` retain the existing timing checkpoint.

The old full-plan Director registrations are no longer exposed. The server
does not create projects, replace a full timeline, or publish a video. Existing
project IDs, voiceover timing, stable scene IDs, and unrelated layers remain
the source of truth.

## Selected-scene preview

Motion Studio now includes **Export selected scene JPG** beside the existing
all-scenes preview export. It renders only the currently selected scene using
the same renderer and timeline timing, making map, formation, elephant, asset,
and colour checks quick before a full MP4 export.

## Production rules

Reuse the project's final MP3 and measured timing. Use supplied assets and
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
