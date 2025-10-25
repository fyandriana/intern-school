import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listCourseQuizzes, submitCourseQuiz, getCourseById } from "../lib/api";

export default function TakeQuizPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const id = courseId;
      const data = await listCourseQuizzes({ id, token, signal: ac.signal });
      const items = data.items ?? data;
      const c = await getCourseById(id, token);
      setCourse(c);
      const normalized = items.map((q) => {
        let opts = [];
        try {
          const parsed = JSON.parse(q.options);
          opts = Object.values(parsed).map((o) => o.value);
        } catch {
          opts = [];
        }
        return { ...q, options: opts };
      });
      setQuestions(normalized);
    })();
    return () => ac.abort();
  }, [courseId, token]);

  const handleSelect = (qid, idx) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    function isEmptyObject(obj) {
      if (obj === null || typeof obj === "undefined") {
        return false;
      }
      return Object.keys(obj).length === 0;
    }

    if (isEmptyObject(answers)) {
      alert("Empty Answers");
      return;
    }

    const payload = Object.entries(answers).map(([qid, answerIndex]) => ({
      questionId: Number(qid),
      answerIndex: answerIndex + 1,
    }));

    const res = await submitCourseQuiz({ courseId, token, body: { answers: payload } });
    setResult(res);
  };

  if (!questions.length) return <p>Loading questions...</p>;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "24px 32px",
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        textAlign: "left",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          color: "#111827",
        }}
      >
        📝 Course Quiz
      </h2>
      <p>
        <strong>{course.title}</strong>
      </p>
      {!result ? (
        <form onSubmit={handleSubmit}>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {questions.map((q, qi) => (
              <li
                key={q.id}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "20px 24px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#4F46E5",
                      fontSize: 16,
                      marginRight: 4,
                      minWidth: 24,
                    }}
                  >
                    {" "}
                    {qi + 1}.{" "}
                  </span>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      margin: 0,
                      flex: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {q.question}
                  </p>
                </div>

                <div style={{ marginTop: 6 }}>
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "start",
                        gap: 8,
                        marginBottom: 6,
                        cursor: "pointer",
                        fontSize: 15,
                        lineHeight: 1.3,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: answers[q.id] === i ? "#EEF2FF" : "transparent",
                        border: answers[q.id] === i ? "1px solid #6366F1" : "1px solid transparent",
                        transition: "background 0.2s, border 0.2s",
                      }}
                    >
                      <div>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          onChange={() => handleSelect(q.id, i)}
                          checked={answers[q.id] === i}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>{opt}</div>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "#4F46E5",
                color: "white",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Submit Quiz
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Your Result</h3>
          <p style={{ fontSize: 18, color: "#111827" }}>
            <strong>Score:</strong> {result.score}% ({result.correct}/{result.total} correct)
          </p>
          <p style={{ color: "#6b7280" }}>Attempt #{result.attempt.attempt}</p>
          <Link to={`/student/courses/${courseId}`}>Back to Course</Link>
        </div>
      )}
    </div>
  );
}
