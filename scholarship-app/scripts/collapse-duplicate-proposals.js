/**
 * Keeps the agent inbox at one pending item per scholarship + field.
 *
 * On production the first Weekly Enrichment run after the inbox was introduced filed fresh proposals
 * before the one-time migration moved the old backlog in, so some fields ended up with two pending items.
 * For each such field this keeps the most recently proposed item, adds the others' proposal counts to it
 * when they propose the same value, and marks the others 'superseded'. Nothing on the site changes.
 *
 * Safe to run any time: it does nothing when there are no duplicates.
 * Works on the local copy: pull → collapse → push.
 *
 * Usage: node scripts/collapse-duplicate-proposals.js [--dry-run]
 */
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');

const dryRun = process.argv.includes('--dry-run');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');

function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    const pending = db.prepare(`SELECT id, scholarship_id, field, new_value, times_proposed, last_proposed_at FROM agent_proposals
                                WHERE status = 'pending' AND kind = 'field_change' ORDER BY scholarship_id, field`).all();
    const groups = new Map();
    for (const p of pending) {
        const key = `${p.scholarship_id}\u0000${p.field}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(p);
    }

    const supersede = db.prepare(`UPDATE agent_proposals SET status = 'superseded', decided_by = 'system:dedupe', decided_at = datetime('now'),
                                  decision_note = 'Duplicate of a newer proposal for the same field' WHERE id = ?`);
    const addCount = db.prepare('UPDATE agent_proposals SET times_proposed = times_proposed + ? WHERE id = ?');
    let collapsed = 0;
    let fields = 0;

    const apply = db.transaction(() => {
        for (const items of groups.values()) {
            if (items.length < 2) continue;
            fields++;
            // Newest proposal wins (latest last_proposed_at, then highest id)
            items.sort((a, b) => String(b.last_proposed_at).localeCompare(String(a.last_proposed_at)) || b.id - a.id);
            const [keep, ...rest] = items;
            for (const other of rest) {
                if (other.new_value === keep.new_value) addCount.run(other.times_proposed || 1, keep.id);
                supersede.run(other.id);
                collapsed++;
            }
        }
        if (collapsed > 0) {
            inbox.logEvent(db, {
                agent: 'command-center',
                kind: 'info',
                actor: 'system:dedupe',
                summary: `Merged ${collapsed} duplicate inbox item(s) across ${fields} field(s); one item per field remains`,
                details: { collapsed, fields },
            });
        }
        if (dryRun) throw new Error('DRY_RUN');
    });
    try {
        apply();
    } catch (error) {
        if (error.message !== 'DRY_RUN') throw error;
    }
    db.close();
    console.log(`${dryRun ? '🧪 Dry run: would merge' : '✅ Merged'} ${collapsed} duplicate pending item(s) across ${fields} field(s).`);
}

run();
