// Configurações centralizadas da aplicação
import { env, isDevelopment, isDebugEnabled } from './env.js';

export const config = {
  // Configurações da API
  api: {
    baseURL: env.VITE_BASE_URL,
    timeout: 10000,
  },
  
  // Configurações da aplicação
  app: {
    name: 'Mosaico',
    version: '1.0.0',
    environment: env.VITE_ENVIRONMENT,
  },
  
  // Configurações de debug
  debug: {
    enabled: isDebugEnabled(),
    logLevel: env.VITE_LOG_LEVEL,
  }
};

// Função para obter configuração específica
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Log das configurações carregadas (apenas em desenvolvimento)
if (isDevelopment() && isDebugEnabled()) {
  console.log('Configurações carregadas:', config);
}
