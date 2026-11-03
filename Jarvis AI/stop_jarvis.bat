@echo off
title J.A.R.V.I.S. Shutdown Utility
echo ======================================================================
echo           J.A.R.V.I.S. SHUTDOWN AND CLEANUP UTILITY
echo ======================================================================
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5050" ^| findstr "LISTENING"') do (
    echo [*] Terminating J.A.R.V.I.S. background instance on port 5050 PID %%a
    taskkill /f /pid %%a >nul 2>&1
    set FOUND=1
)

if "%FOUND%"=="1" (
    echo [OK] J.A.R.V.I.S. background service stopped successfully. Port 5050 is free.
) else (
    echo [!] No active J.A.R.V.I.S. instance found listening on port 5050.
)

echo.
