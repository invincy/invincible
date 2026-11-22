---
name: regression-testing
description: Diagnose and prevent Invincible regressions across UI, task storage, Firebase, reminders, focus, and navigation.
---
# Regression testing
1. Read AGENTS.md, README.md, and docs/code-review.md. Reproduce the issue and document expected behavior.
2. Trace the active implementation: React source, native pages, Journal bundle, or backend.
3. Add targeted tests for functional changes and failure/retry paths; do not rely solely on mocks for real permissions.
4. Check task persistence, user switching, shared Workday/Creator ownership, navigation, focus queue/timer, and reminders when affected.
5. Check phone, narrow split-screen, tablet, and desktop behavior, including reduced motion and the mobile no-orb rule.
6. Run npm run check, npm run test, relevant npm run test:browser, and npm run build as applicable.
7. Distinguish fixture/emulator tests from authenticated production Firebase checks.
8. Report root cause, modifications, actual test outcomes, residual risks, and manual checks needed.
