const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'scholarships.db');
const db = new Database(dbPath);

const rows = db.prepare('SELECT id, slug, title, provider_type, state FROM scholarships').all();
console.log(`Total DB Scholarships: ${rows.length}\n`);

const searchTerms = [
  'oasis', 'kanyashree', 'pragati', 'suvarna', 'egrantz', 'e-grantz', 'reliance', 
  'nsp', 'up scholarship', 'svmcm', 'vivekananda', 'freeship', 'sjms', 'postmatric', 
  'pms', 'ssp', 'karnataka', 'bihar', 'mahadbt', 'epass', 'jagananna', 'medhabruti',
  'kalia', 'yamini', 'yasasvi', 'nest', 'keep india', 'minority', 'taas', 'medhavi',
  'pudhumai'
];

searchTerms.forEach(term => {
  const matches = rows.filter(r => 
    r.slug.toLowerCase().includes(term.toLowerCase()) || 
    r.title.toLowerCase().includes(term.toLowerCase())
  );
  console.log(`=== Matches for term: "${term}" (${matches.length} found) ===`);
  matches.forEach(m => console.log(`  - [${m.slug}] -> ${m.title}`));
  console.log('');
});

db.close();
