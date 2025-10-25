import { useEffect, useMemo, useState } from "react";

/* ---------- helpers ---------- */
function toOptionsMap(optionsLike) {
  // Accept: map {"1":{id:1,value:"A"}}, array ["A","B"], or JSON string '["A","B"]'
  if (typeof optionsLike === "string") {
    try {
      optionsLike = JSON.parse(optionsLike);
    } catch {
      optionsLike = [];
    }
  }
  if (optionsLike && typeof optionsLike === "object" && !Array.isArray(optionsLike)) {
    const out = {};
    for (const [k, v] of Object.entries(optionsLike)) {
      const id = Number(v?.id ?? k);
      out[String(id)] = { id, value: typeof v === "string" ? v : (v?.value ?? "") };
    }
    return ensureTwo(out);
  }
  const arr = Array.isArray(optionsLike) ? optionsLike : [];
  const out = {};
  arr.forEach((o, i) => {
    const id = i + 1;
    out[String(id)] = { id, value: typeof o === "string" ? o : (o?.value ?? "") };
  });
  return ensureTwo(out);
}

function ensureTwo(map) {
  const out = { ...map };
  if (Object.keys(out).length < 1) out["1"] = { id: 1, value: "" };
  if (Object.keys(out).length < 2) out["2"] = { id: 2, value: "" };
  return out;
}

function compactIds(optionsMap, currentCorrectId) {
  const entries = Object.values(optionsMap).sort((a, b) => a.id - b.id);
  const remap = new Map();
  const compacted = {};
  let i = 1;
  for (const opt of entries) {
    remap.set(opt.id, i);
    compacted[String(i)] = { id: i, value: opt.value };
    i++;
  }
  const newCorrectId = remap.has(currentCorrectId) ? remap.get(currentCorrectId) : NaN;
  return { compacted, newCorrectId };
}

function resolveCorrectId(initialCorrect, optionsMap) {
  const n = Number(initialCorrect);
  if (Number.isInteger(n) && optionsMap[String(n)]) return n;
  const val = typeof initialCorrect === "string" ? initialCorrect.trim() : "";
  if (!val) return NaN;
  const match = Object.values(optionsMap).find((o) => o.value === val);
  return match ? match.id : NaN;
}

/* ---------- component ---------- */
export default function QuizForm({
  mode = "create", // "create" | "edit" (affects labels only)
  courseId,
  initial = { question: "", options: undefined, correctAnswer: undefined },
  onSubmit, // async (payload) => void
  submitting = false,
  error = "",
  reindexOnDelete = true,
}) {
  // state
  const [question, setQuestion] = useState(initial.question || "");
  const [options, setOptions] = useState(() => toOptionsMap(initial.options));
  const [correctId, setCorrectId] = useState(
    initial.correctAnswer != null ? Number(initial.correctAnswer) : NaN
  );

  // sync when initial changes (edit mode loads async)
  useEffect(() => {
    const nextOptions = toOptionsMap(initial.options);
    setQuestion(initial.question || "");
    setOptions(nextOptions);
    setCorrectId(resolveCorrectId(initial.correctAnswer, nextOptions));
  }, [initial]);

  // derived
  const optionList = useMemo(() => Object.values(options).sort((a, b) => a.id - b.id), [options]);
  const nextId = useMemo(() => {
    const ids = optionList.map((o) => o.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }, [optionList]);

  // actions
  function addOption() {
    setOptions((prev) => ({ ...prev, [String(nextId)]: { id: nextId, value: "" } }));
  }

  function removeOption(id) {
    setOptions((prev) => {
      const copy = { ...prev };
      delete copy[String(id)];
      if (!reindexOnDelete) {
        if (correctId === id) setCorrectId(NaN);
        return ensureTwo(copy);
      }
      const { compacted, newCorrectId } = compactIds(copy, correctId);
      setCorrectId(newCorrectId);
      return ensureTwo(compacted);
    });
  }

  function updateValue(id, value) {
    setOptions((prev) => ({ ...prev, [String(id)]: { id, value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let workingMap = options;
    let workingCorrectId = correctId;

    if (reindexOnDelete) {
      const { compacted, newCorrectId } = compactIds(workingMap, workingCorrectId);
      workingMap = compacted;
      workingCorrectId = newCorrectId;
    }

    const list = Object.values(workingMap)
      .sort((a, b) => a.id - b.id)
      .map((o) => ({ ...o, value: (o.value ?? "").trim() }));

    // client-side validations
    if (!question.trim()) return alert("Question is required.");
    if (list.length < 2) return alert("At least two options are required.");
    if (list.some((o) => !o.value)) return alert("Every option needs a non-empty value.");
    if (!Number.isInteger(workingCorrectId)) return alert("Select the correct answer.");
    if (!list.some((o) => o.id === workingCorrectId)) {
      return alert("Correct answer must match an existing option.");
    }

    const optionsMap = {};
    list.forEach((o) => (optionsMap[String(o.id)] = { id: o.id, value: o.value }));

    await onSubmit?.({
      courseId: Number(courseId),
      question: question.trim(),
      options: optionsMap, // {"1":{id:1,value:"A"}, ...}
      correctAnswer: Number(workingCorrectId), // id (INTEGER)
    });
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label style={styles.label}>
        Question
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          style={styles.textarea}
          placeholder="Type the quiz question…"
        />
      </label>
      <div style={styles.table}>
        <div style={styles.rowHead}>
          <div style={styles.cellId}></div>
          <div style={styles.cellVal}>Value</div>
          <div style={styles.cellCorrect}>Correct</div>
          <div style={styles.cellAct}></div>
        </div>

        {optionList.map((o) => (
          <div key={o.id} style={styles.row}>
            <div style={styles.cellId}>
              <code>{o.id}</code>
            </div>
            <div style={styles.cellVal}>
              <input
                type="text"
                value={o.value}
                onChange={(e) => updateValue(o.id, e.target.value)}
                placeholder={`Option ${o.id}…`}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.cellCorrect}>
              <input
                type="radio"
                name="correct"
                checked={correctId === o.id}
                onChange={() => setCorrectId(o.id)}
                aria-label={`Mark option ${o.id} as correct`}
              />
            </div>
            <div style={styles.cellAct}>
              <button
                type="button"
                onClick={() => removeOption(o.id)}
                disabled={optionList.length <= 2}
                title={optionList.length <= 2 ? "Need at least two options" : "Remove option"}
                style={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.header}>
        <div style={{ fontWeight: 600 }}></div>
        <button type="button" onClick={addOption} style={styles.addBtn}>
          + Add option
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <button type="submit" disabled={submitting} style={styles.primary}>
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create quiz"}
        </button>
      </div>
    </form>
  );
}
/* ---------- styles ---------- */
const styles = {
  form: { display: "grid", gap: 12, maxWidth: 720, margin: "auto" },
  label: { display: "grid", gap: 6 },
  textarea: { padding: 10, borderRadius: 8, border: "1px solid #D1D5DB" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  addBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    background: "#F9FAFB",
  },
  table: { border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" },
  rowHead: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 100px 120px",
    background: "#F3F4F6",
    fontWeight: 600,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 100px 120px",
    alignItems: "center",
    borderTop: "1px solid #E5E7EB",
  },
  cellId: { padding: 10 },
  cellVal: { padding: 10, textAlign: "left" },
  cellCorrect: { padding: 10, textAlign: "center" },
  cellAct: { padding: 10, textAlign: "right" },
  input: { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #D1D5DB" },
  removeBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#fff",
  },
  error: { color: "crimson" },
  actions: { marginTop: 8 },
  primary: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
  },
};
