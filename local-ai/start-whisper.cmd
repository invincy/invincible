@echo off
setlocal
set "INVINCIBLE_AGENT_WORKSPACE=E:\Invincible\AgentWorkspace"
set "INVINCIBLE_WHISPER_MODEL_DIR=E:\AI\Whisper\models"
set "INVINCIBLE_WHISPER_DEVICE=cpu"
set "INVINCIBLE_WHISPER_COMPUTE=int8"
"E:\AI\Whisper\venv\Scripts\python.exe" "E:\Projects\Invincible\invincible\local-ai\whisper-service.py"
