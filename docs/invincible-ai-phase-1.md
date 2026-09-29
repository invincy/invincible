# Invincible AI — Phase 1 architecture

## Existing data model

Invincible currently uses more than one project-shaped record:

| Feature | Firestore path | Current shape |
| --- | --- | --- |
| Dashboard / Focus / Task Workspace | `users/{uid}/tasks/{taskId}` | A task can already act as a project. It has `title`, `description`, `status`, ordered `steps`, legacy-compatible `subtasks`, and `activeStepId`. |
| Creator Studio | `creatorProjects/{projectId}` | A content project with one workflow `stage`, embedded `scenes`, production metadata, ownership, and collaborators. |
| Workday | `workdaySpaces/{spaceId}` | A collaborative workspace with embedded dated tasks and routines. |
| Finance | `users/{uid}/finance/{YYYY-MM}` | Monthly accounts, transactions, checklist, and card bills. |
| Reminders | `users/{uid}/reminders/{reminderId}` | User-scoped reminder documents. |

Dashboard and Focus subscribe directly to `users/{uid}/tasks`. The current Focus item is not stored separately: the client chooses a non-complete task, prioritising `Today`, then `In Progress`, then `Backlog`. Task Workspace reads the same task and treats its ordered steps as the project route.

## Phase 1 decision

Invincible AI will not create a new projects collection. Its generic project tools adapt the existing Dashboard task model:

- `create_project` creates one document in `users/{uid}/tasks`.
- Project stages are stored as ordered `steps` and mirrored to `subtasks` for current compatibility.
- `activeStepId` is the current stage.
- Setting a current project writes `Today`; any previous `Today` task is moved to `In Progress`.
- Advancing a project completes the current step and marks the next step `Working`.

This makes AI-created projects immediately readable by Dashboard, Focus, and Task Workspace without a migration.

Creator Studio remains an independent content-specific schema in Phase 1. Its projects are included in read-only AI context so the assistant can understand existing content work. Mutation tools for Creator Studio should be added only after its stage/scenes workflow is explicitly mapped to the generic project language.

## Known inconsistencies (not changed in this phase)

1. Generic projects and Creator Studio projects have different schemas and ownership paths.
2. Generic task steps are duplicated in both `steps` and legacy `subtasks` fields.
3. Focus is derived from task status rather than a dedicated user preference document.
4. Several modules are React while Creator Studio and parts of Journal remain standalone JavaScript pages with duplicated Firebase initialization.
5. Some collaborative records are top-level collections while personal records are nested under `users/{uid}`.

Changing those structures now would turn the AI module into a migration project and risk breaking existing pages. The Phase 1 adapter isolates these differences behind validated backend tools.

## Request flow

1. The React AI page sends a signed-in Firebase callable request.
2. The callable verifies Firebase Authentication and loads a small context snapshot: active Dashboard projects, current Focus, and recent Creator Studio project summaries.
3. The configured AI provider receives only that context plus recent AI conversation messages.
4. The model may request only predefined tools.
5. Every tool validates its arguments again on the server and writes only approved fields and paths.
6. Tool results are returned to the model for the final reply.
7. Dashboard and Focus update through their existing Firestore listeners.

Conversation messages live under `users/{uid}/aiConversations/{conversationId}/messages`. They are not treated as application state. Firestore remains authoritative for task and project status.

## Safety boundary

Phase 1 exposes no delete tool, no arbitrary document path, no arbitrary patch object, and no Finance mutation. Tool handlers construct their own allow-listed Firestore writes. The callable rejects unauthenticated users, oversized messages, invalid identifiers, unknown fields, excessive stage counts, and excessive tool loops.

High-impact actions can later use a two-step pending-action record and explicit confirmation UI. They should not be added as direct tools.

## Runtime configuration

The callable is deployed in `asia-south1` and requires the Firebase Functions secret `OPENAI_API_KEY`. `AI_PROVIDER` defaults to `openai`, and `OPENAI_MODEL` defaults to `gpt-5.6`; both are server-side parameters so the provider/model can change without editing the frontend. The browser never receives the API key.

The React page calls `invincibleAiChat` through Firebase Authentication. A live end-to-end test therefore requires the Function, Firestore rules, and React build to be deployed to the same Firebase project already used by Invincible.

## Phase 1 tool mapping

| AI tool | Existing source of truth |
| --- | --- |
| `get_dashboard_state` | Active `users/{uid}/tasks` plus current monthly Finance completion summary |
| `get_projects`, `get_project` | Dashboard tasks, with read-only Creator Studio summaries where relevant |
| `create_project`, `update_project` | `users/{uid}/tasks` |
| `create_stage` | `steps` and `subtasks` on a Dashboard task |
| `create_task`, `update_task`, `complete_task` | `users/{uid}/tasks` |
| `set_next_action` | Task `activeStepId`, step statuses, and task status |
| `get_current_focus` | Same status priority used by Dashboard |
