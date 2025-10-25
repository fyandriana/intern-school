import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listAllCourses, enrollInCourse } from "../lib/api";

export default function StudentCoursesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const items = await listAllCourses({ token, signal: ctrl.signal });
        setRows(items);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [token]);

  async function onEnroll(courseId) {
    setEnrolling(courseId);
    try {
      await enrollInCourse({ courseId, token });
    } catch (e) {
      alert(e?.message || "Enroll failed");
    } finally {
      setEnrolling(null);
    }
  }

  if (loading) return <div>Loading courses…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ marginRight: "auto" }}>Courses</h2>
      </header>
      <ul style={{ display: "grid", gap: 12, padding: 0 }}>
        {rows.map((c) => (
          <li
            key={c.id}
            style={{ listStyle: "none", border: "1px solid #eee", borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                textAlign: "left",
                alignItems: "baseline",
              }}
            >
              <h3 style={{ margin: 0, flex: 1 }}>{c.title}</h3>
              <Link className="btn" to={`/student/courses/${c.id}`}>
                View
              </Link>

              <button
                type="button"
                onClick={() => onEnroll(c.id)}
                disabled={enrolling === c.id || c.enrolled}
              >
                {enrolling === c.id ? "Enrolling…" : c.enrolled ? "Enrolled" : "Enroll"}
              </button>
            </div>
            {c.description && (
              <p
                style={{
                  marginTop: 6,
                  opacity: 0.8,
                  textAlign: "left",
                  marginLeft: 8,
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxHeight: 63,
                }}
              >
                {c.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
