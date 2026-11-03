"""
J.A.R.V.I.S. Hermes Agent Integration Bridge
Unlocks the full execution potential of Hermes Agent as the foundational harness for J.A.R.V.I.S.
Supports: Fast One-Shot execution, Persistent Sessions, Preloaded Built-in & Custom Skills,
Web Research, Computer-Use Agent GUI automation, and Code Engineering.
"""

import subprocess
import os
import shutil
import json
from typing import Dict, Any, Optional, List

class HermesBridge:
    def __init__(self, hermes_bin_path: Optional[str] = None):
        self.workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        
        if hermes_bin_path:
            self.hermes_exe = hermes_bin_path
        else:
            default_path = os.path.expandvars(r"%LOCALAPPDATA%\hermes\bin\hermes.exe")
            if os.path.exists(default_path):
                self.hermes_exe = default_path
            else:
                self.hermes_exe = shutil.which("hermes") or "hermes"

        self.available = os.path.exists(self.hermes_exe) if os.path.isabs(self.hermes_exe) else bool(shutil.which(self.hermes_exe))

    def execute_oneshot(
        self,
        prompt: str,
        model: Optional[str] = None,
        reasoning: str = "none",
        skills: Optional[List[str]] = None,
        timeout: int = 120
    ) -> Dict[str, Any]:
        """
        Executes Hermes in one-shot mode (-z) with the given prompt.
        Bypasses slow reasoning delays with --reasoning none by default.
        Preloads specific skills if provided.
        """
        if not self.available:
            return {
                "success": False,
                "output": "Hermes executable not found.",
                "error": "Binary missing"
            }

        cmd = [self.hermes_exe, "-z", prompt]
        
        if reasoning:
            cmd.extend(["--reasoning", reasoning])
            
        if model:
            cmd.extend(["-m", model])
            
        if skills:
            cmd.extend(["-s", ",".join(skills)])

        try:
            proc = subprocess.run(
                cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=timeout,
                shell=False
            )
            
            output = proc.stdout.strip()
            stderr = proc.stderr.strip()
            
            if proc.returncode == 0:
                return {
                    "success": True,
                    "output": output,
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "output": output,
                    "error": stderr or f"Process exited with code {proc.returncode}"
                }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": f"Hermes command timed out after {timeout} seconds."
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e)
            }

    def execute_with_session(
        self,
        prompt: str,
        session_name: str = "jarvis_main",
        skills: Optional[List[str]] = None,
        timeout: int = 180
    ) -> Dict[str, Any]:
        """
        Executes Hermes while resuming or maintaining a named session.
        Ensures variables, state, files, and multi-turn project lineage persist.
        """
        if not self.available:
            return {"success": False, "output": "", "error": "Hermes binary missing"}

        cmd = [self.hermes_exe, "-c", session_name, "-z", prompt, "--reasoning", "none"]
        if skills:
            cmd.extend(["-s", ",".join(skills)])

        try:
            proc = subprocess.run(
                cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=timeout,
                shell=False
            )
            return {
                "success": proc.returncode == 0,
                "output": proc.stdout.strip(),
                "error": proc.stderr.strip() if proc.returncode != 0 else None
            }
        except Exception as e:
            return {"success": False, "output": "", "error": str(e)}

    def execute_research(self, topic: str, timeout: int = 150) -> Dict[str, Any]:
        """
        Executes deep autonomous web research using Hermes's grounded citation and research tools.
        """
        research_skills = ["grounded-citations", "arxiv", "competitor-news-monitor"]
        prompt = f"Conduct thorough research and synthesize a structured briefing on: {topic}"
        return self.execute_oneshot(prompt, skills=research_skills, timeout=timeout)

    def execute_computer_use(self, instruction: str, timeout: int = 180) -> Dict[str, Any]:
        """
        Executes GUI automation via Hermes's Computer-Use Agent (cua-driver).
        """
        prompt = f"Perform the following graphical computer action: {instruction}"
        return self.execute_oneshot(prompt, skills=["computer-use"], timeout=timeout)

    def execute_code_task(self, instruction: str, timeout: int = 180) -> Dict[str, Any]:
        """
        Executes code engineering, testing, or refactoring via Hermes's development skills.
        """
        dev_skills = ["codebase-inspection", "test-driven-development", "systematic-debugging"]
        return self.execute_oneshot(instruction, skills=dev_skills, timeout=timeout)

    def set_api_key(self, key_name: str, key_value: str) -> bool:
        """Saves an API key into Hermes .env file."""
        env_path = os.path.expandvars(r"%LOCALAPPDATA%\hermes\.env")
        try:
            lines = []
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
            
            lines = [l for l in lines if not l.startswith(f"{key_name}=")]
            lines.append(f"{key_name}={key_value.strip()}\n")
            
            with open(env_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
            return True
        except Exception:
            return False

    def get_status(self) -> Dict[str, Any]:
        """Returns the readiness status of the Hermes Agent harness."""
        return {
            "available": self.available,
            "executable_path": self.hermes_exe,
            "workspace_dir": self.workspace_dir,
            "soul_active": os.path.exists(os.path.join(self.workspace_dir, "SOUL.md")),
            "agents_active": os.path.exists(os.path.join(self.workspace_dir, "AGENTS.md"))
        }
