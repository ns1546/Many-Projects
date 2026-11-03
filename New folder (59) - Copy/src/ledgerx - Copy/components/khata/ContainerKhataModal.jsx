import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { Package, X, ArrowUpRight, ArrowDownLeft, Check, Plus, Minus } from 'lucide-react';

export default function ContainerKhataModal({ isOpen, onClose, customer }) {
  const { recordContainerMovement } = useKhata();
  const { isBengali } = useLocale();
  const [qty, setQty] = useState(1);
  const [containerType, setContainerType] = useState('EGG_CRATE');

  if (!isOpen || !customer) return null;

  const handleAction = (isIssue) => {
    if (qty <= 0) return;
    recordContainerMovement({
      customerId: customer.id,
      containerType,
      qty: Number(qty),
      isIssue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        
        {/* ── Modal Header ── */}
        <div className="px-8 py-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
              <Package size={24} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight leading-tight">
                {isBengali ? 'ফেরতযোগ্য ক্যারেট ও বস্তা খাতা' : 'Returnable Packaging Ledger'}
              </h3>
              <p className="text-xs text-amber-100 font-semibold mt-1">
                {isBengali ? 'খালি ক্যারেট প্রদান ও ফেরত হিসাব সংরক্ষণ' : 'Track issued and returned packaging items'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20"
            title="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-8 space-y-6 bg-white">
          
          {/* Outstanding Balance Hero Pill */}
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl border-2 border-amber-200/80 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-wider">{customer.name}</p>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                {isBengali ? 'গ্রাহকের নিকট বর্তমান বকেয়া খালি মাল' : 'Containers Currently Owed'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-900 tabular-nums">
                {customer.containersDueCount || 0}
              </span>
              <span className="text-sm font-black text-amber-700 ml-1.5">টি</span>
            </div>
          </div>

          {/* Container Type Selector */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'মালের ধরন নির্বাচন করুন' : 'Select Packaging Type'}
            </label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              className="w-full h-13 text-sm md:text-base font-bold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs cursor-pointer"
            >
              <option value="EGG_CRATE">{isBengali ? '🥚 ডিমের ক্যারেট (Egg Crate)' : 'Egg Crate'}</option>
              <option value="GAS_CYLINDER">{isBengali ? '🔥 গ্যাস সিলিন্ডার (LPG Cylinder)' : 'Gas Cylinder'}</option>
              <option value="JUTE_BAG">{isBengali ? '🌾 চালের চটের বস্তা (Jute Bag)' : 'Jute Bag'}</option>
              <option value="PLASTIC_BOX">{isBengali ? '🥤 কোমল পানীয়ের ক্রেট (Beverage Crate)' : 'Beverage Crate'}</option>
            </select>
          </div>

          {/* Quantity Stepper */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'পরিমাণ (সংখ্যা)' : 'Quantity (Units)'}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-14 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 font-black text-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="flex-1 h-13 text-center font-black text-2xl px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs tabular-nums"
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="w-14 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 font-black text-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Action Buttons: Issue vs Return */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => handleAction(true)}
              className="h-13 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-sm shadow-md shadow-rose-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight size={18} />
              <span>{isBengali ? 'ক্যারেট প্রদান (- দিলাম)' : 'Issue Packaging'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction(false)}
              className="h-13 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownLeft size={18} />
              <span>{isBengali ? 'ফেরত গ্রহণ (+ পেলাম)' : 'Return Packaging'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
