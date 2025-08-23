import { useEffect, useRef, useState } from "react";
import ReactFlow, {
  useNodesState,
  addEdge,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeMiniMap from "../components/mosaico/NodeMiniMap";
import NodeIcon from "@/components/mosaico/NodeIcon";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMosaicoByPath } from "@/api/services/mosaicoService";

const nodeTypes = {
  icon: NodeIcon,
};

export function MosaicoPagePath() {
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

  const location = useLocation();
  const isPublico = location.pathname.includes("/publicos");
  const mosaicoPath = location.pathname.replace("/publicos/", "");

  const loadMosaicoData = async () => {
    try {
      const data = await getMosaicoByPath(mosaicoPath);

      var nodesList = data.tesselas.map((item) => ({
        id: item.id,
        type: "icon",
        position: {
          x: item.x,
          y: item.y,
        },
        data: {
          icon: item.iconUrl || "",
          label: item.label,
          descricao: item.descricao || "",
          resumo: "",
          tipo: "",
          valor: item.iconUrl,
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
    } catch (error) {
      console.error("Erro ao carregar mosaico:", error);
      toast.error("Erro ao carregar o mosaico");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mosaicoPath) {
      setInitialPortView(null);
      loadMosaicoData();
    }
  }, [mosaicoPath]);

  const calculateInitialViewport = (nodesParams) => {
    if (nodesParams.length === 0) return { x: 0, y: 0, zoom: 1 };

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

  if (loading) {
    return (
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
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            connectable={undefined}
            onNodesChange={onNodesChange}
            onEdgesChange={() => {}}
            onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
            onConnectStart={() => false}
            proOptions={{ hideAttribution: true }}
            defaultViewport={initialPortView}
            fitView={false}
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
          </ReactFlow>
        </div>
      )}
    </>
  );
}
