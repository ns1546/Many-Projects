@echo off
title Evorise Restaurant Admin - Desktop Launcher
cd /d "%~dp0\.."

echo ========================================================
echo    EVORISE RESTAURANT ADMIN - DESKTOP EDITION
echo ========================================================
echo.

:: Check if server is already running on port 3000
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] Starting local SQLite backend server...
    start /b node server.js
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Local backend server is already running on port 3000.
)

echo [2/2] Launching Admin Desktop Application...
npx electron ./desktop

exit
