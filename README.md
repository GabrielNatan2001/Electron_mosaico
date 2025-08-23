# Teste Mosaico

## Configuração das Variáveis de Ambiente

Para que a aplicação funcione corretamente, você precisa criar um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### 1. Crie o arquivo `.env`

Na raiz do projeto, crie um arquivo chamado `.env` com o seguinte conteúdo:

```bash
# Configurações da API
VITE_BASE_URL=http://localhost:3000/api

# Ambiente da aplicação
VITE_ENVIRONMENT=development

# Configurações de debug
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### 2. Configurações Disponíveis

- **VITE_BASE_URL**: URL base da API (obrigatório)
- **VITE_ENVIRONMENT**: Ambiente da aplicação (development, staging, production)
- **VITE_DEBUG**: Habilita logs de debug (true/false)
- **VITE_LOG_LEVEL**: Nível de log (info, warn, error, debug)

### 3. Exemplo de Configuração para Produção

```bash
VITE_BASE_URL=https://api.seudominio.com/api
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

### 4. Reiniciar a Aplicação

Após criar o arquivo `.env`, reinicie a aplicação para que as variáveis sejam carregadas:

```bash
npm start
```

## Estrutura do Projeto

O projeto está configurado para usar:
- **Electron** como framework desktop
- **React** para a interface
- **Webpack** para bundling
- **Axios** para requisições HTTP
- **Tailwind CSS** para estilização

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run package
```

## Solução de Problemas

Se você encontrar o erro `Cannot read properties of undefined (reading 'VITE_BASE_URL')`, verifique se:

1. O arquivo `.env` existe na raiz do projeto
2. A variável `VITE_BASE_URL` está definida no arquivo
3. A aplicação foi reiniciada após criar o arquivo
4. O arquivo `.env` não tem espaços extras ou caracteres especiais

## Nota Importante

O arquivo `.env` está no `.gitignore` por segurança, então não será commitado no repositório. Cada desenvolvedor deve criar seu próprio arquivo `.env` baseado no `env.example`.
