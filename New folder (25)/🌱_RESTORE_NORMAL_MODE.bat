@echo off
title Restore Normal Mode
echo Restoring Normal Mode...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DevNormal.ps1"
echo.
pause
