/**
 * Fact Check
 *
 * Re-checks the facts students act on, on pages that already look complete: annual and minimum amount,
 * family income limit and the apply link. (Replaces the research part of Weekly Enrichment, which re-wrote
 * page text without approval.) Every finding goes to the inbox with its evidence (lib/research.js):
 * the official page, the exact sentence, whether two independent answers agree and whether the sentence was
 * found on that page. Nothing on the site changes until the owner approves.
 *
 * Order: pages the Traffic Watchdog saw losing search clicks, then the most visited, skipping pages checked in
 * the last recheck_days. Capped at max_checks per run.
 * Runs on the local copy: pull → check → push.
 *
 * Usage: node scripts/fact-check.js [--dry-run] [--max=40] [--only=<slug>]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
const { researchFacts, compare, evidenceFor } = require('./lib/research');
const sources = require('./lib/sources');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const AGENT = 'fact-check';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const argValue = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');

const FIELDS = {
    amount_annual: { instruction: 'the largest annual award in rupees as a whole number, or 0', compare: compare.int },
    amount_min: { instruction: 'the smallest award in rupees as a whole number (for a fixed award, the same as the annual amount), or 0', compare: compare.int },
    income_limit: { instruction: 'the maximum annual family income allowed, in rupees as a whole number, or 0 if there is no limit or it is not stated', compare: compare.int },
    apply_url: { instruction: '"the official web address where students apply (must start with http)"', compare: compare.url },
};

// Pages the latest Traffic Watchdog report saw losing half their search clicks
function fallingSlugs(db) {
    const row = db.prepare(`SELECT details_json FROM agent_events WHERE kind = 'watchdog' ORDER BY id DESC LIMIT 1`).get();
    try {
        return (JSON.parse(row?.details_json || '{}').pages?.falling || [])
            .map(p => (p.path.match(/^\/scholarships\/([^/]+)$/) || [])[1]).filter(Boolean);
    } catch {
        return [];
    }
}

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    sources.ensureColumn(db);
    if (inbox.skipIfDisabled(db, AGENT)) { db.close(); return; }
    const max = parseInt(argValue('max') || inbox.getSetting(db, AGENT, 'max_checks', 40), 10);
    const recheckDays = inbox.getSetting(db, AGENT, 'recheck_days', 28);
    const only = argValue('only');
    const checkedAt = inbox.getState(db, AGENT, 'checked_at', {});
    const cutoff = Date.now() - recheckDays * 86400000;

    const rows = db.prepare(`
        SELECT s.*, COALESCE(g.clicks, 0) AS clicks FROM scholarships s LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug
        WHERE (s.status = 'Active' OR s.status IS NULL) ${only ? 'AND s.slug = ?' : ''} ORDER BY clicks DESC`).all(...(only ? [only] : []));
    const falling = new Set(fallingSlugs(db));
    const due = rows
        .filter(s => only || !(checkedAt[s.slug] && new Date(checkedAt[s.slug]).getTime() > cutoff))
        .sort((a, b) => Number(falling.has(b.slug)) - Number(falling.has(a.slug)) || b.clicks - a.clicks)
        .slice(0, max);
    console.log(`🔎 Fact Check: ${due.length} scholarship(s) this run (${falling.size} flagged by the Traffic Watchdog)`);

    const report = { checked: 0, proposals: 0, verdicts: {}, outcomes: {}, failed: [], fromWatchdog: 0 };
    const bump = (bucket, key) => { report[bucket][key] = (report[bucket][key] || 0) + 1; };

    for (const s of due) {
        if (falling.has(s.slug)) report.fromWatchdog++;
        console.log(`\n📄 ${s.slug} (${s.clicks} clicks)${falling.has(s.slug) ? ' · losing search clicks' : ''}`);
        let result;
        try {
            result = await researchFacts({
                subject: `the "${s.title}" scholarship by ${s.provider || 'its provider'}${s.state && !/all india/i.test(s.state) ? ` (${s.state})` : ''}, current (2026-27) cycle`,
                fields: FIELDS,
                knownSources: sources.sourcesFor(s),
        knownSecondary: sources.secondaryFor(s),
            });
        } catch (error) {
            report.failed.push({ slug: s.slug, error: error.message.slice(0, 160) });
            continue;
        }
        if (result.answered === 0) { report.failed.push({ slug: s.slug, error: result.errors.join(' | ') }); continue; }
        report.checked++;
        sources.remember(db, s.id, result.facts, { dryRun });
        checkedAt[s.slug] = new Date().toISOString();

        for (const [field, fact] of Object.entries(result.facts)) {
            bump('verdicts', fact.verdict);
            if (fact.verdict === 'none') continue;
            const outcome = dryRun
                ? (inbox.sameValue(field, s[field], fact.value) ? 'unchanged' : 'created')
                : inbox.proposeFieldChange(db, {
                    agent: AGENT, scholarshipId: s.id, scholarshipTitle: s.title, field,
                    oldValue: s[field], newValue: fact.value, source: fact.source, evidence: evidenceFor(fact),
                });
            bump('outcomes', outcome);
            if (outcome === 'created' || outcome === 'superseded') {
                report.proposals++;
                console.log(`   📝 ${field}: ${s[field] ?? '(empty)'} → ${fact.value}  [${fact.verdict}${fact.reason ? `: ${fact.reason}` : ''}] ${fact.source}`);
            }
        }
    }

    if (!dryRun) {
        const kept = Object.fromEntries(Object.entries(checkedAt).filter(([, at]) => new Date(at).getTime() > cutoff));
        inbox.setState(db, AGENT, 'checked_at', kept);
    }
    const summary = `Fact-checked ${report.checked} scholarship(s)` +
        (report.fromWatchdog ? ` (${report.fromWatchdog} losing search clicks)` : '') +
        `: ${report.proposals} proposal(s); verified ${report.verdicts.verified || 0}, agreed ${report.verdicts.agreed || 0}, uncertain ${report.verdicts.uncertain || 0}` +
        (report.failed.length ? `; ${report.failed.length} failed` : '');
    console.log(`\n🏁 ${summary}`);
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'fact-check-summary.json'), JSON.stringify(report, null, 2));
    if (!dryRun) inbox.logEvent(db, { agent: AGENT, kind: report.failed.length ? 'run_warning' : 'run_finished', summary, details: report });
    db.close();
}

run().catch(error => {
    console.error(`❌ Fact Check failed: ${error.message}`);
    process.exit(1);
});
