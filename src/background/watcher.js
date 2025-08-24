const fs = require('node:fs').promises;
const path = require('node:path');
const os = require('node:os');
const chokidar = require('chokidar');

// Importar configuração da API
const { getMosaicosBg, getMosaicoById, downloadConteudoTessela } = require('./api-config');

const TEMPO_FICA_PROCESSAR_EVENTOS_ALTERACOES_ARQUIVOS = 10000; //ms
const listaEventoArquivos = [];
const pathIdentifierMap = new Map();

function ObterPastaBase() {
  return path.join(os.homedir(), 'MosaicoElectron');
}

async function processQueue() {
  const result = [];
  const usados = new Set();

  // Detecta renames
  for (let i = 0; i < listaEventoArquivos.length; i++) {
    const item = listaEventoArquivos[i];
    if (usados.has(i)) continue;

    if (item.type === 'unlinkDir') {
      // Pega todos os addDir disponíveis para o mesmo identifier
      const candidatos = listaEventoArquivos
        .map((other, idx) => ({ other, idx }))
        .filter(({ other, idx }) =>
          idx !== i &&
          !usados.has(idx) &&
          other.identifier === item.identifier &&
          other.type === 'addDir'
        );

      // Se tiver somente 1 addDir é rename, se tiver mais de 1 é criação
      if (candidatos.length === 1) {
        const { other: addDirItem, idx: matchIndex } = candidatos[0];
        result.push({
          identifier: item.identifier,
          type: 'renameDir',
          oldPath: item.path,
          newPath: addDirItem.path,
          hora: addDirItem.hora
        });
        usados.add(i);
        usados.add(matchIndex);
        continue;
      }
    }
    if (item.type == 'unlink') {
      // Pega todos os add
      const candidatos = listaEventoArquivos
        .map((other, idx) => ({ other, idx }))
        .filter(({ other, idx }) =>
          idx !== i &&
          !usados.has(idx) &&
          other.identifier === item.identifier &&
          other.type === 'add'
        );

      // Se tiver somente 1 addDir é rename, se tiver mais de 1 é criação
      if (candidatos.length === 1) {
        const { other: addDirItem, idx: matchIndex } = candidatos[0];
        result.push({
          identifier: item.identifier,
          type: 'rename',
          oldPath: item.path,
          newPath: addDirItem.path,
          hora: addDirItem.hora 
        });
        usados.add(i);
        usados.add(matchIndex);
        continue;
      }
    }
    result.push(item);
  }

  //Pegar o identifier com a hora maior(ultima operação)
  const ultimoPorIdentifier = Object.values(
    result.reduce((acc, item) => {
      if (!acc[item.identifier] || item.hora > acc[item.identifier].hora) {
        acc[item.identifier] = item;
      }
      return acc;
    }, {})
  );

  await writeLog(`itens agrupados: ${JSON.stringify(ultimoPorIdentifier)}`);
  for (const event of ultimoPorIdentifier) {
    switch (event.type) {
      case 'addDir':
        await writeLog(`[ADDDIR] PASTA FINAL: ${event.path} - identifier: ${identifier}`);
        break;
      case 'add':
        await writeLog(`[ADD] ARQUIVO FINAL: ${event.path} - identifier: ${identifier}`);
        break;
      case 'change':
        await writeLog(`[CHANGE] ARQUIVO MODIFICADO: ${event.path} - identifier: ${identifier}`);
        break;
      case 'unlinkDir':
        await writeLog(`[UNLINKDIR] PASTA DELETADA: ${event.path} - identifier: ${identifier}`);
        break;
      case 'unlink':
        await writeLog(`[UNLINK] ARQUIVO DELETADO: ${event.path} - identifier: ${identifier}`);
        break;
      case 'renameDir':
        await writeLog(`[RENAME] PASTA: ${event.oldPath} → ${event.path} - identifier: ${identifier}`);
        break;
    }
  }

  listaEventoArquivos.splice(0, listaEventoArquivos.length)
}

// Timer para processar fila periodicamente
setInterval(processQueue, TEMPO_FICA_PROCESSAR_EVENTOS_ALTERACOES_ARQUIVOS);

// Adiciona evento à fila
function queueEvent(identifier, path, type) {
  listaEventoArquivos.push({ identifier, path, type, hora: Date.now() });
}

async function startWatcher(options = {}) {
  const pastaBase = ObterPastaBase();
  const userId = options.userId;
  const token = options.token;
  const proprietarioId = options.proprietarioId;

  if (!userId) {
    throw new Error('userId é obrigatório para iniciar o watcher');
  }

  await CriarPastaBase(pastaBase);
  const directoryToWatch = await CriarPastaMosaico(userId, pastaBase);
  await buscarMosaicosECriarArquivos(userId, token, proprietarioId, directoryToWatch);

  const watcher = chokidar.watch(directoryToWatch, {
    persistent: true,
    ignoreInitial: true, // Ignora eventos iniciais
    awaitWriteFinish: true, // Espera escrita terminar
    depth: 99, // Monitora subdiretórios
    usePolling: false, // Melhor performance,
    atomic: true
  });

  // ===== ARQUIVOS =====
  watcher.on('add', async (filePath, stats) => {
    const identifier = stats ? stats.birthtimeMs : Date.now();
    pathIdentifierMap.set(filePath, identifier);
    queueEvent(identifier, filePath, 'add');
  });

  watcher.on('unlink', async (filePath) => {
    const identifier = pathIdentifierMap.get(filePath) || Date.now();
    pathIdentifierMap.delete(filePath);
    queueEvent(identifier, filePath, 'unlink');
  });

  watcher.on('change', async (filePath, stats) => {
    const identifier = pathIdentifierMap.get(filePath) || (stats ? stats.birthtimeMs : Date.now());
    queueEvent(identifier, filePath, 'change');
  });

  // ===== PASTAS =====
  watcher.on('addDir', async (dirPath) => {
    const stats = await fs.stat(dirPath);
    const identifier = stats.birthtimeMs;
    pathIdentifierMap.set(dirPath, identifier);
    queueEvent(identifier, dirPath, 'addDir');
  });

  watcher.on('unlinkDir', async (dirPath) => {
    const identifier = pathIdentifierMap.get(dirPath) || Date.now();
    pathIdentifierMap.delete(dirPath);
    queueEvent(identifier, dirPath, 'unlinkDir');
  });

  watcher.on('error', async (error) => {
    await writeLog(`[ERROR] ERRO: ${error?.message || String(error)}`);
  });

  watcher.on('ready', async () => {
    await writeLog(`[READY] MONITORAMENTO INICIADO para usuário ${userId}: ${directoryToWatch}`);
  });

  return watcher;
}

async function CriarPastaBase(pastaBase) {
  // Cria a pasta MosaicoElectron se ela não existir
  try {
    await fs.access(pastaBase);
    console.log('[WATCHER] Pasta base já existe:', pastaBase);
  } catch (error) {
    try {
      await fs.mkdir(pastaBase, { recursive: true });
    } catch (mkdirError) {
      throw new Error(`Não foi possível criar a pasta base ${pastaBase}: ${mkdirError.message}`);
    }
  }
}

async function CriarPastaMosaico(userId, pastaBase) {
  // Criar pasta específica para o usuário
  const pastaUsuario = path.join(pastaBase, `user_${userId}`);
  // Cria a pasta específica do usuário se ela não existir
  try {
    await DeletePasta(pastaUsuario);
    await fs.access(pastaUsuario);
    console.log('[WATCHER] Pasta do usuário já existe:', pastaUsuario);
  } catch (error) {
    try {
      await fs.mkdir(pastaUsuario, { recursive: true });
    } catch (mkdirError) {
      throw new Error(`Não foi possível criar a pasta do usuário ${pastaUsuario}: ${mkdirError.message}`);
    }
  }
  return pastaUsuario;
}

async function writeLog(line) {
  try {
    var pastaBase = ObterPastaBase();
    var logFilePath = `${pastaBase}\\logs\\mosaico-electron.log`;
    // Garante que a pasta existe
    const logDir = path.dirname(logFilePath);
    await fs.mkdir(logDir, { recursive: true });

    // Prepara a linha com timestamp
    const timestamp = new Date().toISOString();
    const content = `[${timestamp}] ${line}\n`;

    // Escreve no arquivo (cria se não existir)
    await fs.appendFile(logFilePath, content, "utf8");

    console.log(`[WATCHER-LOG] ${content.trim()}`);
  } catch (err) {
    console.error("[WATCHER] Erro ao escrever log:", err);
  }
}

async function buscarMosaicosECriarArquivos(userId, token, proprietarioId, pastaUsuario) {
  try {
    if (token) {
      try {
        await writeLog('[API] Buscando mosaicos do usuário...');

        // Chamar api para obter mosaicos
        const mosaicos = await getMosaicosBg(userId, token, proprietarioId);

        if (mosaicos.length > 0) {
          for (const mosaico of mosaicos) {
            try {
              const pastaMosaicoDoUsuario = path.join(pastaUsuario, mosaico.nome);

              // Verificar se a pasta já existe
              try {
                await fs.access(pastaMosaicoDoUsuario);
                await writeLog(`[API] Pasta já existe: ${mosaico.nome}`);
              } catch (error) {
                // Pasta não existe, criar
                await fs.mkdir(pastaMosaicoDoUsuario, { recursive: true });
                await writeLog(`[API] Pasta criada com sucesso: ${mosaico.nome} - ${mosaico.descricao || 'Sem descrição'}`);
              }

              await ObterTesselasPorMosaidoId(userId, token, proprietarioId, mosaico.id, pastaMosaicoDoUsuario);
            } catch (folderError) {
              await writeLog(`[API] Erro ao criar pasta ${mosaico.nome}: ${folderError.message}`);
            }
          }
        }
      } catch (error) {
        await writeLog(`[API] Erro ao buscar mosaicos do usuário: ${error.message}`);
      }
    } else {
      await writeLog('[API] Token não disponível, não é possível buscar mosaicos');
    }
  } catch (error) {
    await writeLog(`[API] Erro na busca/processamento da API: ${error.message}`);
  }
}

async function ObterTesselasPorMosaidoId(userId, token, proprietarioId, mosaidoId, pastaMosaicoDoUsuario) {
  const mosaico = await getMosaicoById(userId, token, proprietarioId, mosaidoId);


  for (const tessela of mosaico.tesselas) {
    var pastaTessela = await CriarPastaTessela(tessela, pastaMosaicoDoUsuario)
    for (const conteudo of tessela.conteudos) {
      try {
        if (['OFFICE'].includes(conteudo.tipo?.toUpperCase())) {
          var nomeArquivo = conteudo.url.split('/').pop();
          var caminhoArquivo = path.join(pastaTessela, nomeArquivo);
          var conteudoArquivo = await downloadConteudoTessela(userId, token, proprietarioId, conteudo.url);

          await fs.writeFile(caminhoArquivo, conteudoArquivo);
        }
      } catch (error) {
        await writeLog(`[API] Erro ao baixar conteúdo da tessela ${tessela.nome}: ${error.message}`);
      }
    }
  }
}

async function DeletePasta(caminho) {
  await fs.rm(caminho, { recursive: true, force: true });
}


async function CriarPastaTessela(tessela, pastaMosaico) {
  const pasta = path.join(pastaMosaico, tessela.descricao);

  try {
    await fs.access(pasta);
  } catch (error) {
    try {
      await fs.mkdir(pasta, { recursive: true });
    } catch (mkdirError) {
      throw new Error(`Não foi possível criar a pasta: ${mkdirError.message}`);
    }
  }
  return pasta;
}

module.exports = { startWatcher };
