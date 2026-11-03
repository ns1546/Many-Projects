@echo off
title Evorise Restaurant - Share Online With Client
cd /d "%~dp0\.."

echo ========================================================
echo    SHARE EVORISE RESTAURANT TO CLIENT (PUBLIC URL)
echo ========================================================
echo.

:: Check if server is already running on port 3000
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] Starting local SQLite backend server...
    start /b node server.js
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Local backend server is active on port 3000.
)

echo [2/2] Generating instant secure public internet link for client...
echo.
echo ========================================================
echo  Send this generated URL to your client so they can:
echo   - Scan and test the Customer Menu on their phone
echo   - Place live test orders from anywhere in the world!
echo ========================================================
echo.
npx localtunnel --port 3000

pause
