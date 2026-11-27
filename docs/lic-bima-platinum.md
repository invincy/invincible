# Bima Platinum custom selections

Updated November 27, 2026. The existing presentation at `lic/bima-platinum/`
and calculator at `lic/bima-platinum/calculator.html` share `benefits.js`,
`premium-rates.js` and `profile.js`. No Firebase/customer data is read or saved.

## Source and financial rules

The owner supplied the 408-page **plan 770-LIC_s Bima Platinum.pdf**, SHA-256
`c1274ec81b4d935f62ed904163c7ba712badc4c0c9a4464af6e20395ef150cb1`.
PDF pages 127-135 contain 3,603 base annual premium rates per Rs.1,000 Basic
Sum Assured. `scripts/extract-bima-rates.py <pdf>` regenerates the checked-in
data with PyMuPDF, preserves tables across page breaks, stops before Class I
extras, and checks every eligible cell. The full PDF is not published.

Rules were cross-checked against the [official LIC brochure](https://licindia.in/documents/20121/1860176/LIC%2BBima%2Bplatinum%2BSales%2Bbrochure.pdf/ae9590c9-2c2d-6dca-c180-5bbb3f956dab?t=1788330413553)
sections 2-4 and 8-10, and the [official policy](https://licindia.in/documents/20121/1860176/Final_Policy%2BDocument%2BLIC%27s%2BBima%2BPlatinum.pdf/9235a4a2-d3c7-0c4c-72e2-6c6f05c22603?t=1788330356571).
The supplied manual pages 5, 15-21 and 106-108 additionally cover modes,
CIS incentives, existing-policyholder eligibility and benefit timing.

- Age/PPT ranges: 11-55/7, 8-55/10, 6-53/12, 3-50/15, 30 days-47/18.
  Age 0 means under one year and at least 30 days. The selector is an entry-age
  illustration, not a date-of-birth underwriting check.
- Term: PPT+10 through 40, constrained by maturity ages 28-75. Invalid PPT/term
  options are removed when age/PPT changes; the nearest valid term is retained.
- BSA starts at Rs.3 lakh, in multiples of Rs.10,000. Premium uses the exact
  table cell times BSA/1,000, rounded to the nearest rupee. No interpolation.
- Mode factors: yearly 1, half-yearly .509, quarterly .2568, monthly .0861.
  Instalments round to the nearest rupee. Total outgo uses actual instalments
  times frequency and PPT, not a monthly equivalent of yearly premium.
- GA uses annualized premium **without modal loading** times the applicable
  rate/1,000 times PPT*(PPT+1)/2. Base rate is 70; high-BSA, eligible online/CIS
  and eligible existing-policyholder incentives are additive. There is no
  high-BSA premium rebate. Direct online is unavailable for minor lives.
- Regular income is 10% BSA at the end of PPT through the anniversary before
  maturity. Booster is 70% BSA at PPT+5. Maturity is BSA plus accrued GA.
- Life cover displays Sum Assured on Death = max(BSA, 11*annualized premium),
  with accrued GA additional. This is not a final claim quotation: the policy
  also applies 105% premiums-paid and surrender-value floors, commencement of
  risk for minors, deductions and exclusions. No invented surrender value is
  displayed. Full scheduled benefits assume survival and all premiums paid.
- Agent, direct-online and CIS illustrations are supported. POSP restrictions,
  optional rider premiums, underwriting extras and income deferral are outside
  this calculator. Actual issuance/rounding and eligibility require LIC's quote.

Independent anchors: all 20 brochure sample premiums match. The manual's
age-35/term-40/PPT-7/BSA-20-lakh example gives yearly Rs.611,900 and half-yearly
Rs.311,457. Age 25/PPT 15/term 30/BSA 5 lakh gives yearly Rs.53,700, monthly
Rs.4,624, agent-channel base+high-SA GA Rs.489,744 and maturity Rs.989,744.
With direct-online and eligible-existing incentives, GA is Rs.642,789 and
maturity Rs.1,142,789. Modal loading never inflates GA or Sum Assured on Death.

## Interaction and preserved behavior

Page 4 contains the only presentation selectors. It waits for explicit
confirmation after narration so the customer can finish choosing. Invalid
cover clears the premium preview, hides the calculator link and blocks Next.
Page 5 has no duplicate controls; Back preserves every choice. Calculator and
presentation links carry the profile in URL parameters; invalid incoming
profiles fall back to the labelled defaults. No personal identifiers are used.

English field labels and Hinglish supporting copy match the existing narration.
The five supplied recordings, one-player reuse, pause/resume, manual stages,
replay and progressive timeline remain. Additions stay inside the premium
period; premium arrows point down and income arrows up. The path remains
symbolic, not an account balance. Selected mode changes displayed instalments;
the graph still marks the premium period in policy years.

The standalone calculator's old fixed-policy options, comparison and unrelated
affordability illustrations are replaced with the same custom profile, live
rupee amounts, expandable life-cover details and a year-by-year payout table.
Page 6 now explains optional booster deferral after completion of the five-stage
journey. Its receive/grow cards use the carried selection, without new profile
controls. The graph progresses from the due date to maturity; the illustrated
amount is **only the deferred booster**, separate from regular income and base
maturity. Back restores completed maturity; the journey can still replay.

`boosterProjection` requires an explicit assumed rate and accumulates only from
the booster due date, for completed months. The page uses 5.78% annual effective
interest as a **dated reference assumption**: LIC policy Part D clause 10 gives
that rate for benefits due May 1, 2026-April 30, 2027. The selected new policy's
future booster rate is unknown. Visible copy says the output is an example and
the future rate is not yet determined. Details explain the five-year semi-annual
G-Sec yield minus one percentage point, the rate lock for each deferred benefit,
written request three months before due date, no outstanding loan, withdrawal
of the entire accumulated booster and possible loan effects.

The new page uses browser-provided Hindi speech when available, with visible
Device voice status. It does not pretend to have a new recorded MP3. Narration
chunks drive due/growth/final phases; pause/resume and stale-event cancellation
are implemented. With no device voice the timed animation still completes and
pauses correctly. Hiding the tab pauses; Back/pagehide cancels callbacks and
speech. Existing five recorded journey clips and the unlocked player remain.
Actual platform voice quality and pronunciations have not been verified.

## Verification

Focused commands:

```
node --test tests/lic-bima-benefits.mjs tests/lic-presentation.mjs
node tests/lic-bima-custom-browser.cjs
node tests/lic-booster-browser.cjs
node tests/lic-opening-browser.cjs
node tests/lic-business-events-browser.cjs
node tests/lic-journey-browser.cjs
```

The existing LIC CI job includes the new model and custom-profile checks.
Screenshots are saved under `.test-output/lic-bima-custom`,
`.test-output/lic-booster` and `.test-output/lic-journey` and uploaded by CI. Custom checks cover invalid
inputs/no stale results, high-SA/channel/existing incentives, all displayed
benefits, valid combinations, payment modes, both cross-links and Back.
Responsive checks cover 320x480, 360x640, 390x844, 430x932, 844x390 and 1440x900;
the real-audio journey also covers 320x568. Local custom screenshots block
external Google Fonts for deterministic fallback-font rendering.

Production issuance, physical-device Safari/iOS, DOB underwriting and a real
LIC issued quote are unverified. Local check results and publication are
recorded in the accompanying PR and `docs/code-review.md`.


## Full official illustration comparison, November 27

The official brochure section 22 (printed/PDF pp.34-36) has one complete
25-year standard-life illustration: age 35, BSA Rs.10 lakh, PPT 12, term 25,
offline/yearly, no existing-policyholder incentive. The full table is preserved
as independent numeric expectations in `tests/fixtures/lic-bima-illustration.json`.
Every one of its 25 rows matches the model for cumulative annualized premiums,
regular income, booster, cumulative GA and maturity. The illustrated death
benefit also matches death SA plus that year's accrued GA throughout this
specific example; this does not calculate arbitrary surrender-value floors.
The illustration's non-guaranteed GSV/SSV columns are outside the calculator.

| Amount | Official illustration | Shared model |
| --- | ---: | ---: |
| Yearly premium | 146,650 | 146,650 |
| Sum Assured on Death at inception | 1,613,150 | 1,613,150 |
| Total premiums | 1,759,800 | 1,759,800 |
| Annual income, year 12 end through 24 | 100,000 | 100,000 |
| Booster, year 17 end | 700,000 | 700,000 |
| Guaranteed Additions after PPT | 915,096 | 915,096 |
| Maturity, year 25 | 1,915,096 | 1,915,096 |

These checks supplement the 20 independent annual-premium samples and the
rate-book worked example already tested. They establish agreement for those
illustrated inputs, not underwriting approval for every custom profile.
