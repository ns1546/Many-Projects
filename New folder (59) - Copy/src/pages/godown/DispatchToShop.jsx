import React, { useState, useEffect } from 'react';
import { FileEdit, Trash2 } from 'lucide-react';
import { getProductEntities, getGodownStock, dispatchToShop, getDispatchLogs } from '../../firebase/godownServices';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import { downloadCSV } from '../../utils/csvExport';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import EcommerceGrid from '../../components/EcommerceGrid';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';

export default function DispatchToShop() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const [tab, setTab] = useState('dispatch'); // dispatch | log
  const [entities, setEntities] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [logs, setLogs] = useState([]);
  
  const [logSearch, setLogSearch] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const filteredLogs = React.useMemo(() => {
    return logs.filter(l => {
      let match = true;
      if (logSearch) {
        match = match && ((l.receiptNo || '').toLowerCase().includes(logSearch.toLowerCase()) || 
                          (l.notes || '').toLowerCase().includes(logSearch.toLowerCase()) ||
                          (l.dispatchedByName || '').toLowerCase().includes(logSearch.toLowerCase()));
      }
      if (logDateFrom) {
        const d = l.dispatchDate?.toDate?.() || new Date(0);
        if (d < new Date(logDateFrom)) match = false;
      }
      if (logDateTo) {
        const d = l.dispatchDate?.toDate?.() || new Date(0);
        const t = new Date(logDateTo);
        t.setHours(23, 59, 59, 999);
        if (d > t) match = false;
      }
      return match;
    });
  }, [logs, logSearch, logDateFrom, logDateTo]);

  const logPg = usePagination(filteredLogs, 15);

  const [logLoading, setLogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Dispatch form
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchBase = async () => {
    const [ents, stocks] = await Promise.all([getProductEntities(), getGodownStock()]);
    setEntities(ents);
    const sm = {};
    stocks.forEach(s => { sm[s.entityId] = s; });
    setStockMap(sm);
  };

  const fetchLogs = async () => {
    setLogLoading(true);
    const l = await getDispatchLogs();
    setLogs(l);
    setLogLoading(false);
  };

  useEffect(() => { fetchBase(); }, []);
  useEffect(() => { if (tab === 'log') fetchLogs(); }, [tab]);

  const fuse = new Fuse(entities, { keys: ['brand', 'productType', 'flavor', 'weight'], threshold: 0.35 });

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults(entities); return; }
    setSearchResults(fuse.search(searchQ).map(r => r.item));
  }, [searchQ, entities]);

  const addItem = (entity) => {
    if (items.find(i => i.entityId === entity.id)) { toast.error('Already in list.'); return; }
    const stock = stockMap[entity.id];
    setItems(p => [...p, {
      entityId: entity.id,
      brand: entity.brand,
      productType: entity.productType,
      flavor: entity.flavor,
      weight: entity.weight,
      unit: entity.unit,
      qty: 1,
      sellingPrice: '',
      availableQty: stock?.qtyInStock || 0,
    }]);
  };

  const updateItem = (idx, field, value) => {
    setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: field === 'qty' ? Number(value) : value } : it));
  };

  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));

  const handleDispatch = async () => {
    if (items.length === 0) { toast.error('Add at least one product to dispatch.'); return; }
    for (const it of items) {
      if (it.qty <= 0) { toast.error('Quantity must be > 0 for all items.'); return; }
      if (it.qty > it.availableQty) { toast.error(`Not enough stock: ${it.brand} ${it.productType} (available: ${it.availableQty})`); return; }
      if (!it.sellingPrice || Number(it.sellingPrice) <= 0) { toast.error(`Set selling price for ${it.brand} ${it.productType}.`); return; }
    }
    setSubmitting(true);
    try {
      const dispatchData = {
        items: items.map(it => ({
          entityId: it.entityId,
          brand: it.brand,
          productType: it.productType,
          flavor: it.flavor || '',
          weight: it.weight || '',
          unit: it.unit || 'pcs',
          qty: it.qty,
          sellingPrice: Number(it.sellingPrice),
        })),
        notes,
        dispatchedByName: profile.name || profile.email,
      };
      await dispatchToShop(dispatchData, profile.uid);
      toast.success('Dispatch sent to shop successfully!');
      setItems([]);
      setNotes('');
      fetchBase();
    } catch (err) {
      toast.error('Dispatch failed: ' + err.message);
    }
    setSubmitting(false);
  };

  const getEntityName = (entityId) => {
    const en = entities.find(e => e.id === entityId);
    return en ? `${en.brand} ${en.productType}${en.flavor ? ' — ' + en.flavor : ''}${en.weight ? ' ' + en.weight : ''}` : entityId;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dispatch to Shop</h1>
          <p className="page-subtitle">Transfer products from Godown to Shop — sets selling price for each item</p>
        </div>
      </div>

      <div className="tabs mb-4" style={{ maxWidth: 360 }}>
        <button id="tab-dispatch" className={`tab ${tab === 'dispatch' ? 'active' : ''}`} onClick={() => setTab('dispatch')}> New Dispatch</button>
        <button id="tab-dispatch-log" className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}> Dispatch Log</button>
      </div>

      {/* ── DISPATCH FORM ── */}
      {tab === 'dispatch' && (
        <div className="ecommerce-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* E-Commerce Product Selection */}
            <EcommerceGrid
              items={entities.map(e => ({ ...e, qty: stockMap[e.id]?.qtyInStock || 0 })).filter(i => i.qty > 0)}
              search={searchQ}
              onSearchChange={setSearchQ}
              getStockInfo={(item) => ({ qty: item.qty || 0, label: 'in godown' })}
              renderActions={(item) => (
                <button 
                  className="btn btn-primary w-full" 
                  style={{ padding: '8px' }} 
                  onClick={() => addItem(item)}
                >
                   Add to Dispatch
                </button>
              )}
              emptyMessage="No available products in godown."
            />

            {/* Items list */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div className="card-title"> Dispatch List</div>
                <span className="badge badge-teal">{items.length} products</span>
              </div>
              {items.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-icon"></div>
                  <div className="empty-title">No items selected</div>
                  <div className="empty-desc">Search and add products to dispatch</div>
                </div>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{it.brand} {it.productType}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {it.flavor && `${it.flavor} · `}{it.weight && `${it.weight} · `}
                          Godown stock: {it.availableQty} {it.unit}
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeItem(idx)}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Qty to Send</label>
                        <input
                          id={`dispatch-qty-${idx}`}
                          type="number"
                          className="form-input"
                          min="1"
                          max={it.availableQty}
                          value={it.qty}
                          onChange={e => updateItem(idx, 'qty', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Selling Price (৳)</label>
                        <input
                          id={`dispatch-price-${idx}`}
                          type="number"
                          className="form-input"
                          placeholder="Set shop price"
                          min="0"
                          step="0.01"
                          value={it.sellingPrice}
                          onChange={e => updateItem(idx, 'sellingPrice', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Total Value</label>
                        <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--teal)', fontSize: 13 }}>
                          ৳{(it.qty * (Number(it.sellingPrice) || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
              <div className="card-title mb-3"> Dispatch Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text-muted">Products</span>
                  <span style={{ fontWeight: 700 }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text-muted">Total Units</span>
                  <span style={{ fontWeight: 700 }}>{items.reduce((a, it) => a + it.qty, 0)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Total Selling Value</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>
                    ৳{items.reduce((a, it) => a + it.qty * (Number(it.sellingPrice) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title mb-2"> Notes</div>
              <textarea
                id="dispatch-notes"
                className="form-textarea"
                rows={3}
                placeholder="Optional dispatch notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div style={{ padding: '14px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
               After dispatch, stock will be <strong>immediately deducted</strong> from Godown and appear as <strong>Pending</strong> in the Shop dashboard for confirmation.
            </div>

            <button
              id="btn-confirm-dispatch"
              className="btn btn-primary btn-lg w-full"
              onClick={handleDispatch}
              disabled={submitting || items.length === 0}
            >
              {submitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Send to Shop'}
            </button>
          </div>
        </div>
      )}

      {/* ── DISPATCH LOG ── */}
      {tab === 'log' && (
        <div className="card mt-4" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Dispatch History</div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={logDateFrom} onChange={e => setLogDateFrom(e.target.value)} title="Date From" />
              <span className="text-muted" style={{ fontSize: 12 }}>to</span>
              <input type="date" className="form-input" style={{ padding: '6px 10px', fontSize: 13, height: 34 }} value={logDateTo} onChange={e => setLogDateTo(e.target.value)} title="Date To" />
              
              <div className="search-bar" style={{ flex: '0 0 220px', height: 34 }}>
                <span className="search-icon"></span>
                <input placeholder="Search dispatch..." style={{ fontSize: 13 }} value={logSearch} onChange={e => setLogSearch(e.target.value)} />
                {logSearch && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setLogSearch('')}>✕</button>}
              </div>

              <button
                id="btn-export-dispatch"
                className="btn btn-secondary btn-sm"
                style={{ height: 34 }}
                onClick={() => {
                  const rows = filteredLogs.map(l => ({
                    'Items': l.items?.map(i => `${i.brand} ${i.productType} (${i.qty})`).join(' | ') || '—',
                    'Dispatched By': l.dispatchedByName,
                    'Status': l.status,
                    'Notes': l.notes || '—',
                    'Date': l.dispatchDate?.toDate?.()?.toLocaleString() || '—',
                  }));
                  downloadCSV(rows, `dispatch-log-${new Date().toLocaleDateString('en-CA')}.csv`);
                  toast.success('Exported.');
                }}
              >⬇ Export</button>
            </div>
          </div>
          <div className="table-wrapper">
            {logLoading ? <div className="loading-center"><div className="spinner" /></div>
              : logs.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No dispatches yet</div></div>
              : (
                <table>
                  <thead>
                    <tr><th>Dispatch ID</th><th>Products</th><th>Total Units</th><th>Dispatched By</th><th>Status</th><th>Notes</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {logPg.paged.map(l => (
                      <tr key={l.id}>
                        <td className="text-sm" style={{ fontFamily: 'monospace' }}>{l.receiptNo || l.id.slice(0, 8)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 260 }}>
                            {l.items?.map((it, i) => (
                              <span key={i} className="tag" style={{ fontSize: 10 }}>
                                {it.brand} {it.productType} ({it.qty})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{l.items?.reduce((a, it) => a + it.qty, 0) || 0}</td>
                        <td>{l.dispatchedByName}</td>
                        <td>
                          <span className={`badge badge-${l.status === 'pending' || l.status === 'delete_requested' ? 'amber' : l.status === 'confirmed' ? 'green' : 'red'}`}>
                            {l.status === 'delete_requested' ? 'PENDING VOID' : l.status}
                          </span>
                        </td>
                        <td className="text-sm text-muted">{l.notes || '—'}</td>
                        <td className="text-sm text-muted">{l.dispatchDate?.toDate?.()?.toLocaleString() || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {editModeEnabled && l.status !== 'deleted' && l.status !== 'voided' && l.status !== 'delete_requested' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setEditingDoc(l)}><FileEdit size={14} /></button>
                            )}
                            {l.status !== 'deleted' && l.status !== 'voided' && l.status !== 'cancelled' && l.status !== 'delete_requested' && (
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                const reason = window.prompt("Reason for voiding this dispatch?");
                                if (reason) {
                                  try {
                                    const isAdmin = ['admin', 'chairman'].includes(profile?.role);
                                    const { requestSoftDeleteDocument, softDeleteDocument } = await import('../../firebase/auditServices');
                                    if (isAdmin) {
                                      await softDeleteDocument('dispatch_logs', l.id, reason, profile.uid, profile.name || profile.email);
                                      toast.success('Dispatch voided. Stock returned to Godown.');
                                    } else {
                                      await requestSoftDeleteDocument('dispatch_logs', l.id, reason, profile.uid, profile.name || profile.email);
                                      toast.success('Void request sent for admin approval.');
                                    }
                                    fetchLogs();
                                  } catch (e) {
                                    toast.error('Failed to void: ' + e.message);
                                  }
                                }
                              }}><Trash2 size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
          {filteredLogs.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }}>
              <div className="text-sm text-muted">
                Showing {logPg.paged.length} of {filteredLogs.length} entries
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" disabled={logPg.page === 1} onClick={() => logPg.setPage(p => p - 1)}>Prev</button>
                <button className="btn btn-secondary btn-sm" disabled={logPg.page >= logPg.totalPages} onClick={() => logPg.setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc}
          collectionName="dispatch_logs"
          onClose={() => setEditingDoc(null)}
          onSaved={fetchLogs}
        />
      )}
    </div>
  );
}
