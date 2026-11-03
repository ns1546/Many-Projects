@echo off
setlocal enabledelayedexpansion
title J.A.R.V.I.S. Master System Launcher

echo ======================================================================
echo           J.A.R.V.I.S. AUTONOMOUS COGNITIVE SYSTEM
echo               Professional Production Launcher
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in system PATH.
    echo Please install Python 3.10+ and add it to your system PATH.
    pause
    exit /b 1
)

:: 2. Free port 5050 if previously occupied by a stale process
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5050" ^| findstr "LISTENING"') do (
    echo [*] Freeing port 5050 occupied by stale PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: 3. Launch J.A.R.V.I.S. Holographic Command Dashboard & Sensory Array
echo [*] Initiating J.A.R.V.I.S. Executive Core on port 5050...
echo [*] Engaging Neural British Voice Engine (en-GB-RyanNeural)...
echo [*] Engaging Faster-Whisper Continuous Acoustic Listening Array...
echo [*] Engaging Local Qwen Cognitive Brain...
echo.
echo [OK] J.A.R.V.I.S. is ACTIVE at http://127.0.0.1:5050
echo [*] Press Ctrl+C in this window to stop J.A.R.V.I.S.
echo.

python -u core/dashboard_server.py 5050
pause
