// scripts/check-gap.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

try {
  const row = db.prepare('SELECT priority_score, always_open FROM scholarships WHERE priority_score IS NOT NULL LIMIT 5').all();
  console.log('Priority scores:', row);
} catch (e) {
  console.error('Error:', e.message);
}
db.close();
