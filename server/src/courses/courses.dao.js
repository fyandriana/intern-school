import {getDb} from "../db/connection.js";
import {mapSqliteError} from "../errors.js"

const COLUMNS = "id, teacherId, title, description, created_at";

let stmts;

function ensureStmt() {
    if (stmts) return stmts;
    const db = getDb();
    stmts = {
        insertCourse: db.prepare(`
            INSERT INTO courses (teacherId, title, description) VALUES (@teacherId, @title, @description)
        `),

        selectById: db.prepare(`SELECT ${COLUMNS} FROM courses WHERE id = ?`),
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
        deleteCourse: db.prepare(`DELETE FROM courses WHERE id = ?`)
    }
    return stmts;
}

export function getCourseById(courseId) {
    const statement = ensureStmt();
    return statement.selectById.get(courseId);
}

export function createCourse({teacherId, title, description}) {
    const statement = ensureStmt();
    try {
        const info = statement.insertCourse.run({teacherId, title, description});
        return getCourseById(info.lastInsertRowid);
    } catch (Err) {
        throw mapSqliteError(Err);
    }
}

export function listCourses({limit = 50, offset = 0, teacherId} = {}) {
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
            teacherId: patch.teacherId ?? null
        });
        if(info.changes === 0) return null;
        return getCourseById(id);
    } catch (Err) {
        throw mapSqliteError(Err);
    }
}

export function deleteCourse(id){
    const statement = ensureStmt();
    try {
        const info = statement.deleteCourse.run(id);
        return info.changes > 0;
    }
    catch (Err) {
        throw mapSqliteError(Err);
    }
}