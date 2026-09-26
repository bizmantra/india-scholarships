/**
 * New Scholarship Scout
 *
 * Weekly agent that discovers scholarships we do NOT yet list, using 5 channels:
 *   1. Search demand   — scholarship names in our keyword research CSVs with no matching page.
 *   2. Official portals — rotating sweep of central and state scholarship portals.
 *   3. CSR & competitors — rotating sweep of foundations and aggregator sites (e.g. Buddy4Study).
 *   4. News            — Google News RSS for newly announced / opened scholarships (last 7 days).
 *   5. Coverage gaps   — states and student groups where our catalogue is thinnest.
 *   6. Open web search — broad Google searches for scholarships announced or opened recently.
 *
 * Every lead is de-duplicated against the database, researched with Gemini + Google Search
 * grounding, filtered by the sourcing gate (no coaching tests, no loans, must be active or
 * recurring), and written to data/scout/candidates/<slug>.json for human review.
 *
 * Nothing is written to the database here. Candidates go live only after the weekly
 * pull request is merged (see scripts/publish-scout-approved.js).
 *
 * Usage: node scripts/scholarship-scout.js [--dry-run] [--max=8] [--channels=demand,web,portals,csr,news,coverage]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const Parser = require('rss-parser');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const argValue = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const MAX_CANDIDATES = parseInt(argValue('max') || '8', 10);
const ALL_CHANNELS = ['demand', 'web', 'portals', 'csr', 'news', 'coverage'];
const CHANNELS = (argValue('channels') || ALL_CHANNELS.join(',')).split(',');

const APP_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(APP_DIR, 'data', 'scholarships.db');
const KEYWORD_DIR = path.join(APP_DIR, 'Keyword research');
const SCOUT_DIR = path.join(APP_DIR, 'data', 'scout');
const CANDIDATES_DIR = path.join(SCOUT_DIR, 'candidates');
const PUBLISHED_DIR = path.join(SCOUT_DIR, 'published');
const SEEN_PATH = path.join(SCOUT_DIR, 'seen-links.json');
const REPORT_PATH = path.join(SCOUT_DIR, 'scout-report.md');

const CHANNEL_LABELS = {
    demand: '🔎 Search demand',
    web: '🌐 Open web search',
    portals: '🏛️ Official portal',
    csr: '🏢 CSR / competitor',
    news: '📰 News',
    coverage: '🗺️ Coverage gap',
};

// ---- Channel 2 & 3: sources swept on rotation (a few per week to control API cost) ----
const PORTAL_SOURCES = [
    { name: 'National Scholarship Portal (NSP)', url: 'https://scholarships.gov.in' },
    { name: 'AICTE scholarship schemes (Pragati, Saksham, Swanath)', url: 'https://www.aicte-india.org' },
    { name: 'UGC scholarships and fellowships', url: 'https://www.ugc.gov.in' },
    { name: 'CSIR fellowships', url: 'https://csirhrdg.res.in' },
    { name: 'DST INSPIRE (SHE, Fellowship)', url: 'https://online-inspire.gov.in' },
    { name: 'PM YASASVI and Ministry of Social Justice schemes', url: 'https://socialjustice.gov.in' },
    { name: 'Karnataka State Scholarship Portal (SSP)', url: 'https://ssp.karnataka.gov.in' },
    { name: 'Maharashtra MahaDBT', url: 'https://mahadbt.maharashtra.gov.in' },
    { name: 'Uttar Pradesh scholarship portal', url: 'https://scholarship.up.gov.in' },
    { name: 'West Bengal OASIS and Aikyashree', url: 'https://oasis.gov.in' },
    { name: 'West Bengal Swami Vivekananda (SVMCM) and Medhashree', url: 'https://svmcm.wbhed.gov.in' },
    { name: 'Andhra Pradesh Jnanabhumi', url: 'https://jnanabhumi.ap.gov.in' },
    { name: 'Telangana ePASS', url: 'https://telanganaepass.cgg.gov.in' },
    { name: 'Digital Gujarat scholarships', url: 'https://www.digitalgujarat.gov.in' },
    { name: 'Bihar and Jharkhand e-Kalyan', url: 'https://ekalyan.cgg.gov.in' },
    { name: 'Rajasthan SJE scholarship portal', url: 'https://sje.rajasthan.gov.in' },
    { name: 'Madhya Pradesh MPTAAS and Pratibha Kiran', url: 'https://www.tribal.mp.gov.in/mptaas' },
    { name: 'Odisha State Scholarship Portal', url: 'https://scholarship.odisha.gov.in' },
    { name: 'Tamil Nadu scholarship schemes', url: 'https://www.tn.gov.in' },
    { name: 'Kerala e-Grantz and state scholarships', url: 'https://egrantz.kerala.gov.in' },
    { name: 'Punjab and Haryana scholarship portals', url: 'https://scholarships.punjab.gov.in' },
    { name: 'Assam and North-East state scholarships', url: 'https://dhe.assam.gov.in' },
];
const CSR_SOURCES = [
    { name: 'Buddy4Study (competitor listings)', url: 'https://www.buddy4study.com', competitor: true },
    { name: 'Vidyasaarathi (NSDL CSR portal)', url: 'https://www.vidyasaarathi.co.in', competitor: true },
    { name: 'Foundation for Excellence (FFE)', url: 'https://ffe.org' },
    { name: 'Tata Trusts and Tata group scholarships', url: 'https://www.tatatrusts.org' },
    { name: 'Reliance Foundation scholarships', url: 'https://www.reliancefoundation.org' },
    { name: 'ONGC, NTPC, IOCL and other PSU scholarships', url: 'https://www.ongcindia.com' },
    { name: 'HDFC, SBI, Kotak and other bank foundation scholarships', url: 'https://www.hdfcbank.com' },
    { name: 'Global tech company scholarships in India (Google, Amazon, Microsoft, Adobe)', url: 'https://www.amazon.in' },
    { name: 'Women-in-STEM scholarships (L\'Oréal, Rolls-Royce Unnati, etc.)', url: 'https://www.loreal.com' },
];
const PORTALS_PER_WEEK = 4;

// ---- Channel 6: open-ended web searches, not tied to any source (rotating) ----
// Footprint queries that target official announcements rather than aggregator/coaching pages.
// {year} and {state} are filled in at run time.
const WEB_SEARCHES = [
    'site:gov.in ("post-matric" OR "pre-matric" OR "merit-cum-means") scholarship "apply online" {year}',
    'site:nic.in "scholarship scheme" ("fresh application" OR "guidelines") {year}',
    'site:pib.gov.in scholarship scheme students {year}',
    '"{state}" ("e-kalyan" OR "welfare department" OR "higher education") scholarship notification {year} filetype:pdf',
    '("CSR Foundation" OR "Trust") scholarship "applications invited" (undergraduate OR engineering OR medical) {year}',
    '"scholarship for girls" ("STEM" OR "engineering") "apply" {year} -coaching',
    '("sports scholarship" OR "para-athlete") ("Ministry of Youth Affairs" OR "SAI") {year}',
    'scholarships for Indian students announced or opened for applications in the last 30 days',
    'new scholarships for Indian students to study abroad for the upcoming academic year',
];
const WEB_SEARCHES_PER_WEEK = 3;
const CSR_PER_WEEK = 3;

// ---- Channel 5: coverage matrix ----
const PRIORITY_STATES = [
    'Uttar Pradesh', 'Bihar', 'Maharashtra', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Tamil Nadu',
    'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Odisha', 'Telangana', 'Kerala', 'Jharkhand', 'Assam',
    'Punjab', 'Chhattisgarh', 'Haryana', 'Delhi', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Tripura', 'Manipur', 'Meghalaya', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim', 'Goa',
];
const SEGMENTS = [
    { name: 'single girl child and women in STEM', match: /girl|women|female/i },
    { name: 'sports and para-sports athletes', match: /sport|athlete|khelo/i },
    { name: 'persons with disabilities (PwD)', match: /disab|pwd|divyang|handicap/i },
    { name: 'minority communities (pre-matric and post-matric)', match: /minorit|muslim|christian|sikh|jain|parsi|buddhist/i },
    { name: 'wards of armed forces, paramilitary and police personnel', match: /armed forces|defence|ex-servicemen|army|navy|air force|paramilitary|capf|police/i },
];
const COVERAGE_STATES_PER_WEEK = 2;

// Words that on their own describe a search, not a specific scheme (used by the demand channel)
const GENERIC_SEARCH_WORDS = new Set([
    ...PRIORITY_STATES.flatMap(s => s.toLowerCase().split(' ')), 'up', 'mp', 'ap', 'tn', 'wb', 'jk', 'hp', 'odisha', 'orissa', 'bengal', 'tamilnadu',
    'nsp', 'ssp', 'pms', 'national', 'state', 'central', 'government', 'govt', 'portal', 'online', 'offline', 'apply', 'application',
    'form', 'login', 'status', 'check', 'last', 'date', 'list', 'amount', 'eligibility', 'renewal', 'registration', 'kab', 'aayega',
    'kaise', 'kare', 'in', 'to', 'how', 'what', 'is', 'when', 'will', 'new', 'latest', 'news', 'update', 'result', 'merit', 'fresh',
    'girls', 'girl', 'boys', 'women', 'student', 'ug', 'pg', 'phd', 'btech', 'mba', 'mbbs', 'engineering', 'medical', 'diploma',
    'class', 'th', '10th', '11th', '12th', 'college', 'university', 'school', 'pre', 'post', 'matric', 'prematric', 'postmatric',
    'sc', 'st', 'obc', 'ews', 'bc', 'minority', 'general', 'private', 'international', 'abroad', 'free', 'full', 'fully', 'funded',
    'best', 'top', 'all', 'with', 'without', 'near', 'me', 'on', 'by', 'from', 'at', 'site', 'gov', 'www', 'com', 'org',
]);

// ---- Channel 4: news feeds, limited to the last 7 days ----
const gnews = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=en-IN&gl=IN&ceid=IN:en`;
const FEEDS = [
    { name: 'New scholarships launched', url: gnews('"new scholarship scheme" OR "scholarship launched" India students') },
    { name: 'Registration open', url: gnews('"scholarship registration open" OR "scholarship applications open" India') },
    { name: 'State government schemes', url: gnews('state government scholarship scheme announced students') },
    { name: 'Central ministries', url: gnews('ministry scholarship scheme students notified') },
    { name: 'Corporate CSR scholarships', url: gnews('CSR scholarship programme students India apply') },
    { name: 'Study abroad for Indians', url: gnews('fully funded scholarship Indian students abroad Chevening OR DAAD OR Rhodes OR Fulbright') },
];

// The sourcing gate, shared by every Gemini prompt that proposes or validates a scholarship
const SOURCING_GATE = `Reject (never propose) any of these:
- Coaching-institute or ed-tech "scholarship tests" that are really admission discounts or promotions
  (e.g. Allen, FIITJEE, Aakash, Sri Chaitanya, Physics Wallah, Made Easy, BYJU'S, Unacademy, Vedantu, ALS IAS).
- Education loans or loan schemes presented as financial aid.
- Schemes that are not currently active and not provably recurring every year (one-time PR announcements, or schemes with no application cycle in the last 3 years).`;

// Domains that can point us to a scholarship but can never be its official source
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

const parser = new Parser();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .slice(0, 90);
}

// Normalised word set used for fuzzy duplicate detection
const STOP_WORDS = new Set(['scholarship', 'scholarships', 'scheme', 'yojana', 'the', 'for', 'of', 'and', 'program', 'programme', 'students', 'india', '2025', '2026', '2027']);
function titleTokens(text) {
    return new Set(
        (text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w))
    );
}
function similarity(a, b) {
    const A = titleTokens(a), B = titleTokens(b);
    if (A.size === 0 || B.size === 0) return 0;
    let overlap = 0;
    for (const w of A) if (B.has(w)) overlap++;
    return overlap / Math.min(A.size, B.size);
}

function readJson(filePath, fallback) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
}

function listJsonTitles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
        const rec = readJson(path.join(dir, f), {});
        return { title: rec.title || f, slug: rec.slug || f.replace(/\.json$/, '') };
    });
}

// Same week number for the whole week, so each rotation slot is stable within a run
function weekNumber() {
    return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}
function rotate(list, count) {
    const start = (weekNumber() * count) % list.length;
    return Array.from({ length: Math.min(count, list.length) }, (_, i) => list[(start + i) % list.length]);
}

function extractJson(text) {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start === -1 || end === -1) throw new Error('No JSON found in Gemini response');
    return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGemini(prompt, { grounded }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    if (grounded) payload.tools = [{ googleSearch: {} }];

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) throw new Error('No response candidates returned from Gemini');
    return extractJson(parts.map(p => p.text || '').join(''));
}

// Ask Gemini (grounded) for named scholarships from one source/segment, excluding ones we list
async function discoverFromPrompt(context, knownTitles, limit) {
    const prompt = `You are the research lead for IndiaScholarships.in, a directory of scholarships for Indian students.

TASK: ${context}

Use Google Search. Only include specific, named scholarship / fellowship / fee-reimbursement schemes that are open to Indian students.
${SOURCING_GATE}
Skip anything already in our list below (treat renamed or abbreviated versions as already listed).

ALREADY LISTED:
${knownTitles.map(t => `- ${t}`).join('\n')}

Return at most ${limit} items as a JSON array:
[{"name": "Official scholarship name", "provider": "Organisation offering it", "evidence": "URL or short note on where you found it"}]
Return [] if nothing qualifies. Provide ONLY the raw JSON array.`;
    const result = await callGemini(prompt, { grounded: true });
    return Array.isArray(result) ? result : [];
}

// ---------------- Channel 1: search demand ----------------
function readKeywordCsv(filePath) {
    const buffer = fs.readFileSync(filePath);
    // Google Keyword Planner exports are UTF-16 and tab separated; Ubersuggest exports are UTF-8 CSV
    const raw = buffer[0] === 0xff && buffer[1] === 0xfe ? buffer.toString('utf16le') : buffer.toString('utf8');
    const lines = raw.replace(/^﻿/, '').split(/\r?\n/);
    const headerIdx = lines.findIndex(l => /keyword/i.test(l));
    if (headerIdx === -1) return [];
    const delimiter = lines[headerIdx].includes('\t') ? '\t' : ',';
    const split = line => line.split(new RegExp(`${delimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`)).map(c => c.trim().replace(/^"|"$/g, ''));
    const header = split(lines[headerIdx]).map(h => h.toLowerCase());
    const kwCol = header.findIndex(h => h === 'keyword' || h.includes('keyword'));
    const volCol = header.findIndex(h => h.includes('volume') || h.includes('avg. monthly searches'));
    return lines.slice(headerIdx + 1).map(split).filter(c => c[kwCol]).map(c => ({
        keyword: c[kwCol].toLowerCase(),
        volume: parseInt((c[volCol] || '').replace(/[^\d]/g, ''), 10) || 0
    }));
}

async function demandLeads(existing, knownKeywords) {
    if (!fs.existsSync(KEYWORD_DIR)) {
        console.log('   (no Keyword research folder — skipping)');
        return [];
    }
    const files = [];
    const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.toLowerCase().endsWith('.csv')) files.push(p);
    });
    walk(KEYWORD_DIR);

    const volumes = new Map();
    for (const file of files) {
        try {
            for (const { keyword, volume } of readKeywordCsv(file)) {
                volumes.set(keyword, Math.max(volumes.get(keyword) || 0, volume));
            }
        } catch (error) {
            console.error(`   ❌ Could not read ${path.basename(file)}: ${error.message}`);
        }
    }

    // Keep search terms that name a scheme (not just generic words) and that no existing page covers.
    // Variants of the same term ("x scholarship 2026", "x scholarship last date") are merged.
    const byKey = new Map();
    for (const [kw, vol] of volumes) {
        if (vol < 50 || !/scholarship|yojana|fellowship|scheme|protsahan|vidya|shree|epass|dbt/i.test(kw)) continue;
        const specific = [...titleTokens(kw)].filter(w => !GENERIC_SEARCH_WORDS.has(w) && !/^\d+$/.test(w));
        if (specific.length === 0) continue;
        if (knownKeywords.has(kw) || existing.some(e => similarity(specific.join(' '), e.title) >= 0.75)) continue;
        const key = specific.sort().join(' ');
        const prev = byKey.get(key);
        byKey.set(key, prev ? [prev[0], prev[1] + vol] : [kw, vol]);
    }
    const unmatched = [...byKey.values()].sort((a, b) => b[1] - a[1]).slice(0, 150);
    console.log(`   ${files.length} keyword files, ${volumes.size} search terms, ${unmatched.length} with no matching page`);
    if (unmatched.length === 0) return [];

    const prompt = `You are the research lead for IndiaScholarships.in.
These search terms (with monthly search volume) have no matching page on our site:
${unmatched.map(([kw, vol]) => `- "${kw}" (${vol}/month)`).join('\n')}

Which of them refer to a SPECIFIC, named scholarship scheme (not a generic search like "scholarship for girls" or "nsp login")?
Group terms that refer to the same scheme. Skip schemes that appear in this list we already publish:
${existing.map(e => `- ${e.title}`).join('\n')}

${SOURCING_GATE}

Return at most 10 items, highest search volume first, as a JSON array:
[{"name": "Official scholarship name", "provider": "Organisation offering it", "evidence": "search term(s) and monthly volume"}]
Return [] if none qualify. Provide ONLY the raw JSON array.`;
    const result = await callGemini(prompt, { grounded: false });
    return (Array.isArray(result) ? result : []).map(r => ({ ...r, channel: 'demand' }));
}

// ---------------- Channels 2 & 3: rotating source sweeps ----------------
async function sweepLeads(sources, count, channel, knownTitles) {
    const leads = [];
    for (const source of rotate(sources, count)) {
        console.log(`   Sweeping: ${source.name}`);
        const context = source.competitor
            ? `Find scholarships currently listed on ${source.name} (${source.url}) that are open to Indian students. For each, identify the ORIGINAL provider (not the aggregator).`
            : `Find the scholarship schemes currently offered or listed by ${source.name} (${source.url}), including newly notified ones.`;
        try {
            const found = await discoverFromPrompt(context, knownTitles, 6);
            found.forEach(f => leads.push({ ...f, channel, evidence: f.evidence || source.url, via: source.name }));
        } catch (error) {
            console.error(`   ❌ Sweep failed for ${source.name}: ${error.message.slice(0, 120)}`);
        }
        await sleep(6000);
    }
    return leads;
}

// ---------------- Channel 6: open web search ----------------
async function webLeads(knownTitles) {
    const leads = [];
    const year = new Date().getFullYear();
    const state = rotate(PRIORITY_STATES, 1)[0];
    for (const template of rotate(WEB_SEARCHES, WEB_SEARCHES_PER_WEEK)) {
        const query = template.replace(/\{year\}/g, year).replace(/\{state\}/g, state);
        console.log(`   Searching: ${query}`);
        const context = `Run this Google search (and close variations of it): ${query}
Most results for scholarship searches are aggregator clickbait or coaching promotions. Prefer official domains
(.gov.in, .nic.in, pib.gov.in, .edu, .ac.in, .org, and verified provider sites such as tatatrusts.org,
reliancefoundation.org, vidyasaarathi.co.in, ffe.org) and official guideline PDFs or circulars.`;
        try {
            const found = await discoverFromPrompt(context, knownTitles, 8);
            found.forEach(f => leads.push({ ...f, channel: 'web', via: `Web search: ${query}` }));
        } catch (error) {
            console.error(`   ❌ Web search failed: ${error.message.slice(0, 120)}`);
        }
        await sleep(6000);
    }
    return leads;
}

// ---------------- Channel 4: news ----------------
async function newsLeads(seenLinks, knownTitles, freshLinks) {
    const headlines = [];
    const seenTitles = new Set();
    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            for (const item of feedData.items.slice(0, 20)) {
                const key = (item.title || '').toLowerCase();
                if (!item.link || seenLinks.has(item.link) || seenTitles.has(key)) continue;
                seenTitles.add(key);
                headlines.push({ title: item.title, link: item.link });
            }
        } catch (error) {
            console.error(`   ❌ Error fetching feed ${feed.name}: ${error.message}`);
        }
    }
    headlines.forEach(h => freshLinks.push(h.link));
    console.log(`   ${headlines.length} fresh headlines`);
    if (headlines.length === 0) return [];

    const prompt = `You are the research lead for IndiaScholarships.in, a directory of scholarships for Indian students.

Identify specific, named scholarship programmes mentioned in these news headlines that are open to Indian students and NOT already in our list (treat renamed/abbreviated versions as already listed). Ignore exam results and generic news.
${SOURCING_GATE}

HEADLINES:
${headlines.map((h, i) => `${i}. ${h.title}`).join('\n')}

ALREADY LISTED:
${knownTitles.map(t => `- ${t}`).join('\n')}

Return at most 8 items as a JSON array:
[{"name": "Official scholarship name", "provider": "Organisation offering it", "headline_ids": [0, 3]}]
Return [] if nothing qualifies. Provide ONLY the raw JSON array.`;
    const result = await callGemini(prompt, { grounded: false });
    return (Array.isArray(result) ? result : []).map(r => {
        const news = (r.headline_ids || []).map(i => headlines[i]).filter(Boolean);
        return { name: r.name, provider: r.provider, channel: 'news', evidence: news.map(n => n.link).join(' '), news };
    });
}

// ---------------- Channel 5: coverage gaps ----------------
function coverageTargets(dbRows) {
    const domestic = dbRows.filter(r => (r.scholarship_scope || 'domestic').toLowerCase() !== 'international');
    // PRIORITY_STATES is ordered by student population, so bigger states are expected to have more listings
    const stateCounts = PRIORITY_STATES.map((state, i) => ({
        state,
        count: domestic.filter(r => (r.state || '').toLowerCase().includes(state.toLowerCase().split(' and ')[0])).length,
        weight: PRIORITY_STATES.length - i
    })).sort((a, b) => a.count / a.weight - b.count / b.weight);
    // Rotate through the 8 thinnest states so the same ones are not searched every week
    const states = rotate(stateCounts.slice(0, 8), COVERAGE_STATES_PER_WEEK);

    const segmentCounts = SEGMENTS.map(seg => ({
        ...seg,
        count: dbRows.filter(r => seg.match.test([r.title, r.gender, r.caste, r.tags, r.special_conditions].join(' '))).length
    })).sort((a, b) => a.count - b.count);
    const segment = rotate(segmentCounts.slice(0, 3), 1)[0];
    return { states, segment };
}

async function coverageLeads(dbRows, knownTitles) {
    const { states, segment } = coverageTargets(dbRows);
    const leads = [];
    const tasks = [
        ...states.map(s => ({ label: `${s.state} (${s.count} listed)`, context: `Find government, university and private scholarships for students who are residents of ${s.state}, India.` })),
        { label: `${segment.name} (${segment.count} listed)`, context: `Find scholarships in India specifically for ${segment.name}.` },
    ];
    for (const task of tasks) {
        console.log(`   Gap: ${task.label}`);
        try {
            const found = await discoverFromPrompt(task.context, knownTitles, 5);
            found.forEach(f => leads.push({ ...f, channel: 'coverage', via: task.label }));
        } catch (error) {
            console.error(`   ❌ Coverage search failed for ${task.label}: ${error.message.slice(0, 120)}`);
        }
        await sleep(6000);
    }
    return leads;
}

// ---------------- Research & validation ----------------
async function researchCandidate(lead) {
    const prompt = `Research the "${lead.name}" scholarship offered by ${lead.provider || 'unknown provider'} for Indian students.
Use Google Search and rely ONLY on official sources (government portals on .gov.in / .nic.in, PIB releases, official guideline PDFs, provider or university websites) — never aggregators, news sites or coaching institutes. Lead context: ${lead.evidence || 'none'}

Set "is_valid" to false (and explain in "rejection_reason") if you cannot confirm it is a real scholarship open to Indian students, or if it fails this gate:
${SOURCING_GATE}
Never guess numbers, dates or URLs. Use null (or an empty string) when a fact is not stated by an official source.

Respond with a single JSON object:
{
  "is_valid": true,
  "rejection_reason": "",
  "confidence": "High | Medium | Low",
  "title": "Official scholarship name",
  "provider": "Organisation name",
  "provider_type": "Government | Corporate | Private | Trust | University | Study Abroad",
  "state": "Indian state it is restricted to, or 'All India'",
  "level": "e.g. 'Class 11-12, UG, PG'",
  "caste": "e.g. 'All', 'SC, ST, OBC'",
  "gender": "All | Female | Male",
  "course_stream": "e.g. 'All Courses', 'Engineering, Medical'",
  "amount_annual": 50000,
  "amount_min": 10000,
  "amount_description": "Plain-English description of the award amount",
  "benefits": "What the scholarship covers",
  "income_limit": 250000,
  "min_marks": 60,
  "age_limit": "e.g. 'Below 25 years' or 'Not Specified'",
  "residency_requirement": "e.g. 'Permanent resident of Kerala'",
  "docs_needed": ["Aadhaar Card", "Income Certificate"],
  "application_mode": "Online | Offline",
  "apply_url": "Official application URL",
  "deadline": "YYYY-MM-DD student application deadline, or empty string if unknown",
  "deadline_description": "e.g. 'Applications close 31 October 2026'",
  "always_open": false,
  "step_guide": "1. Step one\\n2. Step two\\n3. Step three",
  "selection": "How recipients are selected",
  "renewal": "Renewal rules, or 'One-time award'",
  "official_source": "Official page URL that confirms these details",
  "helpline": "Official phone/email if published",
  "intro_seo": "2 short sentences (max 15 words each) explaining who it is for and what it gives",
  "faq_json": [{"question": "...", "answer": "..."}],
  "keywords": ["search phrase 1", "search phrase 2"],
  "tags": ["government", "state-name"],
  "scholarship_scope": "Domestic | International",
  "country_of_study": "India or destination country"
}
Write in simple English with short sentences. Provide 3 FAQs. Provide ONLY the raw JSON object.`;

    return callGemini(prompt, { grounded: true });
}

function isDuplicate(title, existing) {
    const slug = slugify(title);
    return existing.find(e => e.slug === slug || similarity(title, e.title) >= 0.85);
}

// Mirrors the main rules in content-quality-audit.js so reviewers see gaps before approving
function qualityGaps(r) {
    const gaps = [];
    const international = (r.scholarship_scope || '').toLowerCase() === 'international';
    if (!r.deadline && !r.always_open) gaps.push('no exact deadline');
    if (!r.apply_url) gaps.push('no apply link');
    if (international) return gaps;
    if (!r.amount_annual) gaps.push('no annual amount');
    if (!r.amount_min) gaps.push('no minimum amount');
    if (!r.selection || r.selection.length < 15) gaps.push('thin selection criteria');
    if (!r.renewal || r.renewal.length < 15) gaps.push('thin renewal policy');
    if (!r.step_guide || r.step_guide.length < 20) gaps.push('thin step guide');
    if (r.docs_needed.length === 0) gaps.push('no documents list');
    if (!r.helpline) gaps.push('no helpline');
    if (r.faq_json.length === 0) gaps.push('no FAQs');
    return gaps;
}

function formatEvidence(lead) {
    if (lead.news?.length) {
        return lead.news.map(n => `[${n.title.replace(/[|\[\]]/g, ' ').slice(0, 70)}](${n.link})`).join('<br>');
    }
    const text = [lead.via, lead.evidence].filter(Boolean).join(' — ').replace(/\|/g, '/').replace(/\n/g, ' ');
    return text.slice(0, 200) || '—';
}

function buildReport(accepted, rejected, channelStats) {
    const today = new Date().toISOString().slice(0, 10);
    const lines = [
        `# 🔭 New Scholarship Scout — ${today}`,
        '',
        `Found **${accepted.length}** scholarship(s) not yet on the site.`,
        '',
        '| Channel | Leads found |',
        '|---|---|',
        ...Object.entries(channelStats).map(([ch, n]) => `| ${CHANNEL_LABELS[ch]} | ${n} |`),
        '',
        '### How to review',
        '- **Approve all:** merge this pull request. The scholarships go live automatically within a few minutes.',
        '- **Reject one:** open the *Files changed* tab, click `⋯` on that candidate\'s file → *Delete file*, then merge.',
        '- **Fix a detail:** in *Files changed*, click `⋯` → *Edit file*, correct the value, commit, then merge.',
        '- **Reject all:** close this pull request.',
        '',
    ];

    accepted.forEach((c, i) => {
        const r = c.record;
        lines.push(
            `## ${i + 1}. ${r.title}`,
            '',
            '| Field | Value |',
            '|---|---|',
            `| Found by | ${CHANNEL_LABELS[c.lead.channel]} |`,
            `| Provider | ${r.provider || '—'} (${r.provider_type || '—'}) |`,
            `| For | ${[r.level, r.state, r.gender !== 'All' ? r.gender : null, r.caste && r.caste !== 'All' ? r.caste : null].filter(Boolean).join(' · ') || '—'} |`,
            `| Amount | ${r.amount_description || (r.amount_annual ? `₹${r.amount_annual}` : '—')} |`,
            `| Deadline | ${r.deadline || r.deadline_description || '—'} |`,
            `| Official source | ${r.official_source || '—'} |`,
            `| Apply link | ${r.apply_url || '—'} |`,
            `| AI confidence | **${c.confidence}** |`,
            `| Missing info | ${qualityGaps(r).join(', ') || 'None ✅'} |`,
            `| Evidence | ${formatEvidence(c.lead)} |`,
            `| File | \`scholarship-app/data/scout/candidates/${r.slug}.json\` |`,
            ''
        );
    });

    if (rejected.length > 0) {
        lines.push('<details><summary>Skipped by the scout (' + rejected.length + ')</summary>', '');
        rejected.forEach(r => lines.push(`- **${r.name}** (${CHANNEL_LABELS[r.channel] || '—'}) — ${r.reason}`));
        lines.push('', '</details>', '');
    }

    lines.push('_Always double-check amounts, deadlines and eligibility against the official source before merging._');
    return lines.join('\n');
}

// Coerce Gemini output into the scholarships table's column shapes
function toRecord(data) {
    const int = v => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Math.round(Number(v)));
    const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(data.deadline || '') ? data.deadline : '';
    const slug = slugify(data.title);
    return {
        id: slug,
        title: data.title.trim(),
        slug,
        provider: data.provider || null,
        provider_type: data.provider_type || 'Government',
        state: data.state || 'All India',
        level: data.level || null,
        caste: data.caste || 'All',
        gender: data.gender || 'All',
        course_stream: data.course_stream || 'All Courses',
        app_type: data.application_mode || 'Online',
        amount_annual: int(data.amount_annual),
        amount_min: int(data.amount_min),
        amount_description: data.amount_description || null,
        benefits: data.benefits || null,
        income_limit: int(data.income_limit),
        min_marks: int(data.min_marks),
        age_limit: data.age_limit || 'Not Specified',
        residency_requirement: data.residency_requirement || null,
        docs_needed: arr(data.docs_needed),
        application_mode: data.application_mode || 'Online',
        apply_url: data.apply_url || data.official_source,
        deadline,
        deadline_description: data.deadline_description || null,
        always_open: data.always_open ? 1 : 0,
        step_guide: data.step_guide || null,
        selection: data.selection || null,
        renewal: data.renewal || null,
        official_source: data.official_source,
        helpline: data.helpline || null,
        intro_seo: data.intro_seo || null,
        faq_json: arr(data.faq_json),
        keywords: arr(data.keywords),
        tags: arr(data.tags),
        scholarship_type: data.provider_type || 'Government',
        scholarship_scope: data.scholarship_scope || 'Domestic',
        country_of_study: data.country_of_study || 'India',
    };
}

async function runScout() {
    console.log('🔭 New Scholarship Scout');
    console.log(`- Dry Run: ${dryRun}`);
    console.log(`- Max candidates: ${MAX_CANDIDATES}`);
    console.log(`- Channels: ${CHANNELS.join(', ')}\n`);

    fs.mkdirSync(CANDIDATES_DIR, { recursive: true });

    const db = new Database(DB_PATH, { readonly: true });
    const dbRows = db.prepare(`SELECT title, slug, state, gender, caste, tags, special_conditions, keywords, scholarship_scope
                               FROM scholarships WHERE status = 'Active' OR status IS NULL`).all();
    const allSlugs = db.prepare('SELECT title, slug FROM scholarships').all();
    db.close();

    // Anything already in the database, awaiting review, or already published counts as "known"
    const existing = [...allSlugs, ...listJsonTitles(CANDIDATES_DIR), ...listJsonTitles(PUBLISHED_DIR)];
    const knownTitles = existing.map(e => e.title);
    const knownKeywords = new Set();
    dbRows.forEach(r => (readJsonString(r.keywords) || []).forEach(k => knownKeywords.add(String(k).toLowerCase())));

    const seenLinks = new Set(readJson(SEEN_PATH, []));
    const freshLinks = [];

    // Collect leads channel by channel (order = priority when capping)
    const leads = [];
    const channelStats = {};
    const runners = {
        demand: () => demandLeads(existing, knownKeywords),
        web: () => webLeads(knownTitles),
        news: () => newsLeads(seenLinks, knownTitles, freshLinks),
        portals: () => sweepLeads(PORTAL_SOURCES, PORTALS_PER_WEEK, 'portals', knownTitles),
        csr: () => sweepLeads(CSR_SOURCES, CSR_PER_WEEK, 'csr', knownTitles),
        coverage: () => coverageLeads(dbRows, knownTitles),
    };
    for (const channel of ['demand', 'web', 'news', 'portals', 'csr', 'coverage']) {
        if (!CHANNELS.includes(channel)) continue;
        console.log(`\n${CHANNEL_LABELS[channel]}`);
        try {
            const found = await runners[channel]();
            channelStats[channel] = found.length;
            leads.push(...found.filter(l => l?.name));
            console.log(`   → ${found.length} lead(s)`);
        } catch (error) {
            channelStats[channel] = 0;
            console.error(`   ❌ Channel failed: ${error.message.slice(0, 200)}`);
        }
    }

    const accepted = [];
    const rejected = [];
    const triedNames = [];

    console.log(`\n🧪 Researching up to ${MAX_CANDIDATES} of ${leads.length} leads...\n`);
    for (const lead of leads) {
        if (accepted.length >= MAX_CANDIDATES) break;

        // The same scheme often surfaces in several channels in one run
        if (triedNames.some(n => similarity(n, lead.name) >= 0.85)) continue;
        triedNames.push(lead.name);

        const dup = isDuplicate(lead.name, existing);
        if (dup) {
            rejected.push({ name: lead.name, channel: lead.channel, reason: `Already listed as "${dup.title}"` });
            continue;
        }

        console.log(`🔍 [${lead.channel}] Researching: "${lead.name}" (${lead.provider || 'unknown provider'})`);
        try {
            const data = await researchCandidate(lead);
            const reject = reason => {
                rejected.push({ name: lead.name, channel: lead.channel, reason });
                console.log(`   ⏭️  Rejected: ${reason}`);
            };
            if (!data.is_valid) {
                reject(data.rejection_reason || 'Could not be verified');
            } else if (!data.title || !/^https?:\/\//.test(data.official_source || '')) {
                reject('No official source URL found');
            } else if (isNonOfficialSource(data.official_source)) {
                reject(`Source is a news, aggregator or coaching site, not the provider (${data.official_source})`);
            } else if (data.confidence === 'Low') {
                reject('Low confidence in researched details');
            } else {
                const record = toRecord(data);
                const researchedDup = isDuplicate(record.title, existing);
                if (researchedDup) {
                    reject(`Already listed as "${researchedDup.title}"`);
                } else {
                    accepted.push({ record, confidence: data.confidence || 'Medium', lead });
                    existing.push({ title: record.title, slug: record.slug });
                    console.log(`   ✅ Candidate ready: ${record.slug}`);
                }
            }
        } catch (error) {
            rejected.push({ name: lead.name, channel: lead.channel, reason: `Research failed: ${error.message.slice(0, 120)}` });
            console.error(`   ❌ Research failed: ${error.message}`);
        }
        await sleep(6000); // respect Gemini rate limits
    }

    const report = buildReport(accepted, rejected, channelStats);
    console.log('\n' + report);

    if (dryRun) {
        console.log('\n🧪 Dry run: no files written.');
        return;
    }

    for (const { record, confidence, lead } of accepted) {
        const file = {
            ...record,
            _scout: {
                channel: lead.channel,
                confidence,
                evidence: lead.news?.map(n => n.link) || [lead.via, lead.evidence].filter(Boolean),
                discovered_at: new Date().toISOString()
            }
        };
        fs.writeFileSync(path.join(CANDIDATES_DIR, `${record.slug}.json`), JSON.stringify(file, null, 2) + '\n');
    }
    // Remember processed headlines so they are not re-triaged next week (keep the list bounded)
    const allSeen = [...seenLinks, ...freshLinks].slice(-3000);
    fs.writeFileSync(SEEN_PATH, JSON.stringify(allSeen, null, 2) + '\n');
    fs.writeFileSync(REPORT_PATH, report + '\n');

    // Expose result count to GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `candidates=${accepted.length}\n`);
    }
    console.log(`\n🏁 Scout complete: ${accepted.length} candidate(s) written to data/scout/candidates/`);
}

function readJsonString(value) {
    try { return JSON.parse(value); } catch { return null; }
}

runScout().catch(error => {
    console.error(`❌ Scout failed: ${error.message}`);
    process.exit(1);
});
