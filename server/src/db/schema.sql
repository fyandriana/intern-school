-- Turns on enforcement of FOREIGN KEY constraints.
-- To avoid orphan rows insertion and deletion of a parent row that have children reference
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Drop existing tables (safe re-run)
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE IF NOT EXISTS users
(
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	name         TEXT NOT NULL,
	email        TEXT NOT NULL UNIQUE,
	passwordHash TEXT NOT NULL, -- store bcrypt hash
	role         TEXT NOT NULL CHECK ( role IN ('Teacher', 'Student')),
	created_at   TEXT DEFAULT (datetime('now'))
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses
(
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	teacherId   INTEGER NOT NULL,
	title       TEXT    NOT NULL,
	description TEXT    NOT NULL,
	created_at  TEXT DEFAULT (datetime('now')),
	FOREIGN KEY (teacherId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- QUIZZES (one row per question)
-- options is JSON array of strings: ["A", "B", "C", "D"]
-- correctAnswer is the 0-based index into options
CREATE TABLE IF NOT EXISTS quizzes
(
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	courseId      INTEGER NOT NULL,
	question      TEXT    NOT NULL,
	options       TEXT    NOT NULL CHECK ( json_valid(options)),
	correctAnswer INTEGER NOT NULL CHECK (correctAnswer >= 0),
	created_at    TEXT DEFAULT (datetime('now')),
	FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- PROGRESS (per student per course)
-- status: enrolled | in_progress | completed
-- score: 0..100 (nullable until quiz submitted/scored)
-- quizAttempts: JSON array of quiz submissions per course, each entry like:
--   [{"attempt":1,"answers":[{"q":1,"a":2},{"q":2,"a":1}],"score":70,"submitted_at":"2025-10-24 14:30"}]
CREATE TABLE IF NOT EXISTS progress
(
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	studentId    INTEGER NOT NULL,
	courseId     INTEGER NOT NULL,
	status       TEXT    NOT NULL CHECK ( status IN ('enrolled', 'in_progress', 'completed')),
	score        REAL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
	quizAttempts TEXT DEFAULT '[]' CHECK (json_valid(quizAttempts)), -- store all quiz submissions as JSON
	created_at   TEXT DEFAULT (datetime('now')),
	UNIQUE (studentId, courseId),                                    -- one row per student-course
	FOREIGN KEY (studentId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes (FK lookups & frequent queries)
CREATE INDEX IF NOT EXISTS idx_courses_teacherId ON courses (teacherId);
CREATE INDEX IF NOT EXISTS idx_quizzes_courseId ON quizzes (courseId);
CREATE INDEX IF NOT EXISTS idx_progress_studentId ON progress (studentId);
CREATE INDEX IF NOT EXISTS idx_progress_courseId ON progress (courseId);

-- Optional guards to enforce correct user roles for FKs
-- Ensure courses.teacherId belongs to a Teacher
CREATE TRIGGER IF NOT EXISTS trg_courses_teacher_role
	BEFORE INSERT
	ON courses
	FOR EACH ROW
BEGIN
	SELECT CASE
		       WHEN (SELECT role FROM users WHERE id = NEW.teacherId) != 'Teacher'
			       THEN RAISE(ABORT, 'teacherId must reference a user with role=Teacher') END;
END;

-- Ensure progress.studentId belongs to a Student
CREATE TRIGGER IF NOT EXISTS trg_progress_student_role
	BEFORE INSERT
	ON progress
	FOR EACH ROW
BEGIN
	SELECT CASE
		       WHEN (SELECT role FROM users WHERE id = NEW.studentId) != 'Student'
			       THEN RAISE(ABORT, 'studentId must reference a user with role=Student') END;
END;
