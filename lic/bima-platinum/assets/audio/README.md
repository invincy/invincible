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


## Three-page continuous story (current)

One original `#storyChart` figure is moved between two hosts; Page 2 and Page 3 share the presenting scene. All SVG path geometry and blue/red/green colours are preserved. The large card is removed, labels are state-specific, and the business baseline remains visible beside each newly introduced path.

The user will provide these **new recordings**. The older `advisor-scene-*.mp3` files remain unchanged as archives; they contain previous scripts and are not active in this story. No generated voice or browser speech is substituted.

| Page | New file under assets/audio/ | Spoken script |
| --- | --- | --- |
| 1 | advisor-story-1-hindi.mp3 | आपका business ही आपका main growth engine है। यहीं से आपकी income और wealth grow होती है। |
| 2 | advisor-story-2-hindi.mp3 | Business में पैसा लगाइए growth के लिए। लेकिन अगर आपकी बाकी savings भी Share Market में जाएँ, तो overall volatility और बढ़ जाती है। |
| 3 | advisor-story-3-hindi.mp3 | इसलिए अपनी personal savings का एक हिस्सा stability के लिए अलग रखिए। एक stable या guaranteed structure आपके overall finances में predictability जोड़ता है। |

Configuration is at the top of presentation.js in STORY_SCENES. Page 1 draws blue business from 0s. Page 2 begins with blue and switches to red at 3.2s, a provisional cue that **must be aligned with the second sentence in the supplied recording**. Page 3 draws green from 0s. Drawing lasts 1.4 seconds per cue; pause/resume/seek follow media currentTime, never wall-clock timers. Reduced motion uses a static glow. Audio loads only on tap; Back, Next, Escape, tab hiding and pagehide stop it. Missing new recordings show an honest pending-recording status.

Verification: nine focused tests cover shared chart identity, forward/back navigation, all three audio sources and cue states, draw progress, seeking, pause/resume/replay, late-event cancellation, failures and page lifecycle. Mobile visual QA covers 320×568 and 390×844. Actual phrase alignment remains pending the user's three recordings. No product features, measured outcomes or guaranteed combined returns were added.


## Page 4 product reveal

Page 3 now advances to a dedicated navy/gold Bima Platinum reveal inside the existing presentation shell. A small green-to-gold path settles before the product title, anniversary label and Limited-Period Plan label; reduced motion skips entrance animation. The presenting advisor remains at the right. No chart, calculations or benefit tables appear on Page 4. Pages 1–3 keep their existing copy, path geometry and audio scripts; only Page 3's forward CTA is added.

New audio source: `assets/audio/page4-advisor.mp3`. Exact script: “यहीं Bima Platinum आपकी financial journey में stability जोड़ता है। यह आपके portfolio के एक हिस्से को guaranteed और predictable structure देने के लिए बनाया गया है।” The MP3 is not supplied yet. Existing missing-recording handling is retained, with no substituted voice. The same controls support play/pause/resume and stop on navigation/tab hiding. Anniversary and availability labels are visual only, outside the script.

Page 4's Plan समझें CTA opens Page 5, which embeds the existing calculator.html at #optionDetail to reuse the existing benefit-structure explanation rather than inventing another policy model. Back returns to Page 4; Page 5 is loaded only when requested. No existing calculator files are modified.

Source check: LIC's official 01.09.2026 press release confirms the 70th-anniversary context and non-linked, non-participating savings/protection plan with guaranteed additions: https://web.licindia.in/documents/d/guest/press-release-new-plans-bima-platinum-and-jeevan-raksha_02092026 . The existing calculator already carries the limited-window positioning; secondary published plan guides corroborate it. No closing date or new numerical benefit is added to the reveal. No separate anniversary image asset was found, so the supporting credential uses plain styled text, not an invented official seal.

Verification: eleven focused LIC tests cover prior scenes plus Page 3→4→5 navigation/back, shared audio lifecycle, exact source/script, missing recording handling, and restoration of the unchanged chart. Mobile preview checked at 320×568 and 390×844. Phrase-level narration timing remains pending the user's MP3.

Page 4 reference refinement: the supplied transparent anniversary advisor replaces the presenting pose on Page 4 only, using an optimized 87,462-byte WebP copy with alpha preserved. Added a brighter gold path, restrained background arc/bars, headline lighting, stronger gold product lettering and a left-aligned audio pill. Existing Page 4 script, audio source and Page 5 handoff are preserved; Pages 1–3 use the original presenter. Mobile preview checked at 320×568 and 390×844; existing eleven interaction tests pass.
