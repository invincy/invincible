[CmdletBinding()]
param(
  [string]$FirebaseAgentToken,
  [string]$Root = 'E:\Projects\Invincible\invincible'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath (Join-Path $Root 'local-ai\agent-service.mjs'))) { throw "Invincible root not found: $Root" }
if (-not $FirebaseAgentToken) {
  $tokenFile = Join-Path $env:LOCALAPPDATA 'Invincible\firebase-agent-token.dpapi'
  if (-not (Test-Path -LiteralPath $tokenFile)) { throw "No saved token found. Run save-agent-token.ps1 once." }
  try { $secure = ConvertTo-SecureString -String ((Get-Content -LiteralPath $tokenFile -Raw).Trim()) } catch { throw 'Saved token file is invalid. Run save-agent-token.ps1 once again with the current pairing token.' }
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $FirebaseAgentToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
$connectorCommand = "Set-Location -LiteralPath '$Root'; `$env:INVINCIBLE_FIREBASE_AGENT_TOKEN='$FirebaseAgentToken'; node local-ai/firebase-task-connector.mjs"
$agentCommand = "Set-Location -LiteralPath '$Root'; `$env:INVINCIBLE_WHISPER_URL='http://127.0.0.1:8790/transcribe'; node local-ai/agent-service.mjs"
$whisperCommand = "`$env:INVINCIBLE_AGENT_WORKSPACE='E:\\Invincible\\AgentWorkspace'; `$env:INVINCIBLE_WHISPER_MODEL_DIR='E:\\AI\\Whisper\\models'; `$env:INVINCIBLE_WHISPER_DEVICE='cpu'; `$env:INVINCIBLE_WHISPER_COMPUTE='int8'; & 'E:\\AI\\Whisper\\venv\\Scripts\\python.exe' '$Root\\local-ai\\whisper-service.py'"
Start-Process powershell.exe -WindowStyle Normal -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-Command',$agentCommand
Start-Process powershell.exe -WindowStyle Normal -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-Command',$whisperCommand
Start-Process powershell.exe -WindowStyle Normal -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-Command',$connectorCommand
Write-Output 'Started the local agent, Whisper service and Firebase connector in separate PowerShell windows.'
Write-Output 'For the hardened workspace, run this launcher under MSI\InvincibleAgent.'
Write-Output 'Close those windows or press Ctrl+C in each one to stop them.'
