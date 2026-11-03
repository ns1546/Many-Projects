import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../utils/currency';
import { openWhatsAppDirect } from '../utils/whatsapp';
import {
  PartyPopper, CheckCircle2, ArrowLeft, Send, Sparkles, X, Gift,
  Target, Users, TrendingUp, Calendar, MessageCircle, Star,
  ChevronRight, ChevronLeft, Phone, Percent, Award, Clock, AlertCircle,
  Search, Check, Settings, Save, Wallet, Building2, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Halkhata() {
  const { customers, registers = [], settleHalkhata, halkhataCampaign, updateHalkhataCampaign } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali, locale } = useLocale();
  const navigate = useNavigate();

  // Campaign Configuration Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: halkhataCampaign?.title || 'পহেলা বৈশাখ ১৪৩৩ হালখাতা উৎসব',
    year: halkhataCampaign?.year || '১৪৩৩',
    defaultDiscountPct: halkhataCampaign?.defaultDiscountPct || 15,
    minDueTaka: halkhataCampaign?.minDueTaka || 500,
    giftDescription: halkhataCampaign?.giftDescription || 'মিষ্টির প্যাকেট ও বৈশাখী উপহার ক্যালেন্ডার',
    eventDate: halkhataCampaign?.eventDate || '২০২৬-০৪-১৪',
  });

  // Settlement Modal State
  const [settlingCustomer, setSettlingCustomer] = useState(null);
  const [cashCollectedTaka, setCashCollectedTaka] = useState('');
  const [waiverTaka, setWaiverTaka] = useState('');
  const [waiverPercent, setWaiverPercent] = useState('15');
  const [selectedRegisterId, setSelectedRegisterId] = useState('cash_drawer');
  const [search, setSearch] = useState('');

  // Segmented Status Filter & Pagination
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'HIGH_DUE' | 'SETTLED'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Eligible Customers filtered by Campaign Minimum Due threshold
  const minDueThresholdPoisha = (halkhataCampaign?.minDueTaka || 500) * 100;
  const eligibleCustomers = useMemo(() => {
    return (customers || []).filter(c => (c.currentDuePoisha || 0) >= minDueThresholdPoisha);
  }, [customers, minDueThresholdPoisha]);

  const totalDuesTargetPoisha = eligibleCustomers.reduce((sum, c) => sum + (c.currentDuePoisha || 0), 0);
  const avgDuePoisha = eligibleCustomers.length > 0 ? Math.round(totalDuesTargetPoisha / eligibleCustomers.length) : 0;

  const filteredCustomers = useMemo(() => {
    let list = (customers || []).filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );

    if (filterTab === 'ALL') {
      list = list.filter(c => (c.currentDuePoisha || 0) >= minDueThresholdPoisha);
    } else if (filterTab === 'HIGH_DUE') {
      list = list.filter(c => (c.currentDuePoisha || 0) >= 500000); // ৳5,000+
    } else if (filterTab === 'SETTLED') {
      list = list.filter(c => (c.currentDuePoisha || 0) === 0);
    }

    return [...list].sort((a, b) => (b.currentDuePoisha || 0) - (a.currentDuePoisha || 0));
  }, [customers, search, filterTab, minDueThresholdPoisha]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Open Settlement Modal with reactive calculations
  const openSettlement = (cust) => {
    setSettlingCustomer(cust);
    const dueTaka = poishaToTaka(cust.currentDuePoisha || 0);
    const defaultPct = halkhataCampaign?.defaultDiscountPct || 15;
    const initialWaiver = Math.round(dueTaka * (defaultPct / 100));
    const initialCash = Math.max(0, dueTaka - initialWaiver);

    setWaiverPercent(String(defaultPct));
    setWaiverTaka(String(initialWaiver));
    setCashCollectedTaka(String(initialCash));
    setSelectedRegisterId('cash_drawer');
  };

  // Two-way calculation handlers
  const handleWaiverPercentChange = (pctValue) => {
    setWaiverPercent(pctValue);
    if (!settlingCustomer) return;
    const dueTaka = poishaToTaka(settlingCustomer.currentDuePoisha || 0);
    const numPct = parseFloat(pctValue) || 0;
    const clampedPct = Math.min(100, Math.max(0, numPct));
    const calculatedWaiver = Math.round(dueTaka * (clampedPct / 100));
    const calculatedCash = Math.max(0, dueTaka - calculatedWaiver);
    setWaiverTaka(String(calculatedWaiver));
    setCashCollectedTaka(String(calculatedCash));
  };

  const handleWaiverTakaChange = (takaValue) => {
    setWaiverTaka(takaValue);
    if (!settlingCustomer) return;
    const dueTaka = poishaToTaka(settlingCustomer.currentDuePoisha || 0);
    const wTaka = parseFloat(takaValue) || 0;
    const calculatedCash = Math.max(0, dueTaka - wTaka);
    const calculatedPct = dueTaka > 0 ? Math.round((wTaka / dueTaka) * 100) : 0;
    setCashCollectedTaka(String(calculatedCash));
    setWaiverPercent(String(calculatedPct));
  };

  const handleCashCollectedChange = (takaValue) => {
    setCashCollectedTaka(takaValue);
    if (!settlingCustomer) return;
    const dueTaka = poishaToTaka(settlingCustomer.currentDuePoisha || 0);
    const cTaka = parseFloat(takaValue) || 0;
    const calculatedWaiver = Math.max(0, dueTaka - cTaka);
    const calculatedPct = dueTaka > 0 ? Math.round((calculatedWaiver / dueTaka) * 100) : 0;
    setWaiverTaka(String(calculatedWaiver));
    setWaiverPercent(String(calculatedPct));
  };

  const handleApplyPresetPct = (pct) => {
    handleWaiverPercentChange(String(pct));
  };

  const handleConfirmSettlement = () => {
    if (!settlingCustomer) return;
    settleHalkhata({
      customerId: settlingCustomer.id,
      cashCollectedPoisha: takaToPoisha(cashCollectedTaka || '0'),
      waiverPoisha: takaToPoisha(waiverTaka || '0'),
      registerId: selectedRegisterId || 'cash_drawer',
    });
    setSettlingCustomer(null);
  };

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    updateHalkhataCampaign({
      title: campaignForm.title,
      year: campaignForm.year,
      defaultDiscountPct: Number(campaignForm.defaultDiscountPct) || 15,
      minDueTaka: Number(campaignForm.minDueTaka) || 500,
      giftDescription: campaignForm.giftDescription,
      eventDate: campaignForm.eventDate,
    });
    toast.success(isBengali ? 'হালখাতা ক্যাম্পেইন সেটিংস সফলভাবে সংরক্ষিত!' : 'Halkhata campaign updated successfully!');
    setIsCampaignModalOpen(false);
  };

  const handleSendInvitation = (cust) => {
    const dueTaka = poishaToTaka(cust.currentDuePoisha || 0);
    const discountPct = halkhataCampaign?.defaultDiscountPct || 15;
    const text = `🎉 শুভ হালখাতা উৎসব ${halkhataCampaign?.year || '১৪৩৩'}!\n\nসম্মানিত গ্রাহক ${cust.name},\n${activeTenant?.name || 'দোকান'}-এ আপনার বর্তমান বকেয়া: ৳${dueTaka.toLocaleString()} টাকা।\nপহেলা বৈশাখ উপলক্ষে বিশেষ ${discountPct}% সম্মানজনক ছাড় এবং ${halkhataCampaign?.giftDescription || 'মিষ্টিমুখ ও উপহার'} সহ বকেয়া নিষ্পত্তির জন্য সাদর আমন্ত্রণ!\n\nধন্যবাদান্তে,\n${activeTenant?.name || 'দোকান কর্তৃপক্ষ'}`;
    openWhatsAppDirect(cust.phone, text);
    toast.success(isBengali ? 'দাওয়াত কার্ড হোয়াটসঅ্যাপে পাঠানো হয়েছে!' : 'Invitation sent on WhatsApp!');
  };

  const settledCount = customers.filter(c => (c.currentDuePoisha || 0) === 0).length;
  const progressPct = eligibleCustomers.length > 0
    ? Math.round(((eligibleCustomers.length - eligibleCustomers.filter(c => (c.currentDuePoisha || 0) > 0).length) / eligibleCustomers.length) * 100)
    : 0;

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── 1. Page Header with Campaign Settings Trigger ──────────────── */}
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
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 text-white shrink-0">
              <PartyPopper size={26} className="drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {halkhataCampaign?.title || (isBengali ? 'হালখাতা উৎসব ১৪৩৩' : 'Halkhata Festival')}
                </h1>
                <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                  {halkhataCampaign?.defaultDiscountPct || 15}% {isBengali ? 'ছাড় অফার' : 'Waiver'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                {isBengali ? 'সম্মানজনক বকেয়া আদায়, বৈশাখী উপহার ও কাস্টম ছাড় নিষ্পত্তি' : 'Annual debt recovery & settlement campaign with custom waiver %'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCampaignForm({
                title: halkhataCampaign?.title || 'পহেলা বৈশাখ ১৪৩৩ হালখাতা উৎসব',
                year: halkhataCampaign?.year || '১৪৩৩',
                defaultDiscountPct: halkhataCampaign?.defaultDiscountPct || 15,
                minDueTaka: halkhataCampaign?.minDueTaka || 500,
                giftDescription: halkhataCampaign?.giftDescription || 'মিষ্টির প্যাকেট ও বৈশাখী উপহার ক্যালেন্ডার',
                eventDate: halkhataCampaign?.eventDate || '২০২৬-০৪-১৪',
              });
              setIsCampaignModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs sm:text-sm font-extrabold shadow-xs transition cursor-pointer active:scale-95"
          >
            <Settings size={16} className="text-slate-700" />
            <span>{isBengali ? 'ক্যাম্পেইন কনফিগার ও অফার তৈরি' : 'Configure Campaign & % Off'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Festive Campaign Banner ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-950 p-6 md:p-8 shadow-xl shadow-slate-900/20 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-xs" />
        <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white/10 rounded-full blur-xs" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div className="flex items-center gap-2 text-amber-200 text-xs font-black uppercase tracking-wider">
              <Sparkles size={16} />
              <span>{halkhataCampaign?.title || 'পহেলা বৈশাখ ১৪৩৩ · বাংলা নববর্ষ হালখাতা অভিযান'}</span>
            </div>
            <div className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold">
              🎁 {halkhataCampaign?.giftDescription || 'মিষ্টিমুখ ও ক্যালেন্ডার উপহার'}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">
            {isBengali ? '🎉 বার্ষিক বকেয়া আদায় ও মিষ্টিমুখ উৎসব' : '🎉 Annual Debt Recovery & Settlement Festival'}
          </h2>

          {/* 4 Campaign Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/20">
            <div>
              <div className="flex items-center gap-1.5 text-pink-100 text-xs font-bold mb-1">
                <Target size={15} />
                <span>{isBengali ? 'আদায় লক্ষ্যমাত্রা' : 'Target'}</span>
              </div>
              <p className="font-black text-xl md:text-2xl tabular-nums">
                {formatCurrency(totalDuesTargetPoisha, { locale })}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-pink-100 text-xs font-bold mb-1">
                <Users size={15} />
                <span>{isBengali ? 'আমন্ত্রিত গ্রাহক' : 'Eligible'}</span>
              </div>
              <p className="font-black text-xl md:text-2xl tabular-nums">
                {eligibleCustomers.length} {isBengali ? 'জন' : 'people'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-pink-100 text-xs font-bold mb-1">
                <TrendingUp size={15} />
                <span>{isBengali ? 'গড় বকেয়া' : 'Average Due'}</span>
              </div>
              <p className="font-black text-xl md:text-2xl tabular-nums">
                {formatCurrency(avgDuePoisha, { locale })}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-pink-100 text-xs font-bold mb-1">
                <Percent size={15} />
                <span>{isBengali ? 'ডিফল্ট অফার' : 'Campaign Waiver'}</span>
              </div>
              <p className="font-black text-xl md:text-2xl tabular-nums">
                {halkhataCampaign?.defaultDiscountPct || 15}% {isBengali ? 'ছাড়' : 'Off'}
              </p>
            </div>
          </div>

          {/* Campaign Progress Bar */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="flex justify-between items-center mb-2 text-xs font-bold text-pink-100">
              <span>{isBengali ? 'হালখাতা অভিযানের সার্বিক অগ্রগতি' : 'Campaign Progress'}</span>
              <span className="font-black text-white">{progressPct}% {isBengali ? 'সম্পন্ন' : 'completed'}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-3 p-0.5 border border-white/20">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-700 shadow-sm" 
                style={{ width: `${Math.max(5, progressPct)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Filter Chips & Search Bar Strip ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => { setFilterTab('ALL'); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isBengali ? 'আমন্ত্রিত বাকি গ্রাহক' : 'All Eligible'} ({eligibleCustomers.length})
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab('HIGH_DUE'); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'HIGH_DUE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
            }`}
          >
            {isBengali ? '৳৫,০০০+ বড় বাকি' : 'High Due (৳5k+)'}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab('SETTLED'); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'SETTLED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
            }`}
          >
            {isBengali ? 'পরিশোধিত (০ বাকি)' : 'Fully Settled'} ({settledCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={isBengali ? 'গ্রাহকের নাম বা মোবাইল দিয়ে খুঁজুন...' : 'Search name or phone...'}
            className="w-full text-xs sm:text-sm font-semibold pl-11 pr-10 py-2.5 rounded-2xl border border-slate-200/90 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-800 transition shadow-2xs" 
          />
          {search && (
            <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── 5. Customer Cards ────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-14 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <PartyPopper size={32} />
            </div>
            <p className="font-black text-slate-900 text-base">
              {isBengali ? 'কোনো যোগ্য গ্রাহক পাওয়া যায়নি' : 'No eligible customers'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBengali ? `৳${halkhataCampaign?.minDueTaka || 500}+ টাকা বকেয়া থাকলে গ্রাহকদের এখানে পাওয়া যাবে।` : `Customers with ৳${halkhataCampaign?.minDueTaka || 500}+ due will appear here.`}
            </p>
          </div>
        ) : (
          paginatedCustomers.map(cust => {
            const dueTaka = poishaToTaka(cust.currentDuePoisha || 0);
            const defaultPct = halkhataCampaign?.defaultDiscountPct || 15;
            const suggestedWaiver = Math.round(dueTaka * (defaultPct / 100));
            const suggestedCash = Math.max(0, dueTaka - suggestedWaiver);

            return (
              <div
                key={cust.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 group"
              >
                {/* Left: Avatar & Customer Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-900 border border-indigo-200 flex items-center justify-center text-xl font-black shrink-0 shadow-xs">
                    {cust.name ? cust.name.charAt(0).toUpperCase() : 'ক'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-black text-base md:text-lg text-slate-900 leading-tight">
                        {cust.name}
                      </h3>
                      {cust.phone && (
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          <span>{cust.phone}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      {cust.address && (
                        <span className="text-slate-500 font-medium">
                          {cust.address}
                        </span>
                      )}
                      {/* Suggested Waiver Pill */}
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                        <Gift size={13} className="text-amber-600" />
                        <span>{defaultPct}% {isBengali ? 'ছাড়:' : 'Waiver:'} -৳{suggestedWaiver.toLocaleString()}</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                        → ৳{suggestedCash.toLocaleString()} {isBengali ? 'নগদ আদায়' : 'Cash Net'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between xl:justify-end gap-6 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left xl:text-right pr-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isBengali ? 'মোট বকেয়া পাওনা' : 'Total Due'}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-rose-600 tabular-nums tracking-tight">
                      {formatCurrency(cust.currentDuePoisha, { locale })}
                    </span>
                  </div>

                  {/* 1-Tap Actions: WhatsApp Invite & Festival Settle */}
                  <div className="flex items-center gap-3 shrink-0">
                    {cust.phone && (
                      <button 
                        type="button"
                        onClick={() => handleSendInvitation(cust)}
                        className="px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-extrabold transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
                        title="WhatsApp দাওয়াত পাঠান"
                      >
                        <MessageCircle size={16} className="text-emerald-600" />
                        <span>{isBengali ? 'দাওয়াত' : 'WhatsApp'}</span>
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => openSettlement(cust)}
                      className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Gift size={16} />
                      <span>{isBengali ? 'নিষ্পত্তি করুন' : 'Settle'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Toolbar */}
        {filteredCustomers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-semibold">
              <span>{isBengali ? 'প্রতি পেজে:' : 'Rows per page:'}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-bold bg-slate-50"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                {isBengali 
                  ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredCustomers.length)} (মোট ${filteredCustomers.length})`
                  : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredCustomers.length)} of ${filteredCustomers.length}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-bold text-slate-700 bg-slate-100 rounded-xl">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 6. Campaign Creator & Settings Modal ──────────────────────── */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95">
            <div className="px-6 py-5 bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <PartyPopper size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg">
                    {isBengali ? 'হালখাতা উৎসব ক্যাম্পেইন ও অফার সেটিংস' : 'Halkhata Campaign & Offer Setup'}
                  </h3>
                  <p className="text-xs text-pink-100 mt-0.5">
                    {isBengali ? 'ছাড়ের শতকরা হার (%), উপহার ও যোগ্যতার সীমা নির্ধারণ' : 'Set custom waiver %, gifts, and eligibility threshold'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCampaignModalOpen(false)} 
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 md:p-7 space-y-4">
              {/* Campaign Title */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  {isBengali ? 'ক্যাম্পেইন শিরোনাম' : 'Campaign Title'}
                </label>
                <input
                  type="text"
                  required
                  value={campaignForm.title}
                  onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  placeholder="যেমন: পহেলা বৈশাখ ১৪৩৩ হালখাতা উৎসব"
                  className="w-full text-sm font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-800 transition"
                />
              </div>

              {/* Year & Default % Off */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {isBengali ? 'বাংলা সন / বছর' : 'Bengali Year'}
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignForm.year}
                    onChange={e => setCampaignForm({ ...campaignForm, year: e.target.value })}
                    placeholder="১৪৩৩"
                    className="w-full text-sm font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {isBengali ? 'প্রস্তাবিত ছাড়ের হার (% Off)' : 'Default Waiver %'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-800 transition">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={campaignForm.defaultDiscountPct}
                      onChange={e => setCampaignForm({ ...campaignForm, defaultDiscountPct: e.target.value })}
                      placeholder="15"
                      className="w-full text-sm font-black bg-transparent focus:outline-none"
                    />
                    <span className="text-sm font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Min Due & Event Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {isBengali ? 'ন্যূনতম বকেয়া সীমা (টাকা)' : 'Min Due Threshold (BDT)'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-800 transition">
                    <span className="text-sm font-black text-slate-400">৳</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={campaignForm.minDueTaka}
                      onChange={e => setCampaignForm({ ...campaignForm, minDueTaka: e.target.value })}
                      placeholder="500"
                      className="w-full text-sm font-black bg-transparent focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{isBengali ? 'এর কম বকেয়া গ্রাহক তালিকায় আসবে না' : 'Dues below this won\'t be targeted'}</span>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {isBengali ? 'অনুষ্ঠান বা নিষ্পত্তির তারিখ' : 'Event Date'}
                  </label>
                  <input
                    type="date"
                    value={campaignForm.eventDate}
                    onChange={e => setCampaignForm({ ...campaignForm, eventDate: e.target.value })}
                    className="w-full text-sm font-bold px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-800 transition"
                  />
                </div>
              </div>

              {/* Gift / Incentive Description */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  {isBengali ? 'বৈশাখী মিষ্টিমুখ ও উপহার' : 'Festival Gift & Sweet Incentive'}
                </label>
                <input
                  type="text"
                  value={campaignForm.giftDescription}
                  onChange={e => setCampaignForm({ ...campaignForm, giftDescription: e.target.value })}
                  placeholder="যেমন: ১ কেজি প্রিমিয়াম মিষ্টি ও বৈশাখী ক্যাশমেমো ক্যালেন্ডার"
                  className="w-full text-sm font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-800 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg shadow-slate-900/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>{isBengali ? 'ক্যাম্পেইন সংরক্ষণ করুন' : 'Save Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Enhanced Settlement Modal with Custom % Off & Wallet Routing ── */}
      {settlingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg">
                    {isBengali ? 'হালখাতা বকেয়া নিষ্পত্তি ও সম্মাননা' : 'Halkhata Settlement & Custom Waiver'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {isBengali ? 'যেকোনো শতকরা হার (%) বা টাকার অঙ্কে ছাড় নির্ধারণ ও বকেয়া ০ করুন' : 'Apply any percentage waiver and clear debt with account deposit'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSettlingCustomer(null)} 
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmSettlement();
              }}
              className="p-6 md:p-7 space-y-5 overflow-y-auto"
            >
              {/* Customer Info Card */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-rose-600 font-black text-lg flex items-center justify-center shrink-0 shadow-xs border border-pink-200">
                  {settlingCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-base text-slate-900 truncate">{settlingCustomer.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{settlingCustomer.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')}</p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <p className="text-xs text-slate-400 font-bold uppercase">{isBengali ? 'মোট বকেয়া' : 'Total Due'}</p>
                  <p className="text-xl md:text-2xl font-black text-rose-600 tabular-nums">
                    {formatCurrency(settlingCustomer.currentDuePoisha, { locale })}
                  </p>
                </div>
              </div>

              {/* 1-Click Waiver Preset Chips (0% to 100%) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    {isBengali ? 'ছাড়ের শতকরা হার (% Off):' : 'Waiver Percentage Preset:'}
                  </label>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {waiverPercent}% {isBengali ? 'ছাড় নির্বাচিত' : 'Selected'}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleApplyPresetPct(pct)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 text-center border ${
                        Number(waiverPercent) === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-300'
                          : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Inputs with Flexbox & Custom % Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Custom % Input */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    <Percent size={13} className="inline mr-1 text-amber-600" />
                    {isBengali ? 'কাস্টম ছাড় (%)' : 'Custom % Off'}
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-3 rounded-2xl border-2 border-amber-200 bg-amber-50/40 focus-within:border-amber-500 focus-within:bg-white transition">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      step="any"
                      value={waiverPercent} 
                      onChange={e => handleWaiverPercentChange(e.target.value)}
                      className="w-full text-lg font-black text-amber-900 bg-transparent focus:outline-none tabular-nums placeholder-amber-300" 
                      placeholder="15"
                    />
                    <span className="text-base font-black text-amber-600 select-none">%</span>
                  </div>
                </div>

                {/* Waiver In Taka */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    <Gift size={13} className="inline mr-1 text-amber-600" />
                    {isBengali ? 'ছাড়ের টাকা (টাকা)' : 'Waiver (BDT)'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 border-amber-200 bg-amber-50/40 focus-within:border-amber-500 focus-within:bg-white transition">
                    <span className="text-base font-black text-amber-600 select-none">৳</span>
                    <input 
                      type="number" 
                      step="any"
                      value={waiverTaka} 
                      onChange={e => handleWaiverTakaChange(e.target.value)}
                      className="w-full text-lg font-black text-amber-900 bg-transparent focus:outline-none tabular-nums placeholder-amber-300" 
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Cash Collected Input */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    <CheckCircle2 size={13} className="inline mr-1 text-emerald-600" />
                    {isBengali ? 'নগদ আদায় (টাকা)' : 'Collected (BDT)'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 focus-within:border-emerald-500 focus-within:bg-white transition">
                    <span className="text-base font-black text-emerald-600 select-none">৳</span>
                    <input 
                      type="number" 
                      step="any"
                      value={cashCollectedTaka} 
                      onChange={e => handleCashCollectedChange(e.target.value)}
                      className="w-full text-lg font-black text-emerald-800 bg-transparent focus:outline-none tabular-nums placeholder-emerald-300" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Account / Wallet Selector */}
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  <Wallet size={14} className="inline mr-1 text-slate-500" />
                  {isBengali ? 'টাকা জমার একাউন্ট বা ক্যাশবাক্স নির্বাচন করুন:' : 'Deposit Funds Into Account:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {registers.map(reg => {
                    const isSelected = selectedRegisterId === reg.id;
                    const isCash = reg.category === 'CASH' || reg.id === 'cash_drawer';
                    const isMfs = reg.category === 'MFS' || reg.provider;
                    const isBank = reg.category === 'BANK';

                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setSelectedRegisterId(reg.id)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 font-black shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCash && <Wallet size={16} className={isSelected ? 'text-emerald-700' : 'text-slate-500'} />}
                          {isMfs && <Smartphone size={16} className={isSelected ? 'text-indigo-700' : 'text-indigo-500'} />}
                          {isBank && <Building2 size={16} className={isSelected ? 'text-indigo-700' : 'text-indigo-600'} />}
                          <span className="text-xs font-black truncate">{reg.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          ব্যালেন্স: ৳{poishaToTaka(reg.balancePoisha || 0).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Settlement Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4.5 space-y-2 border border-slate-200/80">
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600">
                  <span>{isBengali ? 'নগদ আদায়:' : 'Collected:'}</span>
                  <span className="text-emerald-600 font-extrabold tabular-nums">+৳{Number(cashCollectedTaka || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600">
                  <span>{isBengali ? `সম্মানজনক ছাড় (${waiverPercent}%):` : `Waiver (${waiverPercent}%):`}</span>
                  <span className="text-amber-600 font-extrabold tabular-nums">-৳{Number(waiverTaka || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{isBengali ? 'মোট নিষ্পত্তি ও বকেয়া শূন্য:' : 'Total Cleared (Balance → 0):'}</span>
                  <span className="text-emerald-700 tabular-nums">৳{(Number(cashCollectedTaka || 0) + Number(waiverTaka || 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSettlingCustomer(null)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>{isBengali ? 'নিষ্পত্তি সম্পন্ন করুন' : 'Confirm Settlement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
