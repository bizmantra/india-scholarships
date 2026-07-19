const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const keywords = ['tata', 'birla', 'faea', 'reliance'];

console.log("Searching for scholarships matching keywords in DB:");
for (const kw of keywords) {
  const rows = db.prepare("SELECT id, title, verified_status, last_verified, status FROM scholarships WHERE title LIKE ?").all(`%${kw}%`);
  console.log(`\nKeyword: ${kw}`);
  for (const r of rows) {
    console.log(`  - ${r.id}: "${r.title}" (verified: ${r.verified_status}, last_verified: ${r.last_verified}, status: ${r.status})`);
  }
}
db.close();
