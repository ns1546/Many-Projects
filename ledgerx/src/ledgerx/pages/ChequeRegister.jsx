import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { formatCurrency, parseToPoisha } from '../utils/currency';
import {
  CreditCard, Plus, ArrowLeft, Calendar, CheckCircle2,
  AlertOctagon, Building, ArrowDownLeft, ArrowUpRight,
  Clock, AlertTriangle, TrendingUp, Banknote, Eye,
  Filter, X, ChevronRight, Shield, Activity, Landmark,
  Search, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Bank color and identity mapping for authentic bKash FinTech feel
const BANK_THEMES = {
  'Islami Bank': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', tag: 'IBBL' },
  'Dutch-Bangla Bank': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', tag: 'DBBL' },
  'Sonali Bank': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', tag: 'SONALI' },
  'BRAC Bank': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', tag: 'BRAC' },
  'City Bank': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', tag: 'CITY' },
  'Eastern Bank': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', tag: 'EBL' },
  'Mutual Trust Bank': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', tag: 'MTB' },
  'Pubali Bank': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', tag: 'PUBL' },
  'Agrani Bank': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', tag: 'AGRANI' },
};

export default function ChequeRegister() {
  const { cheques, addCheque, updateChequeStatus } = useKhata();
  const { isBengali, formatNumber, locale } = useLocale();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('ALL'); // ALL | RECEIVED | ISSUED
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | PENDING | CLEARED | BOUNCED
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleClearCheque = (id) => {
    updateChequeStatus(id, 'CLEARED');
    toast.success(isBengali ? 'চেক সফলভাবে ক্লিয়ার হয়েছে!' : 'Cheque cleared successfully!');
  };

  const handleBounceCheque = (id) => {
    updateChequeStatus(id, 'BOUNCED');
    toast.error(isBengali ? 'চেক ডিসঅনার বা বাউন্স হিসেবে চিহ্নিত!' : 'Cheque dishonored / bounced!');
  };

  // KPIs Calculation
  const kpis = useMemo(() => {
    const list = cheques || [];
    const pending = list.filter(c => c.status === 'PENDING');
    const cleared = list.filter(c => c.status === 'CLEARED');
    const bounced = list.filter(c => c.status === 'BOUNCED');
    const maturingSoon = pending.filter(c => {
      const d = Math.ceil((new Date(c.clearingDate) - new Date()) / 86400000);
      return d >= 0 && d <= 3;
    });
    const totalPendingPoisha = pending.reduce((s, c) => s + (c.amountPoisha || 0), 0);
    const totalClearedPoisha = cleared.reduce((s, c) => s + (c.amountPoisha || 0), 0);
    const totalBouncedPoisha = bounced.reduce((s, c) => s + (c.amountPoisha || 0), 0);
    const grandTotalPoisha = list.reduce((s, c) => s + (c.amountPoisha || 0), 0);

    return {
      pending: pending.length,
      cleared: cleared.length,
      bounced: bounced.length,
      maturingSoon: maturingSoon.length,
      totalPendingPoisha,
      totalClearedPoisha,
      totalBouncedPoisha,
      grandTotalPoisha,
      totalCount: list.length
    };
  }, [cheques]);

  // Filtered list
  const filteredCheques = useMemo(() => {
    let list = cheques || [];
    if (filterType === 'RECEIVED') list = list.filter(c => c.type === 'RECEIVED');
    if (filterType === 'ISSUED') list = list.filter(c => c.type === 'ISSUED');
    if (filterStatus === 'PENDING') list = list.filter(c => c.status === 'PENDING');
    if (filterStatus === 'CLEARED') list = list.filter(c => c.status === 'CLEARED');
    if (filterStatus === 'BOUNCED') list = list.filter(c => c.status === 'BOUNCED');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.partyName && c.partyName.toLowerCase().includes(q)) ||
        (c.chequeNumber && c.chequeNumber.toLowerCase().includes(q)) ||
        (c.bankName && c.bankName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [cheques, filterType, filterStatus, searchQuery]);

  const typeFilters = [
    { key: 'ALL', label: isBengali ? 'সকল চেক' : 'All Cheques' },
    { key: 'RECEIVED', label: isBengali ? 'গ্রাহক থেকে প্রাপ্ত' : 'Received' },
    { key: 'ISSUED', label: isBengali ? 'মহাজনকে প্রদত্ত' : 'Issued' },
  ];

  const statusFilters = [
    { key: 'ALL', label: isBengali ? 'সব স্ট্যাটাস' : 'All Status' },
    { key: 'PENDING', label: isBengali ? 'অপেক্ষমান (ম্যাচিউর বাকি)' : 'Pending', color: 'text-amber-700' },
    { key: 'CLEARED', label: isBengali ? 'ক্লিয়ার সম্পন্ন' : 'Cleared', color: 'text-emerald-700' },
    { key: 'BOUNCED', label: isBengali ? 'বাউন্স / ডিসঅনার' : 'Bounced', color: 'text-rose-700' },
  ];

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── 1. Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 shadow-xs border border-slate-200 transition-all cursor-pointer active:scale-95 shrink-0"
            title="ড্যাশবোর্ডে ফিরুন"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white shrink-0">
              <CreditCard size={26} className="drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {isBengali ? 'ব্যাংক চেক রেজিস্টার' : 'Bank Cheque Register'}
                </h1>
                <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                  {isBengali ? 'ব্যাংক হিসাব' : 'FinTech Banking'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                {isBengali ? 'পোস্ট-ডেটেড চেক অ্যালার্ট, ভাঙানোর তারিখ ও বাউন্স প্রতিরোধ রাডার' : 'Post-dated cheque maturity tracking & dishonor radar'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs md:text-sm font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={18} />
          <span>{isBengali ? '+ নতুন চেক এন্ট্রি' : '+ Record Cheque'}</span>
        </button>
      </div>

      {/* ── 2. Top 4 bKash KPI Cards (Spacious, 52px Squircles) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Cheques */}
        <div className="bg-white rounded-3xl p-5 border border-amber-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
              {isBengali ? 'অপেক্ষমান চেক' : 'Pending Cheques'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
              <Clock size={22} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpis.pending)} {isBengali ? 'টি চেক' : 'cheques'}
          </h3>
          <p className="text-sm font-bold text-amber-600 mt-1 tabular-nums">
            {formatCurrency(kpis.totalPendingPoisha, { locale })}
          </p>
          {kpis.maturingSoon > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-200 animate-pulse">
              <AlertTriangle size={13} className="text-amber-700" />
              <span>{formatNumber(kpis.maturingSoon)} {isBengali ? 'টি শীঘ্রই ভাঙাতে হবে' : 'maturing soon'}</span>
            </div>
          )}
        </div>

        {/* Cleared Cheques */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
              {isBengali ? 'ক্লিয়ার সম্পন্ন' : 'Cleared Cheques'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpis.cleared)} {isBengali ? 'টি চেক' : 'cheques'}
          </h3>
          <p className="text-sm font-bold text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(kpis.totalClearedPoisha, { locale })}
          </p>
          <span className="mt-3 inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            ✓ {isBengali ? 'ব্যাংক ব্যালেন্সে যোগ হয়েছে' : 'Credited to account'}
          </span>
        </div>

        {/* Bounced / Dishonored Cheques */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider">
              {isBengali ? 'ডিসঅনার (বাউন্স)' : 'Bounced Cheques'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
              <AlertOctagon size={22} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-600 tabular-nums">
            {formatNumber(kpis.bounced)} {isBengali ? 'টি চেক' : 'cheques'}
          </h3>
          <p className="text-sm font-bold text-rose-700 mt-1 tabular-nums">
            {formatCurrency(kpis.totalBouncedPoisha, { locale })}
          </p>
          {kpis.bounced > 0 ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-extrabold border border-rose-200">
              <AlertOctagon size={13} className="text-rose-700" />
              <span>{isBengali ? 'জরুরি আইনি নোটিশ প্রয়োজন' : 'Immediate legal notice'}</span>
            </div>
          ) : (
            <span className="mt-3 inline-block text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
              {isBengali ? 'কোনো বাউন্স রেকর্ড নেই' : 'Zero bounce rate'}
            </span>
          )}
        </div>

        {/* Total Cheques Value */}
        <div className="bg-white rounded-3xl p-5 border border-blue-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
              {isBengali ? 'মোট চেক ভ্যালু' : 'Total Cheques'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
              <Landmark size={22} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpis.totalCount)} {isBengali ? 'টি চেক' : 'cheques'}
          </h3>
          <p className="text-sm font-bold text-blue-700 mt-1 tabular-nums">
            {formatCurrency(kpis.grandTotalPoisha, { locale })}
          </p>
          <span className="mt-3 inline-block text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {isBengali ? 'প্রাপ্ত ও প্রদত্ত উভয় অন্তর্ভুক্ত' : 'Both received & issued'}
          </span>
        </div>
      </div>

      {/* ── 3. Filter Pills & Universal Search Strip ────────────────── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {typeFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === f.key 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {statusFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === f.key 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isBengali ? 'পার্টির নাম, ব্যাংক বা চেক নং খুঁজুন...' : 'Search party, bank, cheque no...'}
            className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Full-Width Spacious Cheque Cards List (Anti-Skeleton) ── */}
      <div className="space-y-3.5">
        {filteredCheques.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CreditCard size={32} />
            </div>
            <p className="font-black text-slate-800 text-base">
              {isBengali ? 'কোনো ব্যাংক চেক পাওয়া যায়নি' : 'No cheques found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBengali ? 'নতুন কোনো চেক রেকর্ড করতে উপরের বোতামটি ব্যবহার করুন।' : 'Record a new cheque using the button above.'}
            </p>
          </div>
        ) : (
          filteredCheques.map(c => {
            const isReceived = c.type === 'RECEIVED';
            const isPending = c.status === 'PENDING';
            const isCleared = c.status === 'CLEARED';
            const isBounced = c.status === 'BOUNCED';
            const daysLeft = Math.ceil((new Date(c.clearingDate) - new Date()) / 86400000);
            const isMaturingSoon = isPending && daysLeft <= 3 && daysLeft >= 0;
            const bankTheme = BANK_THEMES[c.bankName] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', tag: 'BANK' };

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-5 md:p-6 border transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isBounced 
                    ? 'border-rose-300 bg-rose-50/20' 
                    : isMaturingSoon 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                {/* Left: 52px Squircle Bank Avatar & Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Bank Icon Squircle */}
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border ${bankTheme.bg} ${bankTheme.border}`}>
                    <Landmark size={22} className={bankTheme.text} />
                    <span className={`text-[9px] font-black uppercase mt-0.5 tracking-tighter ${bankTheme.text}`}>
                      {bankTheme.tag}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-base md:text-lg text-slate-900 leading-tight">
                        {c.partyName}
                      </h3>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        isReceived ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isReceived ? <ArrowDownLeft size={13} className="text-emerald-600" /> : <ArrowUpRight size={13} className="text-rose-600" />}
                        <span>{isReceived ? (isBengali ? 'গ্রাহক প্রাপ্তি' : 'Received') : (isBengali ? 'মহাজন পেমেন্ট' : 'Issued')}</span>
                      </span>
                      {/* Monospace Cheque Number Pill */}
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        № {c.chequeNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building size={14} className="text-slate-400" />
                        <span>{c.bankName}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{isBengali ? 'ভাঙানোর তারিখ:' : 'Clearing:'} {c.clearingDate}</span>
                      </span>
                      {isMaturingSoon && (
                        <span className="font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse flex items-center gap-1">
                          <AlertTriangle size={12} />
                          <span>{daysLeft === 0 ? (isBengali ? 'আজই ভাঙাতে হবে!' : 'Due today!') : `${formatNumber(daysLeft)} ${isBengali ? 'দিন বাকি' : 'days left'}`}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Tactile bKash Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Amount Readout */}
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isBengali ? 'চেকের অংক' : 'Cheque Amount'}
                    </span>
                    <span className="text-xl md:text-2xl font-black text-slate-900 tabular-nums">
                      {formatCurrency(c.amountPoisha, { locale })}
                    </span>
                  </div>

                  {/* Actions / Status Badges */}
                  <div className="flex items-center gap-2">
                    {isCleared && (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200 shadow-xs">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>{isBengali ? 'ক্লিয়ার সম্পন্ন' : 'Cleared'}</span>
                      </span>
                    )}

                    {isBounced && (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-200 shadow-xs">
                        <AlertOctagon size={16} className="text-rose-600" />
                        <span>{isBengali ? 'ডিসঅনার / বাউন্স' : 'Bounced'}</span>
                      </span>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-2">
                        {/* Clear Button */}
                        <button
                          type="button"
                          onClick={() => handleClearCheque(c.id)}
                          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-black shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          title="চেক ক্লিয়ার হয়েছে"
                        >
                          <Check size={16} />
                          <span>{isBengali ? 'ক্লিয়ার করুন' : 'Clear'}</span>
                        </button>

                        {/* Dishonor / Bounce Button */}
                        <button
                          type="button"
                          onClick={() => handleBounceCheque(c.id)}
                          className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs md:text-sm font-black shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          title="চেক বাউন্স হয়েছে"
                        >
                          <AlertOctagon size={16} />
                          <span>{isBengali ? 'বাউন্স' : 'Bounce'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 5. Spacious Widescreen Add Cheque Modal ──────────────────── */}
      {isAddModalOpen && (
        <AddChequeModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newCheque) => {
            addCheque(newCheque);
            setIsAddModalOpen(false);
            toast.success(isBengali ? 'নতুন চেক সফলভাবে সংরক্ষিত হয়েছে!' : 'Cheque recorded successfully!');
          }}
          isBengali={isBengali}
        />
      )}
    </div>
  );
}

// Spacious, Widescreen 2-Column bKash Dialog
function AddChequeModal({ isOpen, onClose, onAdd, isBengali }) {
  const [type, setType] = useState('RECEIVED');
  const [partyName, setPartyName] = useState('');
  const [bankName, setBankName] = useState('Islami Bank');
  const [chequeNumber, setChequeNumber] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [clearingDate, setClearingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const poisha = parseToPoisha(amountStr);
    if (poisha <= 0 || !partyName || !chequeNumber || !clearingDate) {
      toast.error(isBengali ? 'অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন!' : 'Please fill all required fields correctly!');
      return;
    }

    onAdd({
      id: `chq_${Date.now()}`,
      type,
      partyName: partyName.trim(),
      bankName,
      chequeNumber: chequeNumber.trim(),
      amountPoisha: poisha,
      issueDate: new Date().toISOString().split('T')[0],
      clearingDate,
      status: 'PENDING'
    });
  };

  const banks = [
    'Islami Bank',
    'Dutch-Bangla Bank',
    'Sonali Bank',
    'BRAC Bank',
    'City Bank',
    'Eastern Bank',
    'Mutual Trust Bank',
    'Pubali Bank',
    'Agrani Bank'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg">
                {isBengali ? 'নতুন ব্যাংক চেক রেজিস্টার করুন' : 'Record New Cheque Entry'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {isBengali ? 'পোস্ট-ডেটেড চেক ও ক্লিয়ারিং তারিখ নির্ধারণ' : 'Post-dated cheque maturity & bank reconciliation'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-5">
          
          {/* Type Toggle Pills */}
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
              {isBengali ? 'চেকের ধরন নির্বাচন করুন' : 'Select Cheque Flow Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setType('RECEIVED')}
                className={`py-3.5 px-4 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'RECEIVED' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border-2 border-emerald-600' 
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft size={16} /> 
                <span>{isBengali ? 'গ্রাহক থেকে প্রাপ্ত (+)' : 'Received from Customer'}</span>
              </button>

              <button 
                type="button" 
                onClick={() => setType('ISSUED')}
                className={`py-3.5 px-4 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'ISSUED' 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border-2 border-rose-600' 
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight size={16} /> 
                <span>{isBengali ? 'মহাজনকে প্রদত্ত (-)' : 'Issued to Supplier'}</span>
              </button>
            </div>
          </div>

          {/* Party Name */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              {type === 'RECEIVED' 
                ? (isBengali ? 'গ্রাহকের নাম (পার্টি)' : 'Customer Name') 
                : (isBengali ? 'মহাজনের নাম (পার্টি)' : 'Supplier Name')} <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required 
              value={partyName} 
              onChange={e => setPartyName(e.target.value)}
              placeholder={isBengali ? 'যেমন: ভাই ভাই ট্রেডার্স / মেসার্স জামান' : 'e.g. Bhai Bhai Traders'}
              className="w-full text-sm font-semibold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition" 
            />
          </div>

          {/* Bank & Cheque No. (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                {isBengali ? 'ব্যাংকের নাম' : 'Bank'}
              </label>
              <select 
                value={bankName} 
                onChange={e => setBankName(e.target.value)}
                className="w-full text-sm font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition cursor-pointer"
              >
                {banks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                {isBengali ? 'চেক নম্বর' : 'Cheque No.'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                value={chequeNumber} 
                onChange={e => setChequeNumber(e.target.value)}
                placeholder="যেমন: ৭৪৮৩৯২১"
                className="w-full text-sm font-mono font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
          </div>

          {/* Amount & Clearing Date (2 Columns with Flexbox ৳ Symbol - No Overlap!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                {isBengali ? 'চেকের পরিমাণ (টাকা)' : 'Amount (BDT)'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition">
                <span className="text-base font-black text-blue-600 select-none">৳</span>
                <input 
                  type="number" 
                  step="any" 
                  required 
                  value={amountStr} 
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-black text-slate-900 bg-transparent focus:outline-none placeholder-slate-400" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                <Calendar size={13} className="inline mr-1 text-slate-400" />
                {isBengali ? 'ভাঙানোর তারিখ' : 'Clearing Date'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                required 
                value={clearingDate} 
                onChange={e => setClearingDate(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition cursor-pointer" 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button 
              type="submit"
              className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {isBengali ? 'চেক সংরক্ষণ করুন' : 'Save Cheque Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
