#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build multiplataforma com Docker...\n');

// Verificar se Docker está instalado
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker encontrado');
} catch (error) {
  console.error('❌ Docker não encontrado!');
  console.error('Instale o Docker Desktop: https://www.docker.com/products/docker-desktop');
  process.exit(1);
}

// Verificar se docker-compose está disponível
try {
  execSync('docker-compose --version', { stdio: 'pipe' });
  console.log('✅ Docker Compose encontrado');
} catch (error) {
  console.error('❌ Docker Compose não encontrado!');
  process.exit(1);
}

// Criar docker-compose.yml para builds
const dockerComposeContent = `version: '3.8'

services:
  build-win:
    image: electronuserland/builder:wine
    volumes:
      - .:/project
      - ~/.cache/electron:/root/.cache/electron
      - ~/.cache/electron-builder:/root/.cache/electron-builder
    working_dir: /project
    environment:
      - GH_TOKEN=\${GH_TOKEN}
    command: npm run dist:win

  build-mac:
    image: electronuserland/builder:latest
    volumes:
      - .:/project
      - ~/.cache/electron:/root/.cache/electron
      - ~/.cache/electron-builder:/root/.cache/electron-builder
    working_dir: /project
    environment:
      - GH_TOKEN=\${GH_TOKEN}
    command: npm run dist:mac

  build-linux:
    image: electronuserland/builder:latest
    volumes:
      - .:/project
      - ~/.cache/electron:/root/.cache/electron
      - ~/.cache/electron-builder:/root/.cache/electron-builder
    working_dir: /project
    environment:
      - GH_TOKEN=\${GH_TOKEN}
    command: npm run dist:linux
`;

// Criar arquivo docker-compose.yml
fs.writeFileSync('docker-compose.yml', dockerComposeContent);
console.log('📝 Docker Compose configurado');

// Função para executar build
async function runBuild() {
  try {
    console.log('\n🔨 Iniciando builds...\n');

    // Build para Windows
    console.log('🪟 Build para Windows...');
    execSync('docker-compose run --rm build-win', { stdio: 'inherit' });
    console.log('✅ Build Windows concluído\n');

    // Build para macOS
    console.log('🍎 Build para macOS...');
    execSync('docker-compose run --rm build-mac', { stdio: 'inherit' });
    console.log('✅ Build macOS concluído\n');

    // Build para Linux
    console.log('🐧 Build para Linux...');
    execSync('docker-compose run --rm build-linux', { stdio: 'inherit' });
    console.log('✅ Build Linux concluído\n');

    console.log('🎉 Todos os builds foram concluídos com sucesso!');
    console.log('📁 Arquivos gerados em: build-output/');

  } catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
  } finally {
    // Limpar arquivo docker-compose.yml
    if (fs.existsSync('docker-compose.yml')) {
      fs.unlinkSync('docker-compose.yml');
      console.log('🧹 Arquivo docker-compose.yml removido');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runBuild();
}

module.exports = { runBuild };
