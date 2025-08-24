import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Detecta se estamos no Electron
const isElectron = window && window.process && window.process.type || process.env.IS_ELECTRON;

i18n
  .use(LanguageDetector)
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: isElectron ? "../locales/{{lng}}/{{ns}}.json" : "/locales/{{lng}}/{{ns}}.json",
    },
    debug: false,
    load: 'languageOnly',
    detection: {
      order: [
        "sessionStorage",
        "localStorage",
        "queryString",
        "cookie",
        "navigator",
      ],
      lookupSessionStorage: "lang",
      lookupLocalStorage: "i18nextLng",
      caches: ["sessionStorage"],
    },
    fallbackLng: "ptbr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
