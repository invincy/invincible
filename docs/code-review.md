# Cleanup review — 2026-10-03

## Voiceover forest and balanced workspace — November 10, 2026

Resumed the existing uncommitted Voiceover work: bounded the desktop narration
field, improved label readability, placed history within the desktop workbench,
compacted the transport and added phone links between narration and history. The
new decorative scene has layered trees, terrain, sky, a softly glowing lightning
bolt and moving river highlights. Reduced motion is still, hidden tabs pause, and a
static illustrated landscape covers WebGL failure. The former water-only renderer
remains available separately, without loading on the Voiceover page.

Validation: the 13 TTS backend tests and actual-page Chromium workflow suite passed
including history, preview/generation fixtures, errors, account isolation and
320–1920px layouts. Forest and retained-river browser checks passed for motion,
fallback, input, reduced motion, resize and context restoration; desktop and phone
screenshots were inspected. The root suite passed 223 with two existing skips, plus
15 Functions and five media tests; build and site-reference checks passed. The
broader browser suite passed through Creator and stopped at the previously documented
Journal Save journal idea dialog timeout; later checks did not run. Physical-device
performance/Safari, live Firebase permissions and paid TTS were not verified. The
shader's bounded time can reset after long sessions.

Release-base follow-up: after fast-forwarding over two unrelated remote commits,
the root suite passed 229 with two skips, the Functions and media suites passed,
and the build and site-reference checks passed. The Voiceover workflow and retained
river checks passed again; the forest rerun passed desktop and phone motion checks
but stalled during later layer comparisons, so its earlier complete pass remains
the latest full forest result. The broad browser rerun passed through Task Copy
but stalled in Creator; subsequent checks were not run in that attempt.

## Voiceover flowing water — November 10, 2026

Voiceover now has compact translucent script, settings, transport and history
surfaces over a procedural flowing river with rain rings. The decorative layer
has bounded resolution/frame rate, hidden-tab and reduced-motion handling, and
a static WebGL fallback. The page retains existing workflows and responsive
settings disclosure. The old shared SVG remains unchanged for other Studio pages.

The TTS backend's 13 tests and the actual-page Chromium workflow suite passed,
including sample playback, preview/full generation fixtures, history, errors,
downloads and responsive transport. The water browser checks passed on desktop
and phone for visible motion/rain, reduced motion, fallback, input, visibility,
resize and context recovery. Desktop and phone screenshots were inspected; the
site reference check passed. The limits and shader phase reset are documented in
[Creator voiceover](creator-tts.md). Physical-device/Safari performance, live
Firebase permissions and new paid speech generation were not verified.

## Responsive layout first pass — November 10, 2026

Reminders, Garage and the LIC hub/Plans entry now use more of a wide desktop
screen. Reminders displays multiple cards per row on wider screens and separates
its add action from the AI launcher. Garage wraps long vehicle and record text;
LIC Plans can display its two presentations side by side. Phone layouts retain
their existing navigation and content scrolling. Dashboard and its intentionally
scrollable My Workspace board were not changed.

Focused Chromium checks cover the actual Garage and LIC pages with controlled
data and the Reminders stylesheet with synthetic loading, overdue, expanded,
empty and upcoming states, including phone and desktop sizes. The existing Garage
storage browser and model checks passed. The full unit suite passed (223 passed,
two existing skips; 15 Functions and five media tests passed), as did the build
and site-reference check. The browser suite passed through Creator, including
the new responsive checks, then stopped at the previously documented Journal
Save journal idea dialog timeout; later browser checks did not run. These checks
do not establish production Firebase permissions or physical-device/Safari
behavior. Other pages have not all been audited and this first pass does not
certify screen fit across the site.

## Jeevan Lakshya Plan 733 — November 10, 2026

LIC → Plans now exposes the migrated Jeevan Lakshya presentation and calculator alongside the original Bima Platinum card. Both Jeevan Lakshya pages use one verified benefits model: UIN 512N297V03, eligibility and BSA increments, exact brochure premiums only, separate contractual and assumed bonus amounts, and anniversary-based death income with premiums capped at PPT. Unverified combinations require an LIC quotation. Misleading guaranteed-goal, compound-bonus, tax-free and immediate-income claims were removed. Profile selections carry into the calculator, invalid inputs hide stale figures, literal text rendering prevents HTML injection, and the responsive presentation keeps navigation visible with scene-body scrolling on short screens. Inspector tools require `?debug=1`.

Validation: full unit/Functions suite 209 passed, two skipped, zero failed; production build and site-reference check passed. Five focused model tests and Chromium integration at 320×480, 390×844, 844×390 and 1440×900 passed, including narration completion/cancellation. Bima Platinum opening passed; its complete journey rerun passed all seven viewports after an initial audio-stage timeout under concurrent checks. No Bima Platinum product files changed.

Broader browser checks passed Garage/storage, shared navigation, dashboard/reminders, Orb, Task Copy, Creator, LIC Follow-ups, Journal notebook, Workday and account menu. Full browser run stopped at the previously documented Journal Save journal idea dialog timeout. Separate CRM/Cashier runs reproduced existing addCustomer-enabled / entryPanel-visible loading timeouts. The CRM navigation assertion now expects Plans and passes that step. Java is absent and no completed emulator-rule result was obtained. Physical-device Safari, real issued-policy quotes and production Firebase permissions remain unverified. No deployment, credentials, database paths/rules or customer records changed.

See [exact edits, brochure sources and calculator scope](lic-jeevan-lakshya.md).


## Minimal responsive Creator UI — November 10, 2026

Publication follow-up: lightened water to pale blue (#89d8ff / #b6edff) with
translucent sky-blue edges, retaining slow drift and the still reduced-motion
fallback. Integrated master’s new voiceover-history workflow without removing
its save, restore, recipe export, retry, pagination or account isolation. History
sits below the main workspace so it does not shrink the editor or displace the
transport. The combined history/Voiceover responsive browser suite passes.

Follow-up: replaced the static river glow with three translucent water ribbons,
slowly drifting behind lightly translucent panels. The layer uses a single SVG
and CSS transform animation, no canvas or per-frame JavaScript, and cannot capture
input. Reduced motion disables the drift. Desktop/mobile Voiceover and complete
Studio import/export browser checks and site references passed again; a browser
probe confirmed the active animation and reduced-motion fallback. Existing broad
regression limitations below remain unchanged.

Rebuilt Voiceover's layout around a wide script editor, compact independently
scrollable settings and a common generation/playback/export transport. Portrait
uses an initially collapsed voice-settings disclosure above narration and a
sticky transport with 44 px actions. Resizing retains one set of input values and
the existing phone disclosure preference. The assistant launcher clears the
transport. Removed duplicated gold-era Voiceover CSS, numbered section ornaments
and the redundant brand badge. Shared scoped Studio tokens, quiet surfaces, teal
selection/focus controls and a static blurred river background now also apply to
the project list, project workbench and video/audio controls. Existing navigation,
auth, API requests, project data, map art/export presets and workflow features are
preserved. Original screenshot was recovered from the reference chat; the later
concept image was unavailable, so styling follows the user's written direction.

Verification on Windows / Chrome / Node 24: production build and site references
passed; root suite 218 passed / two existing skips, Functions 15 passed, media
Functions five passed and TTS 13 passed. Voiceover's actual-page browser suite
passed Classic/Gemini settings, sample playback, preview/full MP3 download, XML
and quota errors, draft recovery and account isolation. Added eight viewport
checks (320–1920 px, landscape and portrait), keyboard disclosure and unobscured
Generate/player/download assertions. Creator creation/storyboard/recovery and
complete-video/upload/import/audio-MP4/conflict/account-isolation checks passed
with the shared stylesheet enabled, and generated screenshots were inspected.

The full browser run passed Garage, navigation, dashboard/reminders, Orb, Task
copy and Creator before timing out in unchanged journal-tools-browser.cjs at the
Save journal idea dialog (also reproduced separately). Continuation checks passed
Journal notebook, LIC follow-up, Workday cases and account settings. Unchanged
LIC CRM timed out at #addCustomer:enabled; LIC cashier timed out at #entryPanel.
CRM emulator tests were not run because Java is unavailable on this host.
These are verification limits, not a claim that the broad browser suite is green.
No live paid generation or production Firebase permissions were exercised by this
UI-only change. Physical-device keyboard/Safari verification remains outstanding.

## Voiceover script/settings history — November 10, 2026

Successful full TTS generations now save an account-owned recipe in
`users/{uid}/voiceoverHistory/{recordingId}`. The existing page adds paged history,
expandable scripts/settings, restore without synthesis, JSON recipe export and
confirmed deletion. Previews/failures do not create records; repeated downloads
do not duplicate them. Original request and form values are captured before the
generation call. Pending saves have an account-scoped local retry copy and stable
IDs. Errors retain retry/export options; account changes reject stale UI responses.
Historical voice unavailability blocks silent substitution. Audio remains a local
download/in-memory player; no new audio storage, paid call, auth change, migration,
Firestore rule or backend deployment is introduced.

Validation: 218 root tests passed, two existing skips; all 15 Functions, five media
and 12 TTS backend tests passed. The extended real-Chrome TTS browser suite passes
history request snapshots, preview exclusion, download/recipe export, classic and
Gemini setting restoration, fresh-context history, reload/retry, 25-item pagination,
delete failure/success and account isolation, plus existing generation/draft/sample
checks and 320–1280px layouts. Mobile output was visually inspected. Production
build and site references pass; generated React content is unchanged. Broad browser
checks passed Garage, navigation, Reminders, Orb, Task copy and Creator, then stopped
at the Journal `Save journal idea` dialog timeout in `tests/journal-tools-browser.cjs:54`,
already documented as a baseline limitation. Later checks did not run. Java is not
installed, so emulator rules checks are unavailable; no rules were edited. Live
signed-in history permissions, production speech and physical devices remain
unverified. No commit, push or publication performed.

## Creator Studio red interface — November 10, 2026

Applied a YouTube-inspired red/charcoal interface to Studio and the Creator project list: readable Roboto/Hindi typography, clear step headings, quieter cards, improved upload/file controls, red focus/selection/timeline accents and a prominent export action. CSS is scoped to Creator/Studio controls; film presentation presets and saved data are not changed. Advanced controls, scene editors and phone menus remain available. Studio CSS references advance to v=2026111003 for existing sessions.

Validation: existing complete-video/cloud-fixture/export and full Creator navigation/responsive browser checks, root/Functions/media unit suites and site references; visual inspection of the actual redesigned workspace. Final remote regression/publication results are recorded in this chat release report.

## One Creator Studio flow — November 10, 2026

Promoted one shared upload/library area and complete-video JSON handoff into the opening Studio screen, retaining focused map/battlefield editors and audio MP4 export. Studio, map and production-clip uploads share account-owned immutable cloud originals; named metadata and stable IDs are reused across projects/devices. Owner video drafts and brand profiles sync with revision conflict protection, keeping local recovery. Added dedicated creator-media backend and private media bucket; existing AI/TTS functions, Firestore rules and user project records are preserved. Historical local-only notes are superseded by docs/creator-single-flow.md.

Validation includes full root/Functions/media tests, actual handler account-denial tests, original-byte validation, independent-context media/draft retrieval, one-JSON map+army-overlay+voice export, stale-device protection, existing Studio/map/default/universal browser acceptance, production build and site checks. Real signed-in production upload acceptance remains separate and must be recorded in the release report.

## Creator Studio product cleanup — November 10, 2026

Maps now opens the shared visual Map Editor directly; Advanced / recording retains the local audio, source and capture controls, and Production Clips remains available. Removed the canned cloud Demo action, two standalone map demo pages/catalog/loader, the unused predecessor storyboard editor, a one-off local checker, and the optional Panipat film export fixture. Historical geography and animation JSON remain as references; the Hindi fonts, map engine, MP4 encoder, reusable asset catalog, defaults and project data are preserved. Internal regression fixtures live under tests and are excluded from the public site together with development/server source. Native importer versions were bumped together.

Focused verification passed: main Maps/Advanced/Clips navigation, timeline playback, invalid JSON rejection, responsive layout, universal architecture/rollback/revision checks, direct Map Editor interactions, new-project defaults/overrides/reload and a real portrait 1080×1920 MP4. Root tests: 215 passed and two existing skips; all 15 Functions tests passed. Production build and site-reference checks passed. Broad regression and remote publication results are recorded in the final cleanup report. No Firebase records, ownership/rules, user videos or local Antigravity worktrees were changed. The retired remote film branch is backed up locally; its separate shared-inputs branch and pinned asset URLs remain.

## Documentary Terrain export refinement — November 9, 2026

Added a shared version-2 Documentary Terrain snapshot for new maps, with explicit opt-in from existing projects. Classic and legacy snapshots remain valid. Phone-size feedback increased secondary labels to 48 px (52 px in the connection test) and made compact dark rounded cards the default for location names; regional text can remain unboxed. Central typography/hierarchy, locally bundled licensed Hindi-capable fonts, halo/card/callout labels, thin output-scaled routes, one-shot marker entrances, deterministic optional year/counter/caption graphics and a DOM-only Shorts guide use the existing editor/player/export pipeline. Scene mapPresentation overrides are validated; scene packages preserve/remap information graphics. Ordinary new animation instructions can omit cameras and inherit scene framing, while authored keys retain precedence.

The native compositor avoids reprocessing unchanged paint and GeoJSON during export. Readiness, audio composition, assets, cancellation, projection and saved cameras remain in the existing system. This is an editor upgrade: the Panipat/Delhi sequence is isolated test data with sourced modern locators and a visibly illustrative connector. No reference-image geography or historical itinerary was invented.

Local validation: 217 root cases (215 passed, two existing skips), 15 Functions cases, production build and site references; default creation/override/reload/portrait MP4, architecture, Map Editor, history, animation and mixed-composition browser checks. The 12-second native 1080×1920 demonstration passes Hindi placement, terrain-projected marker pixels, collision/safe-area checks, scene overrides, seeking/replay and guide exclusion. Encoded frames and filmstrip were visually inspected; full decode passed. Final remote release verification follows these checks.

See [Documentary Terrain](documentary-terrain.md) for configuration and limitations: NASA source detail is finite, dense lower-priority labels may be suppressed, regional terrain alignment is approximate, and the mobile earthquake recording was not supplied. The test export is silent; existing Studio audio is regression-tested. No Firebase/auth/backend changes or Gemini generation are part of this refinement.


## Creator Studio publication and live save fixes — November 9, 2026

PR #168 passed all eight remote check groups and published the universal editor through the main GitHub Pages route. A signed-in live check then exposed cached native module URLs: an existing browser could retain old creation/editor code. Native entry points and the changed modules' importer graph now use a consistent release query version, with the updated project stylesheet version. This changes loading URLs, not project data or rendering semantics. Unit/Functions, site-reference, default creation/export and architecture browser checks passed again locally. The publication follow-up repeats remote verification. A later signed-in create attempt also exposed a missing-document read denial: transaction-based creation must read a fresh ID before writing. Creator rules now allow authenticated point reads of missing IDs while retaining owner/verified-editor checks for existing documents and all collection queries. The emulator suite exercises the actual read-before-create transaction, anonymous denial and outsider read/list denial. Repeated metadata/own-write acknowledgements of the current revision now update the draft clock without remounting the active editor; a browser regression explicitly delivers that acknowledgement after a style save.

The live Firestore ruleset predates the repository's LIC rules. The Creator release package is therefore built from the saved live ruleset plus the reviewed Creator block and its local email helper; unrelated rules remain byte-for-byte unchanged. The scoped package passed actual emulator permissions tests and cloud compilation. The scoped rules were activated as ruleset 407e4f48-4e0a-493c-bfaf-5e4bd2452272, and read-back confirmed an exact match with the tested package and unchanged unrelated rules. The previously rejected signed-in creation succeeded on retry with the preserved form. Final editor/save acceptance is recorded in the release handoff.

## Universal Creator Studio consolidation — November 9, 2026

Integrated the universal-map handoff with the main editor's versioned default presentation in an isolated checkout. Shared code has no Panipat title/branch conditions. Demo/artwork catalogs are data, optional overlays use isolated trusted factories, missing plugins fail visibly, and scene packages exclude undeclared project-wide metadata. Plugin scenes require the full project or a dedicated scene exporter. Binding preserves existing narration/timing and rejects nonadjacent selections.

Revision-aware transactions, explicit conflict recovery, account-switch guards and deleted-record protection are covered. Central NASA/terrain attribution, portrait output, readable cards and per-project overrides remain consistent through the shared preview/export path. Existing legacy map JSON retains its compatibility rendering. See [the architecture contract](creator-studio-universal.md).

Validation: 211 root cases (209 pass, two existing skips), 15 Functions cases, actual Creator Firestore emulator rules tests, production build and 460-file site check passed. Focused architecture/default-style, Map Editor, map animation, history, storyboard and mixed-composition browser checks passed; real portrait MP4 and mixed exports fully decoded. Isolation coverage constructs 100 independent records; it is not a 100-video throughput claim. The broad browser suite remains non-green: Journal tools, LIC personal CRM and LIC cashier timeouts also occurred on unchanged master in the prior baseline comparison. The CRM rules/Web SDK checks pass; the separate Agent CRM browser timeout was also reproduced on unchanged master. No source was changed to suppress unrelated failures.

Original Antigravity worktrees were left untouched. No push, merge, cloud rules deployment, Gemini generation or paid service activation occurred. Strict rules require a coordinated client/rules release and real signed-in validation before production use.


## Ready-made TTS voice samples — November 9, 2026

A round play/stop button immediately before the Google voice selector plays the exact selected voice’s existing public Google demo without narration. An allowlist of 2,002 observed catalogue sample names prevents guessing URLs for voices with no demo. Missing samples are disabled; failed playback shows a retry message and never falls back to synthesis. Samples retain Google’s original settings. Changing voice/account, starting generation or playing a generated recording stops the sample, including stale play promises.

Focused browser checks cover empty-script playback, exact male/female source matching, stop/toggle, selection changes, missing samples, HTTP errors, sign-out and existing preview/export flows at 320–1280px. A real signed-in browser played Google’s public hi-IN-Neural2-A/B WAVs with an empty script and zero synthesis calls. Full local unit/Functions tests, the production build and site-reference check passed. No backend deployment, authentication configuration, credentials, project data or billing settings changed.


## Creator Google voiceover — November 9, 2026

Creator Studio now links to a reusable TTS page for pasted text/SSML, live Google voice filters, supported speed/pitch/volume/paragraph-pause controls, plain-text opening previews, playback and MP3 download. Delivery presets are numerical starting points, not promised emotions. Scripts/settings are account-scoped local drafts; generated audio clears on account changes and stale responses are discarded.

New owner-allowlisted Firebase callables use runtime Google credentials, strict input/capability validation, server-only hourly usage counters and a single-generation lock. Lossless Google chunks are validated and joined before one FFmpeg MP3 encode and full decode check. No Google key is embedded, uploaded or committed, and existing Firestore rules and project data paths are unchanged.

Validation: ten focused backend tests and the browser settings/preview/full-download/failure/draft/account-isolation suite passed, including 320–1280px layouts with shared navigation. A live male Hindi-English Google recording generated and decoded successfully (3.88 sec); Google returned 2,066 voices. Full unit/Functions tests, main production build, Functions syntax and site references passed. The broader V1 browser run passed Garage, navigation, dashboard/reminders, Orb, Task copy, Creator, Journal and LIC follow-up scenarios, then timed out waiting for #addCustomer:enabled in unchanged tests/lic-crm-browser.cjs. The first Orb attempt required fetching the historical baseline object missing from the shallow clone; the subsequent Orb run passed. No unrelated CRM fixes were made.

Administrator reauthentication was completed. TTS deploys as the independent creator-tts codebase from functions-tts, avoiding the default codebase’s unprovisioned Kling secret and preserving the existing AI function. The owner UID is configured in an ignored environment file. Both TTS functions deployed successfully to asia-south1. A real signed-in browser check against the live backend loaded 2,066 Google voices and generated/downloaded a 3.5-second male Hindi-English MP3; a full FFmpeg decode of that download passed. Runtime credentials worked without uploading the private key. Additional existing browser checks passed Workday cases and account settings; the unchanged LIC cashier test also timed out waiting for its entry panel. The first CI run stopped before tests because ubuntu-latest had moved to Ubuntu 26.04, unsupported by the repository’s Playwright 1.56.1. Browser jobs are now pinned to supported Ubuntu 24.04; verification is rerunning.


## LIC Follow-up Manager — October 26, 2026

Publication follow-up adds reversible case removal, automatic archiving on completion, archive/all-saved views and explicit restoration. Replacement CSV import is the default, with a visible removal count and an add/update-only alternative. Incoming rows must all save before missing cases are archived; imports preserve earlier remarks/history and reactivate only cases previously removed due to CSV absence. Ten focused model/sample tests and the expanded browser suite pass, including completion/removal/restore, reimport of archived cases, uncertain archive acknowledgements and retries after both row-import and archive-phase failures. Publication and the initial private sample import were explicitly requested; the CSV remains outside Git.

Added a native module under the existing LIC hub, using shared navigation and Firebase auth. It supports paste/upload CSV, editable column mapping, per-row preview/errors, policy details, valid-mobile call links, quick responses, notes, schedules, separate persistent history, search, plan/work views, and duplicate-safe imports. The OP-Neft columns are explicitly linked OP-NAPped policies, searchable and available in a dedicated missing/invalid-mobile view. Contactability and call attempts are independent. The source CSV is not part of the public repository.

Focused model tests cover CSV quoting/BOM/newlines, mapping, identifiers with leading zeroes, duplicate conflicts, date/amount/mobile validation, OP search, contact states, merge preservation and scheduling. The original `858.csv` validates as 104 unique policies with one row containing three linked OP policies. Browser checks use the actual storage adapter with synthetic Firestore fixtures, covering file/paste imports, manual mapping, logging/reload/reimport, phone correction, failed saves, lost acknowledgements, partial-import retry, pagination, account isolation, real shared navigation and layouts from 320 to 1440px. Production Firebase permissions, real call-app dispatch and physical-device Safari are not established by these fixtures.

Local verification: all eight focused model/sample tests, the LIC browser suite, full repository unit/Functions tests, full V1 browser suite, main production build, V2 build/stage, site reference check and diff whitespace check passed. The broader V2 browser suite passed its Chromium scenarios, then failed the existing Firefox assertion `workflow nodes can be repositioned` in `tests/v2-browser.cjs:173`; this change does not edit V2 code or that test. The new native-page test caught and fixed interference with the shared navigation's More dialog by limiting handlers and controls to the two LIC dialogs. Generated React/V2 build files have no source changes and are not included in the feature commit.

## V2 read-only prototype — 2026-10-13

The initial V2 branch adds a separate React entry/build, continuous Dashboard/My Workspace canvas, existing auth/config and FocusOrb, shared read-only tasks/daily-plan widgets, and a local persistent focus interval. [The V2 audit](v2-spatial-workspace.md) records source evidence for all six Foundation Stability risks, the write gate, checks and remaining phases. Those risks remain unresolved in V1; V2 does not call the auto-seeding daily-plan hook or expose business writes. V1 HTML, generated assets, workers, Firebase rules/config and backend code remain unchanged. Chromium/Firefox fixture checks supplement unit, backend, V1 regression and isolated-build verification; authenticated production permissions and physical-device behavior remain unverified.

The draft now includes a separate `v2/` publishing package for the existing Pages origin, where the same browser profile can restore V1's Firebase session. It is not published. Remote V2 checks passed; the first full CI run exposed a machine-dependent capability assumption in the old Orb test. That test now explicitly models the desktop tier while retaining separate low-capability coverage; the actual Orb remains unchanged.

Baseline: `master` at `0aaa969` (shared auth/Garage fixes). This review covers source organization, active entry points, asset references, and preservation of existing flows. It is not a signed-in production Firebase audit.

## Cleanup completed

- Removed 15 obsolete application files: seven historical Journal bundles; the unused Workday native script/two stylesheets; the unused Reminders native script/manifest/icon; and the unused Today's Plan component/stylesheet.
- Consolidated the two nested ignore files into one root `.gitignore` (17 deleted files overall, approximately 4.75 MB of deleted file content).
- Shared page links, route matching, tab preferences, and validation through `shared/navigation.js`. The native navigation renderer remains separate from the React renderer because their mounting/lifecycle code differs.
- Replaced seven copied native HTML navigation lists with small mounts. All native loaders now use ES modules, including the previously older LIC product loader.
- Removed unused daily-plan remove/activate/reorder methods; the active queue's add/complete behavior remains. Removed the unused Garage `resetEdit` helper, Creator auth import, and root worker version constant.
- Removed four exact duplicate CSS rules and consolidated the avatar's sphere styling. Intentional later style overrides remain.
- Extracted Dashboard's inline CSS to `react/src/dashboard-base.css`, preserving the load order; removed the duplicate theme-color meta tag.
- Kept the old Reminders worker URL as a retirement endpoint instead of removing a resource that browsers may still request.
- Added common build/check/test commands, reference checking, navigation tests, worker-retirement tests, and developer guidance.

No Firestore data, rules, paths, task IDs, scene IDs, or saved user preferences were migrated or deleted in this cleanup. Previous source and bundles remain recoverable in Git history.

## Validation

| Check | Result | Limits |
| --- | --- | --- |
| Vite production build | Passed; generated main assets refreshed | Single main bundle remains approximately 757 KB before gzip |
| Site reference/module-loader check | Passed | Checks local resource references; does not prove external APIs are reachable |
| Navigation/storage/worker unit regressions | 7 passed | Controlled adapters and in-memory state |
| Backend task/project/tool tests | 8 passed | Functions code unchanged; Node 24 test runtime, deployment targets Node 22 |
| Functions syntax check | Passed | No deployment or live callable request |
| Garage browser integration | Passed add/edit/reload/delete, failed-save form recovery, account sign-out isolation | Mock Firestore backend |
| Navigation browser integration | Passed on all seven native pages and shared React/native tab preferences | Native page-specific application scripts are excluded from navigation fixtures |
| AI avatar browser check | Motion and reduced-motion behavior passed | CSS/render check; does not test voice or the AI provider |
| Dashboard layout | Passed nine viewport sizes, timer start/pause/reset, no returned Today's Plan card or timer/progress overlap | Auth/tasks are fixture data |
| Diff and edited-module syntax checks | Passed | Not a complete static type/lint audit |

The dashboard fixture check covered 1280×800, 1280×600, 1025×600, 1440×900, 1920×1080, 834×1112, 768×1024, 393×852, and 360×640. Existing tablet scrolling behavior remains; this pass did not redesign it.

## Remaining findings and next work (updated after the tablet/reminders follow-up)

| Priority | Finding | Evidence / impact | Next action |
| --- | --- | --- | --- |
| P1 | Live Firebase permissions remain unverified | Frontend fixtures cannot establish deployed rules, provider configuration, or real account UID access | Test one real account across internal pages, including Garage create/edit/delete and reload |
| P1 | Creator collaboration can overwrite concurrent scene edits | `creator/project.js` autosaves whole project fields/scene arrays; local draft recovery does not merge simultaneous server edits | Add revision/conflict handling before expanding collaboration |
| P2 | Some AI focus tools use a different source than Dashboard | `get_current_focus` and `dashboardState().focus` select by task status. Dashboard uses daily plans. AI's initial `contextSnapshot()` already prefers the daily plan, so this is a tool-specific inconsistency | Use one active-focus resolver for context and tool responses; preserve daily-plan IDs |
| P2 | Journal's original source/build is absent | Active Journal is a bundled React app plus a readable persistence adapter | Recover the source before folding it into the main React app |

The remaining rows are unresolved review findings. Keep follow-up work separate from this behavior-preserving cleanup so its effects can be tested and reviewed clearly.

## Maintenance baseline

Use [README.md](../README.md) as the main project map and [AGENTS.md](../AGENTS.md) for editing instructions. Keep [Firebase storage](firebase-storage.md) and [AI architecture](invincible-ai-phase-1.md) aligned with the implementation. Do not reintroduce archived bundles, native pre-React scripts, copied navigation lists, or generated main-app bundle edits.

## Tablet/reminders follow-up — 2026-10-03

Baseline: `master` at `53cda787` (cleanup).

- Replaced 819 lines of base/mobile CSS and the later layout overrides with one Dashboard stylesheet. Removed absolute panel positions and fixed viewport heights. Introduced independent phone (<700), tablet (700–1100) and desktop (>1100) grids, wrapping content, `min-width:0`, `min-height:100dvh`, fluid type, and container-aware task cards. Decorative canvases and floating overlays retain positioned rendering.
- Timer, orb metadata and board occupy independent cells. Tablet focus text appears beside the orb instead of being duplicated inside it. Boards grow and scroll naturally; the last task remains reachable. Shared React navigation collapses at 1100px. Touch scrolling cancels a task's pending drag; long-press dragging and explicit movement buttons remain.
- Added a subtle red Overdue reminder group, calendar rollover refresh, cached/cloud loading status, inline save recovery, and an in-flight completion guard. Daily completion is atomic and idempotent, reads current fields and produces one next-calendar-day occurrence. No historical duplicates or user records were deleted.
- Loaded all six main React pages via `React.lazy`/`Suspense`, with route/auth/task/reminder skeletons and empty states. Content-hashed filenames and automatic HTML synchronization prevent stale chunks and duplicate entry module instances. CSS remains one generated asset intentionally; page CSS isolation is future work.
- Dashboard uses an 8px spacing scale, 16px card radius, layered shadows, at least 44px controls, light/dark preferences and reduced motion. Reminder styles were also cleaned of unreachable pre-React dialog/auth selectors and small targets. These changes do not assert every existing page meets those conventions.

### Verification

| Check | Result | Limits |
| --- | --- | --- |
| Site reference/module graph check | Passed | Local files and entry consistency |
| Frontend/domain regressions | 11 passed | Controlled/in-memory adapters |
| Backend tools/project tests | 8 passed | Node 24; deployment target remains Node 22 |
| Garage/navigation browser integration | Passed existing CRUD, recovery, account isolation and native/React navigation checks | Mock Firestore; native app scripts excluded from navigation fixtures |
| Dashboard browser integration | Passed 14 viewports, long titles, 24 tasks, timer start/pause/complete, lane expansion and new-task/subtask form | Chromium, controlled realistic records |
| Reminders browser integration | Passed initial skeleton, overdue/today groups, failed transaction recovery, retry and exactly one next daily record | Controlled Firestore adapter, not deployed rules |
| Production bundle smoke | Actual hashed entry shows one Google auth gate without runtime errors | Anonymous startup only |
| Production build | Passed; shared app entry ~163 KB + Firebase ~462 KB = ~626 KB initial JS, with page chunks ~5–39 KB | Firebase still loads globally; Dashboard adds ~33 KB plus shared task/plan chunks; shared CSS ~111 KB |

Viewport coverage: 320×640, 393×852, 507×768, 699×900, 700×1024, 768×1024, 820×1180, 834×1112, 1024×768, 1100×820, 1101×768, 1180×820, 1280×600, 1440×900. Tests verify horizontal overflow, timer/clock/progress/board separation, board columns, reachable final tasks and 44px Dashboard buttons. Light preference and reduced-motion styling are exercised. These fixtures do not replace a signed-in test with real data or an iPad Safari check.

Live Firebase permissions, Creator simultaneous-edit conflicts, the AI focus-tool mismatch and missing Journal source remain unresolved. React migration remains partial.

## Dashboard styling restoration — October 3

PR #58 replaced the compact phone board and status glass styling. Restored four compact lanes in a 2×2 phone grid, internal scrolling and tap expansion, grey/gold/blue/green lane backgrounds, fading top/bottom surfaces with side rails only, and the original dark theme regardless of device preference. Desktop retains three project lanes and tablets two columns, with flow-based timer/clock separation. Removed the enclosing focus card appearance and restored the wide gold timer glow. Long titles are visually clamped while complete task content stays available in the workspace. No storage, reminder or auth logic changed.

Validation: production build, asset references, eleven frontend/domain tests, and Chromium fixture checks across fourteen viewports passed, including lane expansion, timer controls, form, scrolling, borders, failed reminder retry and daily recurrence. Fixture screenshots were inspected; live account data and physical iPad Safari were not tested.

## Orb filaments and compact focus/task layout — October 3

Baseline: PR #59, merged commit `2acf40fa6ad3f65f9ccb540dcb92bf213f4def94`.

- Replaced constant-width ribbon trails and oversized cell heads with equally sized 3.4-point heads, 45% tapered tails and power-curve alpha. Tightened sampling as radius shrinks; packet size boost is now `1 + .26*packet + .12*secondary`. Added resize-only `pointScale` clamped to .85–1.5. Palettes, all spatial/motion shader formulas, fallback dots and public props are retained.
- Particle budgets: desktop 59,120 → 19,456; ≤1024px 55,520 → 14,544; low-capability desktop/mobile 14,544/11,112. The typed vertex buffers shrink from 1,182,400/1,110,400 bytes to 389,120/290,880 bytes (222,240 for low mobile). Those are allocation sizes, not measured total-memory or power savings.
- Replaced the skipping rAF loop with timeout then rAF presentation: ~24 fps idle, up to ~40 desktop/~30 mobile during hover, drag or coasting. Static GL setup/color/style occurs once, and viewport/projection/DPR/point scale only on resize. DPR caps are 1.25 desktop and 1 mobile; antialias is disabled with low-power preference retained.
- Added context restoration rebuilding, immediate eligible resize draws, both-stage cancellation and full observer/listener/GPU cleanup, including initialization failure. Reduced motion still uses time 8 and discrete interaction-triggered draws.
- Moved project/action text into the existing orb container on tablet/desktop, preserving the phone summary and hidden phone orb. Task titles are smaller and sit beside the movement arrows. Kept 44px controls and the coloured fading lanes/compact 2×2 phone board. Tablet focus surfaces remain open rather than enclosed cards.
- Rebuilt `react-dist` with the build script and refreshed all six HTML entries to new content hashes, without query aliases or compiled-bundle edits.

Verification: `npm run build`, `npm run check`, `npm run test` (13 frontend/domain + 8 backend), `npm run test:browser` and diff check passed. Browser suite includes the Dashboard's fourteen viewports (specifically 834×1112 and 768×1024), title/arrow alignment and focus heading containment, storage/navigation/reminder checks, plus all eighteen orb screenshots (three themes × three widths × before/after) at fixed time. Images were visually inspected for thin, continuous tapered lines and spherical form. Separate WebGL checks passed cadence, static GL setup, DPR/resize, loss/restoration and fallback display, drag/inertia, low-capability tiers, reduced motion, visibility/intersection pause and resource cleanup. No real-hardware GPU/CPU/power/battery measurements, physical iPad Safari verification, or signed-in production-data changes were performed.

## Phone focus cleanup — October 3

PR #60 is the baseline. Dashboard now mounts the orb stage only at widths ≥700px, using the same breakpoint as its stylesheet. Phones create no hidden orb canvas, program, buffer or animation scheduler; crossing to tablet restores the component and crossing back cleans it up. The wide gold timer strip remains below the clock. The phone summary renders only a real focus task/action; the empty “Current focus / Move a task to Today” block is removed. No task-selection, daily-plan or database behaviour changed, and the floating AI launcher is a separate control.

Validation: build, site references, diff check and the fourteen-viewport Dashboard/reminders browser check passed, including 834×1112 and 768×1024. Added empty-plan coverage and phone↔tablet mount/unmount assertions. Signed-in data and physical devices were not tested.

## V2 Dashboard proportions — October 13

On the published V2 Dashboard, the mission section and large support cards pushed every Kanban lane below the initial viewport. Reduced spacing and title sizes, moved a compact timer alongside the mission/Orb, and condensed the journey into a progress summary with access to full milestones. Short desktop screens stack timer and journey in the right column; phones use a timer strip and prioritize the board. V1 selectors, generated assets, auth and persistence are unchanged.

Validation: 19 frontend/domain + eight backend tests, V2 staged build, site references, isolated V1 build/check and the existing 14-viewport Dashboard/reminders browser suite passed. Chromium and Firefox V2 checks now assert initial Kanban visibility across nine screen sizes from 320×640 to 1870×842, including 1280×600 and long project names. Milestone inspection and existing timer/navigation/account checks passed. Screenshots were inspected with fixture records. Physical-device rendering and live account permissions were not retested; the shared foundation findings above remain open.

## V2 Coherent Spatial Workspace Redesign — October 14

Redesigned the frontend composition across Main Dashboard and My Workspace into a unified, high-density living spatial environment. Integrated the mission, Orb stage, compact focus timer, and milestone journey into an intentional cockpit layout. Aligned all 4 Kanban lanes (`Backlog`, `In progress`, `Today`, `Completed`) with status accents, card progress bars, step counts, and independent internal scrolling. Enhanced My Workspace with consistent visual identity, pipeline volume summary, and expanded milestone roadmap. Mobile view arranges active mission and compact Orb side-by-side with a condensed timer and direct task access before scrolling.

Validation: 19 frontend/domain + 8 backend tests, site references (`npm run check`), V2 production build/stage (`v2/`), Chromium and Firefox browser test suite covering nine viewports (320×640 to 1870×842, including constrained 1280×600 and long titles), free horizontal stopping, region seam, history restoration, and live read lifecycle passed. No database writes or schema modifications. Screenshots inspected for visual hierarchy and responsiveness.

## V2 Orb-as-guide focus scene — October 14 review branch

The previous V2 cockpit kept the Orb in a separate stage and placed the complete board in Dashboard. This branch gives the Orb a shared visual layer and places mission, next action, timer, progress and a Workspace entry around it. My Workspace owns the full four-lane read-only board. This keeps the Dashboard's purpose focused and removes the large empty lanes and enclosing dashboard panels from its first screen. The old cockpit-specific CSS was removed; V1 Dashboard selectors and data paths remain unchanged.

Validation passed: 19 frontend/domain plus eight backend tests, V1 build/site check/browser regressions, V2 staged build and Chromium/Firefox V2 integration at 320–2560px widths, including 1280×600 and long-title cases. Browser checks cover Orb dragging where WebGL is available and its fallback elsewhere, first-screen scene sizing, accessible board entry, task inspector, timer sharing, navigation/history, live updates, account isolation, and no writes. Fixture screenshots were inspected. Real signed-in data, physical devices, Safari and the visual ambition of the supplied reference remain follow-up work; no publication occurred from this branch.

### Orb scale and navigation follow-up

Review feedback identified too much repeated project text, an undersized Orb and weak page discoverability. Consolidated project title, next step, resume and progress on the left; removed duplicate notes/milestones actions and helper sentences. Increased desktop Orb anchor to 150% of the prior maximum. Replaced visible duplicate region headings with a two-node top navigation map, kept the headings available to assistive technology and moved navigation focus to the visible active link. Short laptop and phone fixture screenshots were inspected; V2 browser checks verify large Orb sizing, no horizontal document spill, both destinations and keyboard/history navigation. The published site remains unchanged.

## Creator Studio storyboard — October 19, 2026

Added separate Full voiceover and a four-column Storyboard to New Content and the existing project page. A shared editor previews tab-separated imports, supports quoted multiline cells and header mapping, defaults to append, confirms replacement/removal, and allows manual edits/addition/reordering with touch-friendly buttons. Phone widths stack each shot's fields. Existing scripts, production notes, workflow stages, prompts, asset links and completion state remain stored in the original project document; new planning fields are additive. Scene normalization retains unknown metadata. New Content waits for save acknowledgement, keeps one ID across retries, and retains the form on failure. Project edits use the existing autosave/draft path.

Verification: 33 frontend/domain tests plus eight backend tests passed, including five new storyboard/legacy-import cases. The production build and site-reference check passed. All six browser scripts passed: storage, navigation, Dashboard/reminders (14 viewports), Orb, Task copy and the new Creator workflow. Creator covers preview without mutation, malformed input, append, cancelled and accepted replacement, edit/reorder/add/remove, failed save/retry, project reload, local draft recovery, legacy metadata and 320/393/768/1280px layouts. Screenshots were visually reviewed.

Windows protected-folder writes interrupted the initial build/browser harness; verification completed using the identical source in an isolated temporary checkout with locked dependencies and repository history. React source was untouched; the rebuilt React hashes were not included in this native-only change. Production Firebase access, physical iOS/Safari behavior and the pre-existing simultaneous-edit conflict limitation remain unverified/unresolved. No production data or rules were changed.

### Timeline table import follow-up

The pasted Gaganyaan format exposed two gaps: `Assets Required`/`Timeline` headers and ranges such as `0–4s` were rejected, while paste alone gave no preview. The importer now accepts those headers, derives and preserves each shot's timing, previews complete tables automatically, and offers a transfer when a table lands in Full voiceover. The project page's advanced import also recognizes the four-column storyboard. Import still requires an explicit confirmation, and replacement still asks before removing shots. Focused tests use representative Hindi voiceover and the full 15-range, 154-second timing sequence without publishing the full user script as a repository fixture.

Verification: 34 frontend/domain tests and eight backend tests passed. The production build, site-reference check, and all six browser suites passed. Creator browser coverage includes automatic preview, source-field transfer, project advanced import, Firestore-shaped persistence, legacy metadata, failed save/retry, and 320/393/768/1280px layouts. No production account write was performed.

### New Content save visibility

A 15-shot import made the New Content save action difficult to find because it followed every editable shot. The dialog now scrolls beneath a visible action footer with the shot count, total duration, and a **Save and open project** action. The storyboard confirms that imported shots still need that save action. The project editor retains its automatic save behavior. Browser coverage checks footer visibility at the top and bottom of a 15-shot form at 320, 393, 768, and 1280 pixels, then saves and reopens all 15 shots in the controlled Firestore fixture.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. The new 15-shot save check passed at each viewport. No signed-in production write was performed.

### Table-first project page

The project page previously presented Script, Visual Bible, Import, and Produce as the main sequence, then wrapped the Storyboard editor in a second Storyboard heading. It now leads with one Shot table and removes the repeated column heading. Full voiceover and visual settings follow as optional panels; the old script splitter is retained in a closed alternative. The advanced prompt import and production workspace remain available. When an imported table meets an empty full script, narration is derived from the rows without overwriting existing scripts. The optional generator brief preserves each planned shot's order and duration rather than splitting the narration again.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. Creator browser coverage includes the table-first empty-project state, recording-script derivation, the prompt brief's preserved shot durations, hidden legacy splitter, existing metadata, and 320/393px project layouts. No signed-in production write was performed.

### Unified scene workspace

The project page now has one scene list. Each shot's four planning fields are followed by its Character, Image and Video prompt section, with an action to draft only blank prompts from the scene plan and shared visual settings. The separate production-card list was removed; its focused editor and asset tracker are available from the scene list. The advanced prompt importer remains under More tools. This reuses the current `scenes` array and Firestore save queue without migrating project data.

Verification: 34 frontend/domain tests, eight Functions tests, production build, site-reference check, and all six browser suites passed. Creator browser coverage checks prompt drafting without overwriting a manual character prompt, persistence after reload, focused production access, legacy metadata, failed-save recovery and 320/393px layouts. A local browser screenshot was visually reviewed. No signed-in production write was performed.


## Creator production workbench — October 20, 2026

Replaced the project storyboard composition with four shared-data views: Storyboard, Production, Assets and Overview. Added a desktop seven-column planning grid, mobile scene cards, editable prompts and task checklists, drag and keyboard-button reordering, duplication/insertion, method tags, Blender/AI/Editing queues, shared animation projects, local/external asset references, independent scene completion and reviewed script synchronization. The native page, authentication adapters, collection paths and rules remain unchanged. Legacy tools remain reachable below the new workspace.

New files: creator/production-model.js, creator/production-workbench.js, creator/production-workbench.css and tests/creator-production.mjs. Integration changes: creator/project.js, project.html, creator.js, index.html and storyboard-editor.js. Updated the Creator browser suite for the new interactions, and extended existing CI to include creator changes and the production build.

Verification before CI: all changed JavaScript modules and the browser test parse successfully in the available JavaScript runtime. Ten pure model scenarios pass, including 16 Hindi/English TSV scenes, Markdown, quoted multiline narration, mapping, duplicates, mixed workspace queues, shared Blender work without scene completion, linked assets/checklists, reviewed scripts and legacy JSON round trips. These checks ran with an isolated UUID stub; they are not browser, Firestore or Node production-build tests.

The session has no shell execution environment. A pull request runs the existing full unit/Functions checks, production build, site-reference checks and Chromium/Firefox browser workflows. CI results must be checked before merge. Browser screenshots and real signed-in Firebase permissions have not been established by the pure-model checks.

Remaining constraints: existing whole-document concurrent editing can overwrite another editor's work; project metadata shares Firestore's document limit; scene duration remains 1–60 seconds; no large-file upload/storage service was introduced; paragraph-based script synchronization needs one paragraph per scene. Local paths are references, and production account access is unverified.

### Browser verification follow-up

The native Creator browser workflow passed on CI run 39466128892: project creation with denied-save recovery, 16 Hindi storyboard rows, exact duplicate prevention, drag/button reordering, Blender/AI/Editing filtering, shared group tasks, independent scene completion, canonical generator briefs, reviewed script changes, local asset paths, Markdown import, duplication/insertion/deletion, reload/recovery drafts and legacy records. Layout assertions passed at 320, 393, 768, 1280 and 1920 pixels. Four fixture screenshots were captured; they do not establish physical-device or signed-in production behavior.

Browser testing exposed and fixed an asset metadata blur handler that could detach the next input and lose a typed path. The form now preserves focus and updates external-reference links inline. A test interaction was corrected to keep an already-expanded scene open while selecting its animation group. Duplicate matching now includes asset requirements and detailed prompt content so distinct production plans are not discarded. Full repository builds/unit/site/V2 checks have passed in CI; the final full regression run remains the merge gate.


## New Content workbench — October 20, 2026

The saved project page used the new production workbench, but + New Content still opened the old script-led dialog and four-field scene editor. Creation and metadata editing now embed the same four-view workbench as saved projects. Project title leads the form; format, stage, series, date, hook, script draft and notes remain under optional Project details. The wide responsive dialog keeps its create/save footer visible.

The dialog edits an isolated draft of scenes, animation groups and asset metadata. It performs no workbench autosaves before the explicit create/save action. Failed writes retain the same draft and ID; Cancel cannot mutate nested data on an existing project. Group and asset metadata are included in the existing creatorProjects write. Ownership, authentication, collection paths and rules are unchanged. Workbench buttons explicitly use type=button so adding/importing scenes cannot submit the creation form. Reopening the dialog resets it to Storyboard.

Extended Creator browser coverage checks TSV import with method/group columns before creation, prompt edits, Blender/AI queues, asset paths, no writes during preparation, persistence after create, cancellation isolation, default view on reopen, 320–1280px overflow and save-footer visibility, plus the existing full project workflow. Syntax checks passed in the session runtime; CI validation is pending. Signed-in production access remains unverified.


Removed the three redundant standalone panels below the saved-project workbench: Full-script draft, Visual settings and More tools. Canonical narration and reviewed draft synchronization remain in Overview; visual style, aspect ratio, language, character bible and continuity settings now live there too. The generator brief and explicit rough-script splitter remain available inside Overview. The single storyboard importer now accepts JSON scene arrays as well as TSV, Markdown and voiceover-only text. Removed the obsolete page-panel event wiring rather than leaving hidden duplicate controls.


### Interactive scene production table and combined filters

Replaced the old focused scene overlay with the same structured scene table used for planning. Open production table, scene details and restored legacy production state all stay in the modern workbench. Both Storyboard and Production now filter by method, asset/animation readiness, scene completion and narration/asset/group/file text. Blender + Ready shows only ready Blender work while retaining original scene numbering; readiness remains independent of final scene completion. Production keeps animation-project/scene/status grouping and inline phase controls around the table. The redundant full-script, settings and import panels are removed; their useful controls live in Overview or the single importer. Legacy generated-asset flags/links remain editable in expanded scene details.

New and edit dialogs share this complete workbench. Nested draft groups/assets are isolated until save, metadata fields remain optional, all non-submit workbench controls have explicit button types, and new/edit always open on Storyboard. Unit coverage adds mixed Blender/AI readiness and file search plus JSON import; browser coverage checks creation, cancellation, filtering, original scene state, modern production entry and responsive save controls. CI results remain pending for this revision.


## Compact Creator workflow — October 20, 2026

Reviewed creation, planning, production, assets and overview for repeated controls and unnecessary vertical space. Removed the second production-method selector, duplicated row/detail method controls, duplicated Editing checkbox, repeated top-level Production/Assets actions and duplicate hook/script/notes inputs from the creation form. These values remain editable in Overview and preserve the same document fields.

Scene rows now use compact one-line editors with optional manual resizing and stable focus height, with prompt/direction fields folded until requested. Phase buttons appear only for the active scene and selected production method. Tables default to eight scenes per page with Previous/Next and 8/16/All row choices; row-count preference is local display state only. Original scene ordering/numbering and method/readiness filters are unchanged. Assets use collapsed summaries; Overview shows four summary actions and five pending scenes instead of another complete scene-card list. The chronological script is a compact read-only preview, with one editable draft.

Updated the Creator browser workflow to exercise compact editor height, eight-row paging, original scene numbers on page two, retained All-row preference, a single method selector, focused progress controls, collapsed prompts, create/edit/cancel, imports, shared groups/assets, readiness filters, draft recovery and mobile/desktop layouts. Syntax checks passed in the session runtime. CI results pending; no signed-in production access claimed.


## Icon-led Creator controls — October 21, 2026

Replaced written method chips and repeated scene action labels with inline SVG controls, retaining accessible labels, native tooltips and visible checked/focus states. Desktop scenes keep methods, readiness, completion and actions on one row. Move up/down remains in expanded actions; drag ordering remains in the row. Production grouping joins the existing filter bar. Import and shared projects use short toolbar disclosures; repeated tab headings, slogans and helper paragraphs are removed. The creation form retains one title, the shared workbench, optional metadata and concise save actions. Mobile uses icon navigation and compact scene cards with touch-sized controls. No cloud fields, paths, rules, imports or production flags changed.

Extended the existing full browser workflow to check accessible copy actions, one-row desktop filters/methods, compact row height and expanded reorder actions. All existing import/group/progress/persistence/recovery/legacy/responsive checks remain. Session JavaScript syntax checks passed; CI validation pending. Production signed-in access and physical devices remain unverified.


## Readable selected scenes and compact project chrome — October 21, 2026

Selected scene rows now grow narration, visual, asset and opened prompt fields to their full text, with a 100px minimum for planning fields. Other rows stay compact. Opening another scene exits Expand all and keeps only that scene open. The explicit Expand all control applies to the filtered, paginated scene list; method, readiness, completion and search filters remain in force. Growth recalculates on edits, disclosure and viewport width changes. No scene content or production flags change when expanding.

The saved-project header removes the repeated format/series/stage string and access/email lines. Existing metadata is retained. Title, counts, sharing/access and sync use one desktop row and two mobile rows. Routine sync feedback is an accessible icon with a tooltip; failures still show text, and sharing still requires the existing owner permission. Own-account/owner emails no longer appear in routine page chrome. Workbench tabs and Import/Projects/expand/add actions now share one row, with filters beneath; opening Import/Projects deliberately reveals its editor.

Browser coverage adds long-text growth without internal overflow, single-scene switching, filtered Expand all, icon sharing, routine email-free sync and readable failed-save feedback. Existing creation, imports, production, grouping, script, assets, recovery, legacy and responsive tests remain. Session JavaScript syntax checks passed; full CI pending. Real signed-in permissions and physical devices remain unverified.


## Scene navigator and active editor — October 21, 2026

Replaced the spreadsheet scene table with a default focused workspace: an independently scrollable 22% navigator and one active editor. Sidebar entries keep original scene numbers, timing and narration previews; drag grips reorder the existing scene array. Sidebar collapse, scene jump and Previous/Next use the same filtered queue. Production uses the same editor, with animation-project/scene/status groups in its navigator. Selection, filters and edits survive mode/tab changes.

All Scenes is an explicit alternate overview: every filtered scene in original chronological order (Production retains its selected grouping), collapsed by default. Individual expansion and Expand/Collapse All use the same scene renderer. Removed table columns and row pagination. New scenes, duplicate/delete, method tags, scene state, imports, shared group tasks, asset metadata, canonical script review and save/recovery all reuse existing model/events and Firestore paths. No schema or permission changes.

The editor has full-width voiceover, visual and asset fields; prompt fields are directly available in an open section. All expanded scene textareas grow on edits, disclosure and width changes without internal scrolling, with restrained minimum heights. Compact method/status/duplicate/delete controls sit above the writing. Styling uses Roboto/Noto Devanagari/system fonts and restrained purple/cyan Material-style surfaces. No media/upload/preview panels were added.

Updated the full Creator browser workflow for one-scene defaults, 16-entry navigator, filtered Previous/Next, sidebar collapse, long Unicode/multiline text across viewport changes, navigator drag, mode/selection retention, collapsed/all expansion and no table markup. Existing TSV/Markdown, create/edit/cancel, copy, group/progress, assets, script review, failed-save recovery, legacy and responsive coverage remain. JavaScript syntax checks passed in-session; CI pending. Real signed-in Firebase permissions and physical devices remain unverified.


## Viewport scene desk and numbered rail — October 21, 2026

Routine scene work now uses Plan / Prompts / Progress sections rather than stacking every field and phase control beneath narration. Prompts shows one selected prompt with a direct copy action; all existing prompt fields, metadata and phase/checklist actions remain accessible. Focused saved-project editing fills the viewport, with fixed controls and one editor overflow fallback for unusually long text. Individual scene textareas still grow to full content without their own scrollbars. All Scenes, Assets and Overview retain their appropriate list layouts.

The scene rail displays only original scene numbers. Completed scenes are green, scenes with production/editing work are purple, and planned scenes are neutral. The color uses existing actual task and completion state; Blender readiness alone never becomes scene completion. Native tooltips and accessible labels retain readable state; a border distinguishes selection. Drag reordering remains on the numbered button.

Creator opts into a 48px compact navigation using the existing shared registry and More dialog. The app-menu button exposes the same destinations on desktop and mobile; other pages keep their existing navigation and saved mobile preferences. The routine bottom bar is omitted only in compact Creator navigation.

Added viewport checks at 1440×1000, 1366×768, 1280×720, 1024×768, 393×852 and 320×700, plus normal-plan fit, section switching, prompt copy and completion colors. Navigation tests cover the compact app menu at desktop/mobile widths as well as unchanged standard navigation/preferences. JavaScript syntax checks passed; full CI pending. Live browser inspection confirmed the old top bar, but this cloud browser is signed out and blocks local file previews. No production account data was changed. Extremely long scene text may require scrolling the editor pane; it is never clipped to force a fixed screen. Real signed-in permissions remain unverified.

## Creator Studio approved design — October 21, 2026

The storyboard now follows the agreed graphite/cyan design: a scene navigator with timeline, status and narration preview, a single active scene, and two writing columns with Voiceover/Visual on the left and Assets/References on the right. Fields continue to auto-expand without inner scrolling; long content remains reachable in the editor. Laptop-height layouts use compact spacing. Previous/next, ordering, duplicate/delete, prompt and production controls continue using the existing workbench state and project save queue. Copy buttons copy the exact field text, and sidebar previews update without moving the editing caret.

Creator opts into a direct icon navigation rail through a data attribute. All links still come from shared/navigation.js; other modules retain their navigation. Desktop project tabs and actions occupy the existing two header rows. On mobile, page icons remain directly reachable, scene numbers retain status colours, and a filter toggle exposes the existing method/asset/completion/search controls. Scrollbars use a thin blue/cyan thumb and dark track in both Firefox and Chromium.

The same workbench is used when creating content and editing projects. No Firebase schema, rules, auth, asset upload, narration format, or storage path changes. Browser coverage includes TSV/Markdown import, filtered queues, groups, independent completion, draft recovery/reload, long expanding text, direct navigation, copy, and responsive widths. Real signed-in production permissions still require a manual check; fixtures do not establish them.

## LIC Scene 1 loading, Hindi-English and footer — October 25, 2026

Updated only the existing Bima Platinum presentation. Scene 1 now uses Hindi-English visible copy, Devanagari fonts, advisor script and Stage 2 placeholder. Growth/Opportunity/Control and risk-factor chips remain absent; the businessman remains silent. The advisor and Stability controls flow within one footer, so translated text cannot overlap the audio control. Calculator links outside the scene remain available only in developer mode.

The initial scene PNG is 2,304,794 bytes. Same-scene WebP variants are 44,558 and 96,422 bytes, selected by viewport/DPR, preloaded with high fetch priority. The original source PNG is retained. The supplied screenshot showed image alt text; live inspection loaded the original PNG successfully, so the historical failed request's exact cause cannot be established. The change reduces transfer cost; no measured network speedup is claimed. A top-edge mask conceals a baked-in icon fragment in the supplied scene.

The professional Hindi female MP3 belongs at `lic/bima-platinum/assets/audio/advisor-scene-1-hindi.mp3`; it is not supplied or generated. Browser speech is explicitly opt-in, preventing an arbitrary voice when the recording is absent. Audio loads on tap, supports pause/resume/replay, and stops on Stage 2, hidden document and page exit. Pending failures cannot start late speech. The Stage 2 placeholder restores focus on dismissal; native button keyboard behavior is preserved.

Validation: production build, all 50 existing frontend tests and 8 backend tests, 5 focused presentation tests, site-reference checks, JavaScript syntax and diff whitespace checks passed. Full browser regression command was attempted but cannot launch the repository's missing Chromium executable. The cloud browser cannot reach the local preview server. Mobile layout and actual MP3 playback on physical devices remain unverified; no signed-in Firebase data or auth changes are involved.


## Direct Creator scene completion — October 25, 2026

Removed the scene-completion gate from the status selector and the derived completion check. The existing completed flag is now an explicit creator decision. A 44px-high Complete action lives at the lower right of every expanded scene, outside the focused editor scroll pane, with space for the shared assistant launcher. It changes to Completed and supports reopening. No asset uploads, linked files, production flags, voiceover/editing flags or checklists are required or silently marked done. Group tasks and other scenes remain independent. Project progress counts completed scenes plus tracked tasks for pending scenes; shared-task totals no longer depend on scene ordering. Existing edits that invalidate completion still reopen the scene.

Model and browser regressions cover direct completion with unfinished mixed-method work, shared groups, missing asset references and checklists; button/dropdown consistency; reopen; Completed rail state; project progress; reload; failed-save draft recovery; All Scenes; and reachable unobscured actions at 320/393px and desktop widths. Compact laptop field spacing preserves the existing normal-plan no-scroll check. Native import versions are bumped so existing browser sessions receive the change.

The full browser run found a pre-existing navigation fixture expecting shared dashboard chrome on the now-isolated Bima Platinum presentation. That case now verifies the existing Back/Home exits and absence of shared chrome; six other native mounts keep their original assertions. No LIC runtime or shared navigation code changed.

Validation: 61 frontend/domain tests and 8 Functions tests, production build, site reference check, V2 build/stage reproducibility and Chromium V2 smoke passed locally. The full Creator and repository browser workflows passed locally. CI also passed the V2 Chromium/Firefox suite; an existing timestamp wait was made safe while the first imported scene is still awaiting its asynchronous save. Final CI verification is being completed before merge. Tests use controlled storage; production Firebase permissions and physical-device checks remain unverified.

## Dashboard canvas, ideas and Journal tools — October 26, 2026

Added free panning/zooming to the main Dashboard scene, compact Home/zoom/select/Ideas tools, local area capture and account-owned saved ideas. Existing two-region navigation and all task workflows are retained. A snapshot is an image plus view metadata, not an editable copy of its source widgets. The capture module is lazy-loaded; WebGL supplies a fresh frame on request without enabling preserveDrawingBuffer or changing idle rendering budgets. The on-demand idea shelf supports title, category, notes, failed-write retry with a retained draft, image download and return-to-view. Today’s Plan now has an orb-centre entry on phone and desktop, with the current task preview on phones and a shared queue drawer.

Refined Journal icons and added 24 presets, unrestricted custom RGB/hex colours, recent colours, independent pen/highlighter width/opacity and whole-stroke/area erasers with size and cursor feedback. This uses the existing renderer and stroke persistence. The original Journal React source is missing; a narrowly scoped settings extension to its existing bundle bridge connects the new readable adapter. It does not rebuild or replace the Journal app.

Validation is in progress. New pure tests cover unbounded signed camera positions, point-preserving zoom, reverse-direction crop selection and bounded idea records. Chromium feature scenarios cover pan/zoom/reload, real DOM crop rendering, explicit save, denied-write retry, draft recovery, account separation, phone plan access and atomic plan changes. Journal fixtures execute the exact active bundle settings bridge and stroke renderer, checking custom ink pixels, transparent area erasure, whole-stroke mode, per-tool preferences, selection-mode synchronisation and phone/tablet panel bounds. These fixtures do not establish production Firebase permissions or physical Pencil behaviour. Existing full repository and Chromium/Firefox V2 checks remain the merge gate.

Limits: snapshots capture the current visible dashboard area and may use system-font fallbacks; Safari and physical-device capture are unverified. The shelf shows the latest 40 records, and previews are deliberately compressed. The main dashboard camera is free; My Workspace retains its existing board layout. No Journal canvas geometry migration is included.

## Journal free canvas — October 26, 2026

Applied the requested free movement specifically to Journal: unbounded signed panning, bounded zoom, Home/Fit, touch pan/pinch and a compact capture action. The readable viewport adapter shares the existing Journal API and storage. A narrow patch to the single active bundle connects its renderer, pointer mapping, live eraser and existing authenticated Firestore SDK. The missing original Journal React source remains a maintenance limitation; the main React build does not regenerate this bundle. Existing Dashboard improvements remain.

Journal captures reuse Dashboard Ideas, with Future idea / YouTube idea / custom category, notes, draft recovery and retry. Dashboard return actions now distinguish Journal captures from Dashboard captures. Selection/text overlays follow the camera, and cross-date/account text commits are guarded. No auth/rule broadening or destructive migration.

Verification: Journal browser fixtures execute the active bundle bridge and renderer and cover camera movement without stroke mutation, world mapping, mode transitions, compressed capture, denied-write retry, draft resume, saved date/view restoration, phone finger panning without ink and finger capture. Full repository checks and V2 browser verification are the merge gate. Native-style layout checks at 320, 393 and 1440px verify that the legacy 1,800/2,200px page is replaced with a screen-sized canvas and its backing store resizes with the viewport. Other Journal sections retain their existing scrolling. Production signed-in permissions, physical Pencil and Safari remain manual checks. Fit uses stroke-point bounds; text can extend beyond those bounds. Saved captures contain the visible selected area only; camera settings are local per account/day.

## Fixed dashboard and reactive Orb — October 26, 2026

Supersedes the earlier Dashboard free-camera/capture UI. The dashboard now uses its fixed responsive layout again; the finite Main Dashboard/My Workspace navigation remains. Removed the dashboard camera, zoom/capture toolbar, capture renderer and html-to-image dependency. Journal pan/zoom/capture is unchanged. A header Ideas icon retains access to Journal captures, previous Dashboard captures and recoverable drafts. Previous images are not deleted; old Dashboard return actions now return to the fixed dashboard and ignore obsolete camera preferences.

Today’s Plan is larger, gold and centred in the Orb; the active-task shortcut sits below it. All nine destination icons are larger with titles underneath. Header account actions fit small screens using accessible icon controls. The background network uses 64–90 particles on phones and 110–170 on larger scenes, with nearby connectors, cursor links and eased repulsion. It stops while hidden/offscreen and honours reduced motion. Rich dashboard Orb themes have more streams/flecks and stronger cursor influence: cyan aurora bands, emerald organic filaments and gold orbiting filaments. Existing non-rich Orb particle budgets and scheduling remain. No new dependency, auth, Firestore schema or permission change.

Verification covers fixed layout despite old saved camera state, absence of dashboard capture controls, saved Journal idea reopening/account isolation, atomic Today’s Plan actions, particle links and reduced motion, desktop/mobile layouts and finite touch workspace navigation. Orb WebGL checks cover rich-theme rendering/density/mouse response plus existing resource cleanup, context recovery and bounded frame scheduling. Production build, unit/Functions checks and full repository browser tests passed locally; full Chromium/Firefox V2 CI is the merge gate. Physical-device animation performance and production signed-in permissions are not established by fixtures.

## Scattered Orb destinations — October 26, 2026

Restored loose, uneven desktop placement of the nine Orb page destinations, closer to the earlier constellation layout. Kept the enlarged icons, titles below, centred gold Today’s Plan and existing mobile grid. Only the nine CSS positions change; no interaction, state, auth or persistence changes. Production/V2 builds, stage/site checks, 18 V2 tests and the Chromium cosmetic smoke check passed. The desktop preview was reviewed for label spacing and centre-control clearance.

## LIC contact availability — October 27, 2026

Extended the existing Follow-up Manager with one Contact Availability selector: All Policies, Mobile Available, No Mobile, OP-NAP Available, No Mobile + OP-NAP and Neither Available. It combines with the existing search, View/outcome, Plan and archive scope. Option counts use those other filters and are calculated in the same single pass as the displayed result; selecting a contact group resets pagination. Phone layout gives contact availability its own full-width row above View and Plan. Result counts are announced through the existing list area.

The classifier reuses current-phone validation and the wrong-number flag, honours manual corrections, excludes blank/NA/zero/invalid numbers, and treats OP_Neft1/2/3 as the existing mapped opPolicies references. Empty/NA/zero-only OP placeholders do not count as references. Legacy OP views now use that same reference check. No customer data, import/history write path, Firebase schema, rule or auth policy changes. Native module/CSS versions are bumped together to avoid mixed cached imports. Existing account changes reset the new filter along with search/View.

Focused tests cover all six groups/counts, mobile placeholders and country prefixes, corrected/reported-wrong phones, each imported OP column, combined search/plan/status and archive scopes, reload, pagination reset, unchanged stored records/history and zero transactions while filtering. Browser checks cover 320, 393, 768 and 1440px layouts and retain the full import/history/retry/account-isolation workflows. Production/V2 builds, stage/site checks and unit/Functions tests pass; full repository/Chromium/Firefox CI remains the merge gate. Controlled fixtures do not establish production signed-in permissions.

## This-policy NEFT, OP-NEFT and coloured cards — October 27, 2026

Corrects the earlier OP-NAP terminology following the user’s clarification: OP_Neft1/2/3 identify other policies with NEFT registered. Inspected the original Library CSV’s headers and aggregated Status vocabulary; no customer rows or CSV were copied into the repository. The report has no dedicated current-policy NEFT column, and its general Status contains policy/claim states. Current-policy NEFT therefore remains independently Yes/No/Unknown, with Unknown as the default.

Added an optional NEFT import mapping with strict recognised Yes/No values, a separate context-counted NEFT filter, and a manual override selector inside the existing mobile/update section. Overrides survive reimports and can be removed with Use CSV. The existing atomic response/history write and stable retry ID are reused; no extra collection, rules, auth flow or contact-attempt side effect. Unedited NEFT form state is not sent, preserving concurrent remote corrections. Read/display does not migrate or rewrite old records.

Cards have independent labelled availability badges: blue Mobile, green this-policy NEFT Yes, violet OP-NEFT, red this-policy No and neutral Unknown/unavailable. The left accent uses this-policy NEFT Yes > OP-NEFT > usable mobile > missing; it does not represent follow-up completion. Mobile filter order is Search, Contact Availability, This-policy NEFT, then View/Plan. Empty/NA/zero OP placeholders are excluded from display as well as filters without mutating stored references. Native module/cache versions match.

Validation covers explicit/ambiguous/missing NEFT imports, no inference from general Status or OP references, corrected/manual/source precedence, blank/old imports retaining data, combined facets/counts, independent card channels, stable retry after lost acknowledgement, NEFT history, source reset, no fabricated calls, remote-update preservation and 320–1440px layouts. Full repository browser regressions and the Chromium V2 suite pass locally. Production/V2 builds, stage/site checks, 86 frontend/domain tests and eight Functions tests pass (one optional private CSV fixture skipped). Chromium/Firefox CI remains the merge gate. A future explicit NEFT column or a manual update is required to populate current-policy status for existing records; no bank registration is queried automatically. Physical devices and real signed-in production permissions remain unverified.


## LIC workspace separation and customer CRM — October 28, 2026

Replaced the presentation-heavy LIC landing page with three compact routes: My Follow-ups (staff), Customer CRM (customer/policy records) and Agent Tools (existing plan sales presentation/calculator). Follow-up chrome now labels staff work. Existing follow-up URLs, imports/history and presentation implementations remain unchanged. No financial product claims were added.

CRM adds private customer CRUD editing (create/update; no customer delete), multiple policies, manual premium dates, search and due buckets. Model tests cover India date rollover, leap dates, exact due-window edges, missing/zero premiums, leading-zero policy numbers, field validation, search and transaction revision/idempotency behavior. Browser fixtures cover separate routes, escaped customer text, reload persistence, denied/uncertain save retries, concurrent edits, account changes and 320–1440px layouts. These fixtures never use production Firebase.

Validation: production build, V2 build/stage reproducibility, site-reference checks, 90 frontend/domain tests and eight Functions tests passed locally (one optional fixture skipped). The complete native browser suite and Chromium V2 suite passed locally, including CRM 320–1440px screenshots, long email wrapping, stale-account rejection and retry/conflict checks. The packaged headless Chromium shell works in this environment; the full Chrome executable cannot create its singleton socket. Firefox CI verification remains pending. Real signed-in production permissions and physical devices remain unverified.


## Larger globe and icons on its surface — October 28, 2026

Expanded the Dashboard globe to fill its existing anchor rather than occupying only the inner 60% of its canvas. The anchor and icon layer share one size; nine stable, irregular positions now sit inside the visible particle globe. Mobile/tablet uses that same square stage instead of a separate three-column icon grid. Compact Workspace orb sizing is unchanged. Desktop focus/timer/work summaries stay around the enlarged centre. No renderer algorithm, particle budgets, navigation handlers, auth, tasks or stored data changed.

Validation: production/V2 builds, stage reproducibility, 18 V2 unit tests, the Chromium cosmetic smoke test and site-reference checks passed. Additional controlled browser inspection captured 1920×1080, 1440×900, 1366×768, 768×1024, 393×852 and 320×740. Checks verify one coincident orb/icon stage, all nine icon centres within the globe, no below-orb grid, separate ≥44px link hit areas, no covered icons or outer horizontal overflow, and a working centre plan action. Desktop and phone screenshots were visually inspected. Screenshot records are synthetic; physical devices and production sign-in were not tested for this cosmetic change.


## User-provided Invincible app icon — October 29, 2026

Prepared the supplied blue I / gold particle globe artwork as browser favicon sizes, a 180px Apple touch icon, 192px/512px PWA icons and a separately padded 512px maskable icon. Image resizing retains the full composition; only the maskable variant adds a black safe-area margin. The existing PWA ID, start URL, scope and display settings stay unchanged. Root/native page headers and the V2 source template now reference the same branding assets. The older SVG remains available at its existing URL for cached clients, but is no longer the manifest icon. No dashboard app-bar components, user data, authentication or service-worker behavior changes.

Checks: verified raster/ICO dimensions, all 19 HTML icon heads and manifest file references. Production/V2 builds, site checks, 90 frontend/domain tests and eight Functions tests passed (one optional fixture skipped). The user explicitly approved publishing the complete app-icon and orb update to the existing public invincy/invincible repository on October 29, 2026.

## Workday office cases — October 31, 2026

Workday defaults to a private case list; the former Workday tool remains under Report Generator. Existing report storage and shared spaces are preserved. New case metadata/entries use owner-only paths, transaction revision checks, idempotent retries and account guards. Photos are bounded compressed JPEGs in individual Firestore documents, not a growing case array. Completion hides a case from Active while retaining its notes and documents.

Local validation: production build, site reference check, frontend/domain and Functions tests passed (one existing optional sample test skipped). Browser QA using synthetic data confirmed create/reload, photo attachment, denied-save form/photo recovery, successful retry, later note history and report-tab navigation. Full repository browser regressions are covered by the PR workflow. A signed-in production Firebase test and physical-device camera test remain outstanding.

Workday compact layout follow-up: removed the LIC OFFICE eyebrow, large page headline and tagline. Sync state and New case now share one compact toolbar, and the existing counts occupy one inline row. Reduced top spacing on desktop and phone; case behavior and storage are unchanged. The browser navigation check waits for the filter controls instead of the removed headline.

## Workday save history and LIC palette — October 31, 2026

Successful case saves now append an automatic dated activity entry, including updates without a note. Creation/save metadata and history entries share the same transaction, operation ID and account/revision checks. Server timestamps drive display where available; existing creation milliseconds remain the fallback, and unknown dates are not invented. Mobile cards expose the last saved time. Workday and Report Generator share an LIC blue/yellow palette; the connected-dot SVG geometry and compact layout remain.

Focused model/storage tests cover atomic denial/retry, one automatic event per operation, status-only saves, stale/wrong-account rejection, legacy dates and server-time ordering. Full repository checks and the browser fixture cover the updated history and responsive screens. Production account permissions and physical camera capture remain unverified.

## Shared app logo — October 31, 2026

The shared React header, loading/sign-in/error states, spatial header and native navigation now render the existing approved orb logo using one shared branding URL. Mobile spatial headers retain the logo instead of hiding the mark. Removed the CSS placeholder frames/gradient. The app ID, start URL, scope and icon artwork stay the same. The manifest now versions each approved PNG URL by its content hash so browsers can detect an icon update. This fixes in-app branding; installing the app again cannot replace a hardcoded header. Installed launcher updates remain browser-managed and may require identity-update approval.

The navigation browser fixture serves PNG bytes correctly and verifies the logo decodes in native and React headers. A shared-shell Workday preview verifies phone placement. Full repository checks cover the shared UI and staged spatial build; no auth, data paths or ownership rules changed.


## Shared black theme and installed icon refresh — October 31, 2026

`shared/app-theme.css` gives the React shell, spatial dashboard and native pages a pitch-black canvas/header with neutral near-black surfaces. Module accents remain on actions, borders and status indicators; Workday keeps LIC blue/yellow and its connected-dot SVG. Journal drawing paper, media and presentation artwork remain content rather than being recolored. The AI widget iframe retains its transparent host background. Browser theme-color and PWA launch background are black. Native stylesheet versions were bumped so existing clients fetch the theme import.

The manifest icon URLs include content hashes while preserving the manifest URL, ID, scope and start URL. This requests browser detection; it cannot bypass Android/Chrome identity-update approval or guarantee a launcher refresh. Chrome 144+ can offer **Review app update** in the installed app menu. No service-worker forced reload is introduced, so unsaved editors are not interrupted.

Validation: root/Functions tests, production build, V2 build/stage and site reference checks; shared-shell Workday phone preview verifies the real header image, black canvas, LIC accents and connected dots. Full browser CI covers existing workflows across Chromium/Firefox and native navigation. Physical-device launcher approval remains a manual check.


## Small icon clarity — October 31, 2026

Replaced the dense orb artwork at icon sizes with a clean geometric blue I and gold ring on black. `assets/branding/invincible-icon.svg` is the source for the site favicon and shared headers; PNG exports cover browser/Apple/PWA sizes, including a safe-area maskable icon. Each manifest PNG URL has a new content hash so Chrome detects the artwork change. The PWA identity and storage paths are unchanged. Verify actual 24px and 64px legibility before publishing; existing browser navigation checks confirm decoded icons. Chrome may still require user approval to apply an installed icon update.

## LIC Agent CRM — November 2, 2026

The CRM is a native agent workspace with LIC blue/yellow accents on black, separate
from My Follow-ups and old customer data. The revised scope removes all CRM Cloud
Functions and scheduling: browser code uses the shared Google identity/Firestore
Web SDK, calculates due/verification views on opening/resume and prepares messages
for manual sending. Unrelated existing AI Functions and all Journal files remain.
Journal's independent panel fix is in draft PR #122.

New Firestore rules enforce workspace ownership, editor/viewer roles, verified-email
invitation acceptance and revocation, immutable source/history, server actor stamps
and root revision serialization. Client validation is not treated as authorization.
Actual Web SDK/emulator rules tests and browser tests are wired into CI. Pure
repository/domain checks and site references pass locally. Local emulator startup
was blocked by package download approval; do not claim local rules tests passed.
No rules or production database changes have been applied. Personal CRM uses the
existing owner-only user paths; shared creation stays disabled unless its new
permissions are present. A one-time rules update enables collaboration, without
a Cloud Functions deployment. Emulator/browser coverage includes the original
rules to verify that private use is not blocked by sharing setup.
Full scope, deployment and limits are recorded in [lic-agent-crm.md](lic-agent-crm.md).

## LIC cash counter — November 3, 2026

Added a native Cashier page to the LIC hub. Opening denominations, one or multiple amounts per entry, 1/5/10/100-note increments, direct count entry, received/returned cash, loose change, live differences, persistent transaction logs and final denomination balances reuse shared navigation and the existing Google session. Next Transaction saves without confirmation. Close Counter confirms, then atomically saves the final balanced entry and closes the session. Expected balances include opening cash and denomination-specific change; physical reconciliation remains the cashier's responsibility.

New owner-scoped Firestore paths are documented in firebase-storage.md. Stable entry IDs prevent duplicate retry writes; transactions read the latest balance, reject negative denomination counts and closed counters, and compare already-saved payloads before acknowledging a changed retry. Opening uses a transactional active-counter pointer. Account-generation and UID guards reject stale callbacks/in-flight writes. Recovery drafts are local per account and counter. No existing records, rules, Firebase configuration, shared page registry or React bundles changed.

Verification: all three new model tests and the focused Cashier browser suite passed. The browser suite covers combined premium amounts, count increments/direct entry, cash/change validation, denied writes, lost acknowledgements, reload/draft recovery, cancellation/confirmation, saved logs, final counts, account switches during saving, and 320/393/768/1440px layouts. Existing LIC CRM browser tests passed with the four-shortcut hub expectation. Repository unit/Functions tests passed (131 frontend passes, 2 existing optional skips; 8 backend passes), as did the site reference check, production build, V2 build/stage and whitespace check. The broader Chromium browser run passed Garage, navigation, reminders, Orb, clipboard and Creator before stopping at the existing Journal tools addStyleTag call (tests/journal-tools-browser.cjs:56). V2 Chromium scenarios passed; the full suite could not launch the unavailable Firefox binary. These failures are outside the changed Cashier paths. Real signed-in production Firebase permissions and physical touch-device behavior remain unverified.

### Cashier entry flow and themes — November 3, 2026

Publication follow-up separates amount entry from denomination counting, with explicit numbered steps, a Count Cash action, Edit amounts without losing counts, collapsed optional references, and a persistent balance/status beside Next Transaction and Close Counter. Empty-counter closing is still available from the amount step; only closing asks for confirmation. Invalid hidden cash input cannot bypass validation after switching steps. The cashier page hides the floating AI widget so it cannot obstruct its controls; the AI navigation destination remains available.

A small pre-style script applies the system light/dark preference before rendering. Explicit Light/Dark selections persist locally and respond to same-origin preference changes. Theme variables and navigation/dialog overrides are scoped to Cashier, leaving other routes and shared theme files intact. The existing account/data paths and transaction arithmetic are unchanged.

Focused model/browser verification passed, including theme selection and reload persistence, light canvas styling, both steps and preserved note counts, blank-counter closing, rejection of invalid cash after leaving the count step, and both themes at 320/393/768/1440px. Screenshots were inspected. The repository unit/Functions tests, site references, production build and V2 build/stage also passed. The original PR's complete GitHub Actions verification passed before this follow-up; the final branch is checked again before publication. Production Firebase account permissions remain a separate real-account verification.

### Cashier sketch layout and zero opening — November 3, 2026

Replaced denomination cards and the global increment selector with the user's sketched rows: ₹500/₹200/₹100/₹50/₹20/₹10, each with +5/+10/+50/+100, an exact note count, single-note correction buttons and a row total. Coin rows are expandable below the notes; miscellaneous change remains separate. Rows adapt to two lines on narrow phones and stay aligned in columns on desktop. Both existing themes and the received/change separation remain.

Removed the opening-cash screen and Start Counter action. After auth restores, an existing open counter resumes; otherwise a zero cash counter opens automatically into the amount-entry step. The existing transactional active pointer, stable opening ID, account-generation guards and retry control handle concurrent/failed openings. Old counter balances and history are preserved, including nonzero legacy opening cash. The native CSS and entry script have matching version queries so cached old startup code cannot run against the new markup. No storage schema, auth or permission changes were made.

Focused model and browser coverage checks automatic zero opening, absence of a start page, per-row increments and correction, row totals, multiple amounts, change availability, final zero-based totals, drafts/retries, old counter history, account switches, failed/uncertain openings and both themes at 320/393/768/1440px. Desktop and phone screenshots were inspected. Repository unit/Functions tests, production and V2 build/stage, site references and whitespace checks pass locally; complete remote verification runs before publication. Real signed-in production permissions remain unverified.

### Compact cashier controls — November 3, 2026

Added an explicit +1 to the shared +1/+5/+10/+50/+100 increment row for every denomination. Removed the duplicate plus control beside the count field; the minus correction and direct field remain. Removed the page tagline, counting instructions and closing-summary explanation, shortened labels and routine statuses, and reduced repeated receipt metrics to received cash and change. Critical validation and offline/authentication errors remain visible. Matching asset versions prevent mixing old scripts with the changed increment markup.

Focused model/browser checks pass, including the exact five +100 taps then +1 = 501 notes scenario and its ₹500 row total of ₹2,50,500, uniqueness of the +1 control, absence of instructional paragraphs, save/change checks, recovery, account isolation and both themes at 320/393/768/1440px. Screenshots inspected; site references and repository unit/Functions/build checks run before publication. No persistence, authentication or accounting rules changed.

### Cashier single-screen workspace — November 3, 2026

Removed the two-step amount/count flow and its progression button. The primary viewport now contains one amount field, all six denomination rows with +1/+5/+10/+50/+100 and direct counts/totals, received/returned mode, coin/miscellaneous controls, live difference and the two transaction actions. The shared global bars are hidden only on Cashier; its compact header keeps a LIC exit and menu. Counter history, themes and log access move into the menu; multiple component amounts/references and detailed coin counts use secondary dialogs. Long history or component lists may scroll inside a dialog, while the primary work surface fits the viewport. Existing old draft stage fields are ignored, not migrated. Input Done and note tapping dismiss the virtual keyboard. The amount dialog exposes validation inline.

Browser checks assert both amount and note controls are simultaneously visible without any progression button, no page overflow or scroll offsets, no clipped main content, and actual center-point hit targets for every quick button, count, amount and bottom action. These checks run in both themes at 320×568, 354×480, 354×640, 360×640, 393×740, 430×820, 768×1024, 1440×900 and 844×390, with wheel attempts and screenshots. They also cover 501 notes, multi-amount validation/reload, coins, hidden history/log access, old summaries, denied saves, uncertain acknowledgements, closing confirmation, zero startup and in-flight account changes. Physical soft keyboards and browser zoom remain device checks; desktop viewport fixtures cannot establish them. Model tests and site references also pass. Persistence paths, rules, authentication and transaction accounting are unchanged.

### Cashier quick review and spacing — November 3, 2026

Added Previous directly to the compact cashier header. It opens the latest saved entry for the selected counter in read-only detail, with Older/Newer controls and All to return to the full log. Entries are displayed by their saved sequence, with timestamp fallback, without changing records. The review header/navigation stay visible when long details scroll. The current amount, denomination counts, local recovery draft and backend records remain untouched while reviewing. The shortcut disables for an empty log, pending save or signed-out account, and clears on counter/account changes.

Quantity buttons now have content-weighted widths: +1/+5 are narrower than +10/+50/+100. Row gaps are reduced and the working form is bounded to 600px width / 640px height on larger screens; landscape expands only when needed to keep all controls usable. The Coins button no longer stretches into a full-width blank surface. Both themes and the normal no-scroll workflow remain.

Focused browser coverage checks latest/older/newer/all review, sticky navigation, unchanged backend/draft values after review, disabled shortcuts on sign-out, proportional button widths and visible/unobscured controls in both themes across the phone/tablet/desktop/landscape matrix. Existing cash, close, retry and account-isolation scenarios also pass. Local unit/Functions, production build and reference checks run before publication; physical mobile keyboards and production Firebase permissions remain separate live-device/account checks. No persistence paths, authentication or accounting logic changed.

### Cash entries list and balanced controls — November 3, 2026

Renamed Previous to Entries and removed the single-entry Older/Newer/All view. Opening either Entries or the menu's Cash entries action now shows the saved list collapsed, each summary containing only the entry number and amount. Expansion reveals time, optional component/reference details, used received denominations and used returned denominations. Zero denomination/loose rows and wholly zero returned-change sections are omitted. The closing table uses the same nonzero-only presentation; computed totals still use every stored denomination. Open rows survive live list updates, while reopening the dialog starts collapsed. Source records and the current draft are unchanged.

Removed the 640px viewport-height cap responsible for the large unused bottom area. The amount is spaced lower on taller screens, rows use the full available height, quantity buttons have compact rounded surfaces and bounded content-based widths, and received/returned tabs fit their labels rather than stretching across the page. Narrow and landscape layouts retain the no-scroll working surface. Asset versions change together.

Browser verification passes for collapsed-first lists, expansion, nonzero-only received/returned rows, omitted zero-change sections, preserved backend/draft values, proportional bounded buttons, content-sized mode tabs, amount placement and bottom-screen use. The existing phone/tablet/desktop/landscape matrix passes in both themes, including no clipped/obscured controls, wheel attempts, 501 notes, coin dialogs, saves/retries, zero counters and account isolation. Main screens and expanded/collapsed entries were visually inspected. Local repository unit/Functions tests, production build and references pass; final online checks run before publication. No Firebase paths, permissions, authentication or cash arithmetic changed. Physical keyboard/zoom behavior and signed-in production permissions remain real-device/account checks.


### Bima Platinum opening graph and replacement narration — November 3, 2026

Refined only Pages 1–3 and the shared graph/audio behavior needed by them. The existing original SVG figure still moves between its hosts, with stable axes/grid/data across the three states. Business has overall growth with dips and brief external-factor cues; Page 2 adds a separate lavender Share Market allocation; Page 3 keeps both visible behind a gradual gold Stable Allocation. Titles are minimal. The advisor stays secondary and clear of labels, and the existing navigation/transitions remain. No product label is introduced before Page 4.

Installed the supplied `newpage1.mp3`, `newpage2.mp3`, and `newpage3.mp3` byte-for-byte with their original names. Browser metadata gives 8.751, 8.515875 and 5.851375 seconds. Drawing uses media currentTime/duration, pauses/resumes/seeks with audio, settles before completion, holds the final state and restarts on replay/revisit. Old audio is stopped/reset and stale events remain guarded. Initial autoplay denial uses the existing tap-to-play recovery. Voice content was not independently transcribed; no phrase-exact synchronization is claimed.

Focused unit and real-media Chromium checks pass, including no-scroll controls at 320×568, 360×640, 390×844, the extra short 320×480 viewport and 1440×900. Screenshots were visually inspected. Pages 4–6 screenshots match the starting implementation exactly. Later-page content, audio sources, product/benefit data and navigation logic are unchanged. Repository unit/Functions tests (139 passed, two existing skips), production build, site references and standalone navigation browser checks pass. No database/auth changes. Physical-phone/iOS checks remain unverified.


### Floating presentation audio and irregular Business movement — November 4, 2026

Replaced expanding text audio controls with fixed 44px circular play/pause controls floating at the lower right above Next on Pages 1–6. Loading shows an ellipsis in the same circle. Hidden status labels and the shared visible play/pause icons follow media state; accessible labels and pressed/busy states remain. Audio statuses are positioned overlays and cannot grow the footer. The journey uses the same fixed control; its progress/replay remain separate. Page 5 anchors its footer to the bottom. Mobile wrapper/frame heights follow dynamic viewport units without the old 100vh minimum that could overflow behind browser chrome. Clear space keeps audio off timeline/benefit labels, and the short 320×480 reveal/details layouts fit without scroll. Product HTML, benefit values, recordings, navigation and timing are preserved.

The reused Business path now contains rallies of different lengths, pauses, consecutive declines, uneven setbacks and recoveries, while finishing well above its start. Share Market and Stability geometry are unchanged, and every opening page continues to reuse the same Business path.

Verification: presentation tests and repository unit/Functions tests pass (139 passed, two existing skips), as does the site reference check. Real-media checks cover the opening recordings. Added deterministic all-page loading, playing, paused, resumed, completed, autoplay-denied and error states at 320×480, 320×568, 360×640, 390×844 and 1440×900. Assertions check fixed 44px size, unchanged audio/Next bounds within browser subpixel rounding, visible hit targets, no scroll, and no collision with chart legends, timeline, journey details or reveal copy. Screenshots were visually inspected. The browser suite now runs in full GitHub verification. A simulated address-bar check confirms the frame and Next shrink with dynamic viewport height rather than retaining the larger legacy vh height. Physical-phone/iOS behavior remains unverified.


### Presentation visible-screen clamp after phone screenshot — November 4, 2026

The supplied phone screenshot showed Next clipped despite the previous fixed-control/dvh correction. The prior regression only modeled CSS dynamic units shrinking; it did not cover a phone/WebView retaining a taller layout viewport than its visible viewport. The mobile wrapper now uses the smallest positive visualViewport/innerHeight/document client-height measurement, accounts for visible offset, and is fixed to that visible area with a small-viewport CSS ceiling. It updates on viewport resize/scroll, orientation changes and page restoration. The frame follows the wrapper without animating its height, and the document cannot scroll vertically. Pinch zoom does not reflow the presentation to the zoomed visual height.

Existing height breakpoints now query the actual presentation frame, so a tall reported browser viewport with a shorter visible screen still gets the correct compact layouts. A small Page 5 spacing adjustment covers the 701–800px frame range. Existing graph, voiceovers, benefit data and fixed audio controls remain unchanged on Pages 1–6; stylesheet/script versions advance together.

All 17 presentation and 139 repository/Functions tests pass locally (two existing skips), along with site references. The five-size fixed-control matrix passes. The replacement phone regression keeps the layout at 390×844 while changing the visible area through 760/640/480px with top offsets, on all six pages; it checks complete audio/Next bounds, correct frame sizing, zero internal overflow and no document scrolling. Screenshots are retained for inspection. Physical-device confirmation on the user's particular browser remains unverified; the test now covers the mismatch shown by the screenshot rather than assuming CSS viewport units alone are sufficient.


### Stability slope, larger advisor and automatic opening story — November 4, 2026

Raised the illustrative gold Stable Allocation endpoint to y=119, matching the final Share Market dip, with a smooth rising path instead of the nearly flat prior slope. This changes conceptual artwork only; no policy return rate or benefit data changes. Enlarged the existing advisor in Pages 2–3, with lower placement and clipping on compact frames to keep her hand away from chart labels and controls. Separate scene-image slots are ready for the user's two forthcoming PNG expression images; those uploads are not yet present, so both slots currently retain the original asset.

Auto is the default progression mode. Narration completion moves Page 1 to 2, 2 to 3, and 3 to 4; Page 4 and later progression remain manual. Next/Back remain available throughout. A shared Auto/Manual switch can hold a scene, and switching Auto on after a completed narration continues the story. Automatic continuation reuses the user-unlocked audio element for phone playback. Per-session AbortController listeners and identity guards prevent stale callbacks and duplicate handling, while navigation/pause/page-hide cancellation is preserved.

All 19 presentation tests pass. Added real-MP3 browser coverage for automatic completion through Page 4, Manual hold/resume, one shared player and the gold endpoint relative to the final market dip. Existing five-size media/layout and changing-visible-viewport coverage passes. Repository/Functions tests pass (141 passed, two existing skips), plus site references. PNG expression replacement remains pending the user's uploads; physical iOS/phone playback policies remain device checks.


### Supplied advisor expressions installed — November 4, 2026

Installed the two supplied JPGs byte-for-byte: 19292 (concerned/explaining) on Page 2 and 19294 (reassuring, holding the LIC folder) on Page 3. The original files are retained as advisor-concerned-19292.jpg and advisor-reassuring-19294.jpg. Their black backdrops blend into the existing navy scene through CSS; no facial, identity, pose, logo or clothing pixels were regenerated. Both images preload before the opening voiceovers finish to avoid an image-loading flash during automatic progression.

Adjusted each portrait's framing for its different aspect/pose, retaining larger presentation size and compact-frame cropping. Chart and footer layers remain above the portrait so graph labels and floating audio controls stay legible. The browser fixture waits for each actual asset to load and checks the correct page-specific source. All 19 focused presentation tests, existing responsive/visible-viewport checks and site references pass locally. Repository/Functions checks and the full verification pipeline run before publication. Auto/Manual behavior, voiceovers, graph data and Page 4 onward content are unchanged. The pending portrait replacement noted in the previous entry is now fulfilled.

## Page 1 business graph events — November 4, 2026

The existing cyan curve and narration timing are preserved. Expansion, Competition,
Economic growth, Recession and War now reveal at arc-length positions on that same
curve and remain anchored in SVG coordinates. Thin connectors and muted green/red
point markers identify possible positive/negative influences. Labels hold on pause
and completion, reset on replay and follow seeking; Pages 2–3 hide these annotations.
Reduced motion shows the complete annotated curve. Type stays at 9 CSS pixels across
responsive scaling. On presentation heights at or below 600px, only the graph's
clearance is adjusted to keep labels below faces. Characters, scene assets, background,
navigation and subsequent product sections are unchanged. The caption and accessible
summary state that this is illustrative, not historical data or guaranteed outcomes.

Validation: all 143 unit/Functions tests, production build, site reference check,
existing six-page LIC playback/layout browser suite, and the new focused event browser
suite passed. The new suite checks exact curve/reveal alignment, persistence, pause,
seek, replay, reduced motion and non-overlapping, plot-bounded 9px labels at 320×480,
320×568, 360×640, 390×844 and 1440×900; screenshots were visually inspected at the
shortest and standard phone sizes. It is included in the existing presentation CI step.
The complete browser command was also attempted: Garage/navigation/reminder checks
passed, but the unrelated Orb fixture stopped at its pre-existing historical baseline
reference (the expected FocusOrb source is absent there). Using current master as an
explicit diagnostic baseline also fails on missing relative baseline helper imports.
These Orb fixture issues were not changed as part of this bounded presentation edit.
The remaining browser checks were attempted separately: Task copy and Creator passed;
the unrelated Journal tools fixture stopped at its existing addStyleTag call.
Physical-device browser checks remain unverified.


### Cashier direction placement — November 4, 2026

Moved Cash received above the amount field and Change given beneath the denomination/coin controls, at the bottom of the counting panel. Kept the existing mode handlers, counting, draft storage and transaction flow. Updated normal, short-screen and tall-screen grid rows and the cashier CSS cache key. Existing responsive browser checks now assert the requested vertical order.

Verification: site reference check, all repository unit/Functions tests and production build passed. Local browser coverage could not run: Chromium launch is blocked by this environment (socket operation not permitted). Phone/tablet/desktop layout and live Firebase access remain unverified locally.


### Bima Platinum page 4 progression and page 6 illustrations — November 4, 2026

Page 4 now continues to Page 5 when its narration ends in Auto mode, reusing the unlocked audio element. Manual mode holds; enabling Auto after completion continues once. Page 5 still waits for interaction. Age/PPT/SA selector changes are deferred pending the user's full office premium table; the existing fixed ₹3 lakh examples remain unchanged.

Page 6 uses the space beside the existing advisor for five stage-specific explanations: non-interactive PPT comparisons, base GA accrual, yearly income payments, the booster year/amount, and maturity components. Values follow the existing selected age/PPT and brochure's 30-year ₹3 lakh offline example. Base GA is ₹70 per thousand cumulative annualized premiums paid at each year-end during PPT; the illustrated maturity excludes eligibility-based extra incentives. Short screens compact the illustrations and place the fixed audio control within the footer row. Manual stage selection, pause/resume, replay, navigation cleanup and reduced-motion preferences remain supported.

Verification: all 21 focused presentation tests pass; all repository unit and Functions tests pass (143 passed, two existing skips); local site references and JavaScript/diff checks pass. Live cloud-browser preview confirmed real audio progression through Page 4 to Page 5, all five stage controls, and inspected phone layouts at 320×480, 360×640 and 390×844 plus the desktop phone frame. Browser regression source now checks every stage's visual/track and detail/audio clearance. The complete automated browser suite was not run in this managed environment. Physical-device/iOS rendering remains unverified. No Firebase data or rules changed.


### Bima Platinum guided selection and sale-window date — November 4, 2026

Page 5 now opens a focused age/PPT selection dialog before narration. It reuses the original age/PPT buttons and fixed ₹3 lakh, 30-year sample table. Continue starts the example recording immediately. Ten seconds of inactivity confirms the displayed defaults/selection; changing a value resets this timer, and Pause timer permits unlimited selection time. Confirmed narration proceeds to Page 6 in Auto mode; Manual mode still holds. Back, page departure and visibility changes invalidate or pause countdown callbacks. Keyboard focus remains within the prompt; the underlying example/footer are inert until confirmation.

Page 4 displays the user-supplied sale deadline, 31 March 2027, and emphasizes the documented combination of Guaranteed Additions, yearly income and 70% booster. The user supplied this date in the requested copy. It was not stated in the attached sales brochure or in LIC's September 1 launch press release checked at https://web.licindia.in/documents/d/guest/press-release-new-plans-bima-platinum-and-jeevan-raksha_02092026 . No comparative claim that limited availability causes higher returns was added. The new on-screen date is not in the existing voice recording.

Validation: 25 focused tests cover the ten-second boundary, confirmation, selected-value preservation, reset on edits, pause/resume, Manual hold, visibility pause and stale navigation callbacks. All repository unit and Functions tests pass (147 passed, two existing skips). Site references, script syntax and diff checks pass. Cloud-browser review checks the prompt and date on 320×480 and the desktop phone frame, including selection confirmation and natural countdown playback. Automated browser regression source is updated for the prompt; the full automated browser suite and physical-device/iOS behavior remain unverified.


### Bima Platinum expanding stage list and policy timeline — November 4, 2026

Page 6 now follows the supplied reference composition: a numbered vertical list beside the existing advisor, exactly one expanded stage, a benefit illustration panel below, and a separate chronological policy timeline at the bottom. The five existing narrated stages remain intact; policy start is included in the first premium-payment stage. Collapsed stages retain only their headings. Narration, manual stage selection, Back, pause/resume, completion and replay use the same stage state for all three visual regions. Completed stages are marked, and completion keeps maturity expanded. The policy line animates through start, income start, booster and maturity; age/year labels derive from the selected sample age/PPT and existing 30-year term. It is an event sequence, not a proportional duration axis. No amounts were copied from the second reference image.

Page 6 playback and Next controls share a single footer row to preserve room on short phones. The existing advisor assets, recordings, sample premiums, plan benefits and Pages 1–5 behavior are preserved. Reduced-motion styles disable the new transitions.

Verification: 27 presentation tests and all repository unit/Functions tests pass (149 passed, two existing skips); JavaScript syntax, site-reference and whitespace checks pass. Cloud-browser inspection checked all five stages at 320×480, 360×640 and 390×844, confirming one expanded stage, no page overflow, and clear spacing between the kicker, stage list, benefit panel and bottom timeline. Browser regression source checks those boundaries and non-overlapping footer controls. The full automated browser suite and physical-device/iOS behavior were not run in this managed environment.

## Creator historical engine — November 5, 2026 (draft, not deployed)

Extends the native Creator workbench with Maps/Clips, scene-linked sourced events/GeoJSON and camera animation, Codex brief generation, local voiceover preview, real-time WebM export, adjacent-scene clips, prompt/keyframe planning, output versions and editing manifests. New Content clones/saves additive metadata; current project paths, IDs, unknown fields, imports and React/Firebase auth stay intact. A pinned local MapLibre 6.16 distribution and physical coastline are included with rights/provenance. No generated React/V2 build changes remain.

Optional backend adds authenticated, account-bound **read-only** Kling MCP discovery and private immutable manual video uploads/signed playback. No automatic generation callable exists. Token provisioning, per-user OAuth/refresh, actual Standard account/credit verification, paid submission, polling and automatic output retrieval remain unfinished. No credentials, bucket changes, deployment or credit spending occurred. Whole-project collaborative overwrite and document-size limits remain existing risks. Manual file upload followed by an abandoned metadata save can leave a recoverable orphan object.

The four-scene demo covers trading bases, Plassey 1757, Buxar 1764 and Diwani 1765 with individual source/precision notes. The 1765/1805 historical scan is a separate archival reference. **Verified territorial polygon animation in the demonstration remains incomplete**; no guessed historical borders/troop routes were introduced. General geometry animation is tested on explicitly synthetic test fixtures. P4 3D/Canva/voice integrations are method queues only.

Verification: 31 Creator unit tests pass. Full repository unit run: 149 passed, two pre-existing skips; Functions: 12 passed, including four new Kling/upload authorization/protocol tests. Main React build, V2 build/stage, site references, module syntax and diff whitespace checks pass. Cloud-browser inspection confirmed fallback map rendering (this browser has no WebGL2), time scrubbing, play/pause, adjacent-scene clip creation and a complete 32-second WebM export. The native WebGL2 MapLibre path, recorded voiceover mix, real Storage/IAM, signed-in Firebase permissions and production Kling calls remain unverified. V1 and V2 automated browser suites were attempted but could not launch because their Playwright Chromium executables are absent. The new dedicated history browser regression is wired into the existing Creator CI job; CI outcome must be checked before merge. No production data was read or changed during fixtures/preview.


### Creator publication checks — November 5, 2026

The publication CI run caught the legacy four-tab assertion after adding Maps/Clips. The regression now checks the exact six-tab identities. The new playback check also exposed a map-loading race: controls are now disabled until MapLibre/fallback data is ready, and the regression waits for actual timeline progression instead of a fixed 500 ms delay. Creator unit tests pass. GitHub CI supplies full browser verification; the local browser executable cannot launch under this managed workspace's socket restrictions. Publish only after the corrected Creator and repository CI checks complete successfully. Existing territorial-data and Kling-account limitations remain as documented above.

### Historical visual map editor — November 5, 2026 (draft, not deployed)

Adds the optional visual editor inside Maps, reusing existing MapLibre/player,
storyboard timing and save flow. Includes a layer stack, illustrative icons/labels/
routes, georeferenced images and GLB references, attributed DEM terrain, camera
keyframe editing, undo/redo, validated JSON and append-only reusable scene packages.
Source-reviewed geography stays distinct from artwork. No historical boundaries
were invented. React/auth/Firebase/backend and unrelated production modules are
unchanged. See `creator-history-phase1.md` for workflow, data schema and limits.

Local validation: 156 repository unit tests passed with two existing skips; all
12 Functions tests passed. Main React build, V2 build/stage, site reference check
and whitespace checks passed. Generated React/V2 output has no retained changes.
The visual editor browser regression passed in Chrome with real WebGL2 MapLibre,
synthetic CORS image/GLB/DEM fixtures, file-drop positioning and object dragging,
layer/state edits, route/camera playback, reviewed imports, scene reuse, atomic
failure recovery and responsive widths 320–1440px. Existing Creator storyboard
and history browser regressions passed. Full V2 browser coverage passed in Chromium
and Firefox. Desktop/mobile screenshots were visually inspected.

The full V1 browser command passed Garage/storage, shared navigation, dashboard/
reminders, orb, task copy and Creator, then stopped at the unchanged Journal test's
`Save journal idea` dialog timeout (`tests/journal-tools-browser.cjs:54`). Later
V1 scenarios were not reached by that command. This is not an all-green full-suite
claim. CI is enabled for the new map tests. Real signed-in Firebase access, external
provider terrain coverage, arbitrary production asset files and physical mobile
devices remain unverified. No deployment, publishing, live data changes or paid
generation took place.


### Map asset library follow-up — November 5, 2026

Adds a diamond symbol, searchable reusable asset references, shared URL/credit
editing, protected removal of unused references and library JSON import/export.
Nine focused model tests and the expanded native MapLibre browser regression pass,
including library search, shared reference editing, in-use removal rejection and
idempotent library import. Existing map/history browser checks, site references and
whitespace checks pass. No upload backend, auth, Firebase or deployment changes.


### Private map asset uploads — November 5, 2026 (not deployed)

Adds dedicated map upload/read callables, immutable hashed objects, backend-only
receipts and stable private asset references. Saved-project upload UI retains IDs
on failed retries. Existing URL references, library/scene exports and normal
project save callbacks remain available. Backend access checks and fixture tests
cover owner, verified editor, denied accounts, missing receipts, changed-file ID
conflicts and invalid files. Browser fixtures cover failure/retry and placement
without saving signed links. All 159 repository unit tests pass (two existing
skips), all 15 Functions tests pass, ten map model tests and the expanded native
map browser suite pass. Site references and whitespace checks pass. Production
bucket/IAM/CORS, callable deployment and live signed-in behavior remain unverified;
no live changes or permission/rule changes were made.


### Globe and camera script follow-up — November 5, 2026

Adds optional Globe/Flat projection, scene-local fly-in/orbit presets, validated
camera JSON editing and smooth/linear/hold easing. Globe longitude and bearing
follow shortest angular paths. Front-surface round trips suppress far-side canvas
annotations and reject sky placement. Existing GLB models are retained but hidden
in globe projection, with a visible limitation notice, and restored in Flat mode.
All 161 repository unit tests pass with two existing skips; 15 Functions tests pass.
Twelve map model tests, expanded native map browser coverage, legacy history browser
coverage, site references and whitespace checks pass. The globe screenshot was
inspected. The preceding PR run passed Creator, Journal and CRM jobs; its broad
verification job failed an unchanged LIC presentation layout assertion at
`tests/lic-opening-browser.cjs:232` (320×568, stage 4). No LIC code is edited here.
Latest CI reruns after push. Nothing deployed or published.

## Map instruction import, library and HD export — November 5, 2026

Implemented declarative ChatGPT instruction import with atomic validation and
append-only canonical scene creation; no free-text AI endpoint or script execution.
Added actual-source map previews, NASA topographic/natural imagery and a modern
OpenFreeMap atlas, opt-in modern labels/borders, terrain presets, timed relief
lighting, fades, dotted/dashed boundary styling and layer expiry. Existing project
data and map sources remain compatible. New maps default to detailed topography.

Added native framebuffer sizing and deterministic silent MP4 rendering with
Mediabunny/WebCodecs, 30-fps timestamps, 720p/1080p/4K landscape/portrait choices,
asset/tile readiness checks, cancellation and viewport/interaction restoration.
Retained WebM/audio recording. Static GLB opacity follows layer fades; custom
GLB lights, animation clips and globe GLB rendering remain outside this change.

Verification: repository tests passed (168 passes, two existing skips) and all
15 Functions tests passed. Creator history, visual-editor and instruction/import
browser regressions passed in real Chrome/WebGL2, including actual H.264 download
and decoding of a five-second 1920×1080 MP4, native framebuffer dimensions,
cancellation and 320/390/820/1440px layouts. Live public-provider previews for all
four styles loaded; a separate unsaved example exported eight seconds of actual
detailed terrain footage from the editor at 1920×1080, 30 fps. FFmpeg fully decoded
all 240 frames successfully. Main React build, V2 build/stage and site references
passed; unrelated regenerated React/vendor files were restored. V2 browser suites
passed in Chromium and Firefox.

The full V1 browser command passed Garage/storage, navigation, reminders, Orb,
task copy and Creator, then hit the existing Journal `Save journal idea` dialog
timeout at `tests/journal-tools-browser.cjs:54`. It is not an all-green full-suite
result; later cases were not reached by that command. Initial shallow-checkout
Orb baseline lookup was repaired by fetching its required baseline commit before
rerunning; no Orb/Journal source or tests were changed. Real signed-in Firebase,
Safari/physical devices, 4K encoder throughput and long-render memory limits are
not established by these checks. No paid generation, live project writes,
backend deployment, merge or site publication was performed.

### Named custom assets — November 6, 2026

Animation instructions can reuse existing project assets with `assets: [{id: "art", libraryName: "BSF"}]` and an image/GLB layer's `assetId: "art"`. Names match case-insensitively after trimming outer whitespace; missing or duplicate names reject the complete import. Use `libraryId` instead of `libraryName` to disambiguate. Do not mix these references with new-asset URLs or storage fields. Resolved assets keep their existing IDs and private storage descriptors; no duplicate binaries or references are created. Copy ChatGPT brief includes only each library asset's name, type and ID. User-selected upload names override the filename in the saved project metadata.

Verification: 170 repository tests passed, two existing skips; all 15 Functions tests passed. Real Chrome map-editor coverage checks upload naming, private-reference reuse, duplicate-name rejection and explicit-ID resolution. Animation browser coverage checks H.264 export and cancellation. Site references and whitespace pass. No backend functions, bucket configuration, auth, rules or production data changed. Direct private uploads still require the separately documented Creator Storage enablement; this change does not establish live signed-in upload capability.

### Clean satellite-map exports — November 8, 2026

Animation JSON accepts optional `basemapOptions: {saturation, contrast}` within the existing -1..1 bounds. Values apply to a fresh project's chosen raster style; existing project appearance remains preserved during append. Unknown settings and invalid values reject atomically. The copied brief documents the settings. Native place labels have a dark halo for contrast over satellite imagery. Removed the automatic illustrative-artwork annotation from the video overlay; source attribution and editor-side illustrative classification remain.

Validation: 171 repository tests passed (two existing skips), all 15 Functions tests passed, site references and whitespace passed. Real Chrome browser coverage passed both native 1920x1080 landscape and 1080x1920 portrait H.264 exports, cancellation and existing map editing regressions. The portrait check verifies the map framebuffer and decoded output dimensions, not just a CSS preview. No provider credentials, backend functions, storage, auth or rules changed.

### Border-film flag textures — November 8, 2026

Adds five sourced national-flag SVG originals and transparent PNG map textures, with vector clipping sources, geographic corners and license metadata. India uses the requested Indian territorial-claim extent; foreign textures exclude that extent. Country silhouettes/claim geometry are generalized Natural Earth, with Survey of India political-map presentation used as reference. Administration remains a separate green/red shading layer and internal LoC/LAC patterns remain distinct in the production JSON. Flag fields extend into the masks while emblem proportions are preserved; textures are editorial artwork, not boundary evidence. No renderer/schema, auth, backend or rules changes. Site references, SVG/PNG decoding, geographic containment checks and model validation pass; film-specific live previews follow before export.

### Opt-in Unified Video Studio — November 8, 2026 (review branch only)

Saved Creator projects gain an independent Video Studio tab with strict reviewed
JSON imports, a shared timeline, local original media, configurable brand slots,
voiceover timing, graphics/LIC/map adapters and deterministic audio/video MP4
encoding. New-content dialogs, existing storyboard/map schemas, LIC pages,
Firebase paths/auth/rules and deployment are preserved. The history player only
exposes its existing frame-readiness guard for adapter reuse. The original Map
Editor MP4 command remains silent. AAC is preferred in Video Studio, with an
Opus MP4 fallback where available; other players may not support Opus MP4.

Local feature-branch checks: 16 focused unit tests pass; repository 187 passed,
two existing skips; Functions 15 passed. Production build/site references pass.
The strict Chrome CI media job passed: real H.264 + Opus MP4, exact portrait and
landscape sizes, audible decoded energy and under-10-ms onset error against a
visual cue, all adapters, branding, cancellation and original-byte persistence.
FFprobe/FFmpeg independently verified the downloaded six-second portrait sample:
180 H.264 frames at 30 fps, an Opus track and no decoding errors. AAC is still
feature-detected but unverified here. Uploaded PNG overlay/profile reuse checks also pass on the final implementation
commit `ab5ebb0` (Chrome run 42440360556). Creator/map, Journal and LIC CRM CI jobs passed.

Full CI is not green: its repository unit stage fails five unchanged LIC Page 6
tests, reproduced on unchanged master `7bca110` as well (selectors removed by
PR #153). Later broad checks in that CI job were skipped. Local broad V1 passed
Garage/navigation/reminders/Orb/Task Copy/Creator, then stopped at unchanged
Journal test line 56 (`page.addStyleTag`); separate Journal CI passed. No LIC
source or old LIC test was edited to mask those failures. Keep PR #154 as draft
until those upstream failures are resolved. Full details and changed files are in
unified-video-studio-phase1.md. Nothing merged, deployed or published.


### Bima Platinum Page 5 reference redesign — November 8, 2026

Recovered and visually inspected the two attachments from the referenced chat: the intended navy/gold advisor/accordion + illustrated benefit-journey design, and the broken published mobile page. Page 5 now keeps all five benefits visible in one symbolic SVG instead of zooming/cropping the timeline. Premium bars, additions, annual-income coins, booster stack and maturity bag remain visible from entry. The expanded accordion, highlighted path/legend, and recording share one stage state. The upper advisor is clipped within its own region so focusing controls cannot scroll the modal sideways. Short phones scroll within the presentation instead of shrinking labels or clipping benefits.

The prior page-removal commits also removed every selection handler. Page 4 now has the only age/PPT selectors; Page 5 carries their in-memory values forward, including Back/re-entry. Defaults remain age 25 / PPT 15. This is a fixed brochure illustration, not a personalized quote or saved cross-session selection. Journey playback reuses the unlocked player, aborts old event listeners, holds media position on tab hiding, and supports pause/resume, stage taps, Next and replay. Completion offers replay rather than advertising a nonexistent protection page. Recordings are unchanged.

Financial verification on November 8: all 20 premiums match sales-brochure section 8 (printed pp.15–16): BSA Rs.3 lakh, 30-year term, offline standard lives, taxes excluded. Policy Part C 1.B/1.C and 5 establishes first income at the end of PPT through year 29, booster at PPT+5, maturity BSA plus GA, and GA on cumulative annualized premiums paid during PPT. For yearly paid premiums, base GA = premium × 0.07 × PPT × (PPT+1)/2. Age 25/PPT 15 gives base GA Rs.270,648 and maturity Rs.570,648; annual income Rs.30,000 and booster Rs.210,000 in year 20. Extra incentives/deferral are excluded, explicitly labeled. The path is symbolic, not proportional time, account value or investment return. Reference-image year 25 and amounts were not copied into the 30-year sample.

Sources: [LIC product page](https://originlic.licindia.in/lic-s-bima-platinum2), [LIC brochure](https://licindia.in/documents/20121/1860176/LIC%2BBima%2Bplatinum%2BSales%2Bbrochure.pdf/ae9590c9-2c2d-6dca-c180-5bbb3f956dab?t=1788330413553), [LIC policy](https://licindia.in/documents/20121/1860176/Final_Policy%2BDocument%2BLIC%27s%2BBima%2BPlatinum.pdf/9235a4a2-d3c7-0c4c-72e2-6c6f05c22603?t=1788330356571). Official PDFs opened, but subsequent targeted requests timed out; detailed sections and premium table were cross-checked in the [policy transcription](https://indiainsurances.com/policy/lic/lics-bima-platinum-512n397v01/document/11873) and [brochure transcription](https://indiainsurances.com/policy/lic/lics-bima-platinum-512n397v01/document/11880), each linking the insurer originals. Page 4's pre-existing sale deadline remains user-supplied and was not independently verified.

Local verification: 19 focused presentation tests; full unit suite 179 passed, 2 existing skips; all 15 Functions tests; main build, V2 build/stage, generated V2 consistency, site references and whitespace checks pass. Existing presentation/browser fixtures were updated from the obsolete six/ten-page sequence and retired selection dialog. Real Chrome playback verifies opening-page auto progression, pause/seek/replay, Page 4→5, five journey recording endings, one expanded stage, carry-forward/Back, completion/replay, and zero page errors. Journey layouts pass at 320×480, 320×568, 360×640, 390×844, 430×932, 844×390 and 1440×900, including reduced motion and internal scrolling. Opening tests also exercise changing visual viewport height/offset; business-label synchronization passes. PNG evidence is under .test-output/lic-journey and lic-opening; CI uploads screenshots.

Broader local browser checks passed Garage, navigation, Reminders, Orb, Task copy, Creator, Journal notebook, LIC follow-up, Workday and account menu. Full run stopped at Journal touch-capture dialog; separate runs found CRM waiting for addCustomer enabled and Cashier waiting for entryPanel (Loading). V2 browser suite timed out in the existing canvas scenario. Those modules were not modified. Firebase rules/emulator suite could not run locally because Java is absent. Physical-device Safari/iOS, production account permissions and a real issued-policy quote are unverified. Publication and CI outcomes are recorded in the PR.

### Larger navigation icons and visual LIC entry points — November 8, 2026

Dashboard destination glyphs increase from 34 to 42 CSS pixels on desktop and
24 to 28 on phones; tablet glyphs are 34 pixels. Existing Orb positions,
navigation targets and task interactions are unchanged. Generated main/V2 assets
and their HTML loaders are rebuilt from source.

The four existing LIC routes now use larger illustrated cards (two columns on
phones, four on desktop), distinct accents and a subtle icon breathe. Reduced
motion disables the animation. Agent Tools reuses the existing anniversary
advisor and LIC logo for a Bima Platinum cover with Present/Calculate actions;
redundant introductory paragraphs are removed. No new tools, fake counts,
customer data, account changes or Firebase writes are introduced.

On presentation Page 4, the unchanged user-supplied `31 March 2027 तक` deadline
moves from bottom fine print into large date typography in the left-center copy
beside the advisor. The old bottom date is removed. Short-height rules preserve
room for the selector/footer; the duplicate anniversary caption is hidden on
short screens where the advisor already holds the anniversary badge. Narration,
selected age/PPT, plan values and Page 5 remain unchanged.

Verification: 179 repository unit tests passed with two existing skips; all 15
Functions tests and 18 V2 unit tests passed. Main and V2 builds/stage, site
references and whitespace checks passed. Chromium V2 smoke passed. LIC CRM
browser regression passed with the installed headless-shell executable (full
Chromium cannot launch under the workspace's singleton-socket restriction).
The existing real-audio journey browser test passed at 320×480, 320×568,
360×640, 390×844, 430×932, 844×390 and 1440×900, including new date placement /
no-bottom-duplicate checks and existing narration, selection, replay and Back
checks. LIC hub, Agent Tools, Page 4 and desktop dashboard screenshots were
visually inspected. External fonts were blocked in the local fixture, so these
captures use fallback fonts; physical devices and live Firebase were not tested.
Full repository browser coverage remains delegated to the PR's existing CI.
No merge or publication performed for this change.

### Bima Platinum Page 5 cumulative reveal correction — November 8, 2026

Captured and inspected the live graph at all five narration stages. The prior redesign had drawn the complete path, fill, illustrations and future amounts at every stage; only the active highlight changed. The user's clarified behavior is cumulative disclosure, not a complete chart from entry.

The graph now renders only the reached segments, corresponding fill/axis extent, milestone dots, money illustrations, labels and amount cells. Premiums appear first, then additions, annual income, booster and maturity. Prior benefits remain visible as the current segment extends. Future amounts are also withheld from the accessible description. The coordinate system and card dimensions stay stable; no camera zoom/crop or duplicate selectors were introduced. The current extension pauses with the story and reduced-motion users see the reached state immediately. Replay and selecting an earlier stage remove unreached content. The advisor/accordion, selection carry-forward, audio recordings/lifecycle, navigation and financial calculations remain unchanged.

Verification: all 20 focused presentation tests pass; the full unit suite passes 180 tests with 2 existing skips, and all 15 Functions tests pass. Real-audio browser checks pass every stage at seven viewports, including landscape, reduced motion, replay, manual backward selection, Back/re-entry, and graph/footer clearance. Tests now assert exactly 1/2/3/4/5 paths, illustration groups and amount cells as narration advances, plus absence of maturity until stage 5. Captured and visually inspected the five updated 390×844 graph screenshots against the five live before screenshots. Browser evidence includes per-stage PNGs at 320, 390 and desktop widths under .test-output/lic-journey; CI uploads these in lic-presentation-evidence. Build/site/opening/business-label and CI outcomes are recorded in the PR. Physical iOS/Safari remains unverified.


### Bima Platinum cash-flow arrows and text cleanup — November 8, 2026

Page 5 now uses blue downward premium-payment arrows and gold upward regular-income arrows emerging from the plan toward the policyholder. Guaranteed Additions add gold caps and coins inside the original premium-paying area; stage 2 keeps the exact same path, fill, axis end and reveal width as stage 1. Income is the next time extension, followed by the unchanged booster and maturity phases. There are five narrated stages across four time sections. Replay, earlier-stage selection, completion, carried selections and audio lifecycle remain intact; financial amounts and payout timing are unchanged.

Removed the visible chart heading, Illustrative tag, age/PPT/BSA summary, long assumption footnote and redundant upper subtitle. The lower legend keeps only short benefit names and amounts; years remain on the relevant graph milestones. Financial assumptions and arrow semantics remain in the SVG accessible description. The chart now explicitly fills the available width and the advisor section uses its allocated space, avoiding the gap left after removing the text.

Validation: 21 focused tests; full unit suite 181 passed / 2 existing skips; Functions 15 passed. Seven-size real-audio browser checks verify premium-down/income-up path geometry, no income arrows before stage 3, identical premium/Additions time extent, hidden future benefits, completion/replay/manual backward selection, carried selections, Back and graph/footer clearance. All five updated 390×844 stage screenshots and the whole phone layout were visually inspected. Main and V2 builds/stage, generated V2 consistency, site references, opening playback/changing visual viewport and business-label checks pass. Screenshots are uploaded in lic-presentation-evidence. CI/publication/live outcomes are recorded in the PR; physical iOS/Safari is unverified.


### Bima Platinum coin-stack spacing — November 8, 2026

Used Screenshot_20261108-152514.png as the visual reference. Added a single coin before the existing two-coin stack, and a three-coin stack before the four-coin Guaranteed Additions stack, creating a 1–2–3–4 build-up within the premium period. The income stage adds two stacks before the existing three, for five payout stacks. The original three outgoing arrows remain uncluttered. New coins use their existing stage groups, so narration/replay reveal them at the correct time. Financial amounts, cash-flow arrows, timeline extents, text and navigation are unchanged; the script cache version is refreshed.

Verification: existing focused presentation/full unit suite passes (181 passed, 2 existing skips), all 15 Functions tests pass, site references and whitespace checks pass. The seven-size real-audio browser suite passes. Also captured all five stages of the age-25/PPT-15 example matching the supplied screenshot and visually inspected the complete graph: stacks remain separated, within their phase, and clear of arrows/labels. No new tests were added for this decorative change. CI and published-page verification are recorded in the PR; physical iOS/Safari remains unverified.


### Bima Platinum golden date callout — November 8, 2026

Added a translucent yellow/gold gradient, fine rounded gold border and soft glow behind the existing 31 March 2027 date on Page 4. The background uses a positioned pseudo-element so the date typography, layout, selections, narration and navigation remain unchanged. The small vertical inset stays inside the 320×480 visual region. Date copy is unchanged and remains user-supplied. CSS cache version is refreshed.

Validation: existing full unit suite (181 passed, 2 existing skips), all 15 Functions tests and site references pass; existing real-audio browser/layout checks pass at seven viewport sizes. Visually inspected the date callout at 320×480 and 390×844 and checked its bounds against the visual area and selector controls. No new tests were added for this cosmetic change. CI/publication outcomes are recorded in the PR; physical iOS/Safari remains unverified.


### Permanent Map Editor production standards — November 9, 2026

Added a universal production standard for all map videos, routed from the root AGENTS.md, README and an Antigravity always-on repository rule. The guide references the existing NASA GIBS/DEM implementation and sourced border-flag assets, sets output-scaled readable typography and rounded-card defaults, protects editor/project compatibility, separates claims/control/illustration, and requires audio-derived cues and real frame-by-frame export evidence. Project-specific content stays separate; this is not a Panipat-only rule.

Verification: checked current repository source paths, imagery source/zoom metadata, existing importer/export limitations and border asset manifests; checked relative documentation links and Antigravity trigger/frontmatter against official Rules documentation. This change contains Markdown instructions only; runtime code, saved projects, schema, Firebase/auth, editor features and generated app assets are unchanged. No film or future agent output is certified by adding instructions. Antigravity's actual in-app discovery was not exercised; agents need an updated checkout, and future production changes still require the relevant tests and audiovisual review.

## Unified Studio composition — November 9, 2026 (review branch)

Saved projects open in a clean Studio/Script/Assets workspace. Version 2 manifests add native map snapshots, battlefield/image/video scene engines and multiple trimmed/faded voice/music/effect clips without migrating original Creator projects or version 1 drafts. Focused Map/Battlefield editing returns to the master playhead. Audio positions remain fixed across reviewed scene timing changes. The existing Map Editor silent export remains available. The new tactical canvas includes formations, paths, camera keys and authored hills/cliffs/forests/rivers/roads/obstacles. See [implementation and media evidence](unified-studio-composition.md).

Verification: repository unit/Functions tests, Creator unit coverage, production and V2 builds/stage, site references, original Studio media acceptance, new multi-editor browser coverage, storyboard/history/map-animation/Map Editor browser regressions passed. Chrome encoded H.264 + AAC in both orientations. Independent FFmpeg checks decoded two native maps + narration (60 frames), mixed maps/battles/image/video/audio (150 frames), and the original Panipat two-map/narration excerpt (620 frames), all 1080×1920 at 30 fps. Original Panipat audio correlation was 0.999849 with zero measured offset; synthetic onset was exactly 0.300 seconds. Full-resolution representative frames and clean Studio screenshots were inspected. No claim of final editorial speech alignment, production permissions or physical-device verification is made.

The broader V1 browser chain passes Garage, navigation, reminders, Orb, Task Copy and Creator, then stops at the Journal Save journal idea dialog timeout (`tests/journal-tools-browser.cjs:54`). This exact failure was reproduced in a separate unchanged master worktree at `b2c3c34f3fb24a8f151c3ccca6f59f84a78ed189`; later chain scenarios were not reached. An initial V2 run timed out in the existing reduced-motion canvas scenario under concurrent browser load; both Chromium and Firefox pass in the unchanged baseline. Final feature-branch rerun is recorded below. No Journal/dashboard runtime files are modified.

Final feature-branch V2 rerun passed the complete Chromium and Firefox scenarios, including reduced motion, plan import/edit/recovery, navigation, account isolation and production auth gate. Full repository unit run: 189 passed, two existing skips; Functions: 15 passed.


## Creator Studio default map style — November 9, 2026

Implemented on an isolated checkout of master ae1e806; the active Antigravity Panipat branch and working tree were not modified. New main-page Creator projects and new Studio Map scenes use one central default configuration in creator/map-defaults.js. Each map saves a complete versioned presentation snapshot and default camera; legacy maps retain their prior rendering. Main-editor Style controls and per-label font sizes override saved values. The same canvas label compositor serves preview and export, with rounded navy/gold cards, reference-resolution typography, safe margins and label deconfliction. Dates remain opt-in. NASA Blue Marble and attributed terrain initialize new maps. Newly placed images preserve their original proportions; supplied geographic image corners and authored GLB scale remain unchanged.

Animation instructions may omit aspect ratio and basemap; those values resolve from the current project before the central defaults. Import preserves saved color adjustments and an explicitly disabled terrain. No Gemini integration, Firebase permission changes, deployment or film-specific rendering was added.

Verification: 198 repository unit cases (196 passed, two existing skips), 15 Functions tests, the production build and site-reference check passed. Browser coverage passed for main-page creation, Studio Map creation, default snapshots, overrides/reload, 320/390/820/1440 layouts, native Map Editor tools, animation imports, history playback, Video Studio and mixed composition. A two-second 1080×1920 30-fps native NASA-map MP4 was exported with a 64-pixel label override verified in the export compositor. FFmpeg decoded the output and existing mixed-editor proof files. Exported imagery/cards and a phone-size frame were visually inspected; this synthetic sample does not certify a film's geography or narration alignment.

The broader browser run passed storage, navigation, reminders, focus orb, task copying, Creator storyboard, Journal notebook, LIC follow-ups, Workday and account-menu scenarios. Journal tools, personal LIC CRM and LIC cashier timed out; the same three failures reproduced against an untouched master archive in this environment. CRM emulator command output did not establish completed rule/browser checks and is not counted as verification. Tests used Node 24 and desktop Chrome; production Node 22, live signed-in Firebase, mobile hardware/Safari and maximum-length rendering remain unverified.


## Creator Gemini voice direction — November 10, 2026 (review branch)

Added Gemini 2.5 Flash/Pro TTS to the existing authenticated Google synthesis path.
The server supplies a separate performance prompt for Natural/Sales/Energetic/
Documentary/Dramatic/Calm, custom direction and approximate pace; classic voices
retain their existing SSML/rate/pitch behavior. Gemini uses an allowlist of models,
speakers and locales, with Unicode-safe 4,000-byte text chunks. Per-hour accounting
includes repeated prompts. No new credentials, authentication policy, database paths
or client Firestore access are introduced.

The navy/gold voiceover page adds engine and direction controls, hides unsupported
Gemini controls, preserves style when speed changes, and groups fine adjustments.
Old drafts retain classic voices; settings remain per-account and stale generation
results are discarded. The old backend disables the new engine rather than silently
substituting a voice. Gemini speed is explicitly approximate, not an exact post-render
speed effect. No sentence selection editing or word-level timeline is implemented.

Validation: 12 TTS backend tests passed, including separate prompt/model/voice request
contracts, every-chunk directions, Hindi/emoji preservation, validation before any
upstream call and real MP3 encode/decode. Controlled Chromium browser checks passed
for classic samples/SSML/preview/download, Gemini directions/Pro selection/style+speed,
draft recovery and account isolation, with responsive checks and inspected phone and
desktop screenshots. These fixtures use generated silent audio, not real Gemini speech.
Full repository units: 215 passed, 2 existing skips; Functions: 15 passed. Production
build and site references passed. Broader browser chain passed Garage, navigation,
reminders, Orb, Task Copy and Creator, then failed at Journal addStyleTag line 56.
The same failure reproduced in an untouched master bf8fd1c worktree.

Activation remains unverified: no Firebase CLI login or Google ADC is present here.
No paid Gemini request, IAM edit, Functions deployment or production publication was
performed. Deploy TTS first and verify the runtime account's model permission, then
publish the page and perform a short approved real listening comparison. See
[Creator voiceover](creator-tts.md#activation). Node 22, physical phones and Safari
remain unverified; checks used Node 24 and desktop Chromium.
