[CmdletBinding()]
param(
  [string]$Workspace = 'E:\Invincible\AgentWorkspace',
  [string]$Backup = 'E:\Invincible\AgentWorkspace.acl.backup'
)
$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run this test elevated.' }
if (-not (Test-Path -LiteralPath $Backup)) { throw "ACL backup missing: $Backup" }
$parent = Split-Path -Parent $Workspace
$oldLocation = Get-Location
Push-Location -LiteralPath $parent
try { & icacls.exe $parent /restore $Backup /c | Out-Host } finally { Pop-Location }
$restored = (& icacls.exe $Workspace | Out-String)
if ($restored -notmatch 'Authenticated Users:\(I\)\(M\)') { throw 'Rollback verification failed: original inherited entry was not restored.' }
& icacls.exe $Workspace /inheritance:d | Out-Host
& icacls.exe $Workspace /remove:g 'NT AUTHORITY\Authenticated Users' | Out-Host
& icacls.exe $Workspace /grant:r 'BUILTIN\Administrators:(OI)(CI)(F)' 'NT AUTHORITY\SYSTEM:(OI)(CI)(F)' 'BUILTIN\Users:(OI)(CI)(RX)' 'InvincibleAgent:(OI)(CI)(M)' | Out-Host
$hardened = (& icacls.exe $Workspace | Out-String)
if ($hardened -notmatch 'InvincibleAgent:\(OI\)\(CI\)\(M\)') { throw 'Re-hardening verification failed.' }
Write-Output 'Rollback restored the original ACL, then the hardened ACL was reapplied successfully.'
