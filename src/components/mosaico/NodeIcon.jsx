import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import DialogTeselaContent from "./DialogTeselaContent";
import { useReactFlow } from "reactflow";
import { useLocation } from "react-router-dom";

export default function NodeIcon(props) {
  const [open, setOpen] = useState(false);
  const { data } = props;
  const { setNodes } = useReactFlow();
  const location = useLocation();
  const estaNaRotaInfoOuPublico =
    location.pathname.includes("/info") ||
    location.pathname.includes("/publicos");

  const truncatedLabel =
    data.label && data.label.length > 15
      ? data.label.substring(0, 15) + "..."
      : data.label;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative flex flex-col items-center cursor-pointer pointer-events-auto"
      >
        {!open && data.resumo && (
          <div className="absolute top-[-1.5rem] left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-0.5 rounded shadow">
            {data.resumo}
          </div>
        )}

        <div className="relative w-[60px] h-[60px] flex items-center justify-center">
          <img
            src={data.icon || "/fallback.png"}
            alt="icon"
            className={`w-[45px] h-[45px] object-contain relative z-10 ${
              data.highlight ? "animate-glow-lime" : ""
            }`}
            draggable={false}
          />

          {data.highlight && (
            <div className="absolute w-[60px] h-[60px] rounded-full border-[2px] border-[#ccff00] shadow-[0_0_10px_#ccff00] animate-pulse z-0" />
          )}
        </div>

        <span
          className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded text-white"
          style={{
            textShadow: [
              "-1px -1px 0 #000",
              " 1px -1px 0 #000",
              "-1px  1px 0 #000",
              " 1px  1px 0 #000",
              " 0px -1px 0 #000",
              " 0px  1px 0 #000",
              "-1px  0px 0 #000",
              " 1px  0px 0 #000",
            ].join(", "),
          }}
        >
          {truncatedLabel?.toUpperCase()}
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTeselaContent
          data={data}
          open={open}
          onOpenChange={(dataDeleteTessela) => {
            setOpen(false);
            setNodes((nodes) =>
              nodes.filter((node) => node.id !== dataDeleteTessela.teselaId)
            );
          }}
          noEditable={estaNaRotaInfoOuPublico}
        />
      </Dialog>
    </>
  );
}
