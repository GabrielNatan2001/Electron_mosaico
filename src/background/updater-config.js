// Configuração para o electron-updater
const { autoUpdater } = require('electron-updater');

// Configurações padrão do auto-updater
const configureAutoUpdater = () => {
  if (!autoUpdater) return;

  // Configurações básicas
  autoUpdater.autoDownload = false; // Não baixar automaticamente
  autoUpdater.autoInstallOnAppQuit = true; // Instalar quando o app fechar
  
  // Configurações de log
  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';
  
  // Configurações específicas por plataforma
  if (process.platform === 'win32') {
    // Windows: usar Squirrel para instalação
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;
  } else if (process.platform === 'darwin') {
    // macOS: usar Sparkle para instalação
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;
  } else {
    // Linux: configurações padrão
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;
  }

  // Configurações de rede (opcional)
  autoUpdater.requestHeaders = {
    'User-Agent': 'TLM-Mosaico-Updater'
  };

  // Timeout para operações de rede
  autoUpdater.timeout = 30000; // 30 segundos

  return autoUpdater;
};

module.exports = {
  configureAutoUpdater
};
