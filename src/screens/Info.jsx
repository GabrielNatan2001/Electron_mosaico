import { useEffect, useState } from "react";
import ReactFlow, {
  useNodesState,
  addEdge,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeMiniMap from "../components/mosaico/NodeMiniMap";
import NodeIcon from "@/components/mosaico/NodeIcon";
import { obterMosaicoGlobalInfo } from "@/api/services/informacoesService";
import TesselaIrParaLogin from "@/components/mosaico/TesselaIrParaLogin";
import TesselaAbrirDemo from "@/components/mosaico/TesselaAbrirDemo";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const nodeTypes = {
  icon: NodeIcon,
  tesselaLogin: TesselaIrParaLogin,
  tesselaDemo: TesselaAbrirDemo,
};

export function Info() {
  const { i18n } = useTranslation();

  var navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useState([]);
  const [showControls, setShowControls] = useState(false);
  const [initialPortView, setInitialPortView] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState({
    color: "linear-gradient(to bottom, #a26c3f, #355c5c)",
    url: null,
  });

  const loadMosaicoData = async () => {
    setIsLoading(true);
    try {
      const data = await obterMosaicoGlobalInfo();
      const nodesList = data.tesselas.map((item) => ({
        id: item.id,
        type: "icon",
        position: { x: item.x, y: item.y },
        data: {
          icon: item.iconUrl || "",
          label: item.label,
          descricao: "",
          resumo: "",
          tipo: "",
          valor: item.iconUrl,
          teselaId: item.id,
        },
        draggable: false,
      }));

      if (window.location.pathname.includes("/info")) {
        nodesList.push(
          {
            id: "tessela-login",
            type: "tesselaLogin",
            position: { x: -950 , y: -430 },
            data: {
              label: "Login",
              icon: "/login-icon.png",
            },
          },
          {
            id: "tessela-demo",
            type: "tesselaDemo",
            position: { x: -850, y: -430 },
            data: {
              label: "Demo",
              icon: "/demo-icon.png",
              abrirDemoAlert: () => setShowControls(true),
            },
          }
        );
      }

      const wallPaperDetails = {
        color: !data.planoDeFundo.includes("http")
          ? data.planoDeFundo
          : "#f3f3f3",
        url: data.planoDeFundo.includes("http") ? data.planoDeFundo : null,
      };

      setWallpaper(wallPaperDetails);
      setInitialPortView(calculateInitialViewport(nodesList));
      setNodes(nodesList);
    } catch (error) {
      console.error("Erro ao carregar o mosaico:", error);
      navigate("/idioma-indisponivel");
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMosaicoData();
  }, [i18n.language]);

  const calculateInitialViewport = (nodesParams) => {
    if (nodesParams.length === 0) return { x: 0, y: 0, zoom: 1 };

    const bounds = nodesParams.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        maxX: Math.max(acc.maxX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxY: Math.max(acc.maxY, node.position.y),
      }),
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

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#1f2a40]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
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
