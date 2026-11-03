LCD Line Tool (Windows)
=========================

This is a lightweight Windows Forms tray utility for placing a small white
overlay over a damaged LCD line.

Features:
- No visible terminal/PowerShell window.
- ON/OFF from the tray menu.
- X/Y position, length and thickness controls.
- Settings saved automatically to AppData and restored on next launch.
- Uses a single tiny overlay window while enabled.

Build:
1. Install the .NET 8 SDK for Windows.
2. Open Command Prompt in this folder.
3. Run:
   dotnet publish -c Release
4. The EXE will be under:
   bin\Release\net8.0-windows\win-x64\publish\LCDLineTool.exe

If you don't want it starting automatically, simply don't put a shortcut in
the Windows Startup folder.
