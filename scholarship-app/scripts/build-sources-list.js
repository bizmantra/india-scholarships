/**
 * Refresh the provider entries in data/scholarship-sources.json from the database.
 *
 * Groups active scholarships by the website of their official source / apply link, so agents (and people)
 * can see which official sites our listings come from and start there. Hand-written entries (portals,
 * CSR sources, notes) are kept as they are; only entries marked "auto": true are rebuilt.
 * Also reports how many scholarships have no specific source page yet.
 *
 * Usage: node scripts/build-sources-list.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { isSpecificSource } = require('./lib/research');
const { sourceTier, isSecondaryTier } = require('./lib/source-tiers');
const { readPages, loadRegistry, isNonOfficialSource, REGISTRY_PATH } = require('./lib/sources');

const dryRun = process.argv.includes('--dry-run');
const db = new Database(path.join(__dirname, '..', 'data', 'scholarships.db'), { readonly: true });

// Aggregators (lib/sources.js) and link / document hosts are not the provider, so they never become a provider entry
const LINK_HOSTS = ['google.com', 'forms.gle', 'bit.ly', 'facebook.com'];

const host = url => {
    try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
};
const urls = v => String(v || '').split(/[\s,]+/).filter(u => /^https?:\/\//.test(u));

const cols = db.prepare(`PRAGMA table_info(scholarships)`).all().map(c => c.name);
const rows = db.prepare(`SELECT title, provider, state, official_source, apply_url${cols.includes('source_pages') ? ', source_pages' : ''}
    FROM scholarships WHERE status = 'Active' OR status IS NULL`).all();

const registry = loadRegistry();
const manual = registry.sources.filter(s => !s.auto);
const manualHosts = new Set(manual.map(s => host(s.url)));

const byHost = new Map();
let noSpecific = 0;
let noSource = 0;
let secondaryOnly = 0;
for (const r of rows) {
    const links = [...readPages(r).map(p => p.url), ...urls(r.official_source), ...urls(r.apply_url)];
    if (links.length === 0) noSource++;
    if (!links.some(u => isSpecificSource(u) && !isNonOfficialSource(u))) noSpecific++;
    if (!links.some(u => !isNonOfficialSource(u)) && links.some(u => isSecondaryTier(sourceTier(u)))) secondaryOnly++;
    const h = host(urls(r.official_source)[0] || urls(r.apply_url)[0] || '');
    if (!h || isNonOfficialSource(`https://${h}`) || LINK_HOSTS.some(d => h === d || h.endsWith('.' + d))) continue;
    if (!byHost.has(h)) byHost.set(h, { providers: new Map(), states: new Set(), titles: [] });
    const e = byHost.get(h);
    if (r.provider) e.providers.set(r.provider, (e.providers.get(r.provider) || 0) + 1);
    if (r.state && !/all india/i.test(r.state)) e.states.add(r.state);
    e.titles.push(r.title);
}

const auto = [...byHost.entries()]
    .filter(([h]) => !manualHosts.has(h))
    .map(([h, e]) => ({
        name: [...e.providers.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || h,
        url: `https://${h}`,
        kind: 'provider',
        scholarships: e.titles.length,
        states: [...e.states].slice(0, 5),
        examples: e.titles.slice(0, 3),
        auto: true,
    }))
    .sort((a, b) => b.scholarships - a.scholarships || a.name.localeCompare(b.name));

registry.sources = [...manual, ...auto];
registry.updated = new Date().toISOString().slice(0, 10);
registry.coverage = { active_scholarships: rows.length, without_any_source: noSource, without_specific_source_page: noSpecific, platform_or_listing_site_only: secondaryOnly };

console.log(`Active scholarships: ${rows.length}`);
console.log(`  no source link at all: ${noSource}`);
console.log(`  only a home page, no specific source page: ${noSpecific - noSource}`);
console.log(`  listed on a platform / listing site only (no official or provider link): ${secondaryOnly}`);
console.log(`Sources list: ${manual.length} hand-written + ${auto.length} providers from the database`);
if (!dryRun) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
    console.log(`Written ${path.relative(process.cwd(), REGISTRY_PATH)}`);
}
db.close();
