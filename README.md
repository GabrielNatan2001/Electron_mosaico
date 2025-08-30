# 🎨 TLM Mosaico

Sistema de Gerenciamento de Mosaicos desenvolvido com Electron e React, com sistema de atualização automática integrado ao GitHub.

## 🚀 Funcionalidades

- ✅ **Interface moderna** com React e Tailwind CSS
- ✅ **Sistema de atualização automática** via GitHub Releases
- ✅ **Multi-plataforma** (Windows, macOS, Linux)
- ✅ **Sistema de logs** para debugging
- ✅ **Internacionalização** (i18n) com suporte a múltiplos idiomas
- ✅ **Auto-updater** com notificações visuais

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **GitHub Personal Access Token** (para auto-updater)
- **Repositório GitHub** configurado

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```bash
# Configurações da API
VITE_BASE_URL=http://localhost:3000/api

# Ambiente da aplicação
VITE_ENVIRONMENT=development

# Configurações de debug
VITE_DEBUG=true
VITE_LOG_LEVEL=info

# GitHub Personal Access Token para electron-builder
GH_TOKEN=seu_token_github_aqui

# Outras variáveis de ambiente podem ser adicionadas aqui
# VITE_API_KEY=sua_chave_aqui
# VITE_WS_URL=ws://localhost:3000
```

## ⚙️ Configuração

### 1. Configurar GitHub Personal Access Token

1. Vá para [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clique em "Generate new token (classic)"
3. Dê um nome como "TLM Mosaico Electron Builder"
4. Selecione os escopos:
   - `repo` (para repositórios privados)
   - `public_repo` (para repositórios públicos)
5. Clique em "Generate token"
6. **Copie o token** e cole no arquivo `.env`

### 2. Configurar Repositório GitHub

Edite `src/background/updater-config.js`:
```javascript
module.exports = {
  github: {
    owner: 'SEU_USUARIO_GITHUB',
    repo: 'SEU_REPOSITORIO',
    private: false, // true se for privado
  },
  // ... outras configurações
};
```

### 3. Configurar package.json

Verifique se o `package.json` tem as configurações corretas:
```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "SEU_USUARIO_GITHUB",
        "repo": "SEU_REPOSITORIO",
        "private": false,
        "releaseType": "release",
        "vPrefixedTagName": true,
        "publishAutoUpdate": true
      }
    ]
  }
}
```

## 🚀 Como Executar

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
npm start

# Iniciar com debug
npm run start:debug

# Iniciar com debug e breakpoint
npm run start:debug-brk
```

### Build e Distribuição
```bash
# Build do projeto
npm run build

# Build e distribuição
npm run dist

# Build específico para Windows
npm run dist:win

# Build para Windows (sem instalar)
npm run dist:win-unpacked

# Publicar no GitHub
npm run publish:github
```

## 🔄 Sistema de Auto-Updater

### Como Funciona

1. **Verificação automática**: A cada 4 horas
2. **Notificações visuais**: Interface intuitiva para o usuário
3. **Download manual**: Usuário controla quando baixar
4. **Instalação automática**: Após download, instala automaticamente

### Scripts de Atualização

```bash
# Correção de bug (1.0.5 → 1.0.6)
npm run update:patch

# Nova funcionalidade (1.0.5 → 1.1.0)
npm run update:minor

# Breaking changes (1.0.5 → 2.0.0)
npm run update:major

# Com mensagem personalizada
npm run update:minor -- --message "Nova funcionalidade de exportação"

# Verificar atualizações
npm run check-updates
```

### Fluxo de Publicação

1. **Desenvolver** novas funcionalidades
2. **Testar** localmente
3. **Executar** script de atualização (patch/minor/major)
4. **Verificar** se o release foi criado no GitHub
5. **Usuários recebem** notificação de atualização

## 🏗️ Estrutura do Projeto

```
src/
├── api/                    # APIs e serviços
├── assets/                 # Imagens e recursos estáticos
├── background/             # Processos principais do Electron
│   ├── updater.js         # Sistema de auto-updater
│   ├── updater-config.js  # Configurações do updater
│   └── watcher.js         # Sistema de monitoramento
├── components/             # Componentes React reutilizáveis
│   └── ui/
│       └── UpdateNotification.jsx  # Notificação de atualização
├── config/                 # Configurações da aplicação
├── context/                # Contextos React
├── screens/                # Telas principais da aplicação
├── utils/                  # Utilitários e helpers
└── validations/            # Validações de dados

scripts/
└── publish-update.js       # Script de publicação automatizada

build-output/               # Arquivos de build (não commitado)
dist/                       # Arquivos compilados (não commitado)
```

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `start` | Inicia a aplicação em modo desenvolvimento |
| `start:debug` | Inicia com debug habilitado |
| `start:debug-brk` | Inicia com breakpoint para debug |
| `build` | Compila o projeto com webpack |
| `dist` | Build e distribuição completa |
| `dist:win` | Build específico para Windows |
| `dist:win-unpacked` | Build Windows sem instalador |
| `publish` | Build e publicação automática |
| `publish:github` | Build e publicação no GitHub |
| `update:patch` | Incrementa versão patch |
| `update:minor` | Incrementa versão minor |
| `update:major` | Incrementa versão major |
| `check-updates` | Verifica atualizações disponíveis |

## 🐛 Debug e Troubleshooting

### Logs da Aplicação

Os logs são salvos em:
- **Windows**: `%APPDATA%/tlm-mosaico/logs/`
- **macOS**: `~/Library/Application Support/tlm-mosaico/logs/`
- **Linux**: `~/.config/tlm-mosaico/logs/`

### Verificar Status do Auto-Updater

No console da aplicação:
```javascript
// Verificar status
window.electronAPI.invoke('updater:get-status');

// Verificar atualizações
window.electronAPI.invoke('updater:check-for-updates');

// Obter logs
window.electronAPI.invoke('updater:get-logs');
```

### Problemas Comuns

#### 1. Erro de Token GitHub
```
Error: GitHub Personal Access Token is not set
```
**Solução**: Configure o `GH_TOKEN` no arquivo `.env`

#### 2. Atualização não detectada
**Solução**: 
- Verifique se a versão foi incrementada no `package.json`
- Confirme se o release foi publicado no GitHub
- Verifique se os arquivos foram empacotados corretamente

#### 3. Erro de conexão
**Solução**:
- Verifique conexão com internet
- Confirme se o repositório GitHub está acessível
- Verifique configurações de firewall/proxy

## 📱 Interface do Usuário

### Notificações de Atualização

- **Posição**: Canto superior direito
- **Estados**: Disponível, Baixando, Pronto para instalar, Erro
- **Ações**: Baixar, Instalar, Fechar, Tentar novamente

### Barra de Progresso

- Mostra progresso durante download
- Atualização em tempo real
- Indicador visual claro

## 🤝 Contribuição

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/SEU_USUARIO/SEU_REPOSITORIO/issues)
- **Documentação**: Este README
- **Email**: mosaico@tlm.com.br

## 🔗 Links Úteis

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Electron Updater](https://www.electron.build/auto-update)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Desenvolvido com ❤️ para TLM Mosaico**

*Versão atual: 1.0.19*
