# Advisor Scene 1 Audio Asset

Place the generated professional Hindi female voiceover MP3 here:

```
assets/audio/advisor-scene-1-hindi.mp3
```

### Spoken Script:
> "आपके business में पहले से ही काफी growth potential है। Customers बढ़ें, sales बढ़ें और expansion हो — तो returns भी बड़े हो सकते हैं। लेकिन business में growth के साथ risk भी रहता है। इसलिए आपकी personal savings का हर रुपया दोबारा risk में डालना ज़रूरी नहीं है।"

### Playback Behavior:
- When this file is present, the presentation app automatically plays it via HTML5 Audio with full play / pause / resume controls.
- When absent, show a short unavailable status. No automatic synthetic voice is used.
- Optional browser speech is disabled by default (`AUDIO_CONFIG.enableBrowserSpeech`). Enable only after listening to a suitable Hindi voice on the target device; the browser cannot guarantee voice gender.
- Audio loads only on tap, stops when leaving the page or opening Stage 2, and replays after ending.
