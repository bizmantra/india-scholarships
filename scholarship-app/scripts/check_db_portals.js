const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log("=== Checking Database for Portals & States ===");

// 1. Check for Jnanabhumi
const jnanabhumi = db.prepare("SELECT id, title, slug, state, provider FROM scholarships WHERE title LIKE '%jnanabhumi%' OR slug LIKE '%jnanabhumi%' OR provider LIKE '%jnanabhumi%'").all();
console.log(`\nJnanabhumi matches (${jnanabhumi.length}):`);
jnanabhumi.forEach(r => console.log(`- ID: ${r.id} | Title: ${r.title} | State: ${r.state}`));

// 2. Check for Digital Gujarat
const gujarat = db.prepare("SELECT id, title, slug, state FROM scholarships WHERE title LIKE '%gujarat%' OR slug LIKE '%gujarat%'").all();
console.log(`\nGujarat matches (${gujarat.length}):`);
gujarat.slice(0, 10).forEach(r => console.log(`- ID: ${r.id} | Title: ${r.title} | State: ${r.state}`));

// 3. Check for UP Scholarship
const up = db.prepare("SELECT id, title, slug, state FROM scholarships WHERE title LIKE '%UP %' OR slug LIKE '%up-%' OR state = 'Uttar Pradesh'").all();
console.log(`\nUttar Pradesh matches (${up.length}):`);
up.slice(0, 10).forEach(r => console.log(`- ID: ${r.id} | Title: ${r.title} | State: ${r.state}`));

// 4. Check for SSP
const ssp = db.prepare("SELECT id, title, slug, state FROM scholarships WHERE title LIKE '%SSP%' OR slug LIKE '%ssp%'").all();
console.log(`\nSSP matches (${ssp.length}):`);
ssp.forEach(r => console.log(`- ID: ${r.id} | Title: ${r.title} | State: ${r.state}`));

// 5. Check for NSP
const nsp = db.prepare("SELECT id, title, slug, state FROM scholarships WHERE title LIKE '%NSP%' OR slug LIKE '%nsp%'").all();
console.log(`\nNSP matches (${nsp.length}):`);
nsp.slice(0, 10).forEach(r => console.log(`- ID: ${r.id} | Title: ${r.title} | State: ${r.state}`));

db.close();
