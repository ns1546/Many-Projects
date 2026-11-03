import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import {
  LedgerXProvider,
  LedgerXShell,
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
} from './ledgerx';

import './index.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LedgerXShell><Dashboard /></LedgerXShell>} />
      <Route path="/customers" element={<LedgerXShell><CustomerKhata /></LedgerXShell>} />
      <Route path="/suppliers" element={<LedgerXShell><SupplierKhata /></LedgerXShell>} />
      <Route path="/pos" element={<LedgerXShell><ExpressPOS /></LedgerXShell>} />
      <Route path="/cashbox" element={<LedgerXShell><Cashbox /></LedgerXShell>} />
      <Route path="/inventory" element={<LedgerXShell><Inventory /></LedgerXShell>} />
      <Route path="/halkhata" element={<LedgerXShell><Halkhata /></LedgerXShell>} />
      <Route path="/cheques" element={<LedgerXShell><ChequeRegister /></LedgerXShell>} />
      <Route path="/reports" element={<LedgerXShell><Reports /></LedgerXShell>} />
      <Route path="/history" element={<LedgerXShell><SystemHistory /></LedgerXShell>} />
      <Route path="/godown" element={<LedgerXShell><GodownKhata /></LedgerXShell>} />
      <Route path="/settings" element={<LedgerXShell><Settings /></LedgerXShell>} />

      {/* Redirects & fallback */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LedgerXProvider>
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
    </LedgerXProvider>
  );
}
