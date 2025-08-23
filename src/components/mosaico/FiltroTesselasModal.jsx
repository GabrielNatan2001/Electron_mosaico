import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FiltroTesselasModal({
  tesselas,
  onSelectTessela,
  onAbrirTessela,
  onClose,
}) {
  const [busca, setBusca] = useState("");
  const [filtradas, setFiltradas] = useState(tesselas);
  const { t } = useTranslation();

  useEffect(() => {
    const termo = busca.toLowerCase();
    if (!termo) {
      setFiltradas(tesselas);
      return;
    }

    const nova = tesselas.filter((t) => {
      const titulo = (t.data?.label || "").toLowerCase();
      const descricao = (t.data?.descricao || "").toLowerCase();
      return (titulo + " " + descricao).includes(termo);
    });

    setFiltradas(nova);
  }, [busca, tesselas]);

  return (
    <div className="flex flex-col h-[500px] p-4 bg-white dark:bg-zinc-900 theme-gradient">
      <div className="relative mb-4 mt-6">
        <Input
          placeholder={t("filtro.placeholder")}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="pr-10"
        />
        {busca && (
          <button
            onClick={() => setBusca("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto pr-1 space-y-2 custom-scrollbar">
        {filtradas.length > 0 ? (
          filtradas.map((item) => (
            <div
              key={item.id}
              className="w-full p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                {item.data?.icon ? (
                  <img
                    src={item.data.icon}
                    alt="icon"
                    className="w-6 h-6 object-contain rounded"
                  />
                ) : (
                  <div className="w-6 h-6 bg-zinc-300 dark:bg-zinc-700 rounded" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">
                    {item.data?.label || t("filtro.semTitulo")}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {typeof item?.data?.descricao === "string" &&
                    item.data.descricao.trim()
                      ? item.data.descricao
                      : t("filtro.semDescricao")}
                  </p>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 space-x-1">
                    <button
                      onClick={() => {
                        onSelectTessela(item);
                        setFiltradas(tesselas);
                        onClose?.();
                      }}
                      className="hover:underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white"
                    >
                      {t("filtro.localizar")}
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => {
                        onAbrirTessela?.(item);
                        onClose?.();
                      }}
                      className="hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {t("filtro.abrir")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mt-10">
            {t("filtro.nenhumaEncontrada")}
          </p>
        )}
      </div>
    </div>
  );
}
