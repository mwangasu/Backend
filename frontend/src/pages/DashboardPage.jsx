import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'

const API_URL = 'http://127.0.0.1:8000'

function DashboardPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/dashboard`)
      setSubmissions(response.data.submissions || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const summaryData = useMemo(() => submissions.map((item) => ({ name: item.constituency_name, budget: Number(item.budget_estimate || 0) })), [submissions])
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
      <div className="glass-panel p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="pill">Live dashboard</div>
            <h2 className="mt-4 text-3xl font-semibold">Track funding priorities at a glance</h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Review budget movement, priority mix, and recent submissions in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            <p className="text-slate-300">Budget tracked</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm text-slate-400">Total submissions</p>
            <p className="mt-2 text-3xl font-semibold">{submissions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm text-slate-400">Priority areas</p>
            <p className="mt-2 text-3xl font-semibold">{pieData.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm text-slate-400">Average budget</p>
            <p className="mt-2 text-3xl font-semibold">{submissions.length ? Math.round(totalBudget / submissions.length).toLocaleString() : 0}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold">Budget overview</h3>
          <div className="mt-4 h-72">
            {loading ? <p className="text-slate-300">Loading chart...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold">Priority mix</h3>
          <div className="mt-4 h-72">
            {loading ? <p className="text-slate-300">Loading chart...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} fill="#22d3ee" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={['#22d3ee', '#38bdf8', '#818cf8', '#f59e0b'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Recent submissions</h3>
            <p className="text-sm text-slate-400">Open a project to generate a report.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {submissions.length ? submissions.map((item) => (
            <button key={item.id} onClick={() => navigate('/report', { state: { submissionId: item.id } })} className="flex w-full flex-wrap items-center justify-between rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-4 text-left transition hover:border-cyan-400/40 hover:bg-slate-800">
              <div>
                <p className="font-medium">{item.constituency_name}</p>
                <p className="text-sm text-slate-400">{item.priority_area} • {item.development_goal}</p>
              </div>
              <div className="text-sm text-cyan-300">Budget: {Number(item.budget_estimate || 0).toLocaleString()}</div>
            </button>
          )) : <p className="rounded-2xl border border-dashed border-white/10 bg-slate-800/50 p-4 text-sm text-slate-300">No submissions yet. Create one from the submission page to see it appear here.</p>}
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
