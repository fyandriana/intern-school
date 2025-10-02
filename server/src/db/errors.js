// server/src/db/sqlite-errors.js
import {
    UniqueViolationError,
    ForeignKeyError,
    DbConflictError,
} from "../errors.js";

/** Normalize better-sqlite3 errors into app errors. */
export function mapSqliteError(err) {
    if (!err) return err;
    const code = err.code || "";          // e.g., 'SQLITE_CONSTRAINT_UNIQUE'
    const msg = err.message || "";

    if (code.startsWith("SQLITE_CONSTRAINT")) {
        if (code === "SQLITE_CONSTRAINT_UNIQUE" || /UNIQUE constraint failed/i.test(msg)) {
            // Try to extract column info from message: 'UNIQUE constraint failed: users.email'
            const m = msg.match(/UNIQUE constraint failed:\s*(\w+)\.(\w+)/i);
            const meta = m ? {table: m[1], field: m[2]} : undefined;
            return new UniqueViolationError("Duplicate value for unique field", meta);
        }
        if (code === "SQLITE_CONSTRAINT_FOREIGNKEY" || /FOREIGN KEY constraint failed/i.test(msg)) {
            return new ForeignKeyError("Foreign key constraint failed");
        }
        if (code === "SQLITE_CONSTRAINT_CHECK" || /CHECK constraint failed/i.test(msg)) {
            return new DbConflictError("Check constraint failed", {message: msg});
        }
        return new DbConflictError("Database constraint failed", {code, message: msg});
    }

    // Leave all else to the caller (usually becomes a 500)
    return err;
}
