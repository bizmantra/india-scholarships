/**
 * Format gate: fails (exit 1) if any scholarship or Study Abroad row has a field in a format the site cannot handle.
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

// Study Abroad tables (see scripts/lib/study-abroad-tables.js). Text rules block internal notes that
// once leaked onto live pages from coming back.
const SA_SLUG = v => typeof v === 'string' && /^[a-z0-9_-]+$/.test(v);
const isJsonOrEmpty = v => {
    if (v === null || v === '') return true;
    try { JSON.parse(v); return true; } catch { return false; }
};
const LEAKED_TEXT = /Navigation Breadcrumb|Primary SEO Title|Target URL Route|\/Users\/|\]\([^)]*\.md\)|Programmatic DB (Component|Record)/;
const SA_STATUS = v => v === 'published' || v === 'draft';
const noLeaks = v => v === null || !LEAKED_TEXT.test(v);
const SA_RULES = {
    sa_universities: [
        { field: 'slug', test: SA_SLUG, expect: 'lowercase letters, numbers, dashes' },
        { field: 'name', test: v => typeof v === 'string' && v.trim().length > 0, expect: 'non-empty text' },
        { field: 'status', test: SA_STATUS, expect: '"published" or "draft"' },
        { field: 'tuition_per_year', test: v => v === null || Number.isInteger(v), expect: 'a whole number' },
        { field: 'living_cost_per_year', test: v => v === null || Number.isInteger(v), expect: 'a whole number' },
        ...['infobox_json', 'faq_json', 'related_json', 'application_deadlines'].map(field => ({ field, test: isJsonOrEmpty, expect: 'valid JSON or empty' })),
        ...['body_md', 'summary'].map(field => ({ field, test: noLeaks, expect: 'no internal notes (breadcrumbs, SEO notes, file paths, .md links)' })),
    ],
    sa_guides: [
        { field: 'slug', test: SA_SLUG, expect: 'lowercase letters, numbers, dashes' },
        { field: 'title', test: v => typeof v === 'string' && v.trim().length > 0, expect: 'non-empty text' },
        { field: 'kind', test: v => ['guide', 'visa', 'loan'].includes(v), expect: '"guide", "visa" or "loan"' },
        { field: 'status', test: SA_STATUS, expect: '"published" or "draft"' },
        ...['infobox_json', 'faq_json', 'related_json', 'data_json'].map(field => ({ field, test: isJsonOrEmpty, expect: 'valid JSON or empty' })),
        ...['body_md', 'summary'].map(field => ({ field, test: noLeaks, expect: 'no internal notes (breadcrumbs, SEO notes, file paths, .md links)' })),
    ],
    sa_programs: [
        { field: 'university_slug', test: SA_SLUG, expect: 'a university slug' },
        { field: 'degree', test: v => typeof v === 'string' && /^[a-z]+$/.test(v), expect: 'a lowercase degree code, e.g. "ms"' },
        { field: 'status', test: SA_STATUS, expect: '"published" or "draft"' },
        { field: 'tuition_per_year', test: v => v === null || Number.isInteger(v), expect: 'a whole number' },
        { field: 'application_deadlines', test: isJsonOrEmpty, expect: 'valid JSON or empty' },
    ],
    sa_facts: [
        { field: 'value', test: v => typeof v === 'string' && v.trim().length > 0, expect: 'non-empty value' },
    ],
};

function checkStudyAbroad(db) {
    const errors = [];
    let total = 0;
    for (const [table, rules] of Object.entries(SA_RULES)) {
        if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table)) continue;
        const rows = db.prepare(`SELECT * FROM ${table}`).all();
        total += rows.length;
        for (const row of rows) {
            const id = row.slug || row.id || row.key;
            for (const rule of rules) {
                if (!rule.test(row[rule.field])) errors.push(`${table}/${id}: ${rule.field} = ${JSON.stringify(String(row[rule.field]).slice(0, 80))} (expected ${rule.expect})`);
            }
        }
    }
    // Every program must point at a university page that exists
    if (total) {
        db.prepare(`SELECT p.id, p.university_slug FROM sa_programs p LEFT JOIN sa_universities u ON u.slug = p.university_slug
                    WHERE u.slug IS NULL AND p.status = 'published'`).all()
            .forEach(r => errors.push(`sa_programs/${r.id}: university_slug "${r.university_slug}" has no sa_universities row (set status 'draft' until the university page exists)`));
    }
    return { total, errors };
}

function check(dbPath = DB_PATH) {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT * FROM scholarships').all();
    const studyAbroad = checkStudyAbroad(db);
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
    errors.push(...studyAbroad.errors);
    return { total: rows.length, studyAbroadTotal: studyAbroad.total, errors, excepted };
}

if (require.main === module) {
    const { total, studyAbroadTotal, errors, excepted } = check();
    console.log(`🔎 Format check: ${total} scholarships, ${studyAbroadTotal} Study Abroad rows, ${errors.length} problem(s), ${excepted} acknowledged exception(s)`);
    if (errors.length) {
        errors.slice(0, 50).forEach(e => console.error(`   ❌ ${e}`));
        if (errors.length > 50) console.error(`   ...and ${errors.length - 50} more`);
        console.error('\nFix these (or add a reviewed exception to data/format-exceptions.json) before syncing to Turso.');
        process.exit(1);
    }
    console.log('✅ All formats valid');
}

module.exports = { check };
