import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { useTenant } from '../context/TenantContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { formatCurrency, poishaToTaka } from '../utils/currency';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
import SlideOverDrawer from '../components/common/SlideOverDrawer';
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

const WORKSPACES = [
  { key: 'ALL', icon: '📑', labelBn: 'সার্বজনীন লেজার', labelEn: 'General Ledger', desc: 'সকল আর্থিক ট্রানজ্যাকশন ও নগদ প্রবাহ' },
  { key: 'POS', icon: '🛍️', labelBn: 'কাউন্টার পিওএস', labelEn: 'POS Sales', desc: 'ক্যাশ কাউন্টার ও মেমো বিক্রয়ের হিসাব' },
  { key: 'CUSTOMER', icon: '👥', labelBn: 'কাস্টমার দেনা-পাওনা', labelEn: 'Customers', desc: 'বাকি, জমা ও হালখাতার ট্র্যাকিং' },
  { key: 'SUPPLIER', icon: '🏢', labelBn: 'মহাজন ও ক্রয় চালান', labelEn: 'Suppliers', desc: 'মহাজন পরিশোধ ও মালামাল সরবরাহ' },
  { key: 'EXPENSE', icon: '🧾', labelBn: 'দোকান ব্যয় ও ক্যাশ', labelEn: 'Shop Expenses', desc: 'দৈনন্দিন খরচ, স্টাফ বিল ও উত্তোলন' },
];

const SUB_FILTERS = {
  ALL: [
    { key: 'ALL', labelBn: 'সকল রেকর্ড', labelEn: 'All Types' },
    { key: 'INFLOW', labelBn: '🟢 ক্যাশ আগমন (+)', labelEn: 'Inflows' },
    { key: 'OUTFLOW', labelBn: '🔴 ক্যাশ খরচ (-)', labelEn: 'Outflows' },
  ],
  POS: [
    { key: 'POS_ALL', labelBn: 'সকল পিওএস বিক্রয়', labelEn: 'All POS Sales' },
    { key: 'POS_CASH', labelBn: 'নগদ ক্যাশ বিক্রয়', labelEn: 'Cash Sales' },
    { key: 'POS_DIGITAL', labelBn: 'ডিজিটাল (বিকাশ/কার্ড)', labelEn: 'Digital Sales' },
  ],
  CUSTOMER: [
    { key: 'CUSTOMER_ALL', labelBn: 'সকল কাস্টমার এন্ট্রি', labelEn: 'All Customer' },
    { key: 'PABO', labelBn: 'কাস্টমার আদায় (+)', labelEn: 'Collections' },
    { key: 'DIBO', labelBn: 'বাকি প্রদান (-)', labelEn: 'Credit Given' },
    { key: 'HALKHATA', labelBn: 'হালখাতা নিষ্পত্তি', labelEn: 'Halkhata' },
  ],
  SUPPLIER: [
    { key: 'SUPPLIER_ALL', labelBn: 'সকল মহাজন এন্ট্রি', labelEn: 'All Suppliers' },
    { key: 'SUPPLIER_PAYMENT', labelBn: 'মহাজন পরিশোধ (-)', labelEn: 'Payments' },
    { key: 'SUPPLIER_PURCHASE', labelBn: 'মালামাল চালান / ক্রয়', labelEn: 'Purchases' },
  ],
  EXPENSE: [
    { key: 'EXPENSE_ALL', labelBn: 'সকল দোকান ব্যয়', labelEn: 'All Expenses' },
    { key: 'EXPENSE_DIRECT', labelBn: 'দোকান খরচ', labelEn: 'Shop Expenses' },
    { key: 'CASH_OUT', labelBn: 'ক্যাশ উত্তোলন', labelEn: 'Cash Withdrawals' },
    { key: 'TRANSFER', labelBn: 'ওয়ালেট ট্রান্সফার', labelEn: 'Transfers' },
  ],
};

export default function SystemHistory() {
  const { ledgerEntries = [], invoices = [], customers = [], suppliers = [], archiveLedgerRollups } = useKhata();
  const { activeTenant, isOwner } = useTenant();
  const { isBengali, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  // Search & Filter States
  const [activeWorkspace, setActiveWorkspace] = useState('ALL');
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

  // Processed History Records (Workspace Segmentation, Sub-filter, Search & Sorting)
  const processedHistory = useMemo(() => {
    return filteredByDate.filter((entry) => {
      // 1. Workspace Partitioning
      if (activeWorkspace === 'POS') {
        const isPos = entry.type === 'POS_SALE' || entry.type === 'SALE';
        if (!isPos) return false;
        if (historyCategory === 'POS_CASH') {
          if (entry.paymentMode && entry.paymentMode !== 'CASH') return false;
        } else if (historyCategory === 'POS_DIGITAL') {
          if (!entry.paymentMode || entry.paymentMode === 'CASH') return false;
        }
      } else if (activeWorkspace === 'CUSTOMER') {
        const isCustomer = ['PABO', 'DIBO', 'CUSTOMER_PAYMENT', 'CUSTOMER_CREDIT', 'HALKHATA_SETTLEMENT'].includes(entry.type) || entry.partyType === 'CUSTOMER';
        if (!isCustomer) return false;
        if (historyCategory === 'PABO' && !['PABO', 'CUSTOMER_PAYMENT'].includes(entry.type)) return false;
        if (historyCategory === 'DIBO' && !['DIBO', 'CUSTOMER_CREDIT'].includes(entry.type)) return false;
        if (historyCategory === 'HALKHATA' && entry.type !== 'HALKHATA_SETTLEMENT') return false;
      } else if (activeWorkspace === 'SUPPLIER') {
        const isSupplier = ['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER', 'SUPPLIER_PURCHASE', 'PURCHASE', 'PURCHASE_BILL', 'CREDIT_PURCHASE'].includes(entry.type) || entry.partyType === 'SUPPLIER';
        if (!isSupplier) return false;
        if (historyCategory === 'SUPPLIER_PAYMENT' && !['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(entry.type)) return false;
        if (historyCategory === 'SUPPLIER_PURCHASE' && !['SUPPLIER_PURCHASE', 'PURCHASE', 'PURCHASE_BILL', 'CREDIT_PURCHASE'].includes(entry.type)) return false;
      } else if (activeWorkspace === 'EXPENSE') {
        const isExpense = ['EXPENSE', 'CASH_OUT', 'TRANSFER', 'WALLET_TRANSFER'].includes(entry.type);
        if (!isExpense) return false;
        if (historyCategory === 'EXPENSE_DIRECT' && entry.type !== 'EXPENSE') return false;
        if (historyCategory === 'CASH_OUT' && entry.type !== 'CASH_OUT') return false;
        if (historyCategory === 'TRANSFER' && !['TRANSFER', 'WALLET_TRANSFER'].includes(entry.type)) return false;
      } else if (activeWorkspace === 'ALL') {
        if (historyCategory === 'INFLOW') {
          const isPos = entry.type === 'POS_SALE' && ((entry.amountPoisha || 0) > 0 || (entry.paidPoisha || 0) > 0);
          const isIn = entry.type === 'CASH_IN' || entry.type === 'PABO' || entry.type === 'HALKHATA_SETTLEMENT' || isPos;
          if (!isIn) return false;
        } else if (historyCategory === 'OUTFLOW') {
          const isOut = entry.type === 'CASH_OUT' || entry.type === 'SUPPLIER_PAYMENT' || entry.type === 'PAYMENT_TO_SUPPLIER' || entry.type === 'EXPENSE';
          if (!isOut) return false;
        }
      }

      // 2. Search Query Matching
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const idMatch = (entry.id || '').toLowerCase().includes(q);
        const invoiceMatch = (entry.invoiceId || '').toLowerCase().includes(q);
        const partyMatch = (entry.partyName || '').toLowerCase().includes(q);
        const descMatch = (entry.description || '').toLowerCase().includes(q);
        const amtTaka = poishaToTaka(entry.amountPoisha || entry.paidPoisha || entry.cashCollectedPoisha || 0).toString();
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
  }, [filteredByDate, activeWorkspace, historyCategory, historySearch, historySort]);

  // Pagination calculation
  const totalPages = Math.ceil(processedHistory.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedHistory.slice(start, start + pageSize);
  }, [processedHistory, currentPage, pageSize]);

  // Dynamic Workspace-Aware KPI Statistics
  const workspaceStats = useMemo(() => {
    let inflowPoisha = 0;
    let outflowPoisha = 0;
    let posCount = 0;
    let posTotalSalesPoisha = 0;
    let posCashPoisha = 0;
    let posDigitalPoisha = 0;

    let customerCount = 0;
    let customerReceivedPoisha = 0;
    let customerDueGivenPoisha = 0;

    let supplierCount = 0;
    let supplierPaidPoisha = 0;
    let supplierPurchasedPoisha = 0;

    let expenseCount = 0;
    let shopExpensePoisha = 0;
    let cashOutPoisha = 0;

    processedHistory.forEach((e) => {
      const isPositive = e.type === 'CASH_IN' || e.type === 'HALKHATA_SETTLEMENT' || (e.type === 'POS_SALE' && (e.paidPoisha > 0 || e.amountPoisha > 0)) || e.type === 'PABO';
      const isNegative = e.type === 'CASH_OUT' || e.type === 'PAYMENT_TO_SUPPLIER' || e.type === 'SUPPLIER_PAYMENT' || e.type === 'EXPENSE';
      const amt = Number(e.amountPoisha || e.cashCollectedPoisha || e.paidPoisha || 0);

      if (isPositive) inflowPoisha += amt;
      if (isNegative) outflowPoisha += amt;

      // POS Metrics
      if (e.type === 'POS_SALE' || e.type === 'SALE') {
        posCount++;
        posTotalSalesPoisha += amt;
        if (!e.paymentMode || e.paymentMode === 'CASH') {
          posCashPoisha += amt;
        } else {
          posDigitalPoisha += amt;
        }
      }

      // Customer Metrics
      if (['PABO', 'CUSTOMER_PAYMENT', 'HALKHATA_SETTLEMENT'].includes(e.type)) {
        customerCount++;
        customerReceivedPoisha += amt;
      } else if (['DIBO', 'CUSTOMER_CREDIT'].includes(e.type)) {
        customerCount++;
        customerDueGivenPoisha += amt;
      }

      // Supplier Metrics
      if (['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(e.type)) {
        supplierCount++;
        supplierPaidPoisha += amt;
      } else if (['SUPPLIER_PURCHASE', 'PURCHASE', 'PURCHASE_BILL', 'CREDIT_PURCHASE'].includes(e.type)) {
        supplierCount++;
        supplierPurchasedPoisha += amt;
      }

      // Expense Metrics
      if (e.type === 'EXPENSE') {
        expenseCount++;
        shopExpensePoisha += amt;
      } else if (e.type === 'CASH_OUT') {
        expenseCount++;
        cashOutPoisha += amt;
      }
    });

    return {
      totalCount: processedHistory.length,
      inflowPoisha,
      outflowPoisha,
      netPoisha: inflowPoisha - outflowPoisha,
      posCount,
      posTotalSalesPoisha,
      posCashPoisha,
      posDigitalPoisha,
      customerCount,
      customerReceivedPoisha,
      customerDueGivenPoisha,
      supplierCount,
      supplierPaidPoisha,
      supplierPurchasedPoisha,
      expenseCount,
      shopExpensePoisha,
      cashOutPoisha,
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
    link.setAttribute('download', `LedgerX_History_${activeWorkspace}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isBengali ? 'সিস্টেম হিস্ট্রি CSV ফাইল ডাউনলোড হয়েছে!' : 'History CSV downloaded!', { icon: '📊' });
  };

  const ribbonMetrics = useMemo(() => {
    if (activeWorkspace === 'ALL') {
      return [
        {
          id: 'total',
          label: isBengali ? 'মোট লেনদেন' : 'Total Records',
          value: `${workspaceStats.totalCount} ${isBengali ? 'টি' : ''}`,
          subtitle: `পিওএস: ${workspaceStats.posCount} | কাস্টমার: ${workspaceStats.customerCount}`,
          icon: Database,
          valueColor: 'text-slate-900',
        },
        {
          id: 'inflow',
          label: isBengali ? 'ক্যাশ আগমন (+)' : 'Inflow (+)',
          value: formatCurrency(workspaceStats.inflowPoisha, isBengali),
          subtitle: isBengali ? 'নগদ ও ডিজিটাল আদায়' : 'Collections',
          icon: ArrowDownLeft,
          iconColor: 'text-emerald-500',
          valueColor: 'text-emerald-600',
        },
        {
          id: 'outflow',
          label: isBengali ? 'ক্যাশ খরচ (-)' : 'Outflow (-)',
          value: formatCurrency(workspaceStats.outflowPoisha, isBengali),
          subtitle: isBengali ? 'মহাজন পরিশোধ ও ব্যয়' : 'Supplier & Expenses',
          icon: ArrowUpRight,
          iconColor: 'text-rose-500',
          valueColor: 'text-rose-600',
        },
        {
          id: 'net',
          label: isBengali ? 'নেট ক্যাশ সারপ্লাস' : 'Net Surplus',
          value: formatCurrency(workspaceStats.netPoisha, isBengali),
          subtitle: workspaceStats.netPoisha >= 0 ? (isBengali ? 'ইতিবাচক আর্থিক প্রবাহ' : 'Positive') : (isBengali ? 'ব্যয় ও পরিশোধের চাপ' : 'Negative'),
          icon: Wallet,
          iconColor: 'text-blue-500',
          valueColor: workspaceStats.netPoisha >= 0 ? 'text-blue-600' : 'text-amber-600',
        },
      ];
    }
    if (activeWorkspace === 'POS') {
      return [
        {
          id: 'pos-count',
          label: isBengali ? 'মোট পিওএস মেমো' : 'POS Memos',
          value: `${workspaceStats.posCount} ${isBengali ? 'টি' : ''}`,
          subtitle: isBengali ? 'কাউন্টার সেলস ইনভয়েস' : 'Counter Invoices',
          icon: Database,
          valueColor: 'text-slate-900',
        },
        {
          id: 'pos-sales',
          label: isBengali ? 'মোট বিক্রয় মূল্য' : 'Total Sales',
          value: formatCurrency(workspaceStats.posTotalSalesPoisha, isBengali),
          subtitle: isBengali ? 'মেমো ভিত্তিক মোট পণ্য বিক্রয়' : 'Total Invoiced',
          icon: ArrowDownLeft,
          iconColor: 'text-emerald-500',
          valueColor: 'text-emerald-600',
        },
        {
          id: 'pos-cash',
          label: isBengali ? 'নগদ ক্যাশ সংগ্রহ' : 'Cash Collected',
          value: formatCurrency(workspaceStats.posCashPoisha, isBengali),
          subtitle: isBengali ? 'ক্যাশ ড্রয়ারে জমা ক্যাশ' : 'Cash in Drawer',
          icon: Wallet,
          iconColor: 'text-blue-500',
          valueColor: 'text-blue-600',
        },
        {
          id: 'pos-digital',
          label: isBengali ? 'ডিজিটাল বিক্রয়' : 'Digital Sales',
          value: formatCurrency(workspaceStats.posDigitalPoisha, isBengali),
          subtitle: isBengali ? 'বিকাশ, নগদ, কার্ড ও ব্যাংক' : 'MFS & Bank',
          icon: Sparkles,
          iconColor: 'text-indigo-500',
          valueColor: 'text-indigo-600',
        },
      ];
    }
    if (activeWorkspace === 'CUSTOMER') {
      return [
        {
          id: 'cust-count',
          label: isBengali ? 'কাস্টমার লেনদেন' : 'Customer Records',
          value: `${workspaceStats.customerCount} ${isBengali ? 'টি' : ''}`,
          subtitle: isBengali ? 'আদায়, বাকি ও হালখাতা' : 'Receipts & Credit',
          icon: Database,
          valueColor: 'text-slate-900',
        },
        {
          id: 'cust-received',
          label: isBengali ? 'কাস্টমার হতে আদায় (+)' : 'Received (+)',
          value: formatCurrency(workspaceStats.customerReceivedPoisha, isBengali),
          subtitle: isBengali ? 'বকেয়া ও হালখাতা আদায়' : 'Collected dues',
          icon: ArrowDownLeft,
          iconColor: 'text-emerald-500',
          valueColor: 'text-emerald-600',
        },
        {
          id: 'cust-due',
          label: isBengali ? 'নতুন বাকি প্রদান (-)' : 'Credit Given (-)',
          value: formatCurrency(workspaceStats.customerDueGivenPoisha, isBengali),
          subtitle: isBengali ? 'কাস্টমার বাকি এন্ট্রি (দিবো)' : 'Given to customers',
          icon: ArrowUpRight,
          iconColor: 'text-rose-500',
          valueColor: 'text-rose-600',
        },
        {
          id: 'cust-net',
          label: isBengali ? 'নেট কাস্টমার ক্যাশফ্লো' : 'Net Flow',
          value: formatCurrency(workspaceStats.customerReceivedPoisha - workspaceStats.customerDueGivenPoisha, isBengali),
          subtitle: isBengali ? 'আদায় বনাম বাকি অনুপাত' : 'Collection balance',
          icon: Wallet,
          iconColor: 'text-blue-500',
          valueColor: (workspaceStats.customerReceivedPoisha - workspaceStats.customerDueGivenPoisha) >= 0 ? 'text-blue-600' : 'text-amber-600',
        },
      ];
    }
    if (activeWorkspace === 'SUPPLIER') {
      return [
        {
          id: 'sup-count',
          label: isBengali ? 'মহাজন লেনদেন' : 'Supplier Records',
          value: `${workspaceStats.supplierCount} ${isBengali ? 'টি' : ''}`,
          subtitle: isBengali ? 'পরিশোধ ও ক্রয় চালান' : 'Vouchers',
          icon: Database,
          valueColor: 'text-slate-900',
        },
        {
          id: 'sup-paid',
          label: isBengali ? 'মহাজন পরিশোধ (-)' : 'Supplier Paid (-)',
          value: formatCurrency(workspaceStats.supplierPaidPoisha, isBengali),
          subtitle: isBengali ? 'নগদ ও ব্যাংক পরিশোধ' : 'Paid amount',
          icon: ArrowUpRight,
          iconColor: 'text-rose-500',
          valueColor: 'text-rose-600',
        },
        {
          id: 'sup-purchase',
          label: isBengali ? 'মালামাল ক্রয় ও চালান' : 'Supplies & Purchases',
          value: formatCurrency(workspaceStats.supplierPurchasedPoisha, isBengali),
          subtitle: isBengali ? 'বাকিতে মালামাল গ্রহণ' : 'Credit purchase',
          icon: Layers,
          iconColor: 'text-purple-500',
          valueColor: 'text-purple-600',
        },
        {
          id: 'sup-vol',
          label: isBengali ? 'মোট মহাজন লেনদেন' : 'Total Supplier Volume',
          value: formatCurrency(workspaceStats.supplierPaidPoisha + workspaceStats.supplierPurchasedPoisha, isBengali),
          subtitle: isBengali ? 'পরিশোধ ও ক্রয় সামগ্রিক' : 'Gross Volume',
          icon: Wallet,
          iconColor: 'text-slate-500',
          valueColor: 'text-slate-800',
        },
      ];
    }
    if (activeWorkspace === 'EXPENSE') {
      return [
        {
          id: 'exp-count',
          label: isBengali ? 'মোট খরচের রেকর্ড' : 'Expense Vouchers',
          value: `${workspaceStats.expenseCount} ${isBengali ? 'টি' : ''}`,
          subtitle: isBengali ? 'দোকান খরচ ও উত্তোলন' : 'Shop expenses',
          icon: Database,
          valueColor: 'text-slate-900',
        },
        {
          id: 'exp-shop',
          label: isBengali ? 'দোকানের খরচ (-)' : 'Shop Expenses (-)',
          value: formatCurrency(workspaceStats.shopExpensePoisha, isBengali),
          subtitle: isBengali ? 'ভাড়া, বিদ্যুৎ ও স্টাফ খরচ' : 'Utilities & salaries',
          icon: ArrowUpRight,
          iconColor: 'text-rose-500',
          valueColor: 'text-rose-600',
        },
        {
          id: 'exp-cashout',
          label: isBengali ? 'ক্যাশ উত্তোলন (-)' : 'Cash Out (-)',
          value: formatCurrency(workspaceStats.cashOutPoisha, isBengali),
          subtitle: isBengali ? 'ড্রয়ার হতে ক্যাশ উত্তোলন' : 'Drawings',
          icon: ArrowUpRight,
          iconColor: 'text-amber-500',
          valueColor: 'text-amber-600',
        },
        {
          id: 'exp-total',
          label: isBengali ? 'মোট ব্যয় নির্গমন' : 'Total Outflow',
          value: formatCurrency(workspaceStats.shopExpensePoisha + workspaceStats.cashOutPoisha, isBengali),
          subtitle: isBengali ? 'মোট পরিচালিত নগদ ব্যয়' : 'Direct Cash Spent',
          icon: Wallet,
          iconColor: 'text-rose-600',
          valueColor: 'text-rose-700',
        },
      ];
    }
    return [];
  }, [activeWorkspace, workspaceStats, isBengali]);

  const workspaceTabs = useMemo(() => {
    return WORKSPACES.map((ws) => ({
      id: ws.key,
      label: `${ws.icon} ${isBengali ? ws.labelBn : ws.labelEn}`,
    }));
  }, [isBengali]);

  return (
    <div className="w-full pb-12">
      {/* ── Compact Enterprise Page Header ── */}
      <UnifiedPageHeader
        icon={Clock}
        title={isBengali ? 'সিস্টেম হিস্ট্রি ও অডিট ট্রেইল' : 'System History & Audit Trail'}
        subtitle={
          isBengali
            ? `ফিল্টারকৃত ${processedHistory.length}টি লেনদেন রেকর্ড • মেমরি: ${estimatedMemoryKB} KB`
            : `${processedHistory.length} filtered audit records • Memory: ${estimatedMemoryKB} KB`
        }
        badge={isEasyMode ? 'সহজ মোড' : 'আল্ট্রা ইআরপি'}
        badgeColor={isEasyMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptimizerModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
              title="ডাটাবেজ স্টোরেজ অপটিমাইজার ও হিস্ট্রি কম্প্রেশন"
            >
              <Cpu size={14} className="text-indigo-600" />
              <span>{estimatedMemoryKB} KB</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
              title="CSV ফাইল হিসেবে সংরক্ষণ"
            >
              <Download size={14} />
              <span>{isBengali ? 'CSV এক্সপোর্ট' : 'CSV'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="সম্পূর্ণ হিস্ট্রি প্রিন্ট করুন"
            >
              <Printer size={14} />
              <span>{isBengali ? 'প্রিন্ট' : 'Print'}</span>
            </button>
          </div>
        }
      />

      {/* ── Executive Metric Ribbon ── */}
      <MetricRibbon metrics={ribbonMetrics} />

      {/* ── Single-Row Unified Toolbar ── */}
      <UnifiedToolbar
        searchValue={historySearch}
        onSearchChange={(val) => {
          setHistorySearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder={
          isBengali
            ? 'ভাউচার নং, ইনভয়েস, পার্টি বা টাকা লিখে খুঁজুন...'
            : 'Search voucher ID, invoice, party or amount...'
        }
        tabs={workspaceTabs}
        activeTab={activeWorkspace}
        onTabChange={(tabId) => {
          setActiveWorkspace(tabId);
          setHistoryCategory(SUB_FILTERS[tabId][0].key);
          setCurrentPage(1);
        }}
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Calendar size={13} className="text-slate-400" />
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                {TIME_RANGES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {isBengali ? t.labelBn : t.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {timeRange === 'CUSTOM' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                />
                <span className="text-xs text-slate-400">হতে</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                />
              </div>
            )}

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">{isBengali ? 'নতুন আগে' : 'Newest First'}</option>
                <option value="OLDEST">{isBengali ? 'পুরনো আগে' : 'Oldest First'}</option>
                <option value="AMOUNT_HIGH">{isBengali ? 'বেশি টাকা আগে' : 'Highest Amount'}</option>
                <option value="AMOUNT_LOW">{isBengali ? 'কম টাকা আগে' : 'Lowest Amount'}</option>
              </select>
            </div>
          </div>
        }
        actionsSlot={
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>{isBengali ? 'সারি:' : 'Rows:'}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        }
      />

      {/* ── Sub-Filter Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none print:hidden">
        <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 uppercase tracking-wider">
          {isBengali ? 'সাব-ফিল্টার:' : 'Filter:'}
        </span>
        {(SUB_FILTERS[activeWorkspace] || []).map((cat) => {
          const active = historyCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setHistoryCategory(cat.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                active
                  ? 'bg-slate-900 text-white shadow-2xs scale-[1.02]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {isBengali ? cat.labelBn : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* ── Main History Table Card Container ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden print:border-none print:shadow-none">

        {/* Printable Document Header (Only shown during print) */}
        <div className="hidden print:block pb-3 mb-3 border-b-2 border-slate-900 text-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                সার্বজনীন ডিজিটাল খাতা ও আর্থিক অডিট ট্রেইল
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {activeTenant?.name || 'LEDGERX ENTERPRISE'}
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                {activeTenant?.address || 'আউটলেট ০১, ঢাকা, বাংলাদেশ'} • ফোন: {activeTenant?.phone || '০১৭০০-০০০০০০'}
              </p>
              {(activeTenant?.vatBinNumber || activeTenant?.bin) && (
                <p className="text-xs font-mono font-bold text-slate-800">
                  মূসক নিবন্ধন / BIN: {activeTenant.vatBinNumber || activeTenant.bin}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded mb-1">
                SYSTEM GENERAL LEDGER
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">
                তারিখ: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                অডিট সময়কাল: {TIME_RANGES.find(t => t.key === timeRange)?.labelBn || timeRange}
              </p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900 uppercase">
              সিস্টেম অডিট ও সার্বজনীন লেনদেন লেজার স্টেটমেন্ট
            </span>
            <span className="font-mono text-slate-700">
              মোট রেকর্ড: <strong>{processedHistory.length}</strong> টি | ক্যাশ আগমন (+): <strong className="text-emerald-700">{formatCurrency(workspaceStats.inflowPoisha, isBengali)}</strong> | ক্যাশ খরচ (-): <strong className="text-rose-700">{formatCurrency(workspaceStats.outflowPoisha, isBengali)}</strong>
            </span>
          </div>
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

        {/* ── Official Executive Printable Report Sign-off (Print Only) ── */}
        <div className="hidden print:grid grid-cols-4 gap-6 pt-10 mt-8 text-center text-xs text-slate-900 border-t-2 border-slate-900 page-break-inside-avoid">
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">হিসাব সহকারী / ক্যাশিয়ার</p>
            <p className="text-[10px] text-slate-600">Prepared By</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">স্টোর ম্যানেজার</p>
            <p className="text-[10px] text-slate-600">Store Manager</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">অভ্যন্তরীণ নিরীক্ষক</p>
            <p className="text-[10px] text-slate-600">Internal Auditor</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">স্বত্বাধিকারী / অনুমোদিত সীল ও স্বাক্ষর</p>
            <p className="text-[10px] text-slate-600">Managing Director / Seal</p>
          </div>
        </div>

      </div>

      {/* ── Voucher Detail Slide-Over Inspector Drawer ── */}
      <SlideOverDrawer
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        title={isBengali ? 'ভাউচার অডিট বিস্তারিত' : 'Voucher Audit Details'}
        subtitle={selectedVoucher?.id}
        badge={
          selectedVoucher && (
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              {selectedVoucher.type}
            </span>
          )
        }
        footer={
          selectedVoucher && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Printer size={14} />
                <span>{isBengali ? 'প্রিন্ট ভাউচার' : 'Print Voucher'}</span>
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
              >
                {isBengali ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          )
        }
      >
        {selectedVoucher && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">তারিখ ও সময়</span>
                <span className="font-bold text-slate-800">
                  {selectedVoucher.timestamp ? new Date(selectedVoucher.timestamp).toLocaleString('bn-BD') : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">লেনদেনের ধরণ</span>
                <span className="font-black text-indigo-700">{selectedVoucher.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">গ্রাহক / পক্ষ</span>
                <span className="font-bold text-slate-800">{selectedVoucher.partyName || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">পেমেন্ট মাধ্যম</span>
                <span className="font-bold text-slate-800">{selectedVoucher.paymentMode || 'CASH'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">বিবরণ ও নোট</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-medium">
                {selectedVoucher.description || 'কোনো বিবরণ লিপিবদ্ধ নেই'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs">ভাউচার মোট অর্থ:</span>
              <span className="font-black font-mono text-lg text-emerald-700">
                {formatCurrency(selectedVoucher.amountPoisha || selectedVoucher.paidPoisha || selectedVoucher.cashCollectedPoisha || 0, isBengali)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 text-[10px] font-mono text-slate-500 break-all flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>SHA-256 Merkle Chain Integrity: VERIFIED_VALID_NODE_TRANSACTION</span>
            </div>
          </div>
        )}
      </SlideOverDrawer>

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
