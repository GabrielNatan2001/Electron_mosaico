import { useReactFlow } from "reactflow";
import {
  ChevronUp,
  ChevronRight,
  ZoomIn,
  LogOut,
  Mail,
  LayoutDashboard,
  LayoutGrid,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Logo from "@/components/Logo.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import MaintenancePanel from "./MaintenancePanel";
import { getMosaicos } from "@/api/services/mosaicoService";
import { useAuth } from "@/context/AuthContext";
import { LanguageSelect } from "../LanguageSelect";
import FaleConoscoModal from "./FaleConoscoModal";
import MobileDrawerToolbar from "./MobileDrawerToolbar";
import logoCinza from "@/assets/mosaico_logo_cinza.png";
import imgLanguages from "@/assets/languages.svg";
import { motion, AnimatePresence } from "framer-motion";

export default function OpenToolbar({
  setCollapsed,
  modoManutencao,
  setModoManutencao,
  mosaicoSelecionado,
  setMosaicoSelecionado,
  showTessela,
  setShowTessela,
  showTesselaModal,
  setShowTesselaModal,
  aberto,
  setAberto,
  onAddTessela,
  onWallpaperChange,
  onZoomIn,
  onZoomOut,
  onUpdateTeselaLocation,
  onOrganizarTesselas,
}) {
  const { getNodes } = useReactFlow();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    mosaicos,
    salvarMosaicos,
    emailUsuario,
    ehUsuarioProprietario,
    ehAdmin,
  } = useAuth();
  const { id } = useParams();
  useEffect(() => {
    setMosaicoSelecionado(id);
  }, [id]);

  const handleToggle = (section) => {
    setAberto((prev) => (prev === section ? null : section));
  };

  const GetListaMosaicos = async () => {
    if (!mosaicos) {
      const mosaicosUsuario = await getMosaicos();
      salvarMosaicos(mosaicosUsuario);
    }
  };

  useEffect(() => {
    GetListaMosaicos();
  }, []);

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("fabPosition");
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });

  const handleDragEnd = (_, info) => {
    const x = info.point.x;
    const y = info.point.y;

    setPosition({ x, y });
    localStorage.setItem("fabPosition", JSON.stringify({ x, y }));
  };

  return (
    <>
      <div className="hidden sm:flex fixed top-3/7 right-4 -translate-y-1/2 z-40 flex-col rounded-xl backdrop-blur-md border border-white/10 transition-all bg-white/30 dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] w-64 p-4 text-black dark:text-white gap-1">
        <div className="flex flex-col items-center gap-2 mb-2">
          <button className="w-12 h-12">
            <Logo className="w-12 h-12" />
          </button>

          <p className="text-sm font-semibold text-center leading-4">
            Mosaico TLM Manager
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 w-full overflow-hidden">
            <img src={logoCinza} className="w-8 h-8 shrink-0" />
            <Select
              value={mosaicoSelecionado}
              onValueChange={(mosaicoId) => navigate("/mosaico/" + mosaicoId)}
            >
              <SelectTrigger className="flex-1 h-9 bg-transparent border-none shadow-none text-sm focus:ring-0 p-0 [&>svg]:hidden overflow-hidden">
                <SelectValue
                  placeholder="Selecionar mosaico"
                  className="truncate"
                >
                  {mosaicos?.find((m) => m.id === mosaicoSelecionado)?.nome
                    ?.length > 25
                    ? `${mosaicos
                        .find((m) => m.id === mosaicoSelecionado)
                        ?.nome.substring(0, 22)}...`
                    : mosaicos?.find((m) => m.id === mosaicoSelecionado)?.nome}
                </SelectValue>
              </SelectTrigger>

              <SelectContent
                sideOffset={-8}
                className="max-w-[200px] max-h-[180px] overflow-y-auto 
                 bg-white dark:bg-gradient-to-b dark:from-[#25314d] 
                 dark:via-[#2e3e5c] dark:to-[#1f2a40] text-black dark:text-white 
                 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#6b7280 transparent",
                }}
              >
                {mosaicos?.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                  >
                    {item.nome.length > 25
                      ? `${item.nome.substring(0, 25)}...`
                      : item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={`transition-all duration-400 ease-in-out overflow-hidden  ${
              aberto === "mosaico"
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <Select
              value={mosaicoSelecionado}
              onValueChange={(mosaicoId) => navigate("/mosaico/" + mosaicoId)}
            >
              <SelectTrigger className="w-full text-sm mt-1 cursor-pointer">
                <SelectValue>
                  {mosaicos?.find((m) => m.id === mosaicoSelecionado)?.nome
                    .length > 25
                    ? `${mosaicos
                        .find((m) => m.id === mosaicoSelecionado)
                        ?.nome.substring(0, 22)}...`
                    : mosaicos?.find((m) => m.id === mosaicoSelecionado)?.nome}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {mosaicos?.map((item) => {
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome.length > 25
                        ? `${item.nome.substring(0, 25)}...`
                        : item.nome}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleToggle("idioma")}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <img
                src={imgLanguages}
                className="w-8 h-8 dark:invert brightness-0"
                alt="Idioma"
              />
              <span className="text-sm">{t("toolbarOpen.language.title")}</span>
            </div>
            <ChevronUp
              size={16}
              className={`transition-transform ${
                aberto !== "idioma" && "rotate-180"
              }`}
            />
          </button>
          <div
            className={`transition-all duration-400 ease-in-out overflow-hidden ${
              aberto === "idioma" ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <LanguageSelect />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white ">
            <ZoomIn size={22} className="text-black dark:invert" />
            <span className="text-sm font-medium text-black dark:invert">
              Zoom
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onZoomIn}
              className="cursor-pointer w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-lg font-bold flex items-center justify-center transition text-black dark:text-white"
            >
              +
            </button>

            <span className="text-black/30 dark:text-white/30">•</span>

            <button
              onClick={onZoomOut}
              className="cursor-pointer w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-lg font-bold flex items-center justify-center transition text-black dark:text-white"
            >
              –
            </button>
          </div>
        </div>

        <MaintenancePanel
          modoManutencao={modoManutencao}
          setModoManutencao={setModoManutencao}
          showTessela={showTessela}
          setShowTessela={setShowTessela}
          showTesselaModal={showTesselaModal}
          setShowTesselaModal={setShowTesselaModal}
          onAddTessela={onAddTessela}
          onWallpaperChange={onWallpaperChange}
          onUpdateTeselaLocation={onUpdateTeselaLocation}
          onOrganizarTesselas={onOrganizarTesselas}
          todasAsTesselas={getNodes()}
        />
        <button
          onClick={() => setContactOpen(true)}
          className="flex ml-1 items-center gap-2 mt-1 hover:opacity-80 transition cursor-pointer"
        >
          <Mail size={18} />
          <span className="text-sm">{t("toolbarOpen.mosaico.contact")}</span>
        </button>

        {(ehUsuarioProprietario || ehAdmin) && (
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 ml-1 flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">
              {t("toolbarMaintenance.controlPanel")}
            </span>
          </button>
        )}

        <FaleConoscoModal
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          userEmail={emailUsuario}
        />
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 mt-2"
        >
          <LogOut size={18} />
          <span className="text-sm">{t("toolbarOpen.logout")}</span>
        </button>
        <button
          onClick={() => setCollapsed(true)}
          className="absolute top-4/10 right-full w-6 h-20 bg-white/30 dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-black dark:text-white rounded-l-full flex items-center justify-center shadow-md backdrop-blur-md z-50"
        >
          <ChevronRight size={18} className="transition" />
        </button>
      </div>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            drag
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x: position.x, y: position.y }}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed z-50 w-14 h-14 bg-white/80 dark:bg-[#25314d] text-black dark:text-white rounded-full flex items-center justify-center"
          >
            <LayoutGrid size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <MobileDrawerToolbar
        open={mobileOpen}
        setOpen={setMobileOpen}
        mosaicoSelecionado={mosaicoSelecionado}
        setMosaicoSelecionado={setMosaicoSelecionado}
        modoManutencao={modoManutencao}
        setModoManutencao={setModoManutencao}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        ehUsuarioProprietario={ehUsuarioProprietario}
        ehAdmin={ehAdmin}
        setContactOpen={setContactOpen}
        showTessela={showTessela}
        setShowTessela={setShowTessela}
        showTesselaModal={showTesselaModal}
        setShowTesselaModal={setShowTesselaModal}
        onAddTessela={onAddTessela}
        onWallpaperChange={onWallpaperChange}
        onUpdateTeselaLocation={onUpdateTeselaLocation}
        onOrganizarTesselas={onOrganizarTesselas}
      />
    </>
  );
}
