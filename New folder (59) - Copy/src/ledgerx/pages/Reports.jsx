import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { useTenant } from '../context/TenantContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { formatCurrency, poishaToTaka } from '../utils/currency';
import {
  BarChart3, ArrowLeft, Calendar, Download, FileSpreadsheet,
  TrendingUp, TrendingDown, Printer, Activity, DollarSign,
  ArrowUpRight, ArrowDownLeft, Target, Layers, PieChart,
  RefreshCw, Filter, ChevronRight, ChevronLeft, Wallet, AlertCircle,
  CheckCircle2, Clock, Eye, Sparkles, Receipt, Lock, Search,
  X, Database, HardDrive, ShieldCheck, ArrowUpDown, ChevronDown,
  Info, Cpu, FileText, Gift, Flame, ShoppingBag, ShoppingCart, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TrueProfitCard from '../components/reports/TrueProfitCard';
import DueAgeingTable from '../components/reports/DueAgeingTable';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import RoleAccessGate from '../components/common/RoleAccessGate';
import POSHistoryModal from '../components/pos/POSHistoryModal';
import ThermalReceiptPreview from '../components/print/ThermalReceiptPreview';
import Mushak63Invoice from '../components/print/Mushak63Invoice';

const TIME_RANGES = [
  { key: 'TODAY', labelBn: 'আজকের দিন', labelEn: 'Today' },
  { key: 'WEEK', labelBn: 'এই সপ্তাহ', labelEn: 'This Week' },
  { key: 'MONTH', labelBn: 'চলতি মাস', labelEn: 'This Month' },
  { key: 'YEAR', labelBn: 'পুরো বছর', labelEn: 'This Year' },
  { key: 'ALL', labelBn: 'সর্বকালীন', labelEn: 'All Time' },
  { key: 'CUSTOM', labelBn: 'নির্দিষ্ট তারিখ', labelEn: 'Custom' },
];

export default function Reports() {
  const { 
    cashboxPoisha = 0, 
    ledgerEntries = [], 
    invoices = [], 
    customers = [], 
    suppliers = [],
    products = [],
  } = useKhata();
  const { isOwner, activeTenant } = useTenant();
  const { isBengali, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  // Time Range & Filter State
  const [timeRange, setTimeRange] = useState('MONTH');
  const [activeReportTab, setActiveReportTab] = useState('FINANCIAL'); // 'FINANCIAL' | 'PRODUCT_SALES' | 'DUE_AGEING'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPOSHistoryOpen, setIsPOSHistoryOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null); // { type: 'THERMAL' | 'MUSHAK', saleData }

  // Product Analytics Filter States
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsCategory, setAnalyticsCategory] = useState('ALL');
  const [analyticsSort, setAnalyticsSort] = useState('UNITS_SOLD'); // 'UNITS_SOLD' | 'REVENUE' | 'PROFIT' | 'NAME'

  // 1. Dynamic Date Range Filtering for Ledger Entries
  const filteredLedgerEntries = useMemo(() => {
    const now = new Date();
    return ledgerEntries.filter((e) => {
      const t = e.timestamp ? new Date(e.timestamp).getTime() : (e.createdAt ? new Date(e.createdAt).getTime() : 0);
      if (!t) return true;

      if (timeRange === 'TODAY') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return t >= startOfToday;
      }
      if (timeRange === 'WEEK') {
        const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        return t >= sevenDaysAgo;
      }
      if (timeRange === 'MONTH') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= startOfMonth;
      }
      if (timeRange === 'YEAR') {
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
        return t >= startOfYear;
      }
      if (timeRange === 'CUSTOM') {
        const start = customStartDate ? new Date(customStartDate).getTime() : 0;
        const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
        return t >= start && t <= end;
      }
      return true;
    });
  }, [ledgerEntries, timeRange, customStartDate, customEndDate]);

  // 2. Real Business Metrics calculated from genuine filtered entries
  const totalInflowPoisha = useMemo(() => {
    return filteredLedgerEntries
      .filter((e) => e.type === 'CASH_IN' || e.type === 'HALKHATA_SETTLEMENT' || (e.type === 'POS_SALE' && ((e.paidPoisha || 0) > 0 || (e.amountPoisha || 0) > 0)) || e.type === 'PABO')
      .reduce((sum, e) => sum + (e.amountPoisha || e.cashCollectedPoisha || e.paidPoisha || 0), 0);
  }, [filteredLedgerEntries]);

  const totalOutflowPoisha = useMemo(() => {
    return filteredLedgerEntries
      .filter((e) => e.type === 'CASH_OUT' || e.type === 'PAYMENT_TO_SUPPLIER' || e.type === 'SUPPLIER_PAYMENT' || e.type === 'EXPENSE')
      .reduce((sum, e) => sum + (e.amountPoisha || 0), 0);
  }, [filteredLedgerEntries]);

  const netCashPoisha = totalInflowPoisha - totalOutflowPoisha;
  const totalCustomerDue = customers.filter((c) => (c.currentDuePoisha || 0) > 0).reduce((s, c) => s + c.currentDuePoisha, 0);
  const totalSupplierDue = (suppliers || []).filter((s) => (s.currentDuePoisha || s.balancePoisha || 0) > 0).reduce((s, c) => s + (c.currentDuePoisha || c.balancePoisha || 0), 0);

  // Dynamic Date Range Filtering for Invoices
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return (invoices || []).filter((inv) => {
      const t = inv.createdAt || inv.timestamp || 0;
      if (!t) return true;
      if (timeRange === 'TODAY') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return t >= startOfToday;
      }
      if (timeRange === 'WEEK') {
        const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        return t >= sevenDaysAgo;
      }
      if (timeRange === 'MONTH') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= startOfMonth;
      }
      if (timeRange === 'YEAR') {
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
        return t >= startOfYear;
      }
      if (timeRange === 'CUSTOM') {
        const start = customStartDate ? new Date(customStartDate).getTime() : 0;
        const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
        return t >= start && t <= end;
      }
      return true;
    });
  }, [invoices, timeRange, customStartDate, customEndDate]);

  // True Profit & Loss Engine aggregates
  const trueProfitMetrics = useMemo(() => {
    let grossSales = filteredInvoices.reduce((s, inv) => s + (inv.grandTotalPoisha || 0), 0);
    if (grossSales === 0) {
      grossSales = filteredLedgerEntries
        .filter((e) => e.type === 'POS_SALE' || e.type === 'SALE')
        .reduce((s, e) => s + (e.grandTotalPoisha || e.amountPoisha || 0), 0);
    }

    let cogs = filteredInvoices.reduce((sum, inv) => {
      const invCogs = (inv.items || []).reduce((itemSum, item) => {
        const cost = item.costPricePoisha || item.costPriceBasePoisha || item.purchasePricePoisha || Math.round((item.unitPricePoisha || 0) * 0.8);
        return itemSum + (cost * (item.quantity || 1));
      }, 0);
      return sum + invCogs;
    }, 0);
    if (cogs === 0 && grossSales > 0) {
      cogs = Math.round(grossSales * 0.8);
    }

    const expenses = filteredLedgerEntries
      .filter((e) => e.type === 'EXPENSE' || e.type === 'SHOP_EXPENSE' || e.type === 'CASH_OUT')
      .reduce((s, e) => s + (e.amountPoisha || 0), 0);

    const spoilage = filteredLedgerEntries
      .filter((e) => e.type === 'SPOILAGE' || e.type === 'DAMAGE' || e.type === 'WASTAGE')
      .reduce((s, e) => s + (e.amountPoisha || 0), 0);

    const badDebtWaivers = filteredLedgerEntries
      .filter((e) => e.type === 'HALKHATA_SETTLEMENT' || e.type === 'WAIVER')
      .reduce((s, e) => s + (e.waiverPoisha || 0), 0);

    return {
      grossSalesPoisha: grossSales,
      cogsPoisha: cogs,
      expensesPoisha: expenses,
      spoilagePoisha: spoilage,
      badDebtWaiverPoisha: badDebtWaivers,
    };
  }, [filteredInvoices, filteredLedgerEntries]);

  // 3. POS Product Sales Analytics Engine (Top-Selling Products, Velocity & Margins)
  const productAnalytics = useMemo(() => {
    const map = new Map();

    // Seed catalog products
    (products || []).forEach((p) => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        sku: p.sku || p.barcode || '—',
        category: p.category || 'সাধারণ পণ্য',
        unit: p.unit || 'টি',
        costPricePoisha: p.costPricePoisha || 0,
        sellingPricePoisha: p.sellingPricePoisha || ((p.price || 0) * 100),
        stock: p.currentStockInBaseUnit ?? p.stock ?? 0,
        unitsSold: 0,
        totalRevenuePoisha: 0,
        totalCostPoisha: 0,
        totalProfitPoisha: 0,
        salesCount: 0,
      });
    });

    // Aggregate all sales invoices
    (invoices || []).forEach((inv) => {
      (inv.items || []).forEach((item) => {
        const pid = item.productId || item.id;
        if (!pid) return;

        if (!map.has(pid)) {
          map.set(pid, {
            id: pid,
            name: item.name || 'অজানা পণ্য',
            sku: item.barcode || item.sku || '—',
            category: item.category || 'অন্যান্য',
            unit: item.unit || 'টি',
            costPricePoisha: item.costPricePoisha || 0,
            sellingPricePoisha: item.unitPricePoisha || ((item.price || 0) * 100),
            stock: 0,
            unitsSold: 0,
            totalRevenuePoisha: 0,
            totalCostPoisha: 0,
            totalProfitPoisha: 0,
            salesCount: 0,
          });
        }

        const rec = map.get(pid);
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPricePoisha || ((item.price || 0) * 100)) || 0;
        const unitCost = Number(item.costPricePoisha || rec.costPricePoisha || Math.round(unitPrice * 0.82)) || 0;
        const lineRevenue = Math.round(unitPrice * qty);
        const lineCost = Math.round(unitCost * qty);

        rec.unitsSold += qty;
        rec.salesCount += 1;
        rec.totalRevenuePoisha += lineRevenue;
        rec.totalCostPoisha += lineCost;
        rec.totalProfitPoisha += (lineRevenue - lineCost);
      });
    });

    const allItems = Array.from(map.values());

    // Filter by category and search
    const filtered = allItems.filter((item) => {
      if (analyticsCategory !== 'ALL' && item.category !== analyticsCategory) {
        return false;
      }
      if (analyticsSearch.trim()) {
        const q = analyticsSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (analyticsSort === 'UNITS_SOLD') return b.unitsSold - a.unitsSold || b.totalRevenuePoisha - a.totalRevenuePoisha;
      if (analyticsSort === 'REVENUE') return b.totalRevenuePoisha - a.totalRevenuePoisha;
      if (analyticsSort === 'PROFIT') return b.totalProfitPoisha - a.totalProfitPoisha;
      if (analyticsSort === 'NAME') return a.name.localeCompare(b.name, 'bn');
      return 0;
    });

    // Top 5 Best-Selling Products Leaderboard
    const topSellers = allItems
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenuePoisha - a.totalRevenuePoisha)
      .slice(0, 5);

    // Category Sales Distribution
    const categoryMap = {};
    allItems.forEach((p) => {
      if (p.unitsSold > 0) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + p.totalRevenuePoisha;
      }
    });

    const categories = Array.from(new Set(allItems.map((p) => p.category).filter(Boolean)));
    const totalSoldUnits = allItems.reduce((s, p) => s + p.unitsSold, 0);
    const totalSoldRevenuePoisha = allItems.reduce((s, p) => s + p.totalRevenuePoisha, 0);
    const totalProfitPoisha = allItems.reduce((s, p) => s + p.totalProfitPoisha, 0);
    const avgTicketPoisha = invoices.length > 0 ? Math.round(totalSoldRevenuePoisha / invoices.length) : 0;

    return {
      filteredItems: filtered,
      topSellers,
      categories,
      categoryShare: Object.entries(categoryMap).map(([name, rev]) => ({
        name,
        revenuePoisha: rev,
        percentage: totalSoldRevenuePoisha > 0 ? Math.round((rev / totalSoldRevenuePoisha) * 100) : 0,
      })),
      totalSoldUnits,
      totalSoldRevenuePoisha,
      totalProfitPoisha,
      avgTicketPoisha,
      invoiceCount: invoices.length,
    };
  }, [products, invoices, analyticsCategory, analyticsSearch, analyticsSort]);

  // Export Analytics to CSV
  const handleExportProductCSV = () => {
    if (productAnalytics.filteredItems.length === 0) {
      toast.error('এক্সপোর্ট করার মত কোনো পণ্য বিক্রয় ডাটা নেই');
      return;
    }

    const headers = ['র‌্যাংক', 'পণ্যের নাম', 'বারকোড/SKU', 'ক্যাটাগরি', 'মোট বিক্রিত একক', 'মোট বিক্রয় মূল্য (টাকা)', 'মোট লাভ (টাকা)', 'বর্তমান স্টক'];
    const rows = productAnalytics.filteredItems.map((p, idx) => [
      idx + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category}"`,
      p.unitsSold,
      poishaToTaka(p.totalRevenuePoisha),
      poishaToTaka(p.totalProfitPoisha),
      p.stock,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerX_Top_Selling_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('পণ্য বিক্রয় অ্যানালিটিক্স CSV ডাউনলোড হয়েছে!', { icon: '📊' });
  };

  const financialMetrics = useMemo(() => [
    {
      id: 'inflow',
      label: isBengali ? 'মোট ক্যাশ আগমন (+)' : 'Cash Inflow (+)',
      value: formatCurrency(totalInflowPoisha, isBengali),
      subtitle: isBengali ? 'পিওএস বিক্রি ও বকেয়া আদায়' : 'Collections',
      icon: ArrowDownLeft,
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
    },
    {
      id: 'outflow',
      label: isBengali ? 'মোট ক্যাশ খরচ (-)' : 'Cash Outflow (-)',
      value: formatCurrency(totalOutflowPoisha, isBengali),
      subtitle: isBengali ? 'মহাজন পরিশোধ ও নিয়মিত ব্যয়' : 'Expenses',
      icon: ArrowUpRight,
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-600',
    },
    {
      id: 'cust-due',
      label: isBengali ? 'গ্রাহকদের মোট বাকি' : 'Total Customer Due',
      value: formatCurrency(totalCustomerDue, isBengali),
      subtitle: `${customers.filter((c) => (c.currentDuePoisha || 0) > 0).length} জন কাস্টমার বাকিদার`,
      icon: Target,
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600',
    },
    {
      id: 'sup-due',
      label: isBengali ? 'মহাজনদের মোট দেনা' : 'Total Supplier Due',
      value: formatCurrency(totalSupplierDue, isBengali),
      subtitle: `${suppliers.filter((s) => (s.currentDuePoisha || s.balancePoisha || 0) > 0).length} জন মহাজন পাওনাদার`,
      icon: Layers,
      iconColor: 'text-slate-500',
      valueColor: 'text-slate-800',
    },
  ], [totalInflowPoisha, totalOutflowPoisha, totalCustomerDue, totalSupplierDue, customers, suppliers, isBengali]);

  const productOverviewMetrics = useMemo(() => [
    {
      id: 'units',
      label: isBengali ? 'মোট একক বিক্রয়' : 'Total Units Sold',
      value: `${productAnalytics.totalSoldUnits} ${isBengali ? 'পিস' : 'pcs'}`,
      subtitle: isBengali ? 'নির্বাচিত সময়সীমায় বিক্রিত' : 'Sold in period',
      icon: ShoppingBag,
      valueColor: 'text-slate-900',
    },
    {
      id: 'revenue',
      label: isBengali ? 'মোট পণ্য রাজস্ব' : 'Total Revenue',
      value: formatCurrency(productAnalytics.totalSoldRevenuePoisha, isBengali),
      subtitle: isBengali ? 'মোট অর্জিত বিক্রয় মূল্য' : 'Gross revenue',
      icon: ArrowDownLeft,
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
    },
    {
      id: 'avg-ticket',
      label: isBengali ? 'গড় বাস্কেট সাইজ' : 'Avg Basket Size',
      value: formatCurrency(productAnalytics.avgTicketPoisha, isBengali),
      subtitle: isBengali ? 'প্রতি চালানে গড় বিক্রয়' : 'Per invoice average',
      icon: Receipt,
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      id: 'invoices',
      label: isBengali ? 'মোট ইনভয়েস বিল' : 'Total Invoices',
      value: `${productAnalytics.invoiceCount} ${isBengali ? 'টি' : ''}`,
      subtitle: isBengali ? 'মেমো ও রসিদ সংখ্যা' : 'Billed memos',
      icon: FileText,
      iconColor: 'text-purple-500',
      valueColor: 'text-slate-800',
    },
  ], [productAnalytics, isBengali]);

  const reportTabs = useMemo(() => [
    {
      id: 'FINANCIAL',
      label: isBengali ? 'আর্থিক হিসাব ও লাভ-ক্ষতি' : 'Financial & True P&L',
      icon: <DollarSign size={14} className="mr-1" />,
    },
    {
      id: 'PRODUCT_SALES',
      label: isBengali ? 'পণ্য বিক্রয় অ্যানালিটিক্স' : 'Product Sales Velocity',
      count: productAnalytics.filteredItems.length,
      icon: <ShoppingBag size={14} className="mr-1" />,
    },
    {
      id: 'DUE_AGEING',
      label: isBengali ? 'বকেয়া বয়স ও ক্রেডিট ঝুঁকি' : 'Due Ageing Radar',
      icon: <Clock size={14} className="mr-1" />,
    },
  ], [isBengali, productAnalytics.filteredItems.length]);

  return (
    <RoleAccessGate titleBn="লাভ-ক্ষতি ও অডিট রিপোর্ট" requiredRole="দোকান মালিক ও ম্যানেজার">
      <div className="w-full pb-12">
        
        {/* ── Official Executive Printable Report Header (Print Only) ── */}
        <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900 text-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                প্রাতিষ্ঠানিক আর্থিক বিবরণী ও নিরীক্ষা প্রতিবেদন
              </span>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {activeTenant?.name || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা'}
              </h1>
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
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded mb-1">
                EXECUTIVE AUDIT REPORT
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">
                তারিখ: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                অডিট সময়কাল: {TIME_RANGES.find(t => t.key === timeRange)?.labelBn || timeRange}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-300 text-center">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              ব্যবসায়িক লাভ-ক্ষতি, পণ্য বিক্রয় ও নগদ প্রবাহ অ্যানালিটিক্স বিবরণী
            </h2>
            <p className="text-[10px] text-slate-600">
              Executive Profit &amp; Loss, Product Sales Velocity, and Cash Flow Statement
            </p>
          </div>
        </div>

        {/* ── Compact Enterprise Page Header ── */}
        <UnifiedPageHeader
          icon={BarChart3}
          title={isBengali ? (isEasyMode ? 'লাভ-ক্ষতি ও দৈনিক হিসাব সারসংক্ষেপ' : 'লাভ-ক্ষতি ও ব্যবসা অ্যানালিটিক্স') : 'Profit & Loss and Sales Analytics'}
          subtitle={
            isBengali
              ? (isEasyMode ? 'দোকানের মোট বিক্রি, খরচ, নগদ আদায় ও আনুমানিক নিট লাভের সহজ চিত্র।' : 'দোকানের প্রকৃত লাভ-ক্ষতি, পণ্যের বিক্রয় অ্যানালিটিক্স ও আর্থিক নিরীক্ষণ।')
              : 'Executive financial summary, sales velocity, and store health.'
          }
          badge={isEasyMode ? 'সহজ মোড' : 'আল্ট্রা ইআরপি'}
          badgeColor={isEasyMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                title="সিস্টেম হিস্ট্রি ও অডিট ট্রেইল পেজে যান"
              >
                <Clock size={14} />
                <span>{isBengali ? 'হিস্ট্রি' : 'History'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPOSHistoryOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="পিওএস ইনভয়েস ও মেমো তালিকা"
              >
                <Receipt size={14} />
                <span>{isBengali ? 'মেমো তালিকা' : 'Invoices'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="রিপোর্ট প্রিন্ট করুন"
              >
                <Printer size={14} />
                <span>{isBengali ? 'প্রিন্ট' : 'Print'}</span>
              </button>
            </div>
          }
        />

        {/* ── Single-Row Unified Toolbar ── */}
        <UnifiedToolbar
          tabs={reportTabs}
          activeTab={activeReportTab}
          onTabChange={setActiveReportTab}
          filterSlot={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar size={13} className="text-slate-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
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
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <span className="text-xs text-slate-400">হতে</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                </div>
              )}
            </div>
          }
        />

        {/* ── TAB 1: FINANCIAL STATEMENT & TRUE PROFIT & LOSS ─────────── */}
        <div className={activeReportTab === 'FINANCIAL' ? 'space-y-4 animate-in fade-in duration-150' : 'hidden print:block space-y-4'}>
          {/* Executive Live KPI Ribbon */}
          <MetricRibbon metrics={financialMetrics} />

        {/* ── 4. True Profit & Loss Statement (Confidential Owner Card) ─ */}
        {isOwner ? (
          <TrueProfitCard
            grossSalesPoisha={trueProfitMetrics.grossSalesPoisha}
            cogsPoisha={trueProfitMetrics.cogsPoisha}
            expensesPoisha={trueProfitMetrics.expensesPoisha}
            spoilagePoisha={trueProfitMetrics.spoilagePoisha}
            badDebtWaiverPoisha={trueProfitMetrics.badDebtWaiverPoisha}
            timeRange={timeRange}
            filteredLedgerEntries={filteredLedgerEntries}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">লাভ-ক্ষতি ও মার্জিন হিসাব লক করা</h3>
                <p className="text-xs text-slate-500 mt-0.5">দোকানের প্রকৃত লাভ-লোকসান শুধুমাত্র দোকান মালিক দেখতে পারবেন।</p>
              </div>
            </div>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              👑 পিন দিয়ে আনলক
            </button>
          </div>
        )}
        </div>

        {/* ── TAB 2: PRODUCT SALES ANALYTICS & FAST-MOVING ITEMS ──────── */}
        <div className={activeReportTab === 'PRODUCT_SALES' ? 'space-y-6 animate-in fade-in duration-150' : 'hidden print:block space-y-6'}>
          {/* ── 5. NEW: POS PRODUCT SALES ANALYTICS & TOP-SELLING PRODUCTS ─ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* Module Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black border border-emerald-100 shadow-2xs">
                <Flame size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base md:text-lg">
                    {isBengali ? 'পণ্য বিক্রয় অ্যানালিটিক্স ও জনপ্রিয় পণ্য' : 'Product Sales Analytics & Top Sellers'}
                  </h3>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Retail Intelligence
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {isBengali
                    ? 'কোন পণ্য সবচেয়ে বেশি বিক্রি হয়েছে, সর্বোচ্চ রাজস্ব প্রদানকারী আইটেম ও ক্যাটাগরি শেয়ার'
                    : 'Identify which products sell the most, highest revenue drivers, and stock turnover'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportProductCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download size={14} />
                <span>{isBengali ? 'অ্যানালিটিক্স CSV' : 'Export CSV'}</span>
              </button>

              <button
                onClick={() => setIsPOSHistoryOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Receipt size={14} />
                <span>{isBengali ? 'বিক্রয় রসিদ দেখুন' : 'View Invoices'}</span>
              </button>
            </div>
          </div>

          {/* Product Sales Analytics Metric Ribbon */}
          <MetricRibbon metrics={productOverviewMetrics} className="mb-0 rounded-none border-x-0 border-t-0" />

          {/* Top 5 Best-Selling Products Leaderboard Podium */}
          {productAnalytics.topSellers.length > 0 && (
            <div className="p-5 border-b border-slate-100 space-y-3 bg-white">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <Award size={15} className="text-amber-500" />
                <span>{isBengali ? 'শীর্ষ ৫টি সর্বাধিক বিক্রিত পণ্য (Top Best-Sellers)' : 'Top 5 Best-Selling Products'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {productAnalytics.topSellers.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          idx === 0 ? 'bg-amber-400 text-amber-950 font-black' :
                          idx === 1 ? 'bg-slate-300 text-slate-800' :
                          idx === 2 ? 'bg-amber-700/20 text-amber-900' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{prod.category}</span>
                      </div>
                      <p className="font-extrabold text-xs text-slate-900 line-clamp-1" title={prod.name}>
                        {prod.name}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2 flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">বিক্রয় একক</span>
                        <span className="font-black text-emerald-600">{prod.unitsSold} {prod.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">রাজস্ব</span>
                        <span className="font-black text-slate-900 font-mono text-[11px]">{formatCurrency(prod.totalRevenuePoisha, isBengali)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search, Filter & Sort Controls for Product Table */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                placeholder={isBengali ? 'পণ্যের নাম, বারকোড বা ক্যাটাগরি লিখে খুঁজুন...' : 'Search by product name, barcode or category...'}
                className="w-full text-xs font-semibold pl-9.5 pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-800 transition"
              />
              {analyticsSearch && (
                <button
                  onClick={() => setAnalyticsSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-bold">ক্যাটাগরি:</span>
                <select
                  value={analyticsCategory}
                  onChange={(e) => setAnalyticsCategory(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-white py-2 px-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">সকল ক্যাটাগরি</option>
                  {productAnalytics.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-bold">সাজান:</span>
                <select
                  value={analyticsSort}
                  onChange={(e) => setAnalyticsSort(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-white py-2 px-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="UNITS_SOLD">সর্বোচ্চ বিক্রিত একক</option>
                  <option value="REVENUE">সর্বোচ্চ রাজস্ব</option>
                  <option value="PROFIT">সর্বোচ্চ লাভ</option>
                  <option value="NAME">নামের ক্রমানুসারে</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Sales Analytics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">পণ্যের নাম ও বারকোড</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4 text-right">বিক্রিত একক</th>
                  <th className="py-3 px-4 text-right">মোট রাজস্ব</th>
                  <th className="py-3 px-4 text-right">লাভ / মার্জিন</th>
                  <th className="py-3 px-4 text-center">বর্তমান স্টক</th>
                  <th className="py-3 px-4 text-center">গতিশীলতা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productAnalytics.filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-bold">
                      কোনো পণ্য পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  productAnalytics.filteredItems.map((prod, idx) => {
                    const isFastMoving = prod.unitsSold >= 10;
                    const isLowStock = prod.stock <= 5;
                    const marginPct = prod.totalRevenuePoisha > 0 ? Math.round((prod.totalProfitPoisha / prod.totalRevenuePoisha) * 100) : 0;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{prod.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {prod.category}
                        </td>
                        <td className="py-3 px-4 text-right font-black font-mono text-slate-900 text-sm">
                          {prod.unitsSold} <span className="text-[10px] text-slate-500 font-normal">{prod.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                          {formatCurrency(prod.totalRevenuePoisha, isBengali)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className="font-black text-slate-900 block">{formatCurrency(prod.totalProfitPoisha, isBengali)}</span>
                          <span className="text-[10px] text-slate-400">{marginPct}% মার্জিন</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLowStock ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {prod.stock} {prod.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isFastMoving ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                              🔥 জনপ্রিয়
                            </span>
                          ) : prod.unitsSold > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                              চলমান
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              বিক্রয় নেই
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* ── TAB 3: DUE AGEING RADAR & CREDIT RISK INSIGHTS ──────────── */}
        <div className={activeReportTab === 'DUE_AGEING' ? 'space-y-6 animate-in fade-in duration-150' : 'hidden print:block space-y-6'}>
          {/* ── 6. Due Ageing Radar ─────────────────────────────────────── */}
          <DueAgeingTable />

          {/* ── 7. SEPARATE SYSTEM HISTORY PROMINENT NAVIGATION BANNER ───── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-black text-base md:text-lg">
                  {isBengali ? 'সিস্টেম হিস্ট্রি ও অডিট ট্রেইল আলাদা পাতায় স্থানান্তরিত হয়েছে' : 'System History Now on Dedicated Standalone Page'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                  {isBengali
                    ? 'প্রতিটি কেনাবেচা, ভাউচার অডিট, মেমরি অপটিমাইজেশন ও ফিল্টারিং দেখতে ডেডিকেটেড হিস্ট্রি পেজ ব্যবহার করুন।'
                    : 'Access comprehensive multi-index transaction logs, voucher inspection, and memory optimization.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/history')}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs md:text-sm transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <span>{isBengali ? 'সিস্টেম হিস্ট্রি খুলুন' : 'Open System History'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Role Switcher Modal */}
        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
        />

        {/* POS Sales History Modal */}
        <POSHistoryModal
          isOpen={isPOSHistoryOpen}
          onClose={() => setIsPOSHistoryOpen(false)}
          onReprintThermal={(sale) => setReceiptModal({ type: 'THERMAL', saleData: sale })}
          onReprintMushak={(sale) => setReceiptModal({ type: 'MUSHAK', saleData: sale })}
        />

        {/* ── Official Executive Printable Report Sign-off (Print Only) ── */}
        <div className="hidden print:grid grid-cols-4 gap-6 pt-12 mt-8 text-center text-xs text-slate-900 border-t-2 border-slate-900">
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

        {/* Thermal Receipt Preview Modal */}
        {receiptModal && receiptModal.type === 'THERMAL' && (
          <ThermalReceiptPreview
            sale={receiptModal.saleData}
            isOpen={true}
            onClose={() => setReceiptModal(null)}
            onSwitchToMushak={() => setReceiptModal({ type: 'MUSHAK', saleData: receiptModal.saleData })}
          />
        )}

        {/* NBR Mushak 6.3 Tax Invoice Modal */}
        {receiptModal && receiptModal.type === 'MUSHAK' && (
          <Mushak63Invoice
            sale={receiptModal.saleData}
            isOpen={true}
            onClose={() => setReceiptModal(null)}
            onSwitchToThermal={() => setReceiptModal({ type: 'THERMAL', saleData: receiptModal.saleData })}
          />
        )}

      </div>
    </RoleAccessGate>
  );
}

// Icon wrapper helpers
function UsersIconWrapper() {
  return (
    <span className="text-amber-500">
      <Target size={16} />
    </span>
  );
}

function BuildingIconWrapper() {
  return (
    <span className="text-slate-400">
      <Layers size={16} />
    </span>
  );
}
