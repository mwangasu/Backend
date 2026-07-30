import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import SubmitPage from './pages/SubmitPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ReportPage from './pages/ReportPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'submit', element: <SubmitPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'report', element: <ReportPage /> },
    ],
  },
])

export default router
