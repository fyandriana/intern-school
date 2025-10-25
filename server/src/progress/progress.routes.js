import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { validateIntParam } from "../middleware/validator.js";
import { requireRole } from "../middleware/resolve.js";
import {
  enrollHandler,
  getEnrollmentHandler,
  listMyCoursesHandler,
  updateEnrollmentHandler,
  listAllCoursesHandler,
} from "./progress.controller.js";

const r = Router();

// Student-only
r.use(authRequired, requireRole("Student"));
r.post("/enroll", enrollHandler); // body: { courseId }
r.get("/enrollment/:courseId", validateIntParam("courseId"), getEnrollmentHandler);
r.patch("/enrollment/:courseId", validateIntParam("courseId"), updateEnrollmentHandler);
r.get("/my-courses", listMyCoursesHandler); // supports ?limit=&offset=
r.get("/courses", listAllCoursesHandler); // supports ?limit=&offset=

export default r;
