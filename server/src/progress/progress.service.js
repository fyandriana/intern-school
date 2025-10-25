import { ValidationError, NotFoundError } from "../middleware/errors.js";
import {
  enrollStudent,
  getProgressByStudentAndCourse,
  getStudentCourses,
  updateProgressByStudentAndCourse,
  getAllCourses,
  updateStatusInProgress,
} from "./progress.dao.js";
import { getCourseById } from "../courses/courses.dao.js"; // adjust path if different

const VALID_STATUS = new Set(["enrolled", "in_progress", "completed"]);

function validateStatusTransition(prev, next) {
  if (!next || prev === next) return true;
  if (prev === "enrolled" && (next === "in_progress" || next === "completed")) return true;
  if (prev === "in_progress" && next === "completed") return true;
  return false;
}

export function enrollSvc({ studentId, courseId }) {
  if (!Number.isInteger(studentId) || !Number.isInteger(courseId)) {
    throw new ValidationError("Invalid studentId or courseId");
  }
  const course = getCourseById(courseId);
  if (!course) throw new NotFoundError("Course not found", { courseId });

  // Trigger enforces Student role; UNIQUE makes it idempotent
  return enrollStudent({ studentId, courseId });
}

export function getEnrollmentSvc({ studentId, courseId, limit = 20, offset = 0 }) {
  const row = getProgressByStudentAndCourse(studentId, courseId, limit, offset);
  if (!row) throw new NotFoundError("Enrollment not found", { studentId, courseId });
  return row;
}

export function listMyCoursesSvc({ studentId, limit = 20, offset = 0 }) {
  return getStudentCourses({ studentId, limit, offset });
}

export function listAllCoursesSvc({ studentId, limit = 20, offset = 0 }) {
  return getAllCourses({ studentId, limit, offset });
}

export function updateEnrollmentSvc({ studentId, courseId, status, score }) {
  if (status != null && !VALID_STATUS.has(status)) {
    throw new ValidationError("Invalid status");
  }
  if (score != null) {
    const n = Number(score);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      throw new ValidationError("Score must be between 0 and 100");
    }
    score = n;
  }

  const current = getProgressByStudentAndCourse(studentId, courseId);
  if (!current) throw new NotFoundError("Enrollment not found", { studentId, courseId });

  if (status && !validateStatusTransition(current.status, status)) {
    throw new ValidationError(`Illegal status transition: ${current.status} → ${status}`);
  }

  const updated = updateProgressByStudentAndCourse({ studentId, courseId, status, score });
  if (!updated) throw new NotFoundError("Enrollment not found", { studentId, courseId });
  return updated;
}

export function updateStatusInProgressSvc({ studentId, courseId }) {
  const updated = updateStatusInProgress({ studentId, courseId });
  if (!updated) throw new NotFoundError("Enrollment not found", { studentId, courseId });
  return updated;
}
