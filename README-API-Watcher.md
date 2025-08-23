# Watcher com Integração de API

## Visão Geral

O watcher agora possui integração com API para criar pastas automaticamente baseadas em dados externos. Quando um usuário faz login, o sistema:

1. Inicia o watcher para o usuário específico
2. Busca dados da API para criar pastas
3. Cria as pastas na estrutura `MosaicoElectron/user_[userId]/`
4. Monitora mudanças nessas pastas

## Funcionalidades

### ✅ **Criação Automática de Pastas**
- Pastas são criadas automaticamente baseadas na resposta da API
- Estrutura hierárquica baseada nos dados recebidos
- Metadados salvos em arquivo `.metadata.json` em cada pasta

### ✅ **Fallback Inteligente**
1. **Primeiro**: Tenta buscar pastas específicas do usuário
2. **Segundo**: Se falhar, busca pastas padrão do sistema
3. **Terceiro**: Se falhar, usa pastas mockadas como fallback

### ✅ **Logs Detalhados**
- Logs específicos para operações da API
- Rastreamento de erros e sucessos
- Logs por usuário em arquivos separados

## Configuração da API

### Arquivo: `src/background/api-config.js`

```javascript
const API_CONFIG = {
  baseURL: 'https://mosaicoapiv3-cvbbe0exhaeehveu.brazilsouth-01.azurewebsites.net',
  endpoints: {
    folders: '/api/folders',
    userFolders: '/api/user/folders',
    mosaicoFolders: '/api/mosaico/folders'
  }
};
```

### Endpoints Esperados

#### 1. Pastas do Usuário
```
GET /api/user/folders/{userId}
Authorization: Bearer {token}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "nome": "Documentos",
      "descricao": "Pasta para documentos importantes",
      "tipo": "documento",
      "permissao": "rw"
    }
  ]
}
```

#### 2. Pastas Padrão
```
GET /api/folders
Authorization: Bearer {token}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "nome": "Imagens",
      "descricao": "Pasta para imagens e fotos",
      "categoria": "midia"
    }
  ]
}
```

## Estrutura de Pastas Criada

```
~/MosaicoElectron/
  └── user_123/
      ├── Documentos/
      │   ├── .metadata.json
      │   └── [arquivos do usuário]
      ├── Imagens/
      │   ├── .metadata.json
      │   └── [imagens do usuário]
      ├── Videos/
      │   ├── .metadata.json
      │   └── [vídeos do usuário]
      └── Projetos/
          ├── .metadata.json
          └── [projetos do usuário]
```

## Arquivo de Metadados

Cada pasta criada contém um arquivo `.metadata.json`:

```json
{
  "nome": "Documentos",
  "descricao": "Pasta para documentos importantes",
  "dataCriacao": "2024-01-15T10:30:00.000Z",
  "criadoPor": "123",
  "fonte": "API",
  "tipo": "documento",
  "permissao": "rw"
}
```

## Como Implementar

### 1. **Configurar Endpoints da API**
Edite `src/background/api-config.js` com seus endpoints reais.

### 2. **Implementar Resposta da API**
Sua API deve retornar dados no formato esperado:
```json
{
  "success": true,
  "data": [
    {
      "nome": "NomeDaPasta",
      "descricao": "Descrição da pasta",
      "propriedades_adicionais": "valor"
    }
  ]
}
```

### 3. **Testar a Integração**
1. Faça login no sistema
2. Verifique os logs no console
3. Verifique se as pastas foram criadas
4. Verifique os arquivos de metadados

## Logs de Debug

### Console do Renderer
```
Tentando iniciar watcher para userId: 123
Token disponível: true
Chamando watcherControls.start...
Watcher iniciado com sucesso para o usuário: 123
```

### Console do Main Process
```
[IPC] watcher:start chamado com userId: 123 token: true
[IPC] Iniciando novo watcher...
[WATCHER] startWatcher chamado com opções: { logDir: "...", userId: "123", token: "..." }
[WATCHER] Buscando dados da API para criar pastas...
[API] Buscando pastas específicas do usuário...
[API] 3 pastas específicas do usuário encontradas
[WATCHER] Processo de criação de pastas concluído
```

## Tratamento de Erros

### Erro na API
- Sistema tenta endpoint alternativo
- Se falhar, usa pastas mockadas
- Logs detalhados para debugging

### Erro na Criação de Pastas
- Continua com outras pastas
- Logs de erro específicos
- Não interrompe o processo

## Personalização

### Adicionar Novos Tipos de Pasta
1. Modifique a função `fetchAndCreateFolders()`
2. Adicione lógica para novos endpoints
3. Implemente tratamento específico

### Modificar Estrutura de Metadados
1. Edite o objeto `metadata` na função
2. Adicione novas propriedades conforme necessário
3. Atualize a documentação

## Troubleshooting

### Watcher não inicia
- Verifique se `userId` está sendo passado
- Verifique se `token` está disponível
- Verifique logs do console

### Pastas não são criadas
- Verifique se a API está respondendo
- Verifique formato da resposta
- Verifique permissões da pasta home

### Erros de API
- Verifique conectividade com a API
- Verifique formato dos endpoints
- Verifique autenticação (token)

## Exemplo de Uso

```javascript
// No AuthContext, o watcher é iniciado automaticamente
function login(data) {
  // ... código de login ...
  
  // Iniciar watcher para o usuário logado
  if (data.userId) {
    startWatcher(data.userId); // token é passado automaticamente
  }
}
```

## Próximos Passos

1. **Implementar endpoints reais** da sua API
2. **Adicionar validação** dos dados recebidos
3. **Implementar cache** para evitar chamadas desnecessárias
4. **Adicionar sincronização** em tempo real
5. **Implementar notificações** para mudanças na API
