import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

import { 
  LayoutDashboard, 
  LineChart, 
  TrendingUp,
  Library, 
  ShieldCheck, 
  Database, 
  Store, 
  ShoppingCart, 
  Warehouse, 
  Truck, 
  PackagePlus, 
  ClipboardList, 
  Users, 
  User,
  Clock, 
  Mail, 
  Settings,
  Zap 
} from 'lucide-react';

const ALL_NAV = [
  { section: 'bKash Quick Khata & POS' },
  { to: '/', label: 'bKash Command Center', icon: Zap },
  { to: '/pos', label: 'Express POS (Rush Hour)', icon: ShoppingCart },
  { to: '/customers', label: 'Customer Khata (বাকি)', icon: Users },
  { to: '/suppliers', label: 'Supplier Khata (মহাজন)', icon: Warehouse },
  { to: '/cashbox', label: 'Cashbox & Gollah', icon: TrendingUp },
  { to: '/halkhata', label: 'Halkhata Festival', icon: Library },
  { section: 'Enterprise Overview' },
  { to: '/legacy/dashboard', label: 'Classic ERP Dashboard', reqPerm: 'analytics', icon: LayoutDashboard },
  { to: '/legacy/analytics', label: 'Advanced Analytics', reqPerm: 'analytics', icon: LineChart },
  { to: '/revenue-tracker', label: 'Revenue History', reqPerm: 'analytics', icon: TrendingUp },
  { to: '/catalog', label: 'Product Catalog', icon: Library },
  { to: '/integrity', label: 'Integrity Check', reqPerm: 'integrity', icon: ShieldCheck },
  { to: '/database', label: 'Database Explorer', reqPerm: 'database', icon: Database },
  { section: 'Retail Shop' },
  { to: '/shop', label: 'Shop Dashboard', reqPerm: 'shop', icon: Store },
  { to: '/shop/sales', label: 'Point of Sale', reqPerm: 'shop', icon: ShoppingCart },
  { section: 'Wholesale Godown' },
  { to: '/godown', label: 'Godown Dashboard', reqPerm: 'godown', icon: Warehouse },
  { to: '/godown/sales', label: 'Wholesale Orders', reqPerm: 'godown', icon: ShoppingCart },
  { to: '/godown/stock', label: 'Stock Intake', reqPerm: 'godown', icon: PackagePlus },
  { to: '/godown/dispatch', label: 'Dispatch to Shop', reqPerm: 'godown', icon: Truck },
  { section: 'Administration' },
  { to: '/admin/audit', label: 'Security & Audit Logs', reqPerm: 'database', icon: ClipboardList },
  { to: '/admin/users', label: 'User Management', reqPerm: 'userManagement', icon: Users },
  { to: '/admin/attendance', label: 'Staff Attendance', reqPerm: 'attendance', icon: Clock },
  { to: '/admin/requests', label: 'Product Requests', reqPerm: 'godown', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { to: '/settings', label: 'My Profile', icon: User, nonAdminOnly: true },
];

export default function Sidebar({ collapsed, toggleSidebar }) {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = profile?.role || 'salesman';
  const isAdmin = role === 'admin' || role === 'chairman';
  
  const navItems = ALL_NAV.filter((item, index, arr) => {
    if (item.adminOnly) return isAdmin;
    if (item.nonAdminOnly) return !isAdmin;
    if (item.section) {
      const nextSectionIdx = arr.findIndex((x, i) => i > index && x.section);
      const itemsInSection = arr.slice(index + 1, nextSectionIdx === -1 ? arr.length : nextSectionIdx);
      return itemsInSection.some(x => (!x.adminOnly && !x.nonAdminOnly && (!x.reqPerm || profile?.permissions?.[x.reqPerm])));
    }
    return !item.reqPerm || profile?.permissions?.[item.reqPerm];
  });

  const effectiveCollapsed = collapsed && !mobileOpen;

  // Close sidebar on route change (mobile)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      toast.success('Signed out.');
    } catch { toast.error('Sign-out failed.'); }
  };

  const sidebarContent = (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        {!effectiveCollapsed && (
          <div>
            <div className="sidebar-logo-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>PET LOVER BD</div>
            <div className="sidebar-logo-sub" style={{ fontSize: 10, letterSpacing: 1, color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>Enterprise System</div>
          </div>
        )}
        {/* Mobile close */}
        <button className="sidebar-mobile-close" onClick={() => setMobileOpen(false)}>✕</button>
      </div>

      {/* User chip */}
      {profile && (
        <div className="sidebar-user" style={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start', padding: effectiveCollapsed ? '12px 0' : '12px 14px' }}>
          <div className="sidebar-user-avatar">{(profile.name || profile.email || '?')[0].toUpperCase()}</div>
          {!effectiveCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{profile.name || 'User'}</div>
              <div className="sidebar-user-role">{role.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            !effectiveCollapsed && <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.to.replace(/\//g, '-').slice(1)}`}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              end={item.to === '/shop' || item.to === '/godown' || item.to === '/dashboard'}
              title={item.label}
              style={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start', padding: effectiveCollapsed ? '10px 0' : '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {item.icon ? <item.icon size={16} style={{ minWidth: 16 }} /> : <div className="nav-bullet" />}
              {!effectiveCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* Edit Mode Banner */}
      {editModeEnabled && (
        <div style={{
          margin: '8px 10px', padding: '6px 10px', borderRadius: 8,
          background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)',
          fontSize: 11, fontWeight: 700, color: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: effectiveCollapsed ? 'center' : 'flex-start', gap: 6, letterSpacing: 0.3,
        }}>
          <Settings size={14} className="spin-slow" /> {!effectiveCollapsed && 'EDIT MODE'}
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <button id="btn-signout" className="sidebar-nav-item" onClick={handleSignOut} style={{ width: '100%', justifyContent: effectiveCollapsed ? 'center' : 'flex-start', padding: effectiveCollapsed ? '10px 0' : '10px 14px' }} title="Sign Out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          {!effectiveCollapsed && <span className="nav-label" style={{ marginLeft: 8 }}>Sign Out</span>}
        </button>
        {!effectiveCollapsed && (
          <div style={{ padding: '10px 14px', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 4 }}>
            v1.0 · Pet Lover BD ERP
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-wrapper-desktop">{sidebarContent}</div>

      {/* Mobile hamburger button */}
      <button
        id="btn-mobile-menu"
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile drawer & overlay (always in DOM for CSS transitions) */}
      <div className={`sidebar-mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`sidebar-wrapper-mobile ${mobileOpen ? 'open' : ''}`}>{sidebarContent}</div>
    </>
  );
}
