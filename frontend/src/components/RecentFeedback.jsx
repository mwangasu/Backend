import { useEffect, useState } from "react";
import api from "../services/api";

function RecentFeedback() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("recent/")
      .then((res) => setReports(res.data))
      .catch(console.error);
  }, []);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No citizen reports available.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>

        <thead>
          <tr>
            <th>Citizen</th>
            <th>Ward</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {reports.map((report) => (

            <tr
              key={report.id}
              className="hover:bg-gray-50 transition"
            >

              <td>{report.citizen_name}</td>

              <td>{report.ward}</td>

              <td>{report.category}</td>

              <td>
                <span className={priorityClass(report.priority)}>
                  {report.priority}
                </span>
              </td>

              <td>{formatDate(report.created_at)}</td>

            </tr>

          ))}

        </tbody>

      </table>
    </div>
  );
}

export default RecentFeedback;