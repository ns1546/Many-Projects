// ── LedgerX Mobile Haptic & Tactile Feedback Engine ───────────────────────
// Provides authentic mobile vibration pulses (navigator.vibrate) combined with
// Web Audio synthetic mechanical micro-clicks for physical sensory feedback.

class HapticFeedbackEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.vibrationEnabled = true;
  }

  initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  // Generic vibration executor
  vibrate(pattern) {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored if user has not interacted yet
      }
    }
  }

  // Synthesize ultra-short mechanical click/pop in Web Audio
  playMicroClick(freq = 1400, decayMs = 15, gainVal = 0.08) {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + decayMs / 1000);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + decayMs / 1000);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // 1. Light Tap: Button click, tab switch, pill toggle
  tap() {
    this.vibrate(12);
    this.playMicroClick(1200, 14, 0.05);
  }

  // 2. Quantity Increment (+) or Add Item: High-frequency lively pop
  add() {
    this.vibrate([15, 25, 20]);
    this.playMicroClick(1600, 22, 0.09);
  }

  // 3. Quantity Decrement (-): Deeper soft click
  remove() {
    this.vibrate(18);
    this.playMicroClick(850, 20, 0.07);
  }

  // 4. Success / Voucher confirmation
  success() {
    this.vibrate([25, 50, 40, 50, 25]);
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.0, now + 0.08); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880.0, now + 0.08);
      osc2.frequency.setValueAtTime(1174.66, now + 0.16); // D6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  // 5. Warning / Delete / Error
  warning() {
    this.vibrate([40, 30, 40]);
    this.playMicroClick(400, 40, 0.12);
  }

  // 6. Hold to Confirm Continuous Pulse
  holdPulse() {
    this.vibrate(15);
    this.playMicroClick(1100, 10, 0.03);
  }
}

export const haptics = new HapticFeedbackEngine();
