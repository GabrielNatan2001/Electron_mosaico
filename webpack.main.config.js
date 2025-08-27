const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Carrega variáveis do .env com caminho absoluto
const envPath = path.resolve(__dirname, '.env');
console.log('Tentando carregar .env de:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('Erro ao carregar .env:', envResult.error);
}

const envParsed = (envResult.parsed || {});
console.log('Conteúdo do .env carregado:', envParsed);

// Prepara objeto para o DefinePlugin apenas com VITE_*
const viteEnvDefine = Object.keys(envParsed)
  .filter((key) => key.startsWith('VITE_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(envParsed[key]);
    return acc;
  }, {});

// Adiciona fallbacks para variáveis não definidas
const fallbackEnvVars = {
  'process.env.VITE_BASE_URL': JSON.stringify('http://localhost:3000/api'),
  'process.env.VITE_ENVIRONMENT': JSON.stringify('development'),
  'process.env.VITE_DEBUG': JSON.stringify('false'),
  'process.env.VITE_LOG_LEVEL': JSON.stringify('info'),
};

// Combina as variáveis do .env com os fallbacks
const finalEnvDefine = { ...fallbackEnvVars, ...viteEnvDefine };

// Log para debug
console.log('Variáveis de ambiente carregadas no main process:', Object.keys(finalEnvDefine));
console.log('Valores finais das variáveis:', finalEnvDefine);

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Habilitar source maps apenas em desenvolvimento
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  plugins: [
    new webpack.DefinePlugin(finalEnvDefine),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.IS_ELECTRON': JSON.stringify(true)
    })
  ],
};
