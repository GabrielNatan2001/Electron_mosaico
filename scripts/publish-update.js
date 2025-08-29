#!/usr/bin/env node

/**
 * Script para facilitar o processo de publicação de atualizações
 * 
 * Uso:
 * node scripts/publish-update.js [patch|minor|major] [--message "Mensagem personalizada"]
 * 
 * Exemplos:
 * node scripts/publish-update.js patch
 * node scripts/publish-update.js minor --message "Nova funcionalidade adicionada"
 * node scripts/publish-update.js major --message "Breaking changes importantes"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para atualizar a versão no package.json
function updateVersion(versionType) {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const currentVersion = package.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (versionType) {
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    default:
      throw new Error('Tipo de versão inválido. Use: patch, minor ou major');
  }
  
  package.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
  
  console.log(`✅ Versão atualizada de ${currentVersion} para ${newVersion}`);
  return newVersion;
}

// Função para executar comandos
function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${description} concluído`);
  } catch (error) {
    console.error(`❌ Erro ao ${description.toLowerCase()}:`, error.message);
    process.exit(1);
  }
}

// Função para criar commit e tag
function createGitCommit(version, message) {
  const commitMessage = message || `Release versão ${version}`;
  
  try {
    // Adicionar todas as mudanças
    execSync('git add .', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    // Criar commit
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Commit criado');
    
    // Criar tag
    execSync(`git tag -a v${version} -m "Release ${version}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Tag criada');
    
    // Push das mudanças e tag
    execSync('git push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    execSync('git push --tags', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Push realizado');
    
  } catch (error) {
    console.error('❌ Erro no Git:', error.message);
    process.exit(1);
  }
}

// Função principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📦 Script de Publicação de Atualizações - TLM Mosaico

Uso:
  node scripts/publish-update.js [patch|minor|major] [--message "Mensagem personalizada"]

Exemplos:
  node scripts/publish-update.js patch
  node scripts/publish-update.js minor --message "Nova funcionalidade"
  node scripts/publish-update.js major --message "Breaking changes"

Tipos de versão:
  patch  - Correções de bugs (1.0.0 → 1.0.1)
  minor  - Novas funcionalidades (1.0.0 → 1.1.0)
  major  - Breaking changes (1.0.0 → 2.0.0)
    `);
    process.exit(0);
  }
  
  const versionType = args[0];
  const messageIndex = args.indexOf('--message');
  const message = messageIndex !== -1 ? args[messageIndex + 1] : null;
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Tipo de versão inválido. Use: patch, minor ou major');
    process.exit(1);
  }
  
  console.log('🚀 Iniciando processo de publicação...\n');
  
  try {
    // 1. Atualizar versão
    const newVersion = updateVersion(versionType);
    
    // 2. Criar commit e tag
    createGitCommit(newVersion, message);
    
    // 3. Empacotar aplicação
    runCommand('npm run make', 'Empacotando aplicação');
    
    // 4. Publicar no GitHub
    runCommand('npm run publish', 'Publicando no GitHub');
    
    console.log(`
🎉 Publicação concluída com sucesso!

📋 Resumo:
  - Versão: ${newVersion}
  - Commit: ${message || `Release versão ${newVersion}`}
  - Aplicação empacotada e publicada no GitHub

📝 Próximos passos:
  1. Verifique se o release foi criado no GitHub
  2. Teste o processo de atualização automática
  3. Monitore os logs para possíveis erros

🔗 Links úteis:
  - GitHub Releases: https://github.com/seu-usuario/seu-repositorio/releases
  - Documentação: AUTO-UPDATER-GUIDE.md
    `);
    
  } catch (error) {
    console.error('❌ Erro durante a publicação:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateVersion, createGitCommit };
