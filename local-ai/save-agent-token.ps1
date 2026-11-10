[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$token = Read-Host 'Paste the new pairing token (input is hidden)' -AsSecureString
$folder = Join-Path $env:LOCALAPPDATA 'Invincible'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$token | ConvertFrom-SecureString | Set-Content -LiteralPath (Join-Path $folder 'firebase-agent-token.dpapi') -Encoding ASCII
Write-Output 'Token saved in Windows-encrypted storage for this user.'
