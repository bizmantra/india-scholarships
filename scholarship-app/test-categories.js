const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');
const db = new Database(dbPath);

// Get all unique categories
const scholarships = db.prepare('SELECT DISTINCT caste FROM scholarships WHERE caste IS NOT NULL').all();

const categories = new Set();
scholarships.forEach((row) => {
    try {
        const castes = JSON.parse(row.caste);
        castes.forEach((c) => categories.add(c));
    } catch {
        if (row.caste) categories.add(row.caste);
    }
});

const categoryArray = Array.from(categories).sort();
console.log('Categories found:', categoryArray);
console.log('\nGenerated params:');
categoryArray.forEach(cat => {
    const slug = cat.toLowerCase().replace(/\s+/g, '-');
    console.log(`  { category: '${slug}' } // from ${cat}`);
});

db.close();
