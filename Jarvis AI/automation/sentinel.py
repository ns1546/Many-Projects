"""
J.A.R.V.I.S. Autonomous Proactive Sentinel
Continuous background watchdog that monitors workstation vitals, screen time,
workstation safety, and proactive executive advisories without waiting to be prompted.
"""

import time
import threading
import psutil
from typing import Dict, Any, Optional, Callable

class JarvisSentinel:
    def __init__(self, tts_callback: Optional[Callable[[str], None]] = None):
        self.tts_callback = tts_callback
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self.session_start = time.time()
        self.last_fatigue_alert = time.time()
        self.last_thermal_alert = time.time()
        self.proactive_alerts_enabled = True

    def start(self):
        """Starts the background Sentinel monitoring thread."""
        if self.is_running:
            return
        self.is_running = True
        self.session_start = time.time()
        self._thread = threading.Thread(target=self._sentinel_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Halts the Sentinel watchdog."""
        self.is_running = False

    def get_session_stats(self) -> Dict[str, Any]:
        """Calculates current continuous working session metrics."""
        elapsed_sec = time.time() - self.session_start
        hours = int(elapsed_sec // 3600)
        minutes = int((elapsed_sec % 3600) // 60)
        return {
            "session_hours": hours,
            "session_minutes": minutes,
            "total_seconds": elapsed_sec,
            "proactive_enabled": self.proactive_alerts_enabled
        }

    def _sentinel_loop(self):
        """Background continuous health & workspace monitoring loop."""
        while self.is_running:
            time.sleep(30.0)  # Check every 30 seconds
            if not self.proactive_alerts_enabled:
                continue

            now = time.time()
            elapsed_sec = now - self.session_start
            
            # 1. Screen Time & Fatigue Check (every 90 minutes of continuous coding)
            if elapsed_sec > 5400 and (now - self.last_fatigue_alert) > 3600:
                hours = round(elapsed_sec / 3600, 1)
                alert = (
                    f"Pardon the interruption, sir. You have been engaged at the workstation for {hours} continuous hours. "
                    "May I suggest a brief recess and hydration to sustain peak cognitive performance?"
                )
                self.last_fatigue_alert = now
                if self.tts_callback:
                    self.tts_callback(alert)

            # 2. Hardware Thermal / CPU Stress Check
            try:
                cpu = psutil.cpu_percent(interval=None)
                ram = psutil.virtual_memory().percent
                if cpu > 92 and ram > 90 and (now - self.last_thermal_alert) > 600:
                    alert = (
                        f"Notice, sir: System hardware load is reaching saturation at {cpu}% CPU and {ram}% memory. "
                        "Auxiliary background processes may require termination."
                    )
                    self.last_thermal_alert = now
                    if self.tts_callback:
                        self.tts_callback(alert)
            except Exception:
                pass
