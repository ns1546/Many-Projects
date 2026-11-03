import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import toast from 'react-hot-toast';

const DEFAULT_ADMIN_PERMISSIONS = {
  shop: true, godown: true, analytics: true,
  integrity: true, userManagement: true, attendance: true, database: true,
};

export default function FirstSetup({ onComplete, force }) {
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (force) {
      setNeedsSetup(true);
      setChecking(false);
      return;
    }
    const check = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        setNeedsSetup(snap.empty);
      } catch {
        setNeedsSetup(false);
      }
      setChecking(false);
    };
    check();
  }, [force]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        } else {
          throw authErr;
        }
      }
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        role: 'admin',
        isActive: true,
        permissions: DEFAULT_ADMIN_PERMISSIONS,
        createdAt: serverTimestamp(),
        isFirstAdmin: true,
      });
      toast.success('Admin account created! Please log in.');
      onComplete && onComplete(true);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!checking && !needsSetup) {
      onComplete && onComplete(false);
    }
  }, [checking, needsSetup, onComplete]);

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!needsSetup) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}></div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Pet Lover BD ERP</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Initial Setup — Create Administrator Account</div>
        </div>

        <div className="card">
          <div style={{ padding: '12px 16px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius)', marginBottom: 22, fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
             No accounts found. Create the first Administrator account to get started. This setup screen only appears once.
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="setup-name" className="form-input" placeholder="Administrator name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="setup-email" className="form-input" type="email" placeholder="admin@petloverbd.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="setup-password" className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input id="setup-confirm-password" className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>
            <button id="btn-create-admin" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
