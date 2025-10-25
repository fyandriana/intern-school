import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useMemo, useState } from "react";
import { deleteCourse, getCoursesCount, listCourses } from "../lib/api.js";

export default function TeacherCoursesPage({ mine = false }) {
  const { user, token } = useAuth();

  const [busyId, setBusyId] = useState(null);
  const [deletedId, setDeletedId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(undefined);

  const [sp, setSp] = useSearchParams();
  const limit = 10;
  const offset = Number(sp.get("offset") || 0);

  const isTeacher = user?.role === "Teacher";
  const isStudent = user?.role === "Student";

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await listCourses({ mine, token, signal: ac.signal, limit, offset });

        // Expecting { items, total }.defensive if server omits total.
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

        const apiTotal = await getCoursesCount({
          token,
          signal: ac.signal,
          teacherId: user.id,
          mine,
        });

        setRows(items);
        setTotal(apiTotal.total);
      } catch (e) {
        setError(e.message || "Error loading courses");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token, mine, limit, offset]);
  const handleDelete = async (courseId) => {
    const course = rows.find((c) => c.id === courseId);
    setBusyId(courseId);
    if (!course) return setBusyId(null);

    if (!(isTeacher && course.teacherId === user?.id)) {
      alert("You’re not allowed to delete this course.");
      return setBusyId(null);
    }

    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      return setBusyId(null);
    }

    try {
      const data = await deleteCourse(course.id, token);
      if (data.deleted) setDeletedId(courseId);
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const CourseActions = ({ course }) => {
    const canManage = useMemo(
      () => isTeacher && course?.teacherId === user?.id,
      [isTeacher, course?.teacherId, user?.id]
    );
    if (!canManage) return null;
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Link to={`/teacher/course/${course.id}/quiz/new`} className="btn">
          Create Quiz
        </Link>
        <Link to={`/teacher/course/${course.id}/edit`} className="btn">
          Edit
        </Link>
        <button disabled={busyId === course.id} onClick={() => handleDelete(course.id)}>
          {busyId === course.id ? "Deleting…" : "Delete"}
        </button>
      </div>
    );
  };

  // Pagination helpers
  const nextOffset = offset + limit;
  const prevOffset = Math.max(0, offset - limit);
  const showingFrom = rows.length ? offset + 1 : 0;
  const showingTo = offset + rows.length;

  // If total is known, use it; otherwise fallback: Next enabled iff we filled the page
  const hasPrev = offset > 0;
  const hasNext = typeof total === "number" ? nextOffset < total : rows.length === limit;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ marginRight: "auto" }}>Courses</h2>
        {isTeacher && (
          <Link to="/teacher/course/new">
            <button>Create Course</button>
          </Link>
        )}
      </header>

      {loading ? (
        <div style={{ padding: 16 }}>Loading courses…</div>
      ) : error ? (
        <div style={{ padding: 16, color: "crimson" }}>{error}</div>
      ) : rows.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
            {rows.map((c) => (
              <li
                key={c.id}
                style={{
                  display: deletedId === c.id ? "none" : "block",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{ display: "flex", gap: 12, textAlign: "left", alignItems: "baseline" }}
                >
                  <h3 style={{ margin: 0, flex: 1 }}>{c.title}</h3>
                  <Link to={`/teacher/course/${c.id}`}>
                    <button>View</button>
                  </Link>
                  {isStudent && (
                    <Link to={`/progress/${c.id}/edit`}>
                      <button>Enroll</button>
                    </Link>
                  )}
                  <CourseActions course={c} />
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
                      display: "-webkit-box",
                    }}
                  >
                    {c.description}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {rows.length === 0 ? "Showing 0–0" : `Showing ${showingFrom}–${showingTo}`}
              {typeof total === "number" ? ` of ${total}` : ""}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={!hasPrev}
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
                disabled={!hasNext}
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
        </>
      )}
    </div>
  );
}
