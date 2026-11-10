[CmdletBinding()]
param([string]$Root = 'E:\Projects\Invincible\invincible')
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath (Join-Path $Root 'local-ai\agent-service.mjs'))) { throw "Invincible root not found: $Root" }
$credential = Get-Credential -UserName 'MSI\InvincibleAgent' -Message 'Enter the existing InvincibleAgent Windows password. It is used only to launch these two local processes and is not saved.'
$agentCommand = "Set-Location -LiteralPath '$Root'; `$env:INVINCIBLE_WHISPER_URL='http://127.0.0.1:8790/transcribe'; node local-ai/agent-service.mjs"
$whisperCommand = "`$env:INVINCIBLE_AGENT_WORKSPACE='E:\\Invincible\\AgentWorkspace'; `$env:INVINCIBLE_WHISPER_MODEL_DIR='E:\\AI\\Whisper\\models'; `$env:INVINCIBLE_WHISPER_DEVICE='cpu'; `$env:INVINCIBLE_WHISPER_COMPUTE='int8'; & 'E:\\AI\\Whisper\\venv\\Scripts\\python.exe' '$Root\\local-ai\\whisper-service.py'"
$agent = Start-Process powershell.exe -Credential $credential -WindowStyle Normal -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-Command',$agentCommand -PassThru
$whisper = Start-Process powershell.exe -Credential $credential -WindowStyle Normal -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-Command',$whisperCommand -PassThru
Write-Output "Started restricted agent PID $($agent.Id) and Whisper PID $($whisper.Id). Verify both with Get-CimInstance Win32_Process and whoami before testing."
