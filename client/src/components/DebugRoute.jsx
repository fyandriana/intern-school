import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DebugRoute() {
  const loc = useLocation();
  const { user, isAuthed } = useAuth();
  useEffect(() => {
    console.log("[ROUTE]", loc.pathname, { user, isAuthed });
  }, [loc, user, isAuthed]);
  return null;
}
