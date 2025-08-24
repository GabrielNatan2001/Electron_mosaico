const axios = require('axios');
const https = require('https');

const API_CONFIG = {
  baseURL: process.env.VITE_BASE_URL,

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

  timeout: 30000
};

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

apiClient.interceptors.request.use(
  (config) => {
    const lang = process.env.LANG || 'ptbr';
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }
    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function getMosaicosBg(userId, token, proprietarioId) {
  try {
    const endpoint = '/mosaicos/obter-todos-mosaicos';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.get(endpoint, { headers });

    if (response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

async function getMosaicoById(userId, token, proprietarioId, id) {
  try {
    const endpoint = `/mosaicos/${id}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.get(endpoint, { headers });

    if (response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

async function downloadConteudoTessela(userId, token, proprietarioId, url) {
  try {
    const endpoint = `/tesselas/download-conteudo?url=${encodeURIComponent(url)}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.get(endpoint, {
      headers,
      responseType: "arraybuffer"
    });

    return response.data;
  } catch (error) {
    return [];
  }
}

module.exports = {
  API_CONFIG,
  getMosaicosBg,
  getMosaicoById,
  downloadConteudoTessela
};
