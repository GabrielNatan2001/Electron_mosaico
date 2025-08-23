// Arquivo de teste para debug do watcher
require('dotenv').config(); // Carregar variáveis do .env
const { startWatcher } = require('./src/background/watcher');
const testConfig = require('./test-config'); // Carregar configuração de teste

async function testWatcher() {
  console.log('Iniciando teste do watcher...');
  
  // Carregar variáveis do .env
  const envConfig = {
    baseURL: testConfig.api.baseURL,
    environment: testConfig.api.environment,
    debug: testConfig.api.debug,
    logLevel: testConfig.api.logLevel
  };
  
  console.log('Configuração do .env:', envConfig);
  console.log('Configuração de teste:', testConfig.test);
  
  try {
    // Simular opções como se fossem do Electron
    const options = {
      userId: testConfig.test.userId,
      token: testConfig.test.token,
      proprietarioId: testConfig.test.proprietarioId,
      logDir: testConfig.test.logDir,
      onLog: (line) => console.log('[LOG]', line.trim())
    };
    
    console.log('Opções de teste:', options);
    
    // Chamar o watcher
    const watcher = await startWatcher(options);
    
    console.log('Watcher iniciado com sucesso!');
    
    // Simular algumas operações
    const timeout = testConfig.test.timeout;
    console.log(`Teste rodando por ${timeout}ms...`);
    
    setTimeout(() => {
      console.log('Teste concluído!');
      if (watcher && typeof watcher.close === 'function') {
        watcher.close();
        console.log('Watcher fechado.');
      }
      process.exit(0);
    }, timeout);
    
  } catch (error) {
    console.error('Erro ao testar watcher:', error);
    process.exit(1);
  }
}

// Executar o teste
testWatcher();
