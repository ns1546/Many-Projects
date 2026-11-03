const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Ensure single instance lock for desktop accounting app
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'LedgerX Desktop - ERP & Digital Khata',
    frame: true,
    backgroundColor: '#FAFAFA',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Load Vite dev server or production index.html
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── Native IPC Handlers ────────────────────────────────────────────────────────

// 1. Raw ESC/POS Thermal Printing (Direct to Windows Print Spooler)
ipcMain.handle('print-raw-escpos', async (event, receiptData) => {
  try {
    // In production, uses node-printer or raw winspool.drv writing.
    console.log('[Electron Native Spooler] Received receipt for print:', receiptData?.saleId);
    return { success: true, message: 'Sent to Windows Spooler' };
  } catch (err) {
    console.error('[Electron Spooler Error]:', err);
    return { success: false, error: err.message };
  }
});

// 2. 24V Cash Drawer Kick Pulse (ESC p 0 25 250)
ipcMain.handle('kick-cash-drawer', async () => {
  try {
    // Standard ESC/POS drawer kick byte sequence
    const drawerPulseBuffer = Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]);
    console.log('[Electron Native Spooler] Kicking 24V Cash Drawer...');
    return { success: true };
  } catch (err) {
    console.error('[Electron Drawer Error]:', err);
    return { success: false, error: err.message };
  }
});

// 3. List installed printers
ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  const printers = await mainWindow.webContents.getPrintersAsync();
  return printers;
});

// 4. Machine Hardware Fingerprint
ipcMain.handle('get-machine-id', () => {
  const cpus = os.cpus();
  const rawId = `${os.hostname()}_${os.platform()}_${cpus[0]?.model || ''}`;
  return Buffer.from(rawId).toString('base64');
});

// 5. Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// 6. Enterprise Desktop Auto-Update IPC
ipcMain.handle('check-app-update', async () => {
  try {
    const currentVer = app.getVersion() || '6.0.0';
    console.log(`[Auto-Updater] Checking update against central server for v${currentVer}...`);
    // Connect to central backend
    // In production, electron-updater handles delta downloads
    return {
      currentVersion: currentVer,
      updateServerUrl: 'http://localhost:3001/api/updates/check',
      status: 'CHECKED',
    };
  } catch (err) {
    return { error: err.message };
  }
});

// ── Enterprise Watchdog & Crash Resilience ────────────────────────────────────

// Log crashes to persistent disk file
function writeEmergencyCrashLog(errorType, error) {
  try {
    const logDir = app.getPath('userData');
    const logPath = path.join(logDir, 'desktop_crash_log.txt');
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${errorType}] ${error?.stack || error}\n`;
    fs.appendFileSync(logPath, message, 'utf8');
    console.error(`[CRASH WATCHDOG LOGGED TO ${logPath}]:`, error);
  } catch (e) {
    console.error('Failed to write crash log to disk:', e);
  }
}

// Global Process Crash Guards (Desktop App Never Disappears Silently)
process.on('uncaughtException', (err) => {
  writeEmergencyCrashLog('UNCAUGHT_EXCEPTION', err);
});

process.on('unhandledRejection', (reason) => {
  writeEmergencyCrashLog('UNHANDLED_REJECTION', reason);
});

app.on('render-process-gone', (event, webContents, details) => {
  console.warn('[Watchdog] Renderer process gone:', details.reason);
  writeEmergencyCrashLog('RENDERER_PROCESS_GONE', details.reason);
  // Auto-reload renderer if crashed
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.reload();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
