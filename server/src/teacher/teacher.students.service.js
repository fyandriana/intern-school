import { ForbiddenError, NotFoundError } from "../middleware/errors.js";
import { listTeacherStudents, getTeacherStudentDetail } from "./teacher.students.dao.js";

export function listTeacherStudentsSvc({ viewer, limit, offset }) {
  if (!viewer || viewer.role !== "Teacher")
    throw new ForbiddenError("Only teachers can list their students");
  return listTeacherStudents(viewer.id, { limit, offset });
}

export function getTeacherStudentDetailSvc({ viewer, studentId }) {
  if (!viewer || viewer.role !== "Teacher")
    throw new ForbiddenError("Only teachers can view student details");
  const data = getTeacherStudentDetail(viewer.id, studentId);
  if (!data) throw new NotFoundError("Student not found or not linked to your courses");
  return data;
}
