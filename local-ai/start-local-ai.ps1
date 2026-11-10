[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$FirebaseAgentToken,
  [string]$Root = 'E:\Projects\Invincible\invincible'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath (Join-Path $Root 'local-ai\agent-service.mjs'))) { throw "Invincible root not found: $Root" }
$connectorCommand = "Set-Location -LiteralPath '$Root'; `$env:INVINCIBLE_FIREBASE_AGENT_TOKEN='$FirebaseAgentToken'; node local-ai/firebase-task-connector.mjs"
Start-Process powershell.exe -WindowStyle Normal -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command',"Set-Location -LiteralPath '$Root'; node local-ai/agent-service.mjs"
Start-Process powershell.exe -WindowStyle Normal -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command',$connectorCommand
Write-Output 'Started the local agent and Firebase connector in separate PowerShell windows.'
Write-Output 'Close those windows or press Ctrl+C in each one to stop them.'
