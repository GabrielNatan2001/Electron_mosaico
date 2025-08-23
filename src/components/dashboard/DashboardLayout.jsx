import {
  Plus,
  UserPlus,
  BarChart3,
  BadgePlus,
  LogOut,
  Menu as MenuIcon,
  X,
  Users,
  Award,
  Settings,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import InviteUserModal from "@/components/dashboard/InviteUserModal";
import NovoMosaicoModal from "@/components/dashboard/novoMosaicoModal";
import NovoPlanoModal from "@/components/dashboard/NovoPlanoModal";
import UsuariosVinculadosModal from "@/components/dashboard/UsuariosVinculados";
import SettingsModal from "../mosaico/SettingsModal";
import FaleConoscoModal from "../mosaico/FaleConoscoModal";
import useMedia from "use-media";
import Logo from "../Logo";

export function DashboardLayout({
  children,
  ehAdmin,
  usuarios,
  fetchUsuarios,
  plano,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [novoMosaicoOpen, setNovoMosaicoOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [novoPlanoOpen, setNovoPlanoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuariosModalOpen, setUsuariosModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [faleConoscoOpen, setFaleConoscoOpen] = useState(false);
  const menuRef = useRef(null);
  const isMobile = useMedia({ maxWidth: 768 });
  const planoAtual = (plano || "").toLowerCase();

  const isTablet = useMedia({ minWidth: 769, maxWidth: 1024 });
  const isCompact = isMobile || isTablet;

  const corPlano = {
    free: "text-green-500",
    individual: "text-yellow-500",
    enterprise: "text-[#00FFC2]",
    exclusive: "text-purple-500",
    gold: "bg-gradient-to-r from-[#FF4500] via-[#FF6A00] to-[#CC5500] text-transparent bg-clip-text",
    "plano individual":
      "bg-gradient-to-r from-[#B8860B] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text",
  };

  useEffect(() => {
    const onDown = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const webItems = useMemo(
    () => [
      {
        icon: Plus,
        label: t("menu.newMosaic"),
        onClick: () => setNovoMosaicoOpen(true),
      },
      {
        icon: UserPlus,
        label: t("menu.inviteUser"),
        onClick: () => setInviteOpen(true),
      },
      {
        icon: Users,
        label: t("menu.linkedUsers"),
        onClick: () => setUsuariosModalOpen(true),
      },
      ...(ehAdmin
        ? [
            {
              icon: BarChart3,
              label: t("menu.metrics"),
              onClick: () => navigate("/metricas"),
            },
            {
              icon: BadgePlus,
              label: t("menu.newPlan"),
              onClick: () => setNovoPlanoOpen(true),
            },
          ]
        : []),
    ],
    [ehAdmin, t]
  );

  const webFooter = useMemo(
    () => [
      {
        icon: Settings,
        label: t("menu.settings"),
        onClick: () => setSettingsOpen(true),
      },
      {
        icon: MessageCircle,
        label: t("menu.contactUs"),
        onClick: () => setFaleConoscoOpen(true),
      },
      {
        icon: LogOut,
        label: t("menu.logout"),
        onClick: () => navigate("/login"),
        extra: "hover:text-red-500 mt-6",
      },
    ],
    [t]
  );

  const mobileItems = useMemo(
    () => [
      {
        icon: Plus,
        label: t("menu.newMosaicShort"),
        onClick: () => setNovoMosaicoOpen(true),
      },
      {
        icon: UserPlus,
        label: t("menu.inviteShort"),
        onClick: () => setInviteOpen(true),
      },
      {
        icon: Users,
        label: t("menu.usersShort"),
        onClick: () => setUsuariosModalOpen(true),
      },
      ...(ehAdmin
        ? [
            {
              icon: BarChart3,
              label: t("menu.metricsShort"),
              onClick: () => navigate("/metricas"),
            },
            {
              icon: BadgePlus,
              label: t("menu.newPlanShort"),
              onClick: () => setNovoPlanoOpen(true),
            },
          ]
        : []),
      ...(isCompact
        ? [
            {
              icon: Award,
              label: `${t("")} ${String(plano || t("common.na"))}`,
              onClick: () => {},
            },
          ]
        : [
            {
              icon: Award,
              label: t("menu.plansShort"),
              onClick: () => navigate("/planos-disponiveis"),
            },
          ]),
      {
        icon: Settings,
        label: t("menu.settingsShort"),
        onClick: () => setSettingsOpen(true),
      },
      {
        icon: MessageCircle,
        label: t("menu.contactShort"),
        onClick: () => setFaleConoscoOpen(true),
      },
      {
        icon: LogOut,
        label: t("menu.logoutShort"),
        onClick: () => navigate("/login"),
      },
    ],
    [ehAdmin, t, isCompact, plano]
  );

  return (
    <div className="relative flex min-h-screen w-screen overflow-hidden bg-white dark:bg-[#1f2a40] transition-colors duration-300">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <aside
          ref={menuRef}
          className={`fixed top-0 left-0 h-screen w-64 p-6 z-50 flex flex-col justify-between shadow-md transition-transform duration-300
            ${menuOpen ? "translate-x-0" : "-translate-x-full"}
            bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40]
            dark:bg-white dark:bg-none text-white dark:text-gray-800`}
        >
          <div className="flex flex-col gap-4 overflow-y-auto max-h-full sidebar-scroll">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <Logo className="h-10" />
                <h2 className="text-xl font-bold pl-2">{t("menu.title")}</h2>
              </div>
              <button onClick={() => setMenuOpen(false)}>
                <X className="text-white dark:text-black" size={28} />
              </button>
            </div>

            {webItems.map(({ icon: Icon, label, onClick }, i) => (
              <button
                key={i}
                onClick={onClick}
                className="flex items-center gap-2 hover:text-indigo-500"
              >
                <Icon size={20} /> {label}
              </button>
            ))}

            <div>
              <button
                onClick={
                  isTablet ? undefined : () => navigate("/planos-disponiveis")
                }
                className={`flex flex-col items-start gap-0 hover:text-indigo-500 ${
                  isTablet ? "cursor-default" : ""
                }`}
              >
                {!isCompact && (
                  <span className="flex items-center gap-2">
                    <Award size={20} /> {t("menu.plans")}
                  </span>
                )}
                <span
                  className={`${
                    !isCompact ? "text-xs pl-[28px]" : ""
                  } text-zinc-300 dark:text-black/60`}
                >
                  {/* {t("menu.currentPlan")} */}
                  <strong className={` ${corPlano[planoAtual] || ""}`}>
                    {plano || t("common.na")}
                  </strong>
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {webFooter.map(({ icon: Icon, label, onClick, extra }, i) => (
              <button
                key={i}
                onClick={onClick}
                className={`flex items-center gap-2 hover:text-indigo-500 ${
                  extra || ""
                }`}
              >
                <Icon size={20} /> {label}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Menu Toggle Button Mobile */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-[#25314d] dark:bg-white shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <MenuIcon size={24} className="text-white dark:text-[#25314d]" />
        </button>
      )}

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div
          className="fixed bottom-0 left-0 w-full max-h-[40%] z-50 animate-slide-up rounded-t-xl p-4 shadow-xl
                        bg-gradient-to-r from-[#25314d] via-[#2e3e5c] to-[#1f2a40]
                        dark:bg-white dark:bg-none"
        >
          <div className="flex justify-end -mt-1 mb-1 pr-1">
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1 rounded-md hover:bg-white/10"
            >
              <X size={22} className="text-white dark:text-[#2e3e5c]" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6 text-center">
            {mobileItems.map(({ icon: Icon, label, onClick }, i) => (
              <button
                key={i}
                onClick={() => {
                  setMenuOpen(false);
                  onClick();
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
              >
                <Icon className="text-white dark:text-[#2e3e5c]" size={22} />
                <span className="text-xs text-white dark:text-[#2e3e5c] leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`relative overflow-y-auto text-gray-900 dark:text-white h-screen transition-all duration-300 invisible-scroll ${
          isMobile
            ? "p-6 pb-20"
            : `py-8 ${menuOpen ? "pl-72 pr-8" : "pl-6 pr-8"}`
        } w-full`}
      >
        {!isMobile && !menuOpen && (
          <button
            className="absolute top-7.6 left-5 z-10 p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon size={30} />
          </button>
        )}

        {children}
      </main>

      {/* Modals */}
      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <NovoMosaicoModal
        open={novoMosaicoOpen}
        onClose={() => setNovoMosaicoOpen(false)}
      />
      <NovoPlanoModal
        open={novoPlanoOpen}
        onClose={() => setNovoPlanoOpen(false)}
      />
      <UsuariosVinculadosModal
        open={usuariosModalOpen}
        onClose={() => setUsuariosModalOpen(false)}
        usuarios={usuarios}
        fetchUsuarios={fetchUsuarios}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <FaleConoscoModal
        open={faleConoscoOpen}
        onClose={() => setFaleConoscoOpen(false)}
      />
    </div>
  );
}
