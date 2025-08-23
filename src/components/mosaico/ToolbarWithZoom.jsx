import { useReactFlow } from "reactflow";
import MosaicoToolbar from "./MosaicoToolbar";

export default function ToolbarWithZoom(props) {
  const flow = useReactFlow();

  return (
    <MosaicoToolbar
      {...props}
      onZoomIn={flow.zoomIn}
      onZoomOut={flow.zoomOut}
      onOrganizarTesselas={props.onOrganizarTesselas}
    />
  );
}
