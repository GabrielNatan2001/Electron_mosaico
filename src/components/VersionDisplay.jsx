import { useEffect, useState } from 'react';

export default function VersionDisplay() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Em Electron, podemos acessar a versão através do processo principal
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setVersion);
    } else {
      // Fallback para desenvolvimento web - usar versão hardcoded do package.json
      setVersion('0.0.0');
    }
  }, []);

  if (!version) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="text-xs font-mono text-white dark:text-gray-200">
        <span className="text-xs opacity-80">versão</span> {version}
      </div>
    </div>
  );
}
