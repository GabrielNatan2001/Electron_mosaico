// Detecta se estamos no Electron
const isElectron = window && window.process && window.process.type || process.env.IS_ELECTRON;

// Função para corrigir caminhos de ícones vindos da API
export const fixIconPath = (iconPath) => {
  if (!iconPath) return null;
  
  // Se já é um caminho relativo correto, retorna como está
  if (iconPath.startsWith('./iconesGerais/')) {
    return iconPath;
  }
  
  // Se é um caminho absoluto incorreto, corrige
  if (iconPath.startsWith('/iconesGerais/')) {
    if (isElectron) {
      if (window && window.electronAPI && window.electronAPI.getResourcesPath) {
        // Electron empacotado - usar electronAPI.getResourcesPath
        const resourcesPath = window.electronAPI.getResourcesPath();
        if (resourcesPath) {
          return `file://${resourcesPath}/iconesGerais/${iconPath.replace('/iconesGerais/', '')}`;
        }
      }
      // Desenvolvimento - usar caminho relativo
      return iconPath.replace('/iconesGerais/', './iconesGerais/');
    }
    return iconPath; // Mantém para desenvolvimento
  }
  
  // Se é um caminho completo com http/https, retorna como está
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return iconPath;
  }
  
  // Para outros casos, assume que é um ícone personalizado
  return iconPath;
};

// Função para obter o caminho correto dos ícones padrão
export const getIconPath = (iconName) => {
  if (isElectron) {
    // Para Electron empacotado, usar electronAPI.getResourcesPath
    if (window && window.electronAPI && window.electronAPI.getResourcesPath) {
      // Electron empacotado - usar electronAPI.getResourcesPath
      const resourcesPath = window.electronAPI.getResourcesPath();
      if (resourcesPath) {
        return `file://${resourcesPath}/iconesGerais/${iconName}`;
      }
    }
    // Desenvolvimento - usar caminho relativo
    return `./iconesGerais/${iconName}`;
  }
  return `/iconesGerais/${iconName}`;
};
