// server/src/users/users.routes.js
import { Router } from "express";
import {
    createUserHandler,
    listUsersHandler,
    getUserHandler,
    updateUserHandler,
    deleteUserHandler,
} from "./users.controller.js";

const r = Router();

// CRUD
r.post("/", createUserHandler);                 // POST /api/users
r.get("/", listUsersHandler);                   // GET  /api/users?role=&limit=&offset=
//r.get("/:id(\\d+)", getUserHandler);            // GET  /api/users/123

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
    return updateUserHandler(req, res, next);
});
// r.patch("/:id(\\d+)", updateUserHandler);       // PATCH /api/users/123

r.delete("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid id" });
    }
    return deleteUserHandler(req, res, next);
});

export default r;
