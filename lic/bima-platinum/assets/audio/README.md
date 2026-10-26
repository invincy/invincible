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
- Audio starts when a page opens, stops when leaving it, and replays after ending. Browsers may block the first automatic attempt; the play control remains available.

### Recording verification — October 25, 2026
- Installed the supplied `page1(1).mp3` unchanged (210,452 bytes; 12.095 seconds; MP3, 44.1 kHz stereo).
- Confirmed the configured advisor source matches the installed path and the file decodes without errors. Existing focused playback tests cover play/pause/resume, completion reset and stopping on Stage 2/navigation.
- Voice content and subjective voice quality were not independently transcribed or assessed.


## Three-page continuous story (current)

One original `#storyChart` figure is moved between two hosts; Page 2 and Page 3 share the presenting scene. All SVG path geometry and blue/red/green colours are preserved. The large card is removed, labels are state-specific, and the business baseline remains visible beside each newly introduced path.

The supplied page recordings are installed. The older `advisor-scene-*.mp3` files remain unchanged as archives; they are not active in this story. No generated voice or browser speech is substituted.

| Page | New file under assets/audio/ | Spoken script |
| --- | --- | --- |
| 1 | page1.mp3 | आपका business ही आपका main growth engine है। यहीं से आपकी income और wealth grow होती है। |
| 2 | page2.mp3 | Business में पैसा लगाइए growth के लिए। लेकिन अगर आपकी बाकी savings भी Share Market में जाएँ, तो overall volatility और बढ़ जाती है। |
| 3 | page3.mp3 | इसलिए अपनी personal savings का एक हिस्सा stability के लिए अलग रखिए। एक stable या guaranteed structure आपके overall finances में predictability जोड़ता है। |

Configuration is at the top of presentation.js in STORY_SCENES. Page 1 draws blue business from 0s. Page 2 begins with blue and switches to red at 3.2s, a provisional cue near the sentence transition. Page 3 draws green from 0s. Drawing lasts 1.4 seconds per cue; pause/resume/seek follow media currentTime, never wall-clock timers. Reduced motion uses a static glow. Audio starts when Pages 1–5 open; Back, Next, Escape, tab hiding and pagehide stop the previous page's recording. Missing-file handling remains for recovery.

Verification: focused tests cover shared chart identity, forward/back navigation, all three audio sources and cue states, draw progress, seeking, pause/resume/replay, late-event cancellation, failures and page lifecycle. Mobile visual QA covers 320×568 and 390×844. The exact Page 2 phrase boundary has not been independently transcribed. No product features, measured outcomes or guaranteed combined returns were added.


## Page 4 product reveal

Page 3 now advances to a dedicated navy/gold Bima Platinum reveal inside the existing presentation shell. A small green-to-gold path settles before the product title, anniversary label and Limited-Period Plan label; reduced motion skips entrance animation. The presenting advisor remains at the right. No chart, calculations or benefit tables appear on Page 4. Pages 1–3 keep their existing copy, path geometry and audio scripts; only Page 3's forward CTA is added.

Current audio source: `assets/audio/page4.mp3`. Expected script: “यहीं Bima Platinum आपकी financial journey में stability जोड़ता है। यह आपके portfolio के एक हिस्से को guaranteed और predictable structure देने के लिए बनाया गया है।” The supplied MP3 is installed. The same controls support play/pause/resume and stop on navigation/tab hiding. Anniversary and availability labels are visual only, outside the script.

Page 4's Plan समझें CTA opens Page 5, which embeds the existing calculator.html at #optionDetail to reuse the existing benefit-structure explanation rather than inventing another policy model. Back returns to Page 4; Page 5 is loaded only when requested. No existing calculator files are modified.

Source check: LIC's official 01.09.2026 press release confirms the 70th-anniversary context and non-linked, non-participating savings/protection plan with guaranteed additions: https://web.licindia.in/documents/d/guest/press-release-new-plans-bima-platinum-and-jeevan-raksha_02092026 . The existing calculator already carries the limited-window positioning; secondary published plan guides corroborate it. No closing date or new numerical benefit is added to the reveal. No separate anniversary image asset was found, so the supporting credential uses plain styled text, not an invented official seal.

Verification: eleven focused LIC tests cover prior scenes plus Page 3→4→5 navigation/back, shared audio lifecycle, exact source/script, missing recording handling, and restoration of the unchanged chart. Mobile preview checked at 320×568 and 390×844. Phrase-level narration timing remains pending the user's MP3.

Page 4 reference refinement: the supplied transparent anniversary advisor replaces the presenting pose on Page 4 only, using an optimized 87,462-byte WebP copy with alpha preserved. Added a brighter gold path, restrained background arc/bars, headline lighting, stronger gold product lettering and a left-aligned audio pill. Existing Page 4 script, audio source and Page 5 handoff are preserved; Pages 1–3 use the original presenter. Mobile preview checked at 320×568 and 390×844; existing eleven interaction tests pass.

## Page 5 regular-income sample selector

The earlier embedded calculator on Page 5 is replaced inside the existing presentation shell by a compact income-led screen. Header: official LIC logo, Bima Platinum and 5/10; headline; gold 10% of Basic Sum Assured every year highlight; compact Age/PPT button groups; secondary fixed ₹3 lakh / 30-year facts and annual premium; dominant ₹30,000/year Regular Income; blue-icon timeline; Hear Advisor. There is no "Choose an official LIC example" prompt. The extra disclaimer and the old detailed-example screen were removed. Page 5 now leads to the new five-step Page 6 journey.

`LIC_SAMPLE_PREMIUMS` in presentation.js contains exactly the 20 supplied Age 15/25/35/45 × PPT 7/10/12/15/18 premiums. There is no premium formula, interpolation or extrapolation; unsupported combinations return null. Default age 25/PPT 15 shows ₹32,220. Sample BSA remains ₹3,00,000, policy term 30 years, and regular income ₹30,000/year. Changing either selector updates only the lookup premium and timing labels; selections persist on Back. The first payment is at the end of the selected PPT, not a year later. Booster anniversary is PPT+5; maturity year remains 30. No claim of 10% yield on premiums or indefinite/lifetime payouts is made.

Checked against the user-provided LIC Bima platinum Sales brochure.pdf, printed pages 15–16 (sample illustrative premiums: offline, standard lives, ₹3 lakh BSA and 30-year term), and printed page 5 (income payable at end of PPT, then through the anniversary before maturity, subject to survival and policy in force). Premiums exclude applicable taxes. The fixed table exactly matches all 20 brochure entries. The LIC logo is an unchanged SVG asset downloaded from the official LIC site: https://licindia.in/documents/d/guest/lic_log_updated .

Page 5 uses the shared audio engine with the supplied `assets/audio/page5.mp3`. No synthetic voice is substituted. Focused tests cover all 20 premiums, timing updates, rejected unsupported combinations, default and retained selections, existing scene/navigation regression checks and Page 5 audio lifecycle. Browser QA checks 320×568 through 390×844, fixed income, no scrolling, and Back navigation.

## Page 6 guided journey

Page 6 presents the five plan stages in one compact timeline, with automatic progression, optional node selection, pause/resume, and replay. Its selected age and PPT come from Page 5; the PPT controls the payment period, regular-income start, and booster year. The booster-year table is 7→12, 10→15, 12→17, 15→20, and 18→23. The ₹3 lakh Basic Sum Assured produces ₹30,000 annual Regular Income and a ₹2,10,000 Booster in the illustration. Maturity is shown as Basic Sum Assured plus accrued Guaranteed Additions without inventing a maturity amount. These mechanics were checked against LIC's Bima Platinum sales brochure: https://web.licindia.in/en/web/guest/lic-s-bima-platinum2 .

The journey step data in `presentation.js` maps steps 1–5 to the supplied `assets/audio/page6-step1.mp3` through `page6-step5.mp3`. Audio completion advances the story; if playback is unavailable, a per-step fallback timer keeps the visuals working. Leaving Page 6 clears timers and audio. The advisor uses `advisor-presenter.webp` for steps 1–3, with a subtle emphasis at the 10% moment, and `advisor-anniversary.webp` for steps 4–5, with a simple crossfade. The protection CTA appears after completion; its destination page is not built yet, so tapping it displays a coming-next status rather than pretending to navigate.

All ten supplied MP3 files decode cleanly as 44.1 kHz stereo MP3. Durations: pages 1–5 are 4.81, 6.90, 6.37, 10.14 and 8.83 seconds; Page 6 steps 1–5 are 8.57, 5.83, 5.25, 8.52 and 5.96 seconds. Voice content was not independently transcribed.
