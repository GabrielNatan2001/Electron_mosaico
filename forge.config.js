const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: ['./public/locales'],
    icon: path.resolve(__dirname, 'src/assets/logoMosaico.ico'),
    out: path.resolve(__dirname, 'out'), // Corrigir para 'out'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: path.resolve(__dirname, 'src/assets/logoMosaico.ico'),
        setupIcon: path.resolve(__dirname, 'src/assets/logoMosaico.ico'),
        // Configurações para gerar arquivos de update
        remoteReleases: '',
        setupExe: 'TLM-Mosaico-Setup.exe',
        noMsi: true,
        // Gerar arquivos de update necessários
        generateUpdatesFilesForAllChannels: true,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: path.resolve(__dirname, 'src/assets/logoMosaico.icns'),
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.resolve(__dirname, 'src/assets/logoMosaico.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: path.resolve(__dirname, 'src/assets/logoMosaico.png'),
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
        // Configuração para debug apenas em desenvolvimento
        devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:",
        // Habilitar source maps apenas em desenvolvimento
        devSourceMap: true,
      },
    },
    // Fuses são usados para habilitar/desabilitar várias funcionalidades do Electron
    // no momento do empacotamento, antes de assinar digitalmente a aplicação
    new FusesPlugin({
      version: FuseVersion.V1,
      // Em produção, desabilitar funcionalidades de debug
      [FuseV1Options.RunAsNode]: false, // Desabilitado em produção
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Desabilitado em produção
      [FuseV1Options.EnableNodeCliInspectArguments]: false, // Desabilitado em produção
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true, // Habilitado em produção para segurança
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'GabrielNatan2001',
          name: 'Electron_mosaico'
        },
        prerelease: false,
        draft: false
      }
    }
  ],
};
