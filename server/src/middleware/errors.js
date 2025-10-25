/* Typed error classes*/
export class AppError extends Error {
  constructor(message, status = 500, code = "APP_ERROR", meta) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.meta = meta;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", meta) {
    super(message, 400, "VALIDATION_ERROR", meta);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", meta) {
    super(message, 404, "NOT_FOUND", meta);
  }
}

export class UniqueViolationError extends AppError {
  constructor(message = "Duplicate value for unique field", meta) {
    super(message, 409, "UNIQUE_VIOLATION", meta);
  }
}

export class ForeignKeyError extends AppError {
  constructor(message = "Foreign key constraint failed", meta) {
    super(message, 409, "FOREIGN_KEY_CONSTRAINT", meta);
  }
}

export class DbConflictError extends AppError {
  constructor(message = "Database constraint failed", meta) {
    super(message, 409, "DB_CONFLICT", meta);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", meta) {
    super(message, 401, "UNAUTHORIZED", meta);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", meta) {
    super(message, 403, "FORBIDDEN", meta);
  }
}

/* better-sqlite3 error mapper */
export function mapSqliteError(err) {
  if (!err) return err;

  const code = err.code || "";
  const msg = err.message || ""; // human-readable message

  // Handle constraint family first
  if (code.startsWith("SQLITE_CONSTRAINT")) {
    // UNIQUE
    if (code === "SQLITE_CONSTRAINT_UNIQUE" || /UNIQUE constraint failed/i.test(msg)) {
      // Try to extract table/field: 'UNIQUE constraint failed: users.email'
      const m = msg.match(/UNIQUE constraint failed:\s*(\w+)\.(\w+)/i);
      const meta = m ? { table: m[1], field: m[2] } : undefined;
      return new UniqueViolationError("Duplicate value for unique field", meta);
    }

    // FOREIGN KEY
    if (code === "SQLITE_CONSTRAINT_FOREIGNKEY" || /FOREIGN KEY constraint failed/i.test(msg)) {
      return new ForeignKeyError("Foreign key constraint failed");
    }

    // CHECK
    if (code === "SQLITE_CONSTRAINT_CHECK" || /CHECK constraint failed/i.test(msg)) {
      return new DbConflictError("Check constraint failed", { message: msg });
    }

    // Other constraints (NOT NULL, etc.)
    return new DbConflictError("Database constraint failed", { code, message: msg });
  }

  // Not a constraint error → let the middleware treat it as 500
  return err;
}

/* Serialization helper */
export function serializeError(err, { includeStack = process.env.NODE_ENV !== "production" } = {}) {
  const status = err?.status ?? 500;
  const body = {
    code: err?.code ?? "INTERNAL_ERROR",
    message: err?.message ?? "Internal Server Error",
  };
  if (err?.meta !== undefined) body.meta = err.meta;
  if (includeStack && err?.stack) body.stack = err.stack;
  return { status, body };
}

/* Express error middleware */
export function errorMiddleware(err, _req, res) {
  // Map raw SQLite errors if a DAO forgot to wrap them
  const mapped = err?.code?.startsWith?.("SQLITE_") ? mapSqliteError(err) : err;
  const { status, body } = serializeError(mapped);
  res.status(status).json(body);
}
