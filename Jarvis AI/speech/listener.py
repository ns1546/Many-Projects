"""
J.A.R.V.I.S. Continuous Speech Recognition & Microphone Listener
Powered by Dual-Engine STT: Local faster-whisper (tiny.en offline) + Online Fallback.
Provides low-latency, resilient voice capture for continuous Iron Man dialogue.
"""

import threading
import time
import inspect
from typing import Callable, Optional, Any

try:
    import speech_recognition as sr
    SR_AVAILABLE = True
except Exception:
    SR_AVAILABLE = False

from speech.whisper_engine import LocalWhisperRecognizer
from speech.speaker_id import SpeakerIdentifier
from speech.acoustic_filter import AcousticNoiseFilter
from speech.diarization import SpeakerDiarizer


class JarvisSpeechListener:
    def __init__(
        self,
        on_speech_recognized: Callable[..., None],
        energy_threshold: int = 300,
        speaker_id: Optional[SpeakerIdentifier] = None,
        noise_filter: Optional[AcousticNoiseFilter] = None
    ):
        self.on_speech_recognized = on_speech_recognized
        self.energy_threshold = energy_threshold
        self.speaker_id = speaker_id or SpeakerIdentifier()
        self.noise_filter = noise_filter or AcousticNoiseFilter()
        self.diarizer = SpeakerDiarizer(speaker_id=self.speaker_id, acoustic_filter=self.noise_filter)
        self.is_listening = False
        self._stop_requested = False
        self._thread: Optional[threading.Thread] = None
        self._calibrated = False

        if SR_AVAILABLE:
            self.recognizer = sr.Recognizer()
            self.recognizer.energy_threshold = self.energy_threshold
            self.recognizer.dynamic_energy_threshold = True
            # Cut silence pause wait from 0.8s to 0.45s for instant phrase completion
            self.recognizer.pause_threshold = 0.45
            self.recognizer.non_speaking_duration = 0.35
            self.recognizer.phrase_threshold = 0.25
        else:
            self.recognizer = None

        self.whisper = LocalWhisperRecognizer.get_instance()

    def transcribe_audio(self, audio_data, clean_noise: bool = True) -> Optional[str]:
        """
        Transcribes speech using Local Whisper first (fast & offline),
        falling back to online recognizer if needed.
        Optionally cleans background ambient noise before processing.
        """
        # 1. Fast Path: Local faster-whisper on raw acoustic stream (int8 quantized, offline, <300ms)
        if self.whisper:
            try:
                text = self.whisper.transcribe_audio_data(audio_data)
                if text and len(text.strip()) > 1:
                    return text.strip()
            except Exception:
                pass

        # 2. Secondary Path: Apply Acoustic Noise Filter if raw whisper heard nothing in noisy environment
        processed_audio = audio_data
        if clean_noise and SR_AVAILABLE and hasattr(audio_data, "get_raw_data"):
            try:
                raw_bytes, snr = self.noise_filter.suppress_noise(audio_data, return_pcm_bytes=True)
                processed_audio = sr.AudioData(raw_bytes, 16000, 2)
                if self.whisper:
                    text = self.whisper.transcribe_audio_data(processed_audio)
                    if text and len(text.strip()) > 1:
                        return text.strip()
            except Exception:
                processed_audio = audio_data

        # 3. Tertiary Fallback: Online Google recognizer
        if self.recognizer:
            try:
                text = self.recognizer.recognize_google(processed_audio).strip()
                if text:
                    return text
            except Exception:
                pass

        return None

    def start_listening_loop(self):
        """Starts the continuous background listening thread."""
        if not SR_AVAILABLE:
            print(" [!] Speech recognition module not available.")
            return

        self._stop_requested = False
        self.is_listening = True
        self._thread = threading.Thread(target=self._listen_worker, daemon=True)
        self._thread.start()

    def stop_listening_loop(self):
        """Halts the continuous listening thread."""
        self._stop_requested = True
        self.is_listening = False

    def _listen_worker(self):
        try:
            with sr.Microphone() as source:
                print(" [*] Calibrating microphone for ambient acoustics...")
                self.recognizer.adjust_for_ambient_noise(source, duration=0.8)
                self._calibrated = True
                print(" [*] Voice sensory array ACTIVE (Local Whisper STT Engine Engaged).\n")

                while not self._stop_requested:
                    try:
                        audio = self.recognizer.listen(source, timeout=3.0, phrase_time_limit=15.0)
                        if self._stop_requested:
                            break

                        text = self.transcribe_audio(audio)
                        if text:
                            try:
                                sig = inspect.signature(self.on_speech_recognized)
                                if len(sig.parameters) >= 2:
                                    self.on_speech_recognized(text, audio)
                                else:
                                    self.on_speech_recognized(text)
                            except Exception as cb_err:
                                print(f" [!] Speech callback error: {cb_err}")
                    except sr.WaitTimeoutError:
                        continue
                    except Exception:
                        time.sleep(0.2)
        except Exception as e:
            print(f" [!] Microphone error: {e}")
        finally:
            self.is_listening = False

    def listen_once(self, timeout: float = 6.0) -> Optional[str]:
        """Synchronously listens for a single spoken sentence from the user."""
        if not SR_AVAILABLE:
            return None

        try:
            with sr.Microphone() as source:
                if not self._calibrated:
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.4)
                    self._calibrated = True
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=15.0)
                return self.transcribe_audio(audio)
        except Exception:
            return None
