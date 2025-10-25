import { Router } from "express";
import {
  createUserHandler,
  listUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserNameHandler,
} from "./users.controller.js";
import { validateIntParam } from "../middleware/validator.js";

const r = Router();

// CRUD
r.post("/", createUserHandler); // POST /api/users
r.get("/", listUsersHandler); // GET  /api/users?role=&limit=&offset=
//r.get("/:id(\\d+)", getUserHandler);            // GET  /api/users/123
r.get("/:id", validateIntParam("id"), (req, res, next) => {
  // req.id is the validated integer
  return getUserHandler(req, res, next);
});
r.get("/:id/name", validateIntParam("id"), (req, res, next) => {
  // req.id is the validated integer
  return getUserNameHandler(req, res, next);
});

r.patch("/:id", validateIntParam("id"), (req, res, next) => {
  return updateUserHandler(req, res, next);
});

// r.patch("/:id(\\d+)", updateUserHandler);       // PATCH /api/users/123

r.delete("/:id", validateIntParam("id"), (req, res, next) => {
  return deleteUserHandler(req, res, next);
});

export default r;
