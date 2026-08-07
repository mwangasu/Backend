import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n";

function LanguageSwitch({ dark = false }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language;

  const baseBtn = "px-2.5 py-1 rounded-md text-xs font-semibold transition";
  const activeLight = "bg-blue-700 text-white";
  const inactiveLight = "text-slate-500 hover:text-slate-800";
  const activeDark = "bg-white/25 text-white";
  const inactiveDark = "text-white/60 hover:text-white";

  const wrapClass = dark
    ? "inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg p-1"
    : "inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1";

  return (
    <div className={wrapClass}>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`${baseBtn} ${current === "en" ? (dark ? activeDark : activeLight) : (dark ? inactiveDark : inactiveLight)}`}
      >
        {t("language.english")}
      </button>
      <button
        type="button"
        onClick={() => setLanguage("sw")}
        className={`${baseBtn} ${current === "sw" ? (dark ? activeDark : activeLight) : (dark ? inactiveDark : inactiveLight)}`}
      >
        {t("language.swahili")}
      </button>
    </div>
  );
}

export default LanguageSwitch;
