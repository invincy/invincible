[CmdletBinding()]
param(
  [string]$Workspace = 'E:\Invincible\AgentWorkspace',
  [string]$Backup = 'E:\Invincible\AgentWorkspace.acl.backup'
)
$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'This script must run elevated.'
}
if (-not (Test-Path -LiteralPath $Workspace)) { throw "Workspace missing: $Workspace" }
if (-not (Test-Path -LiteralPath $Backup)) { & icacls.exe $Workspace /save $Backup /t /c | Out-Host }
$user = Get-LocalUser -Name InvincibleAgent -ErrorAction SilentlyContinue
if (-not $user) {
  $bytes = New-Object byte[] 32
  $rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
  $rng.GetBytes($bytes)
  $rng.Dispose()
  $passwordText = [Convert]::ToBase64String($bytes) + '!aA9'
  $secure = ConvertTo-SecureString $passwordText -AsPlainText -Force
  New-LocalUser -Name InvincibleAgent -Password $secure -Description 'Invincible restricted AI worker' -AccountNeverExpires -UserMayNotChangePassword:$true | Out-Null
  Remove-Variable passwordText,secure,bytes -ErrorAction SilentlyContinue
}
$adminNames = Get-LocalGroupMember -Group Administrators -ErrorAction Stop | ForEach-Object Name
if ($adminNames -match '(?i)(^|\\)InvincibleAgent$') { throw 'InvincibleAgent is an administrator.' }
& icacls.exe $Workspace /inheritance:d | Out-Host
& icacls.exe $Workspace /remove:g 'NT AUTHORITY\Authenticated Users' | Out-Host
& icacls.exe $Workspace /grant:r 'BUILTIN\Administrators:(OI)(CI)(F)' 'NT AUTHORITY\SYSTEM:(OI)(CI)(F)' 'BUILTIN\Users:(OI)(CI)(RX)' 'InvincibleAgent:(OI)(CI)(M)' | Out-Host
Write-Output 'Applied scoped workspace ACL hardening.'
& icacls.exe $Workspace
