# Invincible AI V2 task bridge

The bridge stores requests under `users/{uid}/aiTasks/{taskId}`. The task ID is a deterministic hash of the authenticated user, workspace and idempotency key, so mobile retries cannot create duplicate work. A claimed task must be submitted to the provider-neutral Universal Agent API before a result is accepted.

Lifecycle:

`queued → running → completed`

Failures return to `queued` until the three-attempt limit is reached, then become `failed`. A laptop agent claims a lease, records its agent ID, and must complete or fail the task before the lease expires. Expired leases are recovered by the same retry path. Every transition appends a bounded execution-log entry.

Only `create_project` is registered for local execution in V2 Phase 1. The bridge module is tested with an emulator-style Firestore adapter; wiring the same functions into the Firebase callable surface and Firestore emulator is the next integration step.
