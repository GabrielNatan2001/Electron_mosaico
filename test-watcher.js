// Teste para verificar se as notificações do watcher estão funcionando
const { startWatcher } = require('./src/background/watcher');

// Mock da janela principal
const mockMainWindow = {
  webContents: {
    send: (event, data) => {
      console.log(`[TEST] Evento enviado: ${event}`, data);
    }
  },
  isDestroyed: () => false
};

// Teste da função notifyContentUpdate
async function testWatcherNotifications() {
  console.log('[TEST] Iniciando teste do watcher...');
  
  try {
    // Iniciar watcher com mock da janela
    const watcher = await startWatcher({
      userId: 'test-user',
      token: 'test-token',
      proprietarioId: 'test-proprietario',
      mainWindow: mockMainWindow
    });
    
    console.log('[TEST] Watcher iniciado com sucesso');
    
    // Simular uma atualização de conteúdo
    console.log('[TEST] Simulando atualização de conteúdo...');
    
    // Aqui você pode simular a modificação de um arquivo
    // O watcher deve detectar e enviar a notificação
    
  } catch (error) {
    console.error('[TEST] Erro no teste:', error);
  }
}

// Executar teste se este arquivo for executado diretamente
if (require.main === module) {
  testWatcherNotifications();
}

module.exports = { testWatcherNotifications };
