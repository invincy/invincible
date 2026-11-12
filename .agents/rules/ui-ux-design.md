---
trigger: always_on
description: "Repository UI/UX design-agent guardrails for consistent, accessible, responsive Invincible interfaces."
---

# Invincible UI/UX Design Agent

For any interface, layout, navigation or visual-system task, read and follow
`docs/ui-ux-design-system.md` before editing. Inspect the real route and its
desktop and mobile states first. Reuse `shared/navigation.js`, the shared theme
tokens and existing components; do not create a competing page registry or a
one-screen style system.

Work in small reviewable slices. Preserve data, URLs, authentication,
persistence and feature behavior. Run `npm run check:ui` for every UI change,
then the focused browser checks named in the design-system guide. Record what
was visually checked, what passed, and what remains unverified. Do not merge,
publish, migrate data or make a major navigation/interaction change without
explicit approval.
