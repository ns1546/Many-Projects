import React, { useState, useEffect } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/currency';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  Smartphone, 
  Landmark,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BkashBalanceCard() {
  const navigate = useNavigate();
  const { totalPaboPoisha, totalDiboPoisha, registers, customers, suppliers } = useKhata();
  const { activeTenant } = useTenant();
  const { locale, isBengali } = useLocale();
  const [isRevealed, setIsRevealed] = useState(false);

  // Total Business Liquidity
  const totalLiquidityPoisha = (registers || []).reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
  
  const bkashRegister = (registers || []).find(r => r.category === 'BKASH' || r.category === 'MFS' || r.id.startsWith('bkash_')) || { balancePoisha: 0 };
  const cashRegister = (registers || []).find(r => r.category === 'CASH' || r.id === 'cash_drawer') || { balancePoisha: 0 };
  const bankRegister = (registers || []).find(r => r.category === 'BANK' || r.id.startsWith('bank_')) || { balancePoisha: 0 };

  const handleToggleBalance = () => {
    setIsRevealed(prev => !prev);

    // Audio chime on balance reveal
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // Audio fallback
    }
  };

  // Keyboard shortcut: Spacebar toggles balance
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleToggleBalance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-white via-[#FFF9FB] to-[#FFF1F6] rounded-3xl border border-pink-200/80 shadow-md p-6 md:p-8 space-y-6">
      
      {/* ── Top Bar: Merchant Identity + Famous bKash Tap Balance Pill ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-pink-100 min-w-0">
        
        {/* Merchant Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E2136E] to-[#B00F55] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-pink-600/30 shrink-0">
            ৳
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {activeTenant?.name || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা'}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>{isBengali ? 'ভেরিফাইড মার্চেন্ট' : 'Verified Merchant'}</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-medium truncate">
              {activeTenant?.branch || 'প্রধান কার্যালয় / কেন্দ্রীয় ব্রাঞ্চ'} • {isBengali ? 'লাইভ ডিজিটাল হিসাব খাতা ও পিওএস' : 'Live Digital Ledger & POS'}
            </p>
          </div>
        </div>

        {/* The World-Famous bKash Tap-to-Reveal Pill */}
        <button
          onClick={handleToggleBalance}
          className="group relative flex items-center gap-3 px-5.5 py-3 rounded-full bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] text-white shadow-lg shadow-pink-600/30 active:scale-95 transition-all cursor-pointer select-none shrink-0 whitespace-nowrap self-start sm:self-auto"
          title="ব্যালেন্স দেখতে ক্লিক বা স্পেসবার চাপুন"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
            {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </div>
          
          <div className="text-left shrink-0">
            <span className="block text-[11px] font-bold text-pink-100 uppercase tracking-wider">
              {isRevealed ? (isBengali ? 'ব্যালেন্স লুকান' : 'Hide Balance') : (isBengali ? 'ব্যালেন্স দেখতে ট্যাপ করুন' : 'Tap for Balance')}
            </span>
            <span className="block text-base md:text-lg font-black tracking-tight tabular-nums">
              {isRevealed 
                ? formatCurrency(totalLiquidityPoisha, { locale }) 
                : '৳ • • • • • • •'}
            </span>
          </div>
        </button>
      </div>

      {/* ── Sub-Wallets Liquidity Breakdown (Clean, spacious rounded cards) ── */}
      <div className="pt-2">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
          <span>{isBengali ? 'ক্যাশ ও জমার হিসাব' : 'Cash & Account Balances'}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. ক্যাশ ড্রয়ার */}
          <div 
            onClick={() => navigate('/cashbox')}
            className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-105 transition-transform">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isBengali ? 'নগদ ক্যাশবাক্স' : 'Cash in Till'}
                </span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {formatCurrency(cashRegister.balancePoisha, { locale })}
                </span>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
          </div>

          {/* 2. বিকাশ মার্চেন্ট ওয়ালেট */}
          <div 
            onClick={() => navigate('/cashbox')}
            className="bg-white rounded-2xl p-4 border border-pink-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#E2136E] flex items-center justify-center font-bold border border-pink-200 group-hover:scale-105 transition-transform">
                <Smartphone size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isBengali ? 'বিকাশ মার্চেন্ট' : 'bKash Merchant'}
                </span>
                <span className="text-base font-black text-[#E2136E] tabular-nums">
                  {formatCurrency(bkashRegister.balancePoisha, { locale })}
                </span>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#E2136E] transition-colors" />
          </div>

          {/* 3. করপোরেট ব্যাংক ব্যালেন্স */}
          <div 
            onClick={() => navigate('/cashbox')}
            className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200 group-hover:scale-105 transition-transform">
                <Landmark size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isBengali ? 'ব্যাংক একাউন্ট' : 'Corporate Bank'}
                </span>
                <span className="text-base font-black text-blue-700 tabular-nums">
                  {formatCurrency(bankRegister.balancePoisha, { locale })}
                </span>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>

    </div>
  );
}
