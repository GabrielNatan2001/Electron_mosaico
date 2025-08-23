const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
});

contextBridge.exposeInMainWorld('watcherControls', {
  start: (userId, token, proprietarioId) => ipcRenderer.invoke('watcher:start', userId, token, proprietarioId),
  stop: () => ipcRenderer.invoke('watcher:stop'),
});
