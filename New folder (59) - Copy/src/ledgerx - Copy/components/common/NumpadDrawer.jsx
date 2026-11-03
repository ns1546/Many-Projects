import React, { useState, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { takaToPoisha, formatCurrency } from '../../utils/currency';
import { X, Check, Wallet, Smartphone, Landmark, ArrowDownLeft, ArrowUpRight, FileText, User } from 'lucide-react';

export default function NumpadDrawer({
  isOpen,
  onClose,
  onSubmit,
  title,
  type = 'PABO', // 'PABO' (Got Money) or 'DIBO' (Gave Due)
  partyName = '',
}) {
  const { t, isBengali, locale } = useLocale();
  const [amountStr, setAmountStr] = useState('');
  const [walletId, setWalletId] = useState('cash_drawer');
  const [description, setDescription] = useState('');

  // Keyboard listener (Physical Numpad & Keyboard)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // If typing in the note input, do not hijack digits or backspace
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleCommit();
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setAmountStr((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setAmountStr((prev) => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, amountStr, walletId, description]);

  if (!isOpen) return null;

  const handleQuickAdd = (chip) => {
    const current = parseInt(amountStr || '0', 10);
    setAmountStr(String(current + chip));
  };

  const handleCommit = () => {
    const num = parseInt(amountStr || '0', 10);
    if (num <= 0) return;
    const poisha = takaToPoisha(num);
    onSubmit({
      amountPoisha: poisha,
      walletId,
      description,
    });
    setAmountStr('');
    setDescription('');
    onClose();
  };

  const isPabo = type === 'PABO';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* ── 1. Top Header Row ── */}
        <div className={`px-6 py-4 flex items-center justify-between text-white shrink-0 ${
          isPabo 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700' 
            : 'bg-gradient-to-r from-[#E2136E] to-[#B00F55]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm font-bold">
              {isPabo ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black tracking-tight leading-tight">
                {isPabo 
                  ? (isBengali ? 'টাকা আদায় (টাকা পেলাম)' : 'Receive Payment (Cash In)') 
                  : (isBengali ? 'বাকি বিক্রয় (বাকি দিলাম)' : 'Give Due Credit (Cash Out)')}
              </h3>
              <p className="text-xs text-white/90 font-bold mt-0.5 flex items-center gap-1.5">
                <User size={13} />
                <span>{partyName || (isBengali ? 'গ্রাহক / মহাজন' : 'Party Account')}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            title="বন্ধ করুন (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 2. Widescreen 2-Column Responsive Body ── */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          
          {/* Left Column: Big Amount Box, Wallet, & Memo */}
          <div className="flex flex-col justify-between space-y-4">
            
            {/* Massive Amount Display Box */}
            <div className={`p-6 rounded-3xl border-2 text-center transition-colors shadow-sm ${
              isPabo 
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                : 'bg-pink-50/80 border-pink-300 text-pink-950'
            }`}>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                {isBengali ? 'টাকার পরিমাণ (টাকায়)' : 'Amount (BDT)'}
              </p>
              <div className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2 tabular-nums">
                <span className={isPabo ? 'text-emerald-600' : 'text-[#E2136E]'}>৳</span>
                <span>{amountStr ? parseInt(amountStr, 10).toLocaleString(isBengali ? 'bn-BD' : 'en-US') : '০'}</span>
              </div>
            </div>

            {/* Payment Wallet Channel (When Pabo) */}
            {isPabo && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  {isBengali ? 'টাকা জমার মাধ্যম নির্বাচন করুন:' : 'Payment Account:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWalletId('cash_drawer')}
                    className={`h-12 rounded-2xl border-2 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                      walletId === 'cash_drawer'
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet size={16} />
                    <span>{isBengali ? 'নগদ ক্যাশ ড্রয়ার' : 'Cash Till'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWalletId('bkash_merchant')}
                    className={`h-12 rounded-2xl border-2 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                      walletId === 'bkash_merchant'
                        ? 'bg-gradient-to-r from-[#E2136E] to-[#B00F55] border-pink-600 text-white shadow-md shadow-pink-600/25'
                        : 'bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone size={16} />
                    <span>{isBengali ? 'বিকাশ মার্চেন্ট' : 'bKash MFS'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Note / Description Input */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                {isBengali ? 'হিসাব নোট / বিবরণ (ঐচ্ছিক):' : 'Note or Reference:'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isBengali ? 'যেমন: মেমো #১০১২ এর বাবদ...' : 'e.g. Against memo #1012...'}
                className="w-full h-12 text-sm font-bold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#E2136E] focus:ring-4 focus:ring-pink-500/10 transition shadow-2xs"
              />
            </div>

            {/* Helpful Helper Text */}
            <p className="text-xs text-slate-400 font-semibold hidden md:block">
              {isBengali 
                ? '💡 কিবোর্ড বা ডানদিকের নামপ্যাড দিয়ে সরাসরি টাকা লিখতে পারেন। এন্টার চাপলে সাবমিট হবে।' 
                : '💡 Type amount using keyboard or numpad. Press Enter to submit.'}
            </p>
          </div>

          {/* Right Column: Quick Chips, Tactile Keypad, & Submit Button */}
          <div className="space-y-3.5">
            
            {/* Quick Add Chips */}
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 5000, 10000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickAdd(chip)}
                  className="py-2.5 rounded-2xl bg-slate-50 hover:bg-pink-50 text-slate-800 hover:text-[#E2136E] text-xs font-black transition border-2 border-slate-200/80 hover:border-pink-300 shadow-2xs active:scale-95 cursor-pointer text-center"
                >
                  +{chip.toLocaleString(isBengali ? 'bn-BD' : 'en-US')}
                </button>
              ))}
            </div>

            {/* Tactile 3x4 Keypad (Keys 52px tall) */}
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setAmountStr((prev) => prev + digit)}
                  className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-pink-100 text-slate-800 font-black text-xl transition border-2 border-slate-200/80 shadow-2xs cursor-pointer active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider transition border-2 border-slate-200/80 cursor-pointer active:scale-95"
              >
                {isBengali ? 'মুছুন' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => setAmountStr((prev) => prev + '0')}
                className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-xl transition border-2 border-slate-200/80 shadow-2xs cursor-pointer active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setAmountStr((prev) => prev.slice(0, -1))}
                className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xl transition border-2 border-slate-200/80 cursor-pointer active:scale-95"
              >
                ⌫
              </button>
            </div>

            {/* Big 54px Tactile Submit Button */}
            <button
              type="button"
              onClick={handleCommit}
              disabled={!amountStr || parseInt(amountStr, 10) <= 0}
              className={`w-full h-14 rounded-2xl text-white font-black text-base shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                !amountStr || parseInt(amountStr, 10) <= 0
                  ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-60'
                  : isPabo
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-[#E2136E] via-[#D81B60] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-pink-600/30'
              }`}
            >
              <Check size={20} />
              <span>
                {isPabo 
                  ? (isBengali ? 'টাকা জমা নিশ্চিত করুন ✓' : 'Confirm Cash In ✓') 
                  : (isBengali ? 'বাকি বিক্রয় নিশ্চিত করুন ✓' : 'Confirm Due Credit ✓')}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
