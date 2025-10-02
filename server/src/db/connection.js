// server/src/db/connection.js
import Database from "better-sqlite3";

let db;

/** Return a shared better-sqlite3 Database instance. */
export function getDb() {
  if (!db) {
    const DB_PATH = process.env.DB_PATH || "db/school.db";
    // Optional: pass { verbose: console.log } for SQL logging
    db = new Database(DB_PATH, { fileMustExist: false });

    // Critical PRAGMAs
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
  }
  return db;
}
