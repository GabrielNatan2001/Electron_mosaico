const fs = require('node:fs').promises;
const path = require('node:path');
const os = require('node:os');
const chokidar = require('chokidar');

// Importar configuração da API
const { getMosaicosBg, getMosaicoById, downloadConteudoTessela, addTessela, addMosaico, atualizarConteudoTessela, downloadConteudoTesselaBackground } = require('./api-config');

const TEMPO_FICA_PROCESSAR_EVENTOS_ALTERACOES_ARQUIVOS = 10000; //ms
const listaEventoArquivos = [];
const pathIdentifierMap = new Map();
const mosaicosUsuario = [];
let userId;;
let token;
let proprietarioId;
let watcherInstance = null;
let isWatcherPaused = false;
let pausedEvents = [];
let mainWindowRef = null; // Referência para a janela principal

function ObterPastaBase() {
  return path.join(os.homedir(), 'TlmMosaico');
}
function getSystemLocale() {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

function isTemporaryFile(filePath) {
  const name = path.basename(filePath);
  const tempPatterns = [
    /^~.*$/, /\.~.*$/, /\.tmp$/, /\.swp$/, /\.part$/, /\.crdownload$/
  ];
  return tempPatterns.some((r) => r.test(name));
}

async function processQueue() {
  // Se o watcher estiver pausado, não processar eventos
  if (isWatcherPaused) {
    console.log('[WATCHER] Fila não processada - watcher pausado');
    return;
  }

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

  for (const event of ultimoPorIdentifier) {
    switch (event.type) {
      case 'addDir':
        //await CriarMosaicoOuTessela(event.path);
        await writeLog(`[ADDDIR] PASTA FINAL: ${event.path} - identifier: ${event.identifier}`);
        break;
      case 'add':
        await writeLog(`[ADD] ARQUIVO FINAL: ${event.path} - identifier: ${event.identifier}`);
        break;
      case 'change':
        await writeLog(`[CHANGE] ARQUIVO MODIFICADO: ${event.path} - identifier: ${event.identifier}`);
        await atualizarArquivoModificado(event.path);
        break;
      case 'unlinkDir':
        await writeLog(`[UNLINKDIR] PASTA DELETADA: ${event.path} - identifier: ${event.identifier}`);
        break;
      case 'unlink':
        await writeLog(`[UNLINK] ARQUIVO DELETADO: ${event.path} - identifier: ${event.identifier}`);
        break;
      case 'renameDir':
        await writeLog(`[RENAME] PASTA: ${event.oldPath} → ${event.path} - identifier: ${event.identifier}`);
        break;
    }
  }

  listaEventoArquivos.splice(0, listaEventoArquivos.length)
}

// Timer para processar fila periodicamente
//setInterval(processQueue, TEMPO_FICA_PROCESSAR_EVENTOS_ALTERACOES_ARQUIVOS);

// Adiciona evento à fila
function queueEvent(identifier, path, type) {
  // Se o watcher estiver pausado, não adicionar eventos à fila
  if (isWatcherPaused) {
    console.log(`[WATCHER] Evento ${type} ignorado - watcher pausado: ${path}`);
    return;
  }

  listaEventoArquivos.push({ identifier, path, type, hora: Date.now() });
}

// Função para pausar o watcher
function pauseWatcher() {
  if (watcherInstance && !isWatcherPaused) {
    isWatcherPaused = true;

    // Limpar a fila de eventos para evitar processamento de eventos antigos
    const eventosRemovidos = listaEventoArquivos.length;
    listaEventoArquivos.splice(0, listaEventoArquivos.length);

    // Limpar o mapa de identificadores para evitar referências a arquivos antigos
    const pathsRemovidos = pathIdentifierMap.size;
    pathIdentifierMap.clear();

    console.log(`[WATCHER] Watcher pausado temporariamente. ${eventosRemovidos} eventos e ${pathsRemovidos} paths removidos.`);
    return true;
  }
  return false;
}

// Função para retomar o watcher
function resumeWatcher() {
  if (watcherInstance && isWatcherPaused) {
    isWatcherPaused = false;
    console.log('[WATCHER] Watcher retomado - monitoramento ativo novamente');
    return true;
  }
  return false;
}

// Função para recarregar mosaicos do usuário
async function recarregarMosaicos() {
  try {
    await writeLog('[RELOAD] Recarregando mosaicos do usuário...');

    // Limpar mosaicos existentes
    mosaicosUsuario.length = 0;

    // Pausar o watcher temporariamente
    pauseWatcher();

    const pastaBase = ObterPastaBase();
    const directoryToWatch = await CriarPastaMosaico(userId, pastaBase);

    // Buscar mosaicos atualizados
    await buscarMosaicosECriarArquivos(userId, token, proprietarioId, directoryToWatch);

    // Retomar o watcher
    resumeWatcher();

    await writeLog('[RELOAD] Mosaicos recarregados com sucesso');

    // Notificar o frontend sobre a atualização
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      try {
        mainWindowRef.webContents.send('mosaicos:reloaded', {
          timestamp: Date.now(),
          totalMosaicos: mosaicosUsuario.length
        });
        console.log('[WATCHER] Notificação de mosaicos recarregados enviada para frontend');
      } catch (error) {
        console.error('[WATCHER] Erro ao enviar notificação de mosaicos recarregados:', error);
      }
    }

    return true;
  } catch (error) {
    await writeLog(`[RELOAD] Erro ao recarregar mosaicos: ${error.message}`);
    // Retomar o watcher mesmo em caso de erro
    resumeWatcher();
    return false;
  }
}

async function startWatcher(options = {}) {
  const pastaBase = ObterPastaBase();
  userId = options.userId;
  token = options.token;
  proprietarioId = options.proprietarioId;
  mainWindowRef = options.mainWindow; // Receber referência da janela principal

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

  // Armazenar a instância do watcher para controle
  watcherInstance = watcher;

  // ===== ARQUIVOS =====
  watcher.on('add', async (filePath, stats) => {
    if (isTemporaryFile(filePath) || isWatcherPaused) return;
    const identifier = stats ? stats.birthtimeMs : Date.now();
    pathIdentifierMap.set(filePath, identifier);
    queueEvent(identifier, filePath, 'add');
  });

  watcher.on('unlink', async (filePath) => {
    if (isTemporaryFile(filePath) || isWatcherPaused) return;
    const identifier = pathIdentifierMap.get(filePath) || Date.now();
    pathIdentifierMap.delete(filePath);
    queueEvent(identifier, filePath, 'unlink');
  });

  watcher.on('change', async (filePath, stats) => {
    if (isWatcherPaused) return;
    //const identifier = pathIdentifierMap.get(filePath) || (stats ? stats.birthtimeMs : Date.now());
    //queueEvent(identifier, filePath, 'change');
    //await writeLog(`[CHANGE] ARQUIVO MODIFICADO: ${event.path} - identifier: ${event.identifier}`);
    await atualizarArquivoModificado(filePath);
  });

  // ===== PASTAS =====
  watcher.on('addDir', async (dirPath) => {
    if (isTemporaryFile(dirPath) || isWatcherPaused) return;
    const stats = await fs.stat(dirPath);
    const identifier = stats.birthtimeMs;
    pathIdentifierMap.set(dirPath, identifier);
    queueEvent(identifier, dirPath, 'addDir');
  });

  watcher.on('unlinkDir', async (dirPath) => {
    if (isTemporaryFile(dirPath) || isWatcherPaused) return;
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

        mosaicosUsuario.splice(0, mosaicosUsuario.length);
        // Chamar api para obter mosaicos
        const mosaicos = await getMosaicosBg(userId, token, proprietarioId);

        if (mosaicos.length > 0) {
          for (const mosaico of mosaicos) {
            await writeLog(`[API] ehGlobal: ${mosaico.ehGlobal} - nome: ${mosaico.nome}`);
            try {
              if (mosaico.ehGlobal == true) {
                continue;
              }
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
  if (mosaico) {
    mosaicosUsuario.push(mosaico);
    for (const tessela of mosaico.tesselas) {
      var pastaTessela = await CriarPastaTessela(tessela, pastaMosaicoDoUsuario)
      for (const conteudo of tessela.conteudos) {
        try {
          if (['OFFICE'].includes(conteudo.tipo?.toUpperCase())) {
            var nomeArquivo = conteudo.url.split('/').pop();
            var caminhoArquivo = path.join(pastaTessela, nomeArquivo);
            var conteudoArquivo = await downloadConteudoTesselaBackground(userId, token, proprietarioId, conteudo.url);
            if (conteudoArquivo.length > 0) {
              await fs.writeFile(caminhoArquivo, conteudoArquivo);
            }

          }
        } catch (error) {
          await writeLog(`[API] Erro ao baixar conteúdo da tessela ${tessela.nome}: ${error.message}`);
        }
      }
    }
  }
}

async function DeletePasta(caminho) {
  await fs.rm(caminho, { recursive: true, force: true });
}


async function CriarPastaTessela(tessela, pastaMosaico) {
  const pasta = path.join(pastaMosaico, tessela.label);

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

async function CriarMosaicoOuTessela(dirPath) {
  var ehMosaico = VerificaSePastaEhMosaico(dirPath);
  var linguagem = getSystemLocale();
  var nomePasta = dirPath.split(path.sep).pop();

  if (ehMosaico) {
    const requestCreateMosaico = {
      nome: nomePasta,
      descricao: nomePasta,
      idioma: linguagem,
      ehGlobal: false
    }
    //deu certo a criação
    var response = await addMosaico(userId, token, proprietarioId, requestCreateMosaico);
    if (response) {
      mosaicosUsuario.push(response);
    }
  } else {
    const pastaMosaico = path.basename(path.dirname(dirPath));
    var mosaicoTessela = mosaicosUsuario.filter(x => x.nome == pastaMosaico)[0]
    const requestCreateTessela = {
      label: nomePasta,
      descricao: nomePasta,
      iconPreDefinido: '../iconesGerais/20250225t185428737z_icone_(37).png',
      icon: undefined,
      mosaicoId: mosaicoTessela.id
    }

    //deu certo a criação
    var response = await addTessela(userId, token, proprietarioId, requestCreateTessela);
    if (response) {
      mosaicoTessela.tesselas.push(response);
    }
  }
}

function VerificaSePastaEhMosaico(caminho) {
  var partes = caminho.split(path.sep);
  const indiceUser = partes.findIndex(p => p.startsWith("user_"));

  if (indiceUser === -1) {
    return 0; // não encontrou "user_"
  }
  return (partes.length - (indiceUser + 1)) == 1; // se qtde == 1 então é mosaico, senão é tessela
}

async function atualizarArquivoModificado(filePath) {
  try {
    // Verificar se é um arquivo temporário
    if (isTemporaryFile(filePath)) {
      return;
    }

    // Extrair informações do caminho do arquivo
    const partes = filePath.split(path.sep);
    const indiceUser = partes.findIndex(p => p.startsWith("user_"));

    if (indiceUser === -1) {
      await writeLog(`[UPDATE] Caminho inválido para atualização: ${filePath}`);
      return;
    }

    // Verificar se é uma tessela (deve ter pelo menos 3 níveis: user_X/mosaico/tessela/arquivo)
    if (partes.length < (indiceUser + 4)) {
      await writeLog(`[UPDATE] Arquivo não está em uma tessela válida: ${filePath}`);
      return;
    }

    const nomeMosaico = partes[indiceUser + 1];
    const nomeTessela = partes[indiceUser + 2];
    const nomeArquivo = partes[partes.length - 1];

    // Encontrar o mosaico correspondente
    const mosaico = mosaicosUsuario.find(m => m.nome === nomeMosaico);
    if (!mosaico) {
      await writeLog(`[UPDATE] Mosaico não encontrado: ${nomeMosaico}`);
      return;
    }

    // Encontrar a tessela correspondente
    const tessela = mosaico.tesselas.find(t => t.descricao === nomeTessela);
    if (!tessela) {
      await writeLog(`[UPDATE] Tessela não encontrada: ${nomeTessela}`);
      return;
    }

    // Encontrar o conteúdo correspondente
    const conteudo = tessela.conteudos.find(c => {
      // Verificar se o conteúdo tem uma URL e se o nome do arquivo corresponde
      if (c.url) {
        const urlParts = c.url.split('/');
        const urlFileName = urlParts[urlParts.length - 1];
        return urlFileName === nomeArquivo;
      }
      // Se não tiver URL, verificar pelo nome
      return c.nome === nomeArquivo;
    });
    if (!conteudo) {
      await writeLog(`[UPDATE] Conteúdo não encontrado para arquivo: ${nomeArquivo}`);
      return;
    }

    // Ler o arquivo modificado
    const arquivoBuffer = await fs.readFile(filePath);

    // Determinar o tipo de conteúdo e MIME type
    let tipoConteudo = 'OFFICE';
    let mimeType = 'application/octet-stream';
    const extensao = path.extname(nomeArquivo).toLowerCase();

    if (['.txt'].includes(extensao)) {
      tipoConteudo = 'TEXTO';
      mimeType = 'text/plain';
    } else if (['.pdf'].includes(extensao)) {
      tipoConteudo = 'PDF';
      mimeType = 'application/pdf';
    } else if (['.mp4', '.avi', '.mov'].includes(extensao)) {
      tipoConteudo = 'VIDEO';
      mimeType = 'video/mp4';
    } else if (['.jpg', '.jpeg'].includes(extensao)) {
      tipoConteudo = 'IMAGEM';
      mimeType = 'image/jpeg';
    } else if (['.png'].includes(extensao)) {
      tipoConteudo = 'IMAGEM';
      mimeType = 'image/png';
    } else if (['.gif'].includes(extensao)) {
      tipoConteudo = 'IMAGEM';
      mimeType = 'image/gif';
    } else if (['.doc', '.docx'].includes(extensao)) {
      tipoConteudo = 'OFFICE';
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (['.xls', '.xlsx'].includes(extensao)) {
      tipoConteudo = 'OFFICE';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (['.ppt', '.pptx'].includes(extensao)) {
      tipoConteudo = 'OFFICE';
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    }

    var nomeArquivoLimpo = nomeArquivo.replace(/_\d+(?=\.[^.]+$)/, "")
    // Criar um objeto File-like para o FormData
    const arquivo = {
      buffer: arquivoBuffer,
      name: nomeArquivoLimpo,
      type: mimeType
    };

    // Chamar a API para atualizar o conteúdo
    const resultado = await atualizarConteudoTessela(
      userId,
      token,
      proprietarioId,
      tessela.id,
      conteudo.id,
      nomeArquivoLimpo,
      tipoConteudo,
      arquivo
    );

    if (resultado) {
      await writeLog(`[UPDATE] Conteúdo atualizado com sucesso: ${nomeArquivo} na tessela ${nomeTessela}`);

      const pastaUsuario = path.join(ObterPastaBase(), `user_${userId}`);
      await buscarMosaicosECriarArquivos(userId, token, proprietarioId, pastaUsuario);
      notifyContentUpdate(mosaico.id, tessela.id, conteudo.id, nomeArquivo);
    } else {
      await writeLog(`[UPDATE] Erro ao atualizar conteúdo: ${nomeArquivo}`);
    }

  } catch (error) {
    await writeLog(`[UPDATE] Erro ao processar arquivo modificado ${filePath}: ${error.message}`);
  }
}

// Função para notificar o frontend sobre atualizações de conteúdo
function notifyContentUpdate(mosaicoId, tesselaId, conteudoId, nomeArquivo) {
  console.log(`[WATCHER] notifyContentUpdate chamada com: mosaicoId=${mosaicoId}, tesselaId=${tesselaId}, conteudoId=${conteudoId}, nomeArquivo=${nomeArquivo}`);
  console.log(`[WATCHER] mainWindowRef existe: ${!!mainWindowRef}`);

  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    console.log(`[WATCHER] mainWindow não está destruída, enviando notificação...`);
    try {
      mainWindowRef.webContents.send('content:updated', {
        mosaicoId,
        tesselaId,
        conteudoId,
        nomeArquivo,
        timestamp: Date.now()
      });
      console.log(`[WATCHER] Notificação enviada para frontend: ${nomeArquivo} atualizado`);
    } catch (error) {
      console.error('[WATCHER] Erro ao enviar notificação para frontend:', error);
    }
  } else {
    console.log(`[WATCHER] mainWindow não disponível ou destruída, não foi possível enviar notificação`);
  }
}

module.exports = { startWatcher, pauseWatcher, resumeWatcher, recarregarMosaicos };
