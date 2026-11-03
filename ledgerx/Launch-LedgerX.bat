@echo off
title LedgerX Enterprise Desktop Launcher
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo       Starting LedgerX Enterprise Desktop Server
echo ========================================================

if not exist "node_modules" (
    echo [LedgerX] First time setup: Installing dependencies...
    call npm install
)

echo [LedgerX] Launching development server...
call npm run dev
pause
