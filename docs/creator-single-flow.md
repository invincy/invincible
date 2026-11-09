# Creator Studio: one video flow

## User workflow

Open a saved project in Studio. The opening screen has four steps:

1. **Add assets & voiceover**: choose or drop PNG/JPEG/WebP, MP4/WebM, MP3/WAV or self-contained GLB files (up to 100 MB each, audio/video up to ten minutes). Search the private shared library. Images/clips can be added as scenes; audio can be added as voiceover, music or effect. GLB is available in the focused Map Editor.
2. **Import your complete video**: Copy ChatGPT brief includes the current version-2 manifest, exact IDs and available media metadata. Add the script and measured speech cues; import one JSON, Review import, then Apply reviewed import. JSON is not executable and does not invent missing artwork, geography or narration alignment.
3. **Review scenes & audio**: map, battlefield, graphics, image and video scenes share the same timeline. Edit scene opens the existing map/battlefield tools and returns to Studio. Image overlays can appear on maps; geographic map artwork and tactical formations remain different coordinate systems.
4. **Save / Export MP4**: Save retains a local recovery version and synchronizes the owner's complete video/brand draft. Export downloads a 1080p 30-fps MP4 with attached audio. The standalone Map Editor's silent MP4 command remains available under the existing tools.

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
