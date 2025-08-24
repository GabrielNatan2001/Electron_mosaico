const fs = require('node:fs').promises;
const path = require('node:path');
const os = require('node:os');
const chokidar = require('chokidar');

// Importar configuração da API
const { getMosaicosBg, getMosaicoById, downloadConteudoTessela } = require('./api-config');

function ObterPastaBase() {
  return path.join(os.homedir(), 'MosaicoElectron');
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

  try {
    await buscarMosaicosECriarArquivos(userId, token, proprietarioId, directoryToWatch);
  } catch (error) {
    console.error('[WATCHER] Erro ao criar pastas iniciais:', error);
  }

  const watcher = chokidar.watch(directoryToWatch, {
    ignoreInitial: false,
    persistent: true,
    depth: 99,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on('add', async (filePath, stats) => {
      const isDirectory = stats && stats.isDirectory();
      await writeLog(`[ADD] isDirectory: ${isDirectory}, path: ${filePath}`);

      if (isDirectory) {
        await writeLog(`[ADD] PASTA DETECTADA: ${filePath}`);
      } else {
        await writeLog(`[ADD] ARQUIVO CRIADO: ${filePath}`);
      }
    })
    .on('change', async (filePath, stats) => {
      const isDirectory = stats && stats.isDirectory();
      const fileType = isDirectory ? 'PASTA' : 'ARQUIVO';
      const size = stats && !isDirectory ? ` size=${stats.size} bytes` : '';
      await writeLog(`[CHANGE] ${fileType} MODIFICADO: ${filePath}${size}`);
    })
    .on('unlink', async (filePath) => {
      await writeLog(`[UNLINK] ARQUIVO DELETADO: ${filePath}`);
    })
    .on('addDir', async (dirPath) => {
      await writeLog(`[ADDDIR] PASTA CRIADA: ${dirPath}`);
    })
    .on('unlinkDir', async (dirPath) => {
      await writeLog(`[UNLINKDIR] PASTA DELETADA: ${dirPath}`);
    })
    .on('error', async (error) => {
      await writeLog(`[ERROR] ERRO: ${error?.message || String(error)}`);
    })
    .on('ready', async () => {
      await writeLog(`[READY] MONITORAMENTO INICIADO para usuário ${userId}: ${directoryToWatch}`);
      console.log(`[WATCHER] Monitoramento iniciado para usuário ${userId} na pasta: ${directoryToWatch}`);
    });

  console.log('[WATCHER] Watcher configurado e retornando...');
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


async function CriarPastaTessela(tessela, pastaMosaico) {
  const pasta = path.join(pastaMosaico,  tessela.descricao);

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
