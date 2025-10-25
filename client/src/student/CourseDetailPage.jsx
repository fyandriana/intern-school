import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listQuizzesForCourse, getEnrollment, enrollInCourse, getCourseById } from "../lib/api";
import StartCourseButton from "../components/StartCourseButton.jsx";

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#f3f4f6", fg: "#111827", br: "#e5e7eb" },
    success: { bg: "#ecfdf5", fg: "#065f46", br: "#a7f3d0" },
    warn: { bg: "#fffbeb", fg: "#92400e", br: "#fde68a" },
    grey: { bg: "#f3f4f6", fg: "#888888", br: "#ddd" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.br}`,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

// ---- helpers ----
function parseJSONArray(value) {
  try {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const t = value.trim();
      if (!t) return [];
      const arr = JSON.parse(t);
      return Array.isArray(arr) ? arr : [];
    }
    return [];
  } catch {
    return [];
  }
}

const fmtDate = (s) => {
  if (!s) return "—";
  try {
    return new Date(String(s).replace(" ", "T")).toLocaleString();
  } catch {
    return String(s);
  }
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  const [enrolling, setEnrolling] = useState(false);
  const [quizAvailable, setQuizAvailable] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [showAttempt, setShowAttempt] = useState(false);

  useEffect(() => {
    if (!courseId || !token) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const data = await getCourseById(Number(courseId), token);
        setCourse(data);

        // Load enrollment/progress
        try {
          const enr = await getEnrollment({
            courseId: Number(courseId),
            token,
            signal: ac.signal,
          });
          setProgress(enr);
          const attempts = parseJSONArray(enr?.quizAttempts);
          setAttempt(attempts?.[0] || null);
        } catch (e) {
          setProgress(null);
          setAttempt(null);
        }

        // Load quizzes
        try {
          const q = await listQuizzesForCourse({
            courseId,
            token,
            signal: ac.signal,
          });
          const items = Array.isArray(q) ? q : Array.isArray(q?.items) ? q.items : [];
          setQuizAvailable(items.length > 0);
        } catch {
          setQuizAvailable(false);
        }

        setErr(null);
      } catch (e) {
        setErr(e.message || "Failed to load course");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [courseId, token]);

  async function enroll() {
    setEnrolling(true);
    try {
      await enrollInCourse({ courseId: Number(courseId), token });
      setProgress({ status: "enrolled" });
    } catch (e) {
      alert(e?.message || "Enroll failed");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <div>Loading…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!course) return <div>Course not found</div>;

  const status = progress?.status || "not_enrolled";
  const hasAttempt = !!attempt;

  const tone =
    progress?.status === "completed"
      ? "success"
      : progress?.status === "in_progress"
        ? "warn"
        : progress?.status === "enrolled"
          ? "neutral"
          : "grey";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/student/my-courses" style={{ textDecoration: "none", fontSize: 14 }}>
          ← Back to Courses
        </Link>
      </div>

      <div style={{ paddingTop: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 320px",
            gap: 20,
          }}
        >
          {/* MAIN */}
          <main
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              minHeight: 300,
            }}
          >
            <h1 style={{ margin: "0 0 4px", fontSize: 28 }}>
              {course.title || `Course #${courseId}`}
            </h1>
            <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 12 }}>
              by {course.teacherName}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6 }}>
              {course.description || "No description provided."}
            </p>
          </main>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Status */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <h2 style={{ margin: 0, fontSize: 16 }}>Status</h2>
                <Pill tone={tone}>
                  {progress?.status === "completed"
                    ? "Completed"
                    : progress?.status === "in_progress"
                      ? "In progress"
                      : progress?.status === "enrolled"
                        ? "Enrolled"
                        : "Not enrolled"}
                </Pill>
              </div>
              <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
                {status === "completed"
                  ? "You finished this course."
                  : status === "in_progress"
                    ? "You are currently working through this course."
                    : status === "enrolled"
                      ? "You are enrolled in this course."
                      : "You are not enrolled in this course."}
              </p>
            </div>

            {/* Start button only if enrolled */}
            {progress?.status === "enrolled" && (
              <StartCourseButton courseId={courseId} onStarted={(p) => setProgress(p)} />
            )}

            {/* Quizzes only when in progress */}
            {/* Quizzes only when IN PROGRESS */}
            {progress?.status === "in_progress" && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: 16 }}>Quizzes</h2>
                <p style={{ marginTop: 6, color: "#6b7280", fontSize: 14 }}>
                  Test your knowledge for this course.
                </p>

                {quizAvailable ? (
                  hasAttempt ? (
                    <button
                      type="button"
                      disabled
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #c7c9f7",
                        background: "#E5E7EB",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "not-allowed",
                      }}
                    >
                      Attempt submitted
                    </button>
                  ) : (
                    <Link
                      to={`/student/courses/${courseId}/quiz`}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        textAlign: "center",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #10B981",
                        background: "#059669",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      📝 Take Quizzes
                    </Link>
                  )
                ) : (
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #c7c9f7",
                      background: "#E5E7EB",
                      color: "#6b7280",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "not-allowed",
                    }}
                  >
                    No quiz available
                  </button>
                )}
              </div>
            )}

            {/* Attempt summary when IN PROGRESS or COMPLETED */}
            {(progress?.status === "in_progress" || progress?.status === "completed") &&
              hasAttempt && (
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: 16 }}>Your Attempt</h2>
                    <button
                      type="button"
                      onClick={() => setShowAttempt((s) => !s)}
                      style={{
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        borderRadius: 8,
                        padding: "4px 8px",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {showAttempt ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showAttempt && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "#374151",
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Score</span>
                        <strong>{progress?.score != null ? progress.score : "—"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Submitted</span>
                        <span>{fmtDate(attempt.submitted_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Enroll button if not enrolled */}
            {!progress?.status && (
              <button
                onClick={enroll}
                disabled={enrolling}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: enrolling ? "not-allowed" : "pointer",
                }}
              >
                {enrolling ? "Enrolling…" : "Enroll to access this course"}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
