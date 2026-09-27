/**
 * Traffic Watchdog
 *
 * Daily look at how the site is doing, so drops are caught within days instead of weeks:
 *   - Google search: clicks, impressions and position, last 7 days vs the 7 before (Search Console lags ~3 days)
 *   - Visits: sessions from Google Analytics, same comparison (only when GOOGLE_ANALYTICS_PROPERTY_ID is set)
 *   - Pages: the biggest search-click drops and gains by page
 *   - Health: the home page, key listing pages, the sitemap and the most-visited scholarship pages must load
 *
 * Changes nothing on the site. Saves a 'watchdog' event (shown in the Agent Center and the Morning Briefing)
 * and keeps a 60-day daily history in agent_state. Runs on the local copy: pull → watch → push.
 *
 * Usage: node scripts/traffic-watchdog.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
const g = require('./lib/google');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const AGENT = 'traffic-watchdog';
const dryRun = process.argv.includes('--dry-run');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');

// A change counts once it is this big and the earlier week had enough traffic to mean something
const DROP_WARN = -0.25;
const DROP_BAD = -0.40;
const MIN_SITE_CLICKS = 50;
const MIN_PAGE_CLICKS = 5;
const MIN_SESSIONS = 500;

const pct = (now, before) => (before > 0 ? (now - before) / before : null);
const sum = (rows, key) => rows.reduce((n, r) => n + (r[key] || 0), 0);
const fmtPct = p => (p === null ? 'n/a' : `${p >= 0 ? '+' : ''}${Math.round(p * 100)}%`);
const pagePath = url => url.replace(/^https?:\/\/[^/]+/, '') || '/';

function level(change, before, minBefore) {
    if (change === null || before < minBefore) return 'ok';
    if (change <= DROP_BAD) return 'bad';
    if (change <= DROP_WARN) return 'warn';
    return 'ok';
}

async function searchTrend() {
    // Search Console data settles after ~3 days, so compare the two most recent complete weeks
    const end = g.daysAgo(3);
    const days = await g.gscQuery({ startDate: g.isoDate(g.daysAgo(60)), endDate: g.isoDate(end), dimensions: ['date'] });
    const series = days.map(d => ({ date: d.keys[0], clicks: d.clicks, impressions: d.impressions, position: d.position }));
    const last7 = series.slice(-7);
    const prev7 = series.slice(-14, -7);
    const avgPosition = rows => (rows.length ? rows.reduce((n, r) => n + r.position, 0) / rows.length : 0);
    const clicksNow = sum(last7, 'clicks');
    const clicksBefore = sum(prev7, 'clicks');
    return {
        series,
        period: last7.length ? `${last7[0].date} to ${last7[last7.length - 1].date}` : '',
        clicks: clicksNow,
        clicksBefore,
        clicksChange: pct(clicksNow, clicksBefore),
        impressions: sum(last7, 'impressions'),
        impressionsBefore: sum(prev7, 'impressions'),
        impressionsChange: pct(sum(last7, 'impressions'), sum(prev7, 'impressions')),
        position: Math.round(avgPosition(last7) * 10) / 10,
        positionBefore: Math.round(avgPosition(prev7) * 10) / 10,
        level: level(pct(clicksNow, clicksBefore), clicksBefore, MIN_SITE_CLICKS),
    };
}

async function visitsTrend() {
    const rows = await g.ga4DailySessions(g.isoDate(g.daysAgo(60)), g.isoDate(g.daysAgo(1)));
    if (!rows) return null;
    const last7 = rows.slice(-7);
    const prev7 = rows.slice(-14, -7);
    const now = sum(last7, 'sessions');
    const before = sum(prev7, 'sessions');
    return { series: rows, sessions: now, sessionsBefore: before, change: pct(now, before), level: level(pct(now, before), before, MIN_SESSIONS) };
}

async function pageMovers() {
    const range = (from, to) => g.gscQuery({ startDate: g.isoDate(g.daysAgo(from)), endDate: g.isoDate(g.daysAgo(to)), dimensions: ['page'], rowLimit: 5000 });
    const [now, before] = await Promise.all([range(9, 3), range(16, 10)]);
    const beforeByPage = new Map(before.map(r => [r.keys[0], r.clicks]));
    const nowByPage = new Map(now.map(r => [r.keys[0], r.clicks]));
    const pages = new Set([...beforeByPage.keys(), ...nowByPage.keys()]);
    const moves = [...pages].map(url => {
        const a = beforeByPage.get(url) || 0;
        const b = nowByPage.get(url) || 0;
        return { path: pagePath(url), clicksBefore: a, clicks: b, change: pct(b, a) };
    });
    return {
        falling: moves.filter(m => m.clicksBefore >= MIN_PAGE_CLICKS && m.change !== null && m.change <= -0.5)
            .sort((x, y) => (x.clicks - x.clicksBefore) - (y.clicks - y.clicksBefore)).slice(0, 10),
        rising: moves.filter(m => m.clicks >= MIN_PAGE_CLICKS && (m.change === null || m.change >= 0.5))
            .sort((x, y) => (y.clicks - y.clicksBefore) - (x.clicks - x.clicksBefore)).slice(0, 5),
    };
}

async function healthChecks(db) {
    const top = db.prepare(`SELECT s.slug FROM scholarships s JOIN gsc_traffic_cache g ON g.slug = s.slug
                            WHERE s.status = 'Active' OR s.status IS NULL ORDER BY g.clicks DESC LIMIT 10`).all();
    const paths = ['/', '/scholarships', '/scholarships/deadlines', '/state-scholarships', '/sitemap.xml', ...top.map(t => `/scholarships/${t.slug}`)];
    const results = [];
    for (const p of paths) {
        const started = Date.now();
        try {
            const res = await fetch(`${g.SITE}${p}`, {
                redirect: 'manual',
                headers: { 'User-Agent': 'IndiaScholarships-TrafficWatchdog/1.0' },
                signal: AbortSignal.timeout(20000), // a page that does not answer in 20 s counts as failing
            });
            const ms = Date.now() - started;
            const ok = res.status >= 200 && res.status < 400;
            results.push({ path: p, status: res.status, ms, ok, slow: ms > 4000 });
        } catch (error) {
            results.push({ path: p, status: 0, ms: Date.now() - started, ok: false, error: error.message.slice(0, 120) });
        }
    }
    return { checked: results.length, failing: results.filter(r => !r.ok), slow: results.filter(r => r.ok && r.slow), results };
}

function headline(r) {
    const parts = [];
    if (r.search) {
        parts.push(`Google search clicks ${r.search.clicks} last week (${fmtPct(r.search.clicksChange)} vs the week before)`);
    }
    if (r.visits) parts.push(`visits ${r.visits.sessions.toLocaleString('en-IN')} (${fmtPct(r.visits.change)})`);
    let text = parts.join(', ') || 'No traffic data';
    if (r.health?.failing.length) text += `. ${r.health.failing.length} page(s) failed to load`;
    if (r.pages?.falling.length) text += `. ${r.pages.falling.length} page(s) lost half their search clicks`;
    return `${text}.`;
}

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    if (inbox.skipIfDisabled(db, AGENT)) { db.close(); return; }

    const report = { errors: [] };
    const attempt = async (key, fn) => {
        try { report[key] = await fn(); } catch (error) { report[key] = null; report.errors.push(`${key}: ${error.message.slice(0, 160)}`); }
    };
    await attempt('search', searchTrend);
    await attempt('visits', visitsTrend);
    await attempt('pages', pageMovers);
    await attempt('health', () => healthChecks(db));

    // Overall level: the worst of search, visits and site health
    const levels = [report.search?.level, report.visits?.level, report.health?.failing.length ? 'bad' : 'ok'].filter(Boolean);
    report.level = levels.includes('bad') ? 'bad' : levels.includes('warn') ? 'warn' : 'ok';
    report.headline = headline(report);

    // Keep a daily history (60 days) for charts later; the event itself carries only the recent part
    const history = { search: report.search?.series || [], visits: report.visits?.series || [] };
    const compact = JSON.parse(JSON.stringify(report));
    if (compact.search) compact.search.series = compact.search.series.slice(-14);
    if (compact.visits) compact.visits.series = compact.visits.series.slice(-14);
    if (compact.health) compact.health.results = undefined;

    console.log(`📈 ${report.headline}`);
    if (report.errors.length) console.log(`⚠️  ${report.errors.join(' | ')}`);
    console.log(JSON.stringify(compact, null, 2));

    if (!dryRun) {
        inbox.setState(db, AGENT, 'history', history);
        inbox.logEvent(db, {
            agent: AGENT,
            kind: 'watchdog',
            summary: report.headline,
            details: compact,
        });
        if (report.level !== 'ok') {
            inbox.logEvent(db, { agent: AGENT, kind: report.level === 'bad' ? 'run_warning' : 'info', summary: `Traffic alert: ${report.headline}` });
        }
    }
    db.close();
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'traffic-watchdog.json'), JSON.stringify(compact, null, 2));
}

run().catch(error => {
    console.error(`❌ Traffic Watchdog failed: ${error.message}`);
    process.exit(1);
});
