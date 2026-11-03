import React, { useState, useMemo, useRef } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { getBusinessProfile } from '../core/BusinessProfiles';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../utils/currency';
import MorningRepricerModal from '../components/inventory/MorningRepricerModal';
import BatchExpiryModal from '../components/inventory/BatchExpiryModal';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
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
  ShoppingCart
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
  const navigate = useNavigate();

  const businessType = activeTenant?.businessType || 'GENERAL_RETAIL';
  const profile = getBusinessProfile(businessType);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [groupingMode, setGroupingMode] = useState('NONE');
  const [isRepricerOpen, setIsRepricerOpen] = useState(false);
  const [selectedBatchProduct, setSelectedBatchProduct] = useState(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);

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
      if (sortBy === 'STOCK_LOW') return (a.stock || a.currentStockInBaseUnit || 0) - (b.stock || b.currentStockInBaseUnit || 0);
      if (sortBy === 'STOCK_HIGH') return (b.stock || b.currentStockInBaseUnit || 0) - (a.stock || a.currentStockInBaseUnit || 0);
      if (sortBy === 'PRICE_LOW') return (a.salePricePoisha || a.sellingPriceBasePoisha || 0) - (b.salePricePoisha || b.sellingPriceBasePoisha || 0);
      if (sortBy === 'PRICE_HIGH') return (b.salePricePoisha || b.sellingPriceBasePoisha || 0) - (a.salePricePoisha || a.sellingPriceBasePoisha || 0);
      return 0;
    });
    return list;
  }, [filteredProducts, sortBy]);

  const groupedProducts = useMemo(() => {
    if (groupingMode === 'NONE' || selectedCategory !== 'ALL') {
      return [{ groupKey: 'ALL', groupName: isBengali ? 'পণ্য তালিকা' : 'Product List', items: sortedFilteredProducts }];
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
  }, [sortedFilteredProducts, groupingMode, selectedCategory, isBengali]);

  const lowStockItems = useMemo(() => {
    return (products || []).filter((p) => (p.currentStockInBaseUnit ?? p.stock ?? 0) <= (p.minStock || 5));
  }, [products]);

  const totalStockValuePoisha = useMemo(() => {
    return (products || []).reduce(
      (sum, p) => sum + ((p.currentStockInBaseUnit ?? p.stock ?? 0) * (p.costPricePoisha || p.costPriceBasePoisha || 0)), 
      0
    );
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

  return (
    <div className="w-full space-y-6 pb-12 overflow-x-hidden">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200 transition cursor-pointer active:scale-95 shrink-0"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center shrink-0">
                  <Package size={22} />
                </span>
                <span>{isBengali ? 'পণ্য ও স্টক ইনভেন্টরি' : 'Inventory & Products'}</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-pink-50 text-[#E2136E] border border-pink-200">
                <Building2 size={13} />
                <span>{isBengali ? profile.nameBn : profile.nameEn}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {profile.descriptionBn}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setIsRepricerOpen(true)}
            className="flex-1 sm:flex-none px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-black text-amber-950 bg-amber-100 hover:bg-amber-200/90 transition cursor-pointer flex items-center justify-center gap-2 border border-amber-300 shadow-xs active:scale-95"
          >
            <Clock size={17} className="text-amber-800" />
            <span>{isBengali ? 'দ্রুত দর পরিবর্তন' : 'Quick Repricer'}</span>
          </button>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-md shadow-pink-600/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>{isBengali ? '+ নতুন পণ্য যোগ' : '+ Add Product'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Items */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Boxes size={26} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBengali ? 'মোট পণ্য সংখ্যা' : 'Total Items'}</span>
            <h3 className="text-2xl font-black text-slate-800 tabular-nums">
              {formatNumber(products.length)} {isBengali ? 'টি আইটেম' : 'Items'}
            </h3>
          </div>
        </div>

        {/* Total Stock Value (Owner Only Privacy Gate) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
              <TrendingUp size={26} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isBengali ? 'মোট মজুদ মূল্য (ক্রয়মূল্যে)' : 'Stock Value (Cost)'}
              </span>
              {isOwner ? (
                <h3 className="text-2xl font-black text-emerald-700 tabular-nums truncate">
                  {formatCurrency(totalStockValuePoisha, { locale })}
                </h3>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-slate-400 font-mono tracking-widest">৳ ••••••••</span>
                  <button
                    onClick={() => setIsRoleModalOpen(true)}
                    className="text-[11px] font-bold text-[#E2136E] bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-lg border border-pink-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                    title="মালিক পিন দিয়ে দেখুন"
                  >
                    <Lock size={11} />
                    <span>{isBengali ? 'মালিক পিন' : 'Unlock'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
            lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
          }`}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBengali ? 'স্টক সতর্কবার্তা' : 'Low Stock'}</span>
            <h3 className={`text-2xl font-black tabular-nums ${
              lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}>
              {formatNumber(lowStockItems.length)} {isBengali ? 'টি পণ্য কম' : 'Low stock'}
            </h3>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-rose-900">
            <AlertTriangle size={20} className="text-rose-600 shrink-0" />
            <span>
              {isBengali
                ? `সতর্কতা: ${formatNumber(lowStockItems.length)} টি পণ্যের স্টক শেষ হয়ে আসছে! দ্রুত মহাজনকে অর্ডার দিন।`
                : `Alert: ${lowStockItems.length} products have reached critical low stock level!`}
            </span>
          </div>
          <button
            onClick={() => navigate('/suppliers')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 transition cursor-pointer shrink-0"
          >
            {isBengali ? 'মহাজন খাতা দেখুন →' : 'View Suppliers →'}
          </button>
        </div>
      )}

      {/* ── Search & Filter Strip (World-Class Redesign) ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        {/* Row 1: Full-Width Omni-Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-slate-400">
            <Search size={20} className="text-[#E2136E]" />
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBengali ? 'পণ্যের নাম, বারকোড, ক্যাটাগরি, জেনেরিক বা ব্র্যান্ড নাম লিখুন...' : 'Search by product name, barcode, category, generic, brand...'}
            className="w-full text-xs sm:text-sm font-semibold pl-12 pr-28 py-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#E2136E] focus:ring-4 focus:ring-pink-500/10 transition-all text-slate-800 placeholder:text-slate-400"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer active:scale-90"
                title={isBengali ? 'মুছে ফেলুন' : 'Clear'}
              >
                <X size={14} />
              </button>
            )}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold font-mono border border-slate-200 select-none">
              {filteredProducts.length}/{products.length} {isBengali ? 'পণ্য' : 'Items'}
            </span>
          </div>
        </div>

        {/* Row 2: Category Rail with Scroll Buttons & All Categories Modal Trigger */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          {/* Modal Trigger for Stores with Many Categories */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black border border-slate-300/80 transition cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 shadow-2xs"
            title={isBengali ? 'সকল ক্যাটাগরি গ্রিড ভিউ' : 'All Categories Grid'}
          >
            <LayoutGrid size={15} className="text-[#E2136E]" />
            <span className="hidden md:inline">{isBengali ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
            <span className="px-1.5 py-0.5 rounded-lg bg-white text-slate-700 text-[11px] font-black border border-slate-200">
              {uniqueCategories.length}
            </span>
          </button>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategoryRail('left')}
            className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 items-center justify-center border border-slate-200 shrink-0 transition cursor-pointer active:scale-90"
            title={isBengali ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Smooth Scrollable Category Rail */}
          <div
            ref={categoryRailRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 flex-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((c) => {
              const isSelected = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm select-none">{getCategoryIcon(c.key)}</span>
                  <span>{c.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategoryRail('right')}
            className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 items-center justify-center border border-slate-200 shrink-0 transition cursor-pointer active:scale-90"
            title={isBengali ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Controls Strip: Grouping & Sorting ── */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">{isBengali ? 'গ্রুপিং:' : 'Group:'}</span>
            <select
              value={groupingMode}
              onChange={(e) => setGroupingMode(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#E2136E]"
            >
              <option value="NONE">{isBengali ? '📄 গ্রুপ ছাড়া (একটানা)' : 'No Grouping (Flat)'}</option>
              <option value="CATEGORY">{isBengali ? '📑 ক্যাটাগরি ভিত্তিক গ্রুপ' : 'Group by Category'}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">{isBengali ? 'সর্টিং:' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#E2136E]"
            >
              <option value="NAME_ASC">{isBengali ? '🔤 নাম: ক-হ (A to Z)' : 'Name: A to Z'}</option>
              <option value="NAME_DESC">{isBengali ? '🔤 নাম: হ-ক (Z to A)' : 'Name: Z to A'}</option>
              <option value="STOCK_LOW">{isBengali ? '⚠️ কম স্টক প্রথমে' : 'Low Stock First'}</option>
              <option value="STOCK_HIGH">{isBengali ? '📦 পর্যাপ্ত স্টক প্রথমে' : 'High Stock First'}</option>
              <option value="PRICE_LOW">{isBengali ? '📉 বিক্রয় মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="PRICE_HIGH">{isBengali ? '📈 বিক্রয় মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          {sortedFilteredProducts.length} {isBengali ? 'টি পণ্য পাওয়া গেছে' : 'Items Found'}
        </span>
      </div>

      {/* ── Products List (Grouped or Flat) ── */}
      <div className="space-y-4">
        {sortedFilteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#E2136E] flex items-center justify-center mx-auto mb-3">
              <Package size={32} />
            </div>
            <p className="font-bold text-slate-800 text-base">
              {isBengali ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBengali ? 'নতুন মাল যোগ করতে উপরের বোতাম ব্যবহার করুন।' : 'Add a new product using the button above.'}
            </p>
          </div>
        ) : (
          groupedProducts.map((group) => (
            <div key={group.groupKey} className="space-y-3">
              {groupingMode !== 'NONE' && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                    <span>📑</span>
                    <span>{group.groupName}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {group.items.length} {isBengali ? 'টি পণ্য' : 'items'}
                  </span>
                </div>
              )}
              {group.items.map((p) => {
            const costTaka = poishaToTaka(p.costPricePoisha || p.costPriceBasePoisha || 0);
            const saleTaka = poishaToTaka(p.salePricePoisha || p.sellingPriceBasePoisha || 0);
            const marginTaka = saleTaka - costTaka;
            const marginPercent = costTaka > 0 ? ((marginTaka / costTaka) * 100).toFixed(1) : 0;
            const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;
            const isLow = currentStock <= (p.minStock || 5);

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-pink-300 shadow-xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all group"
              >
                {/* Left Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-slate-200 group-hover:border-pink-200 transition">
                    <Package size={22} className="text-[#E2136E]" />
                    {p.hotkey && (
                      <span className="text-[9px] font-black bg-[#E2136E] text-white px-1.5 rounded-md mt-0.5">
                        #{p.hotkey}
                      </span>
                    )}
                  </div>

                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-base md:text-lg text-slate-900 truncate">{p.name}</h3>
                      {p.isDualUnit && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                          {p.bulkUnitName || (isBengali ? 'বস্তা' : 'Bulk')} ({p.packSize || p.bulkConversionFactor} {p.unit || p.baseUnit})
                        </span>
                      )}
                      {p.genericName && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          🔬 {p.genericName}
                        </span>
                      )}
                      {p.warrantyPeriodMonths > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1">
                          <Shield size={11} /> {p.warrantyPeriodMonths} {isBengali ? 'মাস ওয়ারেন্টি' : 'Mos Warranty'}
                        </span>
                      )}
                      {p.availableSizes && p.availableSizes.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-pink-50 text-pink-700 border border-pink-200 font-bold">
                          সাইজ: {p.availableSizes.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold border border-slate-200/60">
                        {p.sku || 'N/A'}
                      </span>
                      {p.category && (
                        <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {p.category}
                        </span>
                      )}
                      {(p.brand || p.manufacturer) && (
                        <span className="font-semibold text-slate-700">
                          • {p.brand || p.manufacturer}
                        </span>
                      )}
                      {p.batchNumber && (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          ব্যাচ: {p.batchNumber} (মেয়াদ: {p.expiryDate})
                        </span>
                      )}

                      <span>•</span>

                      {/* Cost & Margin with Shop Manager Protection */}
                      {isOwner ? (
                        <>
                          <span className="font-medium text-slate-600">
                            {isBengali ? 'কেনা:' : 'Cost:'} ৳{costTaka.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <TrendingUp size={12} />
                            {marginPercent}% {isBengali ? 'লাভ' : 'Margin'}
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsRoleModalOpen(true)}
                          className="text-[11px] font-bold text-slate-400 hover:text-[#E2136E] flex items-center gap-1 transition cursor-pointer"
                          title="মালিক পিন দিয়ে ক্রয়মূল্য দেখুন"
                        >
                          <Lock size={12} className="text-slate-400" />
                          <span>{isBengali ? 'কেনা ও লাভ গোপন' : 'Cost & Margin Locked'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Stock, Price & Full Action Buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Selling Price */}
                  <div className="text-left sm:text-right min-w-[90px]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none mb-1">
                      {isBengali ? 'বিক্রয়মূল্য' : 'Selling Price'}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                      ৳{saleTaka.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      প্রতি {p.unit || p.baseUnit || 'পিস'}
                    </span>
                  </div>

                  {/* Stock Level */}
                  <div className="min-w-[100px] text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none mb-1">
                      {isBengali ? 'মজুদ স্টক' : 'In Stock'}
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-black tabular-nums ${
                        isLow ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatNumber(currentStock)} {p.unit || p.baseUnit || 'কেজি'}
                    </span>
                    {isLow && (
                      <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-rose-200">
                        {isBengali ? 'স্টক কম!' : 'Low Stock!'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Strip: History, Edit, Delete, Batch */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Stock Movement History Button */}
                    <button
                      type="button"
                      onClick={() => setHistoryProduct(p)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                      title={isBengali ? 'মালের স্টক মুভমেন্ট হিস্টোরি' : 'Stock Movement Ledger'}
                    >
                      <History size={16} className="text-blue-600" />
                      <span className="hidden sm:inline">{isBengali ? 'হিস্টোরি' : 'History'}</span>
                    </button>

                    {/* Batch Expiry FEFO Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedBatchProduct(p)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                      title="Manage Batches & Expiry (FEFO)"
                    >
                      <Calendar size={16} className="text-purple-600" />
                      <span className="hidden sm:inline">{isBengali ? 'ব্যাচ' : 'Batch'}</span>
                    </button>

                    {/* Edit Product Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="min-h-[44px] w-11 rounded-2xl bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-[#E2136E] border border-slate-200 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                      title={isBengali ? 'পণ্যের তথ্য পরিবর্তন' : 'Edit Product'}
                    >
                      <Edit3 size={16} />
                    </button>

                    {/* Delete Product Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingProduct(p);
                        setDeletePin('');
                        setDeleteError('');
                      }}
                      className="min-h-[44px] w-11 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-200 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                      title={isBengali ? 'পণ্য মুছে ফেলুন' : 'Delete Product'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))
    )}
  </div>

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
          onClose={() => setIsAddProductOpen(false)}
          onAdd={(newProd) => {
            addProduct(newProd);
            setIsAddProductOpen(false);
          }}
          isBengali={isBengali}
          profile={profile}
          existingCategories={uniqueCategories}
        />
      )}

      {/* ── Category Board Modal (Quick 1-Click Filter for Multi-Category Stores) ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E2136E] flex items-center justify-center">
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
                  className="w-full text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E2136E]"
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
                    ? 'border-[#E2136E] bg-pink-50/70 text-[#E2136E] font-black ring-1 ring-[#E2136E]'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">📦</span>
                  <span className="text-xs truncate">{isBengali ? 'সকল পণ্য' : 'All Products'}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-black">
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
                          ? 'border-[#E2136E] bg-pink-50/70 text-[#E2136E] font-black ring-1 ring-[#E2136E]'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{getCategoryIcon(cat)}</span>
                        <span className="text-xs truncate">{cat}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-black">
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
            <span className="w-10 h-10 rounded-2xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center">
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
              className="w-full text-sm font-bold h-12 px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all text-slate-900"
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
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
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
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
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
                className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'ক্রয়মূল্য (টাকা)' : 'Cost Price (BDT)'}
              </label>
              <div className="flex items-center h-11 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] overflow-hidden">
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
                className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
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
                className="w-5 h-5 rounded-lg accent-[#E2136E] cursor-pointer"
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
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] shadow-md shadow-pink-600/25 transition cursor-pointer active:scale-95"
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

// ── Dynamic Industry-Aware Add Product Modal Helper ────────────────────────
function AddProductModal({ isOpen, onClose, onAdd, isBengali, profile, existingCategories = [] }) {
  const isHybrid = profile?.id === 'HYBRID_DEPARTMENTAL' || profile?.features?.isHybrid;

  const DEPARTMENTS = [
    {
      id: 'PHARMACY',
      labelBn: 'ওষুধ ও ফার্মেসি',
      labelEn: 'Pharmacy',
      icon: Pill,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
      activeColor: 'bg-emerald-600 text-white shadow-emerald-600/25 shadow-md border-emerald-600',
      defaultCategory: 'ওষুধ ও ফার্মেসী',
      defaultUnit: 'পাতা',
      defaultBulk: 'বক্স',
      defaultPack: 10,
    },
    {
      id: 'COMMODITY_GRAIN',
      labelBn: 'মুদি ও খাদ্যশস্য (ওজন)',
      labelEn: 'Grocery & Grain',
      icon: Boxes,
      color: 'border-amber-500 bg-amber-50 text-amber-800',
      activeColor: 'bg-amber-600 text-white shadow-amber-600/25 shadow-md border-amber-600',
      defaultCategory: 'চাল ও খাদ্যশস্য',
      defaultUnit: 'কেজি',
      defaultBulk: 'বস্তা',
      defaultPack: 50,
    },
    {
      id: 'GENERAL_RETAIL',
      labelBn: 'কসমেটিক্স ও সাধারণ',
      labelEn: 'General & FMCG',
      icon: Package,
      color: 'border-blue-500 bg-blue-50 text-blue-800',
      activeColor: 'bg-blue-600 text-white shadow-blue-600/25 shadow-md border-blue-600',
      defaultCategory: 'কসমেটিক্স ও সাধারণ',
      defaultUnit: 'পিস',
      defaultBulk: 'কার্টন',
      defaultPack: 24,
    },
    {
      id: 'ELECTRONICS_MOBILE',
      labelBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
      labelEn: 'Electronics',
      icon: Smartphone,
      color: 'border-purple-500 bg-purple-50 text-purple-800',
      activeColor: 'bg-purple-600 text-white shadow-purple-600/25 shadow-md border-purple-600',
      defaultCategory: 'ইলেকট্রনিক্স ও গ্যাজেট',
      defaultUnit: 'পিস',
      defaultBulk: '',
      defaultPack: 1,
    },
    {
      id: 'FASHION_APPAREL',
      labelBn: 'পোশাক ও জুতো',
      labelEn: 'Fashion & Shoes',
      icon: Shirt,
      color: 'border-pink-500 bg-pink-50 text-pink-800',
      activeColor: 'bg-pink-600 text-white shadow-pink-600/25 shadow-md border-pink-600',
      defaultCategory: 'পোশাক ও ফ্যাশন',
      defaultUnit: 'পিস',
      defaultBulk: '',
      defaultPack: 1,
    },
  ];

  const [department, setDepartment] = useState(() => {
    if (profile?.id === 'PHARMACY') return 'PHARMACY';
    if (profile?.id === 'COMMODITY_GRAIN') return 'COMMODITY_GRAIN';
    if (profile?.id === 'ELECTRONICS_MOBILE') return 'ELECTRONICS_MOBILE';
    if (profile?.id === 'FASHION_APPAREL') return 'FASHION_APPAREL';
    return 'GENERAL_RETAIL';
  });

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(() => {
    const d = DEPARTMENTS.find(item => item.id === (profile?.id || 'GENERAL_RETAIL'));
    return d?.defaultCategory || '';
  });
  const [costTaka, setCostTaka] = useState('');
  const [saleTaka, setSaleTaka] = useState('');
  const [unit, setUnit] = useState(profile?.primaryUnits?.[0] || 'কেজি');
  const [stock, setStock] = useState('');
  const [isDualUnit, setIsDualUnit] = useState(profile?.features?.hasDualUnit || false);
  const [packSize, setPackSize] = useState('50');
  const [bulkUnitName, setBulkUnitName] = useState(profile?.features?.defaultBulkUnit || 'বস্তা');
  const [isWeighable, setIsWeighable] = useState(false);

  // Industry Specific States
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [brand, setBrand] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');

  const handleSelectDepartment = (deptId) => {
    setDepartment(deptId);
    const d = DEPARTMENTS.find(item => item.id === deptId);
    if (d) {
      if (!category || DEPARTMENTS.some(item => item.defaultCategory === category)) {
        setCategory(d.defaultCategory);
      }
      if (d.defaultUnit) setUnit(d.defaultUnit);
      if (deptId === 'COMMODITY_GRAIN') {
        setIsWeighable(true);
        setIsDualUnit(true);
        setBulkUnitName('বস্তা');
        setPackSize('50');
      } else if (deptId === 'PHARMACY') {
        setIsWeighable(false);
        setIsDualUnit(true);
        setBulkUnitName('বক্স');
        setPackSize('10');
      } else {
        setIsWeighable(false);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !saleTaka) return;

    const parsedStock = parseFloat(stock) || 0;
    const imeiList = imeiInput
      ? imeiInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const availableSizes = sizesInput
      ? sizesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const availableColors = colorsInput
      ? colorsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    onAdd({
      id: `prod_${Date.now()}`,
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: category || (isBengali ? 'সাধারণ পণ্য' : 'General Item'),
      department,
      isWeighable: isWeighable || department === 'COMMODITY_GRAIN' || unit === 'কেজি' || unit === 'গ্রাম',
      costPricePoisha: takaToPoisha(parseFloat(costTaka) || 0),
      salePricePoisha: takaToPoisha(parseFloat(saleTaka) || 0),
      costPriceBasePoisha: takaToPoisha(parseFloat(costTaka) || 0),
      sellingPriceBasePoisha: takaToPoisha(parseFloat(saleTaka) || 0),
      bulkSellingPricePoisha: isDualUnit 
        ? Math.round(takaToPoisha(parseFloat(saleTaka) || 0) * (parseFloat(packSize) || 50) * 0.95)
        : 0,
      unit,
      baseUnit: unit,
      stock: parsedStock,
      currentStockInBaseUnit: parsedStock,
      isDualUnit,
      hasBulkUnit: isDualUnit,
      bulkUnitName: isDualUnit ? bulkUnitName : '',
      packSize: isDualUnit ? parseFloat(packSize) || 50 : 1,
      bulkConversionFactor: isDualUnit ? parseFloat(packSize) || 50 : 1,
      genericName,
      manufacturer,
      brand,
      warrantyPeriodMonths: parseInt(warrantyMonths, 10) || 0,
      imeiList,
      batchNumber,
      expiryDate,
      availableSizes,
      availableColors,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center">
              <Package size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {isBengali ? 'নতুন পণ্য ক্যাটালগে যুক্ত করুন' : 'Add New Inventory Item'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#E2136E] text-[10px] font-bold">
                  {isBengali ? profile?.nameBn : profile?.nameEn}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isBengali ? 'বিভাগ নির্বাচন করে পণ্যের দাম ও বিশেষ তথ্য যুক্ত করুন' : 'Select department and enter pricing & industry specs'}
              </p>
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
          {/* ── Multi-Department Selector ── */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Store size={14} className="text-[#E2136E]" />
                <span>{isBengali ? 'পণ্যের বিভাগ (Department)' : 'Product Department'}</span>
                {isHybrid && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black">
                    {isBengali ? 'হাইব্রিড স্টোর' : 'Hybrid Store'}
                  </span>
                )}
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {isBengali ? 'বিভাগ অনুযায়ী ফিচার স্বয়ংক্রিয়ভাবে সক্রিয় হবে' : 'Adapts features to department'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {DEPARTMENTS.map((d) => {
                const IconComp = d.icon;
                const isSelected = department === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDepartment(d.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 items-start ${
                      isSelected
                        ? d.activeColor
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <IconComp size={15} />
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className="text-[11px] font-black leading-tight line-clamp-1">
                      {isBengali ? d.labelBn : d.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-[#E2136E]" />
              <span>{isBengali ? 'পণ্যের নাম ও বিবরণ' : 'Product Name'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBengali ? 'যেমন: মিনিকেট প্রিমিয়াম চাল / নাপা এক্সট্রা / বিএসআরএম ১২মিমি' : 'e.g. Miniket Rice / Napa Extra / BSRM 12mm'}
              className="w-full text-sm font-bold h-13 px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] focus:ring-4 focus:ring-pink-500/10 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-slate-400" />
                <span>{isBengali ? 'বারকোড / SKU' : 'Barcode / SKU'}</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Scan or Auto"
                className="w-full text-sm font-semibold h-12 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-slate-400" />
                <span>{isBengali ? 'ক্যাটাগরি' : 'Category'}</span>
              </label>
              <input
                type="text"
                list="addProductCategories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={isBengali ? 'যেমন: চাল, ওষুধ, রড (বা তালিকা থেকে বাছুন)' : 'e.g. Rice, Medicine (or select)'}
                className="w-full text-sm font-semibold h-12 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all text-slate-900"
              />
              <datalist id="addProductCategories">
                {(existingCategories || []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Boxes size={14} className="text-slate-400" />
                <span>{isBengali ? 'বেস একক' : 'Base Unit'}</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm font-bold h-12 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all text-slate-900 cursor-pointer"
              >
                {Array.from(new Set([
                  'পিস', 'কেজি', 'পাতা (Strip)', 'বক্স (Box)', 'বস্তা', 'লিটার', 'বোতল', 'প্যাকেট', 'গ্রাম', 'জোড়া', 'টন', 'প্লেট',
                  ...(profile?.primaryUnits || [])
                ])).map((u) => (
                  <option key={u} value={u.split(' ')[0]}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'ক্রয়মূল্য (টাকা)' : 'Cost Price (BDT)'}
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#E2136E] transition-all overflow-hidden">
                <span className="w-10 h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 select-none">৳</span>
                <input
                  type="number"
                  step="any"
                  value={costTaka}
                  onChange={(e) => setCostTaka(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-full px-3 text-sm font-bold bg-transparent focus:outline-none tabular-nums text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                {isBengali ? 'বিক্রয়মূল্য (টাকা)' : 'Sale Price (BDT)'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 focus-within:bg-white focus-within:border-emerald-500 transition-all overflow-hidden">
                <span className="w-10 h-full flex items-center justify-center font-black text-emerald-600 bg-emerald-100 select-none">৳</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={saleTaka}
                  onChange={(e) => setSaleTaka(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-full px-3 text-sm font-black bg-transparent focus:outline-none tabular-nums text-emerald-950"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'প্রারম্ভিক মজুদ' : 'Initial Stock'}
              </label>
              <input
                type="number"
                step="any"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full text-sm font-bold h-12 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Industry fields - Pharmacy */}
          {department === 'PHARMACY' && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Pill size={14} className="text-emerald-700" />
                <span>ফার্মেসি ও ড্রাগ স্পেসিফিকেশন (FEFO & জেনেরিক)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="জেনেরিক নাম (যেমন: Paracetamol + Caffeine)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-emerald-300 bg-white"
                />
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="উৎপাদক কোম্পানি (যেমন: বেক্সিমকো / স্কয়ার)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-emerald-300 bg-white"
                />
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="ব্যাচ নং (যেমন: BEX-2026A)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-emerald-300 bg-white"
                />
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="মেয়াদ শেষ (MM/YYYY - যেমন: 12/2027)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-emerald-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Industry fields - Commodity Grain */}
          {department === 'COMMODITY_GRAIN' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Scale size={14} className="text-amber-700" />
                <span>ওজন স্কেল ও বস্তা-কেজি কনভার্সন (Weighable Commodity)</span>
              </span>
              <p className="text-xs text-amber-800 font-medium">
                {isBengali
                  ? 'এই পণ্যটি পিওএস কাউন্টারে ডিজিটাল ওজন স্কেলের সাথে সরাসরি মিলিগ্রাম/গ্রাম হিসেবে স্বয়ংক্রিয় ওজন হবে এবং বস্তা বা কেজিতে বিক্রি করা যাবে।'
                  : 'This product supports live digital scale tare weight deduction and dual pack selling.'}
              </p>
            </div>
          )}

          {/* Industry fields - Electronics */}
          {department === 'ELECTRONICS_MOBILE' && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                <Smartphone size={14} className="text-purple-700" />
                <span>ইলেকট্রনিক্স ও মোবাইল স্পেসিফিকেশন (IMEI & ওয়ারেন্টি)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ব্র্যান্ড / ব্র্যান্ডের নাম (যেমন: Samsung, Xiaomi)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-purple-300 bg-white"
                />
                <input
                  type="number"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(e.target.value)}
                  placeholder="ওয়ারেন্টির মেয়াদ (মাসে - যেমন: 12)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-purple-300 bg-white"
                />
              </div>
              <input
                type="text"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                placeholder="IMEI / সিরিয়াল নম্বর (কমা দিয়ে একাধিক লিখুন)"
                className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-purple-300 bg-white"
              />
            </div>
          )}

          {/* Industry fields - Fashion */}
          {department === 'FASHION_APPAREL' && (
            <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 space-y-3">
              <span className="text-xs font-black text-pink-900 flex items-center gap-1.5">
                <Shirt size={14} className="text-pink-700" />
                <span>পোশাক ও জুতো ভ্যারিয়েন্ট (সাইজ ও কালার মেট্রিক্স)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="উপলব্ধ সাইজ (যেমন: M, L, XL, XXL বা 40, 41, 42)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-pink-300 bg-white"
                />
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="উপলব্ধ রং (যেমন: কালো, সাদা, নেভি ব্লু)"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-pink-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Dual Unit Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={isDualUnit}
                onChange={(e) => setIsDualUnit(e.target.checked)}
                className="w-5 h-5 rounded-lg accent-[#E2136E] cursor-pointer"
              />
              <span>{isBengali ? 'পাইকারি বড় একক ও খুচরা একক উভয়ভাবে বিক্রি হয়?' : 'Sell in both bulk pack & base unit?'}</span>
            </label>
            {isDualUnit && (
              <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 font-bold block mb-1">
                    {isBengali ? 'বড় এককের নাম:' : 'Bulk Unit Name:'}
                  </span>
                  <input
                    type="text"
                    value={bulkUnitName}
                    onChange={(e) => setBulkUnitName(e.target.value)}
                    placeholder="বস্তা / বক্স / কার্টন / টন"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-black bg-white focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-13 rounded-2xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-13 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c0105d] hover:to-[#900c45] shadow-lg shadow-pink-600/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              <span>{isBengali ? 'পণ্য সংরক্ষণ' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
