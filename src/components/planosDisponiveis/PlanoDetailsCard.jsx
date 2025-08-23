import Logo from "../Logo";
import { Check, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import BotaoCancelarPlano from "@/components/dashboard/BotaoCancelarPlano";

export default function PlanoDetailsCard({
  plano,
  ciclo,
  onAssinar,
  isRecommended = false,
  loading,
  planoAtivoId,
}) {
  const { t } = useTranslation();
  const preco =
  ciclo === "mensal" ? plano.valorMensal : plano.valorAnual;


  return (
    <div
      className={`relative rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
        isRecommended
          ? "ring-2 ring-[#bfa146] scale-105 bg-white dark:bg-white/10"
          : "bg-white border border-gray-200 dark:bg-white/5 dark:border-white/20"
      } text-gray-800 dark:text-white`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-black dark:text-white text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#bfa146] via-[#f5e27c] to-[#b8860b] shadow-sm">
          <Star size={14} /> {t("planos.popular")}
        </span>
      )}

      <div className="flex items-center gap-3 mb-4">
        <Logo className="w-8 h-8" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {plano.nome}
        </h3>
      </div>

      <p className="text-xl font-extrabold mb-2">
        <span className="text-4xl text-gray-900 dark:text-white">
          R$ {Number(preco).toFixed(2)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {" "}
          /{t(`planos.${ciclo}`)}
        </span>
      </p>

      {ciclo === "anual" && (
        <p className="text-xs text-green-600 dark:text-green-400 mb-4">
          {t("planos.economia")}
        </p>
      )}

      <ul className="space-y-2 mb-8 text-sm text-gray-700 dark:text-gray-200">
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-600 dark:text-green-400" />
          {t("planos.mosaicos", { qtd: plano.quantidadeDeMoisacos })}
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-600 dark:text-green-400" />
          {t("planos.conteudos", {
            qtd: plano.quantidadeDeConteudosPorMosaico,
          })}
        </li>
      </ul>

      <button
        onClick={() => onAssinar(plano.id)}
        disabled={loading}
        className={`mt-2 w-full text-white text-sm font-semibold py-2 px-4 rounded transition flex items-center justify-center ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          </>
        ) : (
          "Assinar plano"
        )}
      </button>
    </div>
  );
}
