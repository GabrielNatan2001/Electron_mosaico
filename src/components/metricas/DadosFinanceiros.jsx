import { useEffect, useMemo, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { obterTotaisMes } from "@/api/services/metricasService";

export default function DadosFinanceiros() {
  const cores = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
  ];
  const [tipo, setTipo] = useState("mes");
  const [valor, setValor] = useState("2025-08");
  const [dados, setDados] = useState(null);
  const [metrica, setMetrica] = useState("receita");

  useEffect(() => {
    if (tipo !== "mes") return;
    setDados(null);
    const [ano, mes] = valor.split("-");
    obterTotaisMes(ano, Number(mes)).then((res) => {
      setDados({
        ...res,
        receitaPeriodo: [],
        cancelamentosPeriodo: [],
        usuariosFreePeriodo: [],
        planosMaisAdquiridos: [],
      });
    });
  }, [tipo, valor]);

  const opcoes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const mes = (i + 1).toString().padStart(2, "0");
      const label = new Date(2025, i).toLocaleDateString("pt-BR", {
        month: "long",
      });
      return {
        v: `2025-${mes}`,
        l: `${label[0].toUpperCase() + label.slice(1)}/2025`,
      };
    });
  }, []);

  const serie = useMemo(() => {
    if (!dados) return [];
    if (metrica === "receita") return dados.receitaPeriodo;
    if (metrica === "cancelamentos") return dados.cancelamentosPeriodo;
    if (metrica === "usuariosFree") return dados.usuariosFreePeriodo;
    if (metrica === "receitaAnual")
      return [{ data: `${dados.ano}-01`, valor: dados.receitaAnual }];
    return [];
  }, [dados, metrica]);

  const corLinha =
    metrica === "receita"
      ? "#22c55e"
      : metrica === "cancelamentos"
      ? "#ef4444"
      : metrica === "receitaAnual"
      ? "#fbbf24"
      : "#3b82f6";

  if (!dados)
    return (
      <div className="flex items-center justify-center mt-10 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Carregando</span>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="relative inline-block">
        <select
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="px-4 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
        >
          {opcoes.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
          <ChevronDown size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setMetrica("receita")}
          className={`rounded-2xl p-5 shadow-lg text-left bg-gradient-to-br from-emerald-400 to-teal-500 text-white transition ring-2 ${
            metrica === "receita" ? "ring-white/70" : "ring-transparent"
          } hover:scale-[1.01]`}
        >
          <p className="text-sm opacity-90">Receita mensal</p>
          <p className="text-3xl font-bold mt-1">
            R${" "}
            {Number(dados.receitaMensal ?? 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </button>
        <button
          onClick={() => setMetrica("receitaAnual")}
          className={`rounded-2xl p-5 shadow-lg text-left bg-gradient-to-br from-yellow-400 to-orange-500 text-white transition ring-2 ${
            metrica === "receitaAnual" ? "ring-white/70" : "ring-transparent"
          } hover:scale-[1.01]`}
        >
          <p className="text-sm opacity-90">Receita anual</p>
          <p className="text-3xl font-bold mt-1">
            R${" "}
            {Number(dados.receitaAnual ?? 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </button>
        <button
          onClick={() => setMetrica("cancelamentos")}
          className={`rounded-2xl p-5 shadow-lg text-left bg-gradient-to-br from-rose-400 to-red-500 text-white transition ring-2 ${
            metrica === "cancelamentos" ? "ring-white/70" : "ring-transparent"
          } hover:scale-[1.01]`}
        >
          <p className="text-sm opacity-90">Cancelamentos</p>
          <p className="text-3xl font-bold mt-1">{dados.cancelamentosMes}</p>
        </button>
        <button
          onClick={() => setMetrica("usuariosFree")}
          className={`rounded-2xl p-5 shadow-lg text-left bg-gradient-to-br from-indigo-400 to-blue-500 text-white transition ring-2 ${
            metrica === "usuariosFree" ? "ring-white/70" : "ring-transparent"
          } hover:scale-[1.01]`}
        >
          <p className="text-sm opacity-90">Usuários Free</p>
          <p className="text-3xl font-bold mt-1">{dados.usuariosFree}</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-200">
              {metrica === "receita"
                ? "Receita no período"
                : metrica === "receitaAnual"
                ? "Receita anual"
                : metrica === "cancelamentos"
                ? "Cancelamentos no período"
                : "Usuários Free no período"}
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie}>
                <XAxis dataKey="data" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                  labelStyle={{ color: "#111827" }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={corLinha}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
            Planos mais adquiridos
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados.planosMaisAdquiridos}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {dados.planosMaisAdquiridos.map((_, i) => (
                    <Cell key={i} fill={cores[i % cores.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
