import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, parseToPoisha, poishaToTaka, takaToPoisha } from '../../utils/currency';
import { Clock, Check, X, TrendingUp, TrendingDown, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MorningRepricerModal({ isOpen, onClose }) {
  const { products, updateProductPrice } = useKhata();
  const { isBengali, formatNumber } = useLocale();

  // Local state for modified prices { productId: newPriceInTaka }
  const [priceMap, setPriceMap] = useState({});

  if (!isOpen) return null;

  const handlePriceChange = (productId, val) => {
    setPriceMap((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleSaveAll = () => {
    let updateCount = 0;
    Object.entries(priceMap).forEach(([id, newPriceTaka]) => {
      const poisha = takaToPoisha(parseFloat(newPriceTaka) || 0);
      if (poisha > 0) {
        updateProductPrice(id, poisha);
        updateCount++;
      }
    });

    toast.success(
      isBengali
        ? `${formatNumber(updateCount)} টি পণ্যের নতুন সকালের রেট আপডেট হয়েছে!`
        : `${updateCount} items updated with new morning market rates!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[88vh] overflow-hidden border border-slate-100 animate-in zoom-in-95">
        {/* Modal Top */}
        <div className="p-6 bg-gradient-to-r from-amber-50 via-rose-50/50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-black shadow-sm">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {isBengali ? '৬০-সেকেন্ড সকালের রেট আপডেট (পাইকারি বাজার)' : '60-Second Morning Market Repricer'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBengali
                  ? 'প্রতিদিনের বাজারদর অনুযায়ী সকল পণ্যের বিক্রয়মূল্য এক ক্লিকে হালনাগাদ করুন'
                  : 'Update daily volatile market selling rates for wholesale goods in one click'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="pb-3 pl-2">{isBengali ? 'পণ্যের নাম' : 'Product'}</th>
                <th className="pb-3 text-center">{isBengali ? 'একক' : 'Unit'}</th>
                <th className="pb-3 text-right">{isBengali ? 'ক্রয়মূল্য (৳)' : 'Cost (BDT)'}</th>
                <th className="pb-3 text-right">{isBengali ? 'বর্তমান দর (৳)' : 'Current (BDT)'}</th>
                <th className="pb-3 text-right pr-2 w-44">{isBengali ? 'আজকের রেট (৳)' : "Today's Rate (BDT)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const currentTaka = poishaToTaka(p.salePricePoisha);
                const costTaka = poishaToTaka(p.costPricePoisha);
                const newTaka = priceMap[p.id] !== undefined ? parseFloat(priceMap[p.id]) || 0 : currentTaka;
                const isHigher = newTaka > currentTaka;
                const isLower = newTaka < currentTaka;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900 pr-2">{p.name}</td>
                    <td className="py-3.5 text-center text-slate-500 font-semibold text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {p.unit || 'কেজি'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-slate-500 font-semibold tabular-nums">৳{costTaka.toFixed(2)}</td>
                    <td className="py-3.5 text-right font-bold text-slate-700 tabular-nums">৳{currentTaka.toFixed(2)}</td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                          <input
                            type="number"
                            step="0.5"
                            value={priceMap[p.id] !== undefined ? priceMap[p.id] : currentTaka}
                            onChange={(e) => handlePriceChange(p.id, e.target.value)}
                            className={`w-32 pl-7 pr-3 py-2 text-right font-black text-sm rounded-xl border-2 transition-all tabular-nums focus:outline-none ${
                              isHigher
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-100'
                                : isLower
                                ? 'border-rose-500 bg-rose-50/50 text-rose-800 ring-2 ring-rose-100'
                                : 'border-slate-200 bg-white text-slate-800 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10'
                            }`}
                          />
                        </div>
                        {isHigher && <TrendingUp size={16} className="text-emerald-600 shrink-0" />}
                        {isLower && <TrendingDown size={16} className="text-rose-600 shrink-0" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium flex-1">
            {isBengali ? '💡 পরিবর্তন করলে পিওএস মেমোতে নতুন রেট কার্যকর হবে' : '💡 Saved prices take immediate effect at checkout'}
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end pr-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/25 active:scale-95 cursor-pointer"
            >
              <Save size={16} />
              <span>{isBengali ? 'সকল নতুন রেট সেভ করুন' : 'Apply All Rates'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
