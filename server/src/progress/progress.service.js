import {
    createProgress,
    getProgressById,
    listProgresses as daoListProgresses,
    updateProgress as daoUpdateProgress,
    deleteProgress as daoDeleteProgress,
} from "./progress.dao.js";
import { NotFoundError, ValidationError, UniqueViolationError } from "../errors.js";
import {getUserById} from "../users/users.dao.js";
import {getCourseById} from "../courses/courses.dao.js";

function assertNonEmptyString(value, field, { min = 1 } = {}) {
    if (typeof value !== "string" || value.trim().length < min) {
        throw new ValidationError(`Invalid ${field}`, { field });
    }
}
function assertCourse(value) {
    if (typeof value !== 'number') {
        throw new ValidationError("Invalid Course", {field: "courseId"});
    }
    const course = getCourseById(value);
    if (!course?.id) throw new ValidationError("Unknown Course");
}

function assertStudent(value) {
    if (typeof value !== 'number') {
        throw new ValidationError("Invalid Student", {field: "studentId"});
    }
    // check if user is a student
    const student = getUserById(value);
    if (student && student.role !== "Student") throw new ValidationError("Unknown Student");
}

// ('enrolled', 'in_progress', 'completed')
function assertStatus(value) {
    if (!['enrolled', 'in_progress', 'completed'].includes(value)) {
        throw new ValidationError("Invalid status (must be 'enrolled' or 'in_progress' or 'completed')", { field: "status" });
    }
}


export function createProgressSvc({ courseId, studentId, status, score}) {
    assertCourse(courseId);
    assertStudent(studentId);
    assertStatus(status);
    assertCourse(courseId);
    assertNonEmptyString(score,"score");
    return createProgress({ courseId, studentId, status, score });
}

export function getProgressByIdSvc(id) {
    const progress = getProgressById();
    if (!progress) throw new NotFoundError("Progress not found", { id });
    return progress;
}

export function listProgressesSvc(opts = {}) {
    if (opts.studentId) assertStudent(opts.studentId);
    const limit = Number(opts.limit ?? 50);
    const offset = Number(opts.offset ?? 0);
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
        throw new ValidationError("Invalid limit (1..200)", { field: "limit" });
    }
    if (!Number.isFinite(offset) || offset < 0) {
        throw new ValidationError("Invalid offset (>=0)", { field: "offset" });
    }
    return daoListProgresses({ limit, offset, studentId: opts.studentId });
}

export function updateProgressSvc(id, patch) {
    if (patch.courseId !== undefined) assertCourse(patch.courseId);
    if (patch.studentId !== undefined) assertStudent(patch.studentId);
    if (patch.status !== undefined) assertStatus(patch.status);
    if (patch.score !== undefined) assertCourse(patch.score);

    const updated = daoUpdateProgress(id, patch);
    if (!updated) throw new NotFoundError("Progress not found", { id });
    return updated;
}

export function deleteProgressSvc(id) {
    const ok = daoDeleteProgress(id);
    if (!ok) throw new NotFoundError("Progress not found", { id });
    return { deleted: true };
}
