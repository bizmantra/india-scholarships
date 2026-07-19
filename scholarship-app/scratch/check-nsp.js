const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const nspRows = db.prepare("SELECT id, title, slug, deadline, verified_status, verification_year, status FROM scholarships WHERE title LIKE '%NSP%' OR keywords LIKE '%NSP%' OR official_source LIKE '%scholarships.gov.in%'").all();

console.log(`Found ${nspRows.length} NSP-related scholarships:`);
nspRows.slice(0, 40).forEach(r => {
  console.log(`- ${r.title} (ID: ${r.id}), deadline: ${r.deadline}, verified: ${r.verified_status} (${r.verification_year})`);
});

db.close();
