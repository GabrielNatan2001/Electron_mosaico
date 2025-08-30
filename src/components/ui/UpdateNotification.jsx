import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, AlertCircle, Info, X } from 'lucide-react';

const UpdateNotification = () => {
  console.log('🔄 UpdateNotification - Componente sendo renderizado/montado'); // Debug
  console.log('🔄 UpdateNotification - TESTE DE LOG SIMPLES'); // Debug
  
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Escutar eventos de atualização do processo principal
    const handleUpdateStatus = (event, data) => {
      console.log('🎯 Evento recebido no componente:', data); // Debug
      console.log('🔄 Atualizando status para:', data.status); // Debug
      console.log('🎯 TESTE - Status recebido:', data.status); // Debug
      
      // Se não há atualização disponível, fechar a notificação IMEDIATAMENTE
      if (data.status === 'not-available' || data.status === 'no-update') {
        console.log('📭 FECHANDO NOTIFICAÇÃO - sem atualizações disponíveis'); // Debug
        console.log('🔒 Estado anterior - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
        console.log('📭 TESTE - Status not-available detectado!'); // Debug
        
        console.log('🚀 ANTES de setIsVisible(false)'); // Debug
        
        // Forçar fechamento imediato usando callback para garantir execução
        setIsVisible(() => {
          console.log('🔒 CALLBACK setIsVisible(false) executado - retornando false'); // Debug
          return false;
        });
        
        console.log('🚀 ANTES de setUpdateStatus(null)'); // Debug
        
        setUpdateStatus(() => {
          console.log('🔒 CALLBACK setUpdateStatus(null) executado - retornando null'); // Debug
          return null;
        });
        
        console.log('✅ Comandos de fechamento enviados para not-available'); // Debug
        console.log('⏳ Aguardando atualização do estado...'); // Debug
        return;
      }
      
      console.log('📢 Mostrando notificação com status:', data.status); // Debug
      setUpdateStatus(data);
      setIsVisible(true);
    };

    window.electronAPI?.on('update-status', handleUpdateStatus);

    // Verificar status inicial
    checkUpdateStatus();
    
    // Verificar se há atualizações disponíveis periodicamente (a cada 5 minutos)
    const interval = setInterval(() => {
      console.log('⏰ Verificação periódica de atualizações...'); // Debug
      checkUpdateStatus();
    }, 5 * 60 * 1000); // 5 minutos
    
    // Verificação de emergência: se o status for not-available, fechar imediatamente
    const emergencyCheck = setInterval(() => {
      console.log('🚨 VERIFICAÇÃO DE EMERGÊNCIA - Verificando status...'); // Debug
      console.log('🚨 Estado atual na verificação:', { isVisible, updateStatus }); // Debug
      
      if (updateStatus && (updateStatus.status === 'not-available' || updateStatus.status === 'no-update')) {
        console.log('🚨 VERIFICAÇÃO DE EMERGÊNCIA - Status not-available detectado, fechando!'); // Debug
        console.log('🚨 Status detectado:', updateStatus.status); // Debug
        
        setIsVisible(false);
        setUpdateStatus(null);
        
        console.log('🚨 Comandos de emergência enviados!'); // Debug
      } else {
        console.log('🚨 Verificação de emergência - Status OK:', updateStatus?.status || 'sem status'); // Debug
      }
    }, 500); // Verificar a cada 500ms
    
    // Cleanup function
    return () => {
      // Remover listeners quando componente for desmontado
      // Nota: electronAPI pode não ter métodos de remoção de listeners
      // O garbage collector do React vai limpar automaticamente
      clearInterval(interval);
      clearInterval(emergencyCheck);
    };
  }, []);

  // Debug: Monitorar mudanças no estado
  useEffect(() => {
    console.log('🔍 Estado atualizado - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
    console.log('🔍 Tipo de isVisible:', typeof isVisible, 'Valor:', isVisible); // Debug
    console.log('🔍 Tipo de updateStatus:', typeof updateStatus, 'Valor:', updateStatus); // Debug
    
    // Se o estado mudou para fechado, verificar se está funcionando
    if (!isVisible && !updateStatus) {
      console.log('🎉 Componente foi fechado com sucesso!'); // Debug
    } else if (isVisible && updateStatus) {
      console.log('📱 Componente está visível com status:', updateStatus.status); // Debug
    } else {
      console.log('❓ Estado misto - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
    }
  }, [isVisible, updateStatus]);

  // Efeito para limpar automaticamente após um tempo se não houver ação
  useEffect(() => {
    if (isVisible && updateStatus) {
      let timeout;
      
      // Se for status de erro, limpar após 10 segundos
      if (updateStatus.status === 'error') {
        timeout = setTimeout(() => {
          console.log('⏰ Timeout de erro - fechando notificação'); // Debug
          setIsVisible(false);
          setUpdateStatus(null);
        }, 10000);
      }
      // Se for status de sucesso (downloaded), limpar após 30 segundos
      else if (updateStatus.status === 'downloaded') {
        timeout = setTimeout(() => {
          console.log('⏰ Timeout de sucesso - fechando notificação'); // Debug
          setIsVisible(false);
          setUpdateStatus(null);
        }, 30000);
      }
      // Se for status not-available, limpar após 1 segundo (fallback mais rápido)
      else if (updateStatus.status === 'not-available') {
        timeout = setTimeout(() => {
          console.log('⏰ Timeout de not-available - fechando notificação (fallback)'); // Debug
          setIsVisible(false);
          setUpdateStatus(null);
        }, 1000);
      }
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [isVisible, updateStatus]);

  const clearUpdateFlags = async () => {
    try {
      console.log('🧹 Limpando flags de atualização...'); // Debug
      await window.electronAPI?.invoke('updater:clear-flags');
      console.log('✅ Flags limpas com sucesso'); // Debug
    } catch (error) {
      console.error('❌ Erro ao limpar flags:', error);
    }
  };

  const checkUpdateStatus = async () => {
    try {
      console.log('🔍 Verificando status inicial da atualização...'); // Debug
      console.log('🔒 Estado atual antes da verificação - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
      console.log('🔍 TESTE - Função checkUpdateStatus chamada'); // Debug
      
      const status = await window.electronAPI?.invoke('updater:get-status');
      console.log('📊 Status inicial recebido:', status); // Debug
      
      // Se não há status ou não há atualização disponível, não mostrar a notificação
      if (!status || (!status.isUpdateAvailable && !status.isUpdateDownloaded)) {
        console.log('📭 Nenhuma atualização disponível, fechando notificação'); // Debug
        setIsVisible(false);
        setUpdateStatus(null);
        
        // Limpar flags no backend se necessário
        if (status && status.error) {
          console.log('⚠️ Erro detectado, limpando flags...'); // Debug
          await clearUpdateFlags();
        }
        return;
      }
      
      // Se há atualização disponível E a notificação não está visível, mostrar a notificação
      if (status && (status.isUpdateAvailable || status.isUpdateDownloaded) && !isVisible) {
        console.log('✅ Atualização disponível, mostrando notificação'); // Debug
        setUpdateStatus({
          status: status.isUpdateDownloaded ? 'downloaded' : 'available',
          info: { 
            version: status.version || status.info?.version || 'Nova versão',
            ...status.info 
          }
        });
        setIsVisible(true);
      } else if (status && (status.isUpdateAvailable || status.isUpdateDownloaded) && isVisible) {
        console.log('ℹ️ Atualização já está sendo exibida, não reabrindo'); // Debug
      }
    } catch (error) {
      console.error('💥 Erro ao verificar status da atualização:', error);
      // Em caso de erro, não mostrar a notificação
      setIsVisible(false);
      setUpdateStatus(null);
      
      // Tentar limpar flags em caso de erro
      try {
        await clearUpdateFlags();
      } catch (clearError) {
        console.error('❌ Erro ao limpar flags:', clearError);
      }
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
      console.log('🚀 Iniciando download...'); // Debug
      console.log('📡 Chamando updater:download-update...'); // Debug
      
      // IMPORTANTE: Mostrar status de downloading imediatamente
      setUpdateStatus({
        status: 'downloading',
        message: 'Baixando atualização...'
      });
      
      const resultado = await window.electronAPI?.invoke('updater:download-update');
      console.log('✅ Resultado do download:', resultado); // Debug
      
      if (resultado && resultado.success) {
        console.log('🎉 Download iniciado com sucesso!'); // Debug
        console.log('⏳ Aguardando evento de status do backend...'); // Debug
      } else {
        console.error('❌ Download falhou:', resultado); // Debug
        // Se falhou, voltar para status disponível
        setUpdateStatus({
          status: 'available',
          info: updateStatus.info
        });
      }
    } catch (error) {
      console.error('💥 Erro ao baixar atualização:', error);
      // Se erro, voltar para status disponível
      setUpdateStatus({
        status: 'available',
        info: updateStatus.info
      });
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
    console.log('👆 Usuário fechou manualmente a notificação'); // Debug
    setIsVisible(false);
    setUpdateStatus(null);
  };

  // Verificação adicional: se o status for not-available, forçar fechamento
  if (updateStatus && (updateStatus.status === 'not-available' || updateStatus.status === 'no-update')) {
    console.log('🚫 Status not-available detectado na renderização - forçando fechamento'); // Debug
    console.log('🚫 Estado na renderização:', { isVisible, updateStatus }); // Debug
    console.log('🚫 TESTE - Renderização detectou not-available!'); // Debug
    
    // Forçar fechamento imediato
    setIsVisible(false);
    setUpdateStatus(null);
    
    console.log('🚫 Comandos de fechamento na renderização enviados!'); // Debug
    return null;
  }

  if (!isVisible || !updateStatus) {
    console.log('🚫 Componente não renderizado - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
    console.log('🚫 Condição de renderização:', { 
      '!isVisible': !isVisible, 
      '!updateStatus': !updateStatus,
      'isVisible === false': isVisible === false,
      'updateStatus === null': updateStatus === null
    }); // Debug
    console.log('🚫 TESTE - Componente não renderizado!'); // Debug
    return null;
  }

  console.log('🎨 Renderizando componente - isVisible:', isVisible, 'updateStatus:', updateStatus); // Debug
  console.log('🎨 Status do componente:', updateStatus.status); // Debug
  console.log('🎨 TESTE - Componente sendo renderizado!'); // Debug

  const getStatusIcon = () => {
    switch (updateStatus.status) {
      case 'available':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
                       case 'installing':
                   return <CheckCircle className="w-5 h-5 text-orange-500 animate-pulse" />;
                 case 'installation-started':
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
                       case 'installing':
                   return updateStatus.message || 'Instalação em andamento...';
                 case 'installation-started':
                   return updateStatus.message || 'Instalação iniciada! Feche a aplicação manualmente.';
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
                              case 'installing':
                   return (
                     <div className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                       Instalando atualização...
                     </div>
                   );
                 case 'installation-started':
                   return (
                     <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                       Instalação iniciada! Feche a aplicação manualmente.
                     </div>
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
    if (updateStatus.status === 'downloading') {
      return (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse"
            style={{ width: '100%' }}
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
          
          {/* Ícone à esquerda */}
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getStatusMessage()}
              </p>
              
              {/* Botão de fechar alinhado à direita */}
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {updateStatus.info && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Versão: {updateStatus.info.version}
              </p>
            )}
            
            {updateStatus.message && updateStatus.status === 'installing' && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {updateStatus.message}
              </p>
            )}
            
            {getProgressBar()}
            
            <div className="mt-3 flex space-x-2">
              {getActionButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default UpdateNotification;
