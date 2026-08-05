import logo from "../assets/mombasa.png";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-700 to-slate-900 text-white p-16">

          <img
            src={logo}
            alt="CivicLens AI"
            className="w-28 h-28 object-contain mb-8"
          />

          <h1 className="text-5xl font-bold tracking-tight mb-4">
            CivicLens AI
          </h1>

          <h2 className="text-2xl font-semibold text-blue-100 mb-8">
            Smart Citizen Feedback Platform
          </h2>

          <p className="text-lg leading-8 text-blue-100">
            Empowering county governments with AI-driven citizen
            feedback analysis, intelligent categorization,
            departmental routing, and real-time analytics for
            informed decision-making.
          </p>

          <div className="mt-12 border-l-4 border-blue-300 pl-5">
            <p className="italic text-blue-100">
              Transforming citizen voices into actionable insights.
            </p>
          </div>

          <div className="mt-16 text-sm text-blue-200">
            © 2026 CivicLens AI
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
                CivicLens AI
              </h1>

              <p className="text-gray-500 text-center mt-2">
                Smart Citizen Feedback Platform
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