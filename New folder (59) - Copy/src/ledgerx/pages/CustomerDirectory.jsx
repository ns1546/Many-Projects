import React, { useState, useMemo, useRef } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../utils/currency';
import { openWhatsAppDirect } from '../utils/whatsapp';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  Mail,
  CreditCard,
  ShoppingBag,
  Clock,
  Calendar,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Crown,
  Star,
  ShieldCheck,
  Glasses,
  LayoutGrid,
  Table as TableIcon,
  X,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';
import PrescriptionModal from '../components/optics/PrescriptionModal';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';

export default function CustomerDirectory() {
  const { 
    customers = [], 
    addCustomer, 
    editCustomer, 
    deleteCustomer, 
    ledgerEntries = [] 
  } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState('ALL'); // ALL | RETAIL_CASH | CREDIT_REGULAR | WHOLESALE | CORPORATE | VIP_LOYAL | OPTICS
  const [sortBy, setSortBy] = useState('NAME_ASC'); // NAME_ASC | SPEND_DESC | DUE_DESC | RECENT_VISIT
  const [viewMode, setViewMode] = useState('GRID'); // GRID | TABLE

  // Pagination states for clean data presentation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSegment, sortBy, viewMode]);

  // Modals & Drawers
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingProfileCustomer, setViewingProfileCustomer] = useState(null);
  const [prescriptionCustomer, setPrescriptionCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // ── KPI Metrics Calculation ──
  const kpis = useMemo(() => {
    const total = customers.length;
    const cashCustomers = customers.filter(c => c.customerType === 'RETAIL_CASH' || (!c.customerType && (c.currentDuePoisha || 0) === 0));
    const creditCustomers = customers.filter(c => (c.currentDuePoisha || 0) > 0 || c.customerType === 'CREDIT_REGULAR');
    const wholesaleCorporate = customers.filter(c => c.customerType === 'WHOLESALE' || c.customerType === 'CORPORATE');
    const vipCustomers = customers.filter(c => c.customerType === 'VIP_LOYAL' || c.loyaltyTier === 'GOLD' || c.loyaltyTier === 'PLATINUM');
    const totalDuePoisha = creditCustomers.reduce((acc, c) => acc + (c.currentDuePoisha > 0 ? c.currentDuePoisha : 0), 0);
    const totalLifetimeSpendPoisha = customers.reduce((acc, c) => acc + (c.totalPurchasesPoisha || 0), 0);

    return {
      total,
      cashCount: cashCustomers.length,
      creditCount: creditCustomers.length,
      wholesaleCorporateCount: wholesaleCorporate.length,
      vipCount: vipCustomers.length,
      totalDuePoisha,
      totalLifetimeSpendPoisha,
    };
  }, [customers]);

  // ── Filtered and Sorted Customer List ──
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.altPhone && c.altPhone.includes(q)) ||
        (c.customerCode && c.customerCode.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q))
      );
    }

    // Segment tab filter
    if (activeSegment !== 'ALL') {
      if (activeSegment === 'RETAIL_CASH') {
        result = result.filter(c => c.customerType === 'RETAIL_CASH' || (!c.customerType && (c.currentDuePoisha || 0) <= 0));
      } else if (activeSegment === 'CREDIT_REGULAR') {
        result = result.filter(c => c.customerType === 'CREDIT_REGULAR' || (c.currentDuePoisha || 0) > 0);
      } else if (activeSegment === 'WHOLESALE_CORPORATE') {
        result = result.filter(c => c.customerType === 'WHOLESALE' || c.customerType === 'CORPORATE');
      } else if (activeSegment === 'VIP_LOYAL') {
        result = result.filter(c => c.customerType === 'VIP_LOYAL' || c.loyaltyTier === 'GOLD' || c.loyaltyTier === 'PLATINUM');
      } else if (activeSegment === 'OPTICS') {
        result = result.filter(c => Boolean(c.prescription));
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return (a.name || '').localeCompare(b.name || '', 'bn');
      }
      if (sortBy === 'SPEND_DESC') {
        return (b.totalPurchasesPoisha || 0) - (a.totalPurchasesPoisha || 0);
      }
      if (sortBy === 'DUE_DESC') {
        return (b.currentDuePoisha || 0) - (a.currentDuePoisha || 0);
      }
      if (sortBy === 'RECENT_VISIT') {
        return new Date(b.lastPurchaseDate || 0) - new Date(a.lastPurchaseDate || 0);
      }
      return 0;
    });

    return result;
  }, [customers, searchQuery, activeSegment, sortBy]);

  // Paginated Customers for focused viewing
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // ── CSV Export ──
  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error(isBengali ? 'এক্সপোর্ট করার মতো কোনো গ্রাহক নেই!' : 'No customer data to export!');
      return;
    }
    const headers = ['Customer Code', 'Name', 'Phone', 'Alt Phone', 'Customer Type', 'Company', 'Address', 'District', 'Current Due (BDT)', 'Lifetime Spent (BDT)', 'Total Visits', 'Loyalty Tier'];
    const rows = filteredCustomers.map(c => [
      c.customerCode || c.id,
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.altPhone || ''}"`,
      c.customerType || 'RETAIL_CASH',
      `"${c.company || ''}"`,
      `"${c.address || ''}"`,
      c.district || '',
      poishaToTaka(c.currentDuePoisha || 0),
      poishaToTaka(c.totalPurchasesPoisha || 0),
      c.totalTransactionsCount || 0,
      c.loyaltyTier || 'REGULAR',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerX_Customer_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isBengali ? 'গ্রাহক তালিকা সফলভাবে ডাউনলোড হয়েছে!' : 'Customer list exported!');
  };

  // ── Print Directory ──
  const handlePrint = () => {
    window.print();
  };

  // ── WhatsApp Direct Message ──
  const handleWhatsApp = (customer) => {
    if (!customer.phone) {
      toast.error(isBengali ? 'গ্রাহকের মোবাইল নম্বর নেই!' : 'No phone number for customer!');
      return;
    }
    const greeting = isBengali
      ? `প্রিয় ${customer.name}, ${activeTenant?.name || 'আমাদের প্রতিষ্ঠান'} থেকে শুভেচ্ছা। কেমন আছেন? আপনার যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করতে পারেন।`
      : `Hello ${customer.name}, greetings from ${activeTenant?.name || 'our shop'}. How can we assist you today?`;
    openWhatsAppDirect(customer.phone, greeting);
  };

  // Helper badge for customer type
  const getCustomerTypePill = (type) => {
    switch(type) {
      case 'WHOLESALE':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold">🏢 {isBengali ? 'পাইকারি ডিলার' : 'Wholesale'}</span>;
      case 'CORPORATE':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">🏛️ {isBengali ? 'করপোরেট' : 'Corporate'}</span>;
      case 'VIP_LOYAL':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">⭐ {isBengali ? 'ভিআইপি মেম্বার' : 'VIP Member'}</span>;
      case 'CREDIT_REGULAR':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">💳 {isBengali ? 'নিয়মিত বাকি' : 'Credit Customer'}</span>;
      case 'RETAIL_CASH':
      default:
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">🛍️ {isBengali ? 'নগদ খরিদ্দার' : 'Cash Retail'}</span>;
    }
  };

  const directoryMetrics = useMemo(() => [
    {
      id: 'total',
      label: isBengali ? 'মোট নিবন্ধিত' : 'Total Customers',
      value: `${kpis.total} ${isBengali ? 'জন' : ''}`,
      subtitle: isBengali ? 'সক্রিয় গ্রাহক তালিকা' : 'Active customers',
      icon: Users,
      valueColor: 'text-slate-900',
    },
    {
      id: 'cash',
      label: isBengali ? 'নগদ খরিদ্দার' : 'Cash Retail',
      value: `${kpis.cashCount} ${isBengali ? 'জন' : ''}`,
      subtitle: isBengali ? 'নগদ ক্রেতা' : 'Direct cash buyers',
      icon: ShoppingBag,
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
    },
    {
      id: 'credit',
      label: isBengali ? 'বাকি খাতাভুক্ত' : 'Credit Accounts',
      value: `${kpis.creditCount} ${isBengali ? 'জন' : ''}`,
      subtitle: kpis.totalDuePoisha > 0 ? formatCurrency(kpis.totalDuePoisha, isBengali) : (isBengali ? 'বকেয়া শূন্য' : 'No dues'),
      icon: CreditCard,
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-600',
    },
    {
      id: 'b2b-vip',
      label: isBengali ? 'পাইকারি ও ভিআইপি' : 'B2B & VIP',
      value: `${kpis.wholesaleCorporateCount + kpis.vipCount} ${isBengali ? 'জন' : ''}`,
      subtitle: `B2B: ${kpis.wholesaleCorporateCount} | VIP: ${kpis.vipCount}`,
      icon: Crown,
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600',
    },
  ], [kpis, isBengali]);

  const directoryTabs = useMemo(() => {
    const list = [
      { id: 'ALL', label: isBengali ? 'সকল গ্রাহক' : 'All', count: customers.length },
      { id: 'RETAIL_CASH', label: isBengali ? 'নগদ খরিদ্দার' : 'Cash', count: kpis.cashCount },
      { id: 'CREDIT_REGULAR', label: isBengali ? 'বাকি খাতাভুক্ত' : 'Credit', count: kpis.creditCount },
      { id: 'WHOLESALE_CORPORATE', label: isBengali ? 'পাইকারি ও B2B' : 'B2B', count: kpis.wholesaleCorporateCount },
      { id: 'VIP_LOYAL', label: isBengali ? 'ভিআইপি মেম্বার' : 'VIP', count: kpis.vipCount },
    ];
    if (activeTenant?.businessType === 'OPTICS') {
      list.push({ id: 'OPTICS', label: isBengali ? '👓 চশমার খাতা' : '👓 Optics' });
    }
    return list;
  }, [customers.length, kpis, activeTenant?.businessType, isBengali]);

  return (
    <div className="w-full pb-12">
      {/* ── Compact Enterprise Page Header ── */}
      <UnifiedPageHeader
        icon={Users}
        title={isBengali ? 'সার্বজনীন গ্রাহক ডেটাবেস ও সিআরএম' : 'Master Customer Directory & CRM'}
        subtitle={
          isBengali 
            ? 'ব্যবসার সকল নগদ, বাকি, পাইকারি, করপোরেট ও ভিআইপি গ্রাহকের কেন্দ্রীয় তথ্যভাণ্ডার' 
            : 'Central master database of all cash, credit, wholesale, corporate & VIP clients'
        }
        badge={isEasyMode ? 'সহজ খাতা' : 'আল্ট্রা ইআরপি'}
        badgeColor={isEasyMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/customers')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
              title="কাস্টমার বাকির খাতায় যান"
            >
              <CreditCard size={14} />
              <span>{isBengali ? 'বাকি খাতা 📖' : 'Due Khata 📖'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
              title="এক্সেল বা সিএসভি ডাউনলোড"
            >
              <Download size={14} />
              <span>{isBengali ? 'CSV' : 'Export'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
              title="গ্রাহক তালিকা প্রিন্ট করুন"
            >
              <Printer size={14} />
              <span>{isBengali ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsAddEditModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>{isBengali ? '+ নতুন গ্রাহক' : '+ Customer'}</span>
            </button>
          </div>
        }
      />

      {/* ── Executive Customer Metric Ribbon ── */}
      <MetricRibbon metrics={directoryMetrics} />

      {/* ── Single-Row Unified Toolbar ── */}
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          isBengali
            ? 'নাম, মোবাইল নম্বর, আইডি বা এলাকা লিখে খুঁজুন...'
            : 'Search by name, phone, code or area...'
        }
        tabs={directoryTabs}
        activeTab={activeSegment}
        onTabChange={setActiveSegment}
        filterSlot={
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
              {isBengali ? 'সাজান:' : 'Sort:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="NAME_ASC">{isBengali ? 'নাম অনুযায়ী (A-Z)' : 'Name (A-Z)'}</option>
              <option value="SPEND_DESC">{isBengali ? 'সর্বোচ্চ কেনাকাটা' : 'Highest Spend'}</option>
              <option value="DUE_DESC">{isBengali ? 'সর্বোচ্চ বাকি' : 'Highest Due'}</option>
              <option value="RECENT_VISIT">{isBengali ? 'সাম্প্রতিক লেনদেন' : 'Recent Visit'}</option>
            </select>
          </div>
        }
        actionsSlot={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'GRID' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="কার্ড ভিউ"
            >
              <LayoutGrid size={13} />
              <span>{isBengali ? 'গ্রিড' : 'Grid'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'TABLE' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="টেবিল ভিউ"
            >
              <TableIcon size={13} />
              <span>{isBengali ? 'টেবিল' : 'Table'}</span>
            </button>
          </div>
        }
      />

      {/* ── 4. Main Customer Directory Display ── */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users size={32} />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {isBengali ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No customers found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isBengali 
              ? 'আপনার সার্চ কুয়েরি অথবা ফিল্টার পরিবর্তন করুন, অথবা নতুন গ্রাহক নিবন্ধন করুন।' 
              : 'Try adjusting your search criteria or register a new customer.'}
          </p>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsAddEditModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
          >
            + {isBengali ? 'নতুন গ্রাহক যোগ করুন' : 'Add Customer'}
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* ── GRID CARD VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedCustomers.map((cust) => {
            const isDue = (cust.currentDuePoisha || 0) > 0;
            const isAdvance = (cust.currentDuePoisha || 0) < 0;

            return (
              <div 
                key={cust.id}
                onClick={() => setViewingProfileCustomer(cust)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Header: Avatar & Segment Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-base flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                        {cust.name ? cust.name.charAt(0) : 'G'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                          {cust.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                          <span className="font-mono font-semibold">
                            {cust.customerCode || cust.id.slice(-6).toUpperCase()}
                          </span>
                          {cust.loyaltyTier === 'GOLD' && <span>🥇</span>}
                          {cust.loyaltyTier === 'PLATINUM' && <span>👑</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getCustomerTypePill(cust.customerType)}
                    </div>
                  </div>

                  {/* Contact / Company */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    {cust.company && (
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                        <Building2 size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{cust.company}</span>
                      </p>
                    )}
                    <p className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{cust.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')}</span>
                    </p>
                    {cust.address && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Financial Balance Capsule (Clean & Quiet) */}
                  <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs mb-3 ${
                    isDue 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : isAdvance 
                      ? 'bg-emerald-50/70 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-0.5">
                        {isBengali ? 'বর্তমান স্থিতি' : 'Balance'}
                      </span>
                      {isDue ? (
                        <span className="font-black text-rose-700 text-sm tabular-nums">
                          ৳{poishaToTaka(cust.currentDuePoisha).toLocaleString()} {isBengali ? 'বাকি' : 'Due'}
                        </span>
                      ) : isAdvance ? (
                        <span className="font-black text-emerald-700 text-sm tabular-nums">
                          ৳{poishaToTaka(Math.abs(cust.currentDuePoisha)).toLocaleString()} {isBengali ? 'জমা' : 'Advance'}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400 text-xs">
                          {isBengali ? 'পরিশোধিত ✓' : 'Settled ✓'}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {isBengali ? 'মোট কেনাকাটা' : 'Total Spent'}
                      </span>
                      <span className="font-bold text-slate-700 tabular-nums text-xs">
                        ৳{poishaToTaka(cust.totalPurchasesPoisha || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div 
                  className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2 text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setViewingProfileCustomer(cust)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer text-center truncate flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <span>👁️ {isBengali ? 'প্রোফাইল ও খতিয়ান' : '360° Profile'}</span>
                  </button>

                  {cust.phone && (
                    <button
                      type="button"
                      onClick={() => handleWhatsApp(cust)}
                      className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer active:scale-95 shrink-0"
                      title="WhatsApp মেসেজ"
                    >
                      <MessageCircle size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomer(cust);
                      setIsAddEditModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer active:scale-95 shrink-0"
                    title="এডিট"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── COMPACT TABLE VIEW ── */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">{isBengali ? 'গ্রাহক ও কোড' : 'Customer & Code'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'ধরন' : 'Category'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'যোগাযোগ ও ঠিকানা' : 'Phone & Address'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'মোট ক্রয় (৳)' : 'Total Spent'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'বর্তমান ব্যালেন্স' : 'Balance'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedCustomers.map((cust) => {
                  const isDue = (cust.currentDuePoisha || 0) > 0;
                  const isAdvance = (cust.currentDuePoisha || 0) < 0;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center shrink-0 border border-indigo-100">
                            {cust.name ? cust.name.charAt(0) : 'G'}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{cust.name}</p>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {cust.customerCode || cust.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getCustomerTypePill(cust.customerType)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-slate-700">{cust.phone || 'নম্বর নেই'}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{cust.address || cust.district || ''}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-black tabular-nums text-slate-900">
                        ৳{poishaToTaka(cust.totalPurchasesPoisha || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isDue ? (
                          <span className="font-black text-rose-600 tabular-nums">
                            ৳{poishaToTaka(cust.currentDuePoisha).toLocaleString()} বাকি
                          </span>
                        ) : isAdvance ? (
                          <span className="font-black text-emerald-600 tabular-nums">
                            ৳{poishaToTaka(Math.abs(cust.currentDuePoisha)).toLocaleString()} জমা
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">পরিশোধিত ✓</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingProfileCustomer(cust)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition cursor-pointer"
                            title="সম্পূর্ণ প্রোফাইল"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(cust);
                              setIsAddEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="এডিট"
                          >
                            <Edit3 size={14} />
                          </button>
                          {cust.phone && (
                            <button
                              onClick={() => handleWhatsApp(cust)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                              title="WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4.5 Clean Pagination Toolbar for Customer Directory ── */}
      {filteredCustomers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-3">
            <span>
              {isBengali 
                ? `মোট ${filteredCustomers.length} জন গ্রাহক • ${(currentPage - 1) * pageSize + 1} হতে ${Math.min(currentPage * pageSize, filteredCustomers.length)} প্রদর্শিত` 
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
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
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

      {/* ── 5. Add / Edit Customer Modal ── */}
      {isAddEditModalOpen && (
        <AddEditCustomerModal
          isOpen={true}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingCustomer(null);
          }}
          initialData={editingCustomer}
          onSave={(data) => {
            if (editingCustomer) {
              editCustomer(editingCustomer.id, data);
            } else {
              addCustomer(data);
            }
            setIsAddEditModalOpen(false);
            setEditingCustomer(null);
          }}
          isBengali={isBengali}
        />
      )}

      {/* ── 6. Customer 360° Profile Drawer ── */}
      {viewingProfileCustomer && (
        <Customer360Drawer
          customer={viewingProfileCustomer}
          onClose={() => setViewingProfileCustomer(null)}
          onEdit={() => {
            setEditingCustomer(viewingProfileCustomer);
            setViewingProfileCustomer(null);
            setIsAddEditModalOpen(true);
          }}
          onOpenPrescription={() => {
            setPrescriptionCustomer(viewingProfileCustomer);
            setViewingProfileCustomer(null);
          }}
          onOpenDueKhata={() => {
            navigate('/customers');
          }}
          ledgerEntries={ledgerEntries.filter(e => e.partyId === viewingProfileCustomer.id)}
          isOpticsStore={activeTenant?.businessType === 'OPTICS'}
          isBengali={isBengali}
        />
      )}

      {/* ── 7. Optics Prescription Modal ── */}
      {prescriptionCustomer && (
        <PrescriptionModal
          isOpen={Boolean(prescriptionCustomer)}
          onClose={() => setPrescriptionCustomer(null)}
          customer={prescriptionCustomer}
          onSavePrescription={(customerId, rxData) => {
            editCustomer(customerId, {
              prescription: rxData,
              prescriptionDate: rxData.rxDate || new Date().toISOString().split('T')[0],
            });
            setPrescriptionCustomer(null);
          }}
        />
      )}
    </div>
  );
}

// ── Add / Edit Customer Modal Component ────────────────────────────────────────
function AddEditCustomerModal({ isOpen, onClose, initialData, onSave, isBengali }) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [altPhone, setAltPhone] = useState(initialData?.altPhone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [customerType, setCustomerType] = useState(initialData?.customerType || 'RETAIL_CASH');
  const [address, setAddress] = useState(initialData?.address || '');
  const [district, setDistrict] = useState(initialData?.district || 'ঢাকা');
  const [creditLimitTaka, setCreditLimitTaka] = useState(
    initialData ? String(poishaToTaka(initialData.creditLimitPoisha || 0)) : '50000'
  );
  const [initialDueTaka, setInitialDueTaka] = useState(
    initialData ? String(poishaToTaka(initialData.currentDuePoisha || 0)) : '0'
  );
  const [loyaltyTier, setLoyaltyTier] = useState(initialData?.loyaltyTier || 'REGULAR');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isBengali ? 'গ্রাহকের নাম লিখুন' : 'Enter customer name');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      email: email.trim(),
      company: company.trim(),
      customerType,
      address: address.trim(),
      district: district.trim(),
      creditLimitPoisha: takaToPoisha(parseFloat(creditLimitTaka) || 0),
      initialDuePoisha: takaToPoisha(parseFloat(initialDueTaka) || 0),
      loyaltyTier,
      notes: notes.trim(),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-6 border border-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <UserPlus size={20} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {initialData 
                  ? (isBengali ? 'গ্রাহক তথ্য পরিবর্তন' : 'Edit Customer Profile')
                  : (isBengali ? 'নতুন গ্রাহক প্রোফাইল তৈরি' : 'Add New Customer Profile')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isBengali ? 'সার্বজনীন গ্রাহক ডেটাবেসের জন্য বিস্তারিত তথ্য সংরক্ষণ করুন' : 'Enter complete customer profile details for master CRM'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Type Selector */}
          <div>
            <label className="text-[11px] font-black uppercase text-slate-700 block mb-1.5">
              {isBengali ? 'গ্রাহকের ধরন / ক্যাটাগরি:' : 'Customer Type:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'RETAIL_CASH', labelBn: '🛍️ নগদ খরিদ্দার', labelEn: 'Cash Retail' },
                { key: 'CREDIT_REGULAR', labelBn: '💳 বাকি খরিদ্দার', labelEn: 'Credit Regular' },
                { key: 'WHOLESALE', labelBn: '🏢 পাইকারি ডিলার', labelEn: 'Wholesale' },
                { key: 'CORPORATE', labelBn: '🏛️ করপোরেট', labelEn: 'Corporate' },
                { key: 'VIP_LOYAL', labelBn: '⭐ ভিআইপি মেম্বার', labelEn: 'VIP Member' },
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setCustomerType(t.key)}
                  className={`p-2 rounded-xl text-xs font-bold transition border text-left cursor-pointer ${
                    customerType === t.key
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isBengali ? t.labelBn : t.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'গ্রাহকের পুরো নাম' : 'Full Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isBengali ? 'যেমন: মো: রহিম মিয়া' : 'e.g. Rahim Miah'}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Alt Phone & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'বিকল্প মোবাইল / WhatsApp (ঐচ্ছিক)' : 'Alternate Phone / WhatsApp'}
              </label>
              <input
                type="text"
                value={altPhone}
                onChange={e => setAltPhone(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'প্রতিষ্ঠান বা দোকানের নাম (ঐচ্ছিক)' : 'Company / Shop Name'}
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder={isBengali ? 'যেমন: রহিম ট্রেডার্স' : 'e.g. Rahim Traders'}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Address & District */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'পূর্ণাঙ্গ ঠিকানা' : 'Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={isBengali ? 'বাড়ি নং, রোড, এলাকা' : 'House, Road, Area'}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'জেলা / থানা' : 'District'}
              </label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder="ঢাকা"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Financials: Credit Limit & Initial Due */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'সর্বোচ্চ বাকির লিমিট (টাকা)' : 'Credit Limit (BDT)'}
              </label>
              <input
                type="number"
                value={creditLimitTaka}
                onChange={e => setCreditLimitTaka(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'প্রারম্ভিক বকেয়া বা অগ্রিম (টাকা)' : 'Initial Due / Advance (BDT)'}
              </label>
              <input
                type="number"
                value={initialDueTaka}
                onChange={e => setInitialDueTaka(e.target.value)}
                placeholder="0"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isBengali ? '(মাইনাস দিলে অগ্রিম হিসেবে সেভ হবে)' : '(Negative for Advance)'}
              </span>
            </div>
          </div>

          {/* Loyalty Tier & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'লয়ালটি মেম্বারশিপ' : 'Loyalty Tier'}
              </label>
              <select
                value={loyaltyTier}
                onChange={e => setLoyaltyTier(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
              >
                <option value="REGULAR">Regular (সাধারণ)</option>
                <option value="SILVER">Silver 🥈</option>
                <option value="GOLD">Gold 🥇</option>
                <option value="PLATINUM">Platinum 👑</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isBengali ? 'অভ্যন্তরীণ মন্তব্য বা নোট' : 'Internal Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isBengali ? 'যেমন: বিশেষ ছাড় প্রযোজ্য, রেফারেন্স' : 'Special remarks'}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-2 h-11 rounded-xl text-white bg-slate-900 hover:bg-slate-800 font-black shadow-md shadow-slate-900/20 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>{isBengali ? 'গ্রাহক তথ্য সংরক্ষণ' : 'Save Customer Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Customer 360° Profile & Transaction Drawer ───────────────────────────────
function Customer360Drawer({ customer, onClose, onEdit, onOpenPrescription, onOpenDueKhata, ledgerEntries = [], isOpticsStore, isBengali }) {
  const isDue = (customer.currentDuePoisha || 0) > 0;
  const isAdvance = (customer.currentDuePoisha || 0) < 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 font-black text-xl flex items-center justify-center border border-indigo-500/30">
              {customer.name ? customer.name.charAt(0) : 'G'}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight text-white flex items-center gap-2">
                <span>{customer.name}</span>
                {customer.loyaltyTier === 'GOLD' && <span>🥇</span>}
                {customer.loyaltyTier === 'PLATINUM' && <span>👑</span>}
              </h3>
              <p className="text-xs text-indigo-200 font-mono">
                {customer.customerCode || customer.id} • {customer.company || 'গ্রাহক'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          
          {/* Quick Contact & WhatsApp Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">মোবাইল নম্বর</p>
              <p className="font-mono font-bold text-sm text-slate-900">{customer.phone || 'নম্বর নেই'}</p>
            </div>
            <div className="flex items-center gap-2">
              {customer.phone && (
                <>
                  <a
                    href={`tel:${customer.phone}`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 transition"
                    title="সরাসরি ফোন করুন"
                  >
                    <Phone size={16} />
                  </a>
                  <button
                    onClick={() => {
                      const msg = `প্রিয় ${customer.name}, শুভেচ্ছা। আপনার সাথে যোগাযোগ করতে চাচ্ছি।`;
                      openWhatsAppDirect(customer.phone, msg);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    title="WhatsApp চ্যাট"
                  >
                    <MessageCircle size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Financial Balance Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-pink-50/30 border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold">বর্তমান হিসাবের স্থিতি:</span>
              {isDue ? (
                <span className="text-base font-black text-rose-600 tabular-nums">
                  ৳{poishaToTaka(customer.currentDuePoisha).toLocaleString()} বাকি
                </span>
              ) : isAdvance ? (
                <span className="text-base font-black text-emerald-600 tabular-nums">
                  ৳{poishaToTaka(Math.abs(customer.currentDuePoisha)).toLocaleString()} অগ্রিম জমা
                </span>
              ) : (
                <span className="text-base font-black text-slate-500">পরিশোধিত (০.০০)</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-100/60 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block">মোট কেনাকাটা</span>
                <span className="font-black text-sm tabular-nums">
                  ৳{poishaToTaka(customer.totalPurchasesPoisha || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">মোট ভিজিট / অর্ডার</span>
                <span className="font-black text-sm tabular-nums">
                  {customer.totalTransactionsCount || 0} বার
                </span>
              </div>
            </div>

            {isDue && (
              <button
                onClick={onOpenDueKhata}
                className="w-full mt-2 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>বাকি খাতা ও স্টেটমেন্ট দেখুন 📖</span>
              </button>
            )}
          </div>

          {/* Profile Details Sheet */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <p className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              প্রোফাইল বিবরণী
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div>
                <span className="text-slate-400 block">বিকল্প মোবাইল:</span>
                <span className="font-bold text-slate-800">{customer.altPhone || 'নেই'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ইমেইল:</span>
                <span className="font-bold text-slate-800">{customer.email || 'নেই'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">জেলা / শহর:</span>
                <span className="font-bold text-slate-800">{customer.district || 'ঢাকা'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">লয়ালটি পয়েন্ট:</span>
                <span className="font-bold text-amber-700">{customer.loyaltyPoints || 0} পয়েন্ট</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">ঠিকানা:</span>
                <span className="font-bold text-slate-800">{customer.address || 'ঠিকানা দেওয়া নেই'}</span>
              </div>
              {customer.notes && (
                <div className="col-span-2 p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-700 block">নোট:</span>
                  <span>{customer.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Optics Prescription (Strictly Optics Store) */}
          {isOpticsStore && customer.prescription && (
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-cyan-950">
                  <Glasses size={16} className="text-cyan-700" />
                  <span>চশমার পাওয়ার বিবরণী (OD / OS)</span>
                </div>
                <button
                  onClick={onOpenPrescription}
                  className="px-2 py-0.5 rounded-lg bg-cyan-600 text-white text-[10px] font-bold hover:bg-cyan-700"
                >
                  বিস্তারিত / এডিট
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center my-2">
                <div className="p-2 rounded-xl bg-white border border-cyan-200">
                  <p className="font-black text-cyan-800">ডান চোখ (OD)</p>
                  <p className="font-mono text-cyan-950 font-bold">SPH: {customer.prescription.rightEye?.sph}</p>
                  <p className="font-mono text-slate-500 text-[10px]">CYL: {customer.prescription.rightEye?.cyl} | AX: {customer.prescription.rightEye?.axis}</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-cyan-200">
                  <p className="font-black text-cyan-800">বাম চোখ (OS)</p>
                  <p className="font-mono text-cyan-950 font-bold">SPH: {customer.prescription.leftEye?.sph}</p>
                  <p className="font-mono text-slate-500 text-[10px]">CYL: {customer.prescription.leftEye?.cyl} | AX: {customer.prescription.leftEye?.axis}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Ledger History */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between font-black text-slate-800 text-[11px]">
              <span>সাম্প্রতিক লেনদেন ইতিহাস ({ledgerEntries.length})</span>
            </div>

            {ledgerEntries.length === 0 ? (
              <p className="text-slate-400 text-center py-4">কোনো পূর্ববর্তী লেনদেন রেকর্ড পাওয়া যায়নি</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {ledgerEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{entry.description || entry.type}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`font-black font-mono ${entry.type === 'DIBO' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {entry.type === 'DIBO' ? '+' : '-'}৳{poishaToTaka(entry.amountPoisha).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition text-center"
          >
            ✏️ তথ্য এডিট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
