/**
 * Submit Study Abroad page changes to the agent inbox, for the owner to approve in /admin/agents.
 * Nothing on the site changes until a proposal is approved.
 *
 *   node scripts/study-abroad/propose-changes.mjs <changes.json> [--target=staging|production] [--dry-run]
 *
 * changes.json:
 *   {
 *     "agent": "content-editor",                      // shown on the card; default "content-editor"
 *     "source": "https://www.tum.de/en/studies/fees/tuition",   // default official source for every change
 *     "changes": [
 *       { "table": "sa_universities", "key": "tum-technical-university-munich",
 *         "source": "https://...",                    // optional, overrides the default
 *         "fields": { "summary": "...", "body_md": "...", "faq_json": [ { "q": "...", "a": "..." } ], "checked_at": "2026-10-11" } }
 *     ]
 *   }
 *
 * A field value may be a string, number, or (for JSON fields) an object/array. A field whose value equals
 * the live value is skipped. Rules (allowed fields, formats, research-note phrases, sources) come from
 * scripts/lib/sa-inbox.js, the same rules the command center checks on approval.
 *
 * One pending item per page + field: proposing a new value replaces a pending one with a different value
 * (marked 'superseded'); proposing the same value again bumps times_proposed. A value the owner rejected
 * is not proposed again.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { resolveTarget, connect, describe } = require('../lib/turso-target');
const sa = require('../lib/sa-inbox');

const file = process.argv.slice(2).find(a => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
if (!file) {
    console.error('Usage: node scripts/study-abroad/propose-changes.mjs <changes.json> [--target=staging|production] [--dry-run]');
    process.exit(1);
}

const input = JSON.parse(readFileSync(file, 'utf8'));
const target = resolveTarget();
const { client, url } = connect(target);
console.log(`Inbox on ${target} (${describe(url)})${dryRun ? ' · dry run' : ''}`);

const toText = v => (v === null || v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v));
let proposed = 0, unchanged = 0, refused = 0, bumped = 0;

for (const change of input.changes || []) {
    const { table, key } = change;
    const meta = sa.TARGETS[table];
    if (!meta) { console.log(`✗ ${table}: not a Study Abroad table`); refused++; continue; }
    const row = (await client.execute({ sql: `SELECT * FROM ${table} WHERE ${meta.key} = ?`, args: [key] })).rows[0];
    if (!row) { console.log(`✗ ${table}:${key}: no such page`); refused++; continue; }
    const title = String(row[meta.title] || key);
    const path = sa.pagePath(table, row);
    const source = change.source || input.source || null;
    console.log(`\n${title}${path ? `  ${path}` : ''}`);

    for (const [field, raw] of Object.entries(change.fields || {})) {
        const newValue = toText(raw);
        const error = sa.validateSaValue(table, field, newValue, { source });
        if (error) { console.log(`  ✗ ${field}: ${error}`); refused++; continue; }
        const oldValue = row[field] === null || row[field] === undefined ? null : String(row[field]);
        if (sa.sameSaValue(oldValue, newValue)) { console.log(`  = ${field}: already live`); unchanged++; continue; }

        const targetId = sa.targetId(table, key);
        const existing = (await client.execute({
            sql: `SELECT id, status, new_value FROM agent_proposals WHERE kind = ? AND scholarship_id = ? AND field = ? AND status IN ('pending', 'rejected')`,
            args: [sa.KIND, targetId, field],
        })).rows;
        if (existing.some(p => p.status === 'rejected' && sa.sameSaValue(p.new_value, newValue))) {
            console.log(`  ✗ ${field}: you rejected this exact value before`); refused++; continue;
        }
        const samePending = existing.find(p => p.status === 'pending' && sa.sameSaValue(p.new_value, newValue));
        if (samePending) {
            if (!dryRun) await client.execute({ sql: "UPDATE agent_proposals SET times_proposed = times_proposed + 1, last_proposed_at = datetime('now') WHERE id = ?", args: [samePending.id] });
            console.log(`  ↻ ${field}: already waiting (#${samePending.id})`); bumped++; continue;
        }
        const statements = existing.filter(p => p.status === 'pending').map(p => ({
            sql: "UPDATE agent_proposals SET status = 'superseded', decided_by = 'system:replaced', decided_at = datetime('now') WHERE id = ?",
            args: [p.id],
        }));
        statements.push({
            sql: `INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value, payload_json, category, risk, source_citation, evidence_json)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', ?, NULL)`,
            args: [input.agent || 'content-editor', sa.KIND, targetId, title, field, oldValue, newValue,
                JSON.stringify({ table, key, path }), sa.CATEGORY, source],
        });
        if (!dryRun) await client.batch(statements, 'write');
        console.log(`  + ${sa.LABELS[field] || field}${statements.length > 1 ? ' (replaces the earlier pending version)' : ''}`);
        proposed++;
    }
}

if (!dryRun && proposed) {
    await client.execute({
        sql: 'INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)',
        args: [input.agent || 'content-editor', 'proposals', `agent:${input.agent || 'content-editor'}`,
            `Proposed ${proposed} Study Abroad change(s) for your approval`, JSON.stringify({ file: String(file).split('/').pop() })],
    });
}
console.log(`\nProposed ${proposed}, already waiting ${bumped}, unchanged ${unchanged}, refused ${refused}.${dryRun ? ' (dry run: nothing written)' : ''}`);
process.exit(refused && !proposed ? 1 : 0);
