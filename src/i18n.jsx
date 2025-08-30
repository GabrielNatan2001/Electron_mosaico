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
      loadPath: isElectron ? "./locales/{{lng}}/{{ns}}.json" : "/locales/{{lng}}/{{ns}}.json",
      crossDomain: false,
      withCredentials: false,
      requestOptions: {
        cache: 'force-cache'
      },
      allowMultiLoading: false,
      partialBundledLanguages: true,
      reloadInterval: false
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
      caches: ["sessionStorage", "localStorage"],
      checkWhitelist: true,
      checkForSimilarInWhitelist: true,
    },
    fallbackLng: "ptbr",
    supportedLngs: ["ptbr", "en", "es", "fr", "de", "it", "ru", "zh"],
    nonExplicitSupportedLngs: true,
    load: 'all',
    preload: ['ptbr'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    },
    initImmediate: false,
    saveMissing: false,
    missingKeyHandler: false
  });

export default i18n;
