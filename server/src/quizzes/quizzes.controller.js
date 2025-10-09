import {
    createQuizzSvc,
    getQuizzByIdSvc,
    listQuizzesSvc,
    updateQuizzSvc,
    deleteQuizzSvc
} from "../quizzes/quizzes.service.js";

export function createQuizzHandler(req, res, next) {
    try {
        const quizz = createQuizzSvc(req.body);
        res.status(201).json(quizz);
    } catch (err) {
        next(err);
    }
}

export function listQuizzesHandler(req, res, next) {
    try {
        const {limit, offset, role} = req.query;
        const items = listQuizzesSvc({limit, offset});
        res.json({items});
    } catch (err) {
        next(err);
    }
}

export function getQuizzHandler(req, res, next) {
    try {

        const id = Number(req.params.id);
        const quizz = getQuizzByIdSvc(id);
        res.json(quizz);
    } catch (err) {
        next(err);
    }
}


export function updateQuizzHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const updated = updateQuizzSvc(id, req.body);
        res.json(updated);
    } catch (err) { next(err); }
}

export function deleteQuizzHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = deleteQuizzSvc(id); // { deleted: true }
        res.json(result);
    } catch (err) { next(err); }
}
