import { getMosaicos } from "@/api/services/mosaicoService";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [proprietarioId, setProprietarioId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState(null);
  const [emailUsuario, setEmailUsuario] = useState(null);
  const [ehUsuarioProprietario, setEhUsuarioProprietario] = useState(false);
  const [ehDiretor, setEhDiretor] = useState(false);
  const [plano, setPlano] = useState(null);
  const [mosaicos, setMosaicos] = useState(null);
  const [ehAdmin, setEhAdmin] = useState(false);

  const isAuthenticated = !!token;

  async function fetchMosaicos() {
    const resultado = await getMosaicos();
    setMosaicos(resultado);
  }

  // Função para iniciar o watcher
  async function startWatcher(userId, token, proprietarioId) {
    try {
      console.log('Tentando iniciar watcher para userId:', userId);
      console.log('Token disponivel:', token);
      console.log('ProprietarioId disponivel:', proprietarioId);
      console.log('window.watcherControls disponível:', !!window.watcherControls);
      
      if (window.watcherControls && window.watcherControls.start) {
        console.log('Chamando watcherControls.start...');
        const result = await window.watcherControls.start(userId, token, proprietarioId);
        console.log('Resultado do startWatcher:', result);
        
        if (result.success) {
          console.log('Watcher iniciado com sucesso para o usuário:', userId);
        } else {
          console.error('Erro ao iniciar watcher:', result.message);
        }
      } else {
        console.error('watcherControls não está disponível');
      }
    } catch (error) {
      console.error('Erro ao iniciar watcher:', error);
    }
  }

  // Função para parar o watcher
  async function stopWatcher() {
    try {
      if (window.watcherControls && window.watcherControls.stop) {
        const result = await window.watcherControls.stop();
        if (result.success) {
          console.log('Watcher parado com sucesso');
        } else {
          console.log('Watcher não estava ativo');
        }
      }
    } catch (error) {
      console.error('Erro ao parar watcher:', error);
    }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("auth");
    if (stored) {
      const data = JSON.parse(stored);
      setToken(data.token);
      setProprietarioId(data.proprietarioId);
      setNomeEmpresa(data.nomeProprietario);
      setEmailUsuario(data.emailUsuario);
      setPlano(data.plano);
      setUserId(data.userId);
      
      // Iniciar watcher se houver userId
      if (data.userId && data.token) {
        startWatcher(data.userId, data.token, data.proprietarioId);
      }
    }
  }, []);

  function login(data) {
    setToken(data.token);
    setUserId(data.userId);
    setEhDiretor(data.ehDiretor || false);
    setEhUsuarioProprietario(data.ehUsuarioProprietario || false);
    setProprietarioId(data.proprietarioId);
    setNomeEmpresa(data.nomeProprietario);
    setEmailUsuario(data.emailUsuario);
    setPlano(data.plano);
    setEhAdmin(data.ehAdmin || false);

    sessionStorage.setItem("auth", JSON.stringify(data));

    // Iniciar watcher para o usuário logado
    if (data.userId && data.token) {
      startWatcher(data.userId, data.token, data.proprietarioId);
    }
  }

  function salvarMosaicos(data) {
    setMosaicos(data);
  }

  function logout() {
    // Parar watcher antes de fazer logout
    stopWatcher();

    setToken(null);
    setProprietarioId(null);
    setNomeEmpresa(null);
    setEmailUsuario(null);
    setPlano(null);
    setEhAdmin(false);
    setMosaicos([]);
    setUserId(null);

    sessionStorage.removeItem("auth");
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        proprietarioId,
        userId,
        ehUsuarioProprietario,
        ehDiretor,
        setUserId,
        nomeEmpresa,
        emailUsuario,
        plano,
        setPlano,
        isAuthenticated,
        login,
        logout,
        salvarMosaicos,
        fetchMosaicos,
        mosaicos,
        ehAdmin,
        setNomeEmpresa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
