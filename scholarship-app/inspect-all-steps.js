const db = require('better-sqlite3')('data/scholarships.db');
const scholarships = db.prepare('SELECT slug, title, step_guide, selection, total_awards FROM scholarships').all();

console.log(`Checking ${scholarships.length} scholarships...`);

for (const s of scholarships) {
    console.log(`\n========================================`);
    console.log(`Slug: ${s.slug}`);
    console.log(`Title: ${s.title}`);
    console.log(`Awards: ${s.total_awards}`);
    console.log(`Step Guide:\n  ${s.step_guide}`);
    console.log(`Selection:\n  ${s.selection}`);
}
