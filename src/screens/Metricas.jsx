import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import DarkModeToggle from "@/components/theme/darkToggleMode";
import { obterMetricas } from "@/api/services/informacoesService";
import { useNavigate } from "react-router-dom";
import { LinhaDoTempoGrafico } from "@/components/metricas/LinhaDoTempoGrafico";
import ListaProprietario from "@/components/metricas/ListaProprietario";
import DadosFinanceiros from "@/components/metricas/DadosFinanceiros";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export default function MetricsDashboard() {
  const [metricas, setMetricas] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("gerais");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setAbaAtiva(tab);
  }, [location.search]);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const response = await obterMetricas();
        setMetricas(response);
      } catch (error) {
        console.error("Erro ao buscar métricas:", error);
      }
    };

    fetchMetricas();
  }, []);

  const METRICAS_LABELS = {
    quantidadeTotalDeUsuarios: `${t("metricas.quantidadeTotalDeUsuarios")}`,
    quantidadeTotalDeMosaicos: `${t("metricas.quantidadeTotalDeMosaicos")}`,
    quantidadeTotalDeTesselas: `${t("metricas.quantidadeTotalDeTesselas")}`,
    quantidadeTotalDeConteudos: `${t("metricas.quantidadeTotalDeConteudos")}`,
    quantidadeMediaDeTesselasPorMosaico: `${t(
      "metricas.quantidadeMediaDeTesselasPorMosaico"
    )}`,
    quantidadeMediaDeConteudosPorTessela: `${t(
      "metricas.quantidadeMediaDeConteudosPorTessela"
    )}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fefefe] via-[#f5f8fb] to-[#e8eef5] dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-gray-900 dark:text-white">
      <main className="p-6 space-y-10">
        <DarkModeToggle />

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} className="mt-1" />
          </button>

          <h1 className="text-2xl font-bold">
            {t("metricas.dashboardMetricas")}
          </h1>
        </div>

        {/* Abas */}
        <div className="flex gap-4 border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setAbaAtiva("gerais")}
            className={`cursor-pointer py-2 px-4 font-medium transition ${
              abaAtiva === "gerais"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-300"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
            }`}
          >
            {t("metricas.abaGerais")}
          </button>
          <button
            onClick={() => setAbaAtiva("proprietarios")}
            className={`cursor-pointer py-2 px-4 font-medium transition ${
              abaAtiva === "proprietarios"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-300"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
            }`}
          >
            {t("metricas.abaProprietarios")}
          </button>
          <button
            onClick={() => setAbaAtiva("financeiros")}
            className={`cursor-pointer py-2 px-4 font-medium transition ${
              abaAtiva === "financeiros"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-300"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
            }`}
          >
            Dados Financeiros (BETA)
          </button>
        </div>

        <div className="mt-6 space-y-8 transition-all duration-500 ease-in-out">
          {/* Aba Gerais */}
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              abaAtiva === "gerais" ? "opacity-100 block" : "opacity-0 hidden"
            }`}
          >
            {metricas ? (
              <>
                {/* Cards de métricas */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Object.entries(METRICAS_LABELS).map(([key, label]) => (
                    <div key={key} className="p-4 text-left">
                      <p className="text-base font-medium text-gray-700 dark:text-gray-400">
                        {label}
                      </p>
                      <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                        {metricas[key]}
                      </p>
                    </div>
                  ))}
                </div>

                {metricas.linhaDoTempo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                    <LinhaDoTempoGrafico
                      data={metricas.linhaDoTempo.mosaicos}
                      titulo={t("metricas.graficoMosaicosCriados")}
                    />
                    <LinhaDoTempoGrafico
                      data={metricas.linhaDoTempo.tesselas}
                      titulo={t("metricas.graficoTesselasCriadas")}
                    />
                    <LinhaDoTempoGrafico
                      data={metricas.linhaDoTempo.conteudos}
                      titulo={t("metricas.graficoConteudosAdicionados")}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center mt-10">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-300" />
                <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                  {t("metricas.carregandoMetricas")}
                </span>
              </div>
            )}
          </div>

          {/* Aba Proprietarios */}
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              abaAtiva === "proprietarios"
                ? "opacity-100 block"
                : "opacity-0 hidden"
            }`}
          >
            <ListaProprietario />
          </div>
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              abaAtiva === "financeiros"
                ? "opacity-100 block"
                : "opacity-0 hidden"
            }`}
          >
            <DadosFinanceiros />
          </div>
        </div>
      </main>
    </div>
  );
}
