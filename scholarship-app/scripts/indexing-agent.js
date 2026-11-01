/**
 * Indexing agent
 *
 * Makes sure search engines see changes quickly and that important pages are actually indexed:
 *   1. Pages changed in the last day (approved changes, tidy-ups, new scholarships, new articles and news)
 *      are sent to each IndexNow engine separately (Yandex, Bing). The key file is public/<key>.txt.
 *   2. When anything changed, the sitemap is re-submitted to Google through Search Console.
 *   3. A rotating sample of important pages (most visited, newly added, just changed) is checked with
 *      Google's URL Inspection, and pages Google has not indexed are reported.
 *
 * It does not use Google's Indexing API: Google allows that only for job postings and livestreams.
 * Changes nothing on the site. Saves an 'indexing' event and the last inspection of each page (agent_state).
 * On a staging run nothing is submitted; the report shows what would have been.
 *
 * Usage: node scripts/indexing-agent.js [--dry-run] [--inspect=40] [--submit]
 *   Outside GitHub Actions nothing is submitted unless --submit is given.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
const g = require('./lib/google');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const AGENT = 'indexing';
const args = process.argv.slice(2);
const argValue = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const target = process.env.DB_TARGET || 'production';
const dryRun = args.includes('--dry-run');
// Submitting to search engines only happens for the live site, from the scheduled/started workflow in GitHub Actions
// (or when asked explicitly with --submit), so a test run on a laptop never pings search engines
const submit = !dryRun && target === 'production' && (process.env.GITHUB_ACTIONS === 'true' || args.includes('--submit'));
const APP_DIR = path.join(__dirname, '..');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(APP_DIR, 'data', 'scholarships.db');
const INDEXNOW_KEY = 'c0326e5e8e894b92b67f1b7454efb507';
const LOCALES = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];
const RECHECK_DAYS = 7;

// Scholarship pages changed in the last day, from the changelog
function changedScholarships(db) {
    return db.prepare(`
        SELECT DISTINCT s.slug, c.action_type FROM scholarship_changelog c JOIN scholarships s ON s.id = c.scholarship_id
        WHERE c.timestamp >= datetime('now', '-26 hours')
          AND c.action_type IN ('reviewed_applied', 'auto_fix', 'scout_added', 'undo', 'UPDATE', 'VERIFY', 'AUTO_ENRICH_AMOUNT')
          AND (s.status = 'Active' OR s.status IS NULL)`).all();
}

// Articles, guides and news added or edited in the last day (needs git history in the checkout)
function changedContent() {
    try {
        const out = execSync('git log --since="26 hours ago" --name-only --pretty=format:"" -- content', { cwd: APP_DIR, encoding: 'utf8' });
        return [...new Set(out.split('\n').map(f => f.trim()).filter(Boolean))].map(f => {
            const m = f.match(/content\/(articles|pillars|news)\/([^/]+)\.md$/);
            if (!m) return null;
            return m[1] === 'news' ? `/news/${m[2]}` : `/guides/${m[2]}`;
        }).filter(Boolean);
    } catch {
        return [];
    }
}

// Each IndexNow engine is asked separately, so one refusing (e.g. Bing before the site is verified there) does not
// stop the others from hearing about changed pages
const INDEXNOW_ENGINES = { Yandex: 'https://yandex.com/indexnow', Bing: 'https://www.bing.com/indexnow' };

async function indexNow(urls) {
    const body = JSON.stringify({ host: new URL(g.SITE).host, key: INDEXNOW_KEY, keyLocation: `${g.SITE}/${INDEXNOW_KEY}.txt`, urlList: urls });
    const results = {};
    for (const [engine, endpoint] of Object.entries(INDEXNOW_ENGINES)) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body,
                signal: AbortSignal.timeout(30000),
            });
            const accepted = res.status === 200 || res.status === 202;
            results[engine] = accepted ? 'accepted' : `refused (${res.status}: ${(await res.text()).slice(0, 100)})`;
        } catch (error) {
            results[engine] = `error (${error.message.slice(0, 80)})`;
        }
    }
    return results;
}

// Which pages to ask Google about this run: never checked or checked over a week ago, most important first
function pagesToInspect(db, changedPaths, status, limit) {
    const top = db.prepare(`SELECT '/scholarships/' || s.slug AS path FROM scholarships s JOIN gsc_traffic_cache g ON g.slug = s.slug
                            WHERE s.status = 'Active' OR s.status IS NULL ORDER BY g.clicks DESC LIMIT 30`).all().map(r => r.path);
    const fresh = db.prepare(`SELECT DISTINCT '/scholarships/' || s.slug AS path FROM scholarship_changelog c JOIN scholarships s ON s.id = c.scholarship_id
                              WHERE c.action_type = 'scout_added' AND c.timestamp >= datetime('now', '-30 days')`).all().map(r => r.path);
    const core = ['/', '/scholarships', '/scholarships/deadlines', '/state-scholarships'];
    const candidates = [...new Set([...fresh, ...changedPaths, ...core, ...top])];
    const stale = p => !status[p] || Date.now() - new Date(status[p].checkedAt).getTime() > RECHECK_DAYS * 86400000;
    return { candidates, pick: candidates.filter(stale).slice(0, limit), newPages: new Set(fresh) };
}

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    if (inbox.skipIfDisabled(db, AGENT)) { db.close(); return; }
    const inspectLimit = parseInt(argValue('inspect') || inbox.getSetting(db, AGENT, 'inspect_per_run', 40), 10);

    const report = { target, submitted: submit, errors: [] };

    // 1. What changed
    const changed = changedScholarships(db);
    const scholarshipPaths = changed.map(c => `/scholarships/${c.slug}`);
    const contentPaths = changedContent();
    const listingPaths = changed.length ? ['/scholarships', '/scholarships/deadlines', '/scholarships/recently-added'] : [];
    const paths = [...new Set([...scholarshipPaths, ...scholarshipPaths.flatMap(p => LOCALES.map(l => `/${l}${p}`)), ...contentPaths, ...listingPaths])];
    report.changed = { scholarships: scholarshipPaths.length, content: contentPaths.length, urls: paths.length, sample: paths.slice(0, 10) };

    // 2. Tell search engines
    if (paths.length && submit) {
        report.indexNow = await indexNow(paths.map(p => `${g.SITE}${p}`));
        Object.entries(report.indexNow).filter(([, r]) => r !== 'accepted').forEach(([engine, r]) => report.errors.push(`IndexNow ${engine}: ${r}`));
        try { await g.submitSitemap(); report.sitemapSubmitted = true; } catch (e) { report.errors.push(`Sitemap: ${e.message.slice(0, 160)}`); }
    }

    // 3. Ask Google which important pages are indexed
    const status = inbox.getState(db, AGENT, 'index_status', {});
    const { candidates, pick, newPages } = pagesToInspect(db, scholarshipPaths, status, inspectLimit);
    let inspected = 0;
    for (const p of pick) {
        try {
            const r = await g.inspectUrl(`${g.SITE}${p}`);
            status[p] = { ...r, checkedAt: new Date().toISOString() };
            inspected++;
        } catch (e) {
            report.errors.push(`Inspection ${p}: ${e.message.slice(0, 120)}`);
            if (/permission|403|quota/i.test(e.message)) break;
        }
    }
    // Keep only pages still of interest
    const tracked = Object.fromEntries(Object.entries(status).filter(([p]) => candidates.includes(p)));
    const notIndexed = Object.entries(tracked)
        .filter(([, s]) => s.verdict !== 'PASS')
        .map(([p, s]) => ({ path: p, coverageState: s.coverageState, lastCrawlTime: s.lastCrawlTime, isNew: newPages.has(p) }));
    report.inspection = {
        inspected,
        tracked: Object.keys(tracked).length,
        indexed: Object.values(tracked).filter(s => s.verdict === 'PASS').length,
        notIndexed: notIndexed.slice(0, 15),
        notIndexedCount: notIndexed.length,
    };

    const parts = [
        paths.length
            ? `${paths.length} changed page(s) ${!submit
                ? `would be sent (${target === 'staging' ? 'staging' : 'test'} run: nothing submitted)`
                : `sent: ${Object.entries(report.indexNow || {}).map(([e, r]) => `${e} ${r === 'accepted' ? 'accepted' : 'refused'}`).join(', ')}`}`
            : 'No page changes to send',
        `${report.inspection.indexed} of ${report.inspection.tracked} key pages indexed by Google`,
    ];
    if (notIndexed.length) parts.push(`${notIndexed.length} not indexed`);
    report.headline = `${parts.join('; ')}.`;
    console.log(`🔎 ${report.headline}`);
    if (report.errors.length) console.log(`⚠️  ${report.errors.join(' | ')}`);
    console.log(JSON.stringify(report, null, 2));

    if (!dryRun) {
        inbox.setState(db, AGENT, 'index_status', tracked);
        inbox.logEvent(db, { agent: AGENT, kind: 'indexing', summary: report.headline, details: report });
    }
    db.close();
    fs.writeFileSync(path.join(APP_DIR, 'data', 'indexing-agent.json'), JSON.stringify(report, null, 2));
}

run().catch(error => {
    console.error(`❌ Indexing agent failed: ${error.message}`);
    process.exit(1);
});
