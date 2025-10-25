import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listMyCourses } from "../lib/api";

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#f3f4f6", fg: "#111827", br: "#e5e7eb" },
    success: { bg: "#ecfdf5", fg: "#065f46", br: "#a7f3d0" },
    warn: { bg: "#fffbeb", fg: "#92400e", br: "#fde68a" },
    info: { bg: "#eff6ff", fg: "#1e40af", br: "#bfdbfe" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.br}`,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function statusTone(status) {
  if (!status) return "neutral";
  const s = String(status).toLowerCase();
  if (s.includes("completed")) return "success";
  if (s.includes("progress")) return "warn";
  if (s.includes("enroll")) return "info";
  return "neutral";
}

export default function MyCoursesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const items = await listMyCourses({ token, signal: ctrl.signal, limit: 50, offset: 0 });
        setRows(Array.isArray(items) ? items : []);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [token]);
  if (loading) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>My Courses</h2>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </div>
      </header>

      {rows.length === 0 && (
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            You haven’t enrolled in any course yet.
          </div>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Browse available courses to get started.
          </div>
        </div>
      )}

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          padding: 0,
          margin: 0,
        }}
      >
        {rows.map((r) => {
          const title = r.courseTitle ?? r.title ?? "Untitled course";
          const desc = r.courseDescription ?? "";
          const status = (r.status ?? "enrolled")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
          const tone = statusTone(status);
          const cid = r.courseId ?? r.id;
          const key = r.progressId ?? `${r.studentId ?? "me"}-${cid}`;
          const teacher = r.teacherName ?? "";

          return (
            <li
              key={key}
              style={{
                listStyle: "none",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              {/* Image / banner placeholder */}
              <div
                style={{
                  background: "linear-gradient(135deg,#e9efff,#f8f4ff)",
                  height: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column", // stack items vertically
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <h3
                    title={title}
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: 16,
                      paddingLeft: 20,
                      paddingRight: 20,
                    }}
                  >
                    {title} by {teacher}
                  </h3>
                  <div>
                    <Pill tone={tone}>{status}</Pill>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 12, display: "grid", gap: 8, flex: 1 }}>
                <p
                  title={desc}
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: 14,
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: 63, // keeps card heights even for 3 lines
                  }}
                >
                  {desc || "No description provided."}
                </p>

                {/* Footer CTA */}
                <div style={{ margin: "auto", display: "flex", gap: 8 }}>
                  <Link to={`/student/courses/${cid}`} className="btn">
                    View Course
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Responsive grid rules */}
      <style>{`
        @media (max-width: 1200px) {
          ul[style*='grid-template-columns'] { grid-template-columns: repeat(3, minmax(0,1fr)) !important; }
        }
        @media (max-width: 900px) {
          ul[style*='grid-template-columns'] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 640px) {
          ul[style*='grid-template-columns'] { grid-template-columns: 1fr !important; }
        }
        body { background: #f9fafb; }
      `}</style>
    </div>
  );
}
