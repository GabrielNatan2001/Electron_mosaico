# 🚀 Guia de Debug com Breakpoints - ELECTRON-MOSAICO

## 📋 **Configurações Implementadas**

### **1. VS Code Debug Configurations**
- ✅ `.vscode/launch.json` - Configurações principais de debug do Electron
- ✅ `.vscode/tasks.json` - Tasks para build e start
- ✅ `.vscode/launch-watcher.json` - Debug específico do watcher.js
- ✅ `.vscode/launch-electron.json` - Configurações alternativas do Electron

### **2. Webpack Source Maps**
- ✅ `webpack.main.config.js` - Source maps habilitados
- ✅ `webpack.renderer.config.js` - Source maps habilitados

### **3. Electron Forge Debug**
- ✅ `forge.config.js` - Fuses habilitados para debug
- ✅ `package.json` - Scripts de debug adicionados

## 🔧 **Como Usar o Debug**

### **Opção 1: Debug via VS Code (Recomendado)**

1. **Abra o VS Code** no projeto
2. **Pressione F5** ou vá em `Run > Start Debugging`
3. **Selecione uma das configurações:**
   - `Electron: Main Process` - Para debug do processo principal
   - `Electron: Renderer Process` - Para debug do processo de renderização
   - `Electron: All Processes` - Para debug de ambos os processos
   - `Electron: Main + Renderer` - Para debug simultâneo dos dois processos

### **Opção 2: Debug Específico do Watcher.js**

1. **Abra o arquivo** `src/background/watcher.js`
2. **Clique na linha** onde quer colocar o breakpoint (aparecerá um ponto vermelho)
3. **Pressione F5** e selecione `Debug Watcher.js`
4. **O código parará** no breakpoint quando executar

### **Opção 3: Debug via Terminal**

```bash
# Debug com inspect (pausa na primeira linha)
npm run start:debug-brk

# Debug com inspect (sem pausa automática)
npm run start:debug

# Debug padrão (recomendado para VS Code)
npm run start
```

## 🎯 **Exemplos de Breakpoints**

### **No arquivo watcher.js:**

```javascript
// Breakpoint na linha 32 - função startWatcher
async function startWatcher(options = {}) {
  console.log('[WATCHER] startWatcher chamado com opções:', options); // ← Breakpoint aqui
  
  // Define a pasta MosaicoElectron baseada no sistema operacional
  const baseDirectory = getWatchDirectory();
  const userId = options.userId;
  const token = options.token;
  const proprietarioId = options.proprietarioId;
}
```

### **No arquivo main.js:**

```javascript
// Breakpoint na criação da janela
function createWindow() {
  // ← Breakpoint aqui para debugar criação da janela
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
}
```

## 🔍 **Ferramentas de Debug Disponíveis**

### **VS Code Debug Console:**
- `console.log()` - Logs no console
- `debugger;` - Pausa automática no código
- Variáveis locais e globais
- Call stack
- Breakpoints condicionais

### **Chrome DevTools (Renderer Process):**
- Elements, Console, Sources
- Network, Performance
- Application, Security

### **Node.js Inspector (Main Process):**
- Console integrado
- Source maps funcionando
- Breakpoints em arquivos .js

## 🚨 **Solução de Problemas**

### **Source Maps não funcionam:**
1. Verifique se `devtool: 'source-map'` está no webpack
2. Limpe a pasta `.webpack` e recompile
3. Execute `npm run start` novamente

### **Breakpoints não param:**
1. Verifique se está usando a configuração correta
2. Confirme se o arquivo tem source maps
3. Tente usar `debugger;` no código

### **Debug não inicia:**
1. Verifique se as dependências estão instaladas
2. Confirme se o Electron está funcionando
3. Verifique os logs de erro no terminal

## 📚 **Recursos Adicionais**

### **Comandos úteis:**
```bash
# Limpar build
rm -rf .webpack

# Reinstalar dependências
npm ci

# Verificar configuração
npm run lint
```

### **Extensões VS Code recomendadas:**
- **ES7+ React/Redux/React-Native snippets**
- **JavaScript (ES6) code snippets**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

## 🎉 **Pronto para Debug!**

Agora você pode:
- ✅ Colocar breakpoints clicando nas linhas
- ✅ Usar F5 para iniciar debug
- ✅ Ver variáveis e call stack
- ✅ Debugar tanto main quanto renderer process
- ✅ Usar console.log e debugger statements

**Happy Debugging! 🐛✨**
