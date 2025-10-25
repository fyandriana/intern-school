import { getDb } from "../db/connection.js";
import { mapSqliteError } from "../middleware/errors.js";

const COLUMNS = "id, teacherId, title, description, created_at";

let stmts;

function ensureStmt() {
  if (stmts) return stmts;
  const db = getDb();
  stmts = {
    insertCourse: db.prepare(`
            INSERT INTO courses (teacherId, title, description) VALUES (@teacherId, @title, @description)
        `),

    selectById: db.prepare(`SELECT c.*, u.name teacherName
                                FROM courses c
                                         join users u on c.teacherId = u.id
                                WHERE c.id = ?`),
    listBase: db.prepare(`SELECT ${COLUMNS} FROM courses ORDER BY id DESC LIMIT ? OFFSET ?`),
    listByTeacher: db.prepare(`SELECT ${COLUMNS}
                                   FROM courses
                                   WHERE teacherId = ?
                                   ORDER BY id DESC
                                   LIMIT ? OFFSET ?`),
    updateCourse: db.prepare(`
            UPDATE courses
            SET title       = COALESCE(@title, title),
                description = COALESCE(@description, description),
                teacherId   = COALESCE(@teacherId, teacherId)
            WHERE id = @id
        `),
    countBase: db.prepare(`SELECT COUNT(*) AS total FROM courses`),
    countByTeacher: db.prepare(`SELECT COUNT(*) AS total FROM courses WHERE teacherId = ?`),
    countQuiz: db.prepare(`SELECT COUNT(*) AS c FROM quizzes WHERE courseId = ?`),
    deleteCourse: db.prepare(`DELETE FROM courses WHERE id = ?`),
  };
  return stmts;
}

export function getCourseById(courseId) {
  const statement = ensureStmt();
  return statement.selectById.get(courseId);
}

export function createCourse({ teacherId, title, description }) {
  const statement = ensureStmt();
  try {
    const info = statement.insertCourse.run({ teacherId, title, description });
    return getCourseById(info.lastInsertRowid);
  } catch (Err) {
    throw mapSqliteError(Err);
  }
}

export function listCourses({ limit = 50, offset = 0, teacherId } = {}) {
  const statement = ensureStmt();
  try {
    if (teacherId) return statement.listByTeacher.all(teacherId, limit, offset);
    return statement.listBase.all(limit, offset);
  } catch (Err) {
    throw mapSqliteError(Err);
  }
}

export function updateCourse(id, patch) {
  const statement = ensureStmt();
  try {
    const info = statement.updateCourse.run({
      id,
      title: patch.title ?? null,
      description: patch.description ?? null,
      teacherId: patch.teacherId ?? null,
    });
    if (info.changes === 0) return null;
    return getCourseById(id);
  } catch (Err) {
    throw mapSqliteError(Err);
  }
}

export function deleteCourse(id) {
  const statement = ensureStmt();
  try {
    const info = statement.deleteCourse.run(id);
    return info.changes > 0;
  } catch (Err) {
    throw mapSqliteError(Err);
  }
}

export function countQuizzesForCourse(courseId) {
  const statement = ensureStmt();
  try {
    return statement.countQuiz.get(courseId).c;
    //  return info.changes > 0;
  } catch (Err) {
    throw mapSqliteError(Err);
  }
  //  return db.prepare(`SELECT COUNT(*) AS c FROM quizzes WHERE courseId = ?`).get(courseId).c;
}

// Returns a number (total rows in courses)
export function countCourses() {
  const s = ensureStmt();
  const row = s.countBase.get();
  return Number(row?.total) || 0;
}

// Returns a number (rows for a specific teacherId)
export function countCoursesByTeacher(teacherId) {
  const s = ensureStmt();
  const row = s.countByTeacher.get(teacherId);
  return Number(row?.total) || 0;
}
