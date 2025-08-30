const { autoUpdater } = require('electron-updater');
const { app, dialog, ipcMain } = require('electron');
const updaterConfig = require('./updater-config');
const fs = require('fs');
const path = require('path');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isUpdateAvailable = false;
    this.isUpdateDownloaded = false;

    // Configurar sistema de logs
    this.setupLogging();

    this.setupAutoUpdater();
    this.setupIpcHandlers();
    
         // IMPORTANTE: Verificar atualizações na inicialização
     this.log('🚀 Verificação inicial de atualizações...', 'INFO');
     setTimeout(async () => {
       try {
         // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
         await autoUpdater.checkForUpdates();
         this.log('✅ Verificação inicial concluída');
       } catch (error) {
         this.log(`❌ Erro na verificação inicial: ${error.message}`, 'WARN');
       }
     }, 2000); // Aguardar 2 segundos para a aplicação inicializar
    
    // Iniciar verificação periódica (a cada 4 horas)
    this.startPeriodicCheck();
  }

  setupAutoUpdater() {
    this.log(`Configurando auto updater para plataforma: ${process.platform}`);

    // IMPORTANTE: Configurar para usar o .yml gerado pelo electron-builder
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'GabrielNatan2001',
      repo: 'Electron_mosaico',
      private: false,
      releaseType: 'release'
    });

    // Configurações gerais
    autoUpdater.autoDownload = false; // Download manual
    autoUpdater.autoInstallOnAppQuit = false; // Instalação manual

    // Configurações específicas
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;

    this.log(`Auto updater configurado. Versão atual: ${app.getVersion()}`);
    this.log(`Modo empacotado: ${app.isPackaged}`);
    this.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // IMPORTANTE: Configurações específicas para desenvolvimento
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      this.log('🔧 Modo desenvolvimento detectado');
    } else {
      this.log('🏭 Modo produção detectado');
    }

    // Eventos do auto updater
    autoUpdater.on('checking-for-update', () => {
      this.log('Verificando atualizações...');
      this.sendToRenderer('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      this.log(`✅ Atualização disponível: ${info.version}`);
      
      // Definir flags corretamente
      this.isUpdateAvailable = true;
      this.isUpdateDownloaded = false; // Reset download status
      
      this.sendToRenderer('update-status', {
        status: 'available',
        info: info
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      this.log('✅ Aplicação está atualizada');
      
      // Limpar flags quando não há atualização
      this.isUpdateAvailable = false;
      this.isUpdateDownloaded = false;
      
      this.sendToRenderer('update-status', {
        status: 'not-available',
        info: info
      });
    });

    autoUpdater.on('error', (err) => {
      this.log(`❌ Erro no auto updater: ${err.message}`, 'ERROR');
      this.sendToRenderer('update-status', {
        status: 'error',
        error: err.message
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.log(`📥 Progresso do download: ${Math.round(progressObj.percent || 0)}%`);
      this.sendToRenderer('update-status', {
        status: 'downloading',
        progress: progressObj
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.log(`✅ Atualização baixada: ${info.version}`);
      
      // Definir flags corretamente
      this.isUpdateAvailable = false; // Reset available status
      this.isUpdateDownloaded = true;
      
      this.sendToRenderer('update-status', {
        status: 'downloaded',
        info: info
      });
    });
  }

  setupIpcHandlers() {
    // Handler para verificar atualizações
    ipcMain.handle('updater:check-for-updates', async () => {
      try {
        this.log('🔍 Verificando atualizações via IPC...');

        // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
        await autoUpdater.checkForUpdates();
        
        this.log('✅ Verificação de atualizações iniciada');
        return { success: true, message: 'Verificação iniciada' };
      } catch (error) {
        this.log(`❌ Erro ao verificar atualizações: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para baixar atualização
    ipcMain.handle('updater:download-update', async () => {
      try {
        if (!this.isUpdateAvailable) {
          return { success: false, message: 'Nenhuma atualização disponível' };
        }

        this.log('⬇️ Iniciando download da atualização...');

        // IMPORTANTE: Enviar status de downloading imediatamente
        this.sendToRenderer('update-status', {
          status: 'downloading',
          message: 'Baixando atualização...'
        });

        // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
        try {
          this.log('📥 Baixando via electron-updater...', 'INFO');
          
          await autoUpdater.downloadUpdate();
          
          this.log('✅ Download via electron-updater concluído!');
          return { success: true, message: 'Download concluído' };
          
        } catch (downloadError) {
          this.log(`❌ Erro no download: ${downloadError.message}`, 'ERROR');
          
          // Enviar status de erro para o renderer
          this.sendToRenderer('update-status', {
            status: 'error',
            error: downloadError.message
          });
          
          return { success: false, message: downloadError.message };
        }
      } catch (error) {
        this.log(`❌ Erro ao baixar atualização: ${error.message}`, 'ERROR');
        
        // Enviar status de erro para o renderer
        this.sendToRenderer('update-status', {
          status: 'error',
          error: error.message
        });
        
        return { success: false, message: error.message };
      }
    });

        // Handler para instalar atualização
    ipcMain.handle('updater:install-update', async () => {
      try {
        if (!this.isUpdateDownloaded) {
          return { success: false, message: 'Nenhuma atualização baixada' };
        }

        this.log('🚀 Instalando atualização...');

        // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
        try {
          this.log('📦 Instalando via electron-updater...', 'INFO');
          
          // IMPORTANTE: Enviar mensagem para o renderer
          this.sendToRenderer('update-status', {
            status: 'installing',
            message: 'Instalação em andamento... A aplicação será fechada para aplicar as atualizações.'
          });
          
          // Aguardar um pouco para a mensagem ser exibida
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // ✅ USAR O MÉTODO PADRÃO
          await autoUpdater.quitAndInstall();
          
          return { success: true, message: 'Instalação iniciada' };
          
        } catch (installError) {
          this.log(`❌ Erro na instalação: ${installError.message}`, 'ERROR');
          return { success: false, message: installError.message };
        }
      } catch (error) {
        this.log(`❌ Erro ao instalar atualização: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para obter status da atualização
    ipcMain.handle('updater:get-status', async () => {
      try {
        // Verificar se realmente há uma atualização disponível
        // Se não há, limpar as flags
        if (this.isUpdateAvailable || this.isUpdateDownloaded) {
          // Verificar se ainda há uma atualização disponível
          try {
            // Fazer uma verificação rápida
            const updateInfo = await autoUpdater.checkForUpdates();
            
            // Se não há atualização, limpar as flags
            if (!updateInfo || !updateInfo.updateInfo) {
              this.log('🧹 Limpando flags de atualização - nenhuma atualização disponível');
              this.isUpdateAvailable = false;
              this.isUpdateDownloaded = false;
            }
          } catch (error) {
            this.log(`❌ Erro ao verificar status real: ${error.message}`, 'WARN');
            // Em caso de erro, manter o status atual
          }
        }
        
        return {
          isUpdateAvailable: this.isUpdateAvailable,
          isUpdateDownloaded: this.isUpdateDownloaded,
          version: app.getVersion()
        };
      } catch (error) {
        this.log(`❌ Erro ao obter status: ${error.message}`, 'ERROR');
        return {
          isUpdateAvailable: false,
          isUpdateDownloaded: false,
          version: app.getVersion(),
          error: error.message
        };
      }
    });

    // Handler para limpar flags de atualização
    ipcMain.handle('updater:clear-flags', () => {
      try {
        this.clearUpdateFlags();
        this.log('✅ Flags de atualização limpas via IPC');
        return { success: true, message: 'Flags limpas com sucesso' };
      } catch (error) {
        this.log(`❌ Erro ao limpar flags: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para obter logs
    ipcMain.handle('updater:get-logs', (event, lines = 100) => {
      return this.getLogs(lines);
    });





    // Handler para verificar atualizações via API do GitHub (sem arquivo .yml)
    ipcMain.handle('updater:check-github-api', async () => {
      try {
        this.log('🌐 Verificando atualizações via API do GitHub...');

        // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
        await autoUpdater.checkForUpdates();
        
        this.log('✅ Verificação via API concluída');
        return { success: true, message: 'Verificação concluída' };
      } catch (error) {
        this.log(`❌ Erro ao verificar via API: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }



  // Método para verificar atualizações periodicamente
  startPeriodicCheck(intervalMinutes = null) {
    // Usar intervalo da configuração se não especificado
    const interval = intervalMinutes || updaterConfig.notifications.checkInterval;

    setInterval(async () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.log('🔄 Verificação periódica via electron-updater...');

        // ✅ USAR O PADRÃO DO ELECTRON-UPDATER
        try {
          await autoUpdater.checkForUpdates();
          this.log('✅ Verificação periódica concluída');
        } catch (error) {
          this.log(`❌ Erro na verificação periódica: ${error.message}`, 'WARN');
        }
      }
    }, 60000 * 240); // 4 horas (240 minutos)
  }



  // Sistema de logging
  setupLogging() {
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFile = path.join(this.logDir, 'updater.log');

    // Criar diretório de logs se não existir
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] [AutoUpdater] ${message}\n`;

    // Log no console
    console.log(logEntry.trim());

    // Salvar no arquivo
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Erro ao salvar log:', error);
    }
  }

  // Método para limpar flags de atualização
  clearUpdateFlags() {
    this.log('🧹 Limpando flags de atualização');
    this.isUpdateAvailable = false;
    this.isUpdateDownloaded = false;
  }

  // Método para obter logs
  getLogs(lines = 100) {
    try {
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        const linesArray = content.split('\n').filter(line => line.trim());
        return linesArray.slice(-lines);
      }
      return [];
    } catch (error) {
      this.log(`Erro ao ler logs: ${error.message}`, 'ERROR');
      return [];
    }
  }







  
}

module.exports = { AutoUpdater };
