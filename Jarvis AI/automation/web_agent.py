"""
J.A.R.V.I.S. Web & Media Automation Agent
Provides real browser automation, YouTube direct playback, Google search,
Spotify interaction, and social network navigation.
"""

import urllib.parse
import webbrowser
import time
from typing import Dict, Any, Optional

try:
    import pyautogui
    GUI_AVAILABLE = True
except ImportError:
    GUI_AVAILABLE = False

class WebMediaAgent:
    def __init__(self):
        pass

    def play_youtube(self, query: str, auto_play: bool = True) -> Dict[str, Any]:
        """
        Searches YouTube for the specified query and opens the search results or video.
        If auto_play is enabled, uses PyAutoGUI to select the top video result.
        """
        clean_q = query.strip()
        encoded = urllib.parse.quote(clean_q)
        url = f"https://www.youtube.com/results?search_query={encoded}"
        webbrowser.open(url)

        if auto_play and GUI_AVAILABLE:
            # Spawn background clicker to start first video once page loads
            import threading
            def _click_first_video():
                try:
                    time.sleep(3.5)
                    pyautogui.FAILSAFE = False
                    pyautogui.press("tab")
                    time.sleep(0.1)
                    pyautogui.press("enter")
                except Exception:
                    pass
            threading.Thread(target=_click_first_video, daemon=True).start()

        summary = f"Searching YouTube for '{clean_q}' and engaging audio-visual playback, sir."
        return {
            "success": True,
            "channel": "youtube",
            "query": clean_q,
            "url": url,
            "summary": summary
        }

    def search_google(self, query: str) -> Dict[str, Any]:
        """Executes a Google research search query in default browser."""
        clean_q = query.strip()
        encoded = urllib.parse.quote(clean_q)
        url = f"https://www.google.com/search?q={encoded}"
        webbrowser.open(url)
        summary = f"Conducting search on Google for '{clean_q}', sir."
        return {
            "success": True,
            "channel": "google",
            "query": clean_q,
            "url": url,
            "summary": summary
        }

    def open_service(self, service_name: str) -> Dict[str, Any]:
        """Opens specific web application or platform."""
        s = service_name.lower().strip()
        services = {
            "whatsapp": "https://web.whatsapp.com",
            "gmail": "https://mail.google.com",
            "messenger": "https://www.messenger.com",
            "spotify": "https://open.spotify.com",
            "twitter": "https://x.com",
            "x": "https://x.com",
            "linkedin": "https://www.linkedin.com",
            "reddit": "https://www.reddit.com",
            "github": "https://github.com",
            "chatgpt": "https://chatgpt.com",
            "netflix": "https://www.netflix.com",
            "discord": "https://discord.com/app"
        }
        url = services.get(s, f"https://www.google.com/search?q={urllib.parse.quote(s)}")
        webbrowser.open(url)
        summary = f"Opening {service_name.title()} on your display, sir."
        return {
            "success": True,
            "service": service_name,
            "url": url,
            "summary": summary
        }
