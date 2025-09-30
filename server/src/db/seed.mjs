// db/seed.mjs
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, 'src/db');
const DB_PATH = path.join(DB_DIR, 'feedback.db');
const SEED_PATH = path.join(DB_DIR, 'seed.sql');

// Basic checks
if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at: ${DB_PATH}
Tip: run "npm run db:init" first to create/apply schema.`);
  process.exit(1);
}
if (!fs.existsSync(SEED_PATH)) {
  console.error(`Seed file not found at: ${SEED_PATH}`);
  process.exit(1);
}

const seedSQL = fs.readFileSync(SEED_PATH, 'utf8').trim();
if (!seedSQL) {
  console.error('Seed file is empty. Nothing to do.');
  process.exit(1);
}

// Open DB and run seed script
const db = new Database(DB_PATH);
try {
  db.exec(seedSQL);
  console.log('✔ Seed data inserted from:', SEED_PATH);
} catch (e) {
  console.error('✖ Failed to seed DB:', e.message);
  process.exit(1);
}
