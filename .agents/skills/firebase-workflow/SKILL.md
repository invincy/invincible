---
name: firebase-workflow
description: Safely inspect and modify Invincible Firebase authentication, Firestore storage, callable AI functions, access rules, and cross-user collaboration.
---
# Firebase workflow
1. Read `AGENTS.md`, `README.md`, `docs/firebase-storage.md`, and relevant Firebase code before editing.
2. Identify whether the affected path is user-owned (`users/{uid}`) or shared. Map the exact collection/document paths, owner/editor checks, callers, and existing data shape.
3. Trace auth restoration and listener lifecycle in both React and native Firebase adapters. Reuse the single Firebase config and existing persistence policy.
4. Preserve IDs, legacy `steps`/`subtasks` mirrors, and older records; propose an explicit migration with backup and rollback strategy for incompatible changes.
5. Diagnose permission failures using evidence. Never weaken Firestore rules, bypass ownership, or use public access as a shortcut.
6. Make minimal targeted changes; add tests for permission boundaries, ownership, missing auth, account switching, and failure/retry states.
7. Run relevant checks: `npm run check`, `npm run test`, `npm run build`; run emulator/browser tests when applicable and available.
8. Clearly separate simulated/emulator outcomes from verified production signed-in access. Never claim deployed fixes without deployment evidence.
9. Summarize modified paths, data compatibility, tests run, unresolved risks, and any manual verification required.
