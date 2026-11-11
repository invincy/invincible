# Native portfolio draft — 11 November 2026

The existing `/invincible/portfolio.html` now opens a lazy-loaded React page within the shared shell and auth. Apps Script is no longer a navigation destination or data source. This is an undeployed initial implementation, not the complete live-pricing product.

## Implemented

- Responsive desktop holdings grid and mobile holding cards; All / Equity / Mutual funds filters, search, summary, valuation / unrealised gain charts from saved snapshots.
- Browser-side, lazy-loaded ExcelJS Kite XLSX import, 5 MB limit, required Equity sheet, review before replacement. ISIN keys prevent duplicates. Available + margin-pledged + loan-pledged quantities determine units. Long-term quantity is a classification, not additional units. Source P/L reconciles exact cost despite rounded average price. Discrepant quantities and mismatched totals block imports. Mutual funds remain untouched by equity imports. An absent holding is not an inferred sale.
- Manual fund units/cost/NAV and stock price corrections, explicit dates, buy/sell events, weighted-average-cost realised P/L (not a tax/FIFO report), pledged-sale guard, sale-price versus last saved quote counterfactual. Dividends, fees, splits and reinvested proceeds are not modelled automatically.
- SIP schedules and idempotent instalment IDs. Month-end dates clamp to the last calendar day. On opening the portfolio, a due SIP creates estimated units only if the holding's available NAV has that exact date; otherwise it remains pending. No unattended scheduler, price-fetch service or guaranteed allotment calculation is claimed. Estimated records are labelled. Correct total holdings from the actual statement later; do not add that allotment a second time.
- Firebase owner-scoped state and operation history, optimistic revision conflict rejection, failed-save form retention, account-switch remount, JSON export and undo of the latest saved state. History documents retain previous state. Current document capped at 700 KB; snapshots capped at 730 days. Archive/collection migration will be needed for larger portfolios/history.
- Current-month Finance reads the shared portfolio. For each populated asset class its calculated value replaces manual accounts in that category in the displayed totals, investment lists and current-month graph point. Manual records are preserved; other categories and historical months remain unchanged. Do not treat monthly scheduled SIPs as cash already debited.

## Still required

- Live quote and NAV services, exchange holiday rules, and unattended refresh/SIP processing.
- Nifty 50 TRI benchmark with matching contribution dates and cash-flow-adjusted returns. Equity Analysis now offers a price-only Nifty 50 comparison.
- Mutual fund starting units or detailed statement. Uploaded screenshots show summaries and schedules, not enough to seed units correctly. No user holdings or screenshots are committed to this public repo.
- Screenshot extraction/review and general mutual fund statement imports. Current XLSX importer is specifically Kite Equity; fund details are manual. Export restore/import is not implemented.
- Historical trades for accurate long-term performance, corporate actions, fees, dividends, full transaction correction/reversal UI and capital-gains accounting.
- Production sign-in/read/write verification, browser visual/accessibility verification and deployed rules validation. No live account data was changed.

## Verification

The private Kite export reconciled to the statement totals. It was read outside the repository and not retained in source/test fixtures.

Focused tests cover invalid numbers, pledged import quantities, total reconciliation, replacement/deduplication, sale cost, sale retry, overselling/pledge guards, date-matched estimated SIPs, month-end dates, Finance category deduplication and native navigation. Browser fixture tests cover 1440/390/320 widths, denied-save draft retention and sale recording, but could not execute here: Chromium fails at startup because the environment denies its process-singleton socket. No visual pass is claimed.

Build and site-reference checks passed. Full automated suite: 239 root passes, two existing skips, 15 Functions passes, five media passes. Final focused model/navigation run: 10 passes.

## Mobile import dialog correction — 11 November 2026

Raised the Portfolio overlay above the shell navigation and floating controls.
Import review uses a bounded flex column: summary and Confirm import stay visible,
while the holdings list shrinks and scrolls. Dialog height includes device safe
areas and short phone viewports; other portfolio forms retain scrolling.

Validation: production build and site-reference check pass; 240 root tests pass
(two skipped), and 15 Functions tests pass. The existing browser fixture cannot
launch Chromium in this environment (process-singleton socket denied), so a
mobile visual pass is not claimed. The production page was inspected and requires
Google sign-in in the available browser. No private holdings were saved or seeded,
and no personal financial data is included in public source. Data population
remains blocked on an authenticated account session; fund units are still missing
from the previously supplied summary screenshots.

## Compact Portfolio and removal confirmation

The mobile overview shows four holding cards in a two-by-two grid with an option to expand the list. The forest-green canvas uses translucent green surfaces and divider rows for the chart, SIPs, and sales.
Search works across the full list. Monthly SIP details expand on tap. Desktop
keeps a holdings table and SIP sidebar. A holding opens a keyboard-accessible
dialog with its price or NAV, date, units, and actions. A chart without history
shows a blank grid.

Removing a SIP or undoing a change requires confirmation. Browser fixtures
verify cancellation and removal, Escape and outside-click dismissal, the
320/390/1440 pixel layouts, failed-save recovery and trade recording. The
production build, site checks and automated tests passed in the local checkout.

## Equity price analysis

The Equity tab loads daily closes for saved equity ISINs and Nifty 50 through
the Upstox historical candle endpoint. Requests contain instrument identifiers
and dates. Account identifiers, units, costs, and results stay in the app.
Market prices are held in memory for the signed-in page session and never
written to holdings, valuations, Finance, or the public repository.

The chart reconstructs today's basket with fixed units. It uses common trading
dates and a common start and end close for the price change, rupee contribution,
and optional price-index benchmark. It excludes cash flows and dividends.
Holdings without comparable closes or with a price discontinuity above 35%
are flagged and excluded for that range. Provider close data does not verify
every corporate action, and the chart does not reconstruct historical account
balances. The All assets view prioritizes the two largest saved equity gains
and two largest saved equity losses by rupee P&L. The Mutual funds tab has no
price chart.

Browser fixtures exercise range switching, price-chart controls, a missing
history case, contribution filtering, and the Mutual funds view. Model tests
cover calendar boundaries, aligned dates, exclusions, contribution, and front
card ordering.
