import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import {
  listTeacherStudentsHandler,
  getTeacherStudentDetailHandler,
} from "./teacher.students.controller.js";

const r = Router();
r.use(authRequired);
r.get("/students", listTeacherStudentsHandler);
r.get("/students/:studentId", getTeacherStudentDetailHandler);
export default r;
