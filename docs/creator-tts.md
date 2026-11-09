# Creator Studio voiceover

Open **Creator Studio → Voiceover** (`creator/tts.html`). Paste Hindi, English,
or another supported language, select a speech engine and voice, preview the opening, then
generate and download an MP3. This is reusable across videos, not Panipat-specific.

## Gemini expressive delivery

The voiceover page can use Gemini 2.5 Flash TTS or Gemini 2.5 Pro TTS through the
existing Cloud Text-to-Speech REST API and Firebase runtime credentials. The
server sends the narration as `input.text`, delivery/direction/pace as the separate
`input.prompt`, and the allowlisted model and speaker in `voice`. Instructions are
not prepended to the narration. Speech quality and adherence require a real listening
check; local tests do not establish either.

- Six initial speakers: Charon, Fenrir, Puck, Kore, Aoede and Leda.
- Hindi, Indian English and US English; Gujarati is explicitly labelled Preview.
- Natural, Sales, Social media, Empathetic, Excited, Documentary, Dramatic and Calm delivery; optional
  custom direction up to 2,000 UTF-8 bytes.
- Speed 0.25–2× directs Gemini's speaking pace through the prompt. It is approximate,
  not measured time stretching or a guaranteed recording duration. Editing speed
  does not replace the selected emotion/delivery.
- Gemini accepts plain narration here. SSML, pitch and exact paragraph pauses remain
  available only for compatible classic Google voices. Existing SSML scripts are
  rejected for Gemini rather than reading markup as narration.
- Gemini text is split at 4,000 UTF-8 bytes and repeats the performance prompt on
  every chunk. Lossless PCM joining and one verified MP3 encode are unchanged.
  Independent chunks can vary in delivery; preview the actual script.
- Hourly byte accounting includes each repeated prompt and synthesized text/SSML.
- Drafts retain engine/model/direction per account on the device. Old drafts retain
  their classic voice; a backend without Gemini catalogue entries disables Gemini.
- The navy/gold layout keeps the script and voice controls beside one another on
  desktop and stacked on phones. Model, volume and compatible classic controls are
  under Fine adjustments. Existing public voice demos do not generate paid audio;
  Gemini uses the explicit paid opening preview.

### Activation

This change requires deployment of the `creator-tts` Functions codebase **before**
publishing the static page. No new API key belongs in the browser. Keep the existing
`CREATOR_TTS_ACCOUNT_UID` value and account restrictions.

The Functions runtime service account also needs `aiplatform.endpoints.predict`;
Google documents `roles/aiplatform.user` (Vertex AI User) as a role containing that
permission. Verify this on the actual runtime account, with billing and Cloud
Text-to-Speech enabled. A catalogue entry does not prove model permission/quota.

From an authorized Firebase CLI session, deploy only the TTS codebase using the
command below. Then verify a short, user-approved Hindi-English passage with
neutral, excited and sales delivery on the signed-in site before using full scripts.
Activation on November 10, 2026 used the existing authorized Windows Firebase login.
Both TTS endpoints were deployed on Node 22 with their original restricted owner UID.
Billing and Cloud Text-to-Speech were enabled; the actual runtime account already
had the prediction permission through its existing role. Enabling the previously
disabled Vertex AI API resolved the initial access failure without an IAM grant.
A signed-in Gemini Flash/Kore excited test of the approved short Hindi-English
narration generated and downloaded a 4.9-second MP3, which fully decoded. The failed
neutral attempt was not retried. A complete neutral/sales comparison, Pro synthesis,
classic production SSML and subjective listening quality remain unverified.
The Social media and Empathetic presets have focused request-contract and browser
coverage; no additional paid generation was used to validate their delivery quality.

```sh
firebase deploy --only functions:creator-tts --project life-by-adichimp
```

Reference: [Google Gemini-TTS API, limits and permissions](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts).

## What the page supports

- The live Google voices catalogue, with language, gender and family filters.
- A round play/stop button before the voice selector plays Google’s existing public sample without narration or a synthesis request. The catalogue captured on November 9, 2026 contains 2,002 exact voice/sample matches. Missing samples are disabled; playback failures do not trigger paid generation. Samples use Google’s original delivery settings.
- Neural2, WaveNet, Standard, News, Studio and Chirp 3 HD voice families.
  Other returned families are explicitly unavailable rather than silently substituted.
  Gemini speakers are curated separately and require the model permission above.
- Speed 0.25–2.0x, pitch -20–20 semitones where supported, volume -12–6 dB.
- Paragraph pauses, plain text or validated SSML, and delivery starting points.
  These presets change numerical controls; they do not promise a particular emotion.
- A short paid opening preview for plain text, full MP3 generation, audio playback
  and download. SSML previews are disabled so the opening is not cut inside markup.
- Per-account draft/settings recovery on this device. Completed full recordings
  also retain their script and settings in account-owned history (see below). Audio is held in memory;
  sign-out/account changes clear the player, and stale in-flight replies are discarded.
- Voiceover history stores script/settings metadata in Firestore; audio is not
  uploaded to Firestore/Storage by the voiceover page. The synthesis backend stores
  only per-account usage counts and an active-generation lock.

## Voiceover history — November 10, 2026

Each successful full generation adds one history entry, so its downloaded MP3 has
an associated recipe. Opening previews and failed generations do not add entries;
downloading the same recording again does not duplicate it. Existing downloads
made before this feature cannot be reconstructed from the old in-memory player.

History retains the recording name, date, script/input mode, exact synthesis request,
voice/language/engine, model, delivery/direction, speed, pitch, volume, paragraph
pause, filename and returned duration. **Script & settings** expands the saved
details. **Use again** loads the saved controls and script without generating or
spending quota; confirm before replacing a different current script. Unavailable
historical voices disable generation until a new voice is selected rather than
silently substituting a narrator. The user still presses Generate MP3 explicitly;
regeneration uses paid quota and expressive output need not be byte-identical.

Records live at `users/{uid}/voiceoverHistory/{recordingId}` under the existing
owner-only personal-data rules. History loads in pages of 25; Load more retrieves
older records. Refresh/fresh browser sessions use the account's Firestore records,
not the draft on one device. No new rule, backend deployment or audio upload is
required. Production access still needs a signed-in check against the live rules.

**Export settings** downloads a JSON recipe with the script and request, independent
of the audio. **Delete** removes the selected account history record after confirmation;
it cannot erase a downloaded MP3 from the computer. No audio bytes are stored in history.

Pending/failed saves keep an account-scoped local retry copy while browser storage
permits it. Retry save uses the same record ID, so an uncertain response does not
duplicate history. Export/restore remain usable during a pending save; no paid
generation retry runs automatically. Save/delete failures remain visible, and failed
deletions retain their records. Account switches clear the displayed history and
discard stale UI responses. Local retry data is removed after a successful save or delete.

Validation: the actual history client is exercised against a controlled Firestore
adapter in `tests/creator-tts-browser.cjs`: exact settings snapshots, preview exclusion,
recipe download, restore without synthesis, reload/fresh-context retrieval, pending
save retry, pagination, deletion failure/success, account isolation and phone layouts.
Fixtures do not establish deployed Firestore permissions or real speech quality.

The browser's download settings choose the destination folder. The site cannot
silently choose a drive on the user's computer.

## Secure backend activation

The creator-tts backend was deployed successfully on November 9, 2026. The configured owner account completed a real browser paste → live voice catalogue → male Hindi generation → MP3 download check. The catalogue returned 2,066 voices and the downloaded recording was approximately 3.5 seconds. No local Python process or uploaded key is needed for normal site use.


The page calls `creatorTtsVoices` and `creatorTtsGenerate` in asia-south1 on the
existing Firebase app/project (`life-by-adichimp`). It never requests a key upload.
The server uses its runtime Application Default Credentials. The existing private
service-account JSON remains outside the public repository and browser.

1. Use an administrator's Firebase CLI login for the existing project.
2. Set `CREATOR_TTS_ACCOUNT_UID` in the functions-tts environment to the Firebase Auth
   UID of the intended Invincible account. An empty value disables both endpoints;
   a different signed-in account is denied. The UID can be read under Firebase
   Console → Authentication → Users. Do not use an email address in place of UID.
3. Ensure Cloud Text-to-Speech and billing are enabled in the same project.
   The Functions runtime service account needs the appropriate Google TTS permission.
   Keep the existing app's credential/rules configuration; do not upload the local key.
4. Install Functions dependencies and deploy only the two new endpoints:

```sh
npm ci --prefix functions-tts
firebase deploy --only functions:creator-tts --project life-by-adichimp
```

TTS has its own functions-tts package and creator-tts codebase, so the existing AI/Kling/asset Functions and their secrets do not need redeployment.
No new OpenAI credential is used by this feature. Publish the static page using the
repository's usual GitHub Pages workflow after the backend is ready.

A signed-in production-backend check confirmed the configured account and runtime access.
Local fixtures alone cannot establish either. The local service-account key can synthesize
speech but returned no deployment/IAM administration permissions in a read-only check.

## Audio processing and limits

Input is limited to 30,000 UTF-8 bytes. Plain text and SSML are split into requests
below 4,400 bytes, including wrappers, below Google's 5,000-byte request ceiling.
SSML fragments are XML-validated and split with their ancestor tags; text/Unicode
and explicit breaks remain ordered. External audio, voice switching, entities,
declarations and excessively deep markup are rejected.

Google returns 24 kHz mono LINEAR16. The server validates every WAV, joins lossless
PCM, then encodes once to 160 kbps MP3 using ffmpeg-static and verifies a complete
decode. This avoids accumulating MP3 padding at each request boundary.
The server enforces a ten-minute audio cap and a 15 MB MP3 cap.

Both endpoints require the configured account. Synthesis is limited to one active
request per account, 30 recordings and 180,000 input bytes per hour. Preview uses
the same quota. Counters live in server-only `_creatorTtsUsage/{uid}`; existing
Firestore client rules are unchanged. Failures count against the local safety quota,
and there is no automatic paid retry. The lock expires after ten minutes if the
instance stops before releasing it.

Chirp 3 HD gets pace control but no direct AudioConfig pitch. Its SSML support
differs from Neural2; unsupported emphasis is rejected. Studio also rejects prosody.
The page disables unavailable controls and the backend validates them again.

## Verification

- `npm run test:tts`: backend validation/chunking/auth tests, real MP3 encode/decode,
  and browser paste/settings/preview/full export/download/error/draft/account checks.
- Browser layouts at 320, 393, 768 and 1280 px with the real shared navigation.
- A small live Hindi-English recording using hi-IN-Neural2-B, speed 1.05 and pitch -1
  successfully generated and decoded (3.88 seconds). Live Google listed 2,066 voices.
  This verifies the local private credential, not deployed Functions authentication.
- Main production build, full unit/Functions suite and site-reference validation passed.
  The broader browser run and deployment results are recorded in docs/code-review.md.

No existing project scripts, storyboard data, narration, Firebase rules or unrelated
modules are migrated or modified by opening this page.

## Primary references

- [Google synthesis API](https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize)
- [Google voices API](https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/voices/list)
- [Google audio settings](https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/AudioConfig)
- [Chirp 3 HD controls](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)
- [Firebase callable Functions](https://firebase.google.com/docs/functions/callable)
