const { autoUpdater } = require('electron-updater');
const { app, dialog, ipcMain } = require('electron');
const updaterConfig = require('./updater-config');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isUpdateAvailable = false;
    this.isUpdateDownloaded = false;
    
    this.setupAutoUpdater();
    this.setupIpcHandlers();
  }

  setupAutoUpdater() {
    // Configurar o auto updater com as configurações do arquivo
    const config = updaterConfig.updater.platform[process.platform] || updaterConfig.updater.platform.win32;
    
    // Aplicar configurações específicas da plataforma
    Object.assign(autoUpdater, config);
    
    // Configurações gerais
    autoUpdater.autoDownload = updaterConfig.notifications.autoDownload;
    autoUpdater.autoInstallOnAppQuit = true; // Instalar quando fechar o app
    
    // Eventos do auto updater
    autoUpdater.on('checking-for-update', () => {
      console.log('Verificando atualizações...');
      this.sendToRenderer('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Atualização disponível:', info);
      this.isUpdateAvailable = true;
      this.sendToRenderer('update-status', { 
        status: 'available', 
        info: info 
      });
      
      // Mostrar diálogo para o usuário
      this.showUpdateDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Nenhuma atualização disponível:', info);
      this.sendToRenderer('update-status', { 
        status: 'not-available', 
        info: info 
      });
    });

    autoUpdater.on('error', (err) => {
      console.error('Erro no auto updater:', err);
      this.sendToRenderer('update-status', { 
        status: 'error', 
        error: err.message 
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      console.log('Progresso do download:', progressObj);
      this.sendToRenderer('update-status', { 
        status: 'downloading', 
        progress: progressObj 
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Atualização baixada:', info);
      this.isUpdateDownloaded = true;
      this.sendToRenderer('update-status', { 
        status: 'downloaded', 
        info: info 
      });
      
      // Mostrar diálogo para instalar
      this.showInstallDialog(info);
    });
  }

  setupIpcHandlers() {
    // Handler para verificar atualizações
    ipcMain.handle('updater:check-for-updates', async () => {
      try {
        console.log('Verificando atualizações via IPC...');
        await autoUpdater.checkForUpdates();
        return { success: true, message: 'Verificação iniciada' };
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
        return { success: false, message: error.message };
      }
    });

    // Handler para baixar atualização
    ipcMain.handle('updater:download-update', async () => {
      try {
        if (!this.isUpdateAvailable) {
          return { success: false, message: 'Nenhuma atualização disponível' };
        }
        
        console.log('Iniciando download da atualização...');
        await autoUpdater.downloadUpdate();
        return { success: true, message: 'Download iniciado' };
      } catch (error) {
        console.error('Erro ao baixar atualização:', error);
        return { success: false, message: error.message };
      }
    });

    // Handler para instalar atualização
    ipcMain.handle('updater:install-update', async () => {
      try {
        if (!this.isUpdateDownloaded) {
          return { success: false, message: 'Nenhuma atualização baixada' };
        }
        
        console.log('Instalando atualização...');
        autoUpdater.quitAndInstall();
        return { success: true, message: 'Instalação iniciada' };
      } catch (error) {
        console.error('Erro ao instalar atualização:', error);
        return { success: false, message: error.message };
      }
    });

    // Handler para obter status da atualização
    ipcMain.handle('updater:get-status', () => {
      return {
        isUpdateAvailable: this.isUpdateAvailable,
        isUpdateDownloaded: this.isUpdateDownloaded
      };
    });
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  showUpdateDialog(info) {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Atualização Disponível',
      message: `Uma nova versão (${info.version}) está disponível!`,
      detail: `Versão atual: ${app.getVersion()}\nNova versão: ${info.version}\n\nDeseja baixar e instalar agora?`,
      buttons: ['Sim', 'Agora não', 'Ver detalhes'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      switch (result.response) {
        case 0: // Sim
          this.downloadUpdate();
          break;
        case 2: // Ver detalhes
          this.showUpdateDetails(info);
          break;
        // case 1: Agora não - não faz nada
      }
    });
  }

  showInstallDialog(info) {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Atualização Pronta',
      message: 'A atualização foi baixada e está pronta para instalar!',
      detail: `Versão: ${info.version}\n\nA aplicação será reiniciada para aplicar as mudanças.`,
      buttons: ['Instalar agora', 'Instalar depois'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        this.installUpdate();
      }
    });
  }

  showUpdateDetails(info) {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Detalhes da Atualização',
      message: `Versão ${info.version}`,
      detail: `Data de lançamento: ${info.releaseDate || 'Não informada'}\n\n${info.releaseNotes || 'Nenhuma nota de lançamento disponível.'}`,
      buttons: ['Baixar agora', 'Fechar'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        this.downloadUpdate();
      }
    });
  }

  async downloadUpdate() {
    try {
      console.log('Iniciando download da atualização...');
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
      this.sendToRenderer('update-status', { 
        status: 'error', 
        error: error.message 
      });
    }
  }

  installUpdate() {
    try {
      console.log('Instalando atualização...');
      autoUpdater.quitAndInstall();
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
      this.sendToRenderer('update-status', { 
        status: 'error', 
        error: error.message 
      });
    }
  }

  // Método para verificar atualizações periodicamente
  startPeriodicCheck(intervalMinutes = null) {
    // Usar intervalo da configuração se não especificado
    const interval = intervalMinutes || updaterConfig.notifications.checkInterval;
    
    setInterval(() => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        console.log('Verificação periódica de atualizações...');
        autoUpdater.checkForUpdates();
      }
    //}, interval * 60 * 1000);
    }, 60000);
  }
}

module.exports = { AutoUpdater };
