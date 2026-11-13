# Invincible UI/UX design system and audit workflow

This is the operating contract for the Invincible UI/UX Design Agent. It turns
visual work into small, testable changes across the hybrid React and native-page
architecture without changing stored data or feature behavior.

## Reference knowledge, not borrowed UI

The agent may consult [Nielsen Norman Group's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/),
[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
and [Google Material Design 3](https://m3.material.io/) to understand human
factors: clarity, recognition, feedback, touch ergonomics, hierarchy,
accessibility, responsive behavior and complete interaction states.

These are learning references only. Invincible does **not** adopt their visual
design, component library, branding or page templates. Reviews do not need three
separate framework reports. The authority for implementation is the concrete
Invincible sizing and behavior system below.

For example, a theme selector should normally show meaningful visual previews
with selected/focus states and accessible names. It should not repeat “Theme 1”
beside an unexplained icon merely to fill space. A visible label remains when
the choice or consequence would otherwise be ambiguous.

## Invincible sizing system

### Typography

| Role | Phone | Desktop | Use |
| --- | ---: | ---: | --- |
| Supporting caption | 12 px minimum | 12–13 px | timestamps, compact metadata; never primary instructions |
| Secondary text | 14 px | 14–15 px | labels and supporting information |
| Body text | 16 px | 16 px | normal readable content and form values |
| Card title | 18–20 px | 18–22 px | one clear title per card |
| Section title | 22–26 px | 24–32 px | major content groups |
| Page title | 28–34 px | 32–48 px | one primary page heading |

Do not use text below 12 px. Do not solve crowded cards by shrinking type; remove
redundant wording, increase the card, reflow content or move secondary details
behind disclosure. Body copy uses roughly 1.45–1.6 line height and stays near
45–75 characters per line.

### Buttons and icons

- Standard desktop buttons are 44–48 px tall; phone primary buttons are 48–52 px.
- Button text is at least 14 px; primary actions normally use 15–16 px semibold.
- Icon-only controls keep a 44 px desktop and 48 px phone hit area even when the
  visible glyph is 20–24 px.
- Use an icon when it improves recognition or scanning. Familiar icon-only
  actions need an accessible name and tooltip. Unfamiliar, destructive or
  consequential actions keep a short visible label.
- Do not combine an icon and text that merely repeat each other. Combine them
  when the icon aids scanning and the label prevents ambiguity.

### Cards and panels

Cards size to their content and grid rather than using arbitrary fixed heights.

| Context | Width | Internal padding | Gap |
| --- | --- | ---: | ---: |
| Phone | full available width | 16 px | 12–16 px |
| Tablet | one or two columns, minimum 280 px each | 18–20 px | 16–20 px |
| Desktop compact card | 280–360 px | 20 px | 20–24 px |
| Desktop standard card | 360–480 px | 20–24 px | 20–24 px |
| Desktop wide panel | 560–720 px | 24–32 px | 24–32 px |

The main content area is normally capped around 1200–1440 px on large displays,
unless the feature is intentionally spatial, timeline-based or canvas-based.
Cards need a visible title, a clear primary value/action, and no explanatory
paragraph when a label, preview, icon or state can communicate the same meaning.
When a desktop card has enough width, use that width to create a horizontal
scan path: a meaningful large icon or visual may sit on the left, with the title
and supporting text beside it and the action at the far edge. Do not stack a
small icon, title and description into one narrow column while leaving the other
half of the card empty. Reflow to a compact stack only when the available width
cannot support the horizontal composition.

### Responsive behavior

Use Creator Studio home as the approved reference for paired work areas:
one plain heading per section, matching translucent borderless panels over
the theme backdrop, and readable flat rows with unboxed icons. Page headers
need the page title and primary action. Surface sync problems when they
require attention and keep routine success messages out of the visual layout.

### Motion Studio desktop

The Motion Studio launcher opens a dedicated project selector without creating
or saving an untitled project. Selecting a project opens that same project's
Motion Studio workspace; the in-project Recent projects menu preserves Motion
Studio while switching. Creator Studio's New project action opens an unsaved
Untitled project directly on Script, without showing the compact setup dialog.
The workflow runs from Script to
Script & scenes, then Map Editor when visuals need maps, and finally Motion
Studio for assembly. The separate Invincible AI Voiceover tool keeps its name.
Within Script, keep MP3 generation, Download MP3 and Scripting · Step 2 in one
continuous surface. Step 2 must not navigate away: reveal the MP3 ready,
Whisper timing and Scene plan progression in place, with transcript correction
and animation instructions visible before scene generation.

Carry the selected Invincible theme backdrop into the editor, including its
ambient details. Keep the background free of page-specific artwork and use
translucent surfaces where the backdrop would compete with text. Media inside
the video preview belongs to the project.

The Electric Blue halo is the broken cyan ring from the dashboard. Keep it
centered in the shared Electric backdrop with the circuit grid and lines.
The ring is decorative on Creator pages. Gold and Forest keep their own
backgrounds.

Open on the editing workspace: scenes on the left, preview in the center,
selected-scene controls on the right, and the timeline below. Keep Save and
Export in one compact toolbar. Place AI generation, media, JSON import, and
service status behind clearly named controls that open when needed.

Use readable labels, generously sized line icons, and one heading per area.
Keep the desktop workspace inside the window and scroll the panel that owns
overflow. On narrow screens, reflow the panels while keeping the main editing
actions reachable.

Mobile is not a scaled-down desktop. Multi-column cards stack, secondary actions
move into menus or disclosures, long labels wrap, and primary actions remain
reachable. Desktop uses additional width for hierarchy and parallel information,
not for stretching text or filling space with oversized empty cards.

## Product principles

1. **One system, distinct workspaces.** Shared chrome, interaction states,
   spacing and accessibility remain consistent. Feature accents may differ.
2. **The task stays primary.** Each screen presents one clear primary action;
   secondary tools recede without becoming undiscoverable.
3. **Mobile is a first-class layout.** Reflow and prioritise; do not shrink a
   desktop canvas until it technically fits.
4. **Clarity before decoration.** Motion, glow and depth must explain hierarchy,
   state or movement. They never replace labels or status text.
5. **Safe evolution.** Existing routes, authentication, persistence, ownership
   checks and user records are outside a visual refactor unless separately
   approved and tested.

## Enforceable foundations

`shared/app-theme.css` owns the cross-app foundations. Use its `--ui-*` tokens
for minimum controls, focus treatment, spacing and radii. Feature styles may
add semantic aliases but must not redefine the shared contract.

- Interactive controls are at least `--ui-control-min` (44 CSS pixels) in the
  dimension users tap. Dense visual glyphs may be smaller inside that target.
- Every keyboard-operable element has an obvious `:focus-visible` treatment.
- Text labels remain available to assistive technology; icons alone need an
  accessible name and a tooltip where discovery benefits.
- Normal body text targets WCAG AA contrast. Status is never communicated only
  by colour.
- Use spacing from the 4/8/12/16/24/32 token scale. New card radii use the
  shared control/card radii unless the feature already has a documented motif.
- Respect `prefers-reduced-motion`; pause decorative animation when hidden.
- Fixed mobile chrome includes safe-area insets and must not cover content,
  dialogs, toasts or primary actions.
- `shared/navigation.js` is the only destination registry. React and native
  renderers must preserve route labels, active state and direct URLs.

Run `npm run check:ui` to enforce the registry, token and agent-contract baseline.

## Responsive acceptance matrix

Audit the smallest relevant state plus representative phone, tablet and desktop:

| Class | Required viewport checks | What to verify |
| --- | --- | --- |
| Small phone | 320×568 and 390×844 | no page overflow, 44 px targets, keyboard/fixed chrome clearance |
| Phone landscape | 844×390 | reachable primary action, no trapped content |
| Tablet | 768×1024 and 1024×768 | intentional reflow, readable density, scroll ownership |
| Desktop | 1280×720 and 1440×900 | hierarchy, efficient use of width, no clipped controls |
| Large desktop | 1920×1080 when spatial/media UI changes | bounded line length and panel width; no excessive empty or stretched content |

Also test loading, empty, error, long-content, open-dialog and active/selected
states whenever the changed component owns them.

## Iterative audit loop

1. **Inventory:** identify the route, runtime (React/native), source owner,
   shared dependencies, data boundary and focused tests.
2. **Baseline:** capture desktop and mobile screenshots and record undersized
   type, missing/unclear icons, poor card proportions, overflow, hierarchy,
   target-size, focus, contrast and content issues. Do not infer a problem from
   CSS alone when a dynamic state can be inspected.
3. **Prioritise:** fix blockers and accessibility first, then responsive
   structure, shared consistency and polish. Separate behavioural changes from
   cosmetic changes.
4. **Implement one slice:** prefer shared tokens/components where two or more
   screens have the same need. Keep generated `react-dist/` edits build-owned.
5. **Verify:** run `npm run check:ui`, the feature unit tests, its focused
   browser test, and `npm run build && npm run check` when production assets or
   shared navigation change. Inspect screenshots at the acceptance viewports.
6. **Report:** list changed routes/components, before/after outcome, commands,
   screenshot sizes, known limits and the next proposed slice. Never describe
   an untested device, browser or signed-in production path as verified.

## Rollout order

1. **Foundation (active):** shared tokens, shared navigation, Dashboard controls
   and automated contract checks.
2. **Creator Studio:** project list, Storyboard and Studio navigation first;
   then production panels and media tools. Preserve Map Editor standards and
   project compatibility.
3. **Finance:** desktop hierarchy, mobile cockpit, forms/dialogs, charts and
   empty/error states. Preserve finance storage and calculations.
4. **Remaining screens:** Task, Reminders, Workday, Garage, Journal, LIC,
   Portfolio and Invincible AI, prioritised by severity and shared-component
   leverage rather than wholesale restyling.

Each phase is a separate reviewable branch/commit series. Major information
architecture changes, new navigation destinations, feature removal, schema
changes, merge and deployment require explicit approval.

## Focused verification commands

```text
npm run check:ui
node tests/navigation-browser.cjs
npm run test:v2
npm run test:v2:smoke
npm run build
npm run check
```

Creator and Finance slices add their existing focused unit/browser commands.
Physical-device Safari, live Firebase permissions and production publication
remain separate checks unless explicitly performed.
