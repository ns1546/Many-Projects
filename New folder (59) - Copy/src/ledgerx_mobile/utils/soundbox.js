// ── LedgerX Mobile Digital Soundbox Engine ──────────────────────────────
// Institutional offline speech announcer and synthesizer for transactions

class SoundboxEngine {
  constructor() {
    this.enabled = true;
    this.volume = 1.0;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.audioCtx = null;
  }

  initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  // Play a pleasant chime tone prior to vocalizing
  playChime() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('[Soundbox] Chime tone failed:', e);
    }
  }

  // Barcode scanner high-frequency beep
  playBeep() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('[Soundbox] Beep tone failed:', e);
    }
  }

  // Success tone
  playSuccess() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('[Soundbox] Success tone failed:', e);
    }
  }

  // Speak a transaction announcement
  announce({ type, amount, partyName, language = 'bn' }) {
    if (!this.enabled) return;

    // Play initial chime
    this.playChime();

    if (!this.synth) return;

    setTimeout(() => {
      try {
        let text = '';
        const formattedAmount = Number(amount || 0).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US');

        if (language === 'bn') {
          if (type === 'sale') {
            text = `নগদ বিক্রয় সম্পন্ন: ${formattedAmount} টাকা। ক্যাশবাক্স আপডেট হয়েছে।`;
          } else if (type === 'credit_collection') {
            text = `${partyName || 'সম্মানিত গ্রাহকের'} ${formattedAmount} টাকা জমা হয়েছে। ধন্যবাদ।`;
          } else if (type === 'expense') {
            text = `খরচ প্রদান: ${formattedAmount} টাকা হিসাবভুক্ত হয়েছে।`;
          } else if (type === 'due_entry') {
            text = `${partyName || 'গ্রাহকের'} বাকিতে বিক্রয়: ${formattedAmount} টাকা খতিয়ানে যোগ হয়েছে।`;
          } else {
            text = `লেনদেন সম্পন্ন: ${formattedAmount} টাকা।`;
          }
        } else {
          if (type === 'sale') {
            text = `Cash sale completed: ${formattedAmount} Taka. Cashbox updated.`;
          } else if (type === 'credit_collection') {
            text = `Payment received from ${partyName || 'Customer'}: ${formattedAmount} Taka.`;
          } else if (type === 'expense') {
            text = `Expense recorded: ${formattedAmount} Taka.`;
          } else if (type === 'due_entry') {
            text = `Credit sale recorded: ${formattedAmount} Taka for ${partyName || 'Customer'}.`;
          } else {
            text = `Transaction successful: ${formattedAmount} Taka.`;
          }
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to pick appropriate voice
        const voices = this.synth.getVoices();
        if (language === 'bn') {
          const bnVoice = voices.find(v => v.lang.startsWith('bn'));
          if (bnVoice) utterance.voice = bnVoice;
          utterance.lang = 'bn-BD';
        } else {
          const enVoice = voices.find(v => v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
          utterance.lang = 'en-US';
        }

        this.synth.cancel(); // cancel any ongoing speech
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('[Soundbox] Speech failed:', err);
      }
    }, 280);
  }
}

export const soundbox = new SoundboxEngine();
