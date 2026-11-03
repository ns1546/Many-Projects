import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import { ShoppingCart, ShoppingBag, Search, PlusCircle, Printer, FileText, FileEdit, Trash2, SearchX, Download, Maximize2, Minimize2, X, RotateCcw } from 'lucide-react';
import { createShopSale, getShopSales, saveDailyClosingFull, getDailyClosings, createProductRequest, processShopReturn, getShopReturns, addExpenseEntry, getExpenseEntries, getTodaySalesData, getTodayExpenses, getTodayReturns } from '../../firebase/shopServices';
import { generateShopReceipt, printThermalHTMLReceipt } from '../../utils/receiptPDF';
import { downloadCSV } from '../../utils/csvExport';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import { useInventory } from '../../context/InventoryContext';
import toast from 'react-hot-toast';
import EcommerceGrid from '../../components/EcommerceGrid';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import { useIsMobile } from '../../hooks/useIsMobile';

// ─── Paginated Shop Sales History Sub-Component ───────────────────────────────
function ShopSalesHistoryTable({ salesHistory, loadingHistory, editModeEnabled, setEditingDoc, profile, fetchHistory }) {
  const [search, setSearch] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('');

  const filtered = salesHistory.filter(s => {
    let match = true;
    if (search) {
      match = match && ((s.receiptNo || '').toLowerCase().includes(search.toLowerCase()) || (s.customerName || '').toLowerCase().includes(search.toLowerCase()));
    }
    if (payMethod) {
      match = match && (s.paymentMethod === payMethod);
    }
    if (dateFrom) {
      const saleDate = s.saleDate?.toDate?.() || new Date(0);
      if (saleDate < new Date(dateFrom)) match = false;
    }
    if (dateTo) {
      const saleDate = s.saleDate?.toDate?.() || new Date(0);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (saleDate > toDate) match = false;
    }
    return match;
  });
  const pg = usePagination(filtered, 25);
  const handleCSV = () => {
    downloadCSV(salesHistory.map(s => ({
      'Receipt No': s.receiptNo, 'Customer': s.customerName || '—',
      'Total (৳)': s.totalAmount, 'Net (৳)': s.netAmount || s.totalAmount,
      'Discount (৳)': s.discount || 0, 'Payment': s.paymentMethod || 'Cash',
      'Sold By': s.soldByName, 'Date': s.saleDate?.toDate?.()?.toLocaleString() || '—',
    })), `shop-sales-${new Date().toLocaleDateString('en-CA')}.csv`);
    toast.success('Exported ' + salesHistory.length + ' records.');
  };
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}><div className="card-title" style={{ marginBottom: 0 }}>Shop Sales History</div></div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Date From" />
          <span className="text-muted" style={{ fontSize: 12 }}>to</span>
          <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={dateTo} onChange={e => setDateTo(e.target.value)} title="Date To" />
          
          <select className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34, width: 130 }} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>

          <div className="search-bar" style={{ flex: '0 0 200px', height: 34 }}>
            <span className="search-icon"></span>
            <input placeholder="Search receipt, customer..." style={{ fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')}>✕</button>}
          </div>
          
          <button className="btn btn-secondary btn-sm" onClick={handleCSV} style={{ height: 34, display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Export</button>
        </div>
      </div>
      {loadingHistory ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}>
          <div className="skeleton skeleton-row" style={{ width: '100%' }}></div>
          <div className="skeleton skeleton-row" style={{ width: '100%' }}></div>
          <div className="skeleton skeleton-row" style={{ width: '100%' }}></div>
        </div>
      )
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">{search ? 'No matching sales' : 'No sales yet'}</div></div>
        : (
          <>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Receipt</th><th>Customer</th><th>Items</th><th>Total</th><th>Net</th><th>Method</th><th>Sold By</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {pg.paged.map(s => {
                    const isDeleted = s.status === 'deleted';
                    return (
                      <tr key={s.id} style={{ opacity: isDeleted ? 0.5 : 1 }}>
                        <td className="td-bold" style={{ textDecoration: isDeleted ? 'line-through' : 'none' }}>{s.receiptNo}</td>
                        <td>{s.customerName || '—'}</td>
                        <td><span className="badge badge-teal">{s.items?.length || 0}</span></td>
                        <td>৳{(s.totalAmount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(s.netAmount || s.totalAmount || 0).toLocaleString()}</td>
                        <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{s.paymentMethod || 'Cash'}</span></td>
                        <td>{s.soldByName}</td>
                        <td className="text-sm text-muted">{s.saleDate?.toDate?.()?.toLocaleString() || '—'}</td>
                        <td>
                          {isDeleted ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span className="badge badge-red">VOIDED</span>
                              {editModeEnabled && (
                                <button className="btn btn-primary btn-sm btn-icon" title="Restore" onClick={async () => {
                                  if (window.confirm('Restore this sale?')) {
                                    try {
                                      const { quickRestoreDocument } = await import('../../firebase/auditServices');
                                      await quickRestoreDocument('shop_sales', s.id, profile.uid, profile.name || profile.email);
                                      toast.success('Sale restored'); fetchHistory();
                                    } catch (e) { toast.error('Restore failed: ' + e.message); }
                                  }
                                }}><RotateCcw size={14}/></button>
                              )}
                            </div>
                          ) : s.status === 'delete_requested' ? <span className="badge badge-amber">PENDING VOID</span> : (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-secondary btn-sm" title="Print 80mm ESC/POS Thermal Receipt" onClick={() => printThermalHTMLReceipt(s, 'Shop Division')}><Printer size={14} /></button>
                              <button className="btn btn-ghost btn-sm" title="Download Super-Shop Receipt PDF" onClick={() => generateShopReceipt(s, [], 'customer')}><Download size={14} /></button>
                              {editModeEnabled && (
                                <button className="btn btn-primary btn-sm" title="Admin Edit" onClick={() => setEditingDoc({ doc: s, collection: 'shop_sales' })}><FileEdit size={14} /></button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                const reason = window.prompt('Reason for voiding this sale?');
                                if (reason) {
                                  try {
                                    const { requestSoftDeleteDocument } = await import('../../firebase/auditServices');
                                    await requestSoftDeleteDocument('shop_sales', s.id, reason, profile.uid, profile.name || profile.email);
                                    toast.success('Void request sent for approval.'); fetchHistory();
                                  } catch (e) { toast.error('Failed: ' + e.message); }
                                }
                              }}><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={pg.page} totalPages={pg.totalPages} total={pg.total}
              startRecord={pg.startRecord} endRecord={pg.endRecord} perPage={pg.perPage}
              onPageChange={pg.goTo} onPerPageChange={pg.setPerPage} onExportCSV={handleCSV} />
          </>
        )}
    </div>
  );
}

// --- Advanced POS Sub-functions ---
const calculateDynamicDiscount = (items) => {
  const totalQty = items.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = items.reduce((sum, it) => sum + (it.qty * (Number(it.unitPrice) || 0)), 0);
  if (totalQty >= 50) return Math.floor(subtotal * 0.02);
  return 0;
};


import useMobileBottomSheet from '../../hooks/useMobileBottomSheet';

export default function ShopSales() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const { entities = [], shopStock = {}, loading: inventoryLoading, refreshInventory = () => {} } = useInventory();
  
  const isMobile = useIsMobile();
  const { isOpen: mobileCartOpen, openSheet: openMobileCart, closeSheet: closeMobileCart } = useMobileBottomSheet('cart');
  const [tab, setTab] = useState('new');
  const [editingDoc, setEditingDoc] = useState(null); // { doc, collection }
  const searchInputRef = useRef(null);

  const inventory = useMemo(() => {
    return entities.map(e => {
      const eid = e.id || e.entityId;
      const stock = shopStock[eid] || {};
      return { ...e, entityId: eid, qty: stock.qty || 0, sellingPrice: stock.sellingPrice || '' };
    });
  }, [entities, shopStock]);

  const [salesHistory, setSalesHistory] = useState([]);
  const [closings, setClosings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingClosings, setLoadingClosings] = useState(false);

  // Returns
  const [returns, setReturns] = useState([]);
  const [retSearch, setRetSearch] = useState('');
  const [retDateFrom, setRetDateFrom] = useState('');
  const [retDateTo, setRetDateTo] = useState('');
  const [retPayMethod, setRetPayMethod] = useState('');

  const filteredReturns = React.useMemo(() => {
    return returns.filter(r => {
      let match = true;
      if (retSearch) {
        match = match && ((r.returnReceiptNo || '').toLowerCase().includes(retSearch.toLowerCase()) || 
                          (r.originalReceiptNo || '').toLowerCase().includes(retSearch.toLowerCase()) ||
                          (r.buyerName || '').toLowerCase().includes(retSearch.toLowerCase()));
      }
      if (retPayMethod) {
        match = match && (r.refundMethod === retPayMethod);
      }
      if (retDateFrom) {
        const d = r.returnDate?.toDate?.() || new Date(0);
        if (d < new Date(retDateFrom)) match = false;
      }
      if (retDateTo) {
        const d = r.returnDate?.toDate?.() || new Date(0);
        const t = new Date(retDateTo);
        t.setHours(23, 59, 59, 999);
        if (d > t) match = false;
      }
      return match;
    });
  }, [returns, retSearch, retDateFrom, retDateTo, retPayMethod]);

  const retPg = usePagination(filteredReturns, 15);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [returnCustomer, setReturnCustomer] = useState('');
  const [returnOriginalReceipt, setReturnOriginalReceipt] = useState('');
  const [returnRestock, setReturnRestock] = useState(true);
  const [returnReason, setReturnReason] = useState('');
  const [returnCondition, setReturnCondition] = useState('Unopened/Resalable');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Cart state
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [manualDiscount, setManualDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [isReceiptFullscreen, setIsReceiptFullscreen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');

  // Search
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // --- Barcode Scanner Listener & Hotkeys ---
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  useEffect(() => {
    if (tab !== 'new') return;
    const handleKeyDown = (e) => {
      // Hotkeys (ignore if in modal or text input for certain keys)
      const inInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      
      // F4 or Alt+S: Focus search
      if (e.key === 'F4' || (e.altKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      
      // Escape: Clear search / Close modals
      if (e.key === 'Escape') {
        setSearchQ('');
        searchInputRef.current?.blur();
        return;
      }

      // F12 or Ctrl+Enter: Trigger Checkout
      if (e.key === 'F12' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        document.getElementById('btn-confirm-shop-sale')?.click();
        return;
      }

      // If in input, allow Enter to add top search result if available
      if (inInput && e.key === 'Enter' && searchQ && searchResults.length > 0) {
        e.preventDefault();
        addItem(searchResults[0]);
        setSearchQ('');
        return;
      }

      if (inInput) return; // don't process barcode if typing in input
      
      if (e.key === 'F9') {
        e.preventDefault();
        document.getElementById('btn-confirm-shop-sale')?.click();
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) {
          const found = inventory.find(inv => inv.entityId === barcodeBuffer || (inv.barcode && inv.barcode === barcodeBuffer));
          if (found) {
            addItem(found);
            toast.success(`Scanned: ${found.brand} ${found.productType}`);
          } else {
            toast.error(`Barcode not found in shop: ${barcodeBuffer}`);
          }
        }
        setBarcodeBuffer('');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcodeBuffer(prev => prev + e.key);
      }
    };
    
    const timeout = setTimeout(() => setBarcodeBuffer(''), 100);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcodeBuffer, inventory, tab, searchQ, searchResults]);

  const [closingAmount, setClosingAmount] = useState('');
  const [closingSubmitting, setClosingSubmitting] = useState(false);
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const closePg = usePagination(closings, 15);

  // Expense tracking
  const [expenses, setExpenses] = useState([]);
  const expPg = usePagination(expenses, 15);
  const [expForm, setExpForm] = useState({ purpose: '', amount: '', category: 'General' });
  const [expSubmitting, setExpSubmitting] = useState(false);

  // Today's reconciliation data
  const [todaySalesData, setTodaySalesData] = useState([]);
  const [todayExpenseData, setTodayExpenseData] = useState([]);
  const [todayReturnData, setTodayReturnData] = useState([]);
  const [loadingReconcile, setLoadingReconcile] = useState(false);

  // Product request
  const [reqForm, setReqForm] = useState({ brand: '', productType: '', flavor: '', weight: '', lifeStage: 'All Life Stages', reason: '', qty: '', sellingPrice: '' });
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getShopSales();
      setSalesHistory(data);
    } catch (e) {
      toast.error('Failed to load sales history');
    }
    setLoadingHistory(false);
  }, []);

  const fetchClosings = useCallback(async () => {
    setLoadingClosings(true);
    try {
      const data = await getDailyClosings();
      setClosings(data);
    } catch (e) {
      toast.error('Failed to load closings');
    }
    setLoadingClosings(false);
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoadingReturns(true);
    try {
      const data = await getShopReturns();
      setReturns(data);
    } catch (e) {
      toast.error('Failed to load returns');
    }
    setLoadingReturns(false);
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenseEntries();
      setExpenses(data);
    } catch (e) {
      toast.error('Failed to load expenses');
    }
  }, []);

  const fetchReconciliation = useCallback(async () => {
    setLoadingReconcile(true);
    try {
      const [sales, exps, rets] = await Promise.all([
        getTodaySalesData(closingDate),
        getTodayExpenses(closingDate),
        getTodayReturns(closingDate)
      ]);
      setTodaySalesData(sales);
      setTodayExpenseData(exps);
      setTodayReturnData(rets);
    } catch (e) {
      toast.error('Failed to load reconciliation data');
    }
    setLoadingReconcile(false);
  }, [closingDate]);

  useEffect(() => { fetchReconciliation(); }, []);
  useEffect(() => {
    if (tab === 'history') fetchHistory();
    if (tab === 'closing') { fetchClosings(); fetchReconciliation(); fetchExpenses(); }
    if (tab === 'returns') fetchReturns();
    if (tab === 'expenses') { fetchExpenses(); }
  }, [tab]);

  useEffect(() => {
    if (tab === 'closing') fetchReconciliation();
  }, [closingDate]);

  const fuse = useMemo(() => new Fuse(inventory, {
    keys: ['brand', 'productType', 'flavor', 'weight'],
    threshold: 0.35,
  }), [inventory]);

  const fuseReturns = useMemo(() => new Fuse(entities.length ? entities : inventory, {
    keys: ['brand', 'productType', 'flavor', 'weight'],
    threshold: 0.35,
  }), [entities, inventory]);

  // Top products recommendation (mock for smart suggestions)
  const topProducts = useMemo(() => {
    return [...inventory].sort((a,b) => (b.qty || 0) - (a.qty || 0)).slice(0, 10);
  }, [inventory]);

  useEffect(() => {
    const list = tab === 'returns' ? (entities.length ? entities : inventory) : inventory.filter(i => (i.qty || 0) > 0);
    const activeFuse = tab === 'returns' ? fuseReturns : fuse;
    if (!searchQ.trim()) { 
      setSearchResults(tab === 'new' ? topProducts : list); 
      return; 
    }
    const results = activeFuse.search(searchQ).map(r => r.item);
    setSearchResults(results);
  }, [searchQ, fuse, fuseReturns, inventory, entities, tab]);

  const addItem = (inv) => {
    if (tab === 'returns') {
      if (returnItems.find(i => i.entityId === inv.entityId)) { toast.error('Already in return list.'); return; }
      setReturnItems(p => [...p, {
        entityId: inv.entityId,
        productName: `${inv.brand} ${inv.productType}${inv.flavor ? ' — ' + inv.flavor : ''}${inv.weight ? ' ' + inv.weight : ''}`,
        brand: inv.brand, productType: inv.productType, flavor: inv.flavor, weight: inv.weight, unit: inv.unit,
        qty: 1, unitPrice: inv.sellingPrice || 0,
      }]);
      return;
    }
    
    if (items.find(i => i.entityId === inv.entityId)) { toast.error('Already in cart.'); return; }
    setItems(p => [...p, {
      entityId: inv.entityId,
      productName: `${inv.brand} ${inv.productType}${inv.flavor ? ' — ' + inv.flavor : ''}${inv.weight ? ' ' + inv.weight : ''}`,
      brand: inv.brand, productType: inv.productType, flavor: inv.flavor, weight: inv.weight, unit: inv.unit,
      qty: 1, unitPrice: inv.sellingPrice || '', availableQty: inv.qty,
      managerPrice: inv.sellingPrice || ''
    }]);
  };

  const updateItem = (idx, field, val) => {
    setItems(p => p.map((it, i) => {
      if (i !== idx) return it;
      if (field === 'qty') return { ...it, qty: Number(val) };
      if (field === 'unitPrice') return { ...it, unitPrice: Math.round(Number(val)) }; // Always whole ৳
      return { ...it, [field]: val };
    }));
  };
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));

  const updateReturnItem = (idx, field, val) => {
    setReturnItems(p => p.map((it, i) => i === idx ? { ...it, [field]: field === 'qty' ? Number(val) : Number(val) } : it));
  };
  const removeReturnItem = (idx) => setReturnItems(p => p.filter((_, i) => i !== idx));

  const subtotal = items.reduce((a, it) => a + it.qty * (Number(it.unitPrice) || 0), 0);
  
  const dynamicDiscountAmt = calculateDynamicDiscount(items);
  
  // Discount: support both flat (৳) and percentage
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'pct'
  let manualDiscountAmt = 0;
  if (discountType === 'pct') {
    const pct = parseFloat(manualDiscount) || 0;
    manualDiscountAmt = Math.round(subtotal * (pct / 100));
  } else {
    manualDiscountAmt = Math.round(parseFloat(manualDiscount) || 0);
  }
  
  const totalDiscount = Math.max(dynamicDiscountAmt, manualDiscountAmt);
  const netTotal = Math.round(subtotal - totalDiscount);

  const handleSale = async () => {
    if (!items.length) { toast.error('Cart is empty.'); return; }
    for (const it of items) {
      if (it.qty <= 0) { toast.error('Invalid quantity.'); return; }
      if (it.qty > it.availableQty) { toast.error(`Insufficient stock: ${it.productName}`); return; }
      if (it.unitPrice <= 0) { toast.error('Invalid price.'); return; }
    }
    setSubmitting(true);
    try {
      const finalPaymentMethod = paymentMethod === 'Other' ? (customPaymentMethod || 'Other') : paymentMethod;
      const saleData = { 
        items, 
        customerName, 
        discount: totalDiscount, 
        totalAmount: subtotal, 
        netAmount: netTotal,
        paymentMethod: finalPaymentMethod,
        soldBy: profile.uid
      };
      const result = await createShopSale(saleData, profile.uid, profile.name || profile.email);
      setCompletedSale({ ...saleData, ...result, saleDate: { toDate: () => new Date() } });
      setItems([]); setCustomerName(''); setManualDiscount('');
      refreshInventory();
      toast.success(`Sale complete! ${result.receiptNo}`);
    } catch (err) { toast.error('Sale failed: ' + err.message); }
    setSubmitting(false);
  };

  const totalReturnAmount = returnItems.reduce((a, it) => a + it.qty * (Number(it.unitPrice) || 0), 0);

  const handleReturn = async () => {
    if (!returnItems.length) { toast.error('No items to return.'); return; }
    if (!returnReason.trim()) { toast.error('Please specify a return reason.'); return; }
    for (const it of returnItems) {
      if (it.qty <= 0) { toast.error('Invalid quantity.'); return; }
      if (it.unitPrice < 0) { toast.error('Invalid price.'); return; }
    }
    setReturnSubmitting(true);
    try {
      // Determine final restock state based on condition
      const isDamaged = returnCondition !== 'Unopened/Resalable';
      const finalRestock = isDamaged ? false : returnRestock;
      
      const returnDoc = { 
        items: returnItems, 
        buyerName: returnCustomer || 'Walk-in', 
        originalReceiptNo: returnOriginalReceipt || null,
        totalAmount: totalReturnAmount, 
        restock: finalRestock,
        returnReason,
        returnCondition,
        refundMethod 
      };
      await processShopReturn(returnDoc, profile.uid, profile.name || profile.email);
      setReturnItems([]); setReturnCustomer(''); setReturnOriginalReceipt(''); setReturnReason(''); setReturnCondition('Unopened/Resalable'); setReturnRestock(true);
      refreshInventory();
      fetchReturns();
      toast.success('Return processed & receipt generated.');
    } catch (err) { toast.error('Return failed: ' + err.message); }
    setReturnSubmitting(false);
  };

  const handleClosing = async (e) => {
    e.preventDefault();
    if (!closingAmount || Number(closingAmount) < 0) { toast.error('Enter a valid cash amount.'); return; }
    setClosingSubmitting(true);
    try {
      const systemSales = todaySalesData.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0);
      const totalExpenses = todayExpenseData.reduce((a, ex) => a + (ex.amount || 0), 0);
      const totalReturns = todayReturnData.reduce((a, r) => a + (r.totalAmount || 0), 0);
      const expectedCash = systemSales - totalExpenses - totalReturns;
      const reportedCash = Number(closingAmount);
      const discrepancy = reportedCash - expectedCash;
      await saveDailyClosingFull({
        cashAmount: reportedCash,
        systemSalesTotal: systemSales,
        totalExpenses,
        totalReturns,
        expectedCash,
        discrepancy,
        discrepancyFlag: Math.abs(discrepancy) > 0,
        salesCount: todaySalesData.length,
        expenseCount: todayExpenseData.length,
      }, profile.uid, profile.name || profile.email);
      toast.success(`Closing saved! ${discrepancy === 0 ? ' Cash matched.' : discrepancy > 0 ? ` Excess ৳${discrepancy.toLocaleString()}` : ` Short ৳${Math.abs(discrepancy).toLocaleString()}`}`);
      setClosingAmount('');
      fetchClosings();
    } catch { toast.error('Failed to save closing.'); }
    setClosingSubmitting(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expForm.purpose || !expForm.amount || Number(expForm.amount) <= 0) { toast.error('Purpose and amount required.'); return; }
    setExpSubmitting(true);
    try {
      await addExpenseEntry(expForm, profile.uid, profile.name || profile.email);
      toast.success('Expense logged!');
      setExpForm({ purpose: '', amount: '', category: 'General' });
      fetchExpenses();
      fetchReconciliation();
    } catch { toast.error('Failed to log expense.'); }
    setExpSubmitting(false);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!reqForm.brand || !reqForm.productType) { toast.error('Brand and Type are required.'); return; }
    setReqSubmitting(true);
    try {
      await createProductRequest(reqForm, profile.uid, profile.name || profile.email);
      toast.success('Request submitted to Admin/Chairman!');
      setReqForm({ brand: '', productType: '', flavor: '', weight: '', lifeStage: 'All Life Stages', reason: '', qty: '', sellingPrice: '' });
    } catch { toast.error('Failed to submit request.'); }
    setReqSubmitting(false);
  };

  const todaySales = salesHistory.filter(s => {
    const d = s.saleDate?.toDate?.();
    if (!d) return false;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const todayRevenue = todaySales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Shop Sales</h1>
          <p className="page-subtitle">Record sales, manage closing entries and product requests</p>
        </div>
      </div>

      <div className="tabs mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button id="tab-new-sale" className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}><ShoppingCart size={16} /> New Sale</button>
        <button id="tab-sale-history" className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><FileText size={16} /> History</button>
        <button id="tab-returns" className={`tab ${tab === 'returns' ? 'active' : ''}`} onClick={() => setTab('returns')}><ShoppingBag size={16} /> Returns</button>
        <button id="tab-expenses" className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}><FileText size={16} /> Expenses</button>
        <button id="tab-closing" className={`tab ${tab === 'closing' ? 'active' : ''}`} onClick={() => setTab('closing')}><FileText size={16} /> Daily Closing</button>
        <button id="tab-request" className={`tab ${tab === 'request' ? 'active' : ''}`} onClick={() => setTab('request')}><PlusCircle size={16} /> Request Product</button>
      </div>

      {tab === 'new' && (
        <div className="pos-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* E-Commerce Product Selection */}
            {inventoryLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }}></div>
                <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }}></div>
                <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }}></div>
                <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }}></div>
              </div>
            ) : (
              <EcommerceGrid
                items={searchResults}
                search={searchQ}
                onSearchChange={setSearchQ}
                searchInputRef={searchInputRef}
                getStockInfo={(item) => ({ qty: item.qty || 0, label: 'in stock' })}
              renderActions={(item) => (
                <button 
                  className="btn btn-primary w-full" 
                  style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                  onClick={() => addItem(item)}
                >
                   <PlusCircle size={16} /> Add to Cart
                </button>
              )}
              emptyMessage="No available products."
            />
            )}

            {/* Cart moved to right panel */}
          </div>

          {/* Right panel (Sticky / Mobile Bottom Sheet) */}
          <div className={isMobile ? `m-bottom-sheet ${mobileCartOpen ? 'open' : ''}` : ''} style={!isMobile ? { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 } : {}}>
            {isMobile && (
              <div className="m-bottom-sheet-overlay" onClick={closeMobileCart} />
            )}
            <div className={isMobile ? 'm-bottom-sheet-content' : ''} style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 16 } : {}}>
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', borderRadius: '20px 20px 0 0' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={18} /> Cart ({items.length})</div>
                  <button onClick={closeMobileCart} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                </div>
              )}
            {/* Cart */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={18} /> Cart</div>
                <span className="badge badge-teal">{items.length} items</span>
              </div>
              {items.length === 0 ? (
                <div className="empty-state" style={{ padding: '28px' }}><div className="empty-icon"><SearchX size={48} color="var(--text-muted)" /></div><div className="empty-title">Cart is empty</div></div>
              ) : items.map((it, idx) => (
                <div key={idx} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{it.brand} {it.productType}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{it.flavor} {it.weight} <span style={{ opacity: 0.5, margin: '0 4px' }}>•</span> Stock: {it.availableQty}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeItem(idx)} title="Remove item"><X size={14} /></button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <div className="form-group" style={{ flex: '0 0 70px', gap: '4px' }}>
                      <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty</label>
                      <input id={`cart-qty-${idx}`} type="number" className="form-input" style={{ padding: '8px', textAlign: 'center', fontWeight: 600, height: '36px' }} min="1" max={it.availableQty} value={it.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                    </div>
                    
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: '20px', fontWeight: 500 }}>×</div>
                    
                    <div className="form-group" style={{ flex: 1, gap: '4px' }}>
                      <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Price (৳)</span>
                        {it.managerPrice && (
                          <button type="button" style={{ background: 'none', border: 'none', padding: 0, fontSize: 10, color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }} onClick={() => import('react-hot-toast').then(m => m.default.success(`Manager Price: ৳${it.managerPrice}`, { icon: '💰' }))}>
                            View
                          </button>
                        )}
                      </label>
                      <input id={`cart-price-${idx}`} type="number" className="form-input" style={{ padding: '8px', height: '36px' }} min="0" step="1" value={it.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                    </div>
                    
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: '20px', fontWeight: 500 }}>=</div>
                    
                    <div className="form-group" style={{ flex: '0 0 90px', gap: '4px' }}>
                      <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Subtotal</label>
                      <div style={{ padding: '0 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--gold)', fontSize: 13, textAlign: 'right', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        ৳{(it.qty * (Number(it.unitPrice) || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title mb-3"> Customer</div>
              <div className="form-group">
                <label className="form-label">Customer Name (optional)</label>
                <input id="customer-name" className="form-input" placeholder="Walk-in customer" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
            </div>
            <div className="card">
              <div className="card-title mb-3"> Order Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text-muted">Subtotal</span>
                  <span style={{ fontWeight: 600 }}>৳{subtotal.toLocaleString()}</span>
                </div>
                {dynamicDiscountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--green)' }}>
                    <span>Auto Bulk Discount Applied</span>
                    <span>-৳{dynamicDiscountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => { setDiscountType('flat'); setManualDiscount(''); }}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: discountType === 'flat' ? 'var(--gold)' : 'var(--bg-elevated)', color: discountType === 'flat' ? '#000' : 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                    >৳ Flat</button>
                    <button
                      type="button"
                      onClick={() => { setDiscountType('pct'); setManualDiscount(''); }}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: discountType === 'pct' ? 'var(--teal)' : 'var(--bg-elevated)', color: discountType === 'pct' ? '#000' : 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                    >% Pct</button>
                    <input
                      id="sale-discount"
                      type="number"
                      className="form-input"
                      min="0"
                      max={discountType === 'pct' ? 100 : subtotal}
                      placeholder={discountType === 'pct' ? 'e.g. 10 (%)' : dynamicDiscountAmt > 0 ? `Auto: ৳${dynamicDiscountAmt}` : 'e.g. 50 (৳)'}
                      value={manualDiscount}
                      onChange={e => setManualDiscount(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                  {manualDiscountAmt > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>= ৳{manualDiscountAmt.toLocaleString()} discount applied</div>
                  )}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Net Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>৳{netTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title mb-3"> Payment Method</div>
              <div className="form-group">
                <select className="form-select mb-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
                {paymentMethod === 'Other' && (
                  <input type="text" className="form-input mt-2" placeholder="Enter payment method" value={customPaymentMethod} onChange={e => setCustomPaymentMethod(e.target.value)} />
                )}
              </div>
            </div>

            <button id="btn-confirm-shop-sale" className="btn btn-primary btn-lg w-full" onClick={handleSale} disabled={submitting || !items.length}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {submitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Confirm Sale'}
                {!submitting && <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.2)', borderRadius: 4, letterSpacing: 1 }}>F9</span>}
              </div>
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart Floating Action */}
      {isMobile && tab === 'new' && !mobileCartOpen && items.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: 16,
          right: 16,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-glass)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer'
        }} onClick={openMobileCart}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={24} color="var(--gold)" />
              <span className="badge badge-red" style={{ position: 'absolute', top: -10, right: -10, padding: '2px 6px', fontSize: 10, borderRadius: 10 }}>{items.length}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</div>
              <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>৳{netTotal.toLocaleString()}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>Checkout</button>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <>
          {/* Today's summary */}
          <div className="stat-grid mb-4">
            <div className="stat-card gold"><div className="stat-label">Today's Sales</div><div className="stat-value">{todaySales.length}</div></div>
            <div className="stat-card green"><div className="stat-label">Today's Revenue</div><div className="stat-value">৳{todayRevenue.toLocaleString()}</div></div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">Sales History</div>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                if (!salesHistory.length) return;
                downloadCSV(salesHistory.map(s => ({
                  'Receipt': s.receiptNo, 'Customer': s.customerName || '—',
                  'Total (৳)': s.totalAmount, 'Discount (৳)': s.discount || 0,
                  'Net (৳)': s.netAmount || s.totalAmount,
                  'Sold By': s.soldByName, 'Date': s.saleDate?.toDate?.()?.toLocaleString() || '—',
                })), `shop-sales-${new Date().toLocaleDateString('en-CA')}.csv`);
                toast.success('Exported sales history');
              }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Export CSV</button>
            </div>
          </div>
        </>
      )}

      {/* -- HISTORY PAGINATED -- */}
      {tab === 'history' && (
        <ShopSalesHistoryTable
          salesHistory={salesHistory}
          loadingHistory={loadingHistory}
          editModeEnabled={editModeEnabled}
          setEditingDoc={setEditingDoc}
          profile={profile}
          fetchHistory={fetchHistory}
        />
      )}

      {/* ── RETURNS ── */}
      {tab === 'returns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            <div className="card">
              <div className="card-title mb-2"> Select Products to Return</div>
              <div style={{ position: 'relative' }}>
                <div className="search-bar" style={{ marginBottom: 12 }}>
                  <span className="search-icon"></span>
                  <input placeholder="Search brand, type, flavor…" value={searchQ} onChange={e => setSearchQ(e.target.value)} autoComplete="off" />
                  {searchQ && <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearchQ('')}>✕</button>}
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map(inv => (
                    <div key={inv.id} onClick={() => addItem(inv)}
                      style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-gold">{inv.brand}</span>
                          <span className="badge badge-teal">{inv.productType}</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 11 }}>
                          <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>৳{inv.sellingPrice}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching products.</div>}
                </div>
              </div>
            </div>

            {/* Return Items List */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title"> Return Items</div>
                <span className="badge badge-teal">{returnItems.length} items</span>
              </div>
              {returnItems.length === 0 ? (
                <div className="empty-state" style={{ padding: '28px' }}><div className="empty-title">No items selected</div></div>
              ) : returnItems.map((it, idx) => (
                <div key={idx} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{it.brand} {it.productType} {it.flavor} {it.weight}</div>
                    <button className="btn btn-danger btn-sm" onClick={() => removeReturnItem(idx)}>✕</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Return Qty</label>
                      <input type="number" className="form-input" min="1" value={it.qty} onChange={e => updateReturnItem(idx, 'qty', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Refund Price (৳)</label>
                      <input type="number" className="form-input" min="0" step="1" value={it.unitPrice} onChange={e => updateReturnItem(idx, 'unitPrice', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subtotal</label>
                      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--gold)', fontSize: 13 }}>
                        ৳{(it.qty * it.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title mb-3"> Return Details</div>
              <div className="form-group mb-3">
                <label className="form-label">Original Sale Receipt No (Optional)</label>
                <input className="form-input" placeholder="e.g. RCP-1234..." value={returnOriginalReceipt} onChange={e => setReturnOriginalReceipt(e.target.value)} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Customer Name (optional)</label>
                <input className="form-input" placeholder="Walk-in customer" value={returnCustomer} onChange={e => setReturnCustomer(e.target.value)} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Return Reason <span style={{color:'var(--red)'}}>*</span></label>
                <textarea className="form-input" placeholder="Explain why the product is being returned..." value={returnReason} onChange={e => setReturnReason(e.target.value)} rows={2} required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Item Condition</label>
                <select className="form-select" value={returnCondition} onChange={e => {
                  setReturnCondition(e.target.value);
                  if (e.target.value !== 'Unopened/Resalable') {
                    setReturnRestock(false);
                  } else {
                    setReturnRestock(true);
                  }
                }}>
                  <option value="Unopened/Resalable">Unopened / Resalable (Good Condition)</option>
                  <option value="Damaged/Defective">Damaged / Defective</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Refund Method</label>
                <select className="form-select" value={refundMethod} onChange={e => setRefundMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Store Credit">Store Credit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: returnCondition !== 'Unopened/Resalable' ? 'not-allowed' : 'pointer', fontSize: 13, opacity: returnCondition !== 'Unopened/Resalable' ? 0.6 : 1 }}>
                  <input type="checkbox" checked={returnRestock} disabled={returnCondition !== 'Unopened/Resalable'} onChange={e => setReturnRestock(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                  Add back to shop inventory (Restock)
                </label>
                {returnCondition !== 'Unopened/Resalable' && (
                  <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>
                     Damaged or expired items cannot be restocked.
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="card-title mb-3"> Refund Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total Refund</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>৳{totalReturnAmount.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={handleReturn} disabled={returnSubmitting || !returnItems.length}>
              {returnSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Process Return'}
            </button>
          </div>
        </div>
      )}

      {/* ── RETURNS HISTORY ── */}
      {tab === 'returns' && (
        <div className="card mt-4" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Shop Returns History</div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={retDateFrom} onChange={e => setRetDateFrom(e.target.value)} title="Date From" />
              <span className="text-muted" style={{ fontSize: 12 }}>to</span>
              <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={retDateTo} onChange={e => setRetDateTo(e.target.value)} title="Date To" />
              
              <select className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34, width: 130 }} value={retPayMethod} onChange={e => setRetPayMethod(e.target.value)}>
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Store Credit">Store Credit</option>
                <option value="Other">Other</option>
              </select>

              <div className="search-bar" style={{ flex: '0 0 220px', height: 34 }}>
                <span className="search-icon"></span>
                <input placeholder="Search receipt, customer..." style={{ fontSize: 13 }} value={retSearch} onChange={e => setRetSearch(e.target.value)} />
                {retSearch && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setRetSearch('')}>✕</button>}
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            {loadingReturns ? <div className="loading-center"><div className="spinner" /></div>
              : returns.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No returns yet</div></div>
              : (
                <table>
                  <thead>
                    <tr><th>Return Receipt</th><th>Original Receipt</th><th>Customer</th><th>Items</th><th>Reason & Condition</th><th>Refund</th><th>Restocked</th><th>Processed By</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {retPg.paged.map(r => {
                      const isDeleted = r.status === 'deleted';
                      return (
                      <tr key={r.id} style={{ opacity: isDeleted ? 0.5 : 1 }}>
                        <td className="td-bold" style={{ textDecoration: isDeleted ? 'line-through' : 'none' }}>{r.returnReceiptNo}</td>
                        <td className="text-sm">{r.originalReceiptNo || '—'}</td>
                        <td>{r.buyerName || 'Walk-in'}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {r.items?.map((it, idx) => (
                              <div key={idx} style={{ fontSize: 11, background: 'rgba(0,0,0,0.03)', padding: '4px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{it.qty}x</span> {it.brand} {it.productType}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                            {r.returnReason || '—'}
                          </div>
                          <div style={{ fontSize: 10, color: r.returnCondition === 'Unopened/Resalable' ? 'var(--green)' : 'var(--amber)', marginTop: 2 }}>
                            {r.returnCondition || 'Unopened/Resalable'}
                          </div>
                        </td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          ৳{(r.totalAmount || 0).toLocaleString()}
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{r.refundMethod}</div>
                        </td>
                        <td>{r.restock ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span>}</td>
                        <td>{r.processedByName}</td>
                        <td className="text-sm text-muted">{r.returnDate?.toDate?.()?.toLocaleString() || '—'}</td>
                        <td>
                          {isDeleted ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span className="badge badge-red">VOIDED</span>
                              {editModeEnabled && (
                                <button className="btn btn-primary btn-sm btn-icon" title="Restore" onClick={async () => {
                                  if (window.confirm('Restore this return?')) {
                                    try {
                                      const { quickRestoreDocument } = await import('../../firebase/auditServices');
                                      await quickRestoreDocument('shop_returns', r.id, profile.uid, profile.name || profile.email);
                                      toast.success('Return restored'); fetchReturns();
                                    } catch (e) { toast.error('Restore failed: ' + e.message); }
                                  }
                                }}><RotateCcw size={14}/></button>
                              )}
                            </div>
                          ) : r.status === 'delete_requested' ? <span className="badge badge-amber">PENDING VOID</span> : (
                            <div style={{ display: 'flex', gap: 4 }}>
                              {editModeEnabled && (
                                <button className="btn btn-primary btn-sm" onClick={() => setEditingDoc({ doc: r, collection: 'shop_returns' })}><FileEdit size={14} /></button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                const reason = window.prompt("Reason for voiding this return?");
                                if (reason) {
                                  try {
                                    const { requestSoftDeleteDocument } = await import('../../firebase/auditServices');
                                    await requestSoftDeleteDocument('shop_returns', r.id, reason, profile.uid, profile.name || profile.email);
                                    toast.success('Void request sent for approval.');
                                    fetchReturns();
                                  } catch (e) { toast.error('Failed to request void: ' + e.message); }
                                }
                              }}> <Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
          </div>
          {returns.length > 0 && (
            <Pagination
              page={retPg.page} totalPages={retPg.totalPages} total={retPg.total}
              startRecord={retPg.startRecord} endRecord={retPg.endRecord}
              perPage={retPg.perPage}
              onPageChange={retPg.goTo}
              onPerPageChange={retPg.setPerPage}
            />
          )}
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {tab === 'expenses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
          <div className="card">
            <div className="card-title mb-1"> Log Expense / Petty Cash</div>
            <div className="card-subtitle mb-3">Record money spent on shop operations</div>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))}>
                  {['Transport','Tea/Food','Office Supplies','Repair','Cleaning','Utility','General'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose / Description *</label>
                <input className="form-input" placeholder="e.g. Rickshaw fare to bank" value={expForm.purpose} onChange={e => setExpForm(p => ({ ...p, purpose: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (৳) *</label>
                <input type="number" className="form-input" min="1" placeholder="0" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={expSubmitting}>
                {expSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Log Expense'}
              </button>
            </form>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">Expense Log</div>
              <span className="badge badge-red">{expenses.filter(e => e.date?.toDate?.()?.toDateString() === new Date().toDateString()).length} today</span>
            </div>
            <div className="table-wrapper">
              {expenses.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No expenses logged</div></div> : (
                <table>
                  <thead><tr><th>Category</th><th>Purpose</th><th>Amount</th><th>By</th><th>Time</th><th>Actions</th></tr></thead>
                  <tbody>
                    {expPg.paged.map(ex => {
                      const isDeleted = ex.status === 'deleted';
                      return (
                      <tr key={ex.id} style={{ opacity: isDeleted ? 0.5 : 1 }}>
                        <td><span className="badge badge-teal" style={{ fontSize: 11, textDecoration: isDeleted ? 'line-through' : 'none' }}>{ex.category}</span></td>
                        <td style={{ fontSize: 13, textDecoration: isDeleted ? 'line-through' : 'none' }}>{ex.purpose}</td>
                        <td style={{ color: 'var(--red)', fontWeight: 700, textDecoration: isDeleted ? 'line-through' : 'none' }}>৳{(ex.amount || 0).toLocaleString()}</td>
                        <td className="text-sm">{ex.addedByName}</td>
                        <td className="text-sm text-muted">{ex.date?.toDate?.()?.toLocaleString() || '—'}</td>
                        <td>
                           {isDeleted ? (
                             <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                               <span className="badge badge-red">VOIDED</span>
                               {editModeEnabled && (
                                 <button className="btn btn-primary btn-sm btn-icon" title="Restore" onClick={async () => {
                                   if (window.confirm('Restore this expense?')) {
                                     try {
                                       const { quickRestoreDocument } = await import('../../firebase/auditServices');
                                       await quickRestoreDocument('expense_entries', ex.id, profile.uid, profile.name || profile.email);
                                       toast.success('Expense restored'); fetchExpenses();
                                     } catch (e) { toast.error('Restore failed: ' + e.message); }
                                   }
                                 }}><RotateCcw size={14}/></button>
                               )}
                             </div>
                           ) : ex.status === 'delete_requested' ? (
                             <span className="badge badge-amber">PENDING VOID</span>
                           ) : (
                             <div style={{ display: 'flex', gap: 4 }}>
                               {editModeEnabled && <button className="btn btn-primary btn-sm" onClick={() => setEditingDoc({ doc: ex, collection: 'expense_entries' })}><FileEdit size={14} /></button>}
                               <button className="btn btn-danger btn-sm" onClick={async () => {
                                 const reason = window.prompt("Reason for voiding this expense?");
                                 if (reason) {
                                   try {
                                     const isAdmin = ['admin', 'chairman'].includes(profile?.role);
                                     const { requestSoftDeleteDocument, softDeleteDocument } = await import('../../firebase/auditServices');
                                     if (isAdmin) {
                                        await softDeleteDocument('expense_entries', ex.id, reason, profile.uid, profile.name || profile.email);
                                        toast.success('Expense voided and logged.');
                                     } else {
                                        await requestSoftDeleteDocument('expense_entries', ex.id, reason, profile.uid, profile.name || profile.email);
                                        toast.success('Void request sent for admin approval.');
                                     }
                                     fetchExpenses();
                                   } catch (e) { toast.error('Failed: ' + e.message); }
                                 }
                               }}><Trash2 size={14} /></button>
                             </div>
                           )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
            {expenses.length > 0 && (
              <Pagination
                page={expPg.page} totalPages={expPg.totalPages} total={expPg.total}
                startRecord={expPg.startRecord} endRecord={expPg.endRecord}
                perPage={expPg.perPage}
                onPageChange={expPg.goTo}
                onPerPageChange={expPg.setPerPage}
              />
            )}
          </div>
        </div>
      )}

      {/* ── DAILY CLOSING ── */}
      {tab === 'closing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Daily Closing & Reconciliation</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Calculation Date:</span>
              <input type="date" className="form-input" style={{ width: 'auto' }} value={closingDate} onChange={e => setClosingDate(e.target.value)} />
            </div>
          </div>
          {/* Reconciliation Summary */}
          {loadingReconcile ? <div className="loading-center"><div className="spinner" /></div> : (() => {
            const sysTotal = todaySalesData.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0);
            const expTotal = todayExpenseData.reduce((a, e) => a + (e.amount || 0), 0);
            const retTotal = todayReturnData.reduce((a, r) => a + (r.totalAmount || 0), 0);
            const expected = sysTotal - expTotal - retTotal;
            const reported = Number(closingAmount) || 0;
            const diff = reported - expected;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                <div className="stat-card teal">
                  <div className="stat-label">System Sales ({new Date(closingDate).toLocaleDateString()})</div>
                  <div className="stat-value">৳{sysTotal.toLocaleString()}</div>
                  <div className="stat-meta">{todaySalesData.length} transactions</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Expenses</div>
                  <div className="stat-value">৳{expTotal.toLocaleString()}</div>
                  <div className="stat-meta">{todayExpenseData.length} entries</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Returns</div>
                  <div className="stat-value">৳{retTotal.toLocaleString()}</div>
                  <div className="stat-meta">{todayReturnData.length} items</div>
                </div>
                <div className={`stat-card ${Math.abs(diff) === 0 ? 'teal' : diff < 0 ? 'red' : 'gold'}`}>
                  <div className="stat-label">Expected Cash</div>
                  <div className="stat-value">৳{expected.toLocaleString()}</div>
                  <div className="stat-meta">Sales − Expenses − Returns</div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, alignItems: 'start' }}>
            <div className="card">
              <div className="card-title mb-1"> End-of-Day Cash Submission</div>
              <div className="card-subtitle mb-3">Enter the actual physical cash on hand</div>
              <form onSubmit={handleClosing} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Actual Cash in Hand (৳)</label>
                  <input id="closing-amount" type="number" className="form-input" placeholder="0" min="0" value={closingAmount}
                    onChange={e => setClosingAmount(e.target.value)} required style={{ fontSize: 18, fontWeight: 700 }} />
                </div>
                {closingAmount && (() => {
                  const sysTotal = todaySalesData.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0);
                  const expTotal = todayExpenseData.reduce((a, e) => a + (e.amount || 0), 0);
                  const retTotal = todayReturnData.reduce((a, r) => a + (r.totalAmount || 0), 0);
                  const expected = sysTotal - expTotal - retTotal;
                  const diff = Number(closingAmount) - expected;
                  return (
                    <div style={{ padding: '14px', borderRadius: 'var(--radius)', border: `2px solid ${diff === 0 ? 'var(--teal)' : diff < 0 ? 'var(--red)' : 'var(--gold)'}`, background: diff === 0 ? 'var(--teal-dim)' : diff < 0 ? 'var(--red-dim)' : 'var(--gold-dim)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                        {diff === 0 ? ' Cash matches system records!' : diff < 0 ? ` SHORT by ৳${Math.abs(diff).toLocaleString()} — Investigate discrepancy` : ` EXCESS ৳${diff.toLocaleString()} — Unlogged income or error`}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Expected: ৳{expected.toLocaleString()} | You entered: ৳{Number(closingAmount).toLocaleString()}</div>
                    </div>
                  );
                })()}
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                   {new Date().toLocaleString()} · By: {profile?.name}
                </div>
                <button id="btn-save-closing" type="submit" className="btn btn-primary btn-lg" disabled={closingSubmitting}>
                  {closingSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Submit Closing'}
                </button>
              </form>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">Closing History</div>
                <button className="btn btn-secondary btn-sm" onClick={() => { downloadCSV(closings.map(c => ({ Date: c.date?.toDate?.()?.toLocaleString(), 'System Sales': c.systemSalesTotal, Expenses: c.totalExpenses, Returns: c.totalReturns, Expected: c.expectedCash, Reported: c.cashAmount, Discrepancy: c.discrepancy, By: c.enteredByName })), 'closing-history.csv'); toast.success('Exported.'); }}>⬇ Export</button>
              </div>
              <div className="table-wrapper">
                {loadingClosings ? <div className="loading-center"><div className="spinner" /></div>
                : closings.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No entries yet</div></div>
                : (
                  <table>
                    <thead><tr><th>Date</th><th>System Sales</th><th>Expenses</th><th>Expected</th><th>Reported</th><th>Discrepancy</th><th>By</th></tr></thead>
                    <tbody>
                      {closePg.paged.map(c => {
                        const disc = c.discrepancy || 0;
                        return (
                          <tr key={c.id}>
                            <td className="text-sm">{c.date?.toDate?.()?.toLocaleDateString() || '—'}</td>
                            <td style={{ color: 'var(--teal)', fontWeight: 600 }}>৳{(c.systemSalesTotal || c.cashAmount || 0).toLocaleString()}</td>
                            <td style={{ color: 'var(--red)', fontWeight: 600 }}>৳{(c.totalExpenses || 0).toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>৳{(c.expectedCash || c.cashAmount || 0).toLocaleString()}</td>
                            <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(c.cashAmount || 0).toLocaleString()}</td>
                            <td><span className={`badge badge-${disc === 0 ? 'green' : disc < 0 ? 'red' : 'amber'}`}>{disc === 0 ? '✓ Match' : disc < 0 ? `Short ৳${Math.abs(disc).toLocaleString()}` : `Excess ৳${disc.toLocaleString()}`}</span></td>
                            <td className="text-sm text-muted">{c.enteredByName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {closings.length > 0 && (
                <Pagination
                  page={closePg.page} totalPages={closePg.totalPages} total={closePg.total}
                  startRecord={closePg.startRecord} endRecord={closePg.endRecord}
                  perPage={closePg.perPage}
                  onPageChange={closePg.goTo}
                  onPerPageChange={closePg.setPerPage}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT REQUEST ── */}
      {tab === 'request' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-title mb-1"> Request New Product Entry</div>
            <div className="card-subtitle mb-3">Submit to Admin / Chairman for approval before adding to shop</div>
            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input id="req-brand" className="form-input" placeholder="e.g. Smart Heart" value={reqForm.brand} onChange={e => setReqForm(p => ({ ...p, brand: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Type *</label>
                  <input id="req-type" className="form-input" placeholder="e.g. Dry Food" value={reqForm.productType} onChange={e => setReqForm(p => ({ ...p, productType: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Flavor / Variant</label>
                  <input id="req-flavor" className="form-input" placeholder="e.g. Chicken" value={reqForm.flavor} onChange={e => setReqForm(p => ({ ...p, flavor: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight / Size</label>
                  <input id="req-weight" className="form-input" placeholder="e.g. 400, 1, 2.5 (Tap unit)" value={reqForm.weight} onChange={e => setReqForm(p => ({ ...p, weight: e.target.value }))} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['g', 'kg', 'ml', 'L', 'lbs', 'oz'].map(u => (
                      <button 
                        type="button" 
                        key={u} 
                        style={{ 
                          padding: '2px 8px', fontSize: '11px', fontWeight: 600, 
                          borderRadius: '4px', background: 'var(--bg-elevated)', 
                          color: 'var(--text-secondary)', border: '1px solid var(--border-glass)',
                          cursor: 'pointer', transition: 'var(--transition)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onClick={() => {
                          setReqForm(p => {
                            const w = (p.weight || '').replace(/[a-zA-Z]+$/, '').trim();
                            return { ...p, weight: w + u };
                          });
                        }}
                      >
                        +{u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Life Stage</label>
                <select id="req-lifestage" className="form-select" value={reqForm.lifeStage} onChange={e => setReqForm(p => ({ ...p, lifeStage: e.target.value }))}>
                  {['All Life Stages', 'Kitten/Puppy', 'Adult', 'Senior', 'Not Applicable'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Initial Quantity (Optional)</label>
                  <input id="req-qty" className="form-input" type="number" min="0" step="1" placeholder="e.g. 50" value={reqForm.qty} onChange={e => setReqForm(p => ({ ...p, qty: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (Optional)</label>
                  <input id="req-price" className="form-input" type="number" min="0" step="1" placeholder="e.g. 1200" value={reqForm.sellingPrice} onChange={e => setReqForm(p => ({ ...p, sellingPrice: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Notes</label>
                <textarea id="req-reason" className="form-textarea" rows={3} placeholder="Why is this product needed?" value={reqForm.reason} onChange={e => setReqForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <button id="btn-submit-request" type="submit" className="btn btn-primary btn-lg" disabled={reqSubmitting}>
                {reqSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── RECEIPT MODAL ── */}
      {/* ── BANGLADESH SUPER-SHOP RECEIPT PREVIEW & PRINT MODAL ── */}
      {completedSale && (
        <div className="modal-overlay">
          <div className={`modal ${isReceiptFullscreen ? 'modal-fullscreen' : ''}`} style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-teal" style={{ fontSize: 10 }}>SUPER SHOP POS</span>
                <h3 className="modal-title" style={{ margin: 0 }}>Sale Completed</h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="modal-close" onClick={() => setIsReceiptFullscreen(!isReceiptFullscreen)}>
                  {isReceiptFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setCompletedSale(null)}><X size={16} /></button>
              </div>
            </div>

            {/* Authentic 80mm Thermal Receipt Preview Card */}
            <div style={{
              margin: '14px 0',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              borderRadius: 8,
              padding: '18px 20px',
              color: '#0f172a',
              fontFamily: "'Courier New', Courier, monospace",
              boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #334155', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>{completedSale.tenantName || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা'}</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>{completedSale.tagline || 'রিটেইল সুপার শপ ও ডিজিটাল খাতা'}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{completedSale.address || 'আউটলেট ০১, ঢাকা, বাংলাদেশ'}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Hotline: {completedSale.phone || '+880 1700-000000'} | BIN: {completedSale.bin || '00129384-0101'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ border: '1px solid #0f172a', padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                    CUSTOMER RETAIL INVOICE
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 11, borderBottom: '1px dashed #334155', paddingBottom: 10, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Invoice:</b> {completedSale.receiptNo}</span>
                  <span><b>Date:</b> {new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Cashier:</b> Staff Counter-01</span>
                  <span><b>Mode:</b> {completedSale.paymentMethod || 'Cash'}</span>
                </div>
                {completedSale.customerName && (
                  <div><b>Customer:</b> {completedSale.customerName}</div>
                )}
              </div>

              <div style={{ borderBottom: '1px dashed #334155', paddingBottom: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 6 }}>
                  <span>ITEM DESCRIPTION</span>
                  <span>QTY &times; RATE</span>
                  <span>AMOUNT</span>
                </div>
                {(completedSale.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ maxWidth: '50%' }}>{idx + 1}. {it.productName || it.entityId}</span>
                    <span>{it.qty || 1} &times; {Number(it.unitPrice || 0).toLocaleString()}</span>
                    <span style={{ fontWeight: 700 }}>Tk {((it.qty || 1) * Number(it.unitPrice || 0)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SUB TOTAL:</span>
                  <b>Tk {Number(completedSale.totalAmount || 0).toLocaleString()}</b>
                </div>
                {Number(completedSale.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>DISCOUNT SAVINGS:</span>
                    <b>- Tk {Number(completedSale.discount).toLocaleString()}</b>
                  </div>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', background: '#0f172a',
                  color: '#ffffff', padding: '6px 8px', borderRadius: 4, marginTop: 4, fontWeight: 800
                }}>
                  <span>NET PAYABLE TOTAL:</span>
                  <span>Tk {Number(completedSale.netAmount || completedSale.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 14, borderTop: '1px dashed #334155', paddingTop: 10, fontSize: 10, color: '#475569' }}>
                <div>Exchange within 3 days with undamaged original invoice.</div>
                <div style={{ fontWeight: 700, marginTop: 4, letterSpacing: 2 }}>* {completedSale.receiptNo} *</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => printThermalHTMLReceipt(completedSale, 'Shop Retail Division')}
              >
                <Printer size={18} /> Print 80mm Thermal Receipt (ESC/POS)
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => generateShopReceipt(completedSale, [], 'customer')}
                >
                  <Download size={15} /> Download PDF Copy
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCompletedSale(null)}
                >
                  Close &amp; Next Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc.doc}
          collectionName={editingDoc.collection}
          onClose={() => setEditingDoc(null)}
          onSaved={() => {
            if (editingDoc.collection === 'shop_sales') fetchHistory();
            else if (editingDoc.collection === 'expense_entries') fetchExpenses();
            else if (editingDoc.collection === 'shop_returns') fetchReturns();
          }}
        />
      )}
    </div>
  );
}
