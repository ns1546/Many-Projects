"""
J.A.R.V.I.S. Local Whisper Speech Recognition Engine
Powered by faster-whisper (CTranslate2 int8) for low-latency, 100% offline local speech recognition.
"""

import io
import wave
import time
from typing import Optional, Any

try:
    from faster_whisper import WhisperModel
    FASTER_WHISPER_AVAILABLE = True
except Exception:
    FASTER_WHISPER_AVAILABLE = False


class LocalWhisperRecognizer:
    _instance: Optional["LocalWhisperRecognizer"] = None
    _model: Optional[Any] = None

    def __init__(self, model_size: str = "tiny.en"):
        self.model_size = model_size
        self.model = None
        self._load_model()

    def _load_model(self):
        if not FASTER_WHISPER_AVAILABLE:
            return
        try:
            # Use cached tiny.en model on CPU with int8 quantization
            self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
        except Exception as e:
            print(f" [!] Notice loading local Whisper: {e}")
            self.model = None

    def transcribe_audio_data(self, audio_data) -> Optional[str]:
        """
        Transcribes a speech_recognition.AudioData object using local faster-whisper.
        Returns the transcribed string or None.
        """
        if not self.model:
            return None

        try:
            # Convert AudioData to in-memory WAV buffer
            wav_bytes = audio_data.get_wav_data(convert_rate=16000, convert_width=2)
            audio_io = io.BytesIO(wav_bytes)

            segments, info = self.model.transcribe(
                audio_io,
                beam_size=1,
                language="en",
                temperature=0.0,
                vad_filter=False
            )

            text_pieces = [s.text.strip() for s in segments]
            full_text = " ".join(text_pieces).strip()
            return full_text if full_text else None
        except Exception as e:
            return None

    @classmethod
    def get_instance(cls) -> "LocalWhisperRecognizer":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
