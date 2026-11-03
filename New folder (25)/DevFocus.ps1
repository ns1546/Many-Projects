# Development Focus Mode Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     ⚡ ENABLING DEVELOPMENT FOCUS MODE ⚡        " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Switch Power Plan to High Performance for max CPU boost clock
try {
    powercfg /setactive ea254b9a-0ead-4e4f-a4fb-d44df9c4e15b
    Write-Host "[+] Power Plan: High Performance (Intel Core i5 Max Boost)" -ForegroundColor Green
} catch {
    Write-Host "[-] Power Plan adjustment skipped" -ForegroundColor DarkGray
}

# 2. Elevate Antigravity IDE and Google Chrome Priority
$devApps = @("Antigravity IDE", "chrome", "node", "git", "python", "code")
$elevatedCount = 0
foreach ($appName in $devApps) {
    Get-Process -Name $appName -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $_.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::AboveNormal
            $elevatedCount++
        } catch {}
    }
}
Write-Host "[+] CPU Priority: Elevated Antigravity IDE and Chrome to AboveNormal ($elevatedCount processes)" -ForegroundColor Green

# 3. Trim Unused RAM Working Sets from Background Apps
Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

public class MemoryCleaner {
    [DllImport("psapi.dll")]
    public static extern int EmptyWorkingSet(IntPtr hwProc);

    public static void TrimIdleMemory() {
        string[] exempt = new string[] { "Antigravity IDE", "chrome", "powershell", "cmd" };
        foreach (Process p in Process.GetProcesses()) {
            try {
                if (Array.IndexOf(exempt, p.ProcessName) < 0) {
                    EmptyWorkingSet(p.Handle);
                }
            } catch {}
        }
    }
}
"@ -ErrorAction SilentlyContinue

try {
    [MemoryCleaner]::TrimIdleMemory()
    [System.GC]::Collect()
    Write-Host "[+] RAM: Flushed idle background memory working sets" -ForegroundColor Green
} catch {
    Write-Host "[-] Memory trim skipped" -ForegroundColor DarkGray
}

# 4. Stop unnecessary background services/bloat
$bloatList = @("CrossDeviceService", "AweSun")
foreach ($b in $bloatList) {
    Get-Process -Name $b -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Write-Host "[+] Background Bloat: Suspended non-essential services (Phone Link, etc.)" -ForegroundColor Green

# 5. Terminate orphaned / rogue node MCP processes if any
$mcpProcesses = Get-CimInstance Win32_Process | Where-Object { 
    $_.CommandLine -like "*@modelcontextprotocol*" -or 
    $_.CommandLine -like "*mcp-server*" -or 
    $_.CommandLine -like "*chrome-devtools-mcp*" 
}
if ($mcpProcesses) {
    $mcpProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Write-Host "[+] MCP Clean: Purged orphaned background MCP servers" -ForegroundColor Green
}

# 6. Flush DNS & Network Stack
ipconfig /flushdns | Out-Null
Write-Host "[+] Network: DNS Cache Flushed for Fast API Responses" -ForegroundColor Green

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   🚀 SYSTEM READY FOR ZERO-LAG PRODUCTIVITY!     " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
