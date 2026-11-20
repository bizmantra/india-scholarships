/**
 * Scholarship name matching, used by the New Scholarship Scout to decide whether a lead is
 * already listed (or already found earlier in the same run).
 *
 * Titles are reduced to a normalised word set before comparing:
 *   - years and year ranges are removed ("2025-26", "2026")
 *   - Hindi and English names for the same thing become one word
 *     ("Mukhyamantri" = "Chief Minister" = "CM", "Kanya" = "Girl", "Protsahan" = "Incentive",
 *      "10+2" = "12th" = "Intermediate", "Post-matric" = "Postmatric")
 *   - punctuation and filler words ("scholarship", "yojana", "scheme", "for", ...) are dropped
 *
 * Two titles that match are still NOT duplicates when they are clearly for different students:
 *   - different states ("Karnataka" vs "Bihar", or a state scheme vs an "All India" one)
 *   - different levels ("10+2" vs "Graduation", "Pre-matric" vs "Post-matric")
 */

const STOP_WORDS = new Set([
    'scholarship', 'scheme', 'the', 'for', 'of', 'and', 'program', 'programme', 'students', 'student',
    'india', 'indian', 'in', 'to', 'on', 'by', 'with', 'under', 'from', 'an',
]);

// Phrases rewritten before punctuation is removed (order matters: longer / more specific first)
const PHRASE_SYNONYMS = [
    [/\bchief\s+minister'?s?\b/g, 'mukhyamantri'],
    [/\bmukhya\s*mantri\b/g, 'mukhyamantri'],
    [/\bcm\b/g, 'mukhyamantri'],
    [/\bprime\s+minister'?s?\b/g, 'pradhanmantri'],
    [/\bpradhan\s*mantri\b/g, 'pradhanmantri'],
    [/\bpm\b/g, 'pradhanmantri'],
    [/\bpost[\s-]*matric(ulation)?\b/g, 'postmatric'],
    [/\bpre[\s-]*matric(ulation)?\b/g, 'prematric'],
    [/\b10\s*\+\s*2\b/g, 'class12'],
    [/\b(class|std|standard)\s*(xii|12)(th)?\b/g, 'class12'],
    [/\b(12th|intermediate|inter)\b/g, 'class12'],
    [/\b(class|std|standard)\s*(x|10)(th)?\b/g, 'class10'],
    [/\b(10th|matric|matriculation)\b/g, 'class10'],
    [/\bpost[\s-]*graduat(e|es|ion)\b/g, 'postgraduation'],
    [/\bpg\b/g, 'postgraduation'],
    [/\b(under[\s-]*)?graduat(e|es|ion)\b/g, 'graduation'],
    [/\bug\b/g, 'graduation'],
];

const WORD_SYNONYMS = {
    kanya: 'girl', girls: 'girl', balika: 'girl', beti: 'girl',
    protsahan: 'incentive', prothsahan: 'incentive', incentives: 'incentive',
    yojana: 'scheme', yojna: 'scheme', schemes: 'scheme',
    scholarships: 'scholarship', chhatravritti: 'scholarship', chatravritti: 'scholarship', chhatravriti: 'scholarship',
    fellowships: 'fellowship',
    disabilities: 'disability', disabled: 'disability', divyang: 'disability', divyangjan: 'disability',
    pwd: 'disability', pwds: 'disability', handicapped: 'disability',
};

// Titles that both carry a word from the same group, but not the same word, are for different students
const CONFLICT_GROUPS = [
    ['class10', 'class12', 'graduation', 'postgraduation'],
    ['prematric', 'postmatric'],
];

const ALL_INDIA = 'all india';
const STATES = {
    'andhra pradesh': [], 'arunachal pradesh': [], assam: [], bihar: [], chhattisgarh: ['chattisgarh'], goa: [],
    gujarat: [], haryana: [], 'himachal pradesh': [], jharkhand: [], karnataka: [], kerala: [], 'madhya pradesh': [],
    maharashtra: [], manipur: [], meghalaya: [], mizoram: [], nagaland: [], odisha: ['orissa'], punjab: [],
    rajasthan: [], sikkim: [], 'tamil nadu': ['tamilnadu'], telangana: [], tripura: [], 'uttar pradesh': [],
    uttarakhand: ['uttaranchal'], 'west bengal': [], delhi: [], 'jammu and kashmir': ['jammu & kashmir', 'j&k', 'j & k'],
    ladakh: [], puducherry: ['pondicherry'], chandigarh: [], 'andaman and nicobar islands': ['andaman'], lakshadweep: [],
    'dadra and nagar haveli and daman and diu': ['dadra', 'daman and diu'],
};
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const STATE_PATTERNS = Object.entries(STATES).map(([name, aliases]) => [
    name,
    new RegExp(`(^|[^a-z])(${[name, ...aliases].map(escape).join('|')})($|[^a-z])`),
]);
const ALL_INDIA_PATTERN = /\b(all[\s-]*india|pan[\s-]*india|nationwide|national|central)\b/;

const tokenCache = new Map();

// Normalised word set of a title
function titleTokens(text) {
    const key = text || '';
    if (tokenCache.has(key)) return tokenCache.get(key);
    let s = key.toLowerCase().replace(/&/g, ' and ');
    // Years and academic-year ranges: 2026, 2025-26, 2025-2026, 2025/26
    s = s.replace(/\b(19|20)\d{2}(\s*[-–/]\s*((19|20)\d{2}|\d{2}))?\b/g, ' ');
    for (const [pattern, replacement] of PHRASE_SYNONYMS) s = s.replace(pattern, ` ${replacement} `);
    const tokens = new Set(
        s.replace(/[^a-z0-9]+/g, ' ').split(/\s+/)
            .map(w => WORD_SYNONYMS[w] || w)
            .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    );
    tokenCache.set(key, tokens);
    return tokens;
}

// Stable key for a title: two titles with the same key name the same scheme
function matchKey(text) {
    return [...titleTokens(text)].sort().join(' ');
}

// Share of the shorter title's words found in the other title (0..1)
function similarity(a, b) {
    const A = titleTokens(a), B = titleTokens(b);
    if (A.size === 0 || B.size === 0) return 0;
    let overlap = 0;
    for (const w of A) if (B.has(w)) overlap++;
    return overlap / Math.min(A.size, B.size);
}

function statesIn(text) {
    const s = (text || '').toLowerCase();
    return STATE_PATTERNS.filter(([, pattern]) => pattern.test(s)).map(([name]) => name);
}

/**
 * Where a scholarship is offered: a Set of state names, or {'all india'}; null when unknown.
 * The state field wins; the title is only used when the field says nothing useful
 * (empty, "Selected States", "Multiple States").
 */
function stateScope(state, title) {
    const field = (state || '').toLowerCase();
    if (ALL_INDIA_PATTERN.test(field)) return new Set([ALL_INDIA]);
    const fromField = statesIn(field);
    if (fromField.length) return new Set(fromField);
    const fromTitle = statesIn(title);
    if (fromTitle.length) return new Set(fromTitle);
    if (/\b(all[\s-]*india|pan[\s-]*india)\b/.test((title || '').toLowerCase())) return new Set([ALL_INDIA]);
    return null;
}

function scopesConflict(a, b) {
    if (!a || !b) return false;
    for (const s of a) if (b.has(s)) return false;
    return true;
}

const isStateSpecific = scope => !!scope && !scope.has(ALL_INDIA);

function variantsConflict(a, b) {
    const A = titleTokens(a), B = titleTokens(b);
    return CONFLICT_GROUPS.some(group => {
        const inA = group.filter(w => A.has(w));
        const inB = group.filter(w => B.has(w));
        return inA.length > 0 && inB.length > 0 && !inA.some(w => inB.includes(w));
    });
}

/**
 * The first entry in `existing` ({title, slug?, state?}) that is the same scholarship as
 * `candidate` ({title, slug?, state?}), or undefined.
 *
 * strictState: when only one side's state is known and it is a specific state, it is not a match
 * (used before research, when a lead has only a name). The researched record is checked again
 * with its real state.
 */
function findDuplicate(candidate, existing, { threshold = 0.85, strictState = false } = {}) {
    const key = matchKey(candidate.title);
    const scope = stateScope(candidate.state, candidate.title);
    return existing.find(e => {
        // Same slug is the same page id: always a duplicate
        if (candidate.slug && e.slug === candidate.slug) return true;
        if (!key || (matchKey(e.title) !== key && similarity(candidate.title, e.title) < threshold)) return false;
        if (variantsConflict(candidate.title, e.title)) return false;
        const listedScope = stateScope(e.state, e.title);
        if (scopesConflict(scope, listedScope)) return false;
        if (strictState && (isStateSpecific(scope) && !listedScope || isStateSpecific(listedScope) && !scope)) return false;
        return true;
    });
}

module.exports = { titleTokens, matchKey, similarity, stateScope, scopesConflict, variantsConflict, findDuplicate };
