import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { viewCourse, deleteCourse, listCourseQuizzes, deleteQuiz } from "../lib/api.js";
import QuizDetailsInline from "../components/QuizInline.jsx";

export default function CourseDetail() {
  const { user, token, ready } = useAuth();
  const { id } = useParams(); // make sure route uses :id
  const [err, setErr] = useState(null);
  const nav = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const [course, setCourse] = useState(null);
  const [owner, setOwner] = useState(null);
  const [qState, setQState] = useState({ items: [], total: 0, limit: 10, offset: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !id || !token) return; // wait until token exists
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await viewCourse({ id, token, signal: ac.signal });
        setCourse(data);
        setOwner(user?.role === "Teacher" && user.id === data.teacherId);

        const q = await listCourseQuizzes({ id, token, signal: ac.signal });
        setQState(q);

        setErr(null);
      } catch (e) {
        setErr(e.message || "Failed to load course");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id, token, ready]);

  const isTeacher = user?.role === "Teacher";
  const canManage = useMemo(
    () => isTeacher && course?.teacherId === user?.id,
    [isTeacher, course?.teacherId, user?.id]
  );

  async function handleDelete() {
    if (!course?.id) return;
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(course.id, token);
      nav(`/teacher/my-courses`); // go to list
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  async function handleQuizDelete(quizId) {
    if (!confirm("Delete this quiz?")) return;

    const prev = qState;
    const nextItems = prev.items.filter((q) => q.id !== quizId);
    setDeletingId(quizId);
    setQState((s) => ({ ...s, items: nextItems, total: Math.max(0, s.total - 1) }));
    try {
      await deleteQuiz(quizId, token);
    } catch (err) {
      alert(err.message || "Delete failed");
      setQState(prev); // restore previous state
    } finally {
      setDeletingId(null);
    }
  }

  if (!ready) return null;
  if (loading) return <div style={{ padding: 16 }}>{id} Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!course) return <div style={{ padding: 16 }}>Course not found</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <h1>{course.title}</h1>
      <div style={styles.wrap}>
        <section style={styles.card}>
          <div>
            {/* Student actions… */}
            <div className="actions-button">
              <Link to="/teacher/my-courses">
                <button>Back</button>
              </Link>
              {canManage && (
                <>
                  <Link to={`/teacher/course/${course.id}/quiz/new`} className="btn">
                    Create Quiz
                  </Link>
                  <Link to={`/teacher/course/${course.id}/edit`} className="btn">
                    Edit
                  </Link>
                  <button onClick={handleDelete}>Delete</button>
                </>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <p>
                <b>{course.title}</b> by <i>{course.teacherName}</i>
              </p>
              <p>{course.description}</p>
            </div>
          </div>
        </section>
      </div>
      <div style={styles.wrap}>
        <section style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Quizzes ({qState.total}) </h3>

          {qState.items.length === 0 ? (
            <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
              No quizzes yet for this course.
            </div>
          ) : (
            <QuizList
              items={qState.items}
              courseId={course.id}
              isOwner={owner}
              onDelete={handleQuizDelete}
              deletingId={deletingId}
            />
          )}

          {qState.total > qState.items.length && (
            <button
              style={{ marginTop: 12 }}
              onClick={async () => {
                const next = await listCourseQuizzes({
                  id,
                  token,
                  limit: qState.limit,
                  offset: qState.offset + qState.limit,
                });
                setQState((s) => ({
                  ...next,
                  items: [...s.items, ...next.items],
                }));
              }}
            >
              Load more
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

function QuizList({ items, courseId, isOwner, onDelete, deletingId }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((q) => (
        <li
          key={q.id}
          style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ alignSelf: "flex-start" }}>{q.question}</div>

            <div style={{ display: "flex", gap: 8, flex: "0 0 50%", alignItems: "flex-start" }}>
              <QuizDetailsInline quizId={q.id} showCorrect={true} />

              {isOwner && (
                <div>
                  <Link className="btn" to={`/teacher/course/${courseId}/quiz/${q.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(q.id)}
                    disabled={deletingId === q.id}
                    aria-busy={deletingId === q.id}
                    title={deletingId === q.id ? "Deleting…" : "Delete quiz"}
                  >
                    {deletingId === q.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const styles = {
  wrap: { width: "80%", margin: "40px auto", padding: "0 16px" },
  card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" },
};
