import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/kenya.png";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Kenya Coat of Arms"
            className="h-12 w-auto"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              CivicLens AI
            </h1>

            <p className="text-sm text-gray-500">
              Citizen Intelligence & Analytics Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-blue-700"
                : "font-medium text-gray-600 hover:text-blue-700 transition"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/submit"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-blue-700"
                : "font-medium text-gray-600 hover:text-blue-700 transition"
            }
          >
            Submit Report
          </NavLink>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;