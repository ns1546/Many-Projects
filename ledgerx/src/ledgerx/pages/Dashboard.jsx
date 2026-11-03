import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { useTenant } from '../context/TenantContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { formatCurrency, poishaToTaka } from '../utils/currency';
import { buildDueReminderMessage, openWhatsAppDirect } from '../utils/whatsapp';
import toast from 'react-hot-toast';

import EasyKhataDashboard from '../components/easy/EasyKhataDashboard';

import { 
  Zap,
  Users,
  Building2,
  Wallet,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageCircle,
  FileText,
  Printer,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Receipt
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { ledgerEntries, customers, suppliers, products, totalPaboPoisha, totalDiboPoisha, registers } = useKhata();
  const { isBengali, locale } = useLocale();
  const { activeTenant, isCashier } = useTenant();
  const { isEasyMode } = useOperatingMode();

  // Top Due Customers (Sorted by highest outstanding due)
  const topDueCustomers = useMemo(() => {
    return [...(customers || [])]
      .filter(c => (c.currentDuePoisha || 0) > 0)
      .sort((a, b) => b.currentDuePoisha - a.currentDuePoisha)
      .slice(0, 4);
  }, [customers]);

  // Low Stock Items (Stock <= Alert Threshold)
  const lowStockItems = useMemo(() => {
    return (products || [])
      .filter(p => (p.currentStockInBaseUnit || p.stock || 0) <= (p.lowStockAlertThreshold || 20))
      .slice(0, 3);
  }, [products]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return (ledgerEntries || []).slice(0, 7);
  }, [ledgerEntries]);

  // Total Liquid Float Calculation
  const totalFloatPoisha = (registers || []).reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
  const cashRegister = (registers || []).find(r => r.id === 'cash_drawer');
  const bkashRegister = (registers || []).find(r => r.id === 'bkash_merchant' || r.id === 'bkash_mfs');

  // Total Estimated Inventory Value
  const totalStockValuePoisha = useMemo(() => {
    return (products || []).reduce((sum, p) => {
      const stock = p.currentStockInBaseUnit ?? p.stock ?? 0;
      const price = p.purchasePricePoisha || p.costPricePoisha || 0;
      return sum + (stock * price);
    }, 0);
  }, [products]);

  const handleWhatsAppReminder = (customer) => {
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
    toast.success(isBengali ? 'হোয়াটসঅ্যাপে তাগাদা বার্তা পাঠানো হয়েছে!' : 'WhatsApp reminder sent!');
  };

  const dueCustomersCount = (customers || []).filter(c => (c.currentDuePoisha || 0) > 0).length;
  const suppliersDueCount = (suppliers || []).filter(s => (s.currentDuePoisha || s.balancePoisha || 0) > 0).length;

  // If in Easy Mode, render the streamlined TallyKhata-inspired dashboard
  if (isEasyMode) {
    return <EasyKhataDashboard />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-7 pb-16 animate-fadeIn select-none font-sans">
      
      {/* ── 1. Top Executive Store Identity & Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E2136E] to-[#B00F55] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-pink-600/25 shrink-0">
            ৳
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
                {activeTenant?.name || 'স্বপ্ন সুপার শপ'}
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#E2136E] border border-pink-200">
                PRO CONTROL
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 truncate">
              {activeTenant?.branch || 'প্রধান শাখা'} • {isBengali ? 'বারকোড পিওএস, পণ্য স্টক, পাইকারি মহাজন ও সম্পূর্ণ হিসাব ব্যবস্থাপনা' : 'Full Retail ERP, POS, Stock & Accounting'}
            </p>
          </div>
        </div>

        {/* Quick Date Display */}
        <div className="text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <span>
            {new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── 2. The 4 Key Business Metrics (Executive KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: আজকের ক্যাশ ও তারল্য */}
        <div 
          onClick={() => navigate('/cashbox')}
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wide bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <Wallet size={13} className="text-emerald-600" />
              <span>{isBengali ? 'মোট নগদ তারল্য' : 'Cash & Till'}</span>
            </span>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight my-1 tabular-nums">
            {formatCurrency(totalFloatPoisha, { locale })}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isBengali ? `ক্যাশ: ৳${poishaToTaka(cashRegister?.balancePoisha || 0).toLocaleString()} • বিকাশ: ৳${poishaToTaka(bkashRegister?.balancePoisha || 0).toLocaleString()}` : `Cash: ৳${poishaToTaka(cashRegister?.balancePoisha || 0).toLocaleString()} • bKash: ৳${poishaToTaka(bkashRegister?.balancePoisha || 0).toLocaleString()}`}
          </p>
        </div>

        {/* Metric 2: মোট বাকি পাওনা (কাস্টমার) */}
        <div 
          onClick={() => navigate('/customers')}
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wide bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-rose-600" />
              <span>{isBengali ? 'মোট বাকি পাওনা' : 'Receivables'}</span>
            </span>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-rose-600 tracking-tight my-1 tabular-nums">
            {formatCurrency(totalPaboPoisha, { locale })}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isBengali ? `${dueCustomersCount} জন গ্রাহকের কাছে বাকি রয়েছে` : `${dueCustomersCount} customers with due`}
          </p>
        </div>

        {/* Metric 3: মোট মহাজন দেনা */}
        <div 
          onClick={() => navigate('/suppliers')}
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wide bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1.5">
              <TrendingDown size={13} className="text-purple-600" />
              <span>{isBengali ? 'মহাজন দেনা' : 'Payables'}</span>
            </span>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-700 tracking-tight my-1 tabular-nums">
            {formatCurrency(totalDiboPoisha, { locale })}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isBengali ? `${suppliersDueCount} জন মহাজনকে পরিশোধযোগ্য` : `${suppliersDueCount} suppliers payable`}
          </p>
        </div>

        {/* Metric 4: মজুত পণ্য ও স্টক ভ্যালু */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
              <Package size={13} className="text-blue-600" />
              <span>{isBengali ? 'পণ্য ও স্টক' : 'Inventory'}</span>
            </span>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-blue-700 tracking-tight my-1 tabular-nums">
            {formatCurrency(totalStockValuePoisha, { locale })}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isBengali ? `${products.length}টি পণ্য মজুত • ${lowStockItems.length}টি কম স্টক` : `${products.length} products in stock`}
          </p>
        </div>

      </div>

      {/* ── 3. POS Express Quick-Launcher Hero Banner ── */}
      <div className="bg-gradient-to-r from-[#E2136E] via-[#D81B60] to-[#880E4F] rounded-3xl p-6 md:p-7 text-white shadow-lg shadow-pink-600/20 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-pink-400/40">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Zap size={32} className="text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                {isBengali ? 'কাউন্টার পিওএস ও ক্যাশ মেমো' : 'Express Retail POS'}
              </h2>
              <span className="text-[10px] font-black bg-white/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                F1
              </span>
            </div>
            <p className="text-xs md:text-sm text-pink-100 font-medium mt-1">
              {isBengali ? 'বারকোড স্ক্যানার দিয়ে দ্রুত পণ্য বিক্রি করুন, বাকি যুক্ত করুন ও প্রিন্টারে মেমো কাটুন' : 'Fast barcode billing, thermal receipt printing & split payments'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-pink-50 text-[#E2136E] font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
        >
          <ShoppingCart size={18} />
          <span>{isBengali ? '⚡ নতুন বিক্রয় মেমো শুরু করুন' : 'Start New Sale (F1)'}</span>
        </button>
      </div>

      {/* ── 4. Two Smart Business Panels (Transactions & Alerts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Col 7): Recent Invoices & Transactions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText size={18} className="text-[#E2136E]" />
              <span>{isBengali ? 'সাম্প্রতিক বিক্রয় ও লেনদেন বিবরণী' : 'Recent Invoices & Transactions'}</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-[#E2136E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isBengali ? 'সকল রিপোর্ট' : 'View All'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Clock size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">{isBengali ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No transactions recorded yet'}</p>
              </div>
            ) : (
              recentTransactions.map((tx, idx) => {
                const isIncoming = tx.type === 'PABO' || tx.type === 'CUSTOMER_COLLECTION' || tx.type === 'SALE';
                return (
                  <div key={idx} className="p-4 md:p-4.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        isIncoming ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {isIncoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm text-slate-900 truncate">
                          {tx.partyName || tx.title || (isBengali ? 'নগদ বিক্রয়' : 'Cash Sale')}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                          <span className="font-mono text-slate-600">{tx.voucherNo || `#TX-${1000 + idx}`}</span>
                          <span>•</span>
                          <span>{tx.time || (isBengali ? 'আজ' : 'Today')}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-md font-bold">
                            {tx.channel || (isBengali ? 'নগদ ক্যাশ' : 'Cash')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p className={`font-black text-sm md:text-base tabular-nums ${
                        isIncoming ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isIncoming ? '+' : '-'}{formatCurrency(tx.amountPoisha || 0, { locale })}
                      </p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full mt-0.5 border ${
                        isIncoming ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isIncoming ? (isBengali ? 'জমা' : 'Received') : (isBengali ? 'খরচ/পরিশোধ' : 'Paid')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (Col 5): Instant Action Items (Dues & Low Stock) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section: Overdue Tagada */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} />
                </div>
                <span>{isBengali ? 'যাদের বাকি বেশি (তাগাদা পাঠান)' : 'Top Due Customers'}</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                {isBengali ? 'সব বাকি' : 'All Dues'}
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {topDueCustomers.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                  <p className="font-bold text-xs text-slate-700">{isBengali ? 'কোনো বকেয়া বাকি নেই!' : 'All dues are settled!'}</p>
                </div>
              ) : (
                topDueCustomers.map((cust) => (
                  <div key={cust.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm text-slate-900 truncate">{cust.name}</p>
                      <span className="text-xs font-black text-rose-600 block mt-0.5 tabular-nums">
                        ৳ {poishaToTaka(cust.currentDuePoisha).toLocaleString()} {isBengali ? 'বাকি' : 'Due'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppReminder(cust)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="হোয়াটসঅ্যাপে তাগাদা পাঠান"
                    >
                      <MessageCircle size={14} />
                      <span>{isBengali ? 'তাগাদা' : 'WhatsApp'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Low Stock Alert Capsule */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>{isBengali ? 'মজুদ শেষ হওয়ার সতর্কতা' : 'Low Stock Alerts'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/inventory')}
                  className="text-xs font-bold text-amber-900 underline cursor-pointer"
                >
                  {isBengali ? 'স্টক দেখুন' : 'Inventory'}
                </button>
              </div>

              <div className="space-y-2">
                {lowStockItems.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl border border-amber-200/70">
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 shrink-0">
                      {item.currentStockInBaseUnit || item.stock || 0} {item.baseUnit || 'পিস'} বাকি
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
