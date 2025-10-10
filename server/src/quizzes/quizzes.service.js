import {
    createQuizz,
    getQuizzById,
    listQuizzes as daoListQuizzes,
    updateQuizz as daoUpdateQuizz,
    deleteQuizz as daoDeleteQuizz,
} from "./quizzes.dao.js";
import { NotFoundError, ValidationError, UniqueViolationError } from "../errors.js";
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

export function createQuizzSvc({ courseId, question, options, correctAnswer }) {
    assertNonEmptyString(question, "question");
    assertNonEmptyString(options, "options");
    assertNonEmptyString(correctAnswer, "correctAnswer");
    assertCourse(courseId);

    return createQuizz({ courseId, question, options, correctAnswer });
}

export function getQuizzByIdSvc(id) {
    const quizz = getQuizzById(id);
    if (!quizz) throw new NotFoundError("Quizz not found", { id });
    return quizz;
}

export function listQuizzesSvc(opts = {}) {
    if (opts.courseId) assertCourse(opts.courseId);
    const limit = Number(opts.limit ?? 50);
    const offset = Number(opts.offset ?? 0);
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
        throw new ValidationError("Invalid limit (1..200)", { field: "limit" });
    }
    if (!Number.isFinite(offset) || offset < 0) {
        throw new ValidationError("Invalid offset (>=0)", { field: "offset" });
    }
    return daoListQuizzes({ limit, offset, courseId: opts.courseId });
}

export function updateQuizzSvc(id, patch) {
    if (patch.question !== undefined) assertNonEmptyString(patch.question, "question");
    if (patch.options !== undefined) assertNonEmptyString(patch.options, "options");
    if (patch.correctAnswer !== undefined) assertNonEmptyString(patch.correctAnswer, "correctAnswer");
    if (patch.courseId !== undefined) assertCourse(patch.courseId);

    const updated = daoUpdateQuizz(id, patch);
    if (!updated) throw new NotFoundError("Quizz not found", { id });
    return updated;
}

export function deleteQuizzSvc(id) {
    const ok = daoDeleteQuizz(id);
    if (!ok) throw new NotFoundError("Quizz not found", { id });
    return { deleted: true };
}
