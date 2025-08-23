import { useNavigate } from "react-router-dom";
import loginInfo from "../../assets/logoMosaico.png";

export default function TesselaIrParaLogin({ data }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/login")}
      className="flex flex-col items-center cursor-pointer pointer-events-auto"
    >
      <img
        src={loginInfo}
        alt="login"
        className="h-18 object-contain animate-[pulse-strong_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(0,200,255,0.7)] rounded-full"
        draggable={false}
        style={{
          WebkitMaskImage:
            "radial-gradient(circle, black 80%, transparent 100%)",
          maskImage: "radial-gradient(circle, black 80%, transparent 100%)",
        }}
      />
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
        {data.label?.toUpperCase() || "LOGIN"}
      </span>
    </div>
  );
}
