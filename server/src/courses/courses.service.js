import {
    createCourse,
    getCourseById,
    listCourses as daoListCourse,
    updateCourse as daoUpdateCourse,
    deleteCourse as daoDeleteCourse,
} from "./courses.dao.js";
import {
    getUserById
} from "../users/users.dao.js";

import {NotFoundError, ValidationError, UniqueViolationError} from "../errors.js";

function assertNonEmptyString(value, field, {min = 1} = {}) {
    if (typeof value !== "string" || value.trim().length < min) {
        throw new ValidationError(`Invalid ${field}`, {field});
    }
}

function assertTeacher(value) {
    if (typeof value !== 'number') {
        throw new ValidationError("Invalid Teacher", {field: "teacherId"});
    }
    // check if user is a teacher
    const teacher = getUserById(value);
    if (teacher && teacher.role !== "Teacher") throw new ValidationError("Unknown Teacher");
}

export function getCourseByIdSvc(id) {
    const course = getCourseById(id);
    if (!course) throw new NotFoundError("Course not found", {id});
    return course;
}

export function createCourseSvc({teacherId, title, description}) {
    assertNonEmptyString(title, "title");
    assertNonEmptyString(description, "description");
    assertTeacher(teacherId)

    return createCourse({teacherId, title, description});
}


export function updateCourseSvc(id, patch) {
    if (patch.title !== undefined) assertNonEmptyString(patch.title, "title");
    if (patch.description !== undefined) assertNonEmptyString(patch.description, "description");

    if (patch.teacherId !== undefined) assertTeacher(patch.teacherId);

    const updated = daoUpdateCourse(id, patch);
    if (!updated) throw new NotFoundError("Course not found", {id});
    return updated;
}

export function deleteCourseSvc(id) {
    const ok = daoDeleteCourse(id);
    if (!ok) throw new NotFoundError("Course not found", {id});
    return {deleted: true};
}

export function listCoursesSvc(opts = {}) {
    if (opts.teacherId) assertTeacher(opts.teacherId);
    const limit = Number(opts.limit ?? 50);
    const offset = Number(opts.offset ?? 0);
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
        throw new ValidationError("Invalid limit (1..200)", {field: "limit"});
    }
    if (!Number.isFinite(offset) || offset < 0) {
        throw new ValidationError("Invalid offset (>=0)", {field: "offset"});
    }
    return daoListCourse({limit, offset, teacherId: opts.teacherId});
}