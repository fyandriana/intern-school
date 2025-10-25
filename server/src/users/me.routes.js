import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import {
  getMeHandler,
  patchMeHandler,
  changePasswordHandler,
  myCoursesHandler,
  mySummaryHandler,
} from "./me.controller.js";

const r = Router();
r.use(authRequired);

r.get("/", getMeHandler);
r.patch("/", patchMeHandler); // { name }
r.patch("/password", changePasswordHandler); // { currentPassword, newPassword }
r.get("/courses", myCoursesHandler);
r.get("/summary", mySummaryHandler);

export default r;
