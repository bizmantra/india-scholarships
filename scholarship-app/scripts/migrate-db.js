const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log('🔧 Running database migration...\n');
console.log(`Database: ${DB_PATH}\n`);

const db = new Database(DB_PATH);

// Check if columns exist
const tableInfo = db.prepare("PRAGMA table_info(scholarships)").all();
const existingColumns = tableInfo.map(col => col.name);

console.log(`📊 Existing columns: ${existingColumns.length}`);

// Columns to add
const newColumns = [
    { name: 'scholarship_type', type: 'TEXT', default: "'Government'" },
    { name: 'status', type: 'TEXT', default: "'Active'" },
    { name: 'verification_year', type: 'INTEGER', default: 'NULL' },
    { name: 'show_on_homepage', type: 'INTEGER', default: '0' },
    { name: 'is_featured', type: 'INTEGER', default: '0' },
    { name: 'is_popular', type: 'INTEGER', default: '0' },
    { name: 'priority_score', type: 'INTEGER', default: '50' },
    { name: 'special_conditions', type: 'TEXT', default: 'NULL' },
    { name: 'tags', type: 'TEXT', default: 'NULL' },
    { name: 'thumbnail_url', type: 'TEXT', default: 'NULL' }
];

let added = 0;
let skipped = 0;

for (const col of newColumns) {
    if (!existingColumns.includes(col.name)) {
        try {
            const sql = `ALTER TABLE scholarships ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`;
            db.exec(sql);
            console.log(`✅ Added column: ${col.name}`);
            added++;
        } catch (error) {
            console.error(`❌ Error adding ${col.name}:`, error.message);
        }
    } else {
        console.log(`⏭️  Column already exists: ${col.name}`);
        skipped++;
    }
}

db.close();

console.log('\n' + '='.repeat(50));
console.log(`✅ Migration complete!`);
console.log(`   Added: ${added} columns`);
console.log(`   Skipped: ${skipped} columns (already exist)`);
console.log('='.repeat(50));
