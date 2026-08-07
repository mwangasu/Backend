import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/kenya.png";
import { clearSession, getRole, getUsername, hasMinRole } from "../services/auth";
import LanguageSwitch from "./LanguageSwitch";

const ROLE_COLORS = {
  guest: "var(--accent)",
  staff: "var(--chart-1)",
  admin: "var(--chart-7)",
  official: "var(--gold)",
};

function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const role = getRole();
  const username = getUsername();
  const roleColor = ROLE_COLORS[role] || "var(--primary)";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "navbar-glass border-slate-200 shadow-sm"
          : "bg-white border-transparent"
      }`}
    >
      <div
        className="h-1"
        style={{ background: "linear-gradient(90deg, #1E3A8A, #0D9488, #D97706)" }}
      />

      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Kenya Coat of Arms"
            className="h-12 w-auto"
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {t("app.name")}
              </h1>

              <span
                className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 px-2 py-0.5 rounded-full"
                style={{ background: "color-mix(in srgb, #0D9488 14%, white)" }}
              >
                {t("app.badge")}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              {t("app.tagline")}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">

          {hasMinRole("staff") && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "text-blue-800 bg-blue-50"
                    : "text-slate-600 hover:text-blue-800 hover:bg-slate-50"
                }`
              }
            >
              {t("nav.dashboard")}
            </NavLink>
          )}

          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "text-blue-800 bg-blue-50"
                  : "text-slate-600 hover:text-blue-800 hover:bg-slate-50"
              }`
            }
          >
            {t("nav.submitReport")}
          </NavLink>

          <div className="ml-3">
            <LanguageSwitch />
          </div>

          <div className="ml-3 hidden md:flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: roleColor }}
            />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-slate-800">{username}</span>
              <span className="text-xs font-medium" style={{ color: roleColor }}>
                {t(`roles.${role}`)}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-4 flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            {t("nav.logout")}
          </button>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;
