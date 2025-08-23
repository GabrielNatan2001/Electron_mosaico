import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { obterMetricasProprietarios } from "@/api/services/informacoesService";
import FiltroProprietario from "./FiltroProprietario";
import { ChevronDown, ChevronUp, Eye, Search, Settings } from "lucide-react";

const pageSize = 10;

const filtrosIniciais = {
  nome: "",
  nomePlano: "",
  dataCriacao: "",
  minUsuarios: "",
  minMosaicos: "",
  minTessela: "",
};

const ListaProprietario = () => {
  const { t } = useTranslation();

  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [proprietarios, setProprietarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const podeAvancar = proprietarios.length === pageSize;

  const limparFiltros = () => {
    setFiltros(filtrosIniciais);
  };

  const handleFiltroChange = (campo) => (e) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: e.target.value,
    }));
    setPaginaAtual(1);
  };

  const fetchMetricasProprietario = async (
    filtrosParaEnviar = filtros,
    pagina = paginaAtual
  ) => {
    setCarregando(true);

    try {
      const payload = Object.entries(filtrosParaEnviar).reduce(
        (acc, [key, val]) => {
          if (val !== "" && val != null) {
            let valorFinal = val;

            if (key === "nomePlano") {
              valorFinal = val.charAt(0).toUpperCase() + val.slice(1);
            }

            acc[key] = ["minUsuarios", "minMosaicos", "minTessela"].includes(
              key
            )
              ? Number(valorFinal)
              : valorFinal;
          }
          return acc;
        },
        {}
      );

      payload.page = pagina;
      payload.pageSize = pageSize;

      const response = await obterMetricasProprietarios(payload);

      setProprietarios(response);
    } catch (error) {
      console.error("Erro ao buscar métricas dos proprietarios:", error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltroNome = () => {
    const novosFiltros = { ...filtros, nome: nomeInput };
    setFiltros(novosFiltros);
    setPaginaAtual(1);
    fetchMetricasProprietario(novosFiltros, 1);
  };

  useEffect(() => {
    fetchMetricasProprietario();
  }, [paginaAtual]);

  const handleOpenFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const getPlanoClass = (nomePlano) => {
    const plano = nomePlano?.toLowerCase();

    switch (plano) {
      case "free":
        return "bg-green-100 text-green-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "prata":
        return "bg-gray-200 text-gray-800";
      case "exclusive":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-red-100 text-red-800";
      case "individual":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg dark:text-zinc-100 text-zinc-900">
      <div className="pb-2 px-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        {!isFilterOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              aplicarFiltroNome();
            }}
            className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <input
              type="text"
              placeholder={t("Buscar por nome...")}
              className="w-full focus:outline-none"
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
            />
            <button
              type="submit"
              aria-label={t("Buscar")}
              className="cursor-pointer"
            >
              <Search className="h-5" />
            </button>
          </form>
        )}

        <button
          className="flex px-4 py-2 rounded-lg items-center gap-2 bg-white/10 hover:bg-white/20 text-sm shadow-md hover:brightness-50 cursor-pointer w-full sm:w-auto"
          onClick={handleOpenFilters}
          type="button"
        >
          Filtros Avançados
          {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {isFilterOpen && (
        <div id="filtro-avancado" className="px-4">
          <FiltroProprietario
            limparFiltros={limparFiltros}
            filtros={filtros}
            onFiltroChange={handleFiltroChange}
            onSubmit={fetchMetricasProprietario}
          />
        </div>
      )}

      {carregando ? (
        <div className="p-4 text-center">
          {t("metricas.carregandoMetricas")}
        </div>
      ) : (
        <>
          <table className="min-w-full text-sm">
            <thead className="text-center text-xs dark:text-zinc-100 text-zinc-900 uppercase">
              <tr>
                <th className="text-left px-4 py-3">
                  {t("metricas.proprietario")}
                </th>
                <th className="text-left px-4 py-3">
                  {t("metricas.cadastro")}
                </th>
                <th className="px-4 py-3">
                  {t("metricas.usuariosVinculados")}
                </th>
                <th className="px-4 py-3">{t("metricas.mosaicos")}</th>
                <th className="px-4 py-3">
                  {t("metricas.quantidadeDeTesselas")}
                </th>
                <th className="px-4 py-3">{t("metricas.plano")}</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {proprietarios.map((item) => (
                <tr key={item.proprietarioId}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {item.nome}
                  </td>
                  <td className="px-4 py-3">
                    {format(new Date(item.dataDeCadastro), "dd/MM/yyyy")}
                  </td>
                  <td className="text-center px-4 py-3">
                    {item.quantidadeDeUsuariosVinculados}
                  </td>
                  <td className="text-center px-4 py-3">
                    {item.quantidadeDeMosaicos}
                  </td>
                  <td className="text-center px-4 py-3">
                    {item.quantidadeDeTesselas}
                  </td>
                  <td className="text-center px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getPlanoClass(
                        item.nomePlano
                      )}`}
                    >
                      {item.nomePlano}
                    </span>
                  </td>
                  <td className="flex items-center justify-center text-center px-4 py-3 text-white">
                    <Link
                      to={`/proprietarios/${item.proprietarioId}/detalhes`}
                      className="cursor-pointer px-2 py-1 text-xs font-medium rounde"
                    >
                      <Eye className="text-black dark:text-white" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between mt-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-700 text-sm">
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded disabled:opacity-50"
            >
              {t("businessRegister.back")}
            </button>

            <button
              onClick={() => setPaginaAtual((prev) => prev + 1)}
              disabled={!podeAvancar}
              className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded disabled:opacity-50"
            >
              {t("businessRegister.next")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaProprietario;
