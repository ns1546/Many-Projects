# Evorise Restaurant Admin - Desktop Launcher for Windows PowerShell
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   EVORISE RESTAURANT ADMIN - DESKTOP EDITION" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# Test if port 3000 is open
$isPortOpen = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 3000)
    $isPortOpen = $tcp.Connected
    $tcp.Close()
} catch {
    $isPortOpen = $false
}

if (-not $isPortOpen) {
    Write-Host "[1/2] Starting local SQLite backend server..." -ForegroundColor Green
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/2] Local backend server is active on port 3000." -ForegroundColor Green
}

Write-Host "[2/2] Launching Admin Desktop Application..." -ForegroundColor Yellow
npx electron ./desktop
