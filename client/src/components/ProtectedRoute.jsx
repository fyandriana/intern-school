import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, token, ready } = useAuth();
  const location = useLocation();
  // avoid redirecting during initial hydration
  if (!ready) return null; // or a small spinner

  if (!user && !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
