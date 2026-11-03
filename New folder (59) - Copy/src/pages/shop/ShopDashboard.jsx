import React, { useState, useEffect, useMemo } from 'react';
import { FileEdit, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';
import { 
  getShopInventory, getPendingDispatches, confirmDispatch,
  getTodaySalesData, getTodayExpenses, getTodayReturns, saveDailyClosingFull
} from '../../firebase/shopServices';
import { downloadCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import EcommerceGrid from '../../components/EcommerceGrid';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

export default function ShopDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  
  const [inventory, setInventory] = useState([]);
  const [editingDoc, setEditingDoc] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [confirmingId, setConfirmingId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pendingPg = usePagination(pending, 10);

  // EOD State
  const [eodData, setEodData] = useState(null);
  const [declaredCash, setDeclaredCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inv, pend] = await Promise.all([getShopInventory(), getPendingDispatches()]);
      setInventory(inv);
      setPending(pend);
    } catch { toast.error('Failed to load data.'); }
    setLoading(false);
  };

  const fetchEODData = async () => {
    try {
      const [sales, expenses, returns] = await Promise.all([
        getTodaySalesData(),
        getTodayExpenses(),
        getTodayReturns()
      ]);
      
      const cashSales = sales.reduce((sum, s) => sum + (s.paymentMethod === 'Cash' ? (s.totalAmount || 0) : 0), 0);
      const cardSales = sales.reduce((sum, s) => sum + (s.paymentMethod === 'Card' ? (s.totalAmount || 0) : 0), 0);
      const bkashSales = sales.reduce((sum, s) => sum + (s.paymentMethod === 'bKash' ? (s.totalAmount || 0) : 0), 0);
      const expenseTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const cashReturns = returns.reduce((sum, r) => sum + (r.refundMethod === 'Cash' ? (r.totalRefund || 0) : 0), 0);

      // Starting cash would theoretically be queried, assuming 0 for now or fetched from previous close
      const startingCash = 0; 
      
      const expectedCash = startingCash + cashSales - expenseTotal - cashReturns;

      setEodData({
        salesCount: sales.length,
        cashSales,
        cardSales,
        bkashSales,
        expenseTotal,
        cashReturns,
        startingCash,
        expectedCash
      });
    } catch (err) {
      toast.error('Failed to load EOD data');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (activeTab === 'eod' && !eodData) {
      fetchEODData();
    }
  }, [activeTab]);

  const handleConfirm = async (dispatch) => {
    setConfirmingId(dispatch.id);
    try {
      await confirmDispatch(dispatch.id, dispatch.items);
      toast.success('Stock confirmed and added to shop!');
      fetchAll();
    } catch (err) { toast.error('Error: ' + err.message); }
    setConfirmingId(null);
  };

  const submitEOD = async () => {
    if (!declaredCash) return toast.error('Please enter actual counted cash');
    setIsClosing(true);
    try {
      const actualCash = Number(declaredCash);
      const discrepancy = actualCash - eodData.expectedCash;
      
      await saveDailyClosingFull({
        ...eodData,
        actualCash,
        discrepancy,
        notes: closingNotes,
        status: discrepancy === 0 ? 'balanced' : (discrepancy > 0 ? 'overage' : 'shortage')
      }, profile?.uid || 'unknown', profile?.name || 'Unknown');
      
      toast.success('Register Closed successfully!');
      setDeclaredCash('');
      setClosingNotes('');
      fetchEODData();
    } catch (err) {
      toast.error('Error closing register');
    }
    setIsClosing(false);
  };

  const totalProducts = inventory.length;
  const totalUnits = inventory.reduce((a, i) => a + (i.qty || 0), 0);
  const lowStock = inventory.filter(i => (i.qty || 0) > 0 && (i.qty || 0) <= 5).length;
  const outOfStock = inventory.filter(i => (i.qty || 0) <= 0).length;

  const filteredInventory = useMemo(() => {
    if (stockFilter === 'out_of_stock') return inventory.filter(i => (i.qty || 0) <= 0);
    if (stockFilter === 'low_stock') return inventory.filter(i => (i.qty || 0) > 0 && (i.qty || 0) <= 5);
    return inventory;
  }, [inventory, stockFilter]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <p className="page-subtitle" style={{ marginTop: 0 }}>Live inventory — {totalProducts} products | {pending.length} pending deliveries</p>
        </div>
        <div className="page-header-actions">
          <button id="btn-shop-refresh" className="btn btn-ghost" onClick={fetchAll} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button id="btn-shop-export" className="btn btn-secondary" onClick={() => {
            const rows = filteredInventory.map(i => ({
              Brand: i.brand, 'Product Type': i.productType, Flavor: i.flavor || '—',
              Weight: i.weight || '—', Qty: i.qty, 'Selling Price (৳)': i.sellingPrice,
            }));
            downloadCSV(rows, `shop-inventory-${new Date().toLocaleDateString('en-CA')}.csv`);
            toast.success('CSV exported.');
          }}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-4">
        <div 
          className="stat-card gold" 
          style={{ cursor: 'pointer', outline: stockFilter === 'all' ? '2px solid var(--gold)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => { setStockFilter('all'); setActiveTab('inventory'); }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to view all shop inventory"
        >
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>Inspect All Products →</div>
        </div>
        <div 
          className="stat-card teal" 
          style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => { setStockFilter('all'); setActiveTab('inventory'); }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to view all product stock units"
        >
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{totalUnits.toLocaleString()}</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--teal)' }}>Inspect Units →</div>
        </div>
        <div 
          className="stat-card red" 
          style={{ cursor: 'pointer', outline: stockFilter === 'out_of_stock' ? '2px solid var(--red)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => { setStockFilter('out_of_stock'); setActiveTab('inventory'); }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to filter out-of-stock items immediately"
        >
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value">{outOfStock}</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>Filter Out of Stock →</div>
        </div>
        <div 
          className="stat-card purple" 
          style={{ cursor: 'pointer', outline: stockFilter === 'low_stock' ? '2px solid var(--purple)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => { setStockFilter('low_stock'); setActiveTab('inventory'); }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to filter low stock items (≤5)"
        >
          <div className="stat-label">Low Stock (≤5)</div>
          <div className="stat-value">{lowStock}</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>Filter Low Stock →</div>
        </div>
      </div>

      {/* Pending deliveries banner */}
      {pending.length > 0 && activeTab !== 'pending' && (
        <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.15s' }} onClick={() => setActiveTab('pending')}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>{pending.length} Pending Stock Delivery from Godown</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to review and confirm incoming products</div>
          </div>
          <span className="badge badge-amber" style={{ marginLeft: 'auto', fontSize: 13, padding: '6px 14px', fontWeight: 700 }}>Review Deliveries → ({pending.length})</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs mb-4">
        <button id="tab-inventory" className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
        <button id="tab-pending" className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending {pending.length > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: 6 }}>{pending.length}</span>}
        </button>
        <button id="tab-eod" className={`tab ${activeTab === 'eod' ? 'active' : ''}`} onClick={() => setActiveTab('eod')}>
          Today's Shift Register &amp; EOD Status
        </button>
      </div>

      {/* ── INVENTORY TAB ── */}
      {activeTab === 'inventory' && (
        <EcommerceGrid
          items={filteredInventory}
          search={search}
          onSearchChange={setSearch}
          renderActions={(item) => (
            <>
              <button className="btn btn-secondary w-full" style={{ padding: '8px' }} onClick={() => setSelectedItem(item)}> Details</button>
              <button className="btn btn-primary w-full" style={{ padding: '8px' }} onClick={() => navigate('/shop/sales')}> Sell</button>
              {editModeEnabled && (
                <button className="btn w-full" style={{ padding: '8px', background: 'var(--amber)', color: 'white' }} onClick={() => setEditingDoc(item)}> <FileEdit size={14} /></button>
              )}
            </>
          )}
          emptyMessage="No products found in Shop Inventory."
        />
      )}

      {/* ── PENDING TAB ── */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-title">No pending deliveries</div></div></div>
          ) : pendingPg.paged.map(d => (
            <div key={d.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Dispatch from Godown</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    By {d.dispatchedByName} · {d.dispatchDate?.toDate?.()?.toLocaleString() || '—'}
                  </div>
                  {d.notes && <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>Note: {d.notes}</div>}
                </div>
                <button
                  id={`btn-confirm-dispatch-${d.id}`}
                  className="btn btn-success"
                  onClick={() => handleConfirm(d)}
                  disabled={confirmingId === d.id}
                >
                  {confirmingId === d.id ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : ' Confirm Receipt'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>{item.brand}</span>
                        <span className="badge badge-teal" style={{ fontSize: 10 }}>{item.productType}</span>
                        {item.flavor && <span className="badge badge-purple" style={{ fontSize: 10 }}>{item.flavor}</span>}
                        {item.weight && <span className="badge badge-blue" style={{ fontSize: 10 }}>{item.weight}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{item.qty} {item.unit}</div>
                      <div style={{ fontSize: 11, color: 'var(--gold)' }}>Sell @ <span className="currency-symbol">৳</span>{item.sellingPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!loading && pending.length > 0 && (
            <Pagination
              page={pendingPg.page} totalPages={pendingPg.totalPages} total={pendingPg.total}
              startRecord={pendingPg.startRecord} endRecord={pendingPg.endRecord}
              perPage={pendingPg.perPage}
              onPageChange={pendingPg.goTo}
              onPerPageChange={pendingPg.setPerPage}
            />
          )}
        </div>
      )}

      {/* ── END OF DAY RECONCILIATION & STATUS MONITOR ── */}
      {activeTab === 'eod' && eodData && (
        <div className="card" style={{ maxWidth: 880, margin: '0 auto', borderTop: '4px solid var(--gold)', padding: '28px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Today's Shift Register & EOD Status</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Live cash drawer calculation & verification status for {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* System Calculated Expected Cash */}
            <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1 }}>1. CASH DRAWER EQUATION</span>
                <span className="badge badge-teal" style={{ fontSize: 10 }}>Live System Calculation</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span className="text-muted">Starting Cash:</span>
                <span style={{ fontWeight: 600 }}>৳{eodData.startingCash.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span className="text-muted">+ Cash Sales ({eodData.salesCount} txns):</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>+ ৳{eodData.cashSales.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span className="text-muted">- Petty Cash Expenses:</span>
                <span style={{ fontWeight: 700, color: 'var(--red)' }}>- ৳{eodData.expenseTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14, paddingBottom: 16, borderBottom: '1px dashed var(--border)' }}>
                <span className="text-muted">- Cash Returns/Refunds:</span>
                <span style={{ fontWeight: 700, color: 'var(--red)' }}>- ৳{eodData.cashReturns.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
                <span>Expected Cash in Drawer:</span>
                <span style={{ color: 'var(--gold)' }}>৳{eodData.expectedCash.toLocaleString()}</span>
              </div>

              <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>NON-CASH DIGITAL TOTALS (AUTO-SETTLED)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Card POS: <b>৳{eodData.cardSales.toLocaleString()}</b></span>
                  <span>bKash/Mobile: <b>৳{eodData.bkashSales.toLocaleString()}</b></span>
                </div>
              </div>
            </div>

            {/* Official Register Closing Direction */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 14 }}>
                  2. EOD REGISTER CLOSING STATUS
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Official Register Closing Workflow
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    To avoid duplicate submissions and maintain unified financial audit logs, daily physical cash counts and End-of-Day register closings are recorded directly in the POS suite under the <b>Daily Closing</b> tab.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  style={{ height: 46, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => navigate('/shop/sales')}
                >
                  Open POS Daily Closing Register &rarr;
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ height: 42, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => navigate('/revenue-tracker')}
                >
                  View Full Executive Revenue &amp; Hisab Tracker &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedItem(null)}>
          <div className={`modal ${isFullscreen ? 'modal-fullscreen' : ''}`}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between'}}>
              <h3 className="modal-title">Product Details</h3>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setSelectedItem(null)}><X size={16} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Brand', selectedItem.brand], ['Type', selectedItem.productType],
                ['Flavor', selectedItem.flavor || '—'], ['Weight', selectedItem.weight || '—'],
                ['Qty in Shop', `${selectedItem.qty} ${selectedItem.unit || 'pcs'}`],
                ['Selling Price', `৳${(selectedItem.sellingPrice || 0).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              {selectedItem.priceHistory?.length > 1 && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>PRICE HISTORY</div>
                  {[...selectedItem.priceHistory].reverse().slice(0, 5).map((ph, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span className="text-muted">{new Date(ph.date).toLocaleDateString()}</span>
                      <span style={{ fontWeight: 600 }}>৳{ph.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setSelectedItem(null)}>Close</button></div>
          </div>
        </div>
      )}

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc}
          collectionName="shop_inventory"
          onClose={() => setEditingDoc(null)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
