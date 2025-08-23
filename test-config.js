// Configuração de teste para o watcher
module.exports = {
  // Configurações de teste
  test: {
    userId: "49efa076-d875-4d45-84a7-b4f35d550002",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ikx1Y2NhcyBUZXN0ZSBzZSB2ZSBtb3NhaWNvIiwicm9sZSI6Ik9wZXJhZG9yIiwiUHJvcHJpZXRhcmlvSWQiOiI2YzQ5ZTdjZi1iZWQ1LTQ4NWEtYmIyMi1lYjUxODUyYzkwYjMiLCJuYmYiOjE3NTU5OTA0NDksImV4cCI6MTc1NTk5NDA0OSwiaWF0IjoxNzU1OTkwNDQ5LCJpc3MiOiJUbG0tTW9zYWljbyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0In0.x5Ip9nY9Jzx161ZN7aeJkHLke6j9zssTmvAichayLHQ",
    proprietarioId: "6c49e7cf-bed5-485a-bb22-eb51852c90b3",
    logDir: './logs',
    timeout: 5000,
    cleanup: true
  },
  
  // Configurações da API
  api: {
    baseURL: 'https://localhost:7262/api/v1',
    environment: 'development',
    debug: true,
    logLevel: 'debug'
  },
  
  // Configurações do watcher
  watcher: {
    ignoreInitial: false,
    persistent: true,
    depth: 99,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }
};
