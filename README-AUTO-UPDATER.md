# 🔄 Auto Updater - TLM Mosaico

Sistema de atualização automática implementado na aplicação TLM Mosaico usando `electron-updater` e GitHub Releases.

## ✨ Funcionalidades

- ✅ Verificação automática de atualizações a cada 2 horas
- ✅ Notificações visuais para o usuário
- ✅ Download manual de atualizações
- ✅ Instalação automática após download
- ✅ Suporte a múltiplas plataformas (Windows, macOS, Linux)
- ✅ Integração com GitHub Releases
- ✅ Interface de usuário intuitiva
- ✅ Logs detalhados para debugging

## 🚀 Instalação

O auto updater já está configurado e funcionando. Para começar a usar:

1. **Configure seu repositório GitHub** em `src/background/updater-config.js`
2. **Atualize o forge.config.js** com suas informações do GitHub
3. **Publique sua primeira versão** usando os scripts fornecidos

## 📋 Configuração Rápida

### 1. Configurar Repositório

Edite `src/background/updater-config.js`:

```javascript
github: {
  owner: 'SEU_USUARIO_GITHUB',
  repo: 'SEU_REPOSITORIO',
  private: false, // true se for privado
},
```

### 2. Configurar Forge

Edite `forge.config.js`:

```javascript
publishers: [
  {
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'SEU_USUARIO_GITHUB',
        name: 'SEU_REPOSITORIO'
      }
    }
  }
],
```

## 🎯 Como Usar

### Para Desenvolvedores

#### Publicar Nova Versão

```bash
# Correção de bug (1.0.5 → 1.0.6)
npm run update:patch

# Nova funcionalidade (1.0.5 → 1.1.0)
npm run update:minor

# Breaking changes (1.0.5 → 2.0.0)
npm run update:major

# Com mensagem personalizada
npm run update:minor -- --message "Nova funcionalidade de exportação"
```

#### Verificar Atualizações

```bash
# Iniciar app e verificar atualizações
npm run check-updates

# Verificar manualmente via interface
# Use o botão "Verificar Atualizações" na interface
```

### Para Usuários

1. **Verificação Automática**: O app verifica atualizações automaticamente
2. **Notificação**: Receba notificações quando houver atualizações
3. **Download**: Clique em "Baixar" para baixar a atualização
4. **Instalação**: Clique em "Instalar" após o download
5. **Reinicialização**: O app reinicia automaticamente com a nova versão

## 🔧 Estrutura dos Arquivos

```
src/
├── background/
│   ├── updater.js          # Lógica principal do auto updater
│   └── updater-config.js   # Configurações
├── components/ui/
│   └── UpdateNotification.jsx  # Componente de notificação
└── main.js                 # Integração com o processo principal

scripts/
└── publish-update.js       # Script de publicação automatizada

docs/
├── AUTO-UPDATER-GUIDE.md   # Guia completo
└── README-AUTO-UPDATER.md  # Este arquivo
```

## 📱 Interface do Usuário

### Notificações

- **Posição**: Canto superior direito
- **Estados**: Disponível, Baixando, Pronto para instalar, Erro
- **Ações**: Baixar, Instalar, Fechar, Tentar novamente

### Barra de Progresso

- Mostra progresso durante download
- Atualização em tempo real
- Indicador visual claro

## 🔍 Debugging

### Logs

Os logs do auto updater aparecem no console da aplicação:

```bash
# Para ver logs em desenvolvimento
npm run start:debug

# Logs incluem:
# - Verificação de atualizações
# - Status de download
# - Erros e avisos
# - Progresso das operações
```

### Verificação Manual

```javascript
// No console do renderer
window.electronAPI.invoke('updater:check-for-updates');
window.electronAPI.invoke('updater:get-status');
```

## 🚨 Solução de Problemas

### Problema: Atualização não detectada

**Solução:**
1. Verifique se a versão foi incrementada no `package.json`
2. Confirme se o release foi publicado no GitHub
3. Verifique se os arquivos foram empacotados corretamente

### Problema: Erro de conexão

**Solução:**
1. Verifique conexão com internet
2. Confirme se o repositório GitHub está acessível
3. Verifique configurações de firewall/proxy

### Problema: Erro de autenticação

**Solução:**
1. Para repositórios privados, configure `GITHUB_TOKEN`
2. Verifique permissões do token
3. Confirme se o repositório está configurado corretamente

## 📚 Recursos Adicionais

- [Documentação Completa](AUTO-UPDATER-GUIDE.md)
- [Electron Updater Docs](https://www.electron.build/auto-update)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [Electron Forge](https://www.electronforge.io/)

## 🤝 Contribuição

Para contribuir com melhorias no auto updater:

1. Crie uma issue descrevendo o problema/melhoria
2. Faça fork do repositório
3. Implemente as mudanças
4. Teste extensivamente
5. Envie um pull request

## 📄 Licença

Este projeto segue a mesma licença da aplicação principal TLM Mosaico.

---

**Desenvolvido com ❤️ para TLM Mosaico**
