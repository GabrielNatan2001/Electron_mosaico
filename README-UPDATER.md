# Sistema de Atualização Automática - TLM Mosaico

Este documento explica como configurar e usar o sistema de atualização automática implementado com `electron-updater`.

## 📋 Pré-requisitos

- Repositório GitHub configurado
- Token de acesso pessoal do GitHub (GITHUB_TOKEN)
- Aplicativo empacotado com Electron Forge

## 🚀 Configuração

### 1. Configurar o Repositório

Edite o `package.json` e atualize as informações do repositório:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/SEU-USUARIO/tlm-mosaico.git"
  },
  "homepage": "https://github.com/SEU-USUARIO/tlm-mosaico#readme"
}
```

### 2. Configurar o Forge

Edite o `forge.config.js` e atualize as informações do repositório:

```javascript
publishers: [
  {
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'SEU-USUARIO',
        name: 'tlm-mosaico'
      },
      prerelease: false,
      draft: false
    }
  }
]
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GITHUB_TOKEN=seu_token_aqui
```

## 📦 Publicação

### 1. Empacotar o Aplicativo

```bash
npm run make
```

### 2. Publicar no GitHub

```bash
npm run publish:github
```

**Importante:** Certifique-se de que o `GITHUB_TOKEN` está configurado como variável de ambiente.

## 🔄 Como Funciona

### Verificação Automática
- O aplicativo verifica atualizações automaticamente a cada 4 horas
- Primeira verificação ocorre 30 segundos após o startup
- Verificações manuais podem ser feitas pelo usuário

### Processo de Atualização
1. **Verificação**: O app verifica se há uma nova versão no GitHub
2. **Notificação**: Se houver atualização, o usuário é notificado
3. **Download**: O usuário escolhe se quer baixar a atualização
4. **Instalação**: Após o download, o usuário escolhe quando instalar
5. **Reinicialização**: O app reinicia automaticamente após a instalação

### Configurações de Segurança
- `autoDownload = false`: Não baixa automaticamente
- `autoInstallOnAppQuit = true`: Instala quando o app fecha
- Verificação de integridade habilitada
- Não permite downgrade ou versões pré-release

## 🛠️ Uso no Frontend

### Componente UpdateStatus

```jsx
import UpdateStatus from './components/ui/UpdateStatus';

// No seu componente
<UpdateStatus />
```

### API do Electron

```javascript
// Verificar atualizações
await window.electronAPI.invoke('update:check');

// Baixar atualização
await window.electronAPI.invoke('update:download');

// Instalar atualização
await window.electronAPI.invoke('update:install');
```

### Eventos Disponíveis

- `update:checking`: Verificando atualizações
- `update:available`: Nova versão disponível
- `update:not-available`: Aplicativo atualizado
- `update:error`: Erro na verificação
- `update:download-progress`: Progresso do download
- `update:downloaded`: Atualização baixada

## 🔧 Solução de Problemas

### Erro de Token
```
Error: GitHub token not found
```
**Solução**: Configure o `GITHUB_TOKEN` como variável de ambiente.

### Erro de Repositório
```
Error: Repository not found
```
**Solução**: Verifique se o repositório existe e se o token tem acesso.

### Atualização Não Detectada
**Solução**: 
1. Verifique se a versão no `package.json` foi incrementada
2. Certifique-se de que o release foi publicado no GitHub
3. Verifique se o arquivo `latest.yml` foi gerado

### Logs de Debug
Os logs são salvos automaticamente. Em desenvolvimento, verifique o console.
Em produção, os logs são salvos em:
- Windows: `%USERPROFILE%\AppData\Roaming\tlm-mosaico\logs\`
- macOS: `~/Library/Logs/tlm-mosaico/`
- Linux: `~/.config/tlm-mosaico/logs/`

## 📝 Checklist de Publicação

- [ ] Incrementar versão no `package.json`
- [ ] Fazer commit das alterações
- [ ] Criar tag git com a versão
- [ ] Fazer push da tag
- [ ] Executar `npm run make`
- [ ] Executar `npm run publish:github`
- [ ] Verificar se o release foi criado no GitHub
- [ ] Testar a atualização em um ambiente limpo

## 🔒 Segurança

- O sistema só funciona em versões empacotadas (não em desenvolvimento)
- Verificação de integridade habilitada
- Não permite downgrade para versões anteriores
- Timeout de 30 segundos para operações de rede
- Logs detalhados para auditoria

## 📚 Recursos Adicionais

- [Documentação do electron-updater](https://www.electron.build/auto-update)
- [Documentação do Electron Forge](https://www.electronforge.io/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
