// server/src/users/users.routes.js
import { Router } from "express";
import {
    createQuizzHandler,
    listQuizzesHandler,
    getQuizzHandler,
    updateQuizzHandler,
    deleteQuizzHandler,
} from "./quizzes.controller.js";

const r = Router();

// CRUD
r.post("/", createQuizzHandler);                 // POST /api/quizzes
r.get("/", listQuizzesHandler);                   // GET  /api/quizzes?role=&limit=&offset=
//r.get("/:id(\\d+)", getQuizzHandler);            // GET  /api/quizzes/123

r.get("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return getUserHandler(req, res, next);
});
r.patch("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return updateQuizzHandler(req, res, next);
});
// r.patch("/:id(\\d+)", updateQuizzHandler);       // PATCH /api/quizzes/123

r.delete("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return deleteQuizzHandler(req, res, next);
});

export default r;
