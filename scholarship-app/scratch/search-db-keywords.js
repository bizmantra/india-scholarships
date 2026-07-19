const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const keywords = ['kalyan', 'odisha', 'ssp', 'gujarat', 'svmcm', 'aikyashree', 'jnanabhumi', 'aditya birla', 'fulbright', 'post matric'];

console.log("=== KEYWORDS SEARCH IN DATABASE ===");
keywords.forEach(kw => {
  const matches = db.prepare("SELECT id, title, slug, deadline, verified_status, verification_year, status FROM scholarships WHERE title LIKE ? OR slug LIKE ? OR keywords LIKE ?").all(`%${kw}%`, `%${kw}%`, `%${kw}%`);
  console.log(`\nKeyword: "${kw}" - found ${matches.length} matches:`);
  matches.slice(0, 5).forEach(r => {
    console.log(`- ${r.title} (slug: ${r.slug}), deadline: ${r.deadline}, verified: ${r.verified_status} (${r.verification_year})`);
  });
});

db.close();
