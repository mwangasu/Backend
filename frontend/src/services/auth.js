// Mirrors the backend's UserProfile.ROLE_RANK ordering.
export const ROLE_RANK = { guest: 0, staff: 1, admin: 2, official: 3 };

export function getRole() {
  return localStorage.getItem("role") || "guest";
}

export function getUsername() {
  return localStorage.getItem("username") || "";
}

export function hasMinRole(role) {
  return (ROLE_RANK[getRole()] ?? 0) >= ROLE_RANK[role];
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("access"));
}

export function setSession({ access, refresh, role, username }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
  if (role) localStorage.setItem("role", role);
  if (username) localStorage.setItem("username", username);
}

export function clearSession() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
}

// Where a role should land right after login.
export function landingPathForRole(role) {
  return role === "guest" ? "/submit" : "/dashboard";
}
