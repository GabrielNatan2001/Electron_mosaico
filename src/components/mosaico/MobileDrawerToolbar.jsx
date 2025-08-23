import { useState, useRef } from "react";
import { LayoutGrid, Mail, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSelect } from "../LanguageSelect";
import { useTranslation } from "react-i18next";
import Logo from "../Logo";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import MaintenancePanel from "./MaintenancePanel";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileDrawerToolbar({
  mosaicoSelecionado,
  setMosaicoSelecionado,
  modoManutencao,
  setModoManutencao,
  ehUsuarioProprietario,
  ehAdmin,
  setContactOpen,
  showTessela,
  setShowTessela,
  showTesselaModal,
  setShowTesselaModal,
  onAddTessela,
  onWallpaperChange,
  onUpdateTeselaLocation,
  onOrganizarTesselas,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef(null);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("fabPosition");
    const defaultPosition = { x: 0, y: 0 };

    if (!saved) return defaultPosition;

    const parsed = JSON.parse(saved);
    const clampedX = Math.min(window.innerWidth - 64, Math.max(0, parsed.x));
    const clampedY = Math.min(window.innerHeight - 64, Math.max(0, parsed.y));

    return { x: clampedX, y: clampedY };
  });

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mosaicos } = useAuth();

  const handleDragEnd = (_, info) => {
    const x = Math.min(window.innerWidth - 64, Math.max(0, info.point.x));
    const y = Math.min(window.innerHeight - 64, Math.max(0, info.point.y));
    const newPosition = { x, y };

    setPosition(newPosition);
    localStorage.setItem("fabPosition", JSON.stringify(newPosition));
  };

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none" />

      <motion.button
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onClick={() => setOpen(true)}
        initial={false}
        animate={{ x: position.x, y: position.y }}
        className="sm:hidden fixed z-50 w-14 h-14 bg-white/80 dark:bg-[#25314d] text-black dark:text-white rounded-full flex items-center justify-center"
      >
        <LayoutGrid size={28} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur sm:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              style={{
                height: modoManutencao ? "70vh" : "auto",
                maxHeight: "70vh",
              }}
              className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1f2a40] rounded-t-2xl p-4 overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-400/50 rounded-full mx-auto mb-3" />

              <div className="flex flex-col gap-4 text-sm text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <Logo className="w-5 h-5" />
                  <span>{t("toolbarOpen.mosaico.title")}</span>
                </div>

                <Select
                  value={mosaicoSelecionado}
                  onValueChange={(mosaicoId) => {
                    setMosaicoSelecionado(mosaicoId);
                    navigate("/mosaico/" + mosaicoId);
                    setOpen(false);
                  }}
                >
                  <SelectTrigger className="w-full text-sm mt-1 cursor-pointer">
                    <SelectValue>
                      {mosaicos?.find((m) => m.id === mosaicoSelecionado)?.nome
                        .length > 25
                        ? `${mosaicos
                            .find((m) => m.id === mosaicoSelecionado)
                            ?.nome.substring(0, 22)}...`
                        : mosaicos?.find((m) => m.id === mosaicoSelecionado)
                            ?.nome}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mosaicos?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome.length > 25
                          ? `${item.nome.substring(0, 25)}...`
                          : item.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <LanguageSelect />

                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {" "}
                    {t("toolbarMaintenance.title")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModoManutencao(!modoManutencao);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-500 ease-in-out ${
                      modoManutencao ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-500 ease-in-out ${
                        modoManutencao ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <motion.div
                  initial={false}
                  animate={
                    modoManutencao
                      ? { height: "auto", opacity: 1, filter: "blur(0px)" }
                      : { height: 0, opacity: 0, filter: "blur(4px)" }
                  }
                  transition={{
                    height: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
                    opacity: { duration: 0.5, ease: "easeOut" },
                    filter: { duration: 0.5, ease: "easeOut" },
                  }}
                  style={{ overflow: "hidden", transformOrigin: "top" }}
                  className="maintenance-wrapper"
                >
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
                    onFecharMenuMobile={() => setOpen(false)}
                  />
                </motion.div>

                <button
                  onClick={() => setContactOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Mail size={18} />
                  {t("toolbarOpen.mosaico.contact")}
                </button>

                {(ehUsuarioProprietario || ehAdmin) && (
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard size={18} />
                    {t("toolbarMaintenance.controlPanel")}
                  </button>
                )}

                <button
                  onClick={() => {
                    navigate("/login");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut size={18} />
                  {t("toolbarOpen.logout")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
