import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { getBusinessProfile } from '../core/BusinessProfiles';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../utils/currency';
import { mobilePOSBridge } from '../utils/MobilePOSBridge';
import MorningRepricerModal from '../components/inventory/MorningRepricerModal';
import BatchExpiryModal from '../components/inventory/BatchExpiryModal';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import AddProductModal from '../components/inventory/AddProductModal';
import MobilePOSConnectModal from '../components/pos/MobilePOSConnectModal';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
import SlideOverDrawer from '../components/common/SlideOverDrawer';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  QrCode, 
  Edit3,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  Building2,
  Shield,
  Smartphone,
  Pill,
  Hammer,
  Shirt,
  Utensils,
  Trash2,
  History,
  Lock,
  KeyRound,
  Printer,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Store,
  Scale,
  ShoppingCart,
  Table as TableIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Inventory() {
  const { 
    products, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    addProductBatch, 
    invoices, 
    chalans, 
    godownTransfers 
  } = useKhata();
  const { activeTenant, isOwner, verifyOwnerPin } = useTenant();
  const { isBengali, formatNumber, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  const businessType = activeTenant?.businessType || 'GENERAL_RETAIL';
  const profile = getBusinessProfile(businessType);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'BATCHES' | 'CATEGORIES'
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'TABLE'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [groupingMode, setGroupingMode] = useState('NONE');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isRepricerOpen, setIsRepricerOpen] = useState(false);
  const [selectedBatchProduct, setSelectedBatchProduct] = useState(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [initialBarcodeForNewProduct, setInitialBarcodeForNewProduct] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobileConnected, setIsMobileConnected] = useState(mobilePOSBridge.connectionStatus === 'CONNECTED');

  useEffect(() => {
    const unsub = mobilePOSBridge.on('status_change', (data) => {
      setIsMobileConnected(data.status === 'CONNECTED');
    });
    return unsub;
  }, []);

  // Mobile POS Bridge: Instant Phone Barcode Scanner for Inventory Lookup or Adding Product
  useEffect(() => {
    const unsub = mobilePOSBridge.on('barcode_scanned', (scanData) => {
      const code = scanData?.barcode;
      if (!code) return;

      const existing = (products || []).find((p) => p.sku === code || p.barcode === code || p.id === code);
      if (existing) {
        setSearch(code);
        toast.success(
          isBengali
            ? `📱 মোবাইল স্ক্যান: ${existing.name} খুঁজে পাওয়া গেছে`
            : `📱 Mobile Scan: Found ${existing.name}`,
          { icon: '🔍' }
        );
      } else {
        setInitialBarcodeForNewProduct(code);
        setIsAddProductOpen(true);
        toast(
          isBengali
            ? `📱 নতুন বারকোড স্ক্যান (${code}) — পণ্যের তথ্য পূরণ করুন`
            : `📱 New Barcode (${code}) — Add Product Details`,
          { icon: '📦' }
        );
      }
    });

    return unsub;
  }, [products, isBengali]);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Slide-over Product Inspector State
  const [inspectingProduct, setInspectingProduct] = useState(null);

  // Delete Product Modal State & PIN
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Stock Movement History Modal State
  const [historyProduct, setHistoryProduct] = useState(null);

  // Category Modal & Rail State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalSearch, setCategoryModalSearch] = useState('');
  const categoryRailRef = useRef(null);

  // Dynamic categories based on active products and business profile
  const uniqueCategories = Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)));

  const categoryCounts = useMemo(() => {
    const counts = { ALL: (products || []).length };
    (products || []).forEach((p) => {
      const cat = p.category || (isBengali ? 'সাধারণ পণ্য' : 'General');
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products, isBengali]);

  const categories = useMemo(() => [
    { key: 'ALL', label: isBengali ? 'সকল পণ্য' : 'All Items', count: categoryCounts['ALL'] || 0 },
    ...uniqueCategories.map((c) => ({ key: c, label: c, count: categoryCounts[c] || 0 })),
  ], [uniqueCategories, categoryCounts, isBengali]);

  const scrollCategoryRail = (direction) => {
    if (categoryRailRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      categoryRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (catKey) => {
    if (catKey === 'ALL') return '📦';
    const lower = (catKey || '').toLowerCase();
    if (lower.includes('ওষুধ') || lower.includes('পেইন') || lower.includes('গ্যাস') || lower.includes('অ্যান্টি') || lower.includes('ঔষধ') || lower.includes('ড্রাগ') || lower.includes('ট্যাবলেট') || lower.includes('ক্যাপসুল')) return '💊';
    if (lower.includes('চাল') || lower.includes('চাউল') || lower.includes('ডাল') || lower.includes('শস্য') || lower.includes('খাদ্য') || lower.includes('আটা') || lower.includes('ময়দা')) return '🌾';
    if (lower.includes('তেল') || lower.includes('ঘি')) return '🛢️';
    if (lower.includes('বেকারি') || lower.includes('বিস্কুট') || lower.includes('স্ন্যাকস') || lower.includes('চিপস') || lower.includes('কেক')) return '🍪';
    if (lower.includes('পানীয়') || lower.includes('জুস') || lower.includes('পানি') || lower.includes('কোমল')) return '🥤';
    if (lower.includes('মোবাইল') || lower.includes('ফোন') || lower.includes('ইলেকট্রনিক্স') || lower.includes('চার্জার')) return '📱';
    if (lower.includes('কাপড়') || lower.includes('পোশাক') || lower.includes('গার্মেন্টস') || lower.includes('শার্ট')) return '👕';
    if (lower.includes('হার্ডওয়্যার') || lower.includes('রড') || lower.includes('সিমেন্ট') || lower.includes('টিন')) return '🔨';
    if (lower.includes('সাবান') || lower.includes('শ্যাম্পু') || lower.includes('প্রসাধন') || lower.includes('কসমেটিকস')) return '🧴';
    return '🏷️';
  };

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
        (p.genericName && p.genericName.toLowerCase().includes(search.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
      
      if (selectedCategory === 'ALL') return matchesSearch;
      return matchesSearch && p.category === selectedCategory;
    });
  }, [products, search, selectedCategory]);

  const sortedFilteredProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '', 'bn');
      if (sortBy === 'NAME_DESC') return (b.name || '').localeCompare(a.name || '', 'bn');
      if (sortBy === 'STOCK_LOW') return (Number(a.stock ?? a.currentStockInBaseUnit) || 0) - (Number(b.stock ?? b.currentStockInBaseUnit) || 0);
      if (sortBy === 'STOCK_HIGH') return (Number(b.stock ?? b.currentStockInBaseUnit) || 0) - (Number(a.stock ?? a.currentStockInBaseUnit) || 0);
      if (sortBy === 'PRICE_LOW') return (Number(a.salePricePoisha ?? a.sellingPriceBasePoisha) || 0) - (Number(b.salePricePoisha ?? b.sellingPriceBasePoisha) || 0);
      if (sortBy === 'PRICE_HIGH') return (Number(b.salePricePoisha ?? b.sellingPriceBasePoisha) || 0) - (Number(a.salePricePoisha ?? a.sellingPriceBasePoisha) || 0);
      return 0;
    });
    return list;
  }, [filteredProducts, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedFilteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFilteredProducts.slice(start, start + pageSize);
  }, [sortedFilteredProducts, currentPage, pageSize]);

  const groupedProducts = useMemo(() => {
    if (groupingMode === 'NONE' || selectedCategory !== 'ALL') {
      return [{ groupKey: 'ALL', groupName: isBengali ? 'পণ্য তালিকা' : 'Product List', items: paginatedProducts }];
    }
    const map = {};
    sortedFilteredProducts.forEach((p) => {
      const cat = p.category || (isBengali ? 'সাধারণ পণ্য' : 'General');
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return Object.entries(map).map(([cat, items]) => ({
      groupKey: cat,
      groupName: cat,
      items,
    }));
  }, [sortedFilteredProducts, paginatedProducts, groupingMode, selectedCategory, isBengali]);

  const lowStockItems = useMemo(() => {
    return (products || []).filter((p) => (Number(p.currentStockInBaseUnit ?? p.stock) || 0) <= (Number(p.minStock) || 5));
  }, [products]);

  const batchProducts = useMemo(() => {
    return (products || []).filter((p) => p.batchNumber || p.expiryDate || (p.batches && p.batches.length > 0));
  }, [products]);

  const totalStockValuePoisha = useMemo(() => {
    return (products || []).reduce((sum, p) => {
      const stock = Math.max(0, Number(p.currentStockInBaseUnit ?? p.stock ?? 0));
      const cost = Number(
        p.costPricePoisha || 
        p.costPriceBasePoisha || 
        p.purchasePricePoisha || 
        Math.round((p.salePricePoisha || p.sellingPriceBasePoisha || ((p.price || 0) * 100)) * 0.8) || 
        0
      );
      return sum + Math.round(stock * cost);
    }, 0);
  }, [products]);

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = (updatedProduct) => {
    editProduct(updatedProduct.id, updatedProduct);
    setEditingProduct(null);
    toast.success(isBengali ? 'পণ্যের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Product updated successfully!');
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    if (!deletingProduct) return;

    if (!isOwner) {
      if (!verifyOwnerPin(deletePin)) {
        setDeleteError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
    setDeletePin('');
    setDeleteError('');
    toast.success(isBengali ? 'পণ্য ক্যাটালগ থেকে মুছে ফেলা হয়েছে!' : 'Product deleted successfully!');
  };

  const inventoryMetrics = [
    {
      id: 'totalProducts',
      label: isBengali ? 'মোট পণ্য সংখ্যা' : 'Total Items',
      value: `${formatNumber(products.length)} ${isBengali ? 'টি' : ''}`,
      valueColor: 'text-blue-700',
      subtitle: isBengali ? 'নিবন্ধিত ক্যাটালগ' : 'catalog items',
      icon: Boxes,
      iconColor: 'text-blue-600',
      onClick: () => setActiveTab('ALL'),
    },
    {
      id: 'stockValuation',
      label: isBengali ? 'মজুদ মূল্য (ক্রয়মূল্যে)' : 'Stock Value (Cost)',
      value: isOwner ? formatCurrency(totalStockValuePoisha, { locale }) : '৳ ••••••',
      valueColor: 'text-emerald-700',
      subtitle: isOwner ? (isBengali ? 'মোট ক্রয়মূল্য হিসাব' : 'at purchase cost') : (isBengali ? 'মালিক পিন প্রয়োজন' : 'PIN required'),
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      onClick: !isOwner ? () => setIsRoleModalOpen(true) : null,
    },
    {
      id: 'lowStockAlert',
      label: isBengali ? 'কম স্টক রাডার' : 'Low Stock Alert',
      value: `${formatNumber(lowStockItems.length)} ${isBengali ? 'টি' : ''}`,
      valueColor: lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-700',
      subtitle: lowStockItems.length > 0 ? (isBengali ? 'জরুরি অর্ডার প্রয়োজন' : 'reorder needed') : (isBengali ? 'সব মজুত নিরাপদ' : 'healthy stock'),
      icon: AlertTriangle,
      iconColor: lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-400',
      onClick: () => setActiveTab('LOW_STOCK'),
    },
    {
      id: 'batchesExpiry',
      label: isBengali ? 'ব্যাচ ও মেয়াদ' : 'Batches & Expiry',
      value: `${formatNumber(batchProducts.length)} ${isBengali ? 'টি' : ''}`,
      valueColor: 'text-purple-700',
      subtitle: isBengali ? 'FEFO ট্র্যাকিং' : 'FEFO tracked items',
      icon: Calendar,
      iconColor: 'text-purple-600',
      onClick: () => setActiveTab('BATCHES'),
    },
  ];

  const toolbarTabs = [
    { id: 'ALL', label: isBengali ? 'সকল পণ্য' : 'All Items', count: products.length, icon: <Package size={14} /> },
    { id: 'LOW_STOCK', label: isBengali ? 'কম স্টক' : 'Low Stock', count: lowStockItems.length, icon: <AlertTriangle size={14} /> },
    { id: 'BATCHES', label: isBengali ? 'ব্যাচ ও মেয়াদ' : 'Batches', count: batchProducts.length, icon: <Calendar size={14} /> },
    { id: 'CATEGORIES', label: isBengali ? 'ক্যাটাগরি' : 'Categories', count: uniqueCategories.length, icon: <LayoutGrid size={14} /> },
  ];

  return (
    <div className="w-full space-y-3 pb-12 overflow-x-hidden">
      {/* ── 1. Compact Unified Page Header ── */}
      <UnifiedPageHeader
        icon={Package}
        title={isBengali ? (isEasyMode ? 'পণ্য ও স্টক খাতা' : 'পণ্য ও স্টক ইনভেন্টরি') : (isEasyMode ? 'Products & Stock' : 'Inventory & Products')}
        subtitle={isBengali ? 'দোকানের সকল মালের মজুত হিসাব, বিক্রয়মূল্য ও সহজ পণ্য ব্যবস্থাপনা' : 'Manage store product stock, prices and categories'}
        badge={isEasyMode ? (isBengali ? 'সহজ খাতা' : 'Simple') : (isBengali ? profile.nameBn : profile.nameEn)}
        badgeColor={isEasyMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
        showBack={true}
        backTo="/"
        actions={
          <div className="flex items-center gap-2">
            {/* Connect Mobile Scanner Button */}
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isMobileConnected
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
              title={isBengali ? 'মোবাইল স্ক্যানার সংযুক্ত করুন' : 'Connect Mobile Scanner'}
            >
              <Smartphone size={13} className={isMobileConnected ? 'text-emerald-600 animate-pulse' : 'text-white'} />
              <span>
                {isBengali
                  ? isMobileConnected
                    ? 'ফোন সংযুক্ত'
                    : 'ফোন স্ক্যানার'
                  : isMobileConnected
                  ? 'Phone Connected'
                  : 'Phone Scanner'}
              </span>
            </button>

            {!isEasyMode && (
              <button
                onClick={() => setIsRepricerOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Clock size={14} className="text-amber-800" />
                <span className="hidden sm:inline">{isBengali ? 'দ্রুত দর' : 'Reprice'}</span>
              </button>
            )}
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} />
              <span>{isBengali ? '+ নতুন পণ্য' : '+ Add Product'}</span>
            </button>
          </div>
        }
      />

      {/* ── 2. Slim Executive Metric Ribbon ── */}
      <MetricRibbon metrics={inventoryMetrics} />

      {/* ── 3. Single-Row Unified Filter & Search Toolbar ── */}
      <UnifiedToolbar
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
        searchPlaceholder={isBengali ? 'পণ্যের নাম, বারকোড, SKU বা ব্র্যান্ড...' : 'Search by product name, barcode, brand...'}
        tabs={toolbarTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterSlot={
          activeTab === 'ALL' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key === 'ALL' ? (isBengali ? 'সকল ক্যাটাগরি' : 'All Categories') : `${c.label} (${c.count})`}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 cursor-pointer hidden sm:block"
              >
                <option value="NAME_ASC">{isBengali ? '🔤 নাম (ক-হ)' : 'Name (A-Z)'}</option>
                <option value="NAME_DESC">{isBengali ? '🔤 নাম (হ-ক)' : 'Name (Z-A)'}</option>
                <option value="STOCK_LOW">{isBengali ? '⚠️ কম স্টক আগে' : 'Low Stock'}</option>
                <option value="STOCK_HIGH">{isBengali ? '📦 বেশি স্টক আগে' : 'High Stock'}</option>
                <option value="PRICE_LOW">{isBengali ? '📉 দাম (কম-বেশি)' : 'Price: Low'}</option>
                <option value="PRICE_HIGH">{isBengali ? '📈 দাম (বেশি-কম)' : 'Price: High'}</option>
              </select>
            </div>
          )
        }
        actionsSlot={
          activeTab === 'ALL' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('CARDS')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="কার্ড ভিউ"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden md:inline">{isBengali ? 'কার্ড' : 'Grid'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('TABLE')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="টেবিল ভিউ"
                >
                  <TableIcon size={13} />
                  <span className="hidden md:inline">{isBengali ? 'টেবিল' : 'Table'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                title={isBengali ? 'সকল ক্যাটাগরি বোর্ড' : 'All Categories Board'}
              >
                <Tag size={14} />
              </button>
            </div>
          )
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: ALL PRODUCTS CATALOG ──────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ALL' && (
        <div className="space-y-3">

          {/* Products Output: Empty or List (Table vs Cards) */}
          {sortedFilteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                <Package size={32} />
              </div>
              <p className="font-bold text-slate-800 text-base">
                {isBengali ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isBengali ? 'নতুন মাল যোগ করতে উপরের বোতাম ব্যবহার করুন।' : 'Add a new product using the button above.'}
              </p>
            </div>
          ) : viewMode === 'TABLE' ? (
            /* ── High-Density Responsive Table View ── */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">{isBengali ? 'পণ্য ও বিবরণ' : 'Product & Info'}</th>
                      <th className="py-3.5 px-4">{isBengali ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-3.5 px-4 text-right">{isBengali ? 'মজুদ স্টক' : 'Stock'}</th>
                      <th className="py-3.5 px-4 text-right">{isBengali ? 'বিক্রয়মূল্য' : 'Sale Price'}</th>
                      <th className="py-3.5 px-4 text-right">{isBengali ? 'ক্রয় ও লাভ' : 'Cost & Margin'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'অ্যাকশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedProducts.map((p) => {
                      const costTaka = poishaToTaka(p.costPricePoisha || p.costPriceBasePoisha || 0);
                      const saleTaka = poishaToTaka(p.salePricePoisha || p.sellingPriceBasePoisha || 0);
                      const marginTaka = saleTaka - costTaka;
                      const marginPercent = costTaka > 0 ? ((marginTaka / costTaka) * 100).toFixed(1) : 0;
                      const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;
                      const isLow = currentStock <= (p.minStock || 5);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                              {p.sku && <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-bold">{p.sku}</span>}
                              {p.hotkey && <span className="bg-slate-900 text-white font-bold px-1.5 rounded text-[10px]">#{p.hotkey}</span>}
                              {p.genericName && <span className="text-emerald-700 bg-emerald-50 px-1.5 rounded font-medium">🔬 {p.genericName}</span>}
                              {p.brand && <span>• {p.brand}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                              <span>{getCategoryIcon(p.category)}</span>
                              <span>{p.category || (isBengali ? 'সাধারণ' : 'General')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={`font-black text-sm tabular-nums ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                              {formatNumber(currentStock)} {p.unit || p.baseUnit || 'পিস'}
                            </div>
                            {isLow && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                                {isBengali ? 'কম স্টক!' : 'Low!'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-black text-sm text-slate-900 tabular-nums">
                              ৳{saleTaka.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-400">/{p.unit || p.baseUnit || 'পিস'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isOwner ? (
                              <div>
                                <div className="font-bold text-slate-600 tabular-nums">৳{costTaka.toFixed(2)}</div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                  +{marginPercent}%
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setIsRoleModalOpen(true)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                                title="মালিক পিন প্রয়োজন"
                              >
                                <Lock size={11} />
                                <span>লক</span>
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setInspectingProduct(p)}
                                className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                                title={isBengali ? 'বিস্তারিত পরিদর্শন' : 'Inspect'}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                                title={isBengali ? 'এডিট' : 'Edit'}
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── Cards View ── */
            groupedProducts.map((group) => (
              <div key={group.groupKey} className="space-y-2.5">
                {groupingMode !== 'NONE' && (
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>🏷️</span>
                      <span>{group.groupName}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {group.items.length} {isBengali ? 'টি পণ্য' : 'items'}
                    </span>
                  </div>
                )}
                {group.items.map((p) => {
                  const costTaka = poishaToTaka(p.costPricePoisha || p.costPriceBasePoisha || 0);
                  const saleTaka = poishaToTaka(p.salePricePoisha || p.sellingPriceBasePoisha || 0);
                  const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;
                  const isLow = currentStock <= (p.minStock || 5);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setInspectingProduct(p)}
                      className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group"
                    >
                      {/* Left: Product Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <Package size={18} />
                          {p.hotkey && (
                            <span className="text-[9px] font-black leading-none mt-0.5">
                              #{p.hotkey}
                            </span>
                          )}
                        </div>

                        <div className="truncate flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition truncate">
                              {p.name}
                            </h3>
                            {p.genericName && (
                              <span className="hidden md:inline-block px-2 py-0.2 rounded-md text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold truncate">
                                🔬 {p.genericName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[11px] font-bold">
                              {p.sku || 'N/A'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-medium">
                              {p.category || (isBengali ? 'সাধারণ' : 'General')}
                            </span>
                            {p.brand && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500">{p.brand}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price, Stock & Quick Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        {/* Selling Price */}
                        <div className="text-left sm:text-right min-w-[75px]">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none mb-0.5">
                            {isBengali ? 'বিক্রয়মূল্য' : 'Price'}
                          </span>
                          <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                            ৳{saleTaka.toFixed(2)}
                          </span>
                        </div>

                        {/* Stock Level */}
                        <div className="text-left sm:text-right min-w-[85px]">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none mb-0.5">
                            {isBengali ? 'মজুদ' : 'Stock'}
                          </span>
                          <span className={`text-base sm:text-lg font-black tabular-nums ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {formatNumber(currentStock)} <span className="text-xs font-normal text-slate-500">{p.unit || p.baseUnit || 'পিস'}</span>
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setInspectingProduct(p)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title={isBengali ? 'বিস্তারিত দেখুন' : 'Inspect'}
                          >
                            <Eye size={13} />
                            <span className="hidden md:inline">{isBengali ? 'বিস্তারিত' : 'View'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title={isBengali ? 'এডিট' : 'Edit'}
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* ── Bottom Pagination Toolbar ── */}
          {sortedFilteredProducts.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold mt-4">
              <div className="flex items-center gap-2">
                <span>{isBengali ? 'পৃষ্ঠা আকার:' : 'Show:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={100}>100</option>
                </select>
                <span>
                  | {isBengali ? 'প্রদর্শন:' : 'Showing'} <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * pageSize, sortedFilteredProducts.length)}</strong> ({sortedFilteredProducts.length} {isBengali ? 'টি পণ্য' : 'products'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed font-bold"
                >
                  {isBengali ? 'পূর্ববর্তী' : 'Prev'}
                </button>
                <span className="font-bold text-slate-800 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed font-bold"
                >
                  {isBengali ? 'পরবর্তী' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: LOW STOCK RADAR ───────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'LOW_STOCK' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                  ⚠️ {isBengali ? 'স্টক সংকট রাডার' : 'Critical Stock Radar'}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {formatNumber(lowStockItems.length)} {isBengali ? 'টি পণ্যে জরুরি অর্ডার প্রয়োজন' : 'Items require immediate reorder'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                {isBengali ? 'ঘাটতি মালের তালিকা ও মহাজন অর্ডার' : 'Shortage Items & Reorder Console'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                {isBengali ? 'যেসব পণ্য ন্যূনতম সীমার নিচে নেমে গেছে তা সরাসরি মহাজনের নিকট অর্ডার করুন' : 'Items at or below safe stock threshold'}
              </p>
            </div>
            <button
              onClick={() => navigate('/suppliers')}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black shadow-md transition cursor-pointer shrink-0 active:scale-95"
            >
              {isBengali ? 'মহাজন খাতা খুলুন →' : 'Open Supplier Khata →'}
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <p className="font-black text-slate-900 text-lg">
                {isBengali ? 'সব পণ্যের স্টক পর্যাপ্ত আছে!' : 'All Products Stock Level Healthy!'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {isBengali ? 'দোকানের কোনো পণ্যে বর্তমানে জরুরি ঘাটতি নেই। সব পণ্যের মজুত নিরাপদ মাত্রায় রয়েছে।' : 'No products are currently under minimum stock threshold.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-rose-50/60 border-b border-rose-100 text-[11px] font-black text-rose-950 uppercase tracking-wider">
                      <th className="py-3.5 px-4">{isBengali ? 'পণ্য' : 'Product'}</th>
                      <th className="py-3.5 px-4">{isBengali ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'বর্তমান মজুত' : 'Current'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'নিরাপদ সীমা' : 'Min Safe'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'ঘাটতি সংখ্যা' : 'Deficit'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {lowStockItems.map((p) => {
                      const currentStock = Number(p.currentStockInBaseUnit ?? p.stock ?? 0);
                      const minStock = Number(p.minStock || 5);
                      const deficit = Math.max(1, minStock - currentStock);

                      return (
                        <tr key={p.id} className="hover:bg-rose-50/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{p.sku || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {p.category || (isBengali ? 'সাধারণ' : 'General')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-sm text-rose-600 tabular-nums">
                            {formatNumber(currentStock)} {p.unit || p.baseUnit || 'পিস'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500 tabular-nums">
                            {formatNumber(minStock)} {p.unit || p.baseUnit || 'পিস'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-rose-700 tabular-nums">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100 border border-rose-200">
                              -{formatNumber(deficit)} {p.unit || p.baseUnit || 'পিস'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                              >
                                {isBengali ? 'স্টক আপডেট' : 'Update Stock'}
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate('/suppliers')}
                                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition cursor-pointer"
                              >
                                {isBengali ? 'অর্ডার দিন' : 'Reorder'}
                              </button>
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
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: BATCHES & FEFO EXPIRY TRACKING ────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'BATCHES' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black">
                  📅 {isBengali ? 'FEFO ব্যাচ ও মেয়াদ প্রোটোকল' : 'FEFO Batch & Expiry Matrix'}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {formatNumber(batchProducts.length)} {isBengali ? 'টি আইটেম ট্র্যাকিং হচ্ছে' : 'Tracked items'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                {isBengali ? 'ব্যাচভিত্তিক মেয়াদ ও নষ্ট হওয়ার ঝুঁকি নিয়ন্ত্রণ' : 'Batches & First-Expiry-First-Out'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                {isBengali ? 'মেয়াদোত্তীর্ণ হওয়ার আগেই মাল বিক্রি বা মহাজনকে ফেরত পাঠানোর কার্যকর ব্যবস্থা' : 'Track expiries, batches, and shelf life'}
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black shadow-md transition cursor-pointer shrink-0 active:scale-95"
            >
              {isBengali ? '+ নতুন ব্যাচ আইটেম' : '+ Add Batch Product'}
            </button>
          </div>

          {batchProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Calendar size={32} />
              </div>
              <p className="font-black text-slate-900 text-lg">
                {isBengali ? 'কোনো ব্যাচ বা মেয়াদযুক্ত পণ্য নিবন্ধিত নেই' : 'No Batch Tracked Products Found'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {isBengali ? 'ফার্মেসি, খাদ্যপণ্য বা কসমেটিকসের জন্য কোনো পণ্যের তথ্য এডিট করে ব্যাচ নম্বর ও মেয়াদ যুক্ত করুন।' : 'Add batch numbers and expiry dates to track shelf life.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-purple-50/60 border-b border-purple-100 text-[11px] font-black text-purple-950 uppercase tracking-wider">
                      <th className="py-3.5 px-4">{isBengali ? 'পণ্য' : 'Product'}</th>
                      <th className="py-3.5 px-4">{isBengali ? 'ব্যাচ নম্বর' : 'Batch No'}</th>
                      <th className="py-3.5 px-4">{isBengali ? 'মেয়াদ উত্তীর্ণের তারিখ' : 'Expiry Date'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'অবস্থা' : 'Status'}</th>
                      <th className="py-3.5 px-4 text-right">{isBengali ? 'মজুদ' : 'Stock'}</th>
                      <th className="py-3.5 px-4 text-center">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {batchProducts.map((p) => {
                      const hasExpiry = Boolean(p.expiryDate);
                      const isExpired = hasExpiry && new Date(p.expiryDate) < new Date();
                      const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;

                      return (
                        <tr key={p.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.category || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {p.batchNumber || (p.batches?.[0]?.batchNumber) || 'DEFAULT'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {p.expiryDate || (p.batches?.[0]?.expiryDate) || (isBengali ? 'নির্দিষ্ট নয়' : 'Not set')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isExpired ? (
                              <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-[11px] border border-rose-200">
                                ⛔ {isBengali ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
                              </span>
                            ) : hasExpiry ? (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[11px] border border-emerald-200">
                                ✓ {isBengali ? 'সক্রিয়' : 'Active'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold text-[11px]">
                                {isBengali ? 'মেয়াদ ছাড়া' : 'No Expiry'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-sm text-slate-900 tabular-nums">
                            {formatNumber(currentStock)} {p.unit || p.baseUnit || 'পিস'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedBatchProduct(p)}
                              className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition cursor-pointer"
                            >
                              {isBengali ? 'ব্যাচ পরিচালনা' : 'Manage Batches'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: CATEGORY DIRECTORY ────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                  🏷️ {isBengali ? 'ক্যাটাগরি ডিরেক্টরি' : 'Category Directory'}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {formatNumber(uniqueCategories.length)} {isBengali ? 'টি সক্রিয় ক্যাটাগরি' : 'Active categories'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                {isBengali ? 'দোকানের সকল পণ্যের ক্যাটাগরি ম্যাট্রিক্স' : 'All Product Categories Matrix'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                {isBengali ? 'যেকোনো ক্যাটাগরিতে ক্লিক করে সেই ক্যাটাগরির পণ্য এক ক্লিকে ব্রাউজ করুন' : 'Click any category to filter and manage items'}
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black shadow-md transition cursor-pointer shrink-0 active:scale-95"
            >
              {isBengali ? '+ নতুন পণ্য যোগ' : '+ Add Product'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => {
              return (
                <div
                  key={c.key}
                  onClick={() => {
                    setSelectedCategory(c.key);
                    setActiveTab('ALL');
                  }}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {getCategoryIcon(c.key)}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-800 text-xs font-black font-mono transition">
                      {c.count} {isBengali ? 'পণ্য' : 'items'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-black text-slate-900 text-base group-hover:text-indigo-700 transition">
                      {c.label}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {isBengali ? 'ক্যাটালগে দেখুন →' : 'View items →'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Product Stock Movement Ledger Modal ── */}
      {historyProduct && (
        <ProductStockHistoryModal
          product={historyProduct}
          invoices={invoices}
          chalans={chalans}
          godownTransfers={godownTransfers}
          onClose={() => setHistoryProduct(null)}
          isBengali={isBengali}
          locale={locale}
        />
      )}

      {/* ── Edit Product Modal ── */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
          isBengali={isBengali}
          profile={profile}
          isOwner={isOwner}
        />
      )}

      {/* ── Delete Product Confirmation Modal ── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
              <Trash2 size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'পণ্যটি মুছে ফেলতে চান?' : 'Delete Inventory Product?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              <span className="font-bold text-slate-800">"{deletingProduct.name}"</span> {isBengali ? 'ক্যাটালগ থেকে সম্পূর্ণ অপসারণ করা হবে।' : 'will be removed.'}
              {((deletingProduct.stock || deletingProduct.currentStockInBaseUnit || 0) > 0) && (
                <span className="block font-bold text-rose-600 mt-1">
                  ⚠️ {isBengali ? 'সতর্কতা: এই পণ্যের এখনো মজুদ রয়েছে:' : 'Warning: In-stock quantity:'} {deletingProduct.stock || deletingProduct.currentStockInBaseUnit} {deletingProduct.unit || deletingProduct.baseUnit}
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
                  setDeletingProduct(null);
                  setDeletePin('');
                  setDeleteError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Switcher Modal for Fast PIN Unlock */}
      {isRoleModalOpen && (
        <RoleSwitcherModal
          isOpen={true}
          onClose={() => setIsRoleModalOpen(false)}
        />
      )}

      {/* Morning Repricer Modal */}
      {isRepricerOpen && (
        <MorningRepricerModal
          isOpen={true}
          onClose={() => setIsRepricerOpen(false)}
        />
      )}

      {/* Batch Expiry Modal */}
      {selectedBatchProduct && (
        <BatchExpiryModal
          product={selectedBatchProduct}
          isOpen={true}
          onClose={() => setSelectedBatchProduct(null)}
          onAddBatch={(productId, batchData) => {
            addProductBatch(productId, batchData);
            setSelectedBatchProduct(null);
          }}
        />
      )}

      {/* Dynamic Industry-Aware Add Product Modal */}
      {isAddProductOpen && (
        <AddProductModal
          isOpen={true}
          initialBarcode={initialBarcodeForNewProduct}
          onClose={() => {
            setIsAddProductOpen(false);
            setInitialBarcodeForNewProduct('');
          }}
          onAdd={(newProd) => {
            addProduct(newProd);
            setIsAddProductOpen(false);
            setInitialBarcodeForNewProduct('');
          }}
          isBengali={isBengali}
          profile={profile}
          existingCategories={uniqueCategories}
        />
      )}

      {/* Mobile Barcode Scanner Pairing Modal */}
      {isMobileModalOpen && (
        <MobilePOSConnectModal
          isOpen={true}
          onClose={() => setIsMobileModalOpen(false)}
          activeTenant={activeTenant}
        />
      )}

      {/* ── Category Board Modal (Quick 1-Click Filter for Multi-Category Stores) ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isBengali ? 'সকল পণ্যের ক্যাটাগরি বোর্ড' : 'All Product Categories'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? `মোট ${uniqueCategories.length} টি ক্যাটাগরি সংরক্ষিত আছে` : `${uniqueCategories.length} categories available`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={categoryModalSearch}
                  onChange={(e) => setCategoryModalSearch(e.target.value)}
                  placeholder={isBengali ? 'ক্যাটাগরির নাম লিখে খুঁজুন...' : 'Search categories...'}
                  className="w-full text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Category Grid */}
            <div className="overflow-y-auto py-2 flex-1 pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Option: ALL */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setIsCategoryModalOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'border-slate-900 bg-slate-900 text-white font-black shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">📦</span>
                  <span className="text-xs truncate">{isBengali ? 'সকল পণ্য' : 'All Products'}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-lg font-black ${selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {products.length}
                </span>
              </button>

              {/* Individual Categories */}
              {uniqueCategories
                .filter((cat) => cat.toLowerCase().includes(categoryModalSearch.toLowerCase()))
                .map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryModalOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-black shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{getCategoryIcon(cat)}</span>
                        <span className="text-xs truncate">{cat}</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-lg font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {isBengali ? 'ক্লিক করে যেকোনো ক্যাটাগরির পণ্য এক ক্লিকে ফিল্টার করুন' : 'Click to instantly filter products'}
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                {isBengali ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over Product Details Inspector (Progressive Disclosure) ── */}
      {inspectingProduct && (
        <SlideOverDrawer
          isOpen={Boolean(inspectingProduct)}
          onClose={() => setInspectingProduct(null)}
          title={inspectingProduct.name}
          subtitle={`SKU: ${inspectingProduct.sku || 'N/A'} • ${inspectingProduct.category || (isBengali ? 'সাধারণ' : 'General')}`}
          badge={
            (inspectingProduct.currentStockInBaseUnit ?? inspectingProduct.stock ?? 0) <= (inspectingProduct.minStock || 5) ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                {isBengali ? 'কম স্টক' : 'Low Stock'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {isBengali ? 'পর্যাপ্ত মজুত' : 'In Stock'}
              </span>
            )
          }
          footer={
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  const p = inspectingProduct;
                  setInspectingProduct(null);
                  setHistoryProduct(p);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <History size={14} />
                <span>{isBengali ? 'লেজার' : 'History'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = inspectingProduct;
                  setInspectingProduct(null);
                  setSelectedBatchProduct(p);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Calendar size={14} />
                <span>{isBengali ? 'ব্যাচ ও মেয়াদ' : 'Batches'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = inspectingProduct;
                  setInspectingProduct(null);
                  handleOpenEdit(p);
                }}
                className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 size={14} />
                <span>{isBengali ? 'এডিট' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = inspectingProduct;
                  setInspectingProduct(null);
                  setDeletingProduct(p);
                  setDeletePin('');
                  setDeleteError('');
                }}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                title={isBengali ? 'মুছুন' : 'Delete'}
              >
                <Trash2 size={15} />
              </button>
            </div>
          }
        >
          {(() => {
            const p = inspectingProduct;
            const costTaka = poishaToTaka(p.costPricePoisha || p.costPriceBasePoisha || 0);
            const saleTaka = poishaToTaka(p.salePricePoisha || p.sellingPriceBasePoisha || 0);
            const marginTaka = saleTaka - costTaka;
            const marginPercent = costTaka > 0 ? ((marginTaka / costTaka) * 100).toFixed(1) : 0;
            const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;
            const minStock = p.minStock || 5;

            return (
              <div className="space-y-4 text-xs">
                {/* 1. Price & Margin Metric Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      {isBengali ? 'বিক্রয়মূল্য' : 'Selling Price'}
                    </span>
                    <span className="text-lg font-black text-slate-900">৳{saleTaka.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">/{p.unit || p.baseUnit || 'পিস'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      {isBengali ? 'ক্রয়মূল্য ও লাভ' : 'Cost & Margin'}
                    </span>
                    {isOwner ? (
                      <div>
                        <span className="text-base font-black text-slate-700">৳{costTaka.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block ml-1">
                          +{marginPercent}% (৳{marginTaka.toFixed(2)})
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsRoleModalOpen(true)}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Lock size={12} />
                        <span>{isBengali ? 'পিন দিয়ে আনলক' : 'Unlock PIN'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Stock Health Summary */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">{isBengali ? 'বর্তমান মজুত স্টক:' : 'Current Stock:'}</span>
                    <span className="text-base font-black text-slate-900 tabular-nums">
                      {formatNumber(currentStock)} {p.unit || p.baseUnit || 'পিস'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="font-medium text-slate-500">{isBengali ? 'নিরাপদ ন্যূনতম মাত্রা:' : 'Min Stock Threshold:'}</span>
                    <span className="font-bold text-slate-700 tabular-nums">
                      {formatNumber(minStock)} {p.unit || p.baseUnit || 'পিস'}
                    </span>
                  </div>
                </div>

                {/* 3. Product Specification List */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Package size={14} className="text-slate-600" />
                    <span>{isBengali ? 'পণ্যের বিবরণ ও স্পেসিফিকেশন' : 'Product Details'}</span>
                  </h4>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-500">{isBengali ? 'ক্যাটাগরি:' : 'Category:'}</span>
                      <span className="font-bold text-slate-800">{p.category || 'সাধারণ'}</span>
                    </div>
                    {p.brand && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'ব্র্যান্ড / কোম্পানি:' : 'Brand:'}</span>
                        <span className="font-bold text-slate-800">{p.brand}</span>
                      </div>
                    )}
                    {p.genericName && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'জেনেরিক নাম:' : 'Generic:'}</span>
                        <span className="font-bold text-emerald-700">{p.genericName}</span>
                      </div>
                    )}
                    {p.sku && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'বারকোড / SKU:' : 'Barcode / SKU:'}</span>
                        <span className="font-mono font-bold text-slate-800">{p.sku}</span>
                      </div>
                    )}
                    {p.isDualUnit && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'ডুয়াল ইউনিট প্যাকেট:' : 'Bulk Packaging:'}</span>
                        <span className="font-bold text-purple-700">
                          ১ {p.bulkUnitName || 'বস্তা'} = {p.packSize || p.bulkConversionFactor} {p.unit || p.baseUnit}
                        </span>
                      </div>
                    )}
                    {p.warrantyPeriodMonths > 0 && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'ওয়ারেন্টি সীমা:' : 'Warranty:'}</span>
                        <span className="font-bold text-indigo-700">{p.warrantyPeriodMonths} মাস</span>
                      </div>
                    )}
                    {p.hotkey && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500">{isBengali ? 'হটকি নম্বর:' : 'Hotkey:'}</span>
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">#{p.hotkey}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Batch Info if available */}
                {(p.batchNumber || (p.batches && p.batches.length > 0)) && (
                  <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Calendar size={14} className="text-purple-600" />
                        <span>{isBengali ? 'ব্যাচ ও মেয়াদ ট্র্যাকিং' : 'Batches'}</span>
                      </span>
                      <button
                        onClick={() => {
                          const prod = inspectingProduct;
                          setInspectingProduct(null);
                          setSelectedBatchProduct(prod);
                        }}
                        className="text-[11px] font-bold text-purple-700 hover:underline"
                      >
                        {isBengali ? 'সব ব্যাচ পরিচালনা →' : 'Manage Batches →'}
                      </button>
                    </div>
                    <div className="text-xs text-purple-950 font-medium">
                      {isBengali ? 'ডিফল্ট ব্যাচ:' : 'Default Batch:'} <strong className="font-mono">{p.batchNumber || p.batches?.[0]?.batchNumber}</strong>
                      {p.expiryDate && (
                        <span className="block text-[11px] text-purple-700 mt-0.5">
                          {isBengali ? 'মেয়াদ:' : 'Expiry:'} {p.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </SlideOverDrawer>
      )}
    </div>
  );
}

// ── Edit Product Modal ────────────────────────────────────────────────────
function EditProductModal({ product, isOpen, onClose, onSave, isBengali, profile, isOwner, existingCategories = [] }) {
  const [name, setName] = useState(product.name || '');
  const [sku, setSku] = useState(product.sku || '');
  const [category, setCategory] = useState(product.category || '');
  const [costTaka, setCostTaka] = useState(poishaToTaka(product.costPricePoisha || product.costPriceBasePoisha || 0).toString());
  const [saleTaka, setSaleTaka] = useState(poishaToTaka(product.salePricePoisha || product.sellingPriceBasePoisha || 0).toString());
  const [unit, setUnit] = useState(product.unit || product.baseUnit || 'কেজি');
  const [stock, setStock] = useState((product.stock || product.currentStockInBaseUnit || 0).toString());
  const [minStock, setMinStock] = useState((product.minStock || 5).toString());
  const [isDualUnit, setIsDualUnit] = useState(product.isDualUnit || product.hasBulkUnit || false);
  const [bulkUnitName, setBulkUnitName] = useState(product.bulkUnitName || 'বস্তা');
  const [packSize, setPackSize] = useState((product.packSize || product.bulkConversionFactor || 50).toString());
  const [hotkey, setHotkey] = useState(product.hotkey || '');
  const [genericName, setGenericName] = useState(product.genericName || '');
  const [brand, setBrand] = useState(product.brand || product.manufacturer || '');
  const [warrantyMonths, setWarrantyMonths] = useState((product.warrantyPeriodMonths || 0).toString());

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedCostPoisha = takaToPoisha(costTaka || '0');
    const parsedSalePoisha = takaToPoisha(saleTaka || '0');
    const parsedStock = parseFloat(stock) || 0;
    const parsedPack = parseFloat(packSize) || 50;

    onSave({
      ...product,
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || 'সাধারণ পণ্য',
      costPricePoisha: parsedCostPoisha,
      costPriceBasePoisha: parsedCostPoisha,
      salePricePoisha: parsedSalePoisha,
      sellingPriceBasePoisha: parsedSalePoisha,
      bulkSellingPricePoisha: isDualUnit ? Math.round(parsedSalePoisha * parsedPack * 0.95) : 0,
      unit,
      baseUnit: unit,
      stock: parsedStock,
      currentStockInBaseUnit: parsedStock,
      minStock: parseFloat(minStock) || 5,
      isDualUnit,
      hasBulkUnit: isDualUnit,
      bulkUnitName: isDualUnit ? bulkUnitName : '',
      packSize: isDualUnit ? parsedPack : 1,
      bulkConversionFactor: isDualUnit ? parsedPack : 1,
      hotkey: hotkey.trim(),
      genericName: genericName.trim(),
      brand: brand.trim(),
      manufacturer: brand.trim(),
      warrantyPeriodMonths: parseInt(warrantyMonths, 10) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Edit3 size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {isBengali ? 'পণ্যের তথ্য পরিবর্তন (Edit Item)' : 'Edit Product Details'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{product.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              {isBengali ? 'পণ্যের নাম' : 'Product Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm font-bold h-12 px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'বারকোড / SKU' : 'Barcode / SKU'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <input
                type="text"
                list="editProductCategories"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder={isBengali ? 'ক্যাটাগরি নির্বাচন বা নতুন লিখুন' : 'Select or type category'}
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
              <datalist id="editProductCategories">
                {(existingCategories || []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'হট-কী (১-৯)' : 'Hotkey'}
              </label>
              <input
                type="text"
                maxLength={2}
                value={hotkey}
                onChange={e => setHotkey(e.target.value)}
                placeholder="1"
                className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'ক্রয়মূল্য (টাকা)' : 'Cost Price (BDT)'}
              </label>
              <div className="flex items-center h-11 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 overflow-hidden">
                <span className="w-9 h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 select-none">৳</span>
                <input
                  type="number"
                  step="any"
                  value={costTaka}
                  onChange={e => setCostTaka(e.target.value)}
                  className="w-full h-full px-3 text-sm font-bold bg-transparent focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                {isBengali ? 'বিক্রয়মূল্য (টাকা)' : 'Sale Price (BDT)'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center h-11 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 focus-within:bg-white focus-within:border-emerald-500 overflow-hidden">
                <span className="w-9 h-full flex items-center justify-center font-black text-emerald-600 bg-emerald-100 select-none">৳</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={saleTaka}
                  onChange={e => setSaleTaka(e.target.value)}
                  className="w-full h-full px-3 text-sm font-black bg-transparent focus:outline-none tabular-nums text-emerald-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'মজুদ স্টক' : 'Stock Quantity'}
              </label>
              <input
                type="number"
                step="any"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Dual Unit Checkbox */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={isDualUnit}
                onChange={(e) => setIsDualUnit(e.target.checked)}
                className="w-5 h-5 rounded-lg accent-slate-900 cursor-pointer"
              />
              <span>{isBengali ? 'পাইকারি বড় একক ও খুচরা একক উভয়ভাবে বিক্রি হয়?' : 'Sell in both bulk pack & base unit?'}</span>
            </label>
            {isDualUnit && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 font-bold block mb-1">
                    {isBengali ? 'বড় এককের নাম:' : 'Bulk Unit Name:'}
                  </span>
                  <input
                    type="text"
                    value={bulkUnitName}
                    onChange={(e) => setBulkUnitName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                  />
                </div>
                <div>
                  <span className="text-slate-600 font-bold block mb-1">
                    {isBengali ? `১ ${bulkUnitName}-এ কত ${unit}?:` : `Units per ${bulkUnitName}:`}
                  </span>
                  <input
                    type="number"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-black bg-white tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/25 transition cursor-pointer active:scale-95"
            >
              {isBengali ? 'আপডেট সংরক্ষণ করুন ✓' : 'Save Changes ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Product Stock Movement Ledger Modal ──────────────────────────────────
function ProductStockHistoryModal({ product, invoices, chalans, godownTransfers, onClose, isBengali, locale }) {
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all movements involving this product
  const movements = useMemo(() => {
    const list = [];

    // 1. Invoices (Sales Deductions)
    (invoices || []).forEach(inv => {
      (inv.items || []).forEach(item => {
        if (item.productId === product.id || item.sku === product.sku || item.name === product.name) {
          list.push({
            id: `sale_${inv.id}_${item.productId}`,
            type: 'SALE',
            title: `POS ক্যাশ মেমো: ${inv.id}`,
            partyName: inv.customerName || 'নগদ ক্রেতা',
            quantity: item.quantity,
            unit: item.unitName || product.unit || 'পিস',
            amountPoisha: item.quantity * (item.unitPricePoisha || 0),
            timestamp: inv.createdAt,
            direction: 'OUT',
          });
        }
      });
    });

    // 2. Godown Transfers (Stock In to Shop)
    (godownTransfers || []).forEach(gt => {
      if (gt.productId === product.id || gt.productName === product.name) {
        list.push({
          id: `transfer_${gt.id}`,
          type: 'TRANSFER_IN',
          title: `গুদাম থেকে দোকানে স্টক গ্রহণ: ${gt.id}`,
          partyName: 'প্রধান গোডাউন',
          quantity: gt.quantity,
          unit: gt.unit || product.unit || 'পিস',
          amountPoisha: 0,
          timestamp: gt.timestamp,
          direction: 'IN',
        });
      }
    });

    // 3. Delivery Chalans
    (chalans || []).forEach(ch => {
      (ch.items || []).forEach(item => {
        if (item.productId === product.id || item.productName === product.name) {
          list.push({
            id: `chalan_${ch.id}`,
            type: 'CHALAN_DELIVERY',
            title: `ডেলিভারি চালান: ${ch.chalanNumber || ch.id}`,
            partyName: ch.receiverName || 'ডেলিভারি',
            quantity: item.quantity,
            unit: item.unit || product.unit || 'পিস',
            amountPoisha: 0,
            timestamp: ch.createdAt,
            direction: 'OUT',
          });
        }
      });
    });

    // Filter by time
    let filtered = list;
    const now = Date.now();
    if (timeFilter === 'TODAY') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(m => m.timestamp >= todayStart);
    } else if (timeFilter === 'WEEK') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(m => m.timestamp >= weekAgo);
    } else if (timeFilter === 'MONTH') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(m => m.timestamp >= monthAgo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.partyName.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [product, invoices, chalans, godownTransfers, timeFilter, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black">{product.name}</h3>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                SKU: {product.sku || 'N/A'} • {product.category || 'ক্যাটাগরি'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isBengali ? 'দোকানে বর্তমান মজুদ স্টক' : 'Current Shop Stock'}
            </span>
            <span className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">
              {product.stock || product.currentStockInBaseUnit || 0} {product.unit || product.baseUnit || 'কেজি'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isBengali ? 'মোট মুভমেন্ট রেকর্ড' : 'Movement Records'}
            </span>
            <span className="text-xl font-black text-blue-700 tabular-nums">
              {movements.length} {isBengali ? 'টি' : ''}
            </span>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {[
              { id: 'ALL', label: isBengali ? 'সব' : 'All' },
              { id: 'TODAY', label: isBengali ? 'আজ' : 'Today' },
              { id: 'WEEK', label: isBengali ? '৭ দিন' : '7 Days' },
              { id: 'MONTH', label: isBengali ? 'চলতি মাস' : 'Month' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  timeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isBengali ? 'মেমো নং / ক্রেতার নাম...' : 'Search memo / buyer...'}
              className="w-full h-9 pl-8 pr-3 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Movements Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {movements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <History size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                {isBengali ? 'এই পণ্যের কোনো বিক্রয় বা গোডাউন মুভমেন্ট রেকর্ড পাওয়া যায়নি' : 'No stock movements recorded yet'}
              </p>
            </div>
          ) : (
            movements.map(m => (
              <div 
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    m.direction === 'OUT' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {m.direction === 'OUT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                      {m.partyName} • {new Date(m.timestamp).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-black text-base tabular-nums ${
                    m.direction === 'OUT' ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {m.direction === 'OUT' ? '-' : '+'}{m.quantity} {m.unit}
                  </p>
                  {m.amountPoisha > 0 && (
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      {formatCurrency(m.amountPoisha, { locale })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

