import { Navigate } from "react-router-dom";
import { hasMinRole, isLoggedIn } from "../services/auth";

function RoleRoute({ minRole = "staff", children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinRole(minRole)) {
    return <Navigate to="/submit" replace />;
  }

  return children;
}

export default RoleRoute;
