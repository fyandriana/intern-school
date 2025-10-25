import { getDb } from "../db/connection.js";
import { mapSqliteError } from "../middleware/errors.js";

const COLUMNS = "id, courseId, question, options, correctAnswer, created_at";

let stmts;

function ensureStmts() {
  if (stmts) return stmts;
  const db = getDb();
  stmts = {
    insertQuiz: db.prepare(`INSERT INTO quizzes(courseId, question, options, correctAnswer)
                                VALUES (@courseId, @question, @options, @correctAnswer)`),
    listByCourse: db.prepare(`
            SELECT ${COLUMNS}
            FROM quizzes q
            WHERE q.courseId = ?
            ORDER BY q.id DESC
            LIMIT ? OFFSET ?
        `),
    // no-limit query for taking/scoring a quiz
    listAllByCourse: db.prepare(`
            SELECT ${COLUMNS}
            FROM quizzes
            WHERE courseId = ?
            ORDER BY id ASC
        `),
    countByCourse: db.prepare(`SELECT COUNT(*) AS n FROM quizzes WHERE courseId = ?`),
    listBase: db.prepare(`SELECT ${COLUMNS} FROM quizzes ORDER BY id DESC LIMIT ? OFFSET ?`),

    selectById: db.prepare(`SELECT ${COLUMNS} FROM quizzes WHERE id = ?`),
    updateQuiz: db.prepare(`
            UPDATE quizzes
            SET courseId      = COALESCE(@courseId, courseId),
                question      = COALESCE(@question, question),
                options       = COALESCE(@options, options),
                correctAnswer = COALESCE(@correctAnswer, correctAnswer)
            WHERE id = @id
        `),
    deleteQuiz: db.prepare(`DELETE FROM quizzes WHERE id = ?`),
  };
  return stmts;
}

// parse options JSON
function normalize(row) {
  return {
    ...row,
    options: Array.isArray(row.options) ? row.options : JSON.parse(row.options || "[]"),
  };
}

export function getQuizById(id) {
  const statement = ensureStmts();
  return statement.selectById.get(id);
}

export function createQuiz(payload) {
  const statement = ensureStmts();

  try {
    const info = statement.insertQuiz.run(payload);

    return getQuizById(info.lastInsertRowid);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function listQuizzes({ limit = 50, offset = 0, courseId } = {}) {
  const statement = ensureStmts();
  try {
    if (courseId) return statement.listByCourse.all(courseId, limit, offset);
    return statement.listBase(limit, offset);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function listQuizzesByCourseId(courseId, { limit = 20, offset = 0 } = {}) {
  const s = ensureStmts();
  const rows = s.listByCourse.all(courseId, limit, offset);
  const { n } = s.countByCourse.get(courseId);
  return { items: rows, total: n, limit, offset };
}

export function updateQuiz(id, patch) {
  const statement = ensureStmts();
  try {
    const info = statement.updateQuiz.run({
      id,
      courseId: patch.courseId ?? null,
      question: patch.question ?? null,
      options: patch.options ?? null,
      correctAnswer: patch.correctAnswer ?? null,
    });

    if (info.changes === 0) return null;
    return getQuizById(id);
  } catch (err) {
    mapSqliteError(err);
  }
}

export function deleteQuiz(id) {
  const statement = ensureStmts();
  try {
    const info = statement.deleteQuiz.run(id);
    return info.changes > 0;
  } catch (err) {
    mapSqliteError(err);
  }
}

// a no-limit fetch that returns normalized options arrays
export function listAllQuizzesByCourse(courseId) {
  const s = ensureStmts();
  const rows = s.listAllByCourse.all(courseId);
  return rows.map(normalize);
}
