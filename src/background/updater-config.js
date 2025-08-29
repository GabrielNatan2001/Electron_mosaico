// Configuração para o auto updater
// Este arquivo deve ser configurado com as informações do seu repositório GitHub

module.exports = {
  // Configurações do GitHub
  github: {
    owner: 'GabrielNatan2001',
    repo: 'Electron_mosaico',
    private: false,
  },
  
  // Configurações do auto updater
  updater: {
    // Configurações específicas por plataforma
    platform: {
      win32: {
        provider: 'github',
        owner: 'GabrielNatan2001',
        repo: 'Electron_mosaico',
        private: false,
        releaseType: 'release',
        allowPrerelease: false,
        allowDowngrade: false,
        requestHeaders: {
          'User-Agent': 'TLM-Mosaico-App'
        }
      },
      darwin: {
        provider: 'github',
        owner: 'GabrielNatan2001',
        repo: 'Electron_mosaico',
        private: false,
        releaseType: 'release',
        allowPrerelease: false,
        allowDowngrade: false,
        requestHeaders: {
          'User-Agent': 'TLM-Mosaico-App'
        }
      },
      linux: {
        provider: 'github',
        owner: 'GabrielNatan2001',
        repo: 'Electron_mosaico',
        private: false,
        releaseType: 'release',
        allowPrerelease: false,
        allowDowngrade: false,
        requestHeaders: {
          'User-Agent': 'TLM-Mosaico-App'
        }
      }
    }
  },
  
  // Configurações de notificação
  notifications: {
    checkInterval: 120, // Verificar a cada 2 horas (em minutos)
    showProgress: true, // Mostrar barra de progresso
    autoDownload: false, // Não baixar automaticamente
    autoInstall: false, // Não instalar automaticamente
  },
  
  // Configurações de logging
  logging: {
    level: 'info',
    file: 'updater.log',
    maxSize: '10m',
    maxFiles: 5
  }
};
