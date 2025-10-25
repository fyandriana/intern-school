import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { startCourse } from "../lib/api";

export default function StartCourseButton({ courseId, onStarted }) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      const progress = await startCourse({ id: courseId, token });
      onStarted?.(progress);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={busy} className="btn">
        {busy ? "Starting…" : "Start Course"}
      </button>
      {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
