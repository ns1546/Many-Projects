const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// native desktop hardware capabilities safely.
contextBridge.exposeInMainWorld('electronAPI', {
  // Direct ESC/POS thermal printing to Windows Spooler
  printRawEscpos: (receiptData) => ipcRenderer.invoke('print-raw-escpos', receiptData),

  // 24V Cash drawer pulse kick (ESC p 0 25 250)
  kickCashDrawer: () => ipcRenderer.invoke('kick-cash-drawer'),

  // Get installed local thermal printers
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  // Machine hardware fingerprint
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),

  // Window controls (minimize, maximize, close)
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Native sound chime trigger
  playChime: (type) => ipcRenderer.send('play-native-chime', type),

  // Auto-Update check
  checkAppUpdate: () => ipcRenderer.invoke('check-app-update'),
});
