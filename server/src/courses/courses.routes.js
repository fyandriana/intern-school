import { Router } from "express";
import {
  createCourseHandler,
  listCoursesHandler,
  getCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  getCoursesCountHandler,
  startCourseHandler,
} from "./courses.controller.js";
import { authRequired } from "../middleware/authRequired.js";
import { resolveTeacher } from "../middleware/resolve.js";
import { validateIntParam } from "../middleware/validator.js";
import { listCourseQuizzesHandler, submitQuizHandler } from "../quizzes/quizzes.controller.js";

const r = Router();

// ---------- CREATE
// POST /api/courses
r.post("/", authRequired, createCourseHandler);

// ---------- LIST
// GET /api/courses?limit=&offset=&mine=true
// resolveUserRole: if mine=true and user.role === "Teacher", set req.query.teacherId = req.user.id
r.get("/", authRequired, resolveTeacher, listCoursesHandler);
r.get("/count", authRequired, getCoursesCountHandler);
// ---------- READ ONE
r.get("/:id", authRequired, validateIntParam("id"), (req, res, next) => {
  return getCourseHandler(req, res, next);
});

// ---------- UPDATE
r.put("/:id", authRequired, resolveTeacher, validateIntParam("id"), (req, res, next) => {
  return updateCourseHandler(req, res, next);
});
r.patch("/:id", authRequired, resolveTeacher, validateIntParam("id"), (req, res, next) => {
  return updateCourseHandler(req, res, next);
});

// ---------- DELETE
// DELETE /api/courses/:id
r.delete("/:id", authRequired, resolveTeacher, validateIntParam("id"), (req, res, next) => {
  return deleteCourseHandler(req, res, next);
});

// add requireCourseOwner to add ownership management on quiz
r.get("/:id/quizzes", authRequired, listCourseQuizzesHandler);

// Student submits quiz for a course
r.post("/:id/quizzes/submit", authRequired, validateIntParam("id"), submitQuizHandler);

r.post("/:id/start", authRequired, startCourseHandler);
export default r;
