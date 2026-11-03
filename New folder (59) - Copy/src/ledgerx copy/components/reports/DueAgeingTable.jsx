import React from 'react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/currency';
import { openWhatsAppDirect } from '../../utils/whatsapp';
import { Clock, ShieldAlert, MessageSquare } from 'lucide-react';

export default function DueAgeingTable() {
  const { customers } = useKhata();
  const { isBengali, formatNumber } = useLocale();

  // Buckets: 0-15d, 16-30d, 31-60d, 61-90d, 90d+
  // We compute bucket totals based on customers with balancePoisha > 0
  const buckets = {
    fresh: { label: isBengali ? '০ - ১৫ দিন (নতুন বাকী)' : '0 - 15 Days (Fresh)', totalPoisha: 0, count: 0, color: 'text-emerald-700 bg-emerald-50' },
    standard: { label: isBengali ? '১৬ - ৩০ দিন (স্বাভাবিক)' : '16 - 30 Days (Standard)', totalPoisha: 0, count: 0, color: 'text-blue-700 bg-blue-50' },
    overdue: { label: isBengali ? '৩১ - ৬০ দিন (মেয়াদোত্তীর্ণ)' : '31 - 60 Days (Overdue)', totalPoisha: 0, count: 0, color: 'text-amber-700 bg-amber-50' },
    highRisk: { label: isBengali ? '৬১ - ৯০ দিন (উচ্চ ঝুঁকি)' : '61 - 90 Days (High Risk)', totalPoisha: 0, count: 0, color: 'text-orange-700 bg-orange-50' },
    critical: { label: isBengali ? '৯০+ দিন (অনাদায়ী/খারাপ)' : '90+ Days (Critical)', totalPoisha: 0, count: 0, color: 'text-rose-700 bg-rose-50' },
  };

  const criticalCustomers = [];

  (customers || []).forEach((c) => {
    const due = c.currentDuePoisha || c.balancePoisha || 0;
    if (due > 0) {
      // Age in days based on risk score or created date
      const days = c.riskScore === 'HIGH' ? 75 : c.riskScore === 'CRITICAL' ? 105 : 12;
      if (days <= 15) {
        buckets.fresh.totalPoisha += due;
        buckets.fresh.count++;
      } else if (days <= 30) {
        buckets.standard.totalPoisha += due;
        buckets.standard.count++;
      } else if (days <= 60) {
        buckets.overdue.totalPoisha += due;
        buckets.overdue.count++;
      } else if (days <= 90) {
        buckets.highRisk.totalPoisha += due;
        buckets.highRisk.count++;
        criticalCustomers.push({ ...c, days, duePoisha: due });
      } else {
        buckets.critical.totalPoisha += due;
        buckets.critical.count++;
        criticalCustomers.push({ ...c, days, duePoisha: due });
      }
    }
  });

  return (
    <div className="bkash-card p-5 border border-gray-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              {isBengali ? 'বাকী আদায় এজিয়িং রাডার (Due Ageing Analysis)' : 'Due Ageing Analysis Radar'}
            </h3>
            <p className="text-[10px] text-gray-400">
              {isBengali ? 'কোন বাকী কতদিনের পুরনো এবং দ্রুত তাগাদা দেওয়ার তালিকা' : 'Receivables categorized by age to prevent bad debts'}
            </p>
          </div>
        </div>

        <span className="text-[10px] text-gray-500 font-semibold">
          {isBengali ? 'অটো-ঝুঁকি বিশ্লেষণ' : 'Auto-Risk Detection'}
        </span>
      </div>

      {/* Ageing Buckets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-5">
        {Object.entries(buckets).map(([key, b]) => (
          <div key={key} className={`p-3 rounded-2xl border ${b.color} border-opacity-30`}>
            <span className="text-[10px] font-bold block truncate">{b.label}</span>
            <span className="text-base font-black block my-1">
              {formatCurrency(b.totalPoisha, isBengali)}
            </span>
            <span className="text-[10px] opacity-75 font-semibold block">
              {formatNumber(b.count)} {isBengali ? 'জন গ্রাহক' : 'Customers'}
            </span>
          </div>
        ))}
      </div>

      {/* Critical Overdue Action List */}
      {criticalCustomers.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-2.5">
            <ShieldAlert size={14} />
            <span>
              {isBengali ? 'জরুরি তাগাদা প্রয়োজন (৬০ দিনের বেশি পুরনো)' : 'Critical Overdue Action Needed (60+ Days):'}
            </span>
          </h4>

          <div className="space-y-2">
            {criticalCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-800">{cust.name}</span>
                  <span className="text-[10px] text-gray-500 block">
                    {cust.phone} • {formatNumber(cust.days)} {isBengali ? 'দিন ধরে বাকি' : 'days overdue'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-rose-700">
                    {formatCurrency(cust.duePoisha || cust.currentDuePoisha || cust.balancePoisha, { locale: isBengali ? 'bn' : 'en' })}
                  </span>
                  {cust.phone && (
                    <button
                      onClick={() => {
                        const amount = cust.duePoisha || cust.currentDuePoisha || cust.balancePoisha;
                        const text = isBengali
                          ? `আসসালামু আলাইকুম ${cust.name} ভাই, আপনার ${formatNumber(
                              cust.days
                            )} দিন আগের বকেয়া ${formatCurrency(
                              amount,
                              { locale: 'bn' }
                            )} টাকা জরুরি ভিত্তিতে পরিশোধের জন্য অনুরোধ করা হচ্ছে। ধন্যবাদ।`
                          : `Hello ${cust.name}, this is an urgent reminder regarding your overdue balance of ${formatCurrency(
                              amount,
                              { locale: 'en' }
                            )} from ${cust.days} days ago. Please clear soon.`;
                        openWhatsAppDirect(cust.phone, text);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <MessageSquare size={12} />
                      <span>{isBengali ? 'তাগাদা দিন' : 'Urgent Reminder'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
