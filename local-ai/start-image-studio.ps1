[CmdletBinding()]
param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$origin = 'http://127.0.0.1:8788'
$log = 'E:\Invincible\AgentWorkspace\imagegen-test-worker.log'
$credentialFile = 'E:\Invincible\ImageGen\worker-login.dpapi'
$config = if (Test-Path -LiteralPath 'E:\Invincible\ImageGen\worker-config.json') { Get-Content -LiteralPath 'E:\Invincible\ImageGen\worker-config.json' -Raw | ConvertFrom-Json } else { @{ownerUid='local-imagegen-test'} }
$running = $false
try { $running = (Invoke-WebRequest $origin -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 } catch [System.Net.WebException] {}
if (-not $running) {
    if (-not (Test-Path -LiteralPath $credentialFile)) { throw 'The Windows-encrypted worker login is missing. Reopen the approved setup; this launcher never resets a password.' }
    try { $secure = ConvertTo-SecureString ((Get-Content -LiteralPath $credentialFile -Raw).Trim()) }
    catch { throw 'Windows cannot open this worker credential for the current laptop user.' }
    $credential = New-Object System.Management.Automation.PSCredential("$env:COMPUTERNAME\InvincibleAgent", $secure)
    $env:INVINCIBLE_LOCAL_OWNER_UID = 'local-imagegen-test'
    $env:INVINCIBLE_LOCAL_AI_PORT = '8788'
    Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -Credential $credential -WindowStyle Hidden -WorkingDirectory $root -ArgumentList 'local-ai/image-worker-entry.mjs' -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\worker-startup-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\worker-startup-stderr.log' | Out-Null
    $secure.Dispose()
}
$ready = $false
for ($i=0; $i -lt 40; $i++) {
    try {
        $text = Get-Content -LiteralPath $log -Raw
        $match = [regex]::Match($text, 'http://127\.0\.0\.1:8788/#pair=([A-Za-z0-9_-]+)')
        if ($match.Success) {
            $session = Invoke-RestMethod "$origin/api/session" -Headers @{Authorization=('Bearer '+$match.Groups[1].Value)} -TimeoutSec 2
            if ($session.uid -ne $config.ownerUid -or -not $session.storage.available) { throw 'The worker owner or workspace does not match this local test launcher.' }
            $ready = $true
            if (-not $NoBrowser) { Start-Process $match.Value }
            break
        }
    } catch [System.Net.WebException] {}
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'Worker startup did not finish. Inspect E:\Invincible\ImageGen\logs\worker-startup-stderr.log.' }
Write-Output 'Invincible Image Studio is ready on this laptop.'
