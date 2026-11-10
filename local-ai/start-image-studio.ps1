[CmdletBinding()]
param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$origin = 'http://127.0.0.1:8788'
$log = 'E:\Invincible\AgentWorkspace\imagegen-test-worker.log'
$credentialFile = 'E:\Invincible\ImageGen\worker-login.dpapi'
$config = if (Test-Path -LiteralPath 'E:\Invincible\ImageGen\worker-config.json') { Get-Content -LiteralPath 'E:\Invincible\ImageGen\worker-config.json' -Raw | ConvertFrom-Json } else { @{ownerUid='local-imagegen-test'} }
. (Join-Path $PSScriptRoot 'image-pairing-credential.ps1')
$pairingToken = Get-ImagePairingCredential -OwnerUid $config.ownerUid -Origin $origin -Log $log -File 'E:\Invincible\ImageGen\image-worker-pairing.dpapi'
function Test-ComfyUI {
    try { return [bool](Invoke-RestMethod 'http://127.0.0.1:8188/system_stats' -TimeoutSec 2).system.comfyui_version }
    catch [System.Net.WebException] { return $false }
}
if (-not (Test-ComfyUI)) {
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList '-NoProfile','-File','E:\Invincible\ImageGen\Start-ComfyUI.ps1','-NoBrowser','-KeepQwen' -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\studio-comfy-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\studio-comfy-stderr.log'
    $comfyReady = $false
    for ($i=0; $i -lt 35; $i++) { if (Test-ComfyUI) { $comfyReady=$true; break }; Start-Sleep -Milliseconds 750 }
    if (-not $comfyReady) { throw 'ComfyUI did not start. See E:\Invincible\ImageGen\logs\studio-comfy-stderr.log.' }
}
$running = $false
try { $running = (Invoke-WebRequest $origin -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 } catch [System.Net.WebException] {}
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
        $text = Get-Content -LiteralPath $log -Raw
        $match = [regex]::Match($text, 'http://127\.0\.0\.1:8788/#pair=([A-Za-z0-9_-]+)')
        if ($match.Success) {
            $session = Invoke-RestMethod "$origin/api/session" -Headers @{Authorization=('Bearer '+$match.Groups[1].Value)} -TimeoutSec 2
            if ($session.uid -ne $config.ownerUid -or -not $session.storage.available) { throw 'The worker owner or workspace does not match this local test launcher.' }
            if ($match.Groups[1].Value -cne $pairingToken) { throw 'Restart this worker with the Image Studio shortcut to keep your remembered laptop connection.' }
            $ready = $true
            if (-not $NoBrowser) {
                if ($config.appOrigin -eq 'https://invincy.github.io') { Start-Process 'https://invincy.github.io/invincible/ai/?tool=images' }
                else { Start-Process $match.Value }
            }
            break
        }
    } catch [System.Net.WebException] {}
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'Worker startup did not finish. Inspect E:\Invincible\ImageGen\logs\worker-startup-stderr.log.' }
Write-Output 'Invincible Image Studio is ready on this laptop.'
