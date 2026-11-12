---
name: ui-development
description: Implement and refine Invincible UI across desktop, tablet, mobile, and split-screen layouts without breaking navigation, tasks, focus, or persistence.
---
# UI development
1. Read `AGENTS.md` and `README.md`; locate the active page implementation before changing code. React migration is incomplete.
2. Follow `shared/navigation.js` for both React and native navigation; edit `react/src/dashboard.css` for Dashboard visual layout rather than introducing competing overrides.
3. Preserve the Dashboard mobile design: under 700px, no WebGL orb; clock, wide golden focus strip, and a 2x2 four-lane task board. Preserve desktop/tablet interaction and glass lane colors unless specifically asked to change them.
4. Keep task actions, status transitions, drag/drop, focus controls, keyboard behavior, accessibility, loading, empty, and error states functional.
5. Test at narrow split-screen widths as well as phone, tablet, and desktop. Inspect overflow, navigation overlap, modal visibility, touch targets, keyboard activation, and reduced motion.
6. Change active source, not generated `react-dist` bundles. Run `npm run build` when React entry assets change and ensure generated loaders stay in sync.
7. Run relevant checks (`npm run check`, `npm run test`, `npm run test:browser`, `npm run build`), and state exactly which executed successfully.
8. Provide a concise before/after change log, screenshots if legitimately captured, and a list of unverified device-specific behavior.
