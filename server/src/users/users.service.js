import {
    createUser,
    getUserById,
    getUserByEmail,
    listUsers as daoListUsers,
    updateUser as daoUpdateUser,
    deleteUser as daoDeleteUser,
} from "./users.dao.js";
import { NotFoundError, ValidationError, UniqueViolationError } from "../errors.js";

function assertNonEmptyString(value, field, { min = 1 } = {}) {
    if (typeof value !== "string" || value.trim().length < min) {
        throw new ValidationError(`Invalid ${field}`, { field });
    }
}
function assertRole(value) {
    if (value !== "Teacher" && value !== "Student") {
        throw new ValidationError("Invalid role (must be 'Teacher' or 'Student')", { field: "role" });
    }
}

export function createUserSvc({ name, email, passwordHash, role }) {
    assertNonEmptyString(name, "name");
    assertNonEmptyString(email, "email");
    assertNonEmptyString(passwordHash, "password");
    assertRole(role);

    // Optional pre-check for cleaner 409
    const exists = getUserByEmail(email);
    if (exists) throw new UniqueViolationError("Email already exists", { field: "email" });

    return createUser({ name, email, passwordHash, role });
}

export function getUserByIdSvc(id) {
    const user = getUserById(id);
    if (!user) throw new NotFoundError("User not found", { id });
    return user;
}


export function getUserByEmailSvc(email) {
    const user = getUserByEmail(email);
    if (!user) throw new NotFoundError("User not found", { email });
    return user;
}

export function listUsersSvc(opts = {}) {
    if (opts.role) assertRole(opts.role);
    const limit = Number(opts.limit ?? 50);
    const offset = Number(opts.offset ?? 0);
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
        throw new ValidationError("Invalid limit (1..200)", { field: "limit" });
    }
    if (!Number.isFinite(offset) || offset < 0) {
        throw new ValidationError("Invalid offset (>=0)", { field: "offset" });
    }
    return daoListUsers({ limit, offset, role: opts.role });
}

export function updateUserSvc(id, patch) {
    if (patch.name !== undefined) assertNonEmptyString(patch.name, "name");
    if (patch.email !== undefined) assertNonEmptyString(patch.email, "email");
    if (patch.passwordHash !== undefined) assertNonEmptyString(patch.passwordHash, "password");
    if (patch.role !== undefined) assertRole(patch.role);

    const updated = daoUpdateUser(id, patch);
    if (!updated) throw new NotFoundError("User not found", { id });
    return updated;
}

export function deleteUserSvc(id) {
    const ok = daoDeleteUser(id);
    if (!ok) throw new NotFoundError("User not found", { id });
    return { deleted: true };
}
