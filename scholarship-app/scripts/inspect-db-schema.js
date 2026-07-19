const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

console.log("--- TABLE SCHEMAS ---");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const table of tables) {
    console.log(`\nTable: ${table.name}`);
    const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
    for (const col of info) {
        console.log(`  - ${col.name} (${col.type})`);
    }
}

console.log("\n--- RECORD COUNT ---");
for (const table of tables) {
    const count = db.prepare(`SELECT count(*) as count FROM ${table.name}`).get();
    console.log(`Table ${table.name}: ${count.count} rows`);
}
