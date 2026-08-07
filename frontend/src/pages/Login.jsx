import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { landingPathForRole, setSession } from "../services/auth";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/token/", {
        username,
        password,
      });

      setSession({
        access: response.data.access,
        refresh: response.data.refresh,
      });

      const me = await api.get("me/");

      setSession({ role: me.data.role, username: me.data.username });

      navigate(landingPathForRole(me.data.role));
    } catch {
      setError(t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-slate-200 animate-in">

        <span className="eyebrow" style={{ color: "#0D9488" }}>
          {t("auth.login.eyebrow")}
        </span>

        <h1 className="text-3xl font-bold text-slate-900">
          {t("auth.login.title")}
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          {t("auth.login.subtitle")}
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="field-label">
              {t("auth.login.usernameLabel")}
            </label>

            <input
              type="text"
              className="field-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="field-label">
              {t("auth.login.passwordLabel")}
            </label>

            <input
              type="password"
              className="field-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
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
            {loading ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>

          <p className="text-center text-sm text-slate-500">
            {t("auth.login.noAccount")}{" "}
            <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">
              {t("auth.login.registerLink")}
            </Link>
          </p>

        </form>

      </div>
    </AuthLayout>
  );
}

export default Login;
