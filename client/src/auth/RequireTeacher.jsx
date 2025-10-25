import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function RequireTeacher({ children }) {
  const { user, ready } = useContext(AuthContext);
  const loc = useLocation();

  if (!ready) return <div style={{ padding: 16 }}>Loading…</div>;

  if (!user) {
    // not logged in → send to login
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  if (user.role !== "Teacher") {
    // logged in but not a teacher → home (or 403 page)
    return <Navigate to="/" replace />;
  }

  return children;
}
