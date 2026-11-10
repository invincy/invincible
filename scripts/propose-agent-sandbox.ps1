[CmdletBinding()]
param(
  [string]$Workspace = 'E:\Invincible\AgentWorkspace',
  [string]$WorkerIdentity = 'InvincibleAgent'
)

$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $Workspace).Path
Write-Output "Current identity: $([Security.Principal.WindowsIdentity]::GetCurrent().Name)"
Write-Output "Workspace: $resolved"
Write-Output 'Current ACL:'
& icacls.exe $resolved
Write-Output ''
Write-Output 'PROPOSED (not applied) sandbox policy:'
Write-Output "- Create or use a dedicated non-administrator identity: $WorkerIdentity"
Write-Output '- Disable ACL inheritance on the workspace only, preserving Administrators and SYSTEM full control.'
Write-Output "- Grant $WorkerIdentity Modify on the workspace only; do not grant it model-file access."
Write-Output '- Remove inherited Authenticated Users Modify from the workspace; do not alter personal folders or repositories.'
Write-Output '- Run the worker with a restricted process token/job object and a deny-by-default tool registry.'
Write-Output ''
Write-Output 'Exact commands (still not applied):'
Write-Output "icacls `"$resolved`" /inheritance:d"
Write-Output "icacls `"$resolved`" /remove:g `"NT AUTHORITY\Authenticated Users`""
Write-Output "icacls `"$resolved`" /grant:r `"BUILTIN\Administrators:(OI)(CI)(F)`" `"NT AUTHORITY\SYSTEM:(OI)(CI)(F)`" `"BUILTIN\Users:(OI)(CI)(RX)`" `"${WorkerIdentity}:(OI)(CI)(M)`""
Write-Output ''
Write-Output 'No account, ACL, Windows feature or security policy was changed by this script.'
