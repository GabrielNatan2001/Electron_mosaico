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
  pause: () => ipcRenderer.invoke('watcher:pause'),
  resume: () => ipcRenderer.invoke('watcher:resume'),
  reloadMosaicos: () => ipcRenderer.invoke('watcher:reload-mosaicos'),
  onContentUpdated: (callback) => ipcRenderer.on('content:updated', callback),
  removeContentUpdatedListener: () => ipcRenderer.removeAllListeners('content:updated'),
});

contextBridge.exposeInMainWorld('fileControls', {
  open: (filePath) => ipcRenderer.invoke('file:open', filePath),
  getBasePath: (userId) => ipcRenderer.invoke('file:getBasePath', userId),
  exists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
  saveFile: (filePath, buffer) => ipcRenderer.invoke('file:saveFile', filePath, buffer),
});

// API para atualizações automáticas
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
