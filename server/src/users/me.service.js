import { getDb } from "../db/connection.js";
import {
  getMe,
  updateMyName,
  getPasswordHash,
  setPasswordHash,
  listOwnedCourses,
  listEnrolledCoursesViaProgress,
  teacherSummary,
  studentSummaryViaEnrollments,
  studentSummaryViaProgress,
} from "./me.dao.js";
import { verifyPassword, hashPassword } from "../auth/password.js";

function hasTable(name) {
  const db = getDb();
  return !!db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`).get(name);
}

export function getMeSvc(userId) {
  const me = getMe(userId);
  if (!me) throw Object.assign(new Error("User not found"), { status: 404 });
  return me;
}

export function patchMyNameSvc(userId, name) {
  if (!name || name.trim().length < 2) {
    throw Object.assign(new Error("Name must be at least 2 characters"), {
      status: 400,
      field: "name",
    });
  }
  return updateMyName(userId, name.trim());
}

export async function changeMyPasswordSvc(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error("Both currentPassword and newPassword are required"), {
      status: 400,
    });
  }
  if (newPassword.length < 6) {
    throw Object.assign(new Error("New password must be at least 6 characters"), { status: 400 });
  }
  const stored = getPasswordHash(userId);
  if (!stored) throw Object.assign(new Error("User not found"), { status: 404 });

  const ok = await verifyPassword(currentPassword, stored);
  if (!ok) throw Object.assign(new Error("Current password is incorrect"), { status: 400 });

  const newHash = await hashPassword(newPassword);
  setPasswordHash(userId, newHash);
  return { ok: true };
}

export function myCoursesSvc(user, { limit, offset }) {
  if (user.role === "Teacher") return listOwnedCourses(user.id, { limit, offset });
  return listEnrolledCoursesViaProgress(user.id, { limit, offset });
}

export function mySummarySvc(user) {
  if (user.role === "Teacher") return teacherSummary(user.id);
  if (hasTable("enrollments")) return studentSummaryViaEnrollments(user.id);
  return studentSummaryViaProgress(user.id);
}
