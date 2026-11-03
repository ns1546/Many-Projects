# Normal Mode Restore Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "      🌱 RESTORING NORMAL BALANCED MODE 🌱         " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Restore Balanced Power Plan
try {
    powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e
    Write-Host "[+] Power Plan: Restored to Balanced (Energy Efficient)" -ForegroundColor Green
} catch {}

# 2. Restore Normal Process Priority
$devApps = @("Antigravity IDE", "chrome")
foreach ($appName in $devApps) {
    Get-Process -Name $appName -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $_.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::Normal
        } catch {}
    }
}
Write-Host "[+] CPU Priority: Restored to Normal" -ForegroundColor Green

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "             ✔ BALANCED MODE ACTIVE               " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
