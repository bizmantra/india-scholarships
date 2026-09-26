/**
 * Agent inbox: the shared place where agents put changes that need a human decision,
 * record what they did, and keep their settings and memory.
 *
 * Tables (all synced to Turso by push-to-turso.js):
 *   agent_proposals  one row per proposed change. Field changes collapse to one pending row per
 *                    scholarship + field; rejected values are remembered and never proposed again.
 *   agent_events     the activity feed: agent runs, approvals, rejections, undos.
 *   agent_settings   values the owner can change from the command center (on/off, limits, sources).
 *   agent_state      an agent's own memory between runs (e.g. news links the scout already read).
 *
 * Agents work on the local copy (pull → work → push), so every function here takes a
 * better-sqlite3 database handle.
 */

const DDL = [
    `CREATE TABLE IF NOT EXISTS agent_proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        kind TEXT NOT NULL,
        scholarship_id TEXT,
        scholarship_title TEXT,
        field TEXT,
        old_value TEXT,
        new_value TEXT,
        payload_json TEXT,
        category TEXT,
        risk TEXT DEFAULT 'normal',
        source_citation TEXT,
        evidence_json TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        times_proposed INTEGER DEFAULT 1,
        first_proposed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_proposed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        decided_by TEXT,
        decided_at TEXT,
        decision_note TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_agent_proposals_status ON agent_proposals(status, kind)',
    'CREATE INDEX IF NOT EXISTS idx_agent_proposals_target ON agent_proposals(scholarship_id, field)',
    `CREATE TABLE IF NOT EXISTS agent_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        agent TEXT NOT NULL,
        kind TEXT NOT NULL,
        actor TEXT,
        summary TEXT NOT NULL,
        details_json TEXT,
        run_url TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_agent_events_created ON agent_events(created_at)',
    `CREATE TABLE IF NOT EXISTS agent_settings (
        agent TEXT NOT NULL,
        key TEXT NOT NULL,
        value_json TEXT NOT NULL,
        description TEXT,
        updated_by TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agent, key)
    )`,
    `CREATE TABLE IF NOT EXISTS agent_state (
        agent TEXT NOT NULL,
        key TEXT NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agent, key)
    )`,
];

const AGENT_TABLES = ['agent_proposals', 'agent_events', 'agent_settings', 'agent_state'];

// Defaults written once; after that the owner's values (changed from the command center) win
const DEFAULT_SETTINGS = [
    ['deadline-freshness', 'enabled', true, 'Run on schedule'],
    ['deadline-freshness', 'max_checks', 30, 'Scholarships checked per run'],
    ['deadline-freshness', 'window_days_before', 14, 'Also check deadlines that passed up to this many days ago'],
    ['deadline-freshness', 'window_days_after', 30, 'Check deadlines coming up within this many days'],
    ['weekly-enrichment', 'enabled', true, 'Run on schedule'],
    ['scholarship-scout', 'enabled', true, 'Run on schedule'],
    ['scholarship-scout', 'max_candidates', 8, 'New scholarships researched per run'],
    ['scholarship-scout', 'channels', ['demand', 'web', 'portals', 'csr', 'news', 'coverage'], 'Discovery channels used'],
];

// The only scholarship fields agents may propose changes to, and how their values are stored
const FIELD_TYPES = {
    deadline: 'date',
    deadline_description: 'text',
    amount_annual: 'int',
    amount_min: 'int',
    official_source: 'url',
    apply_url: 'url',
    helpline: 'text',
};

const PLACEHOLDERS = new Set(['', 'na', 'n/a', 'nil', 'none', 'null', 'unknown', 'not available', 'not specified', 'not found', 'tbd', 'check portal', '-', '0']);
// Longer "we don't know" phrasings, e.g. "Check portal for email/phone support"
const PLACEHOLDER_PHRASES = /^(check (the )?(official )?(portal|website)|not (specified|available|found|mentioned|published)|contact (the )?(provider|institution))/i;

function ensureAgentTables(db) {
    for (const sql of DDL) db.exec(sql);
    const seed = db.prepare('INSERT OR IGNORE INTO agent_settings (agent, key, value_json, description, updated_by) VALUES (?, ?, ?, ?, ?)');
    for (const [agent, key, value, description] of DEFAULT_SETTINGS) seed.run(agent, key, JSON.stringify(value), description, 'default');
}

const asText = v => (v === null || v === undefined ? '' : String(v).trim());

// An empty or placeholder answer means "the agent could not find it", never "remove the current value"
function isUnconfirmed(field, value) {
    const text = asText(value);
    if (PLACEHOLDERS.has(text.toLowerCase()) || PLACEHOLDER_PHRASES.test(text)) return true;
    if (FIELD_TYPES[field] === 'int') return !(Number(text) > 0);
    return false;
}

const urlHost = v => { try { return new URL(v).host.replace(/^www\./, '').toLowerCase(); } catch { return null; } };
const urlKey = v => { try { const u = new URL(v); return `${urlHost(v)}${u.pathname.replace(/\/+$/, '')}${u.search}`.toLowerCase(); } catch { return asText(v).toLowerCase(); } };

// Same value for practical purposes (links that differ only by "www.", "https" or a trailing slash)
function sameValue(field, a, b) {
    if (asText(a) === asText(b)) return true;
    return FIELD_TYPES[field] === 'url' && urlKey(asText(a)) === urlKey(asText(b));
}

/**
 * Same fact in different words: a reworded deadline description (date unchanged), a reformatted
 * helpline, or another page on the same website. Agents do not propose these. Filling an empty
 * field or fixing a bad value is never minor.
 */
function isMinorRewrite(field, oldValue, newValue, { withDateChange = false } = {}) {
    const before = asText(oldValue);
    if (isUnconfirmed(field, before) || validateValue(field, before)) return false;
    if (field === 'deadline_description') return !withDateChange;
    if (field === 'helpline') return true;
    if (FIELD_TYPES[field] === 'url') return urlHost(before) === urlHost(asText(newValue));
    return false;
}

// Returns an error message, or null when the value can be written to the scholarships table
function validateValue(field, value) {
    const type = FIELD_TYPES[field];
    const text = asText(value);
    if (!type) return `Agents may not change "${field}"`;
    if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(text)) return 'Date must be YYYY-MM-DD';
    if (type === 'date' && isNaN(new Date(text).getTime())) return 'Not a real date';
    if (type === 'int' && !/^\d+$/.test(text)) return 'Must be a whole number in rupees';
    if (type === 'url' && !/^https?:\/\/\S+$/.test(text)) return 'Must be a full web address';
    return null;
}

// Value as stored in the scholarships table
function storedValue(field, value) {
    return FIELD_TYPES[field] === 'int' ? Number(asText(value)) : asText(value);
}

// Inbox group (used for sorting and bulk actions) and how careful the reviewer should be
function classify(field, oldValue, newValue, { withDateChange = false } = {}) {
    if (isMinorRewrite(field, oldValue, newValue, { withDateChange })) return { category: 'wording', risk: 'low' };
    if (field === 'deadline') {
        const today = new Date().toISOString().slice(0, 10);
        return { category: 'date_change', risk: asText(newValue) < today ? 'high' : 'normal' };
    }
    if (field === 'deadline_description') return { category: withDateChange ? 'date_change' : 'wording', risk: 'low' };
    if (FIELD_TYPES[field] === 'int') {
        const before = Number(oldValue) || 0;
        const after = Number(newValue) || 0;
        const bigSwing = before > 0 && Math.abs(after - before) / before > 0.5;
        return { category: 'amount_change', risk: bigSwing ? 'high' : 'normal' };
    }
    if (FIELD_TYPES[field] === 'url') return { category: 'link_change', risk: 'normal' };
    return { category: 'contact_change', risk: 'low' };
}

/**
 * Propose changing one field of one scholarship. Returns what happened:
 *   'unchanged'      the proposed value is already live
 *   'unconfirmed'    the agent found nothing (blank/placeholder): not proposed
 *   'invalid'        the value is in the wrong format: not proposed
 *   'minor'          same fact in different words (see isMinorRewrite): not proposed
 *   'rejected_before' the owner already rejected this exact value
 *   'repeat'         the same value is already waiting; its count is bumped
 *   'superseded'     a different value was waiting; it is replaced by this one
 *   'created'        a new item in the inbox
 */
function proposeFieldChange(db, { agent, scholarshipId, scholarshipTitle, field, oldValue, newValue, source, withDateChange }) {
    const before = asText(oldValue);
    const after = asText(newValue);
    if (sameValue(field, before, after)) return 'unchanged';
    if (isUnconfirmed(field, after)) return 'unconfirmed';
    if (validateValue(field, after)) return 'invalid';
    if (isMinorRewrite(field, before, after, { withDateChange })) return 'minor';

    const rejected = db.prepare(`SELECT 1 FROM agent_proposals WHERE kind = 'field_change' AND scholarship_id = ? AND field = ?
                                 AND status = 'rejected' AND new_value = ?`).get(scholarshipId, field, after);
    if (rejected) return 'rejected_before';

    const pending = db.prepare(`SELECT id, new_value FROM agent_proposals WHERE kind = 'field_change' AND scholarship_id = ? AND field = ?
                                AND status = 'pending' ORDER BY id DESC`).all(scholarshipId, field);
    const same = pending.find(p => p.new_value === after);
    if (same) {
        db.prepare(`UPDATE agent_proposals SET times_proposed = times_proposed + 1, last_proposed_at = datetime('now'),
                    old_value = ?, source_citation = COALESCE(?, source_citation) WHERE id = ?`).run(before, source || null, same.id);
        return 'repeat';
    }
    const supersede = db.prepare(`UPDATE agent_proposals SET status = 'superseded', decided_by = ?, decided_at = datetime('now'),
                                  decision_note = 'Replaced by a newer proposal' WHERE id = ?`);
    pending.forEach(p => supersede.run(`agent:${agent}`, p.id));

    const { category, risk } = classify(field, before, after, { withDateChange });
    db.prepare(`INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value, category, risk, source_citation)
                VALUES (?, 'field_change', ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(agent, scholarshipId, scholarshipTitle, field, before, after, category, risk, source || null);
    return pending.length ? 'superseded' : 'created';
}

// Propose a whole new scholarship (from the scout). The record is published after approval.
function proposeNewScholarship(db, { agent, record, source, evidence, confidence }) {
    const { gaps, ...rest } = record;
    db.prepare(`INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, payload_json, category, risk, source_citation, evidence_json)
                VALUES (?, 'new_scholarship', ?, ?, ?, 'new_scholarship', ?, ?, ?)`)
        .run(agent, rest.slug, rest.title, JSON.stringify(rest), confidence === 'High' ? 'normal' : 'high', source || null,
            JSON.stringify({ confidence, evidence: evidence || [], gaps: gaps || [] }));
}

// Scout candidates already waiting, approved, published or rejected: never suggest them again
function knownProposedScholarships(db) {
    return db.prepare(`SELECT scholarship_title AS title, scholarship_id AS slug FROM agent_proposals
                       WHERE kind = 'new_scholarship' AND status IN ('pending', 'approved', 'published', 'rejected')`).all();
}

/**
 * Apply an approved field change to the scholarship and record it (changelog + activity feed).
 * Returns the changelog entry id. Throws if the value fails the format rules.
 */
function approveFieldProposal(db, proposal, actor) {
    const error = validateValue(proposal.field, proposal.new_value);
    if (error) throw new Error(`${proposal.field}: ${error}`);
    const live = db.prepare(`SELECT ${proposal.field} AS value FROM scholarships WHERE id = ?`).get(proposal.scholarship_id);
    if (!live) throw new Error(`Scholarship ${proposal.scholarship_id} not found`);

    let changelogId;
    db.transaction(() => {
        db.prepare(`UPDATE scholarships SET ${proposal.field} = ?, verified_status = 'Verified', last_verified = datetime('now') WHERE id = ?`)
            .run(storedValue(proposal.field, proposal.new_value), proposal.scholarship_id);
        changelogId = db.prepare(`INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details) VALUES (?, ?, 'reviewed_applied', ?)`)
            .run(proposal.scholarship_id, proposal.scholarship_title, JSON.stringify({
                changes: [{ field: proposal.field, old: asText(live.value), new: proposal.new_value }],
                source_citation: proposal.source_citation,
                approved_by: actor,
                proposal_id: proposal.id,
            })).lastInsertRowid;
        db.prepare(`UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ?`).run(actor, proposal.id);
        logEvent(db, { agent: proposal.agent, kind: 'approval', actor,
            summary: `Approved ${proposal.field} for "${proposal.scholarship_title}": ${asText(live.value) || '(empty)'} → ${proposal.new_value}`,
            details: { proposal_id: proposal.id, changelog_id: Number(changelogId) } });
    })();
    return Number(changelogId);
}

// Reject a proposal; the same value will never be proposed again
function rejectProposal(db, proposal, actor, note) {
    db.prepare(`UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = ? WHERE id = ?`)
        .run(actor, note || null, proposal.id);
    logEvent(db, { agent: proposal.agent, kind: 'rejection', actor,
        summary: proposal.kind === 'new_scholarship'
            ? `Rejected new scholarship "${proposal.scholarship_title}"`
            : `Rejected ${proposal.field} for "${proposal.scholarship_title}": ${proposal.new_value}`,
        details: { proposal_id: proposal.id } });
}

// Scout candidates are only marked approved here; the Scout Publisher inserts them
function approveNewScholarship(db, proposal, actor) {
    db.prepare(`UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ?`).run(actor, proposal.id);
    logEvent(db, { agent: proposal.agent, kind: 'approval', actor,
        summary: `Approved new scholarship "${proposal.scholarship_title}" (goes live when the Scout Publisher runs)`,
        details: { proposal_id: proposal.id } });
}

function runUrl() {
    const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
    return GITHUB_RUN_ID ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` : null;
}

function logEvent(db, { agent, kind, summary, details, actor }) {
    db.prepare('INSERT INTO agent_events (agent, kind, actor, summary, details_json, run_url) VALUES (?, ?, ?, ?, ?, ?)')
        .run(agent, kind, actor || `agent:${agent}`, summary, details ? JSON.stringify(details) : null, runUrl());
}

function getSetting(db, agent, key, fallback) {
    const row = db.prepare('SELECT value_json FROM agent_settings WHERE agent = ? AND key = ?').get(agent, key);
    if (!row) return fallback;
    try { return JSON.parse(row.value_json); } catch { return fallback; }
}

// Scheduled runs respect the on/off switch; runs started by hand always go ahead
function skipIfDisabled(db, agent) {
    if (process.env.GITHUB_EVENT_NAME !== 'schedule' || getSetting(db, agent, 'enabled', true)) return false;
    console.log(`⏸️  ${agent} is switched off in the command center. Skipping this scheduled run.`);
    logEvent(db, { agent, kind: 'info', summary: 'Scheduled run skipped: agent is switched off' });
    return true;
}

function getState(db, agent, key, fallback) {
    const row = db.prepare('SELECT value_json FROM agent_state WHERE agent = ? AND key = ?').get(agent, key);
    if (!row) return fallback;
    try { return JSON.parse(row.value_json); } catch { return fallback; }
}

function setState(db, agent, key, value) {
    db.prepare(`INSERT INTO agent_state (agent, key, value_json, updated_at) VALUES (?, ?, ?, datetime('now'))
                ON CONFLICT(agent, key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`)
        .run(agent, key, JSON.stringify(value));
}

module.exports = {
    AGENT_TABLES,
    FIELD_TYPES,
    ensureAgentTables,
    isUnconfirmed,
    isMinorRewrite,
    sameValue,
    classify,
    validateValue,
    storedValue,
    proposeFieldChange,
    proposeNewScholarship,
    knownProposedScholarships,
    approveFieldProposal,
    approveNewScholarship,
    rejectProposal,
    logEvent,
    getSetting,
    skipIfDisabled,
    getState,
    setState,
};
