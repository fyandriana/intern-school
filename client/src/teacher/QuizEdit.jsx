import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getQuiz, updateQuiz } from "../lib/api.js";
import QuizForm from "../components/QuizForm.jsx";

export default function QuizEditPage() {
  const { courseId: courseIdFromRoute, quizId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getQuiz(quizId, token);
        const entity = data?.item ?? data;
        if (alive) setQuiz(entity);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load quiz");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [quizId, token]);

  async function handleSubmit(values) {
    setSaving(true);
    setError("");
    try {
      await updateQuiz(
        quizId,
        {
          // prefer DB/course value; fall back to route param
          courseId: Number(values.courseId ?? quiz?.courseId ?? courseIdFromRoute),
          question: values.question,
          options: values.options, // API helper stringifies
          correctAnswer: values.correctAnswer,
        },
        token
      );

      const backCourseId = quiz?.courseId ?? courseIdFromRoute;
      navigate(`/teacher/course/${backCourseId}`, { replace: true });
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
  if (error && !quiz)
    return (
      <p className="form-error" style={{ padding: 16 }}>
        {error}
      </p>
    );
  if (!quiz) return <p style={{ padding: 16 }}>Not found</p>;

  const backCourseId = quiz.courseId ?? courseIdFromRoute;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <h1 style={{ margin: "8px 0 16px" }}>Edit Quiz</h1>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Link to={`/teacher/course/${backCourseId}`}>&larr; Back to Course</Link>
      </div>

      <QuizForm
        key={quiz.id}
        mode="edit"
        courseId={backCourseId}
        initial={{
          question: quiz.question,
          options: quiz.options, // map/array/JSON: QuizForm can handle
          correctAnswer: quiz.correctAnswer,
        }}
        submitting={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
