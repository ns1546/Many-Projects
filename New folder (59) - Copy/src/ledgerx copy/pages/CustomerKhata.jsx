import React, { useState, useMemo, useRef } from 'react';
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
  Check, CheckCircle2, Calendar, Clock, Edit3, Trash2, RotateCcw, AlertTriangle, KeyRound, ShieldAlert,
  MoreVertical, Glasses
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { takaToPoisha, formatCurrency, poishaToTaka } from '../utils/currency';
import toast from 'react-hot-toast';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
import PrescriptionModal from '../components/optics/PrescriptionModal';

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
  const [activeDrawerTab, setActiveDrawerTab] = useState('STATEMENT'); // 'STATEMENT' | 'PROFILE' | 'OPTICS'
  const [prescriptionCustomer, setPrescriptionCustomer] = useState(null); // customer for optical Rx
  const [containerCustomer, setContainerCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [filterSegment, setFilterSegment] = useState('ALL'); // ALL | DUE | ADVANCE | CLEAR
  const [customerMenuOpenId, setCustomerMenuOpenId] = useState(null);

  // Step-by-step Enter key navigation refs
  const newCustPhoneRef = useRef(null);
  const newCustAddressRef = useRef(null);
  const newCustDueRef = useRef(null);
  const newCustLimitRef = useRef(null);
  const editCustPhoneRef = useRef(null);
  const editCustAddressRef = useRef(null);
  const editCustLimitRef = useRef(null);

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

  // Pagination states for clean section presentation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSegment]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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

  const handleSavePrescription = (customerId, rxData) => {
    editCustomer(customerId, { 
      prescription: rxData,
      prescriptionDate: rxData.rxDate || new Date().toISOString().split('T')[0],
      needsFollowUp: false,
    });
    if (statementCustomer && statementCustomer.id === customerId) {
      setStatementCustomer(prev => ({ 
        ...prev, 
        prescription: rxData, 
        prescriptionDate: rxData.rxDate || prev.prescriptionDate 
      }));
    }
  };

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

  const customerMetrics = [
    {
      id: 'totalDue',
      label: isBengali ? 'মোট বাকি পাওনা' : 'Total Due',
      value: formatCurrency(kpis.totalDuePoisha, { locale }),
      valueColor: 'text-rose-600',
      subtitle: `${kpis.dueCustomers} ${isBengali ? 'জনের কাছে বাকি' : 'accounts with due'}`,
      icon: TrendingUp,
      iconColor: 'text-rose-500',
      onClick: () => setFilterSegment('DUE'),
    },
    {
      id: 'dueCount',
      label: isBengali ? 'বাকিদার গ্রাহক' : 'With Due',
      value: `${kpis.dueCustomers} / ${kpis.totalCustomers} জন`,
      valueColor: 'text-amber-600',
      subtitle: isBengali ? 'সক্রিয় খাতা' : 'active due accounts',
      icon: Users,
      iconColor: 'text-amber-500',
      onClick: () => setFilterSegment('DUE'),
    },
    {
      id: 'settledCount',
      label: isBengali ? 'পরিশোধিত খাতা' : 'Settled',
      value: `${kpis.clearCustomers} জন`,
      valueColor: 'text-emerald-600',
      subtitle: isBengali ? 'দেনা মুক্ত' : 'zero debt accounts',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      onClick: () => setFilterSegment('CLEAR'),
    },
    ...(!isEasyMode ? [{
      id: 'supplierDebt',
      label: isBengali ? 'মহাজন দেনা' : 'Supplier Due',
      value: formatCurrency(totalDiboPoisha || 0, { locale }),
      valueColor: 'text-purple-700',
      subtitle: isBengali ? 'পরিশোধযোগ্য দেনা' : 'payable to suppliers',
      icon: TrendingDown,
      iconColor: 'text-purple-600',
      onClick: () => navigate('/suppliers'),
    }] : []),
  ];

  const toolbarTabs = [
    { id: 'ALL', label: isBengali ? 'সকল কাস্টমার' : 'All Customers', count: kpis.totalCustomers },
    { id: 'DUE', label: isBengali ? 'বাকি আছে' : 'Has Due', count: kpis.dueCustomers },
    { id: 'ADVANCE', label: isBengali ? 'অগ্রিম জমা' : 'Advance', count: kpis.advanceCustomers },
    { id: 'CLEAR', label: isBengali ? 'পরিশোধিত' : 'Settled', count: kpis.clearCustomers },
  ];

  return (
    <div className="w-full space-y-3 pb-12">
      {/* ── 1. Compact Unified Page Header ── */}
      <UnifiedPageHeader
        icon={Users}
        title={isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Due Khata'}
        subtitle={isBengali ? 'গ্রাহকদের বকেয়া হিসাব, টাকা আদায় ও ১-ট্যাপ হোয়াটসঅ্যাপ তাগাদা' : 'Manage customer balances & WhatsApp reminders'}
        badge={isEasyMode ? (isBengali ? 'সহজ খাতা' : 'Simple') : (isBengali ? 'ডিজিটাল খাতা' : 'Pro')}
        badgeColor={isEasyMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}
        showBack={true}
        backTo="/"
        actions={
          <>
            <button 
              onClick={() => navigate('/customer-directory')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition cursor-pointer"
              title={isBengali ? 'সকল গ্রাহকের মাস্টার ডিরেক্টরি' : 'Customer Directory'}
            >
              <Users size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">{isBengali ? 'গ্রাহক ডিরেক্টরি' : 'Directory'}</span>
            </button>

            <button 
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <UserPlus size={15} />
              <span>{isBengali ? '+ নতুন কাস্টমার' : '+ Add Customer'}</span>
            </button>
          </>
        }
      />

      {/* ── 2. Slim Executive Metric Ribbon ── */}
      <MetricRibbon metrics={customerMetrics} />

      {/* ── 3. Single-Row Unified Filter & Search Toolbar ── */}
      <UnifiedToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isBengali ? 'কাস্টমারের নাম বা মোবাইল... (Enter চাপলে খাতা খুলবে)' : 'Search by name or mobile...'}
        tabs={toolbarTabs}
        activeTab={filterSegment}
        onTabChange={setFilterSegment}
      />

      {/* ── 4. Full-Width Spacious Customer Cards List (Anti-Cramp, Horizontal) ── */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-14 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 shadow-sm">
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
          paginatedCustomers.map(cust => {
            const isDue = (cust.currentDuePoisha || 0) > 0;
            const isAdvance = (cust.currentDuePoisha || 0) < 0;

            return (
              <div
                key={cust.id}
                onClick={() => setStatementCustomer(cust)}
                className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-5"
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
                      <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
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
                          {activeTenant?.businessType === 'OPTICS' && cust.prescription && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrescriptionCustomer(cust);
                              }}
                              className="text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-lg border border-cyan-200 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer transition-colors"
                              title="চশমার পাওয়ার প্রেসক্রিপশন দেখুন বা এডিট করুন"
                            >
                              <Glasses size={12} className="text-cyan-700" />
                              <span>OD: {cust.prescription.rightEye?.sph} | OS: {cust.prescription.leftEye?.sph}</span>
                            </button>
                          )}
                          {activeTenant?.businessType === 'OPTICS' && (cust.needsFollowUp || (cust.prescriptionDate && (Date.now() - new Date(cust.prescriptionDate).getTime() > 180 * 24 * 60 * 60 * 1000))) && (
                            <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
                              <AlertTriangle size={11} className="text-amber-700" />
                              <span>৬ মাসের লেন্স চেকআপ তাগাদা</span>
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

                {/* Right: Dedicated Balance Capsule & Professional Action Cluster */}
                <div 
                  className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap" 
                  onClick={e => e.stopPropagation()}
                >
                  {/* Dedicated Tactile Balance Squircle */}
                  <div className={`px-4 py-2.5 rounded-2xl border text-right min-w-[135px] ${
                    isDue 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : isAdvance 
                      ? 'bg-emerald-50/70 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block leading-none mb-1 text-slate-400">
                      {isDue ? (isBengali ? 'বাকি পাওনা' : 'Due') : isAdvance ? (isBengali ? 'জমা স্থিতি' : 'Advance') : (isBengali ? 'পরিশোধিত' : 'Settled')}
                    </span>
                    <span className={`text-lg md:text-xl font-black tabular-nums tracking-tight ${
                      isDue ? 'text-rose-600' : isAdvance ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {formatCurrency(Math.abs(cust.currentDuePoisha || 0), { locale })}
                    </span>
                  </div>

                  {/* Clean Action Cluster: Ledger Drawer + Quick Got/Gave + More */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View Ledger / Open Drawer Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatementCustomer(cust);
                        setActiveDrawerTab('STATEMENT');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title={isBengali ? 'খতিয়ান ও বিবরণ দেখুন' : 'View Ledger'}
                    >
                      <span>{isBengali ? 'খতিয়ান' : 'Ledger'}</span>
                      <ChevronRight size={13} />
                    </button>

                    {/* Quick Got Money (+) Button */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'PABO', customer: cust })}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                      title={isBengali ? 'টাকা আদায় (+ পেলাম)' : '+ Got Money'}
                    >
                      <ArrowDownLeft size={14} />
                      <span className="hidden sm:inline">{isBengali ? 'আদায়' : 'Collect'}</span>
                    </button>

                    {/* WhatsApp Quick Direct Tagada (only when due and has phone) */}
                    {cust.phone && isDue && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(cust)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition active:scale-95 cursor-pointer shrink-0"
                        title={isBengali ? 'হোয়াটসঅ্যাপে তাগাদা পাঠান' : 'WhatsApp Tagada'}
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}

                    {/* 3-Dot More Options Dropdown (Gave Due, Edit, Delete) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerMenuOpenId(customerMenuOpenId === cust.id ? null : cust.id);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 border border-slate-200"
                        title={isBengali ? 'আরও অপশন' : 'More options'}
                      >
                        <MoreVertical size={15} />
                      </button>

                      {/* Dropdown Menu */}
                      {customerMenuOpenId === cust.id && (
                        <div 
                          className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal({ type: 'DIBO', customer: cust });
                              setCustomerMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition"
                          >
                            <ArrowUpRight size={14} className="text-rose-600 shrink-0" />
                            <span>{isBengali ? 'বাকি বিক্রয় (- দিলাম)' : 'Give Due (-)'}</span>
                          </button>

                          {cust.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSendWhatsApp(cust);
                                setCustomerMenuOpenId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition"
                            >
                              <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                              <span>{isBengali ? 'হোয়াটসঅ্যাপে তাগাদা' : 'WhatsApp Reminder'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEditCustomer(cust);
                              setCustomerMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                          >
                            <Edit3 size={14} className="text-slate-500 shrink-0" />
                            <span>{isBengali ? 'কাস্টমার তথ্য এডিট' : 'Edit Customer'}</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingCustomer(cust);
                              setCustomerMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                          >
                            <Trash2 size={14} className="shrink-0" />
                            <span>{isBengali ? 'খাতা মুছুন' : 'Delete Customer'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ── Customer Khata Pagination Bar ── */}
        {filteredCustomers.length > 0 && (
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-bold">
            <div className="flex items-center gap-3">
              <span>
                {isBengali 
                  ? `মোট ${filteredCustomers.length} জন গ্রাহক • ${(currentPage - 1) * pageSize + 1} হতে ${Math.min(currentPage * pageSize, filteredCustomers.length)} জন প্রদর্শিত` 
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredCustomers.length)} of ${filteredCustomers.length} customers`}
              </span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="hidden sm:inline">|</span>
                <span>{isBengali ? 'প্রতি পেজে:' : 'Per page:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold transition"
              >
                ◀ {isBengali ? 'পূর্ববর্তী' : 'Prev'}
              </button>
              <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-black">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold transition"
              >
                {isBengali ? 'পরবর্তী' : 'Next'} ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Customer Statement Passbook Slide-Over Drawer (Right-side Sheet) ── */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setStatementCustomer(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
              
              {/* Drawer Top Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl ${
                    (statementCustomer.currentDuePoisha || 0) > 0 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  } flex items-center justify-center text-lg font-black shrink-0`}>
                    {statementCustomer.name ? statementCustomer.name.charAt(0) : 'ক'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black truncate">{statementCustomer.name}</h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5 truncate flex items-center gap-2">
                      <Phone size={11} className="text-slate-400 shrink-0" />
                      <span>{statementCustomer.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')}</span>
                      {statementCustomer.address && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="truncate">{statementCustomer.address}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Header Actions: WhatsApp, Print, Edit, Delete, Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {statementCustomer.phone && (
                    <button
                      onClick={() => handleSendWhatsApp(statementCustomer)}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                      title="হোয়াটসঅ্যাপে তাগাদা পাঠান"
                    >
                      <MessageCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="স্টেটমেন্ট প্রিন্ট করুন"
                  >
                    <Printer size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenEditCustomer(statementCustomer)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="এডিট করুন"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingCustomer(statementCustomer)}
                    className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 transition cursor-pointer"
                    title="খাতা মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button 
                    onClick={() => setStatementCustomer(null)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer ml-1"
                    title="বন্ধ করুন"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Financial Balance Strip with 1-Tap Entry Launchers */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {(statementCustomer.currentDuePoisha || 0) > 0 
                      ? (isBengali ? 'মোট বকেয়া বাকি' : 'Total Due') 
                      : (statementCustomer.currentDuePoisha || 0) < 0 
                      ? (isBengali ? 'অগ্রিম জমা স্থিতি' : 'Advance Balance') 
                      : (isBengali ? 'হিসাব পরিশোধিত' : 'Zero Balance')}
                  </span>
                  <span className={`text-2xl font-black tabular-nums tracking-tight ${
                    (statementCustomer.currentDuePoisha || 0) > 0 
                      ? 'text-rose-600' 
                      : (statementCustomer.currentDuePoisha || 0) < 0 
                      ? 'text-emerald-600' 
                      : 'text-slate-400'
                  }`}>
                    {formatCurrency(Math.abs(statementCustomer.currentDuePoisha || 0), { locale })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal({ type: 'PABO', customer: statementCustomer });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ArrowDownLeft size={16} />
                    <span>{isBengali ? '+ টাকা পেলাম' : '+ Got Payment'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal({ type: 'DIBO', customer: statementCustomer });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ArrowUpRight size={16} />
                    <span>{isBengali ? '- বাকি দিলাম' : '- Gave Credit'}</span>
                  </button>
                </div>
              </div>

              {/* Segmented Workspace Tabs inside Drawer */}
              <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('STATEMENT')}
                  className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeDrawerTab === 'STATEMENT'
                      ? 'border-slate-900 text-slate-900 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText size={15} />
                  <span>{isBengali ? 'খতিয়ান ও স্টেটমেন্ট' : 'Statement Ledger'}</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {activeStatementTransactions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('PROFILE')}
                  className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeDrawerTab === 'PROFILE'
                      ? 'border-slate-900 text-slate-900 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={15} />
                  <span>{isBengali ? 'গ্রাহক তথ্য ও লিমিট' : 'Profile & Limits'}</span>
                </button>

                {activeTenant?.businessType === 'OPTICS' && (
                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('OPTICS')}
                    className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      activeDrawerTab === 'OPTICS'
                        ? 'border-cyan-700 text-cyan-900 font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Glasses size={15} />
                    <span>{isBengali ? 'চশমার পাওয়ার' : 'Eye Rx'}</span>
                  </button>
                )}
              </div>

              {/* Drawer Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeDrawerTab === 'STATEMENT' && (
                  <div className="flex flex-col h-full">
                    {/* Search & Date Filter Bar inside Statement */}
                    <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                      <div className="relative w-full sm:w-60">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={statementSearch}
                          onChange={e => setStatementSearch(e.target.value)}
                          placeholder={isBengali ? 'মেমো / বিবরণ খুঁজুন...' : 'Search in history...'}
                          className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800"
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
                    <div className="p-5 flex-1 space-y-3">
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
                                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
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
                  </div>
                )}

                {activeDrawerTab === 'PROFILE' && (
                  <div className="p-6 space-y-5">
                    {/* Credit Limit & Risk Health Card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isBengali ? 'ক্রেডিট লিমিট ও বাকি সীমা' : 'Credit Limit'}</span>
                        <RiskBadge 
                          currentDuePoisha={statementCustomer.currentDuePoisha} 
                          creditLimitPoisha={statementCustomer.creditLimitPoisha}
                          trustScore={statementCustomer.trustScore}
                          locale={locale}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-black">
                        <span className="text-slate-700">{isBengali ? 'ব্যবহৃত বাকি:' : 'Used Due:'} {formatCurrency(statementCustomer.currentDuePoisha || 0, { locale })}</span>
                        <span className="text-slate-500">{isBengali ? 'সর্বোচ্চ সীমা:' : 'Limit:'} {formatCurrency(statementCustomer.creditLimitPoisha || 20000000, { locale })}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (statementCustomer.currentDuePoisha || 0) > (statementCustomer.creditLimitPoisha || 20000000) 
                              ? 'bg-rose-600' 
                              : (statementCustomer.currentDuePoisha || 0) > (statementCustomer.creditLimitPoisha || 20000000) * 0.7 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, Math.round(((statementCustomer.currentDuePoisha || 0) / (statementCustomer.creditLimitPoisha || 20000000)) * 100)))}%` }}
                        />
                      </div>
                    </div>

                    {/* Contact & Address Details */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBengali ? 'যোগাযোগের তথ্য' : 'Contact Information'}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">{isBengali ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                          <span className="font-mono font-bold text-slate-900">{statementCustomer.phone || (isBengali ? 'নেই' : 'None')}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">{isBengali ? 'ঠিকানা / এলাকা:' : 'Address:'}</span>
                          <span className="font-bold text-slate-900">{statementCustomer.address || (isBengali ? 'নেই' : 'None')}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-slate-500">{isBengali ? 'হিসাব খোলার তারিখ:' : 'Account Created:'}</span>
                          <span className="font-bold text-slate-700">{statementCustomer.createdAt ? new Date(statementCustomer.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US') : 'পূর্ববর্তী'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditCustomer(statementCustomer)}
                      className="w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Edit3 size={15} />
                      <span>{isBengali ? 'এই গ্রাহকের প্রোফাইল এডিট করুন' : 'Edit Customer Profile'}</span>
                    </button>
                  </div>
                )}

                {activeDrawerTab === 'OPTICS' && activeTenant?.businessType === 'OPTICS' && (
                  <div className="p-6 space-y-4">
                    {statementCustomer.prescription ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200">
                          <h4 className="font-black text-sm text-cyan-950 mb-3 flex items-center gap-2">
                            <Glasses size={18} className="text-cyan-700" />
                            <span>{isBengali ? 'চক্ষু পাওয়ার চার্ট (Eye Prescription Chart)' : 'Prescription Chart'}</span>
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-cyan-100">
                              <span className="font-bold text-cyan-900 block mb-1">ডান চোখ (OD - Right Eye):</span>
                              <p className="font-mono font-black text-slate-800">SPH: {statementCustomer.prescription.rightEye?.sph || '0.00'}</p>
                              <p className="font-mono text-slate-600">CYL: {statementCustomer.prescription.rightEye?.cyl || '0.00'} | AXIS: {statementCustomer.prescription.rightEye?.axis || '0'}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-cyan-100">
                              <span className="font-bold text-cyan-900 block mb-1">বাম চোখ (OS - Left Eye):</span>
                              <p className="font-mono font-black text-slate-800">SPH: {statementCustomer.prescription.leftEye?.sph || '0.00'}</p>
                              <p className="font-mono text-slate-600">CYL: {statementCustomer.prescription.leftEye?.cyl || '0.00'} | AXIS: {statementCustomer.prescription.leftEye?.axis || '0'}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-cyan-900 font-semibold space-y-1">
                            <p>PD (পুপিল দূরত্ব): {statementCustomer.prescription.pd || 'N/A'}</p>
                            <p>লেন্স: {statementCustomer.prescription.lensType || 'ব্লু-কাট'} • ফ্রেম: {statementCustomer.prescription.frameModel || 'ফুল রিম'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPrescriptionCustomer(statementCustomer)}
                          className="w-full py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Glasses size={16} />
                          <span>{isBengali ? 'পাওয়ার ও প্রেসক্রিপশন আপডেট করুন' : 'Update Prescription'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Glasses size={32} className="mx-auto mb-2 text-slate-400" />
                        <p className="font-bold text-slate-700 text-xs">{isBengali ? 'কোনো প্রেসক্রিপশন সংরক্ষিত নেই' : 'No prescription recorded'}</p>
                        <button
                          type="button"
                          onClick={() => setPrescriptionCustomer(statementCustomer)}
                          className="mt-3 px-4 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          + {isBengali ? 'নতুন প্রেসক্রিপশন যুক্ত করুন' : 'Add Prescription'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
            <div className="px-8 py-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/10">
                  <UserPlus size={24} className="text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">
                    {isBengali ? 'নতুন কাস্টমার খাতা খুলুন' : 'Open New Customer Khata'}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold mt-1">
                    {isBengali ? 'গ্রাহকের নাম, মোবাইল নম্বর ও বকেয়া হিসাব এন্ট্রি' : 'Customer profile & opening due balance'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCustomerOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/10"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-8 space-y-5 bg-white">
              {/* Customer Full Name */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'কাস্টমারের নাম' : 'Customer Name'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all overflow-hidden shadow-2xs">
                  <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    autoFocus 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        newCustPhoneRef.current?.focus();
                      }
                    }}
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
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                      <Phone size={18} />
                    </div>
                    <input 
                      ref={newCustPhoneRef}
                      type="tel" 
                      value={newPhone} 
                      onChange={e => setNewPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newCustAddressRef.current?.focus();
                        }
                      }}
                      placeholder="017XX-XXXXXX"
                      className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'ঠিকানা / মার্কেট' : 'Address / Market'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                      <MapPin size={18} />
                    </div>
                    <input 
                      ref={newCustAddressRef}
                      type="text" 
                      value={newAddress} 
                      onChange={e => setNewAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newCustDueRef.current?.focus();
                        }
                      }}
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
                      ref={newCustDueRef}
                      type="number" 
                      step="any" 
                      value={newDueTaka} 
                      onChange={e => setNewDueTaka(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newCustLimitRef.current?.focus();
                        }
                      }}
                      placeholder="0.00"
                      className="w-full h-full px-4 text-lg font-black bg-transparent focus:outline-none text-rose-600 placeholder:text-rose-400 tabular-nums" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'বাকি সীমা (ক্রেডিট লিমিট)' : 'Credit Limit'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-500 font-black text-lg select-none shrink-0">
                      ৳
                    </div>
                    <input 
                      ref={newCustLimitRef}
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
                  className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editCustPhoneRef.current?.focus();
                    }
                  }}
                  className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'মোবাইল নম্বর' : 'Mobile'}
                  </label>
                  <input 
                    ref={editCustPhoneRef}
                    type="tel" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        editCustAddressRef.current?.focus();
                      }
                    }}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'ঠিকানা / বাজার' : 'Address'}
                  </label>
                  <input 
                    ref={editCustAddressRef}
                    type="text" 
                    value={editAddress} 
                    onChange={e => setEditAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        editCustLimitRef.current?.focus();
                      }
                    }}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'বাকি সীমা (ক্রেডিট লিমিট টাকা)' : 'Credit Limit (BDT)'}
                </label>
                <input 
                  ref={editCustLimitRef}
                  type="number" 
                  value={editCreditLimitTaka} 
                  onChange={e => setEditCreditLimitTaka(e.target.value)}
                  className="w-full h-12 px-4 text-base font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:outline-none tabular-nums" 
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
                  className="flex-1 h-12 rounded-2xl text-sm font-black text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/25 transition cursor-pointer"
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
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-slate-800"
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
                <Printer size={16} className="text-slate-300" />
                <span>{isBengali ? 'স্টেটমেন্ট প্রিন্ট প্রিভিউ' : 'Statement Print Preview'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition cursor-pointer border border-slate-700"
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

            <div id="printable-customer-statement" className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
              {/* Store & Customer Header */}
              <div className="border-b-2 border-slate-800 pb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{activeTenant?.name || 'বিসমিল্লাহ জেনারেল স্টোর'}</h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{activeTenant?.address || 'দোকান নং ৪২, নিউ মার্কেট, ঢাকা'} • ফোন: {activeTenant?.phone || '০১৭০০-০০০০০০'}</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{isBengali ? 'গ্রাহক খাতা হিসাব বিবরণী (Customer Ledger Passbook)' : 'Customer Ledger Statement'}</p>
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

      {/* ── Optical Eye Power & Prescription Modal ── */}
      <PrescriptionModal
        isOpen={Boolean(prescriptionCustomer)}
        onClose={() => setPrescriptionCustomer(null)}
        customer={prescriptionCustomer}
        onSavePrescription={handleSavePrescription}
      />

    </div>
  );
}
