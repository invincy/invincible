# LIC Agent CRM — direct Firestore architecture

The Agent CRM is an additive native module at `lic/crm/agent.html`, reached from
LIC beside the independent My Follow-ups module. It uses LIC blue/yellow accents
on black. Existing private customer records and staff/client follow-ups keep their
routes, storage and histories. Journal files are unchanged in the CRM release.

## Authentication and persistence

CRM imports `observeAuth`, `auth` and `db` from the existing shared Firebase client.
It restores the existing Google session and never creates another sign-in flow.
The browser talks directly to Firestore through its existing Web SDK. Cloud
Functions, an Admin SDK, a scheduler and background processing are not required.
The CRM-specific callable and scheduler exports/files were removed; unrelated
existing Invincible AI Functions are preserved.

`client.js` connects the existing Firebase user/database to `firestore-driver.mjs`.
`operations.mjs` contains browser-side CRM validation and transactions. Those client
checks improve diagnostics; **deployed Firestore Security Rules are the authority**
for access, roles, invitations, allowed mutations and immutable history.

## Data model

Personal workspaces live under `users/{uid}/licAgentCrmWorkspaces/{personalId}`
and reuse the existing owner-only access policy. Shared workspaces live under
`licCrmWorkspaces/{workspaceId}`. Both store owner UID, role map, member UID list,
profiles, personal/shared mode, settings and a write revision. Subcollections:

- `agencies`, `customers`, `policies`, `households`, `followups`
- `imports` with immutable `reports` documents
- policy `history` and `receipts`, follow-up `history`
- `communications`, `communicationGuards`, `posterTemplates`, `audit`

Policies use insurer + string policy number as their workspace-scoped identity.
Customer links and households are independent IDs, never name-based merges.
Original agency attribution remains separate from servicing responsibility.

`licCrmInvitations/{workspaceId}:{lowercaseEmail}` stores an explicit invitation.
Only the owner and the verified invited email can read it. Acceptance atomically
changes only that user's membership/profile and marks the invitation accepted.
Rules reject expired/unverified/wrong-account acceptance and role escalation.
Revoked users cannot reuse an accepted invitation. Workspace lists query the
member UID list; user-owned index documents do not grant workspace access.

The adapter stamps each write with the authenticated UID and server timestamp.
Every workspace mutation bumps a root write revision. Query-based merge/split
operations read that root before querying, re-read matching documents inside the
transaction and retry if concurrent mutations change the root. Shared-workspace rules require the
same revision advance for all ordinary child writes. Shared history and source
reports are append-only; rollback metadata is owner-only. Personal workspaces keep
the existing owner-only policy; their application transactions preserve history. A separate receipt records
reapplication after rollback so the previous import history is retained.

## Dues and communication — revised scope

Dues are derived from stored policy data **when the page opens and when returning
to it**. While open, normal rendering uses the current India date. No scheduled
job runs when the app is closed. No automatic messages or push notifications run.
A workspace listener clears sensitive UI when access is revoked.

`domain.mjs` anchors monthly/quarterly/half-yearly/yearly installments to DOC,
PPT, final due and FUP. Terminal/non-premium-paying and unknown statuses do not
produce ordinary renewals. `due-alerts.mjs` derives a deduplicated due/verification
view without database writes. An expected installment is not proof of non-payment;
only explicit evidence sets Confirmed paid. New FUP values never silently mark
past installments paid. Display windows currently cover the past/next year.

WhatsApp messages remain editable/manual, with distinct Prepared, Opened and
Manually marked sent states. Opening a link is not delivery evidence. Canvas
posters support square/portrait, branding, masking, PNG export and saved templates.

## Parsing

The attached Print v12 is the reference. Deterministic report/header boundaries
preserve all source text. FUP, Last Due and Last A/C Date remain separate. EDBA
maps to DAB Yes while retaining the code; absence stays Unknown. MAT-CL-PAID
suppresses renewal projections despite the printed maturity period. Claims retain
gross, deductions, net and dates. Full PAN/banking details are not extracted.
Unsupported positive-loan layouts warn and retain the original source for review.

## Deployment

Publish the static source through the existing GitHub Pages workflow. **No CRM
Cloud Functions deployment, scheduler, new OAuth flow or server billing setup is
needed.** Personal CRM uses the existing owner-only `users/{uid}` rules and can
be published without changing Firebase configuration. Shared workspace creation
is disabled when the new shared paths are denied. Apply `firestore.rules` once to
the existing Firebase project to enable secure collaboration. This is database
access configuration, not custom server code. Existing user/Creator/Workday rules
remain. No production rules have been applied by this change. Never weaken access
rules to make sharing work.

## Verification and limits

Pure domain/repository tests cover the real Print via an external private fixture,
imports, protected fields, deduplication, rollback/reapplication, customer links,
merge/split, households, roles, invitation validation, consent, communication
states, follow-up history and side-effect-free opening-time dues.

`tests/lic-crm-rules.cjs` exercises the actual Firebase Web SDK, transactions and
rules in a demo Firestore emulator, including forged direct writes, verified email,
viewer/editor restrictions and revocation. It also loads the original owner-only
rules and verifies that private CRM works while sharing stays disabled. The Agent
CRM browser test uses that same SDK/emulator with the original rules, with reload persistence, routes,
colors and 320–1440px layouts. Run `npm run test:crm:browser` after React dependencies
and Chromium are available. CI runs these tests; local emulator installation was
blocked in this environment. Record actual CI outcomes in the PR before release.

Existing data is not automatically migrated. Lists cap at 1,000 with a truncation
notice; timelines are bounded. Export is structured core data rather than complete
backup/restore. Regional contact fields, rich branding/logos, expanded positive-loan
formats and operational backups remain follow-up work. Deletion runs while the
page is open and can be resumed if interrupted. Physical devices and signed-in
production rules still require verification. No original private report is in Git.
