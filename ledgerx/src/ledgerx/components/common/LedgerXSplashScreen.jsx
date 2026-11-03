import React, { useState, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { voicebox } from '../../utils/bengaliVoicebox';
import { ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function LedgerXSplashScreen({ onFinish }) {
  const { isBengali } = useLocale();
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState(isBengali ? 'সিস্টেম স্টার্টআপ শুরু হচ্ছে...' : 'Initializing system startup...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage timings
    const timers = [
      setTimeout(() => {
        setProgress(28);
        setStageText(isBengali ? 'ডাটাবেজ সেলফ-হিলিং ডক্টর সক্রিয় হচ্ছে...' : 'Activating database self-healing doctor...');
      }, 350),

      setTimeout(() => {
        setProgress(65);
        setStageText(isBengali ? '৮টি অ্যাকাউন্টিং নোড ও ডাবল-এন্ট্রি বাস সিঙ্ক হচ্ছে...' : 'Synchronizing 8-node accounting bus...');
      }, 800),

      setTimeout(() => {
        setProgress(92);
        setStageText(isBengali ? 'ESC/POS প্রিন্টার ও সাউন্ডবক্স রেডি...' : 'Connecting ESC/POS & soundbox interfaces...');
      }, 1250),

      setTimeout(() => {
        setProgress(100);
        setStageText(isBengali ? 'সিস্টেম প্রস্তুত! স্বাগতম LedgerX-এ।' : 'Ready! Welcome to LedgerX Desktop.');
        try {
          voicebox.playSuccessChime();
        } catch {
          // ignore
        }
      }, 1600),

      setTimeout(() => {
        setIsFadingOut(true);
      }, 1850),

      setTimeout(() => {
        onFinish();
      }, 2150),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isBengali, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-gray-950 via-slate-900 to-[#4A0322] flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300 select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Glowing Brand Badge */}
      <div className="relative mb-8">
        {/* Pulsating glowing rings */}
        <div className="absolute inset-0 rounded-full bg-[#E2136E] blur-2xl opacity-40 animate-ping"></div>
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#E2136E] to-purple-600 blur-lg opacity-60 animate-pulse"></div>

        {/* Squircle Core App Icon */}
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E2136E] to-[#800438] p-1 shadow-2xl flex items-center justify-center border border-white/20">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#E2136E] font-black text-3xl shadow-inner">
            ৳
          </div>
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
        <span>LedgerX</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-pink-300 font-mono font-normal border border-white/10">
          Desktop v2.0
        </span>
      </h1>
      <p className="text-xs text-gray-400 font-medium mb-8">
        {isBengali ? 'বাণিজ্যিক পাইকারি ও খুচরা ডিজিটাল খাতা ইআরপি' : 'Enterprise Wholesale & Retail Digital Khata'}
      </p>

      {/* Animated Progress Bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-[#E2136E] to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-300 font-medium truncate pr-2">{stageText}</span>
          <span className="font-mono font-bold text-[#E2136E] shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Skip Hint */}
      <p className="absolute bottom-6 text-[10px] text-gray-500 hover:text-gray-400 transition-colors">
        {isBengali ? 'দ্রুত প্রবেশ করতে যেকোনো জায়গায় ক্লিক করুন' : 'Click anywhere to enter instantly'}
      </p>
    </div>
  );
}
