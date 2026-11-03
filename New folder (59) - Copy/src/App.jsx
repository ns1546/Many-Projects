import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';

// Core State Providers
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { EditModeProvider } from './context/EditModeContext';

// Layout & Global Components
import ErrorBoundary from './components/ErrorBoundary';
import { PublicRoute } from './components/RouteGuards';

// ── LedgerX Modular Subsystem (100% Isolated inside src/ledgerx/) ──────────────
import {
  LedgerXProvider,
  LedgerXShell,
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
} from './ledgerx';

// Standalone LedgerX Mobile App (Inspired by bKash UX, 100% Original IP)
import LedgerXMobileApp from './ledgerx_mobile';

// Authentication
import Login from './pages/Login';

// Legacy Multi-store ERP Pages (Preserved for compatibility)
const MainDashboard = React.lazy(() => import('./pages/MainDashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Integrity = React.lazy(() => import('./pages/Integrity'));
const Database = React.lazy(() => import('./pages/Database'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const GodownDashboard = React.lazy(() => import('./pages/godown/GodownDashboard'));
const StockEntry = React.lazy(() => import('./pages/godown/StockEntry'));
const GodownSales = React.lazy(() => import('./pages/godown/GodownSales'));
const DispatchToShop = React.lazy(() => import('./pages/godown/DispatchToShop'));
const ShopDashboard = React.lazy(() => import('./pages/shop/ShopDashboard'));
const ShopSales = React.lazy(() => import('./pages/shop/ShopSales'));

import './index.css';

// ── Application Route Registry ────────────────────────────────────────────────
function AppRoutes() {
  const isNativeMobile = Capacitor.isNativePlatform();

  return (
    <Routes>
      {/* Public Authentication */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Root Route: Automatically routes to LedgerXMobileApp on native Android APK */}
      <Route
        path="/"
        element={
          isNativeMobile ? (
            <LedgerXMobileApp />
          ) : (
            <LedgerXShell><Dashboard /></LedgerXShell>
          )
        }
      />
      <Route path="/customer-directory" element={<LedgerXShell><CustomerDirectory /></LedgerXShell>} />
      <Route path="/crm" element={<Navigate to="/customer-directory" replace />} />
      <Route path="/customers/directory" element={<Navigate to="/customer-directory" replace />} />
      <Route path="/customers" element={<LedgerXShell><CustomerKhata /></LedgerXShell>} />
      <Route path="/suppliers" element={<LedgerXShell><SupplierKhata /></LedgerXShell>} />
      <Route path="/pos" element={<LedgerXShell><ExpressPOS /></LedgerXShell>} />
      <Route path="/cashbox" element={<LedgerXShell><Cashbox /></LedgerXShell>} />
      <Route path="/inventory" element={<LedgerXShell><Inventory /></LedgerXShell>} />
      <Route path="/halkhata" element={<LedgerXShell><Halkhata /></LedgerXShell>} />
      <Route path="/cheques" element={<LedgerXShell><ChequeRegister /></LedgerXShell>} />
      <Route path="/reports" element={<LedgerXShell><Reports /></LedgerXShell>} />
      <Route path="/history" element={<LedgerXShell><SystemHistory /></LedgerXShell>} />
      <Route path="/settings" element={<LedgerXShell><Settings /></LedgerXShell>} />
      <Route path="/mobile-pos" element={<MobilePOSView />} />

      {/* Standalone LedgerX Mobile App (bKash-Style Frictionless UX) */}
      <Route path="/mobile" element={<LedgerXMobileApp />} />
      <Route path="/app" element={<LedgerXMobileApp />} />
      <Route path="/ledgerx-go" element={<LedgerXMobileApp />} />

      {/* Legacy Enterprise ERP Routes (Preserved & Protected) */}
      <Route path="/dashboard" element={<LedgerXShell><Dashboard /></LedgerXShell>} />
      <Route path="/legacy/dashboard" element={<LedgerXShell><MainDashboard /></LedgerXShell>} />
      <Route path="/legacy/analytics" element={<LedgerXShell><Analytics /></LedgerXShell>} />
      <Route path="/legacy/integrity" element={<LedgerXShell><Integrity /></LedgerXShell>} />
      <Route path="/legacy/database" element={<LedgerXShell><Database /></LedgerXShell>} />
      {/* Native LedgerX Godown & Chalani Logistics Suite */}
      <Route path="/godown" element={<LedgerXShell><GodownKhata /></LedgerXShell>} />
      <Route path="/godown/stock" element={<LedgerXShell><GodownKhata /></LedgerXShell>} />
      <Route path="/godown/sales" element={<LedgerXShell><GodownKhata /></LedgerXShell>} />
      <Route path="/godown/dispatch" element={<LedgerXShell><GodownKhata /></LedgerXShell>} />
      <Route path="/shop" element={<LedgerXShell><ShopDashboard /></LedgerXShell>} />
      <Route path="/shop/sales" element={<LedgerXShell><ShopSales /></LedgerXShell>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LedgerXProvider>
          <InventoryProvider>
            <EditModeProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: '#1F2937',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '10px 16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#FFFFFF',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFFFF',
                      },
                    },
                    duration: 3000,
                  }}
                />
              </BrowserRouter>
            </EditModeProvider>
          </InventoryProvider>
        </LedgerXProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
