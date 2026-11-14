# The laptop owner's DPAPI profile protects the image worker's stable bearer.
function Get-ImagePairingCredential {
    param([string]$OwnerUid,[string]$Origin,[string]$Log,[string]$File)
    if ($OwnerUid -notmatch '^[A-Za-z0-9_-]{3,120}$') { throw 'Invalid configured image worker owner.' }
    $guard = [IO.File]::Open("$File.lock",[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    try {
        $saved = $null
        if (Test-Path -LiteralPath $File) {
            $secure = $null
            try {
                $secure = ConvertTo-SecureString ((Get-Content -LiteralPath $File -Raw).Trim())
                $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
                try { $saved = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) | ConvertFrom-Json }
                finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
                if ($saved.ownerUid -eq $OwnerUid -and $saved.origin -eq $Origin -and $saved.token -cmatch '^[A-Za-z0-9_-]{32,100}$') {
                    try { $session = Invoke-RestMethod "$Origin/api/session" -Headers @{Authorization=('Bearer '+$saved.token)} -TimeoutSec 2 }
                    catch { $session = $null }
                    if ($session -and $session.uid -eq $OwnerUid -and $session.storage.available) { return $saved.token }
                }
            } catch { throw 'Windows could not open this laptop pairing record for the current account.' }
            finally { if ($secure) { $secure.Dispose() } }
        }
        $token = $null
        if (Test-Path -LiteralPath $Log) {
            $match = [regex]::Match((Get-Content -LiteralPath $Log -Raw), [regex]::Escape($Origin) + '/#pair=([A-Za-z0-9_-]{32,100})')
            if ($match.Success -and (-not $saved -or $saved.ownerUid -eq $OwnerUid)) {
                $candidate = $match.Groups[1].Value
                try { $session = Invoke-RestMethod "$Origin/api/session" -Headers @{Authorization=('Bearer '+$candidate)} -TimeoutSec 2 }
                catch [System.Net.WebException] { $session = $null }
                if ($session -and $session.uid -eq $OwnerUid -and $session.storage.available) { $token = $candidate }
            }
        }
        if (-not $token) {
            $bytes = New-Object byte[] 32
            $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
            try { $rng.GetBytes($bytes); $token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_') }
            finally { [Array]::Clear($bytes,0,$bytes.Length); $rng.Dispose() }
        }
        $record = @{ownerUid=$OwnerUid;origin=$Origin;token=$token} | ConvertTo-Json -Compress
        $secure = ConvertTo-SecureString $record -AsPlainText -Force
        $temporary = "$File.$([Guid]::NewGuid().ToString('N')).tmp"
        try {
            ConvertFrom-SecureString $secure | Set-Content -LiteralPath $temporary -Encoding Ascii -ErrorAction Stop
            Move-Item -LiteralPath $temporary -Destination $File -Force -ErrorAction Stop
        } finally {
            $secure.Dispose()
            if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary }
        }
        return $token
    } finally { $guard.Dispose() }
}
