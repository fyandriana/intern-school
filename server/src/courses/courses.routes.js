// server/src/users/courses.routes.js
import { Router } from "express";
import {
    createCourseHandler,
    listCoursesHandler,
    getCourseHandler,
    updateCourseHandler,
    deleteCourseHandler,
} from "./courses.controller.js";

const r = Router();

// CRUD
r.post("/", createCourseHandler);                 // POST /api/courses
r.get("/", listCoursesHandler);                   // GET  /api/courses?role=&limit=&offset=
//r.get("/:id(\\d+)", getCoursesHandler);            // GET  /api/courses/123

r.get("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return getCourseHandler(req, res, next);
});
r.patch("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return updateCourseHandler(req, res, next);
});
// r.patch("/:id(\\d+)", updateCourseHandler);       // PATCH /api/courses/123

r.delete("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return deleteCourseHandler(req, res, next);
});

export default r;
