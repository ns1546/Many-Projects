import React from 'react';

// Placeholder pages for Phase 1 — content will be filled in Phase 2+
export function MainDashboard() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Main Dashboard</h1><p className="page-subtitle">Overview of all operations</p></div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <div className="empty-title">Dashboard Coming in Phase 4</div>
          <div className="empty-desc">Sales analytics and operational overview will be displayed here.</div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Analytics & Reports</h1><p className="page-subtitle">Sales trends and business intelligence</p></div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <div className="empty-title">Analytics — Phase 4</div>
          <div className="empty-desc">Full analytics with charts will be built in Phase 4.</div>
        </div>
      </div>
    </div>
  );
}

export function IntegrityPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Integrity Check</h1><p className="page-subtitle">Corruption detection and audit trails</p></div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <div className="empty-title">Integrity Module — Phase 4</div>
          <div className="empty-desc">Cross-referencing godown, shop, and sales data for discrepancies.</div>
        </div>
      </div>
    </div>
  );
}

export function DatabasePage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Database</h1><p className="page-subtitle">View and export all stored records</p></div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <div className="empty-title">Database Viewer — Phase 4</div>
          <div className="empty-desc">All records with CSV export across every collection.</div>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page-container animate-fade-in" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div className="empty-state">
        <div className="empty-icon"></div>
        <div className="empty-title">Page Not Found</div>
        <div className="empty-desc">The page you're looking for doesn't exist or you don't have access.</div>
      </div>
    </div>
  );
}
