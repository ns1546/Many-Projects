"""
J.A.R.V.I.S. Screen Perception & Multimodal Vision Array
Gives J.A.R.V.I.S. 'eyes' to perceive the user's active screen,
read on-screen windows, capture screenshots, and analyze visual workspace context.
"""

import os
import time
import base64
from typing import Dict, Any, Optional

try:
    import pyautogui
    from PIL import Image
    GUI_AVAILABLE = True
except ImportError:
    GUI_AVAILABLE = False

try:
    import pygetwindow as gw
    GW_AVAILABLE = True
except ImportError:
    GW_AVAILABLE = False

class ScreenPerception:
    def __init__(self, workspace_root: Optional[str] = None):
        self.workspace_root = workspace_root or os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.telemetry_dir = os.path.join(self.workspace_root, "telemetry", "visual_feed")
        os.makedirs(self.telemetry_dir, exist_ok=True)

    def capture_active_screen(self, filename: Optional[str] = None) -> Dict[str, Any]:
        """Captures the full primary desktop display and archives it in telemetry."""
        if not GUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI/PIL sensory libraries not available"}

        name = filename or f"feed_{int(time.time())}.png"
        out_path = os.path.join(self.telemetry_dir, name)
        
        screenshot_ok = False
        width, height = 1920, 1080
        try:
            screenshot = pyautogui.screenshot()
            screenshot.save(out_path)
            screenshot_ok = True
            width, height = screenshot.width, screenshot.height
        except Exception:
            # When Windows workstation is locked or running in headless context, GDI BitBlt fails
            screenshot_ok = False

        active_window_title = "Desktop / Lock Screen"
        if GW_AVAILABLE:
            try:
                active = gw.getActiveWindow()
                if active and active.title:
                    active_window_title = active.title
            except Exception:
                pass

        status_msg = f"Captured desktop visual feed. Active window: '{active_window_title}'." if screenshot_ok else f"Active window detected: '{active_window_title}' (Physical display locked or shielded)."

        return {
            "success": True,
            "file_path": out_path if screenshot_ok else None,
            "active_window": active_window_title,
            "width": width,
            "height": height,
            "summary": status_msg
        }

    def inspect_current_workspace(self) -> Dict[str, Any]:
        """Inspects all currently visible top-level application windows on the display."""
        cap = self.capture_active_screen("latest_workspace.png")
        
        open_windows = []
        if GW_AVAILABLE:
            windows = gw.getAllTitles()
            open_windows = [w.strip() for w in windows if w.strip() and len(w.strip()) > 2]
        
        active_app = cap.get("active_window", "Desktop")
        top_apps = open_windows[:5] if open_windows else ["Primary Workspace"]

        summary = (
            f"Scanning visual arrays, sir. You are currently focused on '{active_app}'. "
            f"Active background applications include: {', '.join(top_apps)}."
        )

        return {
            "success": True,
            "active_window": active_app,
            "visible_windows": open_windows,
            "screenshot_path": cap.get("file_path"),
            "summary": summary
        }

    def get_base64_screenshot(self, max_size: int = 1024) -> Optional[str]:
        """Captures screen and returns resized base64 JPEG for multimodal LLM vision queries."""
        if not GUI_AVAILABLE:
            return None
        
        cap_file = os.path.join(self.telemetry_dir, "vision_frame.jpg")
        screenshot = pyautogui.screenshot()
        screenshot.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        screenshot.convert("RGB").save(cap_file, "JPEG", quality=80)
        
        with open(cap_file, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
