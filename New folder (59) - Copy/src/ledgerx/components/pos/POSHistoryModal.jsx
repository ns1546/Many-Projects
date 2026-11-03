import React, { useState, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { formatCurrency, poishaToTaka } from '../../utils/currency';
import {
  Receipt,
  Search,
  X,
  Printer,
  Calendar,
  User,
  ShoppingBag,
  CreditCard,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function POSHistoryModal({ isOpen, onClose, onReprintThermal, onReprintMushak }) {
  const { invoices = [] } = useKhata();
  const { isBengali } = useLocale();
  const { activeTenant } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'CASH' | 'MFS' | 'BANK' | 'DUE'
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // Filtered and Sorted POS Invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || [])
      .filter((inv) => {
        // Payment Mode Filter
        if (selectedFilter === 'CASH' && inv.paymentMode !== 'CASH' && !(inv.paymentBreakdown?.cashPoisha > 0)) return false;
        if (selectedFilter === 'MFS' && !['BKASH', 'NAGAD', 'ROCKET', 'MFS'].includes(inv.paymentMode) && !(inv.paymentBreakdown?.bkashPoisha > 0)) return false;
        if (selectedFilter === 'BANK' && inv.paymentMode !== 'BANK' && inv.paymentMode !== 'CARD') return false;
        if (selectedFilter === 'DUE' && (inv.dueAmountPoisha || 0) <= 0 && inv.paymentMode !== 'DUE') return false;

        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const idMatch = (inv.id || '').toLowerCase().includes(q);
          const custMatch = (inv.customerName || '').toLowerCase().includes(q);
          const phoneMatch = (inv.customerPhone || '').toLowerCase().includes(q);
          const amtTaka = poishaToTaka(inv.grandTotalPoisha || 0).toString();
          const amtMatch = amtTaka.includes(q);
          const itemMatch = (inv.items || []).some((item) => (item.name || '').toLowerCase().includes(q));
          return idMatch || custMatch || phoneMatch || amtMatch || itemMatch;
        }

        return true;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [invoices, selectedFilter, searchQuery]);

  // Aggregate stats for filtered invoices
  const summary = useMemo(() => {
    let totalSalesPoisha = 0;
    let totalCashPoisha = 0;
    let totalDigitalPoisha = 0;
    let totalDuePoisha = 0;

    (filteredInvoices || []).forEach((inv) => {
      totalSalesPoisha += (inv.grandTotalPoisha || 0);
      totalCashPoisha += (inv.paymentBreakdown?.cashPoisha ?? inv.cashPoisha ?? (inv.paymentMode === 'CASH' ? inv.grandTotalPoisha : 0));
      totalDigitalPoisha += (inv.paymentBreakdown?.bkashPoisha ?? inv.bkashPoisha ?? (['BKASH', 'NAGAD', 'ROCKET', 'BANK'].includes(inv.paymentMode) ? inv.grandTotalPoisha : 0));
      totalDuePoisha += (inv.dueAmountPoisha || 0);
    });

    return {
      count: filteredInvoices?.length || 0,
      totalSalesPoisha,
      totalCashPoisha,
      totalDigitalPoisha,
      totalDuePoisha,
    };
  }, [filteredInvoices]);

  const toggleExpand = (id) => {
    setExpandedInvoiceId((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Receipt size={22} />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {isBengali ? 'পিওএস বিক্রয় হিস্ট্রি ও মেমো ট্র্যাকিং' : 'POS Sales History & Invoice Archive'}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {isBengali ? 'প্রতিটি বিক্রয়ের পূর্ণাঙ্গ তালিকা, পণ্য বিবরণ ও রসিদ রি-প্রিন্ট' : 'Comprehensive retail sales ledger with itemized breakdown and reprints'}
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

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট মেমো</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{summary.count} টি</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট বিক্রয়</span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{formatCurrency(summary.totalSalesPoisha, isBengali)}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">নগদ আদায়</span>
            <p className="text-xl font-black text-blue-600 mt-0.5">{formatCurrency(summary.totalCashPoisha, isBengali)}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">বকেয়া বাকি</span>
            <p className="text-xl font-black text-rose-600 mt-0.5">{formatCurrency(summary.totalDuePoisha, isBengali)}</p>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBengali ? 'রসিদ নং, গ্রাহকের নাম, ফোন নম্বর বা পণ্যের নাম দিয়ে খুঁজুন...' : 'Search by Invoice ID, customer, phone, or product...'}
              className="w-full text-xs font-semibold pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: isBengali ? 'সকল' : 'All' },
              { id: 'CASH', label: isBengali ? 'নগদ' : 'Cash' },
              { id: 'MFS', label: isBengali ? 'বিকাশ/MFS' : 'bKash/MFS' },
              { id: 'BANK', label: isBengali ? 'ব্যাংক' : 'Bank' },
              { id: 'DUE', label: isBengali ? 'বাকি' : 'Due' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Invoice List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-100/70 custom-scrollbar">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <Receipt size={36} className="mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">কোনো পিওএস বিক্রয় রেকর্ড পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">কাউন্টার থেকে বিক্রয় সম্পন্ন করলে স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isExpanded = expandedInvoiceId === inv.id;
              const hasDue = (inv.dueAmountPoisha || 0) > 0;
              const itemCount = (inv.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Summary Row */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {inv.id}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                            {inv.paymentMode || 'CASH'}
                          </span>
                          {hasDue && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                              বকেয়া বাকি
                            </span>
                          )}
                          {inv.isMushak && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                              মূসক ৬.৩
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                          <span>{inv.customerName || 'সাধারণ নগদ ক্রেতা'}</span>
                          {inv.customerPhone && <span>• {inv.customerPhone}</span>}
                          <span>• {inv.createdAt ? new Date(inv.createdAt).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                          <span>• {itemCount} টি পণ্য</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 self-end md:self-center w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট মূল্য</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {formatCurrency(inv.grandTotalPoisha || 0, isBengali)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onReprintThermal) onReprintThermal(inv);
                            toast.success(`রসিদ লোড হয়েছে: ${inv.id}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          title="থার্মাল রসিদ প্রিন্ট করুন"
                        >
                          <Printer size={13} />
                          <span>রসিদ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onReprintMushak) onReprintMushak(inv);
                            toast.success(`মূসক চালান লোড হয়েছে: ${inv.id}`);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="মূসক ৬.৩ চালান প্রিন্ট করুন"
                        >
                          <FileText size={13} />
                          <span className="hidden sm:inline">মূসক</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleExpand(inv.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="বিস্তারিত আইটেম দেখুন"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Itemized Details */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-3 animate-in fade-in text-xs">
                      <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                        আইটেমভিত্তিক বিক্রয় তালিকা ({inv.items?.length || 0} প্রকার)
                      </h4>

                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">পণ্য</th>
                              <th className="py-2 px-3 text-right">পরিমাণ</th>
                              <th className="py-2 px-3 text-right">দর</th>
                              <th className="py-2 px-3 text-right">মোট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {(inv.items || []).map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-sans font-bold text-slate-800">
                                  {item.name}
                                  {item.barcode && <span className="block text-[10px] text-slate-400 font-mono">{item.barcode}</span>}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-700">
                                  {item.quantity} {item.unit || 'টি'}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-600">
                                  {formatCurrency(item.unitPricePoisha || (item.price * 100) || 0, isBengali)}
                                </td>
                                <td className="py-2 px-3 text-right font-black text-slate-900">
                                  {formatCurrency((item.unitPricePoisha || (item.price * 100) || 0) * (item.quantity || 1), isBengali)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Payment Breakdown Card */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-sans block">নগদ প্রদান</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(inv.paymentBreakdown?.cashPoisha ?? inv.cashPoisha ?? 0, isBengali)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-sans block">ডিজিটাল (বিকাশ)</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(inv.paymentBreakdown?.bkashPoisha ?? inv.bkashPoisha ?? 0, isBengali)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-sans block">বকেয়া বাকি</span>
                          <span className={`font-black ${hasDue ? 'text-rose-600' : 'text-slate-800'}`}>
                            {formatCurrency(inv.dueAmountPoisha || 0, isBengali)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-sans block">ছাড় / ডিসকাউন্ট</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(inv.discountPoisha || 0, isBengali)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>মোট {filteredInvoices.length}টি বিক্রয় ইনভয়েস ট্র্যাকিং হচ্ছে</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
