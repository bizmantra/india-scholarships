/**
 * One-time cleanup of inconsistent field formats in data/scholarships.db.
 *
 *   scholarship_scope  NULL / 'domestic'          → 'Domestic' (or 'International' for overseas schemes)
 *   docs_needed        comma / bullet text          → JSON array of documents
 *   deadline           non-date text ('Not specified') → '' (unknown)
 *   income_limit       "No family income limit" etc. → NULL (site shows "No Limit")
 *
 * Income limits that contain real amounts in text are NOT guessed; they are listed for a human
 * decision and recorded in data/format-exceptions.json so the format check does not block syncs.
 * Human-reviewed values in data/manual-corrections.json are applied first ({ "<slug>": { "<field>": value } };
 * extra_data_json values are merged into the existing JSON object).
 * Every change is recorded in scholarship_changelog as 'data_cleanup' with old and new values.
 *
 * Usage: node scripts/clean-data-formats.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dryRun = process.argv.includes('--dry-run');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const EXCEPTIONS_PATH = path.join(__dirname, '..', 'data', 'format-exceptions.json');
const CORRECTIONS_PATH = path.join(__dirname, '..', 'data', 'manual-corrections.json');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isJsonArray = v => {
    try { return Array.isArray(JSON.parse(v)); } catch { return false; }
};
const NO_LIMIT_TEXT = /^(no\b.*limit|not applicable|n\/?a|none|nil|as per (specific )?scheme rules)/i;

function toDocsArray(text) {
    // Split on new lines, or on commas that are not inside brackets or amounts like 2,50,000
    const items = text.includes('\n') ? text.split('\n') : text.split(/,(?![^(]*\))(?!\d)/);
    return items
        .map(s => s.replace(/^\s*([*•\-–]|\d+[.)])\s*/, '').trim())
        .filter(Boolean);
}

function run() {
    const db = new Database(DB_PATH);
    const rows = db.prepare('SELECT id, slug, title, status, scholarship_scope, country_of_study, docs_needed, deadline, income_limit, amount_annual, amount_min, extra_data_json FROM scholarships').all();
    const corrections = fs.existsSync(CORRECTIONS_PATH) ? JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf8')) : {};
    const columns = new Set(db.prepare('PRAGMA table_info(scholarships)').all().map(c => c.name));
    const exceptions = fs.existsSync(EXCEPTIONS_PATH) ? JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, 'utf8')) : {};

    const changes = [];
    const needsReview = [];
    const change = (row, field, oldValue, newValue) => changes.push({ row, field, oldValue, newValue });

    for (const row of rows) {
        // Human-reviewed corrections take priority over the automatic rules below
        for (const [field, value] of Object.entries(corrections[row.slug] || {})) {
            if (field.startsWith('_')) continue;
            if (!columns.has(field)) throw new Error(`manual-corrections.json: unknown field "${field}" for ${row.slug}`);
            const current = field in row ? row[field] : db.prepare(`SELECT ${field} AS v FROM scholarships WHERE id = ?`).get(row.id).v;
            let next = value;
            if (field === 'extra_data_json') {
                let existing = {};
                try { existing = JSON.parse(current || '{}') || {}; } catch { existing = {}; }
                next = JSON.stringify({ ...existing, ...value });
            }
            if (current !== next) {
                change(row, field, current, next);
                row[field] = next;
            }
            if (exceptions[row.slug]?.[field]) delete exceptions[row.slug][field];
            if (exceptions[row.slug] && Object.keys(exceptions[row.slug]).length === 0) delete exceptions[row.slug];
        }

        // Scope
        if (row.scholarship_scope !== 'Domestic' && row.scholarship_scope !== 'International') {
            const lower = (row.scholarship_scope || '').toLowerCase();
            const overseas = /overseas|abroad|foreign/i.test(row.title) || (row.country_of_study && row.country_of_study !== 'India');
            const scope = lower === 'international' || overseas ? 'International' : 'Domestic';
            change(row, 'scholarship_scope', row.scholarship_scope, scope);
            if (scope === 'Domestic' && !row.country_of_study) change(row, 'country_of_study', null, 'India');
        }

        // Documents
        const docs = (row.docs_needed || '').trim();
        if (docs && !docs.startsWith('[')) {
            change(row, 'docs_needed', row.docs_needed, JSON.stringify(toDocsArray(docs)));
        } else if (docs.startsWith('[') && !isJsonArray(docs)) {
            // Python-style list: ['Aadhaar Card', 'Income proof']
            const items = [...docs.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map(m => (m[1] ?? m[2]).trim()).filter(Boolean);
            if (items.length) change(row, 'docs_needed', row.docs_needed, JSON.stringify(items));
        }

        // Amounts must be whole rupees
        for (const field of ['amount_annual', 'amount_min']) {
            const value = row[field];
            if (typeof value === 'number' && !Number.isInteger(value)) change(row, field, value, Math.round(value));
        }

        // Deadline
        if (row.deadline && !ISO_DATE.test(row.deadline.trim())) {
            change(row, 'deadline', row.deadline, '');
        }

        // Income limit
        if (typeof row.income_limit === 'string') {
            const text = row.income_limit.trim();
            if (/^\d+$/.test(text)) {
                change(row, 'income_limit', row.income_limit, parseInt(text, 10));
            } else if (NO_LIMIT_TEXT.test(text)) {
                change(row, 'income_limit', row.income_limit, null);
            } else {
                needsReview.push({ slug: row.slug, field: 'income_limit', value: text });
                exceptions[row.slug] = {
                    ...(exceptions[row.slug] || {}),
                    income_limit: `Text value "${text}" needs a human decision (amount looks ambiguous or incorrect).`
                };
            }
        }
    }

    const byField = changes.reduce((acc, c) => ({ ...acc, [c.field]: (acc[c.field] || 0) + 1 }), {});
    console.log(`🧹 Data format cleanup${dryRun ? ' (DRY RUN)' : ''}`);
    Object.entries(byField).forEach(([field, n]) => console.log(`   ${field}: ${n} row(s)`));
    for (const c of changes.filter(c => c.field !== 'docs_needed')) {
        console.log(`   - ${c.row.slug}: ${c.field} ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)}`);
    }
    if (needsReview.length) {
        console.log('\n🙋 Needs a human decision (left unchanged):');
        needsReview.forEach(r => console.log(`   - ${r.slug}: ${r.field} = "${r.value}"`));
    }
    if (dryRun) {
        db.close();
        return;
    }

    const insertLog = db.prepare(`
        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
        VALUES (?, ?, 'data_cleanup', ?)
    `);
    db.transaction(() => {
        for (const c of changes) {
            db.prepare(`UPDATE scholarships SET ${c.field} = ? WHERE id = ?`).run(c.newValue, c.row.id);
            insertLog.run(c.row.id, c.row.title, JSON.stringify({ changes: [{ field: c.field, old: c.oldValue, new: c.newValue }] }));
        }
    })();
    fs.writeFileSync(EXCEPTIONS_PATH, JSON.stringify(exceptions, null, 2) + '\n');
    db.close();
    console.log(`\n✅ Applied ${changes.length} change(s). Exceptions saved to data/format-exceptions.json`);
}

run();
