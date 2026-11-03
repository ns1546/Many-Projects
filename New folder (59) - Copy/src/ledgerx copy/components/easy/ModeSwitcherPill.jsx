import React from 'react';
import { useOperatingMode, OPERATING_MODES } from '../../context/OperatingModeContext';
import { useLocale } from '../../context/LocaleContext';
import { Zap, Sliders, Sparkles } from 'lucide-react';

export default function ModeSwitcherPill({ compact = false }) {
  const { operatingMode, setOperatingMode, isEasyMode, isUltraMode } = useOperatingMode();
  const { isBengali } = useLocale();

  return (
    <div className={`flex items-center gap-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-inner select-none ${compact ? 'p-0.5' : 'p-1'}`}>
      {/* Easy Mode Button */}
      <button
        type="button"
        onClick={() => setOperatingMode(OPERATING_MODES.EASY)}
        className={`flex items-center gap-1.5 ${compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'} rounded-lg font-bold transition-all duration-200 cursor-pointer ${
          isEasyMode
            ? 'bg-emerald-700 text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
        title={isBengali ? 'সহজ টালিখাতা মোড: দ্রুত দেনা-পাওনা, বিক্রি ও খরচ' : 'Easy Khata Mode: Fast & simple daily bookkeeping'}
      >
        <Zap size={13} className={isEasyMode ? 'fill-current' : ''} />
        <span>{compact ? (isBengali ? 'সহজ' : 'Easy') : (isBengali ? 'সহজ মোড' : 'Easy')}</span>
        {isEasyMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
        )}
      </button>

      {/* Ultra / Pro Control Mode Button */}
      <button
        type="button"
        onClick={() => setOperatingMode(OPERATING_MODES.ULTRA)}
        className={`flex items-center gap-1.5 ${compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'} rounded-lg font-bold transition-all duration-200 cursor-pointer ${
          isUltraMode
            ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
        title={isBengali ? 'প্রো মোড: বারকোড পিওএস, গভীর অ্যানালিটিক্স, গুদাম ও সম্পূর্ণ হিসাব' : 'Pro Mode: Barcode POS, Stock Analytics & Godown'}
      >
        <Sliders size={13} className={isUltraMode ? 'stroke-[2.5]' : ''} />
        <span>{compact ? (isBengali ? 'প্রো' : 'Pro') : (isBengali ? 'প্রো মোড' : 'Pro Mode')}</span>
        {isUltraMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        )}
      </button>
    </div>
  );
}
