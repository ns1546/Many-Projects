import React, { useState, useEffect } from 'react';
import { FileEdit, Maximize2, Minimize2, X, Trash2 } from 'lucide-react';
import {
  collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

const ROLES = ['admin', 'chairman', 'salesman', 'godown_manager'];
const ROLE_LABELS = { admin: 'Administrator', chairman: 'Chairman', salesman: 'Sales Staff', godown_manager: 'Godown Manager' };

const DEFAULT_PERMISSIONS = {
  admin:           { shop: true, godown: true, analytics: true, integrity: true, userManagement: true, attendance: true, database: true },
  chairman:        { shop: true, godown: true, analytics: true, integrity: true, userManagement: false, attendance: true, database: true },
  salesman:        { shop: true, godown: false, analytics: false, integrity: false, userManagement: false, attendance: false, database: false },
  godown_manager:  { shop: false, godown: true, analytics: false, integrity: false, userManagement: false, attendance: false, database: false },
};

const PERMISSION_LABELS = {
  shop: 'Shop Module', godown: 'Godown Module', analytics: 'Analytics',
  integrity: 'Integrity Check', userManagement: 'User Management', attendance: 'Attendance', database: 'Database',
};

export default function UserManagement() {
  const { profile: myProfile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'salesman' });
  const [addLoading, setAddLoading] = useState(false);
  const [isAddFullscreen, setIsAddFullscreen] = useState(false);
  const [isPermFullscreen, setIsPermFullscreen] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, addForm.email, addForm.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
        isActive: true,
        permissions: DEFAULT_PERMISSIONS[addForm.role],
        createdAt: serverTimestamp(),
        createdBy: myProfile.uid,
      });
      toast.success(`User "${addForm.name}" created successfully.`);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', role: 'salesman' });
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const toggleActive = async (u) => {
    await updateDoc(doc(db, 'users', u.uid), { isActive: !u.isActive });
    toast.success(`User ${u.isActive ? 'disabled' : 'enabled'}.`);
    fetchUsers();
  };

  const openPermissions = (u) => { setSelectedUser({ ...u }); setShowPermModal(true); };

  const savePermissions = async () => {
    await updateDoc(doc(db, 'users', selectedUser.uid), { permissions: selectedUser.permissions });
    toast.success('Permissions updated.');
    setShowPermModal(false);
    fetchUsers();
  };

  const togglePerm = (key) => {
    setSelectedUser(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions?.[key] } }));
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const pg = usePagination(filtered, 25);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage employee accounts, roles and permissions</p>
        </div>
        <div className="page-header-actions">
          <button id="btn-add-user" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ＋ Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-4">
        {ROLES.map(r => (
          <div key={r} className="stat-card teal" style={{ cursor: 'pointer', outline: filter === r ? '2px solid var(--teal)' : 'none' }} onClick={() => setFilter(r)}>
            <div className="stat-label">{ROLE_LABELS[r]}</div>
            <div className="stat-value">{users.filter(u => u.role === r).length}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="tabs mb-4" style={{maxWidth: 500}}>
        {['all', ...ROLES].map(r => (
          <button key={r} className={`tab ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
            {r === 'all' ? 'All Users' : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{padding:0}}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No users found</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pg.paged.map(u => (
                  <tr key={u.uid}>
                    <td className="td-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'gold' : u.role === 'chairman' ? 'purple' : u.role === 'salesman' ? 'teal' : 'blue'}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td><span className={`badge badge-${u.isActive ? 'green' : 'red'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td className="text-sm text-muted">{u.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        {editModeEnabled && (
                            <button id={`btn-edit-${u.uid}`} className="btn btn-primary btn-sm" onClick={() => setEditingUser(u)}> <FileEdit size={14} /></button>
                        )}
                        {myProfile?.role === 'admin' && (
                            <button id={`btn-del-${u.uid}`} className="btn btn-danger btn-sm" onClick={async () => {
                              if (window.prompt(`Type 'DELETE' to remove ${u.name}`) === 'DELETE') {
                                await deleteDoc(doc(db, 'users', u.uid));
                                fetchUsers();
                                toast.success('User deleted.');
                              }
                            }}> <Trash2 size={14} /></button>
                        )}
                        <button id={`btn-perms-${u.uid}`} className="btn btn-secondary btn-sm" onClick={() => openPermissions(u)}> Permissions</button>
                        <button id={`btn-toggle-${u.uid}`} className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(u)}>
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className={`modal ${isAddFullscreen ? 'modal-fullscreen' : ''}`}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between'}}>
              <h3 className="modal-title">Add New User</h3>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsAddFullscreen(!isAddFullscreen)}>
                  {isAddFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}><X size={16} /></button>
              </div>
            </div>
            <form onSubmit={handleAddUser} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="add-user-name" className="form-input" placeholder="Employee full name" value={addForm.name} onChange={e => setAddForm(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="add-user-email" className="form-input" type="email" placeholder="employee@petloverbd.com" value={addForm.email} onChange={e => setAddForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input id="add-user-password" className="form-input" type="password" placeholder="Min 6 characters" value={addForm.password} onChange={e => setAddForm(p => ({...p, password: e.target.value}))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select id="add-user-role" className="form-select" value={addForm.role} onChange={e => setAddForm(p => ({...p, role: e.target.value}))}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="modal-footer" style={{marginTop:0,paddingTop:0,border:'none'}}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button id="btn-create-user" type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? <span className="spinner" style={{width:16,height:16,borderWidth:2}} /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermModal && selectedUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPermModal(false)}>
          <div className={`modal ${isPermFullscreen ? 'modal-fullscreen' : ''}`}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between'}}>
              <h3 className="modal-title">Permissions — {selectedUser.name}</h3>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsPermFullscreen(!isPermFullscreen)}>
                  {isPermFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setShowPermModal(false)}><X size={16} /></button>
              </div>
            </div>
            <p className="text-muted text-sm mb-3">Toggle access for each module section</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <label key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg-elevated)',borderRadius:'var(--radius)',border:'1px solid var(--border)',cursor:'pointer'}}>
                  <span style={{fontWeight:500,fontSize:13}}>{label}</span>
                  <input
                    type="checkbox"
                    id={`perm-${key}`}
                    checked={!!selectedUser.permissions?.[key]}
                    onChange={() => togglePerm(key)}
                    style={{width:18,height:18,accentColor:'var(--gold)',cursor:'pointer'}}
                  />
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPermModal(false)}>Cancel</button>
              <button id="btn-save-permissions" className="btn btn-primary" onClick={savePermissions}>Save Permissions</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <UniversalEditModal
          document={editingUser}
          collectionName="users"
          readonlyFields={['uid', 'createdAt', 'permissions']}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
