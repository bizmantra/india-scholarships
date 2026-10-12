/**
 * Evidence score (0-100) for one researched fact, shown on every inbox card with its working.
 *
 * It adds up signals we can check, each with visible points (see `signals` on the result):
 *   research verdict        verified +45, agreed +30, secondary +15, uncertain +5
 *   value on the page       the proposed value appears word for word on the cited page: +25; page readable but the
 *                           value is not there: -15; page unreadable: no change (dates and amounts only)
 *   kind of site            official +10, provider +5, platform 0, listing site / news -5
 *   specific page           +5 for a specific page, -10 for a home page
 *   Jev (optional)          about this scholarship (-10..+10), the right kind of date or amount (-10..+10),
 *                           the current cycle (-5..+5), and the real kind of site when the domain is unknown
 *
 * The weights are a starting point. scripts/evidence-calibration.js compares scores with your approve / reject
 * decisions so they can be tuned.
 */
const jev = require('./jev');

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const VERDICT_POINTS = { verified: 45, agreed: 30, secondary: 15, uncertain: 5 };
const TIER_POINTS = { official: 10, provider: 5, platform: 0, aggregator: -5, news: -5 };
const AMOUNT_LABELS = { amount_annual: 'annual scholarship amount', amount_min: 'minimum scholarship amount', income_limit: 'maximum family income' };
const SITE_KINDS = {
    official: 'a government or official institution website (ministry, department, university, official notice or guidelines)',
    provider: "a scholarship provider's own website (foundation, trust, company or university)",
    platform: 'an application platform that hosts scholarships for many providers (Buddy4Study, Vidyasaarathi)',
    aggregator: 'a listing or explainer site that summarises scholarships (articles, lists, how-to guides)',
    news: 'a news article or press report',
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const pretty = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${y}`; };

// The academic year now under way, e.g. "2026-27" in October 2026
function currentCycle(now = new Date()) {
    const start = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    return `${start}-${String(start + 1).slice(2)}`;
}

/** Where does the proposed value appear on the page? Returns { found, index } or null when the field cannot be checked. */
function locateValue(field, value, text) {
    if (!text) return null;
    if (field === 'deadline' && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [y, m, d] = String(value).split('-').map(Number);
        const name = MONTHS[m - 1], mon = name.slice(0, 3);
        const forms = [
            `\\b0?${d}(?:st|nd|rd|th)?[ ,.-]+(?:${name}|${mon})\\.?,?[ ,.-]+${y}\\b`,
            `\\b(?:${name}|${mon})\\.?[ ,.-]+0?${d}(?:st|nd|rd|th)?,?[ ,.-]+${y}\\b`,
            `\\b0?${d}[/.-]0?${m}[/.-](?:${y}|${String(y).slice(2)})\\b`,
            `\\b${y}-0?${m}-0?${d}\\b`,
        ];
        const hit = new RegExp(forms.join('|'), 'i').exec(text);
        return { found: Boolean(hit), index: hit ? hit.index : -1 };
    }
    if (AMOUNT_LABELS[field]) {
        const n = Math.round(Number(String(value).replace(/[^0-9.]/g, '')));
        if (!n) return null;
        const forms = new Set([String(n), n.toLocaleString('en-US'), n.toLocaleString('en-IN')]);
        const out = [...forms].map(f => `(?<![\\d,])${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d,])`);
        if (n % 10000 === 0 && n >= 100000) out.push(`\\b${String(n / 100000).replace('.', '\\.')}\\s*lakhs?\\b`);
        const hit = new RegExp(out.join('|'), 'i').exec(text);
        return { found: Boolean(hit), index: hit ? hit.index : -1 };
    }
    return null;
}

const window = (text, index, size = 450) => text.slice(Math.max(0, index - size), index + size);

// The distinctive words of a scholarship's name, and where the page first uses one of them. The opening of most
// pages is menu text, so "is this page about X?" is asked about the part of the page that names it.
const STOP = new Set(['scholarship', 'scholarships', 'scheme', 'programme', 'program', 'fellowship', 'india', 'indian', 'award', 'awards', 'with', 'from', 'students', 'student']);
const titleWords = title => [...new Set(String(title).toLowerCase().match(/[a-z]{4,}/g) || [])].filter(w => !STOP.has(w));
function nameOnPage(title, plain) {
    const words = titleWords(title);
    if (words.length === 0) return null;
    const lower = plain.toLowerCase();
    const at = words.map(w => lower.indexOf(w)).filter(i => i >= 0);
    return { share: at.length / words.length, index: at.length ? Math.min(...at) : -1 };
}

/**
 * fact: one fact from researchFacts ({ value, verdict, tier, source, specificSource, quote })
 * page: { plain, sq } for the cited page, or null when it could not be read
 * Returns { score, band, signals, jev, verdict, tier } (verdict / tier may be corrected by Jev's reading of the page)
 */
async function scoreEvidence({ fact, field, title, page }) {
    let verdict = fact.verdict;
    let tier = fact.tier || 'provider';
    const signals = [];
    const jevUsed = {};
    const add = (label, points) => signals.push({ label, points });

    const located = page ? locateValue(field, fact.value, page.plain) : null;
    // Jev reads two excerpts: the opening of the page (what it is) and the passage around the value (what it says)
    let head = null, passage = null;
    if (jev.enabled() && page && page.plain.length >= 200) {
        const name = nameOnPage(title, page.plain);
        const questions = {};
        // Skip the question when the name is nowhere on the page: that already answers it
        if (name && name.share >= 0.4) questions.about = { type: 'noul', instructions: `Is this page about the scholarship named "${title}"?` };
        if (tier === 'provider') questions.kind = { type: 'choice', instructions: 'What kind of website is this page on?', criteria: SITE_KINDS };
        if (Object.keys(questions).length) head = await jev.decide(page.plain.slice(name && name.index > 0 ? Math.max(0, name.index - 200) : 0).slice(0, 900), questions);
        const anchor = located?.found ? located.index : (fact.quote ? page.plain.toLowerCase().indexOf(String(fact.quote).toLowerCase().slice(0, 60)) : -1);
        if (anchor >= 0) {
            const q = {};
            if (field === 'deadline' && /^\d{4}-\d{2}-\d{2}$/.test(String(fact.value))) {
                q.date = { type: 'noul', instructions: `Is ${pretty(fact.value)} the last date for students to submit their application (not a verification, institute, district, interview, result or portal-closing date)?` };
                q.cycle = { type: 'noul', instructions: `Does this text describe the ${currentCycle()} application cycle (not an earlier year)?` };
            } else if (AMOUNT_LABELS[field]) {
                q.amount = { type: 'noul', instructions: `Does the text state that the ${AMOUNT_LABELS[field]} is Rs ${Number(String(fact.value).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}?` };
            }
            if (Object.keys(q).length) passage = await jev.decide(window(page.plain, anchor), q);
        }
        // An unlisted site that is really a listing site or news page is not an official source
        const kind = head?.kind;
        if (kind && tier === 'provider' && ['aggregator', 'news', 'platform'].includes(kind.choice) && (kind.probabilities?.[kind.choice] ?? kind.confidence ?? 0) >= 0.7) {
            jevUsed.siteKind = kind.choice;
            tier = kind.choice;
            if (['verified', 'agreed'].includes(verdict)) verdict = 'secondary';
        }
    }

    add(`Research verdict: ${verdict}`, VERDICT_POINTS[verdict] ?? 0);
    if (located) add(located.found ? 'Value appears on the cited page' : 'Page readable, but the value is not on it', located.found ? 25 : -15);
    else if (!page && ['deadline', ...Object.keys(AMOUNT_LABELS)].includes(field)) add('Cited page could not be read (value not checked)', 0);
    if (tier in TIER_POINTS) add(`Source is ${({ official: 'a government / official site', provider: 'a provider site', platform: 'an application platform', aggregator: 'a listing site', news: 'a news site' })[tier]}${jevUsed.siteKind ? ' (Jev, from the page)' : ''}`, TIER_POINTS[tier]);
    add(fact.specificSource ? 'Specific page' : 'Home page only', fact.specificSource ? 5 : -10);

    const name = page ? nameOnPage(title, page.plain) : null;
    if (name && name.share < 0.4) add("The scholarship's name is not on the cited page", -10);
    const lean = (p, span) => Math.round((p - 0.5) * 2 * span);
    const about = jev.yes(head, 'about');
    if (about !== null) { jevUsed.about = about; add(`Jev: page is ${about >= 0.5 ? '' : 'not '}about this scholarship (${about.toFixed(2)})`, lean(about, 10)); }
    const date = jev.yes(passage, 'date');
    if (date !== null) { jevUsed.applicationDate = date; add(`Jev: ${date >= 0.5 ? 'is' : 'is not'} the student application deadline (${date.toFixed(2)})`, lean(date, 10)); }
    const cycle = jev.yes(passage, 'cycle');
    if (cycle !== null) { jevUsed.currentCycle = cycle; add(`Jev: ${cycle >= 0.5 ? 'is' : 'is not'} the ${currentCycle()} cycle (${cycle.toFixed(2)})`, lean(cycle, 5)); }
    const amount = jev.yes(passage, 'amount');
    if (amount !== null) { jevUsed.amount = amount; add(`Jev: text ${amount >= 0.5 ? 'states' : 'does not state'} this amount (${amount.toFixed(2)})`, lean(amount, 8)); }

    const score = clamp(signals.reduce((s, x) => s + x.points, 0), 0, 100);
    return { score, band: score >= 75 ? 'strong' : score >= 50 ? 'fair' : 'weak', signals, jev: jevUsed, verdict, tier };
}

module.exports = { scoreEvidence, locateValue, currentCycle, nameOnPage, window, SITE_KINDS };
