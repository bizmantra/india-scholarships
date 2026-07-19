const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log("🛠️ Starting database taxonomy standardization...");

// 1. Get all scholarships
const rows = db.prepare("SELECT id, provider_type, scholarship_type, scholarship_scope FROM scholarships").all();

const updateStmt = db.prepare(`
    UPDATE scholarships 
    SET provider_type = ?, scholarship_type = ?, scholarship_scope = ? 
    WHERE id = ?
`);

let updatedCount = 0;

db.transaction(() => {
    for (const row of rows) {
        let pType = String(row.provider_type || '').trim();
        let sType = String(row.scholarship_type || '').trim();
        let sScope = String(row.scholarship_scope || '').trim();

        // Standardize provider_type
        const pLower = pType.toLowerCase();
        if (pLower.includes('government') || pLower.includes('state') || pLower.includes('central') || pLower.includes('ut') || pLower.includes('ministry')) {
            pType = 'Government';
        } else if (pLower.includes('corporate') || pLower.includes('company') || pLower.includes('csr')) {
            pType = 'Corporate';
        } else if (pLower.includes('university') || pLower.includes('college') || pLower.includes('school') || pLower.includes('institute') || pLower.includes('nus')) {
            pType = 'University';
        } else if (pLower.includes('trust')) {
            pType = 'Trust';
        } else if (pLower.includes('private') || pLower.includes('foundation')) {
            pType = 'Private';
        } else {
            // Default fallbacks if empty
            pType = pType || 'Private';
        }

        // Standardize scholarship_type
        const sLower = sType.toLowerCase();
        if (sLower.includes('government')) {
            sType = 'Government';
        } else if (sLower.includes('study') || sLower.includes('abroad') || sLower.includes('international')) {
            sType = 'Study Abroad';
        } else if (sLower.includes('private') || sLower.includes('corporate') || sLower.includes('foundation') || sLower.includes('trust')) {
            sType = 'Private';
        } else {
            sType = sType || 'Private';
        }

        // Standardize scholarship_scope
        const scopeLower = sScope.toLowerCase();
        if (scopeLower.includes('international') || scopeLower.includes('abroad')) {
            sScope = 'International';
        } else {
            sScope = 'Domestic';
        }

        if (pType !== row.provider_type || sType !== row.scholarship_type || sScope !== row.scholarship_scope) {
            updateStmt.run(pType, sType, sScope, row.id);
            updatedCount++;
        }
    }
})();

console.log(`🎉 Done! Standardized taxonomy fields for ${updatedCount} / ${rows.length} scholarships.`);
db.close();
