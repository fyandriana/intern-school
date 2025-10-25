import {
  getMeSvc,
  patchMyNameSvc,
  changeMyPasswordSvc,
  myCoursesSvc,
  mySummarySvc,
} from "./me.service.js";

export async function getMeHandler(req, res, next) {
  try {
    res.json(getMeSvc(req.user.id));
  } catch (e) {
    next(e);
  }
}

export async function patchMeHandler(req, res, next) {
  try {
    const { name } = req.body ?? {};
    res.json(patchMyNameSvc(req.user.id, name));
  } catch (e) {
    next(e);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    res.json(await changeMyPasswordSvc(req.user.id, { currentPassword, newPassword }));
  } catch (e) {
    next(e);
  }
}

export async function myCoursesHandler(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "12", 10), 50);
    const offset = parseInt(req.query.offset ?? "0", 10);
    res.json(myCoursesSvc(req.user, { limit, offset }));
  } catch (e) {
    next(e);
  }
}

export async function mySummaryHandler(req, res, next) {
  try {
    res.json(mySummarySvc(req.user));
  } catch (e) {
    next(e);
  }
}
