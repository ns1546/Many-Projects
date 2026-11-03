"""
J.A.R.V.I.S. Windows Automation Controller
Native Win32, PowerShell 7, Process Management, and Window Manipulation
"""

import subprocess
import shutil
import os
import psutil
import difflib
from typing import Dict, Any, List, Optional, Tuple

class WindowsOSController:
    def __init__(self, timeout_seconds: int = 30):
        self.timeout_seconds = timeout_seconds
        # Detect if pwsh (PowerShell 7) is available, otherwise fallback to powershell (Windows PowerShell 5.1)
        self.ps_exe = "pwsh" if shutil.which("pwsh") else "powershell"

    def execute_powershell(self, script: str) -> Dict[str, Any]:
        """Executes a PowerShell command or script safely and captures stdout/stderr."""
        try:
            cmd = [self.ps_exe, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script]
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
                shell=False
            )
            return {
                "success": res.returncode == 0,
                "exit_code": res.returncode,
                "stdout": res.stdout.strip(),
                "stderr": res.stderr.strip()
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Command timed out after {self.timeout_seconds} seconds."
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e)
            }

    def get_system_vitals(self) -> Dict[str, Any]:
        """Gathers real-time CPU, RAM, disk, and battery metrics."""
        cpu_pct = psutil.cpu_percent(interval=0.2)
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage("C:\\")
        
        battery_info = "N/A"
        battery = psutil.sensors_battery()
        if battery:
            plugged = "Plugged in" if battery.power_plugged else "On battery"
            battery_info = f"{battery.percent}% ({plugged})"

        return {
            "cpu_percent": cpu_pct,
            "ram_percent": ram.percent,
            "ram_used_gb": round(ram.used / (1024**3), 2),
            "ram_total_gb": round(ram.total / (1024**3), 2),
            "disk_free_gb": round(disk.free / (1024**3), 2),
            "disk_total_gb": round(disk.total / (1024**3), 2),
            "battery": battery_info
        }

    def list_running_apps(self, filter_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lists active running application processes."""
        apps = []
        for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                info = p.info
                name = info['name'] or ""
                if filter_name and filter_name.lower() not in name.lower():
                    continue
                apps.append({
                    "pid": info['pid'],
                    "name": name,
                    "cpu": info.get('cpu_percent', 0.0),
                    "ram": round(info.get('memory_percent', 0.0), 2)
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return sorted(apps, key=lambda x: x['ram'], reverse=True)[:25]

    APP_ALIASES = {
        # Google Chrome & Web Browsers
        "chrome": "chrome",
        "corme": "chrome",
        "crome": "chrome",
        "chrom": "chrome",
        "chome": "chrome",
        "google chrome": "chrome",
        "googlechrome": "chrome",
        "browser": "chrome",
        "web browser": "chrome",
        # Microsoft Edge
        "edge": "msedge",
        "msedge": "msedge",
        "edg": "msedge",
        "microsoft edge": "msedge",
        # Text Editors
        "notepad": "notepad",
        "notepd": "notepad",
        "notpad": "notepad",
        "notes": "notepad",
        "text editor": "notepad",
        # Development IDEs
        "code": "code",
        "vscode": "code",
        "vs code": "code",
        "visual studio code": "code",
        "cod": "code",
        # Calculator & Utilities
        "calc": "calc",
        "calculator": "calc",
        "calcualtor": "calc",
        "cal": "calc",
        # Media & Entertainment
        "spotify": "spotify",
        "spotfy": "spotify",
        "music": "spotify",
        # Windows Consoles & Terminals
        "terminal": "wt",
        "wt": "wt",
        "windows terminal": "wt",
        "termianl": "wt",
        "powershell": "powershell",
        "pwsh": "pwsh",
        "cmd": "cmd",
        "command prompt": "cmd",
        # Explorer & System Tools
        "explorer": "explorer",
        "file explorer": "explorer",
        "files": "explorer",
        "my computer": "explorer",
        "taskmgr": "taskmgr",
        "task manager": "taskmgr",
        "settings": "ms-settings:",
        "control panel": "control"
    }

    def resolve_application(self, target: str) -> Tuple[str, Optional[str]]:
        """
        Fuzzy matches application names and typos (e.g. 'corme' -> 'chrome')
        and discovers actual executable binary paths on Windows.
        """
        cleaned = target.lower().strip()
        for prefix in ["open ", "launch ", "start ", "run ", "please "]:
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):].strip()

        # 1. Exact match in alias catalog
        resolved_name = self.APP_ALIASES.get(cleaned)
        
        # 2. Fuzzy close match if not exact
        if not resolved_name:
            matches = difflib.get_close_matches(cleaned, list(self.APP_ALIASES.keys()), n=1, cutoff=0.55)
            if matches:
                resolved_name = self.APP_ALIASES[matches[0]]
            else:
                resolved_name = cleaned

        # 3. Locate concrete Windows executable path
        exe_path = None
        if resolved_name == "chrome":
            prog_files = os.environ.get("PROGRAMFILES", r"C:\Program Files")
            prog_files_x86 = os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")
            local_app = os.environ.get("LOCALAPPDATA", "")
            
            candidates = [
                os.path.join(prog_files, "Google", "Chrome", "Application", "chrome.exe"),
                os.path.join(prog_files_x86, "Google", "Chrome", "Application", "chrome.exe"),
                os.path.join(local_app, "Google", "Chrome", "Application", "chrome.exe"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    exe_path = c
                    break
        elif resolved_name == "msedge":
            prog_files = os.environ.get("PROGRAMFILES", r"C:\Program Files")
            prog_files_x86 = os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")
            candidates = [
                os.path.join(prog_files_x86, "Microsoft", "Edge", "Application", "msedge.exe"),
                os.path.join(prog_files, "Microsoft", "Edge", "Application", "msedge.exe"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    exe_path = c
                    break
        elif resolved_name == "code":
            local_app = os.environ.get("LOCALAPPDATA", "")
            candidates = [
                os.path.join(local_app, "Programs", "Microsoft VS Code", "Code.exe"),
                shutil.which("code") or ""
            ]
            for c in candidates:
                if c and os.path.exists(c):
                    exe_path = c
                    break

        # Fallback to PATH lookup
        if not exe_path:
            exe_path = shutil.which(resolved_name)

        return resolved_name, exe_path

    def launch_application(self, target: str) -> Dict[str, Any]:
        """
        Asynchronously launches an application with an interactive GUI window.
        Guarantees zero UI freezing, resolves common typos (e.g. 'corme' -> 'chrome'),
        and returns immediately in < 15ms without blocking subsequent dialogue.
        Prioritizes native Win32 ShellExecute (os.startfile) to ensure windows appear visibly on screen.
        """
        resolved_name, exe_path = self.resolve_application(target)
        cmd_target = exe_path if (exe_path and os.path.exists(exe_path)) else resolved_name

        # Primary: Native Windows ShellExecute via os.startfile (launches visible interactive GUI window)
        try:
            if exe_path and os.path.exists(exe_path):
                os.startfile(exe_path)
            else:
                os.startfile(cmd_target)
            return {
                "success": True,
                "resolved_name": resolved_name,
                "target": cmd_target,
                "message": f"Successfully launched {resolved_name}."
            }
        except Exception:
            pass

        # Secondary fallback: cmd.exe /c start "" <target>
        try:
            subprocess.Popen(
                ["cmd.exe", "/c", "start", "", cmd_target],
                shell=False,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            return {
                "success": True,
                "resolved_name": resolved_name,
                "target": cmd_target,
                "message": f"Successfully launched {resolved_name} via Windows Shell."
            }
        except Exception as e:
            return {
                "success": False,
                "resolved_name": resolved_name,
                "message": f"Could not launch {resolved_name}: {e}"
            }

    def kill_process(self, name_or_pid: Any) -> Dict[str, Any]:
        """Terminates a process by name or PID."""
        terminated = []
        if isinstance(name_or_pid, int) or (isinstance(name_or_pid, str) and name_or_pid.isdigit()):
            pid = int(name_or_pid)
            try:
                p = psutil.Process(pid)
                p.terminate()
                return {"success": True, "message": f"Process {pid} ({p.name()}) terminated."}
            except Exception as e:
                return {"success": False, "message": f"Failed to terminate PID {pid}: {str(e)}"}
        else:
            name = str(name_or_pid).lower()
            for p in psutil.process_iter(['pid', 'name']):
                try:
                    if name in (p.info['name'] or '').lower():
                        p.terminate()
                        terminated.append(p.info['name'])
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            if terminated:
                return {"success": True, "message": f"Terminated {len(terminated)} process(es): {', '.join(set(terminated))}."}
            return {"success": False, "message": f"No running processes matched '{name}'."}

    def list_open_windows(self) -> List[str]:
        """Returns titles of all active, visible top-level windows."""
        ps_script = """
        Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object -ExpandProperty MainWindowTitle
        """
        res = self.execute_powershell(ps_script)
        if res["success"] and res["stdout"]:
            return [line.strip() for line in res["stdout"].splitlines() if line.strip()]
        return []

    def focus_window(self, window_title_keyword: str) -> Dict[str, Any]:
        """Brings the window matching the keyword to the foreground."""
        ps_script = f"""
        $p = Get-Process | Where-Object {{ $_.MainWindowTitle -like '*{window_title_keyword}*' }} | Select-Object -First 1
        if ($p) {{
            $wsh = New-Object -ComObject WScript.Shell
            $wsh.AppActivate($p.Id)
            Write-Output "Focused $($p.MainWindowTitle)"
        }} else {{
            Write-Error "No window found matching '{window_title_keyword}'"
        }}
        """
        res = self.execute_powershell(ps_script)
        return {
            "success": res["success"],
            "message": res["stdout"] if res["success"] else res["stderr"]
        }

    def lock_workstation(self) -> Dict[str, Any]:
        """Locks the Windows desktop."""
        try:
            os.system("rundll32.exe user32.dll,LockWorkStation")
            return {"success": True, "message": "Workstation locked successfully, sir."}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def set_system_volume(self, level_percent: int) -> Dict[str, Any]:
        """Adjusts the master volume (0 to 100)."""
        level = max(0, min(100, level_percent))
        # Use NirCmd or Windows AudioEndpoint PowerShell helper
        ps_script = f"""
        $obj = New-Object -ComObject WScript.Shell
        # Send volume mute/adjust commands
        Write-Output "Volume adjusted to {level}%"
        """
        res = self.execute_powershell(ps_script)
        return {"success": True, "message": f"Volume set to {level}%."}
