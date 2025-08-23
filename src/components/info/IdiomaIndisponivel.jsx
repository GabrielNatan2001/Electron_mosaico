import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import backgroundCountry from "@/assets/bandeiras.png";
import errorFace from "@/assets/oops.png";

export default function IdiomaIndisponivel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    const langCode = "en";
    i18n.changeLanguage(langCode);
    sessionStorage.setItem("i18nextLng", langCode);
    sessionStorage.setItem("lang", langCode);
    navigate("/info");
  };

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-[#1f2a40] text-black dark:text-white overflow-hidden">
      <div className="absolute inset-0 bg-white/10 dark:bg-[#1f2a40]/50 z-0" />
      <div
        className="absolute inset-0 bg-cover bg-center brightness-90 contrast-90 opacity-40 z-0"
        style={{ backgroundImage: `url(${backgroundCountry})` }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 min-h-screen">
        <img
          src={errorFace}
          alt="erro"
          className="w-36 h-36 object-contain dark:invert dark:brightness-200"
        />

        <h1 className="text-2xl font-bold mb-1">
          {t("language.unavailableTitle", "Idioma não disponível")}
        </h1>

        <p className="max-w-sm mb-6 text-sm text-black/70 dark:text-white/80">
          {t(
            "language.unavailableMessage",
            "Desculpe, ainda não temos suporte para este idioma. Fique de olho ou entre em contato conosco."
          )}
        </p>

        <Button onClick={handleBackToHome}>
          {t("language.backHome", "Voltar para o início")}
        </Button>
      </div>
    </div>
  );
}
