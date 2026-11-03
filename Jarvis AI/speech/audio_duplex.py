"""
J.A.R.V.I.S. Audio Duplex & Barge-In Coordinator
Coordinates microphone stream, VAD transitions, and instant TTS interruption.
"""

from typing import Callable, Optional
from speech.vad import VADDetector
from speech.tts_engine import TTSEngine

class AudioDuplexCoordinator:
    def __init__(self, tts_engine: TTSEngine, on_user_speech_start: Optional[Callable] = None):
        self.tts = tts_engine
        self.vad = VADDetector()
        self.on_user_speech_start = on_user_speech_start

    def on_audio_frame(self, energy: float):
        """Processes each incoming mic audio frame and triggers barge-in if speech begins."""
        state = self.vad.process_frame(energy)
        
        if state == "START":
            # User started speaking! Trigger instant barge-in if TTS is talking
            if self.tts.is_playing:
                self.tts.stop()
            if self.on_user_speech_start:
                self.on_user_speech_start()
                
        return state
