// NodeToolbar.js (componente principal)
import { useState, useEffect } from "react";
import ClosedToolbar from "./ClosedToolbar";
import OpenToolbar from "./OpenToolbar";

export default function MosaicoToolbar({
  onAddTessela,
  onWallpaperChange,
  onZoomIn,
  onZoomOut,
  onUpdateTeselaLocation,
  onOrganizarTesselas,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [modoManutencao, setModoManutencao] = useState(false);
  const [showTessela, setShowTessela] = useState(false);
  const [showTesselaModal, setShowTesselaModal] = useState(false);
  const [mosaicoSelecionado, setMosaicoSelecionado] = useState("mosaico");
  const [aberto, setAberto] = useState(null);
  const [mosaicos, setMosaicos] = useState([]);

  useEffect(() => {
  if (window.innerWidth < 640) setCollapsed(false);
}, []);


  return collapsed ? (
    <ClosedToolbar
      setCollapsed={setCollapsed}
      modoManutencao={modoManutencao}
      setModoManutencao={setModoManutencao}
    />
  ) : (
    <OpenToolbar
      setCollapsed={setCollapsed}
      modoManutencao={modoManutencao}
      setModoManutencao={setModoManutencao}
      mosaicoSelecionado={mosaicoSelecionado}
      setMosaicoSelecionado={setMosaicoSelecionado}
      showTessela={showTessela}
      setShowTessela={setShowTessela}
      showTesselaModal={showTesselaModal}
      setShowTesselaModal={setShowTesselaModal}
      aberto={aberto}
      setAberto={setAberto}
      onAddTessela={onAddTessela}
      onWallpaperChange={onWallpaperChange}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onUpdateTeselaLocation={onUpdateTeselaLocation}
      onOrganizarTesselas={onOrganizarTesselas}
    />
  );
}
