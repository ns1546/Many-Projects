import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { Settings, Bell, AlertCircle, X } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/integrity': 'Integrity',
  '/database': 'Database',
  '/catalog': 'Catalog',
  '/shop': 'Shop',
  '/shop/sales': 'Point of Sale',
  '/godown': 'Godown',
  '/godown/sales': 'Wholesale',
  '/godown/stock': 'Stock Intake',
  '/godown/dispatch': 'Dispatch',
  '/admin/users': 'Users',
  '/admin/attendance': 'Attendance',
  '/admin/permissions': 'Permissions',
  '/admin/requests': 'Requests',
  '/admin/audit': 'Audit Logs',
  '/settings': 'Settings',
};

export default function MobileTopbar({ onMenuOpen }) {
  const { profile } = useAuth();
  const { editModeEnabled, isAdmin } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] || 'Pet Lover BD';

  const [notes, setNotes] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;
    const fetchNotes = async () => {
      try {
        const editsQ = query(collection(db, 'universal_edit_requests'), where('requestedBy', '==', profile.uid), where('status', '==', 'rejected'));
        const prodsQ = query(collection(db, 'product_requests'), where('requestedBy', '==', profile.uid), where('status', '==', 'rejected'));
        const [editSnap, prodSnap] = await Promise.all([getDocs(editsQ), getDocs(prodsQ)]);
        let all = [];
        editSnap.forEach(d => { if (!d.data().read) all.push({ id: d.id, type: 'edit', ...d.data() }); });
        prodSnap.forEach(d => { if (!d.data().read) all.push({ id: d.id, type: 'product', ...d.data() }); });
        setNotes(all);
      } catch {}
    };
    fetchNotes();
  }, [profile?.uid]);

  const dismiss = async (note) => {
    setNotes(prev => prev.filter(n => n.id !== note.id));
    try {
      const col = note.type === 'edit' ? 'universal_edit_requests' : 'product_requests';
      await updateDoc(doc(db, col, note.id), { read: true });
    } catch {}
  };

  return (
    <>
      {/* Mobile Topbar */}
      <header className="m-topbar">
        {/* Left — hamburger */}
        <button className="m-topbar-menu-btn" onClick={onMenuOpen} aria-label="Open navigation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Centre — title */}
        <div className="m-topbar-title">
          {editModeEnabled && isAdmin && (
            <span className="m-edit-dot" title="Edit Mode ON" />
          )}
          {title}
        </div>

        {/* Right — icons */}
        <div className="m-topbar-right">
          {notes.length > 0 && (
            <button className="m-topbar-icon-btn m-notif-btn" onClick={() => setNotifOpen(v => !v)} aria-label="Notifications">
              <Bell size={18} />
              <span className="m-notif-badge">{notes.length}</span>
            </button>
          )}
          {isAdmin && (
            <button
              className={`m-topbar-icon-btn${editModeEnabled ? ' m-edit-mode-active' : ''}`}
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          )}
          {/* Avatar */}
          <div className="m-topbar-avatar" onClick={() => navigate('/settings')}>
            {(profile?.name || profile?.email || '?')[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Notification Panel (slide-down) */}
      {notifOpen && notes.length > 0 && (
        <div className="m-notif-panel">
          <div className="m-notif-panel-header">
            <span>Notifications</span>
            <button onClick={() => setNotifOpen(false)}><X size={16} /></button>
          </div>
          {notes.map(n => (
            <div key={n.id} className="m-notif-item" onClick={() => { dismiss(n); }}>
              <AlertCircle size={16} color="var(--red)" />
              <div className="m-notif-body">
                <div className="m-notif-title">Action Rejected</div>
                <div className="m-notif-text">
                  {n.type === 'edit'
                    ? `Your request to ${n.actionType} a record was rejected.`
                    : `Your request for ${n.brand || 'a product'} was rejected.`}
                </div>
              </div>
              <X size={13} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
