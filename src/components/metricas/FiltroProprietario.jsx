import React from "react";
import { ChevronDown, User, Calendar, Hash } from "lucide-react";
import { Input } from "../ui/input";

const planos = [
  { label: "Free", value: "free" },
  { label: "Prata", value: "prata" },
  { label: "Gold", value: "gold" },
  { label: "Exclusive", value: "exclusive" },
  { label: "Plano Individual", value: "individual" },
];

const camposFiltro = [
  { label: "Nome", campo: "nome", icon: <User size={16} /> },
  { label: "Usuários Vinculados", campo: "minUsuarios", icon: <Hash size={16} /> },
  { label: "Tesselas", campo: "minTessela", icon: <Hash size={16} /> },
  { label: "Mosaicos", campo: "minMosaicos", icon: <Hash size={16} /> },
  { label: "Data de criação", campo: "dataCriacao", icon: <Calendar size={16} />, type: "date" },
];

const FiltroProprietario = ({ filtros, onFiltroChange, onSubmit, limparFiltros }) => {
  return (
   <form
  onSubmit={(e) => {
    e.preventDefault();
    onSubmit();
  }}
  className="theme-gradient border border-gray-300 dark:border-white/10 rounded-xl p-4 flex flex-wrap items-end gap-3 shadow-md"
>
      {camposFiltro.map(({ label, campo, icon, type = "text" }) => (
        <div key={campo} className="flex flex-col gap-1 w-[160px]">
          <label className="text-xs text-gray-700 dark:text-white font-medium">{label}</label>
          <div className="relative">
            <span className="absolute left-2 top-2.5 text-gray-400">{icon}</span>
            <Input
              type={type}
              value={filtros[campo]}
              onChange={onFiltroChange(campo)}
              className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1 w-[180px]">
        <label className="text-xs text-gray-700 dark:text-white font-medium">Plano</label>
        <div className="relative">
          <select
            value={filtros.nomePlano}
            onChange={onFiltroChange("nomePlano")}
            className="appearance-none w-full pl-3 pr-8 py-2 text-sm rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-black dark:text-white"
          >
            {planos.map(({ label, value }) => (
              <option key={value} value={value} className="text-black dark:text-white bg-white dark:bg-[#25314d]">
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 text-gray-500 dark:text-white pointer-events-none" size={16} />
        </div>
      </div>

      <div className="flex gap-2 mt-4 sm:mt-0">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={limparFiltros}
          className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white"
        >
          Limpar
        </button>
      </div>
    </form>
  );
};

export default FiltroProprietario;
