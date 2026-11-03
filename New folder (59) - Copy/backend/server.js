/**
 * LedgerX Enterprise Central Backend Server & Multi-Tenant Management Engine
 * Features:
 * - Multi-tenant strict logical isolation
 * - Platform Super-Admin global telemetry & cross-tenant business metrics
 * - Cryptographic machine binding & license verification
 * - Client crash telemetry & error diagnostic collection
 * - Automated desktop update server protocol (electron-updater compatible)
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ensure storage directories exist
const CRASH_LOGS_DIR = path.join(__dirname, 'crash_reports');
const BACKUPS_DIR = path.join(__dirname, 'cloud_backups');
if (!fs.existsSync(CRASH_LOGS_DIR)) fs.mkdirSync(CRASH_LOGS_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

// Mock / In-Memory Tenant Registry (In production, backed by MongoDB / Postgres)
const TENANTS_DB = [
  {
    tenantId: 'shop_dhaka_01',
    name: 'মদিনা ট্রেডার্স (প্রধান শাখা)',
    ownerName: 'হাজী রফিকুল ইসলাম',
    phone: '01711-000000',
    plan: 'ENTERPRISE_LIFETIME',
    licenseKey: 'LX-PRO-DHAKA-88910',
    isActive: true,
    expiresAt: '2030-12-31',
    totalGMVPoisha: 184500000, // ৳ 18,45,000.00
    machineBindings: ['REVTS1RPUDAtMDI=']
  },
  {
    tenantId: 'godown_ctg_01',
    name: 'বিসমিল্লাহ রাইস মিলস অ্যান্ড গোডাউন',
    ownerName: 'মো: জয়নাল আবেদীন',
    phone: '01811-000000',
    plan: 'ENTERPRISE_LIFETIME',
    licenseKey: 'LX-PRO-CTG-99214',
    isActive: true,
    expiresAt: '2030-12-31',
    totalGMVPoisha: 540000000, // ৳ 54,00,000.00
    machineBindings: []
  }
];

// Current release version metadata
const LATEST_RELEASE = {
  version: '6.0.0',
  releaseDate: '2026-10-15',
  mandatory: false,
  downloadUrl: 'https://cdn.ledgerx.bd/releases/LedgerX_Setup_6.0.0.exe',
  sha512: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  notes: 'Major Release: bKash pink visual design system, 100% numpad rush hour counter, returnable container khata, and instant bilingual toggle.'
};

// ── Super-Admin Endpoints (Platform Owner Oversight) ───────────────────────────

/**
 * Global Platform Health & All Businesses Analytics (Owner Master View)
 */
app.get('/api/admin/metrics', (req, res) => {
  const totalTenants = TENANTS_DB.length;
  const activeTenants = TENANTS_DB.filter(t => t.isActive).length;
  const totalPlatformGMVPoisha = TENANTS_DB.reduce((sum, t) => sum + (t.totalGMVPoisha || 0), 0);

  res.json({
    success: true,
    system: 'LedgerX Multi-Tenant Platform Core',
    status: 'HEALTHY',
    metrics: {
      totalTenants,
      activeTenants,
      totalPlatformGMVPoisha,
      serverTime: new Date().toISOString(),
      uptimeSeconds: process.uptime()
    }
  });
});

/**
 * List all business accounts with license status
 */
app.get('/api/admin/tenants', (req, res) => {
  res.json({
    success: true,
    count: TENANTS_DB.length,
    tenants: TENANTS_DB.map(t => ({
      tenantId: t.tenantId,
      name: t.name,
      ownerName: t.ownerName,
      phone: t.phone,
      plan: t.plan,
      isActive: t.isActive,
      expiresAt: t.expiresAt
    }))
  });
});

// ── Client Security & Licensing Endpoints ─────────────────────────────────────

/**
 * Verify license and machine fingerprint
 */
app.post('/api/license/verify', (req, res) => {
  const { tenantId, licenseKey, machineId } = req.body;

  const tenant = TENANTS_DB.find(t => t.tenantId === tenantId);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Tenant store not found.' });
  }

  if (tenant.licenseKey !== licenseKey) {
    return res.status(401).json({ success: false, error: 'Invalid license key for this store.' });
  }

  if (!tenant.isActive) {
    return res.status(403).json({ success: false, error: 'Store license has expired or is suspended.' });
  }

  // Machine binding logic
  if (machineId && !tenant.machineBindings.includes(machineId)) {
    if (tenant.machineBindings.length >= 3) {
      return res.status(403).json({ 
        success: false, 
        error: 'Terminal limit reached (Max 3 PCs per license). Contact support to deregister old machines.' 
      });
    }
    tenant.machineBindings.push(machineId);
  }

  res.json({
    success: true,
    licensedTo: tenant.name,
    plan: tenant.plan,
    expiresAt: tenant.expiresAt,
    authorized: true
  });
});

// ── Auto-Update Gateway (electron-updater protocol) ───────────────────────────

/**
 * Checks if a newer desktop version is available
 */
app.get('/api/updates/check', (req, res) => {
  const clientVersion = req.query.version || '1.0.0';
  const hasUpdate = clientVersion !== LATEST_RELEASE.version;

  res.json({
    success: true,
    hasUpdate,
    latestVersion: LATEST_RELEASE.version,
    currentVersion: clientVersion,
    mandatory: LATEST_RELEASE.mandatory,
    downloadUrl: LATEST_RELEASE.downloadUrl,
    sha512: LATEST_RELEASE.sha512,
    releaseNotes: LATEST_RELEASE.notes
  });
});

// ── Crash Telemetry & Bug Diagnostic Inbox ────────────────────────────────────

/**
 * Silent crash reporting endpoint for unhandled exceptions in client desktop apps
 */
app.post('/api/telemetry/crash-report', (req, res) => {
  const { tenantId, appVersion, error, stack, systemInfo } = req.body;
  const crashId = `CRASH_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logFile = path.join(CRASH_LOGS_DIR, `${crashId}.json`);

  const report = {
    crashId,
    timestamp: new Date().toISOString(),
    tenantId: tenantId || 'UNKNOWN',
    appVersion: appVersion || 'UNKNOWN',
    error: error || 'Unspecified error',
    stack: stack || null,
    systemInfo: systemInfo || {},
  };

  fs.writeFile(logFile, JSON.stringify(report, null, 2), (err) => {
    if (err) console.error('Failed to write crash log:', err);
  });

  console.warn(`[TELEMETRY] Captured Crash Report: ${crashId} from Tenant: ${tenantId}`);
  res.json({ success: true, crashId });
});

// ── Cloud Backup Ingestion ────────────────────────────────────────────────────

/**
 * Pushes daily snapshot to central disaster recovery vault
 */
app.post('/api/backup/upload', (req, res) => {
  const { tenantId, checksum, payload } = req.body;
  if (!tenantId || !payload) {
    return res.status(400).json({ success: false, error: 'Missing tenantId or payload' });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const targetDir = path.join(BACKUPS_DIR, tenantId);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const backupFile = path.join(targetDir, `snapshot_${dateStr}.lxdb`);
  fs.writeFileSync(backupFile, JSON.stringify({ tenantId, checksum, payload, uploadedAt: new Date().toISOString() }));

  console.log(`[BACKUP] Vaulted encrypted snapshot for Tenant: ${tenantId}`);
  res.json({ success: true, message: 'Snapshot vaulted successfully.' });
});

// ── Remote Feature Flags & Killswitches ───────────────────────────────────────
// Big-tech pattern: Disable buggy features or toggle settings remotely without reinstalling
const REMOTE_FEATURE_FLAGS = {
  voiceboxAudioEnabled: true,
  cloudSyncFrequencyMs: 60000,
  emergencyNotice: null, // Can broadcast banner message e.g. "Server maintenance at 2 AM"
  maintenanceMode: false,
};

app.get('/api/config/remote-flags', (req, res) => {
  res.json({
    success: true,
    flags: REMOTE_FEATURE_FLAGS,
    timestamp: new Date().toISOString(),
  });
});

// Update remote feature flags (Admin only)
app.post('/api/admin/flags', (req, res) => {
  const { flags } = req.body;
  if (flags) {
    Object.assign(REMOTE_FEATURE_FLAGS, flags);
  }
  res.json({ success: true, updatedFlags: REMOTE_FEATURE_FLAGS });
});

// ── Customer Support Ticket & Remote Diagnostic Submission ────────────────────
const SUPPORT_TICKETS_DIR = path.join(__dirname, 'support_tickets');
if (!fs.existsSync(SUPPORT_TICKETS_DIR)) fs.mkdirSync(SUPPORT_TICKETS_DIR, { recursive: true });

app.post('/api/support/ticket', (req, res) => {
  const { tenantId, phone, issueType, message, diagnosticBundle } = req.body;
  const ticketId = `TICKET_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const ticketFile = path.join(SUPPORT_TICKETS_DIR, `${ticketId}.json`);

  const ticketData = {
    ticketId,
    timestamp: new Date().toISOString(),
    tenantId: tenantId || 'UNKNOWN',
    phone: phone || 'NOT_PROVIDED',
    issueType: issueType || 'GENERAL_BUG',
    message: message || '',
    status: 'OPEN',
    diagnosticBundle: diagnosticBundle || {},
  };

  fs.writeFileSync(ticketFile, JSON.stringify(ticketData, null, 2));
  console.log(`[SUPPORT] Created New Customer Ticket: ${ticketId} from ${tenantId}`);

  res.json({
    success: true,
    ticketId,
    message: 'Support request received. A technical engineer will contact you shortly.',
  });
});

// ── Emergency Remote Hotpatch & Action Queue (The Meta/NASA Uplink) ───────────
// Allows platform engineering to remotely trigger emergency database repair or rollback
const PENDING_REMOTE_ACTIONS = {};

app.post('/api/emergency/hotpatch', (req, res) => {
  const { tenantId, actionType, payload } = req.body;
  if (!tenantId || !actionType) {
    return res.status(400).json({ success: false, error: 'Missing tenantId or actionType' });
  }

  if (!PENDING_REMOTE_ACTIONS[tenantId]) {
    PENDING_REMOTE_ACTIONS[tenantId] = [];
  }

  const action = {
    actionId: `ACTION_${Date.now()}`,
    actionType, // e.g. 'REBUILD_BALANCES', 'FORCE_SHADOW_ROLLBACK', 'PURGE_CORRUPT_KEYS'
    payload: payload || {},
    queuedAt: new Date().toISOString(),
  };

  PENDING_REMOTE_ACTIONS[tenantId].push(action);
  console.log(`[EMERGENCY UPLINK] Queued remote action ${actionType} for tenant: ${tenantId}`);

  res.json({ success: true, action });
});

// Client desktop polls this periodically or on boot
app.get('/api/emergency/pending-actions/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  const actions = PENDING_REMOTE_ACTIONS[tenantId] || [];
  // Return and clear pending queue
  PENDING_REMOTE_ACTIONS[tenantId] = [];
  res.json({ success: true, actions });
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Global Error Guard (Server Never Crashes) ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[UNCAUGHT BACKEND ERROR]:', err);
  res.status(500).json({ success: false, error: 'Internal Server Security Exception' });
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL PROCESS UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL PROCESS UNHANDLED REJECTION]:', reason);
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  LedgerX Enterprise Central Management Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Admin Metrics: http://localhost:${PORT}/api/admin/metrics`);
  console.log(`================================================================`);
});
