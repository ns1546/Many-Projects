/**
 * CombineAlarm Acoustic, Haptic & Speech Engine
 * Professional-grade Web Audio API multi-sound synthesizer.
 * Features 10 alarm ringtones, audio preview, crescendo escalation,
 * and tactile haptics.
 */
class AlarmAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isPreviewing = false;
    this.activeNodes = [];
    this.vibrateInterval = null;
    this.wakeLock = null;
    this.volume = 1.0;
    this.crescendo = false;
    this.crescendoTimer = null;
    this.unlocked = false;

    this.initContext();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  async unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        this.unlocked = true;
        console.log('🔊 Web Audio Context unlocked and active!');
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    } else if (this.ctx) {
      this.unlocked = true;
    }
  }

  // Tactile micro-haptics for mobile buttons
  hapticTap() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(25); } catch (e) {}
    }
  }

  hapticWarning() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([60, 40, 80]); } catch (e) {}
    }
  }

  // Request screen wake lock so display never turns off while ringing
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('🔆 Screen WakeLock acquired.');
        this.wakeLock.addEventListener('release', () => {
          console.log('Screen WakeLock released.');
        });
      }
    } catch (err) {
      console.warn('WakeLock not supported or denied:', err.message);
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  // Continuous aggressive vibration cycles for ringing alarm
  startVibration() {
    if ('vibrate' in navigator) {
      const pattern = [500, 200, 500, 200, 800, 300];
      try { navigator.vibrate(pattern); } catch (e) {}
      this.vibrateInterval = setInterval(() => {
        if (this.isPlaying) {
          try { navigator.vibrate(pattern); } catch (e) {}
        } else {
          clearInterval(this.vibrateInterval);
        }
      }, 2500);
    }
  }

  stopVibration() {
    if (this.vibrateInterval) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }
    if ('vibrate' in navigator) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }

  // Speak voice memo or alarm announcement
  speakAnnouncement(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  }

  // Master Sound Dispatcher
  playToneGenerator(soundType) {
    switch (soundType) {
      case 'nuclear':
        this.playNuclearSiren();
        break;
      case 'retro_alarm':
        this.playRetroTwinBell();
        break;
      case 'digital_casio':
        this.playDigitalCasio();
        break;
      case 'rooster':
        this.playRoosterWake();
        break;
      case 'heavy_buzzer':
        this.playHeavyBuzzer();
        break;
      case 'sci_fi_pulse':
        this.playSciFiPulse();
        break;
      case 'gentle_zen':
        this.playGentleZen();
        break;
      case 'radar':
        this.playRadar();
        break;
      case 'tactical':
        this.playTactical();
        break;
      case 'siren':
      default:
        this.playEmergencySiren();
        break;
    }
  }

  // Preview sound audition (plays for 3 seconds then stops)
  async previewSound(soundType) {
    await this.unlock();
    if (this.isPlaying) return;

    this.stopAlarm(); // stop any existing preview
    this.isPreviewing = true;
    this.isPlaying = true;
    this.playToneGenerator(soundType);

    setTimeout(() => {
      if (this.isPreviewing) {
        this.stopAlarm();
        this.isPreviewing = false;
      }
    }, 3200);
  }

  // Master Ring Method
  async startAlarm(soundType = 'siren', voiceMemo = null, alarmTitle = null, useCrescendo = false) {
    await this.unlock();
    if (this.isPlaying && !this.isPreviewing) return;

    this.stopAlarm(); // clear any previews
    this.isPlaying = true;
    this.isPreviewing = false;
    this.requestWakeLock();
    this.startVibration();

    // Volume handling: Crescendo (starts quiet, ramps to 100% over 12s)
    if (this.masterGain && this.ctx) {
      if (useCrescendo) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(0.15, now);
        this.masterGain.gain.linearRampToValueAtTime(1.0, now + 12);
      } else {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }

    console.log(`🚨 Triggering acoustic alarm: [${soundType}]`);
    this.playToneGenerator(soundType);

    // Delay voice memo slightly so user hears siren intro first
    if (voiceMemo || alarmTitle) {
      setTimeout(() => {
        if (this.isPlaying) {
          const announcement = voiceMemo 
            ? `${alarmTitle ? alarmTitle + '. ' : ''}${voiceMemo}` 
            : `Alarm alert! ${alarmTitle || 'Wake up!'}`;
          this.speakAnnouncement(announcement);
        }
      }, 1500);
    }
  }

  stopAlarm() {
    this.isPlaying = false;
    this.isPreviewing = false;
    this.stopVibration();
    this.releaseWakeLock();

    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    if (this.crescendoTimer) {
      clearInterval(this.crescendoTimer);
      this.crescendoTimer = null;
    }

    // Stop and disconnect all audio nodes
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  // =========================================================================
  // RINGTONE SYNTHESIZERS (10 CUSTOM HIGH-ACCURACY SOUNDS)
  // =========================================================================

  // 1. EMERGENCY SIREN (Oscillating dual-tone ambulance / alert)
  playEmergencySiren() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(1.8, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start();
    lfo.start();
    this.activeNodes.push(osc, lfo, gain, lfoGain);
  }

  // 2. NUCLEAR AIR-RAID SIREN (Sub-bass growl + rising howling sweep)
  playNuclearSiren() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);

    // Sweeping pitch from 320Hz to 880Hz continuously
    const sweepLfo = this.ctx.createOscillator();
    sweepLfo.type = 'triangle';
    sweepLfo.frequency.setValueAtTime(0.35, now); // slow ominous rise and fall

    const sweepGain = this.ctx.createGain();
    sweepGain.gain.setValueAtTime(280, now);
    sweepLfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.7, now);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    // Deep sub-bass growl
    sub.type = 'square';
    sub.frequency.setValueAtTime(80, now);
    subGain.gain.setValueAtTime(0.3, now);
    sub.connect(subGain);
    subGain.connect(this.masterGain || this.ctx.destination);

    osc.start();
    sweepLfo.start();
    sub.start();
    this.activeNodes.push(osc, sweepLfo, sub, gain, subGain, sweepGain);
  }

  // 3. RETRO TWIN-BELL ALARM CLOCK (Metallic mechanical bell clapper at 22Hz)
  playRetroTwinBell() {
    if (!this.ctx) return;
    const triggerClatter = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      // High-pitched twin bells: 2400Hz and 3100Hz with clapper ring modulation
      [2400, 3100].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        mod.type = 'square';
        mod.frequency.setValueAtTime(24, now); // 24Hz clapper strike rate
        modGain.gain.setValueAtTime(1, now);

        gain.gain.setValueAtTime(0.4, now);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
        this.activeNodes.push(osc, gain);
      });
    };

    triggerClatter();
    const interval = setInterval(() => {
      if (this.isPlaying) triggerClatter();
      else clearInterval(interval);
    }, 1000);
  }

  // 4. DIGITAL CASIO BEEP (Classic 80s/90s BEEP-BEEP ... BEEP-BEEP watch)
  playDigitalCasio() {
    if (!this.ctx) return;
    const beepSequence = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = 2048; // exact classic digital watch piezoelectric buzzer frequency

      // Pulse 1
      this.createBeep(freq, now, 0.08);
      // Pulse 2
      this.createBeep(freq, now + 0.12, 0.08);
    };

    beepSequence();
    const interval = setInterval(() => {
      if (this.isPlaying) beepSequence();
      else clearInterval(interval);
    }, 900);
  }

  createBeep(freq, startTime, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.setValueAtTime(0.65, startTime + 0.005);
    gain.gain.setValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
    this.activeNodes.push(osc, gain);
  }

  // 5. ROOSTER MORNING CROW (Harmonic FM acoustic morning crow)
  playRoosterWake() {
    if (!this.ctx) return;
    const doCrow = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Pitch contour of a cock-a-doodle-doo (rising then dropping)
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(780, now + 0.25);
      osc.frequency.linearRampToValueAtTime(950, now + 0.55);
      osc.frequency.linearRampToValueAtTime(620, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 0.15);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.7);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.35);
      this.activeNodes.push(osc, gain);
    };

    doCrow();
    const interval = setInterval(() => {
      if (this.isPlaying) doCrow();
      else clearInterval(interval);
    }, 2200);
  }

  // 6. HEAVY INDUSTRIAL BUZZER (Un-sleepable 120Hz electric klaxon buzzer)
  playHeavyBuzzer() {
    if (!this.ctx) return;
    const triggerBuzz = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now); // 120Hz line buzz

      // Overtones
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(720, now);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.setValueAtTime(0, now + 0.5);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
      osc2.start(now);
      osc2.stop(now + 0.55);
      this.activeNodes.push(osc, osc2, gain);
    };

    triggerBuzz();
    const interval = setInterval(() => {
      if (this.isPlaying) triggerBuzz();
      else clearInterval(interval);
    }, 850);
  }

  // 7. SCI-FI WARP PULSE (Futuristic resonance sweep)
  playSciFiPulse() {
    if (!this.ctx) return;
    const triggerWarp = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.35);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.35);
      filter.Q.setValueAtTime(6.0, now);

      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
      this.activeNodes.push(osc, filter, gain);
    };

    triggerWarp();
    const interval = setInterval(() => {
      if (this.isPlaying) triggerWarp();
      else clearInterval(interval);
    }, 700);
  }

  // 8. GENTLE ZEN CHIMES (Peaceful harmonic pentatonic bells with crescendo)
  playGentleZen() {
    if (!this.ctx) return;
    const chords = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    let step = 0;

    const chime = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = chords[step % chords.length];
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.65, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
      this.activeNodes.push(osc, gain);
    };

    chime();
    const interval = setInterval(() => {
      if (this.isPlaying) chime();
      else clearInterval(interval);
    }, 800);
  }

  // 9. RADAR SONAR CHIRP (High-intensity pulsing sweeps)
  playRadar() {
    if (!this.ctx) return;
    const triggerPulse = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.35);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
      this.activeNodes.push(osc, gain);
    };

    triggerPulse();
    const interval = setInterval(() => {
      if (this.isPlaying) triggerPulse();
      else clearInterval(interval);
    }, 800);
  }

  // 10. TACTICAL COMBAT STROBE (Square-wave rapid klaxon)
  playTactical() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(920, now);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(4.5, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.45, now);

    lfo.connect(lfoGain.gain);
    gain.gain.setValueAtTime(0.6, now);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start();
    lfo.start();
    this.activeNodes.push(osc, lfo, gain, lfoGain);
  }
}

// Global instance
window.alarmAudioEngine = new AlarmAudioEngine();
