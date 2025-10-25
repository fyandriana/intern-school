import {
  enrollSvc,
  getEnrollmentSvc,
  listMyCoursesSvc,
  updateEnrollmentSvc,
  listAllCoursesSvc,
} from "./progress.service.js";

export async function enrollHandler(req, res, next) {
  try {
    const studentId = req.user.id; // self
    const { courseId } = req.body || {};
    const data = enrollSvc({ studentId, courseId: Number(courseId) });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getEnrollmentHandler(req, res, next) {
  try {
    const studentId = req.user.id;
    const courseId = Number(req.params.courseId);
    const data = getEnrollmentSvc({ studentId, courseId });
    res.json({ ok: true, data });
  } catch (err) {
    if (err.code === "NOT_FOUND" || err.name === "NotFoundError") {
      return res.status(404).json({ code: "NOT_FOUND", message: "Not Enrolled" });
    }
    return next(err);
  }
}

export async function listMyCoursesHandler(req, res, next) {
  try {
    const studentId = req.user.id;
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const data = listMyCoursesSvc({ studentId, limit, offset });
    res.json({ ok: true, items: data, total: data.length, limit, offset });
  } catch (e) {
    next(e);
  }
}

export async function listAllCoursesHandler(req, res, next) {
  try {
    const studentId = req.user.id;
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const data = listAllCoursesSvc({ studentId, limit, offset });
    res.json({ ok: true, items: data, total: data.length, limit, offset });
  } catch (e) {
    next(e);
  }
}

export async function updateEnrollmentHandler(req, res, next) {
  try {
    const studentId = req.user.id;
    const courseId = Number(req.params.courseId);
    const { status = null, score = null } = req.body || {};
    const data = updateEnrollmentSvc({ studentId, courseId, status, score });
    res.json({ ok: true, data });
  } catch (err) {
    // If service threw NotFoundError, normalize to 200 {enrolled:false}
    if (err.code === "NOT_FOUND" || err.name === "NotFoundError") {
      return res.json({ enrolled: false, enrollment: null });
    }
    return next(err);
  }
}
