import { getDb } from "../db/connection.js";
import { mapSqliteError } from "../middleware/errors.js";

const COLUMNS = "id, name, email, passwordHash, role, created_at";

// Lazily prepared statements (created once per process)
let stmts;

function ensureStmts() {
  if (stmts) return stmts;
  const db = getDb();
  stmts = {
    insertUser: db.prepare(`INSERT INTO users (name, email, passwordHash, role)
                                VALUES (@name, @email, @passwordHash, @role)`),
    selectById: db.prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`),
    getUserNameById: db.prepare(`SELECT name FROM users WHERE id = ?`),
    selectByEmail: db.prepare(`SELECT ${COLUMNS} FROM users WHERE email = ?`),
    listBase: db.prepare(`SELECT ${COLUMNS} FROM users ORDER BY id DESC LIMIT ? OFFSET ?`),
    listByRole: db.prepare(
      `SELECT ${COLUMNS} FROM users WHERE role = ? ORDER BY id DESC LIMIT ? OFFSET ?`
    ),
    updateUser: db.prepare(`
            UPDATE users
            SET name         = COALESCE(@name, name),
                email        = COALESCE(@email, email),
                passwordHash = COALESCE(@passwordHash, passwordHash),
                role         = COALESCE(@role, role)
            WHERE id = @id
        `),
    deleteUser: db.prepare(`DELETE FROM users WHERE id = ?`),
  };
  return stmts;
}

export function createUser({ name, email, passwordHash, role }) {
  const s = ensureStmts();
  try {
    const info = s.insertUser.run({ name, email, passwordHash, role });
    return getUserById(info.lastInsertRowid);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function getUserById(id) {
  const s = ensureStmts();
  return s.selectById.get(id);
}

export function getUserNameById(id) {
  const s = ensureStmts();
  return s.getUserNameById.get(id);
}

export function getUserByEmail(email) {
  const s = ensureStmts();
  return s.selectByEmail.get(email);
}

export function listUsers({ limit = 50, offset = 0, role } = {}) {
  const s = ensureStmts();
  if (role) return s.listByRole.all(role, limit, offset);
  return s.listBase.all(limit, offset);
}

export function updateUser(id, patch) {
  const s = ensureStmts();
  try {
    const info = s.updateUser.run({
      id,
      name: patch.name ?? null,
      email: patch.email ?? null,
      passwordHash: patch.passwordHash ?? null,
      role: patch.role ?? null,
    });
    if (info.changes === 0) return null;
    return getUserById(id);
  } catch (err) {
    throw mapSqliteError(err);
  }
}

export function deleteUser(id) {
  const s = ensureStmts();
  try {
    const info = s.deleteUser.run(id);
    return info.changes > 0;
  } catch (err) {
    throw mapSqliteError(err);
  }
}
