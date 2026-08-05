import { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";
import DashboardCards from "../components/DashboardCards";
import CategoryChart from "../components/CategoryChart";
import WardChart from "../components/WardChart";
import RecentFeedback from "../components/RecentFeedback";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("dashboard/")
      .then((res) => setDashboard(res.data))
      .catch((err) => console.error(err));
  }, []);

  const downloadPDF = async () => {
    try {
      const response = await api.get("reports/pdf/", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "CivicLens_Report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Unable to generate PDF report.");
    }
  };

  if (!dashboard) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-semibold">
          Loading CivicLens AI Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container">

        {/* Header */}
        <div className="page-header">

          <div>
            <h1 className="page-title">
              Citizen Intelligence Dashboard
            </h1>

            <p className="page-subtitle">
              AI-powered insights from citizen feedback across county wards.
            </p>
          </div>

          {/* Report Actions */}
          <div className="flex gap-3 mt-4 lg:mt-0">

            <button
              onClick={downloadPDF}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-medium transition"
            >
              Export PDF
            </button>

            <button
              disabled
              className="bg-gray-200 text-gray-500 px-5 py-3 rounded-lg cursor-not-allowed"
            >
              Export Excel
            </button>

          </div>

        </div>

        {/* Dashboard Cards */}
        <DashboardCards dashboard={dashboard} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          <div className="card">
            <h2 className="section-title">
              Community Issues by Category
            </h2>

            <CategoryChart
              data={dashboard.categories}
            />
          </div>

          <div className="card">
            <h2 className="section-title">
              Ward Activity Overview
            </h2>

            <WardChart
              data={dashboard.wards}
            />
          </div>

        </div>

        {/* Recent Reports */}
        <div className="card mt-8">

          <h2 className="section-title">
            Recent Citizen Reports
          </h2>

          <RecentFeedback />

        </div>

      </main>
    </>
  );
}

export default Dashboard;