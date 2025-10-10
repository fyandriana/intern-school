// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, token, ready } = useAuth();

    // avoid redirecting during initial hydration
    if (!ready) return null; // or a small spinner

    if (!user && !token) {
        const location = useLocation();
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}
