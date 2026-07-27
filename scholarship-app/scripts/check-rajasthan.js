const Database = require('better-sqlite3');
const db = new Database('data/scholarships.db');
const rows = db.prepare("SELECT slug, title FROM scholarships WHERE state LIKE '%rajasthan%' OR title LIKE '%rajasthan%'").all();
console.log(rows);
db.close();
