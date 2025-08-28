const { app, BrowserWindow, session, ipcMain, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();
const { startWatcher, pauseWatcher, resumeWatcher, recarregarMosaicos } = require('./background/watcher');

// Sistema de logging para atualizações
const logUpdate = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}\n`;

  // Log no console
  console.log(logMessage.trim());

  // Log em arquivo
  try {
    const logDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'updater.log');
    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error('Erro ao escrever log:', error);
  }
};

// Importar electron-updater apenas em produção
let autoUpdater;
if (app.isPackaged) {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
    
    // Configuração AGGRESSIVA para forçar API REST e evitar feed RSS
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'GabrielNatan2001',
      repo: 'Electron_mosaico',
      private: false,
      releaseType: 'release',
      // Forçar URL específica da API REST
      url: 'https://api.github.com/repos/GabrielNatan2001/Electron_mosaico/releases'
    });
    
    // Configurações para evitar comportamentos padrão problemáticos
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;
    autoUpdater.updateConfigPath = null;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Headers específicos para API REST moderna
    autoUpdater.requestHeaders = {
      'User-Agent': 'TLM-Mosaico-App',
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Cache-Control': 'no-cache'
    };
    
    // Configuração adicional para forçar API REST
    if (autoUpdater.setFeedURL) {
      try {
        // Configuração dupla para garantir que funcione
        autoUpdater.setFeedURL({
          provider: 'github',
          owner: 'GabrielNatan2001',
          repo: 'Electron_mosaico',
          private: false,
          releaseType: 'release',
          url: 'https://api.github.com/repos/GabrielNatan2001/Electron_mosaico/releases'
        });
        
        logUpdate('✅ Configuração agressiva aplicada para forçar API REST');
      } catch (error) {
        logUpdate('⚠️ Erro na configuração agressiva:', error.message);
      }
    }
    
    logUpdate('✅ Electron-updater configurado com configuração agressiva para GitHub');
  } catch (error) {
    console.error('Erro ao carregar electron-updater:', error);
  }
}

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
    title: 'TLM Mosaico',
    //frame: false,
    icon: process.platform === 'darwin'
      ? path.join(__dirname, 'assets', 'logoMosaico.icns')
      : path.join(__dirname, 'assets', 'logoMosaico.ico'),
    //titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    //transparent: true,
    backgroundColor: '#00000000',
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
    trafficLightPosition: process.platform === 'darwin' ? { x: 12, y: 14 } : undefined,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false, // Permite conexões externas
      nodeIntegration: false,
      contextIsolation: true,
      // Desabilitar DevTools em produção
      devTools: !app.isPackaged,
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
      "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
      "script-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
      "worker-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
      "style-src * 'unsafe-inline' *",
      "img-src * data: blob:",
      "connect-src * ws: wss:",
      "font-src * data:",
      "media-src * data: blob:",
      "frame-src *",
      "object-src *"
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

  // Open the DevTools apenas em desenvolvimento
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Desabilitar atalhos de teclado para DevTools em produção
  if (app.isPackaged) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (input.key === 'F12' ||
        (input.control && input.shift && (input.key === 'I' || input.key === 'J')) ||
        (input.control && input.key === 'U')) {
        event.preventDefault();
      }
    });

    // Desabilitar menu de contexto (clique direito)
    mainWindow.webContents.on('context-menu', (event) => {
      event.preventDefault();
    });

    // Desabilitar DevTools via código
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Definir o nome da aplicação para o sistema operacional
  app.setName('TLM Mosaico');

  // Configuração específica para Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.tlm.mosaico');
  }

  // Configuração específica para macOS
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'TLM Mosaico',
      applicationVersion: app.getVersion(),
      copyright: '© 2024 TLM Mosaico. Todos os direitos reservados.',
      website: 'https://tlm.com.br'
    });
  }

  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData();
  createWindow();

  // Configurar auto-updater se estiver disponível
  if (autoUpdater && app.isPackaged) {
    logUpdate('🚀 Inicializando sistema de atualização automática...');
    setupAutoUpdater();
  } else {
    logUpdate('⚠️ Auto-updater não disponível ou aplicativo em desenvolvimento');
  }

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
      mainWindow: mainWindowRef, // Passar referência da janela principal
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

// Handler para abrir arquivos no sistema
ipcMain.handle('file:open', async (event, filePath) => {
  try {
    console.log('[IPC] Tentando abrir arquivo:', filePath);

    // Verificar se o arquivo existe antes de tentar abrir
    const fs = require('node:fs');
    if (!fs.existsSync(filePath)) {
      return { success: false, message: 'Arquivo não encontrado no sistema' };
    }

    await shell.openPath(filePath);
    return { success: true, message: 'Arquivo aberto com sucesso' };
  } catch (err) {
    console.error('[IPC] Erro ao abrir arquivo:', err);
    return { success: false, message: err.message };
  }
});

// Handler para verificar se arquivo existe
ipcMain.handle('file:exists', async (event, filePath) => {
  try {
    const fs = require('node:fs');
    const exists = fs.existsSync(filePath);
    return { success: true, exists: exists };
  } catch (err) {
    console.error('[IPC] Erro ao verificar arquivo:', err);
    return { success: false, message: err.message };
  }
});

// Handler para pausar o watcher
ipcMain.handle('watcher:pause', async (event) => {
  try {
    const result = pauseWatcher();
    return { success: result, message: result ? 'Watcher pausado' : 'Watcher não pausado' };
  } catch (err) {
    console.error('[IPC] Erro ao pausar watcher:', err);
    return { success: false, message: err.message };
  }
});

// Handler para retomar o watcher
ipcMain.handle('watcher:resume', async (event) => {
  try {
    const result = resumeWatcher();
    return { success: result, message: result ? 'Watcher retomado' : 'Watcher não retomado' };
  } catch (err) {
    console.error('[IPC] Erro ao retomar watcher:', err);
    return { success: false, message: err.message };
  }
});

// Handler para recarregar mosaicos do usuário
ipcMain.handle('watcher:reload-mosaicos', async (event) => {
  try {
    console.log('[IPC] Recarregando mosaicos do usuário...');
    const result = await recarregarMosaicos();
    return { success: result, message: result ? 'Mosaicos recarregados com sucesso' : 'Erro ao recarregar mosaicos' };
  } catch (err) {
    console.error('[IPC] Erro ao recarregar mosaicos:', err);
    return { success: false, message: err.message };
  }
});

// Handler para salvar arquivo no sistema
ipcMain.handle('file:saveFile', async (event, filePath, arrayBuffer) => {
  try {
    console.log('[IPC] Salvando arquivo:', filePath);

    const fs = require('node:fs');
    const path = require('node:path');

    // Garantir que o diretório existe
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Converter ArrayBuffer para Buffer do Node.js
    let fileBuffer;
    if (arrayBuffer instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (arrayBuffer instanceof Uint8Array) {
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(arrayBuffer)) {
      fileBuffer = arrayBuffer;
    } else {
      // Se for outro tipo, tentar converter
      fileBuffer = Buffer.from(arrayBuffer);
    }

    // Salvar o arquivo
    fs.writeFileSync(filePath, fileBuffer);

    return { success: true, message: 'Arquivo salvo com sucesso' };
  } catch (err) {
    console.error('[IPC] Erro ao salvar arquivo:', err);
    return { success: false, message: err.message };
  }
});

// Handler para obter o caminho base dos arquivos do usuário
ipcMain.handle('file:getBasePath', async (event, userId) => {
  try {
    const os = require('node:os');
    const path = require('node:path');
    const basePath = path.join(os.homedir(), 'TlmMosaico', `user_${userId}`);
    return { success: true, path: basePath };
  } catch (err) {
    console.error('[IPC] Erro ao obter caminho base:', err);
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

// Função para configurar o auto-updater
function setupAutoUpdater() {
  if (!autoUpdater) return;

  logUpdate('🔧 Configurando auto-updater...');

  // Configurar o auto-updater
  autoUpdater.autoDownload = false; // Não baixar automaticamente
  autoUpdater.autoInstallOnAppQuit = true; // Instalar quando o app fechar

  logUpdate('✅ Configurações do auto-updater definidas', {
    autoDownload: false,
    autoInstallOnAppQuit: true
  });

  // Eventos do auto-updater
  autoUpdater.on('checking-for-update', () => {
    logUpdate('🔍 Verificando atualizações...');
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:checking');
    }
  });

  autoUpdater.on('update-available', (info) => {
    logUpdate('🎉 Atualização disponível detectada!', info);
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:available', info);
    }

    // Perguntar ao usuário se quer baixar a atualização
    logUpdate('💬 Mostrando diálogo para o usuário...');
    dialog.showMessageBox(mainWindowRef, {
      type: 'info',
      title: 'Atualização Disponível',
      message: `Uma nova versão (${info.version}) está disponível.`,
      detail: 'Deseja baixar e instalar agora?',
      buttons: ['Sim', 'Não'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        logUpdate('✅ Usuário escolheu baixar a atualização');
        autoUpdater.downloadUpdate();
      } else {
        logUpdate('❌ Usuário escolheu não baixar a atualização');
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    logUpdate('✅ Nenhuma atualização disponível - aplicativo está atualizado');
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:not-available');
    }
  });

  autoUpdater.on('error', (err) => {
    logUpdate('❌ Erro no auto-updater', { error: err.message, stack: err.stack });
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:error', err.message);
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    logUpdate('📥 Progresso do download', progressObj);
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    logUpdate('🎯 Atualização baixada com sucesso!', info);
    if (mainWindowRef) {
      mainWindowRef.webContents.send('update:downloaded', info);
    }

    // Perguntar ao usuário se quer instalar agora
    logUpdate('💬 Mostrando diálogo de instalação...');
    dialog.showMessageBox(mainWindowRef, {
      type: 'info',
      title: 'Atualização Baixada',
      message: 'A atualização foi baixada com sucesso.',
      detail: 'Deseja instalar agora? O aplicativo será reiniciado.',
      buttons: ['Instalar Agora', 'Mais Tarde'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        logUpdate('🚀 Usuário escolheu instalar agora - reiniciando aplicativo...');
        autoUpdater.quitAndInstall();
      } else {
        logUpdate('⏰ Usuário escolheu instalar mais tarde');
      }
    });
  });

  // Verificar atualizações a cada 4 horas (em produção)
  if (app.isPackaged) {
    logUpdate('⏰ Agendando verificação automática a cada 4 horas...');

    setInterval(() => {
      logUpdate('🔄 Verificação automática agendada - verificando atualizações...');
      autoUpdater.checkForUpdates();
      //}, 4 * 60 * 60 * 1000); // 4 horas
    }, 60000); // 4 horas

    // Verificar na primeira execução (com delay para não interferir no startup)
    logUpdate('⏱️ Agendando primeira verificação em 30 segundos...');
    setTimeout(() => {
      logUpdate('🚀 Primeira verificação automática iniciada...');
      autoUpdater.checkForUpdates();
    }, 30000); // 30 segundos após o startup
  }
}

// Handlers IPC para atualizações
ipcMain.handle('update:check', async () => {
  if (autoUpdater && app.isPackaged) {
    try {
      logUpdate('🔍 Verificação manual de atualização solicitada via IPC');
      autoUpdater.checkForUpdates();
      return { success: true, message: 'Verificação de atualização iniciada' };
    } catch (error) {
      logUpdate('❌ Erro ao verificar atualização via IPC', { error: error.message });
      return { success: false, message: error.message };
    }
  } else {
    logUpdate('⚠️ Auto-updater não disponível para verificação manual');
    return { success: false, message: 'Auto-updater não disponível' };
  }
});

ipcMain.handle('update:download', async () => {
  if (autoUpdater && app.isPackaged) {
    try {
      autoUpdater.downloadUpdate();
      return { success: true, message: 'Download de atualização iniciado' };
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
      return { success: false, message: error.message };
    }
  } else {
    return { success: false, message: 'Auto-updater não disponível' };
  }
});

ipcMain.handle('update:install', async () => {
  if (autoUpdater && app.isPackaged) {
    try {
      autoUpdater.quitAndInstall();
      return { success: true, message: 'Instalação de atualização iniciada' };
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
      return { success: false, message: error.message };
    }
  } else {
    return { success: false, message: 'Auto-updater não disponível' };
  }
});
