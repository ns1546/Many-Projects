import React, { useState, useMemo } from 'react';
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
  FileText
} from 'lucide-react';

export default function EasyKhataDashboard() {
  const navigate = useNavigate();
  const { customers, suppliers, ledgerEntries, totalPaboPoisha, totalDiboPoisha, registers } = useKhata();
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

  // Top Due Customers (Sorted by highest outstanding due)
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
    return (ledgerEntries || []).slice(0, 15);
  }, [ledgerEntries]);

  // Cash and bKash balance
  const cashRegister = (registers || []).find((r) => r.id === 'cash_drawer');
  const bkashRegister = (registers || []).find((r) => r.id === 'bkash_merchant' || r.id === 'bkash_mfs');
  const totalCashPoisha = (cashRegister?.balancePoisha || 0);
  const totalBkashPoisha = (bkashRegister?.balancePoisha || 0);
  const totalLiquidPoisha = totalCashPoisha + totalBkashPoisha;

  const openAction = (type, customerId = null) => {
    setModalType(type);
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
  };

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

      {/* ── 2. The 3 Clear Golden Figures (No buttons inside, just crystal clear numbers) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ১. মোট বাকি পাওনা (আপনি পাবেন) */}
        <div 
          onClick={() => setActiveTab('CUSTOMERS')}
          className="bg-white rounded-3xl p-5 border-2 border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{isBengali ? 'আপনি পাবেন (কাস্টমার বাকি)' : 'You Will Get'}</span>
            </span>
            <ChevronRight size={16} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight my-1">
            ৳ {poishaToTaka(totalPaboPoisha).toLocaleString()}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {isBengali ? `${dueCustomers.length} জন কাস্টমারের কাছে বাকি পাওনা` : `${dueCustomers.length} customers with dues`}
          </p>
        </div>

        {/* ২. মোট মহাজন দেনা (আপনি দেবেন) */}
        <div 
          onClick={() => setActiveTab('SUPPLIERS')}
          className="bg-white rounded-3xl p-5 border-2 border-indigo-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{isBengali ? 'আপনি দেবেন (মহাজন দেনা)' : 'You Will Pay'}</span>
            </span>
            <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-3xl font-black text-indigo-700 tracking-tight my-1">
            ৳ {poishaToTaka(totalDiboPoisha).toLocaleString()}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {isBengali ? `${dueSuppliers.length} জন মহাজনকে দিতে হবে` : `${dueSuppliers.length} suppliers payable`}
          </p>
        </div>

        {/* ৩. ক্যাশবাক্সে নগদ টাকা */}
        <div 
          onClick={() => navigate('/cashbox')}
          className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isBengali ? 'আজকের নগদ ক্যাশ ও ড্রয়ার' : 'Cash in Hand'}</span>
            </span>
            <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight my-1">
            ৳ {poishaToTaka(totalLiquidPoisha).toLocaleString()}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {isBengali ? `ক্যাশ ৳${poishaToTaka(totalCashPoisha).toLocaleString()} • বিকাশ ৳${poishaToTaka(totalBkashPoisha).toLocaleString()}` : 'Cash & bKash balance'}
          </p>
        </div>
      </div>

      {/* ── 3. The 2 Master Action Buttons (+ টাকা পেলাম | - বাকি দিলাম) ── */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Master Button 1: টাকা পেলাম (Green) */}
          <button
            type="button"
            onClick={() => openAction('PABO')}
            className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-98 transition-all text-left flex items-center justify-between cursor-pointer group border-2 border-emerald-400/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                <ArrowDownLeft size={32} className="stroke-[3]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {isBengali ? 'টাকা আদায় ও জমা' : 'Cash In'}
                </span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {isBengali ? '+ টাকা পেলাম' : '+ Money Received'}
                </h3>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {isBengali ? 'কাস্টমারের বাকি টাকা জমা বা ক্যাশ বিক্রি' : 'Record money received from customer'}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ChevronRight size={20} />
            </div>
          </button>

          {/* Master Button 2: বাকি দিলাম (Red) */}
          <button
            type="button"
            onClick={() => openAction('DIBO')}
            className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white shadow-xl shadow-rose-600/20 hover:shadow-rose-600/35 hover:scale-[1.01] active:scale-98 transition-all text-left flex items-center justify-between cursor-pointer group border-2 border-rose-400/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                <ArrowUpRight size={32} className="stroke-[3]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {isBengali ? 'বাকি প্রদান' : 'Credit Given'}
                </span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {isBengali ? '- বাকি দিলাম' : '- Give Credit'}
                </h3>
                <p className="text-xs text-rose-100 font-medium mt-0.5">
                  {isBengali ? 'কাস্টমারকে চাল, ডাল বা মাল বাকিতে দেওয়া' : 'Record goods given to customer on credit'}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>

        {/* 2 Neat Secondary Chips */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => openAction('SALE')}
            className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs active:scale-95"
          >
            <ShoppingBag size={15} className="text-amber-600" />
            <span>{isBengali ? 'সহজ নগদ বিক্রি (রশিদ ছাড়া)' : 'Quick Cash Sale'}</span>
          </button>

          <button
            type="button"
            onClick={() => openAction('EXPENSE')}
            className="px-4 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100/90 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs active:scale-95"
          >
            <Receipt size={15} className="text-purple-600" />
            <span>{isBengali ? 'দোকান খরচ (চা-নাস্তা, বিল)' : 'Shop Expenses'}</span>
          </button>
        </div>
      </div>

      {/* ── 4. The Digital Khata Notebook (Tabbed, Focused & Serene) ── */}
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

          {/* Search Input for Current Tab */}
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'CUSTOMERS'
                  ? (isBengali ? 'কাস্টমারের নাম বা ফোন নম্বর...' : 'Search customer name or phone...')
                  : activeTab === 'SUPPLIERS'
                  ? (isBengali ? 'মহাজনের নাম বা ফোন...' : 'Search supplier...')
                  : (isBengali ? 'বিবরণ খুঁজুন...' : 'Search entries...')
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-hidden font-medium"
            />
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
              filteredCustomers.map((cust) => (
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
              filteredSuppliers.map((sup) => (
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
              recentEntries.map((entry) => {
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
