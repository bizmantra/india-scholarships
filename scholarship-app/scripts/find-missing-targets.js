const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'scholarships.db');
const db = new Database(dbPath);

const rows = db.prepare('SELECT id, slug, title, state FROM scholarships').all();

console.log('=== SEARCHING DB FOR BROKEN LINK TARGETS ===\n');

const queries = [
  { label: 'OASIS WB', query: 'oasis' },
  { label: 'Kanyashree WB', query: 'kanya' },
  { label: 'SVMCM WB', query: 'vivekananda' },
  { label: 'Kerala Suvarna', query: 'suvarna' },
  { label: 'Kerala eGrantz', query: 'grantz' },
  { label: 'Reliance', query: 'reliance' },
  { label: 'Pragati AICTE', query: 'pragati' },
  { label: 'Rajasthan Uttar Matric', query: 'uttar' },
  { label: 'Punjab SC', query: 'punjab' },
  { label: 'Surat ST', query: 'surat' },
  { label: 'Gujarat SC/ST', query: 'gujarat' },
  { label: 'Tamil Nadu SC/ST', query: 'tamil' },
  { label: 'Telangana ST', query: 'telangana' },
  { label: 'MP TAAS', query: 'taas' },
  { label: 'Minority MCM', query: 'minority' },
  { label: 'NEST Senior', query: 'nest' },
  { label: 'Colgate / Keep India', query: 'colgate' },
  { label: 'Vidyasiri', query: 'vidyasiri' }
];

queries.forEach(q => {
  console.log(`--- ${q.label} (query: "${q.query}") ---`);
  const matches = rows.filter(r => 
    r.slug.toLowerCase().includes(q.query) || 
    r.title.toLowerCase().includes(q.query)
  );
  if (matches.length === 0) {
    console.log(`  ❌ NO DB MATCH FOUND FOR "${q.query}"`);
  } else {
    matches.forEach(m => console.log(`  - [${m.slug}] (${m.state || 'All-India'}): ${m.title}`));
  }
  console.log('');
});

db.close();
