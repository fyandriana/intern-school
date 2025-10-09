// id            INTEGER PRIMARY KEY AUTOINCREMENT,
//     courseId      INTEGER NOT NULL,
//     question      TEXT    NOT NULL,
//     options       TEXT    NOT NULL CHECK ( json_valid(options)),
//     correctAnswer INTEGER NOT NULL CHECK (correctAnswer >= 0),
//     created_at    TEXT DEFAULT (datetime('now')),
//     FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE
import {getDb} from "../db/connection.js";
import {mapSqliteError} from "../errors.js";
import {getUserById} from "../users/users.dao.js";

// Lazily prepared statements (created once per process)
const COLUMNS = "id, courseId, question, options, correctAnswer, created_at";

let stmts;

function ensureStmts() {
    if (stmts) return stmts;
    const db = getDb();
    stmts = {
        insertQuizz: db.prepare(`INSERT INTO quizzes VALUES (courseId, question, options, correctAnswer)`),
        listBase: db.prepare(`SELECT ${COLUMNS} FROM quizzes ORDER BY id DESC LIMIT ? OFFSET ?`),
        listByCourse: db.prepare(`SELECT ${COLUMNS} FROM quizzes WHERE courseId = ? ORDER BY id DESC LIMIT ? OFFSET ?`),
        selectQuizzById: db.prepare(`SELECT ${COLUMNS} FROM quizzes WHERE id = ?`),
        updateQuizz: db.prepare(`
            UPDATE quizzes
            SET courseId      = COALESCE(@courseId, courseId),
                question      = COALESCE(@question, question),
                options       = COALESCE(@options, options),
                correctAnswer = COALESCE(@correctAnswer, correctAnswer)
            WHERE id = @id
        `),
        deleteQuizz: db.prepare(`DELETE FROM quizzes WHERE id = ?`)
    }
}

export function getQuizzById(id) {
    const statement = ensureStmts();
    return statement.selectById.get(id);
}

export function createQuizz({courseId, question, options, correctAnswer}) {
    const statement = ensureStmts();

    try {
        const info = statement.insertQuizz.run({courseId, question, options, correctAnswer});
        return getQuizzById(info.lastInsertRowid);
    } catch (err) {
        throw mapSqliteError(err);
    }
}

export function listQuizzes({limit = 50, offset = 0, courseId} = {}){
    const statement = ensureStmts();
    try {
        if(courseId) return statement.listByCourse.all(courseId, limit, offset);
        return statement.listBase(limit, offset);
    }
    catch (err){
        throw mapSqliteError(err)
    }
}

export function updateQuizz(id, patch){
    const statement = ensureStmts();
    try {
        const info = statement.updateQuizz.run({
            id,
            courseId: patch.courseId ?? null,
            question : patch.question ?? null,
            options: patch.options ?? null,
            correctAnswer: patch.correctAnswer ?? null,
        });
        if (info.changes === 0) return null;
        return getQuizzById(id);
    }
    catch (err){
        mapSqliteError(err);
    }
}

export function deleteQuizz(id){
    const statement = ensureStmts();
    try {
        const info = statement.deleteQuizz.run(id);
        return info.changes > 0;
    }catch (err){
        mapSqliteError(err);
    }
}

