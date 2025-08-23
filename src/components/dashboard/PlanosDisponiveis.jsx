import { deletarPlano } from "@/api/services/proprietarioService";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function PlanosDisponiveis({ planos, fetchPlanos }) {
  const { t } = useTranslation();
  const { ehAdmin } = useAuth();

  async function handleDelete(id) {
    try {
      const response = await deletarPlano(id);
      toast.success(response.message);
      fetchPlanos();
    } catch ({ status, response: { data } }) {
      if (status === 403) {
        toast.error(t("invite.error403"));
        return;
      }

      const message = data?.message || t("dashboard.errorDeletingPlan");
      toast.error(message);
    }
  }

  if (!ehAdmin) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {t("dashboard.availablePlans")}
      </h3>

      <ul className="space-y-3 mt-5">
        {planos.length === 0 && (
          <li className="text-sm text-gray-600 dark:text-gray-400">
            {t("dashboard.noPlansAvailable")}
          </li>
        )}

        {planos.map(
          ({
            id,
            nome,
            quantidadeDeUsuarios,
            quantidadeDeMoisacos,
            quantidadeDeTesselasPorMosaico,
            valorMensal,
          }) => (
            <li
              key={id}
              className="flex mt-3 justify-between items-center text-sm bg-gradient-to-r from-[#fdfcf9] to-[#faf3d1] dark:bg-none border border-white text-yellow-800 dark:text-white rounded-xl shadow-sm px-4 py-2 transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex flex-col">
                <span className="font-medium">{nome}</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {t("dashboard.allowedUsers")}: {quantidadeDeUsuarios} •{" "}
                  {t("dashboard.allowedMosaics")}: {quantidadeDeMoisacos} •{" "}
                  {t("dashboard.price")}: R${valorMensal.toFixed(2)} •{" "}
                  {t("dashboard.qtdTesselasPorMosaico")}:{" "}
                  {quantidadeDeTesselasPorMosaico}
                </span>
              </div>

              <button
                onClick={() => handleDelete(id)}
                aria-label={t("dashboard.deletePlan", { plan: nome })}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
