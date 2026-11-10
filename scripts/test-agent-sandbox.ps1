[CmdletBinding()]
param(
  [string]$Workspace = 'E:\Invincible\AgentWorkspace'
)
$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run this test elevated.' }
$bytes = New-Object byte[] 32
$rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes); $rng.Dispose()
$passwordText = [Convert]::ToBase64String($bytes) + '!aA9'
$secure = ConvertTo-SecureString $passwordText -AsPlainText -Force
Set-LocalUser -Name InvincibleAgent -Password $secure
$credential = New-Object System.Management.Automation.PSCredential('.\InvincibleAgent',$secure)
$probe = Join-Path $PSScriptRoot 'probe-agent-sandbox.ps1'
$out = Join-Path $Workspace 'sandbox-probe-result.json'
Remove-Item -LiteralPath $out -Force -ErrorAction SilentlyContinue
$command = "& '$probe' | Set-Content -LiteralPath '$out' -Encoding UTF8"
$proc = Start-Process -FilePath 'powershell.exe' -Credential $credential -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command',$command -Wait -PassThru -WindowStyle Hidden
if ($proc.ExitCode -ne 0) { throw "Restricted probe exited with code $($proc.ExitCode)." }
$result = Get-Content -LiteralPath $out -Raw | ConvertFrom-Json
Remove-Item -LiteralPath $out -Force -ErrorAction SilentlyContinue
$result | ConvertTo-Json
