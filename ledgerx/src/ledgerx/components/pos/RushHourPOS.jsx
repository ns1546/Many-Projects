import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, takaToPoisha, poishaToTaka } from '../../utils/currency';
import { barcodeScanner } from '../../utils/barcodeScanner';
import SplitPaymentModal from './SplitPaymentModal';
import HotProductsConfigModal from './HotProductsConfigModal';
import POSHistoryModal from './POSHistoryModal';
import POSSettingsModal from './POSSettingsModal';
import SearchableCustomerSelect from '../common/SearchableCustomerSelect';
import { 
  Zap, 
  ArrowLeft,
  Trash2, 
  Printer, 
  Search, 
  Smartphone, 
  Wallet, 
  Clock, 
  Receipt, 
  Plus, 
  Minus, 
  ShoppingCart, 
  UserCheck, 
  PauseCircle, 
  PlayCircle, 
  UserPlus, 
  X, 
  CreditCard, 
  Scale, 
  Barcode, 
  HelpCircle, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Sparkles,
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  Store,
  Layers,
  SlidersHorizontal,
  PackagePlus,
  FolderPlus,
  Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RushHourPOS({ onOpenReceipt, onBack }) {
  const { products, customers, recordPOSSale, addCustomer, addProduct, registers } = useKhata();
  const { tenants, activeTenant, switchTenant } = useTenant();
  const { t, isBengali, locale } = useLocale();

  // Primary State
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [isMfsModalOpen, setIsMfsModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Simplified Sorting & View Modes
  const [sortBy, setSortBy] = useState('FASTEST'); // 'FASTEST' | 'NAME_ASC' | 'PRICE_LOW' | 'PRICE_HIGH' | 'STOCK_HIGH'
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST'
  const [isGrouped, setIsGrouped] = useState(false);

  // Discount & Tax States
  const [discountValue, setDiscountValue] = useState('');
  const [vatRate, setVatRate] = useState(() => {
    try {
      const s = localStorage.getItem(`ledgerx_${activeTenant?.id}_pos_vat_config`);
      if (s) return Number(JSON.parse(s).rate) || 5;
    } catch (e) {}
    return 5;
  });
  const [isVatEnabled, setIsVatEnabled] = useState(() => {
    try {
      const s = localStorage.getItem(`ledgerx_${activeTenant?.id}_pos_vat_config`);
      if (s) return !!JSON.parse(s).enabled;
    } catch (e) {}
    return false;
  });
  const [isRoundingEnabled, setIsRoundingEnabled] = useState(true);

  // Cash Tender & Change State
  const [tenderedTaka, setTenderedTaka] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'MFS' | 'BANK' | 'DUE' | 'SPLIT'
  const [selectedMfsProvider, setSelectedMfsProvider] = useState('BKASH'); // 'BKASH' | 'NAGAD' | 'ROCKET' | 'CELLFIN'
  const [selectedBankOption, setSelectedBankOption] = useState('CARD'); // 'CARD' | 'BANK_IBBL'
  const [isCashTenderExpanded, setIsCashTenderExpanded] = useState(false);

  // Modal States
  const [isPOSSettingsOpen, setIsPOSSettingsOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Hot-Products Manager Modal State & Visual Category Board
  const [isHotProductsModalOpen, setIsHotProductsModalOpen] = useState(false);
  const [isCategoryBoardOpen, setIsCategoryBoardOpen] = useState(false);
  const [isSpeedBarVisible, setIsSpeedBarVisible] = useState(() => {
    try {
      const s = localStorage.getItem(`ledgerx_${activeTenant?.id}_pos_show_speedbar`);
      return s === 'true'; // Defaults to false so main screen is spacious
    } catch (e) {
      return false;
    }
  });
  const [categorySearch, setCategorySearch] = useState('');
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState(12);

  const categoryScrollRef = useRef(null);
  const catalogContainerRef = useRef(null);

  // Digital Scale / Weighable Product Quick Sheet State
  const [isWeighModalOpen, setIsWeighModalOpen] = useState(false);
  const [weighingProduct, setWeighingProduct] = useState(null);
  const [weighQuantity, setWeighQuantity] = useState('1.000');

  // MFS and Bank Registers for Checkout
  const mfsRegisters = useMemo(() => {
    return (registers || []).filter((r) =>
      r.category === 'MFS' ||
      r.category === 'BKASH' ||
      r.category === 'NAGAD' ||
      r.category === 'ROCKET' ||
      r.id.startsWith('bkash_') ||
      r.id.startsWith('nagad_') ||
      r.id.startsWith('rocket_') ||
      r.id.startsWith('cellfin_') ||
      r.id.startsWith('mfs_')
    );
  }, [registers]);

  const bankRegisters = useMemo(() => {
    return (registers || []).filter((r) =>
      (r.category === 'BANK' || r.id.startsWith('bank_')) &&
      !r.id.startsWith('bkash_') &&
      !r.id.startsWith('nagad_') &&
      !r.id.startsWith('rocket_') &&
      !r.id.startsWith('cellfin_')
    );
  }, [registers]);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Held/Parked Carts
  const [heldCarts, setHeldCarts] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ledgerx_pos_held_carts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Omni-Search Input Reference for auto-focus and direct typing
  const searchInputRef = useRef(null);

  // Sync held carts to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('ledgerx_pos_held_carts', JSON.stringify(heldCarts));
    } catch (e) {}
  }, [heldCarts]);

  // Reset display limit when query, category or sort changes
  useEffect(() => {
    setCatalogDisplayLimit(12);
    if (catalogContainerRef.current) {
      catalogContainerRef.current.scrollTop = 0;
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Infinite scroll listener for product catalog
  const handleCatalogScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      setCatalogDisplayLimit((prev) => {
        if (prev < sortedFilteredProducts.length) {
          return prev + 12;
        }
        return prev;
      });
    }
  };

  // Keep search input focused on initial mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Super Shop Dynamic Category List (Derives dynamically from user products in software)
  const categories = useMemo(() => {
    const list = [
      { id: 'ALL', label: isBengali ? 'সব পণ্য' : 'All Items', icon: '🌟' },
      { id: 'HOTKEYS', label: isBengali ? 'হট-কী (১-৯)' : 'Hotkeys (1-9)', icon: '⚡' },
    ];

    const seen = new Set();
    products.forEach((p) => {
      const c = p.category?.trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        let icon = '📦';
        if (c.includes('চাল') || c.includes('চাউল') || c.includes('আটা') || c.includes('তেল') || c.includes('খাদ্য') || c.includes('ডাল') || c.includes('নিত্য')) icon = '🌾';
        else if (c.includes('দুধ') || c.includes('ডেইরি') || c.includes('দুগ্ধজাত') || c.includes('ডিম')) icon = '🥛';
        else if (c.includes('বিস্কুট') || c.includes('স্ন্যাকস') || c.includes('বেকারি')) icon = '🍪';
        else if (c.includes('পানীয়') || c.includes('জুস') || c.includes('বেভারেজ')) icon = '🥤';
        else if (c.includes('ক্লিনিং') || c.includes('টয়লেট্রিস') || c.includes('ওয়াশ')) icon = '🧼';
        else if (c.includes('ব্যক্তিগত') || c.includes('কসমেটিক্স') || c.includes('যত্ন')) icon = '🧴';
        else if (c.includes('শাকসবজি') || c.includes('ফলমূল') || c.includes('কাঁচাবাজার')) icon = '🥦';
        else if (c.includes('ওষুধ') || c.includes('ফার্মা') || c.includes('পেইনকিলার')) icon = '💊';
        else if (c.includes('পোশাক') || c.includes('গার্মেন্টস') || c.includes('জুতো')) icon = '👕';
        else if (c.includes('মোবাইল') || c.includes('ইলেকট্রনিক্স')) icon = '📱';
        else if (c.includes('রড') || c.includes('সিমেন্ট') || c.includes('হার্ডওয়্যার')) icon = '🏗️';

        list.push({ id: c, label: c, icon });
      }
    });

    return list;
  }, [products, isBengali]);

  // Product Counts for Each Category
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: products.length,
      HOTKEYS: products.filter((p) => !!p.hotkey).length,
    };
    products.forEach((p) => {
      const c = p.category?.trim();
      if (c) {
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Direct 1-9 Speed Dial Hot-Products List
  const speedProducts = useMemo(() => {
    const slots = [];
    for (let i = 1; i <= 9; i++) {
      const match = products.find((p) => String(p.hotkey) === String(i));
      slots.push({
        slot: i,
        product: match || null,
      });
    }
    return slots;
  }, [products]);

  // Filtered Categories for the Visual Category Matrix Board (F4)
  const filteredCategoriesForBoard = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  // 1. Filtered Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      let catMatch = true;
      if (selectedCategory === 'HOTKEYS') {
        catMatch = !!p.hotkey;
      } else if (selectedCategory !== 'ALL') {
        catMatch = p.category === selectedCategory ||
                   p.category?.toLowerCase() === selectedCategory.toLowerCase();
      }

      // Query match
      const q = searchQuery.toLowerCase().trim();
      const queryMatch = !q || (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.genericName?.toLowerCase().includes(q)
      );

      return catMatch && queryMatch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Enter-to-Add Preview product (Instant cashier match)
  const enterMatchProduct = useMemo(() => {
    const code = searchQuery.trim().toLowerCase();
    if (!code) return null;
    let match = products.find((p) => p.sku?.toLowerCase() === code || p.id === code);
    if (!match) {
      match = products.find((p) => p.name?.toLowerCase() === code);
    }
    if (!match && filteredProducts.length > 0) {
      match = filteredProducts[0];
    }
    return match || null;
  }, [searchQuery, products, filteredProducts]);

  // 2. Sorted Catalog
  const sortedFilteredProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      if (sortBy === 'FASTEST') {
        const hA = a.hotkey ? parseInt(a.hotkey, 10) : 999;
        const hB = b.hotkey ? parseInt(b.hotkey, 10) : 999;
        if (hA !== hB) return hA - hB;
        return (a.name || '').localeCompare(b.name || '', 'bn');
      }
      if (sortBy === 'NAME_ASC') {
        return (a.name || '').localeCompare(b.name || '', 'bn');
      }
      if (sortBy === 'PRICE_LOW') {
        return (a.sellingPriceBasePoisha || 0) - (b.sellingPriceBasePoisha || 0);
      }
      if (sortBy === 'PRICE_HIGH') {
        return (b.sellingPriceBasePoisha || 0) - (a.sellingPriceBasePoisha || 0);
      }
      if (sortBy === 'STOCK_HIGH') {
        return (b.currentStockInBaseUnit || 0) - (a.currentStockInBaseUnit || 0);
      }
      return 0;
    });
    return list;
  }, [filteredProducts, sortBy]);

  // Progressive Slice of sorted products to ensure snappy performance
  const visibleProducts = useMemo(() => {
    return sortedFilteredProducts.slice(0, catalogDisplayLimit);
  }, [sortedFilteredProducts, catalogDisplayLimit]);

  // 3. Grouped Catalog (Group only visible products to prevent browser lag)
  const groupedProducts = useMemo(() => {
    if (!isGrouped || selectedCategory !== 'ALL') {
      return [{ 
        groupKey: 'ALL', 
        groupName: isBengali ? 'পণ্য তালিকা' : 'Product List', 
        icon: '📦', 
        items: visibleProducts 
      }];
    }

    const groupsMap = {};
    visibleProducts.forEach((p) => {
      let cat = p.category || (isBengali ? 'সাধারণ পণ্য' : 'General');
      if (!groupsMap[cat]) groupsMap[cat] = [];
      groupsMap[cat].push(p);
    });

    return Object.entries(groupsMap).map(([cat, items]) => {
      let icon = '📦';
      if (cat.includes('চাল') || cat.includes('আটা') || cat.includes('তেল') || cat.includes('খাদ্য')) icon = '🌾';
      else if (cat.includes('দুধ') || cat.includes('ডেইরি') || cat.includes('দুগ্ধজাত') || cat.includes('ডিম')) icon = '🥛';
      else if (cat.includes('বিস্কুট') || cat.includes('স্ন্যাকস') || cat.includes('বেকারি')) icon = '🍪';
      else if (cat.includes('পানীয়') || cat.includes('জুস') || cat.includes('বেভারেজ')) icon = '🥤';
      else if (cat.includes('ক্লিনিং') || cat.includes('টয়লেট্রিস') || cat.includes('ওয়াশ')) icon = '🧼';
      else if (cat.includes('ব্যক্তিগত') || cat.includes('কসমেটিক্স')) icon = '🧴';
      else if (cat.includes('শাকসবজি') || cat.includes('ফলমূল') || cat.includes('কাঁচাবাজার')) icon = '🥦';
      else if (cat.includes('ওষুধ') || cat.includes('ফার্মা')) icon = '💊';

      return {
        groupKey: cat,
        groupName: cat,
        icon,
        items,
      };
    });
  }, [visibleProducts, isGrouped, selectedCategory, isBengali]);

  // Audio Beeper Chime
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  // Add Item to Cart with Strict Stock-Out Protection
  const addToCart = (product, isBulk = false, customQty = 1) => {
    if (!product) return;
    const currentStock = product.currentStockInBaseUnit ?? product.stock ?? 0;
    if (currentStock <= 0) {
      toast.error(isBengali ? `"${product.name}" এর স্টক শেষ (Stock Out)!` : `"${product.name}" is Out of Stock!`, { icon: '⚠️' });
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id && item.isBulk === isBulk);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requiredBaseUnits = isBulk 
      ? (existingQty + customQty) * (product.bulkConversionFactor || 1) 
      : (existingQty + customQty);

    if (requiredBaseUnits > currentStock) {
      toast.error(isBengali ? `পর্যাপ্ত স্টক নেই! মজুদ আছে: ${currentStock} ${product.baseUnit || 'পিস'}` : `Insufficient stock! Remaining: ${currentStock}`);
      return;
    }

    playBeep();
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === product.id && item.isBulk === isBulk);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = Math.round((updated[idx].quantity + customQty) * 1000) / 1000;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
        };
        return updated;
      }

      const unitName = isBulk ? product.bulkUnitName || 'বস্তা' : product.baseUnit || product.unit || 'পিস';
      const unitPricePoisha = isBulk ? product.bulkSellingPricePoisha : product.sellingPriceBasePoisha;
      const costPricePoisha = isBulk
        ? (product.bulkCostPricePoisha || product.costPriceBasePoisha * (product.bulkConversionFactor || 1))
        : product.costPriceBasePoisha;

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          brand: product.brand || '',
          isBulk,
          unitName,
          unitPricePoisha,
          costPricePoisha,
          quantity: customQty,
          isWeighable: !!product.isWeighable,
          lineDiscountPoisha: 0,
          vatPercent: product.category?.includes('শাকসবজি') || product.category?.includes('চাল') ? 0 : 5,
        },
      ];
    });
  };

  // Handle Omni-Search Submission with Stock-Out Detection
  const handleSearchEnterSubmit = () => {
    const code = searchQuery.trim();
    if (!code) return;

    // Direct SKU or ID match
    let match = products.find((p) => p.sku?.toLowerCase() === code.toLowerCase() || p.id === code);

    // Supermarket Weighable Barcode parsing (e.g. 20 + SKU(5) + Weight(5) + Check)
    if (!match && code.startsWith('20') && code.length >= 12) {
      const subSku = code.slice(2, 7);
      const grams = parseInt(code.slice(7, 12), 10);
      match = products.find((p) => p.sku?.includes(subSku));
      if (match && !isNaN(grams)) {
        const stock = match.currentStockInBaseUnit ?? match.stock ?? 0;
        if (stock <= 0) {
          toast.error(isBengali ? `"${match.name}" এর স্টক শেষ (Stock Out)!` : `"${match.name}" is Out of Stock!`, { icon: '⚠️' });
          setSearchQuery('');
          return;
        }
        const kg = Math.round((grams / 1000) * 1000) / 1000;
        addToCart(match, false, kg);
        toast.success(`ওজন পণ্য স্ক্যান: ${match.name} (${kg} কেজি)`, { icon: '⚖️' });
        setSearchQuery('');
        return;
      }
    }

    if (!match) {
      match = products.find((p) => p.name?.toLowerCase() === code.toLowerCase());
    }

    if (!match && filteredProducts.length > 0) {
      match = filteredProducts[0];
    }

    if (match) {
      const stock = match.currentStockInBaseUnit ?? match.stock ?? 0;
      if (stock <= 0) {
        toast.error(isBengali ? `"${match.name}" এর স্টক শেষ (Stock Out)!` : `"${match.name}" is Out of Stock!`, { icon: '⚠️' });
        setSearchQuery('');
        return;
      }
      addToCart(match, false, 1);
      toast.success(`${match.name} যোগ হয়েছে`, { icon: '🛒' });
      setSearchQuery('');
    } else {
      toast.error(`কোনো পণ্য পাওয়া যায়নি: ${code}`, { icon: '⚠️' });
    }
  };

  // Connect Physical Laser Barcode Scanner listener
  useEffect(() => {
    if (!barcodeScanner) return;
    const subscribeFn = barcodeScanner.subscribe || barcodeScanner.addListener;
    if (typeof subscribeFn !== 'function') return;

    const unsub = subscribeFn.call(barcodeScanner, (scannedCode) => {
      if (!scannedCode) return;
      const match = products.find((p) => p.sku === scannedCode || p.id === scannedCode);
      if (match) {
        addToCart(match, false, 1);
        toast.success(`স্ক্যান: ${match.name}`, { icon: '🎯' });
        setSearchQuery('');
      } else {
        toast.error(`অপরিচিত বারকোড: ${scannedCode}`, { icon: '⚠️' });
      }
    });
    return unsub;
  }, [products]);

  // Update Cart Item Quantity
  const updateQuantity = (productId, isBulk, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, isBulk);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.isBulk === isBulk
          ? { ...item, quantity: Math.round(newQty * 1000) / 1000 }
          : item
      )
    );
  };

  // Remove Single Item
  const removeFromCart = (productId, isBulk) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.isBulk === isBulk)));
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCart([]);
    setDiscountValue('');
    setTenderedTaka('');
    setSelectedCustomerId('');
    setSearchQuery('');
  };

  // Hold Current Cart
  const handleHoldCart = () => {
    if (cart.length === 0) {
      toast.error(isBengali ? 'কার্ট খালি, হোল্ড করার কিছু নেই!' : 'Cart is empty!');
      return;
    }
    const currentCust = selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId) : null;
    const newHold = {
      id: `hold_${Date.now()}`,
      timestamp: Date.now(),
      customerName: currentCust?.name || (isBengali ? 'সাধারণ নগদ ক্রেতা' : 'Walk-in Customer'),
      customerId: selectedCustomerId,
      items: cart,
      subtotalPoisha,
      itemCount: cart.length,
    };

    setHeldCarts((prev) => [newHold, ...prev]);
    clearCart();
    toast.success(isBengali ? 'বিল সাময়িক হোল্ড করা হয়েছে!' : 'Cart on hold!', { icon: '⏸️' });
  };

  // Resume / Recall a Held Cart
  const handleRecallCart = (heldItem) => {
    if (cart.length > 0) {
      if (!window.confirm(isBengali ? 'বর্তমান কার্টের আইটেম প্রতিস্থাপিত হবে। চালিয়ে যেতে চান?' : 'Current cart will be replaced. Proceed?')) {
        return;
      }
    }
    setCart(heldItem.items || []);
    setSelectedCustomerId(heldItem.customerId || '');
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldItem.id));
    setIsHeldCartsModalOpen(false);
    toast.success(isBengali ? 'হোল্ড বিল চালু হয়েছে!' : 'Held cart restored!', { icon: '▶️' });
  };

  // Add Quick Customer Inline
  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      initialDuePoisha: 0,
      creditLimitPoisha: takaToPoisha(10000),
    });

    setSelectedCustomerId(newCust.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setIsNewCustomerModalOpen(false);
    toast.success(isBengali ? 'নতুন গ্রাহক যুক্ত হয়েছে!' : 'Customer created!');
  };

  // ── CORE CALCULATIONS (TallyKhata & Super Shop Standard) ──────────────────
  const subtotalPoisha = useMemo(() => {
    return cart.reduce((sum, item) => {
      const lineGross = Math.round(Number(item.quantity) * Number(item.unitPricePoisha));
      const lineNet = Math.max(0, lineGross - (item.lineDiscountPoisha || 0));
      return sum + lineNet;
    }, 0);
  }, [cart]);

  const invoiceDiscountPoisha = useMemo(() => {
    if (!discountValue || isNaN(Number(discountValue))) return 0;
    const flatPoisha = takaToPoisha(discountValue);
    return Math.min(subtotalPoisha, Math.max(0, flatPoisha));
  }, [discountValue, subtotalPoisha]);

  const vatPoisha = useMemo(() => {
    if (!isVatEnabled || subtotalPoisha <= 0 || vatRate <= 0) return 0;
    const taxableSubtotal = cart.reduce((sum, item) => {
      if ((item.vatPercent || 0) > 0 || item.vatPercent === undefined) {
        const lineGross = Math.round(Number(item.quantity) * Number(item.unitPricePoisha));
        return sum + Math.max(0, lineGross - (item.lineDiscountPoisha || 0));
      }
      return sum;
    }, 0);
    return Math.round(taxableSubtotal * (vatRate / 100));
  }, [cart, isVatEnabled, subtotalPoisha, vatRate]);

  const rawTotalPoisha = Math.max(0, subtotalPoisha - invoiceDiscountPoisha + vatPoisha);

  const roundingAdjustmentPoisha = useMemo(() => {
    if (!isRoundingEnabled || rawTotalPoisha === 0) return 0;
    const roundedTaka = Math.round(rawTotalPoisha / 100);
    return (roundedTaka * 100) - rawTotalPoisha;
  }, [rawTotalPoisha, isRoundingEnabled]);

  const grandTotalPoisha = Math.max(0, rawTotalPoisha + roundingAdjustmentPoisha);

  const tenderedPoisha = takaToPoisha(tenderedTaka || '0');
  const changePoisha = Math.max(0, tenderedPoisha - grandTotalPoisha);
  const dueOnSalePoisha = Math.max(0, grandTotalPoisha - tenderedPoisha);

  const selectedCustomer = useMemo(() => {
    return selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId) : null;
  }, [selectedCustomerId, customers]);

  // Execute Sale Submission
  const handleFinalizeSale = (mode = paymentMode, targetWalletId = null, targetWalletName = null) => {
    if (cart.length === 0) {
      toast.error(isBengali ? 'কার্ট খালি! পণ্য যুক্ত করুন।' : 'Cart is empty!');
      return;
    }

    // Strict Stock-out Validation before sale completion
    const stockoutItem = cart.find((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return (prod ? (prod.currentStockInBaseUnit ?? prod.stock ?? 0) : 0) <= 0;
    });
    if (stockoutItem) {
      toast.error(
        isBengali 
          ? `"${stockoutItem.name}" এর স্টক শেষ (Stock Out)! রসিদ কাটার আগে কার্ট থেকে বাদ দিন।` 
          : `"${stockoutItem.name}" is out of stock! Remove it from cart before completing sale.`
      );
      return;
    }

    if (mode === 'DUE' && !selectedCustomerId) {
      toast.error(isBengali ? 'বাকিতে বিক্রয়ের জন্য গ্রাহক নির্বাচন করুন!' : 'Select customer for due sales!');
      return;
    }

    let cashPoisha = 0;
    let bkashPoisha = 0;
    let bankPoisha = 0;
    let dueAmountPoisha = 0;
    let paidAmountPoisha = 0;

    const isMfs = ['BKASH', 'NAGAD', 'ROCKET', 'CELLFIN', 'UPAY', 'MFS'].includes(mode);
    const isBank = mode === 'BANK' || mode === 'CARD';

    if (mode === 'CASH') {
      cashPoisha = grandTotalPoisha;
      paidAmountPoisha = grandTotalPoisha;
    } else if (isMfs) {
      bkashPoisha = grandTotalPoisha;
      paidAmountPoisha = grandTotalPoisha;
    } else if (isBank) {
      bankPoisha = grandTotalPoisha;
      paidAmountPoisha = grandTotalPoisha;
    } else if (mode === 'DUE') {
      dueAmountPoisha = grandTotalPoisha;
      paidAmountPoisha = 0;
    } else if (mode === 'PARTIAL_CASH') {
      paidAmountPoisha = Math.min(grandTotalPoisha, tenderedPoisha);
      cashPoisha = paidAmountPoisha;
      dueAmountPoisha = Math.max(0, grandTotalPoisha - paidAmountPoisha);
      if (dueAmountPoisha > 0 && !selectedCustomerId) {
        toast.error(
          isBengali
            ? 'আংশিক পরিশোধে বাকি রাখার জন্য গ্রাহক নির্বাচন করুন!'
            : 'Please select a customer to record remaining due balance!'
        );
        setIsNewCustomerModalOpen(true);
        return;
      }
    }

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const enrichedItems = cart.map((item) => {
      const qty = Number(item.quantity) || 1;
      const gross = Math.round(qty * Number(item.unitPricePoisha || 0));
      const net = Math.max(0, gross - (item.lineDiscountPoisha || 0));
      return {
        ...item,
        lineTotalPoisha: item.lineTotalPoisha ?? net,
      };
    });

    const salePayload = {
      id: invoiceId,
      memoNumber: invoiceId,
      customerId: selectedCustomerId || null,
      customerName: selectedCustomer?.name || (isBengali ? 'সাধারণ নগদ ক্রেতা' : 'Walk-in Cash Customer'),
      customerPhone: selectedCustomer?.phone || '',
      previousDuePoisha: selectedCustomer?.currentDuePoisha ?? selectedCustomer?.balancePoisha ?? 0,
      containersDueCount: selectedCustomer?.containersDueCount || 0,
      cashierName: activeTenant?.role === 'CASHIER' ? 'ক্যাশিয়ার' : 'কাউন্টার ০১',
      items: enrichedItems,
      subtotalPoisha,
      discountPoisha: invoiceDiscountPoisha,
      vatPoisha,
      roundingPoisha: roundingAdjustmentPoisha,
      grandTotalPoisha,
      totalPoisha: grandTotalPoisha,
      paidAmountPoisha,
      cashPoisha,
      bkashPoisha,
      bankPoisha,
      walletId: targetWalletId,
      walletName: targetWalletName,
      dueAmountPoisha,
      changePoisha: mode === 'CASH' && tenderedPoisha > grandTotalPoisha ? changePoisha : 0,
      paymentMode: mode,
      isMushak: isVatEnabled,
      timestamp: Date.now(),
    };

    recordPOSSale(salePayload);

    if (onOpenReceipt) {
      onOpenReceipt(salePayload);
    }

    clearCart();
    setIsMfsModalOpen(false);
    setIsBankModalOpen(false);
    toast.success(isBengali ? 'বিক্রয় সফল হয়েছে!' : 'Sale completed!', { icon: '🧾' });
  };

  // ── GLOBAL DIRECT-TYPE & SHORTCUTS LISTENER ──────────────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        isSplitModalOpen ||
        isHeldCartsModalOpen ||
        isNewCustomerModalOpen ||
        isShortcutsModalOpen ||
        isHotProductsModalOpen ||
        isWeighModalOpen
      ) {
        return;
      }

      // If Category Board is open, Escape or F4 closes it
      if (isCategoryBoardOpen) {
        if (e.key === 'Escape' || e.key === 'F4') {
          e.preventDefault();
          setIsCategoryBoardOpen(false);
          return;
        }
        return;
      }

      const activeEl = document.activeElement;

      if (
        activeEl &&
        activeEl !== searchInputRef.current &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setIsCategoryBoardOpen((prev) => !prev);
        return;
      }
      if (e.key === 'F6') {
        e.preventDefault();
        handleHoldCart();
        return;
      }
      if (e.key === 'F7') {
        e.preventDefault();
        setIsHeldCartsModalOpen(true);
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsSplitModalOpen(true);
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setIsMfsModalOpen(true);
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0) setIsBankModalOpen(true);
        return;
      }
      if (e.key === 'F11') {
        e.preventDefault();
        if (cart.length > 0) handleFinalizeSale('DUE');
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isMfsModalOpen) {
          setIsMfsModalOpen(false);
        } else if (isBankModalOpen) {
          setIsBankModalOpen(false);
        } else if (isCategoryBoardOpen) {
          setIsCategoryBoardOpen(false);
        } else if (searchQuery) {
          setSearchQuery('');
        } else if (selectedCategory !== 'ALL') {
          setSelectedCategory('ALL');
          toast(isBengali ? 'সব পণ্য ভিউতে ফিরে আসা হয়েছে' : 'Filter reset to all items', { icon: '🌟' });
        } else if (cart.length > 0) {
          clearCart();
          toast(isBengali ? 'কার্ট ক্লিয়ার হয়েছে' : 'Cart cleared', { icon: '🧹' });
        }
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (e.key === 'Enter') {
        if (searchQuery.trim()) {
          e.preventDefault();
          handleSearchEnterSubmit();
        } else if (cart.length > 0) {
          e.preventDefault();
          if (paymentMode === 'MFS') {
            handleFinalizeSale(selectedMfsProvider, null, `${selectedMfsProvider} Mobile Banking`);
          } else if (paymentMode === 'BANK') {
            handleFinalizeSale(selectedBankOption === 'CARD' ? 'CARD' : 'BANK', null, selectedBankOption === 'CARD' ? 'পিওএস কার্ড মেশিন' : 'বাণিজ্যিক ব্যাংক হিসাব');
          } else if (paymentMode === 'DUE') {
            handleFinalizeSale('DUE');
          } else {
            handleFinalizeSale(tenderedPoisha > 0 && tenderedPoisha < grandTotalPoisha ? 'PARTIAL_CASH' : 'CASH');
          }
        }
        return;
      }

      // DIRECT TYPE TO SEARCH:
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (activeEl !== searchInputRef.current) {
          if (!searchQuery && e.key >= '1' && e.key <= '9') {
            const hotkeyItem = products.find((p) => p.hotkey === e.key);
            if (hotkeyItem) {
              e.preventDefault();
              addToCart(hotkeyItem, false, 1);
              toast.success(`হট-কি [${e.key}]: ${hotkeyItem.name}`, { icon: '⚡' });
              return;
            }
          }

          e.preventDefault();
          setSearchQuery((prev) => prev + e.key);
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isSplitModalOpen,
    isHeldCartsModalOpen,
    isNewCustomerModalOpen,
    isShortcutsModalOpen,
    isMfsModalOpen,
    isBankModalOpen,
    isCategoryBoardOpen,
    searchQuery,
    cart,
    products,
    filteredProducts,
    paymentMode,
    selectedMfsProvider,
    selectedBankOption,
    tenderedPoisha,
    grandTotalPoisha
  ]);

  return (
    <div className="w-full space-y-2.5 font-sans text-slate-800">
      
      {/* ── Compact POS Quick Bar (No Heavy Header) ───────────── */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              title="ড্যাশবোর্ডে ফিরুন"
            >
              <ArrowLeft size={13} />
              <span>{isBengali ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
            </button>
          )}

          {/* Quick Business Store Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStorePickerOpen(!isStorePickerOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] font-bold border border-pink-200/90 transition cursor-pointer shadow-2xs"
              title="দোকান বা ব্যবসা পরিবর্তন করুন"
            >
              <span>{activeTenant?.businessType === 'COMMODITY_GRAIN' ? '🌾' : activeTenant?.businessType === 'PHARMACY' ? '💊' : '🛒'}</span>
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{activeTenant?.name}</span>
              <ChevronDown size={11} />
            </button>
            {isStorePickerOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  {isBengali ? 'দোকান ও ব্যবসা নির্বাচন করুন' : 'Select Business Mode'}
                </div>
                {(tenants || []).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      switchTenant(t.id);
                      setIsStorePickerOpen(false);
                      toast.success(`সক্রিয় দোকান: ${t.name}`, { icon: '🏪' });
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer mb-1 ${
                      t.id === activeTenant?.id ? 'bg-pink-50 text-[#E2136E]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="truncate font-black">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{t.branch}</p>
                    </div>
                    {t.id === activeTenant?.id && <Check size={14} className="text-[#E2136E] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Minimal Actions: Hold Bill & Shortcuts */}
        <div className="flex items-center gap-1.5">
          {heldCarts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHeldCartsModalOpen(true)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 animate-pulse transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <PauseCircle size={13} />
              <span>{isBengali ? 'হোল্ড বিল' : 'Held'} ({heldCarts.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleHoldCart}
            disabled={cart.length === 0}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer disabled:opacity-40 shadow-2xs"
            title="কার্ট সাময়িক হোল্ড করুন (F6)"
          >
            {isBengali ? 'হোল্ড (F6)' : 'Hold'}
          </button>

          {/* Unified POS Settings Button (Contains Settings, VAT, History, and Hotkeys) */}
          <button
            type="button"
            onClick={() => setIsPOSSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title={isBengali ? 'পিওএস সেটিংস, ভ্যাট, হট-কী ও বিক্রয় হিস্ট্রি' : 'POS Settings, VAT, Hotkeys & Sales History'}
          >
            <SlidersHorizontal size={13} className="text-[#E2136E]" />
            <span>{isBengali ? 'পিওএস সেটিংস' : 'POS Settings'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Super Shop Main Two-Column Workflow ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ── Left Column: Friendly Search, Categories & Clean Product Catalog (7 cols) ── */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Friendly Omni-Search Bar (Direct Typing Enabled: No click needed!) */}
          <div className="relative">
            <div className="flex items-center h-13 rounded-2xl border-2 border-pink-400 bg-white shadow-xs focus-within:border-[#E2136E] focus-within:ring-3 focus-within:ring-pink-500/10 transition overflow-hidden">
              <div className="w-11 h-full flex items-center justify-center text-[#E2136E] shrink-0">
                <Search size={18} />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? 'পণ্য খুঁজুন বা সরাসরি বারকোড স্ক্যান করুন...' : 'Search product or scan barcode...'}
                className="w-full h-full pr-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />

              {/* Enter-to-Add Instant Product Preview Chip */}
              {enterMatchProduct ? (
                <button
                  type="button"
                  onClick={handleSearchEnterSubmit}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-[#E2136E] text-xs font-bold shrink-0 transition cursor-pointer mr-2 animate-in fade-in"
                  title="Enter চাপলে এই পণ্য কার্টে যোগ হবে"
                >
                  <span className="text-[10px] bg-[#E2136E] text-white px-1.5 py-0.5 rounded font-mono font-bold">↵ Enter</span>
                  <span className="max-w-[130px] truncate">{enterMatchProduct.name}</span>
                  <span className="text-slate-600 font-semibold font-mono">৳{poishaToTaka(enterMatchProduct.sellingPriceBasePoisha)}</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0 mr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isBengali ? 'টাইপ করুন' : 'Live'}</span>
                </div>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer mr-1"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handleSearchEnterSubmit}
                className="h-9 px-3 mr-1.5 rounded-xl bg-[#E2136E] hover:bg-pink-700 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
              >
                {isBengali ? 'যোগ ↵' : 'Add ↵'}
              </button>
            </div>
          </div>

          {/* World-Class Speed Keys (1-9 Hot Products Bar) */}
          {isSpeedBarVisible && (
            <div className="bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 p-2 rounded-2xl border border-amber-200/90 shadow-2xs">
              <div className="flex items-center justify-between px-1 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px]">
                    ⚡
                  </span>
                  <span className="text-[11px] font-black text-amber-950">
                    {isBengali ? 'হট-কী স্পিড বার (১-৯)' : 'Hot Speed Keys (1-9)'}
                  </span>
                  <span className="text-[10px] text-amber-800/80 font-medium hidden sm:inline">
                    — {isBengali ? '১-৯ চাপলে সঙ্গে সঙ্গে যোগ হবে' : 'Press 1-9 to ring up instantly'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHotProductsModalOpen(true)}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-2xs"
                  title="যে কোনো ক্যাটাগরির পণ্য দিয়ে ১-৯ স্লট সাজান"
                >
                  <Zap size={11} className="text-amber-600 fill-amber-500" />
                  <span>{isBengali ? '⚙️ সাজান' : '⚙️ Config'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                {speedProducts.map(({ slot, product }) => {
                  if (product) {
                    const isStockOut = (product.currentStockInBaseUnit ?? product.stock ?? 0) <= 0;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          if (isStockOut) {
                            toast.error(isBengali ? `[${slot}] "${product.name}" এর স্টক শেষ (Stock Out)!` : `[${slot}] "${product.name}" is out of stock!`, { icon: '🚫' });
                            return;
                          }
                          addToCart(product, false, 1);
                          toast.success(`[${slot}] ${product.name}`, { icon: '⚡' });
                        }}
                        className={`flex flex-col items-start p-1.5 rounded-xl border shadow-2xs transition text-left group active:scale-95 min-w-0 ${
                          isStockOut
                            ? 'bg-slate-100/90 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white hover:bg-amber-50 border-amber-200/90 hover:border-amber-400 hover:shadow-xs cursor-pointer'
                        }`}
                        title={`হট-কী [${slot}]: ${product.name} ${isStockOut ? '(স্টক শেষ)' : `(৳${poishaToTaka(product.sellingPriceBasePoisha)})`}`}
                      >
                        <div className="w-full flex items-center justify-between mb-0.5">
                          <span className={`w-4 h-4 rounded-md text-[10px] font-black flex items-center justify-center font-mono shrink-0 transition ${
                            isStockOut ? 'bg-slate-400 text-white' : 'bg-amber-500 group-hover:bg-[#E2136E] text-white'
                          }`}>
                            {slot}
                          </span>
                          <span className={`text-[10px] font-mono truncate ${isStockOut ? 'text-rose-600 font-bold' : 'font-black text-emerald-700'}`}>
                            {isStockOut ? (isBengali ? 'স্টক শেষ' : 'Out') : `৳${poishaToTaka(product.sellingPriceBasePoisha)}`}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold truncate w-full transition ${isStockOut ? 'text-slate-400' : 'text-slate-900 group-hover:text-[#E2136E]'}`}>
                          {product.name}
                        </span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setIsHotProductsModalOpen(true)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/60 hover:bg-white border border-dashed border-amber-300 hover:border-amber-500 text-slate-400 hover:text-amber-700 transition cursor-pointer group active:scale-95 min-h-[44px]"
                      title={`স্লট ${slot} খালি - পণ্য যুক্ত করতে ক্লিক করুন`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center font-mono">
                          {slot}
                        </span>
                        <Plus size={10} className="text-amber-500" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 group-hover:text-amber-700 truncate">
                        {isBengali ? 'খালি' : 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zero-Dropdown Tactile Category Rail */}
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
              className="hidden sm:flex w-7 h-8 items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shrink-0 cursor-pointer shadow-2xs active:scale-95"
              title="বামে স্ক্রোল করুন"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div 
              ref={categoryScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer border whitespace-nowrap active:scale-95 ${
                      isSelected
                        ? 'bg-[#E2136E] text-white border-[#E2136E] shadow-sm ring-2 ring-pink-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button 
              type="button"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
              className="hidden sm:flex w-7 h-8 items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shrink-0 cursor-pointer shadow-2xs active:scale-95"
              title="ডানে স্ক্রোল করুন"
            >
              <ChevronRight size={16} />
            </button>

            {/* Visual Category Matrix Board (F4) Button */}
            <button
              type="button"
              onClick={() => setIsCategoryBoardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-sm transition"
              title="ক্যাটাগরি বোর্ড খুলুন (F4)"
            >
              <Layers size={13} className="text-amber-400" />
              <span className="hidden sm:inline">{isBengali ? 'ক্যাটাগরি বোর্ড' : 'Category Board'}</span>
              <span className="text-[10px] bg-slate-800 text-amber-300 px-1 py-0.2 rounded font-mono font-bold">F4</span>
            </button>
          </div>

          {/* Active Filter Helper Bar (Only when a category is selected) */}
          {selectedCategory !== 'ALL' && (
            <div className="flex items-center justify-between bg-pink-50/90 border border-pink-200/90 px-3 py-1.5 rounded-xl text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                <span className="text-slate-500">{isBengali ? 'ফিল্টার:' : 'Filter:'}</span>
                <span className="text-[#E2136E] flex items-center gap-1 truncate">
                  <span>{categories.find((c) => c.id === selectedCategory)?.icon || '🏷️'}</span>
                  <span className="truncate">{categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}</span>
                </span>
                <span className="text-slate-500 font-semibold shrink-0">({sortedFilteredProducts.length} {isBengali ? 'টি পণ্য' : 'items'})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="text-[11px] font-bold text-[#E2136E] hover:text-pink-800 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-pink-200 shadow-2xs shrink-0 active:scale-95"
              >
                <X size={12} />
                <span>{isBengali ? 'সব পণ্য দেখান' : 'Reset'}</span>
              </button>
            </div>
          )}

          {/* Clean Controls Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                {visibleProducts.length} / {sortedFilteredProducts.length} {isBengali ? 'টি পণ্য' : 'Items'}
              </span>
              {sortedFilteredProducts.length > visibleProducts.length && (
                <span className="text-[10px] bg-pink-50 text-[#E2136E] border border-pink-200 px-1.5 py-0.5 rounded-md font-bold">
                  {isBengali ? 'ধাপে ধাপে' : 'Progressive'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#E2136E]"
              >
                <option value="FASTEST">{isBengali ? '⚡ জনপ্রিয় পণ্য' : 'Fastest First'}</option>
                <option value="NAME_ASC">{isBengali ? '🔤 নাম (A-Z)' : 'Name (A-Z)'}</option>
                <option value="PRICE_LOW">{isBengali ? '📉 কম দাম' : 'Price: Low'}</option>
                <option value="PRICE_HIGH">{isBengali ? '📈 বেশি দাম' : 'Price: High'}</option>
                <option value="STOCK_HIGH">{isBengali ? '📦 বেশি স্টক' : 'High Stock'}</option>
              </select>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('GRID')}
                  className={`p-1 px-2 rounded text-xs transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'GRID' ? 'bg-white text-[#E2136E] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="কার্ড গ্রিড ভিউ"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline text-[11px]">{isBengali ? 'গ্রিড' : 'Grid'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  className={`p-1 px-2 rounded text-xs transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'LIST' ? 'bg-white text-[#E2136E] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="হাই-স্পিড লিস্ট ভিউ"
                >
                  <List size={13} />
                  <span className="hidden sm:inline text-[11px]">{isBengali ? 'লিস্ট' : 'List'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clean, Non-Cluttered Product Catalog with Dynamic Full-Height Viewport */}
          <div 
            ref={catalogContainerRef}
            onScroll={handleCatalogScroll}
            className="space-y-3 h-[calc(100vh-230px)] min-h-[460px] overflow-y-auto pr-1 custom-scrollbar pb-10"
          >
            {groupedProducts.length === 0 || sortedFilteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                <Search size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">{isBengali ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {isBengali 
                    ? 'ইনভেন্টরিতে পণ্য যুক্ত করলে তা ক্যাটাগরি অনুসারে স্বয়ংক্রিয়ভাবে এখানে প্রদর্শিত হবে।' 
                    : 'Products added in inventory will automatically appear here by category.'}
                </p>
              </div>
            ) : (
              groupedProducts.map((group) => (
                <div key={group.groupKey} className="space-y-2">
                  {/* Clean Group Divider - Only shown when grouped mode is active */}
                  {isGrouped && selectedCategory === 'ALL' && (
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 pt-1 pb-0.5 border-b border-slate-200/80">
                      <span className="flex items-center gap-1.5">
                        <span>{group.icon}</span>
                        <span>{group.groupName}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">{group.items.length}টি</span>
                    </div>
                  )}

                  {/* GRID VIEW: High-Density Responsive Touch Tiles */}
                  {viewMode === 'GRID' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                      {group.items.map((p) => {
                        const isStockOut = (p.currentStockInBaseUnit ?? p.stock ?? 0) <= 0;
                        const hasBulk = p.isDualUnit || p.hasBulkUnit;
                        const isWeighable = p.isWeighable || p.baseUnit === 'কেজি';
                        const retailUnit = p.baseUnit || 'পিস';
                        const inCartItem = cart.find((item) => item.productId === p.id && !item.isBulk);
                        const inCartQty = inCartItem ? inCartItem.quantity : 0;

                        const handleCardClick = () => {
                          if (isStockOut) {
                            toast.error(isBengali ? `"${p.name}" এর স্টক শেষ (Stock Out)!` : `"${p.name}" is out of stock!`, { icon: '🚫' });
                            return;
                          }
                          if (isWeighable) {
                            setWeighingProduct(p);
                            setWeighQuantity('1.000');
                            setIsWeighModalOpen(true);
                          } else {
                            addToCart(p, false, 1);
                          }
                        };

                        return (
                          <div
                            key={p.id}
                            onClick={handleCardClick}
                            className={`rounded-2xl p-2.5 border transition-all flex flex-col justify-between group ${
                              isStockOut
                                ? 'opacity-60 grayscale cursor-not-allowed bg-slate-50/80 border-rose-200'
                                : inCartQty > 0
                                ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-2xs cursor-pointer active:scale-[0.98]'
                                : 'bg-white border-slate-200/90 hover:border-pink-400 hover:shadow-xs cursor-pointer active:scale-[0.98]'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="text-[10px] text-slate-400 font-bold truncate">
                                  {p.brand ? `${p.brand} • ` : ''}{p.category}
                                </span>
                                {isStockOut ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] shrink-0 shadow-2xs animate-pulse">
                                    {isBengali ? 'স্টক আউট' : 'Stock Out'}
                                  </span>
                                ) : inCartQty > 0 ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-black text-[9px] font-mono shrink-0 shadow-2xs">
                                    ✓ {inCartQty} {retailUnit}
                                  </span>
                                ) : null}
                              </div>
                              <h4
                                className={`font-bold text-xs ${isStockOut ? 'text-slate-400' : 'text-slate-900 group-hover:text-[#E2136E]'} line-clamp-2 leading-tight`}
                                title={p.name}
                              >
                                {p.name}
                              </h4>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-black text-slate-900 tabular-nums block">
                                  {formatCurrency(p.sellingPriceBasePoisha, { locale })}
                                  <span className="text-[10px] text-slate-500 font-bold ml-0.5">/{retailUnit}</span>
                                </span>
                                <span className={`text-[9px] font-medium block ${isStockOut ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  {isStockOut ? (isBengali ? 'মজুত: ০ (শেষ)' : 'Stock: 0') : `${isBengali ? 'স্টক: ' : 'Stock: '}${p.currentStockInBaseUnit ?? p.stock ?? 0}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {hasBulk && !isStockOut && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addToCart(p, true, 1);
                                      toast.success(`১ ${p.bulkUnitName || 'বস্তা'} কার্টে যোগ হয়েছে!`, { icon: '📦' });
                                    }}
                                    className="px-1.5 py-1 rounded-lg text-[9px] font-black bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition cursor-pointer active:scale-95"
                                    title={`১ ${p.bulkUnitName || 'বস্তা'} কার্টে যোগ করুন`}
                                  >
                                    +১{p.bulkUnitName || 'বস্তা'}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleCardClick}
                                  disabled={isStockOut}
                                  className={`px-2 py-1 rounded-xl text-[11px] font-black border transition flex items-center gap-0.5 ${
                                    isStockOut
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                      : inCartQty > 0
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs cursor-pointer active:scale-95'
                                      : 'bg-pink-50 group-hover:bg-[#E2136E] group-hover:text-white text-[#E2136E] border-pink-200 cursor-pointer active:scale-95'
                                  }`}
                                  title={isStockOut ? (isBengali ? 'স্টক শেষ' : 'Out of stock') : `১ ${retailUnit} কার্টে যোগ করুন`}
                                >
                                  {isStockOut ? (
                                    <span>{isBengali ? 'শেষ' : 'Out'}</span>
                                  ) : (
                                    <>
                                      {isWeighable ? <Scale size={11} /> : <Plus size={11} />}
                                      <span>{isWeighable ? 'কেজি' : '+১'}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* COMPACT HIGH-SPEED LIST VIEW */
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-2xs">
                      {group.items.map((p) => {
                        const isStockOut = (p.currentStockInBaseUnit ?? p.stock ?? 0) <= 0;
                        const hasBulk = p.isDualUnit || p.hasBulkUnit;
                        const isWeighable = p.isWeighable || p.baseUnit === 'কেজি';
                        const retailUnit = p.baseUnit || 'পিস';
                        const inCartItem = cart.find((item) => item.productId === p.id && !item.isBulk);
                        const inCartQty = inCartItem ? inCartItem.quantity : 0;

                        const handleCardClick = () => {
                          if (isStockOut) {
                            toast.error(isBengali ? `"${p.name}" এর স্টক শেষ (Stock Out)!` : `"${p.name}" is out of stock!`, { icon: '🚫' });
                            return;
                          }
                          if (isWeighable) {
                            setWeighingProduct(p);
                            setWeighQuantity('1.000');
                            setIsWeighModalOpen(true);
                          } else {
                            addToCart(p, false, 1);
                          }
                        };

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 transition flex items-center justify-between gap-3 group ${
                              isStockOut 
                                ? 'opacity-60 bg-slate-50/70' 
                                : inCartQty > 0 
                                ? 'bg-emerald-50/30' 
                                : 'hover:bg-pink-50/30'
                            }`}
                          >
                            <div className="min-w-0 flex-1 cursor-pointer" onClick={handleCardClick}>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-xs sm:text-sm truncate leading-tight ${isStockOut ? 'text-slate-400' : 'text-slate-900 group-hover:text-[#E2136E]'}`}>
                                  {p.name}
                                </h4>
                                {isStockOut ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white font-bold text-[10px] shrink-0 font-mono shadow-2xs animate-pulse">
                                    {isBengali ? 'স্টক আউট' : 'Stock Out'}
                                  </span>
                                ) : inCartQty > 0 ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 shrink-0 font-mono">
                                    কার্টে: {inCartQty} {retailUnit}
                                  </span>
                                ) : null}
                              </div>
                              <p className={`text-[10px] truncate mt-0.5 ${isStockOut ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
                                {p.brand ? `${p.brand} • ` : ''}{p.category} • {isStockOut ? (isBengali ? 'স্টক শেষ (০)' : 'Stock: 0') : `${isBengali ? 'স্টক: ' : 'Stock: '}${p.currentStockInBaseUnit ?? p.stock ?? 0} ${retailUnit}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-black text-xs sm:text-sm text-slate-900 tabular-nums">
                                {formatCurrency(p.sellingPriceBasePoisha, { locale })}
                                <span className="text-[10px] text-slate-500 font-bold ml-1">/ {retailUnit}</span>
                              </span>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {hasBulk && !isStockOut && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addToCart(p, true, 1);
                                      toast.success(`১ ${p.bulkUnitName || 'বস্তা'} কার্টে যোগ হয়েছে!`, { icon: '📦' });
                                    }}
                                    className="px-2 py-1 rounded-xl text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition cursor-pointer"
                                  >
                                    +১ {p.bulkUnitName || 'বস্তা'}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleCardClick}
                                  disabled={isStockOut}
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition flex items-center gap-1 ${
                                    isStockOut
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                      : inCartQty > 0
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs cursor-pointer active:scale-95'
                                      : 'bg-pink-50 hover:bg-pink-100 text-[#E2136E] border-pink-200 cursor-pointer active:scale-95'
                                  }`}
                                >
                                  {isStockOut ? (
                                    <span>{isBengali ? 'স্টক শেষ' : 'Out of Stock'}</span>
                                  ) : (
                                    <>
                                      {isWeighable ? <Scale size={12} /> : <Plus size={12} />}
                                      <span>{isWeighable ? '+কেজি' : `+১ ${retailUnit}`}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Progressive Loading: Tactile Load More Button */}
            {visibleProducts.length < sortedFilteredProducts.length && (
              <div className="pt-3 pb-2 text-center">
                <button
                  type="button"
                  onClick={() => setCatalogDisplayLimit((prev) => prev + 12)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-50 to-pink-100/70 hover:from-pink-100 hover:to-pink-200 text-[#E2136E] font-black text-xs border border-pink-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto active:scale-98"
                >
                  <span>⬇️</span>
                  <span>
                    {isBengali
                      ? `আরও ১২টি পণ্য লোড করুন (${visibleProducts.length} / ${sortedFilteredProducts.length}টি)`
                      : `Load 12 More Items (${visibleProducts.length} of ${sortedFilteredProducts.length})`}
                  </span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  {isBengali ? '💡 অথবা নিচে স্ক্রোল করলেই স্বয়ংক্রিয়ভাবে আরও পণ্য আসবে' : '💡 Or scroll down to automatically load more'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Clean, Modern, Clutter-Free Invoice Cart (5 cols) ── */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-md p-3.5 sm:p-4 flex flex-col justify-between lg:sticky lg:top-1 lg:h-[calc(100vh-140px)] min-h-[460px] overflow-hidden">
          
          {/* Top of Cart: Customer Selection */}
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart size={17} className="text-[#E2136E]" />
                <h3 className="font-black text-sm text-slate-900 leading-none">
                  {isBengali ? 'বিক্রয় চালান' : 'Invoice'}
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  ({cart.length} {isBengali ? 'পণ্য' : 'items'})
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  {isBengali ? 'মুছুন' : 'Clear'}
                </button>
              )}
            </div>

            {/* Searchable Customer Selector */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <SearchableCustomerSelect
                  customers={customers}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder={isBengali ? '👤 সাধারণ নগদ ক্রেতা বা কাস্টমার খুঁজুন...' : '👤 Walk-in or Choose Customer...'}
                  allowWalkIn={true}
                  isBengali={isBengali}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="px-2.5 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] text-xs font-bold border border-pink-200 transition cursor-pointer shrink-0"
                title="নতুন গ্রাহক"
              >
                + নতুন
              </button>
            </div>

            {selectedCustomer && selectedCustomer.currentDuePoisha > 0 && (
              <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 mb-2 flex items-center justify-between">
                <span>পূর্বের বকেয়া বাকি:</span>
                <span>{formatCurrency(selectedCustomer.currentDuePoisha, { locale })}</span>
              </div>
            )}
          </div>

          {/* Middle: Cart Line Items */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px] my-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-full">
                <ShoppingCart size={32} className="mb-2 text-pink-300 opacity-60" />
                <p className="text-xs font-bold text-slate-700">
                  {isBengali ? 'কার্ট খালি' : 'Cart is empty'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isBengali ? 'পণ্য বা হট-কি ক্লিক করে কার্টে যোগ করুন।' : 'Click items on the left to add.'}
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const lineGross = Math.round(Number(item.quantity) * Number(item.unitPricePoisha));
                const lineNet = Math.max(0, lineGross - (item.lineDiscountPoisha || 0));

                return (
                  <div
                    key={`${item.productId}_${item.isBulk}`}
                    className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate leading-snug">{item.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatCurrency(item.unitPricePoisha, { locale })}/{item.unitName}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.isBulk, item.quantity - (item.isWeighable ? 0.25 : 1))}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-9 text-center font-black text-xs tabular-nums text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.isBulk, item.quantity + (item.isWeighable ? 0.25 : 1))}
                        className="w-6 h-6 rounded bg-pink-100 hover:bg-pink-200 text-[#E2136E] font-black text-xs flex items-center justify-center transition cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Total & Trash */}
                    <div className="text-right min-w-[60px] shrink-0">
                      <span className="font-black text-xs text-slate-900 tabular-nums block">
                        {formatCurrency(lineNet, { locale })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.isBulk)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Docked Checkout: Clean, Spacious, Ultra-Easy to Understand */}
          <div className="pt-1.5 border-t border-slate-200 shrink-0 space-y-1.5">
            
            {/* Simple Subtotal & Bill Breakdown */}
            <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span>{isBengali ? 'আইটেম মোট:' : 'Subtotal:'}</span>
                <span className="font-bold tabular-nums text-slate-800">{formatCurrency(subtotalPoisha, { locale })}</span>
              </div>

              {/* Simple Clean Discount & VAT line */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>{isBengali ? 'ছাড় (৳):' : 'Discount:'}</span>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-14 text-right font-black px-1.5 py-0.5 rounded border border-slate-200 bg-white text-rose-600 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVatEnabled}
                    onChange={(e) => {
                      setIsVatEnabled(e.target.checked);
                      try {
                        localStorage.setItem(
                          `ledgerx_${activeTenant?.id}_pos_vat_config`,
                          JSON.stringify({ enabled: e.target.checked, rate: vatRate })
                        );
                      } catch(err) {}
                    }}
                    className="rounded text-[#E2136E] focus:ring-0"
                  />
                  <span>{isBengali ? `ভ্যাট ${vatRate}%` : `VAT ${vatRate}%`}</span>
                  {isVatEnabled && vatPoisha > 0 && (
                    <span className="font-bold tabular-nums text-slate-700">({formatCurrency(vatPoisha, { locale })})</span>
                  )}
                </label>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
                <span className="font-black text-sm text-slate-900">{isBengali ? 'মোট প্রদেয় বিল:' : 'Grand Total:'}</span>
                <span className="text-xl sm:text-2xl font-black text-[#E2136E] tabular-nums">
                  {formatCurrency(grandTotalPoisha, { locale })}
                </span>
              </div>
            </div>

            {/* Cart Out-of-Stock Protection Banner */}
            {cart.some((item) => {
              const p = products.find((x) => x.id === item.productId);
              return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
            }) && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                <span className="text-base shrink-0">⚠️</span>
                <span>{isBengali ? 'কার্টে স্টক আউট পণ্য রয়েছে! রসিদ কাটার আগে বাদ দিন।' : 'Cart contains out-of-stock items! Remove them before checkout.'}</span>
              </div>
            )}

            {/* Payment Mode Selector Tabs (Matches image & allows seamless selection) */}
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xs">💵</span>
                <span>{isBengali ? 'নগদ' : 'Cash'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('MFS')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  paymentMode === 'MFS'
                    ? 'bg-[#E2136E] text-white border-[#E2136E] shadow-2xs'
                    : 'bg-pink-50/70 hover:bg-pink-100 text-[#E2136E] border-pink-200'
                }`}
              >
                <span className="text-xs">📱</span>
                <span>{isBengali ? 'মোবাইল (F9)' : 'MFS (F9)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('BANK')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  paymentMode === 'BANK'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <span className="text-xs">🏛️</span>
                <span>{isBengali ? 'ব্যাংক (F10)' : 'Bank (F10)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('DUE')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  paymentMode === 'DUE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <span className="text-xs">📒</span>
                <span>{isBengali ? 'বাকি (F11)' : 'Due (F11)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                disabled={cart.length === 0 || cart.some((item) => {
                  const p = products.find((x) => x.id === item.productId);
                  return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
                })}
                className="py-1.5 px-1 rounded-xl text-[11px] font-bold border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40"
              >
                <span className="text-xs">⚖️</span>
                <span>{isBengali ? 'স্প্লিট (F8)' : 'Split (F8)'}</span>
              </button>
            </div>

            {/* Mode-Specific Sub-Panel */}
            {paymentMode === 'CASH' && (
              <div className="space-y-1.5 animate-in fade-in">
                {/* Cash Tender Notes & Calculator Toggle */}
                <div className="flex items-center justify-between text-[11px] px-0.5">
                  <span className="text-slate-500 font-semibold">{isBengali ? 'পরিশোধ: সম্পূর্ণ নগদ' : 'Full Cash Paid'}</span>
                  <button
                    type="button"
                    onClick={() => setIsCashTenderExpanded(!isCashTenderExpanded)}
                    className="text-[#E2136E] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{isCashTenderExpanded ? (isBengali ? 'ভাংতি হিসাব লুকান' : 'Hide Tender') : (isBengali ? 'ভাংতি হিসাব করুন ↵' : 'Calculate Tender ↵')}</span>
                  </button>
                </div>

                {isCashTenderExpanded && (
                  <div className="space-y-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => setTenderedTaka(String(poishaToTaka(grandTotalPoisha)))}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 transition shrink-0 cursor-pointer"
                      >
                        {isBengali ? 'হুবহু টাকা' : 'Exact'}
                      </button>
                      {[50, 100, 200, 500, 1000, 2000].map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => setTenderedTaka(String(note))}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition shrink-0 cursor-pointer"
                        >
                          ৳{note}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">৳</span>
                        <input
                          type="number"
                          value={tenderedTaka}
                          onChange={(e) => setTenderedTaka(e.target.value)}
                          placeholder={isBengali ? 'কাস্টমার দিয়েছে...' : 'Tendered Cash'}
                          className="w-full h-8.5 pl-5 pr-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#E2136E]"
                        />
                      </div>
                      <div className={`h-8.5 px-2.5 rounded-xl flex items-center justify-between font-black text-xs border ${
                        tenderedPoisha >= grandTotalPoisha && grandTotalPoisha > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : dueOnSalePoisha > 0 && selectedCustomerId
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        <span className="text-[10px]">
                          {tenderedPoisha >= grandTotalPoisha ? (isBengali ? 'ফেরত:' : 'Change:') : (isBengali ? 'বাকি:' : 'Due:')}
                        </span>
                        <span className="tabular-nums font-black text-xs">
                          {tenderedPoisha >= grandTotalPoisha && grandTotalPoisha > 0 ? formatCurrency(changePoisha, { locale }) : formatCurrency(dueOnSalePoisha, { locale })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Big Action Button for Cash */}
                <button
                  type="button"
                  onClick={() => handleFinalizeSale(tenderedPoisha > 0 && tenderedPoisha < grandTotalPoisha ? 'PARTIAL_CASH' : 'CASH')}
                  disabled={cart.length === 0 || cart.some((item) => {
                    const p = products.find((x) => x.id === item.productId);
                    return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
                  })}
                  className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  <Printer size={16} />
                  <span>{isBengali ? 'নগদ বিক্রয় ও রসিদ প্রিন্ট (Enter)' : 'Complete Cash Sale (Enter)'}</span>
                </button>
              </div>
            )}

            {paymentMode === 'MFS' && (
              <div className="space-y-1.5 animate-in fade-in">
                {/* Provider Selector Pills */}
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'BKASH', label: isBengali ? 'বিকাশ' : 'bKash', color: 'border-pink-300 text-[#E2136E] bg-pink-50', active: 'bg-[#E2136E] text-white border-[#E2136E]', icon: '🌸' },
                    { id: 'NAGAD', label: isBengali ? 'নগদ' : 'Nagad', color: 'border-orange-300 text-[#F7941D] bg-orange-50', active: 'bg-[#F7941D] text-white border-[#F7941D]', icon: '🟠' },
                    { id: 'ROCKET', label: isBengali ? 'রকেট' : 'Rocket', color: 'border-purple-300 text-[#8C3494] bg-purple-50', active: 'bg-[#8C3494] text-white border-[#8C3494]', icon: '🟣' },
                    { id: 'CELLFIN', label: isBengali ? 'সেলফিন' : 'CellFin', color: 'border-emerald-300 text-[#008037] bg-emerald-50', active: 'bg-[#008037] text-white border-[#008037]', icon: '🟢' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedMfsProvider(p.id)}
                      className={`py-1 rounded-xl text-[11px] font-black border transition flex items-center justify-center gap-1 cursor-pointer ${
                        selectedMfsProvider === p.id ? p.active : p.color
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                  <span>{isBengali ? `এমএফএস: ${selectedMfsProvider} এ জমা হবে` : `MFS Target: ${selectedMfsProvider}`}</span>
                  <button
                    type="button"
                    onClick={() => setIsMfsModalOpen(true)}
                    className="text-[#E2136E] font-bold hover:underline cursor-pointer"
                  >
                    {isBengali ? 'অন্যান্য ওয়ালেট...' : 'More wallets...'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFinalizeSale(selectedMfsProvider, null, `${selectedMfsProvider} Mobile Banking`)}
                  disabled={cart.length === 0 || cart.some((item) => {
                    const p = products.find((x) => x.id === item.productId);
                    return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
                  })}
                  className="w-full h-11 rounded-2xl bg-[#E2136E] hover:bg-pink-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  <Smartphone size={16} />
                  <span>{isBengali ? `${selectedMfsProvider} এ বিক্রয় সম্পন্ন ও প্রিন্ট (Enter)` : `Complete ${selectedMfsProvider} Sale`}</span>
                </button>
              </div>
            )}

            {paymentMode === 'BANK' && (
              <div className="space-y-1.5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedBankOption('CARD')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedBankOption === 'CARD'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    <CreditCard size={13} />
                    <span>{isBengali ? 'কার্ড সোয়াইপ (POS)' : 'Card Swipe'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBankOption('BANK_IBBL')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedBankOption === 'BANK_IBBL'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    <Landmark size={13} />
                    <span>{isBengali ? 'ব্যাংক একাউন্ট' : 'Bank Deposit'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                  <span>{isBengali ? 'ব্যাংক ট্রান্সফার বা কার্ড' : 'Commercial Bank / POS Terminal'}</span>
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(true)}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {isBengali ? 'ব্যাংক তালিকা...' : 'All banks...'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFinalizeSale(selectedBankOption === 'CARD' ? 'CARD' : 'BANK', null, selectedBankOption === 'CARD' ? 'পিওএস কার্ড মেশিন' : 'বাণিজ্যিক ব্যাংক হিসাব')}
                  disabled={cart.length === 0 || cart.some((item) => {
                    const p = products.find((x) => x.id === item.productId);
                    return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
                  })}
                  className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  <Landmark size={16} />
                  <span>{isBengali ? 'ব্যাংক/কার্ডে বিক্রয় সম্পন্ন ও প্রিন্ট (Enter)' : 'Complete Bank/Card Sale'}</span>
                </button>
              </div>
            )}

            {paymentMode === 'DUE' && (
              <div className="space-y-1.5 animate-in fade-in">
                {selectedCustomer ? (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">{selectedCustomer.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{selectedCustomer.phone || 'ফোন নেই'} • পূর্বের বাকি: ৳{poishaToTaka(selectedCustomer.currentDuePoisha ?? selectedCustomer.balancePoisha ?? 0)}</p>
                    </div>
                    <span className="text-amber-800 font-black text-xs">
                      +৳{poishaToTaka(grandTotalPoisha)} বাকি হবে
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center justify-between">
                    <span>⚠️ বাকির জন্য উপরে গ্রাহক নির্বাচন করুন!</span>
                    <button
                      type="button"
                      onClick={() => setIsNewCustomerModalOpen(true)}
                      className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      + নতুন গ্রাহক
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleFinalizeSale('DUE')}
                  disabled={cart.length === 0 || !selectedCustomerId || cart.some((item) => {
                    const p = products.find((x) => x.id === item.productId);
                    return (p ? (p.currentStockInBaseUnit ?? p.stock ?? 0) : 0) <= 0;
                  })}
                  className="w-full h-11 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  <Wallet size={16} />
                  <span>{isBengali ? 'বাকিতে বিক্রয় সংরক্ষণ করুন (Enter)' : 'Save as Due Sale'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Held Carts Modal ────────────────────── */}
      {isHeldCartsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PauseCircle size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm">
                  {isBengali ? 'হোল্ড করা বিল তালিকা' : 'Held Carts'}
                </h3>
              </div>
              <button onClick={() => setIsHeldCartsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={17} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
              {heldCarts.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400 font-semibold">
                  {isBengali ? 'বর্তমানে কোনো বিল হোল্ড করা নেই।' : 'No held carts.'}
                </p>
              ) : (
                heldCarts.map((h) => (
                  <div key={h.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{h.customerName}</p>
                      <p className="text-xs text-slate-500">
                        {h.itemCount} টি পণ্য • মোট: {formatCurrency(h.subtotalPoisha, { locale })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRecallCart(h)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <PlayCircle size={13} />
                        <span>{isBengali ? 'চালু' : 'Resume'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeldCarts((prev) => prev.filter((x) => x.id !== h.id))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Add Quick Customer Modal ──────────────────────────── */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
            <div className="px-5 py-3.5 bg-[#E2136E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus size={16} />
                <span>{isBengali ? 'নতুন গ্রাহক যোগ করুন' : 'Add Customer'}</span>
              </h3>
              <button onClick={() => setIsNewCustomerModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBengali ? 'গ্রাহকের নাম' : 'Name'} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="যেমন: মো: করিম হোসেন"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBengali ? 'মোবাইল নম্বর' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#E2136E] hover:bg-pink-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isBengali ? 'সংরক্ষণ ✓' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4.7. Weighable Product / Digital Scale Modal ────────────────── */}
      {isWeighModalOpen && weighingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Scale size={16} />
                <span>{isBengali ? 'ডিজিটাল স্কেল ওজন নির্বাচন' : 'Digital Scale Weight'}</span>
              </h3>
              <button onClick={() => setIsWeighModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <h4 className="font-black text-sm text-slate-900">{weighingProduct.name}</h4>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  দর: {formatCurrency(weighingProduct.sellingPriceBasePoisha, { locale })} / {weighingProduct.baseUnit || 'কেজি'}
                </p>
              </div>

              {/* Fast Super Shop Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {isBengali ? 'দ্রুত ওজন বাটন' : 'Fast Presets'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '২৫০ গ্রাম', val: '0.250' },
                    { label: '৫০০ গ্রাম', val: '0.500' },
                    { label: '৭৫০ গ্রাম', val: '0.750' },
                    { label: '১ কেজি', val: '1.000' },
                    { label: '১.৫ কেজি', val: '1.500' },
                    { label: '২ কেজি', val: '2.000' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setWeighQuantity(preset.val)}
                      className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        weighQuantity === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Weight Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBengali ? 'কাস্টম ওজন (কেজি)' : 'Custom Weight (Kg)'}
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={weighQuantity}
                  onChange={(e) => setWeighQuantity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-base font-black text-emerald-800 text-center focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Calculated Price */}
              <div className="flex items-center justify-between text-xs font-black text-slate-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <span>{isBengali ? 'মোট মূল্য:' : 'Total Price:'}</span>
                <span className="text-sm text-emerald-800 tabular-nums">
                  {formatCurrency(Math.round((parseFloat(weighQuantity) || 0) * (weighingProduct.sellingPriceBasePoisha || 0)), { locale })}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsWeighModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(weighQuantity);
                    if (val && val > 0) {
                      addToCart(weighingProduct, false, val);
                      toast.success(`${weighingProduct.name} (${val} কেজি) যোগ হয়েছে!`, { icon: '⚖️' });
                      setIsWeighModalOpen(false);
                    }
                  }}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isBengali ? 'কার্টে যোগ করুন ✓' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Keyboard Shortcuts Guide Modal (F1) ────────────────── */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                <span>{isBengali ? 'কীবোর্ড শর্টকাট' : 'Keyboard Shortcuts'}</span>
              </h3>
              <button onClick={() => setIsShortcutsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-2 text-xs">
              {[
                { key: 'সরাসরি টাইপিং', action: isBengali ? 'ক্লিক ছাড়াই সার্চ ও বারকোড টাইপ' : 'Direct Type without clicking' },
                { key: 'Enter', action: isBengali ? 'কার্টে যোগ অথবা নগদ বিক্রয় ও প্রিন্ট' : 'Add to Cart or Cash Sale & Print' },
                { key: 'F2', action: isBengali ? 'সার্চ বক্সে ফোকাস' : 'Focus Search Box' },
                { key: 'F4', action: isBengali ? 'সুপার ক্যাটাগরি বোর্ড' : 'Super Category Matrix' },
                { key: 'F6', action: isBengali ? 'বিল সাময়িক হোল্ড করুন' : 'Hold Cart' },
                { key: 'F7', action: isBengali ? 'হোল্ড বিল তালিকা' : 'Recall Held Carts' },
                { key: 'F8', action: isBengali ? 'স্প্লিট পেমেন্ট' : 'Split Payment' },
                { key: 'F9', action: isBengali ? 'বিকাশ পেমেন্ট' : 'bKash Payment' },
                { key: 'F11', action: isBengali ? 'বাকি খাতায় জমা' : 'Due Credit Sale' },
                { key: '১ - ৯', action: isBengali ? 'হট-কী স্পিড বার ডায়াল' : 'Speed Dial 1-9' },
                { key: 'Esc', action: isBengali ? 'ক্যাটাগরি বা সার্চ মুছুন / কার্ট ক্লিয়ার' : 'Clear Filter / Search / Cart' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">{item.action}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 font-mono font-bold text-slate-800 text-[11px]">
                    {item.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Split Payment Modal ────────────────────────────────── */}
      <SplitPaymentModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        grandTotalPoisha={grandTotalPoisha}
        customers={customers}
        onConfirmSale={(paymentDetails) => {
          const stockoutItem = cart.find((item) => {
            const prod = products.find((p) => p.id === item.productId);
            return (prod ? (prod.currentStockInBaseUnit ?? prod.stock ?? 0) : 0) <= 0;
          });
          if (stockoutItem) {
            toast.error(
              isBengali 
                ? `"${stockoutItem.name}" এর স্টক শেষ (Stock Out)! রসিদ কাটার আগে কার্ট থেকে বাদ দিন।` 
                : `"${stockoutItem.name}" is out of stock! Remove it from cart before completing sale.`
            );
            return;
          }
          const selectedCust = paymentDetails.customerId ? customers.find((c) => c.id === paymentDetails.customerId) : null;
          const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
          const enrichedItems = cart.map((item) => {
            const qty = Number(item.quantity) || 1;
            const gross = Math.round(qty * Number(item.unitPricePoisha || 0));
            const net = Math.max(0, gross - (item.lineDiscountPoisha || 0));
            return {
              ...item,
              lineTotalPoisha: item.lineTotalPoisha ?? net,
            };
          });

          const salePayload = {
            id: invoiceId,
            memoNumber: invoiceId,
            ...paymentDetails,
            customerPhone: selectedCust?.phone || '',
            previousDuePoisha: selectedCust?.currentDuePoisha ?? selectedCust?.balancePoisha ?? 0,
            containersDueCount: selectedCust?.containersDueCount || 0,
            cashierName: activeTenant?.role === 'CASHIER' ? 'ক্যাশিয়ার' : 'কাউন্টার ০১',
            items: enrichedItems,
            subtotalPoisha,
            discountPoisha: invoiceDiscountPoisha,
            vatPoisha,
            roundingPoisha: roundingAdjustmentPoisha,
            grandTotalPoisha,
            totalPoisha: grandTotalPoisha,
            paymentMode: 'SPLIT',
            timestamp: Date.now(),
          };
          recordPOSSale(salePayload);
          if (onOpenReceipt) {
            onOpenReceipt(salePayload);
          }
          clearCart();
          toast.success(isBengali ? 'পেমেন্ট সম্পন্ন হয়েছে!' : 'Sale recorded!', { icon: '🧾' });
        }}
      />

      {/* ── 7. Hot Products Configuration Modal ───────────────────── */}
      <HotProductsConfigModal
        isOpen={isHotProductsModalOpen}
        onClose={() => setIsHotProductsModalOpen(false)}
      />

      {/* ── 8. Super Category Matrix Board Modal (F4) ─────────────── */}
      {isCategoryBoardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <span>{isBengali ? '📂 সুপার ক্যাটাগরি বোর্ড' : '📂 Super Category Matrix'}</span>
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">F4</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBengali ? 'ক্যাটাগরি স্পর্শ করে দ্রুত পণ্য ফিল্টার করুন' : 'Touch any category card to filter items instantly'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryBoardOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Search for Categories */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder={isBengali ? 'ক্যাটাগরির নাম লিখে খুঁজুন...' : 'Search category name...'}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/10"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Cards Matrix */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredCategoriesForBoard.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCategoryBoardOpen(false);
                        searchInputRef.current?.focus();
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group active:scale-95 ${
                        isSelected
                          ? 'bg-pink-50/90 border-[#E2136E] ring-2 ring-[#E2136E]/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#E2136E] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {count} {isBengali ? 'টি' : ''}
                        </span>
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#E2136E]' : 'text-slate-900'}`}>
                          {cat.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {count > 0 ? (isBengali ? 'মজুত পণ্য রয়েছে' : 'In stock') : (isBengali ? 'পণ্য নেই' : 'Empty')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredCategoriesForBoard.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  {isBengali ? 'কোনো ক্যাটাগরি পাওয়া যায়নি' : 'No matching categories found'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <span className="font-semibold">
                {categories.length} {isBengali ? 'টি ক্যাটাগরি' : 'categories'} • {products.length} {isBengali ? 'টি মোট পণ্য' : 'total items'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setIsCategoryBoardOpen(false);
                }}
                className="text-xs font-bold text-[#E2136E] hover:underline cursor-pointer"
              >
                {isBengali ? 'সব পণ্য দেখান (Reset)' : 'Show All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MFS Quick Pay Modal ── */}
      {isMfsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E2136E] flex items-center justify-center shadow-2xs">
                  <Smartphone size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {isBengali ? 'মোবাইল ব্যাংকিং পেমেন্ট (MFS)' : 'Mobile Banking Payment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'কোন ওয়ালেটে টাকা জমা হবে নির্বাচন করুন' : 'Select receiving MFS wallet'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMfsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-100 mb-4 text-center">
              <span className="text-xs text-slate-500 font-bold uppercase">{isBengali ? 'পরিশোধযোগ্য বিল' : 'Payable Amount'}</span>
              <p className="text-2xl font-black text-[#E2136E] mt-0.5 tabular-nums">
                {formatCurrency(grandTotalPoisha, { locale })}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {mfsRegisters.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 font-semibold text-center mb-1">
                    {isBengali ? 'পেমেন্ট চ্যানেল নির্বাচন করুন:' : 'Select receiving MFS channel:'}
                  </p>
                  {[
                    { id: 'bkash_direct', provider: 'BKASH', name: isBengali ? 'বিকাশ পার্সোনাল / মার্চেন্ট' : 'bKash Personal / Merchant', icon: '🌸', color: 'border-pink-200 hover:border-pink-500 hover:bg-pink-50/40 text-[#E2136E]' },
                    { id: 'nagad_direct', provider: 'NAGAD', name: isBengali ? 'নগদ একাউন্ট' : 'Nagad Account', icon: '🟠', color: 'border-orange-200 hover:border-orange-500 hover:bg-orange-50/40 text-[#F7941D]' },
                    { id: 'rocket_direct', provider: 'ROCKET', name: isBengali ? 'রকেট একাউন্ট' : 'Rocket Account', icon: '🟣', color: 'border-purple-200 hover:border-purple-500 hover:bg-purple-50/40 text-[#8C3494]' },
                    { id: 'cellfin_direct', provider: 'CELLFIN', name: isBengali ? 'ইসলামী ব্যাংক সেলফিন' : 'IBBL CellFin', icon: '🟢', color: 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-[#008037]' },
                  ].map((chan) => (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => handleFinalizeSale(chan.provider, chan.id, chan.name)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer active:scale-98 bg-white shadow-2xs ${chan.color}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{chan.icon}</span>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{chan.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{isBengali ? 'সরাসরি ওয়ালেট পেমেন্ট' : 'Direct Wallet Payment'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                        {isBengali ? 'পেমেন্ট' : 'Pay'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                mfsRegisters.map((reg) => {
                  const id = reg.id.toLowerCase();
                  const isBkash = id.includes('bkash');
                  const isNagad = id.includes('nagad');
                  const isRocket = id.includes('rocket');
                  const isCellfin = id.includes('cellfin');

                  const brandColor = isBkash ? 'border-pink-200 hover:border-pink-500 hover:bg-pink-50/40 text-[#E2136E]' :
                    isNagad ? 'border-orange-200 hover:border-orange-500 hover:bg-orange-50/40 text-[#F7941D]' :
                    isRocket ? 'border-purple-200 hover:border-purple-500 hover:bg-purple-50/40 text-[#8C3494]' :
                    isCellfin ? 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-[#008037]' :
                    'border-blue-200 hover:border-blue-500 hover:bg-blue-50/40 text-[#004899]';

                  const icon = isBkash ? '🌸' : isNagad ? '🟠' : isRocket ? '🟣' : isCellfin ? '🟢' : '🔵';

                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => handleFinalizeSale(reg.provider || (isBkash ? 'BKASH' : isNagad ? 'NAGAD' : isRocket ? 'ROCKET' : 'MFS'), reg.id, reg.name)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer active:scale-98 bg-white shadow-2xs ${brandColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{reg.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{reg.walletNumber || 'মার্চেন্ট একাউন্ট'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 block mb-1">
                          {reg.walletType || 'মার্চেন্ট'}
                        </span>
                        <span className="text-xs font-black text-slate-700">
                          ৳{poishaToTaka(reg.balancePoisha || 0)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bank & Card Quick Pay Modal ── */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                  <Landmark size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {isBengali ? 'ব্যাংক ট্রান্সফার / কার্ড পেমেন্ট' : 'Bank & Card Payment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'কোন ব্যাংক অ্যাকাউন্টে জমা হবে নির্বাচন করুন' : 'Select receiving bank account'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBankModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 mb-4 text-center">
              <span className="text-xs text-slate-500 font-bold uppercase">{isBengali ? 'পরিশোধযোগ্য বিল' : 'Payable Amount'}</span>
              <p className="text-2xl font-black text-indigo-700 mt-0.5 tabular-nums">
                {formatCurrency(grandTotalPoisha, { locale })}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {bankRegisters.length === 0 && (
                <div className="space-y-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleFinalizeSale('BANK', 'bank_direct', 'সরাসরি ব্যাংক ডিপোজিট')}
                    className="w-full p-3.5 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition flex items-center justify-between cursor-pointer active:scale-98 bg-white shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                        🏛️
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">
                          {isBengali ? 'বাণিজ্যিক ব্যাংক ট্রান্সফার' : 'Commercial Bank Transfer'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {isBengali ? 'ইসলামী ব্যাংক / ব্র্যাক / ডাচ-বাংলা' : 'Direct Bank Deposit'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      {isBengali ? 'ব্যাংক' : 'Bank'}
                    </span>
                  </button>
                </div>
              )}

              {bankRegisters.map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleFinalizeSale('BANK', reg.id, reg.name)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition flex items-center justify-between cursor-pointer active:scale-98 bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                      🏦
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">{reg.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {reg.branch ? `${reg.branch} শাখা • ` : ''}
                        {reg.accountNumber ? `••••${reg.accountNumber.slice(-4)}` : 'বাণিজ্যিক হিসাব'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 block mb-1">
                      {reg.accountType || 'চলতি হিসাব'}
                    </span>
                    <span className="text-xs font-black text-slate-700">
                      ৳{poishaToTaka(reg.balancePoisha || 0)}
                    </span>
                  </div>
                </button>
              ))}

              {/* Direct POS Card Machine Option */}
              <button
                type="button"
                onClick={() => handleFinalizeSale('CARD', bankRegisters[0]?.id || 'bank_ibbl', 'কার্ড পস মেশিন (POS Card Machine)')}
                className="w-full p-3.5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex items-center justify-between cursor-pointer active:scale-98 bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                    💳
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      {isBengali ? 'পিওএস কার্ড মেশিন (Visa/Mastercard)' : 'Card POS Swipe (Visa/MC)'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBengali ? 'যেকোনো ডেবিট / ক্রেডিট কার্ড সোয়াইপ' : 'Instant POS terminal swipe'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {isBengali ? 'সোয়াইপ' : 'Card'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Terminal Settings & Quick Management Modal */}
      <POSSettingsModal
        isOpen={isPOSSettingsOpen}
        onClose={() => setIsPOSSettingsOpen(false)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenHeldCarts={() => setIsHeldCartsModalOpen(true)}
        onOpenHotProducts={() => setIsHotProductsModalOpen(true)}
        vatRate={vatRate}
        setVatRate={setVatRate}
        isVatEnabled={isVatEnabled}
        setIsVatEnabled={setIsVatEnabled}
        isRoundingEnabled={isRoundingEnabled}
        setIsRoundingEnabled={setIsRoundingEnabled}
        isSpeedBarVisible={isSpeedBarVisible}
        setIsSpeedBarVisible={(val) => {
          setIsSpeedBarVisible(val);
          try {
            localStorage.setItem(`ledgerx_${activeTenant?.id}_pos_show_speedbar`, String(val));
          } catch(e) {}
        }}
        speedProducts={speedProducts}
        onSelectSpeedProduct={(product) => {
          setIsPOSSettingsOpen(false);
          const stock = product.currentStockInBaseUnit ?? product.stock ?? 0;
          if (stock <= 0) {
            toast.error(isBengali ? `"${product.name}" এর স্টক শেষ (Stock Out)!` : `"${product.name}" is out of stock!`);
            return;
          }
          addToCart(product, false, 1);
          toast.success(`${product.name} কার্টে যোগ হয়েছে`, { icon: '⚡' });
        }}
      />

      {/* POS Sales History & Invoices Modal */}
      <POSHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onReprintThermal={(sale) => {
          setIsHistoryModalOpen(false);
          if (onOpenReceipt) onOpenReceipt(sale);
        }}
        onReprintMushak={(sale) => {
          setIsHistoryModalOpen(false);
          if (onOpenReceipt) onOpenReceipt({ ...sale, forceMushak: true });
        }}
      />
    </div>
  );
}
