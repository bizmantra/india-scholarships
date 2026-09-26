/**
 * Publish Scout-Approved Scholarships
 *
 * Publishes every New Scholarship Scout candidate the owner approved in the command center
 * (agent_proposals: kind 'new_scholarship', status 'approved'). Each one is inserted into the
 * scholarships table as Active and its proposal is marked 'published'.
 *
 * Runs on the local copy (pull → publish → format check → push), started from the command center
 * or by hand.
 *
 * Usage: node scripts/publish-scout-approved.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');

const dryRun = process.argv.includes('--dry-run');
const AGENT = 'scout-publisher';

const DB_PATH = process.env.SCOUT_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');

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
        notes_actions: 'Added by New Scholarship Scout (approved in the command center)',
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
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    const approved = db.prepare(`SELECT * FROM agent_proposals WHERE kind = 'new_scholarship' AND status = 'approved' ORDER BY id`).all();
    if (approved.length === 0) {
        console.log('No approved candidates. Nothing to publish.');
        db.close();
        if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'published=0\n');
        return;
    }

    const insert = db.prepare(`INSERT INTO scholarships (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(c => '@' + c).join(', ')})`);
    const exists = db.prepare('SELECT id FROM scholarships WHERE id = ? OR slug = ?');
    const insertChangelog = db.prepare(`
        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
        VALUES (?, ?, ?, ?)
    `);
    const markProposal = db.prepare(`UPDATE agent_proposals SET status = ?, decision_note = ? WHERE id = ?`);

    let published = 0;
    const publishedSlugs = [];

    for (const proposal of approved) {
        let fields;
        try {
            fields = JSON.parse(proposal.payload_json);
        } catch (error) {
            console.error(`❌ Proposal ${proposal.id}: unreadable record (${error.message}). Left as approved.`);
            continue;
        }
        if (!fields.title || !fields.slug) {
            console.error(`❌ Proposal ${proposal.id}: missing title or slug. Left as approved.`);
            continue;
        }
        fields.id = fields.id || fields.slug;
        const evidence = JSON.parse(proposal.evidence_json || '{}');

        if (exists.get(fields.id, fields.slug)) {
            console.log(`⏭️  ${fields.slug} already exists in the database. Marking as published.`);
            if (!dryRun) markProposal.run('published', 'Already on the site when publishing', proposal.id);
            continue;
        }
        if (dryRun) {
            console.log(`🧪 Would publish: "${fields.title}" (${fields.slug})`);
            continue;
        }
        db.transaction(() => {
            insert.run(toRow(fields));
            insertChangelog.run(fields.id, fields.title, 'scout_added', JSON.stringify({
                source_citation: fields.official_source,
                approved_by: proposal.decided_by,
                proposal_id: proposal.id,
                evidence: evidence.evidence || [],
                confidence: evidence.confidence || null
            }));
            markProposal.run('published', `Published ${new Date().toISOString().slice(0, 10)}`, proposal.id);
        })();
        published++;
        publishedSlugs.push(fields.slug);
        console.log(`✅ Published: "${fields.title}" (${fields.slug})`);
    }

    if (!dryRun && published > 0) {
        inbox.logEvent(db, {
            agent: AGENT,
            kind: 'run_finished',
            summary: `Published ${published} approved scholarship(s)`,
            details: { slugs: publishedSlugs }
        });
    }
    db.close();
    console.log(`\n🏁 Published ${published} new scholarship(s).`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `published=${published}\nslugs=${publishedSlugs.join(',')}\n`);
}

run();
