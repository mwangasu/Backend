import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Navbar from "../components/Navbar";
import StatusStepper from "../components/StatusStepper";
import { hasMinRole } from "../services/auth";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const baseStatusOptions = () => {
  const options = ["Open", "In Progress", "Pending Approval", "Resolved"];
  if (hasMinRole("admin")) options.push("Declined");
  return options;
};

const statusBadgeClass = (s) => {
  switch (s) {
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

const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);

function CaseDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState("Open");
  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [decliningPriority, setDecliningPriority] = useState(false);
  const [overridePriority, setOverridePriority] = useState("Medium");
  const [savingPriority, setSavingPriority] = useState(false);

  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [reason, setReason] = useState("");
  const [approving, setApproving] = useState(false);

  const isAdmin = hasMinRole("admin");
  const isOfficial = hasMinRole("official");

  const load = () => {
    api.get(`feedback/${id}/`)
      .then((res) => {
        setCaseData(res.data);
        setStatus(res.data.status === "Approved" ? "Open" : res.data.status);
        setNotes(res.data.resolution_notes || "");
        setOverridePriority(res.data.priority);
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveStatus = async () => {
    setSavingStatus(true);
    try {
      const res = await api.post(`feedback/${id}/update_status/`, {
        status,
        resolution_notes: notes,
      });
      setCaseData(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("submit.failedGeneric"));
    }
    setSavingStatus(false);
  };

  const confirmPriority = async () => {
    setSavingPriority(true);
    try {
      const res = await api.post(`feedback/${id}/confirm_priority/`);
      setCaseData(res.data);
      setOverridePriority(res.data.priority);
    } catch (err) {
      console.error(err);
      alert(t("submit.failedGeneric"));
    }
    setSavingPriority(false);
  };

  const declinePriority = async () => {
    setSavingPriority(true);
    try {
      const res = await api.post(`feedback/${id}/decline_priority/`, {
        priority: overridePriority,
      });
      setCaseData(res.data);
      setDecliningPriority(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("submit.failedGeneric"));
    }
    setSavingPriority(false);
  };

  const approveCase = async () => {
    setApproving(true);
    try {
      const res = await api.post(`feedback/${id}/approve_case/`, {
        budget,
        timeline,
        reason,
      });
      setCaseData(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("submit.failedGeneric"));
    }
    setApproving(false);
  };

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="page-container text-center py-20">
          <p className="text-lg font-semibold text-slate-700">{t("caseDetail.notFound")}</p>
          <button className="btn btn-ghost mt-6" onClick={() => navigate("/dashboard")}>
            {t("caseDetail.backToDashboard")}
          </button>
        </main>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Navbar />
        <main className="page-container">
          <div className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        </main>
      </>
    );
  }

  const isApproved = caseData.status === "Approved" || Boolean(caseData.allocated_budget);

  return (
    <>
      <Navbar />

      <main className="page-container max-w-4xl">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-800 transition mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("caseDetail.back")}
        </button>

        {/* Header */}
        <div className="page-header animate-in">
          <span className="eyebrow">{t("caseDetail.caseNumber")} #{caseData.id}</span>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">{caseData.category_name || "—"}</h1>
            <span className={statusBadgeClass(caseData.status)}>
              {t(`status.${caseData.status}`, caseData.status)}
            </span>
            <span className={`priority-${caseData.priority?.toLowerCase()}`}>
              {t(`priorityLevel.${caseData.priority}`, caseData.priority)} {t("caseDetail.priorityWord")}
            </span>
          </div>

          <p className="page-subtitle">
            {caseData.ward_name}, {caseData.county_name} &middot; {t("caseDetail.submitted")} {new Date(caseData.created_at).toLocaleString("en-GB")}
          </p>

          <div className="mt-6">
            <StatusStepper status={caseData.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">

            <div className="card animate-in">
              <h2 className="section-title">{t("caseDetail.citizenReport")}</h2>
              <p className="section-subtitle">
                {caseData.citizen_name || t("caseDetail.anonymous")}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {caseData.feedback_text}
              </p>
            </div>

            <div className="card animate-in" style={{ animationDelay: "80ms" }}>
              <h2 className="section-title">{t("caseDetail.aiAnalysis")}</h2>
              <p className="section-subtitle">{t("caseDetail.aiAnalysisSubtitle")}</p>

              <div className="space-y-4">
                <div>
                  <p className="field-label">{t("caseDetail.summary")}</p>
                  <p className="text-slate-700">{caseData.ai_summary}</p>
                </div>
                <div>
                  <p className="field-label">{t("caseDetail.recommendation")}</p>
                  <p className="text-slate-700">{caseData.recommendation}</p>
                </div>
                <div>
                  <p className="field-label">{t("caseDetail.actionPlan")}</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {(caseData.action_plan || "").split("\n").filter(Boolean).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="field-label">{t("caseDetail.routedDepartment")}</p>
                  <p className="text-slate-700">{caseData.department_name || t("caseDetail.unassigned")}</p>
                </div>
              </div>
            </div>

            {/* Funding decision - visible to everyone with case access once approved */}
            {isApproved && (
              <div
                className="card animate-in"
                style={{ animationDelay: "100ms", "--stat-color": "var(--accent)" }}
              >
                <h2 className="section-title">{t("caseDetail.fundingDecision")}</h2>
                <p className="section-subtitle">
                  {t("caseDetail.approvedBy")} {caseData.approved_by_name || t("caseDetail.govOfficial")}
                  {caseData.approved_at && ` ${new Date(caseData.approved_at).toLocaleDateString("en-GB")}`}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="field-label">{t("caseDetail.allocatedBudget")}</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formatKES(caseData.allocated_budget)}
                    </p>
                  </div>
                  <div>
                    <p className="field-label">{t("caseDetail.estimatedTimeline")}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {caseData.estimated_completion}
                    </p>
                  </div>
                </div>

                <p className="field-label">{t("caseDetail.reason")}</p>
                <p className="text-slate-700 leading-relaxed">{caseData.decision_reason}</p>
              </div>
            )}

          </div>

          {/* Right: role-gated actions */}
          <div className="space-y-6">

            {isAdmin ? (
              <div className="card animate-in" style={{ animationDelay: "120ms" }}>
                <h2 className="section-title">{t("caseDetail.priorityReview")}</h2>
                <p className="section-subtitle">
                  {caseData.priority_reviewed
                    ? `${t("caseDetail.reviewedBy")} ${caseData.reviewed_by_name || t("caseDetail.anAdmin")}`
                    : t("caseDetail.aiFlagged")}
                </p>

                {!decliningPriority ? (
                  <div className="flex flex-col gap-2">
                    <button
                      className="btn btn-primary"
                      disabled={savingPriority}
                      onClick={confirmPriority}
                    >
                      {savingPriority && <span className="spinner" />}
                      {t("caseDetail.confirmPriority")} "{t(`priorityLevel.${caseData.priority}`, caseData.priority)}" {t("caseDetail.priorityWord")}
                    </button>

                    <button
                      className="btn btn-ghost"
                      disabled={savingPriority}
                      onClick={() => setDecliningPriority(true)}
                    >
                      {t("caseDetail.declineOverride")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="select-control w-full"
                      value={overridePriority}
                      onChange={(e) => setOverridePriority(e.target.value)}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{t(`priorityLevel.${p}`, p)}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button className="btn btn-primary flex-1" disabled={savingPriority} onClick={declinePriority}>
                        {savingPriority && <span className="spinner" />}
                        {t("caseDetail.save")}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setDecliningPriority(false)}>
                        {t("caseDetail.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card animate-in" style={{ animationDelay: "120ms" }}>
                <h2 className="section-title">{t("caseDetail.priorityReview")}</h2>
                <p className="text-sm text-slate-500">
                  {caseData.priority_reviewed
                    ? `${t("caseDetail.reviewedBy")} ${caseData.reviewed_by_name || t("caseDetail.anAdmin")}.`
                    : t("caseDetail.awaitingReview")}
                </p>
              </div>
            )}

            <div className="card animate-in" style={{ animationDelay: "160ms" }}>
              <h2 className="section-title">{t("caseDetail.caseStatus")}</h2>
              <p className="section-subtitle">{t("caseDetail.caseStatusSubtitle")}</p>

              <label className="field-label">{t("caseDetail.status")}</label>
              <select
                className="select-control w-full mb-4"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {baseStatusOptions().map((s) => (
                  <option key={s} value={s}>{t(`status.${s}`, s)}</option>
                ))}
              </select>

              <label className="field-label">{t("caseDetail.resolutionNotes")}</label>
              <textarea
                className="field-control mb-4"
                rows="4"
                placeholder={t("caseDetail.resolutionNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: "vertical" }}
              />

              <button className="btn btn-primary w-full" disabled={savingStatus} onClick={saveStatus}>
                {savingStatus && <span className="spinner" />}
                {t("caseDetail.saveUpdate")}
              </button>

              {caseData.updated_at && (
                <p className="text-xs text-slate-400 mt-3">
                  {t("caseDetail.lastUpdated")} {new Date(caseData.updated_at).toLocaleString("en-GB")}
                </p>
              )}
            </div>

            {isOfficial && !isApproved && (
              <div
                className="card animate-in"
                style={{ animationDelay: "200ms", "--stat-color": "var(--gold)" }}
              >
                <h2 className="section-title">{t("caseDetail.approveTitle")}</h2>
                <p className="section-subtitle">
                  {t("caseDetail.approveSubtitle")}
                </p>

                <label className="field-label">{t("caseDetail.budgetLabel")}</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="field-control mb-4"
                  placeholder={t("caseDetail.budgetPlaceholder")}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />

                <label className="field-label">{t("caseDetail.timelineLabel")}</label>
                <input
                  type="text"
                  className="field-control mb-4"
                  placeholder={t("caseDetail.timelinePlaceholder")}
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />

                <label className="field-label">{t("caseDetail.reasonLabel")}</label>
                <textarea
                  rows="3"
                  className="field-control mb-4"
                  placeholder={t("caseDetail.reasonPlaceholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ resize: "vertical" }}
                />

                <button className="btn btn-accent w-full" disabled={approving} onClick={approveCase}>
                  {approving && <span className="spinner" />}
                  {t("caseDetail.approveBtn")}
                </button>
              </div>
            )}

          </div>

        </div>

      </main>
    </>
  );
}

export default CaseDetail;
