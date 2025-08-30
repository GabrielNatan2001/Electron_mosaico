console.log('🚀 renderer.js iniciando...');
console.log('🔍 Document ready state:', document.readyState);
console.log('🔍 Element #root existe?', !!document.getElementById('root'));

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  console.log('🎯 Inicializando aplicação React...');
  
  const rootElement = document.getElementById('root');
  console.log('📦 Elemento root encontrado:', rootElement);

  if (rootElement) {
    console.log('🎯 Criando root do React...');
    
    // HTML de fallback enquanto carrega
    rootElement.innerHTML = '<h1 style="color: white; text-align: center; padding: 50px;">🚀 TLM Mosaico Carregando...</h1>';
    console.log('🔧 HTML de fallback inserido');
    
    // Carregar React de forma assíncrona para evitar problemas
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('./App'),
      import('./index.css'),
      import('./i18n')
    ]).then(([React, ReactDOM, AppModule, cssModule, i18nModule]) => {
      console.log('⚛️ Módulos React carregados, renderizando...');
      
      try {
        const App = AppModule.default;
        const root = ReactDOM.createRoot(rootElement);
        
        root.render(
          React.createElement(React.StrictMode, null,
            React.createElement(App)
          )
        );
        
        console.log('✅ App React renderizado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao renderizar App:', error);
        console.log('🔧 Mantendo HTML de fallback');
      }
    }).catch((error) => {
      console.error('❌ Erro ao carregar módulos React:', error);
      console.log('🔧 Mantendo HTML de fallback');
    });
    
  } else {
    console.error('❌ Elemento #root não encontrado!');
  }
}