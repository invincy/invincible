# LIC Agent CRM implementation

## Architecture and rollout

The existing native CRM, `users/{uid}/licCustomers` records, shared Google session,
staff follow-ups and Firebase project remain in place. Agent CRM is an additive
native workspace at `lic/crm/agent.html`, linked from the existing CRM. There is
no new login, backend provider or automatic conversion of legacy customer data.

Phases: A inspect report/auth/storage; B workspace/agency/permissions; C separate
customer/policy/household identities; D deterministic preview/import/history;
E projected schedules and scheduled alerts; F manual WhatsApp and poster studio;
G compact dashboard, filters and verification. Completion and limitations are
recorded below after validation.

## Additive Firestore schema

`licCrmWorkspaces/{workspaceId}` stores owner UID, member UID → role, name and
personal/shared mode. Its subcollections are `agencies`, `customers`, `policies`,
`households`, `imports`, `followups`, `communications`, `alerts` and `audit`.
Policies are keyed by insurer + normalized string number within each workspace.
Customer IDs are independent random IDs; policy customerId can be null. Household
membership is explicit on customers, with relationship text. Imported policy
fields retain provenance and manual verification markers. Import `reports`
subdocuments preserve source text; policy `history` subdocuments preserve changes.
`users/{uid}/licWorkspaceLinks` is an index, never an authorization source.
`licCrmInvitations` uses hashed email/workspace keys and binds acceptance to the
verified email in the existing Firebase ID token. No invitation email is sent.

All workspace reads and writes pass through the authenticated `licAgentCrm`
callable. Direct Firestore access to these new paths is denied by default.
Every transaction reads current membership; viewers cannot mutate, editors cannot
manage members. Removal revokes subsequent server access. Existing rules and paths
are not broadened. No private sample data is checked into this public repository.

## Parsing decisions from attached Print

Format version 12: split only at STATUS REPORT OF POLICY-NO headings. Columns
PL/T/PPT/Accpr, Sum Assd, Mode, Inst-prm and Status are parsed together; EDBA
remains a raw rider code and maps to DAB Yes. Absence means Unknown. DOC is a
full date; maturity, Last Due and FUP are month/year periods. Last A/C Dt is a
separate full accounting date and never proves installment payment. MAT-CL-PAID
blocks renewal schedules even when the printed maturity period appears later.
Claims remain transactions with gross/deductions/net; no full PAN is retained.
Unsupported loan layouts are retained in the source and explicitly warned about.

## Deployment and operational requirements

Deploy the existing Firebase Functions package (including the new callable and
scheduled reminder function) to the existing project. Scheduled execution requires
the project's billing/Scheduler support. The frontend must remain on the existing
origin to reuse Google authentication. No API key or new OAuth setup is required.
Production permissions need an actual signed-in verification; synthetic tests
cannot establish deployed access. Push notifications and provider-confirmed
WhatsApp delivery are not configured.

## Implemented in this change

- Personal/shared workspaces and explicit verified-email invitation acceptance;
  owner/editor/viewer checks, member removal, workspace deletion and JSON export.
- Agencies with immutable string codes, brand name/color/signature; customer
  aliases, contact consent/preferences, household assignments and servicing users.
- Independent policy identities, customer linking/unlinking/moving, explicit
  merge and split/restore, field verification/provenance and policy history.
- Print v12 single/bulk text/file preview, per-record diagnostics and conflict
  approval, existing-customer suggestions/selection, idempotent imports in
  resumable 50-report requests, raw source retention and safe field rollback.
- Calendar-anchored premium projections, explicit payment evidence, terminal-state
  protection, daily scheduled in-app alerts and configurable reminder offsets.
- Follow-up CRUD/status/rescheduling/assignment with immutable task history;
  customer activity inspection; Gujarati/Hindi/English editable WhatsApp templates,
  manual message links, separate communication states and 24-hour duplicate guard.
- Square/portrait canvas posters, editable text/color, selected policy/branding,
  optional number masking, PNG export/device sharing and saved poster templates.
- Dashboard metrics, customer/policy search, combined policy filters and
  completeness/source-date indicators. Existing private CRM remains reachable.

## Known limits / remaining work

This is an additive implementation, **not a claim that every part of the master
brief is complete or production-verified**.

- Deployment is not performed. Callable and Scheduler must be deployed before
  using Agent CRM live. Existing CRM and staff routes continue to work separately.
- Only the supplied Print layout is verified. Loan-positive and other claim/rider
  layouts need representative redacted fixtures; unsupported loan layouts warn
  rather than invent balances. No verified plan-name catalogue is bundled.
- Legacy embedded policy arrays are not migrated. Existing records remain on the
  original CRM screen. There is no automatic bridge between the two data models.
- List loading caps each collection at 1,000 and reports truncation. Owner JSON
  export reads all core records; full cursor-based UI pagination, large-export
  streaming and operational backup/restore tooling remain to be implemented.
- Customer detail timelines cap policy lookups at 100 and displayed events at 500.
  JSON export contains core records, not raw source/history subcollections; it is
  a structured export, not a complete recovery backup.
- Follow-ups are editable tasks; there is no automatic birthday/revival/task
  creation yet. Scheduler currently produces in-app premium alerts only, on the
  configured calendar day; outage catch-up and push delivery remain open.
- Poster layouts share a minimal design system; logos/profile images, rich text,
  saved per-agency language templates and automatic festival calendars remain open.
  WhatsApp has no provider connection, delivery receipts or automatic sending.
- Advanced regional contact fields, a dedicated mobile bottom navigation, full
  report dashboards, source-retention settings and account-deletion automation
  are not implemented. Workspace deletion is explicit and owner-only.
- Server authorization is tested with the real service using a controlled
  transactional adapter. Production Firestore/IAM permissions, scheduled billing,
  real multi-user writes and physical devices require signed-in verification.

## Validation

18 focused domain/service tests passed, including direct use of the attached
original Print via an environment-only fixture. Public fixtures are synthetic;
no original report is committed. Coverage includes dates/riders/claims, customer
merge/split/linking, roles/invitations/revocation, older/manual conflicts, retries,
rollback, communication states/consent/deduplication, task history, owner export/
deletion and scheduled reminder deduplication/payment evidence.

Production and spatial builds/staging and site-reference checks pass. The existing
unit/Functions suites pass. The full browser command was attempted but could not
launch: this container has no Chromium executable. A new end-to-end test is included
in that existing CI command. Managed cloud-browser checks using a disposable
synthetic fixture verified initial load, import preview/save, policy columns,
customer editing, follow-up save and poster controls. This fixture does not use
production Firebase; its HTTP-only UUID/hash shims are never shipped.

## Publication follow-up

LIC now opens Agent CRM directly beside My Follow-ups. CRM uses LIC blue/yellow
accents on black; office/client follow-ups keep their original route/data. The
release CI independently runs both legacy CRM and Agent CRM browser workflows,
including palette and route assertions. Firebase access must be connected before
backend deployment; publishing static files alone does not activate cloud CRM.
