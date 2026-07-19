const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

console.log("=== DOMICILE STATES ===");
const states = db.prepare(`
    SELECT state, COUNT(*) as count 
    FROM scholarships 
    GROUP BY state 
    ORDER BY count DESC 
    LIMIT 20
`).all();
states.forEach(s => console.log(`  - ${s.state || 'Null/Empty'}: ${s.count}`));

console.log("\n=== GENDER ===");
const genders = db.prepare(`
    SELECT gender, COUNT(*) as count 
    FROM scholarships 
    GROUP BY gender 
    ORDER BY count DESC
`).all();
genders.forEach(g => console.log(`  - ${g.gender || 'Null/Empty'}: ${g.count}`));

console.log("\n=== EDUCATION LEVELS (RAW) ===");
const levels = db.prepare(`
    SELECT level, COUNT(*) as count 
    FROM scholarships 
    GROUP BY level 
    ORDER BY count DESC 
    LIMIT 15
`).all();
levels.forEach(l => console.log(`  - ${l.level || 'Null/Empty'}: ${l.count}`));

console.log("\n=== CASTE CATEGORIES (RAW JSON) ===");
const castes = db.prepare(`
    SELECT caste, COUNT(*) as count 
    FROM scholarships 
    GROUP BY caste 
    ORDER BY count DESC 
    LIMIT 10
`).all();
castes.forEach(c => console.log(`  - ${c.caste || 'Null/Empty'}: ${c.count}`));

console.log("\n=== PROVIDER TYPES ===");
const providerTypes = db.prepare(`
    SELECT provider_type, COUNT(*) as count 
    FROM scholarships 
    GROUP BY provider_type 
    ORDER BY count DESC
`).all();
providerTypes.forEach(p => console.log(`  - ${p.provider_type || 'Null/Empty'}: ${p.count}`));

db.close();
