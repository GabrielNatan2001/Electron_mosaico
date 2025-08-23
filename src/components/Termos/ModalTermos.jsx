import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { useTranslation } from "react-i18next";

export default function ModalTermos() {
  const [mostrar, setMostrar] = useState(false);
  const [aceitou, setAceitou] = useState(false);
  const [habilitarCheckbox, setHabilitarCheckbox] = useState(false);
  const ref = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    const aceitou = localStorage.getItem("aceitouTermos") === "true";
    setMostrar(!aceitou);
  }, []);

const verificarScroll = (e) => {
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
    setHabilitarCheckbox(true);
  }
};


  const aceitar = () => {
  localStorage.setItem("aceitouTermos", "true");
  setMostrar(false);
};

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-border bg-white/80 dark:bg-card/70 backdrop-blur-md shadow-xl p-5 text-foreground theme-gradient">
        <div className="flex flex-col items-center justify-center mb-4">
          <Logo className="h-8" />
          <h2 className="text-xl font-semibold mt-3 text-center">
            {t("termos.titulo")}
          </h2>
        </div>

        <div  onScroll={verificarScroll}
        className="h-60 overflow-y-auto rounded-md border border-border p-4 text-sm space-y-3 custom-scrollbar bg-white/50 dark:bg-white/10 text-black dark:text-white/80">
          <p>{t("termos.paragrafos.intro")}</p>
          <p>{t("termos.paragrafos.1")}</p>
          <p>{t("termos.paragrafos.2")}</p>
          <p>{t("termos.paragrafos.3")}</p>
          <p>{t("termos.paragrafos.4")}</p>
          <p>{t("termos.paragrafos.5")}</p>
          <p>{t("termos.paragrafos.6")}</p>
          <p>{t("termos.paragrafos.7")}</p>
          <p>{t("termos.paragrafos.final")}</p>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-primary h-4 w-4 cursor-pointer"
            onChange={(e) => setAceitou(e.target.checked)}
            disabled={!habilitarCheckbox}
          />
          <label className="text-sm select-none cursor-pointer">
            {t("termos.checkbox")}
          </label>
        </div>

        <button
          onClick={aceitar}
          disabled={!aceitou}
          className="mt-6 w-full py-2 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-40 hover:opacity-90 transition"
        >
          {t("termos.continuar")}
        </button>
      </div>
    </div>
  );
}
