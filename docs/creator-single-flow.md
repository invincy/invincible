# Creator Studio: one video flow

## Creator home and project entry

Creator Studio opens on a project-first home. Existing projects are searchable
and open directly; the publishing pipeline remains available as a secondary
disclosure. Motion Studio, Map Editor, Battlefield Editor, Voiceover, Image
Studio and Assets & 3D are visible from the home. Motion Studio opens its own
project-selection view and never creates an untitled project. Choosing a saved
project opens that project's existing Motion Studio workspace; its Recent
projects selector keeps Motion Studio active when switching projects. Other
project tools retain their existing project picker, while Voiceover and Image
Studio retain their standalone routes.

The Creator Studio **New project** action immediately opens a local, unsaved
**Untitled project** on the Script step. It does not interrupt the flow with the
compact project-setup dialog. Naming the project, adding or generating the
voiceover, and entering the animation instructions happen in the normal
Script-first project sequence. The project keeps the existing Creator schema
and is written through the existing revision-aware save path.

Inside a project, a visible project toolbar links Motion Studio, Script &
scenes, Map Editor, Battlefield Editor, Assets & 3D, Image Studio and
Voiceover. Save now and Save & return use the existing revision-aware save
path. Direct tool URLs retain the project ID and select the requested existing
workbench area; no project, manifest, map or renderer schema is replaced.

The Script step owns narration and voiceover creation. After the final MP3 is
generated, **Next · Script & scenes** appears beside Download MP3. It preserves
the in-memory final MP3 while activating the project's second navigation step.
Script & scenes owns Whisper timing, timed-transcript correction, animation
instructions and scene-plan review. The browser does not open a separate page
or reload, so the generated recording remains available to Whisper.
Timing tries the paired laptop's local Whisper service first. The scene-planning
choice is independent: OpenAI is the recommended planner, while local Qwen
remains an optional fallback. When OpenAI is selected and the local timing
service is unavailable, Creator explicitly switches to the paid OpenAI
transcription fallback and checkpoints the returned segment/word timestamps.
Local Whisper remains local and free; only the fallback uploads the final MP3.
After generation, Final speed previews the chosen pace. Download MP3 and Next ·
Script & scenes both prepare the same pitch-preserving, speed-adjusted MP3.
Whisper receives those adjusted bytes rather than the original recording, so
the downloaded duration, transcript timestamps and scene timing agree.
Opening previews cannot be analysed as the final recording. The visible
MP3 ready → Whisper timing → Sync plan progress leads into locked timestamps,
animation instructions, sync-plan review, and finally Apply to project → Open
Motion Studio. On desktop, animation instructions use the wider left card while
the locked Whisper transcript remains visible in a separate right card. The
planner reports elapsed progress, renders the review as soon as generation
finishes, and enables Motion Studio only after the plan and final MP3 are saved.
While Qwen works, state clearly that no further click is required and that the
Review sync plan stage will open automatically; do not leave a disabled button
as the only explanation of progress.
After the final reviewed scene, one Apply action imports every locked scene and
the exact analyzed MP3 into Motion Studio. Planning requests production-safe
fallbacks, so missing verified geography becomes an explicit Canvas context
scene instead of a dead handoff. Applying immediately saves a recoverable local
Motion Studio draft. The remaining user choice is Preview full video, optionally
edit a scene, then Export MP4; do not send the user through another importer.
The sync-plan review also lists every requested production resource. Existing
project assets are reused. Historical territory requests are checked against
the bundled dated reference pack; a safe label-only locator can be created
automatically, while factual polygon extents remain queued for Map Editor
review. Missing visual resources keep their declared fallback and offer a
direct **Open Map Editor** or **Open Assets** action. A single missing asset no
longer blocks the rest of the plan.
OpenAI planning now selects the existing native Map Editor engine for geographic
segments and supplies its validated version-1 camera, label and illustrative
route instructions. Motion Studio receives those scenes as `map`, not Canvas.
The visible numbered flow reads **1 Script → 2 Sync plan → 3 Review maps → 4
Motion & export**. After a plan is applied, every generated map opens in the real
Map Editor in timeline order; Save or discard continues to the next map, and the
last map returns automatically to Motion Studio. A persistent guidance strip
states the current step and next action. Canvas remains available for
non-geographic diagrams, while project-wide Map Editor, Battlefield Editor,
Assets & 3D and Image Studio stay visible as optional tools. This does not add a
second renderer or replace a saved project's map schema.
As soon as Whisper finishes, Creator Studio checkpoints the final MP3, original
source MP3, locked transcript and current animation instructions for that
account and project. After an app restart, selecting Script & scenes opens this
checkpoint directly and re-enables Generate sync plan without repeating Script,
MP3 generation or Whisper. An interrupted Qwen request is not treated as a
completed plan; the saved inputs remain ready for a deliberate retry.
Step 2 always opens this Whisper / sync-plan workspace. Without a checkpoint it
shows the truthful ready-for-a-final-MP3 state; it never falls back to the old
empty storyboard. The old Studio / Script / More workbench strip is likewise
not part of the Step 2 header.

On wide project screens, Script and Recording share the main column and Voice
uses the side column. Script & scenes gives the Whisper / sync-plan workspace
the full project width. Phones preserve each step without horizontal overflow.

For historical projects, Map Editor's dated reference picker accepts multiple
comma-separated polity names. **Load complete year view** prepares all active
territory outlines for that year as a colour-coded review pack. The user must
still inspect the source and explicitly approve the GeoJSON before import.

### Video Director plugin — November 14, 2026

The first private ChatGPT plugin increment exposes the shared semantic contract
and deterministic compiler over a loopback streamable-HTTP MCP server. It is
read-only: ChatGPT can load the exact renderer vocabulary and compile a complete
locked plan, but applying that draft still uses Creator's existing reviewed
project flow. See [Invincible Video Director plugin](invincible-video-director-plugin.md).

### UX overhaul verification — November 13, 2026

The focused Creator browser scenario passed project creation, the project/tool
picker, instructions persistence, direct project navigation, save controls,
advanced setup, 16-scene import, reload/draft recovery and existing production
workflows. Creator home layouts passed without horizontal overflow at 320×568,
390×844, 768×1024, 1280×720 and 1440×900; the project editor also retained its
existing phone and desktop responsive checks. The voiceover-start manifest
contract and Studio/composition unit suites passed 30 cases. The focused Map
Editor unit/browser suite passed, including native MapLibre editing and
responsive layout. The complete repository unit run passed 264 tests with two
existing fixture skips; all 15 Functions and all five creator-media backend
tests passed. UI contracts, the production build, site references and diff
whitespace checks passed.

The full single-flow browser scenario reached native MP4 export but twice timed
out waiting for Chromium's download event in this environment. The focused
Studio unit contract for export capability passed, and this overhaul does not
change the exporter; a new end-to-end encoded MP4 is therefore not claimed.
Live signed-in Firebase upload, physical mobile/Safari and production
publication were not exercised. No deployment was performed.

## User workflow

Open a saved project in Studio. The opening screen has four steps:

1. **Add assets & voiceover**: choose or drop PNG/JPEG/WebP, MP4/WebM, MP3/WAV or self-contained GLB files (up to 100 MB each, audio/video up to ten minutes). Search the private shared library. Images/clips can be added as scenes; audio can be added as voiceover, music or effect. GLB is available in the focused Map Editor.
2. **Import your complete video**: Copy ChatGPT brief includes the current version-2 manifest, exact IDs and available media metadata. Add the script and measured speech cues; import one JSON, Review import, then Apply reviewed import. JSON is not executable and does not invent missing artwork, geography or narration alignment.
3. **Review scenes & audio**: map, battlefield, graphics, image and video scenes share the same timeline. Edit scene opens the existing map/battlefield tools and returns to Studio. Image overlays can appear on maps; geographic map artwork and tactical formations remain different coordinate systems.
4. **Save / Export MP4**: Save retains a local recovery version and synchronizes the owner's complete video/brand draft. Export downloads a 1080p 30-fps MP4 with attached audio. The standalone Map Editor's silent MP4 command remains available under the existing tools.

### 2.5D scenes

In Video Studio, choose **Add scene → 2.5D · Train template** for an editable portrait starting point. For a blank scene, add **Canvas / explainer**, open **Objects**, and enable **2.5D camera**. Add shared artwork as image objects. Give distant layers a low depth and foreground layers a higher depth. Depth 0 pins an overlay to the frame. Object order still controls which layers appear in front. Pan X and Pan Y are fractions of the frame, and End zoom is relative to the starting size.

The same Canvas scene can be authored in JSON. Set `engineData.parallax` to `{ "panX": 0.12, "panY": 0, "zoom": 1.08 }` and set `depth` from 0 to 1 on individual overlays. The camera eases from the initial frame to the specified pose across the scene, while object keyframes keep their existing timing. Preview and MP4 use the same projection. The browser still needs H.264 WebCodecs support for MP4 export.

### Lightweight 3D scenes

Choose **Add scene → 3D · Train stage**. Open **3D camera** to set the start and end turn, tilt and zoom. Open **3D models** to add or remove a train, rocket, tree or box, or set each object's start and end position, height, rotation and scale. A directional light casts shadows on the ground as objects move. Add screen-space titles and graphics through the existing object controls.

To reuse your own model, upload a self-contained static GLB under **Shared media**, select **Register 3D model**, then add it under **3D models**. For Motion Studio, use up to 8 MB and 20,000 triangles per model, up to six models per scene, and embedded textures up to 2048 px. Camera and model settings are editable in the version-2 JSON and use the existing preview and MP4 timeline. The renderer loads on demand and requires WebGL 2.

Script and the older production/asset-note tools remain available. Local Advanced / recording audio is an explicit session preview. It is not an upload or a cross-device attachment; use the shared uploader for persistent narration.

## Shared library

All Studio upload routes, Map Editor file uploads and the older production-clip uploader use the same account-owned library. A cloud-ID is a SHA-256 content identity, cloud- followed by 64 lowercase hex digits. Reuploading identical bytes reuses the stored original. References do not grant access to another account.

The dedicated creator-media Functions codebase exposes creatorMedia in asia-south1. It checks Firebase authentication on each action. Original files live privately under creatorMedia/{uid}/originals/{assetId} in the configured CREATOR_MEDIA_BUCKET. Backend-only metadata lives under _creatorMedia/{uid}/assets/{assetId}; pending upload receipts are separate. Metadata records name, MIME/type, size, dimensions/duration when available, credit, stable ID and completion time. The client first measures media metadata; commit verifies size, binary signature and SHA-256 of the uploaded bytes. Metadata is descriptive, not evidence for historical claims.

Uploads use an authenticated prepare call and a generation-conditional resumable upload session. Completed files are immutable; a failed retry cannot overwrite another original. The private bucket denies public exposure and allows CORS from the existing GitHub Pages origin. Originals are not placed in public Git, JSON or Firestore documents. Read actions authorize the account before issuing a 15-minute signed URL. Saved project/manifest JSON never stores that expiring URL. The client caches fetched originals locally for editing.

Map artwork uses cloudAssetId, retaining old hosted and project-private references for compatibility. A shared artwork picker is inside Images & 3D assets. Scene/library exports preserve cloud identity. Studio uses the same stable ID as fileId and retrieves the original through the authenticated media client on a new device. Existing hosted references are retained, not silently reuploaded. Older local Studio originals are uploaded when the owner explicitly saves; original source bytes are preserved.

## Video draft synchronization

Owners' drafts live at _creatorMedia/{uid}/drafts/{projectId}, alongside a revision and saved brand profiles. The backend verifies the existing Creator project owner. Payloads are bounded to 900 KB to leave room below the Firestore document limit. The local store is still an account-scoped recovery cache with immutable versions. A new device loads the owner's saved cloud draft; an existing local draft is not silently overwritten by another device. Review cloud draft explicitly loads a replacement through the existing reviewed import/apply path. Stale revisions reject the cloud save and retain local recovery. Invited editors retain their existing Creator/map access and local Studio editing; shared cloud-draft editing and sharing another owner's private media are not added by this release.

## Deployment and checks

Deploy only functions:creator-media with CREATOR_MEDIA_BUCKET configured. This does not redeploy existing AI/TTS functions or change Firestore rules. The dedicated runtime service account has object access to this bucket, Firestore service access, and signing permission on itself. Client database rules do not open _creatorMedia. Backend source and fixtures are excluded from public Pages staging.

Run npm test, npm run test:video-studio, the existing Map Editor/history/map-animation/default/universal checks, npm run build and npm run check. The new single-flow browser test uploads synthetic image/audio, imports one map-plus-army-overlay manifest, exports with audio from an independent browser context, and checks account isolation and stale-draft conflicts through a controlled remote service. Backend tests exercise the actual handler's authentication/account scope and original-byte validation. These are distinct from signed-in production acceptance.

## Motion Studio extension — November 10, 2026

The existing Studio now exposes Canvas / explainer scenes alongside Map and Battlefield;
these are modes in the same project, compositor, manifest and MP4 exporter. The internal
`graphic` engine name and schema versions 1/2 remain compatible. Canvas supports plain,
grid, blueprint and image backgrounds. Background image IDs reference the same assets
as overlays. Grid spacing and text sizes are reference pixels at a 1080-pixel short edge.
Bundled Latin/Hindi font aliases and standard system/serif/monospace choices are available.

The Objects disclosure below preview edits screen-space overlays on every engine:
text, image, rectangle, circle, line and arrow. Select in the preview or object track;
drag to move and use the corner handle to scale. Track bodies move visibility windows;
track edges trim them. Numeric controls remain available for keyboard/mobile precision.
Motion keys edit position/scale/rotation/opacity at the playhead, with linear/smooth/hold
easing. Dragging an animated object inserts/updates a key at the current scene-local time.
Object edits retain bounded undo/redo history; external manifest edits invalidate that
history so undo cannot erase a later audio/import/scene change. Selection guides are DOM
controls and do not enter exported frames. This does not add timeline waveform editing,
formula typesetting, grouped screen objects, arbitrary custom font uploads or 3D physics.

Battlefields optionally contain up to 200 `projectiles`. Each has id, normalized from/to,
launchSeconds, flightSeconds, arcHeight, radius, color, impactSeconds and impactRadius.
The flight is a deterministic parabolic trajectory; impact is an expanding fading cue.
All timing fits within the scene; scene resizing retimes flights and impacts. These are
explicit authored cues, not automatic collision detection. Formation movement remains
authored through the existing paths. Place the target at the arrival position/time.

Sound effects/music can repeat one original trimmed source segment with `loop:true`
and `sourceDurationSeconds`; clip duration controls the total repeated span. Volume and
fades cover that whole span. Preview and export use the same clip timing and loop bounds;
voiceover looping is rejected. Add cannon and impact clips at scene start plus launch
and arrival times. No sound is synthesized or automatically attached to a projectile.

Copy ChatGPT brief documents the complete accepted schema. JSON supplies every render
property, including backgrounds, fonts, shapes, paths, effects and audio clips; manual
controls edit that same canonical data. Media files must exist and be accessible via
exact references. Unknown fields and missing files fail explicitly. No executable JSON
commands, inferred speech alignment or invented media IDs are supported.

`creator/video-studio/motion-example.json` is a six-second asset-free import example,
not a finished film or a scientific/historical reconstruction. Import using the existing
Review import / Apply reviewed import controls, then Export MP4.

### Verification and continuation

Base checkout: `b66808a41729ccb97433c9bddcee2152e9facbc9`.
All 231 repository Node cases ran: 229 passed, two existing skips. Focused Studio cases:
30 passed, including six new tests for schema roundtrip, invalid imports, trajectory
seeks/retiming, audio-loop samples/scheduling, typography scaling and the AI brief.
The later loop-seam interpolation correction passed the six affected new tests.
Site references and diff whitespace checks passed. An isolated DOM check exercised font
edits, undo/redo, key insertion, blueprint selection, duplicate/delete and cleanup.

Browser verification is **unfinished**: the required Video Studio command stopped when
Chromium aborted at startup (`socket() failed: Operation not permitted`). No workaround
or permissions change was attempted. Consequently canvas/pointer layout, real WebAudio
loop seams, mobile interaction, saved-account behavior and a new encoded MP4 are not
certified. Production Firebase permissions and deployment were not exercised.

On a machine with Chrome, run `npm run test:video-studio` and
`node tests/creator-motion-studio-browser.cjs` (set CHROMIUM_EXECUTABLE if necessary).
The added browser scenario exercises the real import, manual font edit, undo/redo,
save/reload, responsive width and native JSON-to-MP4 export. Inspect its resulting
`.test-output/creator-motion-studio.mp4`, verify both streams when adding real audio,
and review dragging/resizing/track trims on desktop and mobile before publishing.
Publication was subsequently authorized by the user. The GitHub Pages workflow publishes the master branch; its run result is the authority for deployment status. Browser/media verification limits above still apply.

Completed sync plans are stored with the signed-in account's Creator-project checkpoint.
Reopening Step 2 restores the finished plan at review instead of making the user
regenerate it. The compatible pending-draft cache remains a fallback; a stale plan or a
plan from another project is not shown.

## Reviewed-plan handoff verification — November 13, 2026

A signed-in production test applied a four-scene OpenAI sync plan with its exact
12.10-second MP3, opened the resulting Motion Studio timeline, played the full-video
preview and completed the browser's H.264/AAC MP4 export. The test exposed an outer-page
handoff defect: Motion Studio was loaded internally while the Script workspace remained
visible. Applying a reviewed plan now switches the outer project workspace to Review maps
or Motion & export as soon as the import succeeds. Cancelling replacement keeps the
current Script workspace and existing Motion Studio draft unchanged. The focused Creator
browser flow and the complete repository test suite cover the corrected navigation and
existing project compatibility; production Firebase rules and Functions were not changed.
