@echo off
powershell.exe -NoProfile -File "%~dp0start-imagegen-worker.ps1" %*
if errorlevel 1 pause
