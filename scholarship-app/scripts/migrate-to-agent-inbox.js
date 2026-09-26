/**
 * One-time move of old agent proposals into the agent inbox.
 *
 * Before the inbox, agents logged proposals as scholarship_changelog rows with
 * action_type = 'pending_review', one row per run, so the same change piled up day after day.
 * This script:
 *   - collapses them to one proposal per scholarship + field (the latest proposed value),
 *     counting how many times it was proposed;
 *   - compares against the value that is live now (not the value at proposal time);
 *   - files blank / "not found" answers and badly formatted values as 'dismissed' (kept for the record,
 *     never shown as work);
 *   - files description rewrites without a date change as 'wording' so they can be cleared in bulk;
 *   - marks the old changelog rows 'moved_to_inbox' so nothing is processed twice.
 *
 * Safe to run again: it only picks up rows still marked 'pending_review'.
 * Works on the local copy: pull → migrate → push.
 *
 * Usage: node scripts/migrate-to-agent-inbox.js [--dry-run]
 */
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');

const dryRun = process.argv.includes('--dry-run');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const text = v => (v === null || v === undefined ? '' : String(v).trim());

function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);

    const logs = db.prepare(`SELECT id, scholarship_id, scholarship_title, details, timestamp FROM scholarship_changelog
                             WHERE action_type = 'pending_review' ORDER BY id ASC`).all();
    console.log(`📋 ${logs.length} old pending_review row(s) across ${new Set(logs.map(l => l.scholarship_id)).size} scholarship(s)`);
    if (logs.length === 0) {
        db.close();
        return;
    }

    // Group every proposed change by scholarship + field, oldest first
    const groups = new Map();
    let unreadable = 0;
    for (const log of logs) {
        let details;
        try { details = JSON.parse(log.details); } catch { unreadable++; continue; }
        for (const change of details.changes || []) {
            const key = `${log.scholarship_id}\u0000${change.field}`;
            if (!groups.has(key)) groups.set(key, { scholarshipId: log.scholarship_id, title: log.scholarship_title, field: change.field, items: [] });
            groups.get(key).items.push({ value: text(change.new), at: log.timestamp, source: details.source_citation || null });
        }
    }

    const scholarship = db.prepare('SELECT * FROM scholarships WHERE id = ?');
    const insert = db.prepare(`INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value,
        category, risk, source_citation, status, times_proposed, first_proposed_at, last_proposed_at, decided_by, decided_at, decision_note)
        VALUES (?, 'field_change', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const counts = { date_change: 0, amount_change: 0, link_change: 0, contact_change: 0, wording: 0,
        dismissed_blank: 0, dismissed_invalid: 0, already_live: 0, unsupported: 0, missing_scholarship: 0 };

    // Deadlines first, so a description can tell whether its date is changing too
    const ordered = [...groups.values()].sort((a, b) => (a.field === 'deadline' ? 0 : 1) - (b.field === 'deadline' ? 0 : 1));
    const datesChanging = new Set();

    const migrate = db.transaction(() => {
        for (const g of ordered) {
            if (!inbox.FIELD_TYPES[g.field]) { counts.unsupported++; continue; }
            const live = scholarship.get(g.scholarshipId);
            if (!live) { counts.missing_scholarship++; continue; }

            const latest = g.items[g.items.length - 1];
            const same = g.items.filter(i => i.value === latest.value);
            const current = text(live[g.field]);
            const agent = ['deadline', 'deadline_description'].includes(g.field) ? 'deadline-freshness' : 'weekly-enrichment';
            const base = [agent, g.scholarshipId, g.title || live.title, g.field, current, latest.value];
            const timing = [same.length, same[0].at, latest.at];

            if (inbox.sameValue(g.field, current, latest.value)) { counts.already_live++; continue; }

            const blank = inbox.isUnconfirmed(g.field, latest.value);
            const invalid = !blank && inbox.validateValue(g.field, latest.value);
            if (blank || invalid) {
                counts[blank ? 'dismissed_blank' : 'dismissed_invalid']++;
                const note = blank ? 'The agent could not find a value (blank answer), so this was never a real change'
                    : `Value in the wrong format: ${invalid}`;
                insert.run(...base, blank ? 'risky_blank' : 'invalid', 'high', latest.source, 'dismissed', ...timing, 'system:migration', new Date().toISOString(), note);
                continue;
            }

            // Same rules the agents use from now on; rewordings land in the 'wording' group for bulk clear-out
            const { category, risk } = inbox.classify(g.field, current, latest.value, { withDateChange: datesChanging.has(g.scholarshipId) });
            if (g.field === 'deadline' && category === 'date_change') datesChanging.add(g.scholarshipId);
            counts[category] = (counts[category] || 0) + 1;
            insert.run(...base, category, risk, latest.source, 'pending', ...timing, null, null, null);
        }

        db.prepare(`UPDATE scholarship_changelog SET action_type = 'moved_to_inbox' WHERE action_type = 'pending_review'`).run();
        inbox.logEvent(db, {
            agent: 'command-center',
            kind: 'info',
            actor: 'system:migration',
            summary: `Moved ${logs.length} old proposals into the inbox: ${counts.date_change + counts.amount_change + counts.link_change + counts.contact_change} to review, ` +
                `${counts.wording} wording-only, ${counts.dismissed_blank + counts.dismissed_invalid} dismissed as not real changes`,
            details: counts,
        });
        if (dryRun) throw new Error('DRY_RUN');
    });

    try {
        migrate();
    } catch (error) {
        if (error.message !== 'DRY_RUN') throw error;
    }
    db.close();

    console.log(`\n${dryRun ? '🧪 Dry run (nothing saved)' : '✅ Migrated'}:`);
    console.log(`   To review, deadlines:             ${counts.date_change} field(s)`);
    console.log(`   To review, amounts:               ${counts.amount_change}`);
    console.log(`   To review, links (new website):   ${counts.link_change}`);
    console.log(`   To review, missing helplines:     ${counts.contact_change}`);
    console.log(`   Wording only (bulk clear-out):   ${counts.wording}`);
    console.log(`   Dismissed, blank answer:          ${counts.dismissed_blank}`);
    console.log(`   Dismissed, wrong format:          ${counts.dismissed_invalid}`);
    console.log(`   Already live, nothing to do:      ${counts.already_live}`);
    if (counts.unsupported || counts.missing_scholarship || unreadable) {
        console.log(`   Skipped: ${counts.unsupported} unsupported field(s), ${counts.missing_scholarship} missing scholarship(s), ${unreadable} unreadable row(s)`);
    }
}

run();
