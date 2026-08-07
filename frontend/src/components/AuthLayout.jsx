import { useTranslation } from "react-i18next";
import logo from "../assets/mombasa.png";
import LanguageSwitch from "./LanguageSwitch";

function AuthLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(circle at 20% 20%, #EEF2FF, #F8FAFC 60%)" }}
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative">

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitch />
        </div>

        {/* Left Branding Panel */}
        <div
          className="hidden lg:flex flex-col justify-center relative overflow-hidden text-white p-16"
          style={{ background: "linear-gradient(150deg, #14226B 0%, #1E3A8A 55%, #0D9488 130%)" }}
        >

          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          />

          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #14B8A6, transparent 70%)" }}
          />

          <div
            className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
          />

          <div
            className="absolute top-1/3 right-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #D97706, transparent 70%)" }}
          />

          <div className="relative z-10">

            <img
              src={logo}
              alt="CivicLens AI"
              className="w-28 h-28 object-contain mb-8"
            />

            <h1 className="text-5xl font-bold tracking-tight mb-4">
              {t("auth.brandTitle")}
            </h1>

            <h2 className="text-2xl font-semibold text-teal-100 mb-8">
              {t("auth.brandSubtitle")}
            </h2>

            <p className="text-lg leading-8 text-blue-100">
              {t("auth.brandDescription")}
            </p>

            <div className="mt-12 border-l-4 border-teal-300 pl-5">
              <p className="italic text-blue-100">
                {t("auth.brandQuote")}
              </p>
            </div>

            <div className="mt-12 flex gap-10">
              <div>
                <p className="text-3xl font-bold" style={{ color: "#2DD4BF" }}>47</p>
                <p className="text-xs uppercase tracking-wide text-blue-200 mt-1">{t("auth.statCounties")}</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>24/7</p>
                <p className="text-xs uppercase tracking-wide text-blue-200 mt-1">{t("auth.statMonitoring")}</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: "#60A5FA" }}>Real-Time</p>
                <p className="text-xs uppercase tracking-wide text-blue-200 mt-1">{t("auth.statAnalytics")}</p>
              </div>
            </div>

            <div className="mt-14 text-sm text-blue-200">
              {t("auth.copyright")}
            </div>

          </div>

        </div>

        {/* Right Login Panel */}
        <div className="flex items-center justify-center bg-white p-8 lg:p-16">
          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <img
                src={logo}
                alt="CivicLens AI"
                className="w-24 h-24 object-contain mb-4"
              />

              <h1 className="text-3xl font-bold text-slate-800">
                {t("auth.brandTitle")}
              </h1>

              <p className="text-gray-500 text-center mt-2">
                {t("auth.brandSubtitle")}
              </p>
            </div>

            {children}

          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;
