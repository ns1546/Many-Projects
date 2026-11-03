"""
J.A.R.V.I.S. Text-to-Speech Engine
Ultra-Realistic Neural British Voice (Paul Bettany style) using Microsoft Azure Neural Voice via edge-tts & pygame.
Supports Instant Barge-in Interruption.
"""

import threading
import subprocess
import os
import tempfile
import asyncio
import time
import uuid
import re
from typing import Optional, Callable


def is_bengali_text(text: str) -> bool:
    """Checks if text contains Bengali Unicode characters (U+0980 to U+09FF)."""
    return bool(re.search(r"[\u0980-\u09FF]", text))

# Initialize pygame mixer silently
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"
try:
    import pygame
    if not pygame.mixer.get_init():
        pygame.mixer.init(frequency=24000, size=-16, channels=2, buffer=1024)
    PYGAME_AVAILABLE = True
except Exception:
    PYGAME_AVAILABLE = False

try:
    import edge_tts
    EDGE_TTS_AVAILABLE = True
except Exception:
    EDGE_TTS_AVAILABLE = False


class TTSEngine:
    def __init__(self, voice: str = "en-GB-RyanNeural"):
        """
        voice: Microsoft Azure Neural Voice name:
               - "en-GB-RyanNeural" (Sophisticated, calm British gentleman - Paul Bettany style)
               - "en-GB-ThomasNeural" (Alternative British male)
               - "en-GB-SoniaNeural" (British female)
        """
        self.voice = voice
        self.is_playing = False
        self._current_file: Optional[str] = None
        self._lock = threading.Lock()
        self._stop_requested = False

    def stop(self):
        """Immediately interrupts and halts any active audio playback (Barge-In)."""
        with self._lock:
            self._stop_requested = True
            self.is_playing = False
            if PYGAME_AVAILABLE and pygame.mixer.get_init():
                try:
                    pygame.mixer.music.stop()
                    pygame.mixer.music.unload()
                except Exception:
                    pass

    @staticmethod
    def is_bengali_text(text: str) -> bool:
        """Checks if text contains Bengali Unicode characters."""
        return bool(re.search(r"[\u0980-\u09FF]", text))

    async def _generate_audio_file(self, text: str, output_path: str, voice_override: Optional[str] = None):
        """Generates high-definition neural speech using edge-tts with language-aware voice routing."""
        voice_to_use = voice_override or (
            "bn-BD-PradeepNeural" if self.is_bengali_text(text) else self.voice
        )
        communicate = edge_tts.Communicate(text, voice_to_use, rate="+0%", pitch="+0Hz")
        await communicate.save(output_path)

    def generate_speech_file(self, text: str, output_path: Optional[str] = None, voice: Optional[str] = None) -> Optional[str]:
        """
        Synthesizes high-definition neural speech and saves to an MP3 file
        for WhatsApp voice notes and recorded customer responses.
        Automatically selects native Bengali voice if Bengali text is detected.
        """
        if not text or not text.strip():
            return None

        if not output_path:
            voice_dir = os.path.join(tempfile.gettempdir(), "jarvis_voice_notes")
            os.makedirs(voice_dir, exist_ok=True)
            output_path = os.path.join(voice_dir, f"voice_note_{uuid.uuid4().hex[:8]}.mp3")

        try:
            if EDGE_TTS_AVAILABLE:
                asyncio.run(self._generate_audio_file(text.strip(), output_path, voice_override=voice))
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    return output_path
        except Exception as e:
            # edge-tts failed or offline, fall through to native PowerShell SAPI
            pass


        # Native Windows SAPI speech file synthesis fallback
        try:
            clean = text.replace('"', '`"').replace("'", "''")
            wav_path = output_path.replace(".mp3", ".wav")
            ps_cmd = f"""
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $synth.SetOutputToWaveFile('{wav_path}')
            $voices = $synth.GetInstalledVoices() | Where-Object {{ $_.Enabled }}
            $male = $voices | Where-Object {{ ($_.VoiceInfo.Culture.Name -like 'en-GB*' -and $_.VoiceInfo.Gender -eq 'Male') }} | Select-Object -First 1
            if (-not $male) {{
                $male = $voices | Where-Object {{ $_.VoiceInfo.Name -like '*David*' -or ($_.VoiceInfo.Gender -eq 'Male' -and $_.VoiceInfo.Name -notlike '*Zira*') }} | Select-Object -First 1
            }}
            if ($male) {{ $synth.SelectVoice($male.VoiceInfo.Name) }}
            $synth.Speak("{clean}")
            $synth.Dispose()
            """
            subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=12)
            if os.path.exists(wav_path) and os.path.getsize(wav_path) > 0:
                return wav_path
        except Exception:
            pass

        return None


    INSTANT_ACKS = [
        "Right away, sir.",
        "On it, sir.",
        "Looking into that now, sir.",
        "One moment, sir.",
        "At your service, sir.",
        "Processing your directive, sir."
    ]

    def speak_instant_ack(self, ack_type: str = "general"):
        """Plays an immediate, low-latency verbal acknowledgment (<50ms) from pre-cached audio."""
        import random
        text = random.choice(self.INSTANT_ACKS)
        self.speak(text)

    def speak(self, text: str, on_complete: Optional[Callable] = None):
        """
        Synthesizes and speaks text asynchronously with the neural voice model.
        Instantly interruptible.
        """
        if not text or not text.strip():
            return

        # Stop previous audio immediately
        self.stop()
        
        # Launch playback on background thread
        thread = threading.Thread(target=self._play_worker, args=(text.strip(), on_complete), daemon=True)
        thread.start()

    def _get_cache_path(self, text: str, voice: str) -> str:
        """Computes persistent cache path for pre-synthesized speech audio."""
        import hashlib
        cache_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "voice_cache"))
        os.makedirs(cache_dir, exist_ok=True)
        key = hashlib.md5(f"{voice}:{text.strip()}".encode("utf-8")).hexdigest()
        return os.path.join(cache_dir, f"{key}.mp3")

    def _play_worker(self, text: str, on_complete: Optional[Callable]):
        with self._lock:
            self._stop_requested = False
            self.is_playing = True

        target_voice = "bn-BD-PradeepNeural" if self.is_bengali_text(text) else self.voice
        cached_audio = self._get_cache_path(text, target_voice)
        audio_to_play = None

        try:
            # 1. Check persistent disk cache first (0ms latency for repeated phrases)
            if os.path.exists(cached_audio) and os.path.getsize(cached_audio) > 100:
                audio_to_play = cached_audio
            elif EDGE_TTS_AVAILABLE and PYGAME_AVAILABLE:
                try:
                    asyncio.run(self._generate_audio_file(text, cached_audio, voice_override=target_voice))
                    if os.path.exists(cached_audio) and os.path.getsize(cached_audio) > 100:
                        audio_to_play = cached_audio
                except Exception:
                    audio_to_play = None

            if self._stop_requested:
                return

            # Play synthesized MP3 via Pygame Mixer
            if audio_to_play and PYGAME_AVAILABLE:
                try:
                    pygame.mixer.music.load(audio_to_play)
                    pygame.mixer.music.play()

                    while pygame.mixer.music.get_busy():
                        if self._stop_requested:
                            pygame.mixer.music.stop()
                            break
                        time.sleep(0.04)

                    pygame.mixer.music.unload()
                    return
                except Exception:
                    pass

            # 2. Offline Fallback: Windows SpeechSynthesizer SAPI5 (STRICTLY MALE ONLY - Paul Bettany / David)
            if not self._stop_requested:
                self._speak_powershell_native(text)

        finally:
            with self._lock:
                self.is_playing = False
            if on_complete and not self._stop_requested:
                on_complete()

    def _speak_powershell_native(self, text: str):
        """Fallback to local Windows SAPI when offline (STRICTLY MALE ONLY)."""
        clean = text.replace('"', '`"').replace("'", "''")
        ps_cmd = f"""
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $voices = $synth.GetInstalledVoices() | Where-Object {{ $_.Enabled }}
        $male = $voices | Where-Object {{ ($_.VoiceInfo.Culture.Name -like 'en-GB*' -and $_.VoiceInfo.Gender -eq 'Male') }} | Select-Object -First 1
        if (-not $male) {{
            $male = $voices | Where-Object {{ $_.VoiceInfo.Name -like '*David*' -or ($_.VoiceInfo.Gender -eq 'Male' -and $_.VoiceInfo.Name -notlike '*Zira*') }} | Select-Object -First 1
        }}
        if ($male) {{ $synth.SelectVoice($male.VoiceInfo.Name) }}
        $synth.Rate = 1
        $synth.Speak("{clean}")
        """
        try:
            proc = subprocess.Popen(
                ["powershell", "-NoProfile", "-Command", ps_cmd],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            while proc.poll() is None:
                if self._stop_requested:
                    proc.terminate()
                    break
                time.sleep(0.04)
        except Exception:
            pass
