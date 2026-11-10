param([Parameter(Mandatory)][string]$ImageToken)
$ErrorActionPreference = 'Stop'
$entry = Join-Path $PSScriptRoot 'firebase-image-connector.mjs'
$running = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {
    $_.CommandLine -and $_.CommandLine.Contains($entry)
}
if ($running) { return }
$tokenFile = Join-Path $env:LOCALAPPDATA 'Invincible\firebase-agent-token.dpapi'
if (-not (Test-Path -LiteralPath $tokenFile)) { throw 'The saved Invincible local AI connection is missing.' }
$secure = ConvertTo-SecureString ((Get-Content -LiteralPath $tokenFile -Raw).Trim())
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:INVINCIBLE_FIREBASE_AGENT_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    $env:INVINCIBLE_IMAGE_WORKER_TOKEN = $ImageToken
    Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -WindowStyle Hidden -ArgumentList ('"' + $entry + '"') -RedirectStandardOutput 'E:\Invincible\ImageGen\logs\image-relay-stdout.log' -RedirectStandardError 'E:\Invincible\ImageGen\logs\image-relay-stderr.log'
} finally {
    Remove-Item Env:INVINCIBLE_FIREBASE_AGENT_TOKEN,Env:INVINCIBLE_IMAGE_WORKER_TOKEN -ErrorAction SilentlyContinue
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $secure.Dispose()
}
