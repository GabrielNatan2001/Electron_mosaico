import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  useNodesState,
  addEdge,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeMiniMap from "../components/mosaico/NodeMiniMap";
import ToolbarWithZoom from "../components/mosaico/ToolbarWithZoom";
import NodeIcon from "@/components/mosaico/NodeIcon";
import { useParams } from "react-router-dom";
import {
  addConteutoTesela,
  addTesela,
  adicionarMultiplosConteudos,
  updateTeselaLocation,
} from "@/api/services/teselaService";
import { getMosaicoById } from "@/api/services/mosaicoService";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fixIconPath } from "@/utils/iconPath";

const nodeTypes = {
  icon: NodeIcon,
};

export function MosaicoPage() {
  const { t } = useTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useState([]);
  const [showControls, setShowControls] = useState(false);
  const [initialPortView, setInitialPortView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState({
    color: "linear-gradient(to bottom, #a26c3f, #355c5c)",
    url: null,
  });
  const flowInstanceRef = useRef(null);
  const { id: mosaicoId } = useParams();

  const handleViewportChange = (viewport) => {
    localStorage.setItem(
      `mosaicoViewport_${mosaicoId}`,
      JSON.stringify(viewport)
    );
  };

  const loadMosaicoData = async () => {
    const data = await getMosaicoById(mosaicoId);
    var nodesList = data.tesselas.map((item) => ({
      id: item.id,
      type: "icon",
      position: {
        x: item.x,
        y: item.y,
      },
      data: {
        icon: fixIconPath(item.iconUrl) || "",
        label: item.label,
        descricao: item.descricao || "",
        resumo: "",
        tipo: "",
        valor: fixIconPath(item.iconUrl),
        teselaId: item.id,
      },
      draggable: false,
    }));

    const wallPaperDetails = {
      color: !data.planoDeFundo.includes("http")
        ? data.planoDeFundo
        : "#f3f3f3",
      url: data.planoDeFundo.includes("http") ? data.planoDeFundo : null,
    };

    setWallpaper(wallPaperDetails);
    setInitialPortView(calculateInitialViewport(nodesList));
    setNodes(nodesList);
    setTimeout(() => {
      const viewport = calculateInitialViewport(nodesList);
      flowInstanceRef.current?.setViewport(viewport);
    }, 100);

    setLoading(false);
  };

  useEffect(() => {
    setInitialPortView(null);
    loadMosaicoData();
  }, [mosaicoId]);

  const handleAddTessela = useCallback(
    async (
      { nome, descricao, resumo, tipo, valor, icon, iconSelecionado },
      locked
    ) => {
      if (!valor) return;

      try {
        const formHeader = new FormData();
        formHeader.append("label", nome);
        formHeader.append("descricao", descricao);
        if (icon) formHeader.append("icon", icon);
        formHeader.append("mosaicoId", mosaicoId);
        if (iconSelecionado)
          formHeader.append("IconPreDefinido", iconSelecionado);

        const data = await addTesela(formHeader);
        if (!data) throw new Error("Sem resposta da API");

        const count = nodes.length;
        const columns = Math.min(
          6,
          Math.max(2, Math.floor(window.innerWidth / 140))
        );
        const size = 60;
        const spacing = 80;
        const col = count % columns;
        const row = Math.floor(count / columns);
        const totalWidth = columns * size + (columns - 1) * spacing;
        const baseX = -totalWidth / 2;
        const baseY = -150;
        let posX = baseX + col * (size + spacing);
        const posY = baseY + row * (size + spacing);

        while (
          nodes.some((n) => n.position.x === posX && n.position.y === posY)
        ) {
          posX += spacing;
        }

        const newNode = {
          id: `${data.data.id}`,
          type: "icon",
          position: { x: posX, y: posY },
                  data: {
          icon: fixIconPath(data.data.iconUrl),
          label: data.data.label,
          descricao,
          resumo,
          tipo,
          valor,
          iconSelecionado,
          teselaId: data.data.id,
        },
          draggable: !locked,
          style: {},
        };

        await updateTeselaLocation({
          mosaicoId,
          tesselas: [
            {
              tecelaId: data.data.id,
              label: data.data.label,
              x: posX,
              y: posY,
            },
          ],
        });

        const formData = new FormData();
        formData.append("TesselaId", data.data.id);

        if (Array.isArray(valor)) {
          valor.forEach((file) => formData.append("Arquivos", file));
          await adicionarMultiplosConteudos(formData);
        } else {
          formData.append("nomeConteudo", descricao || "");
          formData.append("tipoConteudo", tipo);
          if (tipo === "texto" || tipo === "link") {
            formData.append("texto", valor);
          } else {
            formData.append("arquivo", valor);
          }
          await addConteutoTesela(formData);
        }

        setNodes((nds) => {
          const novos = [...nds, newNode];
          return novos;
        });

        setTimeout(() => {
          flowInstanceRef.current?.setViewport({
            x: -posX + window.innerWidth / 2,
            y: -posY + window.innerHeight / 2,
            zoom: 0.9,
          });
        }, 200);
      } catch (err) {
        toast.error(err?.response?.data?.message);
      }
    },
    [setNodes, nodes, mosaicoId]
  );

  const handleWallpaperChange = ({ color, image }) => {
    if (image) {
      const url = URL.createObjectURL(image);
      setWallpaper({ color: "", image, url });
    } else {
      setWallpaper({ color, image: null, url: null });
    }
  };

  const handleUpdateTeselaLocation = async (nodesAtualizados = nodes) => {
    const request = {
      mosaicoId,
      tesselas: nodesAtualizados.map((x) => ({
        tecelaId: x.id,
        label: x.data.label,
        x: x.position.x,
        y: x.position.y,
      })),
    };
    await updateTeselaLocation(request);
  };

  const calculateInitialViewport = (nodesParams) => {
    if (nodesParams.length === 0) return { x: 0, y: 0, zoom: 1 };

    // Calcular os limites dos nodes
    const bounds = nodesParams.reduce(
      (acc, node) => {
        return {
          minX: Math.min(acc.minX, node.position.x),
          maxX: Math.max(acc.maxX, node.position.x),
          minY: Math.min(acc.minY, node.position.y),
          maxY: Math.max(acc.maxY, node.position.y),
        };
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };

    return {
      x: window.innerWidth / 2 - center.x,
      y: window.innerHeight / 2 - center.y,
      zoom: 1,
    };
  };

  const estiloFundo = wallpaper.url
    ? `url(${wallpaper.url}) center center / cover no-repeat`
    : wallpaper.color;

  // organizador

  const organizarTesselas = async () => {
    if (!nodes || nodes.length === 0) {
      toast.info(t("toast.organizar.error"));
      return;
    }

    setLoading(true);

    const size = 60;
    const spacing = 80;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 768;
    const columns = isMobile
      ? 3
      : Math.min(6, Math.max(2, Math.floor(screenWidth / (size + spacing))));

    const totalWidth = columns * size + (columns - 1) * spacing;
    const rows = Math.ceil(nodes.length / columns);
    const totalHeight = rows * size + (rows - 1) * spacing;

    const baseX = -totalWidth / 2;
    const baseY = -totalHeight / 2;

    const novosNodes = [...nodes]
      .sort((a, b) => a.data.label.localeCompare(b.data.label))
      .map((node, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        return {
          ...node,
          position: {
            x: baseX + col * (size + spacing),
            y: baseY + row * (size + spacing),
          },
          style: {
            ...node.style,
            transition: "all 0.6s ease",
          },
        };
      });

    setNodes(novosNodes);
    await new Promise((r) => setTimeout(r, 300));
    await handleUpdateTeselaLocation(novosNodes);

    const allX = novosNodes.map((n) => n.position.x);
    const allY = novosNodes.map((n) => n.position.y);
    const centerX = (Math.min(...allX) + Math.max(...allX)) / 2;
    const centerY = (Math.min(...allY) + Math.max(...allY)) / 2;

    const zoom = nodes.length <= 4 ? 1.5 : nodes.length <= 10 ? 0.75 : 1;

    flowInstanceRef.current?.setViewport({
      x: -centerX + screenWidth / 2,
      y: -centerY + screenHeight / 2,
      zoom,
    });

    localStorage.setItem(
      `mosaicoViewport_${mosaicoId}`,
      JSON.stringify({
        x: -centerX + screenWidth / 2,
        y: -centerY + screenHeight / 2,
        zoom,
      })
    );

    setTimeout(() => {
      toast.success(t("toast.organizar.sucesso"));
      setLoading(false);
    }, 800);
  };

  {
    loading && (
      <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <>
      {initialPortView && (
        <div
          className="w-screen h-screen text-white"
          style={{
            background: estiloFundo,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="relative w-screen h-screen">
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              connectable={undefined}
              onNodesChange={(changes) => onNodesChange(changes)}
              onEdgesChange={() => {}}
              onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
              onConnectStart={() => false}
              proOptions={{ hideAttribution: true }}
              fitView={false}
              onInit={(instance) => {
                flowInstanceRef.current = instance;

                const saved = localStorage.getItem(
                  `mosaicoViewport_${mosaicoId}`
                );
                if (saved) {
                  const { x, y, zoom } = JSON.parse(saved);
                  instance.setViewport({ x, y, zoom });
                }
              }}
              onMoveEnd={(event, viewport) => handleViewportChange(viewport)}
            >
              <Background
                gap={16}
                size={1}
                color="rgba(255,255,255,0.3)"
                variant="dots"
              />

              {showControls && (
                <Controls
                  showInteractive
                  position="top-left"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 4,
                  }}
                />
              )}

              <NodeMiniMap />

              <ToolbarWithZoom
                onAddTessela={handleAddTessela}
                onWallpaperChange={handleWallpaperChange}
                onToggleControls={() => setShowControls((v) => !v)}
                onUpdateTeselaLocation={handleUpdateTeselaLocation}
                onOrganizarTesselas={organizarTesselas}
              />
            </ReactFlow>

            {loading && (
              <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
