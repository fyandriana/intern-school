-- Turns on enforcement of FOREIGN KEY constraints.
-- To avoid orphan rows insertion and deletion of a parent row that have children reference

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP) -- UTC, seconds precision
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);