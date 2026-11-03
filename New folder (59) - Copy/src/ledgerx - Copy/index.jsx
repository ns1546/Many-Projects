import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// LedgerX Context Providers
import { LocaleProvider, useLocale } from './context/LocaleContext';
import { TenantProvider } from './context/TenantContext';
import { OperatingModeProvider, useOperatingMode } from './context/OperatingModeContext';
import { KhataProvider } from './context/KhataContext';
import { voicebox } from './utils/bengaliVoicebox';

// LedgerX Layout Chrome & Recovery Guards
import DesktopHeader from './components/layout/DesktopHeader';
import EnterpriseSidebar from './components/layout/EnterpriseSidebar';
import LedgerXCrashBoundary from './components/common/LedgerXCrashBoundary';
import LedgerXSplashScreen from './components/common/LedgerXSplashScreen';
import { telemetry } from './utils/telemetry';
import { dbIntegrity } from './utils/dbIntegrity';

// LedgerX Pages
import Dashboard from './pages/Dashboard';
import CustomerKhata from './pages/CustomerKhata';
import SupplierKhata from './pages/SupplierKhata';
import ExpressPOS from './pages/ExpressPOS';
import Cashbox from './pages/Cashbox';
import Inventory from './pages/Inventory';
import Halkhata from './pages/Halkhata';
import ChequeRegister from './pages/ChequeRegister';
import Reports from './pages/Reports';
import SystemHistory from './pages/SystemHistory';
import GodownKhata from './pages/GodownKhata';
import Settings from './pages/Settings';

// Global Desktop Keyboard Shortcut Interceptor
function GlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toggleLocale } = useLocale();

  useEffect(() => {
    // 1. Initialize client telemetry flight-recorder
    telemetry.init('DEFAULT_STORE', '6.0.0', 'http://localhost:3001');

    // 2. Perform startup database integrity scan & self-healing
    const audit = dbIntegrity.runStartupAudit('DEFAULT_STORE');
    if (!audit.healthy) {
      console.warn('[LedgerX Startup Audit]:', audit.summary);
    }

    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // Ctrl + L: Instant Language Toggle
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLocale();
        return;
      }

      // Bypass function keys if on POS page so POS terminal has full priority
      if (window.location.pathname.startsWith('/pos')) {
        return;
      }

      // F9: Audio Soundbox Toggle
      if (e.key === 'F9') {
        e.preventDefault();
        voicebox.toggle();
        return;
      }

      if (isInput) return;

      // Function Keys Hotkeys
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          navigate('/pos');
          break;
        case 'F2':
          e.preventDefault();
          navigate('/customers');
          break;
        case 'F3':
          e.preventDefault();
          navigate('/suppliers');
          break;
        case 'F4':
          e.preventDefault();
          navigate('/cashbox');
          break;
        case 'F5':
          e.preventDefault();
          navigate('/halkhata');
          break;
        case 'F6':
          e.preventDefault();
          navigate('/inventory');
          break;
        case 'F7':
          e.preventDefault();
          navigate('/reports');
          break;
        case 'F8':
          e.preventDefault();
          navigate('/cheques');
          break;
        case 'F9':
          e.preventDefault();
          navigate('/settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleLocale]);

  return null;
}

// Master Desktop Application Shell for LedgerX with Enterprise Crash Shield
export function LedgerXShell({ children }) {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('ledgerx_splash_shown');
  });
  const { isEasyMode } = useOperatingMode();
  const [userToggledSidebar, setUserToggledSidebar] = useState(null);
  const location = useLocation();
  const isPos = location.pathname.startsWith('/pos');

  // In Easy Mode or POS, default to collapsed for an expansive, clutter-free cash counter
  const isSidebarCollapsed = userToggledSidebar !== null ? userToggledSidebar : (isEasyMode || isPos);

  return (
    <LedgerXCrashBoundary>
      {showSplash && (
        <LedgerXSplashScreen
          onFinish={() => {
            sessionStorage.setItem('ledgerx_splash_shown', 'true');
            setShowSplash(false);
          }}
        />
      )}
      <div className="h-screen w-full bg-[#F0F2F5] flex flex-row font-sans select-none antialiased overflow-hidden">
        <GlobalKeyboardShortcuts />
        <EnterpriseSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setUserToggledSidebar(!isSidebarCollapsed)} 
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {!isPos && (
            <DesktopHeader 
              isCollapsed={isSidebarCollapsed} 
              onToggleCollapse={() => setUserToggledSidebar(!isSidebarCollapsed)} 
            />
          )}
          <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isPos ? 'p-2 sm:p-2.5' : 'p-4 md:p-6'} bg-[#F0F2F5] custom-scrollbar`}>
            {children}
          </main>
        </div>
      </div>
    </LedgerXCrashBoundary>
  );
}

// LedgerX Root Provider Wrapper
export function LedgerXProvider({ children }) {
  return (
    <LocaleProvider>
      <TenantProvider>
        <OperatingModeProvider>
          <KhataProvider>
            {children}
          </KhataProvider>
        </OperatingModeProvider>
      </TenantProvider>
    </LocaleProvider>
  );
}

// Export individual pages and utilities for modular usage
export {
  Dashboard,
  CustomerKhata,
  SupplierKhata,
  ExpressPOS,
  Cashbox,
  Inventory,
  Halkhata,
  ChequeRegister,
  Reports,
  SystemHistory,
  GodownKhata,
  Settings,
  LedgerXCrashBoundary,
  OperatingModeProvider,
  useOperatingMode,
  telemetry,
  dbIntegrity,
};
