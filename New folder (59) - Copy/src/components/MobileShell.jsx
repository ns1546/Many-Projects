import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import MobileTopbar from './MobileTopbar';

import {
  LayoutDashboard,
  LineChart,
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
  Clock,
  Mail,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';

const ALL_NAV = [
  // Bottom tab priority nav (icons shown in bottom bar)
  { to: '/dashboard',       label: 'Dashboard',       tab: true,  icon: LayoutDashboard, reqPerm: 'analytics' },
  { to: '/shop/sales',      label: 'Point of Sale',   tab: true,  icon: ShoppingCart,    reqPerm: 'shop' },
  { to: '/godown/stock',    label: 'Stock',           tab: true,  icon: PackagePlus,     reqPerm: 'godown' },
  { to: '/analytics',       label: 'Analytics',       tab: false, icon: LineChart,        reqPerm: 'analytics' },
  { to: '/catalog',         label: 'Catalog',         tab: false, icon: Library },
  { to: '/integrity',       label: 'Integrity',       tab: false, icon: ShieldCheck,     reqPerm: 'integrity' },
  { to: '/database',        label: 'Database',        tab: false, icon: Database,        reqPerm: 'database' },
  { to: '/shop',            label: 'Shop Dashboard',  tab: false, icon: Store,           reqPerm: 'shop' },
  { to: '/godown',          label: 'Godown',          tab: false, icon: Warehouse,       reqPerm: 'godown' },
  { to: '/godown/sales',    label: 'Wholesale Orders',tab: false, icon: ShoppingCart,    reqPerm: 'godown' },
  { to: '/godown/dispatch', label: 'Dispatch',        tab: false, icon: Truck,           reqPerm: 'godown' },
  { to: '/admin/audit',     label: 'Audit Logs',      tab: false, icon: ClipboardList,   reqPerm: 'database' },
  { to: '/admin/users',     label: 'User Management', tab: false, icon: Users,           reqPerm: 'userManagement' },
  { to: '/admin/attendance',label: 'Attendance',      tab: false, icon: Clock,           reqPerm: 'attendance' },
  { to: '/admin/requests',  label: 'Product Requests',tab: false, icon: Mail,            reqPerm: 'godown' },
  { to: '/settings',        label: 'Settings',        tab: false, icon: Settings },
];

const SECTIONS = [
  { label: 'Overview',       items: ['/dashboard', '/analytics', '/catalog', '/integrity', '/database'] },
  { label: 'Retail Shop',    items: ['/shop', '/shop/sales'] },
  { label: 'Godown',         items: ['/godown', '/godown/sales', '/godown/stock', '/godown/dispatch'] },
  { label: 'Administration', items: ['/admin/audit', '/admin/users', '/admin/attendance', '/admin/requests', '/settings'] },
];

export default function MobileShell({ children }) {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = profile?.role || 'salesman';
  const perms = profile?.permissions || {};

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const isAllowed = (item) => !item.reqPerm || perms[item.reqPerm];
  const allowedNav = ALL_NAV.filter(isAllowed);

  // Bottom tabs: first 4 allowed tab-priority items + "More" at end
  const tabItems = allowedNav.filter(i => i.tab).slice(0, 4);

  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/login'); toast.success('Signed out.'); }
    catch { toast.error('Sign-out failed.'); }
  };

  return (
    <div className="m-shell">
      {/* ── Topbar ───────────────────────────────────────────── */}
      <MobileTopbar onMenuOpen={() => setDrawerOpen(true)} />

      {/* ── Page Content ─────────────────────────────────────── */}
      {/* padding-top = topbar (58px), padding-bottom = bottom nav (72px) + safe area */}
      <main className="m-main" style={{ paddingTop: 58, paddingBottom: 72 }}>
        {children}
      </main>

      {/* ── Bottom Navigation Bar ─────────────────────────────── */}
      <nav className="m-bottom-nav">
        {tabItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`m-tab-item${isActive ? ' m-tab-active' : ''}`}
              aria-label={item.label}
            >
              <div className="m-tab-icon-wrap">
                <item.icon size={22} />
              </div>
              <span className="m-tab-label">{item.label}</span>
            </NavLink>
          );
        })}

        {/* "More" button opens drawer */}
        <button
          className="m-tab-item"
          onClick={() => setDrawerOpen(true)}
          aria-label="More navigation"
        >
          <div className="m-tab-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <span className="m-tab-label">More</span>
        </button>
      </nav>

      {/* ── Drawer Overlay ────────────────────────────────────── */}
      <div
        className={`m-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      {/* ── Slide-in Drawer ──────────────────────────────────── */}
      <aside className={`m-drawer${drawerOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div className="m-drawer-header">
          <div className="m-drawer-brand">
            <div className="m-drawer-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="m-drawer-brand-name">PET LOVER BD</div>
              <div className="m-drawer-brand-sub">Enterprise System</div>
            </div>
          </div>
          <button className="m-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* User chip */}
        {profile && (
          <div className="m-drawer-user">
            <div className="m-drawer-avatar">
              {(profile.name || profile.email || '?')[0].toUpperCase()}
            </div>
            <div className="m-drawer-user-info">
              <div className="m-drawer-user-name">{profile.name || 'User'}</div>
              <div className="m-drawer-user-role">{role.replace(/_/g, ' ')}</div>
            </div>
            {editModeEnabled && (
              <div className="m-drawer-edit-badge">EDIT</div>
            )}
          </div>
        )}

        {/* Sectioned nav */}
        <nav className="m-drawer-nav">
          {SECTIONS.map(section => {
            const sectionItems = allowedNav.filter(i => section.items.includes(i.to));
            if (sectionItems.length === 0) return null;
            return (
              <div key={section.label} className="m-drawer-section">
                <div className="m-drawer-section-label">{section.label}</div>
                {sectionItems.map(item => {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/shop' || item.to === '/godown' || item.to === '/dashboard'}
                      className={({ isActive }) => `m-drawer-nav-item${isActive ? ' active' : ''}`}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`m-drawer-nav-icon${isActive ? ' active' : ''}`}>
                            <item.icon size={18} />
                          </div>
                          <span className="m-drawer-nav-label">{item.label}</span>
                          <ChevronRight size={14} className="m-drawer-nav-arrow" />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="m-drawer-footer">
          <button className="m-drawer-signout" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <div className="m-drawer-version">v1.0 · Pet Lover BD ERP</div>
        </div>
      </aside>
    </div>
  );
}
