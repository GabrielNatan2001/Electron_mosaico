#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando build multiplataforma com WSL...\n');

// Verificar se WSL está disponível
function checkWSL() {
  try {
    execSync('wsl --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Verificar se Ubuntu está instalado no WSL
function checkUbuntu() {
  try {
    execSync('wsl -d Ubuntu -e lsb_release -a', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Função para executar comando no WSL
function runWSL(command) {
  const escapedCommand = command.replace(/"/g, '\\"');
  const fullCommand = `cd "/mnt/c/Users/Gabriel Natan/Desktop/Gabriel/projetos/ELECTRON-MOSAICO" && ${escapedCommand}`;
  
  return execSync(`wsl -d Ubuntu -e bash -c "${fullCommand}"`, { 
    stdio: 'inherit'
  });
}

// Função principal
async function runBuild() {
  try {
    // Verificar WSL
    if (!checkWSL()) {
      console.error('❌ WSL não encontrado!');
      console.error('Instale o WSL: https://docs.microsoft.com/en-us/windows/wsl/install');
      process.exit(1);
    }
    console.log('✅ WSL encontrado');

    // Verificar Ubuntu
    if (!checkUbuntu()) {
      console.error('❌ Ubuntu não encontrado no WSL!');
      console.error('Instale Ubuntu: wsl --install -d Ubuntu');
      process.exit(1);
    }
    console.log('✅ Ubuntu encontrado no WSL');

    console.log('\n🔨 Iniciando builds...\n');

    // Build para Windows (local)
    console.log('🪟 Build para Windows (local)...');
    execSync('npm run dist:win', { stdio: 'inherit' });
    console.log('✅ Build Windows concluído\n');

    // Build para Linux (WSL)
    console.log('🐧 Build para Linux (WSL)...');
    runWSL('npm run dist:linux');
    console.log('✅ Build Linux concluído\n');

    // Build para macOS (WSL - simulado)
    console.log('🍎 Build para macOS (WSL - simulado)...');
    try {
      runWSL('npm run dist:mac');
      console.log('✅ Build macOS concluído\n');
    } catch (error) {
      console.log('⚠️ Build macOS falhou (esperado no WSL)\n');
    }

    console.log('🎉 Builds concluídos!');
    console.log('📁 Arquivos gerados em: build-output/');
    console.log('\n💡 Para build completo multiplataforma, use:');
    console.log('   npm run build:docker    # Com Docker');
    console.log('   git tag v1.0.20         # Com GitHub Actions');

  } catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runBuild();
}

module.exports = { runBuild };
