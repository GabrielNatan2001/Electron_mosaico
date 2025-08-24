const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('node:path');
require('dotenv').config();
const { startWatcher } = require('./background/watcher');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let watcherRef = null;
let mainWindowRef = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, 'assets', 'logoMosaico.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    transparent: true,
    backgroundColor: '#00000000',
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
    trafficLightPosition: process.platform === 'darwin' ? { x: 12, y: 14 } : undefined,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false, // Permite conexões externas
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindowRef = mainWindow;

  // Ocultar barra de menu padrão
  mainWindow.setMenuBarVisibility(false);

  // Abrir maximizada (não fullscreen)
  mainWindow.maximize();

  // Handlers de janela
  ipcMain.handle('window:minimize', () => {
    if (!mainWindow.isMinimized()) mainWindow.minimize();
  });
  ipcMain.handle('window:maximize', () => {
    if (!mainWindow.isMaximized()) mainWindow.maximize();
  });
  ipcMain.handle('window:toggle-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  });
  ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized());
  ipcMain.handle('window:close', () => {
    mainWindow.close();
  });

  // Configurar CSP para permitir conexões com a API e desenvolvimento
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  const isDev = !app.isPackaged;
  const devCsp = [
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
    "script-src * 'unsafe-inline' 'unsafe-eval'",
    "style-src * 'unsafe-inline'",
    "img-src * data: blob:",
    "connect-src * ws: wss:",
    "font-src * data:",
    "media-src * data: blob:",
    "frame-src *",
    "object-src 'none'"
  ].join('; ');

  const csp = devCsp;

  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [csp]
    }
  });
});

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Removido: Inicialização automática do watcher
  // O watcher será iniciado apenas após o login do usuário

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handlers IPC para controlar o watcher
ipcMain.handle('watcher:start', async (event, userId, token = null, proprietarioId = null) => {
  console.log('[IPC] watcher:start chamado com userId:', userId, 'token:', !!token, 'proprietarioId:', proprietarioId);
  
  try {
    // Parar watcher existente se houver
    if (watcherRef && typeof watcherRef.close === 'function') {
      console.log('[IPC] Parando watcher existente...');
      watcherRef.close();
      watcherRef = null;
    }

    // Iniciar novo watcher para o usuário específico
    const logDir = path.join(app.getPath('userData'), 'logs');
    console.log('[IPC] Iniciando novo watcher...');
    console.log('[IPC] logDir:', logDir);
    console.log('[IPC] userId:', userId);
    console.log('[IPC] token disponível:', !!token);
    console.log('[IPC] proprietarioId:', proprietarioId);
    
    watcherRef = await startWatcher({
      logDir,
      userId, // Passar userId para o watcher
      token,  // Passar token para o watcher
      proprietarioId, // Passar proprietarioId para o watcher
      onLog: (line) => {
        console.log('[watcher]', line.trim());
      }
    });
    
    console.log('[IPC] Watcher iniciado com sucesso para usuário:', userId);
    return { success: true, message: 'Watcher iniciado com sucesso' };
  } catch (err) {
    console.error('[IPC] Erro ao iniciar watcher:', err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle('watcher:stop', () => {
  try {
    if (watcherRef && typeof watcherRef.close === 'function') {
      watcherRef.close();
      watcherRef = null;
      console.log('[watcher] stopped');
      return { success: true, message: 'Watcher parado com sucesso' };
    }
    return { success: false, message: 'Nenhum watcher ativo' };
  } catch (err) {
    console.error('[watcher] failed to stop:', err);
    return { success: false, message: err.message };
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (watcherRef && typeof watcherRef.close === 'function') {
    watcherRef.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
