import { useEffect, useState } from "react";
import api from "../services/api";

function SubmitFeedback() {
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    citizen_name: "",
    ward: "",
    feedback_text: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("wards/")
      .then((res) => setWards(res.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await api.post("analyze/", formData);
      setResult(res.data);

      setFormData({
        citizen_name: "",
        ward: "",
        feedback_text: "",
      });
    } catch (err) {
      console.error(err);
      alert("Submission failed.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">

      <div className="bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Submit Citizen Report
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          Help county officials identify and resolve community issues through AI-assisted analysis.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div>

            <label className="block font-medium mb-2">
              Citizen Name
            </label>

            <input
              type="text"
              name="citizen_name"
              value={formData.citizen_name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none"
            />

          </div>

          <div>

            <label className="block font-medium mb-2">
              Ward
            </label>

            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select Ward</option>

              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="block font-medium mb-2">
              Describe the Issue
            </label>

            <textarea
              rows="6"
              name="feedback_text"
              value={formData.feedback_text}
              onChange={handleChange}
              required
              placeholder="Describe the issue in your community..."
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Analyzing..." : "Analyze & Submit Report"}
          </button>

        </form>

      </div>

      {result && (

        <div className="bg-white rounded-2xl shadow-md mt-8 p-8">

          <h2 className="text-2xl font-bold mb-6">
            AI Analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <p className="text-gray-500">Category</p>

              <h3 className="font-semibold text-lg">
                {result.category_name}
              </h3>

            </div>

            <div>

              <p className="text-gray-500">Priority</p>

              <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold">
                {result.priority}
              </span>

            </div>

          </div>

          <div className="mt-6">

            <p className="text-gray-500">Summary</p>

            <p className="mt-2">
              {result.ai_summary}
            </p>

          </div>

          <div className="mt-6">

            <p className="text-gray-500">
              Recommendation
            </p>

            <p className="mt-2">
              {result.recommendation}
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default SubmitFeedback;