/**
 * Where each scholarship's facts come from, so research starts there instead of searching the whole web.
 *
 * scholarships.source_pages (JSON list, newest first) holds the specific pages an agent confirmed facts on:
 *   [{ "url": "...", "facts": ["deadline", "amount_min"], "confirmed": "YYYY-MM-DD" }]
 * It is internal (never shown on the site) and is updated by the agents themselves whenever research
 * confirms a fact on a specific page, so the list keeps itself current as a side effect of normal checks.
 *
 * data/scholarship-sources.json is the list of portals and providers checked first when looking for
 * new scholarships (see docs/SCHOLARSHIP_SOURCES.md).
 */
const fs = require('fs');
const path = require('path');
const { isSpecificSource } = require('./research');

const MAX_PAGES = 8;
const MAX_HINTS = 5;
const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'scholarship-sources.json');

// Aggregator, news and coaching sites: never a source, even when they state the fact (also used by the scout)
const NON_OFFICIAL_DOMAINS = [
    'buddy4study.com', 'collegedunia.com', 'shiksha.com', 'careers360.com', 'jagranjosh.com', 'scholarshipsinindia.com',
    'indiatoday.in', 'timesofindia.indiatimes.com', 'hindustantimes.com', 'ndtv.com', 'news18.com', 'wikipedia.org', 'youtube.com',
    'allen.ac.in', 'allen.in', 'fiitjee.com', 'aakash.ac.in', 'srichaitanya.net', 'pw.live', 'madeeasy.in', 'byjus.com',
    'unacademy.com', 'vedantu.com', 'alsias.net',
];
function isNonOfficialSource(url) {
    try {
        const host = new URL(url).hostname.replace(/^www\./, '');
        return NON_OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
    } catch {
        return true;
    }
}

const clean = v => (v === null || v === undefined ? '' : String(v).trim());
const today = () => new Date().toISOString().slice(0, 10);

function ensureColumn(db) {
    const cols = db.prepare(`PRAGMA table_info(scholarships)`).all().map(c => c.name);
    if (!cols.includes('source_pages')) db.exec(`ALTER TABLE scholarships ADD COLUMN source_pages TEXT`);
}

function readPages(row) {
    try {
        const list = JSON.parse(row?.source_pages || '[]');
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
 * Save the pages research confirmed facts on (facts from lib/research.js researchFacts).
 * Only specific official pages whose answers agreed are kept: an uncertain answer, a home page or an
 * aggregator / news site is not a source.
 * Returns the number of pages added or refreshed.
 */
function remember(db, scholarshipId, facts, { dryRun = false } = {}) {
    const found = new Map();
    for (const [field, fact] of Object.entries(facts || {})) {
        if (!fact || !['verified', 'agreed'].includes(fact.verdict) || !fact.specificSource || isNonOfficialSource(fact.source)) continue;
        const url = clean(fact.source);
        if (!found.has(url)) found.set(url, new Set());
        found.get(url).add(field);
    }
    if (found.size === 0 || dryRun) return found.size;

    const row = db.prepare(`SELECT source_pages FROM scholarships WHERE id = ?`).get(scholarshipId);
    const pages = readPages(row);
    const fresh = [];
    for (const [url, fields] of found) {
        const old = pages.find(p => clean(p.url) === url);
        fresh.push({ url, facts: [...new Set([...(old?.facts || []), ...fields])], confirmed: today() });
    }
    const rest = pages.filter(p => !found.has(clean(p.url)));
    const next = [...fresh, ...rest].slice(0, MAX_PAGES);
    db.prepare(`UPDATE scholarships SET source_pages = ? WHERE id = ?`).run(JSON.stringify(next), scholarshipId);
    return found.size;
}

function loadRegistry() {
    try {
        return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch {
        return { sources: [] };
    }
}

module.exports = { isNonOfficialSource, NON_OFFICIAL_DOMAINS, ensureColumn, sourcesFor, remember, readPages, loadRegistry, REGISTRY_PATH };
