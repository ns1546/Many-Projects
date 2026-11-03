---
name: windows-pc-control
description: "Comprehensive Windows PC automation for J.A.R.V.I.S.: inspect hardware vitals (CPU, RAM, disk, battery), launch and terminate applications, list and focus open windows, lock the workstation, and control master system volume."
---

# Windows PC Control Skill for J.A.R.V.I.S.

This skill equips Hermes Agent with direct capabilities to operate the host Windows PC.

## Capabilities & Commands

### 1. Hardware Diagnostics & Vitals
To query current system resource utilization (CPU %, RAM %, storage free space, battery):
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().get_system_vitals())"
```

### 2. Application Launching
To launch any application (e.g., Chrome, Notepad, Calculator, VS Code, Spotify):
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().launch_application('chrome'))"
```

### 3. Window Management
To list all active, visible top-level windows:
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().list_open_windows())"
```

To bring a specific window to the foreground:
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().focus_window('notepad'))"
```

### 4. Application Termination (Safety Tier 2)
To terminate a running process by name or PID:
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().kill_process('notepad'))"
```

### 5. Workstation Security
To lock the Windows screen immediately:
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().lock_workstation())"
```
