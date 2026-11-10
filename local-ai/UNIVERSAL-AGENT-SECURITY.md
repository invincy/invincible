# Universal Invincible Agent API — security boundary

## Provider-independent execution

Providers produce a candidate `{tool, arguments}` request. `functions/src/local-ai/universal-agent-api.js` performs authorization, strict schema validation, idempotency, timeout/cancellation checks, execution and activity logging. It does not import Ollama, OpenAI, Firebase client SDKs or Tailscale. The existing `create_project` executor is injected behind that boundary.

## Phase 1 permission model

| Capability | State |
| --- | --- |
| `create_project` | Registered; create permission; no extra approval required for the current user-authorized test flow |
| Read project data | Not registered in this API |
| Edit/delete project data | Not registered |
| Rendering/media tools | Extension points only; not registered |
| Shell, PowerShell, Python, process launch | Never registered |
| Credential/browser/profile access | Never registered |

Every request requires an authenticated principal, a workspace ID owned or explicitly listed for that principal, and a unique idempotency key. Results carry a task ID, status, tool name, structured result and verification flag. Activity logs record start, completion, failure, timeout and cancellation.

## Filesystem boundary

The dedicated workspace is `E:\Invincible\AgentWorkspace`. Canonical path checks reject paths outside that root, traversal attempts and protected roots including user profiles, Windows, Program Files, the Invincible repository and all worktrees. This layer does not expose arbitrary filesystem operations; its path policy is an extension point for future rendering tools.

## Windows OS-level sandbox feasibility

Read-only inspection found the built-in `runas.exe` and `icacls.exe`, but no configured non-administrator agent account and no AppLocker policy surface available to this process. Windows Sandbox/WDAG and process-level ACL isolation have not been enabled or tested. Creating an account, changing ACLs, enabling Windows features, or changing security policy was intentionally not performed.

The current boundary is therefore application-level allow-listing plus canonical path validation, not complete OS isolation. Before claiming stronger isolation, test a non-administrator worker under a dedicated ACL-restricted workspace and a process/job-object policy that denies access to personal files, credentials, browser profiles and unrelated repositories.

## Remaining limitations

- The timeout stops waiting at the API boundary; a non-cooperative executor must also be terminated by a worker process or job object.
- Firebase callable wrappers are present but have not been deployed or run against a real Firestore emulator on this laptop because Java is unavailable.
- The default project executor writes through the existing repository adapter; the new path policy is ready for future file-producing tools but is not involved in `create_project`.
