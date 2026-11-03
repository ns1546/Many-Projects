import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getProductEntities, getGodownStock, createGodownSale, getGodownSales, processGodownReturn, getGodownReturns } from '../../firebase/godownServices';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import { generateGodownReceipt, printThermalHTMLReceipt } from '../../utils/receiptPDF';
import { downloadCSV } from '../../utils/csvExport';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import EcommerceGrid from '../../components/EcommerceGrid';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import { ShoppingCart, ShoppingBag, PlusCircle, Printer, FileText, FileEdit, Trash2, CheckCircle2, SearchX, Download, Maximize2, Minimize2, X, RotateCcw } from 'lucide-react';

// ─── Paginated Sales History Sub-Component ────────────────────────────────────
function GodownSalesHistoryTable({ salesHistory, entities, historyLoading, editModeEnabled, setEditingDoc, profile, fetchHistory }) {
  const [search, setSearch] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('');

  const filtered = salesHistory.filter(s => {
    let match = true;
    if (search) {
      match = match && ((s.receiptNo || '').toLowerCase().includes(search.toLowerCase()) || (s.buyerName || '').toLowerCase().includes(search.toLowerCase()));
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
      'Receipt No': s.receiptNo, 'Buyer': s.buyerName || '—', 'Phone': s.buyerPhone || '—',
      'Total (৳)': s.totalAmount, 'Discount (৳)': s.discount || 0, 'Net (৳)': s.netAmount || s.totalAmount,
      'Payment': s.paymentMethod || 'Cash', 'Sold By': s.soldByName || s.soldBy,
      'Date': s.saleDate?.toDate?.()?.toLocaleString() || '—',
    })), `godown-sales-${new Date().toLocaleDateString('en-CA')}.csv`);
    toast.success('Exported all ' + salesHistory.length + ' records.');
  };

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}><div className="card-title" style={{ marginBottom: 0 }}>Godown Sales History</div></div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Date From" />
          <span className="text-muted" style={{ fontSize: 12 }}>to</span>
          <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={dateTo} onChange={e => setDateTo(e.target.value)} title="Date To" />
          
          <select className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34, width: 130 }} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>

          <div className="search-bar" style={{ flex: '0 0 200px', height: 34 }}>
            <span className="search-icon"></span>
            <input placeholder="Search receipt, buyer..." style={{ fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')}>✕</button>}
          </div>

          <button id="btn-export-sales" className="btn btn-secondary btn-sm" onClick={handleCSV} style={{ height: 34, display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Export</button>
        </div>
      </div>
      {historyLoading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">{search ? 'No matching sales' : 'No sales yet'}</div></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Receipt</th><th>Buyer</th><th>Items</th><th>Total</th><th>Net</th><th>Method</th><th>Sold By</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {pg.paged.map(s => {
                  const isDeleted = s.status === 'deleted';
                  return (
                    <tr key={s.id} style={{ opacity: isDeleted ? 0.5 : 1 }}>
                      <td className="td-bold" style={{ textDecoration: isDeleted ? 'line-through' : 'none' }}>{s.receiptNo}</td>
                      <td>{s.buyerName || '—'}</td>
                      <td><span className="badge badge-teal">{s.items?.length || 0}</span></td>
                      <td>৳{(s.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(s.netAmount || s.totalAmount || 0).toLocaleString()}</td>
                      <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{s.paymentMethod || 'Cash'}</span></td>
                      <td>{s.soldByName || s.soldBy}</td>
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
                                      await quickRestoreDocument('godown_sales', s.id, profile.uid, profile.name || profile.email);
                                      toast.success('Sale restored'); fetchHistory();
                                    } catch (e) { toast.error('Restore failed: ' + e.message); }
                                  }
                                }}><RotateCcw size={14}/></button>
                              )}
                            </div>
                          ) : s.status === 'delete_requested' ? <span className="badge badge-amber">PENDING VOID</span> : (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-secondary btn-sm" title="Print 80mm ESC/POS Thermal Receipt" onClick={() => printThermalHTMLReceipt(s, 'Godown Wholesale Division')}><Printer size={14} /></button>
                            <button className="btn btn-ghost btn-sm" title="Download Super-Shop Receipt PDF" onClick={() => generateGodownReceipt(s, entities, 'customer')}><Download size={14} /></button>
                            {editModeEnabled && (
                              <button className="btn btn-primary btn-sm" title="Admin Edit" onClick={() => setEditingDoc({ doc: s, collection: 'godown_sales' })}><FileEdit size={14} /></button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={async () => {
                              const reason = window.prompt('Reason for voiding this sale?');
                              if (reason) {
                                try {
                                  const { requestSoftDeleteDocument } = await import('../../firebase/auditServices');
                                  await requestSoftDeleteDocument('godown_sales', s.id, reason, profile.uid, profile.name || profile.email);
                                  toast.success('Void request sent for approval.');
                                  fetchHistory();
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

// ─── Advanced POS Sub-functions ───────────────────────────────────────────────
const calculateDynamicDiscount = (items) => {
  // Example Bulk Rule: If total items > 50, give a 2% auto-discount
  const totalQty = items.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = items.reduce((sum, it) => sum + (it.qty * it.unitPrice), 0);
  if (totalQty >= 50) return Math.floor(subtotal * 0.02);
  return 0;
};


export default function GodownSales() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const [tab, setTab] = useState('new'); // new | history
  const [editingDoc, setEditingDoc] = useState(null); // { doc, collection }
  const [salesSearch, setSalesSearch] = useState('');
  const [returnsSearch, setReturnsSearch] = useState('');
  const [entities, setEntities] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Returns state
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
  const [returnBuyer, setReturnBuyer] = useState('');
  const [returnOriginalReceipt, setReturnOriginalReceipt] = useState('');
  const [returnRestock, setReturnRestock] = useState(true);
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Sale form state
  const [items, setItems] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [manualDiscount, setManualDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [isReceiptFullscreen, setIsReceiptFullscreen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');

  // Product search
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // --- Barcode Scanner Listener ---
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  useEffect(() => {
    if (tab !== 'new') return;
    const handleKeyDown = (e) => {
      // If user is typing in an input field, ignore
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      // Fast Checkout Shortcut (F9)
      if (e.key === 'F9') {
        e.preventDefault();
        document.getElementById('btn-confirm-sale')?.click();
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) {
          // Find item by ID or Barcode (assuming entity id or some field matches)
          // For this MVP, we match by entity ID if they scan a raw ID.
          const found = entities.find(ent => ent.id === barcodeBuffer || (ent.barcode && ent.barcode === barcodeBuffer));
          if (found) {
            addItem(found);
            toast.success(`Scanned: ${found.brand} ${found.productType}`);
          } else {
            toast.error(`Barcode not found: ${barcodeBuffer}`);
          }
        }
        setBarcodeBuffer('');
      } else if (e.key.length === 1) {
        setBarcodeBuffer(prev => prev + e.key);
      }
    };
    
    // Auto-clear buffer if scanner pauses
    const timeout = setTimeout(() => setBarcodeBuffer(''), 100);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcodeBuffer, entities, stockMap, tab]);

  const fetchBase = async () => {
    const [ents, stocks] = await Promise.all([getProductEntities(), getGodownStock()]);
    setEntities(ents);
    const sm = {};
    stocks.forEach(s => { sm[s.entityId] = s; });
    setStockMap(sm);
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const s = await getGodownSales();
    setSalesHistory(s);
    setHistoryLoading(false);
  };

  const fetchReturns = async () => {
    setLoadingReturns(true);
    const r = await getGodownReturns();
    setReturns(r);
    setLoadingReturns(false);
  };

  useEffect(() => { fetchBase(); }, []);
  useEffect(() => { 
    if (tab === 'history') fetchHistory(); 
    if (tab === 'returns') fetchReturns();
  }, [tab]);

  // Fuzzy search
  const fuse = new Fuse(entities, {
    keys: ['brand', 'productType', 'flavor', 'weight'],
    threshold: 0.35,
  });

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults(entities); return; }
    setSearchResults(fuse.search(searchQ).map(r => r.item));
  }, [searchQ, entities]);

  const addItem = (entity) => {
    const stockInfo = stockMap[entity.id];
    
    if (tab === 'returns') {
      if (returnItems.find(i => i.entityId === entity.id)) { toast.error('Already in return list.'); return; }
      setReturnItems(p => [...p, {
        entityId: entity.id,
        productName: `${entity.brand} ${entity.productType}${entity.flavor ? ' — ' + entity.flavor : ''}${entity.weight ? ' ' + entity.weight : ''}`,
        brand: entity.brand, productType: entity.productType, flavor: entity.flavor, weight: entity.weight, unit: entity.unit,
        qty: 1, unitPrice: stockInfo?.lastUnitPurchasePrice || 0,
      }]);
      return;
    }

    if (items.find(i => i.entityId === entity.id)) { toast.error('Already in cart.'); return; }
    
    if (!stockInfo || stockInfo.qtyInStock <= 0) { toast.error('Out of stock in Godown.'); return; }
    setItems(p => [...p, {
      entityId: entity.id,
      brand: entity.brand,
      productType: entity.productType,
      flavor: entity.flavor,
      weight: entity.weight,
      unit: entity.unit,
      qty: 1,
      unitPrice: stockInfo?.lastUnitPurchasePrice || 0,
      availableQty: stockInfo?.qtyInStock || 0,
    }]);
  };

  const updateItem = (idx, field, val) => {
    setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: field === 'qty' ? Number(val) : Number(val) } : it));
  };
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));

  const updateReturnItem = (idx, field, val) => {
    setReturnItems(p => p.map((it, i) => i === idx ? { ...it, [field]: field === 'qty' ? Number(val) : Number(val) } : it));
  };
  const removeReturnItem = (idx) => setReturnItems(p => p.filter((_, i) => i !== idx));

  const subtotal = items.reduce((a, it) => a + it.qty * it.unitPrice, 0);
  
  // Calculate smart dynamic discounts + manual overrides
  const dynamicDiscountAmt = calculateDynamicDiscount(items);
  let manualDiscountAmt = 0;
  if (typeof manualDiscount === 'string' && manualDiscount.includes('%')) {
    const pct = parseFloat(manualDiscount.replace('%', ''));
    if (!isNaN(pct)) {
      manualDiscountAmt = subtotal * (pct / 100);
    }
  } else {
    manualDiscountAmt = parseFloat(manualDiscount) || 0;
  }
  const totalDiscount = Math.max(dynamicDiscountAmt, manualDiscountAmt); // Take whichever is higher
  const netTotal = Math.round(subtotal - totalDiscount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Add at least one product.'); return; }
    for (const it of items) {
      if (it.qty > it.availableQty) {
        toast.error(`Not enough stock for ${it.brand} ${it.productType}. Available: ${it.availableQty}`);
        return;
      }
      if (it.qty <= 0) { toast.error('Quantity must be greater than 0.'); return; }
      if (it.unitPrice <= 0) { toast.error('Price must be greater than 0.'); return; }
    }
    setSubmitting(true);
    try {
      const finalPaymentMethod = paymentMethod === 'Other' ? (customPaymentMethod || 'Other') : paymentMethod;
      const saleData = {
        items,
        buyerName,
        buyerPhone,
        discount: totalDiscount,
        totalAmount: subtotal,
        netAmount: netTotal,
        paymentMethod: finalPaymentMethod,
        soldByName: profile.name || profile.email,
      };
      const result = await createGodownSale(saleData, profile.uid);
      setCompletedSale({ ...saleData, ...result, saleDate: { toDate: () => new Date() } });
      setItems([]);
      setBuyerName('');
      setBuyerPhone('');
      setManualDiscount('');
      fetchBase();
      toast.success(`Sale recorded! Receipt: ${result.receiptNo}`);
    } catch (err) { toast.error('Sale failed: ' + err.message); }
    setSubmitting(false);
  };

  const totalReturnAmount = returnItems.reduce((a, it) => a + it.qty * it.unitPrice, 0);

  const handleReturn = async () => {
    if (!returnItems.length) { toast.error('No items to return.'); return; }
    for (const it of returnItems) {
      if (it.qty <= 0) { toast.error('Invalid quantity.'); return; }
      if (it.unitPrice < 0) { toast.error('Invalid price.'); return; }
    }
    setReturnSubmitting(true);
    try {
      const returnData = { 
        items: returnItems, 
        buyerName: returnBuyer, 
        originalReceiptNo: returnOriginalReceipt || null,
        totalAmount: totalReturnAmount, 
        restock: returnRestock, 
        refundMethod 
      };
      await processGodownReturn(returnData, profile.uid, profile.name || profile.email);
      setReturnItems([]); setReturnBuyer(''); setReturnOriginalReceipt('');
      fetchBase();
      fetchReturns();
      toast.success('Godown Return processed successfully!');
    } catch (err) { toast.error('Return failed: ' + err.message); }
    setReturnSubmitting(false);
  };

  const getEntityName = (entityId) => {
    const en = entities.find(e => e.id === entityId);
    return en ? `${en.brand} ${en.productType}${en.flavor ? ' — ' + en.flavor : ''}${en.weight ? ' ' + en.weight : ''}` : entityId;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Godown Sales</h1>
          <p className="page-subtitle">Wholesale / bulk sales from warehouse</p>
        </div>
      </div>

      <div className="tabs mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}><ShoppingCart size={16} /> New Sale</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><FileText size={16} /> Sales History</button>
        <button className={`tab ${tab === 'returns' ? 'active' : ''}`} onClick={() => setTab('returns')}><ShoppingBag size={16} /> Product Returns</button>
      </div>

      {/* ── NEW SALE ── */}
      {tab === 'new' && (
        <div className="ecommerce-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px' }}>
          {/* Left: product search + cart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            {/* E-Commerce Product Selection */}
            <EcommerceGrid
              items={entities.map(e => ({ ...e, qty: stockMap[e.id]?.qtyInStock || 0 })).filter(i => i.qty > 0)}
              search={searchQ}
              onSearchChange={setSearchQ}
              getStockInfo={(item) => ({ qty: item.qty || 0, label: 'in godown' })}
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

            {/* Cart */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={18} /> Sale Items</div>
                <span className="badge badge-teal">{items.length} items</span>
              </div>
              {items.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-icon"><SearchX size={48} color="var(--text-muted)" /></div>
                  <div className="empty-title">Cart is empty</div>
                  <div className="empty-desc">Search and select products above</div>
                </div>
              ) : (
                <div>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{it.brand} {it.productType}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            {it.flavor && `${it.flavor} `}{it.weight && `${it.weight} `}
                            <span style={{ opacity: 0.5, margin: '0 4px' }}>•</span> Available: {it.availableQty} {it.unit}
                          </div>
                        </div>
                        <button className="btn btn-danger btn-sm" style={{ padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeItem(idx)} title="Remove item"><X size={14} /></button>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <div className="form-group" style={{ flex: '0 0 80px', gap: '4px' }}>
                          <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty ({it.unit})</label>
                          <input
                            id={`item-qty-${idx}`}
                            type="number"
                            className="form-input"
                            style={{ padding: '8px', textAlign: 'center', fontWeight: 600, height: '36px' }}
                            min="1"
                            max={it.availableQty}
                            value={it.qty}
                            onChange={e => updateItem(idx, 'qty', e.target.value)}
                          />
                        </div>
                        
                        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: '20px', fontWeight: 500 }}>×</div>
                        
                        <div className="form-group" style={{ flex: 1, gap: '4px' }}>
                          <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Price (৳)</label>
                          <input
                            id={`item-price-${idx}`}
                            type="number"
                            className="form-input"
                            style={{ padding: '8px', height: '36px' }}
                            min="0"
                            step="1"
                            value={it.unitPrice}
                            onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                          />
                        </div>
                        
                        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: '20px', fontWeight: 500 }}>=</div>
                        
                        <div className="form-group" style={{ flex: '0 0 100px', gap: '4px' }}>
                          <label className="form-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Subtotal</label>
                          <div style={{ padding: '0 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--gold)', fontSize: 13, textAlign: 'right', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            ৳{(it.qty * it.unitPrice).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Buyer info + totals + submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title mb-3"> Buyer Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Buyer / Company Name</label>
                  <input id="buyer-name" className="form-input" placeholder="Optional" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input id="buyer-phone" className="form-input" placeholder="Optional" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title mb-3"> Order Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text-muted">Subtotal ({items.length} items)</span>
                  <span style={{ fontWeight: 600 }}>৳{subtotal.toLocaleString()}</span>
                </div>
                {dynamicDiscountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--green)' }}>
                    <span>Auto Bulk Discount Applied</span>
                    <span>-৳{dynamicDiscountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Manual Discount (৳ or %)</label>
                  <input id="sale-discount" type="text" className="form-input" placeholder={dynamicDiscountAmt > 0 ? `Auto: ৳${dynamicDiscountAmt}` : "e.g. 50 or 10%"} value={manualDiscount} onChange={e => setManualDiscount(e.target.value)} />
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

            <button
              id="btn-confirm-sale"
              className="btn btn-primary btn-lg w-full"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {submitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Confirm Sale'}
                {!submitting && <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.2)', borderRadius: 4, letterSpacing: 1 }}>F9</span>}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* -- HISTORY -- */}
      {tab === 'history' && (
        <GodownSalesHistoryTable
          salesHistory={salesHistory}
          entities={entities}
          historyLoading={historyLoading}
          editModeEnabled={editModeEnabled}
          setEditingDoc={setEditingDoc}
          profile={profile}
          fetchHistory={fetchHistory}
        />
      )}


      {/* ── RETURNS ── */}
      {tab === 'returns' && (
        <div className="ecommerce-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
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
                <label className="form-label">Buyer Name / Reference</label>
                <input className="form-input" placeholder="Optional" value={returnBuyer} onChange={e => setReturnBuyer(e.target.value)} />
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
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={returnRestock} onChange={e => setReturnRestock(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                  Add back to godown inventory (Restock)
                </label>
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
            <div className="card-title" style={{ marginBottom: 0 }}>Godown Returns History</div>
            
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
                <input placeholder="Search receipt, buyer..." style={{ fontSize: 13 }} value={retSearch} onChange={e => setRetSearch(e.target.value)} />
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
                    <tr><th>Return Receipt</th><th>Original Receipt</th><th>Buyer</th><th>Items</th><th>Refund</th><th>Method</th><th>Restocked</th><th>Processed By</th><th>Date</th><th>Action</th></tr>
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
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(r.totalAmount || 0).toLocaleString()}</td>
                        <td>{r.refundMethod}</td>
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
                                      await quickRestoreDocument('godown_returns', r.id, profile.uid, profile.name || profile.email);
                                      toast.success('Return restored'); fetchReturns();
                                    } catch (e) { toast.error('Restore failed: ' + e.message); }
                                  }
                                }}><RotateCcw size={14}/></button>
                              )}
                            </div>
                          ) : r.status === 'delete_requested' ? <span className="badge badge-amber">PENDING VOID</span> : (
                            <div style={{ display: 'flex', gap: 4 }}>
                              {editModeEnabled && (
                                <button className="btn btn-primary btn-sm" onClick={() => setEditingDoc({ doc: r, collection: 'godown_returns' })}><FileEdit size={14} /></button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                const reason = window.prompt("Reason for voiding this return?");
                                if (reason) {
                                  try {
                                    const { requestSoftDeleteDocument } = await import('../../firebase/auditServices');
                                    await requestSoftDeleteDocument('godown_returns', r.id, reason, profile.uid, profile.name || profile.email);
                                    toast.success('Void request sent for approval.');
                                    fetchReturns();
                                  } catch (e) { toast.error('Failed to void: ' + e.message); }
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

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc.doc}
          collectionName={editingDoc.collection}
          onClose={() => setEditingDoc(null)}
          onSaved={() => { editingDoc.collection === 'godown_sales' ? fetchHistory() : fetchReturns(); }}
        />
      )}

      {/* ── BANGLADESH SUPER-SHOP WHOLESALE RECEIPT PREVIEW & PRINT MODAL ── */}
      {completedSale && (
        <div className="modal-overlay">
          <div className={`modal ${isReceiptFullscreen ? 'modal-fullscreen' : ''}`} style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-teal" style={{ fontSize: 10 }}>WHOLESALE DEPOT</span>
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
                <div style={{ fontSize: 10, fontWeight: 700 }}>{completedSale.tagline || 'পাইকারি গুদাম ও ডিজিটাল খাতা'}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{completedSale.address || 'পাইকারি গুদাম ডিভিশন — ঢাকা, বাংলাদেশ'}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Hotline: {completedSale.phone || '+880 1700-000000'} | BIN: {completedSale.bin || '00129384-0101'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ border: '1px solid #0f172a', padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                    CUSTOMER WHOLESALE INVOICE
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 11, borderBottom: '1px dashed #334155', paddingBottom: 10, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Invoice:</b> {completedSale.receiptNo}</span>
                  <span><b>Date:</b> {new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Officer:</b> Wholesale Officer</span>
                  <span><b>Mode:</b> {completedSale.paymentMethod || 'Cash'}</span>
                </div>
                {completedSale.buyerName && (
                  <div><b>Buyer:</b> {completedSale.buyerName}</div>
                )}
                {completedSale.buyerPhone && (
                  <div><b>Phone:</b> {completedSale.buyerPhone}</div>
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
                    <span style={{ maxWidth: '50%' }}>{idx + 1}. {it.brand} {it.productType}</span>
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
                id="btn-print-customer"
                type="button"
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => printThermalHTMLReceipt(completedSale, 'Godown Wholesale Division')}
              >
                <Printer size={18} /> Print 80mm Thermal Receipt (ESC/POS)
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  id="btn-print-company"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => generateGodownReceipt(completedSale, entities, 'customer')}
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
    </div>
  );
}
