/**
 * Format gate: fails (exit 1) if any scholarship has a field in a format the site cannot handle.
 * Run before every sync to Turso so agents and scripts cannot push malformed data.
 *
 * Known, human-acknowledged exceptions live in data/format-exceptions.json:
 *   { "<slug>": { "<field>": "reason" } }
 *
 * Usage: node scripts/check-data-formats.js [--db=path/to/file.db]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbArg = process.argv.find(a => a.startsWith('--db='));
const DB_PATH = dbArg ? dbArg.split('=')[1] : process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const EXCEPTIONS_PATH = path.join(__dirname, '..', 'data', 'format-exceptions.json');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isJsonArray = v => {
    try { return Array.isArray(JSON.parse(v)); } catch { return false; }
};

const RULES = [
    { field: 'title', test: v => typeof v === 'string' && v.trim().length > 0, expect: 'non-empty text' },
    { field: 'slug', test: v => typeof v === 'string' && /^[a-z0-9-]+$/.test(v), expect: 'lowercase letters, numbers and dashes' },
    { field: 'income_limit', test: v => v === null || Number.isInteger(v), expect: 'a whole number in rupees, or empty for no limit' },
    { field: 'amount_annual', test: v => v === null || Number.isInteger(v), expect: 'a whole number in rupees' },
    { field: 'amount_min', test: v => v === null || Number.isInteger(v), expect: 'a whole number in rupees' },
    { field: 'deadline', test: v => v === null || v === '' || ISO_DATE.test(v), expect: 'YYYY-MM-DD or empty' },
    { field: 'scholarship_scope', test: v => v === 'Domestic' || v === 'International', expect: '"Domestic" or "International"' },
    { field: 'docs_needed', test: v => v === null || v === '' || isJsonArray(v), expect: 'a JSON list, e.g. ["Aadhaar Card"]' },
    { field: 'faq_json', test: v => v === null || v === '' || isJsonArray(v), expect: 'a JSON list of {question, answer}' },
    { field: 'status', test: v => v === null || ['Active', 'Closed', 'Draft', 'Inactive'].includes(v), expect: 'Active, Closed, Draft or Inactive' },
];

function check(dbPath = DB_PATH) {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT * FROM scholarships').all();
    db.close();
    const exceptions = fs.existsSync(EXCEPTIONS_PATH) ? JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, 'utf8')) : {};

    const errors = [];
    let excepted = 0;
    const slugs = new Set();
    for (const row of rows) {
        if (slugs.has(row.slug)) errors.push(`${row.slug}: duplicate slug`);
        slugs.add(row.slug);
        for (const rule of RULES) {
            if (rule.test(row[rule.field])) continue;
            if (exceptions[row.slug]?.[rule.field]) {
                excepted++;
                continue;
            }
            errors.push(`${row.slug}: ${rule.field} = ${JSON.stringify(row[rule.field])} (expected ${rule.expect})`);
        }
    }
    return { total: rows.length, errors, excepted };
}

if (require.main === module) {
    const { total, errors, excepted } = check();
    console.log(`🔎 Format check: ${total} scholarships, ${errors.length} problem(s), ${excepted} acknowledged exception(s)`);
    if (errors.length) {
        errors.slice(0, 50).forEach(e => console.error(`   ❌ ${e}`));
        if (errors.length > 50) console.error(`   ...and ${errors.length - 50} more`);
        console.error('\nFix these (or add a reviewed exception to data/format-exceptions.json) before syncing to Turso.');
        process.exit(1);
    }
    console.log('✅ All formats valid');
}

module.exports = { check };
