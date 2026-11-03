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
import CustomerDirectory from './pages/CustomerDirectory';
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
import MobilePOSView from './pages/MobilePOSView';

// Global Desktop Keyboard Shortcut Interceptor
function GlobalKeyboardShortcuts({ onCloseSidebar }) {
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

      // Function Keys Hotkeys for Busy Days
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
          navigate('/inventory');
          break;
        case 'F6':
          e.preventDefault();
          navigate('/reports');
          break;
        case 'F7':
          e.preventDefault();
          navigate('/cheques');
          break;
        case 'F8':
          e.preventDefault();
          navigate('/halkhata');
          break;
        case 'F9':
          e.preventDefault();
          navigate('/settings');
          break;
        case 'F10':
          e.preventDefault();
          navigate('/mobile');
          break;
        case '/':
          e.preventDefault();
          // Instantly focus the page's search input without touching mouse
          const searchInput = document.querySelector('input[type="text"], input[type="search"]');
          if (searchInput) {
            searchInput.focus();
            searchInput.select?.();
          }
          break;
        case 'Escape':
          if (onCloseSidebar) {
            onCloseSidebar();
          }
          if (window.location.pathname !== '/') {
            e.preventDefault();
            navigate('/');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleLocale, onCloseSidebar]);

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

  // In Easy Mode, do NOT show permanent sidebar rail. In Pro Mode, collapse it if user desires.
  const showSidebar = isEasyMode ? userToggledSidebar === true : (userToggledSidebar !== null ? !userToggledSidebar : !isPos);

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
      <div className="h-screen w-full bg-[#F4F6F8] flex flex-row font-sans select-none antialiased overflow-hidden">
        <GlobalKeyboardShortcuts onCloseSidebar={() => setUserToggledSidebar(false)} />
        
        {/* Sidebar: In Easy Mode it renders as an off-canvas drawer when opened; in Pro Mode it docks */}
        {isEasyMode ? (
          userToggledSidebar && (
            <div className="fixed inset-0 z-50 flex">
              <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
                onClick={() => setUserToggledSidebar(false)} 
              />
              <div className="relative z-50 h-full max-h-screen w-80 shadow-2xl animate-in slide-in-from-left duration-200 overflow-hidden flex flex-col min-h-0">
                <EnterpriseSidebar 
                  isCollapsed={false} 
                  onToggleCollapse={() => setUserToggledSidebar(false)} 
                />
              </div>
            </div>
          )
        ) : (
          <EnterpriseSidebar 
            isCollapsed={!showSidebar} 
            onToggleCollapse={() => setUserToggledSidebar(userToggledSidebar === null ? true : !userToggledSidebar)} 
          />
        )}

        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {!isPos && (
            <DesktopHeader 
              isCollapsed={!showSidebar} 
              onToggleCollapse={() => setUserToggledSidebar(prev => !prev)} 
            />
          )}
          <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isPos ? 'p-2 sm:p-2.5' : 'p-3 sm:p-5 md:p-6'} bg-[#F4F6F8] custom-scrollbar`}>
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
  CustomerDirectory,
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
  MobilePOSView,
  LedgerXCrashBoundary,
  OperatingModeProvider,
  useOperatingMode,
  telemetry,
  dbIntegrity,
};
