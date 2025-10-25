import {
  createQuiz,
  getQuizById,
  listQuizzesByCourseId as daoListQuizzesByCourseId,
  listQuizzes as daoListQuizzes,
  deleteQuiz as daoDeleteQuiz,
  updateQuiz,
  listAllQuizzesByCourse,
} from "./quizzes.dao.js";
import { NotFoundError, ValidationError } from "../middleware/errors.js";
import { getCourseById } from "../courses/courses.dao.js";
import { appendQuizAttempt, getProgress, updateProgress } from "../progress/progress.dao.js";

/* -------------------- validators -------------------- */
function assertNonEmptyString(value, field, { min = 1 } = {}) {
  if (typeof value !== "string" || value.trim().length < min) {
    throw new ValidationError(`Invalid ${field}`, { field });
  }
}

function assertCourse(value) {
  if (!Number.isInteger(value)) {
    throw new ValidationError("Invalid Course", { field: "courseId" });
  }
  const course = getCourseById(value);
  if (!course?.id) throw new ValidationError("Unknown Course");
}

/* -------------------- normalization helpers -------------------- */

// Accepts array OR map and returns a map: { "1": {id:1,value:"A"}, ... }
function toOptionsMap(options) {
  if (!options) throw new ValidationError("options is required", { field: "options" });

  // Already a map
  if (typeof options === "object" && !Array.isArray(options)) {
    const out = {};
    for (const [k, v] of Object.entries(options)) {
      const id = Number(v?.id ?? k);
      if (!Number.isInteger(id) || id < 0) {
        throw new ValidationError("options map entries must include a non-negative integer id");
      }
      const value = typeof v === "string" ? v : (v?.value ?? String(v));
      if (typeof value !== "string" || !value.trim()) {
        throw new ValidationError("each option must have a non-empty value");
      }
      out[String(id)] = { id, value };
    }
    return out;
  }

  // Array → assign ids 1..n
  if (Array.isArray(options)) {
    if (options.length < 2) {
      throw new ValidationError("options must contain at least two choices");
    }
    const out = {};
    options.forEach((o, i) => {
      const id = i + 1;
      const value = typeof o === "string" ? o : (o?.value ?? String(o));
      if (typeof value !== "string" || !value.trim()) {
        throw new ValidationError("each option must have a non-empty value");
      }
      out[String(id)] = { id, value };
    });
    return out;
  }

  throw new ValidationError("options must be an array or an object map", { field: "options" });
}

function coerceCorrectId(correctAnswer) {
  if (typeof correctAnswer === "number") return correctAnswer;
  if (typeof correctAnswer === "string" && /^\d+$/.test(correctAnswer))
    return Number(correctAnswer);
  throw new ValidationError("correctAnswer must be an integer id", { field: "correctAnswer" });
}

function ensureCorrectInOptions(correctId, optionsMap) {
  if (!optionsMap[String(correctId)]) {
    throw new ValidationError("correctAnswer must be the id of one of the options", {
      field: "correctAnswer",
    });
  }
}

/* -------------------- services -------------------- */
export function createQuizSvc({ courseId, question, options, correctAnswer }) {
  const cid = Number(courseId);
  assertCourse(cid);
  assertNonEmptyString(String(question), "question");
  const optionsMap = toOptionsMap(options);
  const correctId = coerceCorrectId(correctAnswer);
  ensureCorrectInOptions(correctId, optionsMap);

  // store JSON map; DB has CHECK(json_valid(options))
  const payload = {
    courseId: cid,
    question: String(question),
    options: JSON.stringify(optionsMap),
    correctAnswer: correctId, // INTEGER
  };

  return createQuiz(payload);
}

export function getQuizByIdSvc(id) {
  const quiz = getQuizById(id);
  if (!quiz) throw new NotFoundError("Quiz not found", { id });
  return quiz; // dao should parse options JSON if you want map on read
}

export function listQuizzesSvc(opts = {}) {
  if (opts.courseId != null) assertCourse(Number(opts.courseId));
  const limit = Number(opts.limit ?? 50);
  const offset = Number(opts.offset ?? 0);
  if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
    throw new ValidationError("Invalid limit (1..200)", { field: "limit" });
  }
  if (!Number.isFinite(offset) || offset < 0) {
    throw new ValidationError("Invalid offset (>=0)", { field: "offset" });
  }
  return daoListQuizzes({
    limit,
    offset,
    courseId: opts.courseId ? Number(opts.courseId) : undefined,
  });
}

export function listQuizzesForCourseSvc(courseId, { limit, offset } = {}) {
  const id = Number(courseId);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError("Invalid course id");
  const l = limit !== undefined ? Number(limit) : 20;
  const o = offset !== undefined ? Number(offset) : 0;

  return daoListQuizzesByCourseId(id, {
    limit: Math.min(Math.max(l, 1), 100),
    offset: Math.max(o, 0),
  });
}

export function deleteQuizSvc(id) {
  const ok = daoDeleteQuiz(id);
  if (!ok) throw new NotFoundError("Quiz not found", { id });
  return { deleted: true };
}

export function updateQuizSvc(id, payload) {
  const cid = Number(payload.courseId);
  assertCourse(cid);
  assertNonEmptyString(String(payload.question), "question");
  const optionsMap = toOptionsMap(payload.options);
  const correctId = coerceCorrectId(payload.correctAnswer);
  ensureCorrectInOptions(correctId, optionsMap);

  // store JSON map; DB has CHECK(json_valid(options))
  const buff = {
    courseId: cid,
    question: String(payload.question),
    options: JSON.stringify(optionsMap),
    correctAnswer: correctId, // INTEGER
  };

  return updateQuiz(id, buff);
}

export function submitQuizSvc({ courseId, student, answers }) {
  if (!student?.id) throw new ValidationError("Student required");
  if (!Array.isArray(answers) || answers.length === 0)
    throw new ValidationError("Answers must be a non-empty array");

  const questions = listAllQuizzesByCourse(courseId);

  if (questions.length === 0)
    throw new NotFoundError("No quiz found for this course", { courseId });
  let correct = 0;
  // Compare each answer
  for (const a of answers) {
    const q = questions.find((q) => q.id === a.questionId);
    if (q && Number(q.correctAnswer) === Number(a.answerIndex)) {
      correct++;
    }
  }
  const total = questions.length;
  const score = Math.round((correct / total) * 100);
  const status = "completed";
  // // Get previous attempts to compute next attempt number
  let progress = getProgress(courseId, student.id);
  const nextAttempt = (progress?.quizAttempts?.length || 0) + 1;
  const attempt = {
    attempt: nextAttempt,
    answers,
    score,
    submitted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  appendQuizAttempt({
    courseId,
    studentId: student.id,
    score,
    status,
    attempt,
  });

  return {
    courseId,
    studentId: student.id,
    total,
    correct,
    score,
    attempt,
  };
}
