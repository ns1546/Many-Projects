import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { resolveAuditLog, restoreSoftDeletedDocument, revertAuditLog } from '../../firebase/auditServices';
import { universalRestoreFromLog, universalRevertEdit } from '../../firebase/universalEditService';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import UniversalEditModal from '../../components/UniversalEditModal';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import { Info, FileEdit, CheckCircle2, XCircle, RotateCcw, AlertCircle, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';

const ACTION_META = {
  DELETE:            { label: 'Soft Delete',        color: 'badge-red',    icon: <Trash2 size={12}/> },
  DELETE_REQUEST:    { label: 'Delete Request',     color: 'badge-amber',  icon: <AlertCircle size={12}/> },
  ADMIN_SOFT_DELETE: { label: 'Admin Soft Delete',  color: 'badge-red',    icon: <ShieldAlert size={12}/> },
  ADMIN_DELETE:      { label: 'Admin Hard Delete',  color: 'badge-red',    icon: <ShieldAlert size={12}/> },
  ADMIN_EDIT:        { label: 'Admin Edit',         color: 'badge-amber',  icon: <FileEdit size={12}/> },
  EDIT_REQUEST:      { label: 'Edit Request',       color: 'badge-amber',  icon: <AlertCircle size={12}/> },
  EDIT_STOCK:        { label: 'Edit Stock Qty',     color: 'badge-amber',  icon: <FileEdit size={12}/> },
  EDIT_SALE:         { label: 'Edit Sale',          color: 'badge-amber',  icon: <FileEdit size={12}/> },
  EDIT_INTAKE:       { label: 'Edit Intake',        color: 'badge-amber',  icon: <FileEdit size={12}/> },
  RESTORE:           { label: 'Restore',            color: 'badge-green',  icon: <RotateCcw size={12}/> },
};

const STATUS_META = {
  pending_review: { color: 'badge-amber',  label: 'PENDING' },
  approved:       { color: 'badge-green',  label: 'APPROVED' },
  restored:       { color: 'badge-blue',   label: 'RESTORED' },
  rejected:       { color: 'badge-red',    label: 'REJECTED' },
  reverted:       { color: 'badge-purple', label: 'REVERTED' },
};

const ReadableDataViewer = ({ data, level = 0 }) => {
  if (data === null || data === undefined) return <span style={{ color: 'var(--text-muted)' }}>null</span>;
  if (typeof data !== 'object') return <span style={{ fontWeight: 500 }}>{String(data)}</span>;
  
  if (data.seconds !== undefined) {
    return <span style={{ fontWeight: 500, color: 'var(--teal)' }}>{new Date(data.seconds * 1000).toLocaleString()}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: 'var(--text-muted)' }}>[] (empty)</span>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {data.map((item, i) => (
          <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
             <ReadableDataViewer data={item} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) return <span style={{ color: 'var(--text-muted)' }}>{} (empty)</span>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 12px', fontSize: 13, marginTop: level > 0 ? 4 : 0 }}>
      {entries.map(([k, v]) => {
        if (k.startsWith('_') || k === 'updatedAt' || k === 'createdAt') return null;
        return (
          <React.Fragment key={k}>
            <div style={{ color: 'var(--text-muted)', paddingTop: typeof v === 'object' && v !== null ? 4 : 0 }}>
              {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
            </div>
            <div>
              <ReadableDataViewer data={v} level={level + 1} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DataDiffViewer = ({ oldData, newData }) => {
  if (!oldData && !newData) return null;
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  const changes = [];

  const deepEqual = (x, y) => {
    if (x === y) return true;
    if (typeof x === 'object' && x != null && typeof y === 'object' && y != null) {
      if (Object.keys(x).length !== Object.keys(y).length) return false;
      for (let prop in x) {
        if (y.hasOwnProperty(prop)) {
          if (!deepEqual(x[prop], y[prop])) return false;
        } else return false;
      }
      return true;
    }
    return false;
  };

  for (const k of allKeys) {
    if (k.startsWith('_') || k === 'updatedAt' || k === 'createdAt' || k === 'timestamp') continue;
    const oldV = oldData?.[k];
    const newV = newData?.[k];
    
    if (!deepEqual(oldV, newV)) {
      changes.push({ key: k, oldV, newV });
    }
  }

  if (changes.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No notable fields changed.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '12px', padding: '0 0 8px 0', borderBottom: '2px solid var(--border)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
        <div>Field</div>
        <div>Old Value</div>
        <div>New Value</div>
      </div>
      {changes.map(c => (
        <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
            {c.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, background: '#fef2f2', padding: '6px', borderRadius: '4px', overflowX: 'auto' }}>
            <ReadableDataViewer data={c.oldV} />
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: 13, background: '#f0fdf4', padding: '6px', borderRadius: '4px', overflowX: 'auto' }}>
             <ReadableDataViewer data={c.newV} />
          </div>
        </div>
      ))}
    </div>
  );
};

const getHumanReadableSummary = (log) => {
  if (!log) return 'No summary available';
  const action = log.actionType || '';
  const collName = log.collection === 'shop_sales' ? 'Shop Sale'
    : log.collection === 'godown_sales' ? 'Godown Sale'
    : log.collection === 'shop_inventory' ? 'Shop Inventory'
    : log.collection === 'godown_inventory' ? 'Godown Inventory'
    : log.collection || 'Record';

  const docShort = log.documentId ? `#${String(log.documentId).slice(-6).toUpperCase()}` : '';

  if (action.includes('DELETE')) {
    const amount = log.oldData?.finalAmount || log.oldData?.totalAmount || log.oldData?.amount;
    return `Requested removal of ${collName} ${docShort}` + (amount ? ` (৳${amount})` : '');
  }

  if (action.includes('EDIT') || action.includes('UPDATE')) {
    const changedFields = [];
    const oldD = log.oldData || {};
    const newD = log.newData || {};
    for (const k of Object.keys({ ...oldD, ...newD })) {
      if (k.startsWith('_') || ['updatedAt', 'createdAt', 'timestamp'].includes(k)) continue;
      if (JSON.stringify(oldD[k]) !== JSON.stringify(newD[k])) {
        if (typeof newD[k] !== 'object') {
          changedFields.push(`${k}: ${oldD[k] ?? 'empty'} → ${newD[k] ?? 'empty'}`);
        } else {
          changedFields.push(`updated ${k}`);
        }
      }
    }
    if (changedFields.length > 0) {
      return `Modified ${collName} ${docShort} (${changedFields.slice(0, 2).join(', ')}${changedFields.length > 2 ? '…' : ''})`;
    }
    return `Modified ${collName} ${docShort}`;
  }

  return `${action} on ${collName} ${docShort}`;
};

export default function AuditLogs() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editingLog, setEditingLog] = useState(null); // for editing the audit log doc itself

  // Filters
  const [filterAction,     setFilterAction]     = useState('all');
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');
  const [search,           setSearch]           = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc')));
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast.error('Failed to load audit logs: ' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  // ── Unique filter options from data ─────────────────────────────────────────
  const uniqueCollections = useMemo(() => [...new Set(logs.map(l => l.collection).filter(Boolean))], [logs]);
  const uniqueActions     = useMemo(() => [...new Set(logs.map(l => l.actionType).filter(Boolean))],  [logs]);

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = logs;
    if (filterAction !== 'all') {
      if (filterAction === 'category_delete') list = list.filter(l => l.actionType?.includes('DELETE'));
      else if (filterAction === 'category_edit') list = list.filter(l => l.actionType?.includes('EDIT') || l.actionType === 'ADMIN_EDIT');
      else list = list.filter(l => l.actionType === filterAction);
    }
    if (filterStatus     !== 'all') list = list.filter(l => l.status      === filterStatus);
    if (filterCollection !== 'all') list = list.filter(l => l.collection  === filterCollection);
    if (filterDateFrom) {
      const d = new Date(0);
      list = list.filter(l => {
        const ld = l.timestamp?.toDate?.() || l.createdAt?.toDate?.() || d;
        return ld >= new Date(filterDateFrom);
      });
    }
    if (filterDateTo) {
      const t = new Date(filterDateTo);
      t.setHours(23, 59, 59, 999);
      const d = new Date(0);
      list = list.filter(l => {
        const ld = l.timestamp?.toDate?.() || l.createdAt?.toDate?.() || d;
        return ld <= t;
      });
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        (l.documentId || '').toLowerCase().includes(q) ||
        (l.reason || '').toLowerCase().includes(q) ||
        (l.performedByName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, filterAction, filterStatus, filterCollection, filterDateFrom, filterDateTo, search]);

  const pg = usePagination(filtered, 25);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   logs.length,
    pending: logs.filter(l => l.status === 'pending_review').length,
    deletes: logs.filter(l => l.actionType?.includes('DELETE')).length,
    edits:   logs.filter(l => l.actionType?.includes('EDIT') || l.actionType === 'ADMIN_EDIT').length,
  }), [logs]);

  // ── Action handlers ──────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = React.useState(null); // 'restore'|'revert'|'approve'|'reject'

  const handle = async (log, action) => {
    // Guard: warn if already resolved
    const resolved = ['reverted','rejected','approved','restored'].includes(log.status);
    if (resolved && action !== 'approve' && action !== 'reject') {
      toast.error(`This log is already "${log.status}" — cannot ${action} again.`);
      return;
    }
    setActionLoading(action);
    try {
      const by   = profile.uid;
      const name = profile.name || profile.email;

      if (action === 'restore') {
        if (log.actionType === 'ADMIN_DELETE') {
          await universalRestoreFromLog({ auditLog: log, performedBy: by, performedByName: name });
        } else {
          await restoreSoftDeletedDocument(log.collection, log.documentId, log.id, by, name);
        }
        toast.success('✅ Document restored successfully');

      } else if (action === 'revert') {
        // Both paths now handle all actionTypes
        if (['ADMIN_EDIT','EDIT_STOCK','EDIT_SALE','EDIT_INTAKE'].includes(log.actionType)) {
          await universalRevertEdit({ auditLog: log, performedBy: by, performedByName: name });
        } else {
          await revertAuditLog(log, by, name);
        }
        toast.success('↩️ Record reverted to previous state');

      } else if (action === 'approve') {
        if (log.actionType === 'DELETE_REQUEST') {
          const { executeSoftDeleteDocument } = await import('../../firebase/auditServices');
          await executeSoftDeleteDocument(log.collection, log.documentId, log.id, by, name);
          toast.success('✅ Delete request approved & executed');
        } else if (log.actionType === 'EDIT_REQUEST') {
          const { executeEditRequest } = await import('../../firebase/universalEditService');
          await executeEditRequest({ auditLog: log, performedBy: by, performedByName: name });
          toast.success('✅ Edit request approved & applied');
        } else {
          await resolveAuditLog(log.id, 'approved', by, name);
          toast.success('✅ Log marked approved');
        }

      } else if (action === 'reject') {
        if (log.actionType === 'DELETE_REQUEST') {
          const { rejectSoftDeleteRequest } = await import('../../firebase/auditServices');
          await rejectSoftDeleteRequest(log.collection, log.documentId, log.id, by, name);
          toast.success('❌ Delete request rejected — record preserved');
        } else {
          await resolveAuditLog(log.id, 'rejected', by, name);
          toast.success('❌ Log rejected');
        }
      }

      fetchLogs();
      setSelected(null);
    } catch (e) {
      toast.error('Action failed: ' + (e.message || 'Unknown error'));
    }
    setActionLoading(null);
  };

  const isDeleteAction = (a) => a?.includes('DELETE') && a !== 'DELETE_REQUEST';
  const isEditAction   = (a) => a?.includes('EDIT') || a === 'ADMIN_EDIT';

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title"> Audit Logs & System History</h2>
          <p className="page-subtitle">Immutable record of every edit, delete, and correction. Restore anything.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={fetchLogs} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Logs',      value: stats.total,   icon: '', color: 'var(--text-primary)', onClick: () => { setFilterStatus('all'); setFilterAction('all'); }, hint: 'View All Logs →' },
          { label: 'Pending Review',  value: stats.pending, icon: '', color: 'var(--gold)',         onClick: () => { setFilterStatus('pending_review'); setFilterAction('all'); }, hint: 'Inspect Pending →' },
          { label: 'Deletions',       value: stats.deletes, icon: '', color: 'var(--danger)',       onClick: () => { setFilterStatus('all'); setFilterAction('category_delete'); }, hint: 'Filter Deletes →' },
          { label: 'Edits',           value: stats.edits,   icon: '', color: 'var(--blue)',         onClick: () => { setFilterStatus('all'); setFilterAction('category_edit'); }, hint: 'Filter Edits →' },
        ].map(s => (
          <div 
            key={s.label} 
            className="card" 
            onClick={s.onClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0.75rem 1rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            title={`Click to filter audit logs by ${s.label}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input" placeholder=" Search logs..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 220, flex: 1 }}
        />
        <input type="date" className="form-input" style={{ width: 'auto', minWidth: 130 }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="Date From" />
        <span className="text-muted" style={{ fontSize: 12 }}>to</span>
        <input type="date" className="form-input" style={{ width: 'auto', minWidth: 130 }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="Date To" />
        <select className="form-select" value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ minWidth: 150 }}>
          <option value="all">All Actions</option>
          <option value="category_delete" style={{ fontWeight: 'bold' }}>--- All Deletions ---</option>
          <option value="category_edit" style={{ fontWeight: 'bold' }}>--- All Edits ---</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{ACTION_META[a]?.label || a}</option>
          ))}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 150 }}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="form-select" value={filterCollection} onChange={e => setFilterCollection(e.target.value)} style={{ minWidth: 160 }}>
          <option value="all">All Collections</option>
          {uniqueCollections.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(filterAction !== 'all' || filterStatus !== 'all' || filterCollection !== 'all' || filterDateFrom || filterDateTo || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterAction('all'); setFilterStatus('all'); setFilterCollection('all'); setFilterDateFrom(''); setFilterDateTo(''); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <div className="empty-title">No Logs Found</div>
            <div style={{ color: 'var(--text-muted)' }}>No audit entries match the current filters.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Collection</th>
                  <th>Document ID</th>
                  <th>Activity Summary</th>
                  <th>Performed By</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pg.paged.map(log => {
                  const am = ACTION_META[log.actionType] || { label: log.actionType, color: 'badge-amber', icon: '' };
                  const sm = STATUS_META[log.status] || { color: 'badge-amber', label: log.status };
                  const isPending = log.status === 'pending_review';

                  return (
                    <tr key={log.id} style={{ opacity: !isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                      <td className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {(() => { const d = log.timestamp?.toDate?.(); if (!d) return '—'; const diff = (Date.now()-d)/1000; if (diff<60) return 'Just now'; if (diff<3600) return `${Math.floor(diff/60)}m ago`; if (diff<86400) return `${Math.floor(diff/3600)}h ago`; return d.toLocaleDateString(); })()}
                      </td>
                      <td>
                        <span className={`badge ${am.color}`} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {am.icon} {am.label}
                        </span>
                      </td>
                      <td><span className="badge badge-teal" style={{ fontSize: 10 }}>{log.collection}</span></td>
                      <td className="text-sm" style={{ fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.documentId}
                      </td>
                      <td style={{ maxWidth: 240, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} title={getHumanReadableSummary(log)}>
                        {getHumanReadableSummary(log)}
                      </td>
                      <td className="td-bold">{log.performedByName || log.performedBy}</td>
                      <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.reason}>
                        {log.reason || '—'}
                      </td>
                      <td>
                        <span className={`badge ${sm.color}`}>{sm.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(log)} title="View Details"><Info size={14} /></button>
                          {editModeEnabled && (
                            <button className="btn btn-secondary btn-sm" title="Edit this log entry" onClick={() => setEditingLog(log)}><FileEdit size={14} /></button>
                          )}
                          {editModeEnabled && isDeleteAction(log.actionType) && (
                            <button className="btn btn-secondary btn-sm" disabled={actionLoading==='restore'} onClick={() => handle(log, 'restore')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCcw size={14} /> {actionLoading==='restore'?'…':'Restore'}</button>
                          )}
                          {editModeEnabled && isEditAction(log.actionType) && (
                            <button className="btn btn-secondary btn-sm" disabled={actionLoading==='revert'} onClick={() => handle(log, 'revert')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCcw size={14} /> {actionLoading==='revert'?'…':'Undo Edit'}</button>
                          )}
                          {isPending && log.actionType === 'DELETE_REQUEST' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handle(log, 'approve')} title="Approve"><CheckCircle2 size={14} /></button>
                              <button className="btn btn-danger btn-sm" onClick={() => handle(log, 'reject')} title="Reject"><XCircle size={14} /></button>
                            </>
                          )}
                          {isPending && log.actionType === 'EDIT_REQUEST' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handle(log, 'approve')} title="Approve"><CheckCircle2 size={14} /></button>
                              <button className="btn btn-danger btn-sm" onClick={() => handle(log, 'reject')} title="Reject"><XCircle size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={pg.page} totalPages={pg.totalPages} total={pg.total}
          startRecord={pg.startRecord} endRecord={pg.endRecord}
          perPage={pg.perPage}
          onPageChange={pg.goTo}
          onPerPageChange={pg.setPerPage}
        />
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-content" style={{ maxWidth: 820, width: '96vw' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ACTION_META[selected.actionType]?.icon} {ACTION_META[selected.actionType]?.label || selected.actionType}
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`badge ${STATUS_META[selected.status]?.color||'badge-amber'}`}>{STATUS_META[selected.status]?.label||selected.status}</span>
                  <span className="badge badge-teal">{selected.collection}</span>
                  <span style={{ fontFamily: 'monospace', opacity: .6, fontSize: 10 }}>{selected.documentId}</span>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>

              {/* Human-Readable Activity Summary */}
              <div style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--blue)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>💡 Plain-English Activity Summary</div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{getHumanReadableSummary(selected)}</p>
              </div>

              {/* Who / When */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 8 }}>
                {[['Done By', selected.performedByName||selected.performedBy], ['Time', selected.timestamp?.toDate?.()?.toLocaleString()||'—'], ['Resolved By', selected.resolvedByName||'Pending'], ['Resolved At', selected.resolvedAt?.toDate?.()?.toLocaleString()||'—']]
                  .map(([k,v]) => (
                    <div key={k} style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{v||'—'}</div>
                    </div>
                  ))}
              </div>

              {/* Reason */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>📝 Reason for change</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{selected.reason || 'No reason provided'}</p>
              </div>

              {/* Diff table */}
              {selected.oldData && selected.newData && !isDeleteAction(selected.actionType) && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>📊 What Changed</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid var(--border)' }}>Field</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid var(--border)', color: '#ef4444' }}>Before</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid var(--border)', color: '#22c55e' }}>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys({ ...selected.oldData, ...selected.newData }).filter(k => JSON.stringify(selected.oldData?.[k]) !== JSON.stringify(selected.newData?.[k])).map(field => (
                        <tr key={field} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '7px 10px', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{field}</td>
                          <td style={{ padding: '7px 10px', color: '#ef4444', background: '#fef2f2', maxWidth: 200, wordBreak: 'break-all' }}>
                            {typeof selected.oldData?.[field] === 'object' ? JSON.stringify(selected.oldData?.[field]) : String(selected.oldData?.[field] ?? '—')}
                          </td>
                          <td style={{ padding: '7px 10px', color: '#16a34a', background: '#f0fdf4', maxWidth: 200, wordBreak: 'break-all' }}>
                            {typeof selected.newData?.[field] === 'object' ? JSON.stringify(selected.newData?.[field]) : String(selected.newData?.[field] ?? '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Deleted document view */}
              {(isDeleteAction(selected.actionType)||selected.actionType==='DELETE_REQUEST') && selected.oldData && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, padding: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8, fontSize: 13 }}>🗑️ Document That Was Deleted</div>
                  <ReadableDataViewer data={selected.oldData} />
                </div>
              )}

              {/* Items list if present */}
              {(selected.oldData?.items||selected.newData?.items) && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>📦 Items in This Record</div>
                  {(selected.newData?.items||selected.oldData?.items||[]).map((it,i)=>(
                    <div key={i} style={{ display:'flex',gap:8,justifyContent:'space-between',padding:'6px 10px',background:'var(--bg-secondary)',borderRadius:6,marginBottom:4,fontSize:13 }}>
                      <span style={{fontWeight:600}}>{it.brand||''} {it.productType||''} {it.flavor||''} {it.weight||''}</span>
                      <span>Qty: <b>{it.qty}</b></span>
                      <span style={{color:'var(--gold)'}}>৳{it.unitPrice||it.sellingPrice||0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {editModeEnabled && isDeleteAction(selected.actionType) && (
                  <button className="btn btn-secondary" disabled={actionLoading==='restore'} onClick={() => handle(selected, 'restore')}><RotateCcw size={14}/> {actionLoading==='restore'?'Restoring…':'Restore Record'}</button>
                )}
                {editModeEnabled && isEditAction(selected.actionType) && (
                  <button className="btn btn-secondary" disabled={actionLoading==='revert'} onClick={() => handle(selected, 'revert')}><RotateCcw size={14}/> {actionLoading==='revert'?'Reverting…':'Undo Edit'}</button>
                )}
                {selected.status === 'pending_review' && (selected.actionType === 'DELETE_REQUEST' || selected.actionType === 'EDIT_REQUEST') && (
                  <>
                    <button className="btn btn-primary" disabled={!!actionLoading} onClick={() => handle(selected, 'approve')}>{actionLoading==='approve'?'…':'✅ Approve'}</button>
                    <button className="btn btn-danger" disabled={!!actionLoading} onClick={() => handle(selected, 'reject')}>{actionLoading==='reject'?'…':'❌ Reject'}</button>
                  </>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit audit log entry itself */}
      {editingLog && (
        <UniversalEditModal
          document={editingLog}
          collectionName="audit_logs"
          readonlyFields={['id', 'uid', 'createdAt', 'timestamp', '_lastEditedAt', 'deletedAt', 'performedBy', 'collection', 'documentId', 'actionType', 'oldData', 'newData']}
          onClose={() => setEditingLog(null)}
          onSaved={() => { setEditingLog(null); fetchLogs(); }}
        />
      )}
    </div>
  );
}
