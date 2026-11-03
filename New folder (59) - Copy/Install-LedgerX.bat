@echo off
title LedgerX Enterprise Desktop Setup
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ======================================================================
echo          LEDGERX ENTERPRISE DESKTOP - WINDOWS SETUP WIZARD
echo ======================================================================
echo.
echo Launching professional animated installation wizard...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\LedgerX_Installer_GUI.ps1"

exit /b 0
