const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();
const { startWatcher, pauseWatcher, resumeWatcher, recarregarMosaico } = require('./background/watcher');
const { AutoUpdater } = require('./background/updater');

// Sistema de logging em arquivo
const logFile = path.join(app.getPath('userData'), 'debug-main.log');
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error('Erro ao escrever no log:', error);
  }
  
  console.log(message);
};

logToFile('🚀 main.js iniciando...');
logToFile(`📁 Log file: ${logFile}`);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let watcherRef = null;
let mainWindowRef = null;
let autoUpdaterRef = null;

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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Permite conexões externas
      nodeIntegration: false,
      contextIsolation: true,
      // FORÇAR DevTools sempre habilitados para debug
      devTools: true,
      // Permitir eval para debug
      allowRunningInsecureContent: true,
    },
  });
  mainWindowRef = mainWindow;

  // Inicializar o auto updater
  autoUpdaterRef = new AutoUpdater(mainWindow);

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

  // Handler para obter versão da aplicação
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  // TEMPORÁRIO: Desabilitar CSP completamente para debug
  logToFile('🔒 Desabilitando CSP para debug...');
  
  // Remover CSP para permitir tudo
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    logToFile('🔒 Removendo CSP...');
    
    // Remover CSP completamente
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    
    logToFile('🔒 CSP removido - permitindo tudo');
    
    callback({ responseHeaders });
  });

  // and load the index.html of the app.
  logToFile('🔄 Carregando index.html...');
  logToFile(`📁 Diretório atual: ${__dirname}`);
  logToFile(`📄 Caminho do index.html: ${path.join(__dirname, 'index.html')}`);
  
  // Verificar se o arquivo existe
  const indexPath = path.join(__dirname, 'index.html');
  logToFile(`🔍 Arquivo index.html existe? ${fs.existsSync(indexPath)}`);
  
  mainWindow.loadFile(indexPath)
    .then(() => {
      logToFile('✅ index.html carregado com sucesso!');
      
      // Verificar se o renderer.js existe
      const rendererPath = path.join(__dirname, 'renderer.js');
      logToFile(`🔍 Arquivo renderer.js existe? ${fs.existsSync(rendererPath)}`);
      
      // Listar arquivos no diretório
      try {
        const files = fs.readdirSync(__dirname);
        logToFile(`📂 Arquivos no diretório: ${files.join(', ')}`);
      } catch (error) {
        logToFile(`❌ Erro ao listar arquivos: ${error.message}`);
      }
    })
    .catch((error) => {
      logToFile(`❌ Erro ao carregar index.html: ${error.message}`);
    });

  // FORÇAR DevTools a abrirem mesmo empacotado
  logToFile('🔧 Configurando DevTools...');
  
  // Aguardar a janela estar pronta
  mainWindow.webContents.on('did-finish-load', () => {
    logToFile('🎯 Janela carregada, tentando abrir DevTools...');
    
    setTimeout(() => {
      try {
        mainWindow.webContents.openDevTools();
        logToFile('✅ DevTools abertos após carregamento');
      } catch (error) {
        logToFile(`❌ DevTools falharam após carregamento: ${error.message}`);
      }
    }, 500);
  });
  
  // Método alternativo: quando DOM estiver pronto
  mainWindow.webContents.on('dom-ready', () => {
    logToFile('🌐 DOM pronto, tentando abrir DevTools...');
    
    setTimeout(() => {
      try {
        if (!mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.openDevTools();
          logToFile('✅ DevTools abertos após DOM pronto');
        }
      } catch (error) {
        logToFile(`❌ DevTools falharam após DOM: ${error.message}`);
      }
    }, 500);
  });
  
  // Método de fallback: atalhos de teclado
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      try {
        mainWindow.webContents.openDevTools();
        logToFile('✅ DevTools abertos via F12');
      } catch (error) {
        logToFile(`❌ DevTools via F12 falhou: ${error.message}`);
      }
    }
  });
  
  logToFile('🔧 DevTools configurados - aguardando eventos da janela');
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  logToFile('🎯 App está pronto, criando janela...');
  
  // Definir o nome da aplicação para o sistema operacional
  app.setName('TLM Mosaico');
  
  // Configuração específica para Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.tlm.mosaico');
    logToFile('🪟 Configuração Windows aplicada');
  }
  
  // Configuração específica para macOS
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'TLM Mosaico',
      applicationVersion: app.getVersion(),
      version: app.getVersion(),
      copyright: '© 2024 TLM Mosaico. Todos os direitos reservados.',
      website: 'https://tlm.com.br'
    });
    logToFile('🍎 Configuração macOS aplicada');
  }
  
  try {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData();
    logToFile('🧹 Cache e storage limpos');
  } catch (error) {
    logToFile(`❌ Erro ao limpar cache: ${error.message}`);
  }
  
  createWindow();

  // Iniciar verificação periódica de atualizações
  if (autoUpdaterRef) {
    autoUpdaterRef.startPeriodicCheck();
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
