import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export function LanguageSelect({
  className,
  currentLanguage,
  onLanguageChange,
}) {
  const { t, i18n } = useTranslation();

  const languageToUse = currentLanguage || i18n.language;

  const HandleChangeLanguage = (value) => {
    if (onLanguageChange) {
      onLanguageChange(value);
    } else {
      i18n.changeLanguage(value);
      sessionStorage.setItem("i18nextLng", value);
      sessionStorage.setItem("lang", value);
    }
  };

  return (
    <Select value={languageToUse} onValueChange={HandleChangeLanguage}>
      <SelectTrigger
        className={`cursor-pointer px-4 text-foreground border border-[#a8b6d3] dark:border-white/20 placeholder-[#4a4a4a] dark:placeholder-white/60 focus:ring-[#7aa0d3] dark:focus:ring-white/30 ${className}`}
      >
        <SelectValue placeholder={t("language") || "Idioma"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key="pt-BR" value="pt-BR">
          {t("languages.pt-BR")}
        </SelectItem>
        <SelectItem key="en" value="en">
          {t("languages.en")}
        </SelectItem>
        <SelectItem key="es" value="es">
          {t("languages.es")}
        </SelectItem>
        <SelectItem key="de" value="de">
          {t("languages.de")}
        </SelectItem>
        <SelectItem key="it" value="it">
          {t("languages.it")}
        </SelectItem>
        <SelectItem key="fr" value="fr">
          {t("languages.fr")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
