import { Router } from "express";
import {
  createQuizHandler,
  listQuizzesHandler,
  getQuizHandler,
  updateQuizHandler,
  deleteQuizHandler,
} from "./quizzes.controller.js";
import { validateIntParam } from "../middleware/validator.js";
import { authRequired } from "../middleware/authRequired.js";
import { resolveTeacher } from "../middleware/resolve.js";

const r = Router({ mergeParams: true });

// CRUD
r.post("/", createQuizHandler); // POST /api/quizzes
r.get("/", listQuizzesHandler); // GET  /api/quizzes?role=&limit=&offset=

r.get("/:id", validateIntParam("id"), (req, res, next) => {
  return getQuizHandler(req, res, next);
});

r.patch("/:id", authRequired, resolveTeacher, validateIntParam("id"), (req, res, next) => {
  return updateQuizHandler(req, res, next);
});

r.put("/:id", authRequired, resolveTeacher, validateIntParam("id"), (req, res, next) => {
  return updateQuizHandler(req, res, next);
});

r.delete("/:id", validateIntParam("id"), (req, res, next) => {
  return deleteQuizHandler(req, res, next);
});
export default r;
