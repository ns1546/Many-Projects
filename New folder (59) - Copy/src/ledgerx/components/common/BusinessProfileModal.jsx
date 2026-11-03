import React from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../context/TenantContext';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { BUSINESS_PROFILES, BUSINESS_TYPES } from '../../core/BusinessProfiles';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Wheat, 
  Pill, 
  Smartphone, 
  Hammer, 
  Shirt, 
  ShoppingCart, 
  Utensils,
  Layers,
  Sparkles,
  PackagePlus,
  Store,
  ShieldCheck,
  Zap,
  Glasses
} from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP = {
  Store: Store,
  Wheat: Wheat,
  Pill: Pill,
  Smartphone: Smartphone,
  Hammer: Hammer,
  Shirt: Shirt,
  ShoppingCart: ShoppingCart,
  Utensils: Utensils,
  Layers: Layers,
  Glasses: Glasses,
};

export default function BusinessProfileModal({ isOpen, onClose }) {
  const { activeTenant, changeBusinessType } = useTenant();
  const { loadIndustryCatalog, mergeIndustryCatalog } = useKhata();
  const { isBengali } = useLocale();

  if (!isOpen) return null;

  const currentType = activeTenant.businessType || 'GENERAL_RETAIL';

  const handleSelectProfile = (typeKey, mode = 'SWITCH_ONLY') => {
    changeBusinessType(typeKey);
    const profile = BUSINESS_PROFILES[typeKey];

    if (mode === 'REPLACE_CATALOG' && loadIndustryCatalog) {
      loadIndustryCatalog(typeKey);
    } else if (mode === 'MERGE_CATALOG' && mergeIndustryCatalog) {
      mergeIndustryCatalog(typeKey);
    }

    toast.success(
      isBengali 
        ? `ব্যবসার ধরণ সফলভাবে আপডেট হয়েছে: ${profile?.nameBn || typeKey}` 
        : `Business Type Updated: ${profile?.nameEn || typeKey}`,
      { icon: '🏬' }
    );
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[86vh] my-auto flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-pink-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2136E]/20 text-[#E2136E] flex items-center justify-center border border-[#E2136E]/40 shadow-sm">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  {isBengali ? 'বাংলাদেশের সকল ব্যবসার ধরণ ও আর্কিটেকচার কনফিগ' : 'Bangladesh Business Type & Industry Architecture'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold border border-pink-500/30">
                  ৮টি ইন্ডাস্ট্রি ও হাইব্রিড প্রোফাইল
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBengali 
                  ? 'আপনার দোকানের নির্দিষ্ট কাজের ধরণ অনুযায়ী পিওএস, চালান, একক ও হিসাব স্বয়ংক্রিয় সাজিয়ে নিন' 
                  : 'Tailor POS, Chalani, Units and Fields dynamically to your exact Bangladesh SME sector'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Safe Hybrid Conversion Callout */}
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-purple-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{isBengali ? 'দোকানে একাধিক ক্যাটাগরি বা মিশ্র পণ্য আছে?' : 'Have mixed categories or multi-department items?'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">HYBRID</span>
              </h4>
              <p className="text-xs text-purple-200 mt-0.5">
                {isBengali 
                  ? 'আপনার দোকানকে হাইব্রিড সুপারশপে রূপান্তর করুন—পূর্ববর্তী কোনো পণ্য, স্টক বা বকেয়া খাতা মুছবে না!' 
                  : 'Convert to Hybrid Store—zero data loss, all existing products and ledgers remain intact.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectProfile('HYBRID_DEPARTMENTAL', 'SWITCH_ONLY')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
          >
            <Zap size={14} className="fill-white text-white" />
            <span>{isBengali ? '🔄 হাইব্রিড মোডে রূপান্তর' : 'Convert to Hybrid'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.values(BUSINESS_PROFILES).map((prof) => {
              const isSelected = prof.id === currentType;
              const IconComp = ICON_MAP[prof.icon] || ShoppingCart;

              return (
                <div
                  key={prof.id}
                  onClick={() => handleSelectProfile(prof.id, 'SWITCH_ONLY')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#E2136E] bg-pink-50/40 shadow-md ring-2 ring-pink-500/20'
                      : 'border-slate-200/80 bg-white hover:border-pink-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#E2136E] text-white shadow-sm' : 'bg-slate-100 text-slate-700 group-hover:bg-pink-100 group-hover:text-[#E2136E]'
                        }`}>
                          <IconComp size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {isBengali ? prof.nameBn : prof.nameEn}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {prof.id}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-black text-[#E2136E] bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">
                          <CheckCircle2 size={13} />
                          সক্রিয়
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                      {prof.descriptionBn}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="font-bold text-slate-700">একক:</span>
                      <span className="truncate max-w-[150px]">
                        {prof.primaryUnits.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {prof.id === 'HYBRID_DEPARTMENTAL' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProfile(prof.id, 'MERGE_CATALOG');
                          }}
                          className="font-bold text-[11px] px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="বিদ্যমান পণ্যের সাথে হাইব্রিড নমুনা পণ্য যুক্ত করুন"
                        >
                          <PackagePlus size={12} className="text-purple-600" />
                          <span>নমুনা মার্জ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProfile(prof.id, 'REPLACE_CATALOG');
                          }}
                          className="font-bold text-[11px] px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] border border-pink-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="এই ব্যবসার নমুনা প্রোডাক্ট ক্যাটালগ লোড করুন"
                        >
                          <PackagePlus size={12} />
                          <span>নমুনা লোড</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProfile(prof.id, 'SWITCH_ONLY');
                        }}
                        className={`font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#E2136E] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'বর্তমান মোড' : 'সক্রিয় করুন'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            💡 টিপস: ব্যবসার ধরণ পরিবর্তন করলে পিওএস কাউন্টার ও গুদাম চালানের ইনপুট ফিল্ড স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
