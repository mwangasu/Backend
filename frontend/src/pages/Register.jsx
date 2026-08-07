import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { landingPathForRole, setSession } from "../services/auth";
import AuthLayout from "../components/AuthLayout";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    national_id: "",
    phone_number: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api.post("register/", formData);

      setSession({
        access: res.data.access,
        refresh: res.data.refresh,
        role: res.data.role,
        username: res.data.username,
      });

      navigate(landingPathForRole(res.data.role));
    } catch (err) {
      setError(err.response?.data?.error || t("submit.failedGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-slate-200 animate-in">

        <span className="eyebrow" style={{ color: "#0D9488" }}>
          {t("auth.register.eyebrow")}
        </span>

        <h1 className="text-3xl font-bold text-slate-900">
          {t("auth.register.title")}
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          {t("auth.register.subtitle")}
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="field-label">{t("auth.register.nationalIdLabel")}</label>
            <input
              type="text"
              name="national_id"
              inputMode="numeric"
              className="field-control"
              value={formData.national_id}
              onChange={handleChange}
              placeholder="e.g. 32145678"
              required
            />
            <p className="text-xs text-slate-400 mt-1">{t("auth.register.nationalIdHelp")}</p>
          </div>

          <div>
            <label className="field-label">{t("auth.register.phoneLabel")}</label>
            <input
              type="tel"
              name="phone_number"
              className="field-control"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              autoComplete="tel"
              required
            />
            <p className="text-xs text-slate-400 mt-1">{t("auth.register.phoneHelp")}</p>
          </div>

          <div>
            <label className="field-label">{t("auth.register.emailLabel")}</label>
            <input
              type="email"
              name="email"
              className="field-control"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="field-label">{t("auth.register.passwordLabel")}</label>
            <input
              type="password"
              name="password"
              className="field-control"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="text-xs text-slate-400 mt-1">{t("auth.register.passwordHelp")}</p>
          </div>

          {error && (
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--danger)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" strokeLinecap="round" />
                <path d="M12 16h.01" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading && <span className="spinner" />}
            {loading ? t("auth.register.submitting") : t("auth.register.submit")}
          </button>

          <p className="text-center text-sm text-slate-500">
            {t("auth.register.haveAccount")}{" "}
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
              {t("auth.register.signInLink")}
            </Link>
          </p>

        </form>

      </div>
    </AuthLayout>
  );
}

export default Register;
