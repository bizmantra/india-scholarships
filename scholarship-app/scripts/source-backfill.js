/**
 * Source backfill: find the page each scholarship's facts come from, for the ones that have none saved yet.
 *
 * Stage 1 (fast, no AI search): check the official-source and apply links each scholarship already has. A link counts
 *   when the page can be read and is about the scholarship (lib/source-check.js). Official / provider pages are saved
 *   to source_pages, platform / listing pages to secondary_sources.
 * Stage 2 (Gemini, a batch per run): for scholarships still without an official page, search for one with the same
 *   evidence-checked research the other agents use, and also ask whether an official notice says the scheme has closed
 *   or been replaced. Saved pages go to the same two columns.
 *
 * It never changes a deadline, amount or status, and never closes a scholarship. Anything it cannot place is listed in
 * data/source-backfill-report.md for you to decide. Progress is remembered, so each run continues where the last stopped.
 *
 * Usage: node scripts/source-backfill.js [--max=20] [--only=slug] [--stage1-only] [--recheck] [--dry-run]
 *   --max          scholarships researched in stage 2 this run (default 20)
 *   --recheck      look again at scholarships already checked in the last 30 days
 *   --dry-run      report only; the database is not changed
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });
const inbox = require('./lib/agent-inbox');
const sources = require('./lib/sources');
const jev = require('./lib/jev');
const { researchFacts, compare } = require('./lib/research');
const { inspectPage } = require('./lib/source-check');
const { isSecondaryTier, sourceTier } = require('./lib/source-tiers');

const AGENT = 'source-backfill';
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const DATA = path.join(__dirname, '..', 'data');
const args = process.argv.slice(2);
const argValue = name => (args.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1];
const dryRun = args.includes('--dry-run');
const recheck = args.includes('--recheck');
const stage1Only = args.includes('--stage1-only');
const only = argValue('only');
const MAX_RESEARCH = parseInt(argValue('max') || '20', 10);
const CONCURRENCY = 6;
const FRESH_DAYS = 30;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = iso => (iso ? (Date.now() - new Date(iso).getTime()) / 86400000 : Infinity);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pool(items, size, fn) {
    const results = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
        while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
    }));
    return results;
}

// Save a checked page into the right column (same shape the agents use; see lib/sources.js)
function savePage(db, row, page, facts) {
    const secondary = isSecondaryTier(page.tier);
    const column = secondary ? 'secondary_sources' : 'source_pages';
    const current = sources.readPages(db.prepare(`SELECT ${column} FROM scholarships WHERE id = ?`).get(row.id), column);
    if (current.some(p => p.url === page.url)) return false;
    const entry = { url: page.url, ...(secondary ? { tier: page.tier, role: sources.splitUrls(row.apply_url).includes(page.url) ? 'apply' : 'info' } : {}), facts, confirmed: today() };
    if (!dryRun) db.prepare(`UPDATE scholarships SET ${column} = ? WHERE id = ?`).run(JSON.stringify([entry, ...current].slice(0, 8)), row.id);
    return true;
}

// Remove saved pages that are not real sources (our own site, unresolved Google redirects, coaching sites)
function purgeJunk(db) {
    let removed = 0;
    for (const column of ['source_pages', 'secondary_sources']) {
        for (const row of db.prepare(`SELECT id, ${column} FROM scholarships WHERE ${column} IS NOT NULL AND ${column} <> ''`).all()) {
            const pages = sources.readPages(row, column);
            const keep = pages.filter(p => !['invalid', 'coaching'].includes(sourceTier(p.url)));
            if (keep.length !== pages.length) {
                removed += pages.length - keep.length;
                if (!dryRun) db.prepare(`UPDATE scholarships SET ${column} = ? WHERE id = ?`).run(keep.length ? JSON.stringify(keep) : null, row.id);
            }
        }
    }
    if (removed) console.log(`🧹 Removed ${removed} saved page(s) that were not real sources (own site, redirect links or coaching sites)`);
}

async function stage1(db, rows, results) {
    console.log(`\n🔗 Stage 1: checking the links ${rows.length} scholarship(s) already have (Jev ${jev.enabled() ? 'on' : 'off'})`);
    let done = 0;
    await pool(rows, CONCURRENCY, async row => {
        const urls = [...new Set([...sources.splitUrls(row.official_source), ...sources.splitUrls(row.apply_url)])].slice(0, 4);
        const checks = [];
        for (const url of urls) checks.push(await inspectPage({ url, title: row.title }));
        const good = checks.filter(c => c.ok && c.specific);
        const official = good.find(c => !isSecondaryTier(c.tier));
        const secondary = good.filter(c => isSecondaryTier(c.tier));
        let saved = 0;
        if (official) saved += savePage(db, row, official, ['page']) ? 1 : 0;
        for (const s of secondary) saved += savePage(db, row, s, ['listing']) ? 1 : 0;
        const status = official ? 'found-official' : secondary.length ? 'found-secondary' :
            urls.length === 0 ? 'no-links' : checks.every(c => !c.readable) ? 'links-dead' : checks.some(c => c.readable && !c.specific) ? 'home-only' : 'not-matching';
        results[row.slug] = { ...(results[row.slug] || {}), status, checked: today(), stage: 1, links: checks.map(c => ({ url: c.url, tier: c.tier, ok: c.ok, why: c.why })) };
        if (++done % 50 === 0) console.log(`   ${done}/${rows.length}`);
    });
}

async function stage2(db, rows, results) {
    console.log(`\n🔎 Stage 2: researching ${rows.length} scholarship(s) with no official page yet`);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`[${i + 1}/${rows.length}] ${row.slug}`);
        try {
            const found = await researchFacts({
                subject: `the "${row.title}" scholarship by ${row.provider || 'its provider'}${row.state && !/all india/i.test(row.state) ? ` (${row.state})` : ''}, ${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)} cycle`,
                title: row.title,
                context: 'The goal is to find the page that states how and when to apply. Prefer the provider or government page.',
                fields: {
                    deadline: { instruction: '"YYYY-MM-DD" the student application deadline, or "" if not officially published', compare: compare.date },
                    closed_notice: { instruction: '"one short sentence quoting an official notice that this scheme has been PERMANENTLY discontinued or replaced by another scheme (say which). Do NOT report that this year\'s applications are closed, not yet open, or past their deadline: that is normal. Empty if there is no such notice"', compare: compare.text },
                },
                knownSources: sources.sourcesFor(row),
                knownSecondary: sources.secondaryFor(row),
            });
            if (found.answered === 0) throw new Error(found.errors.join(' | ') || 'no answer from the research model');
            if (!dryRun) sources.remember(db, row.id, { deadline: found.facts.deadline }, {});
            const after = db.prepare('SELECT source_pages, secondary_sources FROM scholarships WHERE id = ?').get(row.id);
            const hasOfficial = sources.readPages(after).length > 0;
            const hasSecondary = sources.readPages(after, 'secondary_sources').length > 0;
            // Only an official page, with agreeing answers, counts as a notice that the scheme has ended
            const notice = found.facts.closed_notice;
            const closed = notice?.value && notice.specificSource && ['official', 'provider'].includes(notice.tier) && ['verified', 'agreed'].includes(notice.verdict) ? { note: found.facts.closed_notice.value, source: found.facts.closed_notice.source, verdict: found.facts.closed_notice.verdict, tier: found.facts.closed_notice.tier } : null;
            results[row.slug] = {
                ...results[row.slug], stage: 2, checked: today(),
                status: closed ? 'ended-or-replaced' : hasOfficial ? 'found-official' : hasSecondary ? 'found-secondary' : 'not-found',
                ...(closed ? { closed } : {}),
            };
            console.log(`   → ${results[row.slug].status}${closed ? ` (closed notice: ${closed.note.slice(0, 80)})` : ''}`);
        } catch (error) {
            results[row.slug] = { ...results[row.slug], stage: 2, checked: today(), status: results[row.slug]?.status || 'research-failed', error: error.message.slice(0, 160) };
            console.error(`   ❌ ${error.message.slice(0, 120)}`);
        }
        if (i < rows.length - 1) await sleep(6000);
    }
}

const GROUPS = {
    'found-official': 'An official or provider page is saved',
    'found-secondary': 'Only a platform or listing page is saved: the provider page is still unconfirmed',
    'ended-or-replaced': 'An official notice says it closed or was replaced: needs your decision',
    'not-found': 'No readable page matching this scholarship was found. Government portals often block automated reading, so many of these are real: check by hand and decide',
    'links-dead': 'Existing links are dead or unreadable (not yet researched)',
    'not-matching': 'Existing links load but are not about this scholarship (not yet researched)',
    'home-only': 'Existing links are only home pages (not yet researched)',
    'no-links': 'No links at all (not yet researched)',
    'research-failed': 'Research failed this run: will retry next time',
};

function writeReport(rows, results, clicks) {
    const by = {};
    for (const r of rows) (by[results[r.slug]?.status || 'unchecked'] ||= []).push(r);
    const summary = Object.fromEntries(Object.keys(by).map(k => [k, by[k].length]));
    const lines = [`# Source backfill report (${today()})`, '', `${rows.length} active scholarships. Jev ${jev.enabled() ? 'on' : 'off'}.`, ''];
    lines.push('| Group | Scholarships | Meaning |', '|---|---|---|');
    for (const [k, why] of Object.entries(GROUPS)) if (by[k]) lines.push(`| ${k} | ${by[k].length} | ${why} |`);
    for (const k of ['ended-or-replaced', 'not-found']) {
        if (!by[k]) continue;
        lines.push('', `## ${k} (${by[k].length}): ${GROUPS[k]}`, '');
        for (const r of by[k].sort((a, b) => (clicks[b.slug] || 0) - (clicks[a.slug] || 0))) {
            const res = results[r.slug];
            lines.push(`- **${r.title}** (\`${r.slug}\`, ${clicks[r.slug] || 0} clicks)${res.closed ? `: ${res.closed.note} ${res.closed.source || ''}` : ''}`);
        }
    }
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(path.join(DATA, 'source-backfill-report.md'), lines.join('\n') + '\n');
    fs.writeFileSync(path.join(DATA, 'source-backfill-summary.json'), JSON.stringify({ date: today(), total: rows.length, groups: summary, jev: jev.stats }, null, 2));
    return summary;
}

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    sources.ensureColumn(db);
    purgeJunk(db);
    const results = inbox.getState(db, AGENT, 'results', {});
    const clicks = Object.fromEntries(db.prepare('SELECT slug, clicks FROM gsc_traffic_cache').all().map(r => [r.slug, r.clicks]));
    const rows = db.prepare(`SELECT id, slug, title, provider, state, official_source, apply_url, source_pages, secondary_sources
        FROM scholarships WHERE (status = 'Active' OR status IS NULL) ${only ? 'AND slug = ?' : ''}`).all(...(only ? [only] : []));
    const fresh = r => !recheck && !only && daysAgo(results[r.slug]?.checked) < FRESH_DAYS;
    const hasPage = r => sources.readPages(r).length > 0;

    // Stage 1: everyone not checked recently (scholarships that already have an official page are marked as found)
    const todo1 = rows.filter(r => !fresh(r));
    rows.filter(r => hasPage(r) && !results[r.slug]).forEach(r => { results[r.slug] = { status: 'found-official', checked: today(), stage: 0 }; });
    await stage1(db, todo1.filter(r => !results[r.slug] || results[r.slug].stage !== 0 || recheck), results);

    // Stage 2: highest-traffic scholarships without an official page, in batches
    if (!stage1Only) {
        const needs = rows
            .filter(r => !['found-official', 'ended-or-replaced', 'not-found'].includes(results[r.slug]?.status) || (only && results[r.slug]?.status !== 'found-official'))
            .filter(r => !(results[r.slug]?.stage === 2 && daysAgo(results[r.slug].checked) < FRESH_DAYS && !recheck && !only))
            .sort((a, b) => (clicks[b.slug] || 0) - (clicks[a.slug] || 0))
            .slice(0, MAX_RESEARCH);
        if (needs.length) await stage2(db, needs, results);
    }

    if (!dryRun) inbox.setState(db, AGENT, 'results', results);
    const summary = writeReport(rows, results, clicks);
    console.log('\n🏁 Source backfill:', JSON.stringify(summary), `| Jev calls ${jev.stats.calls}, ~${jev.stats.inputTokens} input tokens`);
    console.log('   Report: data/source-backfill-report.md');
    db.close();
}

run().catch(error => { console.error(`❌ ${error.message}`); process.exit(1); });
