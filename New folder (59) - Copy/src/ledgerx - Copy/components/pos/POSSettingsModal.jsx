import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import {
  SlidersHorizontal,
  X,
  Receipt,
  Keyboard,
  PauseCircle,
  Sparkles,
  Percent,
  Check,
  ShieldCheck,
  Trash2,
  RefreshCw,
  HelpCircle,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function POSSettingsModal({
  isOpen,
  onClose,
  onOpenHistory,
  onOpenShortcuts,
  onOpenHeldCarts,
  onOpenHotProducts,
  vatRate = 5,
  setVatRate,
  isVatEnabled = false,
  setIsVatEnabled,
  isRoundingEnabled = true,
  setIsRoundingEnabled,
  isSpeedBarVisible = false,
  setIsSpeedBarVisible,
  speedProducts = [],
  onSelectSpeedProduct,
}) {
  const { isBengali } = useLocale();
  const { activeTenant } = useTenant();

  if (!isOpen) return null;

  const handleVatChange = (rate, enabled = true) => {
    setVatRate(rate);
    setIsVatEnabled(enabled);
    try {
      localStorage.setItem(
        `ledgerx_${activeTenant?.id}_pos_vat_config`,
        JSON.stringify({ enabled, rate })
      );
      toast.success(
        isBengali
          ? enabled ? `ভ্যাট ${rate}% সক্রিয় করা হয়েছে` : 'ভ্যাট নিষ্ক্রিয় করা হয়েছে'
          : enabled ? `VAT ${rate}% enabled` : 'VAT disabled',
        { icon: '🏷️' }
      );
    } catch (e) {}
  };

  const vatOptions = [
    { label: isBengali ? '০% (ভ্যাট নেই)' : '0% (No VAT)', rate: 0, enabled: false },
    { label: isBengali ? '৫% (রিটেল)' : '5% (Retail)', rate: 5, enabled: true },
    { label: isBengali ? '৭.৫% (বিশেষ)' : '7.5% (Special)', rate: 7.5, enabled: true },
    { label: isBengali ? '১৫% (স্ট্যান্ডার্ড মূসক)' : '15% (Mushak)', rate: 15, enabled: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/15">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg leading-tight">
                {isBengali ? 'পিওএস কাউন্টার সেটিংস ও টুলস' : 'POS Terminal Settings & Tools'}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {isBengali ? 'ভ্যাট, স্পিড বার, শর্টকাট ও বিক্রয় হিস্ট্রি' : 'VAT, speed bar, shortcuts & sales history'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Operations Strip */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block mb-2.5">
              {isBengali ? 'জরুরি পিওএস ফাংশন' : 'Quick Actions'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Sales History Trigger */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-9 h-9 rounded-xl bg-pink-100 text-[#E2136E] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Receipt size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {isBengali ? 'বিক্রয় হিস্ট্রি' : 'Sales History'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isBengali ? 'রসিদ ও মেমো রি-প্রিন্ট' : 'Invoices & Reprints'}
                  </p>
                </div>
              </button>

              {/* Hotkeys Trigger */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShortcuts();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Keyboard size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {isBengali ? 'হট-কি সহায়িকা (F1)' : 'Hotkeys Guide (F1)'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isBengali ? 'F1-F12 শর্টকাট তালিকা' : 'Keybindings Matrix'}
                  </p>
                </div>
              </button>

              {/* Held Carts Trigger */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHeldCarts();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <PauseCircle size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {isBengali ? 'হোল্ড বিল তালিকা' : 'Held Carts'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isBengali ? 'পার্ক করা বিল পুনরুদ্ধার' : 'Recall Parked Bills'}
                  </p>
                </div>
              </button>

              {/* Speed Bar Trigger */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHotProducts();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {isBengali ? 'হট-প্রোডাক্টস স্পিড বার' : 'Hot-Products Bar'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isBengali ? 'স্পিড ডায়াল পণ্য সাজান' : 'Configure Speed Dial'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ⚡ Hot-Keys Speed Bar (1-9) Section inside POS Settings */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs">
                  ⚡
                </span>
                <div>
                  <h4 className="text-xs font-black text-amber-950">
                    {isBengali ? 'হট-কী স্পিড বার (১-৯)' : 'Hot-Keys Speed Bar (1-9)'}
                  </h4>
                  <p className="text-[10px] text-amber-800 font-medium">
                    {isBengali ? 'কীবোর্ডের ১-৯ নম্বর চাপলে এই পণ্যগুলো সরাসরি বিক্রি হবে' : 'Pressing 1-9 rings up these items instantly'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHotProducts();
                }}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <Sparkles size={12} className="text-amber-600" />
                <span>{isBengali ? '⚙️ সাজান' : '⚙️ Config'}</span>
              </button>
            </div>

            {/* Quick 1-9 Slots Matrix */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
              {speedProducts.map(({ slot, product }) => {
                if (product) {
                  const isStockOut = (product.currentStockInBaseUnit ?? product.stock ?? 0) <= 0;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onSelectSpeedProduct && onSelectSpeedProduct(product)}
                      className={`flex flex-col items-start p-1.5 rounded-xl border shadow-2xs transition text-left group min-w-0 ${
                        isStockOut
                          ? 'bg-slate-100/90 border-slate-200 opacity-60'
                          : 'bg-white hover:bg-amber-50 border-amber-200/90 hover:border-amber-400 cursor-pointer active:scale-95'
                      }`}
                      title={`স্লট [${slot}]: ${product.name}`}
                    >
                      <div className="w-full flex items-center justify-between mb-0.5">
                        <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center font-mono shrink-0 ${
                          isStockOut ? 'bg-slate-400 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {slot}
                        </span>
                        <span className={`text-[9px] font-mono truncate ${isStockOut ? 'text-rose-600 font-bold' : 'font-black text-emerald-700'}`}>
                          {isStockOut ? 'শেষ' : `৳${Math.round((product.sellingPriceBasePoisha || 0) / 100)}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 truncate w-full">
                        {product.name}
                      </span>
                    </button>
                  );
                }
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenHotProducts();
                    }}
                    className="flex flex-col items-center justify-center p-1 rounded-xl bg-white/60 hover:bg-white border border-dashed border-amber-300 text-slate-400 hover:text-amber-700 transition cursor-pointer min-h-[42px]"
                    title={`স্লট ${slot} খালি`}
                  >
                    <span className="text-[9px] font-mono font-bold text-slate-400">{slot}</span>
                    <span className="text-[8px] text-slate-400">{isBengali ? 'খালি' : 'Empty'}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Screen Toggle Option */}
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-950">
                  {isBengali ? 'পিওএস প্রধান কাউন্টারে স্পিড বার দেখান' : 'Show Speed Bar on Main POS Counter'}
                </p>
                <p className="text-[10px] text-amber-800/80 font-medium">
                  {isBengali ? 'চালু থাকলে সার্চ বারের উপরে ১-৯ স্ট্রিপ দৃশ্যমান থাকবে' : 'When enabled, the 1-9 speed strip stays visible on the counter'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpeedBarVisible}
                  onChange={(e) => setIsSpeedBarVisible && setIsSpeedBarVisible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* VAT & Tax Configuration Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent size={16} className="text-emerald-700" />
                <span className="text-xs font-black text-slate-900">
                  {isBengali ? 'পিওএস ভ্যাট ও মূসক নির্ধারণ (VAT Rate)' : 'POS VAT & Tax Rate'}
                </span>
              </div>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isVatEnabled && vatRate > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {isVatEnabled && vatRate > 0 ? `${vatRate}% সক্রিয়` : (isBengali ? 'ভ্যাট বন্ধ' : 'VAT Off')}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {isBengali
                ? 'আপনার ব্যবসার ধরন অনুযায়ী পিওএস বিলে ভ্যাট হার নির্বাচন করুন। মুদির ক্ষেত্রে ভ্যাট বন্ধ রাখতে পারেন।'
                : 'Select the standard VAT rate to be applied on POS bills. Defaults to 0% if disabled.'}
            </p>

            {/* VAT Rate Selection Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {vatOptions.map((opt) => {
                const isSelected = (!opt.enabled && !isVatEnabled) || (opt.enabled && isVatEnabled && vatRate === opt.rate);
                return (
                  <button
                    key={opt.rate}
                    type="button"
                    onClick={() => handleVatChange(opt.rate, opt.enabled)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check size={13} className="text-emerald-400" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Bill Rounding Setting */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isBengali ? 'বিল পূর্ণ টাকায় রাউন্ডিং (Rounding to ৳1)' : 'Auto Rounding to Full Taka'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {isBengali ? 'পয়সা পরিহার করে নগদ কাউন্টারে পূর্ণ টাকায় হিসাব রাখে' : 'Eliminates poisha fractions for fast cash handling'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRoundingEnabled}
                onChange={(e) => setIsRoundingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {isBengali ? 'সম্পন্ন ✓' : 'Done ✓'}
          </button>
        </div>

      </div>
    </div>
  );
}
