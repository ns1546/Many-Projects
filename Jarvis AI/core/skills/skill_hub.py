"""
J.A.R.V.I.S. Skill Hub & Registry Integrator
Taps into the global skills.sh, ClawHub, and GitHub repositories via Hermes CLI,
enabling J.A.R.V.I.S. to search, inspect, download, and install thousands of community
and enterprise skills dynamically on demand.
"""

import os
import shutil
import subprocess
from typing import Dict, List, Any, Optional

class SkillHub:
    def __init__(self, hermes_bin_path: Optional[str] = None):
        self.workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        
        if hermes_bin_path:
            self.hermes_exe = hermes_bin_path
        else:
            default_path = os.path.expandvars(r"%LOCALAPPDATA%\hermes\bin\hermes.exe")
            if os.path.exists(default_path):
                self.hermes_exe = default_path
            else:
                self.hermes_exe = shutil.which("hermes") or "hermes"

        self.available = os.path.exists(self.hermes_exe) if os.path.isabs(self.hermes_exe) else bool(shutil.which(self.hermes_exe))

    def trust_workspace(self) -> Dict[str, Any]:
        """Ensures Hermes trusts this workspace so all repo-local skills load automatically."""
        if not self.available:
            return {"success": False, "error": "Hermes binary not found"}
            
        try:
            cmd = [self.hermes_exe, "skills", "trust", self.workspace_dir]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            return {
                "success": proc.returncode == 0,
                "output": proc.stdout.strip(),
                "error": proc.stderr.strip() if proc.returncode != 0 else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def search_online(self, query: str, timeout: int = 25) -> Dict[str, Any]:
        """Searches the global skills.sh and online registries for skills matching query."""
        if not self.available:
            return {"success": False, "results": [], "error": "Hermes binary missing"}

        try:
            cmd = [self.hermes_exe, "skills", "search", query]
            proc = subprocess.run(
                cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            out = proc.stdout.strip()
            return {
                "success": proc.returncode == 0,
                "raw_output": out,
                "error": proc.stderr.strip() if proc.returncode != 0 else None
            }
        except Exception as e:
            return {"success": False, "results": [], "error": str(e)}

    def install_skill(self, identifier: str, timeout: int = 60) -> Dict[str, Any]:
        """Installs a skill from the registry into the workspace or profile."""
        if not self.available:
            return {"success": False, "error": "Hermes binary missing"}

        try:
            cmd = [self.hermes_exe, "skills", "install", identifier]
            proc = subprocess.run(
                cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return {
                "success": proc.returncode == 0,
                "output": proc.stdout.strip(),
                "error": proc.stderr.strip() if proc.returncode != 0 else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def inspect_skill(self, identifier: str, timeout: int = 20) -> Dict[str, Any]:
        """Inspects online skill contents without installing."""
        if not self.available:
            return {"success": False, "error": "Hermes binary missing"}

        try:
            cmd = [self.hermes_exe, "skills", "inspect", identifier]
            proc = subprocess.run(
                cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return {
                "success": proc.returncode == 0,
                "output": proc.stdout.strip(),
                "error": proc.stderr.strip() if proc.returncode != 0 else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
