const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  showNotification: (payload) => ipcRenderer.send('desktop:notify', payload),
  setBadgeCount: (count) => ipcRenderer.send('desktop:set-badge', count),
  flashWindow: (enable) => ipcRenderer.send('desktop:flash-window', enable),
  minimize: () => ipcRenderer.send('desktop:window-minimize'),
  maximize: () => ipcRenderer.send('desktop:window-maximize'),
  close: () => ipcRenderer.send('desktop:window-close'),
  getDesktopSettings: () => ipcRenderer.invoke('desktop:get-settings'),
  saveDesktopSettings: (settings) => ipcRenderer.send('desktop:save-settings', settings)
});
