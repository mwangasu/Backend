import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

import Navbar from "../components/Navbar";
import DashboardCards from "../components/DashboardCards";
import CategoryChart from "../components/CategoryChart";
import WardChart from "../components/WardChart";
import RecentFeedback from "../components/RecentFeedback";
import DashboardSkeleton from "../components/DashboardSkeleton";

function Dashboard() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [counties, setCounties] = useState([]);
  const [county, setCounty] = useState("");

  useEffect(() => {
    api.get("counties/")
      .then((res) => setCounties(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const query = county ? `?county=${county}` : "";

    api.get(`dashboard/${query}`)
      .then((res) => setDashboard(res.data))
      .catch((err) => console.error(err));
  }, [county]);

  const downloadPDF = async () => {
    try {
      const response = await api.get("reports/pdf/", {
        responseType: "blob",
        params: county ? { county } : {},
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
      alert(t("submit.failedGeneric"));
    }
  };

  if (!dashboard) {
    return (
      <>
        <Navbar />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container">

        {/* Header */}
        <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-in">

          <div>
            <span className="eyebrow">{t("dashboard.eyebrow")}</span>

            <h1 className="page-title">
              {t("dashboard.title")}
            </h1>

            <p className="page-subtitle">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Report Actions */}
          <div className="flex flex-wrap gap-3">

            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="select-control bg-white/95"
            >
              <option value="">{t("dashboard.allCounties")}</option>

              {counties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button onClick={downloadPDF} className="btn btn-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3" />
                <path d="m6 10 6 5 6-5" />
                <path d="M19 21H5" />
              </svg>
              {t("dashboard.exportPdf")}
            </button>

            <button disabled className="btn btn-on-dark">
              {t("dashboard.exportExcel")}
            </button>

          </div>

        </div>

        {/* Dashboard Cards */}
        <DashboardCards dashboard={dashboard} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          <div className="card animate-in" style={{ animationDelay: "240ms" }}>
            <h2 className="section-title">
              {t("dashboard.categoryChartTitle")}
            </h2>
            <p className="section-subtitle">
              {t("dashboard.categoryChartSubtitle")}
              {county ? "" : ` ${t("dashboard.acrossAllCounties")}`}.
            </p>

            <CategoryChart
              data={dashboard.categories}
            />
          </div>

          <div className="card animate-in" style={{ animationDelay: "300ms" }}>
            <h2 className="section-title">
              {t("dashboard.wardChartTitle")}
            </h2>
            <p className="section-subtitle">
              {t("dashboard.wardChartSubtitle")}
            </p>

            <WardChart
              data={dashboard.wards}
            />
          </div>

        </div>

        {/* Recent Reports */}
        <div className="card mt-8 animate-in" style={{ animationDelay: "360ms" }}>

          <h2 className="section-title">
            {t("dashboard.recentTitle")}
          </h2>
          <p className="section-subtitle">
            {t("dashboard.recentSubtitle")}
          </p>

          <RecentFeedback key={county} county={county} />

        </div>

      </main>
    </>
  );
}

export default Dashboard;
