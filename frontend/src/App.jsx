import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/submit', label: 'Submit' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', label: 'Report' },
]

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="pill inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Constituency AI
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Development Planning Studio</h1>
            <p className="text-sm text-slate-400">Turn neighborhood signals into clear budgets and action plans.</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm transition ${isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-200 hover:bg-slate-700'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
