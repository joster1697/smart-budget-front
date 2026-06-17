//internationalization(languages)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importa los archivos JSON
import translationEN from "./locales/sidebartranslations/en/translation.json";
import translationES from "./locales/sidebartranslations/es/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

i18n
  // Detecta el idioma del navegador del usuario
  .use(LanguageDetector)
  // Pasa i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18n
  .init({
    resources,
    fallbackLng: "es", // Idioma por defecto si no detecta ninguno de los disponibles
    debug: false, // Cámbialo a true si quieres ver logs de debug en la consola del navegador
    interpolation: {
      escapeValue: false, // React ya previene inyecciones XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"], // Guarda la selección del usuario en localStorage
    },
  });

export default i18n;
