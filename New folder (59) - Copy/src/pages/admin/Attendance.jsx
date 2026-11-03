import React, { useState, useEffect } from 'react';
import { FileEdit, Maximize2, Minimize2, X } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useEditMode } from '../../context/EditModeContext';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

export default function AttendancePage() {
  const { editModeEnabled } = useEditMode();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const q = query(collection(db, 'attendance'), orderBy('loginTime', 'desc'));
      const snap = await getDocs(q);
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = records.filter(r => {
    const dateMatch = !filterDate || r.loginTime?.toDate?.()?.toLocaleDateString('en-CA') === filterDate;
    const userMatch = !filterUser || r.employeeName?.toLowerCase().includes(filterUser.toLowerCase());
    return dateMatch && userMatch;
  });

  const pg = usePagination(filtered, 25);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-subtitle">Employee login history with GPS and photo verification</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{padding:'16px 20px'}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
          <div className="form-group" style={{flex:'0 0 200px'}}>
            <label className="form-label">Filter by Date</label>
            <input id="att-filter-date" type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div className="form-group" style={{flex:'1 1 200px'}}>
            <label className="form-label">Filter by Employee</label>
            <input id="att-filter-user" type="text" className="form-input" placeholder="Search name…" value={filterUser} onChange={e => setFilterUser(e.target.value)} />
          </div>
          {(filterDate || filterUser) && (
            <button className="btn btn-ghost btn-sm" style={{marginTop:20}} onClick={() => { setFilterDate(''); setFilterUser(''); }}>Clear</button>
          )}
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No records found</div></div>
          ) : (
            <table>
              <thead>
                <tr><th>Employee</th><th>Role</th><th>Login Time</th><th>GPS Location</th><th>Photo</th>{editModeEnabled && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {pg.paged.map(r => (
                  <tr key={r.id}>
                    <td className="td-bold">{r.employeeName || r.uid}</td>
                    <td><span className="badge badge-blue">{r.role}</span></td>
                    <td className="text-sm">{r.loginTime?.toDate?.()?.toLocaleString() || '—'}</td>
                    <td style={{maxWidth:260}}>
                      <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.4}}>
                         {r.gpsAddress || `${r.gpsLat}, ${r.gpsLng}`}
                      </div>
                    </td>
                    <td>
                      {r.photoDataUrl ? (
                        <img
                          src={r.photoDataUrl}
                          alt="Login photo"
                          style={{width:48,height:48,objectFit:'cover',borderRadius:8,cursor:'pointer',border:'2px solid var(--border)'}}
                          onClick={() => setSelectedRecord(r)}
                          title="Click to enlarge"
                        />
                      ) : '—'}
                    </td>
                    {editModeEnabled && (
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setEditingRecord(r)}> <FileEdit size={14} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <Pagination
            page={pg.page} totalPages={pg.totalPages} total={pg.total}
            startRecord={pg.startRecord} endRecord={pg.endRecord}
            perPage={pg.perPage}
            onPageChange={pg.goTo}
            onPerPageChange={pg.setPerPage}
          />
        )}
      </div>

      {/* Photo Lightbox */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedRecord(null)}>
          <div className={`modal ${isFullscreen ? 'modal-fullscreen' : ''}`} style={isFullscreen ? {background:'var(--bg-secondary)'} : {maxWidth:520,background:'var(--bg-secondary)'}}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between'}}>
              <h3 className="modal-title"> {selectedRecord.employeeName} — Login Photo</h3>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setSelectedRecord(null)}><X size={16} /></button>
              </div>
            </div>
            <img src={selectedRecord.photoDataUrl} alt="Login" style={{width:'100%',borderRadius:'var(--radius-lg)',display:'block'}} />
            <div style={{marginTop:14,padding:'12px 14px',background:'var(--bg-elevated)',borderRadius:'var(--radius)',fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>
              <div> {selectedRecord.loginTime?.toDate?.()?.toLocaleString()}</div>
              <div> {selectedRecord.gpsAddress}</div>
              <div> Role: {selectedRecord.role}</div>
            </div>
          </div>
        </div>
      )}

      {editingRecord && (
        <UniversalEditModal
          document={editingRecord}
          collectionName="attendance"
          readonlyFields={['uid', 'loginTime', 'photoDataUrl', 'gpsLat', 'gpsLng']}
          onClose={() => setEditingRecord(null)}
          onSaved={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
}
