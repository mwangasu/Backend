import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import sw from "./sw.json";

const storedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
    },
    lng: storedLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export function setLanguage(lang) {
  localStorage.setItem("language", lang);
  i18n.changeLanguage(lang);
}

export default i18n;
