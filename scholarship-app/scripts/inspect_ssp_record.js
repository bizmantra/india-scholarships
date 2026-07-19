const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log("=== Inspecting SSP Karnataka Record ===");
const row = db.prepare("SELECT * FROM scholarships WHERE id = 'ssp-pre-matric-post-matric-scholarship-karnataka'").get();
console.log(JSON.stringify(row, null, 2));

db.close();
