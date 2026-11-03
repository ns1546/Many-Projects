' ======================================================================
' J.A.R.V.I.S. Silent Background Service Launcher
' Runs J.A.R.V.I.S. persistently in the background without any visible console window.
' ======================================================================

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

strScriptPath = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strScriptPath

' Clean up any stale process on port 5050
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr "":5050"" ^| findstr ""LISTENING""') do taskkill /f /pid %a", 0, True

' Launch dashboard server silently with pythonw.exe
strCmd = "pythonw.exe core/dashboard_server.py 5050"
WshShell.Run strCmd, 0, False

WScript.Sleep 2500

' Open the Holographic Dashboard HUD in the default browser
WshShell.Run "http://127.0.0.1:5050", 1, False
