import {
    createCourseSvc,
    getCourseByIdSvc,
    listCoursesSvc,
    updateCourseSvc,
    deleteCourseSvc,
} from "./courses.service.js";


export function createCourseHandler(req, res, next) {
    try {
        const course = createCourseSvc(req.body);
        res.status(201).json(course);
    } catch (err) { next(err); }
}

export function listCoursesHandler(req, res, next) {
    try {
        const { limit, offset, role } = req.query;
        const items = listCoursesSvc({ limit, offset });
        res.json({ items });
    } catch (err) { next(err); }
}

export function getCourseHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const course = getCourseByIdSvc(id);
        res.json(course);
    } catch (err) { next(err); }
}

export function updateCourseHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const updated = updateCourseSvc(id, req.body);
        res.json(updated);
    } catch (err) { next(err); }
}

export function deleteCourseHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = deleteCourseSvc(id); // { deleted: true }
        res.json(result);
    } catch (err) { next(err); }
}
