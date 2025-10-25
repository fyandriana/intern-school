import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listTeacherStudents } from "../lib/api";

export default function StudentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sp, setSp] = useSearchParams();
  const limit = 2;
  const offset = Number(sp.get("offset") || 0);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const data = await listTeacherStudents({ token, signal: ac.signal, limit, offset });
        setRows(data.items);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token, limit, offset]);

  const nextOffset = offset + limit;
  const prevOffset = Math.max(0, offset - limit);

  function statusStyle(status) {
    switch ((status || "").toLowerCase()) {
      case "enrolled":
        return { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" }; // blue
      case "in_progress":
      case "in progress":
        return { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" }; // amber
      case "completed":
        return { bg: "#ecfdf5", fg: "#047857", bd: "#a7f3d0" }; // green
      default:
        return { bg: "#f3f4f6", fg: "#374151", bd: "#e5e7eb" }; // gray
    }
  }

  function StatusPill({ status }) {
    const { bg, fg, bd } = statusStyle(status);
    return (
      <span
        style={{
          display: "inline-block",
          fontSize: 12,
          padding: "2px 8px",
          borderRadius: 999,
          background: bg,
          color: fg,
          border: `1px solid ${bd}`,
          lineHeight: 1.6,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
        aria-label={`Status: ${status || "No status"}`}
        title={status || "No status"}
      >
        {(status ?? "enrolled").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
          "No status"}
      </span>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <h2 style={{ marginTop: 0 }}>Students</h2>

      {loading ? (
        <div>Loading…</div>
      ) : rows.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {rows.map((s) => (
            <li
              key={s.studentId}
              style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.name || "(No name)"}</div>
                  <small style={{ color: "#6b7280" }}>{s.email}</small>
                </div>
                <Link to={`/teacher/students/${s.studentId}`}>View details</Link>
              </div>

              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                {(s.courses || []).map((c) => (
                  <div
                    key={`${s.studentId}-${c.courseId}`}
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span style={{ fontSize: 14 }}>{c.title}</span>
                    <StatusPill status={c.status} />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {" "}
                      {c.score != null ? `Score: ${c.score}` : "Score: —"}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + rows.length)} of {total}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => {
              const params = new URLSearchParams(sp);
              params.set("offset", String(prevOffset));
              setSp(params, { replace: true });
            }}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={nextOffset >= total}
            onClick={() => {
              const params = new URLSearchParams(sp);
              params.set("offset", String(nextOffset));
              setSp(params, { replace: true });
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
