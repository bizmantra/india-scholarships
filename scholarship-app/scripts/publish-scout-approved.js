/**
 * Publish Scout-Approved Scholarships
 *
 * Runs after a New Scholarship Scout pull request is merged. Every file still in
 * data/scout/candidates/ was approved by a human, so each one is inserted into the
 * scholarships table as Active and then moved to data/scout/published/.
 *
 * Usage: node scripts/publish-scout-approved.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dryRun = process.argv.includes('--dry-run');

const DB_PATH = process.env.SCOUT_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const SCOUT_DIR = path.join(__dirname, '..', 'data', 'scout');
const CANDIDATES_DIR = path.join(SCOUT_DIR, 'candidates');
const PUBLISHED_DIR = path.join(SCOUT_DIR, 'published');

const COLUMNS = [
    'id', 'title', 'slug', 'provider', 'provider_type', 'state', 'level', 'caste', 'gender', 'course_stream', 'app_type',
    'amount_annual', 'amount_min', 'amount_description', 'benefits', 'income_limit', 'min_marks', 'age_limit',
    'residency_requirement', 'docs_needed', 'application_mode', 'apply_url', 'deadline', 'deadline_description',
    'step_guide', 'selection', 'renewal', 'competitiveness', 'verified_status', 'last_verified', 'official_source',
    'helpline', 'intro_seo', 'faq_json', 'notes_actions', 'keywords', 'scholarship_type', 'status', 'verification_year',
    'priority_score', 'tags', 'created_at', 'scholarship_scope', 'country_of_study', 'always_open', 'last_checked_at'
];
const JSON_COLUMNS = new Set(['docs_needed', 'faq_json', 'keywords', 'tags']);

function toRow(candidate) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const row = {
        competitiveness: 'Medium',
        verified_status: 'Verified',
        last_verified: now,
        last_checked_at: now,
        notes_actions: 'Added by New Scholarship Scout (human-approved PR)',
        status: 'Active',
        verification_year: new Date().getFullYear(),
        priority_score: 50,
        created_at: now,
        ...candidate,
    };
    const out = {};
    for (const col of COLUMNS) {
        const value = row[col];
        out[col] = JSON_COLUMNS.has(col) && typeof value !== 'string' ? JSON.stringify(value || []) : value ?? null;
    }
    return out;
}

function run() {
    if (!fs.existsSync(CANDIDATES_DIR)) {
        console.log('No candidates directory. Nothing to publish.');
        return;
    }
    const files = fs.readdirSync(CANDIDATES_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.log('No approved candidates. Nothing to publish.');
        return;
    }

    const db = new Database(DB_PATH);
    const insert = db.prepare(`INSERT INTO scholarships (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(c => '@' + c).join(', ')})`);
    const exists = db.prepare('SELECT id FROM scholarships WHERE id = ? OR slug = ?');
    const insertChangelog = db.prepare(`
        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
        VALUES (?, ?, ?, ?)
    `);

    fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
    let published = 0;

    for (const file of files) {
        const filePath = path.join(CANDIDATES_DIR, file);
        let candidate;
        try {
            candidate = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`❌ ${file}: invalid JSON (${error.message}). Left in place.`);
            continue;
        }
        const { _scout, ...fields } = candidate;
        if (!fields.title || !fields.slug) {
            console.error(`❌ ${file}: missing title or slug. Left in place.`);
            continue;
        }
        fields.id = fields.id || fields.slug;

        if (exists.get(fields.id, fields.slug)) {
            console.log(`⏭️  ${fields.slug} already exists in the database. Archiving file only.`);
        } else if (dryRun) {
            console.log(`🧪 Would publish: "${fields.title}" (${fields.slug})`);
            continue;
        } else {
            db.transaction(() => {
                insert.run(toRow(fields));
                insertChangelog.run(fields.id, fields.title, 'scout_added', JSON.stringify({
                    source_citation: fields.official_source,
                    found_via: _scout?.found_via || [],
                    confidence: _scout?.confidence || null
                }));
            })();
            published++;
            console.log(`✅ Published: "${fields.title}" (${fields.slug})`);
        }

        if (!dryRun) fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }

    db.close();
    console.log(`\n🏁 Published ${published} new scholarship(s).`);
}

run();
