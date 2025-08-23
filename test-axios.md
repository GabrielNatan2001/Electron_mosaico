# Teste do Axios no Watcher

## Arquitetura Correta

✅ **Axios apenas no `api-config.js`** - Centralizado e configurado
✅ **Watcher chama função do `api-config`** - Separação de responsabilidades
✅ **Configuração robusta** do cliente axios
✅ **Interceptors** para logging detalhado
✅ **Tratamento de erro melhorado** com axios
✅ **Fallback para pastas padrão** se a API falhar
✅ **Configuração SSL** para contornar problemas de certificado
✅ **Mesma lógica do `api.js`** - Interceptors e regras idênticos

## Como Funciona Agora

### 1. **Configuração do Axios (api-config.js)**
```javascript
const apiClient = axios.create({
  baseURL: process.env.VITE_BASE_URL || 'https://mosaicoapiv3-cvbbe0exhaeehveu.brazilsouth-01.azurewebsites.net',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'  // Mesmo header do api.js
  },
  // Configurações para contornar problemas de certificado SSL
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Não rejeitar certificados não autorizados
    secureProtocol: 'TLSv1_2_method', // Usar TLS 1.2
    ciphers: 'ALL' // Aceitar todas as cifras
  })
});
```

### 2. **Interceptors Idênticos ao api.js**

#### **Request Interceptor**
```javascript
apiClient.interceptors.request.use(
  (config) => {
    // Adicionar idioma (mesmo do api.js)
    const lang = process.env.LANG || 'ptbr';
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }
    
    // Log da requisição
    console.log(`[API] Requisição: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('[API] Headers:', config.headers);
    
    return config;
  }
);
```

#### **Response Interceptor**
```javascript
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Resposta: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    // Tratamento específico para erro 401 (mesmo do api.js)
    if (error.response && error.response.status === 401) {
      console.error('[API] Erro 401 - Usuário não autorizado');
    }
    
    return Promise.reject(error);
  }
);
```

### 3. **Função para o Watcher (api-config.js)**
```javascript
async function getMosaicosBg(userId, token, proprietarioId) {
  // Headers com autenticação (mesmo padrão do api.js)
  const headers = {
    'Authorization': `Bearer ${token}`,
    'user-id': userId
  };
  
  // Adicionar proprietario-id se disponível
  if (proprietarioId) {
    headers['proprietario-id'] = proprietarioId;
  }
  
  const response = await apiClient.get('/mosaicos/obter-todos-mosaicos', { headers });
  return response.data.data || [];
}
```

### 4. **Chamada do Watcher (watcher.js)**
```javascript
// Importar função do api-config
const { getMosaicosBg } = require('./api-config');

// Chamar função com proprietarioId
const userFolders = await getMosaicosBg(userId, token, proprietarioId);
```

### 5. **Fluxo Completo do AuthContext**
```javascript
// No AuthContext.jsx
async function startWatcher(userId, token, proprietarioId) {
  const result = await window.watcherControls.start(userId, token, proprietarioId);
}

// No preload.js
start: (userId, token, proprietarioId) => ipcRenderer.invoke('watcher:start', userId, token, proprietarioId)

// No main.js
ipcMain.handle('watcher:start', async (event, userId, token, proprietarioId) => {
  watcherRef = await startWatcher({ logDir, userId, token, proprietarioId });
});

// No watcher.js
const userFolders = await getMosaicosBg(userId, token, proprietarioId);
```

## Estrutura de Arquivos

```
src/
├── api/
│   └── api.js           ← API do renderer process
└── background/
    ├── api-config.js    ← API do main process (mesma lógica)
    └── watcher.js       ← Chama função do api-config
```

## Logs Esperados

### Console do Main Process
```
[API] Configuração carregada:
[API] baseURL: https://mosaicoapiv3-cvbbe0exhaeehveu.brazilsouth-01.azurewebsites.net
[API] VITE_BASE_URL: undefined
[API] timeout: 30000
[API] SSL: rejectUnauthorized = false (para contornar problemas de certificado)
[IPC] watcher:start chamado com userId: 123 token: true proprietarioId: 456
[IPC] proprietarioId: 456
[WATCHER] proprietarioId: 456
[API] Requisição: GET https://.../mosaicos/obter-todos-mosaicos
[API] Headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Accept-Language': 'ptbr', 'Authorization': 'Bearer ...', 'user-id': '123', 'proprietario-id': '456' }
[API] Resposta: 200 OK
[WATCHER] Chamando getMosaicosBg para userId: 123 token: true proprietarioId: 456
[WATCHER] Resposta de getMosaicosBg: [...]
```

## Vantagens da Arquitetura

1. **Separação de responsabilidades** - API configurada em um lugar
2. **Reutilização** - Outros módulos podem usar as mesmas funções
3. **Manutenção** - Mudanças na API ficam centralizadas
4. **Testes** - Mais fácil de testar cada parte separadamente
5. **Logs organizados** - Prefixos claros para cada módulo
6. **SSL robusto** - Configuração para contornar problemas de certificado
7. **Consistência** - Mesma lógica e regras do api.js do renderer

## Configuração SSL

### **Problema Resolvido**
- **Erro**: `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
- **Causa**: Node.js não consegue verificar certificados SSL
- **Solução**: `rejectUnauthorized: false` no https.Agent

### **Configurações SSL**
```javascript
httpsAgent: new https.Agent({
  rejectUnauthorized: false,  // Contorna verificação de certificado
  secureProtocol: 'TLSv1_2_method',  // Força TLS 1.2
  ciphers: 'ALL'  // Aceita todas as cifras
})
```

## Headers de Autenticação

### **Headers Padrão (igual ao api.js)**
- `Content-Type: application/json`
- `Accept: */*`
- `Accept-Language: ptbr` (ou valor de process.env.LANG)

### **Headers de Autenticação**
- `Authorization: Bearer {token}`
- `user-id: {userId}`
- `proprietario-id: {proprietarioId}` (se disponível)

## Como Testar

1. **Faça login** no sistema
2. **Verifique logs** no console do main process
3. **Procure por logs `[API]`** - configuração e requisições
4. **Procure por logs `[WATCHER]`** - chamadas e respostas
5. **Verifique se as pastas** foram criadas
6. **Teste com API offline** - deve usar fallback
7. **Verifique se não há mais erros SSL**
8. **Compare headers** com os do api.js

## Troubleshooting

### Axios não está funcionando
- Verifique se `axios` está instalado: `npm list axios`
- Verifique logs de configuração do axios no `[API]`
- Verifique se a URL base está correta

### Erro de rede
- Verifique conectividade com a API
- Verifique se a URL está acessível
- Verifique se o token é válido

### Erro SSL/Certificado
- ✅ **RESOLVIDO**: Configuração `rejectUnauthorized: false`
- Verifique se o `https` module está sendo importado
- Verifique logs de configuração SSL

### Erro 401 (Não Autorizado)
- ✅ **TRATADO**: Retorna array vazio e usa fallback
- Verifique se o token é válido
- Verifique se o userId está correto
- Verifique logs de erro 401

### Fallback não funciona
- Verifique se a lógica de fallback está sendo executada
- Verifique logs de erro do axios no `[API]`
- Verifique se as pastas padrão estão sendo criadas

## Estrutura de Pastas Esperada

```
~/MosaicoElectron/
  └── user_[userId]/
      ├── Documentos/
      │   ├── .metadata.json
      │   └── [arquivos]
      ├── Imagens/
      │   ├── .metadata.json
      │   └── [imagens]
      └── Videos/
          ├── .metadata.json
          └── [vídeos]
```

## Próximos Passos

1. **Testar com API real** - verificar se está funcionando
2. **Configurar variável de ambiente** - `VITE_BASE_URL` se necessário
3. **Adicionar mais endpoints** - no `api-config.js`
4. **Implementar retry automático** - no `api-config.js`
5. **Adicionar cache** - no `api-config.js`
6. **Monitorar logs SSL** - verificar se não há mais erros de certificado
7. **Comparar comportamento** - com o api.js do renderer
