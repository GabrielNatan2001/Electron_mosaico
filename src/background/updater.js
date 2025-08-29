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
  }

  setupAutoUpdater() {
    // Configurar o auto updater com as configurações do arquivo
    const config = updaterConfig.updater.platform[process.platform] || updaterConfig.updater.platform.win32;
    
    this.log(`Configurando auto updater para plataforma: ${process.platform}`);
    this.log(`Configuração aplicada:`, 'DEBUG');
    this.log(`- Provider: ${config.provider}`);
    this.log(`- Owner: ${config.owner}`);
    this.log(`- Repo: ${config.repo}`);
    this.log(`- Private: ${config.private}`);
    
    // Aplicar configurações específicas da plataforma
    Object.assign(autoUpdater, config);
    
    // Configurações gerais
    autoUpdater.autoDownload = updaterConfig.notifications.autoDownload;
    autoUpdater.autoInstallOnAppQuit = true; // Instalar quando fechar o app
    
    // Configurações específicas para funcionar sem arquivo .yml
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.forceDevUpdateConfig = false;
    
    // Forçar verificação em desenvolvimento
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      this.log('🔧 Modo desenvolvimento detectado - forçando configurações de teste');
      autoUpdater.forceDevUpdateConfig = true;
      autoUpdater.allowPrerelease = true;
    }
    
    this.log(`Auto updater configurado. Versão atual: ${app.getVersion()}`);
    this.log(`Modo empacotado: ${app.isPackaged}`);
    this.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Eventos do auto updater
    autoUpdater.on('checking-for-update', () => {
      this.log('Verificando atualizações...');
      this.sendToRenderer('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      this.log(`Atualização disponível: ${info.version}`);
      this.isUpdateAvailable = true;
      this.sendToRenderer('update-status', { 
        status: 'available', 
        info: info 
      });
      
      // Mostrar diálogo para o usuário
      this.showUpdateDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      this.log('Nenhuma atualização disponível');
      this.sendToRenderer('update-status', { 
        status: 'not-available', 
        info: info 
      });
    });

    autoUpdater.on('error', (err) => {
      // Ignorar erros de arquivo não encontrado na primeira execução
      if (err.message.includes('app-update.yml') || err.message.includes('dev-app-update.yml') || err.message.includes('ENOENT')) {
        this.log('Primeira execução - arquivo de configuração de atualização não encontrado (normal)', 'INFO');
        this.log('📝 Criando arquivo de configuração de desenvolvimento...', 'INFO');
        
        // Tentar criar arquivo de configuração se não existir
        this.createDevConfigFile();
        return;
      }
      
      this.log(`Erro no auto updater: ${err.message}`, 'ERROR');
      this.sendToRenderer('update-status', { 
        status: 'error', 
        error: err.message 
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.log(`Progresso do download: ${Math.round(progressObj.percent || 0)}%`);
      this.sendToRenderer('update-status', { 
        status: 'downloading', 
        progress: progressObj 
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.log(`Atualização baixada: ${info.version}`);
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
        this.log('Verificando atualizações via IPC...');
        
        // Em desenvolvimento, forçar configurações
        if (!app.isPackaged) {
          this.log('🔧 Modo desenvolvimento - forçando configurações');
          autoUpdater.forceDevUpdateConfig = true;
        }
        
        await autoUpdater.checkForUpdates();
        return { success: true, message: 'Verificação iniciada' };
      } catch (error) {
        this.log(`Erro ao verificar atualizações: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para baixar atualização
    ipcMain.handle('updater:download-update', async () => {
      try {
        if (!this.isUpdateAvailable) {
          return { success: false, message: 'Nenhuma atualização disponível' };
        }
        
        this.log('Iniciando download da atualização...');
        await autoUpdater.downloadUpdate();
        return { success: true, message: 'Download iniciado' };
      } catch (error) {
        this.log(`Erro ao baixar atualização: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para instalar atualização
    ipcMain.handle('updater:install-update', async () => {
      try {
        if (!this.isUpdateDownloaded) {
          return { success: false, message: 'Nenhuma atualização baixada' };
        }
        
        this.log('Instalando atualização...');
        autoUpdater.quitAndInstall();
        return { success: true, message: 'Instalação iniciada' };
      } catch (error) {
        this.log(`Erro ao instalar atualização: ${error.message}`, 'ERROR');
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

    // Handler para obter logs
    ipcMain.handle('updater:get-logs', (event, lines = 100) => {
      return this.getLogs(lines);
    });

    // Handler para teste em desenvolvimento
    ipcMain.handle('updater:test-update', async () => {
      try {
        this.log('🧪 Teste de atualização em desenvolvimento...');
        
        // Configurações específicas para teste
        autoUpdater.forceDevUpdateConfig = true;
        autoUpdater.allowPrerelease = true;
        autoUpdater.allowDowngrade = false;
        
        // Simular verificação
        await autoUpdater.checkForUpdates();
        return { success: true, message: 'Teste de verificação iniciado' };
      } catch (error) {
        this.log(`Erro no teste: ${error.message}`, 'ERROR');
        return { success: false, message: error.message };
      }
    });

    // Handler para verificar atualizações via API do GitHub (sem arquivo .yml)
    ipcMain.handle('updater:check-github-api', async () => {
      try {
        this.log('🌐 Verificando atualizações via API do GitHub...');
        
        // Fazer requisição direta para a API do GitHub
        const response = await fetch('https://api.github.com/repos/GabrielNatan2001/Electron_mosaico/releases/latest');
        const latestRelease = await response.json();
        
        if (latestRelease.tag_name) {
          const currentVersion = app.getVersion();
          const latestVersion = latestRelease.tag_name.replace('v', '');
          
          this.log(`Versão atual: ${currentVersion}`);
          this.log(`Última versão disponível: ${latestVersion}`);
          
          if (this.compareVersions(latestVersion, currentVersion) > 0) {
            this.log(`✅ Nova versão disponível: ${latestVersion}`);
            this.isUpdateAvailable = true;
            
            // Simular evento de atualização disponível
            this.sendToRenderer('update-status', { 
              status: 'available', 
              info: { version: latestVersion, releaseNotes: latestRelease.body }
            });
            
            return { 
              success: true, 
              hasUpdate: true, 
              currentVersion, 
              latestVersion,
              releaseNotes: latestRelease.body
            };
          } else {
            this.log('✅ Aplicação está atualizada');
            return { 
              success: true, 
              hasUpdate: false, 
              currentVersion, 
              latestVersion 
            };
          }
        } else {
          throw new Error('Não foi possível obter informações da release');
        }
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
      this.log('Iniciando download da atualização...');
      await autoUpdater.downloadUpdate();
    } catch (error) {
      this.log(`Erro ao baixar atualização: ${error.message}`, 'ERROR');
      this.sendToRenderer('update-status', { 
        status: 'error', 
        error: error.message 
      });
    }
  }

  installUpdate() {
    try {
      this.log('Instalando atualização...');
      autoUpdater.quitAndInstall();
    } catch (error) {
      this.log(`Erro ao instalar atualização: ${error.message}`, 'ERROR');
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
        this.log('Verificação periódica de atualizações...');
        
        // Verificar atualizações com tratamento de erro
        try {
          autoUpdater.checkForUpdates();
        } catch (error) {
          this.log(`Erro na verificação periódica: ${error.message}`, 'WARN');
        }
      }
    //}, interval * 60 * 1000);
    }, 60000);
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

  // Método para criar arquivo de configuração de desenvolvimento
  createDevConfigFile() {
    try {
      const devConfigPath = path.join(process.cwd(), 'dev-app-update.yml');
      
      if (!fs.existsSync(devConfigPath)) {
        const configContent = `provider: github
owner: ${updaterConfig.github.owner}
repo: ${updaterConfig.github.repo}
private: ${updaterConfig.github.private}
releaseType: release
allowPrerelease: false
allowDowngrade: false
requestHeaders:
  User-Agent: TLM-Mosaico-App-Dev`;
        
        fs.writeFileSync(devConfigPath, configContent);
        this.log(`✅ Arquivo de configuração criado: ${devConfigPath}`, 'INFO');
      } else {
        this.log(`📁 Arquivo de configuração já existe: ${devConfigPath}`, 'INFO');
      }
    } catch (error) {
      this.log(`❌ Erro ao criar arquivo de configuração: ${error.message}`, 'ERROR');
    }
  }

  // Método para comparar versões semânticas
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return 1;
    }
    
    return 0; // Versões iguais
  }
}

module.exports = { AutoUpdater };
