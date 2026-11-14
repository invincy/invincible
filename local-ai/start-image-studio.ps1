[CmdletBinding()]
param([switch]$NoBrowser,[switch]$VideoOnly)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$origin = 'http://127.0.0.1:8788'
$pluginOrigin = 'http://127.0.0.1:8791'
$log = 'E:\Invincible\AgentWorkspace\imagegen-test-worker.log'
$credentialFile = 'E:\Invincible\ImageGen\worker-login.dpapi'
$config = if (Test-Path -LiteralPath 'E:\Invincible\ImageGen\worker-config.json') { Get-Content -LiteralPath 'E:\Invincible\ImageGen\worker-config.json' -Raw | ConvertFrom-Json } else { @{ownerUid='local-imagegen-test'} }
. (Join-Path $PSScriptRoot 'image-pairing-credential.ps1')
$pairingToken = Get-ImagePairingCredential -OwnerUid $config.ownerUid -Origin $origin -Log $log -File 'E:\Invincible\ImageGen\image-worker-pairing.dpapi'
function Test-ComfyUI {
    try {
        $loader = Invoke-RestMethod 'http://127.0.0.1:8188/object_info/CheckpointLoaderSimple' -TimeoutSec 2
        return $loader.CheckpointLoaderSimple.input.required.ckpt_name[0] -contains 'v1-5-pruned-emaonly-fp16.safetensors'
    }
    catch [System.Net.WebException] { return $false }
}
if (-not $VideoOnly -and -not (Test-ComfyUI)) {
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList '-NoProfile','-File','E:\Invincible\ImageGen\Start-ComfyUI.ps1','-NoBrowser','-KeepQwen' -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\studio-comfy-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\studio-comfy-stderr.log'
    $comfyReady = $false
    for ($i=0; $i -lt 35; $i++) { if (Test-ComfyUI) { $comfyReady=$true; break }; Start-Sleep -Milliseconds 750 }
    if (-not $comfyReady) { throw 'ComfyUI did not start. See E:\Invincible\ImageGen\logs\studio-comfy-stderr.log.' }
}
function Test-LocalService([string]$Url) {
    try { return (Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 }
    catch { return $false }
}
if ($VideoOnly) {
    if (-not (Test-LocalService 'http://127.0.0.1:11434/api/tags')) {
        $env:OLLAMA_HOST = '127.0.0.1:11434'
        $env:OLLAMA_MODELS = 'E:\AI\Models\Ollama'
        Start-Process -FilePath 'E:\Ollama\ollama.exe' -ArgumentList 'serve' -WindowStyle Hidden -WorkingDirectory 'E:\Ollama'
    }
    if (-not (Test-LocalService 'http://127.0.0.1:8790/health') -and -not (Get-NetTCPConnection -State Listen -LocalPort 8790 -ErrorAction SilentlyContinue)) {
        if (-not (Test-Path -LiteralPath $credentialFile)) { throw 'The Windows-encrypted worker login is missing.' }
        $whisperPassword = ConvertTo-SecureString ((Get-Content -LiteralPath $credentialFile -Raw).Trim())
        try {
            $whisperCredential = New-Object System.Management.Automation.PSCredential("$env:COMPUTERNAME\InvincibleAgent", $whisperPassword)
            $env:INVINCIBLE_AGENT_WORKSPACE = 'E:\Invincible\AgentWorkspace'
            $env:INVINCIBLE_WHISPER_MODEL_DIR = 'E:\AI\Whisper\models'
            $env:INVINCIBLE_WHISPER_DEVICE = 'cpu'
            $env:INVINCIBLE_WHISPER_COMPUTE = 'int8'
            Start-Process -FilePath 'E:\AI\Whisper\venv\Scripts\python.exe' -Credential $whisperCredential -WindowStyle Hidden -WorkingDirectory $root -ArgumentList '-u','local-ai/whisper-service.py' -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\studio-whisper-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\studio-whisper-stderr.log'
        } finally { $whisperPassword.Dispose() }
    }
}
$running = Test-LocalService $origin
if (-not $running) {
    if (-not (Test-Path -LiteralPath $credentialFile)) { throw 'The Windows-encrypted worker login is missing. Reopen the approved setup; this launcher never resets a password.' }
    try { $secure = ConvertTo-SecureString ((Get-Content -LiteralPath $credentialFile -Raw).Trim()) }
    catch { throw 'Windows cannot open this worker credential for the current laptop user.' }
    $credential = New-Object System.Management.Automation.PSCredential("$env:COMPUTERNAME\InvincibleAgent", $secure)
    $env:INVINCIBLE_LOCAL_OWNER_UID = 'local-imagegen-test'
    $env:INVINCIBLE_LOCAL_AI_PORT = '8788'
    $env:INVINCIBLE_IMAGE_WORKER_TOKEN = $pairingToken
    try { Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -Credential $credential -WindowStyle Hidden -WorkingDirectory $root -ArgumentList 'local-ai/image-worker-entry.mjs' -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\worker-startup-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\worker-startup-stderr.log' | Out-Null }
    finally { Remove-Item Env:INVINCIBLE_IMAGE_WORKER_TOKEN -ErrorAction SilentlyContinue; $secure.Dispose() }
}
$ready = $false
for ($i=0; $i -lt 40; $i++) {
    try {
        $session = Invoke-RestMethod "$origin/api/session" -Headers @{Authorization=('Bearer '+$pairingToken)} -TimeoutSec 2
    } catch { $session = $null }
    if ($session) {
        if ($session.uid -ne $config.ownerUid -or -not $session.storage.available) { throw 'The worker owner or workspace does not match this launcher.' }
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'Worker startup did not finish. Inspect E:\Invincible\ImageGen\logs\worker-startup-stderr.log.' }
$pluginReady = $false
for ($i=0; $i -lt 20; $i++) {
    if (Test-LocalService "$pluginOrigin/health") { $pluginReady = $true; break }
    Start-Sleep -Milliseconds 500
}
if (-not $pluginReady) { throw 'Invincible Video Director did not start. Inspect E:\Invincible\ImageGen\logs\worker-startup-stderr.log.' }
if ($config.appOrigin -eq 'https://invincy.github.io') {
    try { & (Join-Path $PSScriptRoot 'start-image-relay.ps1') -ImageToken $pairingToken }
    catch { Write-Warning ('Image Studio is ready locally. Mobile connection could not start. ' + $_.Exception.Message) }
}
if ($VideoOnly) {
    try { $capabilities = Invoke-RestMethod "$origin/api/voiceover/catalog-status" -Headers @{Authorization=('Bearer '+$pairingToken)} -TimeoutSec 3 }
    catch { throw 'Close the older Image Studio worker, then run this launcher again.' }
    if (-not $capabilities.automaticContext) { throw 'Close the older Image Studio worker, then run this launcher again.' }
    $videoReady = $false
    for ($i=0; $i -lt 45; $i++) {
        try {
            $videoReady = (Invoke-RestMethod "$origin/api/voiceover/catalog-status?check=production" -Headers @{Authorization=('Bearer '+$pairingToken)} -TimeoutSec 8).automaticContext -eq $true
            if ($videoReady) { break }
        } catch {}
        Start-Sleep -Seconds 1
    }
    if (-not $videoReady) { throw 'Video services are not ready. Check the Whisper startup log, Ollama and the laptop worker version.' }
    if (-not $NoBrowser) { Start-Process 'https://invincy.github.io/invincible/creator/' }
    Write-Output 'Invincible Video Studio and Video Director plugin are ready.'
    exit
}
if (-not $NoBrowser) {
    if ($config.appOrigin -eq 'https://invincy.github.io') { Start-Process 'https://invincy.github.io/invincible/ai/?tool=images' }
    else { Start-Process "$origin/#pair=$pairingToken" }
}
Write-Output 'Invincible Image Studio is ready on this laptop.'
