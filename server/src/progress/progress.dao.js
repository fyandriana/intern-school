import { getDb } from "../db/connection.js";
import { mapSqliteError } from "../middleware/errors.js";

// Columns
const COLUMNS = "id, courseId, studentId, quizAttempts, status, score, created_at";

// Lazily prepared statements (created once per process)
let stmts;

function ensureStmts() {
  if (stmts) return stmts;
  const db = getDb();
  stmts = {
    // Create
    insertProgress: db.prepare(`
            INSERT OR IGNORE INTO progress (courseId, studentId, status, score)
            VALUES (@courseId, @studentId, @status, @score)
        `),

    // Read – base
    listBase: db.prepare(`
            SELECT ${COLUMNS}
            FROM progress
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `),

    // Read – filters
    listByStudent: db.prepare(`
            SELECT ${COLUMNS}
            FROM progress
            WHERE studentId = ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `),

    listByCourse: db.prepare(`
            SELECT ${COLUMNS}
            FROM progress
            WHERE courseId = ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `),
    listAllCourses: db.prepare(`
            SELECT c.id,
                   c.title,
                   c.description,
                   c.teacherId,
                   -- boolean-style flag
                   CASE WHEN p.id IS NULL THEN 0 ELSE 1 END AS enrolled,
                   -- human-readable status (falls back to 'not_enrolled')
                   COALESCE(p.status, 'not_enrolled')       AS enrollmentStatus,
                   -- optional extra fields if enrolled
                   p.score,
                   p.created_at                             AS enrolled_at
            FROM courses AS c
                     LEFT JOIN progress AS p ON p.courseId = c.id AND p.studentId = ?
            ORDER BY c.id DESC
            LIMIT ? OFFSET ?;
        `),
    // Teacher view: enrolled students for a course
    listEnrolledStudents: db.prepare(`
            SELECT u.id AS studentId, u.name AS studentName, u.email AS studentEmail, p.status, p.score, p.created_at
            FROM progress p
                     JOIN users u ON u.id = p.studentId
            WHERE p.courseId = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `),

    // Student view: "my courses" WITH course details
    listStudentCoursesWithCourse: db.prepare(`
            SELECT p.id          AS progressId,
                   p.studentId,
                   p.courseId,
                   p.status,
                   p.score,
                   p.created_at,
                   c.title       AS courseTitle,
                   c.description AS courseDescription,
                   c.teacherId   AS teacherId,
                   u.name        AS teacherName
            FROM progress p
                     JOIN courses c ON c.id = p.courseId
                     JOIN users u ON u.id = c.teacherId
            WHERE p.studentId = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `),

    // Singletons
    selectById: db.prepare(`
            SELECT ${COLUMNS}
            FROM progress
            WHERE id = ?
        `),

    selectByStudentAndCourse: db.prepare(`
            SELECT ${COLUMNS}
            FROM progress
            WHERE studentId = ? AND courseId = ?
        `),

    // Update
    updateById: db.prepare(`
            UPDATE progress
            SET courseId  = COALESCE(@courseId, courseId),
                studentId = COALESCE(@studentId, studentId),
                status    = COALESCE(@status, status),
                score     = COALESCE(@score, score)
            WHERE id = @id
        `),
    updateStatusInProgress: db.prepare(`
            UPDATE progress
            SET status = COALESCE(@status, status)
            WHERE studentId = @studentId AND courseId = @courseId
        `),
    updateByStudentAndCourse: db.prepare(`
            UPDATE progress
            SET status = COALESCE(@status, status),
                score  = CASE WHEN @score IS NULL THEN score ELSE @score END
            WHERE studentId = @studentId
              AND courseId = @courseId
        `),
    upsert: db.prepare(`
            INSERT INTO progress (courseId, studentId, status, score, quizAttempts)
            VALUES (@courseId, @studentId, @status, @score, json('[]'))
            ON CONFLICT(courseId, studentId) DO UPDATE SET status = excluded.status, score = excluded.score
        `),
    getOne: db.prepare(`
            SELECT * FROM progress WHERE courseId = ? AND studentId = ?
        `),
    appendQuizAttempt: db.prepare(`
            UPDATE progress
            SET quizAttempts = json_insert(COALESCE(quizAttempts, '[]'), '$[#]', json(@attempt)),
                score=@score,
                status=@status
            WHERE courseId = @courseId
              AND studentId = @studentId
        `),
    // Delete
    deleteById: db.prepare(`DELETE FROM progress WHERE id = ?`),
  };
  return stmts;
}

export function getProgressByStudentAndCourse(studentId, courseId) {
  const s = ensureStmts();
  return s.selectByStudentAndCourse.get(studentId, courseId);
}

/**
 * Enroll a student in a course.
 * Idempotent via INSERT OR IGNORE + fetch existing row.
 * Defaults: status='enrolled', score=NULL
 */
export function enrollStudent({ courseId, studentId, status = "enrolled" }) {
  const s = ensureStmts();
  try {
    s.insertProgress.run({ courseId, studentId, status, score: null });
    return s.selectByStudentAndCourse.get(studentId, courseId);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

// Student: list own course enrollments (with course details)
export function getStudentCourses({ studentId, limit = 50, offset = 0 } = {}) {
  const s = ensureStmts();
  try {
    if (studentId) return s.listStudentCoursesWithCourse.all(studentId, limit, offset);
    return s.listBase.all(limit, offset);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function updateStatusInProgress({ studentId, courseId }) {
  const s = ensureStmts();
  try {
    const status = "in_progress";
    const info = s.updateStatusInProgress.run({ studentId, courseId, status });
    if (info.changes === 0) return null;
    return getProgressByStudentAndCourse(studentId, courseId);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

/** Student updates their own status/score for a course */
export function updateProgressByStudentAndCourse({
  studentId,
  courseId,
  status = null,
  score = null,
}) {
  const s = ensureStmts();
  try {
    const info = s.updateByStudentAndCourse.run({ studentId, courseId, status, score });
    if (info.changes === 0) return null;
    return getProgressByStudentAndCourse(studentId, courseId);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function getAllCourses({ studentId, limit, offset }) {
  const statement = ensureStmts();
  try {
    if (studentId) return statement.listAllCourses.all(studentId, limit, offset);
    return statement.listBase.all(limit, offset);
  } catch (Err) {
    throw mapSqliteError(Err);
  }
}

export function appendQuizAttempt({ courseId, studentId, score, status, attempt }) {
  try {
    const { appendQuizAttempt } = ensureStmts();
    appendQuizAttempt.run({
      courseId,
      studentId,
      score,
      status,
      attempt: JSON.stringify(attempt),
    });
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function getProgress(courseId, studentId) {
  const { getOne } = ensureStmts();
  const row = getOne.get(courseId, studentId);
  if (!row) return null;
  return {
    ...row,
    quizAttempts: row.quizAttempts ? JSON.parse(row.quizAttempts) : [],
  };
}

export function updateProgress(id, { score, status }) {
  const db = getDb();
  const fields = [];
  const params = [];

  if (score !== undefined) {
    fields.push("score = ?");
    params.push(score);
  }
  if (status !== undefined) {
    fields.push("status = ?");
    params.push(status);
  }

  if (fields.length === 0) return null;

  params.push(id);
  db.prepare(`UPDATE progress SET ${fields.join(", ")} WHERE id = ?`).run(...params);
}
