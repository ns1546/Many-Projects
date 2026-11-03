import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Shield, Crown, User, Warehouse, Store, AlertCircle, X } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const TITLES = {
  '/dashboard': 'Main Dashboard',
  '/analytics': 'Analytics & Reports',
  '/integrity': 'Integrity Check',
  '/database': 'Database',
  '/catalog': 'Product Catalog',
  '/shop': 'Shop Dashboard',
  '/shop/sales': 'Shop Sales',
  '/godown': 'Godown Dashboard',
  '/godown/sales': 'Godown Sales',
  '/godown/stock': 'Stock Entry',
  '/godown/dispatch': 'Dispatch to Shop',
  '/admin/users': 'User Management',
  '/admin/attendance': 'Attendance Records',
  '/admin/permissions': 'Permission Control',
  '/admin/requests': 'Product Requests',
  '/admin/audit': 'Audit Logs & History',
  '/settings': 'Settings',
};

const ROLE_BADGE = {
  admin: { label: 'Admin', color: 'badge-gold', Icon: Shield },
  chairman: { label: 'Chairman', color: 'badge-purple', Icon: Crown },
  salesman: { label: 'Salesman', color: 'badge-teal', Icon: User },
  godown_manager: { label: 'Godown Mgr', color: 'badge-blue', Icon: Warehouse },
  shop_manager: { label: 'Shop Mgr', color: 'badge-blue', Icon: Store },
};

export default function Topbar({ toggleSidebar }) {
  const { profile, isSystemLocked } = useAuth();
  const { editModeEnabled, toggleEditMode, isAdmin } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] || 'Pet Lover BD ERP';
  const dateStr = new Date().toLocaleDateString('en-BD', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const rb = profile ? ROLE_BADGE[profile.role] : null;

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const fetchNotes = async () => {
      try {
        const editsQ = query(collection(db, 'audit_logs'), where('performedBy', '==', profile.uid), where('status', 'in', ['approved', 'rejected']));
        const prodsQ = query(collection(db, 'product_requests'), where('requestedBy', '==', profile.uid), where('status', 'in', ['approved', 'rejected']));
        const [editSnap, prodSnap] = await Promise.all([getDocs(editsQ), getDocs(prodsQ)]);
        
        let allNotes = [];
        editSnap.forEach(d => { if(!d.data().read) allNotes.push({ id: d.id, type: 'audit', ...d.data() }); });
        prodSnap.forEach(d => { if(!d.data().read) allNotes.push({ id: d.id, type: 'product', ...d.data() }); });
        
        setNotes(allNotes);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotes();
  }, [profile?.uid]);

  const dismissNote = async (note) => {
    setNotes(prev => prev.filter(n => n.id !== note.id));
    try {
      const colName = note.type === 'audit' ? 'audit_logs' : 'product_requests';
      await updateDoc(doc(db, colName, note.id), { read: true });
    } catch (err) { console.error('Error dismissing note', err); }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 60, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
        {notes.map(n => {
          const isApproved = n.status === 'approved';
          const color = isApproved ? 'var(--green)' : 'var(--red)';
          return (
            <div key={n.id} onClick={() => dismissNote(n)} style={{
              background: 'var(--bg-elevated)', borderLeft: `4px solid ${color}`,
              padding: '12px 16px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
              display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start',
              animation: 'fade-in 0.3s ease-out'
            }}>
              <AlertCircle size={18} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  Action {isApproved ? 'Approved' : 'Rejected'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {n.type === 'audit' ? `Your request to ${n.actionType?.replace('_', ' ').toLowerCase()} was ${isApproved ? 'approved' : 'rejected'}.` : `Your request for ${n.brand || 'a product'} was ${isApproved ? 'approved' : 'rejected'}.`}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>CLICK TO DISMISS</div>
              </div>
              <X size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>
          );
        })}
      </div>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {toggleSidebar && (
          <button 
            className="topbar-desktop-toggle"
            onClick={toggleSidebar} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-primary)', display: 'flex' }}
            title="Toggle Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-actions" style={{ gap: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateStr}</span>
        {rb && (
          <span className={`badge ${rb.color}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <rb.Icon size={12} /> {rb.label}
          </span>
        )}
        
        {/* System Lock Quick Toggle */}
        {(profile?.role === 'admin' || profile?.role === 'chairman') && (
          <button
            title={isSystemLocked ? "System is LOCKED. Click to Unlock." : "System is UNLOCKED. Click to Lock."}
            onClick={async () => {
              try {
                const { doc, setDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase/config');
                const { toast } = await import('react-hot-toast');
                const newVal = !isSystemLocked;
                await setDoc(doc(db, 'settings', 'system_lock'), { locked: newVal, updatedAt: new Date() }, { merge: true });
                toast.success(newVal ? 'System is now LOCKED.' : 'System is now UNLOCKED.');
              } catch (e) {
                const { toast } = await import('react-hot-toast');
                toast.error('Error toggling system lock: ' + e.message);
              }
            }}
            style={{
              padding: '4px 10px', border: `1px solid ${isSystemLocked ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'}`,
              borderRadius: 8, background: isSystemLocked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              color: isSystemLocked ? 'var(--red)' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Shield size={16} />
          </button>
        )}

        {(isAdmin || editModeEnabled) && (
          editModeEnabled ? (
            <button
              title={isAdmin ? "Edit Mode is ON — click to go to Settings" : "Request Mode is ON — click to go to Settings"}
              onClick={() => navigate('/settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                border: isAdmin ? '1px solid rgba(217, 119, 6, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)', borderRadius: 'var(--radius)',
                background: isAdmin ? 'rgba(217, 119, 6, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isAdmin ? 'var(--amber)' : 'var(--blue)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5,
                animation: isAdmin ? 'pulse-glow 2s infinite' : 'none',
                position: 'relative', overflow: 'hidden'
              }}
            >
               <Settings size={14} className={isAdmin ? "spin-slow" : ""} /> <span>{isAdmin ? 'EDIT MODE ON' : 'REQUEST MODE ON'}</span>
            </button>
          ) : isAdmin ? (
            <button
              title="Go to Settings"
              onClick={() => navigate('/settings')}
              style={{
                padding: '4px 10px', border: '1px solid var(--border)',
                borderRadius: 8, background: 'transparent',
                color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Settings size={16} />
            </button>
          ) : null
        )}
      </div>
    </header>
    </>
  );
}
