// scripts/inspect-db-schema.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log('--- Inspecting SQLite Database Columns ---');
try {
  const row = db.prepare('SELECT title, level, state, caste, course_stream FROM scholarships LIMIT 10').all();
  console.log(JSON.stringify(row, null, 2));
} catch (e) {
  console.error('Error:', e.message);
}
db.close();
