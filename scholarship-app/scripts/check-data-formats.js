/**
 * Format gate: fails (exit 1) if any scholarship or Study Abroad row has a field in a format the site cannot handle,
 * or if Study Abroad content violates quality rules (Spec D3) unless the issue is in data/study-abroad/quality-baseline.json.
 * Run before every sync to Turso so agents and scripts cannot push malformed data.
 *
 * Known, human-acknowledged exceptions live in data/format-exceptions.json:
 *   { "<slug>": { "<field>": "reason" } }
 *
 * Study Abroad baseline exceptions live in data/study-abroad/quality-baseline.json.
 *
 * Usage:
 *   node scripts/check-data-formats.js [--db=path/to/file.db] [--target=production|staging]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { auditStudyAbroad, buildBaselineSet, isProblemInBaseline } = require('./lib/quality-rules');

const dbArg = process.argv.find(a => a.startsWith('--db='));
const DB_PATH = dbArg ? dbArg.split('=')[1] : process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const EXCEPTIONS_PATH = path.join(__dirname, '..', 'data', 'format-exceptions.json');
const QUALITY_BASELINE_PATH = path.join(__dirname, '..', 'data', 'study-abroad', 'quality-baseline.json');

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
    // deadline_status says how far to trust the deadline; deadline_expected keeps an estimate while deadline stays empty.
    // Both are undefined on local copies from before they existed.
    { field: 'deadline_status', test: v => v === undefined || v === null || v === '' || ['confirmed', 'expected', 'rolling', 'unknown'].includes(v), expect: 'confirmed, expected, rolling, unknown or empty' },
    { field: 'deadline_expected', test: v => v === undefined || v === null || v === '' || ISO_DATE.test(v), expect: 'YYYY-MM-DD or empty' },
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

function checkStudyAbroadQuality(tablesData) {
    const { issues } = auditStudyAbroad(tablesData);
    const baselineData = fs.existsSync(QUALITY_BASELINE_PATH)
        ? JSON.parse(fs.readFileSync(QUALITY_BASELINE_PATH, 'utf8'))
        : [];
    const baselineSet = buildBaselineSet(baselineData);

    const errors = [];
    let excepted = 0;
    const warnings = [];

    for (const issue of issues) {
        if (issue.severity === 'warning') {
            warnings.push(issue);
            continue;
        }
        if (isProblemInBaseline(baselineSet, issue)) {
            excepted++;
            continue;
        }
        errors.push(`${issue.table}/${issue.id}: ${issue.message} [Rule ${issue.rule}: ${issue.code}]`);
    }

    return { errors, excepted, warnings, totalIssues: issues.length };
}

function check(dbPath = DB_PATH) {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT * FROM scholarships').all();
    const studyAbroad = checkStudyAbroad(db);

    const tableExists = name => Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name));
    const universities = tableExists('sa_universities') ? db.prepare('SELECT * FROM sa_universities').all() : [];
    const guides = tableExists('sa_guides') ? db.prepare('SELECT * FROM sa_guides').all() : [];
    const programs = tableExists('sa_programs') ? db.prepare('SELECT * FROM sa_programs').all() : [];
    const facts = tableExists('sa_facts') ? db.prepare('SELECT * FROM sa_facts').all() : [];
    db.close();

    const qualityGate = checkStudyAbroadQuality({ universities, guides, programs, facts });
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
    errors.push(...qualityGate.errors);
    excepted += qualityGate.excepted;

    return {
        total: rows.length,
        studyAbroadTotal: studyAbroad.total,
        errors,
        excepted,
        warnings: qualityGate.warnings,
    };
}

async function checkTurso(target) {
    const { connect } = require('./lib/turso-target');
    const { client } = connect(target);
    const rows = (await client.execute('SELECT * FROM scholarships')).rows;
    const universities = (await client.execute('SELECT * FROM sa_universities')).rows;
    const guides = (await client.execute('SELECT * FROM sa_guides')).rows;
    const programs = (await client.execute('SELECT * FROM sa_programs')).rows;
    const facts = (await client.execute('SELECT * FROM sa_facts')).rows;

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

    const saTables = { sa_universities: universities, sa_guides: guides, sa_programs: programs, sa_facts: facts };
    let saTotal = 0;
    for (const [table, rules] of Object.entries(SA_RULES)) {
        const tableRows = saTables[table] || [];
        saTotal += tableRows.length;
        for (const row of tableRows) {
            const id = row.slug || row.id || row.key;
            for (const rule of rules) {
                if (!rule.test(row[rule.field])) errors.push(`${table}/${id}: ${rule.field} = ${JSON.stringify(String(row[rule.field]).slice(0, 80))} (expected ${rule.expect})`);
            }
        }
    }

    const qualityGate = checkStudyAbroadQuality({ universities, guides, programs, facts });
    errors.push(...qualityGate.errors);
    excepted += qualityGate.excepted;

    return {
        total: rows.length,
        studyAbroadTotal: saTotal,
        errors,
        excepted,
        warnings: qualityGate.warnings,
    };
}

if (require.main === module) {
    const targetArg = process.argv.find(a => a.startsWith('--target='));
    const runner = targetArg
        ? checkTurso(targetArg.split('=')[1].toLowerCase())
        : Promise.resolve().then(() => check());

    runner.then(({ total, studyAbroadTotal, errors, excepted, warnings }) => {
        console.log(`🔎 Format check: ${total} scholarships, ${studyAbroadTotal} Study Abroad rows, ${errors.length} problem(s), ${excepted} acknowledged exception(s)`);
        if (warnings && warnings.length) {
            console.log(`   ℹ️  ${warnings.length} quality review warning(s)`);
        }
        if (errors.length) {
            errors.slice(0, 50).forEach(e => console.error(`   ❌ ${e}`));
            if (errors.length > 50) console.error(`   ...and ${errors.length - 50} more`);
            console.error('\nFix these (or add a reviewed exception to format-exceptions.json / quality-baseline.json) before syncing to Turso.');
            process.exit(1);
        }
        console.log('✅ All formats and quality rules valid');
    }).catch(err => {
        console.error(`❌ Check failed: ${err.message}`);
        process.exit(1);
    });
}

module.exports = { check, checkTurso };

