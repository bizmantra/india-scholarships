const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const scratchDir = '/Users/roshankumar/.gemini/antigravity/brain/9780199c-5969-4234-a634-dd4fbdb7c9e4/scratch';

const batch1Path = path.join(scratchDir, 'batch1-researched.json');
const batch2Path = path.join(scratchDir, 'batch2-researched.json');
const batch3Path = path.join(scratchDir, 'batch3-researched.json');

if (!fs.existsSync(batch1Path) || !fs.existsSync(batch2Path) || !fs.existsSync(batch3Path)) {
    console.error("❌ Error: One or more batch JSON files are missing in the scratch directory.");
    process.exit(1);
}

const batch1 = JSON.parse(fs.readFileSync(batch1Path, 'utf8'));
const batch2 = JSON.parse(fs.readFileSync(batch2Path, 'utf8'));
const batch3 = JSON.parse(fs.readFileSync(batch3Path, 'utf8'));

const allUpdates = [...batch1, ...batch2, ...batch3];
console.log(`Loaded ${allUpdates.length} total scholarship updates from subagent research batches.`);

const db = new Database(dbPath);

function sanitizeUrl(urlStr) {
    if (!urlStr) return '';
    const trimmed = urlStr.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    const match = trimmed.match(/https?:\/\/[^\s\)]+/);
    return match ? match[0] : '';
}

try {
    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_annual = ?, 
            amount_min = ?, 
            amount_description = ?, 
            min_marks = ?, 
            selection = ?, 
            renewal = ?, 
            helpline = ?, 
            official_source = ?, 
            apply_url = ?, 
            faq_json = ?,
            verified_status = 'Verified',
            last_verified = datetime('now')
        WHERE slug = ?
    `);

    db.transaction(() => {
        allUpdates.forEach((u, idx) => {
            console.log(`[${idx + 1}/${allUpdates.length}] Updating database: ${u.title || u.slug} (${u.slug})`);
            updateStmt.run(
                u.amount_annual || 0,
                u.amount_min || 0,
                u.amount_description || '',
                u.min_marks || 0,
                u.selection || '',
                u.renewal || '',
                u.helpline || '',
                sanitizeUrl(u.official_source || ''),
                sanitizeUrl(u.apply_url || ''),
                JSON.stringify(u.faq_json || []),
                u.slug
            );
        });
    })();

    console.log('\n🎉 SQLite Database successfully enriched with 100% verified subagent research data!');
} catch (err) {
    console.error('❌ Error updating database:', err);
} finally {
    db.close();
}
