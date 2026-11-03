@echo off
title Development Focus Mode
echo Activating Development Focus Mode...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DevFocus.ps1"
echo.
pause
