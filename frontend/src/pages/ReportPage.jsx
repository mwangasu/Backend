import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

function ReportPage() {
  const location = useLocation()
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(location.state?.submissionId || '')
  const [feedbackText, setFeedbackText] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard`)
      const data = response.data.submissions || []
      setSubmissions(data)
      if (data.length && !selectedSubmissionId) {
        setSelectedSubmissionId(data[0].id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (selectedSubmissionId) {
      const loadReport = async () => {
        setLoading(true)
        try {
          const response = await axios.get(`${API_URL}/api/generate-report/${selectedSubmissionId}`)
          setReport(response.data)
        } catch (error) {
          setReport(null)
        } finally {
          setLoading(false)
        }
      }
      loadReport()
    }
  }, [selectedSubmissionId])

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault()
    if (!selectedSubmissionId) return
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/api/analyze-feedback`, {
        submission_id: selectedSubmissionId,
        feedback_text: feedbackText,
      })
      setFeedbackText('')
      setMessage('Feedback was recorded and analyzed.')
      const response = await axios.get(`${API_URL}/api/generate-report/${selectedSubmissionId}`)
      setReport(response.data)
    } catch (error) {
      setMessage('Unable to analyze feedback at the moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel p-8 sm:p-10">
        <div className="pill">AI report generator</div>
        <h2 className="mt-4 text-3xl font-semibold">Turn feedback into a decision-ready brief</h2>
        <p className="mt-2 text-slate-300">
          Choose a submission, add resident feedback, and turn it into a clear story with themes and sentiment insights.
        </p>

        <div className="mt-6 space-y-4">
          <select value={selectedSubmissionId} onChange={(e) => setSelectedSubmissionId(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none">
            {submissions.map((item) => (
              <option key={item.id} value={item.id}>{item.constituency_name}</option>
            ))}
          </select>

          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none" placeholder="Add resident feedback to enrich the report" required />
            <button type="submit" disabled={loading} className="rounded-full bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
              {loading ? 'Analyzing...' : 'Analyze feedback'}
            </button>
          </form>

          {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10">
        {loading ? (
          <p className="text-slate-300">Generating report...</p>
        ) : report ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Executive summary</p>
              <p className="mt-2 text-lg text-slate-100">{report.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Feedback count</p>
                <p className="mt-2 text-2xl font-semibold">{report.feedback_count}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Positive</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">{report.sentiment_breakdown?.positive || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Negative</p>
                <p className="mt-2 text-2xl font-semibold text-rose-400">{report.sentiment_breakdown?.negative || 0}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">Top themes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.top_topics?.map((topic) => (
                  <span key={topic} className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-200">{topic}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">Suggested next step</p>
              <p className="mt-2 text-slate-200">Share the report with the planning team and compare it with the current budget priorities.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/50 p-6 text-sm text-slate-300">
            Select a submission to view its AI report.
          </div>
        )}
      </div>
    </section>
  )
}

export default ReportPage
