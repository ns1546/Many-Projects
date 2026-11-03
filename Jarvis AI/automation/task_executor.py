"""
J.A.R.V.I.S. Native Autonomous Task & Tool Execution Engine
Directly executes filesystem, application, shell, and web operations on Windows.
Guarantees real-world task execution even if cloud API rate limits are encountered.
"""

import os
import re
import sys
import subprocess
import webbrowser
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional

class NativeTaskExecutor:
    def __init__(self, workspace_root: Optional[str] = None):
        self.workspace_root = workspace_root or os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    def resolve_path(self, relative_or_absolute: str) -> str:
        """Resolves target path safely inside or outside workspace."""
        path = relative_or_absolute.strip().strip("'\"`")
        if os.path.isabs(path):
            return path
        return os.path.join(self.workspace_root, path)

    def execute_file_creation(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Parses and directly executes file creation requests.
        Examples:
        - "create a file named notes.txt with content 'Remember to call Pepper'"
        - "create file test.py with content print('hello')"
        - "make a file hello.txt"
        """
        # Pattern 1: With explicit content
        match_with_content = re.search(
            r"\b(?:create|make|write|touch)\s+(?:a\s+|an\s+)?file\s+(?:named\s+|called\s+)?([a-zA-Z0-9_\-\.\/\\]+)\s+with\s+(?:the\s+)?content\s+['\"`]?(.+?)['\"`]?$",
            text, re.IGNORECASE
        )
        if match_with_content:
            filename = match_with_content.group(1).strip()
            content = match_with_content.group(2).strip().strip("'\"`")
            file_path = self.resolve_path(filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content + "\n")
            return {
                "success": True,
                "action": "create_file",
                "file_path": file_path,
                "filename": os.path.basename(file_path),
                "summary": f"Created file {os.path.basename(file_path)} with specified content."
            }

        # Pattern 2: Without content (blank file)
        match_empty = re.search(
            r"\b(?:create|make|touch)\s+(?:a\s+|an\s+)?file\s+(?:named\s+|called\s+)?([a-zA-Z0-9_\-\.\/\\]+)",
            text, re.IGNORECASE
        )
        if match_empty:
            filename = match_empty.group(1).strip()
            if not filename.endswith((".txt", ".py", ".html", ".js", ".css", ".json", ".md", ".csv", ".log")):
                # check if there's an extension
                if "." not in filename:
                    filename += ".txt"
            file_path = self.resolve_path(filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            if not os.path.exists(file_path):
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write("")
            return {
                "success": True,
                "action": "create_file",
                "file_path": file_path,
                "filename": os.path.basename(file_path),
                "summary": f"Created file {os.path.basename(file_path)}."
            }

        return None

    def execute_folder_creation(self, text: str) -> Optional[Dict[str, Any]]:
        """Parses and executes directory creation."""
        match = re.search(
            r"\b(?:create|make|build)\s+(?:a\s+|an\s+)?(?:folder|directory|dir)\s+(?:named\s+|called\s+)?([a-zA-Z0-9_\-\.\/\\]+)",
            text, re.IGNORECASE
        )
        if match:
            folder_name = match.group(1).strip()
            folder_path = self.resolve_path(folder_name)
            os.makedirs(folder_path, exist_ok=True)
            return {
                "success": True,
                "action": "create_folder",
                "folder_path": folder_path,
                "summary": f"Created folder {folder_name}."
            }
        return None

    def execute_file_deletion(self, text: str) -> Optional[Dict[str, Any]]:
        """Parses and executes file deletion."""
        match = re.search(
            r"\b(?:delete|remove|erase)\s+(?:the\s+|a\s+)?file\s+([a-zA-Z0-9_\-\.\/\\]+)",
            text, re.IGNORECASE
        )
        if match:
            target = match.group(1).strip()
            path = self.resolve_path(target)
            if os.path.exists(path):
                os.remove(path)
                return {"success": True, "action": "delete_file", "summary": f"Removed {target}."}
            return {"success": False, "action": "delete_file", "summary": f"File {target} does not exist."}
        return None

    def execute_web_search(self, text: str) -> Optional[Dict[str, Any]]:
        """Parses and executes web searches in browser."""
        match = re.search(
            r"\b(?:search\s+(?:the\s+web\s+|google\s+|internet\s+)?(?:for\s+)?|look\s+up\s+|google\s+)(.+)",
            text, re.IGNORECASE
        )
        if match:
            query = match.group(1).strip()
            if query:
                encoded = urllib.parse.quote_plus(query)
                search_url = f"https://www.google.com/search?q={encoded}"
                webbrowser.open(search_url)
                return {
                    "success": True,
                    "action": "web_search",
                    "query": query,
                    "url": search_url,
                    "summary": f"Conducted web search for '{query}' in your browser."
                }
        return None

    def execute_shell_command(self, text: str) -> Optional[Dict[str, Any]]:
        """Parses and executes safe shell or python commands."""
        match = re.search(r"\b(?:run|execute)\s+(?:command\s+|script\s+)?([a-zA-Z0-9_\-\.\s\:]+)", text, re.IGNORECASE)
        if match:
            cmd = match.group(1).strip()
            # If user said "run vitals" or similar internal action, skip
            if any(w in cmd.lower() for w in ["vitals", "task", "voice", "diagnostics"]):
                return None
            try:
                proc = subprocess.run(
                    ["powershell", "-NoProfile", "-Command", cmd],
                    cwd=self.workspace_root,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                output = proc.stdout.strip() or proc.stderr.strip() or "Command completed with no output."
                return {
                    "success": proc.returncode == 0,
                    "action": "shell_command",
                    "output": output[:300],
                    "summary": f"Executed '{cmd}'. Outcome: {output[:100]}."
                }
            except Exception as e:
                return {"success": False, "action": "shell_command", "summary": f"Command error: {e}"}
        return None
