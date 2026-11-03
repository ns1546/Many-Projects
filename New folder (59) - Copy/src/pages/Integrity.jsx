import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { downloadCSV } from '../utils/csvExport';
import toast from 'react-hot-toast';
import { getAuditLogs, revertAuditLog, restoreSoftDeletedDocument, resolveAuditLog } from '../firebase/auditServices';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

const COLLECTIONS = [
  'shop_sales', 'shop_inventory', 'shop_returns', 'expense_entries', 'daily_closings', 'product_requests', 
  'godown_sales', 'godown_stock', 'godown_entries', 'dispatch_logs', 'product_entities', 'godown_returns', 'audit_logs'
];

export default function Integrity() {
  const { profile } = useAuth();
  const fileInputRef = useRef(null);
  const [data, setData] = useState({ entries: [], stock: [], dispatches: [], shopSales: [], godownSales: [], entities: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tab, setTab] = useState('godown');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [ent, entr, stk, disp, ss, gs] = await Promise.all([
          getDocs(collection(db, 'product_entities')),
          getDocs(query(collection(db, 'godown_entries'), orderBy('entryDate', 'desc'))),
          getDocs(collection(db, 'godown_stock')),
          getDocs(query(collection(db, 'dispatch_logs'), orderBy('dispatchDate', 'desc'))),
          getDocs(query(collection(db, 'shop_sales'), orderBy('saleDate', 'desc'))),
          getDocs(query(collection(db, 'godown_sales'), orderBy('saleDate', 'desc'))),
        ]);
        setData({
          entities: ent.docs.map(d => ({ id: d.id, ...d.data() })),
          entries: entr.docs.map(d => ({ id: d.id, ...d.data() })),
          stock: stk.docs.map(d => ({ id: d.id, ...d.data() })),
          dispatches: disp.docs.map(d => ({ id: d.id, ...d.data() })),
          shopSales: ss.docs.map(d => ({ id: d.id, ...d.data() })),
          godownSales: gs.docs.map(d => ({ id: d.id, ...d.data() })),
        });
      } catch { toast.error('Failed to load integrity data.'); }
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (tab === 'audit') {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        const logs = await getAuditLogs();
        setAuditLogs(logs);
        setLoadingLogs(false);
      };
      fetchLogs();
    }
  }, [tab]);

  const getEntityName = (id) => {
    const e = data.entities.find(x => x.id === id);
    return e ? `${e.brand} ${e.productType}${e.flavor ? ' ' + e.flavor : ''}${e.weight ? ' ' + e.weight : ''}` : id;
  };

  // ── Godown reconciliation: total entered vs current stock + dispatched + sold ──
  const godownReconciliation = data.entities.map(entity => {
    const totalIn = data.entries.filter(e => e.entityId === entity.id).reduce((a, e) => a + (e.qty || 0), 0);
    const totalInValue = data.entries.filter(e => e.entityId === entity.id).reduce((a, e) => a + (e.totalCost || 0), 0);
    const currentStock = data.stock.find(s => s.entityId === entity.id)?.qtyInStock || 0;
    const dispatched = data.dispatches.filter(d => d.status !== 'cancelled').reduce((a, d) => a + (d.items || []).filter(it => it.entityId === entity.id).reduce((b, it) => b + (it.qty || 0), 0), 0);
    const soldGodown = data.godownSales.reduce((a, s) => a + (s.items || []).filter(it => it.entityId === entity.id).reduce((b, it) => b + (it.qty || 0), 0), 0);
    const expected = currentStock + dispatched + soldGodown;
    const discrepancy = totalIn - expected;
    return { entity, totalIn, totalInValue, currentStock, dispatched, soldGodown, expected, discrepancy };
  }).filter(r => r.totalIn > 0);

  const discrepancies = godownReconciliation.filter(r => Math.abs(r.discrepancy) > 0);
  const totalEntryValue = data.entries.reduce((a, e) => a + (e.totalCost || 0), 0);

  // ── Shop reconciliation: dispatched to shop vs shop inventory + sold ──
  const shopReconciliation = data.entities.map(entity => {
    const dispatchedToShop = data.dispatches.filter(d => d.status === 'confirmed').reduce((a, d) => a + (d.items || []).filter(it => it.entityId === entity.id).reduce((b, it) => b + (it.qty || 0), 0), 0);
    const soldShop = data.shopSales.reduce((a, s) => a + (s.items || []).filter(it => it.entityId === entity.id).reduce((b, it) => b + (it.qty || 0), 0), 0);
    const shopStock = 0; // actual from shop_inventory (simplified)
    if (dispatchedToShop === 0 && soldShop === 0) return null;
    return { entity, dispatchedToShop, soldShop, remaining: dispatchedToShop - soldShop };
  }).filter(Boolean);

  const pgGodown = usePagination(godownReconciliation, 25);
  const pgShop = usePagination(shopReconciliation, 25);
  const pgEntries = usePagination(data.entries, 25);
  const pgAudit = usePagination(auditLogs, 25);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Integrity Check</h1>
          <p className="page-subtitle">Cross-reference godown stock, dispatches, and sales for discrepancies</p>
        </div>
        <div className="page-header-actions">
          <button id="btn-export-integrity" className="btn btn-secondary" onClick={() => {
            const rows = godownReconciliation.map(r => ({
              Product: getEntityName(r.entity.id), 'Total In': r.totalIn, 'Total Cost (৳)': r.totalInValue,
              'Current Stock': r.currentStock, 'Dispatched': r.dispatched, 'Godown Sold': r.soldGodown,
              'Expected': r.expected, 'Discrepancy': r.discrepancy,
            }));
            downloadCSV(rows, `integrity-report-${new Date().toLocaleDateString('en-CA')}.csv`);
            toast.success('Report exported.');
          }}>⬇ Export Report</button>
        </div>
      </div>

      {/* Alert summary */}
      <div className="stat-grid mb-4">
        <div className={`stat-card ${discrepancies.length > 0 ? 'red' : 'green'}`}>
          <div className="stat-label">Discrepancies Found</div>
          <div className="stat-value">{discrepancies.length}</div>
          <div className="stat-meta text-muted">products with mismatched quantities</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Stock Value Entered</div>
          <div className="stat-value"><span className="currency-symbol">৳</span> {totalEntryValue.toLocaleString()}</div>
          <div className="stat-meta text-muted">sum of all godown purchase entries</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-label">Products Tracked</div>
          <div className="stat-value">{godownReconciliation.length}</div>
          <div className="stat-meta text-muted">entities with intake history</div>
        </div>
      </div>

      <div className="tabs mb-4" style={{ maxWidth: 640 }}>
        <button id="tab-godown-recon" className={`tab ${tab === 'godown' ? 'active' : ''}`} onClick={() => setTab('godown')}>Godown Reconciliation</button>
        <button id="tab-shop-recon" className={`tab ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>Shop Tracking</button>
        <button id="tab-entries" className={`tab ${tab === 'entries' ? 'active' : ''}`} onClick={() => setTab('entries')}>Entry Log</button>
        {profile?.role === 'admin' && (
          <button id="tab-audit" className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}> Audit Logs</button>
        )}
      </div>

      {tab === 'godown' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">Godown Stock Reconciliation</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Formula: Total In = Current Stock + Dispatched + Godown Sold</div>
          </div>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Product</th><th>Total In</th><th>Cost</th><th>In Godown</th><th>Dispatched</th><th>Godown Sold</th><th>Expected</th><th>Status</th></tr></thead>
                <tbody>
                  {pgGodown.paged.map(r => (
                    <tr key={r.entity.id} style={{ background: Math.abs(r.discrepancy) > 0 ? 'rgba(239,68,68,0.05)' : '' }}>
                      <td className="td-bold" style={{ maxWidth: 180 }}>{getEntityName(r.entity.id)}</td>
                      <td>{r.totalIn}</td>
                      <td style={{ color: 'var(--gold)' }}>৳{r.totalInValue.toLocaleString()}</td>
                      <td>{r.currentStock}</td>
                      <td>{r.dispatched}</td>
                      <td>{r.soldGodown}</td>
                      <td>{r.expected}</td>
                      <td>
                        {r.discrepancy === 0
                          ? <span className="badge badge-green">✓ Match</span>
                          : <span className="badge badge-red">⚠ {r.discrepancy > 0 ? '+' : ''}{r.discrepancy} units</span>}
                      </td>
                    </tr>
                  ))}
                  {godownReconciliation.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="empty-title">No data yet</div></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
          {!loading && godownReconciliation.length > 0 && (
            <Pagination 
              page={pgGodown.page} totalPages={pgGodown.totalPages} total={pgGodown.total}
              startRecord={pgGodown.startRecord} endRecord={pgGodown.endRecord} perPage={pgGodown.perPage}
              onPageChange={pgGodown.goTo} onPerPageChange={pgGodown.setPerPage}
            />
          )}
        </div>
      )}

      {tab === 'shop' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">Shop Dispatch vs Sales Tracking</div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Product</th><th>Dispatched to Shop</th><th>Sold in Shop</th><th>Remaining</th></tr></thead>
              <tbody>
                {pgShop.paged.map(r => (
                  <tr key={r.entity.id}>
                    <td className="td-bold">{getEntityName(r.entity.id)}</td>
                    <td>{r.dispatchedToShop}</td>
                    <td>{r.soldShop}</td>
                    <td><span className={`badge badge-${r.remaining >= 0 ? 'green' : 'red'}`}>{r.remaining}</span></td>
                  </tr>
                ))}
                {shopReconciliation.length === 0 && <tr><td colSpan={4}><div className="empty-state"><div className="empty-title">No data yet</div></div></td></tr>}
              </tbody>
            </table>
          </div>
          {shopReconciliation.length > 0 && (
            <Pagination 
              page={pgShop.page} totalPages={pgShop.totalPages} total={pgShop.total}
              startRecord={pgShop.startRecord} endRecord={pgShop.endRecord} perPage={pgShop.perPage}
              onPageChange={pgShop.goTo} onPerPageChange={pgShop.setPerPage}
            />
          )}
        </div>
      )}

      {tab === 'entries' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="card-title">All Godown Entry Records</div>
            <span className="badge badge-teal">{data.entries.length} entries</span>
          </div>
          <div className="table-wrapper">
            {loading ? <div className="loading-center"><div className="spinner" /></div> : (
              <table>
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price (৳)</th><th>Total Cost (৳)</th><th>By</th><th>Date</th></tr></thead>
                <tbody>
                  {pgEntries.paged.map(e => (
                    <tr key={e.id}>
                      <td className="td-bold">{getEntityName(e.entityId)}</td>
                      <td>{e.qty}</td>
                      <td>৳{(e.unitPurchasePrice || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(e.totalCost || 0).toLocaleString()}</td>
                      <td>{e.enteredBy}</td>
                      <td className="text-sm text-muted">{e.entryDate?.toDate?.()?.toLocaleString() || '—'}</td>
                    </tr>
                  ))}
                  {data.entries.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-title">No entries</div></div></td></tr>}
                </tbody>
              </table>
            )}
          </div>
          {!loading && data.entries.length > 0 && (
            <Pagination 
              page={pgEntries.page} totalPages={pgEntries.totalPages} total={pgEntries.total}
              startRecord={pgEntries.startRecord} endRecord={pgEntries.endRecord} perPage={pgEntries.perPage}
              onPageChange={pgEntries.goTo} onPerPageChange={pgEntries.setPerPage}
            />
          )}
        </div>
      )}

      {tab === 'audit' && profile?.role === 'admin' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="card-title">System Audit & Integrity Logs</div>
            <span className="badge badge-purple">{auditLogs.filter(l => l.status === 'pending_review').length} Pending Review</span>
          </div>
          <div className="table-wrapper">
            {loadingLogs ? <div className="loading-center"><div className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Target Collection</th>
                    <th>User</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pgAudit.paged.map(log => (
                    <tr key={log.id} style={{ background: log.status === 'pending_review' ? 'rgba(240,165,0,0.05)' : '' }}>
                      <td className="text-sm text-muted">{log.timestamp?.toDate?.()?.toLocaleString() || '—'}</td>
                      <td><span className={`badge ${log.actionType === 'DELETE' ? 'badge-red' : 'badge-gold'}`}>{log.actionType}</span></td>
                      <td className="text-sm">{log.collection}</td>
                      <td>{log.performedByName || log.performedBy}</td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>{log.reason}</div>
                      </td>
                      <td>
                        {log.status === 'pending_review' && <span className="badge badge-gold">Pending Review</span>}
                        {log.status === 'approved' && <span className="badge badge-green">Approved</span>}
                        {log.status === 'rejected' && <span className="badge badge-red">Rejected (Reverted)</span>}
                        {log.status === 'restored' && <span className="badge badge-teal">Restored</span>}
                      </td>
                      <td>
                        {log.status === 'pending_review' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-success btn-sm" onClick={async () => {
                              try {
                                await resolveAuditLog(log.id, 'approved', profile.uid, profile.name || profile.email);
                                toast.success('Approved.');
                                const logs = await getAuditLogs();
                                setAuditLogs(logs);
                              } catch (e) { toast.error('Error: ' + e.message); }
                            }}>Approve</button>

                            {log.actionType === 'DELETE' ? (
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                try {
                                  await restoreSoftDeletedDocument(log.collection, log.documentId, log.id, profile.uid, profile.name || profile.email);
                                  toast.success('Restored deleted record.');
                                  const logs = await getAuditLogs();
                                  setAuditLogs(logs);
                                } catch (e) { toast.error('Error: ' + e.message); }
                              }}>Restore Record</button>
                            ) : (
                              <button className="btn btn-danger btn-sm" onClick={async () => {
                                try {
                                  await revertAuditLog(log, profile.uid, profile.name || profile.email);
                                  toast.success('Reverted edit.');
                                  const logs = await getAuditLogs();
                                  setAuditLogs(logs);
                                } catch (e) { toast.error('Error: ' + e.message); }
                              }}>Reject & Revert</button>
                            )}
                          </div>
                        )}
                        {log.status !== 'pending_review' && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolved by {log.resolvedByName}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-title">No audit logs</div></div></td></tr>}
                </tbody>
              </table>
            )}
          </div>
          {!loadingLogs && auditLogs.length > 0 && (
            <Pagination 
              page={pgAudit.page} totalPages={pgAudit.totalPages} total={pgAudit.total}
              startRecord={pgAudit.startRecord} endRecord={pgAudit.endRecord} perPage={pgAudit.perPage}
              onPageChange={pgAudit.goTo} onPerPageChange={pgAudit.setPerPage}
            />
          )}
        </div>
      )}

    </div>
  );
}
