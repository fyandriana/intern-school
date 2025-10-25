import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getQuizDetails } from "../lib/api.js";

export default function QuizDetailsInline({ quizId, initiallyOpen = false, showCorrect = true }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(initiallyOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (!open || quiz || !token) return;
    let ignore = false;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getQuizDetails({ quizId, token, signal: ac.signal });
        if (!ignore) setQuiz(data);
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load quiz details");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [open, quizId, quiz, token]);

  return (
    <div style={{ flex: 1, textAlign: "right" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`quiz-${quizId}-panel`}
      >
        {open ? "Hide details" : "View details"}
      </button>

      {open && (
        <div id={`quiz-${quizId}-panel`} style={styles.panel}>
          {loading && <div>Loading…</div>}
          {error && <div style={{ color: "crimson" }}>{error}</div>}

          {!loading && !error && quiz && (
            <OptionsList
              options={quiz.options || []}
              showCorrect={showCorrect}
              correctAnswer={quiz.correctAnswer}
            />
          )}
          {!loading && !error && quiz && (!quiz.options || quiz.options.length === 0) && (
            <div>No questions.</div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionsList({ options, correctAnswer }) {
  // `options` here is actually the array of questions
  options = toOptionArray(options);
  return (
    <ol style={styles.qList}>
      {options.map((q, idx) => {
        const isCorrect = Number(correctAnswer) === Number(q.id);
        return (
          <li key={q.id ?? idx} style={isCorrect ? styles.correct : {}}>
            <div style={styles.qText}>
              <span>{q.value}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* Helpers */
function toOptionArray(mapOrString) {
  // Accept JSON string, object map, or fallback to empty
  let obj = {};
  if (typeof mapOrString === "string") {
    try {
      obj = JSON.parse(mapOrString) || {};
    } catch {
      obj = {};
    }
  } else if (mapOrString && typeof mapOrString === "object" && !Array.isArray(mapOrString)) {
    obj = mapOrString;
  }
  const arr = Object.values(obj).map((o) => ({ id: Number(o?.id), value: String(o?.value ?? "") }));
  // Sort by id ascending
  return arr.filter((o) => Number.isFinite(o.id)).sort((a, b) => a.id - b.id);
}

const styles = {
  correct: { color: "green" },
  panel: {
    marginTop: 10,
    padding: 12,
    background: "#F9FAFB",
    borderRadius: 10,
    border: "1px dashed #E5E7EB",
  },
  qList: { margin: 0, paddingLeft: 18 },
  qItem: { marginBottom: 12 },
  qText: { fontWeight: 600, marginBottom: 6, display: "flex", gap: 8, alignItems: "center" },
  qBadge: { fontSize: 12, background: "#E5E7EB", borderRadius: 6, padding: "2px 6px" },
  optList: { margin: "6px 0 0", paddingLeft: 18 },
  optItem: { marginBottom: 4 },
  optBullet: { marginRight: 6 },
  correctTag: { marginLeft: 6 },
  explain: { marginTop: 6, fontSize: 13, color: "#374151" },
};
