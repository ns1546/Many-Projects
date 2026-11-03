import React from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useMobileApp } from '../context/MobileAppContext';
import StoreBranchModal from './StoreBranchModal';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Home,
  Monitor,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function DeviceFrame({ children, isRootTab, bottomNav }) {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    viewMode,
    setViewMode,
    currentScreen,
    setCurrentScreen,
    setScreenHistory,
    activeTenantId,
    availableTenants = [],
    switchTenant,
    toast,
    setToast,
    showStoreModal,
    setShowStoreModal,
  } = useMobileApp();

  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isFullView = viewMode === 'full';
  const isNativeMobile = Capacitor.isNativePlatform();

  const screenLabels = {
    'home': isBn ? 'হোম ড্যাশবোর্ড' : 'Home Dashboard',
    'quick-sale': isBn ? 'দ্রুত বিক্রয় (POS)' : 'Quick Sale POS',
    'customer-khata': isBn ? 'কাস্টমার বাকি' : 'Customers',
    'customer-details': isBn ? 'কাস্টমার লেজার' : 'Customer Ledger',
    'supplier-khata': isBn ? 'মহাজন বাকি' : 'Suppliers',
    'cashbox': isBn ? 'ক্যাশবাক্স' : 'Cashbox',
    'add-money': isBn ? 'বকেয়া আদায়' : 'Collect Due',
    'expense': isBn ? 'খরচ প্রদান' : 'Pay Expense',
    'inventory': isBn ? 'স্টক খাতা' : 'Inventory',
    'soundbox': isBn ? 'সাউন্ডবক্স' : 'Soundbox',
    'qr-hub': isBn ? 'কিউআর হাব' : 'QR Hub',
    'receipt': isBn ? 'লেনদেন রশিদ' : 'Receipt Slip',
    'halkhata': isBn ? 'হালখাতা উৎসব' : 'Halkhata Festival',
    'mushak-tax': isBn ? 'মূসক ৬.৩ চালান' : 'Mushak 6.3 Tax',
    'crates': isBn ? 'ক্যারেট ও সিলিন্ডার' : 'Crates & Bottles',
    'bag-calc': isBn ? 'বস্তা ⇄ কেজি' : 'Bag to Kg Math',
    'cheque-register': isBn ? 'ব্যাংক চেক খাতা' : 'Cheque Register',
    'pnl-report': isBn ? 'লাভ-ক্ষতি রিপোর্ট' : 'Profit & Loss',
    'godown': isBn ? 'গুদাম ও চালানি' : 'Godown & Logistics',
    'godown-khata': isBn ? 'গুদাম ও চালানি' : 'Godown & Logistics',
    'customer-directory': isBn ? 'গ্রাহক ডিরেক্টরি' : 'Customer Directory',
    'system-history': isBn ? 'অডিট ও হিস্ট্রি' : 'Audit Trail',
    'history': isBn ? 'অডিট ও হিস্ট্রি' : 'Audit Trail',
  };

  const handleGoHome = () => {
    setCurrentScreen('home');
    setScreenHistory(['home']);
  };

  return (
    <div className={`lx-device-wrapper ${isFullView ? 'full-presentation' : ''} ${isNativeMobile ? 'is-native-mobile' : ''}`}>
      {/* Top Professional Showcase Toolbar (PC Browser only) */}
      {!isNativeMobile && (
        <header className="lx-top-showcase-bar">
          {/* Brand & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="lx-brand-indicator-dot" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', letterSpacing: '-0.2px' }}>
              LedgerX Mobile OS
            </span>
            <span className="lx-edition-badge">
              TallyKhata & bKash Edition
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 10,
                padding: '1px 6px',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <select
                value={activeTenantId || 'store_001'}
                onChange={e => switchTenant(e.target.value)}
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: '#065F46',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '2px 0',
                }}
                title={isBn ? 'দোকান পরিবর্তন করুন' : 'Switch Store'}
              >
                {availableTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {isBn ? t.branchBn : t.branchEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Screen Navigator Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="lx-active-screen-chip">
              {screenLabels[currentScreen] || currentScreen}
            </div>

            {currentScreen !== 'home' && (
              <button
                onClick={handleGoHome}
                className="lx-home-pill-btn"
                title="Return to Home Dashboard"
              >
                <Home size={12} />
                <span>{isBn ? 'হোম' : 'Home'}</span>
              </button>
            )}
          </div>

          {/* Right Viewport & Theme Controls + Return to PC Software */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Direct Switch to Desktop ERP (PC Software) */}
            <Link
              to="/"
              className="lx-tool-btn"
              style={{
                textDecoration: 'none',
                background: '#EFF6FF',
                color: '#1E40AF',
                borderColor: '#BFDBFE',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title={isBn ? 'পিসি ডেস্কটপ সফটওয়্যার খুলুন' : 'Open PC Desktop ERP'}
            >
              <Monitor size={13} color="#2563EB" />
              <span>{isBn ? 'পিসি সফটওয়্যার' : 'PC ERP'}</span>
            </Link>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(isBn ? 'en' : 'bn')}
              className="lx-tool-btn"
              title="Toggle Language"
            >
              <Globe size={13} />
              <span>{isBn ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="lx-tool-btn"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} color="#6366F1" />}
            </button>

            {/* Viewport Mode Switcher (Phone vs Full Width) */}
            <button
              onClick={() => setViewMode(isFullView ? 'mobile' : 'full')}
              className={`lx-tool-btn ${isFullView ? 'active-mode' : ''}`}
              title={isFullView ? 'Switch to Phone Frame' : 'Switch to Full Width'}
            >
              {isFullView ? <Smartphone size={13} /> : <Monitor size={13} />}
              <span>{isFullView ? (isBn ? 'ফোন ফ্রেম' : 'Phone') : (isBn ? 'ফুল ভিউ' : 'Full View')}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Device Container */}
      <main
        className={`lx-device-frame lx-mobile-app theme-${theme} ${
          isNativeMobile ? 'is-native-mobile' : isFullView ? 'full-screen-mode' : 'phone-frame-mode'
        }`}
      >
        {/* Flagship Status Bar (visible in Phone Frame mode on Desktop only) */}
        {!isFullView && !isNativeMobile && (
          <div className="lx-device-notch-bar">
            <span>9:41</span>
            <div className="lx-island-notch" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={13} />
              <Battery size={14} />
            </div>
          </div>
        )}

        {/* Scrollable Screen Content Container */}
        <div className={`lx-screen-body ${isRootTab ? 'has-bottom-nav' : 'subpage-view'}`}>
          {children}
        </div>

        {/* Pinned Floating Toast Notification (Always pinned on top of mobile screen) */}
        {toast && (
          <div
            onClick={() => setToast(null)}
            style={{
              position: 'absolute',
              top: isFullView ? 16 : 42,
              left: 14,
              right: 14,
              zIndex: 999999,
              background:
                toast.type === 'error'
                  ? '#DC2626'
                  : toast.type === 'warning'
                  ? '#D97706'
                  : 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
              color: '#FFFFFF',
              borderRadius: 16,
              padding: '11px 16px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {toast.type === 'error' || toast.type === 'warning' ? (
              <AlertTriangle size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
              {toast.message}
            </span>
          </div>
        )}

        {/* Pinned Bottom Navigation Bar (Never scrolls with content) */}
        {bottomNav}

        {/* Global Store / Branch Switcher Bottom Sheet Modal (Always spans full frame) */}
        {showStoreModal && (
          <StoreBranchModal onClose={() => setShowStoreModal(false)} />
        )}
      </main>
    </div>
  );
}
