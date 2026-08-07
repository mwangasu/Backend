import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";

function RecentFeedback({ county }) {
  const { t } = useTranslation();
  const [reports, setReports] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const query = county ? `?county=${county}` : "";

    api.get(`recent/${query}`)
      .then((res) => setReports(res.data))
      .catch((err) => {
        console.error(err);
        setReports([]);
      });
  }, [county]);

  const priorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      default:
        return "priority-low";
    }
  };

  const priorityAccent = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "var(--danger)";
      case "medium":
        return "var(--warning)";
      default:
        return "var(--success)";
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "Resolved":
      case "Approved":
        return "priority-low";
      case "Declined":
        return "priority-high";
      case "In Progress":
      case "Pending Approval":
        return "priority-medium";
      default:
        return "priority-medium";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (reports === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: 44, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3">
          <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6h-3" />
          <path d="M13 2v6h6" />
        </svg>
        <p className="font-medium text-slate-500">{t("table.emptyTitle")}</p>
        <p className="text-sm mt-1">{t("table.emptySubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>

        <thead>
          <tr>
            <th>{t("table.citizen")}</th>
            <th>{t("table.county")}</th>
            <th>{t("table.ward")}</th>
            <th>{t("table.category")}</th>
            <th>{t("table.priority")}</th>
            <th>{t("table.status")}</th>
            <th>{t("table.date")}</th>
          </tr>
        </thead>

        <tbody>

          {reports.map((report) => (

            <tr
              key={report.id}
              style={{ "--row-accent": priorityAccent(report.priority), cursor: "pointer" }}
              onClick={() => navigate(`/cases/${report.id}`)}
            >

              <td className="font-medium text-slate-800">{report.citizen_name}</td>

              <td className="text-slate-500">{report.county}</td>

              <td className="text-slate-500">{report.ward}</td>

              <td className="text-slate-500">{report.category}</td>

              <td>
                <span className={priorityClass(report.priority)}>
                  {t(`priorityLevel.${report.priority}`, report.priority)}
                </span>
                {!report.priority_reviewed && (
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                    {t("table.unreviewed")}
                  </span>
                )}
              </td>

              <td>
                <span className={statusClass(report.status)}>
                  {t(`status.${report.status || "Open"}`, report.status || "Open")}
                </span>
              </td>

              <td className="text-slate-500 tabular-nums">{formatDate(report.created_at)}</td>

            </tr>

          ))}

        </tbody>

      </table>
    </div>
  );
}

export default RecentFeedback;
