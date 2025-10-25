import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";

export function RequireAuth() {
  const { isAuthed } = useAuth();
  const loc = useLocation();
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc }} />;
}

export function RequireRole({ role }) {
  const { user } = useAuth();
  return user && user.role === role ? <Outlet /> : <Navigate to="/forbidden" replace />;
}

export function NotFound() {
  return <div style={{ padding: 24 }}>404 — Not Found</div>;
}

// super simple gate: if logged in → /me, else show HomePage
export function IndexGate() {
  const { user } = useAuth();
  return user ? <Navigate to="/me" replace /> : <HomePage />;
}
