import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { formatCurrency, poishaToTaka } from '../../utils/currency';
import { buildDueReminderMessage, openWhatsAppDirect } from '../../utils/whatsapp';
import RiskBadge from '../common/RiskBadge';
import { Phone, MessageCircle, ArrowDownLeft, ArrowUpRight, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerCard({
  customer,
  onOpenPabo,
  onOpenDibo,
  onOpenContainers,
}) {
  const { t, locale, isBengali } = useLocale();
  const { activeTenant } = useTenant();

  const isDue = customer.currentDuePoisha > 0;
  const isAdvance = customer.currentDuePoisha < 0;

  const handleWhatsAppReminder = (e) => {
    e.stopPropagation();
    if (!customer.phone) {
      toast.error(isBengali ? 'গ্রাহকের মোবাইল নম্বর নেই!' : 'No phone number for customer!');
      return;
    }
    const message = buildDueReminderMessage({
      customerName: customer.name,
      shopName: activeTenant?.name,
      dueAmountTaka: poishaToTaka(customer.currentDuePoisha),
      bKashNumber: activeTenant?.bKashMerchantNumber,
    });
    openWhatsAppDirect(customer.phone, message);
    toast.success(isBengali ? 'হোয়াটসঅ্যাপে তাগাদা বার্তা পাঠানো হয়েছে!' : 'Reminder sent on WhatsApp!');
  };

  return (
    <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Customer Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-black text-lg flex items-center justify-center shrink-0 shadow-xs border border-slate-200 group-hover:bg-gradient-to-br group-hover:from-slate-900 group-hover:to-indigo-950 group-hover:text-white transition-all">
            {customer.name ? customer.name.charAt(0) : <User size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                {customer.name}
              </h3>
              <RiskBadge
                currentDuePoisha={customer.currentDuePoisha}
                creditLimitPoisha={customer.creditLimitPoisha}
                trustScore={customer.trustScore}
                locale={locale}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
              <Phone size={12} className="text-slate-400" /> {customer.phone || 'মোবাইল নেই'}
            </p>
            {customer.address && (
              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">📍 {customer.address}</p>
            )}

            {/* Container Loan Tag if customer owes containers */}
            {customer.containersDueCount > 0 && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenContainers(customer);
                }}
                className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200 hover:bg-amber-100 cursor-pointer"
                title="খালি ক্যারেট বা বস্তা হিসাব"
              >
                <Package size={11} />
                <span>বকেয়া ক্যারেট/বস্তা: {customer.containersDueCount}টি</span>
              </div>
            )}
          </div>
        </div>

        {/* Balance & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Current Due / Advance Balance Display */}
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isDue ? (isBengali ? 'বর্তমান বকেয়া' : 'Current Due') : (isBengali ? 'জমা ব্যালেন্স' : 'Advance Balance')}
            </p>
            <p
              className={`text-xl font-black tabular-nums tracking-tight ${
                isDue ? 'text-rose-600' : isAdvance ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {formatCurrency(customer.currentDuePoisha, { locale })}
            </p>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex items-center gap-2">
            {/* WhatsApp 1-Tap Reminder Button */}
            {isDue && (
              <button
                type="button"
                onClick={handleWhatsAppReminder}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-xs border border-emerald-200 cursor-pointer"
                title={t('btn_send_whatsapp')}
              >
                <MessageCircle size={16} />
              </button>
            )}

            {/* Green Pabo Button */}
            <button
              type="button"
              onClick={() => onOpenPabo(customer)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ArrowDownLeft size={14} />
              <span>{isBengali ? 'পেলাম' : 'Pabo'}</span>
            </button>

            {/* Red Dibo Button */}
            <button
              type="button"
              onClick={() => onOpenDibo(customer)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ArrowUpRight size={14} />
              <span>{isBengali ? 'দিলাম' : 'Dibo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
