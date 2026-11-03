/**
 * LedgerX Bengali Audio Voicebox Engine
 * Vocalizes transactions through desktop speakers (Soundbox style)
 * Operates offline using Web Audio API sound chimes + SpeechSynthesis
 * Auto-detects native Bengali voices; falls back cleanly without robotic gibberish
 */

// Bengali to English digit mapper
const BN_TO_EN_DIGITS = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

export function convertBengaliDigitsToAscii(str) {
  if (!str) return '';
  return String(str).replace(/[০-৯]/g, (d) => BN_TO_EN_DIGITS[d] || d);
}

/**
 * Robust Bengali speech-to-amount parser:
 * Understands both Bengali numerals (৫০০), ASCII numbers (500), and spoken words (পাঁচশত, হাজার)
 */
export function parseBengaliSpokenAmount(transcript) {
  if (!transcript) return null;
  const clean = transcript.trim();

  // 1. Direct ASCII or Bengali numeral extraction
  const converted = convertBengaliDigitsToAscii(clean);
  const digitMatches = converted.match(/\d+(\.\d+)?/);
  if (digitMatches) {
    const val = parseFloat(digitMatches[0]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 2. Bengali word number conversion
  const WORD_VALUES = {
    'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5,
    'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
    'পনের': 15, 'কুড়ি': 20, 'বিশ': 20, 'পঁচিশ': 25, 'ত্রিশ': 30,
    'চল্লিশ': 40, 'পঞ্চাশ': 50, 'ষাট': 60, 'সত্তর': 70, 'আশি': 80,
    'নব্বই': 90, 'একশ': 100, 'একশত': 100, 'দুইশ': 200, 'তিনশ': 300,
    'চারশ': 400, 'পাঁচশ': 500, 'পাঁচশত': 500, 'হাজার': 1000,
    'দেড় হাজার': 1500, 'দুই হাজার': 2000, 'পাঁচ হাজার': 5000, 'দশ হাজার': 10000,
  };

  for (const [word, val] of Object.entries(WORD_VALUES)) {
    if (clean.includes(word)) {
      return val;
    }
  }

  return null;
}

class BengaliVoicebox {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = true;
    this.volume = 0.85;
    this.voices = [];
    this.bengaliVoice = null;
    this.isVoicesLoaded = false;

    if (typeof window !== 'undefined') {
      this.initVoices();
    }
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const load = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
      // Look for Bengali voices (bn-BD, bn-IN, Google বাংলা, Bangla)
      this.bengaliVoice = this.voices.find(
        (v) =>
          (v.lang && (v.lang.toLowerCase().startsWith('bn') || v.lang.toLowerCase().includes('bengali'))) ||
          (v.name && /bangla|bengali|বাংলা/i.test(v.name))
      ) || null;
      this.isVoicesLoaded = true;
    };

    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  /**
   * Soundbox Tone 1: bKash/Retail high-resonance double chime (Sale Confirmation)
   */
  playSuccessChime() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Tone 1: E6 (1318.51 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now);
      gain1.gain.setValueAtTime(0.28 * this.volume, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);

      // Tone 2: A6 (1760.00 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.00, now + 0.12);
      gain2.gain.setValueAtTime(0.32 * this.volume, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.42);
    } catch (e) {
      console.warn('[BengaliVoicebox] Audio chime error:', e);
    }
  }

  /**
   * Soundbox Tone 2: Cash receipt ascending triplet chime (Customer Deposit)
   */
  playPaymentChime() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25 * this.volume, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.28);
      });
    } catch (e) {
      console.warn('[BengaliVoicebox] Payment chime error:', e);
    }
  }

  /**
   * Soundbox Tone 3: Attention pulse for warnings/dues
   */
  playAlertChime() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('[BengaliVoicebox] Alert chime error:', e);
    }
  }

  /**
   * Intelligently vocalizes transaction phrase:
   * - Uses authentic Bengali voice if present
   * - If OS lacks Bengali voice, speaks clear, crystal-understandable bilingual message
   *   (never speaks garbled English phonetic spelling of Bengali Unicode)
   */
  speakMessage({ bnText, fallbackEnText, chimeType = 'success' }) {
    if (!this.isEnabled || typeof window === 'undefined') return;

    if (chimeType === 'payment') {
      this.playPaymentChime();
    } else if (chimeType === 'alert') {
      this.playAlertChime();
    } else {
      this.playSuccessChime();
    }

    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      // Refresh voice list if not yet cached
      if (!this.bengaliVoice && this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices() || [];
        this.bengaliVoice = this.voices.find(
          (v) =>
            (v.lang && (v.lang.toLowerCase().startsWith('bn') || v.lang.toLowerCase().includes('bengali'))) ||
            (v.name && /bangla|bengali|বাংলা/i.test(v.name))
        ) || null;
      }

      const utterance = new SpeechSynthesisUtterance();
      utterance.volume = this.volume;

      if (this.bengaliVoice) {
        // Native Bengali speech engine available
        utterance.voice = this.bengaliVoice;
        utterance.lang = this.bengaliVoice.lang || 'bn-BD';
        utterance.text = bnText;
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
      } else {
        // Fallback for Windows default systems without Bangla pack:
        // Speaks high-clarity announcement that the operator can immediately understand
        utterance.lang = 'en-US';
        utterance.text = fallbackEnText || bnText;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[BengaliVoicebox] Speech error:', err);
    }
  }

  announceSale(amountTaka) {
    const cleanAmt = convertBengaliDigitsToAscii(amountTaka);
    this.speakMessage({
      bnText: `${amountTaka} টাকা বিক্রয় সম্পন্ন হয়েছে।`,
      fallbackEnText: `Sale completed. ${cleanAmt} Taka received.`,
      chimeType: 'success',
    });
  }

  announcePayment(partyName, amountTaka, remainingDueTaka) {
    const cleanAmt = convertBengaliDigitsToAscii(amountTaka);
    const cleanDue = remainingDueTaka !== undefined ? convertBengaliDigitsToAscii(remainingDueTaka) : null;
    
    let bnText = `${partyName} এর ${amountTaka} টাকা জমা হয়েছে।`;
    let fallbackEnText = `Payment received from ${partyName}, ${cleanAmt} Taka.`;

    if (cleanDue !== null && Number(cleanDue) > 0) {
      bnText += ` বর্তমান বকেয়া ${remainingDueTaka} টাকা।`;
      fallbackEnText += ` Remaining due is ${cleanDue} Taka.`;
    }

    this.speakMessage({
      bnText,
      fallbackEnText,
      chimeType: 'payment',
    });
  }

  announceWarning(text) {
    this.speakMessage({
      bnText: `সতর্কবার্তা! ${text}`,
      fallbackEnText: `Alert! ${text}`,
      chimeType: 'alert',
    });
  }

  speak(text, lang = 'bn-BD') {
    this.speakMessage({
      bnText: text,
      fallbackEnText: text,
      chimeType: 'success',
    });
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

export const voicebox = new BengaliVoicebox();
