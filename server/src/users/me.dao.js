import { getDb } from "../db/connection.js";

export function getMe(userId) {
  const db = getDb();
  return (
    db.prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`).get(userId) ||
    null
  );
}

export function updateMyName(userId, name) {
  const db = getDb();
  db.prepare(`UPDATE users SET name = ? WHERE id = ?`).run(name, userId);
  return getMe(userId);
}

export function getPasswordHash(userId) {
  const db = getDb();
  const row = db.prepare(`SELECT passwordHash FROM users WHERE id = ?`).get(userId);
  return row?.passwordHash ?? null;
}

export function setPasswordHash(userId, passwordHash) {
  const db = getDb();
  db.prepare(`UPDATE users SET passwordHash = ? WHERE id = ?`).run(passwordHash, userId);
}

/** Helpers for course listings */
export function listOwnedCourses(userId, { limit = 12, offset = 0 }) {
  const db = getDb();
  const items = db
    .prepare(
      `SELECT c.id, c.title, c.description, c.created_at
             FROM courses c
             WHERE c.teacherId = ?
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?`
    )
    .all(userId, limit, offset);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM courses WHERE teacherId = ?`).get(userId).n;
  return { items, total, limit, offset };
}

export function listEnrolledCoursesViaProgress(userId, { limit = 12, offset = 0 }) {
  const db = getDb();
  const items = db
    .prepare(
      `SELECT c.id, c.title, c.description, c.created_at, t.name AS teacherName
             FROM (SELECT DISTINCT p.courseId, MAX(p.created_at) AS joined_at
                   FROM progress p
                   WHERE p.studentId = ?
                   GROUP BY p.courseId) j
                      JOIN courses c ON c.id = j.courseId
                      JOIN users t ON t.id = c.teacherId
             ORDER BY j.joined_at DESC
             LIMIT ? OFFSET ?`
    )
    .all(userId, limit, offset);
  const total = db
    .prepare(`SELECT COUNT(DISTINCT p.courseId) AS n FROM progress p WHERE p.studentId = ?`)
    .get(userId).n;
  return { items, total, limit, offset };
}

export function teacherSummary(userId) {
  const db = getDb();
  const ownedCount = db
    .prepare(`SELECT COUNT(*) AS n FROM courses WHERE teacherId = ?`)
    .get(userId).n;
  const latestOwned = db
    .prepare(
      `SELECT id, title, created_at
             FROM courses
             WHERE teacherId = ?
             ORDER BY created_at DESC
             LIMIT 5`
    )
    .all(userId);
  return { role: "Teacher", ownedCount, latestOwned };
}

export function studentSummaryViaEnrollments(userId) {
  const db = getDb();
  const enrolledCount = db
    .prepare(`SELECT COUNT(*) AS n FROM enrollments WHERE studentId = ?`)
    .get(userId).n;
  const latestEnrolled = db
    .prepare(
      ` SELECT c.id, c.title, t.name AS teacherName, e.created_at
              FROM enrollments e
                       JOIN courses c ON c.id = e.courseId
                       JOIN users t ON t.id = c.teacherId
              WHERE e.studentId = ?
              ORDER BY e.created_at DESC
              LIMIT 5`
    )
    .all(userId);
  return { role: "Student", enrolledCount, latestEnrolled };
}

export function studentSummaryViaProgress(userId) {
  const db = getDb();
  const enrolledCount = db
    .prepare(`SELECT COUNT(DISTINCT p.courseId) AS n FROM progress p WHERE p.studentId = ?`)
    .get(userId).n;
  const latestEnrolled = db
    .prepare(
      `SELECT c.id, c.title, t.name AS teacherName, j.joined_at AS created_at
             FROM (SELECT p.courseId, MAX(p.created_at) AS joined_at
                   FROM progress p
                   WHERE p.studentId = ?
                   GROUP BY p.courseId) j
                      JOIN courses c ON c.id = j.courseId
                      JOIN users t ON t.id = c.teacherId
             ORDER BY j.joined_at DESC
             LIMIT 5`
    )
    .all(userId);
  return { role: "Student", enrolledCount, latestEnrolled };
}
