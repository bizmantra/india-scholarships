const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log('🔧 Running database migration: Freshness Pipeline Setup...\n');
console.log(`Database: ${DB_PATH}\n`);

const db = new Database(DB_PATH);

// 1. Check & Add 'last_checked_at' column to scholarships
const tableInfo = db.prepare("PRAGMA table_info(scholarships)").all();
const existingColumns = tableInfo.map(col => col.name);

if (!existingColumns.includes('last_checked_at')) {
    try {
        db.exec("ALTER TABLE scholarships ADD COLUMN last_checked_at TEXT DEFAULT NULL");
        console.log("✅ Added column: last_checked_at to scholarships table");
    } catch (error) {
        console.error("❌ Error adding last_checked_at column:", error.message);
    }
} else {
    console.log("⏭️  Column last_checked_at already exists in scholarships table");
}

// 2. Create gsc_traffic_cache table
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS gsc_traffic_cache (
            slug TEXT PRIMARY KEY,
            clicks INTEGER DEFAULT 0,
            impressions INTEGER DEFAULT 0,
            ctr REAL DEFAULT 0.0,
            position REAL DEFAULT 0.0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("✅ Created table: gsc_traffic_cache");
} catch (error) {
    console.error("❌ Error creating gsc_traffic_cache table:", error.message);
}

db.close();

console.log('\n==================================================');
console.log('✅ Migration complete!');
console.log('==================================================');
