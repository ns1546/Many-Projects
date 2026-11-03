"""
J.A.R.V.I.S. Windows Computer-Use GUI Agent
Full PC automation via PyAutoGUI and Win32 API.
Provides mouse, keyboard, hotkey, screenshot, and application control across the entire operating system.
"""

import os
import time
from typing import Dict, Any, Optional, List, Tuple

try:
    import pyautogui
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.1
    PYAUTOGUI_AVAILABLE = True
except Exception:
    PYAUTOGUI_AVAILABLE = False

try:
    from PIL import ImageGrab
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False

class WindowsGUIAgent:
    def __init__(self):
        self.screenshot_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "screenshots"))
        os.makedirs(self.screenshot_dir, exist_ok=True)

    def is_available(self) -> bool:
        return PYAUTOGUI_AVAILABLE

    def get_screen_resolution(self) -> Tuple[int, int]:
        if PYAUTOGUI_AVAILABLE:
            return pyautogui.size()
        return (1920, 1080)

    def take_screenshot(self, filename: Optional[str] = None) -> Dict[str, Any]:
        """Captures full screenshot of active Windows desktop."""
        if not (PYAUTOGUI_AVAILABLE or PIL_AVAILABLE):
            return {"success": False, "error": "Screen capture library unavailable"}

        fname = filename or f"screenshot_{int(time.time())}.png"
        out_path = os.path.join(self.screenshot_dir, fname)
        
        try:
            if PYAUTOGUI_AVAILABLE:
                img = pyautogui.screenshot()
            else:
                img = ImageGrab.grab()
            img.save(out_path)
            return {
                "success": True,
                "path": out_path,
                "resolution": img.size,
                "summary": f"Captured screenshot of active workstation display: {fname}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def type_text(self, text: str, interval: float = 0.01) -> Dict[str, Any]:
        """Types string into currently focused application."""
        if not PYAUTOGUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI not installed"}
        try:
            pyautogui.write(text, interval=interval)
            return {"success": True, "typed": text, "summary": f"Typed text into active application."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def press_hotkey(self, keys: List[str]) -> Dict[str, Any]:
        """
        Presses keyboard hotkeys (e.g. ['ctrl', 'c'], ['win', 'd'], ['alt', 'tab']).
        """
        if not PYAUTOGUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI not installed"}
        try:
            pyautogui.hotkey(*keys)
            return {"success": True, "hotkey": "+".join(keys), "summary": f"Pressed hotkey {'+'.join(keys)}."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def press_key(self, key: str) -> Dict[str, Any]:
        """Presses a single key (e.g. 'enter', 'esc', 'tab', 'volumeup', 'volumedown')."""
        if not PYAUTOGUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI not installed"}
        try:
            pyautogui.press(key)
            return {"success": True, "key": key}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def click_at(self, x: int, y: int, clicks: int = 1, button: str = "left") -> Dict[str, Any]:
        """Moves mouse and clicks at specified screen coordinates."""
        if not PYAUTOGUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI not installed"}
        try:
            pyautogui.click(x=x, y=y, clicks=clicks, button=button)
            return {"success": True, "x": x, "y": y, "summary": f"Clicked at ({x}, {y})."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def scroll_screen(self, amount: int = -500) -> Dict[str, Any]:
        """Scrolls up or down on the current screen."""
        if not PYAUTOGUI_AVAILABLE:
            return {"success": False, "error": "PyAutoGUI not installed"}
        try:
            pyautogui.scroll(amount)
            direction = "down" if amount < 0 else "up"
            return {"success": True, "summary": f"Scrolled {direction}."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def show_desktop(self) -> Dict[str, Any]:
        """Minimizes all windows to reveal desktop (Win+D)."""
        return self.press_hotkey(["win", "d"])

    def media_play_pause(self) -> Dict[str, Any]:
        """Toggles music playback across Spotify, YouTube, or system player."""
        return self.press_key("playpause")

    def volume_up(self, steps: int = 3) -> Dict[str, Any]:
        """Increases system volume."""
        for _ in range(steps):
            self.press_key("volumeup")
            time.sleep(0.05)
        return {"success": True, "summary": "Increased audio output volume."}

    def volume_down(self, steps: int = 3) -> Dict[str, Any]:
        """Decreases system volume."""
        for _ in range(steps):
            self.press_key("volumedown")
            time.sleep(0.05)
        return {"success": True, "summary": "Decreased audio output volume."}

    def volume_mute(self) -> Dict[str, Any]:
        """Mutes/unmutes audio."""
        return self.press_key("volumemute")
