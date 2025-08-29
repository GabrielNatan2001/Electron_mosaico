# Guia do Auto Updater - TLM Mosaico

Este guia explica como configurar e usar o sistema de auto atualização implementado na aplicação TLM Mosaico.

## 📋 Pré-requisitos

- Repositório GitHub configurado
- Aplicação empacotada com Electron Forge
- Token de acesso pessoal do GitHub (para repositórios privados)

## ⚙️ Configuração

### 1. Configurar o Repositório GitHub

Edite o arquivo `src/background/updater-config.js` e atualize as seguintes informações:

```javascript
github: {
  owner: 'seu-usuario', // Seu nome de usuário do GitHub
  repo: 'seu-repositorio', // Nome do seu repositório
  private: false, // true se for repositório privado
},
```

### 2. Configurar o Forge Config

Edite o arquivo `forge.config.js` e atualize as informações do repositório:

```javascript
publishers: [
  {
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'seu-usuario',
        name: 'seu-repositorio'
      },
      prerelease: false,
      draft: false
    }
  }
],
```

### 3. Configurar Variáveis de Ambiente (Opcional)

Para repositórios privados, crie um arquivo `.env` na raiz do projeto:

```env
GITHUB_TOKEN=seu_token_aqui
```

## 🚀 Publicando Atualizações

### 1. Atualizar Versão

Antes de publicar, atualize a versão no `package.json`:

```json
{
  "version": "1.0.6"
}
```

### 2. Empacotar e Publicar

```bash
# Empacotar a aplicação
npm run make

# Publicar no GitHub
npm run publish
```

### 3. Criar Release no GitHub

1. Vá para seu repositório no GitHub
2. Clique em "Releases"
3. Clique em "Create a new release"
4. Selecione a tag criada pelo Electron Forge
5. Adicione notas de lançamento
6. Publique o release

## 📱 Como Funciona

### Verificação Automática
- A aplicação verifica atualizações automaticamente a cada 2 horas
- Verificação também pode ser feita manualmente

### Processo de Atualização
1. **Verificação**: A aplicação verifica se há uma nova versão disponível
2. **Notificação**: Usuário é notificado sobre a disponibilidade da atualização
3. **Download**: Usuário pode baixar a atualização manualmente
4. **Instalação**: Após o download, a atualização é instalada automaticamente

### Interface do Usuário
- Notificações aparecem no canto superior direito
- Barra de progresso durante o download
- Botões para baixar e instalar atualizações
- Opção de fechar notificações

## 🔧 Funcionalidades

### IPC Handlers Disponíveis

- `updater:check-for-updates` - Verificar atualizações
- `updater:download-update` - Baixar atualização
- `updater:install-update` - Instalar atualização
- `updater:get-status` - Obter status atual

### Eventos do Renderer

- `update-status` - Receber status das atualizações
  - `checking` - Verificando atualizações
  - `available` - Atualização disponível
  - `downloading` - Baixando atualização
  - `downloaded` - Atualização baixada
  - `error` - Erro ocorreu

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique se a aplicação tem acesso à internet
- Verifique se o repositório GitHub está acessível

### Erro de Autenticação
- Para repositórios privados, configure o token GitHub
- Verifique se o token tem permissões adequadas

### Atualização Não Detectada
- Verifique se a versão no `package.json` foi incrementada
- Verifique se o release foi publicado no GitHub
- Verifique se os arquivos foram empacotados corretamente

### Logs de Debug
Os logs do auto updater são exibidos no console da aplicação. Para desenvolvimento, use:

```bash
npm run start:debug
```

## 📝 Notas Importantes

1. **Versões**: Sempre incremente a versão antes de publicar
2. **Releases**: Crie releases no GitHub para cada versão
3. **Testes**: Teste o processo de atualização em ambiente de desenvolvimento
4. **Backup**: O auto updater faz backup automático antes de instalar
5. **Reinicialização**: A aplicação será reiniciada após a instalação

## 🔒 Segurança

- O auto updater verifica a integridade dos arquivos baixados
- Atualizações são baixadas apenas de fontes confiáveis (GitHub)
- Usuário tem controle total sobre quando baixar e instalar

## 📞 Suporte

Para problemas ou dúvidas sobre o auto updater, consulte:
- Documentação do electron-updater
- Issues do repositório GitHub
- Logs da aplicação
