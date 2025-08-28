import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, AlertCircle, Loader2 } from 'lucide-react';

const UpdateStatus = () => {
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listeners para eventos de atualização
    const handleUpdateChecking = () => {
      setUpdateStatus('checking');
      setError(null);
    };

    const handleUpdateAvailable = (event, info) => {
      setUpdateStatus('available');
      setUpdateInfo(info);
      setError(null);
    };

    const handleUpdateNotAvailable = () => {
      setUpdateStatus('not-available');
      setError(null);
    };

    const handleUpdateError = (event, errorMessage) => {
      setUpdateStatus('error');
      setError(errorMessage);
    };

    const handleDownloadProgress = (event, progressObj) => {
      setUpdateStatus('downloading');
      setDownloadProgress(progressObj.percent || 0);
    };

    const handleUpdateDownloaded = (event, info) => {
      setUpdateStatus('downloaded');
      setUpdateInfo(info);
      setError(null);
    };

    // Adicionar listeners
    if (window.electronAPI) {
      window.electronAPI.on('update:checking', handleUpdateChecking);
      window.electronAPI.on('update:available', handleUpdateAvailable);
      window.electronAPI.on('update:not-available', handleUpdateNotAvailable);
      window.electronAPI.on('update:error', handleUpdateError);
      window.electronAPI.on('update:download-progress', handleDownloadProgress);
      window.electronAPI.on('update:downloaded', handleUpdateDownloaded);
    }

    return () => {
      // Cleanup listeners
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('update:checking');
        window.electronAPI.removeAllListeners('update:available');
        window.electronAPI.removeAllListeners('update:not-available');
        window.electronAPI.removeAllListeners('update:error');
        window.electronAPI.removeAllListeners('update:download-progress');
        window.electronAPI.removeAllListeners('update:downloaded');
      }
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      setUpdateStatus('checking');
      setError(null);
      await window.electronAPI.invoke('update:check');
    } catch (err) {
      setError('Erro ao verificar atualizações');
      setUpdateStatus('error');
    }
  };

  const downloadUpdate = async () => {
    try {
      await window.electronAPI.invoke('update:download');
    } catch (err) {
      setError('Erro ao baixar atualização');
      setUpdateStatus('error');
    }
  };

  const installUpdate = async () => {
    try {
      await window.electronAPI.invoke('update:install');
    } catch (err) {
      setError('Erro ao instalar atualização');
      setUpdateStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (updateStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'available':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'downloading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'downloaded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'not-available':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (updateStatus) {
      case 'checking':
        return 'Verificando atualizações...';
      case 'available':
        return `Nova versão disponível: ${updateInfo?.version || 'N/A'}`;
      case 'downloading':
        return `Baixando atualização... ${Math.round(downloadProgress)}%`;
      case 'downloaded':
        return 'Atualização baixada e pronta para instalar';
      case 'error':
        return `Erro: ${error}`;
      case 'not-available':
        return 'Aplicativo está atualizado';
      default:
        return 'Verificar atualizações';
    }
  };

  const getActionButton = () => {
    switch (updateStatus) {
      case 'available':
        return (
          <button
            onClick={downloadUpdate}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Baixar Atualização
          </button>
        );
      case 'downloaded':
        return (
          <button
            onClick={installUpdate}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Instalar Agora
          </button>
        );
      case 'error':
        return (
          <button
            onClick={checkForUpdates}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Tentar Novamente
          </button>
        );
      default:
        return (
          <button
            onClick={checkForUpdates}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Verificar Atualizações
          </button>
        );
    }
  };

  if (updateStatus === 'idle') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {getActionButton()}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {getStatusIcon()}
      <span className="text-gray-700">{getStatusText()}</span>
      {updateStatus !== 'checking' && updateStatus !== 'downloading' && getActionButton()}
    </div>
  );
};

export default UpdateStatus;
