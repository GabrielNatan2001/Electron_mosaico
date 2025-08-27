const axios = require('axios');
const https = require('https');

const API_CONFIG = {
  baseURL: process.env.VITE_BASE_URL || 'http://localhost:5000',

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
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.get(url, {
      headers,
      responseType: "arraybuffer"
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

async function downloadConteudoTesselaBackground(userId, token, proprietarioId, url) {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.get(url, {
      headers,
      responseType: "arraybuffer"
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

async function addTessela(userId, token, proprietarioId, request) {
  try {
    const endpoint = `/tesselas`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId,
      "Content-Type": "multipart/form-data",
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.post(endpoint, request, { headers });
    if (response.data.data) {
      return response.data.data;
    } else {
      return response.data;
    }
  } catch (error) {
    return [];
  }
}

async function addMosaico(userId, token, proprietarioId, request) {
  try {
    const endpoint = `/mosaicos`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    const response = await apiClient.post(endpoint, request, { headers });
    if (response.data.data) {
      return response.data.data;
    } else {
      return response.data;
    }
  } catch (error) {
    return error;
  }
}

async function atualizarConteudoTessela(userId, token, proprietarioId, tesselaId, conteudoId, nomeConteudo, tipo, arquivo) {
  try {
    const endpoint = `/tesselas/conteudo`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'user-id': userId
    };
    // Adicionar proprietario-id no header
    if (proprietarioId) {
      headers['proprietario-id'] = proprietarioId;
    }

    // Criar dados do formulário manualmente
    const formData = new URLSearchParams();
    formData.append('TesselaId', tesselaId);
    formData.append('ConteudoId', conteudoId);
    formData.append('NomeConteudo', nomeConteudo);
    formData.append('Tipo', tipo);

    // Se tiver arquivo, usar multipart/form-data
    if (arquivo && arquivo.buffer) {
      // Criar FormData usando Buffer diretamente
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
      headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;

      // Construir o body como Buffer para preservar os dados binários
      const parts = [];

      // Adicionar campos de texto
      const addField = (name, value) => {
        parts.push(Buffer.from(`--${boundary}\r\n`));
        parts.push(Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n`));
        parts.push(Buffer.from(`${value}\r\n`));
      };

      addField('TesselaId', tesselaId);
      addField('ConteudoId', conteudoId);
      addField('NomeConteudo', nomeConteudo);
      addField('Tipo', tipo);

      // Adicionar arquivo
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="Arquivo"; filename="${arquivo.name}"\r\n`));
      parts.push(Buffer.from(`Content-Type: ${arquivo.type}\r\n\r\n`));
      parts.push(arquivo.buffer);
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      // Concatenar todos os buffers
      const body = Buffer.concat(parts);

      const response = await apiClient.put(endpoint, body, {
        headers,
        transformRequest: [() => body], // Evitar transformação automática
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } else {
      // Para dados sem arquivo, usar application/x-www-form-urlencoded
      headers['Content-Type'] = 'application/x-www-form-urlencoded';

      const response = await apiClient.put(endpoint, formData.toString(), { headers });

      if (response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    }

  } catch (error) {
    console.error('[API] Erro ao atualizar conteúdo da tessela:', error);
    return null;
  }
}

module.exports = {
  API_CONFIG,
  getMosaicosBg,
  getMosaicoById,
  downloadConteudoTessela,
  addTessela,
  addMosaico,
  atualizarConteudoTessela,
  downloadConteudoTesselaBackground
};
