import {
  createCourseSvc,
  getCourseByIdSvc,
  listCoursesSvc,
  updateCourseSvc,
  deleteCourseSvc,
  getCoursesCountSvc,
} from "./courses.service.js";
import { updateStatusInProgressSvc } from "../progress/progress.service.js";

export function createCourseHandler(req, res, next) {
  try {
    const course = createCourseSvc(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export function listCoursesHandler(req, res, next) {
  try {
    // const {limit, offset, role} = req.query;
    const { limit = 20, offset = 0 } = req.query;

    let teacherId;
    if (req.query.mine === "true") {
      // must be authenticated and a Teacher
      if (!req.user) {
        return res.status(401).json({ error: "Missing or invalid token" });
      }
      if (req.user.role !== "Teacher") {
        return res.status(403).json({ error: "Only teachers can use mine=true" });
      }
      teacherId = Number(req.user.id);
    } else if (req.query.teacherId != null) {
      // optional: allow explicit teacherId for admin use-cases
      teacherId = Number(req.query.teacherId);
    }

    const items = listCoursesSvc({
      teacherId: teacherId != null ? Number(teacherId) : undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getCourseHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const data = await getCourseByIdSvc(id);

    if (!data) return res.status(404).json({ error: "Course not found" });
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export function updateCourseHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = updateCourseSvc(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export function deleteCourseHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = deleteCourseSvc(id); // { deleted: true }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCoursesCountHandler(req, res, next) {
  try {
    const { teacherId, mine } = req.query;

    const resolvedTeacherId =
      String(mine) === "true" && req.user?.role === "Teacher"
        ? req.user.id
        : teacherId != null
          ? Number(teacherId)
          : undefined;

    const data = getCoursesCountSvc({ teacherId: resolvedTeacherId });
    res.json(data); // { total }
  } catch (err) {
    next(err);
  }
}

export async function startCourseHandler(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const studentId = req.user.id;
    const progress = await updateStatusInProgressSvc({ courseId, studentId });
    res.json(progress);
  } catch (e) {
    next(e);
  }
}
