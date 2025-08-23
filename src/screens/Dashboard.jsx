import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext.jsx";
import { obterUsuariosVinculadosAoProprietario } from "@/api/services/authServices";
import { listarPlanos } from "@/api/services/proprietarioService";
import { CardMosaicoDashboard } from "@/components/dashboard/CardMosaicoDashboard";
import PlanosDisponiveis from "@/components/dashboard/PlanosDisponiveis";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DarkModeToggle from "@/components/theme/darkToggleMode";

export default function Dashboard() {
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState([]);

  const { mosaicos, plano, proprietarioId, logout, ehAdmin, fetchMosaicos } =
    useAuth();

  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      const { data } = await obterUsuariosVinculadosAoProprietario(
        proprietarioId
      );
      setUsuarios(data);
    } catch {}
  };

  const fetchPlanos = async () => {
    try {
      const { data } = await listarPlanos();
      setPlanos(data);
    } catch {}
  };

  const handleLogout = () => {
    navigate("/login");
    logout();
  };

  useEffect(() => {
    if (proprietarioId) {
      if (!Array.isArray(mosaicos) || mosaicos.length === 0) fetchMosaicos();
      fetchUsuarios();
      fetchPlanos();
    }
  }, [proprietarioId]);

  return (
    <DashboardLayout
      ehAdmin={ehAdmin}
      planos={planos}
      fetchPlanos={fetchPlanos}
      fetchUsuarios={fetchUsuarios}
      usuarios={usuarios}
      plano={plano}
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:pl-12 lg:pl-12 font-bold text-gray-900 dark:text-white">
            {t("dashboard.controlPanel")}
          </h1>
        </div>
      </div>
      <DarkModeToggle />

      <div className="space-y-8">
        <div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.isArray(mosaicos) && mosaicos.length > 0 ? (
              mosaicos
                .sort((a, b) => Number(a.ehGlobal) - Number(b.ehGlobal))
                .map((mosaic) => (
                  <CardMosaicoDashboard key={mosaic.id} mosaic={mosaic} />
                ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Nenhum mosaico encontrado.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Crie seu primeiro mosaico usando o menu lateral
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Planos */}
        <div>
          <div className="max-w-md">
            <PlanosDisponiveis
              ehAdmin={ehAdmin}
              planos={planos}
              fetchPlanos={fetchPlanos}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
