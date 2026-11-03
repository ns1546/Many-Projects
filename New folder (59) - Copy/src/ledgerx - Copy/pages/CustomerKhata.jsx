import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import NumpadDrawer from '../components/common/NumpadDrawer';
import ContainerKhataModal from '../components/khata/ContainerKhataModal';
import RiskBadge from '../components/common/RiskBadge';
import { buildDueReminderMessage, openWhatsAppDirect } from '../utils/whatsapp';
import {
  Search, UserPlus, User, Users, ArrowLeft, X, TrendingUp, TrendingDown,
  Phone, MapPin, CreditCard, MessageCircle, Package, ArrowDownLeft,
  ArrowUpRight, FileText, ChevronRight, Sparkles, Printer, ShieldCheck,
  Check, Calendar, Clock, Edit3, Trash2, RotateCcw, AlertTriangle, KeyRound, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { takaToPoisha, formatCurrency, poishaToTaka } from '../utils/currency';
import toast from 'react-hot-toast';

export default function CustomerKhata() {
  const { 
    customers, 
    recordPabo, 
    recordDibo, 
    addCustomer, 
    editCustomer, 
    deleteCustomer, 
    ledgerEntries, 
    voidLedgerEntry, 
    totalDiboPoisha 
  } = useKhata();
  const { activeTenant, isOwner, verifyOwnerPin } = useTenant();
  const { isBengali, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState(null); // { type: 'PABO' | 'DIBO', customer }
  const [statementCustomer, setStatementCustomer] = useState(null); // customer opened in statement drawer
  const [containerCustomer, setContainerCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [filterSegment, setFilterSegment] = useState('ALL'); // ALL | DUE | ADVANCE | CLEAR

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDueTaka, setNewDueTaka] = useState('');
  const [newCreditLimitTaka, setNewCreditLimitTaka] = useState('200000');

  // Edit Customer State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCreditLimitTaka, setEditCreditLimitTaka] = useState('');

  // Delete Customer State & Security
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Statement Passbook History Filters & Voiding
  const [statementTimeFilter, setStatementTimeFilter] = useState('ALL');
  const [statementSearch, setStatementSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [voidConfirmEntry, setVoidConfirmEntry] = useState(null);
  const [voidPin, setVoidPin] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  // KPIs
  const kpis = useMemo(() => {
    const totalCustomers = (customers || []).length;
    const dueCustomers = (customers || []).filter(c => (c.currentDuePoisha || 0) > 0);
    const advanceCustomers = (customers || []).filter(c => (c.currentDuePoisha || 0) < 0);
    const clearCustomers = (customers || []).filter(c => (c.currentDuePoisha || 0) === 0);
    const totalDuePoisha = dueCustomers.reduce((sum, c) => sum + c.currentDuePoisha, 0);
    return {
      totalCustomers,
      dueCustomers: dueCustomers.length,
      advanceCustomers: advanceCustomers.length,
      clearCustomers: clearCustomers.length,
      totalDuePoisha,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let list = (customers || []).filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
    );
    if (filterSegment === 'DUE') list = list.filter(c => (c.currentDuePoisha || 0) > 0);
    else if (filterSegment === 'ADVANCE') list = list.filter(c => (c.currentDuePoisha || 0) < 0);
    else if (filterSegment === 'CLEAR') list = list.filter(c => (c.currentDuePoisha || 0) === 0);

    return [...list].sort((a, b) => (b.currentDuePoisha || 0) - (a.currentDuePoisha || 0));
  }, [customers, search, filterSegment]);

  // Statement customer transactions with filters
  const activeStatementTransactions = useMemo(() => {
    if (!statementCustomer) return [];
    let list = (ledgerEntries || []).filter(e => 
      e.partyName === statementCustomer.name ||
      e.partyId === statementCustomer.id ||
      (e.title && e.title.includes(statementCustomer.name))
    );

    const now = Date.now();
    if (statementTimeFilter === 'TODAY') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= todayStart);
    } else if (statementTimeFilter === 'WEEK') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= weekAgo);
    } else if (statementTimeFilter === 'MONTH') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= monthAgo);
    }

    if (statementSearch.trim()) {
      const q = statementSearch.toLowerCase();
      list = list.filter(e =>
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.voucherNumber && e.voucherNumber.toLowerCase().includes(q)) ||
        (e.invoiceId && e.invoiceId.toLowerCase().includes(q)) ||
        (e.walletName && e.walletName.toLowerCase().includes(q)) ||
        (e.title && e.title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [ledgerEntries, statementCustomer, statementTimeFilter, statementSearch]);

  const handleOpenEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setEditName(cust.name);
    setEditPhone(cust.phone || '');
    setEditAddress(cust.address || '');
    setEditCreditLimitTaka(cust.creditLimitPoisha ? poishaToTaka(cust.creditLimitPoisha).toString() : '200000');
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim()) return;
    editCustomer(editingCustomer.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      creditLimitPoisha: takaToPoisha(editCreditLimitTaka || '200000'),
    });
    if (statementCustomer && statementCustomer.id === editingCustomer.id) {
      setStatementCustomer(prev => ({
        ...prev,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      }));
    }
    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = (e) => {
    e.preventDefault();
    if (!deletingCustomer) return;

    if (!isOwner) {
      if (!verifyOwnerPin(deletePin)) {
        setDeleteError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    deleteCustomer(deletingCustomer.id);
    if (statementCustomer && statementCustomer.id === deletingCustomer.id) {
      setStatementCustomer(null);
    }
    setDeletingCustomer(null);
    setDeletePin('');
    setDeleteError('');
  };

  const handleConfirmVoid = (e) => {
    e.preventDefault();
    if (!voidConfirmEntry) return;

    if (!isOwner) {
      if (!verifyOwnerPin(voidPin)) {
        setVoidError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    voidLedgerEntry(voidConfirmEntry.id, voidReason || 'ভুল হিসাব বাতিল');
    setVoidConfirmEntry(null);
    setVoidPin('');
    setVoidReason('');
    setVoidError('');
  };

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      initialDuePoisha: takaToPoisha(newDueTaka || '0'),
      creditLimitPoisha: takaToPoisha(newCreditLimitTaka || '200000'),
    });
    setNewName(''); setNewPhone(''); setNewAddress(''); setNewDueTaka('');
    setIsAddCustomerOpen(false);
    toast.success(isBengali ? 'নতুন কাস্টমার খাতা সফলভাবে খোলা হয়েছে!' : 'Customer account created!');
  };

  const handleSendWhatsApp = (cust) => {
    if (!cust?.phone) {
      toast.error(isBengali ? 'গ্রাহকের মোবাইল নম্বর নেই!' : 'No phone number for customer!');
      return;
    }
    const message = buildDueReminderMessage({
      customerName: cust.name,
      shopName: activeTenant?.name,
      dueAmountTaka: poishaToTaka(cust.currentDuePoisha || 0),
      bKashNumber: activeTenant?.bKashMerchantNumber,
    });
    openWhatsAppDirect(cust.phone, message);
    toast.success(isBengali ? 'হোয়াটসঅ্যাপে তাগাদা বার্তা পাঠানো হয়েছে!' : 'WhatsApp reminder sent!');
  };

  const segments = [
    { key: 'ALL', label: isBengali ? 'সকল কাস্টমার' : 'All Customers', count: kpis.totalCustomers },
    { key: 'DUE', label: isBengali ? 'বাকি আছে' : 'Has Due', count: kpis.dueCustomers },
    { key: 'ADVANCE', label: isBengali ? 'অগ্রিম জমা' : 'Advance', count: kpis.advanceCustomers },
    { key: 'CLEAR', label: isBengali ? 'পরিশোধিত' : 'Settled', count: kpis.clearCustomers },
  ];

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── 1. Top Header ──────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 shadow-xs border border-slate-200 transition-all cursor-pointer active:scale-95 shrink-0"
            title="ড্যাশবোর্ডে ফিরুন"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-13 h-13 rounded-2xl ${
              isEasyMode 
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-600/25' 
                : 'bg-gradient-to-br from-[#E2136E] to-[#B00F55] shadow-pink-600/25'
            } flex items-center justify-center shadow-lg text-white shrink-0`}>
              <Users size={26} className="drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Due Khata'}
                </h1>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isEasyMode 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-pink-100 text-[#E2136E] border-pink-200'
                }`}>
                  {isEasyMode ? (isBengali ? 'সহজ খাতা' : 'Simple') : (isBengali ? 'ডিজিটাল খাতা' : 'Pro')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                {isBengali ? 'গ্রাহকদের বকেয়া হিসাব, টাকা আদায় ও ১-ট্যাপ হোয়াটসঅ্যাপ তাগাদা' : 'Manage customer balances & WhatsApp reminders'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={() => setIsAddCustomerOpen(true)}
          className={`flex items-center gap-2 px-5 py-3.5 ${
            isEasyMode 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25' 
              : 'bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-pink-500/25'
          } text-white text-xs md:text-sm font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shrink-0`}
        >
          <UserPlus size={18} />
          <span>{isBengali ? '+ নতুন কাস্টমার খাতা' : '+ Add Customer'}</span>
        </button>
      </div>

      {/* ── 2. Top 2 Big Khata Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
        {/* You Will Get (Customer Due - Clean Rose FinTech Hero) */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-rose-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
              {isBengali ? 'আপনি পাবেন (মোট বাকি পাওনা)' : 'You Will Get (Total Due)'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
              {formatCurrency(kpis.totalDuePoisha, { locale })}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{kpis.dueCustomers} {isBengali ? 'জন গ্রাহকের কাছে বাকি পাওনা রয়েছে' : 'customers with outstanding balance'}</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-2xs">
            <TrendingUp size={28} />
          </div>
        </div>

        {/* In Easy Mode: Customer Statistics | In Ultra Mode: Supplier Payables */}
        {isEasyMode ? (
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                {isBengali ? 'বাকি গ্রাহক সংখ্যা' : 'Customers with Dues'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {kpis.dueCustomers} <span className="text-lg font-bold text-slate-400">/ {kpis.totalCustomers} জন</span>
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{isBengali ? 'নিয়মিত তাগাদা পাঠিয়ে দ্রুত টাকা আদায় করুন' : 'Send WhatsApp reminders to collect dues'}</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
              <Users size={28} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-purple-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
                {isBengali ? 'আপনি দেবেন (মহাজন চালানি দেনা)' : 'You Will Pay (Suppliers)'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(totalDiboPoisha || 0, { locale })}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{isBengali ? 'মহাজনদের চালানি দেনা পরিশোধযোগ্য' : 'Wholesaler payables pending'}</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
              <TrendingDown size={28} />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Filter Tabs & Search Bar Strip (Padded & Isolated) ── */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {segments.map(seg => (
            <button
              key={seg.key}
              onClick={() => setFilterSegment(seg.key)}
              className={`min-h-[44px] flex items-center gap-2 px-4.5 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterSegment === seg.key
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#B00F55] text-white shadow-sm scale-[1.01]'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              <span>{seg.label}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                filterSegment === seg.key ? 'bg-white/25 text-white' : 'bg-white text-slate-700 border border-slate-200/60'
              }`}>
                {seg.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sculpted 46px Search Bar */}
        <div className="relative w-full md:w-88 shrink-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder={isBengali ? 'কাস্টমারের নাম বা মোবাইল দিয়ে খুঁজুন...' : 'Search by name or mobile...'}
            className="w-full text-sm font-semibold pl-12 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 transition shadow-2xs min-h-[46px]" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Full-Width Spacious Customer Cards List (Anti-Cramp, Horizontal) ── */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-14 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#E2136E] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Users size={32} />
            </div>
            <p className="font-bold text-slate-900 text-base">
              {isBengali ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customer accounts found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBengali ? 'নতুন গ্রাহকের জন্য উপরের বোতাম চেপে খাতা খুলুন।' : 'Create an account using the button above.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const isDue = (cust.currentDuePoisha || 0) > 0;
            const isAdvance = (cust.currentDuePoisha || 0) < 0;

            return (
              <div
                key={cust.id}
                onClick={() => setStatementCustomer(cust)}
                className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 hover:border-pink-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Avatar & Identity Details */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Large 52px Squircle Avatar */}
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-2xs border transition-all ${
                    isDue 
                      ? 'bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white' 
                      : isAdvance 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {cust.name ? cust.name.charAt(0) : 'ক'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-[#E2136E] transition-colors leading-snug">
                        {cust.name}
                      </h3>
                      {!isEasyMode && (
                        <>
                          <RiskBadge 
                            currentDuePoisha={cust.currentDuePoisha} 
                            creditLimitPoisha={cust.creditLimitPoisha}
                            trustScore={cust.trustScore}
                            locale={locale}
                          />
                          {cust.containersDueCount > 0 && activeTenant?.isWholesaleCommodity && (
                            <span className="text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1 shadow-2xs shrink-0">
                              <Package size={12} />
                              <span>{cust.containersDueCount} বস্তা খালি</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                        <Phone size={13} className="text-slate-400" />
                        {cust.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')}
                      </span>
                      {cust.address && (
                        <span className="flex items-center gap-1 text-slate-500 font-medium truncate">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Dedicated Balance Capsule & 3 Chunky Action Buttons */}
                <div 
                  className="flex items-center gap-3.5 shrink-0 flex-wrap sm:flex-nowrap" 
                  onClick={e => e.stopPropagation()}
                >
                  {/* Dedicated Tactile Balance Squircle */}
                  <div className={`px-5 py-2.5 rounded-2xl border text-center min-w-[150px] ${
                    isDue 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : isAdvance 
                      ? 'bg-emerald-50/70 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block leading-none mb-1 text-slate-500">
                      {isDue ? (isBengali ? 'বর্তমান বাকি পাওনা' : 'Current Due') : (isBengali ? 'জমা স্থিতি' : 'Advance')}
                    </span>
                    <span className={`text-xl font-black tabular-nums tracking-tight ${
                      isDue ? 'text-rose-600' : isAdvance ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {formatCurrency(Math.abs(cust.currentDuePoisha || 0), { locale })}
                    </span>
                  </div>

                  {/* 1-Tap Actions: Got Money, Gave Due, WhatsApp Reminder, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Got Money Button (Chunky 44px) */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'PABO', customer: cust })}
                      className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title="টাকা আদায়"
                    >
                      <ArrowDownLeft size={16} className="shrink-0 text-emerald-100" />
                      <span>{isBengali ? '+ টাকা পেলাম' : '+ Got'}</span>
                    </button>

                    {/* Gave Due Button (Chunky 44px) */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'DIBO', customer: cust })}
                      className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title="বাকি বিক্রয়"
                    >
                      <ArrowUpRight size={16} className="shrink-0 text-rose-100" />
                      <span>{isBengali ? '- বাকি দিলাম' : '- Gave'}</span>
                    </button>

                    {/* WhatsApp Reminder Button */}
                    {cust.phone && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(cust)}
                        className="min-h-[44px] px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shadow-2xs shrink-0"
                        title="হোয়াটসঅ্যাপে তাগাদা পাঠান"
                      >
                        <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                        <span className="hidden xl:inline">{isBengali ? 'তাগাদা' : 'WhatsApp'}</span>
                      </button>
                    )}

                    {/* Edit Customer Button (Only in Ultra Mode) */}
                    {!isEasyMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCustomer(cust)}
                          className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#E2136E] flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 shadow-2xs border border-slate-200/80"
                          title="কাস্টমার তথ্য এডিট করুন"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCustomer(cust)}
                          className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 border border-rose-200 shadow-2xs"
                          title="কাস্টমার খাতা মুছুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}

                    <div className="p-1.5 text-slate-300 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Customer Statement Passbook Modal / Drawer ───────────── */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#E2136E] to-[#B00F55] text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black shrink-0">
                  {statementCustomer.name ? statementCustomer.name.charAt(0) : 'ক'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black truncate">{statementCustomer.name}</h3>
                  <p className="text-xs text-white/80 font-mono mt-0.5 truncate">
                    {statementCustomer.phone || 'মোবাইল নম্বর নেই'} • {statementCustomer.address || 'ঠিকানা নেই'}
                  </p>
                </div>
              </div>

              {/* Quick Header Actions: Edit, Delete, Print, Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="স্টেটমেন্ট প্রিন্ট করুন"
                >
                  <Printer size={15} />
                  <span className="hidden sm:inline">{isBengali ? 'প্রিন্ট' : 'Print'}</span>
                </button>

                <button
                  onClick={() => handleOpenEditCustomer(statementCustomer)}
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                  title="এডিট করুন"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => setDeletingCustomer(statementCustomer)}
                  className="w-9 h-9 rounded-xl bg-rose-500/40 hover:bg-rose-500 text-white flex items-center justify-center transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 size={15} />
                </button>

                <button 
                  onClick={() => setStatementCustomer(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Current Due Highlight & WhatsApp CTA */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {isBengali ? 'মোট বকেয়া বাকি' : 'Total Due'}
                </span>
                <span className="text-3xl font-black text-rose-600 tabular-nums">
                  {formatCurrency(Math.abs(statementCustomer.currentDuePoisha || 0), { locale })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsApp(statementCustomer)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageCircle size={16} />
                  <span>{isBengali ? 'হোয়াটসঅ্যাপে তাগাদা' : 'Send WhatsApp'}</span>
                </button>
              </div>
            </div>

            {/* Search & Date Filter Bar inside Statement */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={statementSearch}
                  onChange={e => setStatementSearch(e.target.value)}
                  placeholder={isBengali ? 'মেমো / বিবরণ খুঁজুন...' : 'Search in history...'}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { key: 'ALL', labelBn: 'সব', labelEn: 'All' },
                  { key: 'TODAY', labelBn: 'আজ', labelEn: 'Today' },
                  { key: 'WEEK', labelBn: '৭ দিন', labelEn: '7 Days' },
                  { key: 'MONTH', labelBn: 'চলতি মাস', labelEn: 'This Month' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStatementTimeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      statementTimeFilter === f.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isBengali ? f.labelBn : f.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Statement Entries Timeline */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {activeStatementTransactions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    {isBengali ? 'ফিল্টারে কোনো লেনদেন পাওয়া যায়নি' : 'No transactions matching filter'}
                  </p>
                </div>
              ) : (
                activeStatementTransactions.map(tx => {
                  const isCredit = tx.isCredit || tx.type === 'CUSTOMER_PABO' || tx.type === 'BKASH_PAYMENT' || tx.type === 'PABO';
                  return (
                    <div 
                      key={tx.id} 
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        tx.isVoided 
                          ? 'bg-slate-50/80 border-slate-200 opacity-60 line-through' 
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          tx.isVoided
                            ? 'bg-slate-200 text-slate-500'
                            : isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-slate-900 truncate">{tx.title || tx.description || 'লেনদেন'}</p>
                            {tx.isVoided && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full no-underline">
                                {isBengali ? 'বাতিলকৃত' : 'Voided'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                            {tx.voucherNumber || tx.id} • {new Date(tx.timestamp || tx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')} {new Date(tx.timestamp || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <p className={`font-black text-base tabular-nums ${
                            tx.isVoided ? 'text-slate-400' : isCredit ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isCredit ? '+ ' : '- '} {formatCurrency(tx.amountPoisha || 0, { locale })}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">{tx.walletName || tx.paymentMode || 'ক্যাশ'}</span>
                        </div>

                        {!tx.isVoided && (
                          <button
                            type="button"
                            onClick={() => setVoidConfirmEntry(tx)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="এই হিসাবটি ভুল হলে বাতিল ও রিভার্স করুন"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Modal Actions: Got & Gave */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveModal({ type: 'PABO', customer: statementCustomer });
                  setStatementCustomer(null);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm shadow-md transition active:scale-95 cursor-pointer text-center"
              >
                + {isBengali ? 'টাকা পেলাম (আদায়)' : 'Got Payment'}
              </button>
              <button
                onClick={() => {
                  setActiveModal({ type: 'DIBO', customer: statementCustomer });
                  setStatementCustomer(null);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm shadow-md transition active:scale-95 cursor-pointer text-center"
              >
                - {isBengali ? 'বাকি দিলাম (বিক্রয়)' : 'Gave Credit'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Numpad Drawer ─────────────────────────────────────────── */}
      {activeModal && (
        <NumpadDrawer
          isOpen={true}
          onClose={() => setActiveModal(null)}
          type={activeModal.type}
          partyName={activeModal.customer.name}
          onSubmit={({ amountPoisha, walletId, description }) => {
            if (activeModal.type === 'PABO') {
              recordPabo({ customerId: activeModal.customer.id, amountPoisha, walletId, description });
              toast.success(isBengali ? 'টাকা আদায় সফল হয়েছে!' : 'Payment recorded!');
            } else {
              recordDibo({ customerId: activeModal.customer.id, amountPoisha, description });
              toast.success(isBengali ? 'বাকি যোগ করা হয়েছে!' : 'Due recorded!');
            }
          }}
        />
      )}

      {/* ── Container Khata Modal ─────────────────────────────────── */}
      {containerCustomer && (
        <ContainerKhataModal 
          isOpen={true} 
          onClose={() => setContainerCustomer(null)} 
          customer={containerCustomer} 
        />
      )}

      {/* ── Add Customer Modal (Authentic Spacious bKash FinTech Dialog) ── */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#E2136E] via-[#D81B60] to-[#B00F55] flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
                  <UserPlus size={24} className="text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">
                    {isBengali ? 'নতুন কাস্টমার খাতা খুলুন' : 'Open New Customer Khata'}
                  </h3>
                  <p className="text-xs text-pink-100 font-semibold mt-1">
                    {isBengali ? 'গ্রাহকের নাম, মোবাইল নম্বর ও বকেয়া হিসাব এন্ট্রি' : 'Customer profile & opening due balance'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCustomerOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-8 space-y-5 bg-white">
              {/* Customer Full Name */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'কাস্টমারের নাম' : 'Customer Name'} <span className="text-[#E2136E]">*</span>
                </label>
                <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] focus-within:ring-4 focus-within:ring-pink-500/10 transition-all overflow-hidden shadow-2xs">
                  <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    autoFocus 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    placeholder={isBengali ? 'যেমন: হাজী মো: রফিক উদ্দিন' : 'e.g. Md. Rafiq Uddin'}
                    className="w-full h-full px-4 text-base font-bold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400" 
                  />
                </div>
              </div>

              {/* Mobile and Address (Two Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] focus-within:ring-4 focus-within:ring-pink-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      value={newPhone} 
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="017XX-XXXXXX"
                      className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'ঠিকানা / মার্কেট' : 'Address / Market'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] focus-within:ring-4 focus-within:ring-pink-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                      <MapPin size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={newAddress} 
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder={isBengali ? 'বাবুবাজার, ঢাকা' : 'e.g. Babubazar, Dhaka'}
                      className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400" 
                    />
                  </div>
                </div>
              </div>

              {/* Opening Due & Credit Limit (Two Columns with ৳ badge) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'পূর্বের প্রারম্ভিক বাকি' : 'Opening Due Balance'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-rose-300 bg-rose-50/40 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-rose-100/80 border-r border-rose-200 text-rose-700 font-black text-lg select-none shrink-0">
                      ৳
                    </div>
                    <input 
                      type="number" 
                      step="any" 
                      value={newDueTaka} 
                      onChange={e => setNewDueTaka(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-full px-4 text-lg font-black bg-transparent focus:outline-none text-rose-600 placeholder:text-rose-400 tabular-nums" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'বাকি সীমা (ক্রেডিট লিমিট)' : 'Credit Limit'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] focus-within:ring-4 focus-within:ring-pink-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-500 font-black text-lg select-none shrink-0">
                      ৳
                    </div>
                    <input 
                      type="number" 
                      step="any" 
                      value={newCreditLimitTaka} 
                      onChange={e => setNewCreditLimitTaka(e.target.value)}
                      placeholder="200000"
                      className="w-full h-full px-4 text-lg font-black bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 tabular-nums" 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cancel & Confirm */}
              <div className="flex items-center gap-3.5 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 h-13 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 transition-all cursor-pointer active:scale-95"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#E2136E] via-[#D81B60] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-lg shadow-pink-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  <span>{isBengali ? 'খাতা সংরক্ষণ করুন ✓' : 'Save Customer ✓'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Customer Modal ── */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
                  <Edit3 size={22} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">
                    {isBengali ? 'কাস্টমার তথ্য সংশোধন (Edit)' : 'Edit Customer Information'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {editingCustomer.name} • {isBengali ? 'তথ্য পরিবর্তন ও আপডেট' : 'Update profile details'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingCustomer(null)} 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="p-8 space-y-5 bg-white">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'কাস্টমারের নাম' : 'Customer Name'} *
                </label>
                <input 
                  type="text" 
                  required 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#E2136E] focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'মোবাইল নম্বর' : 'Mobile'}
                  </label>
                  <input 
                    type="tel" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#E2136E] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'ঠিকানা / বাজার' : 'Address'}
                  </label>
                  <input 
                    type="text" 
                    value={editAddress} 
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#E2136E] focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'বাকি সীমা (ক্রেডিট লিমিট টাকা)' : 'Credit Limit (BDT)'}
                </label>
                <input 
                  type="number" 
                  value={editCreditLimitTaka} 
                  onChange={e => setEditCreditLimitTaka(e.target.value)}
                  className="w-full h-12 px-4 text-base font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#E2136E] focus:outline-none tabular-nums" 
                />
              </div>

              <div className="flex items-center gap-3.5 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 h-12 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-12 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] shadow-lg shadow-pink-600/25 transition cursor-pointer"
                >
                  {isBengali ? 'আপডেট সংরক্ষণ করুন ✓' : 'Save Changes ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Customer Confirmation Modal ── */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
              <Trash2 size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'কাস্টমার খাতা মুছে ফেলতে চান?' : 'Delete Customer Account?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              <span className="font-bold text-slate-800">"{deletingCustomer.name}"</span> {isBengali ? 'এর খাতা মুছে ফেলা হবে।' : 'will be removed.'}
              {deletingCustomer.currentDuePoisha > 0 && (
                <span className="block font-bold text-rose-600 mt-1">
                  ⚠️ {isBengali ? 'সতর্কতা: এই গ্রাহকের কাছে এখনো বাকি পাওনা রয়েছে:' : 'Warning: Outstanding due balance:'} {formatCurrency(deletingCustomer.currentDuePoisha, { locale })}
                </span>
              )}
            </p>

            {/* PIN required if not OWNER */}
            {!isOwner && (
              <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-2">
                <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-600" />
                  <span>{isBengali ? 'মালিকের অনুমতি পিন দিন (ম্যানেজার মোড)' : 'Enter Owner PIN (Protected)'}</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={deletePin}
                  onChange={e => {
                    setDeletePin(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="৪ ডিজিট পিন"
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white font-mono text-center font-black tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {deleteError && (
                  <p className="text-[11px] font-bold text-rose-600">{deleteError}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeletingCustomer(null);
                  setDeletePin('');
                  setDeleteError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCustomer}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Void Transaction Modal ── */}
      {voidConfirmEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-sm">
              <RotateCcw size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'লেনদেন বাতিল ও ব্যালেন্স রিভার্স' : 'Void & Reverse Transaction?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isBengali ? 'ভাউচার:' : 'Voucher:'} <span className="font-mono font-bold text-slate-800">{voidConfirmEntry.voucherNumber || voidConfirmEntry.id}</span> • {formatCurrency(voidConfirmEntry.amountPoisha || 0, { locale })}
              <span className="block text-slate-600 mt-1">
                {isBengali ? 'এই লেনদেনটি বাতিল হয়ে গ্রাহকের পূর্ববর্তী ব্যালেন্স স্বয়ংক্রিয়ভাবে ফেরত আসবে।' : 'This will rollback the customer balance and record void audit.'}
              </span>
            </p>

            <div className="mt-4 text-left space-y-3">
              <div>
                <label className="text-[11px] font-black text-slate-700 block mb-1">
                  {isBengali ? 'বাতিলের কারণ' : 'Reason for Voiding'}
                </label>
                <input
                  type="text"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  placeholder={isBengali ? 'যেমন: ভুল এন্ট্রি / ভুল পরিমাণ টাইপ' : 'e.g. Wrong entry / Typo'}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              {!isOwner && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                  <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-600" />
                    <span>{isBengali ? 'মালিকের পিন কোড দিন' : 'Enter Owner PIN'}</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={voidPin}
                    onChange={e => {
                      setVoidPin(e.target.value);
                      setVoidError('');
                    }}
                    placeholder="৪ ডিজিট পিন"
                    className="w-full h-9 px-3 rounded-xl border border-amber-300 bg-white font-mono text-center font-black text-xs"
                  />
                  {voidError && (
                    <p className="text-[10px] font-bold text-rose-600">{voidError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setVoidConfirmEntry(null);
                  setVoidPin('');
                  setVoidReason('');
                  setVoidError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'বাতিল কার্যকর করুন' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Printable Customer Statement Passbook ── */}
      {isPrintModalOpen && statementCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-black text-sm flex items-center gap-2">
                <Printer size={16} className="text-pink-400" />
                <span>{isBengali ? 'স্টেটমেন্ট প্রিন্ট প্রিভিউ' : 'Statement Print Preview'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs transition cursor-pointer"
                >
                  {isBengali ? 'প্রিন্ট করুন' : 'Print'}
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
              {/* Store & Customer Header */}
              <div className="border-b-2 border-slate-800 pb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{activeTenant?.name || 'বিসমিল্লাহ জেনারেল স্টোর'}</h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{activeTenant?.address || 'দোকান নং ৪২, নিউ মার্কেট, ঢাকা'} • ফোন: {activeTenant?.phone || '০১৭০০-০০০০০০'}</p>
                  <p className="text-xs font-bold text-[#E2136E] mt-1">{isBengali ? 'গ্রাহক খাতা হিসাব বিবরণী (Customer Ledger Passbook)' : 'Customer Ledger Statement'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBengali ? 'প্রিন্টের তারিখ' : 'Date'}</span>
                  <span className="text-xs font-bold font-mono">{new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}</span>
                </div>
              </div>

              {/* Customer Details Box */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">{isBengali ? 'গ্রাহকের নাম:' : 'Customer:'}</span>
                  <span className="text-sm font-black text-slate-900">{statementCustomer.name}</span>
                  <span className="text-slate-500 block mt-0.5">{statementCustomer.phone || 'মোবাইল নেই'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block">{isBengali ? 'বর্তমান বাকি পাওনা:' : 'Current Due:'}</span>
                  <span className="text-base font-black text-rose-600 tabular-nums">
                    {formatCurrency(Math.abs(statementCustomer.currentDuePoisha || 0), { locale })}
                  </span>
                </div>
              </div>

              {/* Statement Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-500 font-bold">
                    <th className="py-2">{isBengali ? 'তারিখ' : 'Date'}</th>
                    <th className="py-2">{isBengali ? 'ভাউচার / বিবরণ' : 'Description'}</th>
                    <th className="py-2 text-right">{isBengali ? 'পেলেন (+) টাকা' : 'Paid (+)'}</th>
                    <th className="py-2 text-right">{isBengali ? 'বাকি দিলেন (-) টাকা' : 'Due (-)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeStatementTransactions.map((tx, idx) => {
                    const isCredit = tx.isCredit || tx.type === 'CUSTOMER_PABO' || tx.type === 'BKASH_PAYMENT' || tx.type === 'PABO';
                    return (
                      <tr key={idx} className={tx.isVoided ? 'line-through text-slate-300' : ''}>
                        <td className="py-2.5 font-mono text-slate-600">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                        </td>
                        <td className="py-2.5 font-medium">
                          {tx.title || tx.description || 'হিসাব'} {tx.isVoided && '(বাতিল)'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-emerald-700 tabular-nums">
                          {isCredit ? formatCurrency(tx.amountPoisha || 0, { locale }) : '—'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-rose-700 tabular-nums">
                          {!isCredit ? formatCurrency(tx.amountPoisha || 0, { locale }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pt-6 border-t-2 border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500">
                <span>{isBengali ? 'কম্পিউটার জেনারেটেড ডিজিটাল লেজার স্টেটমেন্ট।' : 'Computer generated digital ledger passbook.'}</span>
                <span className="border-t border-slate-400 px-6 pt-1 text-slate-700">{isBengali ? 'স্বাক্ষর' : 'Signature'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
