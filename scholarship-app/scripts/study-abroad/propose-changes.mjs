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
 * Source checks (Spec D6): every source a proposal carries — the change's `source`, the file's default
 * `source`, or a `fields.official_source` value — must be on the host allowlist in
 * data/study-abroad/official-domains.json (subdomains count, lookalikes do not) or be an exact URL
 * registered in data/study-abroad/source-checks.json. A change with a refused source is not proposed: it
 * prints the reason, is counted in "refused", and (with nothing else proposed) the script exits non-zero.
 * A sa_facts `value` change additionally needs a registry entry whose value matches and whose quote is on
 * the live page; an unfetchable page fails. No page is fetched for the plain host check.
 *
 * One pending item per page + field: proposing a new value replaces a pending one with a different value
 * (marked 'superseded'); proposing the same value again bumps times_proposed. A value the owner rejected
 * is not proposed again.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { checkProposalSources, fetchPage } from '../lib/source-verify.mjs';

const require = createRequire(import.meta.url);
const { resolveTarget, connect, describe } = require('../lib/turso-target');
const sa = require('../lib/sa-inbox');

const file = process.argv.slice(2).find(a => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
if (!file) {
    console.error('Usage: node scripts/study-abroad/propose-changes.mjs <changes.json> [--target=staging|production] [--dry-run]');
    process.exit(1);
}

const dataDir = new URL('../../data/study-abroad/', import.meta.url);
const allowed = JSON.parse(readFileSync(new URL('official-domains.json', dataDir), 'utf8')).domains;
const registry = JSON.parse(readFileSync(new URL('source-checks.json', dataDir), 'utf8'));

const input = JSON.parse(readFileSync(file, 'utf8'));
const target = resolveTarget();
const { client, url } = connect(target);
console.log(`Inbox on ${target} (${describe(url)})${dryRun ? ' · dry run' : ''}`);

// Pre-flight the whole file before touching the inbox. Pure for the host check; fetches a page only
// for a sa_facts value change (to re-check a registry entry's quote).
const sourceGate = await checkProposalSources(input.changes || [], {
    allowed,
    registry,
    defaultSource: input.source || null,
    pageFor: fetchPage,
});
const refusals = new Map();   // `${table}:${key}` -> { changeReason, fields: Map(field -> reason) }
for (const refusal of sourceGate.refusals) {
    const id = `${refusal.table}:${refusal.key}`;
    if (!refusals.has(id)) refusals.set(id, { changeReason: null, fields: new Map() });
    const slot = refusals.get(id);
    if (refusal.field === null) slot.changeReason = refusal.reason;
    else slot.fields.set(refusal.field, refusal.reason);
}
const sourceWarnings = new Map(); // `${table}:${key}` -> [reason]
for (const warning of sourceGate.warnings) {
    const id = `${warning.table}:${warning.key}`;
    if (!sourceWarnings.has(id)) sourceWarnings.set(id, []);
    sourceWarnings.get(id).push(warning.field ? `${warning.field}: ${warning.reason}` : warning.reason);
}

const toText = v => (v === null || v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v));
let proposed = 0, unchanged = 0, refused = 0, bumped = 0;

for (const change of input.changes || []) {
    const { table, key } = change;
    const id = `${table}:${key}`;
    const meta = sa.TARGETS[table];
    if (!meta) { console.log(`✗ ${table}: not a Study Abroad table`); refused++; continue; }

    if (change.create) {
        // Propose creating a new page/row
        // A source refused by the D6 gate must not create a row either: the row's own official_source
        // (or the change/file citation that would become it) is not an official page.
        const gateForChange = refusals.get(id);
        if (gateForChange) {
            const reason = gateForChange.changeReason || [...gateForChange.fields.values()][0];
            console.log(`  ✗ source: ${reason}`);
            refused++;
            continue;
        }

        const row = (await client.execute({ sql: `SELECT * FROM ${table} WHERE ${meta.key} = ?`, args: [key] })).rows[0];
        if (row) { console.log(`✗ ${table}:${key}: page already exists`); refused++; continue; }

        for (const warning of sourceWarnings.get(id) || []) console.log(`  ⚠ ${warning}`);
        const rawFields = change.fields || {};
        const fields = {};
        for (const [k, v] of Object.entries(rawFields)) {
            fields[k] = toText(v);
        }
        if (!fields[meta.key]) fields[meta.key] = key;
        const source = change.source || fields.official_source || input.source || null;
        if (source && !fields.official_source) fields.official_source = source;

        let uniExists = true;
        if (table === 'sa_programs' && fields.university_slug) {
            const u = (await client.execute({ sql: 'SELECT 1 FROM sa_universities WHERE slug = ?', args: [fields.university_slug] })).rows[0];
            uniExists = !!u;
        }

        const error = sa.validateNewRow(table, fields, {
            universityExists: () => uniExists,
        });
        if (error) {
            console.log(`✗ ${table}:${key}: ${error}`);
            refused++;
            continue;
        }

        const targetId = sa.targetId(table, key);
        const title = String(fields[meta.title] || key);
        const path = sa.pagePath(table, fields);
        const newValue = JSON.stringify(fields);
        console.log(`\nNew page (draft): ${title}${path ? `  ${path}` : ''}`);

        const existing = (await client.execute({
            sql: `SELECT id, status, new_value FROM agent_proposals WHERE kind = ? AND scholarship_id = ? AND status IN ('pending', 'rejected')`,
            args: [sa.NEW_KIND, targetId],
        })).rows;

        if (existing.some(p => p.status === 'rejected' && sa.sameSaValue(p.new_value, newValue))) {
            console.log(`  ✗ you rejected this exact new page before`); refused++; continue;
        }
        const samePending = existing.find(p => p.status === 'pending' && sa.sameSaValue(p.new_value, newValue));
        if (samePending) {
            if (!dryRun) await client.execute({ sql: "UPDATE agent_proposals SET times_proposed = times_proposed + 1, last_proposed_at = datetime('now') WHERE id = ?", args: [samePending.id] });
            console.log(`  ↻ already waiting (#${samePending.id})`); bumped++; continue;
        }
        const statements = existing.filter(p => p.status === 'pending').map(p => ({
            sql: "UPDATE agent_proposals SET status = 'superseded', decided_by = 'system:replaced', decided_at = datetime('now') WHERE id = ?",
            args: [p.id],
        }));
        statements.push({
            sql: `INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value, payload_json, category, risk, source_citation, evidence_json)
                  VALUES (?, ?, ?, ?, '__new__', '', ?, ?, ?, 'normal', ?, NULL)`,
            args: [input.agent || 'content-editor', sa.NEW_KIND, targetId, title, newValue,
                JSON.stringify({ table, key, path }), sa.CATEGORY, source],
        });
        if (!dryRun) await client.batch(statements, 'write');
        console.log(`  + New page (draft)${statements.length > 1 ? ' (replaces the earlier pending version)' : ''}`);
        proposed++;
        continue;
    }

    const row = (await client.execute({ sql: `SELECT * FROM ${table} WHERE ${meta.key} = ?`, args: [key] })).rows[0];
    if (!row) { console.log(`✗ ${table}:${key}: no such page`); refused++; continue; }
    const title = String(row[meta.title] || key);
    const path = sa.pagePath(table, row);
    const source = change.source || input.source || null;
    console.log(`\n${title}${path ? `  ${path}` : ''}`);
    for (const warning of sourceWarnings.get(id) || []) console.log(`  ⚠ ${warning}`);

    const refusedChange = refusals.get(id);
    if (refusedChange && refusedChange.changeReason) {
        console.log(`  ✗ source: ${refusedChange.changeReason}`);
        refused++;
        continue;
    }

    for (const [field, raw] of Object.entries(change.fields || {})) {
        const sourceRefusal = refusedChange && refusedChange.fields.get(field);
        if (sourceRefusal) { console.log(`  ✗ ${field}: ${sourceRefusal}`); refused++; continue; }
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
