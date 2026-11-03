import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/currency';
import { TrendingUp, AlertCircle, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export default function TrueProfitCard({
  grossSalesPoisha = 0,
  cogsPoisha = 0,
  expensesPoisha = 0,
  spoilagePoisha = 0,
  badDebtWaiverPoisha = 0,
  timeRangeLabel = ''
}) {
  const { isBengali } = useLocale();

  const safeSales = Number(grossSalesPoisha) || 0;
  const safeCogs = Number(cogsPoisha) || 0;
  const safeExpenses = Number(expensesPoisha) || 0;
  const safeSpoilage = Number(spoilagePoisha) || 0;
  const safeWaivers = Number(badDebtWaiverPoisha) || 0;

  const grossProfitPoisha = safeSales - safeCogs;
  const netProfitPoisha = grossProfitPoisha - safeExpenses - safeSpoilage - safeWaivers;
  const isProfitable = netProfitPoisha > 0;
  const netMarginPercent = safeSales > 0 ? ((netProfitPoisha / safeSales) * 100).toFixed(1) : '0.0';

  return (
    <div className="bkash-card p-5 border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/40">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              {isBengali ? 'বাস্তব নেট প্রফিট (True Net Profit)' : 'Realized True Net Profit'}
            </h3>
            <p className="text-[10px] text-gray-400">
              {isBengali ? 'দোকানের বিদ্যুৎ, ভাড়া, নষ্ট মাল ও ছাড়ের পর প্রকৃত লাভ' : 'Net profit after Rent, Bills, Damaged goods & Halkhata waivers'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 size={12} />
          {netMarginPercent}% {isBengali ? 'নেট মার্জিন' : 'Net Margin'}
        </span>
      </div>

      {/* Hero Profit Number */}
      <div className="mb-4 text-center py-2 bg-gray-50 rounded-2xl border border-gray-100">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
          {isBengali ? 'আপনার পকেটে আসল নগদ মুনাফা' : 'Actual Cash Profit In Pocket'}
        </span>
        <span
          className={`text-2xl font-black ${
            isProfitable ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {formatCurrency(netProfitPoisha, isBengali)}
        </span>
      </div>

      {/* Formula Breakdown Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center text-gray-600">
          <span>{isBengali ? '(+) মোট বিক্রয় (Gross Sales):' : '(+) Gross Sales:'}</span>
          <span className="font-bold text-gray-900">{formatCurrency(grossSalesPoisha, isBengali)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>{isBengali ? '(-) বিক্রিত পণ্যের কেনা খরচ (COGS):' : '(-) Cost of Goods Sold (COGS):'}</span>
          <span className="font-semibold text-rose-600">-{formatCurrency(cogsPoisha, isBengali)}</span>
        </div>

        <div className="flex justify-between items-center font-bold text-gray-800 pt-1 border-t border-gray-100">
          <span>{isBengali ? '(=) গ্রস মুনাফা (Gross Profit):' : '(=) Gross Profit:'}</span>
          <span className="text-emerald-700">{formatCurrency(grossProfitPoisha, isBengali)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>{isBengali ? '(-) দোকান খরচ (ভাড়া, বিদ্যুৎ, নাস্তা):' : '(-) Operating Overheads (Rent, Bills):'}</span>
          <span className="font-semibold text-rose-600">-{formatCurrency(expensesPoisha, isBengali)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>{isBengali ? '(-) নষ্ট বা পচা মালের ক্ষতি (Spoilage):' : '(-) Damaged / Spoiled Inventory:'}</span>
          <span className="font-semibold text-rose-600">-{formatCurrency(spoilagePoisha, isBengali)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>{isBengali ? '(-) হালখাতা বাকী মওকুফ (Bad Debt Waivers):' : '(-) Halkhata Debt Waivers:'}</span>
          <span className="font-semibold text-rose-600">-{formatCurrency(badDebtWaiverPoisha, isBengali)}</span>
        </div>
      </div>
    </div>
  );
}
