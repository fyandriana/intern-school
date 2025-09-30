// db/init.mjs
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, 'src/db');
const DB_PATH = path.join(DB_DIR, 'school.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

// Ensure db folder exists
fs.mkdirSync(DB_DIR, { recursive: true });

// Read schema.sql (fail fast if missing)
if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`Schema not found at: ${SCHEMA_PATH}`);
  process.exit(1);
}
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Open (auto-creates file if not present)
const db = new Database(DB_PATH);

// Run schema (idempotent)
try {
  db.exec(schema);
  console.log('✔ DB initialized at:', DB_PATH);
} catch (e) {
  console.error('✖ Failed to initialize DB:', e.message);
  process.exit(1);
}
