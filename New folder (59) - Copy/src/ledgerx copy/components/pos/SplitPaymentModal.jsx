import React, { useState, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, takaToPoisha, poishaToTaka } from '../../utils/currency';
import { X, Check, Wallet, Smartphone, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchableCustomerSelect from '../common/SearchableCustomerSelect';

export default function SplitPaymentModal({
  isOpen,
  onClose,
  grandTotalPoisha,
  customers = [],
  onConfirmSale,
}) {
  const { t, isBengali, locale } = useLocale();

  const [cashTaka, setCashTaka] = useState('');
  const [bkashTaka, setBkashTaka] = useState('');
  const [dueTaka, setDueTaka] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const totalTaka = poishaToTaka(grandTotalPoisha);

  // Initialize with full cash by default
  useEffect(() => {
    if (isOpen) {
      setCashTaka(String(totalTaka));
      setBkashTaka('0');
      setDueTaka('0');
      setSelectedCustomerId('');
    }
  }, [isOpen, totalTaka]);

  if (!isOpen) return null;

  const currentCash = parseFloat(cashTaka || '0');
  const currentBkash = parseFloat(bkashTaka || '0');
  const currentDue = parseFloat(dueTaka || '0');
  const sumPaid = currentCash + currentBkash + currentDue;
  const difference = totalTaka - sumPaid;

  const isValid = Math.abs(difference) < 0.01;

  const handleAutoFillCash = () => {
    setCashTaka(String(Math.max(0, totalTaka - currentBkash - currentDue)));
  };

  const handleAutoFillBkash = () => {
    setBkashTaka(String(Math.max(0, totalTaka - currentCash - currentDue)));
  };

  const handleAutoFillDue = () => {
    setDueTaka(String(Math.max(0, totalTaka - currentCash - currentBkash)));
  };

  const handleCommit = () => {
    if (!isValid) return;
    if (currentDue > 0 && !selectedCustomerId) {
      toast.error(isBengali ? 'বাকি বিক্রয়ের ক্ষেত্রে কাস্টমার নির্বাচন করুন!' : 'Please select a customer for due sales!');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

    onConfirmSale({
      cashPoisha: takaToPoisha(currentCash),
      bkashPoisha: takaToPoisha(currentBkash),
      dueAmountPoisha: takaToPoisha(currentDue),
      paidAmountPoisha: takaToPoisha(currentCash + currentBkash),
      customerId: selectedCustomerId || null,
      customerName: selectedCustomer?.name || (isBengali ? 'নগদ ক্রেতা' : 'Walk-in Cash Customer'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-100 text-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header - Fixed/Sticky */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Wallet size={20} />
            </span>
            <div>
              <h3 className="font-black text-lg text-slate-900 leading-tight">
                {isBengali ? 'স্প্লিট পেমেন্ট ও খাতা সমন্বয়' : 'Split Payment & Multi-Wallet'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBengali ? 'নগদ ক্যাশ, বিকাশ মার্চেন্ট ও বাকির সমন্বিত হিসাব' : 'Cash, bKash & Customer Due Split'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {/* Grand Total Hero Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-center text-white shadow-md">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">
              {t('pos_grand_total')}
            </p>
            <h2 className="text-3xl font-black text-white mt-1 tabular-nums">
              {formatCurrency(grandTotalPoisha, { locale })}
            </h2>
          </div>

          {/* 3 Payment Split Inputs */}
          <div className="space-y-3">
            {/* 1. Cash Input */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 transition">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <Wallet size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 block mb-0.5">{t('wallet_cash')}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-black text-lg">৳</span>
                  <input
                    type="number"
                    step="any"
                    value={cashTaka}
                    onChange={(e) => setCashTaka(e.target.value)}
                    className="w-full text-lg font-black bg-transparent focus:outline-none tabular-nums text-emerald-800"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillCash}
                className="text-xs text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-xl font-bold transition cursor-pointer active:scale-95 shrink-0"
              >
                {isBengali ? 'বাকিটুকু নগদ' : 'Auto-Fill'}
              </button>
            </div>

            {/* 2. bKash Input */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/50 border border-pink-200 transition">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E2136E] flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 block mb-0.5">{t('wallet_bkash')}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E2136E] font-black text-lg">৳</span>
                  <input
                    type="number"
                    step="any"
                    value={bkashTaka}
                    onChange={(e) => setBkashTaka(e.target.value)}
                    className="w-full text-lg font-black bg-transparent focus:outline-none tabular-nums text-[#E2136E]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillBkash}
                className="text-xs text-[#E2136E] bg-pink-100 hover:bg-pink-200 px-3 py-2 rounded-xl font-bold transition cursor-pointer active:scale-95 shrink-0"
              >
                {isBengali ? 'বাকিটুকু বিকাশ' : 'Auto-Fill'}
              </button>
            </div>

            {/* 3. Due (Baki) Input */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-200 transition">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 block mb-0.5">
                  {isBengali ? 'বাকি (কাস্টমার খাতা)' : 'Due (Credit Khata)'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-700 font-black text-lg">৳</span>
                  <input
                    type="number"
                    step="any"
                    value={dueTaka}
                    onChange={(e) => setDueTaka(e.target.value)}
                    className="w-full text-lg font-black bg-transparent focus:outline-none tabular-nums text-rose-700"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillDue}
                className="text-xs text-rose-800 bg-rose-100 hover:bg-rose-200 px-3 py-2 rounded-xl font-bold transition cursor-pointer active:scale-95 shrink-0"
              >
                {isBengali ? 'বাকিটুকু খাতা' : 'Auto-Fill'}
              </button>
            </div>
          </div>

          {/* Customer Selector (Required if Due > 0) */}
          {currentDue > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 animate-in fade-in">
              <label className="text-xs font-bold text-rose-900 block mb-1.5">
                {isBengali ? 'বাকি কার হিসাবে যুক্ত হবে? (কাস্টমার নির্বাচন করুন):' : 'Select Customer for Credit Due:'}
              </label>
              <SearchableCustomerSelect
                customers={customers}
                value={selectedCustomerId}
                onChange={(id) => setSelectedCustomerId(id)}
                placeholder={isBengali ? '-- কাস্টমার নির্বাচন বা সার্চ করুন --' : '-- Search or Select Customer --'}
                isBengali={isBengali}
              />
            </div>
          )}

          {/* Validation Error / Difference Indicator */}
          {!isValid && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span>
                {difference > 0
                  ? `${isBengali ? 'আরও বাকি আছে:' : 'Remaining:'} ৳ ${difference.toFixed(2)}`
                  : `${isBengali ? 'অতিরিক্ত দেওয়া হয়েছে:' : 'Overpaid:'} ৳ ${Math.abs(difference).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Button Footer - Fixed/Sticky at Bottom */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 rounded-b-3xl">
          <button
            type="button"
            onClick={handleCommit}
            disabled={!isValid}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm sm:text-base shadow-lg shadow-slate-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            <span>{isBengali ? 'পেমেন্ট নিশ্চিত ও রসিদ প্রিন্ট' : 'Confirm Payment & Print'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
