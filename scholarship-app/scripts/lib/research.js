/**
 * Evidence-backed research, shared by the AI agents (Deadline Freshness, Quality Fixer, Fact Check).
 *
 * For each fact the model must give the value, the specific page it came from and the exact sentence it
 * relied on. The question is asked twice, independently; the answers are compared, and the quoted sentence is
 * looked up on the cited page. Each fact comes back with a verdict the owner sees on the inbox card:
 *   'verified'   both answers agree and the quote was found on the cited page
 *   'agreed'     both answers agree, but the quote could not be confirmed (page unreachable or text differs)
 *   'secondary'  both answers agree, but the page is an application platform, aggregator or news site, not an official page
 *   'uncertain'  the answers differ (both are kept), or only one answer has a value (see reason)
 *   'none'       neither answer found a value (nothing is proposed)
 */
const { spawnSync } = require('child_process');
const { sourceTier, isSecondaryTier, TIER_RANK } = require('./source-tiers');
const { scoreEvidence } = require('./evidence');
const RUNS = 2;
const MODEL = process.env.RESEARCH_MODEL || 'gemini-2.5-flash';

const clean = v => (v === null || v === undefined ? '' : String(v).trim());
const squash = t => clean(t).toLowerCase().replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9₹%]+/g, ' ').trim();

// A home page is not evidence: it has to be a specific page or document
function isSpecificSource(url) {
    try {
        const u = new URL(url);
        return /^https?:$/.test(u.protocol) && (u.pathname.replace(/\/+$/, '').length > 1 || u.search.length > 1);
    } catch {
        return false;
    }
}

// Government domains count as official; anything else (a document-sharing or news site) is shown as "other site"
function isOfficialSource(url) {
    try { return /(^|\.)(gov\.in|nic\.in)$/.test(new URL(url).host.toLowerCase()); } catch { return false; }
}

async function askOnce(prompt, { readPages = false } = {}) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // urlContext lets the model open the known source pages directly, alongside Google Search
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: readPages ? [{ urlContext: {} }, { googleSearch: {} }] : [{ googleSearch: {} }] }),
        signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Empty or non-JSON answer');
    return JSON.parse(text.slice(start, end + 1));
}

// One retry for the empty / broken answers Gemini sometimes returns
async function askWithRetry(prompt, options) {
    try {
        return await askOnce(prompt, options);
    } catch (first) {
        await new Promise(r => setTimeout(r, 4000));
        return askOnce(prompt, options).catch(() => { throw first; });
    }
}

// Google's search tool cites its own redirect links; follow them to the real page address
const resolved = new Map();
async function realUrl(url) {
    const u = clean(url);
    if (!/vertexaisearch\.cloud\.google\.com\/grounding-api-redirect/.test(u)) return u;
    if (!resolved.has(u)) {
        resolved.set(u, fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
            .then(r => r.headers.get('location') || u)
            .catch(() => u));
    }
    return resolved.get(u);
}

// The cited page as { plain, sq }: readable text, and the same squashed for matching (null = could not be read).
// PDFs are read with pdftotext when it is installed; pages with almost no text (built by scripts) count as unreadable.
const pageCache = new Map();
function getPage(url) {
    if (!pageCache.has(url)) {
        pageCache.set(url, fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (IndiaScholarships fact check)' } })
            .then(async r => {
                if (!r.ok) return null;
                const type = r.headers.get('content-type') || '';
                if (/pdf/.test(type) || /\.pdf($|\?)/i.test(url)) {
                    const out = spawnSync('pdftotext', ['-q', '-', '-'], { input: Buffer.from(await r.arrayBuffer()), maxBuffer: 20e6, timeout: 40000 });
                    return out.status === 0 ? out.stdout.toString('utf8') : null;
                }
                return /text|html|json/.test(type) ? r.text() : null;
            })
            .then(t => {
                if (!t) return null;
                const plain = t.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
                    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
                return plain.length < 200 ? null : { plain, sq: squash(plain) };
            })
            .catch(() => null));
    }
    return pageCache.get(url);
}

// Is the quoted sentence really on the cited page? (null = page could not be read)
async function quoteOnPage(url, quote) {
    const q = squash(quote);
    if (!q || q.length < 12 || !isSpecificSource(url)) return false;
    const got = await getPage(url);
    if (got === null) return null;
    const page = got.sq;
    // Allow small wording differences: most of the quote's distinctive words must appear together
    if (page.includes(q)) return true;
    const words = q.split(' ').filter(w => w.length > 3);
    const window = words.slice(0, 12).join(' ');
    return window.length > 12 && page.includes(window);
}

/**
 * fields: { name: { instruction, compare: (a, b) => boolean } }
 * knownSources: official pages this scholarship's facts came from before (lib/sources.js sourcesFor), checked first
 * knownSecondary: platform / aggregator pages that list it (lib/sources.js secondaryFor), used only as leads
 * title: the scholarship's name, so the evidence score can check the cited page is about it
 * Returns { facts: { name: { value, verdict, source, quote, alternatives } }, errors }
 */
async function researchFacts({ subject, title = '', context = '', fields, knownSources = [], knownSecondary = [] }) {
    const names = Object.keys(fields);
    const known = knownSources.filter(Boolean).slice(0, 5);
    const startHere = known.length ? `
START WITH THESE PAGES, where this scholarship's details were found before. Open them first:
${known.map(u => `- ${u}`).join('\n')}
Use what they state if it is for the current cycle. Search more widely only if a page is gone, is for an older
cycle, or does not state the fact; then cite the newer page you found instead.
` : '';
    const lead = knownSecondary.filter(Boolean).slice(0, 3);
    const leads = lead.length ? `
THESE SITES LIST THIS SCHOLARSHIP. Use them to find the official page it points to, and only as a fallback source:
${lead.map(u => `- ${u}`).join('\n')}
` : '';
    const prompt = `Research ${subject} for Indian students.
${startHere}${leads}Use Google Search. Prefer official sources: government portals (.gov.in / .nic.in), official notices or guideline PDFs,
or the provider's own website.
If no official page states a fact, you may cite an application platform (Buddy4Study, Vidyasaarathi) or a scholarship
listing site, with that page's own address as the source, and look for the official page it refers to. A page that only
mentions the scholarship in passing does not count. Never use coaching-institute or ed-tech sites. Never guess.
${context}
For EACH fact give:
- "value": the fact (use "" when no official source states it)
- "source_url": the SPECIFIC official page or PDF that states it (not a home page)
- "quote": the exact sentence from that page that states it, copied word for word

Respond with a single JSON object:
{
${names.map(n => `  "${n}": { "value": ${fields[n].instruction}, "source_url": "...", "quote": "..." }`).join(',\n')}
}
Provide ONLY the raw JSON object.`;

    const answers = [];
    const errors = [];
    for (let i = 0; i < RUNS; i++) {
        try { answers.push(await askWithRetry(prompt, { readPages: known.length + lead.length > 0 })); } catch (e) { errors.push(e.message.slice(0, 160)); }
        if (i < RUNS - 1) await new Promise(r => setTimeout(r, 3000));
    }

    const facts = {};
    for (const name of names) {
        const got = answers.map(a => a?.[name]).filter(x => x && clean(x.value) && clean(x.value) !== '0');
        for (const g of got) g.source_url = await realUrl(g.source_url);
        if (got.length === 0) { facts[name] = { value: '', verdict: 'none' }; continue; }
        const [a, b] = got;
        const same = got.length === RUNS && (fields[name].compare || ((x, y) => squash(x) === squash(y)))(a.value, b.value);
        // The more trustworthy page wins when the two answers cite different sites
        got.sort((x, y) => TIER_RANK[sourceTier(clean(x.source_url))] - TIER_RANK[sourceTier(clean(y.source_url))]);
        // Prefer the answer whose quote checks out on a specific page, among answers from equally trusted sites
        let best = got[0];
        let verified = null;
        for (const cand of got.filter(c => sourceTier(clean(c.source_url)) === sourceTier(clean(got[0].source_url)))) {
            const ok = await quoteOnPage(clean(cand.source_url), clean(cand.quote));
            if (ok) { best = cand; verified = true; break; }
            if (verified === null) verified = ok;
        }
        const tier = sourceTier(clean(best.source_url));
        // Coaching sites are never a source; platform / aggregator / news pages can only ever reach 'secondary'
        let verdict = same ? (verified ? 'verified' : 'agreed') : 'uncertain';
        let reason = same ? '' : got.length < RUNS ? 'only one of two answers found it' : 'the two answers differ';
        if (tier === 'coaching' || tier === 'invalid') { verdict = 'uncertain'; reason = tier === 'coaching' ? 'cited a coaching site' : 'no usable source page'; }
        else if (same && isSecondaryTier(tier)) verdict = 'secondary';
        facts[name] = {
            value: best.value,
            verdict,
            reason,
            tier,
            quoteFound: verified === true,
            source: clean(best.source_url),
            quote: clean(best.quote).slice(0, 400),
            specificSource: isSpecificSource(clean(best.source_url)),
            officialSource: isOfficialSource(clean(best.source_url)),
            alternatives: same ? [] : got.map(g => ({ value: g.value, source: clean(g.source_url), quote: clean(g.quote).slice(0, 300) })),
        };
    }
    // Evidence score for each fact found (lib/evidence.js); it can also correct the verdict and site kind
    for (const name of names) {
        const fact = facts[name];
        if (!fact || fact.verdict === 'none') continue;
        const scored = await scoreEvidence({ fact, field: name, title, page: isSpecificSource(fact.source) ? await getPage(fact.source) : null });
        fact.verdict = scored.verdict;
        fact.tier = scored.tier;
        if (scored.tier !== sourceTier(fact.source)) fact.reason = fact.reason || 'the page is not the provider\'s own site';
        Object.assign(fact, { score: scored.score, band: scored.band, signals: scored.signals, jev: scored.jev });
    }
    return { facts, errors, answered: answers.length };
}

// Comparers for common value types
const compare = {
    date: (a, b) => clean(a) === clean(b),
    int: (a, b) => {
        const x = Number(String(a).replace(/[^0-9.]/g, ''));
        const y = Number(String(b).replace(/[^0-9.]/g, ''));
        return x > 0 && y > 0 && Math.abs(x - y) / Math.max(x, y) < 0.02;
    },
    url: (a, b) => {
        const k = v => { try { const u = new URL(clean(v)); return (u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '')).toLowerCase(); } catch { return clean(v).toLowerCase(); } };
        return k(a) === k(b);
    },
    // Free text is not expected to match word for word; two answers that both exist count as agreeing
    text: () => true,
    list: (a, b) => {
        const set = v => new Set((Array.isArray(v) ? v : String(v).split(',')).map(x => squash(x)).filter(Boolean));
        const A = set(a), B = set(b);
        const common = [...A].filter(x => B.has(x)).length;
        return common / Math.max(A.size, B.size, 1) >= 0.5;
    },
};

// What the inbox stores with a proposal
function evidenceFor(fact) {
    return { verdict: fact.verdict, reason: fact.reason, tier: fact.tier, score: fact.score, band: fact.band, signals: fact.signals, jev: fact.jev, source: fact.source, quote: fact.quote, specificSource: fact.specificSource, officialSource: fact.officialSource, alternatives: fact.alternatives };
}

module.exports = { getPage, researchFacts, compare, evidenceFor, isSpecificSource, isOfficialSource, MODEL };
