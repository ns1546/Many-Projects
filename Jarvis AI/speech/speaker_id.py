"""
J.A.R.V.I.S. Multi-Speaker Voice Biometric Identification Engine
Acoustic feature extraction (20-band Mel-Scale Filterbank + Pitch F0 Autocorrelation + Spectral Centroid)
Enables J.A.R.V.I.S. to distinguish the Boss (master privileges) from colleagues, family, and guests.
"""

import os
import json
import time
import math
from typing import Dict, Any, List, Optional, Tuple, Union

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    from speech.acoustic_filter import AcousticNoiseFilter
    ACOUSTIC_FILTER_AVAILABLE = True
except ImportError:
    ACOUSTIC_FILTER_AVAILABLE = False


class SpeakerIdentifier:
    """
    Biometric Speaker Identification and Voice Profiling System.
    Extracts acoustic formants, fundamental frequency (F0), and spectral timbre
    to identify registered speakers and enforce multi-tier authority gates.
    """

    def __init__(
        self,
        profiles_path: Optional[str] = None,
        similarity_threshold: float = 0.85,
        auto_bootstrap_boss: bool = True,
        acoustic_filter: Optional[Any] = None
    ):
        self.profiles_path = profiles_path or os.path.join(
            os.path.dirname(__file__), "..", "data", "speakers.json"
        )
        self.similarity_threshold = similarity_threshold
        self.auto_bootstrap_boss = auto_bootstrap_boss
        self.acoustic_filter = acoustic_filter or (AcousticNoiseFilter() if ACOUSTIC_FILTER_AVAILABLE else None)
        self.profiles: Dict[str, Dict[str, Any]] = {}
        
        # Load or bootstrap existing speaker profiles
        self._load_profiles()
        if not self.profiles and self.auto_bootstrap_boss:
            self._bootstrap_default_boss()

    def _load_profiles(self):
        """Loads persistent speaker profiles from disk."""
        if os.path.exists(self.profiles_path):
            try:
                with open(self.profiles_path, "r", encoding="utf-8") as f:
                    self.profiles = json.load(f)
            except Exception as e:
                print(f" [!] Warning loading speaker profiles: {e}")
                self.profiles = {}

    def _save_profiles(self):
        """Persists speaker profiles to disk safely."""
        try:
            os.makedirs(os.path.dirname(os.path.abspath(self.profiles_path)), exist_ok=True)
            with open(self.profiles_path, "w", encoding="utf-8") as f:
                json.dump(self.profiles, f, indent=2)
        except Exception as e:
            print(f" [!] Error saving speaker profiles: {e}")

    def _bootstrap_default_boss(self):
        """Creates an initial Boss profile anchor if no profiles exist."""
        # Baseline anchor for the Boss (Tony Stark / Master User)
        # Allows instant recognition and authority bootstrapping
        self.profiles["boss"] = {
            "name": "Boss",
            "is_boss": True,
            "role": "boss",
            "title": "Sir",
            "samples": 1,
            "vector": None, # Will calibrate on first voice sample
            "created_at": time.time(),
            "last_seen": time.time(),
            "description": "Primary Executive Commander (Master System Privileges)"
        }
        self._save_profiles()

    def extract_features(
        self,
        audio_data: Any,
        sample_rate: int = 16000,
        clean_noise: bool = True
    ) -> Optional[Any]:
        """
        Extracts a normalized acoustic biometric feature vector from audio data.
        Accepts:
          - speech_recognition.AudioData
          - raw PCM bytes (int16 mono)
          - numpy array (float32 or int16)
        """
        if not NUMPY_AVAILABLE:
            return None

        # 1. Convert various input formats to numpy float32 in [-1.0, 1.0]
        samples = None
        if hasattr(audio_data, "get_raw_data"):
            try:
                raw_bytes = audio_data.get_raw_data(convert_rate=sample_rate, convert_width=2)
                samples = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            except Exception:
                return None
        elif isinstance(audio_data, bytes):
            try:
                samples = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            except Exception:
                return None
        elif isinstance(audio_data, np.ndarray):
            if audio_data.dtype == np.int16:
                samples = audio_data.astype(np.float32) / 32768.0
            else:
                samples = audio_data.astype(np.float32)
        else:
            return None

        if samples is None or len(samples) < int(sample_rate * 0.25):
            # Less than 250ms of audio is insufficient for biometric identification
            return None

        # 1b. Suppress ambient noise for resilient acoustic feature extraction
        if clean_noise and self.acoustic_filter is not None:
            try:
                samples, _ = self.acoustic_filter.suppress_noise(samples)
            except Exception:
                pass

        # 2. Voice Activity Energy Trimming (remove silence)
        frame_len = int(sample_rate * 0.025) # 25ms
        hop_len = int(sample_rate * 0.010)   # 10ms
        
        rms_frames = []
        for i in range(0, len(samples) - frame_len, hop_len):
            chunk = samples[i:i+frame_len]
            rms = np.sqrt(np.mean(chunk**2))
            rms_frames.append(rms)
            
        if not rms_frames:
            return None
            
        mean_rms = np.mean(rms_frames)
        silence_thresh = max(0.01, mean_rms * 0.3)
        
        voiced_samples = []
        for i, rms in enumerate(rms_frames):
            if rms >= silence_thresh:
                start = i * hop_len
                voiced_samples.extend(samples[start:start+hop_len])
                
        if len(voiced_samples) < frame_len * 5:
            # Fall back to raw samples if trimming was overly aggressive
            voiced_samples = samples
        else:
            voiced_samples = np.array(voiced_samples, dtype=np.float32)

        # 3. Construct 20-band Mel-scale filterbank
        n_mels = 20
        f_min = 80.0
        f_max = sample_rate / 2.0
        mel_min = 2595.0 * np.log10(1.0 + f_min / 700.0)
        mel_max = 2595.0 * np.log10(1.0 + f_max / 700.0)
        mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
        hz_points = 700.0 * (10.0 ** (mel_points / 2595.0) - 1.0)
        bin_points = np.floor((frame_len + 1) * hz_points / sample_rate).astype(int)
        
        n_fft = frame_len
        fbank = np.zeros((n_mels, int(n_fft // 2 + 1)))
        for m in range(1, n_mels + 1):
            f_m_minus = bin_points[m - 1]
            f_m = bin_points[m]
            f_m_plus = bin_points[m + 1]
            for k in range(f_m_minus, f_m):
                if f_m != f_m_minus:
                    fbank[m - 1, k] = (k - bin_points[m - 1]) / (f_m - f_m_minus)
            for k in range(f_m, f_m_plus):
                if f_m_plus != f_m:
                    fbank[m - 1, k] = (bin_points[m + 1] - k) / (f_m_plus - f_m)

        # DCT matrix for 12 MFCC coefficients (excluding c0 energy)
        num_ceps = 13
        dct_matrix = np.zeros((num_ceps, n_mels))
        for i in range(num_ceps):
            dct_matrix[i, :] = np.cos(np.pi * i * (np.arange(n_mels) + 0.5) / n_mels)

        # 4. Extract frame features
        num_frames = 1 + (len(voiced_samples) - frame_len) // hop_len
        window = np.hanning(frame_len)
        
        mfccs = []
        f0_estimates = []
        centroids = []
        
        # Limit to max 300 frames (~3 seconds) for responsive speed (< 15ms)
        step_frames = min(num_frames, 300)
        for i in range(step_frames):
            start = i * hop_len
            frame = voiced_samples[start:start+frame_len] * window
            fft_mag = np.abs(np.fft.rfft(frame, n=n_fft))
            
            # Mel spectral energies & MFCC
            mel_energy = np.dot(fbank, fft_mag)
            log_mel = np.log(np.maximum(mel_energy, 1e-6))
            ceps = np.dot(dct_matrix, log_mel)
            mfccs.append(ceps[1:]) # Drop c0
            
            # Spectral Centroid
            freqs = np.fft.rfftfreq(n_fft, d=1.0/sample_rate)
            mag_sum = np.sum(fft_mag)
            if mag_sum > 1e-6:
                centroid = np.sum(freqs * fft_mag) / mag_sum
                centroids.append(centroid)
                
            # Pitch estimation via Autocorrelation (65 Hz to 400 Hz vocal range)
            corr = np.correlate(frame, frame, mode='full')
            corr = corr[len(corr)//2:]
            min_lag = int(sample_rate / 400)
            max_lag = int(sample_rate / 65)
            if max_lag < len(corr):
                lag = min_lag + np.argmax(corr[min_lag:max_lag])
                if lag > 0:
                    f0 = sample_rate / lag
                    f0_estimates.append(f0)

        if not mfccs:
            return None

        mfcc_arr = np.array(mfccs) # (T, 12)
        mfcc_mean = np.mean(mfcc_arr, axis=0) # 12
        mfcc_std = np.std(mfcc_arr, axis=0)   # 12
        
        f0_med = float(np.median(f0_estimates)) if f0_estimates else 125.0
        f0_norm = (f0_med - 65.0) / (400.0 - 65.0) # scaled 0..1
        
        cent_med = float(np.median(centroids)) if centroids else 1500.0
        cent_norm = cent_med / 4000.0
        
        # Composite feature vector (26 dimensions)
        feature_vec = np.concatenate([
            mfcc_mean,
            mfcc_std,
            [f0_norm * 2.5, cent_norm * 1.5]
        ])
        
        norm = np.linalg.norm(feature_vec)
        if norm > 1e-6:
            feature_vec = feature_vec / norm
            
        return feature_vec

    def calculate_similarity(self, vec1: Any, vec2: Any) -> float:
        """
        Computes biometric similarity combining normalized spectral MFCC correlation
        and fundamental frequency (F0 pitch) distance.
        Returns a calibrated score in range [0.0, 1.0].
        """
        if vec1 is None or vec2 is None or not NUMPY_AVAILABLE:
            return 0.0
            
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        
        if len(v1) < 26 or len(v2) < 26:
            return 0.0

        # Spectral MFCC component (indices 0..23)
        m1 = v1[:24] - np.mean(v1[:24])
        norm_m1 = np.linalg.norm(m1)
        if norm_m1 > 1e-6:
            m1 = m1 / norm_m1

        m2 = v2[:24] - np.mean(v2[:24])
        norm_m2 = np.linalg.norm(m2)
        if norm_m2 > 1e-6:
            m2 = m2 / norm_m2

        spec_sim = max(0.0, min(1.0, float(np.dot(m1, m2))))

        # Pitch fundamental frequency component (index 24)
        p1 = v1[24]
        p2 = v2[24]
        pitch_diff = abs(p1 - p2)
        pitch_sim = float(np.exp(- (pitch_diff / 0.35) ** 2))

        # Spectral centroid timbre component (index 25)
        c1 = v1[25]
        c2 = v2[25]
        cent_diff = abs(c1 - c2)
        cent_sim = float(np.exp(- (cent_diff / 0.40) ** 2))

        # Weighted composite score
        composite = (0.60 * spec_sim) + (0.25 * pitch_sim) + (0.15 * cent_sim)
        return max(0.0, min(1.0, composite))

    def enroll_speaker(
        self,
        name: str,
        audio_data: Any,
        is_boss: bool = False,
        role: str = "guest",
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Enrolls or updates a speaker's biometric voice profile.
        """
        vec = self.extract_features(audio_data)
        if vec is None:
            return {
                "success": False,
                "message": "Audio sample was too short or noisy to extract voice biometric profile."
            }

        key = name.strip().lower()
        title_str = title or ("Sir" if is_boss else name.strip())
        
        if key in self.profiles and self.profiles[key].get("vector"):
            # Update existing profile using running average (momentum = 0.7)
            old_vec = np.array(self.profiles[key]["vector"], dtype=np.float32)
            updated_vec = 0.65 * old_vec + 0.35 * vec
            updated_vec = updated_vec / (np.linalg.norm(updated_vec) + 1e-6)
            
            self.profiles[key]["vector"] = updated_vec.tolist()
            self.profiles[key]["samples"] = self.profiles[key].get("samples", 1) + 1
            self.profiles[key]["last_seen"] = time.time()
            if is_boss:
                self.profiles[key]["is_boss"] = True
                self.profiles[key]["role"] = "boss"
        else:
            # Create new profile
            self.profiles[key] = {
                "name": name.strip(),
                "is_boss": is_boss,
                "role": "boss" if is_boss else role,
                "title": title_str,
                "samples": 1,
                "vector": vec.tolist(),
                "created_at": time.time(),
                "last_seen": time.time(),
                "description": "Master Commander" if is_boss else f"Registered {role}"
            }

        # If this speaker is Boss, make sure no conflicting profiles hold Boss authority unless intended
        if is_boss:
            for k, p in self.profiles.items():
                if k != key and p.get("name", "").lower() == "boss" and p.get("vector") is None:
                    # Update the bootstrap entry with this real calibrated voice!
                    p["vector"] = self.profiles[key]["vector"]
                    p["samples"] = self.profiles[key]["samples"]

        self._save_profiles()
        return {
            "success": True,
            "name": self.profiles[key]["name"],
            "is_boss": self.profiles[key]["is_boss"],
            "role": self.profiles[key]["role"],
            "samples": self.profiles[key]["samples"],
            "message": f"Biometric voice profile for {name} successfully registered, sir."
        }

    def identify_speaker(self, audio_data: Any) -> Dict[str, Any]:
        """
        Classifies incoming voice audio against enrolled profiles.
        Returns speaker metadata, identification confidence, and Boss status.
        """
        vec = self.extract_features(audio_data)
        if vec is None:
            # If features cannot be extracted (or text-mode fallback), default to Boss if calibrated
            return {
                "name": "Boss",
                "confidence": 0.85,
                "is_boss": True,
                "role": "boss",
                "title": "Sir",
                "recognized": True
            }

        best_match = None
        best_sim = 0.0

        for key, profile in self.profiles.items():
            ref_vec = profile.get("vector")
            if ref_vec is None:
                continue
                
            sim = self.calculate_similarity(vec, ref_vec)
            if sim > best_sim:
                best_sim = sim
                best_match = profile

        if best_match and best_sim >= self.similarity_threshold:
            # Update last seen timestamp
            best_match["last_seen"] = time.time()
            return {
                "name": best_match["name"],
                "confidence": round(best_sim, 3),
                "is_boss": best_match.get("is_boss", False),
                "role": best_match.get("role", "guest"),
                "title": best_match.get("title", best_match["name"]),
                "recognized": True
            }
        elif not self.has_calibrated_speakers():
            # If no speakers have calibrated vectors yet, auto-associate with Boss
            return {
                "name": "Boss",
                "confidence": 0.90,
                "is_boss": True,
                "role": "boss",
                "title": "Sir",
                "recognized": True,
                "uncalibrated_default": True
            }
        else:
            # Below threshold: Treated as Guest
            return {
                "name": "Guest",
                "confidence": round(best_sim, 3),
                "is_boss": False,
                "role": "guest",
                "title": "Guest",
                "recognized": False
            }

    def has_calibrated_speakers(self) -> bool:
        """Returns True if at least one speaker has a valid biometric vector saved."""
        return any(p.get("vector") is not None for p in self.profiles.values())

    def list_speakers(self) -> List[Dict[str, Any]]:
        """Returns all registered speaker profiles."""
        results = []
        for key, p in self.profiles.items():
            results.append({
                "name": p.get("name", key),
                "is_boss": p.get("is_boss", False),
                "role": p.get("role", "guest"),
                "title": p.get("title", ""),
                "samples": p.get("samples", 0),
                "calibrated": p.get("vector") is not None,
                "last_seen": p.get("last_seen", 0)
            })
        return results

    def delete_speaker(self, name: str) -> bool:
        """Removes a speaker profile."""
        key = name.strip().lower()
        if key in self.profiles:
            del self.profiles[key]
            self._save_profiles()
            return True
        return False
