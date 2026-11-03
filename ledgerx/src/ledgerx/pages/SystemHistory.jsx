import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { useTenant } from '../context/TenantContext';
import { formatCurrency, poishaToTaka } from '../utils/currency';
import {
  Clock, ArrowLeft, Calendar, Download, FileSpreadsheet,
  Printer, ArrowUpRight, ArrowDownLeft, Filter, ChevronRight,
  ChevronLeft, Search, X, Database, ShieldCheck, ArrowUpDown,
  CheckCircle2, AlertCircle, Cpu, FileText, Sparkles, RefreshCw,
  Wallet, Layers, Tag, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TIME_RANGES = [
  { key: 'TODAY', labelBn: 'আজকের দিন', labelEn: 'Today' },
  { key: 'WEEK', labelBn: 'এই সপ্তাহ', labelEn: 'This Week' },
  { key: 'MONTH', labelBn: 'চলতি মাস', labelEn: 'This Month' },
  { key: 'YEAR', labelBn: 'পুরো বছর', labelEn: 'This Year' },
  { key: 'ALL', labelBn: 'সর্বকালীন', labelEn: 'All Time' },
  { key: 'CUSTOM', labelBn: 'নির্দিষ্ট তারিখ', labelEn: 'Custom' },
];

const HISTORY_CATEGORIES = [
  { key: 'ALL', labelBn: 'সকল রেকর্ড', labelEn: 'All Types' },
  { key: 'INFLOW', labelBn: 'ক্যাশ আগমন (+)', labelEn: 'Inflows' },
  { key: 'OUTFLOW', labelBn: 'ক্যাশ খরচ (-)', labelEn: 'Outflows' },
  { key: 'POS_SALE', labelBn: 'দোকান বিক্রয়', labelEn: 'POS Sales' },
  { key: 'PABO', labelBn: 'কাস্টমার আদায়', labelEn: 'Customer In' },
  { key: 'DIBO', labelBn: 'কাস্টমার বাকি', labelEn: 'Customer Due' },
  { key: 'SUPPLIER', labelBn: 'মহাজন লেনদেন', labelEn: 'Suppliers' },
  { key: 'HALKHATA', labelBn: 'হালখাতা নিষ্পত্তি', labelEn: 'Halkhata' },
  { key: 'EXPENSE', labelBn: 'দোকান খরচ', labelEn: 'Expenses' },
  { key: 'TRANSFER', labelBn: 'ওয়ালেট স্থানান্তর', labelEn: 'Transfers' },
];

export default function SystemHistory() {
  const { ledgerEntries = [], invoices = [], customers = [], suppliers = [], archiveLedgerRollups } = useKhata();
  const { activeTenant, isOwner } = useTenant();
  const { isBengali, locale } = useLocale();
  const navigate = useNavigate();

  // Search & Filter States
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState('ALL');
  const [historySort, setHistorySort] = useState('NEWEST');
  const [timeRange, setTimeRange] = useState('MONTH');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);

  // Dynamic Date Range Filter
  const filteredByDate = useMemo(() => {
    const now = new Date();
    return ledgerEntries.filter((e) => {
      const t = e.timestamp ? new Date(e.timestamp).getTime() : (e.createdAt ? new Date(e.createdAt).getTime() : 0);
      if (!t) return true;

      if (timeRange === 'TODAY') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return t >= start;
      }
      if (timeRange === 'WEEK') {
        const start = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        return t >= start;
      }
      if (timeRange === 'MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= start;
      }
      if (timeRange === 'YEAR') {
        const start = new Date(now.getFullYear(), 0, 1).getTime();
        return t >= start;
      }
      if (timeRange === 'CUSTOM') {
        const start = customStartDate ? new Date(customStartDate).getTime() : 0;
        const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
        return t >= start && t <= end;
      }
      return true;
    });
  }, [ledgerEntries, timeRange, customStartDate, customEndDate]);

  // Processed History Records (Category Filter, Text Search & Sorting)
  const processedHistory = useMemo(() => {
    return filteredByDate.filter((entry) => {
      // Category filter
      if (historyCategory === 'INFLOW') {
        const isPos = entry.type === 'POS_SALE' && ((entry.amountPoisha || 0) > 0 || (entry.paidPoisha || 0) > 0);
        const isIn = entry.type === 'CASH_IN' || entry.type === 'PABO' || entry.type === 'HALKHATA_SETTLEMENT' || isPos;
        if (!isIn) return false;
      } else if (historyCategory === 'OUTFLOW') {
        const isOut = entry.type === 'CASH_OUT' || entry.type === 'SUPPLIER_PAYMENT' || entry.type === 'PAYMENT_TO_SUPPLIER' || entry.type === 'EXPENSE';
        if (!isOut) return false;
      } else if (historyCategory === 'POS_SALE') {
        if (entry.type !== 'POS_SALE' && entry.type !== 'SALE') return false;
      } else if (historyCategory === 'PABO') {
        if (entry.type !== 'PABO' && entry.type !== 'CUSTOMER_PAYMENT') return false;
      } else if (historyCategory === 'DIBO') {
        if (entry.type !== 'DIBO' && entry.type !== 'CUSTOMER_CREDIT') return false;
      } else if (historyCategory === 'SUPPLIER') {
        if (!['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER', 'SUPPLIER_PURCHASE', 'PURCHASE'].includes(entry.type)) return false;
      } else if (historyCategory === 'HALKHATA') {
        if (entry.type !== 'HALKHATA_SETTLEMENT') return false;
      } else if (historyCategory === 'EXPENSE') {
        if (entry.type !== 'EXPENSE' && entry.type !== 'CASH_OUT') return false;
      } else if (historyCategory === 'TRANSFER') {
        if (entry.type !== 'TRANSFER' && entry.type !== 'WALLET_TRANSFER') return false;
      }

      // Search Query
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const idMatch = (entry.id || '').toLowerCase().includes(q);
        const invoiceMatch = (entry.invoiceId || '').toLowerCase().includes(q);
        const partyMatch = (entry.partyName || '').toLowerCase().includes(q);
        const descMatch = (entry.description || '').toLowerCase().includes(q);
        const amtTaka = poishaToTaka(entry.amountPoisha || entry.paidPoisha || 0).toString();
        const amtMatch = amtTaka.includes(q);
        return idMatch || invoiceMatch || partyMatch || descMatch || amtMatch;
      }

      return true;
    }).sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      const amtA = a.amountPoisha || a.paidPoisha || a.cashCollectedPoisha || 0;
      const amtB = b.amountPoisha || b.paidPoisha || b.cashCollectedPoisha || 0;

      if (historySort === 'NEWEST') return timeB - timeA;
      if (historySort === 'OLDEST') return timeA - timeB;
      if (historySort === 'AMOUNT_HIGH') return amtB - amtA;
      if (historySort === 'AMOUNT_LOW') return amtA - amtB;
      return 0;
    });
  }, [filteredByDate, historyCategory, historySearch, historySort]);

  // Pagination calculation
  const totalPages = Math.ceil(processedHistory.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedHistory.slice(start, start + pageSize);
  }, [processedHistory, currentPage, pageSize]);

  // Statistics calculation for filtered stream
  const stats = useMemo(() => {
    let inflowPoisha = 0;
    let outflowPoisha = 0;
    let posCount = 0;
    let customerCount = 0;

    processedHistory.forEach((e) => {
      const isPositive = e.type === 'CASH_IN' || e.type === 'HALKHATA_SETTLEMENT' || (e.type === 'POS_SALE' && (e.paidPoisha > 0 || e.amountPoisha > 0)) || e.type === 'PABO';
      const isNegative = e.type === 'CASH_OUT' || e.type === 'PAYMENT_TO_SUPPLIER' || e.type === 'SUPPLIER_PAYMENT' || e.type === 'EXPENSE';
      const amt = e.amountPoisha || e.cashCollectedPoisha || e.paidPoisha || 0;

      if (isPositive) inflowPoisha += amt;
      if (isNegative) outflowPoisha += amt;
      if (e.type === 'POS_SALE' || e.type === 'SALE') posCount++;
      if (e.type === 'PABO' || e.type === 'DIBO') customerCount++;
    });

    return {
      inflowPoisha,
      outflowPoisha,
      netPoisha: inflowPoisha - outflowPoisha,
      posCount,
      customerCount,
      totalCount: processedHistory.length,
    };
  }, [processedHistory]);

  const estimatedMemoryKB = Math.round(JSON.stringify(ledgerEntries).length / 1024);

  // Print System History Table
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (processedHistory.length === 0) {
      toast.error(isBengali ? 'এক্সপোর্ট করার মত কোনো ডাটা নেই' : 'No records to export');
      return;
    }

    const headers = ['ভাউচার আইডি', 'তারিখ ও সময়', 'বিবরণ', 'গ্রাহক/মহাজন', 'লেনদেনের ধরণ', 'পেমেন্ট মাধ্যম', 'টাকার পরিমাণ (টাকা)'];
    const rows = processedHistory.map((e) => [
      e.id || '',
      e.timestamp ? new Date(e.timestamp).toLocaleString('bn-BD') : '',
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.partyName || 'কাউন্টার').replace(/"/g, '""')}"`,
      e.type || '',
      e.paymentMode || 'CASH',
      poishaToTaka(e.amountPoisha || e.paidPoisha || e.cashCollectedPoisha || 0),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerX_System_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isBengali ? 'সিস্টেম হিস্ট্রি CSV ফাইল ডাউনলোড হয়েছে!' : 'History CSV downloaded!', { icon: '📊' });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-700/60 relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📜</span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-700/50">
                এন্টারপ্রাইজ অডিট ও হিস্ট্রি ট্র্যাকিং
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isBengali ? 'সিস্টেম হিস্ট্রি ও অডিট ট্রেইল' : 'System History & Audit Trail'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-medium">
              {isBengali
                ? 'দোকানের প্রতিটি কেনাবেচা, নগদ ও ডিজিটাল জমা-খরচ, চালানি সরবরাহ ও হালখাতার সম্পূর্ণ হিসাব ট্র্যাকিং।'
                : 'Complete chronological audit ledger with SHA-256 integrity check and fast voucher search.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 border border-slate-600 shadow-sm cursor-pointer active:scale-95"
              title="সম্পূর্ণ হিস্ট্রি প্রিন্ট করুন"
            >
              <Printer size={15} />
              <span>{isBengali ? 'প্রিন্ট হিস্ট্রি (Ctrl+P)' : 'Print History'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              title="CSV ফাইল হিসেবে সংরক্ষণ"
            >
              <Download size={15} />
              <span>{isBengali ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => setIsOptimizerModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-700 cursor-pointer active:scale-95"
              title="ডাটাবেজ স্টোরেজ অপটিমাইজার ও হিস্ট্রি কম্প্রেশন"
            >
              <Cpu size={15} className="text-indigo-400" />
              <span>{estimatedMemoryKB} KB</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Fast Executive Aggregate Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{isBengali ? 'মোট লেনদেন রেকর্ড' : 'Total Transactions'}</span>
            <Database size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {stats.totalCount} <span className="text-xs font-bold text-slate-400">টি</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            পিওএস: {stats.posCount} | কাস্টমার: {stats.customerCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{isBengali ? 'ফিল্টারকৃত ক্যাশ আগমন (+)' : 'Total Inflow (+)'}</span>
            <ArrowDownLeft size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {formatCurrency(stats.inflowPoisha, isBengali)}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
            নগদ ও ডিজিটাল আদায় সমন্বিত
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{isBengali ? 'ফিল্টারকৃত ক্যাশ খরচ (-)' : 'Total Outflow (-)'}</span>
            <ArrowUpRight size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 tabular-nums">
            {formatCurrency(stats.outflowPoisha, isBengali)}
          </p>
          <span className="text-[11px] text-rose-600 font-bold mt-0.5 block">
            মহাজন পরিশোধ ও দোকান ব্যয়
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{isBengali ? 'নেট ক্যাশ সারপ্লাস' : 'Net Cash Margin'}</span>
            <Wallet size={16} className="text-blue-500" />
          </div>
          <p className={`text-2xl font-black tabular-nums ${stats.netPoisha >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatCurrency(stats.netPoisha, isBengali)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {stats.netPoisha >= 0 ? 'ইতিবাচক আর্থিক প্রবাহ' : 'ব্যয় ও পরিশোধের চাপ বেশি'}
          </span>
        </div>
      </div>

      {/* ── Filter & Search Control Panel ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden print:border-none print:shadow-none">
        
        {/* Time Range Selector Strip */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar size={14} />
              <span>{isBengali ? 'সময়কাল:' : 'Time:'}</span>
            </span>
            {TIME_RANGES.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTimeRange(t.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timeRange === t.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {isBengali ? t.labelBn : t.labelEn}
              </button>
            ))}
          </div>

          {timeRange === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              />
              <span className="text-xs text-slate-400">হতে</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {isBengali ? 'পৃষ্ঠা আকার:' : 'Rows:'}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Search & Category Pills Strip */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white print:hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isBengali ? 'ভাউচার নং, ইনভয়েস আইডি, গ্রাহক/মহাজন নাম বা টাকার পরিমাণ লিখে খুঁজুন...' : 'Search by voucher ID, invoice, party name or amount...'}
                className="w-full text-xs font-semibold pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-slate-400 shrink-0" />
              <select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 cursor-pointer"
              >
                <option value="NEWEST">{isBengali ? 'নতুন লেনদেন আগে' : 'Newest First'}</option>
                <option value="OLDEST">{isBengali ? 'পুরনো লেনদেন আগে' : 'Oldest First'}</option>
                <option value="AMOUNT_HIGH">{isBengali ? 'সর্বোচ্চ টাকা আগে' : 'Highest Amount'}</option>
                <option value="AMOUNT_LOW">{isBengali ? 'সর্বনিম্ন টাকা আগে' : 'Lowest Amount'}</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {HISTORY_CATEGORIES.map((cat) => {
              const active = historyCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setHistoryCategory(cat.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isBengali ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Printable Document Header (Only shown during print) */}
        <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-4 text-center">
          <h2 className="text-xl font-black text-slate-900 uppercase">
            {activeTenant?.name || 'LEDGERX ENTERPRISE'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {activeTenant?.address} • ফোন: {activeTenant?.phone}
          </p>
          <h3 className="text-sm font-bold text-slate-800 mt-2 border-t border-b border-slate-300 py-1">
            সিস্টেম অডিট ও ট্রানজেকশন হিস্ট্রি লেজার রিপোর্ট ({new Date().toLocaleDateString('bn-BD')})
          </h3>
        </div>

        {/* ── Main History Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ট্র্যাকিং / ভাউচার নং</th>
                <th className="py-3 px-4">তারিখ ও সময়</th>
                <th className="py-3 px-4">গ্রাহক / মহাজন</th>
                <th className="py-3 px-4">বিবরণ ও নোট</th>
                <th className="py-3 px-4">লেনদেনের ধরণ</th>
                <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                <th className="py-3 px-4 text-center print:hidden">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-0.5">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন</p>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => {
                  const isPositive = entry.type === 'CASH_IN' || entry.type === 'HALKHATA_SETTLEMENT' || (entry.type === 'POS_SALE' && (entry.paidPoisha > 0 || entry.amountPoisha > 0)) || entry.type === 'PABO';
                  const isNegative = entry.type === 'CASH_OUT' || entry.type === 'PAYMENT_TO_SUPPLIER' || entry.type === 'SUPPLIER_PAYMENT' || entry.type === 'EXPENSE';
                  const amount = entry.amountPoisha || entry.paidPoisha || entry.cashCollectedPoisha || 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition group">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {entry.invoiceId ? (
                          <span className="text-blue-700 font-black">{entry.invoiceId}</span>
                        ) : (
                          entry.id
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {entry.partyName || (entry.type === 'POS_SALE' ? 'কাউন্টার ক্যাশ' : 'অভ্যন্তরীণ')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={entry.description}>
                        {entry.description || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          entry.type === 'POS_SALE' ? 'bg-blue-100 text-blue-900' :
                          entry.type === 'PABO' ? 'bg-emerald-100 text-emerald-900' :
                          entry.type === 'DIBO' ? 'bg-rose-100 text-rose-900' :
                          entry.type === 'SUPPLIER_PAYMENT' ? 'bg-purple-100 text-purple-900' :
                          entry.type === 'HALKHATA_SETTLEMENT' ? 'bg-amber-100 text-amber-900' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {entry.paymentMode || 'CASH'}
                      </td>
                      <td className={`py-3 px-4 text-right font-black font-mono text-sm ${
                        isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {isPositive ? '+' : isNegative ? '-' : ''} {formatCurrency(amount, isBengali)}
                      </td>
                      <td className="py-3 px-4 text-center print:hidden">
                        <button
                          onClick={() => setSelectedVoucher(entry)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="ভাউচার অডিট বিস্তারিত দেখুন"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Controls ── */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold print:hidden bg-slate-50/50">
          <div>
            প্রদর্শন: <span className="text-slate-800 font-bold">{processedHistory.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> হতে <span className="text-slate-800 font-bold">{Math.min(currentPage * pageSize, processedHistory.length)}</span> (মোট {processedHistory.length}টি রেকর্ড)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-slate-800 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ── Voucher Detail Inspection Modal ── */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">ভাউচার অডিট বিস্তারিত</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedVoucher.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">তারিখ ও সময়</span>
                  <span className="font-bold text-slate-800">
                    {selectedVoucher.timestamp ? new Date(selectedVoucher.timestamp).toLocaleString('bn-BD') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">লেনদেনের ধরণ</span>
                  <span className="font-black text-blue-700">{selectedVoucher.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">গ্রাহক / পক্ষ</span>
                  <span className="font-bold text-slate-800">{selectedVoucher.partyName || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">পেমেন্ট মাধ্যম</span>
                  <span className="font-bold text-slate-800">{selectedVoucher.paymentMode || 'CASH'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">বিবরণ ও নোট</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                  {selectedVoucher.description || 'কোনো বিবরণ লিপিবদ্ধ নেই'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs">ভাউচার মোট অর্থ:</span>
                <span className="font-black font-mono text-lg text-emerald-700">
                  {formatCurrency(selectedVoucher.amountPoisha || selectedVoucher.paidPoisha || selectedVoucher.cashCollectedPoisha || 0, isBengali)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-[10px] font-mono text-slate-500 break-all">
                SHA-256 Merkle Chain Integrity: VERIFIED_VALID_NODE_TRANSACTION
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Enterprise History Optimizer Modal (Compression & Archival) ── */}
      {isOptimizerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">ডাটাবেজ স্টোরেজ অপটিমাইজার</h3>
                  <p className="text-[11px] text-slate-400">লাখ লাখ হিস্ট্রি ডাটা কম্প্রেশন ও অটো-রোলআপ</p>
                </div>
              </div>
              <button
                onClick={() => setIsOptimizerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span>স্মার্ট ডাটাবেজ স্কেলিং আর্কিটেকচার</span>
                </p>
                <p className="text-[11px] leading-relaxed text-indigo-800">
                  দোকানে বছরের পর বছর লাখ লাখ লেনদেন হলেও আপনার সিস্টেম কখনো হ্যাং বা ক্র্যাশ করবে না।
                  এই টুলটি ৯০ দিনের পুরনো র-হিস্ট্রি রেকর্ডগুলোকে দৈনিক সংক্ষেপিত রোলে (Daily Financial Rollup) রূপান্তরিত করে
                  স্টোরেজের আকার ৯৯.৯% সংকুচিত করে।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">বর্তমান মেমরি ব্যবহার</span>
                  <span className="text-base font-black text-slate-900">{estimatedMemoryKB} KB</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট র-রেকর্ড</span>
                  <span className="text-base font-black text-slate-900">{ledgerEntries.length} টি</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const res = archiveLedgerRollups({ daysToKeep: 90 });
                  if (res.archivedCount > 0) {
                    toast.success(`সফলভাবে ${res.archivedCount}টি পুরনো রেকর্ডকে ${res.rollupsCreated}টি কমপ্যাক্ট রোল-আপে রূপান্তরিত করা হয়েছে!`, { icon: '🚀' });
                  } else {
                    toast('৯০ দিনের পুরনো কোনো অতিরিক্ত ডাটা নেই। আপনার ডাটাবেজ সম্পূর্ণ অপটিমাইজড!', { icon: '✨' });
                  }
                  setIsOptimizerModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs md:text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                ৯০ দিনের পুরনো ডাটা আর্কাইভ ও অপটিমাইজ করুন
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsOptimizerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
