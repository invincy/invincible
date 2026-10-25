# Advisor Scene 1 Audio Asset

The user-supplied Scene 1 recording is installed here:

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

### Recording verification — October 25, 2026
- Installed the supplied `page1(1).mp3` unchanged (210,452 bytes; 12.095 seconds; MP3, 44.1 kHz stereo).
- Confirmed the configured advisor source matches the installed path and the file decodes without errors. Existing focused playback tests cover play/pause/resume, completion reset and stopping on Stage 2/navigation.
- Voice content and subjective voice quality were not independently transcribed or assessed.
