import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { parseToPoisha, formatCurrency } from '../../utils/currency';
import { 
  Rocket, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Store, 
  Wallet, 
  Smartphone, 
  X,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductionModeModal({ isOpen, onClose }) {
  const { 
    isProductionMode, 
    startProductionMode, 
    purgeDemoData,
    resetToDemoMode,
    customers,
    suppliers,
    products,
    registers
  } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();

  const [openingCashTaka, setOpeningCashTaka] = useState('');
  const [openingBkashTaka, setOpeningBkashTaka] = useState('');
  const [confirmClean, setConfirmClean] = useState(false);
  const [showDemoResetConfirm, setShowDemoResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleStartProduction = (e) => {
    e.preventDefault();
    if (!confirmClean) {
      toast.error(isBengali ? 'অনুগ্রহ করে নিশ্চিতকরণ বক্সে টিক দিন!' : 'Please check the confirmation box!');
      return;
    }

    const openingCashPoisha = parseToPoisha(openingCashTaka || '0');
    const openingBkashPoisha = parseToPoisha(openingBkashTaka || '0');

    startProductionMode({
      openingCashPoisha,
      openingBkashPoisha,
    });

    onClose();
  };

  const handleResetToDemo = () => {
    resetToDemoMode();
    setShowDemoResetConfirm(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 max-h-[86vh] my-auto flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className={`p-5 text-white ${
          isProductionMode 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700' 
            : 'bg-gradient-to-r from-[#E2136E] to-rose-700'
        } flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              {isProductionMode ? <ShieldCheck size={22} className="text-emerald-300" /> : <Rocket size={22} className="text-yellow-300" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isProductionMode 
                  ? (isBengali ? '🟢 লাইভ প্রোডাকশন মোড সক্রিয়' : '🟢 Live Production Mode Active')
                  : (isBengali ? '🚀 প্রোডাকশন মোড কনফিগারেশন' : '🚀 Switch to Live Production')}
              </h3>
              <p className="text-[11px] text-white/80">
                {isProductionMode 
                  ? (isBengali ? 'আপনার আসল ব্যবসার ফ্রেশ খাতা' : 'Enterprise Live Store Data')
                  : (isBengali ? 'নমুনা ডাটা সরিয়ে আসল ব্যবসার খাতা শুরু করুন' : 'Replace demo items with clean real store')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {isProductionMode ? (
            /* Live Production Status & Options */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {isBengali ? 'সিস্টেম বর্তমানে ১০০% লাইভ মোডে চলছে' : 'System is currently in 100% Live Production Mode'}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {isBengali 
                      ? 'সমস্ত ডেমো/নমুনা মুছে ফেলা হয়েছে। এখন আপনি যা এন্ট্রি করবেন তা আপনার ব্যবসার স্থায়ী হিসাব হিসেবে থাকবে।'
                      : 'All demo fixtures removed. Every transaction entered here is saved to permanent local storage.'}
                  </p>
                </div>
              </div>

              {/* Live Store Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">{isBengali ? 'আসল গ্রাহক' : 'Customers'}</span>
                  <span className="text-base font-black text-gray-800">{customers.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">{isBengali ? 'আসল মহাজন' : 'Suppliers'}</span>
                  <span className="text-base font-black text-gray-800">{suppliers.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">{isBengali ? 'পণ্যের স্টক' : 'Products'}</span>
                  <span className="text-base font-black text-gray-800">{products.length}</span>
                </div>
              </div>

              {/* Action Buttons: Purge Remaining Demo & Reset to Demo */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(isBengali ? 'আপনি কি নিশ্চিত যে সমস্ত ডেমো ডাটা মুছে ফেলে সম্পূর্ণ ফ্রেশ লাইভ খাতা শুরু করতে চান?' : 'Are you sure you want to purge all demo data?')) {
                      purgeDemoData();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>{isBengali ? '🗑️ অবশিষ্ট ডেমো ডাটা সম্পূর্ণ মুছে ফেলুন (Purge)' : '🗑️ Purge All Remaining Demo Data'}</span>
                </button>

                {!showDemoResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDemoResetConfirm(true)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>{isBengali ? 'টেস্টিংয়ের জন্য নমুনা ডেমো মোডে ফেরত যান' : 'Switch back to Testing Demo Mode'}</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-xs text-amber-900 font-bold">
                      {isBengali ? 'আপনি কি ডেমো মোডে ফেরত যেতে চান?' : 'Confirm switch to Demo Mode?'}
                    </p>
                    <p className="text-[11px] text-amber-700">
                      {isBengali ? 'ডেমো মোডে নমুনা পণ্য ও কাস্টমার দিয়ে আপনি অ্যাপের ফিচারগুলো পরীক্ষা করতে পারেন।' : 'Demo mode populates sample customers and products for testing.'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDemoResetConfirm(false)}
                        className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                      >
                        {isBengali ? 'না, প্রোডাকশনেই থাকুন' : 'Stay Live'}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetToDemo}
                        className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                      >
                        {isBengali ? 'হ্যাঁ, ডেমোতে যান' : 'Go to Demo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* First-Run Setup to Go Live */
            <form onSubmit={handleStartProduction} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-pink-50 border border-pink-100 text-xs text-gray-700 flex items-start gap-2">
                <Store size={18} className="text-[#E2136E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">{activeTenant?.name || 'আমার দোকান'}</p>
                  <p className="text-[11px] text-gray-600">
                    {isBengali 
                      ? 'প্রোডাকশন মোড চালু করলে সকল ডামি স্যাম্পল গ্রাহক ও পণ্য মুছে আপনার ফ্রেশ রিয়েল খাতা শুরু হবে।'
                      : 'Activating production mode wipes demo test records and sets up clean live accounting.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                  <Wallet size={14} className="text-emerald-600" />
                  <span>{isBengali ? 'ক্যাশবাক্সে বর্তমান নগদ টাকা (Opening Cash ৳)' : 'Opening Cash Drawer Float (BDT)'}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={openingCashTaka}
                  onChange={(e) => setOpeningCashTaka(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-bold text-gray-800 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                  <Smartphone size={14} className="text-[#E2136E]" />
                  <span>{isBengali ? 'বিকাশ মার্চেন্ট ব্যালেন্স (Opening bKash ৳)' : 'Opening bKash Merchant (BDT)'}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={openingBkashTaka}
                  onChange={(e) => setOpeningBkashTaka(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-bold text-gray-800 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmClean}
                  onChange={(e) => setConfirmClean(e.target.checked)}
                  className="mt-0.5 accent-[#E2136E] w-4 h-4 rounded"
                />
                <span className="text-xs font-medium text-gray-700">
                  {isBengali 
                    ? 'আমি নিশ্চিত যে আমি নমুনা ডাটা মুছে আমার আসল ব্যবসার হিসাব শুরু করতে চাই।'
                    : 'I confirm wiping sample demo fixtures and initializing a clean live enterprise store.'}
                </span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E2136E] hover:bg-[#C2105C] shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5 transition"
                >
                  <Rocket size={15} />
                  <span>{isBengali ? 'প্রোডাকশন মোড চালু' : 'Start Live Store'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
