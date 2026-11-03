import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import HoldToConfirm from '../components/HoldToConfirm';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Trash2,
  Barcode,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Coins,
  Percent,
  Edit3,
  LayoutGrid,
  List,
  PauseCircle,
  PlayCircle,
  Clock,
  RotateCcw,
  Package,
  ChevronRight,
  UserPlus,
  Receipt,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Check,
  Phone,
  BarChart3,
  ChevronDown,
  Printer,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function PageQuickSale() {
  const {
    language,
    products,
    customers,
    addCustomer,
    balances,
    transactions,
    recordSale,
    navigateTo,
    showToast,
    registerBackHandler,
    triggerCelebration,
  } = useMobileApp();

  const isBn = language === 'bn';

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [cart, setCart] = useState({}); // { [prodId]: qty }
  const [customItems, setCustomItems] = useState([]); // Array of custom-added items { id, nameBn, nameEn, price, qty }
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // High-performance virtualized chunking for thousands of catalog items
  const [visibleLimit, setVisibleLimit] = useState(24);

  // Item-level negotiated unit price overrides in cart
  const [itemPriceOverrides, setItemPriceOverrides] = useState({}); // { [prodId]: customUnitPrice }
  const [priceEditItem, setPriceEditItem] = useState(null); // { id, name, originalPrice, currentPrice }
  const [priceEditInput, setPriceEditInput] = useState('');

  // Searchable Customer Drawer & Inline Customer Creation
  const [showCustomerSearchDrawer, setShowCustomerSearchDrawer] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [visibleCustomerCount, setVisibleCustomerCount] = useState(30);

  const [showInlineAddCustomer, setShowInlineAddCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    openingDue: '',
    address: '',
  });

  // Today's POS Sales Counter & Reconciliation Drawer
  const [showDailySummaryDrawer, setShowDailySummaryDrawer] = useState(false);

  // Discount state with % or ৳ toggle
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [discountVal, setDiscountVal] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ'); // 'নগদ ক্যাশ' | 'বাকি খাতা' | 'বিকাশ কিউআর' | 'ব্যাংক কার্ড'
  const [cashReceived, setCashReceived] = useState('');
  const [note, setNote] = useState('');

  // Animation states
  const [flyingChips, setFlyingChips] = useState({}); // { [prodId]: 'plus' | 'minus' }
  const [cartBouncing, setCartBouncing] = useState(false);

  // Modals & Drawers state (Declared before useEffect to avoid TDZ ReferenceError)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCheckoutDrawer, setShowCheckoutDrawer] = useState(false);
  const [showParkedDrawer, setShowParkedDrawer] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState({ name: '', price: '', qty: '1' });
  const [keypadItem, setKeypadItem] = useState(null); // { id, name, qty }
  const [keypadInput, setKeypadInput] = useState('');

  // POS Layout Switcher ('grid' | 'list')
  const [viewLayout, setViewLayout] = useState('grid');

  // Parked / Hold Sales persistence
  const [parkedSales, setParkedSales] = useState(() => {
    try {
      const saved = localStorage.getItem('ledgerx_pos_parked_sales');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const saveParkedSales = (list) => {
    setParkedSales(list);
    try {
      localStorage.setItem('ledgerx_pos_parked_sales', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // ── Hardware Back Button Interceptor for All Modals/Drawers ──────────────
  useEffect(() => {
    if (
      showBarcodeScanner ||
      keypadItem ||
      showCustomItemModal ||
      showCheckoutDrawer ||
      showParkedDrawer ||
      showCustomerSearchDrawer ||
      showInlineAddCustomer ||
      showDailySummaryDrawer ||
      priceEditItem
    ) {
      return registerBackHandler('quicksale-drawers', () => {
        if (showInlineAddCustomer) {
          setShowInlineAddCustomer(false);
          return true;
        }
        if (priceEditItem) {
          setPriceEditItem(null);
          return true;
        }
        if (showCustomerSearchDrawer) {
          setShowCustomerSearchDrawer(false);
          return true;
        }
        if (showDailySummaryDrawer) {
          setShowDailySummaryDrawer(false);
          return true;
        }
        if (showBarcodeScanner) {
          setShowBarcodeScanner(false);
          return true;
        }
        if (showParkedDrawer) {
          setShowParkedDrawer(false);
          return true;
        }
        if (keypadItem) {
          setKeypadItem(null);
          return true;
        }
        if (showCustomItemModal) {
          setShowCustomItemModal(false);
          return true;
        }
        if (showCheckoutDrawer) {
          setShowCheckoutDrawer(false);
          return true;
        }
        return false;
      });
    }
  }, [
    showBarcodeScanner,
    keypadItem,
    showCustomItemModal,
    showCheckoutDrawer,
    showParkedDrawer,
    showCustomerSearchDrawer,
    showInlineAddCustomer,
    showDailySummaryDrawer,
    priceEditItem,
    registerBackHandler,
  ]);

  // Cart operations
  const addItem = (id) => {
    haptics.add();
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    // Trigger visual flying chip animation
    setFlyingChips(prev => ({ ...prev, [id]: 'plus' }));
    setTimeout(() => {
      setFlyingChips(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 600);

    // Trigger cart bubble bounce
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 360);
  };

  const removeItem = (id) => {
    haptics.remove();
    setCart(prev => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: cur - 1 };
    });

    // Trigger visual floating minus animation
    setFlyingChips(prev => ({ ...prev, [id]: 'minus' }));
    setTimeout(() => {
      setFlyingChips(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 500);
  };

  const clearCart = () => {
    haptics.warning();
    setCart({});
    setCustomItems([]);
    setItemPriceOverrides({});
    setShowCheckoutDrawer(false);
  };

  // Add custom loose product to cart
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newCustomItem.name.trim() || Number(newCustomItem.price) <= 0) return;

    haptics.add();
    const customId = `custom-${Date.now()}`;
    const item = {
      id: customId,
      nameBn: newCustomItem.name,
      nameEn: newCustomItem.name,
      price: Number(newCustomItem.price),
      qty: Math.max(1, Number(newCustomItem.qty || 1)),
      unit: 'কেজি/ইউনিট',
      category: 'খোলা পণ্য',
      isCustom: true,
    };

    setCustomItems(prev => [item, ...prev]);
    setNewCustomItem({ name: '', price: '', qty: '1' });
    setShowCustomItemModal(false);

    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 360);
  };

  const removeCustomItem = (id) => {
    haptics.remove();
    setCustomItems(prev => prev.filter(i => i.id !== id));
  };

  // Direct Keypad Qty Save
  const handleSaveKeypadQty = (e) => {
    e.preventDefault();
    const newQty = parseInt(keypadInput, 10);
    if (!keypadItem) return;

    if (isNaN(newQty) || newQty <= 0) {
      setCart(prev => {
        const next = { ...prev };
        delete next[keypadItem.id];
        return next;
      });
    } else {
      setCart(prev => ({ ...prev, [keypadItem.id]: newQty }));
    }

    haptics.tap();
    setKeypadItem(null);
  };

  // Save Item Price Override (Negotiated / Wholesale Rate)
  const handleSavePriceEdit = (e) => {
    e.preventDefault();
    const newPrice = Number(priceEditInput);
    if (!priceEditItem || isNaN(newPrice) || newPrice < 0) return;
    setItemPriceOverrides(prev => ({ ...prev, [priceEditItem.id]: newPrice }));
    setPriceEditItem(null);
    haptics.success();
    showToast(isBn ? `রেট নির্ধারিত: ৳${newPrice}` : `Unit price set: BDT ${newPrice}`, 'success');
  };

  // Inline Add Customer right from POS without leaving screen
  const handleCreateCustomerInline = (e) => {
    e.preventDefault();
    if (!newCustomerData.name.trim() || !newCustomerData.phone.trim()) return;
    haptics.success();
    const newCust = {
      nameBn: newCustomerData.name.trim(),
      nameEn: newCustomerData.name.trim(),
      phone: newCustomerData.phone.trim(),
      openingDue: Number(newCustomerData.openingDue || 0),
      address: newCustomerData.address.trim() || 'ঢাকা',
      creditLimit: 15000,
    };
    if (addCustomer) {
      addCustomer(newCust);
    }
    const createdId = newCust.id || `cust-${Date.now().toString().slice(-4)}`;
    setSelectedCustomerId(createdId);
    setShowInlineAddCustomer(false);
    setShowCustomerSearchDrawer(false);
    setNewCustomerData({ name: '', phone: '', openingDue: '', address: '' });
    showToast(isBn ? `নতুন গ্রাহক যুক্ত ও নির্বাচিত: ${newCust.nameBn}` : `Customer created & selected: ${newCust.nameBn}`, 'success');
  };

  // Park / Hold Current Sale Engine
  const parkCurrentSale = () => {
    if (cartItems.length === 0) {
      showToast(isBn ? 'হোল্ড করার জন্য কোনো আইটেম নেই' : 'No items in cart to park', 'warning');
      return;
    }
    const customerDisplayName = selectedCustomer
      ? (isBn ? selectedCustomer.nameBn : selectedCustomer.nameEn)
      : (isBn ? 'সাধারণ খুচরা ক্রেতা' : 'Walk-in Cash Customer');

    const newParked = {
      id: `parked-${Date.now()}`,
      time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US'),
      cart: { ...cart },
      customItems: [...customItems],
      itemPriceOverrides: { ...itemPriceOverrides },
      selectedCustomerId,
      customerName: customerDisplayName,
      itemCount: totalItemCount,
      total,
      discountType,
      discountVal,
      note,
    };

    const updated = [newParked, ...parkedSales];
    saveParkedSales(updated);
    setCart({});
    setCustomItems([]);
    setItemPriceOverrides({});
    setDiscountVal(0);
    setNote('');
    setShowCheckoutDrawer(false);
    haptics.success();
    soundbox.playCashSound?.();
    showToast(
      isBn ? `অর্ডার হোল্ড করা হয়েছে (#${updated.length} সংরক্ষিত)` : `Sale parked (#${updated.length} held)`,
      'success'
    );
  };

  const restoreParkedSale = (parkedId) => {
    const target = parkedSales.find(p => p.id === parkedId);
    if (!target) return;

    if (cartItems.length > 0) {
      const autoParked = {
        id: `parked-${Date.now()}`,
        time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US'),
        cart: { ...cart },
        customItems: [...customItems],
        itemPriceOverrides: { ...itemPriceOverrides },
        selectedCustomerId,
        customerName: selectedCustomer ? (isBn ? selectedCustomer.nameBn : selectedCustomer.nameEn) : (isBn ? 'নগদ ক্রেতা' : 'Walk-in'),
        itemCount: totalItemCount,
        total,
        discountType,
        discountVal,
        note,
      };
      saveParkedSales([autoParked, ...parkedSales.filter(p => p.id !== parkedId)]);
    } else {
      saveParkedSales(parkedSales.filter(p => p.id !== parkedId));
    }

    setCart(target.cart || {});
    setCustomItems(target.customItems || []);
    setItemPriceOverrides(target.itemPriceOverrides || {});
    setSelectedCustomerId(target.selectedCustomerId || '');
    setDiscountType(target.discountType || 'fixed');
    setDiscountVal(target.discountVal || 0);
    setNote(target.note || '');
    setShowParkedDrawer(false);
    haptics.success();
    showToast(isBn ? 'হোল্ড করা সেল রিস্টোর হয়েছে!' : 'Parked sale restored!', 'success');
  };

  const deleteParkedSale = (parkedId) => {
    haptics.warning();
    const updated = parkedSales.filter(p => p.id !== parkedId);
    saveParkedSales(updated);
    showToast(isBn ? 'হোল্ড সেল তালিকা থেকে মোছা হয়েছে' : 'Parked sale deleted', 'info');
  };

  // Real Camera Barcode Scanner Trigger
  const handleBarcodeScan = () => {
    haptics.tap();
    setShowBarcodeScanner(true);
  };

  // Barcode Detected Callback (Real Scanner / Chip / Manual Input)
  const handleBarcodeDetected = (product, barcode) => {
    if (product && product.id && !product.notFound) {
      addItem(product.id);
      setCartBouncing(true);
      setTimeout(() => setCartBouncing(false), 360);
      showToast(
        isBn
          ? `পণ্য স্ক্যান সম্পন্ন: ${product.nameBn || product.nameEn} (বারকোড: ${barcode})`
          : `Scanned & Added: ${product.nameEn || product.nameBn} (Barcode: ${barcode})`,
        'success'
      );
    } else {
      showToast(
        isBn
          ? `বারকোড #${barcode} ক্যাটালগে পাওয়া যায়নি`
          : `Barcode #${barcode} not found in catalog`,
        'warning'
      );
    }
  };

  // ── Hardware / Bluetooth Barcode Gun Scanner Listener ───────────────────
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  useEffect(() => {
    let timeout;
    const handleKeyDown = (e) => {
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      if (inInput) {
        if (e.key === 'Enter' && search.trim() && filteredProducts.length > 0) {
          e.preventDefault();
          addItem(filteredProducts[0].id);
          setSearch('');
          return;
        }
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          const found = products.find(
            p => p.id === barcodeBuffer.trim() || (p.barcode && p.barcode.trim() === barcodeBuffer.trim())
          );
          if (found) {
            addItem(found.id);
            soundbox.playCashSound?.();
            showToast(
              isBn
                ? `বারকোড স্ক্যান সম্পন্ন: ${found.nameBn || found.nameEn}`
                : `Barcode Scanned: ${found.nameEn || found.nameBn}`,
              'success'
            );
          } else {
            showToast(
              isBn ? `বারকোড #${barcodeBuffer} পাওয়া যায়নি` : `Barcode #${barcodeBuffer} not found`,
              'warning'
            );
          }
        }
        setBarcodeBuffer('');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcodeBuffer(prev => prev + e.key);
        clearTimeout(timeout);
        timeout = setTimeout(() => setBarcodeBuffer(''), 120);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcodeBuffer, products, search, isBn, showToast]);

  // Merge regular catalog items + custom items (with negotiated price overrides)
  const catalogCartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find(prod => prod.id === id);
      if (!p) return null;
      const effectivePrice = itemPriceOverrides[id] !== undefined ? itemPriceOverrides[id] : p.price;
      return {
        ...p,
        qty,
        price: effectivePrice,
        originalPrice: p.price,
        isCustomRate: itemPriceOverrides[id] !== undefined && itemPriceOverrides[id] !== p.price,
      };
    })
    .filter(Boolean);

  const cartItems = [...catalogCartItems, ...customItems];
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Discount computation
  const calculatedDiscount =
    discountType === 'percent'
      ? Math.round((subtotal * Math.min(100, Math.max(0, Number(discountVal || 0)))) / 100)
      : Math.min(subtotal, Math.max(0, Number(discountVal || 0)));

  const total = Math.max(0, subtotal - calculatedDiscount);

  // Change / Due Calculations for Cash
  const numCashReceived = cashReceived === '' ? total : Number(cashReceived);
  const changeToReturn = Math.max(0, numCashReceived - total);
  const dueRemaining = Math.max(0, total - numCashReceived);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerCreditLimit = selectedCustomer ? (selectedCustomer.creditLimit || 15000) : 0;
  const customerCurrentDue = selectedCustomer ? Number(selectedCustomer.dueAmount || 0) : 0;
  const customerAvailableCredit = Math.max(0, customerCreditLimit - customerCurrentDue);

  // Categories
  const categories = [
    { id: 'all', labelBn: 'সকল পণ্য', labelEn: 'All' },
    { id: 'চাল ও ডাল', labelBn: 'চাল ও ডাল', labelEn: 'Rice & Grains' },
    { id: 'তেল ও ঘি', labelBn: 'তেল ও ঘি', labelEn: 'Oils & Ghee' },
    { id: 'মসলা', labelBn: 'মসলা', labelEn: 'Spices' },
    { id: 'চা ও চিনি', labelBn: 'চা ও চিনি', labelEn: 'Tea & Sugar' },
  ];

  // Ultra-Fast Memoized Product Search across thousands of records
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCat !== 'all') {
      list = list.filter(p => p.category === selectedCat);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        (p.nameBn || '').toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q) ||
        (p.barcode || '').includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        String(p.price || '').includes(q)
      );
    }
    return list;
  }, [products, selectedCat, search]);

  useEffect(() => {
    setVisibleLimit(24);
  }, [search, selectedCat]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleLimit);
  }, [filteredProducts, visibleLimit]);

  // Customer List filtering for thousands of customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const q = customerSearchQuery.trim().toLowerCase();
    return (customers || []).filter(c =>
      (c.nameBn || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  }, [customers, customerSearchQuery]);

  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCustomerCount);
  }, [filteredCustomers, visibleCustomerCount]);

  // Today's Sales invoices for reconciliation
  const todaySalesList = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (transactions || []).filter(t => t.type === 'sale' && (t.date === today || t.timestamp?.includes('আজ')));
  }, [transactions]);

  const handleCheckout = () => {
    if (total <= 0) return;

    let finalPaid = total;
    let finalDue = 0;

    if (paymentMethod === 'বাকি খাতা') {
      finalPaid = 0;
      finalDue = total;
    } else if (paymentMethod === 'নগদ ক্যাশ') {
      if (numCashReceived < total) {
        finalPaid = numCashReceived;
        finalDue = dueRemaining;
      } else {
        finalPaid = total;
        finalDue = 0;
      }
    }

    haptics.success();

    recordSale({
      customerId: selectedCustomerId || null,
      customerName: selectedCustomer
        ? (isBn ? selectedCustomer.nameBn : selectedCustomer.nameEn)
        : (isBn ? 'সাধারণ খুচরা ক্রেতা' : 'Walk-in Cash Customer'),
      items: cartItems,
      totalAmount: total,
      paidAmount: finalPaid,
      dueAmount: finalDue,
      paymentMethod,
      note,
    });

    setShowCheckoutDrawer(false);
    clearCart();

    const customerDisplayName = selectedCustomer
      ? (isBn ? selectedCustomer.nameBn : selectedCustomer.nameEn)
      : (isBn ? 'সাধারণ খুচরা ক্রেতা' : 'Walk-in Cash Customer');

    if (triggerCelebration) {
      triggerCelebration({
        type: 'sale',
        amount: total,
        partyName: customerDisplayName,
        partyPhone: selectedCustomer?.phone || '',
        titleBn: 'বিক্রয় সফল হয়েছে!',
        titleEn: 'Sale Completed Successfully!',
        subtitleBn: 'স্টক সমন্বিত ও ডিজিটাল রসিদ প্রস্তুত',
        subtitleEn: 'Stock synchronized & digital receipt ready',
        onViewReceipt: () => navigateTo('receipt'),
      });
    } else {
      navigateTo('receipt');
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: cartItems.length > 0 ? 84 : 24, position: 'relative' }}>
      {/* bKash Pink App Header */}
      <SubpageHeader
        titleBn="দ্রুত বিক্রয় ও পিওএস কাউন্টার"
        titleEn="Quick POS Sale Terminal"
        subtitleBn="বারকোড স্ক্যান, কার্ট ও ক্যাশআউট"
        subtitleEn="Fast checkout & barcode sales"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {parkedSales.length > 0 && (
              <button
                onClick={() => {
                  setShowParkedDrawer(true);
                  haptics.tap();
                }}
                className="lx-touch-btn"
                title={isBn ? 'সংরক্ষিত হোল্ড সেল দেখুন' : 'View Held Sales'}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: 10,
                  padding: '4px 8px',
                  color: '#FFFFFF',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Clock size={12} />
                <span>{isBn ? `হোল্ড (${parkedSales.length})` : `Held (${parkedSales.length})`}</span>
              </button>
            )}

            {cartItems.length > 0 && (
              <button
                onClick={parkCurrentSale}
                className="lx-touch-btn"
                title={isBn ? 'চলতি কার্ট সাময়িক হোল্ড করুন' : 'Hold Current Cart'}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 10,
                  padding: '4px 8px',
                  color: '#FFFFFF',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <PauseCircle size={12} />
                <span>{isBn ? 'হোল্ড কার্ট' : 'Hold'}</span>
              </button>
            )}

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="lx-touch-btn"
                title={isBn ? 'কার্ট খালি করুন' : 'Clear Cart'}
                style={{
                  background: 'rgba(239, 68, 68, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 10,
                  padding: '4px 8px',
                  color: '#FFFFFF',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Trash2 size={12} />
                <span>{isBn ? 'খালি' : 'Clear'}</span>
              </button>
            )}

            <button
              onClick={() => {
                haptics.tap();
                setShowDailySummaryDrawer(true);
              }}
              className="lx-touch-btn"
              title={isBn ? 'আজকের বিক্রয় হিসাব ও রসিদসমূহ' : "Today's POS Sales Summary"}
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: 10,
                padding: '4px 8px',
                color: '#FFFFFF',
                fontSize: 10.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <BarChart3 size={12} />
              <span>{isBn ? 'হিসাব' : 'Report'}</span>
            </button>
          </div>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Customer Selector Card */}
        {(() => {
          const activeCustomer = customers.find(c => String(c.id) === String(selectedCustomerId));
          return (
            <div
              style={{
                background: '#FFFFFF',
                padding: '10px 12px',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                marginBottom: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={13} color="var(--bk-pink)" />
                  <span>{isBn ? 'ক্রেতা / কাস্টমার হিসাব' : 'Customer Account'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNewCustomerData({ name: '', phone: '', address: '', openingDue: '' });
                    setShowInlineAddCustomer(true);
                    haptics.tap();
                  }}
                  className="lx-touch-btn"
                  style={{
                    background: '#FFF0F6',
                    border: '1px solid #FBCFE8',
                    borderRadius: 8,
                    padding: '3px 8px',
                    color: 'var(--bk-pink)',
                    fontSize: 10.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <UserPlus size={11} />
                  <span>{isBn ? '+ নতুন কাস্টমার' : '+ New Customer'}</span>
                </button>
              </div>

              <div
                onClick={() => {
                  setCustomerSearchQuery('');
                  setShowCustomerSearchDrawer(true);
                  haptics.tap();
                }}
                className="lx-touch-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: activeCustomer ? '#F9FAFB' : '#F3F4F6',
                  border: activeCustomer ? '1.5px solid #E5E7EB' : '1px dashed #D1D5DB',
                  borderRadius: 12,
                  padding: '9px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: activeCustomer ? 'var(--bk-pink)' : '#9CA3AF',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {activeCustomer ? (activeCustomer.nameBn || activeCustomer.nameEn || 'C')[0] : 'ন'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activeCustomer ? (isBn ? activeCustomer.nameBn : activeCustomer.nameEn) : (isBn ? 'সাধারণ খুচরা ক্রেতা (নগদ বিক্রয়)' : 'Walk-in Cash Customer')}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {activeCustomer ? (
                        <>
                          <span>{activeCustomer.phone}</span>
                          <span style={{
                            fontWeight: 700,
                            color: activeCustomer.dueAmount > 0 ? '#DC2626' : '#16A34A',
                            background: activeCustomer.dueAmount > 0 ? '#FEE2E2' : '#DCFCE7',
                            padding: '0 6px',
                            borderRadius: 4,
                            fontSize: 10
                          }}>
                            {isBn ? 'বাকি' : 'Due'}: ৳{activeCustomer.dueAmount || 0}
                          </span>
                        </>
                      ) : (
                        <span>{isBn ? 'নাম বা ফোন নম্বর ছাড়াই তাৎক্ষণিক বিল' : 'Instant Cash Bill without account'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--bk-pink)', fontSize: 11, fontWeight: 800 }}>
                  <span>{isBn ? 'পরিবর্তন' : 'Change'}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Search, Barcode Scan, Layout Switcher & Custom Item Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 10px',
            }}
          >
            <Search size={15} color="#9CA3AF" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder={isBn ? 'পণ্য বা বারকোড খুঁজুন...' : 'Search item or barcode...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '9px 0',
                fontSize: 12,
                outline: 'none',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* POS Layout View Switcher (Grid vs List) */}
          <button
            onClick={() => {
              setViewLayout(prev => prev === 'grid' ? 'list' : 'grid');
              haptics.tap();
            }}
            title={viewLayout === 'grid' ? (isBn ? 'লিস্ট ভিউ' : 'List View') : (isBn ? 'গ্রিড ভিউ' : 'Grid View')}
            className="lx-touch-btn"
            style={{
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {viewLayout === 'grid' ? <List size={16} color="var(--bk-pink)" /> : <LayoutGrid size={16} color="var(--bk-pink)" />}
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {viewLayout === 'grid' ? (isBn ? 'লিস্ট' : 'List') : (isBn ? 'গ্রিড' : 'Grid')}
            </span>
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={handleBarcodeScan}
            title={isBn ? 'বারকোড স্ক্যান করুন (লাইভ ক্যামেরা)' : 'Scan Barcode (Live Camera)'}
            className="lx-touch-btn"
            style={{
              background: showBarcodeScanner ? '#059669' : 'var(--bk-pink)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 14,
              padding: '0 11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 8px rgba(226, 19, 110, 0.25)',
            }}
          >
            <Barcode size={17} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {isBn ? 'স্ক্যান' : 'Scan'}
            </span>
          </button>

          {/* Add Custom Loose Item Button */}
          <button
            onClick={() => {
              setShowCustomItemModal(true);
              haptics.tap();
            }}
            title={isBn ? 'খুচরা বা কাস্টম পণ্য যুক্ত করুন' : 'Add Custom Item'}
            className="lx-touch-btn"
            style={{
              background: '#EFF6FF',
              color: '#1E60D5',
              border: '1px solid #BFDBFE',
              borderRadius: 14,
              padding: '0 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={15} strokeWidth={2.6} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>{isBn ? 'কাস্টম' : 'Custom'}</span>
          </button>
        </div>

        {/* 1-Tap Quick Loose Sale Strip (খোলা পণ্য বিক্রয়) */}
        <div
          style={{
            background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid #FDE68A',
            borderRadius: 14,
            padding: '8px 10px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#92400E' }}>
              {isBn ? '⚡ খোলা বিক্রি:' : '⚡ Loose Sale:'}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[20, 50, 100, 200, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const customId = `loose-${Date.now()}`;
                    const item = {
                      id: customId,
                      nameBn: `খোলা মালামাল (৳${val})`,
                      nameEn: `Loose Item (৳${val})`,
                      price: val,
                      qty: 1,
                      unit: 'পিস',
                      category: 'খোলা পণ্য',
                      isCustom: true,
                    };
                    setCustomItems(prev => [item, ...prev]);
                    setCartBouncing(true);
                    setTimeout(() => setCartBouncing(false), 360);
                    haptics.add();
                    showToast(isBn ? `৳${val} টাকার খোলা মালামাল কার্টে যুক্ত হয়েছে` : `Added BDT ${val} loose item`, 'success');
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    borderRadius: 8,
                    padding: '3px 7px',
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: '#B45309',
                    cursor: 'pointer',
                  }}
                >
                  +৳{val}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCustomItemModal(true);
              haptics.tap();
            }}
            style={{
              background: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isBn ? '+ নাম লিখুন' : '+ Custom'}
          </button>
        </div>

        {/* Custom Items Banner (if any custom loose items added) */}
        {customItems.length > 0 && (
          <div style={{ marginBottom: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1E60D5', marginBottom: 6 }}>
              {isBn ? 'খুচরা / কাস্টম আইটেমসমূহ:' : 'Custom Loose Items Added:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {customItems.map(ci => (
                <div key={ci.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                  <span style={{ color: '#1E3A8A', fontWeight: 600 }}>
                    {ci.nameBn} ({ci.qty} টি)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--bk-pink)' }}>
                      ৳ {ci.price * ci.qty}
                    </span>
                    <button
                      onClick={() => removeCustomItem(ci.id)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 12, scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.id);
                haptics.tap();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: selectedCat === cat.id ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                background: selectedCat === cat.id ? '#FFF0F6' : '#FFFFFF',
                color: selectedCat === cat.id ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isBn ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Dynamic Results Counter Banner when searching or filtering */}
        {(search || selectedCat !== 'all') && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F3F4F6',
              padding: '6px 10px',
              borderRadius: 8,
              marginBottom: 10,
              fontSize: 11,
              color: '#4B5563',
              fontWeight: 600,
            }}
          >
            <span>
              {isBn
                ? `ফলাফল: ${filteredProducts.length}টি পণ্য পাওয়া গেছে`
                : `Found: ${filteredProducts.length} items`}
              {filteredProducts.length > displayedProducts.length && (
                <span style={{ color: 'var(--bk-pink)', fontWeight: 700, marginLeft: 4 }}>
                  (প্রথম {displayedProducts.length}টি প্রদর্শিত)
                </span>
              )}
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
              >
                {isBn ? 'রিসেট' : 'Reset'}
              </button>
            )}
          </div>
        )}

        {/* Catalog Products Display (Grid vs List Layout) */}
        {viewLayout === 'grid' ? (
          <div className="lx-preserve-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
            {displayedProducts.map(p => {
              const qty = cart[p.id] || 0;
              const flyingType = flyingChips[p.id];
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= 5;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      addItem(p.id);
                    } else {
                      haptics.warning();
                      showToast(isBn ? `${p.nameBn} স্টক আউট!` : `${p.nameEn} Out of Stock!`, 'warning');
                    }
                  }}
                  className="lx-touch-btn"
                  style={{
                    background: qty > 0 ? '#FFF0F6' : '#FFFFFF',
                    border: qty > 0 ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 96,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: isOutOfStock ? 0.68 : 1,
                  }}
                >
                  {/* Visual Action-Reaction Flying Particle Badge */}
                  {flyingType === 'plus' && <div className="lx-flying-chip-plus">+1</div>}
                  {flyingType === 'minus' && <div className="lx-flying-chip-minus">-1</div>}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', lineHeight: 1.25 }}>
                        {isBn ? p.nameBn : p.nameEn}
                      </div>
                      {p.barcode && (
                        <span style={{ fontSize: 9, color: '#9CA3AF', fontFamily: 'monospace' }}>
                          #{p.barcode.slice(-4)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 6,
                          background: isOutOfStock ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#DCFCE7',
                          color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#16A34A',
                        }}
                      >
                        {isOutOfStock
                          ? (isBn ? 'স্টক আউট' : 'Out of Stock')
                          : isLowStock
                          ? (isBn ? `সীমিত: ${p.stock} ${p.unit || ''}` : `Low: ${p.stock}`)
                          : (isBn ? `স্টক: ${p.stock} ${p.unit || ''}` : `Stock: ${p.stock}`)}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {p.price}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {qty > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(p.id);
                          }}
                          className="lx-touch-btn"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#E11D48',
                            cursor: 'pointer',
                          }}
                        >
                          <Minus size={13} />
                        </button>
                      )}
                      {qty > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setKeypadItem({ id: p.id, name: isBn ? p.nameBn : p.nameEn, qty });
                            setKeypadInput(String(qty));
                            haptics.tap();
                          }}
                          title={isBn ? 'ক্লিক করে পরিমাণ লিখুন' : 'Click to type quantity'}
                          className="lx-touch-btn"
                          style={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: 'var(--bk-pink)',
                            minWidth: 22,
                            textAlign: 'center',
                            background: '#FFFFFF',
                            border: '1px dashed var(--bk-pink)',
                            borderRadius: 6,
                            padding: '1px 5px',
                            cursor: 'pointer',
                          }}
                        >
                          {qty}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            addItem(p.id);
                          } else {
                            haptics.warning();
                            showToast(isBn ? `${p.nameBn} স্টক আউট!` : `${p.nameEn} Out of Stock!`, 'warning');
                          }
                        }}
                        className="lx-touch-btn"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: isOutOfStock ? '#9CA3AF' : 'var(--bk-pink)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} strokeWidth={2.8} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* High-Density Scanner List Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {displayedProducts.map(p => {
              const qty = cart[p.id] || 0;
              const flyingType = flyingChips[p.id];
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= 5;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      addItem(p.id);
                    } else {
                      haptics.warning();
                      showToast(isBn ? `${p.nameBn} স্টক আউট!` : `${p.nameEn} Out of Stock!`, 'warning');
                    }
                  }}
                  className="lx-touch-btn"
                  style={{
                    background: qty > 0 ? '#FFF0F6' : '#FFFFFF',
                    border: qty > 0 ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: isOutOfStock ? 0.68 : 1,
                  }}
                >
                  {flyingType === 'plus' && <div className="lx-flying-chip-plus">+1</div>}
                  {flyingType === 'minus' && <div className="lx-flying-chip-minus">-1</div>}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isBn ? p.nameBn : p.nameEn}
                      </span>
                      {p.barcode && (
                        <span style={{ fontSize: 9, color: '#6B7280', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>
                          {p.barcode}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                        ৳ {p.price}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 5,
                          background: isOutOfStock ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#DCFCE7',
                          color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#16A34A',
                        }}
                      >
                        {isOutOfStock
                          ? (isBn ? 'স্টক নেই' : 'Out')
                          : isLowStock
                          ? (isBn ? `সীমিত: ${p.stock}` : `Low: ${p.stock}`)
                          : (isBn ? `${p.stock} ${p.unit || ''}` : `${p.stock} in stock`)}
                      </span>
                    </div>
                  </div>

                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {qty > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(p.id);
                        }}
                        className="lx-touch-btn"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#E11D48',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                    )}
                    {qty > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeypadItem({ id: p.id, name: isBn ? p.nameBn : p.nameEn, qty });
                          setKeypadInput(String(qty));
                          haptics.tap();
                        }}
                        className="lx-touch-btn"
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: 'var(--bk-pink)',
                          minWidth: 24,
                          textAlign: 'center',
                          background: '#FFFFFF',
                          border: '1px dashed var(--bk-pink)',
                          borderRadius: 6,
                          padding: '2px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        {qty}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) {
                          addItem(p.id);
                        } else {
                          haptics.warning();
                          showToast(isBn ? `${p.nameBn} স্টক আউট!` : `${p.nameEn} Out of Stock!`, 'warning');
                        }
                      }}
                      className="lx-touch-btn"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: isOutOfStock ? '#9CA3AF' : 'var(--bk-pink)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button for Large Catalogs (Thousands of Items) */}
        {filteredProducts.length > visibleLimit && (
          <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => {
                setVisibleLimit(prev => prev + 24);
                haptics.tap();
              }}
              className="lx-touch-btn"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid var(--bk-pink)',
                color: 'var(--bk-pink)',
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(226, 19, 110, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{isBn ? `আরো ২৪টি পণ্য দেখুন (বাকি ${filteredProducts.length - displayedProducts.length}টি)` : `Load More 24 Items (${filteredProducts.length - displayedProducts.length} remaining)`}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}

        {/* Empty Catalog / Search State */}
        {filteredProducts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px dashed #D1D5DB',
              marginBottom: 16,
            }}
          >
            <Package size={36} color="#9CA3AF" style={{ marginBottom: 8, opacity: 0.6 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#374151', marginBottom: 4 }}>
              {isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Found'}
            </div>
            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 12 }}>
              {search ? (isBn ? `"${search}" এর সাথে মিলে এমন কিছু পাওয়া যায়নি` : `No item matched "${search}"`) : (isBn ? 'এই ক্যাটাগরিতে পণ্য নেই' : 'No items in this category')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="lx-touch-btn"
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'সার্চ মুছুন' : 'Clear Search'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowCustomItemModal(true);
                  haptics.tap();
                }}
                className="lx-touch-btn"
                style={{
                  background: 'var(--bk-pink)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                {isBn ? '+ কাস্টম পণ্য বিক্রি' : '+ Add Custom Item'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Cart & Checkout Bar with Bounce Animation */}
      {cartItems.length > 0 && (
        <div className={`bk-sticky-cart-bar ${cartBouncing ? 'bk-cart-bounce' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="bk-cart-icon-bubble">
              <ShoppingBag size={20} />
              <span className="bk-cart-count-badge">{totalItemCount}</span>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                {isBn ? `${cartItems.length} টি পণ্য সিলেক্টেড` : `${cartItems.length} items`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCashReceived(String(total));
              setShowCheckoutDrawer(true);
              haptics.tap();
            }}
            className="bk-checkout-trigger-btn"
          >
            <span>{isBn ? 'চেকআউট' : 'Checkout'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Direct Numeric Keypad Modal for Quick Quantity Modification */}
      {keypadItem && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setKeypadItem(null)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()}>
            <div className="bk-drawer-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                  {keypadItem.name}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {isBn ? 'সরাসরি পরিমাণ সংখ্যা টাইপ করুন' : 'Type exact quantity'}
                </div>
              </div>
              <button onClick={() => setKeypadItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKeypadQty}>
              <div style={{ marginBottom: 14 }}>
                <input
                  type="number"
                  min="0"
                  value={keypadInput}
                  onChange={e => setKeypadInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 14,
                    border: '2px solid var(--bk-pink)',
                    fontSize: 24,
                    fontWeight: 900,
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[5, 10, 20, 50].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setKeypadInput(String(val));
                      haptics.tap();
                    }}
                    style={{
                      padding: '8px 0',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'পরিমাণ নিশ্চিত করুন' : 'Confirm Quantity'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Loose Item Modal */}
      {showCustomItemModal && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowCustomItemModal(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()}>
            <div className="bk-drawer-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                {isBn ? 'খুচরা / কাস্টম আইটেম যোগ করুন' : 'Add Custom Loose Item'}
              </div>
              <button
                onClick={() => setShowCustomItemModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পণ্যের নাম' : 'Item Name'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: খোলা চিনি ১ কেজি / আলু ২ কেজি' : 'e.g. Loose Sugar, Onions'}
                  value={newCustomItem.name}
                  onChange={e => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'মূল্য (৳)' : 'Price (BDT)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCustomItem.price}
                    onChange={e => setNewCustomItem({ ...newCustomItem, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCustomItem.qty}
                    onChange={e => setNewCustomItem({ ...newCustomItem, qty: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(226, 19, 110, 0.25)',
                }}
              >
                {isBn ? 'কার্টে যুক্ত করুন' : 'Add to Cart'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide-Up Full POS Checkout Drawer */}
      {showCheckoutDrawer && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowCheckoutDrawer(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()}>
            <div className="bk-drawer-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'বিক্রয় ক্যাশআউট ও বিল নিষ্পত্তি' : 'POS Checkout & Bill Payment'}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {isBn ? `${cartItems.length} টি আইটেম • ${totalItemCount} ইউনিট` : `${cartItems.length} items`}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCheckoutDrawer(false);
                  haptics.tap();
                }}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Interactive Itemized Cart Review */}
            <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} color="var(--bk-pink)" />
                  <span>{isBn ? 'কার্টের পণ্যসমূহ ও পরিমাণ' : 'Cart Items & Quantity'}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--bk-pink)' }}>
                  {totalItemCount} {isBn ? 'ইউনিট' : 'units'}
                </span>
              </div>
              <div style={{ maxHeight: 130, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', borderRadius: 10, padding: '6px 8px', border: '1px solid #F3F4F6' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isBn ? item.nameBn : item.nameEn}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                        <span>
                          ৳{item.price} × {item.qty} = <span style={{ fontWeight: 800, color: 'var(--bk-pink)' }}>৳{item.price * item.qty}</span>
                        </span>
                        {!item.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              setPriceEditItem({
                                id: item.id,
                                name: isBn ? item.nameBn : item.nameEn,
                                originalPrice: item.originalPrice || item.price,
                                currentPrice: item.price,
                              });
                              setPriceEditInput(String(item.price));
                              haptics.tap();
                            }}
                            title={isBn ? 'দর পরিবর্তন করুন' : 'Override Price'}
                            style={{
                              background: item.isCustomRate ? '#FEF3C7' : '#F3F4F6',
                              border: item.isCustomRate ? '1px solid #F59E0B' : '1px solid #D1D5DB',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: item.isCustomRate ? '#B45309' : '#4B5563',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Edit3 size={10} />
                            <span>{item.isCustomRate ? (isBn ? 'বিশেষ দর' : 'Custom') : (isBn ? 'দর পরিবর্তন' : 'Edit Rate')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => item.isCustom ? removeCustomItem(item.id) : removeItem(item.id)}
                        className="lx-touch-btn"
                        style={{ width: 24, height: 24, borderRadius: 6, background: '#FFFFFF', border: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 800, minWidth: 18, textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => item.isCustom ? null : addItem(item.id)}
                        className="lx-touch-btn"
                        style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bk-pink)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}
                      >
                        <Plus size={12} strokeWidth={2.8} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Financials Card */}
            <div
              style={{
                background: '#F9FAFB',
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid #E5E7EB',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: '#4B5563' }}>{isBn ? 'উপমোট (Subtotal)' : 'Subtotal'}</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>৳ {subtotal.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
              </div>

              {/* Discount with Fixed vs % toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#4B5563', fontSize: 12.5 }}>{isBn ? 'ছাড় (Discount)' : 'Discount'}</span>
                  <div style={{ display: 'flex', background: '#E5E7EB', borderRadius: 6, padding: 1 }}>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 5,
                        border: 'none',
                        background: discountType === 'fixed' ? 'var(--bk-pink)' : 'transparent',
                        color: discountType === 'fixed' ? '#FFFFFF' : '#4B5563',
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      ৳
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 5,
                        border: 'none',
                        background: discountType === 'percent' ? 'var(--bk-pink)' : 'transparent',
                        color: discountType === 'percent' ? '#FFFFFF' : '#4B5563',
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    placeholder="0"
                    value={discountVal || ''}
                    onChange={e => setDiscountVal(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: 65,
                      padding: '4px 6px',
                      borderRadius: 6,
                      border: '1px solid #D1D5DB',
                      fontSize: 12,
                      textAlign: 'right',
                      fontWeight: 700,
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  />
                  {discountType === 'percent' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--bk-pink)' }}>
                      (-৳{calculatedDiscount})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px dashed #D1D5DB' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{isBn ? 'পরিশোধযোগ্য মোট বিল' : 'Net Payable'}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              </div>
            </div>

            {/* Customer Khata Selector & Credit Limit Bar */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <User size={13} color="var(--bk-pink)" />
                <span>{isBn ? 'খাতায় সংশ্লিষ্ট গ্রাহক' : 'Customer Account'}</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => {
                  setSelectedCustomerId(e.target.value);
                  haptics.tap();
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#111827',
                }}
              >
                <option value="">{isBn ? 'সাধারণ খুচরা ক্রেতা (নগদ)' : 'Walk-in Cash Customer'}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {isBn ? c.nameBn : c.nameEn} ({c.phone}) - {isBn ? 'বর্তমান বাকি' : 'Due'}: ৳{c.dueAmount}
                  </option>
                ))}
              </select>

              {/* Customer Credit Health Indicator */}
              {selectedCustomer && (
                <div style={{ marginTop: 6, padding: '6px 10px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>
                    {isBn ? 'বাকির সীমা (Credit Limit): ৳১৫,০০০' : 'Limit: 15,000'}
                  </span>
                  <span style={{ color: '#166534', fontWeight: 800 }}>
                    {isBn ? `ব্যবহারযোগ্য বাকি: ৳${customerAvailableCredit}` : `Available: ${customerAvailableCredit}`}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Channels */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                {isBn ? 'পেমেন্ট চ্যানেল' : 'Payment Method'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { id: 'নগদ ক্যাশ', labelBn: 'নগদ ক্যাশ', labelEn: 'Cash' },
                  { id: 'বাকি খাতা', labelBn: 'বাকি খাতা', labelEn: 'Due' },
                  { id: 'বিকাশ কিউআর', labelBn: 'বিকাশ', labelEn: 'bKash' },
                  { id: 'ব্যাংক কার্ড', labelBn: 'কার্ড/ব্যাংক', labelEn: 'Bank' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id);
                      haptics.tap();
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: paymentMethod === m.id ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                      background: paymentMethod === m.id ? '#FFF0F6' : '#FFFFFF',
                      color: paymentMethod === m.id ? 'var(--bk-pink)' : '#4B5563',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {isBn ? m.labelBn : m.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Cash Handling & Change Calculator */}
            {paymentMethod === 'নগদ ক্যাশ' && (
              <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '12px', border: '1px solid #FDE68A', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#92400E' }}>
                    {isBn ? 'ক্রেতা থেকে নগদ কত টাকা পেলেন?' : 'Cash Received from Customer'}
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>
                    বিল: ৳{total}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 10, border: '1px solid #F59E0B', padding: '0 10px', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#D97706', marginRight: 6 }}>৳</span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    placeholder={String(total)}
                    style={{ flex: 1, border: 'none', padding: '8px 0', fontSize: 16, fontWeight: 800, outline: 'none' }}
                  />
                </div>

                {/* Quick cash chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[total, 100, 500, 1000].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCashReceived(String(amt));
                        haptics.tap();
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #FCD34D',
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {amt === total ? (isBn ? 'হুবহু বিল' : 'Exact') : `৳${amt}`}
                    </button>
                  ))}
                </div>

                {/* Change or Due Result Badge */}
                {numCashReceived >= total ? (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 10,
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#065F46' }}>
                      {isBn ? 'গ্রাহককে ফেরত দিবেন (Change):' : 'Return Change:'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {changeToReturn.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECDD3',
                      borderRadius: 10,
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#991B1B' }}>
                      {isBn ? 'বাকি থাকবে (Due Balance):' : 'Due Remaining:'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#DC2626', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {dueRemaining.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Warning for Due Sale without selected customer */}
            {paymentMethod === 'বাকি খাতা' && !selectedCustomerId && (
              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '8px 10px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#E11D48', fontSize: 11, fontWeight: 700 }}>
                <AlertCircle size={15} />
                <span>{isBn ? 'বাকি বিক্রির জন্য উপরে কাস্টমার নির্বাচন করুন।' : 'Select a customer above for credit sale.'}</span>
              </div>
            )}

            {/* Note input */}
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                placeholder={isBn ? 'অতিরিক্ত মন্তব্য বা মেমো নম্বর...' : 'Order memo or note...'}
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Hold to Confirm Checkout */}
            <HoldToConfirm
              disabled={total <= 0 || (paymentMethod === 'বাকি খাতা' && !selectedCustomerId)}
              onConfirm={handleCheckout}
              labelBn="বিক্রয় চূড়ান্ত করতে চেপে ধরে রাখুন"
              labelEn="Hold to Complete POS Checkout"
            />
          </div>
        </div>
      )}

      {/* Slide-Up Parked / Hold Sales Drawer */}
      {showParkedDrawer && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowParkedDrawer(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()}>
            <div className="bk-drawer-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="var(--bk-pink)" />
                  <span>{isBn ? 'হোল্ড করা সেলসমূহ' : 'Held / Parked Sales'}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {isBn ? `মোট ${parkedSales.length} টি সংরক্ষিত বিক্রয় ড্রাফট` : `${parkedSales.length} held orders in queue`}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowParkedDrawer(false);
                  haptics.tap();
                }}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {parkedSales.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#9CA3AF' }}>
                <ShoppingBag size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>{isBn ? 'কোনো হোল্ড করা সেল নেই' : 'No parked sales'}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto' }}>
                {parkedSales.map((sale) => (
                  <div
                    key={sale.id}
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 14,
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                        {sale.customerName}
                      </span>
                      <span style={{ fontSize: 10.5, color: '#6B7280', background: '#FFFFFF', padding: '2px 6px', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                        🕒 {sale.time}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#4B5563' }}>
                      <span>{sale.itemCount} {isBn ? 'টি আইটেম' : 'items'}</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                        ৳ {sale.total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => restoreParkedSale(sale.id)}
                        className="lx-touch-btn"
                        style={{
                          flex: 1,
                          background: 'var(--bk-pink)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 10,
                          padding: '8px',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>{isBn ? 'রিস্টোর করুন' : 'Restore Cart'}</span>
                      </button>
                      <button
                        onClick={() => deleteParkedSale(sale.id)}
                        className="lx-touch-btn"
                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                        style={{
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Item Price/Rate Override Modal */}
      {priceEditItem && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setPriceEditItem(null)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, margin: '0 auto' }}>
            <div className="bk-drawer-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} color="var(--bk-pink)" />
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                  {isBn ? 'দর / রেট পরিবর্তন' : 'Override Item Rate'}
                </div>
              </div>
              <button
                onClick={() => setPriceEditItem(null)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1F2937', marginBottom: 2 }}>
                {priceEditItem.name}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {isBn ? `রেগুলার ক্যাটালগ মূল্য: ৳${priceEditItem.originalPrice}` : `Regular catalog price: ৳${priceEditItem.originalPrice}`}
              </div>
            </div>

            <form onSubmit={handleSavePriceEdit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  {isBn ? 'নতুন নির্ধারিত বিক্রয় দর (প্রতি ইউনিট ৳)' : 'New Sales Rate (Per unit ৳)'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  autoFocus
                  required
                  value={priceEditInput}
                  onChange={e => setPriceEditInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--bk-pink)',
                    fontSize: 18,
                    fontWeight: 900,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Outfit, sans-serif',
                    color: '#111827',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    const nextOverrides = { ...itemPriceOverrides };
                    delete nextOverrides[priceEditItem.id];
                    setItemPriceOverrides(nextOverrides);
                    setPriceEditItem(null);
                    showToast(isBn ? 'রেগুলার মূল্যে ফিরিয়ে নেওয়া হয়েছে' : 'Reverted to regular price', 'info');
                  }}
                  className="lx-touch-btn"
                  style={{
                    flex: 1,
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#4B5563',
                    borderRadius: 12,
                    padding: '12px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'আগের মূল্যে ফেরত' : 'Reset to Regular'}
                </button>
                <button
                  type="submit"
                  className="lx-touch-btn"
                  style={{
                    flex: 2,
                    background: 'var(--bk-pink)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '12px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(226, 19, 110, 0.25)',
                  }}
                >
                  {isBn ? 'দর নিশ্চিত করুন' : 'Confirm Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Searchable Customer Selection Bottom Sheet Drawer */}
      {showCustomerSearchDrawer && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowCustomerSearchDrawer(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()} style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
            <div className="bk-drawer-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="var(--bk-pink)" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                    {isBn ? 'কাস্টমার হিসাব নির্বাচন' : 'Select Customer Account'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                    {isBn ? `মোট ${(customers || []).length} জন নিবন্ধিত কাস্টমার` : `${(customers || []).length} customers in ledger`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCustomerSearchDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sticky Search & New Customer Action */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F9FAFB',
                  border: '1px solid #D1D5DB',
                  borderRadius: 12,
                  padding: '0 10px',
                }}
              >
                <Search size={15} color="#9CA3AF" style={{ marginRight: 6 }} />
                <input
                  type="text"
                  autoFocus
                  placeholder={isBn ? 'নাম, মোবাইল বা ঠিকানা লিখুন...' : 'Search name, phone, address...'}
                  value={customerSearchQuery}
                  onChange={e => setCustomerSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: '10px 0',
                    fontSize: 12.5,
                    outline: 'none',
                  }}
                />
                {customerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCustomerSearchQuery('')}
                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCustomerSearchDrawer(false);
                  setNewCustomerData({ name: '', phone: '', address: '', openingDue: '' });
                  setShowInlineAddCustomer(true);
                  haptics.tap();
                }}
                className="lx-touch-btn"
                style={{
                  background: 'var(--bk-pink)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '0 12px',
                  color: '#FFFFFF',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <UserPlus size={14} />
                <span>{isBn ? '+ নতুন' : '+ New'}</span>
              </button>
            </div>

            {/* Scrollable Customer List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2, paddingBottom: 16 }}>
              {/* Default Option: Walk-in Cash Customer */}
              <div
                onClick={() => {
                  setSelectedCustomerId('');
                  setShowCustomerSearchDrawer(false);
                  haptics.tap();
                  showToast(isBn ? 'সাধারণ খুচরা ক্রেতা সিলেক্ট করা হয়েছে' : 'Walk-in cash customer selected', 'info');
                }}
                className="lx-touch-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: !selectedCustomerId ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                  background: !selectedCustomerId ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#9CA3AF',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ন
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                      {isBn ? 'সাধারণ খুচরা ক্রেতা (নগদ বিল)' : 'Walk-in Cash Customer'}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                      {isBn ? 'কোনো বাকি খাতা হিসাব যুক্ত হবে না' : 'No credit ledger balance recorded'}
                    </div>
                  </div>
                </div>
                {!selectedCustomerId && <Check size={16} color="var(--bk-pink)" strokeWidth={3} />}
              </div>

              {displayedCustomers.map(c => {
                const isSelected = String(c.id) === String(selectedCustomerId);
                const due = c.dueAmount || 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setShowCustomerSearchDrawer(false);
                      haptics.tap();
                      showToast(isBn ? `${c.nameBn || c.nameEn} নির্বাচন করা হয়েছে` : `${c.nameEn || c.nameBn} selected`, 'success');
                    }}
                    className="lx-touch-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                      background: isSelected ? '#FFF0F6' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: isSelected ? 'var(--bk-pink)' : '#3B82F6',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {(c.nameBn || c.nameEn || 'C')[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isBn ? c.nameBn : c.nameEn}
                          </span>
                        </div>
                        <div style={{ fontSize: 10.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          {c.phone && <span>📞 {c.phone}</span>}
                          {c.address && <span>📍 {c.address}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: due > 0 ? '#DC2626' : '#16A34A',
                            background: due > 0 ? '#FEE2E2' : '#DCFCE7',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {isBn ? 'বাকি' : 'Due'}: ৳{due}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--bk-pink)" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}

              {filteredCustomers.length > visibleCustomerCount && (
                <button
                  type="button"
                  onClick={() => setVisibleCustomerCount(prev => prev + 30)}
                  className="lx-touch-btn"
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: 10,
                    padding: '8px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#374151',
                    marginTop: 6,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? `আরো ৩০ জন কাস্টমার দেখুন (বাকি ${filteredCustomers.length - visibleCustomerCount} জন)` : `Load More (${filteredCustomers.length - visibleCustomerCount} remaining)`}
                </button>
              )}

              {filteredCustomers.length === 0 && (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#9CA3AF' }}>
                  <User size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                    {isBn ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customers found'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, marginBottom: 12 }}>
                    {isBn ? `"${customerSearchQuery}" নামে কেউ নেই` : `No match for "${customerSearchQuery}"`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerSearchDrawer(false);
                      setNewCustomerData({ name: customerSearchQuery, phone: '', address: '', openingDue: '' });
                      setShowInlineAddCustomer(true);
                      haptics.tap();
                    }}
                    className="lx-touch-btn"
                    style={{
                      background: 'var(--bk-pink)',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 10,
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isBn ? `+ "${customerSearchQuery}" নামে কাস্টমার খুলুন` : `+ Create Customer "${customerSearchQuery}"`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Fast Customer Creation Modal (without leaving POS) */}
      {showInlineAddCustomer && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowInlineAddCustomer(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, margin: '0 auto' }}>
            <div className="bk-drawer-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="var(--bk-pink)" />
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'নতুন কাস্টমার খাতা তৈরি' : 'Add New Customer Account'}
                </div>
              </div>
              <button
                onClick={() => setShowInlineAddCustomer(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerInline}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'কাস্টমারের নাম *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder={isBn ? 'যেমন: রহিম মিয়া / মেসার্স জামান ট্রেডার্স' : 'e.g. Rahim Mia'}
                  value={newCustomerData.name}
                  onChange={e => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={newCustomerData.phone}
                  onChange={e => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'পূর্বের বাকি (৳)' : 'Previous Due (৳)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCustomerData.openingDue}
                    onChange={e => setNewCustomerData({ ...newCustomerData, openingDue: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'ঠিকানা / এরিয়া' : 'Address / Area'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? 'যেমন: চকবাজার' : 'e.g. Market area'}
                    value={newCustomerData.address}
                    onChange={e => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="lx-touch-btn"
                style={{
                  width: '100%',
                  background: 'var(--bk-pink)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(226, 19, 110, 0.25)',
                }}
              >
                {isBn ? 'কাস্টমার সংরক্ষণ ও বিল নির্বাচন করুন' : 'Save & Select for POS Bill'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Daily POS Register & Sales Summary Drawer */}
      {showDailySummaryDrawer && (
        <div className="bk-slide-drawer-backdrop" onClick={() => setShowDailySummaryDrawer(false)}>
          <div className="bk-slide-drawer" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="bk-drawer-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="var(--bk-pink)" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                    {isBn ? 'আজকের বিক্রয় ও ক্যাশ রেজিস্টার' : "Today's POS Sales Register"}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                    📅 {new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { dateStyle: 'full' })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDailySummaryDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            {(() => {
              const totalSales = todaySalesList.reduce((acc, s) => acc + (Number(s.amount) || Number(s.total) || 0), 0);
              const cashReceived = todaySalesList.reduce((acc, s) => acc + (Number(s.paidAmount) || (s.paymentMethod === 'নগদ ক্যাশ' ? Number(s.amount) : 0) || 0), 0);
              const dueGiven = todaySalesList.reduce((acc, s) => acc + (Number(s.dueAmount) || (s.paymentMethod === 'বাকি খাতা' ? Number(s.amount) : 0) || 0), 0);
              const memoCount = todaySalesList.length;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: '#FFF0F6', border: '1px solid #FBCFE8', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#9D174D', fontWeight: 700, marginBottom: 2 }}>
                      {isBn ? 'মোট বিক্রয়' : 'Total Sales'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {totalSales.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                    <div style={{ fontSize: 10, color: '#BE185D', marginTop: 2 }}>
                      {memoCount} {isBn ? 'টি মেমো কাটা হয়েছে' : 'invoices issued'}
                    </div>
                  </div>

                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#065F46', fontWeight: 700, marginBottom: 2 }}>
                      {isBn ? 'নগদ ক্যাশ গ্রহণ' : 'Cash Collected'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {cashReceived.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                    <div style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>
                      {isBn ? 'ক্যাশ বাক্সে জমা' : 'in cash drawer'}
                    </div>
                  </div>

                  <div style={{ background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#991B1B', fontWeight: 700, marginBottom: 2 }}>
                      {isBn ? 'আজকের মোট বাকি' : 'Today Credit Sales'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#DC2626', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {dueGiven.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                    <div style={{ fontSize: 10, color: '#B91C1C', marginTop: 2 }}>
                      {isBn ? 'খাতায় বাকি তোলা' : 'added to due ledger'}
                    </div>
                  </div>

                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#075985', fontWeight: 700, marginBottom: 2 }}>
                      {isBn ? 'গড় মেমো বিল' : 'Average Order'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0284C7', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {memoCount > 0 ? Math.round(totalSales / memoCount).toLocaleString(isBn ? 'bn-BD' : 'en-US') : 0}
                    </div>
                    <div style={{ fontSize: 10, color: '#0369A1', marginTop: 2 }}>
                      {isBn ? 'প্রতি মেমোতে বিক্রয়' : 'per invoice'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* List of Today's Sales Memos */}
            <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={14} color="var(--bk-pink)" />
              <span>{isBn ? 'আজকের সকল মেমো তালিকা' : 'Today Invoices & Receipts'}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2, paddingBottom: 16 }}>
              {todaySalesList.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#9CA3AF' }}>
                  <Receipt size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                    {isBn ? 'আজ এখনো কোনো বিক্রি রেকর্ড করা হয়নি' : 'No sales made today yet'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                    {isBn ? 'বিক্রয় সম্পন্ন করলে এখানে তাৎক্ষণিক মেমো তালিকা ও হিসাব পাবেন' : 'Completed sales invoices will appear here'}
                  </div>
                </div>
              ) : (
                todaySalesList.map((sale, idx) => (
                  <div
                    key={sale.id || idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: '#111827' }}>
                          {sale.partyName || sale.customerName || (isBn ? 'খুচরা ক্রেতা' : 'Walk-in Customer')}
                        </span>
                        <span style={{ fontSize: 9.5, color: '#6B7280', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>
                          #{String(sale.id).slice(-4)}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                        ৳ {Number(sale.amount || sale.totalAmount || 0).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#6B7280' }}>
                      <span>🕒 {sale.timestamp || sale.date || 'আজ'}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 9.5,
                          fontWeight: 700,
                          background: sale.paymentMethod === 'বাকি খাতা' ? '#FEF2F2' : '#ECFDF5',
                          color: sale.paymentMethod === 'বাকি খাতা' ? '#DC2626' : '#059669',
                        }}>
                          {sale.paymentMethod || (isBn ? 'নগদ' : 'Cash')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDailySummaryDrawer(false);
                            navigateTo('receipt');
                            haptics.tap();
                          }}
                          className="lx-touch-btn"
                          style={{
                            background: '#FFF0F6',
                            border: '1px solid #FBCFE8',
                            borderRadius: 6,
                            padding: '1px 6px',
                            color: 'var(--bk-pink)',
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Printer size={10} />
                          <span>{isBn ? 'রসিদ' : 'Receipt'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeDetected}
        products={products}
        language={language}
      />
    </div>
  );
}
