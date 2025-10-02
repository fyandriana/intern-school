// server/src/users/users.controller.js
import {
    createUserSvc,
    getUserByIdSvc,
    listUsersSvc,
    updateUserSvc,
    deleteUserSvc,
} from "./users.service.js";

export function createUserHandler(req, res, next) {
    try {
        const user = createUserSvc(req.body);
        res.status(201).json(user);
    } catch (err) { next(err); }
}

export function listUsersHandler(req, res, next) {
    try {
        const { limit, offset, role } = req.query;
        const items = listUsersSvc({ limit, offset, role });
        res.json({ items });
    } catch (err) { next(err); }
}

export function getUserHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const user = getUserByIdSvc(id);
        res.json(user);
    } catch (err) { next(err); }
}

export function updateUserHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const updated = updateUserSvc(id, req.body);
        res.json(updated);
    } catch (err) { next(err); }
}

export function deleteUserHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = deleteUserSvc(id); // { deleted: true }
        res.json(result);
    } catch (err) { next(err); }
}
