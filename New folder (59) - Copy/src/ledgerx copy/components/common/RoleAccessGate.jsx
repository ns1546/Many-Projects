import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { useOperatingMode } from '../../context/OperatingModeContext';
import { ShieldAlert, Lock, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RoleAccessGate({ titleBn, titleEn, requiredRole = 'মালিক বা ম্যানেজার', children }) {
  const navigate = useNavigate();
  const { userRole, isCashier, verifyOwnerPin, switchRoleWithPin, ROLES } = useTenant();
  const { isBengali } = useLocale();
  const { isEasyMode } = useOperatingMode();

  const [pinInput, setPinInput] = useState('');
  const [isUnlockedForSession, setIsUnlockedForSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // In Easy Mode or if user is owner/manager or unlocked, grant direct access
  if (isEasyMode || !isCashier || isUnlockedForSession) {
    return <>{children}</>;
  }

  const handleUnlock = (e) => {
    e.preventDefault();
    if (verifyOwnerPin(pinInput)) {
      setIsUnlockedForSession(true);
      setErrorMsg('');
      toast.success('পিন সঠিক! সাময়িকভাবে এক্সেস প্রদান করা হয়েছে।', { icon: '🔓' });
    } else {
      setErrorMsg(isBengali ? 'ভুল সিকিউরিটি পিন! সঠিক ৪-সংখ্যার পিন দিন।' : 'Incorrect PIN! Please enter valid 4-digit Owner PIN.');
      toast.error('ভুল পিন নম্বর!');
    }
  };

  const handleSwitchToOwner = () => {
    if (verifyOwnerPin(pinInput)) {
      const res = switchRoleWithPin(ROLES.OWNER, pinInput);
      if (res.success) {
        toast.success('দোকান মালিক মোড সক্রিয় হয়েছে!', { icon: '👑' });
      }
    } else {
      setErrorMsg(isBengali ? 'মালিক মোড চালুর জন্য সঠিক পিন দিন।' : 'Enter valid Owner PIN to switch.');
      toast.error('ভুল পিন নম্বর!');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white text-center relative">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock size={30} />
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {isBengali ? 'সংরক্ষিত বিভাগ — প্রবেশাধিকার সীমিত' : 'Restricted Section'}
          </h2>
          <p className="text-xs text-rose-200/80 mt-1">
            {isBengali
              ? `এই বিভাগটি (${titleBn || 'গোপনীয় তথ্য'}) শুধুমাত্র ${requiredRole} দেখতে পারবেন`
              : `This section is restricted to ${requiredRole}`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed font-medium">
              {isBengali ? (
                <>
                  আপনি বর্তমানে <span className="font-black bg-amber-200 px-1.5 py-0.5 rounded">ক্যাশিয়ার</span> মোডে আছেন।
                  দোকানের গোপনীয় হিসাব, মহাজনদের দেনা ও লাভ-ক্ষতির তথ্য ক্যাশিয়ারের জন্য লক করা থাকে।
                </>
              ) : (
                'You are currently logged in as Cashier. Back-office debt and reports are locked.'
              )}
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                {isBengali ? 'দোকান মালিকের ৪-সংখ্যার সিকিউরিটি পিন দিন' : 'Enter 4-Digit Owner Security PIN'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="ডিফল্ট পিন: 1234"
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-[#E2136E] focus:outline-none transition bg-slate-50 focus:bg-white"
                  autoFocus
                />
                <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={!pinInput.trim()}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:opacity-95 text-white font-black text-sm shadow-md shadow-pink-600/30 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {isBengali ? 'আনলক করুন' : 'Unlock Access'}
              </button>

              <button
                type="button"
                onClick={handleSwitchToOwner}
                disabled={!pinInput.trim()}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm shadow-md active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👑</span>
                <span>{isBengali ? 'মালিক মোড অন' : 'Switch to Owner'}</span>
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{isBengali ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">LedgerX Security Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
