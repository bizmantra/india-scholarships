/**
 * Study Abroad facts freshness (spec D4): which money and visa numbers are stale or unsourced?
 *
 * Read-only. It never writes to a database: it reads the facts and the money fields, flags the ones that need a
 * re-check, and writes a worklist file the Command Center shows. Re-checking and proposing is somebody else's job
 * (Hermes through the bridge, or `propose-changes.mjs`).
 *
 *   node scripts/study-abroad/facts-freshness.mjs [--target=production|staging] [--out=<path>]
 *
 * The Command Center reads the output file (`data/study-abroad/facts-worklist.json`), so run this and commit the
 * change when you want the numbers there to be current.
 *
 * Flags on a fact:
 *   no_source        no official_source: nothing says where the number came from
 *   no_check_date    no checked_at: nobody wrote down when it was last read
 *   stale_check      checked_at is older than 90 days
 *   recheck_due      recheck_after has passed
 * Flags on a published university/program money field:
 *   no_provenance    the row has no official_source or no checked_at for a number it shows
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveTarget, connect, describe } = require('../lib/turso-target');

export const STALE_DAYS = 90;
export const STALE_FLAGS = ['no_source', 'no_check_date', 'stale_check', 'recheck_due'];

/** Whole days between an ISO date (YYYY-MM-DD) and today, or null when the date is missing or unreadable. */
export function daysSince(date, today) {
    const text = String(date || '').trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const then = Date.parse(`${text}T00:00:00Z`);
    const now = Date.parse(`${String(today).slice(0, 10)}T00:00:00Z`);
    if (!Number.isFinite(then) || !Number.isFinite(now)) return null;
    // Reject dates that parse but roll over, such as 2026-13-45
    if (new Date(then).toISOString().slice(0, 10) !== text) return null;
    return Math.round((now - then) / 86400000);
}

/**
 * Classify one sa_facts row. Pure, so the rules can be tested without a database.
 * `today` is YYYY-MM-DD (injected so a test does not depend on the clock).
 */
export function classifyFact(fact, today) {
    const flags = [];
    const source = String(fact.official_source || '').trim();
    const checked = String(fact.checked_at || '').trim();
    const recheck = String(fact.recheck_after || '').trim();

    if (!source) flags.push('no_source');
    // An unreadable date is as bad as none: it cannot be judged stale
    const age = daysSince(checked, today);
    if (!checked || age === null) flags.push('no_check_date');
    if (age !== null && age > STALE_DAYS) flags.push('stale_check');
    if (recheck && recheck.slice(0, 10) < String(today).slice(0, 10)) flags.push('recheck_due');

    const reasons = {
        no_source: 'no official source recorded',
        no_check_date: 'no valid check date recorded',
        stale_check: `last checked ${age} days ago (over ${STALE_DAYS})`,
        recheck_due: `re-check was due on ${recheck.slice(0, 10)}`,
    };
    return {
        key: String(fact.key),
        label: fact.label ?? null,
        value: fact.value ?? null,
        unit: fact.unit ?? null,
        source: source || null,
        last_checked: checked || null,
        recheck_after: recheck || null,
        age_days: age,
        flags,
        why: flags.map(f => reasons[f]).join('; '),
    };
}

/** A published university or program shows a money number that nothing vouches for. Pure. */
export function classifyMoneyRow(row, table) {
    const fields = [];
    const source = String(row.official_source || '').trim();
    const checked = String(row.checked_at || '').trim();
    if (!source) fields.push('no official source');
    if (!checked) fields.push('no check date');
    if (!fields.length) return null;
    const money = {};
    for (const f of ['tuition_per_year', 'tuition_currency', 'living_cost_per_year', 'living_currency']) {
        if (row[f] !== null && row[f] !== undefined && row[f] !== '') money[f] = row[f];
    }
    if (!Object.keys(money).length) return null;
    return {
        table,
        key: String(table === 'sa_programs' ? row.id : row.slug),
        title: row.title ?? row.name ?? null,
        country: row.country ?? null,
        money,
        flags: ['no_provenance'],
        why: `shows money figures but has ${fields.join(' and ')}`,
    };
}

/** Summarise a worklist for the Command Center (kept here so the route and the script agree). */
export function summarise(items, moneyRows) {
    const byFlag = {};
    for (const item of items) for (const flag of item.flags) byFlag[flag] = (byFlag[flag] || 0) + 1;
    return {
        facts: items.length,
        flagged: items.filter(i => i.flags.length).length,
        by_flag: byFlag,
        money_rows_flagged: moneyRows.length,
        worst: items.filter(i => i.flags.length).sort((a, b) => b.flags.length - a.flags.length).slice(0, 10),
    };
}

export async function collect(target = 'production') {
    const { client, url } = connect(target);
    const query = async (sql) => (await client.execute(sql)).rows;

    const facts = await query('SELECT key, label, value, unit, official_source, checked_at, recheck_after FROM sa_facts ORDER BY key');
    const universities = await query("SELECT slug, name, country, tuition_per_year, tuition_currency, living_cost_per_year, living_currency, official_source, checked_at FROM sa_universities WHERE status = 'published'");
    const programs = await query("SELECT id, title, country, tuition_per_year, tuition_currency, living_cost_per_year, living_currency, official_source, checked_at FROM sa_programs WHERE status = 'published'");

    const today = new Date().toISOString().slice(0, 10);
    const items = facts.map(f => classifyFact(f, today));
    const moneyRows = [
        ...universities.map(r => classifyMoneyRow(r, 'sa_universities')),
        ...programs.map(r => classifyMoneyRow(r, 'sa_programs')),
    ].filter(Boolean);
    return { today, target, database: describe(url), items, moneyRows, summary: summarise(items, moneyRows) };
}

export async function run({ target = resolveTarget(), out = 'data/study-abroad/facts-worklist.json', log = console.log } = {}) {
    const { today, database, items, moneyRows, summary } = await collect(target);
    const worklist = {
        generated_at: new Date().toISOString(),
        today,
        target,
        database,
        rules: { stale_after_days: STALE_DAYS, flags: [...STALE_FLAGS, 'no_provenance'] },
        counts: summary,
        items: items.filter(i => i.flags.length),
        money_without_provenance: moneyRows,
    };
    writeFileSync(out, JSON.stringify(worklist, null, 2) + '\n');

    log(`Facts freshness · ${target} (${database}) · ${today}`);
    log(`${items.length} facts · ${summary.flagged} need a look${summary.flagged ? ` (${Object.entries(summary.by_flag).map(([f, n]) => `${f} ${n}`).join(', ')})` : ''}`);
    if (moneyRows.length) log(`${moneyRows.length} published page(s) show money figures with no provenance`);
    for (const item of worklist.items.slice(0, 15)) log(`  ✗ ${item.key}: ${item.why}`);
    if (worklist.items.length > 15) log(`  … ${worklist.items.length - 15} more in ${out}`);
    log(`Written to ${out}`);
    return { code: 0, worklist };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const arg = process.argv.slice(2).find(a => a.startsWith('--out='));
    const { code } = await run({ out: arg ? arg.split('=')[1] : 'data/study-abroad/facts-worklist.json' });
    process.exit(code);
}
