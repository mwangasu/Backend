import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import SubmitFeedback from "./pages/SubmitFeedback";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CaseDetail from "./pages/CaseDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Any logged-in role (Guest and up) can submit a report */}
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <SubmitFeedback />
            </ProtectedRoute>
          }
        />

        {/* Staff and above only */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute minRole="staff">
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/cases/:id"
          element={
            <RoleRoute minRole="staff">
              <CaseDetail />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
