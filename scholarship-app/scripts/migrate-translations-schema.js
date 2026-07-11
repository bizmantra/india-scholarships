const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log('🔧 Running database migration for Multi-lingual schema...\n');
console.log(`Database: ${DB_PATH}\n`);

const db = new Database(DB_PATH);

try {
    // Create scholarship_translations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS scholarship_translations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scholarship_id TEXT NOT NULL,
            locale TEXT NOT NULL,
            title TEXT,
            amount_description TEXT,
            benefits TEXT,
            selection TEXT,
            renewal TEXT,
            step_guide TEXT,
            faq_json TEXT,
            intro_seo TEXT,
            FOREIGN KEY (scholarship_id) REFERENCES scholarships(id),
            UNIQUE(scholarship_id, locale)
        );
    `);
    console.log("✅ Created table: scholarship_translations");
    
    // Create indexes for fast lookup
    db.exec("CREATE INDEX IF NOT EXISTS idx_trans_lookup ON scholarship_translations(scholarship_id, locale)");
    console.log("✅ Created lookup index on scholarship_translations");
} catch (error) {
    console.error("❌ Error setting up translations table:", error.message);
    db.close();
    process.exit(1);
}

db.close();

console.log('\n' + '='.repeat(50));
console.log(`✅ Translation schema migration complete!`);
console.log('='.repeat(50));
