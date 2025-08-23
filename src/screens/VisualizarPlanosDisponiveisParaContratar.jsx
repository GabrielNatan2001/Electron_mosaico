import { useEffect, useState } from "react";
import {
  listarPlanos,
  solicitarNovoPlano,
} from "@/api/services/proprietarioService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PlanoDetailsCard from "@/components/planosDisponiveis/PlanoDetailsCard";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "@/components/theme/darkToggleMode";
import { toast } from "react-toastify";
import BotaoCancelarPlano from "@/components/dashboard/BotaoCancelarPlano";

export default function VisualizarPlanosDisponiveisParaContratar() {
  const { t } = useTranslation();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciclo, setCiclo] = useState("mensal");
  const navigate = useNavigate();
  const { plano, proprietarioId } = useAuth();
  const [loadingAssinarId, setLoadingAssinarId] = useState(null);

  useEffect(() => {
    listarPlanos().then(({ data }) => {
      const nomePlanoAtual = String(plano || "").toLowerCase();

      const planosFiltrados = data.filter((plano) => {
        const nome = plano.nome.toLowerCase();
        return (
          nome !== "exclusive" && nome !== "free" && nome !== nomePlanoAtual
        );
      });

      setPlanos(planosFiltrados);
      setLoading(false);
    });
  }, [plano]);

  const handleAssinar = async (id) => {
    try {
      setLoadingAssinarId(id);
      const { data } = await solicitarNovoPlano({
        NovoPlanoId: id,
        tipoCobranca: ciclo === "mensal" ? "Mensal" : "Anual",
        ProprietarioId: proprietarioId,
      });

      window.location.href = data;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingAssinarId(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-white text-gray-900 dark:bg-gradient-to-br dark:from-[#1f2a40] dark:via-[#2e3e5c] dark:to-[#25314d] dark:text-white transition-colors duration-300">
      <DarkModeToggle />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-4 text-gray-500 hover:text-gray-900 dark:text-white/80 dark:hover:text-white"
      >
        <ArrowLeft size={20} className="mr-2" />
        {t("visualizarPlanos.voltar")}
      </button>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Award size={28} /> {t("visualizarPlanos.titulo")}
      </h1>

      {plano && plano.toLowerCase() !== "free" && (
        <div className="mb-8">
          <BotaoCancelarPlano />
        </div>
      )}

      <div className="flex justify-center mb-10">
        {planos.length > 0 && (
          <div className="relative w-36 h-10 bg-gray-200 rounded-full flex items-center px-1">
            <div
              className={`absolute top-1/2 h-8 w-[calc(50%-6px)] -translate-y-1/2 rounded-full bg-black transition-all duration-300 ${
                ciclo === "anual" ? "left-[4px]" : "left-[calc(50%+2px)]"
              }`}
            />
            {["anual", "mensal"].map((op) => (
              <button
                key={op}
                onClick={() => setCiclo(op)}
                className="relative z-10 w-1/2 text-sm font-semibold flex justify-center items-center"
              >
                <span className={ciclo === op ? "text-white" : "text-gray-800"}>
                  {t(`visualizarPlanos.ciclos.${op}`)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-white/70">{t("visualizarPlanos.carregando")}</p>
      ) : planos.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map((p, i) => (
            <PlanoDetailsCard
              key={p.id}
              plano={p}
              ciclo={ciclo}
              onAssinar={handleAssinar}
              isRecommended={i === 1}
              loading={loadingAssinarId === p.id}
              planoAtivoId={plano}
            />
          ))}
        </div>
      ) : (
        <p className="text-white/70">{t("visualizarPlanos.nenhumPlano")}</p>
      )}
    </div>
  );
}
