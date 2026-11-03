@echo off
title Tawsif Mahbub Official Website - Local Server
echo ===============================================================
echo   TAWSIF MAHBUB — OFFICIAL EDITORIAL PORTFOLIO & FILMOGRAPHY
echo ===============================================================
echo.
echo Starting local preview server on http://localhost:5000 ...
echo.

where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js / npx serve...
    start http://localhost:5000
    npx serve . -l 5000
    goto end
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python http.server...
    start http://localhost:5000
    python -m http.server 5000
    goto end
)

echo Opening index.html directly in browser...
start index.html

:end
pause
