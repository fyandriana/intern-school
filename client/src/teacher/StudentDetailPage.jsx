import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { viewTeacherStudent } from "../lib/api";

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        setData(await viewTeacherStudent({ studentId, token, signal: ac.signal }));
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [studentId, token]);

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
        return { bg: "#f3f4f6", fg: "#374151", bd: "#e5e7eb" }; // gray (unknown/empty)
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
        {status || "No status"}
      </span>
    );
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!data) return <div style={{ padding: 16 }}>No data.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Student: {data.name || data.email}</h2>
          <div style={{ color: "#6b7280" }}>
            <small>{data.email}</small>
          </div>
        </div>

        <Link to="/teacher/students">← Back to Students</Link>
      </div>

      <h3 style={{ marginTop: 8 }}>Courses</h3>
      {!data.courses || data.courses.length === 0 ? (
        <p>This student isn’t enrolled in your courses.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Course</th>
              <th style={th}>Status</th>
              <th style={th}>Score</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((c) => (
              <tr key={c.courseId}>
                <td style={td}>{c.title}</td>
                <td style={td}>
                  <StatusPill
                    status={(c.status ?? "enrolled")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  />
                </td>
                <td style={td}>{c.score != null ? c.score : "—"}</td>
                <td style={td}>
                  <Link className="btn" to={`/teacher/course/${c.courseId}`}>
                    Open course
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
};
const td = { padding: "8px 6px", borderBottom: "1px solid #f3f4f6" };
