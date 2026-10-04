/**
 * Where each scholarship's facts come from, so research starts there instead of searching the whole web.
 *
 * scholarships.source_pages (JSON list, newest first) holds the specific pages an agent confirmed facts on:
 *   [{ "url": "...", "facts": ["deadline", "amount_min"], "confirmed": "YYYY-MM-DD" }]
 * scholarships.secondary_sources is the same shape plus a tier, for pages on application platforms, aggregators
 * and news sites (see source-tiers.js). They prove a scholarship exists and lead to the official page, but are
 * never the final word on a number.
 * Both are internal (never shown on the site) and are updated by the agents themselves whenever research
 * confirms a fact on a specific page, so the lists keep themselves current as a side effect of normal checks.
 *
 * data/scholarship-sources.json is the list of portals and providers checked first when looking for
 * new scholarships (see docs/SCHOLARSHIP_SOURCES.md).
 */
const fs = require('fs');
const path = require('path');
const { isSpecificSource } = require('./research');
const { sourceTier, isSecondaryTier, hostOf } = require('./source-tiers');

const MAX_PAGES = 8;
const MAX_HINTS = 5;
const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'scholarship-sources.json');

// Anything that is not an official or provider page (platforms, aggregators, news, coaching)
const isNonOfficialSource = url => !['official', 'provider'].includes(sourceTier(url));

const clean = v => (v === null || v === undefined ? '' : String(v).trim());
const today = () => new Date().toISOString().slice(0, 10);

function ensureColumn(db) {
    const cols = db.prepare(`PRAGMA table_info(scholarships)`).all().map(c => c.name);
    for (const col of ['source_pages', 'secondary_sources']) {
        if (!cols.includes(col)) db.exec(`ALTER TABLE scholarships ADD COLUMN ${col} TEXT`);
    }
}

function readPages(row, column = 'source_pages') {
    try {
        const list = JSON.parse(row?.[column] || '[]');
        return Array.isArray(list) ? list.filter(p => p && clean(p.url)) : [];
    } catch {
        return [];
    }
}

function splitUrls(value) {
    return clean(value).split(/[\s,]+/).filter(u => /^https?:\/\//.test(u));
}

/**
 * Pages to check first for one scholarship: pages that confirmed facts before (newest first),
 * then its official source and apply links (specific pages before home pages).
 */
function sourcesFor(row) {
    const seen = new Set();
    const out = [];
    const add = url => {
        const key = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();
        if (!url || seen.has(key)) return;
        seen.add(key);
        out.push(url);
    };
    readPages(row).map(p => clean(p.url)).filter(u => !isNonOfficialSource(u)).forEach(add);
    const listed = [...splitUrls(row?.official_source), ...splitUrls(row?.apply_url)].filter(u => !isNonOfficialSource(u));
    listed.filter(isSpecificSource).forEach(add);
    listed.filter(u => !isSpecificSource(u)).forEach(add);
    return out.slice(0, MAX_HINTS);
}

/**
 * Platform / aggregator / news pages that list this scholarship: saved ones, plus any such site already in its
 * official source or apply link. Leads for finding the official page; never the final word on a number.
 */
function secondaryFor(row) {
    const urls = [
        ...readPages(row, 'secondary_sources').map(p => clean(p.url)),
        ...splitUrls(row?.official_source), ...splitUrls(row?.apply_url),
    ].filter(u => isSecondaryTier(sourceTier(u)));
    return [...new Set(urls)].slice(0, MAX_HINTS);
}

/**
 * Save the pages research confirmed facts on (facts from lib/research.js researchFacts).
 * Official / provider pages go to source_pages, and need both answers to agree on a specific page.
 * Platform, aggregator and news pages go to secondary_sources (verdict 'secondary'), tagged with their tier.
 * Uncertain answers, home pages and coaching sites are never saved.
 * Returns the number of pages added or refreshed.
 */
function remember(db, scholarshipId, facts, { dryRun = false } = {}) {
    const primary = new Map();
    const secondary = new Map();
    for (const fact of Object.values(facts || {})) {
        if (!fact || !fact.specificSource) continue;
        const url = clean(fact.source);
        const tier = sourceTier(url);
        const bucket = isSecondaryTier(tier) && fact.verdict === 'secondary' ? secondary
            : ['official', 'provider'].includes(tier) && ['verified', 'agreed'].includes(fact.verdict) ? primary : null;
        if (!bucket) continue;
        if (!bucket.has(url)) bucket.set(url, new Set());
    }
    for (const [field, fact] of Object.entries(facts || {})) {
        const url = clean(fact?.source);
        (primary.get(url) || secondary.get(url))?.add(field);
    }
    const total = primary.size + secondary.size;
    if (total === 0 || dryRun) return total;

    const row = db.prepare(`SELECT source_pages, secondary_sources, apply_url FROM scholarships WHERE id = ?`).get(scholarshipId);
    const save = (column, found, describe) => {
        if (found.size === 0) return;
        const pages = readPages(row, column);
        const fresh = [...found].map(([url, fields]) => {
            const old = pages.find(p => clean(p.url) === url);
            return { url, ...describe(url), facts: [...new Set([...(old?.facts || []), ...fields])], confirmed: today() };
        });
        const rest = pages.filter(p => !found.has(clean(p.url)));
        db.prepare(`UPDATE scholarships SET ${column} = ? WHERE id = ?`).run(JSON.stringify([...fresh, ...rest].slice(0, MAX_PAGES)), scholarshipId);
    };
    save('source_pages', primary, () => ({}));
    // role: "apply" when this is the site students apply on, otherwise "info"
    save('secondary_sources', secondary, url => ({
        tier: sourceTier(url),
        role: hostOf(url) && splitUrls(row?.apply_url).some(u => hostOf(u) === hostOf(url)) ? 'apply' : 'info',
    }));
    return total;
}

function loadRegistry() {
    try {
        return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch {
        return { sources: [] };
    }
}

module.exports = { splitUrls, isNonOfficialSource, ensureColumn, sourcesFor, secondaryFor, remember, readPages, loadRegistry, REGISTRY_PATH };
