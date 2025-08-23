const axios = require('axios');
const https = require('https');

// Configuração da API para o watcher
// Este arquivo contém as configurações e funções para comunicação com a API

const API_CONFIG = {
  // URL base da API - usando URL válida como fallback
  baseURL: process.env.VITE_BASE_URL || 'https://mosaicoapiv3-cvbbe0exhaeehveu.brazilsouth-01.azurewebsites.net',
  
  // Endpoints
  endpoints: {
    folders: '/api/folders',
    userFolders: '/api/user/folders',
    mosaicoFolders: '/api/mosaico/folders'
  },
  
  // Headers padrão
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  
  // Timeout da requisição (em ms)
  timeout: 30000
};

// Criar instância do axios para o watcher
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.defaultHeaders,
  // Configurações para contornar problemas de certificado SSL
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Não rejeitar certificados não autorizados
    secureProtocol: 'TLSv1_2_method', // Usar TLS 1.2
    ciphers: 'ALL' // Aceitar todas as cifras
  })
});

// Log da configuração do axios
console.log('[API] Configuração carregada:');
console.log('[API] baseURL:', API_CONFIG.baseURL);
console.log('[API] VITE_BASE_URL:', process.env.VITE_BASE_URL);
console.log('[API] timeout:', API_CONFIG.timeout);
console.log('[API] SSL: rejectUnauthorized = false (para contornar problemas de certificado)');

// Interceptor para requisições (mesma lógica do api.js)
apiClient.interceptors.request.use(
  (config) => {
    // Adicionar idioma se disponível
    const lang = process.env.LANG || 'ptbr';
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }
    
    // Adicionar headers de autenticação se disponíveis
    // Nota: No main process, não temos acesso ao sessionStorage
    // Os headers serão passados diretamente nas chamadas
    
    console.log(`[API] Requisição: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('[API] Headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas (mesma lógica do api.js)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Resposta: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error('[API] Erro na resposta:', error);
    
    // Tratamento específico para erro 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      console.error('[API] Erro 401 - Usuário não autorizado');
      // Nota: No main process, não podemos redirecionar para login
      // Mas podemos logar o erro e retornar array vazio para usar fallback
    }
    
    if (error.response) {
      console.error('[API] Status:', error.response.status);
      console.error('[API] Dados:', error.response.data);
    } else if (error.request) {
      console.error('[API] Requisição sem resposta:', error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Função para buscar mosaicos do usuário na API
 * @param {string} userId - ID do usuário
 * @param {string} token - Token de autenticação
 * @returns {Promise<Array>} - Lista de mosaicos
 */
async function getMosaicosBg(userId, token, proprietarioId) {
  try {
    console.log('[API] getMosaicosBg chamado para userId:', userId);
    console.log('[API] baseURL:', API_CONFIG.baseURL);
    
    // Endpoint correto para buscar mosaicos
    const endpoint = '/mosaicos/obter-todos-mosaicos';
    console.log('[API] endpoint completo:', `${API_CONFIG.baseURL}${endpoint}`);
    
    // Configurar headers com autenticação (mesma lógica do api.js)
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    
    // Adicionar proprietario-id se disponível (opcional)
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }
    
    console.log('[API] Headers da requisição:', headers);
    
    const response = await apiClient.get(endpoint, { headers });
    
    console.log('[API] response recebida:', response);
    
    if (response.data.data) {
      console.warn('[API] Resposta da API:', response);
      return response.data.data;
    } else {
      console.warn('[API] Resposta da API não contém dados válidos:', response);
      return [];
    }
  } catch (error) {
    console.error('[API] Erro ao buscar mosaicos do usuário:', error);
    
    // Se for erro de rede ou 401, retornar array vazio para usar fallback
    if (error.code === 'ENOTFOUND' || 
        error.message.includes('fetch failed') || 
        error.code === 'ECONNREFUSED' ||
        (error.response && error.response.status === 401)) {
      console.warn('[API] Erro de rede ou autenticação, usando fallback local');
      return [];
    }
    
    return [];
  }
}

module.exports = {
  API_CONFIG,
  getMosaicosBg
};
