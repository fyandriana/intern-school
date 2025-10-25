import { listTeacherStudentsSvc, getTeacherStudentDetailSvc } from "./teacher.students.service.js";

export async function listTeacherStudentsHandler(req, res, next) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const data = await listTeacherStudentsSvc({
      viewer: req.user,
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getTeacherStudentDetailHandler(req, res, next) {
  try {
    const studentId = Number(req.params.studentId);
    const data = await getTeacherStudentDetailSvc({ viewer: req.user, studentId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
