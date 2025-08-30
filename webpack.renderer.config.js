const path = require('path');
const rules = require('./webpack.rules');
const webpack = require('webpack');
const dotenv = require('dotenv');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Carrega variáveis do .env (se existir)
const envParsed = (dotenv.config().parsed || {});

// Prepara objeto para o DefinePlugin apenas com VITE_*
const viteEnvDefine = Object.keys(envParsed)
  .filter((key) => key.startsWith('VITE_'))
  .reduce((acc, key) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(envParsed[key]);
    return acc;
  }, {});

// Adiciona fallbacks para variáveis não definidas
const fallbackEnvVars = {
  'import.meta.env.VITE_BASE_URL': JSON.stringify('http://localhost:3000/api'),
  'import.meta.env.VITE_ENVIRONMENT': JSON.stringify('development'),
  'import.meta.env.VITE_DEBUG': JSON.stringify('false'),
  'import.meta.env.VITE_LOG_LEVEL': JSON.stringify('info'),
  'process.env.PUBLIC_URL': JSON.stringify(''),
};

// Combina as variáveis do .env com os fallbacks
const finalEnvDefine = { ...fallbackEnvVars, ...viteEnvDefine };

// Log para debug
console.log('Variáveis de ambiente carregadas:', Object.keys(finalEnvDefine));

rules.push(
  // Babel para JS/JSX
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ["@babel/preset-env", { targets: "defaults" }],
          ["@babel/preset-react", { runtime: "automatic" }] // <- importante
        ],
      },
    },
  },
  // CSS
  {
    test: /\.css$/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: { importLoaders: 1 },
      },
      'postcss-loader',
    ],
  },
  // Imagens (PNG, JPG, GIF)
  {
    test: /\.(png|jpe?g|gif)$/i,
    type: 'asset/resource',
  },
  // SVG como asset/resource (URL)
  {
    test: /\.svg$/i,
    type: 'asset/resource',
  }
);

module.exports = {
  // Habilitar source maps apenas em desenvolvimento
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'electron-renderer',
  entry: './src/renderer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
    publicPath: './'
  },
  externals: {
    'electron': 'commonjs2 electron'
  },
  resolve: {
    fallback: {
      "path": false,
      "fs": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "process": false,
      "global": false
    }
  },
  module: {
    rules,
  },
  plugins: [
    new webpack.DefinePlugin({
      ...finalEnvDefine,
      // Definir variáveis globais para evitar erros
      'global': 'globalThis',
      'globalThis': 'globalThis',
      '__dirname': 'undefined',
      '__filename': 'undefined',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.IS_ELECTRON': JSON.stringify(true)
    }),
    
    // Plugin para injetar global no início do bundle
    new webpack.BannerPlugin({
      banner: 'var global = globalThis; var globalThis = globalThis;',
      raw: true,
      entryOnly: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: path.resolve(__dirname, 'public/locales'), 
          to: 'locales',
          noErrorOnMissing: false
        },
        { 
          from: path.resolve(__dirname, 'src/assets'), 
          to: 'assets',
          noErrorOnMissing: false
        },

      ]
    }),
    
    // Plugin para verificar se as imagens foram copiadas
    new webpack.BannerPlugin({
      banner: 'console.log("Webpack build iniciado");',
      raw: true,
      entryOnly: true
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
