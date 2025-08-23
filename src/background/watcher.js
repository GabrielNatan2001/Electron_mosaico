const fs = require('node:fs').promises; // Mudando para versão promisificada
const path = require('node:path');
const os = require('node:os');
const chokidar = require('chokidar');

// Importar configuração da API
const { getMosaicosBg } = require('./api-config');
const { use } = require('react');

// Nota: A função criarMosaicoAsync não pode ser importada aqui pois este arquivo roda no main process
// e o mosaicoService é um módulo ES6 do renderer process
// TODO: Implementar comunicação IPC para criar mosaico ou mover esta lógica para o renderer

/**
 * Get the appropriate directory path based on the operating system
 * @returns {string} The directory path for the current OS
 */
function getWatchDirectory() {
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return path.join(os.homedir(), 'MosaicoElectron');
    case 'darwin': // macOS
      return path.join(os.homedir(), 'MosaicoElectron');
    case 'linux':
      return path.join(os.homedir(), 'MosaicoElectron');
    default:
      return path.join(os.homedir(), 'MosaicoElectron');
  }
}

/**
 * Start a file system watcher.
 * @param {object} options - Optional settings
 * @param {string} [options.logDir] - Directory to store logs; defaults to app userData/logs (must be provided by caller if used outside Electron context)
 * @param {(msg: string) => Promise<void>} [options.onLog] - Optional callback for log lines
 * @param {string} [options.userId] - User ID to create specific folder for monitoring
 * @param {string} [options.token] - Authentication token for API calls
 * @param {string} [options.proprietarioId] - Proprietario ID for API calls
 * @returns {Promise<import('chokidar').FSWatcher>}
 */
async function startWatcher(options = {}) {
  console.log('[WATCHER] startWatcher chamado com opções:', options);

  // Define a pasta MosaicoElectron baseada no sistema operacional
  const baseDirectory = getWatchDirectory();
  const userId = options.userId;
  const token = options.token;
  const proprietarioId = options.proprietarioId;

  console.log('[WATCHER] baseDirectory:', baseDirectory);
  console.log('[WATCHER] userId:', userId);
  console.log('[WATCHER] token disponível:', !!token);
  console.log('[WATCHER] proprietarioId:', proprietarioId);

  if (!userId) {
    throw new Error('userId é obrigatório para iniciar o watcher');
  }

  // Criar pasta específica para o usuário
  const userDirectory = path.join(baseDirectory, `user_${userId}`);
  const directoryToWatch = userDirectory;

  console.log('[WATCHER] userDirectory:', userDirectory);
  console.log('[WATCHER] directoryToWatch:', directoryToWatch);

  const logDir = options.logDir || path.resolve(process.cwd(), 'logs');
  const onLog = typeof options.onLog === 'function' ? options.onLog : async () => { };

  console.log('[WATCHER] logDir definido como:', logDir);
  console.log('[WATCHER] process.cwd():', process.cwd());
  console.log('[WATCHER] options.logDir:', options.logDir);

  // Cria a pasta MosaicoElectron se ela não existir
  try {
    await fs.access(baseDirectory);
    console.log('[WATCHER] Pasta base já existe:', baseDirectory);
  } catch (error) {
    try {
      await fs.mkdir(baseDirectory, { recursive: true });
      console.log(`[WATCHER] Pasta base criada com sucesso: ${baseDirectory}`);
    } catch (mkdirError) {
      console.error(`[WATCHER] Erro ao criar pasta base ${baseDirectory}:`, mkdirError);
      throw new Error(`Não foi possível criar a pasta base ${baseDirectory}: ${mkdirError.message}`);
    }
  }

  // Cria a pasta específica do usuário se ela não existir
  try {
    await fs.access(userDirectory);
    console.log('[WATCHER] Pasta do usuário já existe:', userDirectory);
  } catch (error) {
    try {
      await fs.mkdir(userDirectory, { recursive: true });
      console.log(`[WATCHER] Pasta do usuário criada com sucesso: ${userDirectory}`);
    } catch (mkdirError) {
      console.error(`[WATCHER] Erro ao criar pasta do usuário ${userDirectory}:`, mkdirError);
      throw new Error(`Não foi possível criar a pasta do usuário ${userDirectory}: ${mkdirError.message}`);
    }
  }

  // Cria a pasta de logs se ela não existir
  try {
    await fs.access(logDir);
    console.log('[WATCHER] Pasta de logs já existe:', logDir);
  } catch (error) {
    try {
      await fs.mkdir(logDir, { recursive: true });
      console.log('[WATCHER] Pasta de logs criada:', logDir);
    } catch (mkdirError) {
      console.error('[WATCHER] Erro ao criar pasta de logs:', mkdirError);
      // Não falhar se não conseguir criar a pasta de logs
    }
  }

  // Definir caminho do arquivo de log
  const logFilePath = path.join(logDir, `watcher-user-${userId}-${new Date().toISOString().slice(0, 10)}.log`);
  console.log('[WATCHER] Arquivo de log:', logFilePath);

  // Verificar se conseguimos escrever no arquivo de log
  let canWriteLogs = false;
  try {
    await fs.access(path.dirname(logFilePath));
    canWriteLogs = true;
    console.log('[WATCHER] Logs podem ser escritos');
  } catch (error) {
    console.warn('[WATCHER] Não é possível escrever logs:', error.message);
    canWriteLogs = false;
  }

  async function writeLog(line) {
    const timestamp = new Date().toISOString();
    const content = `[${timestamp}] ${line}\n`;

    try {
      if (canWriteLogs) {
        await fs.appendFile(logFilePath, content);
        await onLog(content);
      } else {
        // Se não conseguir escrever logs, apenas usar console
        console.log(`[WATCHER-LOG] ${content.trim()}`);
      }
    } catch (err) {
      console.error('Failed to write log:', err);
      // Fallback para console
      console.log(`[WATCHER-LOG] ${content.trim()}`);
    }
  }

  // Função para buscar na API e criar pastas baseada no resultado
  async function buscarMosaicos() {
    try {
      await writeLog('[API] Iniciando busca de dados para criar pastas...');
      console.log('[WATCHER] Buscando dados da API para criar pastas...');

      let folders = [];

      // Tentar buscar mosaicos do usuário primeiro usando a função do api-config
      if (token) {
        try {
          await writeLog('[API] Buscando mosaicos do usuário...');
          console.log('[WATCHER] Chamando getMosaicosBg para userId:', userId, 'token:', !!token);

          // Chamar a função do api-config
          const userFolders = await getMosaicosBg(userId, token, proprietarioId);
          console.log('[WATCHER] Resposta de getMosaicosBg:', userFolders);


          if (userFolders.length > 0) {
            for (const folder of userFolders) {
              try {
                // Verificar se o objeto folder tem as propriedades necessárias
                if (!folder.nome) {
                  console.warn('[WATCHER] Objeto folder sem nome:', folder);
                  continue;
                }

                const folderPath = path.join(userDirectory, folder.nome);
                console.log('[WATCHER] Processando pasta:', folder.nome, 'caminho:', folderPath);

                // Verificar se a pasta já existe
                try {
                  await fs.access(folderPath);
                  await writeLog(`[API] Pasta já existe: ${folder.nome}`);
                  console.log(`[WATCHER] Pasta já existe: ${folderPath}`);
                } catch (error) {
                  // Pasta não existe, criar
                  await fs.mkdir(folderPath, { recursive: true });
                  await writeLog(`[API] Pasta criada com sucesso: ${folder.nome} - ${folder.descricao || 'Sem descrição'}`);
                  console.log(`[WATCHER] Pasta criada: ${folderPath}`);
                }
              } catch (folderError) {
                await writeLog(`[API] Erro ao criar pasta ${folder.nome}: ${folderError.message}`);
                console.error(`[WATCHER] Erro ao criar pasta ${folder.nome}:`, folderError);
              }
            }
          }
        } catch (error) {
          await writeLog(`[API] Erro ao buscar mosaicos do usuário: ${error.message}`);
          console.error('[WATCHER] Erro ao buscar mosaicos do usuário:', error);
        }
      } else {
        await writeLog('[API] Token não disponível, não é possível buscar mosaicos');
        console.log('[WATCHER] Token não disponível');
      }
    } catch (error) {
      await writeLog(`[API] Erro na busca/processamento da API: ${error.message}`);
      console.error('[WATCHER] Erro na busca/processamento da API:', error);
    }
  }

  // Chamar a função para criar pastas quando o watcher iniciar
  try {
    await buscarMosaicos();
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
        // TODO: Implementar criação de mosaico via IPC quando necessário
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

module.exports = { startWatcher };
