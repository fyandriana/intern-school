import { getDb } from "../db/connection.js";

let stmts;

/**
 * Prepare and cache statements once.
 */
function ensureStmts() {
  if (stmts) return stmts;
  const db = getDb();

  stmts = {
    // List distinct students who have progress in any course taught by this teacher.
    listStudents: db.prepare(`
            SELECT s.id                                   AS studentId,
                   COALESCE(s.name, '')                   AS name,
                   COALESCE(s.email, '')                  AS email,
                   json_group_array(json_object('courseId', c.id, 'title', c.title, 'status', p.status, 'score',
                                                p.score)) AS courses
            FROM progress p
                     JOIN courses c ON c.id = p.courseId AND c.teacherId = @teacherId
                     JOIN users s ON s.id = p.studentId
            GROUP BY s.id
            ORDER BY s.name COLLATE NOCASE ASC, s.email ASC
            LIMIT @limit OFFSET @offset
        `),

    // Count distinct students across this teacher's courses (for pagination).
    countStudents: db.prepare(`
            SELECT COUNT(DISTINCT p.studentId) AS n
            FROM progress p
                     JOIN courses c ON c.id = p.courseId AND c.teacherId = @teacherId
        `),

    // Basic student identity.
    getStudentHeader: db.prepare(`
            SELECT id AS studentId, COALESCE(name, '') AS name, COALESCE(email, '') AS email
            FROM users
            WHERE id = @studentId
        `),

    // Courses for this student, limited to courses taught by this teacher,
    // with the student's progress status/score from the unique progress row.
    getStudentCoursesForTeacher: db.prepare(`
            SELECT c.id AS courseId, c.title AS title, p.status AS status, p.score AS score
            FROM progress p
                     JOIN courses c ON c.id = p.courseId
            WHERE c.teacherId = @teacherId
              AND p.studentId = @studentId
            ORDER BY c.title COLLATE NOCASE ASC
        `),
  };

  return stmts;
}

/**
 * Paginated list of students for a given teacher,
 * with each student's courses (title, status, score).
 */
export function listTeacherStudents(teacherId, { limit = 20, offset = 0 } = {}) {
  const { listStudents, countStudents } = ensureStmts();

  const rows = listStudents.all({ teacherId, limit, offset });
  const total = countStudents.get({ teacherId }).n;

  return {
    items: rows.map((r) => ({
      studentId: r.studentId,
      name: r.name,
      email: r.email,
      courses: JSON.parse(r.courses ?? "[]"),
    })),
    total,
    limit,
    offset,
  };
}

/**
 * Detail for one student across this teacher's courses.
 */
export function getTeacherStudentDetail(teacherId, studentId) {
  const { getStudentHeader, getStudentCoursesForTeacher } = ensureStmts();

  const student = getStudentHeader.get({ studentId });
  if (!student) return null;

  const courses = getStudentCoursesForTeacher.all({ teacherId, studentId });
  return { ...student, courses };
}
