"""
J.A.R.V.I.S. Voice Activity Detection (VAD) Engine
Monitors live mic stream and accurately tracks speech start and end transitions.
"""

import time
from typing import Optional

class VADDetector:
    def __init__(self, silence_duration_seconds: float = 0.8, energy_threshold: float = 0.015):
        self.silence_duration_seconds = silence_duration_seconds
        self.energy_threshold = energy_threshold
        self.is_speaking = False
        self.last_speech_time: Optional[float] = None
        self.speech_start_time: Optional[float] = None

    def process_frame(self, audio_energy: float) -> str:
        """
        Processes an incoming audio frame energy level.
        Returns: 'START', 'SPEAKING', 'END', or 'SILENCE'.
        """
        now = time.time()
        
        if audio_energy >= self.energy_threshold:
            self.last_speech_time = now
            if not self.is_speaking:
                self.is_speaking = True
                self.speech_start_time = now
                return "START"
            return "SPEAKING"
        else:
            if self.is_speaking:
                if self.last_speech_time and (now - self.last_speech_time >= self.silence_duration_seconds):
                    self.is_speaking = False
                    return "END"
                return "SPEAKING"
            return "SILENCE"

    def reset(self):
        self.is_speaking = False
        self.last_speech_time = None
        self.speech_start_time = None
