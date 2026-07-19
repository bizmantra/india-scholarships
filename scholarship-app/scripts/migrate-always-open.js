const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log('🔧 Running database migration for "Always Open" logic...\n');
console.log(`Database: ${DB_PATH}\n`);

const db = new Database(DB_PATH);

// 1. Check if column exists, add if missing
const tableInfo = db.prepare("PRAGMA table_info(scholarships)").all();
const existingColumns = tableInfo.map(col => col.name);

if (!existingColumns.includes('always_open')) {
    try {
        db.exec("ALTER TABLE scholarships ADD COLUMN always_open INTEGER DEFAULT 0");
        console.log("✅ Added column: always_open");
    } catch (error) {
        console.error("❌ Error adding always_open column:", error.message);
        db.close();
        process.exit(1);
    }
} else {
    console.log("⏭️  Column 'always_open' already exists.");
}

// 2. Auto-tag scholarships that are clearly always open/rolling
// We scan for keywords like 'rolling', 'always open', 'continuous' in the deadline or deadline_description
const scholarships = db.prepare("SELECT id, title, deadline, deadline_description FROM scholarships").all();
let autoTaggedCount = 0;

const updateStmt = db.prepare("UPDATE scholarships SET always_open = 1 WHERE id = ?");

const rollingKeywords = ['rolling', 'always open', 'continuous', 'year-round', 'round the year', 'throughout the year'];

for (const s of scholarships) {
    const deadlineLower = (s.deadline || '').toLowerCase();
    const descLower = (s.deadline_description || '').toLowerCase();
    
    let isRolling = false;
    
    // Check if the deadline field matches rolling terms
    if (deadlineLower === 'rolling' || deadlineLower === 'always open' || deadlineLower === 'continuous') {
        isRolling = true;
    }
    
    // Check if the deadline or description contains any of our keywords
    if (!isRolling) {
        for (const kw of rollingKeywords) {
            if (deadlineLower.includes(kw) || descLower.includes(kw)) {
                isRolling = true;
                break;
            }
        }
    }
    
    if (isRolling) {
        updateStmt.run(s.id);
        console.log(`🏷️  Auto-tagged "${s.title}" (slug: ${s.id}) as Always Open.`);
        autoTaggedCount++;
    }
}

db.close();

console.log('\n' + '='.repeat(50));
console.log(`✅ Migration complete!`);
console.log(`   Auto-tagged ${autoTaggedCount} scholarships.`);
console.log('='.repeat(50));
