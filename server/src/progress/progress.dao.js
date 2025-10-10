// id            INTEGER PRIMARY KEY AUTOINCREMENT,
//     courseId      INTEGER NOT NULL,
//     question      TEXT    NOT NULL,
//     options       TEXT    NOT NULL CHECK ( json_valid(options)),
//     correctAnswer INTEGER NOT NULL CHECK (correctAnswer >= 0),
//     created_at    TEXT DEFAULT (datetime('now')),
//     FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE
// id         INTEGER PRIMARY KEY AUTOINCREMENT,
//     studentId  INTEGER NOT NULL,
//     courseId   INTEGER NOT NULL,
//     status     TEXT    NOT NULL CHECK ( status IN ('enrolled', 'in_progress', 'completed')),
// score      REAL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
// created_at TEXT DEFAULT (datetime('now')),

import {getDb} from "../db/connection.js";
import {mapSqliteError} from "../errors.js";
import {getUserById} from "../users/users.dao.js";

// Lazily prepared statements (created once per process)
const COLUMNS = "id, courseId, studentId, status, score, created_at";

let stmts;

function ensureStmts() {
    if (stmts) return stmts;
    const db = getDb();
    stmts = {
        insertProgress: db.prepare(`INSERT INTO progress VALUES (courseId, studentId, status, score)`),
        listBase: db.prepare(`SELECT ${COLUMNS} FROM progress ORDER BY id DESC LIMIT ? OFFSET ?`),
        listByStudent: db.prepare(`SELECT ${COLUMNS} FROM progress WHERE studentId = ? ORDER BY id DESC LIMIT ? OFFSET ?`),
        selectProgressById: db.prepare(`SELECT ${COLUMNS} FROM progress WHERE id = ?`),
        updateProgress: db.prepare(`
            UPDATE progress
            SET courseId      = COALESCE(@courseId, courseId),
                studentId      = COALESCE(@studentId, studentId),
                status      = COALESCE(@status, status),
                score       = COALESCE(@score, score),
            WHERE id = @id
        `),
        deleteProgress: db.prepare(`DELETE FROM progress WHERE id = ?`)
    }
}

export function getProgressById(id) {
    const statement = ensureStmts();
    return statement.selectById.get(id);
}

export function createProgress({courseId, studentId, status, score}) {
    const statement = ensureStmts();

    try {
        const info = statement.insertQuizz.run({courseId, studentId, status, score});
        return getProgressById(info.lastInsertRowid);
    } catch (err) {
        throw mapSqliteError(err);
    }
}

export function listProgresses({limit = 50, offset = 0, studentId} = {}){
    const statement = ensureStmts();
    try {
        if(studentId) return statement.listByCourse.all(studentId, limit, offset);
        return statement.listBase(limit, offset);
    }
    catch (err){
        throw mapSqliteError(err)
    }
}

export function updateProgress(id, patch){
    const statement = ensureStmts();
    try {
        const info = statement.updateQuizz.run({
            id,
            courseId: patch.courseId ?? null,
            studentId : patch.studentId ?? null,
            status: patch.status ?? null,
            score: patch.score ?? null,
        });
        if (info.changes === 0) return null;
        return getProgressById(id);
    }
    catch (err){
        mapSqliteError(err);
    }
}

export function deleteProgress(id){
    const statement = ensureStmts();
    try {
        const info = statement.deleteProgress.run(id);
        return info.changes > 0;
    }catch (err){
        mapSqliteError(err);
    }
}

