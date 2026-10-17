/**
 * Label every scholarship's deadline as confirmed / expected / rolling / unknown (CNT-111).
 *
 * Background: 262 of 518 active scholarships had a month-end deadline (2026-10-31 or 2026-11-30) that is an estimate
 * or an old default, shown to students as a hard date. See plans/deadline-placeholder-audit-2026-10-17.md.
 *
 * What it does, per row whose deadline is 2026-10-31 or 2026-11-30 and that has no deadline_status yet:
 *   - the description states the same date            → confirmed (deadline kept)
 *   - the description says "typically / usually / late October" → expected (the date moves to deadline_expected, deadline becomes empty)
 *   - everything else (rolling wording, different date, no date given, no description) → unknown (deadline empty, old date kept in
 *     deadline_expected for the record). Rolling schemes are NOT set to always_open here: that needs a person to read each one.
 *   - CONFIRMED_BY_OFFICIAL_PAGE below overrides these for rows an official page was read for.
 * Nothing else changes. A changelog entry (action_type 'data_cleanup') records each row's old values, and the old rows are
 * saved to a JSON file first.
 *
 * Usage: node scripts/label-deadline-status.js [--target=production|staging] [--apply]
 *   Without --apply it only prints what it would do. Needs the deadline_status and deadline_expected columns on the database.
 */
const fs = require('fs');
const path = require('path');
const { resolveTarget, connect, describe } = require('./lib/turso-target');

const MONTH_END = ['2026-10-31', '2026-11-30'];

// Read on the official page on 2026-10-17: scholarships.gov.in (NSP) "Student Application Open till : 31-10-2026"
const CONFIRMED_BY_OFFICIAL_PAGE = {
    'pm-yashasvi-scholarship': { date: '2026-10-31', source: 'https://scholarships.gov.in/All-Scholarships' },
    'post-matric-scholarship-for-students-with-disabilities-depwd': { date: '2026-10-31', source: 'https://scholarships.gov.in/All-Scholarships' },
};

const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const MN = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec';
const APPROX = /typically|usually|generally|approximate|expected|tentative|late (?:october|november)|october end|end of (?:october|november)|varies|different schemes|annually|every year|each year|around|mid-|early |applications (?:open|are open)? ?(?:from )?(?:january|february|march|april|may|june|july|august|september|october)[^.]*(?:to|-|–)|exam usually|session/i;

function datesIn(text) {
    const out = [];
    for (const m of text.matchAll(new RegExp(`\\b(${MN})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(20\\d{2}))?`, 'gi'))) out.push({ m: MONTHS[m[1].toLowerCase()], d: +m[2], y: m[3] ? +m[3] : null });
    for (const m of text.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MN})\\.?(?:,?\\s*(20\\d{2}))?`, 'gi'))) out.push({ m: MONTHS[m[2].toLowerCase()], d: +m[1], y: m[3] ? +m[3] : null });
    for (const m of text.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) out.push({ m: +m[2], d: +m[3], y: +m[1] });
    return out;
}

function classify(row) {
    if (CONFIRMED_BY_OFFICIAL_PAGE[row.slug]) return { status: 'confirmed', reason: 'official page' };
    const text = String(row.deadline_description || '').trim();
    const [fy, fm, fd] = row.deadline.split('-').map(Number);
    if (datesIn(text).some(x => x.m === fm && x.d === fd && (x.y === null || x.y === fy))) return { status: 'confirmed', reason: 'description states the same date' };
    if (APPROX.test(text)) return { status: 'expected', reason: 'description says the date is typical or approximate' };
    return { status: 'unknown', reason: text ? 'description does not give this date' : 'no description' };
}

async function run() {
    const target = resolveTarget();
    const apply = process.argv.includes('--apply');
    const { client, url } = connect(target);
    console.log(`${apply ? 'APPLY' : 'Dry run'} on ${target} (${describe(url)})`);

    const cols = (await client.execute('PRAGMA table_info(scholarships)')).rows.map(r => r.name);
    const hasColumns = ['deadline_status', 'deadline_expected'].every(c => cols.includes(c));
    if (apply && !hasColumns) throw new Error('The deadline_status / deadline_expected columns are missing on this database. Add them first.');

    const res = await client.execute({
        sql: `SELECT id, slug, title, deadline, deadline_description, always_open${hasColumns ? ', deadline_status' : ''}
              FROM scholarships WHERE status = 'Active' AND deadline IN (?, ?)`,
        args: MONTH_END,
    });
    const rows = res.rows.map(r => ({ ...r })).filter(r => !r.deadline_status);
    const counts = {};
    const plan = rows.map(r => {
        const c = classify(r);
        counts[c.status] = (counts[c.status] || 0) + 1;
        return { ...r, ...c };
    });
    console.log(`${rows.length} rows to label:`, counts);
    for (const status of ['confirmed', 'expected', 'unknown']) {
        console.log(`\n${status} (first 5):`);
        plan.filter(p => p.status === status).slice(0, 5).forEach(p => console.log(`  ${p.slug} | ${p.deadline} | ${p.reason}`));
    }
    if (!apply) return console.log('\nNothing changed. Run with --apply to write.');

    const backup = path.join(__dirname, '..', 'backups', `deadline-status-before-${target}-${new Date().toISOString().slice(0, 10)}.json`);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.writeFileSync(backup, JSON.stringify(plan, null, 1));
    console.log(`Old values saved to ${backup}`);

    const statements = [];
    for (const p of plan) {
        const keepDate = p.status === 'confirmed';
        statements.push({
            sql: 'UPDATE scholarships SET deadline_status = ?, deadline_expected = ?, deadline = ? WHERE id = ?',
            args: [p.status, keepDate ? null : p.deadline, keepDate ? p.deadline : '', p.id],
        });
        statements.push({
            sql: "INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details) VALUES (?, ?, 'data_cleanup', ?)",
            args: [p.id, p.title, JSON.stringify({
                changes: [{ field: 'deadline', old: p.deadline, new: keepDate ? p.deadline : '' }, { field: 'deadline_status', old: '', new: p.status }],
                note: `Deadline labelled "${p.status}" (${p.reason}). CNT-111.`,
                source_citation: CONFIRMED_BY_OFFICIAL_PAGE[p.slug]?.source || null,
            })],
        });
    }
    for (let i = 0; i < statements.length; i += 100) await client.batch(statements.slice(i, i + 100), 'write');
    console.log(`Labelled ${plan.length} scholarships.`);
}

run().catch(error => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
});
