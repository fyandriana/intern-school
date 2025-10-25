import {
  createQuizSvc,
  getQuizByIdSvc,
  listQuizzesSvc,
  updateQuizSvc,
  deleteQuizSvc,
  listQuizzesForCourseSvc,
  submitQuizSvc,
} from "./quizzes.service.js";

export function createQuizHandler(req, res, next) {
  try {
    const quiz = createQuizSvc(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

export function listQuizzesHandler(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const items = listQuizzesSvc({ limit, offset });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export function listCourseQuizzesHandler(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const data = listQuizzesForCourseSvc(req.params.id, { limit, offset });

    res.json(data);
  } catch (e) {
    next(e);
  }
}

export function getQuizHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const quiz = getQuizByIdSvc(id);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

export function updateQuizHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = updateQuizSvc(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export function deleteQuizHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = deleteQuizSvc(id); // { deleted: true }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function submitQuizHandler(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const { answers } = req.body; // [{questionId, answerIndex}]
    const result = submitQuizSvc({ courseId, student: req.user, answers });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
