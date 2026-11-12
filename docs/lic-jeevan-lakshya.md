# LIC Jeevan Lakshya integration — 10 November 2026

## Entry points and ownership

LIC → **Plans** opens the existing `lic/agent/` route. Both plan cards have separate Present and Calculate actions. Jeevan Lakshya runs natively at `lic/jeevan-lakshya/`; it is not a React route. Shared top-level navigation remains owned by `shared/navigation.js` and `site-nav.js`.

The working tree already contained the migrated Jeevan Lakshya folder and an edited Agent Tools page before this work. This integration completes those files. The initial implementation made no database migration or production customer write. Publication was subsequently authorised by the user.

## Evidence

- Official LIC [current endowment-plan listing](https://www.licindia.in/web/guest/endowment-plans): Plan 733, UIN 512N297V03.
- Official LIC [English brochure, 6 November 2025](https://licindia.in/documents/20121/1319704/LIC%2BJeevan%2BLakshya%2BSales%2BBrochure_Eng_06112025.pdf/fcc745f6-e73e-c825-d3a6-9831221c5cc9). Sections 1–2, 6–7 and the separate age-35 benefit illustration were checked.
- Supplied local brochure: `E:\Projects\Invincible\LIC\Jeevan Lakshya\LIC Jeevan Lakshya Sales Brochure_Eng_05.06.2025.pdf`. Relevant eligibility, benefit and premium-table pages were extracted and visually inspected. This older version has historical GST assumptions; those were not carried into the calculator. Its original file and asset directory were not modified.

## Financial corrections

`benefits.mjs` is the only calculation model used by both pages. Eligibility covers entry age 18–50, policy term 13–25, maturity age 31–65, PPT = term − 3, minimum BSA ₹2 lakh, and BSA increments of ₹10,000 through ₹4 lakh / ₹50,000 above it. The UI explains the brochure's last-birthday/nearer-birthday age bases; an LIC quotation must establish actual age and underwriting.

The sample table is transcribed exactly, without interpolation:

| Age | Term 13 / PPT 10 | Term 15 / PPT 12 | Term 20 / PPT 17 | Term 25 / PPT 22 |
| --- | ---: | ---: | ---: | ---: |
| 20 | 20,217 | 16,670 | 11,711 | 9,006 |
| 30 | 20,286 | 16,758 | 11,858 | 9,222 |
| 40 | 20,678 | 17,209 | 12,495 | 10,074 |
| 50 | 22,030 | 18,698 | Not eligible | Not eligible |

These are standard-life annual base premiums for ₹2 lakh BSA, excluding taxes, riders and underwriting extras. The separate age-35, term-25 illustration supplies ₹9,535. Every other combination displays **LIC quote required**. The migrated 18-year prices, age fallbacks, large-BSA scaling and fabricated monthly/quarterly/half-yearly premiums were removed. High-BSA and mode rebates prevent treating scaled samples as quotes.

For an in-force policy, survival contractual maturity is BSA. Future simple reversionary bonuses and FAB are separate, non-guaranteed amounts; declared reversionary bonuses vest on LIC's terms. User bonus assumptions default to zero, use the whole policy term rather than PPT, and are explicitly distinguished from LIC's 4%/8% investment-return illustrations. Simple bonuses are not compound interest. Guaranteed educational-goal completion, universal tax exemption, immediate pension and misleading FD/PPF/SIP comparisons were removed.

The death schedule assumes death just before the selected anniversary within that policy year. Premiums are shown at each policy year's beginning, capped at PPT; income is shown at anniversaries from the selected one through term − 1. The 110% BSA lump sum and any bonuses are due at maturity. Death in the final year has no annual-income instalment before maturity. Exact-anniversary timing is explained. Seven-times-annualised-premium and 105%-of-total-premiums-paid safeguards are shown for known premiums. Unknown-premium cases explicitly cannot establish these safeguards; the app does not invent an adjustment or its timing. Benefits assume all due premiums paid and remain subject to exclusions and policy terms; paid-up, lapse, surrender, loans and riders are outside this calculator.

## Exact file changes

| File | Change |
| --- | --- |
| `lic/index.html` | Renamed the visible Agent Tools shortcut to Plans; retained `agent/` and the other three workspace destinations. |
| `lic/agent/index.html` | Completed the migrated Jeevan Lakshya card, corrected its guarantee claim, titled the page Plans, and retained the existing Bima Platinum card markup and destinations. |
| `lic/jeevan-lakshya/benefits.mjs` | New shared eligibility, exact-premium, bonus, cash-flow and death-safeguard model. |
| `lic/jeevan-lakshya/calculator.html` | Replaced the inaccurate sales calculator with validated profile inputs, sourced samples, separate contractual/assumed amounts and an auditable annual cash-flow table. Corrected UIN. |
| `lic/jeevan-lakshya/plan.js` | Rebuilt calculator rendering, all eligible term selection, death slider bounds and summary synchronization; literal text rendering prevents injected HTML. Invalid inputs hide stale results while keeping inputs accessible. |
| `lic/jeevan-lakshya/detail.css` | Added responsive form/table layout, wrapping, focus indicators, error and hidden states. |
| `lic/jeevan-lakshya/index.html` | Corrected claims, labels, UIN, missing branding references and the ES-module loader; manual narration by default and inspector hidden by default. |
| `lic/jeevan-lakshya/presentation.js` | Uses shared model, disables ineligible terms, carries age/term/BSA/goal into the calculator, and repairs narration progression/cancellation and viewport handling. Gujarati narration uses a Gujarati voice when available, otherwise English copy. |
| `lic/jeevan-lakshya/presentation.css` | Repaired overlapping headline/audio/scene layers, responsive stage sizing, disabled controls, focus and reduced-motion behavior. Small/landscape screens scroll the scene body while navigation remains visible. |
| `tests/lic-jeevan-lakshya.mjs` | Five regression tests covering all 15 sourced premium samples, invalid profiles, bonus separation, full-term accrual, death timing/PPT cap and safeguards. |
| `tests/lic-jeevan-lakshya-browser.cjs` | Focused Chromium navigation, five-scene geometry, profile transfer, quote evidence, eligibility, invalid-input recovery, literal user text and narration cancellation checks. |
| `tests/lic-crm-browser.cjs` | Updated the hub navigation assertion from Agent Tools to Plans; all CRM behavior assertions retained. |
| `README.md` | Added the new plan entry points, calculator scope and this evidence guide. |
| `docs/code-review.md` | Recorded completed work, verification and remaining limits. |
| `docs/lic-jeevan-lakshya.md` | This implementation and verification record. |

The migrated `plan.css`, unused `visual.css` and all 14 image/logo assets are retained without content changes. The empty migrated audio folder contains no recordings; narration uses browser speech. No Bima Platinum product files, Firebase paths/rules, shared navigation registry, React source or generated deployment assets were changed. A full build regenerated equivalent assets; line-ending-only output changes were restored.

## Verification

- `npm test`: 209 passed across repository and Functions tests; two repository tests skipped, zero failures.
- `npm run build`: passed. `npm run check`: passed.
- `node --test tests/lic-jeevan-lakshya.mjs`: all five passed.
- `node tests/lic-jeevan-lakshya-browser.cjs`: passed at 320×480, 390×844, 844×390 and 1440×900, plus narration completion/stale-callback checks. Screenshots are in `.test-output/lic-jeevan-lakshya/`. No local missing resources or page errors occurred.
- Broader browser checks passed Garage/storage, shared navigation, dashboard/reminders, Orb, Task Copy, Creator, LIC Follow-ups, Journal notebook, Workday and account menu.
- Bima Platinum opening tests passed, including changing/mismatched phone viewport checks. Its full journey suite initially hit an audio-stage timeout under concurrent checks; a complete rerun passed all seven viewports, all stages, real audio endings, selection, replay, Back and geometry.
- The full browser command stopped at Journal's previously documented `Save journal idea` dialog timeout. Separate CRM and Cashier runs reproduced the previously documented loading failures at `#addCustomer:enabled` and `#entryPanel:visible`. The CRM test first required its expected shortcut label to be updated to Plans; that navigation step then passed before the existing loading timeout. No assertions were removed.
- The Firestore emulator attempt produced no completed rule/browser test results, and Java is unavailable locally. Emulator rule coverage remains unverified; no persistence or permission behavior was changed.

Real issued-policy quotations, physical-device Safari and production Firebase permissions are not established by these checks. This feature has no customer persistence or production backend changes. Publication follow-up: the integration was applied to the latest master in a separate checkout to preserve newer project updates. The release uses the existing Publish main site GitHub Pages workflow. The original checkout’s untracked scratch files are excluded. Deployment status is recorded in the release report.

Temporary extraction scripts, brochure page images and test logs remain untracked in the project `work/` directory. Automatic approval review rejected both the checked-directory cleanup and the explicit scratch-file deletion with “blocked by policy”; no deletion occurred. These files are not needed for publication. Browser screenshot evidence remains in the already ignored `.test-output/` directory.

## Proportional presentation revision — 10 November 2026

Compared Insure's src/app/plans/733/page.tsx and hero components with the native migration. Replaced the desktop phone simulator with a wide responsive story stage, preserved intrinsic artwork ratios, restored the daughter protection artwork, enlarged goal controls, corrected family/path stacking, and coordinated scene, path, family, meter and benefit entrances. Reduced-motion preference disables motion. Calculator and benefits model are unchanged.

Changed index.html, presentation.css and presentation.js. Focused five-scene Chromium suite passed at 320×480, 390×844, 844×390 and 1440×900 including profile transfer and narration cancellation; five benefit model tests and the site-reference check passed. Mobile and desktop artwork were visually inspected. Work is isolated in a fresh clone because workspace file creation returned ENOENT. No commit, push or publication.

Final verification: full npm test passed after installing the fresh checkout dependencies. Production build passed after React dependency installation completed; equivalent generated React output was restored to keep the visual revision scoped. Site-reference and diff-whitespace checks passed.

Mobile priority correction: the user confirmed this is a phone presentation. The canvas is now portrait at every viewport width (max 460px), with no wide desktop composition. Opening artwork uses the remaining stage height; the protection scene places the full child above compact benefit cards. Visually reviewed at 390×844. Existing small-screen scrolling remains available.

## Insure reference preview and visual restoration

Ran the original Insure Next app locally at /plans/733 in a 390×844 viewport. Walked through coin entrance, circular goal fan-out/capture, Get premium glass selector, premium/maturity pills, parent fade, grey path, lone child and benefit reveals. Replaced the previous card-led approximation with the original blue circuit backdrop, large gold coin, luminous path and full-stage family artwork. Restored circular animated goal choice/capture, floating blue glass, gold controls and a parent-to-child transition. A page-local selector overrides shared app-theme.css's forced-black stage without modifying shared styling. No original unverified amounts or guarantee claims were copied; benefits.mjs remains unchanged.

Changed presentation HTML/CSS/JS and the focused browser test for the new coin interaction. Tested original source separately; no original-source files edited except dependency installation. All destination edits remain in the existing temporary working copy; no publication.

Final reference-revision validation: production build, full automated tests (243 passed, 2 skipped), site-reference check and whitespace review passed. Focused browser checks passed four viewports plus real-motion goal capture, parent fade, grey path, replay, Escape and narration cancellation. Initial simultaneous build/browser run encountered missing generated assets during the build cleanup; sequential rerun passed. A transition assertion was corrected to wait for the child’s later entrance to finish.

## Mobile sequence restoration — click gates and timed layer changes

Re-ran the original Insure /plans/733 in a 390×844 mobile viewport and captured the actual sequence. Goal capture opens a confirmation, Get premium opens the age/term selector, Open shows premium immediately and maturity after 1500ms. The next arrow desaturates the goal/path; at 1200ms the pills leave and the question arrives, at 2000ms the child enters, and at 2200ms the family starts its 2500ms fade. The following click reveals reassurance immediately, premium cessation at +1000ms, annual income and path colour at +2000ms, maturity at +3000ms and goal colour at +3400ms.

The native mobile presentation now follows those gates and timings. There is no automatic navigation between story stages. Voice mode only narrates; it cannot advance the story. Controls wait for a transition to finish; Back, replay and page exit invalidate pending timers and goal capture animation. Returning through browser page cache restarts the current stage safely. Re-entering a stage replays its own reveal sequence. Initial state shows only the coin/scene, with profile and benefit panels absent. The profile form precedes premium display, and the full calculator receives the chosen age, term, BSA and goal. The exact-premium model and contractual/non-guaranteed separation remain intact. Default BSA is ₹2 lakh to match the source premium-table examples; larger sums require an LIC quote.

The legacy all-at-once journey table and protection card list were replaced with discrete premium, maturity, question, reassurance and benefit pills. The target remains the existing mobile native route; no new application or deployment route was created. Source files changed: index.html, presentation.js, presentation.css; regression coverage updated in tests/lic-jeevan-lakshya-browser.cjs.

Sequence verification: focused browser checks passed 320×480, 360×640, 390×844, 430×932 and 844×390 with clock-controlled assertions at each reveal boundary, click gating, back/replay cancellation and calculator profile transfer. Real-animation coverage passed goal capture, family fade, child entrance and colour restoration. Narration completion cannot advance any stage. Full automated tests passed (243 passed, 2 skipped), production build and site-reference checks passed. Scope remains five files in the isolated working copy; publication has not occurred.

## Rider-first automatic portrait journey — 10 November 2026

User clarified the intended scenario includes a term rider: rider payout first, then cessation of future base premiums, then annual income of 10% BSA, then maturity. The presentation now expressly labels that scenario and uses an illustrative rider cover equal to the selected BSA. It does not quote a rider premium or reuse the source's unverified rider-rate table. The displayed annual premium remains the base-policy sample, with the rider premium explicitly requiring an LIC quote.

Source check: LIC's official [Jeevan Lakshya brochure, 5 June 2025](https://licindia.in/documents/20121/1319704/LIC%2BJeevan%2BLakshya%2BSales%2BBrochure_Eng_05.06.2025.pdf/55923a7d-2a74-7490-7d5d-d6d7b6a9cb11) identifies New Term Assurance Rider UIN 512B210V02 as optional at inception, and its separate Term Rider Sum Assured on Death benefit. The [official policy document, Part C](https://www.licindia.in/documents/20121/1243952/Policy%2BDocument_LIC%27s%2BJeevan%2BLakshya_CC.pdf/3ffb63fb-10df-e2b1-7719-6283c1d06d41?t=1728050064693) establishes base annual income from the anniversary coinciding with/following death to the anniversary before maturity, and 110% BSA at maturity plus bonuses if any. A rider cover illustration is distinct from a settled claim: actual rider terms, safeguards and exclusions apply. Base safeguards remain owned by the full calculator. No extra premiums, immediate base-policy BSA lump sum, refund of paid premiums or guaranteed future bonuses were invented.

Compared the existing Bima Platinum automatic-journey code: timed fallback, pause/resume remaining time, replay and visible-tab handling. After the user's profile confirmation, premium/maturity now leads automatically to the what-if transition at 6.5s, then to the protection path after 7.2s. Four ordered benefit milestones advance every 4.8s and hold at the final maturity destination. Next benefit can move ahead manually; Pause/Resume preserves remaining time and pauses animations. Hiding the tab pauses. Back cancels pending callbacks. Replay benefits starts at the rider. The previous voice-mode toggle is now the automatic-journey control; the separate advisor voice button remains optional.

The stage is constrained to 9:16 portrait. Current cards are highlighted, completed cards shrink, a glowing marker follows the actual SVG route, and the main path regains gold at the income step. At maturity, the large goal image hands off into a small goal thumbnail in the maturity card so it does not sit obscured behind text. Reviewed each movement visually at 405×720 and all four milestones at 360×640.

Final verification: four 9:16 phone sizes (320×568, 360×640, 405×720, 450×800) passed bounds and ordered automatic milestones, reading holds, pause/resume remaining time, replay, manual Next benefit, Back cancellation and calculator transfer. Real-animation playback passed automatic stage changes, parent fade, child entrance, route progress and colour restoration. Full tests passed (243 passed, 2 skipped), production build, site-reference and whitespace checks passed. Equivalent generated React changes were restored; only presentation, browser coverage and documentation are changed. All work remains local in the isolated working copy; no publication.

## Persistent goal coin at maturity — 10 November 2026

User rejected the prior thumbnail handoff. Removed that handoff and the final opacity fade. The same mounted goal image remains in its anchored position throughout the what-if and protection journey, stays grey for rider/premium/income steps, restores colour at maturity and remains visible at the endpoint. The maturity badge is positioned to the right of the visible goal image using shared measured coordinates; it does not displace or replace the coin. The preview maturity pill uses the same side-by-side placement. The badge clears the lower income card.

Trimmed repeated presentation wording, shortened the protection heading and removed its explanatory subtitle. Kept rider separation, eligible-anniversary income timing and non-guaranteed bonus wording. Narrow maturity badges use exact lakh formatting (₹22 lakh = ₹22,00,000), with the full rupee amount retained in the accessible label. A 320×568 marriage-goal / ₹20 lakh BSA check found the original long number clipped; lakh formatting fixed that without reducing or moving the coin. Wider marriage artwork receives extra horizontal clearance. Viewport and font-load changes recalculate the badge position.

Reviewed premium, rider, premium cessation, annual income and final maturity states in 405×720 portrait, plus the widest goal and largest amount at 320×568. Added regression assertions that the coin bounds remain identical through all four benefit steps, its greyscale lasts until maturity, its opacity stays 1, no thumbnail exists, and the maturity badge clears both coin and income card. Existing automatic progression, Pause, Next benefit, replay and model behavior are retained.

Final persistent-coin verification passed: all four 9:16 sizes, unchanged coin coordinates and opacity, grey-until-maturity behavior, no replacement thumbnail, coin/badge/income separation, and the extra 320×568 marriage-goal/₹22 lakh display check. Real automatic choreography, Pause/Resume, replay, Back and calculator transfer passed. Full tests passed (243 passed, 2 skipped), production build, site references and whitespace review passed. Equivalent React build changes restored; no publication.

## Opening and coin continuity polish — 10 November 2026

User identified the opening prompt arriving before the scene and abrupt coin placement. Root causes: duplicated early instruction copy; independent opening and persistent-coin elements; scene-content positioning that moved when header/footer height changed; and capture scaling around its centre, which shifted the flyer's actual landing before removal.

Moved one shared goalCoin/storyGoal image anchor into the persistent stage layer. The same image DOM node now survives opening, capture, confirmation, profile, preview, death and maturity. The anchor remains at the same centre; selection eases from the larger opening size into the presentation size over 900ms. Visible PNG artwork centres and scale are normalized from their intrinsic transparent bounds, so gold and all three goal images share the same visible centre. Capture targets the normalized destination and scales from the top-left, removing the final snap. Prompt stays hidden through fan-out/capture.

Artwork decode completes before the opening begins. The family enters, the path follows at +650ms, the coin enters at +1300ms, and the tap cue and coin interaction become available only at +2600ms, after settlement. Reduced-motion mode skips movement and readiness delay. Opening replay resets the sequence; returning to goal choice keeps the selected artwork ready. The prompt appears only once, in a small readable pill below the coin.

Reserved headline space keeps stage layout stable. Confirmation/profile transitions use a 180ms exit and eased card entry; coin capture and the preview-to-what-if choreography preserve continuous layers. Benefit descriptions collapse smoothly before the next pill enters; Next benefit is briefly held during the 1.1s movement. Goal choices fan out without colliding with the coin. Advisor audio is a labelled icon in the eyebrow row, clear of the entrance; the coin hit target follows its visible circle rather than intercepting clicks across transparent PNG margins.

Added checks for artwork readiness and delayed cue, disabled early interaction, hidden capture cue, top-left capture origin, identical visible centre before/after selection, and identity of the one persistent image across stages. Existing portrait, rider, maturity, auto/pause/replay/cancellation and calculator checks remain.

Final polish verification passed: four portrait sizes, wide-goal/highest-amount edge, artwork/2.6s cue gating, capture origin, identical visible centres, single persistent image identity, and real automatic choreography. Watched the 360×640 entrance from its first 300ms through cue readiness, capture, profile, preview, death and final maturity. Full tests passed (243 passed, 2 skipped), production build passed. No publication.

## Publication — 10 November 2026

User authorised publication. Applied the scoped five-file presentation revision onto current master b5ecc84, preserving newer site work. Release verification on the combined tree: 249 automated tests passed, two skipped, no failures; site-reference check passed (532 files); all four portrait sizes, widest-goal/highest-amount edge, delayed cue, single-coin continuity, capture landing, automatic choreography and calculator transfer passed. The earlier production build passed; no React source changed during integration. Publish through the existing Publish main site GitHub Pages workflow. Scratch logs and patches are untracked and excluded from publication.


## Narrated mobile story — 10 November 2026

The initial illustrated scene presents the three goals with a Start with voice control to unlock mobile playback. There is no separate future-planning introduction page. After Start, the goals appear, merge behind the Jeevan Lakshya coin, and fan out for selection after the plan explanation. Selecting a goal plays its own acknowledgement and then opens age, policy term and Basic Sum Assured. The profile waits for See my plan. Premium, survival maturity, the parent-death transition and the four protection milestones unfold in order. Reduced motion opens the goal decision directly.

Fourteen separate Hindi-English recordings are generated using the signed-in Creator Studio Google Gemini Flash TTS workflow, Kore, hi-IN, Empathetic, normal directed pace. Hindi uses Devanagari and English terms retain English spelling. Separate voice directions emphasise goals and premium terms; the death transition uses a gentler respectful direction. Exact scripts, recording provenance and measured clip-relative durations are retained in audio/manifest.json. The original MP3 files are unchanged. No dynamic money amount is spoken; the on-screen profile supplies it.

One persistent media element owns narration. Actual ended events advance exposition with a short breathing gap; goal and profile decisions wait for the viewer. Pause/resume controls both the audio and visual timeline. Mute keeps progression. Back, Skip intro, replay, manual Next and leaving the page cancel the previous clip and pending advancement. Hidden tabs pause. Playback failure falls back to visual reading holds without synthesising or charging again.

The same normalised goal coin persists throughout. Its visible centre and the path arrow tip use one shared portrait anchor. The path asset tip is (268,55) on the 500×500 source; the coin is sized to the mobile canvas and clears the family heads. Its colour stays grey during the death journey until maturity, then returns and holds. The maturity badge remains to its right.

Validation is recorded below after the complete playback check. Automated decoding/timing checks cannot establish subjective voice quality or pronunciation; a listening review remains required. Physical iPhone/Safari playback is not established by Chromium tests.

Verification: the four portrait sizes (320×568, 360×640, 405×720, 450×800), widest marriage coin/largest amount, full fallback progression, single-coin capture and actual-motion route checks passed. A separate real-media browser check decoded all 14 MP3s against measured duration and verified actual media-ended progression, waits for decisions, pause/resume, mute, Back cancellation and the final hold. Seeking accelerated that test; it was not a listening review. The full repository tests passed (249 passed, 2 skipped); production build and site-reference check passed. Goal-choice space now hides the family artwork during the interactive opening and brings it back after selection, avoiding coins over faces.
### Social narration and four-goal opening (11 November 2026)

The presentation starts on entry from the LIC Plans card. The opening narration begins over the family illustration. The arrow rises behind the family, then four coins spread from the Plan 733 coin while the line continues. The family fades during the spread to keep the options clear. Education, Career, Marriage and Other Goal return as selectable options after the plan explanation. Other Goal has its own narration and carries its label through to the calculator.

Creator Studio recorded all 15 clips using the female Hindi-English Kore voice, Social delivery and the 1.2× directed pace setting. The audio manifest records each clip's text, duration and checksum. The story follows the end of each recording. When a browser blocks autoplay with sound, the opening still runs on its visual timeline. The existing sound control can restart the opening with narration while the intro is in progress.

Verification covers the real plan-card entry in Chromium, all 15 decoded recordings, playback and interruption, the autoplay-blocked opening, four portrait sizes, the goal capture and the maturity layout. Physical iPhone playback and subjective pronunciation were not independently verified.

### Rider and maturity pitch (11 November 2026)

The illustrated scenario includes the Term Rider. The spoken payout starts with the in-force policy condition and the premiums-stop step follows it. Both maturity cards and recordings say “declared bonuses.” The numbered notes explain the in-force rider condition and LIC bonus declarations, including that Final Additional Bonus applies if declared. The benefit calculation and base-plan calculator use the same amounts as before.

The presentation plays each finished recording at 1.2× with pitch preservation enabled. This playback rate is separate from the Voiceover Studio pace setting. Scene changes still follow the end of each clip, including after pause and resume.

The four goal coins now spread once into a staggered row and hold those positions through the plan narration and goal selection. The father and daughter remain visible during the opening and planning scenes and fade during the death scenario.

The opening recording includes the full “करते हैं” ending with a short silent tail. The choice cue is “Please, अपना goal चुनिए।” Both clips use the existing Social voice.

The goal selection and profile instructions now play at 1.4×. The narrator applies each cue’s rate when playback starts or resumes, and advances on the media end event.

### Closing scene (11 November 2026)

After the family maturity step, Continue opens the closing scene with the same goal coin and gold path. The approved Hindi-English narration plays in the existing Kore voice at 1.2×. The on-screen words follow the closing phrases, and View plan details appears after playback finishes or the visual fallback completes. The closing scene can be replayed, and Back returns to the maturity step.

### Portrait story polish

The profile fields are highlighted in the order named by the narration. The premium payment animates before the annual amount appears. In the normal maturity beat, a gold pulse runs to the goal coin, then the amount appears. The approved line appears as a caption with a five-second fallback hold. The former survival wording is no longer played. The family benefits use individual icons and compact markers. The closing pairs the planning phrase with a calendar and the LIC phrase with a shield.

### Opening chime and Aoede narration

The arrow starts with a short chime, then the 733 coin and the four goal coins appear before the opening speech. The same order runs when autoplay is blocked. Creator Studio exported the goal and profile prompts and the normal-maturity line in Gemini Aoede with Social delivery at the 1.40x directed setting. The presentation plays those three clips at 1.40x and advances from normal maturity on the recording end. The family maturity clip is separate.

### Unified narration

The 16 main recordings now use Gemini 2.5 Pro Aoede with Social delivery. Gemini Charon voices the one normal-maturity question before Aoede answers. All speech uses the 1.2x Studio pace setting and 1.2x playback, with the opening chime at its original pitch and playback rate. The opening voice is cued 2 seconds into the opening timeline, after the path and goal reveal begin. The closing calendar and shield are timed to the new recording.
