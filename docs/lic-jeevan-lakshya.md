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
