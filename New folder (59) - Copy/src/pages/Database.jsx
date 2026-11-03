import React, { useState, useEffect } from 'react';
import { Download, SearchX, ArchiveX, FileEdit, Trash2, ShoppingCart, Package, ShoppingBag, Receipt, LayoutDashboard, Truck, PackageSearch, Activity, FileSpreadsheet, KeySquare, CalendarOff, Users, Cloud, HardDrive, X, RefreshCw } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { downloadCSV } from '../utils/csvExport';
import { createSystemBackup, restoreSystemBackup } from '../firebase/backupServices';
import toast from 'react-hot-toast';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import UniversalEditModal from '../components/UniversalEditModal';
import { useEditMode } from '../context/EditModeContext';
import { useAuth } from '../context/AuthContext';

const COLLECTIONS = [
  { key: 'shop_sales', label: 'Shop Sales', color: 'gold', icon: <ShoppingCart size={16} /> },
  { key: 'shop_inventory', label: 'Shop Inventory', color: 'green', icon: <Package size={16} /> },
  { key: 'shop_returns', label: 'Shop Returns', color: 'purple', icon: <ShoppingBag size={16} /> },
  { key: 'expense_entries', label: 'Expenses', color: 'red', icon: <Receipt size={16} /> },
  { key: 'daily_closing', label: 'Daily Closings', color: 'gold', icon: <LayoutDashboard size={16} /> },
  { key: 'godown_sales', label: 'Godown Sales', color: 'teal', icon: <ShoppingCart size={16} /> },
  { key: 'godown_stock', label: 'Godown Stock', color: 'amber', icon: <Package size={16} /> },
  { key: 'godown_entries', label: 'Stock Intake Log', color: 'blue', icon: <PackageSearch size={16} /> },
  { key: 'dispatch_logs', label: 'Dispatch Logs', color: 'purple', icon: <Truck size={16} /> },
  { key: 'product_entities', label: 'Product Entities', color: 'teal', icon: <Activity size={16} /> },
  { key: 'product_requests', label: 'Product Requests', color: 'purple', icon: <FileSpreadsheet size={16} /> },
  { key: 'attendance', label: 'Attendance', color: 'blue', icon: <Users size={16} /> },
  { key: 'users', label: ' Users', color: 'red' },
  { key: 'audit_logs', label: ' Audit Logs', color: 'amber' },
];


const flattenDoc = (doc) => {
  const flat = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && typeof v === 'object' && typeof v.toDate === 'function') flat[k] = v.toDate().toLocaleString();
    else if (Array.isArray(v)) flat[k] = JSON.stringify(v);
    else if (typeof v === 'object' && v !== null) flat[k] = JSON.stringify(v);
    else flat[k] = v;
  }
  return flat;
};

export default function Database() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const [activeCol, setActiveCol] = useState('shop_sales');
  const [records, setRecords] = useState([]);
  const [dbSearch, setDbSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  // Universal Edit state
  const [editItem, setEditItem] = useState(null);



  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const results = {};
      await Promise.all(COLLECTIONS.map(async c => {
        try {
          const snap = await getDocs(collection(db, c.key));
          results[c.key] = snap.size;
        } catch { results[c.key] = 0; }
      }));
      setCounts(results);
    };
    fetchCounts();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setRecords([]);
    setSelectedRows([]);
    try {
      const snap = await getDocs(collection(db, activeCol));
      setRecords(snap.docs.map(d => ({ _id: d.id, ...flattenDoc(d.data()) })));
    } catch { toast.error('Failed to load records.'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [activeCol]);

  const handleQuickDelete = async (rec) => {
    const reason = window.prompt(`Reason for deleting document ${rec._id}?`);
    if (!reason) return;
    
    if (localStorage.getItem('pin_req') === 'true') {
      const pin = window.prompt("Security PIN Required:\nPlease enter your 4-digit PIN to delete this record:");
      if (pin !== localStorage.getItem('security_pin')) {
        toast.error('Incorrect PIN. Deletion aborted.');
        return;
      }
    }

    try {
      const isAdminUser = ['admin', 'chairman'].includes(profile?.role);
      if (isAdminUser) {
        const { universalHardDelete } = await import('../firebase/universalEditService');
        await universalHardDelete({
          collectionName: activeCol,
          documentId: rec._id,
          reason,
          performedBy: profile.uid,
          performedByName: profile.name || profile.email,
        });
        toast.success('Document deleted permanently');
      } else {
        const { requestSoftDeleteDocument } = await import('../firebase/auditServices');
        await requestSoftDeleteDocument(activeCol, rec._id, reason, profile.uid, profile.name || profile.email);
        toast.success('Delete request submitted for admin approval');
      }
      fetchRecords();
      setCounts(p => ({ ...p, [activeCol]: Math.max(0, p[activeCol] - 1) }));
    } catch (e) {
      toast.error('Failed to delete: ' + e.message);
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} records?`)) return;
    const reason = window.prompt("Reason for batch deletion:");
    if (!reason) return;

    toast.loading('Deleting records...', { id: 'batch-delete' });
    try {
      const isAdminUser = ['admin', 'chairman'].includes(profile?.role);
      const { universalHardDelete } = await import('../firebase/universalEditService');
      const { requestSoftDeleteDocument } = await import('../firebase/auditServices');

      for (const id of selectedRows) {
        if (isAdminUser) {
          await universalHardDelete({ collectionName: activeCol, documentId: id, reason, performedBy: profile.uid, performedByName: profile.name || profile.email });
        } else {
          await requestSoftDeleteDocument(activeCol, id, reason, profile.uid, profile.name || profile.email);
        }
      }
      toast.success(isAdminUser ? 'Batch delete completed' : 'Batch delete requests submitted', { id: 'batch-delete' });
      setSelectedRows([]);
      fetchRecords();
    } catch(e) {
      toast.error('Error during batch delete: ' + e.message, { id: 'batch-delete' });
    }
  };

  const handleContextMenu = (e, rec) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, record: rec });
  };

  // Search filter
  const filteredRecords = React.useMemo(() => {
    if (!dbSearch) return records;
    const lowerQ = dbSearch.toLowerCase();
    return records.filter(r => {
      // check all values in the flat object
      return Object.values(r).some(v => String(v).toLowerCase().includes(lowerQ));
    });
  }, [records, dbSearch]);



  // Use pagination hook
  const pg = usePagination(filteredRecords, 25);

  const columns = records.length > 0 ? Object.keys(records[0]) : [];
  const colInfo = COLLECTIONS.find(c => c.key === activeCol);

  const handleExport = () => {
    if (!records.length) { toast.error('No records to export.'); return; }
    downloadCSV(records, `${activeCol}-${new Date().toLocaleDateString('en-CA')}.csv`);
    toast.success(`${records.length} records exported.`);
  };

  const handleExportAll = async () => {
    toast.loading('Downloading full database…', { id: 'db-export' });
    try {
      let allRows = [];
      await Promise.all(COLLECTIONS.map(async (c) => {
        try {
          const snap = await getDocs(collection(db, c.key));
          snap.docs.forEach(d => {
            allRows.push({ _collection: c.key, _id: d.id, ...flattenDoc(d.data()) });
          });
        } catch { /* skip failed collection */ }
      }));
      if (!allRows.length) { toast.error('Nothing to export.', { id: 'db-export' }); return; }
      downloadCSV(allRows, `petlover-full-database-${new Date().toLocaleDateString('en-CA')}.csv`);
      toast.success(` Exported ${allRows.length} total records from all collections!`, { id: 'db-export' });
    } catch (e) {
      toast.error('Export failed: ' + e.message, { id: 'db-export' });
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Database Explorer</h1>
          <p className="page-subtitle">View and export all stored records across every collection</p>
        </div>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={handleExportAll} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <Download size={16} /> Export All to CSV
        </button>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: '10px 0' }}>
          {COLLECTIONS.map(c => (
            <button
              key={c.key}
              id={`db-tab-${c.key}`}
              onClick={() => setActiveCol(c.key)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: activeCol === c.key ? 'var(--gold-dim)' : 'none', color: activeCol === c.key ? 'var(--gold)' : 'var(--text-secondary)', border: 'none', textAlign: 'left', fontSize: 13, fontWeight: activeCol === c.key ? 700 : 500, cursor: 'pointer', transition: 'var(--transition)', borderLeft: activeCol === c.key ? '3px solid var(--gold)' : '3px solid transparent' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{c.icon} {c.label}</span>
              {counts[c.key] !== undefined && <span className={`badge badge-${c.color}`} style={{ fontSize: 10 }}>{counts[c.key]}</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{colInfo?.label} <span className="text-muted" style={{ fontSize: 14, fontWeight: 500 }}>— {filteredRecords.length} records</span></div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="search-bar" style={{ flex: '0 0 250px', height: 34 }}>
                <span className="search-icon"></span>
                <input placeholder={`Search in ${colInfo?.label}...`} style={{ fontSize: 13 }} value={dbSearch} onChange={e => setDbSearch(e.target.value)} />
                {dbSearch && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setDbSearch('')}>✕</button>}
              </div>
              {selectedRows.length > 0 && editModeEnabled && (
                <button className="btn btn-danger btn-sm" onClick={handleBatchDelete}> Batch Delete ({selectedRows.length})</button>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              {loading ? (
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="skeleton skeleton-row"></div>
                  <div className="skeleton skeleton-row"></div>
                  <div className="skeleton skeleton-row"></div>
                  <div className="skeleton skeleton-row"></div>
                  <div className="skeleton skeleton-row"></div>
                </div>
              ) : records.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><SearchX size={48} color="var(--text-muted)" /></div><div className="empty-title">No records found</div></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 40, position: 'sticky', left: 0, background: 'var(--bg-elevated)', zIndex: 1 }}>
                        <input type="checkbox" checked={selectedRows.length === pg.paged.length && pg.paged.length > 0} onChange={() => {
                          if (selectedRows.length === pg.paged.length) setSelectedRows([]);
                          else setSelectedRows(pg.paged.map(r => r._id));
                        }} />
                      </th>
                      <th style={{ width: 80, position: 'sticky', left: 40, background: 'var(--bg-elevated)', zIndex: 1 }}>Actions</th>
                      {columns.map(col => <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pg.paged.map((rec, i) => (
                      <tr key={i} onContextMenu={(e) => handleContextMenu(e, rec)} style={{ background: selectedRows.includes(rec._id) ? 'var(--bg-hover)' : '' }}>
                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1, minWidth: 40 }}>
                          <input type="checkbox" checked={selectedRows.includes(rec._id)} onChange={() => {
                            setSelectedRows(p => p.includes(rec._id) ? p.filter(id => id !== rec._id) : [...p, rec._id]);
                          }} />
                        </td>
                        <td style={{ position: 'sticky', left: 40, background: 'var(--bg-card)', zIndex: 1, minWidth: 100 }}>
                          {editModeEnabled ? (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                              <button className="btn btn-primary btn-sm" onClick={() => setEditItem({ ...rec, _collection: activeCol })} title="Edit"><FileEdit size={14}/></button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleQuickDelete(rec)} title="Delete"><Trash2 size={14}/></button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted">—</span>
                          )}
                        </td>
                        {columns.map(col => (
                          <td key={col} style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }} title={String(rec[col] ?? '')}>
                            {col === '_id' ? <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{rec[col]}</span> : String(rec[col] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {records.length > 0 && (
              <Pagination
                page={pg.page} totalPages={pg.totalPages} total={pg.total}
                startRecord={pg.startRecord} endRecord={pg.endRecord}
                perPage={pg.perPage}
                onPageChange={pg.goTo}
                onPerPageChange={pg.setPerPage}
                onExportCSV={handleExport}
              />
            )}
          </div>
        </div>
      </div>
      
      {editItem && (
        <UniversalEditModal
          document={{ ...editItem, id: editItem._id }}
          collectionName={editItem._collection}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); fetchRecords(); }}
        />
      )}

      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          {editModeEnabled && (
            <>
              <button className="context-menu-item" onClick={() => { setEditItem({...contextMenu.record, _collection: activeCol}); setContextMenu(null); }}> Edit Record</button>
              <button className="context-menu-item danger" onClick={() => { handleQuickDelete(contextMenu.record); setContextMenu(null); }}> Delete Record</button>
            </>
          )}
          <button className="context-menu-item" onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(contextMenu.record, null, 2));
            toast.success('Record copied to clipboard');
            setContextMenu(null);
          }}> Copy JSON</button>
        </div>
      )}

    </div>
  );
}

