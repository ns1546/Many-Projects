// Settings Page
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Shield, Users, Clock, ClipboardList, Database, MapPin, 
  HardDrive, Edit3, Palette, Globe, Info, LogOut, ChevronRight, 
  ChevronLeft, Download, Upload, AlertTriangle, Trash2, Settings as SettingsIcon,
  Cloud, RefreshCw, X, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { updatePassword, signOut } from 'firebase/auth';
import { updateUserProfile } from '../firebase/services';
import toast from 'react-hot-toast';

const COLLECTIONS = [
  'shop_sales', 'shop_inventory', 'shop_returns', 'expense_entries', 'daily_closing', 'product_requests', 
  'godown_sales', 'godown_stock', 'godown_entries', 'dispatch_logs', 'product_entities', 'godown_returns', 'audit_logs'
];

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { profile, isSystemLocked } = useAuth();
  const { editModeEnabled, toggleEditMode, isAdmin } = useEditMode();
  const isSuperAdmin = ['admin', 'chairman'].includes(profile?.role);
  // Non-superadmins (godown_manager, salesman, etc) only see profile
  const [activeView, setActiveView] = useState(isSuperAdmin ? 'main' : 'profile'); // 'main' | 'profile' | 'locations' | 'adminMode' | 'appearance' | 'language' | 'notifications' | 'security' | 'about' | 'backupRestore'

  // Settings State
  const [name, setName] = useState(profile?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [locations, setLocations] = useState({ shop: {lat:'', lng:''}, godown: {lat:'', lng:''} });
  const [savingLocations, setSavingLocations] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  // Online Restore state
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveBackups, setDriveBackups] = useState([]);
  const [loadingDriveList, setLoadingDriveList] = useState(false);
  const [restoringDrive, setRestoringDrive] = useState(false);

  const openDriveRestoreModal = async () => {
    setShowDriveModal(true);
    setLoadingDriveList(true);
    try {
      const res = await fetch('http://localhost:3001/api/list-drive-backups');
      const data = await res.json();
      if (data.success) setDriveBackups(data.files);
      else toast.error('Could not list Drive backups: ' + data.error);
    } catch (err) {
      toast.error('Backup server not running. Open a terminal and run: node scripts/backup-server.js');
      setShowDriveModal(false);
    }
    setLoadingDriveList(false);
  };

  const handleRestoreFromDrive = async (file) => {
    if (!window.confirm(`Restore from:\n"${file.name}"\n\nThis will merge data into the cloud database. Continue?`)) return;
    setRestoringDrive(true);
    const tid = toast.loading(`Restoring from Drive...`);
    try {
      const res = await fetch('http://localhost:3001/api/restore-from-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id, fileName: file.name })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: tid, duration: 6000 });
        setShowDriveModal(false);
        window.location.reload();
      } else {
        toast.error('Restore failed: ' + data.error, { id: tid });
      }
    } catch (err) {
      toast.error('Restore failed: ' + err.message, { id: tid });
    }
    setRestoringDrive(false);
  };

  useEffect(() => {
    if (isAdmin && activeView === 'locations') {
      getDoc(doc(db, 'settings', 'locations')).then(snap => {
        if (snap.exists()) setLocations(snap.data());
      }).catch(err => console.error(err));
    }
  }, [isAdmin, activeView]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (name !== profile.name) {
        await updateUserProfile(profile.uid, { name });
      }
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        setNewPassword('');
      }
      toast.success('Profile updated successfully! Refresh to see changes.');
    } catch (e) {
      toast.error(e.message || 'Error updating profile');
    }
    setSavingProfile(false);
  };

  const handleSaveLocations = async () => {
    setSavingLocations(true);
    try {
      const data = {
        shop: { lat: parseFloat(locations.shop.lat) || 0, lng: parseFloat(locations.shop.lng) || 0 },
        godown: { lat: parseFloat(locations.godown.lat) || 0, lng: parseFloat(locations.godown.lng) || 0 },
      };
      await setDoc(doc(db, 'settings', 'locations'), data, { merge: true });
      toast.success('Locations saved successfully!');
    } catch (e) {
      toast.error('Error saving locations');
    }
    setSavingLocations(false);
  };

  const handleToggleAdmin = () => {
    if (editModeEnabled) {
      setConfirmOff(true);
    } else {
      toggleEditMode(true);
      toast.success(' Admin Edit Mode ENABLED — all records are now editable');
    }
  };

  const confirmDisableAdmin = () => {
    toggleEditMode(false);
    setConfirmOff(false);
    toast(' Admin Edit Mode DISABLED', { icon: '' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleToggleSystemLock = async () => {
    if (!isSuperAdmin) return;
    const newVal = !isSystemLocked;
    try {
      await setDoc(doc(db, 'settings', 'system_lock'), { locked: newVal, updatedAt: new Date() }, { merge: true });
      toast.success(newVal ? 'System is now LOCKED.' : 'System is now UNLOCKED.');
    } catch (err) {
      toast.error('Error toggling system lock: ' + err.message);
    }
  };

  const isStaffOnly = ['salesman', 'shop_staff'].includes(profile?.role);

  const renderMainList = () => (
    <div className="settings-list animate-fade-in">
      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <div className="settings-group">
          <button className="settings-item" onClick={() => setActiveView('profile')}>
            <div className="settings-item-icon"><User size={20} /></div>
            <div className="settings-item-title">My Profile</div>
            <div className="settings-item-arrow"><ChevronRight size={18} /></div>
          </button>
          {['admin', 'chairman'].includes(profile?.role) && (
            <button className="settings-item" onClick={() => setActiveView('security')}>
              <div className="settings-item-icon"><Shield size={20} /></div>
              <div className="settings-item-title">Security &amp; Privacy</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="settings-section">
          <div className="settings-section-title">Administration</div>
          <div className="settings-group">
            {['admin', 'chairman'].includes(profile?.role) && (
              <button className="settings-item" onClick={() => navigate('/admin/users')}>
                <div className="settings-item-icon"><Users size={20} /></div>
                <div className="settings-item-title">Staff &amp; User Management</div>
                <div className="settings-item-arrow"><ChevronRight size={18} /></div>
              </button>
            )}
            <button className="settings-item" onClick={() => navigate('/admin/attendance')}>
              <div className="settings-item-icon"><Clock size={20} /></div>
              <div className="settings-item-title">Attendance Logs</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
            <button className="settings-item" onClick={() => navigate('/admin/audit')}>
              <div className="settings-item-icon"><ClipboardList size={20} /></div>
              <div className="settings-item-title">System Audit Logs</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
            {['admin', 'chairman'].includes(profile?.role) && (
              <>
                <button className="settings-item" onClick={() => navigate('/database')}>
                  <div className="settings-item-icon"><Database size={20} /></div>
                  <div className="settings-item-title">Database Explorer</div>
                  <div className="settings-item-arrow"><ChevronRight size={18} /></div>
                </button>
                <button className="settings-item" onClick={() => setActiveView('locations')}>
                  <div className="settings-item-icon"><MapPin size={20} /></div>
                  <div className="settings-item-title">GPS Location Targets</div>
                  <div className="settings-item-arrow"><ChevronRight size={18} /></div>
                </button>
                <button className="settings-item" onClick={() => setActiveView('backupRestore')}>
                  <div className="settings-item-icon"><HardDrive size={20} color="var(--red)" /></div>
                  <div className="settings-item-title">Database Backup &amp; Wipe</div>
                  <div className="settings-item-arrow"><ChevronRight size={18} /></div>
                </button>
              </>
            )}
            <button className="settings-item" onClick={() => setActiveView('adminMode')}>
              <div className="settings-item-icon" style={{ background: editModeEnabled ? 'rgba(234,179,8,0.2)' : '' }}><Edit3 size={20} color={editModeEnabled ? "var(--gold)" : "currentColor"} /></div>
              <div className="settings-item-title">Admin Edit Mode {editModeEnabled ? <span className="badge badge-gold" style={{marginLeft: 8}}>Active</span> : ''}</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
            {isSuperAdmin && (
              <button className="settings-item" onClick={handleToggleSystemLock}>
                <div className="settings-item-icon" style={{ background: isSystemLocked ? 'rgba(239,68,68,0.2)' : '' }}><Shield size={20} color={isSystemLocked ? "var(--red)" : "currentColor"} /></div>
                <div className="settings-item-title">System Lock {isSystemLocked ? <span className="badge badge-red" style={{marginLeft: 8}}>LOCKED</span> : <span className="badge badge-green" style={{marginLeft: 8}}>UNLOCKED</span>}</div>
                <div className="settings-item-arrow"><ChevronRight size={18} /></div>
              </button>
            )}
          </div>
        </div>
      )}

      {!isStaffOnly && (
        <div className="settings-section">
          <div className="settings-section-title">System &amp; App</div>
          <div className="settings-group">
            <button className="settings-item" onClick={() => setActiveView('appearance')}>
              <div className="settings-item-icon"><Palette size={20} /></div>
              <div className="settings-item-title">Appearance &amp; Theme</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
            <button className="settings-item" onClick={() => setActiveView('language')}>
              <div className="settings-item-icon"><Globe size={20} /></div>
              <div className="settings-item-title">Language</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
            <button className="settings-item" onClick={() => setActiveView('about')}>
              <div className="settings-item-icon"><Info size={20} /></div>
              <div className="settings-item-title">About ERP</div>
              <div className="settings-item-arrow"><ChevronRight size={18} /></div>
            </button>
          </div>
        </div>
      )}

      <div className="settings-section">
        <div className="settings-group">
          <button className="settings-item text-danger" onClick={handleLogout}>
            <div className="settings-item-icon"><LogOut size={20} color="var(--red)" /></div>
            <div className="settings-item-title" style={{ color: 'var(--red)' }}>Log Out</div>
            <div className="settings-item-arrow" style={{ color: 'var(--red)' }}><ChevronRight size={18} /></div>
          </button>
        </div>
      </div>
    </div>
  );


  const renderProfile = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        {isSuperAdmin && <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>}
        <div className="settings-detail-title">My Profile</div>
        {!isSuperAdmin && (
          <button className="btn btn-ghost btn-sm text-danger" onClick={handleLogout} style={{marginLeft: 'auto'}}>
            <LogOut size={16} style={{marginRight: 6}} /> Log Out
          </button>
        )}
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (Cannot be changed)</label>
            <input type="text" className="input" value={profile.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">New Password (leave blank to keep current)</label>
            <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={handleSaveProfile} disabled={savingProfile}>
          {savingProfile ? 'Saving...' : ' Save Profile'}
        </button>

        {!isSuperAdmin && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Enable Edit Requests</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Turn this on to request edits for mistakes made during sales. Edits will be pending until admin acceptance.
                </div>
              </div>
              <button
                onClick={() => toggleEditMode(!editModeEnabled)}
                style={{
                  width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: editModeEnabled ? 'var(--gold)' : 'var(--border)',
                  position: 'relative', transition: 'background 0.3s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: editModeEnabled ? 27 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.3s',
                }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">GPS Location Targets</div>
      </div>
      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Set the target coordinates for the Shop and Godown. The system will calculate how far staff are from these points when they log in.
        </p>
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
               Shop Location
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Latitude</label>
              <input type="number" className="input" value={locations.shop.lat} onChange={e => setLocations(l => ({...l, shop: {...l.shop, lat: e.target.value}}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input type="number" className="input" value={locations.shop.lng} onChange={e => setLocations(l => ({...l, shop: {...l.shop, lng: e.target.value}}))} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
               Godown Location
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Latitude</label>
              <input type="number" className="input" value={locations.godown.lat} onChange={e => setLocations(l => ({...l, godown: {...l.godown, lat: e.target.value}}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input type="number" className="input" value={locations.godown.lng} onChange={e => setLocations(l => ({...l, godown: {...l.godown, lng: e.target.value}}))} />
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={handleSaveLocations} disabled={savingLocations}>
          {savingLocations ? 'Saving...' : ' Save Target Locations'}
        </button>
      </div>
    </div>
  );

  const renderAdminMode = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Universal Admin Edit Mode</div>
      </div>
      
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Enable Edit Mode</div>
          <button
            onClick={handleToggleAdmin}
            style={{
              width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: editModeEnabled ? 'var(--gold)' : 'var(--border)',
              position: 'relative', transition: 'background 0.3s', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: editModeEnabled ? 27 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.3s',
            }} />
          </button>
        </div>

        <div style={{
          padding: '1rem',
          background: editModeEnabled ? 'rgba(234,179,8,0.08)' : 'var(--bg-secondary)',
          borderRadius: 8,
          border: `1px solid ${editModeEnabled ? 'rgba(234,179,8,0.3)' : 'var(--border)'}`,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          {editModeEnabled ? (
            <>
              <strong style={{ color: 'var(--gold)' }}> EDIT MODE ACTIVE</strong> — Edit/Delete buttons are visible
              on every page. All changes create an immutable audit log. Deletes can be restored
              from the <strong>Audit Logs</strong> page.
            </>
          ) : (
            <>
              Edit mode is <strong>disabled</strong>. Staff can only view data normally.
              Enable to unlock edit/delete controls on every page for admin users.
              All actions are logged with before/after snapshots.
            </>
          )}
        </div>

        {confirmOff && (
          <div style={{
            marginTop: '1rem', padding: '1rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>
              Disable Admin Edit Mode?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              All edit/delete buttons will be hidden from the UI. Audit logs remain intact.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={confirmDisableAdmin}>Yes, Disable</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmOff(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}><Info size={16} style={{marginRight: 6, display: "inline-block", verticalAlign: "middle"}}/> What Can Be Edited</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div> <strong>Godown:</strong> stock, intake logs, sales, dispatches</div>
          <div> <strong>Shop:</strong> inventory, sales, returns</div>
          <div> <strong>Finance:</strong> expenses, cash handovers</div>
          <div> <strong>Admin:</strong> users, attendance, product requests</div>
          <div> <strong>Catalog:</strong> products, brands, categories</div>
          <div className="divider" style={{ margin: '8px 0' }} />
          <div style={{ fontWeight: 600 }}><Shield size={16} style={{marginRight: 6, display: "inline-block", verticalAlign: "middle"}}/> Audit & Restore Guarantees</div>
          <div> Every edit stores a before/after snapshot</div>
          <div> Every delete stores the full document</div>
          <div> Any deletion can be restored from audit log</div>
          <div> All actions require a mandatory reason</div>
        </div>
      </div>
    </div>
  );

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [notify, setNotify] = useState(localStorage.getItem('notify') === 'true');
  const [pinRequired, setPinRequired] = useState(localStorage.getItem('pin_req') === 'true');
  const [securityPin, setSecurityPin] = useState(localStorage.getItem('security_pin') || '');

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.success(`Appearance changed to ${newTheme} mode.`);
  };

  const handleToggleNotify = () => {
    const newVal = !notify;
    setNotify(newVal);
    localStorage.setItem('notify', newVal);
    if (newVal) toast.success('Push notifications enabled.');
    else toast('Push notifications disabled.', { icon: '' });
  };
  
  const handleTogglePin = () => {
    if (!pinRequired && securityPin.length < 4) {
      toast.error('Please enter a 4-digit PIN before enabling this feature.');
      return;
    }
    const newVal = !pinRequired;
    setPinRequired(newVal);
    localStorage.setItem('pin_req', newVal);
    if (newVal) {
      localStorage.setItem('security_pin', securityPin);
    } else {
      localStorage.removeItem('security_pin');
      setSecurityPin('');
    }
    toast.success(`Security PIN requirement ${newVal ? 'enabled' : 'disabled'}.`);
  };

  const handleLangChange = (val) => {
    setLang(val);
    localStorage.setItem('lang', val);
    toast.success(`Language updated. Note: Full localization coming soon.`);
  };

  const renderAppearance = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Appearance & Theme</div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Dark Mode</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toggle the visual theme of the application</div>
          </div>
          <button onClick={handleToggleTheme} style={{
            width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: theme === 'dark' ? 'var(--gold)' : 'var(--border)',
            position: 'relative', transition: 'background 0.3s'
          }}>
            <div style={{
              position: 'absolute', top: 3, left: theme === 'dark' ? 27 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.3s'
            }} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Language Preferences</div>
      </div>
      <div className="card">
        <div className="form-group">
          <label className="form-label">System Language</label>
          <select className="input" value={lang} onChange={e => handleLangChange(e.target.value)}>
            <option value="en">English (US)</option>
            <option value="bn">Bengali (বাংলা)</option>
          </select>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
          Note: Full Bengali translation across all operational modules is currently in deployment phase.
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Notifications</div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>System Alerts & Push</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Receive alerts for low stock and audit logs</div>
          </div>
          <button onClick={handleToggleNotify} style={{
            width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: notify ? 'var(--green)' : 'var(--border)',
            position: 'relative', transition: 'background 0.3s'
          }}>
            <div style={{
              position: 'absolute', top: 3, left: notify ? 27 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.3s'
            }} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Security & Privacy</div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Require PIN for Edits</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Prompt for PIN before deleting records</div>
          </div>
          <button onClick={handleTogglePin} style={{
            width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: pinRequired ? 'var(--blue)' : 'var(--border)',
            position: 'relative', transition: 'background 0.3s'
          }}>
            <div style={{
              position: 'absolute', top: 3, left: pinRequired ? 27 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.3s'
            }} />
          </button>
        </div>
        {!pinRequired && (
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <input 
              type="password" 
              className="input" 
              placeholder="Enter a 4-digit PIN to enable" 
              value={securityPin} 
              onChange={e => setSecurityPin(e.target.value.slice(0,4))}
              maxLength={4}
            />
          </div>
        )}
        {pinRequired && (
          <div style={{ fontSize: 13, color: 'var(--green)', marginTop: '0.5rem', fontWeight: 600 }}>
            ✓ PIN Protection Active
          </div>
        )}
        <div className="divider" style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Two-Factor Authentication</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Requires Firebase Identity Platform</div>
          </div>
          <button className="btn btn-ghost btn-sm" disabled>Coming Soon</button>
        </div>
      </div>

      {/* ── System Lock ─────────────────────────────────────────────────── */}
      <div className="card" style={{ border: '1px solid var(--border)', marginTop: 20 }}>
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Lock size={20} color="var(--red)" /> System Lock</div>
        <div className="card-subtitle mb-4">Lock the entire ERP system globally. Staff will be unable to access any operational modules.</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isSystemLocked ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)', padding: '16px', borderRadius: 8, border: `1px solid ${isSystemLocked ? 'var(--red)' : 'var(--border)'}` }}>
          <div>
            <div style={{ fontWeight: 600, color: isSystemLocked ? 'var(--red)' : 'var(--text-primary)' }}>
              {isSystemLocked ? 'System is currently LOCKED' : 'System is UNLOCKED'}
            </div>
          </div>
          <button className={`btn ${isSystemLocked ? 'btn-ghost' : 'btn-danger'}`} onClick={handleToggleSystemLock}>
            {isSystemLocked ? 'Unlock System' : 'Lock System'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">About ERP</div>
      </div>
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Pet Lover BD</div>
          <div style={{ color: 'var(--text-muted)' }}>Enterprise Management System</div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Version 2.1.0</div>
        </div>
      </div>
    </div>
  );

  const renderBackupRestore = () => {
    const triggerOfflineBackup = async () => {
      const tid = toast.loading('Creating offline backup...');
      try {
        const backup = {};
        for (const col of COLLECTIONS) {
          const snap = await getDocs(collection(db, col));
          backup[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erp-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        toast.success('Offline backup downloaded successfully!', { id: tid });
      } catch (e) {
        toast.error('Offline backup failed: ' + e.message, { id: tid });
      }
    };

    return (
      <>
        <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="settings-detail-header">
        <button className="settings-back-btn" onClick={() => setActiveView('main')}><ChevronLeft size={20} /></button>
        <div className="settings-detail-title">Database Backup & Wipe</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* ── Backup Card ────────────────────────────────────────────────── */}
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Database size={20} /> System Backup & Restore</div>
          <div className="card-subtitle mb-4">Export or import a full system snapshot</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Create Backup</div>
            
            {/* Online Backup */}
            <button className="btn w-full" onClick={async () => {
              const tid = toast.loading('Initiating Cloud Backup...');
              try {
                const res = await fetch('http://localhost:3001/api/backup-to-drive', { method: 'POST' });
                if (res.ok) {
                  toast.success('✅ Successfully backed up to Google Drive!', { id: tid, duration: 5000 });
                } else {
                  toast.error('Cloud backup failed. Downloading offline backup instead...', { id: tid, duration: 4000 });
                  setTimeout(triggerOfflineBackup, 1500);
                }
              } catch (err) {
                toast.error('Backup server offline. Downloading offline backup instead...', { id: tid, duration: 4000 });
                setTimeout(triggerOfflineBackup, 1500);
              }
            }} style={{ background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
              <Cloud size={16} /> Online Backup to Drive
            </button>

            {/* Offline Backup */}
            <button className="btn btn-secondary w-full" onClick={triggerOfflineBackup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
              <Download size={16} /> Offline Backup (JSON)
            </button>

            {/* Restore section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Restore from Backup</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Online Restore from Drive */}
                <button className="btn w-full" onClick={openDriveRestoreModal}
                  style={{ background: 'linear-gradient(135deg,#1a73e8,#0d47a1)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
                  <Cloud size={16} /> Restore from Google Drive
                </button>

                {/* Offline Restore from file */}
                <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    try {
                      const data = JSON.parse(ev.target.result);
                      const confirm = window.prompt("WARNING: This will overwrite current data. Type 'RESTORE' to confirm.");
                      if (confirm !== 'RESTORE') return toast.error('Restore cancelled.');
                      
                      toast.loading('Restoring database...', { id: 'restore' });
                      for (const col of COLLECTIONS) {
                        if (data[col]) {
                          for (const docData of data[col]) {
                            const { id, ...rest } = docData;
                            await setDoc(doc(db, col, id), rest);
                          }
                        }
                      }
                      toast.success('System restored from backup.', { id: 'restore' });
                      window.location.reload();
                    } catch (err) {
                      toast.error('Failed to restore: ' + err.message, { id: 'restore' });
                    }
                  };
                  reader.readAsText(file);
                }} />
                <button className="btn btn-secondary w-full" onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Upload size={16} /> Upload Backup & Restore
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'var(--red-dim)' }}>
          <div className="card-title" style={{ color: 'var(--red)', display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={20} /> Danger Zone: Wipe System</div>
          <div className="card-subtitle mb-4">Permanently delete all data. Backup will be saved locally AND uploaded to Drive first.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              This action requires multi-stage verification. Only use this if you want to start fresh or have severe corruption.
            </div>
            <button className="btn btn-danger w-full" onClick={async () => {
              const stage1 = window.prompt("Stage 1: Type 'I UNDERSTAND' to proceed.");
              if (stage1 !== 'I UNDERSTAND') return toast.error('Wipe cancelled at Stage 1.');
              const stage2 = window.prompt("Stage 2: Type 'DELETE ALL DATA' to proceed.");
              if (stage2 !== 'DELETE ALL DATA') return toast.error('Wipe cancelled at Stage 2.');
              
              toast.loading('Step 1/3: Downloading safety backup...', { id: 'wipe' });
              try {
                // Step 1: Download locally
                const backup = {};
                for (const col of COLLECTIONS) {
                  const snap = await getDocs(collection(db, col));
                  backup[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                }
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `erp-pre-wipe-backup-${Date.now()}.json`;
                a.click();
                
                // Step 2: Upload to Drive
                toast.loading('Step 2/3: Uploading backup to Google Drive...', { id: 'wipe' });
                try {
                  await fetch('http://localhost:3001/api/backup-to-drive', { method: 'POST' });
                  toast.loading('Step 3/3: Backup secured in Drive. Now wiping...', { id: 'wipe' });
                } catch (err) {
                  toast.loading('Step 3/3: Drive unavailable (local backup saved). Now wiping...', { id: 'wipe' });
                }

                // Step 3: Wipe
                for (const col of COLLECTIONS) {
                  const snap = await getDocs(collection(db, col));
                  for (const d of snap.docs) {
                    await deleteDoc(doc(db, col, d.id));
                  }
                }
                toast.success('System wipe complete. Data was backed up before deletion.', { id: 'wipe' });
                window.location.reload();
              } catch (e) {
                toast.error('Wipe failed: ' + e.message, { id: 'wipe' });
              }
            }}><Trash2 size={16} style={{marginRight: 8, display: "inline-block", verticalAlign: "text-bottom"}} /> Delete & Reset Entire System</button>
          </div>
        </div>

        </div>
      </div>
      
      {/* ── Drive Restore Modal ────────────────────────────────────────────── */}
      {showDriveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Restore from Google Drive</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Select a backup to restore. Data will be merged into the cloud database.</p>
              </div>
              <button onClick={() => setShowDriveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingDriveList ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Loading backups from Drive...</p>
                </div>
              ) : driveBackups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No backups found in Google Drive folder.</div>
              ) : driveBackups.map(file => (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(file.createdTime).toLocaleString()} &nbsp;·&nbsp; {file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreFromDrive(file)}
                    disabled={restoringDrive}
                    style={{ padding: '8px 18px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: restoringDrive ? 0.5 : 1 }}>
                    {restoringDrive ? 'Restoring...' : 'Restore'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </>
    );
  };

  return (
    <div className="page-container" style={{ padding: '24px 16px', maxWidth: 800 }}>
      {activeView === 'main' && (
        <div className="page-header" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
          <div className="page-header-left">
            <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><SettingsIcon size={24} /> Settings</h2>
          </div>
        </div>
      )}

      {activeView === 'main' && renderMainList()}
      {activeView === 'profile' && renderProfile()}
      {activeView === 'locations' && renderLocations()}
      {activeView === 'adminMode' && renderAdminMode()}
      {activeView === 'appearance' && renderAppearance()}
      {activeView === 'language' && renderLanguage()}
      {activeView === 'security' && renderSecurity()}
      {activeView === 'about' && renderAbout()}
      {activeView === 'backupRestore' && renderBackupRestore()}
    </div>
  );
}
