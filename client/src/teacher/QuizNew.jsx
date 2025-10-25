import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createQuiz } from "../lib/api.js";
import QuizForm from "../components/QuizForm.jsx";

export default function QuizNewPage() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    setSaving(true);
    setError("");
    try {
      // values.options is a map like {"1":{id:1,value:"A"}, ...}
      // API helper should stringify to JSON text
      await createQuiz(
        {
          courseId: Number(values.courseId ?? courseId),
          question: values.question,
          options: values.options,
          correctAnswer: values.correctAnswer,
        },
        token
      );

      navigate(`/teacher/course/${courseId}`, { replace: true });
    } catch (e) {
      setError(e.message || "Create quiz failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Link to={`/teacher/course/${courseId}`}>&larr; Back to Course</Link>
      </div>

      <h1 style={{ margin: "8px 0 16px" }}>New Quiz</h1>

      <QuizForm
        mode="create"
        courseId={courseId}
        initial={{
          question: "",
          options: ["", ""], // two blanks by default
          correctAnswer: undefined,
        }}
        submitting={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
