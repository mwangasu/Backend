import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

const initialForm = {
  constituency_name: '',
  development_goal: '',
  priority_area: '',
  budget_estimate: '',
}

function SubmitPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/api/submit`, formData)
      setFormData(initialForm)
      setMessage('Planning submission created successfully.')
      navigate('/dashboard')
    } catch (error) {
      setMessage('Unable to submit the planning request right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel p-8 sm:p-10">
        <div className="pill">New proposal</div>
        <h2 className="mt-4 text-3xl font-semibold">Shape the next constituency investment</h2>
        <p className="mt-2 text-slate-300">
          Capture the problem, the priority area, and the budget estimate in one clear submission.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none transition focus:border-cyan-400/40" placeholder="Constituency name" value={formData.constituency_name} onChange={(e) => setFormData({ ...formData, constituency_name: e.target.value })} required />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none transition focus:border-cyan-400/40" placeholder="Development goal" value={formData.development_goal} onChange={(e) => setFormData({ ...formData, development_goal: e.target.value })} required />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none transition focus:border-cyan-400/40" placeholder="Priority area" value={formData.priority_area} onChange={(e) => setFormData({ ...formData, priority_area: e.target.value })} required />
          <input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 outline-none transition focus:border-cyan-400/40" placeholder="Budget estimate" value={formData.budget_estimate} onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value })} required />
          <button type="submit" disabled={loading} className="rounded-full bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
            {loading ? 'Submitting...' : 'Create submission'}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
      </div>

      <div className="space-y-4">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold">Why it matters</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">Align development projects with visible constituency needs.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">Turn raw feedback into concise summaries for leadership teams.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">Keep planning transparent with budget and priority insights.</div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold">Suggested flow</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">1. Add the proposal details.</div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">2. Review the dashboard for emerging trends.</div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">3. Generate a report with resident feedback.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubmitPage
