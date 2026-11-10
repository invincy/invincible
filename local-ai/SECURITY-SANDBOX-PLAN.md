# Windows sandbox hardening plan

The current application boundary is complete and tested, but the OS boundary is intentionally not applied yet.

Current observation:

- `E:\Invincible\AgentWorkspace` inherits `Authenticated Users:(M)`.
- Administrators and SYSTEM retain full control.
- No dedicated non-administrator worker identity exists.
- No AppContainer, Windows Sandbox, job-object policy or restricted token has been configured.

Proposed reversible hardening, pending explicit approval:

1. Create a dedicated non-administrator local identity such as `InvincibleAgent`.
2. Disable inheritance on `E:\Invincible\AgentWorkspace` only.
3. Preserve Administrators and SYSTEM full control for recovery.
4. Grant the worker identity Modify on the workspace only. Do not grant it model-directory access; the worker uses Ollama over loopback HTTP.
5. Remove inherited `Authenticated Users` Modify from the workspace, without changing personal folders or repositories.
6. Launch the local worker with a restricted token and Windows Job Object limits; deny child process creation where practical.
7. Verify with a test matrix covering workspace writes, traversal, personal-file reads, process launch, credentials, browser profiles and repository access.

Exact scoped ACL change (after the account exists, and only for the workspace):

```powershell
$root = 'E:\Invincible\AgentWorkspace'
icacls $root /inheritance:d
icacls $root /remove:g 'NT AUTHORITY\Authenticated Users'
icacls $root /grant:r 'BUILTIN\Administrators:(OI)(CI)(F)' 'NT AUTHORITY\SYSTEM:(OI)(CI)(F)' 'BUILTIN\Users:(OI)(CI)(RX)' 'InvincibleAgent:(OI)(CI)(M)'
```

This leaves Administrators and SYSTEM with full control, gives the dedicated worker Modify only inside the workspace, leaves ordinary Users read/execute, and removes the inherited Authenticated Users Modify entry from this directory only. It does not change `E:\Ollama`, `E:\AI\Models\Ollama`, personal folders or repositories. Ollama remains owned by the normal user and the worker communicates with it over loopback HTTP; the worker does not need model-file access.

Rollback must be prepared before applying:

```powershell
$backup = 'E:\Invincible\AgentWorkspace.acl.backup'
icacls 'E:\Invincible\AgentWorkspace' /save $backup /t /c
# ...apply and test...
icacls 'E:\Invincible\AgentWorkspace' /restore $backup
```

The backup file must be stored outside the restricted directory and retained until the post-change tests pass. Account creation and these ACL commands are not executed by Codex without explicit approval.

`scripts/propose-agent-sandbox.ps1` is read-only and prints the current ACL plus this proposal. It does not create accounts or modify ACLs.

## Restricted-process test result

The approved workspace ACL was applied and tested under `MSI\\InvincibleAgent`:

- Administrator: false
- Workspace write: allowed
- Personal credentials path (`C:\\Users\\vaibh\\.ssh`): denied
- Unrelated repository read: allowed (limitation; permissions outside the approved workspace were not changed)
- Ollama loopback access: allowed (limitation; Ollama still runs under the normal user and has no local-user authentication boundary)
- Child-process launch: allowed (limitation; no OS process/job-object restriction was applied)

This is scoped workspace protection, not complete OS-level isolation. Closing the three remaining gaps requires additional authorization to change permissions outside the workspace, add an Ollama authentication/identity boundary, and apply a process restriction policy.

`scripts/test-agent-sandbox-rollback.ps1` restores the saved ACL, verifies the original inherited entry, and reapplies the hardened ACL.
