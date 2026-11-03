"""
J.A.R.V.I.S. Acoustic Noise Suppression & Speech Enhancement Engine
Provides studio-grade acoustic pre-processing:
- Stationary and dynamic noise floor estimation
- Spectral Subtraction & Adaptive Wiener Filter
- Transient noise rejection (keyboard clicks, microphone pops, door slams)
- Signal-to-Noise Ratio (SNR) estimation and voice clarity enhancement
"""

import math
from typing import Tuple, Optional, Any, Union

try:
    import numpy as np
    from scipy.signal import medfilt
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False


class AcousticNoiseFilter:
    """
    Acoustic noise suppression and voice enhancement filter.
    Cleans noisy microphone streams before feeding to STT (faster-whisper)
    and Voice Biometrics (SpeakerIdentifier).
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        subtraction_strength: float = 1.8,
        spectral_floor: float = 0.05,
        noise_estimation_duration: float = 0.25
    ):
        self.sample_rate = sample_rate
        self.alpha = subtraction_strength   # Over-subtraction factor
        self.beta = spectral_floor          # Spectral floor factor (prevents musical noise)
        self.noise_duration = noise_estimation_duration
        self._ambient_noise_profile: Optional[Any] = None

    def estimate_noise_profile(self, noise_audio: Any) -> Optional[Any]:
        """
        Calibrates the background noise spectrum from a brief silence/ambient window.
        """
        if not NUMPY_AVAILABLE:
            return None

        samples = self._to_float32_array(noise_audio)
        if samples is None or len(samples) < int(self.sample_rate * 0.05):
            return None

        n_fft = 512
        hop_length = 256
        window = np.hanning(n_fft)

        magnitudes = []
        for i in range(0, len(samples) - n_fft + 1, hop_length):
            chunk = samples[i:i + n_fft] * window
            mag = np.abs(np.fft.rfft(chunk, n=n_fft))
            magnitudes.append(mag)

        if not magnitudes:
            return None

        # Mean magnitude spectrum of background ambient noise
        self._ambient_noise_profile = np.mean(magnitudes, axis=0)
        return self._ambient_noise_profile

    def calculate_snr(self, audio: Any) -> float:
        """
        Calculates Signal-to-Noise Ratio (SNR) in decibels (dB).
        Returns estimated SNR (e.g. >15 dB is clear speech, <5 dB is noisy).
        """
        if not NUMPY_AVAILABLE:
            return 20.0

        samples = self._to_float32_array(audio)
        if samples is None or len(samples) == 0:
            return 0.0

        # Frame-level RMS energy
        frame_len = int(self.sample_rate * 0.025)
        hop_len = int(self.sample_rate * 0.010)

        rms_list = []
        for i in range(0, len(samples) - frame_len + 1, hop_len):
            chunk = samples[i:i + frame_len]
            rms = np.sqrt(np.mean(chunk ** 2) + 1e-12)
            rms_list.append(rms)

        if not rms_list:
            return 0.0

        rms_arr = np.array(rms_list)
        # Sort energies: lowest 15% represents background noise floor, top 50% represents speech
        noise_level = np.percentile(rms_arr, 15)
        speech_level = np.percentile(rms_arr, 85)

        if (speech_level - noise_level) < 0.15 * max(1e-4, speech_level):
            # Steady-state signal or continuous tone: estimate SNR via spectral peak-to-floor ratio
            n_fft = min(len(samples), 1024)
            fft_mag = np.abs(np.fft.rfft(samples[:n_fft], n=n_fft))
            peak_mag = np.max(fft_mag)
            floor_mag = np.median(fft_mag) + 1e-9
            snr_db = 20.0 * np.log10(max(1e-5, peak_mag) / max(1e-6, floor_mag))
            return float(np.clip(snr_db, -10.0, 50.0))

        if noise_level < 1e-6:
            return 40.0  # Pristine studio silence

        snr_db = 20.0 * np.log10(max(1e-5, speech_level) / max(1e-6, noise_level))
        return float(np.clip(snr_db, -10.0, 50.0))

    def suppress_noise(
        self,
        audio_data: Any,
        return_pcm_bytes: bool = False
    ) -> Tuple[Any, float]:
        """
        Applies Spectral Subtraction with Adaptive Floor to suppress ambient noise.
        Returns:
            (cleaned_audio_data, snr_db)
        """
        if not NUMPY_AVAILABLE:
            return audio_data, 20.0

        samples = self._to_float32_array(audio_data)
        if samples is None or len(samples) < 512:
            return audio_data, 20.0

        # Estimate SNR prior to enhancement
        initial_snr = self.calculate_snr(samples)

        # STFT parameters
        n_fft = 512
        hop_length = 256
        window = np.hanning(n_fft)

        num_frames = 1 + (len(samples) - n_fft) // hop_length
        if num_frames <= 0:
            return audio_data, initial_snr

        # If no ambient profile exists yet, estimate from first 10% of input (presumed pre-speech pause)
        if self._ambient_noise_profile is None or len(self._ambient_noise_profile) != (n_fft // 2 + 1):
            noise_est_samples = samples[:max(n_fft * 2, int(len(samples) * 0.15))]
            self.estimate_noise_profile(noise_est_samples)

        noise_mag = self._ambient_noise_profile
        if noise_mag is None:
            noise_mag = np.full(n_fft // 2 + 1, 1e-4, dtype=np.float32)

        # Process frames in STFT domain
        cleaned_frames = []
        for i in range(num_frames):
            idx = i * hop_length
            chunk = samples[idx:idx + n_fft] * window
            fft_complex = np.fft.rfft(chunk, n=n_fft)
            mag = np.abs(fft_complex)
            phase = np.angle(fft_complex)

            # Spectral Subtraction: |S| = max(|Y|^2 - alpha * |N|^2, beta * |Y|^2)^0.5
            subtracted_power = np.maximum(mag ** 2 - self.alpha * (noise_mag ** 2), self.beta * (mag ** 2))
            clean_mag = np.sqrt(subtracted_power)

            # Adaptive Wiener Smoothing (spectral gain)
            wiener_gain = clean_mag / (clean_mag + noise_mag + 1e-9)
            clean_mag = clean_mag * wiener_gain

            # Reconstruct time-domain chunk via Inverse FFT
            clean_fft = clean_mag * np.exp(1j * phase)
            clean_chunk = np.fft.irfft(clean_fft, n=n_fft) * window
            cleaned_frames.append(clean_chunk)

        # Overlap-add synthesis
        reconstructed = np.zeros(len(samples), dtype=np.float32)
        window_sum = np.zeros(len(samples), dtype=np.float32)

        for i, chunk in enumerate(cleaned_frames):
            idx = i * hop_length
            reconstructed[idx:idx + n_fft] += chunk
            window_sum[idx:idx + n_fft] += window ** 2

        # Normalize window overlap
        valid_indices = window_sum > 1e-4
        reconstructed[valid_indices] /= window_sum[valid_indices]

        # Transient suppression (repress sharp clicks/pops)
        peak = np.max(np.abs(reconstructed))
        if peak > 0.98:
            reconstructed = np.tanh(reconstructed * 1.1)

        final_snr = self.calculate_snr(reconstructed)

        if return_pcm_bytes:
            int16_samples = np.clip(reconstructed * 32767.0, -32768, 32767).astype(np.int16)
            return int16_samples.tobytes(), final_snr

        return reconstructed, final_snr

    def _to_float32_array(self, audio_data: Any) -> Optional[np.ndarray]:
        """Converts diverse audio formats to float32 numpy array normalized to [-1.0, 1.0]."""
        if not NUMPY_AVAILABLE:
            return None

        if hasattr(audio_data, "get_raw_data"):
            try:
                raw_bytes = audio_data.get_raw_data(convert_rate=self.sample_rate, convert_width=2)
                return np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            except Exception:
                return None
        elif isinstance(audio_data, bytes):
            try:
                return np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            except Exception:
                return None
        elif isinstance(audio_data, np.ndarray):
            if audio_data.dtype == np.int16:
                return audio_data.astype(np.float32) / 32768.0
            elif audio_data.dtype in (np.float32, np.float64):
                return audio_data.astype(np.float32)
        return None
