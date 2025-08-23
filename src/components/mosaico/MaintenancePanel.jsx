import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Wallpaper,
  Move,
  Plus,
  Settings,
  Lock,
  Search,
  Ellipsis,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import WallpaperModal from "./WallpaperModal";
import IconModal from "./IconModal";
import { useNavigate, useParams } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import { useReactFlow } from "reactflow";
import TesselaModal from "./TesselaModal";
import { useAuth } from "@/context/AuthContext";
import FiltroTesselasModal from "./FiltroTesselasModal";
import DialogTeselaContent from "./DialogTeselaContent";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MaintenancePanel({
  modoManutencao,
  setModoManutencao,
  showTessela,
  setShowTessela,
  showTesselaModal,
  setShowTesselaModal,
  onAddTessela,
  onWallpaperChange,
  onUpdateTeselaLocation,
  onOrganizarTesselas,
  todasAsTesselas,
  onFecharMenuMobile,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tesselaAberta, setTesselaAberta] = useState(null);

  const [mosaicoGloba, setMosaicoGlobal] = useState(true);
  const { id: mosaicoId } = useParams();
  const {
    mosaicos,
    ehUsuarioProprietario,
    ehDiretor,
    ehAdmin,
    proprietarioId,
  } = useAuth();

  const ValidaMosaicoGlobal = () => {
    if (!mosaicoId || !mosaicos?.length) {
      setMosaicoGlobal(false);
      return;
    }

    const mosaico = mosaicos.find((x) => x.id === mosaicoId);

    if (
      mosaico &&
      mosaico.ehGlobal &&
      mosaico.proprietarioId !== proprietarioId
    ) {
      setMosaicoGlobal(true);
    } else {
      setMosaicoGlobal(false);
    }
  };

  useEffect(() => {
    ValidaMosaicoGlobal();
  }, [mosaicos, mosaicoId]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [locked, setLocked] = useState(true);
  const { setNodes, getNodes, fitView, setViewport } = useReactFlow();

  const toggleLock = () => {
    var status = locked;

    setLocked(!status);
    if (!status) {
      onUpdateTeselaLocation();
    }
  };

  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        draggable: !locked,
      }))
    );
  }, [locked]);

  const focarETremerTessela = (id) => {
    const node = getNodes().find((n) => n.id === id);
    if (!node) {
      console.warn("Tessela não encontrada.");
      return;
    }

    setViewport({
      x: -node.position.x + window.innerWidth / 2,
      y: -node.position.y + window.innerHeight / 2,
      zoom: 1,
    });

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, highlight: true } } : n
      )
    );

    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, highlight: false } } : n
        )
      );
    }, 1500);
  };

  return (
    <>
      {(ehAdmin || (!mosaicoGloba && ehDiretor)) && (
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ellipsis className="w-5 h-5 ml-0.5 text-gray-600 dark:text-white" />
            <span className="text-sm">{t("toolbarMaintenance.title")}</span>
          </div>
          <button
            onClick={() => setModoManutencao((v) => !v)}
            className={`w-10 h-5 relative rounded-full overflow-hidden ring-1 ring-white/10 transition-colors duration-500 ease-in-out ${
              modoManutencao ? "bg-green-500" : "bg-zinc-500"
            }`}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                modoManutencao ? "scale-100 opacity-100" : "scale-75 opacity-60"
              }`}
            />
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-500 ease-in-out ${
                modoManutencao ? "left-5 scale-110" : "left-0.5 scale-100"
              }`}
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
            />
          </button>
        </div>
      )}

      <div
        className={`transition-all overflow-hidden duration-500 ease-in-out ${
          modoManutencao ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-2 mt-2 text-sm pl-1">
          <div className="flex items-center gap-2">
            <Wallpaper size={18} />
            <WallpaperModal onChange={onWallpaperChange} />
          </div>

          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Search size={16} />
                <span>{t("toolbarMaintenance.BuscarTessela")}</span>
              </div>
            </DialogTrigger>

            <DialogContent className="p-0 overflow-hidden">
              <VisuallyHidden>
                <DialogTitle>
                  {t("toolbarMaintenance.dialog.buscarTessela.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("toolbarMaintenance.dialog.buscarTessela.description")}
                </DialogDescription>
              </VisuallyHidden>
              <FiltroTesselasModal
                tesselas={getNodes()}
                onSelectTessela={(t) => {
                  setModalAberto(false);
                  if (window.innerWidth < 640) {
                    onFecharMenuMobile?.();
                  }
                  focarETremerTessela(t.id);
                }}
                onClose={() => setModalAberto(false)}
                onAbrirTessela={(t) => setTesselaAberta(t)}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogContent className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] animate-in fade-in zoom-in-95 duration-500">
              <VisuallyHidden>
                <DialogTitle>
                  {t("toolbarMaintenance.dialog.icones.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("toolbarMaintenance.dialog.icones.description")}
                </DialogDescription>
              </VisuallyHidden>
              <IconModal />
            </DialogContent>
          </Dialog>

          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={toggleLock}
            >
              {locked ? <Move size={16} /> : <Lock size={16} />}
              <span>
                {locked
                  ? t("toolbarMaintenance.tessela.move")
                  : t("toolbarMaintenance.tessela.lock")}
              </span>
            </div>

            <Dialog open={showTesselaModal} onOpenChange={setShowTesselaModal}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>{t("toolbarMaintenance.tessela.create")}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gradient-to-r dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] animate-in fade-in zoom-in-95 duration-500">
                <VisuallyHidden>
                  <DialogTitle>
                    {t("toolbarMaintenance.dialog.criarTessela.title")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("toolbarMaintenance.dialog.criarTessela.description")}
                  </DialogDescription>
                </VisuallyHidden>
                <TesselaModal
                  onSubmit={async (data) => {
                    await onAddTessela(data, locked);
                    setShowTesselaModal(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <Settings size={18} />
            <span>{t("toolbarMaintenance.settings")}</span>
          </button>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
          {/* <button
            onClick={onOrganizarTesselas}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <Grip size={18} />
            <span>{t("toolbarOpen.mosaico.organization")}</span>
          </button> */}

          {tesselaAberta && (
            <Dialog
              open={!!tesselaAberta}
              onOpenChange={() => setTesselaAberta(null)}
            >
              <DialogContent className="p-0 overflow-hidden rounded-lg bg-white dark:bg-zinc-900">
                <VisuallyHidden>
                  <DialogTitle>
                    {t("toolbarMaintenance.dialog.detalhesTessela.title")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("toolbarMaintenance.dialog.detalhesTessela.description")}
                  </DialogDescription>
                </VisuallyHidden>
                <DialogTeselaContent
                  data={{ teselaId: tesselaAberta.id }}
                  open={!!tesselaAberta}
                  onOpenChange={() => setTesselaAberta(null)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
}
