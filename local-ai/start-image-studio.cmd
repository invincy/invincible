@echo off
powershell.exe -NoProfile -File "%~dp0start-image-studio.ps1"
if errorlevel 1 pause
