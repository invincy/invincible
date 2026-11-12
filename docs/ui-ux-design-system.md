# Invincible UI/UX design system and audit workflow

This is the operating contract for the Invincible UI/UX Design Agent. It turns
visual work into small, testable changes across the hybrid React and native-page
architecture without changing stored data or feature behavior.

## The three required standards

Every audit and design proposal must use all three references below. They serve
different jobs; they are not three visual themes to mix together.

1. **[Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/):** the evaluation framework. Check system status, familiar language, user control, consistency, error prevention, recognition over recall, efficiency, focused/minimal content, error recovery and contextual help.
2. **[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/):** the clarity and interaction-quality reference. Check simplicity, hierarchy, concise wording, familiar behavior, feedback, adaptable layouts, safe areas, touch ergonomics, keyboard/input support and accessibility.
3. **[Google Material Design 3](https://m3.material.io/):** the responsive component and state reference. Check component choice, navigation patterns, layout adaptation and complete default/hover/focus/pressed/selected/disabled/loading/error states.

Invincible keeps its own dark, spatial visual identity. These standards decide
whether an experience is understandable, usable and complete; they do not make
the product look like an Apple or Google app. When guidance differs, prioritise
safety and accessibility, then the user's platform/input expectations, then the
Invincible visual language.

### Required audit scorecard

For each screen, record concrete findings under these headings before editing:

- **NN/G:** which of the 10 heuristics pass, fail or are not applicable, with
  the affected control or workflow named.
- **Apple HIG:** clarity/hierarchy, wording, touch and keyboard ergonomics,
  feedback, adaptability and accessibility.
- **Material 3:** component suitability, responsive behavior and missing
  interaction states.
- **Invincible decision:** keep, simplify, replace or defer; include risk and
  the desktop/mobile acceptance check.

For example, a theme selector should normally show meaningful visual previews
with selected/focus states and accessible names. It should not repeat “Theme 1”
beside an unexplained icon merely to fill space. A visible label remains when
the choice or consequence would otherwise be ambiguous.

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
2. **Baseline:** capture desktop and mobile screenshots, complete the required
   NN/G + Apple HIG + Material 3 scorecard, and record overflow, hierarchy,
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
