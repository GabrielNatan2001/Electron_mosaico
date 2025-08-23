import React from "react";
import { FileText, Video, Link as LinkIcon, File, PlaySquare } from "lucide-react";
import iconePdf from "@/assets/pdf.png";
import iconeOffice from "@/assets/microsoft.png";
import iconeTxt from "@/assets/arquivo-txt.png";
import iconeVideo from "@/assets/video.png";
import iconeUrl from "@/assets/url.png";
import conteudoGenerico from "@/assets/conteudoGenerico.png";
import audio from "@/assets/volume.png";

import dwg from "@/assets/dwg.png";


export default function CardConteudoTessela({ conteudo, index, onClick }) {
  const ext = conteudo.nomeConteudo?.split(".").pop()?.toLowerCase();
  const tipo = conteudo.tipo?.toLowerCase() || ext;

  const visualClass = "w-full h-full max-w-[70%] max-h-[70%] object-contain";

  const renderVisual = () => {
    switch (tipo) {
      case "imagem":
        return conteudo.url ? (
          <img
            src={conteudo.url}
            alt={conteudo.nomeConteudo}
            className={visualClass}
          />
        ) : (
          <div
            className={`${visualClass} bg-gray-700 flex items-center justify-center`}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
        );

      case "pdf":
        return <img src={iconePdf} alt="PDF Icon" className={visualClass} />;

      case "video":
        return <img src={iconeVideo} alt="Vídeo" className={visualClass} />;

      case "link":
        return <img src={iconeUrl} alt="Url" className={visualClass} />;

      case "office":
        return <img src={iconeOffice} alt="Office" className={visualClass} />;

      case "texto":
        return <img src={iconeTxt} alt="Texto" className={visualClass} />;

      case "dwg":
        return <img src={dwg} alt="DWG" className={visualClass} />;

      case "audio":
        return <img src={audio} alt="volume" className={visualClass} />;

      default:
        return (
          <img src={conteudoGenerico} alt="Conteúdo" className={visualClass} />
        );
    }
  };

  return (
    <div
      onClick={() => onClick(conteudo)}
      className="cursor-pointer select-none ml-5 mt-5 w-[100px] h-[100px] flex flex-col items-center justify-start text-white"
    >
      {renderVisual()}
      <p className="text-[10px] text-center truncate w-full h-[20%] px-1">
        {conteudo.nomeConteudo?.toUpperCase() || `Item ${index + 1}`}
      </p>
    </div>
  );
}
