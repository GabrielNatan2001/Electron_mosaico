import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "../screens/Login";
import ForgotPassword from "@/screens/ForgotPassword";
import { MosaicoPage } from "@/screens/MosaicoPage";
import ResetPassword from "@/screens/ResetPassword";
import { PrivateRoute } from "./PrivateRoutes.jsx";
import Register from "@/screens/Register";
import Dashboard from "@/screens/Dashboard";
import { Info } from "@/screens/Info";
import { useAuth } from "@/context/AuthContext";
import { getMosaicos } from "@/api/services/mosaicoService";
import PlanSuccess from "@/screens/PlanSuccess";
import PlanError from "@/screens/PlanError";
import VisualizarPlanosDisponiveisParaContratar from "@/screens/VisualizarPlanosDisponiveisParaContratar";
import NotFound from "@/screens/NotFound";
import IdiomaIndisponivel from "@/components/info/IdiomaIndisponivel";
import PoliticaPrivacidadePage from "@/screens/PoliticaPrivacidadePage";
import MetricsDashboard from "@/screens/Metricas";
import DetalhesProprietarioPage from "@/components/metricas/DetalhesProprietarioPage";
import { ObterMosaicosPublicos } from "@/api/services/informacoesService";
import { MosaicoPagePath } from "@/screens/MosaicoPagePath";
import EmailConfirmed from "@/screens/EmailConfirmed";

const PagesRoutes = () => {
  const { mosaicos, salvarMosaicos, isAuthenticated, login } = useAuth();
  const [mosaicosPublicos, setMosaicosPublicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !mosaicos) {
      (async () => {
        const mosaicosUsuario = await getMosaicos();
        salvarMosaicos(mosaicosUsuario);
      })();
    }
  }, [isAuthenticated, mosaicos]);

  useEffect(() => {
    const carregarMosaicosPublicos = async () => {
      try {
        const mosaicosSession = sessionStorage.getItem("mosaicosPublicos");

        if (mosaicosSession) {
          setMosaicosPublicos(JSON.parse(mosaicosSession));
        } else {
          const mosaicosPublicados = await ObterMosaicosPublicos();
          setMosaicosPublicos(mosaicosPublicados);
          sessionStorage.setItem(
            "mosaicosPublicos",
            JSON.stringify(mosaicosPublicados)
          );
        }
      } catch (error) {
        console.error("Erro ao carregar mosaicos públicos:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarMosaicosPublicos();
  }, []);

  // Restaurar sessão
  useEffect(() => {
    const sessionStoreDate = sessionStorage.getItem("auth");
    if (sessionStoreDate) {
      const dadosLogin = JSON.parse(sessionStoreDate);
      login(dadosLogin);
    }
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* Rotas estáticas */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/info" element={<Info />} />
      <Route path="/info/:path" element={<Info />} />
      <Route path="/idioma-indisponivel" element={<IdiomaIndisponivel />} />
      <Route path="/email-confirmed" element={<EmailConfirmed />} />
      <Route
        path="/politica-privacidade"
        element={<PoliticaPrivacidadePage />}
      />

      {/* Rotas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/mosaico/:id" element={<MosaicoPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/proprietarios/:id/detalhes"
          element={<DetalhesProprietarioPage />}
        />
        <Route
          path="/planos-disponiveis"
          element={<VisualizarPlanosDisponiveisParaContratar />}
        />
        <Route path="/plans-success" element={<PlanSuccess />} />
        <Route path="/plans-error" element={<PlanError />} />
        <Route path="/metricas" element={<MetricsDashboard />} />
      </Route>

      {/* Rotas dinâmicas para mosaicos públicos */}
      {mosaicosPublicos.map((mosaico) => (
        <Route
          key={mosaico.mosaicoPath || mosaico.id}
          path={`/publicos/${mosaico.mosaicoPath}`}
          element={<MosaicoPagePath />}
        />
      ))}

      {/* Rotas de fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default PagesRoutes;
