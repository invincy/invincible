# Creator Studio voiceover

Open **Creator Studio → Voiceover** (`creator/tts.html`). Paste Hindi, English,
or another supported language, select a Google voice, preview the opening, then
generate and download an MP3. This is reusable across videos, not Panipat-specific.

## What the page supports

- The live Google voices catalogue, with language, gender and family filters.
- Neural2, WaveNet, Standard, News, Studio and Chirp 3 HD voice families.
  Other returned families are explicitly unavailable rather than silently substituted.
- Speed 0.25–2.0x, pitch -20–20 semitones where supported, volume -12–6 dB.
- Paragraph pauses, plain text or validated SSML, and delivery starting points.
  These presets change numerical controls; they do not promise a particular emotion.
- A short paid opening preview for plain text, full MP3 generation, audio playback
  and download. SSML previews are disabled so the opening is not cut inside markup.
- Per-account draft/settings recovery on this device. Audio is held in memory;
  sign-out/account changes clear the player, and stale in-flight replies are discarded.
- No script history or audio is uploaded to Firestore/Storage. The backend stores
  only per-account usage counts and an active-generation lock.

The browser's download settings choose the destination folder. The site cannot
silently choose a drive on the user's computer.

## Secure backend activation

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

A production sign-in is required to confirm the exact account and runtime permissions.
Local fixtures cannot establish either. The local service-account key can synthesize
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
