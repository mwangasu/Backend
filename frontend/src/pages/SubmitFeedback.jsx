import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { getUsername } from "../services/auth";

function SubmitFeedback() {
  const { t } = useTranslation();
  const [counties, setCounties] = useState([]);
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    citizen_name: getUsername(),
    county: "",
    ward: "",
    feedback_text: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("counties/")
      .then((res) => setCounties(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.county) return;

    api.get(`wards/?county=${formData.county}`)
      .then((res) => setWards(res.data))
      .catch(console.error);
  }, [formData.county]);

  const wardOptions = formData.county ? wards : [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "county" ? { ward: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await api.post("analyze/", formData);
      setResult(res.data);

      setFormData({
        citizen_name: getUsername(),
        county: "",
        ward: "",
        feedback_text: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("submit.failedGeneric"));
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div
        className="min-h-screen py-10 px-6"
        style={{ background: "linear-gradient(180deg, #EEF2FF 0%, #F8FAFC 340px)" }}
      >
        <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden animate-in">

          <div
            className="p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(120deg, #14226B, #1E3A8A 55%, #0D9488 130%)" }}
          >
            <div
              className="absolute -top-16 -right-10 w-64 h-64 rounded-full opacity-25 pointer-events-none"
              style={{ background: "radial-gradient(circle, #2DD4BF, transparent 70%)" }}
            />

            <span className="eyebrow" style={{ color: "#99F6E4" }}>
              {t("submit.eyebrow")}
            </span>

            <h1 className="text-3xl font-bold text-white relative">
              {t("submit.title")}
            </h1>

            <p className="text-blue-100 mt-2 relative max-w-lg">
              {t("submit.subtitle")}
            </p>
          </div>

          <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="field-label">
                  {t("submit.nameLabel")}
                </label>

                <input
                  type="text"
                  name="citizen_name"
                  value={formData.citizen_name}
                  onChange={handleChange}
                  required
                  placeholder={t("submit.namePlaceholder")}
                  className="field-control"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="field-label">
                    {t("submit.countyLabel")}
                  </label>

                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    required
                    className="field-control"
                  >
                    <option value="">{t("submit.countyPlaceholder")}</option>

                    {counties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">
                    {t("submit.wardLabel")}
                  </label>

                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    required
                    disabled={!formData.county}
                    className="field-control"
                  >
                    <option value="">
                      {formData.county ? t("submit.wardPlaceholder") : t("submit.wardPlaceholderDisabled")}
                    </option>

                    {wardOptions.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="field-label">
                  {t("submit.issueLabel")}
                </label>

                <textarea
                  rows="6"
                  name="feedback_text"
                  value={formData.feedback_text}
                  onChange={handleChange}
                  required
                  placeholder={t("submit.issuePlaceholder")}
                  className="field-control"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading && <span className="spinner" />}
                {loading ? t("submit.submitting") : t("submit.submitBtn")}
              </button>

            </form>

          </div>

        </div>

        {result && (

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 mt-8 p-8 animate-in">

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent) 14%, white)", color: "var(--accent)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("submit.resultTitle")}
                </h2>
                <p className="text-sm text-slate-500">
                  {t("submit.resultSubtitle")}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <p className="field-label">{t("submit.category")}</p>

                <h3 className="font-semibold text-lg text-slate-900">
                  {result.category_name}
                </h3>
              </div>

              <div>
                <p className="field-label">{t("submit.priority")}</p>

                <span className={`priority-${result.priority?.toLowerCase() || "low"} text-sm px-4 py-2`}>
                  {t(`priorityLevel.${result.priority}`, result.priority)}
                </span>
              </div>

            </div>

            <div className="mt-6">
              <p className="field-label">{t("submit.summary")}</p>

              <p className="mt-2 text-slate-700 leading-relaxed">
                {result.ai_summary}
              </p>
            </div>

            <div className="mt-6">
              <p className="field-label">{t("submit.recommendation")}</p>

              <p className="mt-2 text-slate-700 leading-relaxed">
                {result.recommendation}
              </p>
            </div>

          </div>

        )}

        </div>
      </div>
    </>
  );
}

export default SubmitFeedback;
