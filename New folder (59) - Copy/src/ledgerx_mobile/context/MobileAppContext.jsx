import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  initialShopInfo,
  initialBalances,
  initialCustomers,
  initialSuppliers,
  initialProducts,
  initialTransactions,
} from '../data/defaultData';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

const MobileAppContext = createContext(null);

const STORAGE_KEY = 'LEDGERX_MOBILE_APP_STATE_V4';

// Helper to get active tenant ID (shared with Desktop ERP)
const getActiveTenantId = () => {
  try {
    return localStorage.getItem('ledgerx_active_tenant_id') || 'store_001';
  } catch (e) {
    return 'store_001';
  }
};

// ── Unified Desktop ERP ⇄ Mobile App Database Adapter ───────────────────────
const loadUnifiedProducts = (tenantId) => {
  try {
    const raw = localStorage.getItem(`ledgerx_${tenantId}_products`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({
          id: p.id,
          nameBn: p.name,
          nameEn: p.nameEn || p.name,
          category: p.category || 'সাধারণ পণ্য',
          price: (p.sellingPriceBasePoisha ? p.sellingPriceBasePoisha / 100 : p.price) || 0,
          costPrice: (p.costPriceBasePoisha ? p.costPriceBasePoisha / 100 : p.costPrice) || 0,
          stock: p.currentStockInBaseUnit !== undefined ? p.currentStockInBaseUnit : (p.stock || 0),
          unit: p.baseUnit || p.unit || 'কেজি',
          barcode: p.sku || p.barcode || p.id,
          minAlert: p.lowStockAlertThreshold || 10,
        }));
      }
    }
  } catch (e) {
    console.warn('[MobileAppContext] Failed to load desktop products:', e);
  }

  // Fallback to local storage or initial seed, and sync it to desktop key
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PRODUCTS`);
    const prods = saved ? JSON.parse(saved) : initialProducts;
    return prods;
  } catch (e) {
    return initialProducts;
  }
};

const loadUnifiedCustomers = (tenantId) => {
  try {
    const raw = localStorage.getItem(`ledgerx_${tenantId}_customers`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#EC4899'];
        return parsed.map((c, idx) => ({
          id: c.id,
          customerCode: c.customerCode || c.id,
          nameBn: c.name,
          nameEn: c.nameEn || c.name,
          phone: c.phone || '01700-000000',
          address: c.address || 'ঢাকা',
          avatarColor: c.avatarColor || colors[idx % colors.length],
          dueAmount: c.currentDuePoisha !== undefined ? c.currentDuePoisha / 100 : (c.dueAmount || 0),
          creditLimit: c.creditLimitPoisha ? c.creditLimitPoisha / 100 : (c.creditLimit || 15000),
          lastActive: c.lastPurchaseDate || 'আজ',
        }));
      }
    }
  } catch (e) {
    console.warn('[MobileAppContext] Failed to load desktop customers:', e);
  }

  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CUSTOMERS`);
    return saved ? JSON.parse(saved) : initialCustomers;
  } catch (e) {
    return initialCustomers;
  }
};

const loadUnifiedSuppliers = (tenantId) => {
  try {
    const raw = localStorage.getItem(`ledgerx_${tenantId}_suppliers`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(s => ({
          id: s.id,
          nameBn: s.name,
          nameEn: s.nameEn || s.name,
          phone: s.phone || '01700-000000',
          category: s.category || s.company || 'জেনারেল সাপ্লায়ার',
          payable: s.currentDuePoisha !== undefined ? s.currentDuePoisha / 100 : (s.balancePoisha ? s.balancePoisha / 100 : (s.payable || 0)),
        }));
      }
    }
  } catch (e) {
    console.warn('[MobileAppContext] Failed to load desktop suppliers:', e);
  }

  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SUPPLIERS`);
    return saved ? JSON.parse(saved) : initialSuppliers;
  } catch (e) {
    return initialSuppliers;
  }
};

const loadUnifiedBalances = (tenantId, currentCusts = [], currentSups = []) => {
  let cash = 0;
  let bank = 0;

  try {
    const rawRegs = localStorage.getItem(`ledgerx_${tenantId}_registers`);
    if (rawRegs) {
      const regs = JSON.parse(rawRegs);
      if (Array.isArray(regs)) {
        const cashReg = regs.find(r => r.category === 'CASH' || r.id === 'cash_drawer');
        if (cashReg && cashReg.balancePoisha !== undefined) {
          cash = cashReg.balancePoisha / 100;
        }
        const bankRegs = regs.filter(r => r.category === 'BANK');
        if (bankRegs.length > 0) {
          bank = bankRegs.reduce((sum, r) => sum + (r.balancePoisha || 0), 0) / 100;
        }
      }
    } else {
      const saved = localStorage.getItem(`${STORAGE_KEY}_BALANCES`);
      if (saved) {
        const b = JSON.parse(saved);
        cash = b.cashInHand !== undefined ? b.cashInHand : 0;
        bank = b.bankBalance !== undefined ? b.bankBalance : 0;
      }
    }
  } catch (e) {}

  const due = currentCusts.reduce((sum, c) => sum + Number(c.dueAmount || 0), 0);
  const payable = currentSups.reduce((sum, s) => sum + Number(s.payable || 0), 0);

  // DYNAMIC: Calculate today's real sales and expenses from transaction logs
  let todaySales = 0;
  let todayExpense = 0;
  try {
    const rawTxns = localStorage.getItem(`${STORAGE_KEY}_TXNS`);
    if (rawTxns) {
      const txns = JSON.parse(rawTxns);
      if (Array.isArray(txns)) {
        const todayStr = new Date().toISOString().slice(0, 10);
        txns.forEach(t => {
          const isToday =
            t.date === todayStr ||
            (t.timestamp && (t.timestamp.includes('আজ') || t.timestamp.includes('Today')));
          if (isToday) {
            if (t.type === 'sale' || t.flow === 'in') {
              todaySales += Number(t.amount || 0);
            } else if (t.type === 'expense' || t.flow === 'out') {
              todayExpense += Number(t.amount || 0);
            }
          }
        });
      }
    }
  } catch (e) {}

  return {
    cashInHand: cash,
    bankBalance: bank,
    totalDueReceivable: due,
    totalPayable: payable,
    todaySales,
    todayExpense,
  };
};

// Default fallback tenants
const DEFAULT_TENANTS_FALLBACK = [
  {
    id: 'store_001',
    nameBn: 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা',
    nameEn: 'Universal Digital Business & Enterprise Khata',
    branchBn: 'প্রধান কার্যালয় (শাখা ১)',
    branchEn: 'Head Office (Branch 1)',
    phone: '01711-000000',
    address: 'মেইন রোড, বাণিজ্যিক এলাকা, ঢাকা',
    badge: 'HQ',
  },
  {
    id: 'store_002',
    nameBn: 'মদিনা চালের পাইকারি আড়ত',
    nameEn: 'Madina Grain Wholesale Arat',
    branchBn: 'বাবুবাজার আড়ত (শাখা ২)',
    branchEn: 'Babubazar Arat (Branch 2)',
    phone: '01811-000000',
    address: 'আড়ত নং ১২, বাদামতলী, বাবুবাজার, ঢাকা',
    badge: 'Wholesale',
  },
  {
    id: 'store_003',
    nameBn: 'মডার্ন ফার্মা ও ড্রাগ হাউস',
    nameEn: 'Modern Pharma & Healthcare',
    branchBn: 'ধানমন্ডি মডেল শাখা (শাখা ৩)',
    branchEn: 'Dhanmondi Branch (Branch 3)',
    phone: '01911-000000',
    address: 'বাড়ি ৫, রোড ৭, ধানমন্ডি, ঢাকা',
    badge: 'Pharma',
  },
  {
    id: 'store_004',
    nameBn: 'নূর অপটিক্যালস ও আই কেয়ার',
    nameEn: 'Noor Optics & Vision Care Center',
    branchBn: 'গ্রিন রোড শাখা (শাখা ৪)',
    branchEn: 'Green Road Branch (Branch 4)',
    phone: '01712-445566',
    address: 'বাড়ি নং ১২/এ, গ্রিন রোড, পান্থপথ মোড়, ঢাকা',
    badge: 'Retail',
  },
];

export const loadAvailableTenants = () => {
  try {
    const raw = localStorage.getItem('ledgerx_tenants');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t, idx) => ({
          id: t.id || `store_00${idx + 1}`,
          nameBn: t.name || t.shopTitle || 'আমার ব্যবসা প্রতিষ্ঠান',
          nameEn: t.nameEn || t.name || 'My Enterprise Business',
          branchBn: t.branch || 'প্রধান শাখা',
          branchEn: t.branchEn || t.branch || 'Head Office',
          phone: t.phone || t.shopPhone || '01711-000000',
          address: t.address || t.shopAddress || '',
          badge: t.businessType || t.type || 'Branch',
        }));
      }
    }
  } catch (e) {}
  return DEFAULT_TENANTS_FALLBACK;
};

export function MobileAppProvider({ children }) {
  const [activeTenantId, setActiveTenantId] = useState(getActiveTenantId);

  // ── Language & Appearance ───────────────────────────────────────────────
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('lx_lang') || 'bn';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lx_theme_fintech_v3') || 'light';
  });

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('lx_view_mode') || 'mobile';
  });

  // ── Balance Peek State ──────────────────────────────────────────────────
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [balanceTimer, setBalanceTimer] = useState(null);

  // ── Unified Core Business State ─────────────────────────────────────────
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SHOP`);
    return saved ? JSON.parse(saved) : initialShopInfo;
  });

  const [availableTenants, setAvailableTenants] = useState(() => loadAvailableTenants());

  const [customers, setCustomers] = useState(() => loadUnifiedCustomers(activeTenantId));
  const [suppliers, setSuppliers] = useState(() => loadUnifiedSuppliers(activeTenantId));
  const [products, setProducts] = useState(() => loadUnifiedProducts(activeTenantId));
  const [balances, setBalances] = useState(() => loadUnifiedBalances(activeTenantId, customers, suppliers));

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TXNS`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  // ── Enterprise Screen Navigation Stack ──────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenHistory, setScreenHistory] = useState(['home']);
  const [screenParams, setScreenParams] = useState({});

  const navigateTo = useCallback((screen, params = {}) => {
    setScreenParams(params);
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const next = [...prev];
        next.pop();
        const prevScreen = next[next.length - 1];
        setCurrentScreen(prevScreen);
        return next;
      } else {
        setCurrentScreen('home');
        return ['home'];
      }
    });
  }, []);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [soundboxEnabled, setSoundboxEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const [showStoreModal, setShowStoreModal] = useState(false);

  // ── Celebration & Extraordinary Haptic Overlay State ───────────────────
  const [celebrationState, setCelebrationState] = useState(null);

  // Synchronized Refs for Native Android Back Button (LIFO Modal Registry)
  const celebrationStateRef = useRef(celebrationState);
  celebrationStateRef.current = celebrationState;

  const triggerCelebration = useCallback((config) => {
    setCelebrationState({
      isOpen: true,
      type: config.type || 'sale',
      titleBn: config.titleBn || 'কাজটি সফল হয়েছে!',
      titleEn: config.titleEn || 'Action Successful!',
      subtitleBn: config.subtitleBn || 'সরাসরি ডিজিটাল খাতা ও সিস্টেমে সংরক্ষিত হয়েছে',
      subtitleEn: config.subtitleEn || 'Saved and ledger synchronized',
      amount: config.amount || 0,
      partyName: config.partyName || '',
      partyPhone: config.partyPhone || '',
      invoiceNo: config.invoiceNo || '',
      onViewReceipt: config.onViewReceipt || null,
    });
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrationState(prev => (prev ? { ...prev, isOpen: false } : null));
  }, []);

  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const showStoreModalRef = useRef(showStoreModal);
  showStoreModalRef.current = showStoreModal;

  const selectedTransactionRef = useRef(selectedTransaction);
  selectedTransactionRef.current = selectedTransaction;

  const selectedCustomerRef = useRef(selectedCustomer);
  selectedCustomerRef.current = selectedCustomer;

  const selectedSupplierRef = useRef(selectedSupplier);
  selectedSupplierRef.current = selectedSupplier;

  const backHandlersRef = useRef([]);

  const registerBackHandler = useCallback((id, handler) => {
    backHandlersRef.current = backHandlersRef.current.filter(h => h.id !== id);
    backHandlersRef.current.push({ id, handler });
    return () => {
      backHandlersRef.current = backHandlersRef.current.filter(h => h.id !== id);
    };
  }, []);

  // ── Native Android Status Bar & Edge-to-Edge Configuration ─────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#E2136E' });
      StatusBar.setOverlaysWebView({ overlay: true });
    } catch (e) {
      console.warn('Native status bar styling error:', e);
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    if (type === 'success') {
      try {
        soundbox.playChime ? soundbox.playChime() : null;
      } catch (e) {}
    }
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  // ── Native Android Hardware / Gesture Back Button Handling ─────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let sub;
    let lastBackPressTime = 0;

    try {
      CapApp.addListener('backButton', () => {
        // 0. Celebration overlay dismissal
        if (celebrationStateRef.current && celebrationStateRef.current.isOpen) {
          dismissCelebration();
          return;
        }

        // 1. Any registered modal or drawer back handler (LIFO stack)
        if (backHandlersRef.current.length > 0) {
          const top = backHandlersRef.current[backHandlersRef.current.length - 1];
          try {
            const handled = top.handler();
            if (handled !== false) return;
          } catch (e) {
            console.warn('Back handler error:', e);
          }
        }

        // 2. Store Switcher modal
        if (showStoreModalRef.current) {
          setShowStoreModal(false);
          return;
        }

        // 3. Selection modals
        if (selectedTransactionRef.current) {
          setSelectedTransaction(null);
          return;
        }
        if (selectedCustomerRef.current) {
          setSelectedCustomer(null);
          return;
        }
        if (selectedSupplierRef.current) {
          setSelectedSupplier(null);
          return;
        }

        // 4. Subpage navigation stack (Inventory, Quick Sale, Customer Khata, etc.)
        if (currentScreenRef.current !== 'home') {
          goBack();
          return;
        }

        // 5. If on another tab (Statement, Inbox, Settings), return to home tab
        if (activeTabRef.current !== 'home') {
          setActiveTab('home');
          return;
        }

        // 6. Double-tap back on root Home screen to prevent accidental exit
        const now = Date.now();
        if (now - lastBackPressTime < 2200) {
          CapApp.exitApp();
        } else {
          lastBackPressTime = now;
          showToast(language === 'bn' ? 'অ্যাপ বন্ধ করতে আবার ব্যাক চাপুন' : 'Press back again to exit', 'info');
        }
      }).then(handle => {
        sub = handle;
      });
    } catch (e) {
      console.warn('Native back button registration:', e);
    }

    return () => {
      if (sub && sub.remove) {
        sub.remove();
      }
    };
  }, [language, goBack, showToast]);

  const switchTenant = useCallback((tenantId) => {
    try {
      localStorage.setItem('ledgerx_active_tenant_id', tenantId);
      setActiveTenantId(tenantId);
      const nextCusts = loadUnifiedCustomers(tenantId);
      const nextSups = loadUnifiedSuppliers(tenantId);
      const nextProds = loadUnifiedProducts(tenantId);
      const nextBals = loadUnifiedBalances(tenantId, nextCusts, nextSups);
      setCustomers(nextCusts);
      setSuppliers(nextSups);
      setProducts(nextProds);
      setBalances(prev => ({ ...prev, ...nextBals }));

      const currentList = loadAvailableTenants();
      const matched = currentList.find(t => t.id === tenantId) || DEFAULT_TENANTS_FALLBACK.find(t => t.id === tenantId);
      if (matched) {
        setShopInfo(prev => ({
          ...prev,
          shopNameBn: matched.nameBn,
          shopNameEn: matched.nameEn,
          phone: matched.phone,
          address: matched.address,
          branchBn: matched.branchBn,
          branchEn: matched.branchEn,
        }));
      }

      showToast(
        language === 'bn' 
          ? `ব্রাঞ্চ পরিবর্তিত: ${matched?.nameBn || tenantId}` 
          : `Switched Store: ${matched?.nameEn || tenantId}`
      );
    } catch (e) {
      console.error('Failed to switch tenant:', e);
    }
  }, [language, showToast]);

  const addNewTenant = useCallback(({ nameBn, nameEn, branchBn, branchEn, phone, address, type }) => {
    try {
      const newId = `store_${Date.now().toString().slice(-4)}`;
      const newTenant = {
        id: newId,
        nameBn: nameBn || 'আমার নতুন প্রতিষ্ঠান',
        nameEn: nameEn || nameBn || 'My New Business',
        branchBn: branchBn || 'নতুন শাখা',
        branchEn: branchEn || branchBn || 'New Branch',
        phone: phone || '01700-000000',
        address: address || '',
        badge: type || 'Branch',
      };

      const currentList = loadAvailableTenants();
      const updatedList = [...currentList, newTenant];
      setAvailableTenants(updatedList);
      try {
        localStorage.setItem('ledgerx_tenants', JSON.stringify(updatedList));
      } catch (e) {}

      switchTenant(newId);
      showToast(language === 'bn' ? 'নতুন ব্রাঞ্চ সফলভাবে নিবন্ধিত হয়েছে!' : 'New branch registered successfully!');
      return newTenant;
    } catch (e) {
      console.error('Failed to add new branch:', e);
      showToast(language === 'bn' ? 'ব্রাঞ্চ তৈরি ব্যর্থ হয়েছে' : 'Failed to register branch', 'error');
    }
  }, [language, showToast, switchTenant]);

  // ── Two-Way Synchronizer: Listen to External Desktop ERP Changes ────────
  useEffect(() => {
    const handleStorageChange = (e) => {
      const currentTid = getActiveTenantId();
      if (currentTid !== activeTenantId) {
        setActiveTenantId(currentTid);
      }

      if (!e.key || e.key.startsWith(`ledgerx_${currentTid}_`)) {
        const nextCusts = loadUnifiedCustomers(currentTid);
        const nextSups = loadUnifiedSuppliers(currentTid);
        const nextProds = loadUnifiedProducts(currentTid);
        const nextBals = loadUnifiedBalances(currentTid, nextCusts, nextSups);

        setCustomers(nextCusts);
        setSuppliers(nextSups);
        setProducts(nextProds);
        setBalances(prev => ({
          ...prev,
          ...nextBals,
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeTenantId]);

  // Persist mobile state copy
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_SHOP`, JSON.stringify(shopInfo));
      localStorage.setItem(`${STORAGE_KEY}_BALANCES`, JSON.stringify(balances));
      localStorage.setItem(`${STORAGE_KEY}_CUSTOMERS`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_SUPPLIERS`, JSON.stringify(suppliers));
      localStorage.setItem(`${STORAGE_KEY}_PRODUCTS`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_TXNS`, JSON.stringify(transactions));
    } catch (e) {
      console.warn('[LedgerX Mobile] Failed to persist state:', e);
    }
  }, [shopInfo, balances, customers, suppliers, products, transactions]);

  useEffect(() => {
    localStorage.setItem('lx_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('lx_theme_fintech_v3', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lx_view_mode', viewMode);
  }, [viewMode]);

  // Tap for Balance Toggle with Auto-Hide & Tactile Micro-Feel
  const toggleBalancePeek = () => {
    haptics.tap();
    if (balanceVisible) {
      setBalanceVisible(false);
      if (balanceTimer) clearTimeout(balanceTimer);
      return;
    }

    setBalanceVisible(true);
    haptics.success();
    soundbox.playChime();

    if (balanceTimer) clearTimeout(balanceTimer);
    const timer = setTimeout(() => {
      setBalanceVisible(false);
    }, 4000);
    setBalanceTimer(timer);
  };

  // Helper: Dispatch storage event to keep PC ERP tabs in sync
  const notifyUnifiedStore = () => {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  // Helper: Customer Passbook Timeline Ledger
  const getCustomerTransactions = (customerId, customerName) => {
    return transactions.filter(t => {
      if (customerId && t.customerId === customerId) return true;
      if (customerName && (t.partyName === customerName || t.titleBn?.includes(customerName))) return true;
      return false;
    });
  };

  // ── Core Interconnected Business Logic Nodes ───────────────────────────

  // 1. POS Sale Transaction (Writes to Unified Desktop Invoices + Stock + Ledger)
  const recordSale = ({ customerId, customerName, items, totalAmount, paidAmount, dueAmount, paymentMethod, note }) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const numTotal = Number(totalAmount || 0);
    const numPaid = Number(paidAmount || 0);
    const numDue = Number(dueAmount || 0);

    const isFullDue = numDue > 0 && numPaid === 0;

    const newTxn = {
      id: txnId,
      customerId: customerId || null,
      type: isFullDue ? 'due_entry' : 'sale',
      category: isFullDue ? 'বাকিতে বিক্রয়' : 'নগদ বিক্রয়',
      titleBn: isFullDue ? `বাকিতে বিক্রয় - ${customerName || 'গ্রাহক'}` : `কাউন্টার বিক্রয় #${txnId.slice(-4)}`,
      titleEn: isFullDue ? `Credit Sale - ${customerName || 'Customer'}` : `Counter Sale #${txnId.slice(-4)}`,
      partyName: customerName || 'সাধারণ খুচরা ক্রেতা',
      amount: numTotal,
      paidAmount: numPaid,
      dueAmount: numDue,
      timestamp: `আজ ${timeStr}`,
      date: dateStr,
      flow: numPaid > 0 ? 'in' : 'neutral',
      status: 'সফল',
      paymentMethod: paymentMethod || (isFullDue ? 'বাকি খাতা' : 'নগদ ক্যাশ'),
      refNo: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || (items && items.length > 0 ? items.map(i => `${i.nameBn || i.name} (${i.qty})`).join(', ') : 'মুদি সামগ্রী বিক্রয়'),
      items: items || [],
    };

    // 1. Update balances
    setBalances(prev => ({
      ...prev,
      cashInHand: paymentMethod === 'নগদ ক্যাশ' || paymentMethod === 'Cash' || !paymentMethod
        ? prev.cashInHand + numPaid
        : prev.cashInHand,
      bankBalance: paymentMethod !== 'নগদ ক্যাশ' && paymentMethod !== 'Cash' && paymentMethod !== 'বাকি খাতা'
        ? prev.bankBalance + numPaid
        : prev.bankBalance,
      totalDueReceivable: prev.totalDueReceivable + numDue,
      todaySales: prev.todaySales + numTotal,
    }));

    // 2. Decrement product stock in Mobile state
    if (items && items.length > 0) {
      setProducts(prev =>
        prev.map(p => {
          const matched = items.find(i => i.id === p.id);
          if (matched) {
            const nextStock = Math.max(0, (p.stock || 0) - Number(matched.qty || 1));
            return { ...p, stock: nextStock };
          }
          return p;
        })
      );
    }

    // 3. Update customer due if credit sale
    if (customerId && numDue > 0) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === customerId ? { ...c, dueAmount: (c.dueAmount || 0) + numDue } : c
        )
      );
    }

    setTransactions(prev => [newTxn, ...prev]);

    // 4. Synchronize with Desktop ERP storage keys (shared with PC software)
    try {
      const tid = activeTenantId;

      // Invoices
      const rawInvoices = localStorage.getItem(`ledgerx_${tid}_invoices`);
      const invList = rawInvoices ? JSON.parse(rawInvoices) : [];
      const desktopInvoice = {
        id: txnId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: dateStr,
        timestamp: now.toISOString(),
        customerId: customerId || null,
        customerName: customerName || 'সাধারণ খুচরা ক্রেতা',
        items: (items || []).map(i => ({
          id: i.id,
          name: i.nameBn || i.name,
          quantity: Number(i.qty || 1),
          ratePoisha: Math.round(Number(i.price || 0) * 100),
          totalPoisha: Math.round(Number(i.price || 0) * Number(i.qty || 1) * 100),
        })),
        subtotalPoisha: Math.round(numTotal * 100),
        grandTotalPoisha: Math.round(numTotal * 100),
        paidAmountPoisha: Math.round(numPaid * 100),
        dueAmountPoisha: Math.round(numDue * 100),
        paymentMethod: paymentMethod || 'CASH',
        status: 'COMPLETED',
      };
      localStorage.setItem(`ledgerx_${tid}_invoices`, JSON.stringify([desktopInvoice, ...invList]));

      // Products stock in Desktop format
      const rawProds = localStorage.getItem(`ledgerx_${tid}_products`);
      if (rawProds) {
        const prodList = JSON.parse(rawProds);
        const updatedProdList = prodList.map(p => {
          const matched = items?.find(i => i.id === p.id);
          if (matched) {
            const nextStock = Math.max(0, (p.currentStockInBaseUnit || p.stock || 0) - Number(matched.qty || 1));
            return { ...p, currentStockInBaseUnit: nextStock, stock: nextStock };
          }
          return p;
        });
        localStorage.setItem(`ledgerx_${tid}_products`, JSON.stringify(updatedProdList));
      }

      // Customer due in Desktop format
      if (customerId && numDue > 0) {
        const rawCusts = localStorage.getItem(`ledgerx_${tid}_customers`);
        if (rawCusts) {
          const custList = JSON.parse(rawCusts);
          const updatedCustList = custList.map(c =>
            c.id === customerId
              ? { ...c, currentDuePoisha: (c.currentDuePoisha || 0) + Math.round(numDue * 100) }
              : c
          );
          localStorage.setItem(`ledgerx_${tid}_customers`, JSON.stringify(updatedCustList));
        }
      }

      // Cash register in Desktop format
      if (numPaid > 0) {
        const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
        if (rawRegs) {
          const regs = JSON.parse(rawRegs);
          const updatedRegs = regs.map(r => {
            if (r.id === 'cash_drawer' || r.category === 'CASH') {
              return { ...r, balancePoisha: (r.balancePoisha || 0) + Math.round(numPaid * 100) };
            }
            return r;
          });
          localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        }
      }

      // Ledger Journal Entry
      const rawLedger = localStorage.getItem(`ledgerx_${tid}_ledger`);
      const ledgerList = rawLedger ? JSON.parse(rawLedger) : [];
      const desktopLedgerEntry = {
        id: `tx_${Date.now()}`,
        timestamp: now.toISOString(),
        type: 'SALE_INVOICE',
        title: isFullDue ? 'বাকিতে বিক্রয়' : 'নগদ বিক্রয় (মোবাইল POS)',
        voucherNumber: desktopInvoice.invoiceNumber,
        partyName: customerName || 'সাধারণ খুচরা ক্রেতা',
        amountPoisha: Math.round(numTotal * 100),
        walletName: paymentMethod || 'নগদ ক্যাশবাক্স',
        isCredit: isFullDue,
        status: 'COMPLETED',
      };
      localStorage.setItem(`ledgerx_${tid}_ledger`, JSON.stringify([desktopLedgerEntry, ...ledgerList]));

      notifyUnifiedStore();
    } catch (e) {
      console.warn('[MobileAppContext] Desktop ERP sync warning:', e);
    }

    // Voice announcement
    soundbox.announce({
      type: isFullDue ? 'due_entry' : 'sale',
      amount: numTotal,
      partyName: customerName,
      language,
    });

    setSelectedTransaction(newTxn);
    return newTxn;
  };

  // 2. Due Collection Transaction (টাকা পেলেন)
  const recordDueCollection = ({ customerId, customerName, amount, paymentMethod, note }) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const numAmount = Number(amount || 0);

    const newTxn = {
      id: txnId,
      customerId: customerId || null,
      type: 'credit_collection',
      category: 'বকেয়া আদায়',
      titleBn: `বকেয়া আদায় - ${customerName}`,
      titleEn: `Due Collection - ${customerName}`,
      partyName: customerName,
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: dateStr,
      flow: 'in',
      status: 'সফল',
      paymentMethod: paymentMethod || 'নগদ ক্যাশ',
      refNo: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'বকেয়া খাতার পাওনা গ্রহণ',
    };

    setBalances(prev => ({
      ...prev,
      cashInHand: paymentMethod === 'নগদ ক্যাশ' || paymentMethod === 'Cash' || !paymentMethod
        ? prev.cashInHand + numAmount
        : prev.cashInHand,
      bankBalance: paymentMethod !== 'নগদ ক্যাশ' && paymentMethod !== 'Cash'
        ? prev.bankBalance + numAmount
        : prev.bankBalance,
      totalDueReceivable: Math.max(0, prev.totalDueReceivable - numAmount),
    }));

    if (customerId) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === customerId ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) - numAmount) } : c
        )
      );
    }

    setTransactions(prev => [newTxn, ...prev]);

    // Synchronize Desktop ERP storage
    try {
      const tid = activeTenantId;
      if (customerId) {
        const rawCusts = localStorage.getItem(`ledgerx_${tid}_customers`);
        if (rawCusts) {
          const custList = JSON.parse(rawCusts);
          const updatedCustList = custList.map(c =>
            c.id === customerId
              ? { ...c, currentDuePoisha: Math.max(0, (c.currentDuePoisha || 0) - Math.round(numAmount * 100)) }
              : c
          );
          localStorage.setItem(`ledgerx_${tid}_customers`, JSON.stringify(updatedCustList));
        }
      }

      // Cash register
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: (r.balancePoisha || 0) + Math.round(numAmount * 100) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
      }

      // Desktop Ledger
      const rawLedger = localStorage.getItem(`ledgerx_${tid}_ledger`);
      const ledgerList = rawLedger ? JSON.parse(rawLedger) : [];
      const desktopLedgerEntry = {
        id: `tx_${Date.now()}`,
        timestamp: now.toISOString(),
        type: 'CUSTOMER_PABO',
        title: 'বাকি খাতা জমা (আদায়)',
        voucherNumber: `COL-${Date.now().toString().slice(-4)}`,
        partyName: customerName,
        amountPoisha: Math.round(numAmount * 100),
        walletName: paymentMethod || 'নগদ ক্যাশবাক্স',
        isCredit: false,
        status: 'COMPLETED',
      };
      localStorage.setItem(`ledgerx_${tid}_ledger`, JSON.stringify([desktopLedgerEntry, ...ledgerList]));

      notifyUnifiedStore();
    } catch (e) {}

    soundbox.announce({
      type: 'credit_collection',
      amount: numAmount,
      partyName: customerName,
      language,
    });

    setSelectedTransaction(newTxn);
    return newTxn;
  };

  // 3. New Due Entry (নয়া বাকি বৃদ্ধি)
  const recordDueEntry = ({ customerId, customerName, amount, note, items }) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const numAmount = Number(amount || 0);

    const newTxn = {
      id: txnId,
      customerId: customerId || null,
      type: 'due_entry',
      category: 'বাকিতে বিক্রয়',
      titleBn: `বাকিতে মালামাল বিক্রয় - ${customerName}`,
      titleEn: `Credit Given - ${customerName}`,
      partyName: customerName,
      amount: numAmount,
      paidAmount: 0,
      dueAmount: numAmount,
      timestamp: `আজ ${timeStr}`,
      date: dateStr,
      flow: 'neutral',
      status: 'বকেয়া যুক্ত',
      paymentMethod: 'বাকি খাতা',
      refNo: `KH-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'খাতায় নতুন বাকি হিসাব যুক্ত করা হলো',
      items: items || [],
    };

    setBalances(prev => ({
      ...prev,
      totalDueReceivable: prev.totalDueReceivable + numAmount,
      todaySales: prev.todaySales + numAmount,
    }));

    if (customerId) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === customerId ? { ...c, dueAmount: (c.dueAmount || 0) + numAmount } : c
        )
      );
    }

    setTransactions(prev => [newTxn, ...prev]);

    // Synchronize Desktop ERP
    try {
      const tid = activeTenantId;
      if (customerId) {
        const rawCusts = localStorage.getItem(`ledgerx_${tid}_customers`);
        if (rawCusts) {
          const custList = JSON.parse(rawCusts);
          const updatedCustList = custList.map(c =>
            c.id === customerId
              ? { ...c, currentDuePoisha: (c.currentDuePoisha || 0) + Math.round(numAmount * 100) }
              : c
          );
          localStorage.setItem(`ledgerx_${tid}_customers`, JSON.stringify(updatedCustList));
        }
      }
      notifyUnifiedStore();
    } catch (e) {}

    soundbox.announce({
      type: 'due_entry',
      amount: numAmount,
      partyName: customerName,
      language,
    });

    setSelectedTransaction(newTxn);
    return newTxn;
  };

  // 4. Shop Expense Recording
  const recordExpense = ({ category, amount, payee, paymentMethod, note }) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const numAmount = Number(amount || 0);

    const newTxn = {
      id: txnId,
      customerId: null,
      type: 'expense',
      category: category || 'দোকান খরচ',
      titleBn: `${category || 'দোকান খরচ'} - ${payee || 'অন্যান্য'}`,
      titleEn: `${category || 'Shop Expense'} - ${payee || 'Other'}`,
      partyName: payee || 'ব্যয় প্রাপক',
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: dateStr,
      flow: 'out',
      status: 'সফল',
      paymentMethod: paymentMethod || 'ক্যাশবাক্স',
      refNo: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'দৈনিক পরিচালনা ব্যয়',
    };

    setBalances(prev => ({
      ...prev,
      cashInHand: paymentMethod === 'Bank Card' || paymentMethod === 'ব্যাংক'
        ? prev.cashInHand
        : Math.max(0, prev.cashInHand - numAmount),
      bankBalance: paymentMethod === 'Bank Card' || paymentMethod === 'ব্যাংক'
        ? Math.max(0, prev.bankBalance - numAmount)
        : prev.bankBalance,
      todayExpense: (prev.todayExpense || 0) + numAmount,
    }));

    setTransactions(prev => [newTxn, ...prev]);

    // Synchronize Desktop Registers & Ledger
    try {
      const tid = activeTenantId;
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - Math.round(numAmount * 100)) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
      }

      const rawLedger = localStorage.getItem(`ledgerx_${tid}_ledger`);
      const ledgerList = rawLedger ? JSON.parse(rawLedger) : [];
      const desktopLedgerEntry = {
        id: `tx_${Date.now()}`,
        timestamp: now.toISOString(),
        type: 'EXPENSE',
        title: `${category || 'দোকান খরচ'} - ${payee || 'অন্যান্য'}`,
        voucherNumber: newTxn.refNo,
        partyName: payee || 'ব্যয় প্রাপক',
        amountPoisha: Math.round(numAmount * 100),
        walletName: paymentMethod || 'নগদ ক্যাশবাক্স',
        isCredit: true,
        status: 'COMPLETED',
      };
      localStorage.setItem(`ledgerx_${tid}_ledger`, JSON.stringify([desktopLedgerEntry, ...ledgerList]));

      notifyUnifiedStore();
    } catch (e) {}

    soundbox.announce({
      type: 'expense',
      amount: numAmount,
      partyName: payee,
      language,
    });

    setSelectedTransaction(newTxn);
    return newTxn;
  };

  // 5. Supplier Wholesaler Payment (মহাজন দেনা পরিশোধ)
  const recordSupplierPayment = ({ supplierId, supplierName, amount, paymentMethod, note }) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const numAmount = Number(amount || 0);

    const newTxn = {
      id: txnId,
      customerId: null,
      type: 'supplier_pay',
      category: 'মহাজন পরিশোধ',
      titleBn: `মহাজন দেনা পরিশোধ - ${supplierName}`,
      titleEn: `Supplier Payment - ${supplierName}`,
      partyName: supplierName,
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: dateStr,
      flow: 'out',
      status: 'সফল',
      paymentMethod: paymentMethod || 'নগদ ক্যাশ',
      refNo: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'মহাজন মালামাল বিল পরিশোধ',
    };

    setBalances(prev => ({
      ...prev,
      cashInHand: paymentMethod === 'নগদ ক্যাশ' || paymentMethod === 'Cash' || !paymentMethod
        ? Math.max(0, prev.cashInHand - numAmount)
        : prev.cashInHand,
      bankBalance: paymentMethod !== 'নগদ ক্যাশ' && paymentMethod !== 'Cash'
        ? Math.max(0, prev.bankBalance - numAmount)
        : prev.bankBalance,
      totalPayable: Math.max(0, prev.totalPayable - numAmount),
    }));

    if (supplierId) {
      setSuppliers(prev =>
        prev.map(s =>
          s.id === supplierId ? { ...s, payable: Math.max(0, s.payable - numAmount) } : s
        )
      );
    }

    setTransactions(prev => [newTxn, ...prev]);

    // Synchronize Desktop ERP
    try {
      const tid = activeTenantId;
      if (supplierId) {
        const rawSups = localStorage.getItem(`ledgerx_${tid}_suppliers`);
        if (rawSups) {
          const supList = JSON.parse(rawSups);
          const updatedSupList = supList.map(s =>
            s.id === supplierId
              ? { ...s, currentDuePoisha: Math.max(0, (s.currentDuePoisha || s.balancePoisha || 0) - Math.round(numAmount * 100)) }
              : s
          );
          localStorage.setItem(`ledgerx_${tid}_suppliers`, JSON.stringify(updatedSupList));
        }
      }

      // Cash register
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - Math.round(numAmount * 100)) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
      }

      notifyUnifiedStore();
    } catch (e) {}

    soundbox.announce({
      type: 'expense',
      amount: numAmount,
      partyName: supplierName,
      language,
    });

    setSelectedTransaction(newTxn);
    return newTxn;
  };

  // 6. Cash Reconcile from Till Denomination Counter
  const reconcileCashTill = (countedAmount, note) => {
    const variance = countedAmount - balances.cashInHand;
    setBalances(prev => ({
      ...prev,
      cashInHand: countedAmount,
    }));

    // Sync to Desktop register
    try {
      const tid = activeTenantId;
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: Math.round(countedAmount * 100) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        notifyUnifiedStore();
      }
    } catch (e) {}

    soundbox.playSuccess ? soundbox.playSuccess() : soundbox.playChime();
    return {
      countedAmount,
      variance,
      success: true,
    };
  };

  // 7. Cash to Bank Transfer
  const transferCashToBank = (amount, bankName, note) => {
    const numAmount = Number(amount || 0);
    if (numAmount <= 0 || numAmount > balances.cashInHand) return false;

    setBalances(prev => ({
      ...prev,
      cashInHand: prev.cashInHand - numAmount,
      bankBalance: prev.bankBalance + numAmount,
    }));

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newTxn = {
      id: txnId,
      customerId: null,
      type: 'transfer',
      category: 'ব্যাংকে জমা',
      titleBn: `ক্যাশ থেকে ব্যাংক স্থানান্তর - ${bankName || 'ব্যাংক'}`,
      titleEn: `Cash to Bank Deposit`,
      partyName: bankName || 'ব্যাংক একাউন্ট',
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: now.toISOString().split('T')[0],
      flow: 'neutral',
      status: 'সফল',
      paymentMethod: 'ক্যাশবাক্স ➔ ব্যাংক',
      refNo: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'দোকানের উদ্বৃত্ত ক্যাশ ব্যাংকে স্থানান্তর',
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Sync Desktop Registers
    try {
      const tid = activeTenantId;
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - Math.round(numAmount * 100)) };
          }
          if (r.category === 'BANK') {
            return { ...r, balancePoisha: (r.balancePoisha || 0) + Math.round(numAmount * 100) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        notifyUnifiedStore();
      }
    } catch (e) {}

    soundbox.playChime();
    return true;
  };

  // 7b. Bank to Cash Withdrawal Transfer
  const transferBankToCash = (amount, bankName, note) => {
    const numAmount = Number(amount || 0);
    if (numAmount <= 0 || numAmount > balances.bankBalance) return false;

    setBalances(prev => ({
      ...prev,
      cashInHand: prev.cashInHand + numAmount,
      bankBalance: prev.bankBalance - numAmount,
    }));

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newTxn = {
      id: txnId,
      customerId: null,
      type: 'transfer',
      category: 'ব্যাংক থেকে উত্তোলন',
      titleBn: `ব্যাংক থেকে ক্যাশ উত্তোলন - ${bankName || 'ব্যাংক'}`,
      titleEn: `Bank to Cash Withdrawal`,
      partyName: bankName || 'ব্যাংক একাউন্ট',
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: now.toISOString().split('T')[0],
      flow: 'neutral',
      status: 'সফল',
      paymentMethod: 'ব্যাংক ➔ ক্যাশবাক্স',
      refNo: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'ব্যাংক থেকে ক্যাশবাক্সে নগদ টাকা উত্তোলন',
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Sync Desktop Registers
    try {
      const tid = activeTenantId;
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.id === 'cash_drawer' || r.category === 'CASH') {
            return { ...r, balancePoisha: (r.balancePoisha || 0) + Math.round(numAmount * 100) };
          }
          if (r.category === 'BANK') {
            return { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - Math.round(numAmount * 100)) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        notifyUnifiedStore();
      }
    } catch (e) {}

    soundbox.playSuccess ? soundbox.playSuccess() : soundbox.playChime();
    return true;
  };

  // 8. Stock Adjustment (Inventory)
  const updateProductStock = (productId, delta, reason) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const nextStock = Math.max(0, (p.stock || 0) + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    // Sync Desktop ERP product stock
    try {
      const tid = activeTenantId;
      const rawProds = localStorage.getItem(`ledgerx_${tid}_products`);
      if (rawProds) {
        const prodList = JSON.parse(rawProds);
        const updatedProdList = prodList.map(p => {
          if (p.id === productId) {
            const nextStock = Math.max(0, (p.currentStockInBaseUnit || p.stock || 0) + delta);
            return { ...p, currentStockInBaseUnit: nextStock, stock: nextStock };
          }
          return p;
        });
        localStorage.setItem(`ledgerx_${tid}_products`, JSON.stringify(updatedProdList));
        notifyUnifiedStore();
      }
    } catch (e) {}
  };

  // 9. Register New Customer (Shared with Desktop ERP)
  const addCustomer = (customerData) => {
    const newCust = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      nameBn: customerData.nameBn || customerData.nameEn,
      nameEn: customerData.nameEn || customerData.nameBn,
      phone: customerData.phone,
      avatarColor: customerData.avatarColor || '#E2136E',
      dueAmount: Number(customerData.openingDue || 0),
      creditLimit: Number(customerData.creditLimit || 15000),
      address: customerData.address || 'ঢাকা',
      lastActive: 'আজ',
    };

    setCustomers(prev => [newCust, ...prev]);
    if (newCust.dueAmount > 0) {
      setBalances(prev => ({
        ...prev,
        totalDueReceivable: prev.totalDueReceivable + newCust.dueAmount,
      }));
    }

    // Save to Desktop Customers Key
    try {
      const tid = activeTenantId;
      const rawCusts = localStorage.getItem(`ledgerx_${tid}_customers`);
      const custList = rawCusts ? JSON.parse(rawCusts) : [];
      const desktopCust = {
        id: newCust.id,
        customerCode: `CUST-${Date.now().toString().slice(-4)}`,
        name: newCust.nameBn,
        nameEn: newCust.nameEn,
        phone: newCust.phone,
        address: newCust.address,
        currentDuePoisha: Math.round(newCust.dueAmount * 100),
        creditLimitPoisha: Math.round(newCust.creditLimit * 100),
        status: 'ACTIVE',
      };
      localStorage.setItem(`ledgerx_${tid}_customers`, JSON.stringify([desktopCust, ...custList]));
      notifyUnifiedStore();
    } catch (e) {}

    return newCust;
  };

  // 10. Register New Supplier (Shared with Desktop ERP)
  const addSupplier = (supplierData) => {
    const newSup = {
      id: `sup-${Date.now().toString().slice(-4)}`,
      nameBn: supplierData.nameBn || supplierData.nameEn,
      nameEn: supplierData.nameEn || supplierData.nameBn,
      phone: supplierData.phone,
      payable: Number(supplierData.openingPayable || 0),
      category: supplierData.category || 'সাধারণ সরবরাহকারী',
    };

    setSuppliers(prev => [newSup, ...prev]);
    if (newSup.payable > 0) {
      setBalances(prev => ({
        ...prev,
        totalPayable: prev.totalPayable + newSup.payable,
      }));
    }

    // Save to Desktop Suppliers Key
    try {
      const tid = activeTenantId;
      const rawSups = localStorage.getItem(`ledgerx_${tid}_suppliers`);
      const supList = rawSups ? JSON.parse(rawSups) : [];
      const desktopSup = {
        id: newSup.id,
        name: newSup.nameBn,
        phone: newSup.phone,
        category: newSup.category,
        currentDuePoisha: Math.round(newSup.payable * 100),
        balancePoisha: Math.round(newSup.payable * 100),
      };
      localStorage.setItem(`ledgerx_${tid}_suppliers`, JSON.stringify([desktopSup, ...supList]));
      notifyUnifiedStore();
    } catch (e) {}

    return newSup;
  };

  // 11. Supplier Wholesale Purchase (Increases Inventory Stock & Updates Supplier Payable in Desktop ERP)
  const recordSupplierPurchase = ({ supplierId, supplierName, items, totalAmount, paidAmount = 0, note }) => {
    const txnId = `PUR-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const numTotal = Number(totalAmount || 0);
    const numPaid = Number(paidAmount || 0);
    const numPayable = Math.max(0, numTotal - numPaid);

    // Update stock of items
    if (items && items.length > 0) {
      setProducts(prev =>
        prev.map(p => {
          const match = items.find(i => i.id === p.id);
          if (match) {
            return { ...p, stock: (p.stock || 0) + Number(match.qty || 1) };
          }
          return p;
        })
      );
    }

    // Update supplier payable
    if (supplierId) {
      setSuppliers(prev =>
        prev.map(s => (s.id === supplierId ? { ...s, payable: (s.payable || 0) + numPayable } : s))
      );
    }

    setBalances(prev => ({
      ...prev,
      totalPayable: prev.totalPayable + numPayable,
      cashInHand: Math.max(0, prev.cashInHand - numPaid),
    }));

    const newTxn = {
      id: txnId,
      type: 'purchase',
      category: 'মালামাল ক্রয়',
      titleBn: `মহাজন থেকে পণ্য ক্রয় - ${supplierName}`,
      titleEn: `Stock Purchase - ${supplierName}`,
      partyName: supplierName,
      amount: numTotal,
      paidAmount: numPaid,
      dueAmount: numPayable,
      timestamp: `আজ ${timeStr}`,
      date: now.toISOString().split('T')[0],
      flow: 'out',
      status: 'স্টক যুক্ত',
      paymentMethod: numPaid > 0 ? 'আংশিক পরিশোধ' : 'মহাজন বাকি',
      refNo: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note || 'গুদামে নতুন মালামাল এন্ট্রি',
      items: items || [],
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Synchronize Desktop ERP stock and supplier payable
    try {
      const tid = activeTenantId;

      // Update product stocks in Desktop format
      if (items && items.length > 0) {
        const rawProds = localStorage.getItem(`ledgerx_${tid}_products`);
        if (rawProds) {
          const prodList = JSON.parse(rawProds);
          const updatedProdList = prodList.map(p => {
            const match = items.find(i => i.id === p.id);
            if (match) {
              const nextStock = (p.currentStockInBaseUnit || p.stock || 0) + Number(match.qty || 1);
              return { ...p, currentStockInBaseUnit: nextStock, stock: nextStock };
            }
            return p;
          });
          localStorage.setItem(`ledgerx_${tid}_products`, JSON.stringify(updatedProdList));
        }
      }

      // Update supplier in Desktop format
      if (supplierId) {
        const rawSups = localStorage.getItem(`ledgerx_${tid}_suppliers`);
        if (rawSups) {
          const supList = JSON.parse(rawSups);
          const updatedSupList = supList.map(s =>
            s.id === supplierId
              ? { ...s, currentDuePoisha: (s.currentDuePoisha || s.balancePoisha || 0) + Math.round(numPayable * 100) }
              : s
          );
          localStorage.setItem(`ledgerx_${tid}_suppliers`, JSON.stringify(updatedSupList));
        }
      }

      // Update cash if paid
      if (numPaid > 0) {
        const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
        if (rawRegs) {
          const regs = JSON.parse(rawRegs);
          const updatedRegs = regs.map(r => {
            if (r.id === 'cash_drawer' || r.category === 'CASH') {
              return { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - Math.round(numPaid * 100)) };
            }
            return r;
          });
          localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        }
      }

      notifyUnifiedStore();
    } catch (e) {}

    soundbox.announce({
      type: 'expense',
      amount: numTotal,
      partyName: supplierName,
      language,
    });

    return newTxn;
  };

  // 12. Cheque Clearance (Credits Bank Balance and logs transaction in Desktop ERP)
  const clearCheque = ({ chequeId, bankName, amount }) => {
    const numAmount = Number(amount || 0);
    setBalances(prev => ({
      ...prev,
      bankBalance: prev.bankBalance + numAmount,
    }));

    const txnId = `CHQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newTxn = {
      id: txnId,
      customerId: null,
      type: 'cheque_clear',
      category: 'চেক ক্লিয়ারিং',
      titleBn: `ব্যাংক চেক ক্লিয়ার - ${bankName || 'ব্যাংক'}`,
      titleEn: `Cheque Cleared - ${bankName}`,
      partyName: bankName || 'ব্যাংক',
      amount: numAmount,
      paidAmount: numAmount,
      dueAmount: 0,
      timestamp: `আজ ${timeStr}`,
      date: now.toISOString().split('T')[0],
      flow: 'in',
      status: 'ক্লিয়ার্ড',
      paymentMethod: 'ব্যাংক চেক',
      refNo: `CHQ-${Math.floor(1000 + Math.random() * 9000)}`,
      note: 'ব্যাংক একাউন্টে চেক নিষ্পত্তি ও টাকা ক্রেডিট',
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Update Desktop Bank Register
    try {
      const tid = activeTenantId;
      const rawRegs = localStorage.getItem(`ledgerx_${tid}_registers`);
      if (rawRegs) {
        const regs = JSON.parse(rawRegs);
        const updatedRegs = regs.map(r => {
          if (r.category === 'BANK') {
            return { ...r, balancePoisha: (r.balancePoisha || 0) + Math.round(numAmount * 100) };
          }
          return r;
        });
        localStorage.setItem(`ledgerx_${tid}_registers`, JSON.stringify(updatedRegs));
        notifyUnifiedStore();
      }
    } catch (e) {}

    return newTxn;
  };

  // 13. Send WhatsApp Reminder
  const sendWhatsAppReminder = (customer) => {
    const phone = (customer.phone || '').replace(/[^0-9]/g, '');
    const formatted = phone.startsWith('88') ? phone : `88${phone}`;
    const msg = isBn
      ? `আসসালামু আলাইকুম ${customer.nameBn}, ${shopInfo.shopNameBn} হতে আপনার বকেয়া বাকি ৳${customer.dueAmount} টাকা পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে। অনুগ্রহ করে দোকানে এসে অথবা বিকাশ/নগদ এর মাধ্যমে পরিশোধ করুন। ধন্যবাদ!`
      : `Dear ${customer.nameEn}, friendly reminder from ${shopInfo.shopNameEn}: your outstanding due balance is BDT ${customer.dueAmount}. Please settle at your earliest convenience. Thank you!`;

    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // 14. Add New Product (Synced with Desktop ERP)
  const addProduct = (newProduct) => {
    const tid = activeTenantId || 'store_001';
    setProducts(prev => {
      const updated = [newProduct, ...prev.filter(p => p.id !== newProduct.id)];
      try {
        localStorage.setItem(`${STORAGE_KEY}_PRODUCTS`, JSON.stringify(updated));
        const desktopProds = updated.map(p => ({
          id: p.id,
          sku: p.barcode || p.sku || p.id,
          name: p.nameBn || p.nameEn,
          nameEn: p.nameEn || p.nameBn,
          category: p.category || 'চাল ও ডাল',
          baseUnit: p.unit || 'কেজি',
          sellingPriceBasePoisha: Math.round((p.price || 0) * 100),
          costPriceBasePoisha: Math.round((p.costPrice || p.buyPrice || 0) * 100),
          currentStockInBaseUnit: Number(p.stock || 0),
          lowStockAlertThreshold: Number(p.minAlert || 10),
        }));
        localStorage.setItem(`ledgerx_${tid}_products`, JSON.stringify(desktopProds));
        notifyUnifiedStore();
      } catch (e) {}
      return updated;
    });
  };

  // 15. Reset to Factory Defaults
  const resetToFactoryDefaults = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_SHOP`);
      localStorage.removeItem(`${STORAGE_KEY}_BALANCES`);
      localStorage.removeItem(`${STORAGE_KEY}_CUSTOMERS`);
      localStorage.removeItem(`${STORAGE_KEY}_SUPPLIERS`);
      localStorage.removeItem(`${STORAGE_KEY}_PRODUCTS`);
      localStorage.removeItem(`${STORAGE_KEY}_TXNS`);
    } catch (e) {}

    setShopInfo(initialShopInfo);
    setBalances(initialBalances);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setProducts(initialProducts);
    setTransactions(initialTransactions);
  };

  return (
    <MobileAppContext.Provider
      value={{
        activeTenantId,
        availableTenants,
        switchTenant,
        addNewTenant,
        language,
        setLanguage,
        theme,
        setTheme,
        viewMode,
        setViewMode,
        shopInfo,
        setShopInfo,
        balances,
        setBalances,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        products,
        setProducts,
        transactions,
        setTransactions,
        currentScreen,
        setCurrentScreen,
        screenHistory,
        screenParams,
        navigateTo,
        goBack,
        activeTab,
        setActiveTab,
        selectedTransaction,
        setSelectedTransaction,
        selectedCustomer,
        setSelectedCustomer,
        selectedSupplier,
        setSelectedSupplier,
        soundboxEnabled,
        setSoundboxEnabled,
        toast,
        setToast,
        showToast,
        showStoreModal,
        setShowStoreModal,
        balanceVisible,
        toggleBalancePeek,
        getCustomerTransactions,
        recordSale,
        recordDueCollection,
        recordDueEntry,
        recordExpense,
        recordSupplierPayment,
        recordSupplierPurchase,
        clearCheque,
        reconcileCashTill,
        transferCashToBank,
        transferBankToCash,
        updateProductStock,
        addProduct,
        addCustomer,
        addSupplier,
        sendWhatsAppReminder,
        resetToFactoryDefaults,
        registerBackHandler,
        celebrationState,
        triggerCelebration,
        dismissCelebration,
      }}
    >
      {children}
    </MobileAppContext.Provider>
  );
}

export function useMobileApp() {
  const ctx = useContext(MobileAppContext);
  if (!ctx) {
    throw new Error('useMobileApp must be used within a MobileAppProvider');
  }
  return ctx;
}
