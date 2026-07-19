const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const slugs = [
  'pm-yashasvi-scholarship',
  'sitaram-jindal-foundation-scholarship',
  'tata-capital-pankh-scholarship',
  'mukhyamantri-kanya-utthan-yojana-graduation',
  'nabanna-scholarship-west-bengal',
  'hdfc-bank-parivartan-ecss-scholarship',
  'lic-golden-jubilee-scholarship',
  'mukhyamantri-medhavi-vidyarthi-yojana-mmvy'
];

console.log("=== TOP TRAFFIC SCHERLS IN DATABASE ===");
slugs.forEach(slug => {
  const row = db.prepare("SELECT id, title, slug, deadline, verified_status, verification_year, status FROM scholarships WHERE slug = ?").get(slug);
  if (row) {
    console.log(JSON.stringify(row, null, 2));
  } else {
    // try to search by partial slug
    const partial = db.prepare("SELECT id, title, slug, deadline, verified_status, verification_year, status FROM scholarships WHERE slug LIKE ?").get(`%${slug}%`);
    if (partial) {
      console.log(`Partial match for ${slug}:`);
      console.log(JSON.stringify(partial, null, 2));
    } else {
      console.log(`No match for slug: ${slug}`);
    }
  }
});

db.close();
