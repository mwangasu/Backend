import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

function HomePage() {
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard`)
        setSubmissions(response.data.submissions || [])
      } catch (error) {
        console.error(error)
      }
    }

    fetchDashboard()
  }, [])

  const pieData = useMemo(() => {
    const counts = submissions.reduce((acc, submission) => {
      acc[submission.priority_area] = (acc[submission.priority_area] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [submissions])

  const totalBudget = submissions.reduce((sum, item) => sum + Number(item.budget_estimate || 0), 0)

  return (
    <section className="space-y-6">
      <div className="glass-panel overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="pill">AI for constituency planning</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Turn public feedback into actionable development plans.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Collect ideas, track priorities, and generate polished reports that make planning conversations easier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/submit" className="rounded-full bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
                Submit a proposal
              </Link>
              <Link to="/dashboard" className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10">
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-400/20 bg-slate-950/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live snapshot</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Active submissions</p>
                <p className="mt-2 text-3xl font-semibold">{submissions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Tracked budget</p>
                <p className="mt-2 text-3xl font-semibold">{totalBudget.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">Priority areas</p>
                <p className="mt-2 text-3xl font-semibold">{pieData.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <p className="text-sm text-slate-400">What this experience covers</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Capture constituency goals with a clear, guided form.</li>
            <li>• Review trend signals across projects and budgets.</li>
            <li>• Generate a concise report that leadership can act on.</li>
          </ul>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm text-slate-400">Focus areas</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pieData.length ? pieData.map((item) => (
              <span key={item.name} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                {item.name}
              </span>
            )) : <span className="text-sm text-slate-300">No priorities yet — add a project to see them here.</span>}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm text-slate-400">Suggested next action</p>
          <p className="mt-3 text-lg font-medium text-slate-100">Create your first submission and open the dashboard to see the planning story take shape.</p>
          <Link to="/submit" className="mt-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20">
            Start here
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HomePage
