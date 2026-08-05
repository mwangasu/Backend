import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function Login() {
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

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-slate-200">

        <h1 className="text-3xl font-bold text-slate-800">
          Welcome Back
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          County Administration Portal
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block mb-2 text-sm font-medium">
              Username
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

      </div>
    </AuthLayout>
  );
}

export default Login;