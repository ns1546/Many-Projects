import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, poishaToTaka } from '../../utils/currency';
import { buildDueReminderMessage, openWhatsAppDirect } from '../../utils/whatsapp';
import toast from 'react-hot-toast';

import QuickTransactionModal from './QuickTransactionModal';

import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  MessageCircle,
  Users,
  Building2,
  Wallet,
  ChevronRight,
  Search,
  UserPlus,
  Phone,
  Receipt,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Zap,
  ShoppingCart,
  Package,
  BarChart3,
  Landmark,
  PartyPopper,
  Warehouse,
  Settings,
  Sparkles,
  Layers
} from 'lucide-react';

export default function EasyKhataDashboard() {
  const navigate = useNavigate();
  const { customers, suppliers, products, cheques, ledgerEntries, totalPaboPoisha, totalDiboPoisha, registers } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();

  // Quick Action Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('PABO');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Active Khata Notebook Tab
  const [activeTab, setActiveTab] = useState('CUSTOMERS'); // 'CUSTOMERS' | 'SUPPLIERS' | 'PASSBOOK'

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states for clean section data display
  const [customerPage, setCustomerPage] = useState(1);
  const [supplierPage, setSupplierPage] = useState(1);
  const [passbookPage, setPassbookPage] = useState(1);
  const PAGE_SIZE = 8;

  // Reset page when search or tab changes
  useEffect(() => {
    setCustomerPage(1);
    setSupplierPage(1);
    setPassbookPage(1);
  }, [searchTerm, activeTab]);

  // Keyboard Shortcuts for Instant Counter Operations without Mouse
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;
      if (isInput || isModalOpen) return;

      if (e.key === '+' || e.key === '=' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        openAction('PABO');
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        openAction('DIBO');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openAction = (type, customerId = null) => {
    setModalType(type);
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
  };
  const dueCustomers = useMemo(() => {
    return [...(customers || [])]
      .filter((c) => (c.currentDuePoisha || 0) > 0)
      .sort((a, b) => b.currentDuePoisha - a.currentDuePoisha);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const list = dueCustomers.length > 0 ? dueCustomers : (customers || []);
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  }, [dueCustomers, customers, searchTerm]);

  // Suppliers with due
  const dueSuppliers = useMemo(() => {
    return [...(suppliers || [])]
      .filter((s) => (s.balancePoisha || s.currentDuePoisha || 0) > 0)
      .sort((a, b) => (b.balancePoisha || b.currentDuePoisha || 0) - (a.balancePoisha || a.currentDuePoisha || 0));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const list = dueSuppliers.length > 0 ? dueSuppliers : (suppliers || []);
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.phone && s.phone.includes(q))
    );
  }, [dueSuppliers, suppliers, searchTerm]);

  // Today's Recent Transactions
  const recentEntries = useMemo(() => {
    return (ledgerEntries || []).slice(0, 40);
  }, [ledgerEntries]);

  // Paginated Slices for Focused, Serene Screen Presentation
  const paginatedCustomers = useMemo(() => {
    const start = (customerPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, customerPage]);
  const totalCustomerPages = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1;

  const paginatedSuppliers = useMemo(() => {
    const start = (supplierPage - 1) * PAGE_SIZE;
    return filteredSuppliers.slice(start, start + PAGE_SIZE);
  }, [filteredSuppliers, supplierPage]);
  const totalSupplierPages = Math.ceil(filteredSuppliers.length / PAGE_SIZE) || 1;

  const paginatedPassbook = useMemo(() => {
    const start = (passbookPage - 1) * PAGE_SIZE;
    return recentEntries.slice(start, start + PAGE_SIZE);
  }, [recentEntries, passbookPage]);
  const totalPassbookPages = Math.ceil(recentEntries.length / PAGE_SIZE) || 1;

  // Cash and bKash balance
  const cashRegister = (registers || []).find((r) => r.id === 'cash_drawer');
  const bkashRegister = (registers || []).find((r) => r.id === 'bkash_merchant' || r.id === 'bkash_mfs');
  const totalCashPoisha = (cashRegister?.balancePoisha || 0);
  const totalBkashPoisha = (bkashRegister?.balancePoisha || 0);
  const totalLiquidPoisha = totalCashPoisha + totalBkashPoisha;

  // Alerts and live metrics for Services Grid
  const lowStockCount = useMemo(() => {
    return (products || []).filter(p => (p.currentStockInBaseUnit || p.stock || 0) <= (p.lowStockAlertThreshold || 10)).length;
  }, [products]);

  const pendingChequesCount = useMemo(() => {
    return (cheques || []).filter(c => c.status === 'PENDING' || !c.isCleared).length;
  }, [cheques]);


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
    toast.success(isBengali ? 'হোয়াটসঅ্যাপে তাগাদা পাঠানো হয়েছে!' : 'WhatsApp reminder sent!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn select-none font-sans">
      
      {/* ── 1. Clean Warm Greeting & Date ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{isBengali ? 'আসসালামু আলাইকুম!' : 'Welcome!'}</span>
            <span className="text-sm font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-2xl border border-emerald-200">
              {activeTenant?.name || (isBengali ? 'আমার দোকান' : 'My Shop')}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            {isBengali ? 'আজকের দেনা-পাওনা, বিক্রি ও খরচের সহজ ডিজিটাল খাতা' : 'Daily simple ledger for dues, sales & expenses'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <Calendar size={15} className="text-emerald-600" />
          <span>
            {new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── 2. Unified bKash-Style Store Balance Card (দোকানের মোট খাতা ও ক্যাশ স্থিতি) ── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              {isBengali ? 'দোকানের মোট দেনা-পাওনা ও ক্যাশ স্থিতি' : 'Store Dues & Cash Liquidity'}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            {isBengali ? 'লাইভ হিসাব' : 'Live Sync'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* ১. মোট বাকি পাওনা (আপনি পাবেন) */}
          <div 
            onClick={() => setActiveTab('CUSTOMERS')}
            className="p-4.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/60 border border-rose-200/80 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{isBengali ? 'আপনি পাবেন (কাস্টমার বাকি)' : 'You Will Receive'}</span>
              </span>
              <ChevronRight size={15} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight my-1 tabular-nums">
              ৳ {poishaToTaka(totalPaboPoisha).toLocaleString()}
            </div>
            <p className="text-[11px] font-bold text-rose-800/80">
              {isBengali ? `${dueCustomers.length} জন কাস্টমারের কাছে পাওনা` : `${dueCustomers.length} customers with dues`}
            </p>
          </div>

          {/* ২. মোট মহাজন দেনা (আপনি দেবেন) */}
          <div 
            onClick={() => setActiveTab('SUPPLIERS')}
            className="p-4.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/60 border border-purple-200/80 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-purple-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{isBengali ? 'আপনি দেবেন (মহাজন দেনা)' : 'You Will Pay'}</span>
              </span>
              <ChevronRight size={15} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight my-1 tabular-nums">
              ৳ {poishaToTaka(totalDiboPoisha).toLocaleString()}
            </div>
            <p className="text-[11px] font-bold text-purple-800/80">
              {isBengali ? `${dueSuppliers.length} জন মহাজনকে দিতে হবে` : `${dueSuppliers.length} suppliers payable`}
            </p>
          </div>

          {/* ৩. ক্যাশবাক্সে নগদ টাকা */}
          <div 
            onClick={() => navigate('/cashbox')}
            className="p-4.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/60 border border-emerald-200/80 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isBengali ? 'ক্যাশবাক্স ও ড্রয়ার স্থিতি' : 'Cash in Hand'}</span>
              </span>
              <ChevronRight size={15} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight my-1 tabular-nums">
              ৳ {poishaToTaka(totalLiquidPoisha).toLocaleString()}
            </div>
            <p className="text-[11px] font-bold text-emerald-800/80 truncate">
              {isBengali ? `নগদ ৳${poishaToTaka(totalCashPoisha).toLocaleString()} • বিকাশ ৳${poishaToTaka(totalBkashPoisha).toLocaleString()}` : 'Cash & bKash in till'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. The 4 Hero Core Operations (Instant Keyboard Hotkeys for Busy Hours) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Action 1: + টাকা পেলাম (Green) */}
        <button
          type="button"
          onClick={() => openAction('PABO')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer border border-emerald-400/40 group min-h-[110px]"
          title="টাকা আদায় রেকর্ড (হটকি: Space বা +)"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownLeft size={24} className="stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/30">
                Space বা +
              </kbd>
              <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">
                {isBengali ? 'জমা' : 'In'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {isBengali ? '+ টাকা পেলাম' : '+ Cash Received'}
            </h3>
            <p className="text-[11px] text-emerald-100 font-medium truncate mt-0.5">
              {isBengali ? 'কাস্টমারের বাকি আদায়' : 'Customer due payment'}
            </p>
          </div>
        </button>

        {/* Action 2: - বাকি দিলাম (Red) */}
        <button
          type="button"
          onClick={() => openAction('DIBO')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer border border-rose-400/40 group min-h-[110px]"
          title="বাকি প্রদান রেকর্ড (হটকি: -)"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight size={24} className="stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/30">
                -
              </kbd>
              <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">
                {isBengali ? 'বাকি' : 'Out'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {isBengali ? '- বাকি দিলাম' : '- Give Credit'}
            </h3>
            <p className="text-[11px] text-rose-100 font-medium truncate mt-0.5">
              {isBengali ? 'কাস্টমারকে বাকি প্রদান' : 'Record credit sale'}
            </p>
          </div>
        </button>

        {/* Action 3: নগদ বিক্রি (Amber/Orange) */}
        <button
          type="button"
          onClick={() => openAction('SALE')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer border border-amber-300/40 group min-h-[110px]"
          title="নগদ বিক্রয় (হটকি: F1 দিয়ে সম্পূর্ণ কাউন্টার)"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/30">
                F1 কাউন্টার
              </kbd>
              <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">
                {isBengali ? 'বিক্রি' : 'Sale'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {isBengali ? 'নগদ বিক্রি' : 'Cash Sale'}
            </h3>
            <p className="text-[11px] text-amber-100 font-medium truncate mt-0.5">
              {isBengali ? 'রশিদ ছাড়া চটজলদি বিক্রি' : 'Quick instant sale'}
            </p>
          </div>
        </button>

        {/* Action 4: দোকান খরচ (Purple) */}
        <button
          type="button"
          onClick={() => openAction('EXPENSE')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer border border-purple-400/40 group min-h-[110px]"
          title="দোকান খরচ এন্ট্রি"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">
                {isBengali ? 'খরচ' : 'Expense'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {isBengali ? 'দোকান খরচ' : 'Shop Expense'}
            </h3>
            <p className="text-[11px] text-purple-100 font-medium truncate mt-0.5">
              {isBengali ? 'চা-নাস্তা, বিদ্যুৎ বিল ইত্যাদি' : 'Daily expenses & bills'}
            </p>
          </div>
        </button>
      </div>

      {/* ── 4. bKash-Style Super-App Services Grid (দোকানের সকল সেবা ও খাতা) ── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isBengali ? 'দোকানের সকল সেবা ও খাতা' : 'All Shop Services & Khata'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isBengali ? 'সহজে ১-ট্যাপে প্রয়োজনীয় ফিচার ব্যবহার করুন' : 'Instant 1-tap access to all store operations'}
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-600" />
            <span>{isBengali ? 'সহজ মোড সক্রিয়' : 'Easy Mode Active'}</span>
          </span>
        </div>

        {/* 10 Services Grid (bKash Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
          {/* Tile 1: ক্যাশ কাউন্টার / পিওএস */}
          <button
            type="button"
            onClick={() => navigate('/pos')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-110 transition-transform mb-2 relative">
              <Zap size={22} className="fill-amber-300 text-amber-300" />
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-slate-900 text-white px-1.5 py-0.2 rounded-full border border-slate-700 shadow-2xs">
                F1
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-slate-900 leading-tight">
              {isBengali ? 'ক্যাশ কাউন্টার' : 'Express POS'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'দ্রুত বিক্রয় ও মেমো' : 'Billing & Memo'}
            </span>
          </button>

          {/* Tile 2: কাস্টমার বাকি খাতা */}
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-rose-50/80 border border-slate-200/70 hover:border-rose-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-110 transition-transform mb-2 relative">
              <Users size={22} />
              {dueCustomers.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                  {dueCustomers.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-rose-600 leading-tight">
              {isBengali ? 'কাস্টমার বাকি' : 'Customer Khata'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'বাকি ও তাগাদা' : 'Dues & Reminders'}
            </span>
          </button>

          {/* Tile 3: মহাজন দেনা খাতা */}
          <button
            type="button"
            onClick={() => navigate('/suppliers')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-purple-50/80 border border-slate-200/70 hover:border-purple-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform mb-2 relative">
              <Building2 size={22} />
              {dueSuppliers.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                  {dueSuppliers.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-purple-600 leading-tight">
              {isBengali ? 'মহাজন খাতা' : 'Supplier Khata'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'মাল ক্রয় ও দেনা' : 'Bills & Payables'}
            </span>
          </button>

          {/* Tile 4: পণ্য ও স্টক */}
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform mb-2 relative">
              <Package size={22} />
              {lowStockCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                  {lowStockCount} কম
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-blue-600 leading-tight">
              {isBengali ? 'পণ্য ও স্টক' : 'Inventory'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'মালের মজুত ও দাম' : 'Stock & Pricing'}
            </span>
          </button>

          {/* Tile 5: ক্যাশবাক্স ও ড্রয়ার */}
          <button
            type="button"
            onClick={() => navigate('/cashbox')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform mb-2">
              <Wallet size={22} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-emerald-700 leading-tight">
              {isBengali ? 'ক্যাশবাক্স ও খরচ' : 'Cashbox'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'ড্রয়ার ও বিকাশ' : 'Till & bKash'}
            </span>
          </button>

          {/* Tile 6: লাভ-ক্ষতি ও রিপোর্ট */}
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-amber-50/80 border border-slate-200/70 hover:border-amber-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform mb-2">
              <BarChart3 size={22} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-amber-700 leading-tight">
              {isBengali ? 'লাভ-ক্ষতি ও হিসাব' : 'Reports & P&L'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'দৈনিক বিক্রি ও লাভ' : 'Daily Sales & Profit'}
            </span>
          </button>

          {/* Tile 7: ব্যাংক চেক খাতা */}
          <button
            type="button"
            onClick={() => navigate('/cheques')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-teal-50/80 border border-slate-200/70 hover:border-teal-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform mb-2 relative">
              <Landmark size={22} />
              {pendingChequesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-teal-600 text-white px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                  {pendingChequesCount}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-teal-700 leading-tight">
              {isBengali ? 'ব্যাংক চেক খাতা' : 'Cheques'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'জমা ও ক্লিয়ারিং' : 'Cheque Tracking'}
            </span>
          </button>

          {/* Tile 8: হালখাতা উৎসব */}
          <button
            type="button"
            onClick={() => navigate('/halkhata')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform mb-2">
              <PartyPopper size={22} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-indigo-700 leading-tight">
              {isBengali ? 'হালখাতা উৎসব' : 'Halkhata'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'উপহার ও কার্ড' : 'Festival & Gifts'}
            </span>
          </button>

          {/* Tile 9: গুদাম ও চালানি */}
          <button
            type="button"
            onClick={() => navigate('/godown')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/70 hover:border-slate-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-500/20 group-hover:scale-110 transition-transform mb-2">
              <Warehouse size={22} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-slate-900 leading-tight">
              {isBengali ? 'গুদাম ও চালানি' : 'Godown Khata'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'মাল রিসিভ ও স্থানান্তর' : 'Stock Transfer'}
            </span>
          </button>

          {/* Tile 10: দোকান সেটিংস */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/70 hover:border-slate-300 transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center shadow-md shadow-slate-600/20 group-hover:scale-110 transition-transform mb-2">
              <Settings size={22} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-slate-900 leading-tight">
              {isBengali ? 'দোকান সেটিংস' : 'Settings'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isBengali ? 'প্রিন্টার ও ক্লাউড ব্যাকআপ' : 'Printer & Backup'}
            </span>
          </button>
        </div>
      </div>

      {/* ── 5. The Digital Khata Notebook (Tabbed, Focused & Serene) ── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm space-y-5">
        
        {/* Notebook Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setActiveTab('CUSTOMERS'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'CUSTOMERS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users size={16} />
              <span>{isBengali ? `কাস্টমার বাকি (${dueCustomers.length})` : `Customers (${dueCustomers.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('SUPPLIERS'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'SUPPLIERS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Building2 size={16} />
              <span>{isBengali ? `মহাজন দেনা (${dueSuppliers.length})` : `Suppliers (${dueSuppliers.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('PASSBOOK'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'PASSBOOK'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText size={16} />
              <span>{isBengali ? 'আজকের খাতা' : 'Today Passbook'}</span>
            </button>
          </div>

          {/* Search Input for Current Tab with / Keyboard Shortcut Hint */}
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'CUSTOMERS'
                  ? (isBengali ? 'কাস্টমারের নাম বা ফোন... (Enter দিলে হিসাব)' : 'Search customer... (Enter to open)')
                  : activeTab === 'SUPPLIERS'
                  ? (isBengali ? 'মহাজনের নাম বা ফোন... (Enter দিলে খাতা)' : 'Search supplier... (Enter to open)')
                  : (isBengali ? 'বিবরণ খুঁজুন...' : 'Search entries...')
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (activeTab === 'CUSTOMERS' && filteredCustomers && filteredCustomers.length > 0) {
                    openAction('PABO', filteredCustomers[0].id);
                  } else if (activeTab === 'SUPPLIERS' && filteredSuppliers && filteredSuppliers.length > 0) {
                    navigate('/suppliers');
                  }
                }
              }}
              className="w-full pl-10 pr-9 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-hidden font-medium"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded pointer-events-none hidden sm:inline" title="খুঁজতে / চাপুন">
              /
            </kbd>
          </div>
        </div>

        {/* ── TAB 1: কাস্টমার বাকি খাতা ── */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                {isBengali ? 'বাকি গ্রাহকদের তালিকা • টাকা আদায় ও হোয়াটসঅ্যাপ তাগাদা' : 'Customer dues list • Collect payment & send WhatsApp reminder'}
              </span>
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isBengali ? 'সম্পূর্ণ কাস্টমার খাতা' : 'Full Customer Khata'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                {isBengali ? 'কোনো কাস্টমার পাওয়া যায়নি।' : 'No customers found.'}
              </div>
            ) : (
              paginatedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-4 bg-slate-50/70 hover:bg-rose-50/30 rounded-2xl border border-slate-200/80 hover:border-rose-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 font-black text-lg flex items-center justify-center shrink-0 shadow-2xs">
                      {cust.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 truncate">{cust.name}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{cust.phone || (isBengali ? 'মোবাইল নেই' : 'No Phone')}</span>
                        {cust.address && (
                          <span className="text-slate-400 hidden md:inline truncate">• {cust.address}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-black text-rose-600 block">
                        ৳ {poishaToTaka(cust.currentDuePoisha || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">{isBengali ? 'বাকি পাওনা' : 'Due'}</span>
                    </div>

                    {/* 1-Tap Collect Money */}
                    <button
                      type="button"
                      onClick={() => openAction('PABO', cust.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer active:scale-95 transition flex items-center gap-1.5"
                      title={isBengali ? 'টাকা আদায় লিখুন' : 'Collect Due'}
                    >
                      <ArrowDownLeft size={16} />
                      <span>{isBengali ? '+ টাকা নিন' : '+ In'}</span>
                    </button>

                    {/* 1-Tap Give Credit */}
                    <button
                      type="button"
                      onClick={() => openAction('DIBO', cust.id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer active:scale-95 transition flex items-center gap-1.5"
                      title={isBengali ? 'বাকি প্রদান লিখুন' : 'Give Credit'}
                    >
                      <ArrowUpRight size={16} />
                      <span>{isBengali ? '- বাকি দিন' : '- Out'}</span>
                    </button>

                    {/* 1-Tap WhatsApp Reminder */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppReminder(cust)}
                      className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                      title={isBengali ? 'হোয়াটসঅ্যাপে তাগাদা পাঠান' : 'Send WhatsApp Reminder'}
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination Controls */}
            {filteredCustomers.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                <span>
                  {isBengali ? `মোট ${filteredCustomers.length} জনের মধ্যে ${(customerPage - 1) * PAGE_SIZE + 1} - ${Math.min(customerPage * PAGE_SIZE, filteredCustomers.length)} জন` : `Showing ${(customerPage - 1) * PAGE_SIZE + 1} - ${Math.min(customerPage * PAGE_SIZE, filteredCustomers.length)} of ${filteredCustomers.length}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={customerPage <= 1}
                    onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    ◀ {isBengali ? 'আগের পাতা' : 'Prev'}
                  </button>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-black">
                    {customerPage} / {totalCustomerPages}
                  </span>
                  <button
                    disabled={customerPage >= totalCustomerPages}
                    onClick={() => setCustomerPage(p => Math.min(totalCustomerPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    {isBengali ? 'পরের পাতা' : 'Next'} ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: মহাজন দেনা খাতা ── */}
        {activeTab === 'SUPPLIERS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                {isBengali ? 'পাইকারি মহাজনদের তালিকা • দেনা পরিশোধ' : 'Suppliers list • Pay outstanding supplier balance'}
              </span>
              <button
                type="button"
                onClick={() => navigate('/suppliers')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isBengali ? 'সম্পূর্ণ মহাজন খাতা' : 'Full Supplier Khata'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {filteredSuppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                {isBengali ? 'কোনো মহাজন পাওয়া যায়নি।' : 'No suppliers found.'}
              </div>
            ) : (
              paginatedSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="p-4 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center shrink-0 shadow-2xs">
                      {sup.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 truncate">{sup.name}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{sup.phone || (isBengali ? 'মোবাইল নেই' : 'No Phone')}</span>
                        {sup.company && (
                          <span className="text-slate-400 hidden md:inline truncate">• {sup.company}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-black text-indigo-700 block">
                        ৳ {poishaToTaka(sup.balancePoisha || sup.currentDuePoisha || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">{isBengali ? 'দিতে হবে' : 'Payable'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/suppliers')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Building2 size={16} />
                      <span>{isBengali ? 'পরিশোধ করুন' : 'Pay'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination Controls */}
            {filteredSuppliers.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                <span>
                  {isBengali ? `মোট ${filteredSuppliers.length} জনের মধ্যে ${(supplierPage - 1) * PAGE_SIZE + 1} - ${Math.min(supplierPage * PAGE_SIZE, filteredSuppliers.length)} জন` : `Showing ${(supplierPage - 1) * PAGE_SIZE + 1} - ${Math.min(supplierPage * PAGE_SIZE, filteredSuppliers.length)} of ${filteredSuppliers.length}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={supplierPage <= 1}
                    onClick={() => setSupplierPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    ◀ {isBengali ? 'আগের পাতা' : 'Prev'}
                  </button>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-black">
                    {supplierPage} / {totalSupplierPages}
                  </span>
                  <button
                    disabled={supplierPage >= totalSupplierPages}
                    onClick={() => setSupplierPage(p => Math.min(totalSupplierPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    {isBengali ? 'পরের পাতা' : 'Next'} ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: আজকের খাতা (লেনদেন বিবরণী) ── */}
        {activeTab === 'PASSBOOK' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                {isBengali ? 'আজকে যে হিসাবগুলো এন্ট্রি করা হয়েছে' : 'Entries recorded today'}
              </span>
              <button
                type="button"
                onClick={() => navigate('/cashbox')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isBengali ? 'ক্যাশবাক্স বিস্তারিত' : 'Cashbox Details'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {recentEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                {isBengali ? 'আজকে এখনও কোনো লেনদেন লেখা হয়নি।' : 'No transactions recorded today.'}
              </div>
            ) : (
              paginatedPassbook.map((entry) => {
                const isPositive = entry.type === 'PABO' || entry.type === 'CASH_IN' || entry.type === 'SALE';
                return (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">
                          {entry.customerName || entry.description || (isPositive ? 'নগদ জমা / বিক্রি' : 'খরচ / বাকি প্রদান')}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Clock size={11} />
                          <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'আজ'}</span>
                          <span>•</span>
                          <span>{entry.account === 'bkash' ? 'বিকাশ মার্চেন্ট' : 'ক্যাশ ড্রয়ার'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-sm sm:text-base tabular-nums ${
                          isPositive ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'} ৳ {poishaToTaka(entry.amountPoisha || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {isPositive ? (isBengali ? 'জমা' : 'In') : (isBengali ? 'প্রদান/খরচ' : 'Out')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {recentEntries.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                <span>
                  {isBengali ? `মোট ${recentEntries.length} টির মধ্যে ${(passbookPage - 1) * PAGE_SIZE + 1} - ${Math.min(passbookPage * PAGE_SIZE, recentEntries.length)} টি` : `Showing ${(passbookPage - 1) * PAGE_SIZE + 1} - ${Math.min(passbookPage * PAGE_SIZE, recentEntries.length)} of ${recentEntries.length}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={passbookPage <= 1}
                    onClick={() => setPassbookPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    ◀ {isBengali ? 'আগের পাতা' : 'Prev'}
                  </button>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-black">
                    {passbookPage} / {totalPassbookPages}
                  </span>
                  <button
                    disabled={passbookPage >= totalPassbookPages}
                    onClick={() => setPassbookPage(p => Math.min(totalPassbookPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    {isBengali ? 'পরের পাতা' : 'Next'} ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── 5. Quick Transaction Modal for Instant Entries ── */}
      <QuickTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        defaultCustomerId={selectedCustomerId}
      />
    </div>
  );
}
