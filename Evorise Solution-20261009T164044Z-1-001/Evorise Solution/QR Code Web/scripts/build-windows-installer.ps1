# Build Official Windows Setup Wizard Installer (.exe)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Join-Path $ScriptDir "..")
Set-Location $ProjectRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   BUILDING OFFICIAL WINDOWS SETUP INSTALLER (.EXE)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Verify app files
$distApp = Join-Path $ProjectRoot "dist\Evorise-Restaurant-Admin-win32-x64"
if (-not (Test-Path (Join-Path $distApp "Evorise-Restaurant-Admin.exe"))) {
    Write-Host "[1/4] Rebuilding packaged desktop binaries..." -ForegroundColor Yellow
    npm run build:desktop
}

# 2. Prepare output directory
$outDir = Join-Path $ProjectRoot "dist-installer"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$payloadZip = Join-Path $outDir "payload.zip"

if (-not (Test-Path $payloadZip) -or ((Get-Item $payloadZip).Length -lt 100MB)) {
    Write-Host "[2/4] Packaging application payload into archive..." -ForegroundColor Green
    if (Test-Path $payloadZip) { Remove-Item $payloadZip -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($distApp, $payloadZip, [System.IO.Compression.CompressionLevel]::Fastest, $false)
} else {
    Write-Host "[2/4] Using existing packaged archive ($([Math]::Round((Get-Item $payloadZip).Length / 1MB)) MB)..." -ForegroundColor Green
}

# 4. Compile native C# Setup Wizard
Write-Host "[3/4] Compiling native Windows Setup Wizard (CSC / .NET)..." -ForegroundColor Green
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

$sourceFile = Join-Path $ScriptDir "Installer.cs"
$outputExe = Join-Path $outDir "Evorise-Restaurant-Admin-Setup.exe"

& $cscPath /target:winexe /optimize+ "/out:$outputExe" /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll "/res:$payloadZip,AppPayload.zip" "$sourceFile"

# 5. Cleanup temp payload
if (Test-Path $outputExe) {
    Start-Sleep -Milliseconds 500
    try {
        if (Test-Path $payloadZip) {
            Remove-Item $payloadZip -Force -ErrorAction SilentlyContinue
        }
    } catch {}

    $sizeMb = [Math]::Round((Get-Item $outputExe).Length / 1MB, 1)
    Write-Host "[4/4] SUCCESS! Setup Installer created:" -ForegroundColor Green
    Write-Host " -> $outputExe ($sizeMb MB)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This single Setup file can be sent to any client." -ForegroundColor Cyan
    Write-Host "When run, it displays the official Windows Installation Wizard," -ForegroundColor Cyan
    Write-Host "creates Desktop & Start Menu shortcuts, and registers in Windows Apps." -ForegroundColor Cyan
} else {
    Write-Error "Installer compilation failed."
}
