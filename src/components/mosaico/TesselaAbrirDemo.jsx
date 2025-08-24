import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import idiomasIcon from "@/assets/IconIdiomas.png";

const flags = [
  { flagCode: "br", label: "Português", i18nCode: "ptbr" },
  { flagCode: "de", label: "Deutsch", i18nCode: "de" },
  { flagCode: "it", label: "Italiano", i18nCode: "it" },
  { flagCode: "fr", label: "Français", i18nCode: "fr" },
  { flagCode: "es", label: "Español", i18nCode: "es" },
  { flagCode: "us", label: "English", i18nCode: "en" },
];

export default function TesselaAbrirDemo() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = i18n.language;

  const handleLanguageClick = (code) => {
    i18n.changeLanguage(code);
    sessionStorage.setItem("i18nextLng", code);
    sessionStorage.setItem("lang", code);
    setOpen(false);
  };

  return (
    
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="flex flex-col items-center cursor-pointer pointer-events-auto"
        >
          <img
            src={idiomasIcon}
            alt="idiomas"
            className="h-18 object-contain animate-[pulse-strong_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(0,200,255,0.7)] rounded-full"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle, black 80%, transparent 100%)",
              maskImage: "radial-gradient(circle, black 80%, transparent 100%)",
            }}
            draggable={false}
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

            {t("language.languages")}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        className="bg-[#1f2a40] border-white/10 rounded-xl p-2 animate-in fade-in slide-in-from-bottom-2 w-auto"
      >
        <div className="flex gap-2 justify-center">
          {flags.map((flag) => (
            <button
              key={flag.flagCode}
              onClick={() => handleLanguageClick(flag.i18nCode)}
              className={`w-6 h-6 rounded-full overflow-hidden transition-all duration-300 
                hover:-translate-y-1 hover:scale-105 
                   ${
                     currentLang === flag.i18nCode
                       ? "ring-2 ring-offset-2 ring-blue-400 scale-110 shadow-[0_0_10px_2px_rgba(59,130,246,0.6)]"
                       : "opacity-60 hover:opacity-100"
                   }
                `}
            >
              <img
                src={`https://flagcdn.com/${flag.flagCode}.svg`}
                alt={flag.label}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
