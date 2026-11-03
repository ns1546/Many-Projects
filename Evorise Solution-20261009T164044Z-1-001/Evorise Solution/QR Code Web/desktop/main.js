const { app, BrowserWindow, Notification, Tray, Menu, ipcMain, dialog, powerSaveBlocker, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let powerSaveId = null;
let serverInstance = null;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// Helper: Discover local Wi-Fi / Ethernet IP for mobile device access
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 1. EMBEDDED BACKEND SERVER BOOTSTRAP
async function startEmbeddedBackend() {
  try {
    // Locate server.js whether running from source or packaged .exe
    let serverPath = path.join(__dirname, '..', 'server.js');
    if (!fs.existsSync(serverPath)) {
      serverPath = path.join(__dirname, 'server.js');
    }
    if (!fs.existsSync(serverPath)) {
      serverPath = path.join(process.resourcesPath, 'app', 'server.js');
    }

    if (fs.existsSync(serverPath)) {
      console.log('[Desktop Engine] Booting embedded backend from:', serverPath);
      const serverModule = require(serverPath);
      if (typeof serverModule.startServer === 'function') {
        serverInstance = await serverModule.startServer(3000);
        console.log('[Desktop Engine] Embedded backend engine active on port 3000.');
      }
    }
  } catch (err) {
    console.warn('[Desktop Engine] Embedded server startup notice:', err.message);
  }
}

// 2. CREATE NATIVE APPLICATION WINDOW
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Evorise Restaurant Admin • Desktop Software',
    backgroundColor: '#0f172a',
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  // Setup Native Application Menu
  setupAppMenu();

  // Load Admin Dashboard directly (First-Class Native UI)
  const targetUrl = 'http://localhost:3000/admin/index.html';
  
  // Wait a brief tick for embedded server ready
  setTimeout(() => {
    mainWindow.loadURL(targetUrl).catch(() => {
      // If server took a moment, retry
      setTimeout(() => mainWindow.loadURL(targetUrl), 1000);
    });
  }, 300);

  // Inject Desktop Notification & Styling Assets directly into Admin page
  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const cssPath = path.join(__dirname, 'desktop-notifications.css');
      const jsPath = path.join(__dirname, 'desktop-notifications.js');
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        await mainWindow.webContents.insertCSS(cssContent);
      }
      if (fs.existsSync(jsPath)) {
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        await mainWindow.webContents.executeJavaScript(jsContent);
      }
    } catch (e) {
      console.warn('[Desktop] Injection notice:', e);
    }
  });

  // Prevent display sleep on kitchen / POS counter
  try {
    powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
  } catch (e) {}

  // Minimize to tray on close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: 'Evorise Restaurant Admin',
          body: 'Running in system tray. New order alerts & sound chimes remain active.',
          silent: true
        }).show();
      }
    }
  });

  setupTray();
}

// 3. NATIVE APPLICATION MENU
function setupAppMenu() {
  const localIp = getLocalIpAddress();
  const mobileMenuUrl = `http://${localIp}:3000/index.html?table=3`;

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: '⬅ Back to Dashboard',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow) {
              if (mainWindow.webContents.canGoBack()) {
                mainWindow.webContents.goBack();
              } else {
                mainWindow.loadURL('http://localhost:3000/admin/index.html');
              }
            }
          }
        },
        {
          label: '🏠 Dashboard Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow) mainWindow.loadURL('http://localhost:3000/admin/index.html');
          }
        },
        { type: 'separator' },
        {
          label: '📱 Customer Mobile QR Code Link',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Mobile Customer Access (Local Wi-Fi)',
              message: `Customers on the restaurant Wi-Fi can order at:\n\n${mobileMenuUrl}\n\n(Share this URL or print QR code with this address)`,
              buttons: ['Copy URL to Clipboard', 'OK']
            }).then(result => {
              if (result.response === 0) {
                const { clipboard } = require('electron');
                clipboard.writeText(mobileMenuUrl);
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Refresh Dashboard',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => mainWindow && mainWindow.setFullScreen(!mainWindow.isFullScreen())
        },
        { type: 'separator' },
        {
          label: 'Exit Software',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Notifications',
      submenu: [
        {
          label: '🔔 Open Notification Portal',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                const nav = document.querySelector('[data-view="notifications"]');
                if (nav) nav.click();
                else if (window.evoriseDesktop) window.evoriseDesktop.openSettings();
              `);
            }
          }
        },
        {
          label: '⚙ Notification & Audio Settings',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript('window.evoriseDesktop?.openSettings()');
            }
          }
        },
        {
          label: 'Acknowledge All Orders',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript('window.evoriseDesktop?.acknowledgeAll()');
            }
          }
        },
        {
          label: 'Test Sound Chime',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript('window.evoriseDesktop?.playTone()');
            }
          }
        }
      ]
    },
    {
      label: 'Database',
      submenu: [
        {
          label: 'Open Data & Backup Center',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                const nav = document.querySelector('[data-view="database"]');
                if (nav) nav.click();
              `);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Evorise Software',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Evorise Restaurant Admin',
              message: 'Evorise Solution - Enterprise POS & Kitchen Management Desktop Software\nVersion 2.0.0\nACID Transactional SQLite Engine\nReal-Time WebSocket Event Bus',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 4. SYSTEM TRAY INTEGRATION
function setupTray() {
  if (tray) return;

  const icon = nativeImage.createFromBuffer(
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADhJREFUOE9jZKAQMFKon2H4fzT+wwxGg8HQDEAEjVpAjAaC0QAGg3g0QIwG0WgAAzB2jIaC0QAGAAu+Axk47kHFAAAAAElFTkSuQmCC', 'base64')
  );

  tray = new Tray(icon);
  tray.setToolTip('Evorise Restaurant Admin • Software Active');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Admin Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Test Audio Chime',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript('window.evoriseDesktop?.playTone()');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Evorise Software',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 5. IPC HANDLERS
ipcMain.on('desktop:notify', (event, { title, body, tag }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'New Order Alert',
      body: body || 'A customer has placed an order.',
      silent: false
    });

    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.show();
  }
});

ipcMain.on('desktop:set-badge', (event, count) => {
  if (process.platform === 'darwin') {
    app.setBadgeCount(count || 0);
  }
  if (mainWindow) {
    if (count > 0) {
      mainWindow.setTitle(`(${count}) Evorise Restaurant Admin • Desktop Software`);
    } else {
      mainWindow.setTitle('Evorise Restaurant Admin • Desktop Software');
    }
  }
  if (tray) {
    tray.setToolTip(count > 0 ? `Evorise Admin: ${count} Pending Orders` : 'Evorise Admin: Software Online');
  }
});

ipcMain.on('desktop:flash-window', (event, enable) => {
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.flashFrame(enable !== false);
  }
});

ipcMain.on('desktop:window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('desktop:window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('desktop:window-close', () => {
  if (mainWindow) mainWindow.close();
});

// App Lifecycle
app.whenReady().then(async () => {
  await startEmbeddedBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  if (powerSaveId !== null) {
    try { powerSaveBlocker.stop(powerSaveId); } catch (e) {}
  }
  if (serverInstance && typeof serverInstance.close === 'function') {
    try { serverInstance.close(); } catch (e) {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
