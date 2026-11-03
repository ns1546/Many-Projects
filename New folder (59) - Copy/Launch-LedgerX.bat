@echo off
title LedgerX Enterprise Desktop Launcher
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo [LedgerX] Verifying application assets...
if not exist "dist\index.html" (
    echo [LedgerX] First-time launch: compiling production bundle...
    call npm run build
)

echo [LedgerX] Checking local desktop server...
powershell -Command "$r = try { (Invoke-WebRequest -Uri 'http://127.0.0.1:5173/health' -UseBasicParsing -TimeoutSec 1).StatusCode } catch { 0 }; if ($r -eq 200) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo [LedgerX] Starting background desktop service...
    powershell -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'scripts\desktop_server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
    
    echo [LedgerX] Waiting for server readiness...
    powershell -Command "$ok = $false; for ($i=0; $i -lt 30; $i++) { try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/health' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ok = $true; break } } catch { Start-Sleep -Milliseconds 150 } }; if (-not $ok) { exit 1 } else { exit 0 }"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start local server on port 5173. Please check Node.js installation.
        pause
        exit /b 1
    )
)

echo [LedgerX] Server online. Initializing desktop window...
set "APP_URL=http://127.0.0.1:5173/"
set "BROWSER_CMD="

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_CMD=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_CMD=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_CMD=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_CMD=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_CMD=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if defined BROWSER_CMD (
    start "" "!BROWSER_CMD!" --app="!APP_URL!" --window-size=1280,850 --name="LedgerX Desktop"
) else (
    start "" "!APP_URL!"
)

exit /b 0
