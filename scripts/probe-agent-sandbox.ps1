$ErrorActionPreference = 'Continue'
$workspace = 'E:\Invincible\AgentWorkspace'
$probe = Join-Path $workspace 'sandbox-probe.txt'
$result = [ordered]@{
  identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
  isAdministrator = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  workspaceWrite = $false
  personalCredentialsRead = $false
  unrelatedRepoRead = $false
  ollamaReachable = $false
  childProcessLaunch = $false
}
try { Set-Content -LiteralPath $probe -Value 'probe' -ErrorAction Stop; $result.workspaceWrite = $true; Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue } catch {}
try { $null = Get-ChildItem -LiteralPath 'C:\Users\vaibh\.ssh' -Force -ErrorAction Stop; $result.personalCredentialsRead = $true } catch {}
try { $null = Get-ChildItem -LiteralPath 'E:\Development\Worktrees\invincible-local-ai-v1' -Force -ErrorAction Stop; $result.unrelatedRepoRead = $true } catch {}
try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:11434/api/tags' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop; $result.ollamaReachable = $true } catch {}
try { $p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','exit 0' -PassThru -Wait -WindowStyle Hidden -ErrorAction Stop; $result.childProcessLaunch = ($p.ExitCode -eq 0) } catch {}
$result | ConvertTo-Json -Compress
