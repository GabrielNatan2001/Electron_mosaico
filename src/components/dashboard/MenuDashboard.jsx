import {
  Plus,
  UserPlus,
  Award,
  LogOut,
  PlusCircle,
  Menu,
  BarChart2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import UsuariosVinculados from "@/components/dashboard/UsuariosVinculados";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function MenuDashboard({
  onNewMosaic,
  onInviteUser,
  onNewPlan,
  onLogout,
  plano,
  ehAdmin,
  usuarios,
  fetchUsuarios,
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const { t } = useTranslation();

  var navigate = useNavigate();

  const btn =
    "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm shadow-md hover:brightness-50 transition";

  return (
    <div className="flex flex-col items-end sm:items-start gap-2 w-full relative">
      <div className="hidden sm:flex flex-wrap items-center justify-end sm:justify-start gap-2 w-full">
        <button onClick={onNewMosaic} className={btn}>
          <Plus size={16} />
          {t("dashboard.newMosaic")}
        </button>
        <UsuariosVinculados usuarios={usuarios} fetchUsuarios={fetchUsuarios} />
        <button onClick={onInviteUser} className={btn}>
          <UserPlus size={16} />
          {t("dashboard.inviteUser")}
        </button>
        {ehAdmin && (
          <button onClick={() => navigate("/metricas")} className={btn}>
            <BarChart2 size={16} />
            Métricas
          </button>
        )}
        {ehAdmin ? (
          <button onClick={onNewPlan} className={btn}>
            <PlusCircle size={16} />
            {t("dashboard.newPlan")}
          </button>
        ) : (
          <button
            onClick={() => navigate("/planos-disponiveis")}
            className={btn}
          >
            <Award size={16} />
            {t("dashboard.plan")}: {plano || t("dashboard.noPlan")}
          </button>
        )}
        <button onClick={onLogout} className={btn}>
          <LogOut size={16} />
          {t("dashboard.quit")}
        </button>
      </div>
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="p-2 rounded bg-gradient-to-r bg-white dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] dark:text-white shadow"
        >
          <Menu size={20} />
        </button>
        {openMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1f2a40] rounded-xl shadow-xl p-4 flex flex-col gap-3 z-50 backdrop-blur-md border border-white/10">
            <button onClick={onNewMosaic} className={btn}>
              <Plus size={16} />
              {t("dashboard.newMosaic")}
            </button>
            <UsuariosVinculados
              usuarios={usuarios}
              fetchUsuarios={fetchUsuarios}
            />
            <button onClick={onInviteUser} className={btn}>
              <UserPlus size={16} />
              {t("dashboard.inviteUser")}
            </button>
            {ehAdmin && (
              <button onClick={() => navigate("/metricas")} className={btn}>
                <BarChart2 size={16} />
                Métricas
              </button>
            )}
            {ehAdmin ? (
              <button onClick={onNewPlan} className={btn}>
                <PlusCircle size={16} />
                {t("dashboard.newPlan")}
              </button>
            ) : (
              <button
                onClick={() => navigate("/planos-disponiveis")}
                className={btn}
              >
                <Award size={16} />
                {t("dashboard.plan")}: {plano || t("dashboard.noPlan")}
              </button>
            )}
            <button onClick={onLogout} className={btn}>
              <LogOut size={16} />
              {t("dashboard.quit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
