// Configuração alternativa para variáveis de ambiente
// Este arquivo pode ser usado caso o webpack não esteja funcionando corretamente

// Tenta obter as variáveis de ambiente do webpack
const getEnvVar = (key, defaultValue) => {
  try {
    // Tenta usar import.meta.env (webpack)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    
    // Fallback para process.env (Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    
    // Fallback para window.__ENV__ (se definido)
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
      return window.__ENV__[key];
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Erro ao ler variável de ambiente ${key}:`, error);
    return defaultValue;
  }
};

// Configurações com fallbacks
export const env = {
  VITE_BASE_URL: getEnvVar('VITE_BASE_URL', 'http://localhost:3000/api'),
  VITE_ENVIRONMENT: getEnvVar('VITE_ENVIRONMENT', 'development'),
  VITE_DEBUG: getEnvVar('VITE_DEBUG', 'false'),
  VITE_LOG_LEVEL: getEnvVar('VITE_LOG_LEVEL', 'info'),
};

// Função para obter configuração
export const getEnv = (key) => {
  return env[key] || null;
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = () => {
  return env.VITE_ENVIRONMENT === 'development';
};

// Função para verificar se debug está habilitado
export const isDebugEnabled = () => {
  return env.VITE_DEBUG === 'true';
};

// Log das configurações (apenas em desenvolvimento)
if (isDevelopment() && isDebugEnabled()) {
  console.log('Configurações de ambiente carregadas:', env);
}
