const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

console.log("Analyzing unique tags in the scholarships database...");

const rows = db.prepare("SELECT tags FROM scholarships").all();
const tagsSet = new Set();

rows.forEach(row => {
    if (row.tags) {
        try {
            const tagsList = JSON.parse(row.tags);
            if (Array.isArray(tagsList)) {
                tagsList.forEach(t => tagsSet.add(t));
            } else {
                tagsSet.add(row.tags);
            }
        } catch (e) {
            tagsSet.add(row.tags);
        }
    }
});

console.log("Unique Tags found in database:");
console.log(Array.from(tagsSet).sort());
db.close();
