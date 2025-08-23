import { ChevronRight, ZoomIn, LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import logoCinza from "@/assets/mosaico_logo_cinza.png";
import imgLanguages from "@/assets/languages.svg";
import logoImage from "@/assets/logoMosaico.png";
import { useAuth } from "@/context/AuthContext";

export default function ClosedToolbar({
  setCollapsed,
  modoManutencao,
  setModoManutencao,
}) {
  const navigate = useNavigate();
  const [mosaicoGloba, setMosaicoGlobal] = useState(true);
  const { id: mosaicoId } = useParams();
  const { mosaicos, ehDiretor, proprietarioId } = useAuth();

  useEffect(() => {
    const mosaico = mosaicos?.filter((x) => x.id == mosaicoId);
    if (
      mosaico &&
      mosaico?.ehGlobal &&
      mosaico[0]?.proprietarioId != proprietarioId
    ) {
      setMosaicoGlobal(false);
    } else {
      setMosaicoGlobal(true);
    }
  }, [mosaicos, mosaicoId]);

  return (
    <>
      {/* Toolbar lateral – visível apenas em telas sm+ */}
      <div className="hidden sm:flex fixed top-3/7 right-2 -translate-y-1/2 z-40 flex-col items-center bg-white/30 dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] px-2 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-black dark:text-white shadow-lg w-16 gap-6">
        <img
          src={logoImage}
          className="w-9 h-9 cursor-pointer"
          alt="Logo"
          onClick={() => setCollapsed(false)}
        />
        <img
          src={logoCinza}
          className="w-9 h-9 cursor-pointer"
          onClick={() => setCollapsed(false)}
        />
        <img
          src={imgLanguages}
          className="w-9 h-9 dark:invert brightness-0 cursor-pointer"
          onClick={() => setCollapsed(false)}
        />
        <ZoomIn
          size={24}
          className="cursor-pointer"
          onClick={() => setCollapsed(false)}
        />

        {mosaicoGloba ||
          (!ehDiretor && (
            <button
              onClick={() => {
                setModoManutencao((v) => !v);
                setCollapsed(false);
              }}
              className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
                modoManutencao ? "bg-green-500" : "bg-zinc-500"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  modoManutencao ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          ))}

        <LogOut
          size={22}
          className="cursor-pointer"
          onClick={() => {
            setCollapsed(false);
            navigate("/login");
          }}
        />
      </div>

      {/* Botão de abrir – visível apenas em sm+ */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-1/3 right-18 translate-y-1/4 w-6 h-20 bg-white/30 dark:bg-gradient-to-b dark:from-[#25314d] dark:via-[#2e3e5c] dark:to-[#1f2a40] text-black dark:text-white rounded-l-full flex items-center justify-center shadow-md backdrop-blur-md z-50"
      >
        <ChevronRight size={18} className="transition" />
      </button>
    </>
  );
}
