import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, AlertCircle, Info, X } from 'lucide-react';

const UpdateNotification = () => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Escutar eventos de atualização do processo principal
    window.electronAPI?.on('update-status', (data) => {
      setUpdateStatus(data);
      setIsVisible(true);
    });

    // Verificar status inicial
    checkUpdateStatus();
  }, []);

  const checkUpdateStatus = async () => {
    try {
      const status = await window.electronAPI?.invoke('updater:get-status');
      if (status && (status.isUpdateAvailable || status.isUpdateDownloaded)) {
        setUpdateStatus({
          status: status.isUpdateDownloaded ? 'downloaded' : 'available'
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status da atualização:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      await window.electronAPI?.invoke('updater:check-for-updates');
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      await window.electronAPI?.invoke('updater:download-update');
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.electronAPI?.invoke('updater:install-update');
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateStatus) return null;

  const getStatusIcon = () => {
    switch (updateStatus.status) {
      case 'available':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (updateStatus.status) {
      case 'available':
        return 'Nova atualização disponível!';
      case 'downloading':
        return 'Baixando atualização...';
      case 'downloaded':
        return 'Atualização pronta para instalar!';
      case 'error':
        return `Erro: ${updateStatus.error || 'Erro desconhecido'}`;
      default:
        return 'Verificando atualizações...';
    }
  };

  const getActionButton = () => {
    switch (updateStatus.status) {
      case 'available':
        return (
          <button
            onClick={handleDownloadUpdate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Baixar
          </button>
        );
      case 'downloaded':
        return (
          <button
            onClick={handleInstallUpdate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Instalar
          </button>
        );
      case 'error':
        return (
          <button
            onClick={handleCheckForUpdates}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        );
      default:
        return null;
    }
  };

  const getProgressBar = () => {
    if (updateStatus.status === 'downloading' && updateStatus.progress) {
      const percent = Math.round(updateStatus.progress.percent || 0);
      return (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getStatusMessage()}
            </p>
            
            {updateStatus.info && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Versão: {updateStatus.info.version}
              </p>
            )}
            
            {getProgressBar()}
            
            <div className="mt-3 flex space-x-2">
              {getActionButton()}
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
