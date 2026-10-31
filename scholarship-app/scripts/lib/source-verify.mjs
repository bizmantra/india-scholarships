/**
 * Deterministic source checks for Study Abroad facts (Spec D6).
 *
 * A registry entry says: "this number is stated on this official page, in this exact sentence".
 * The check fetches the page and fails unless
 *   1. the URL's host is on the official allowlist,
 *   2. the quote appears on the page (whitespace, case and quote marks normalised),
 *   3. the expected value appears inside that quote.
 * No AI is involved. A page that cannot be fetched is "unverifiable", not a pass.
 *
 * The same file also gates proposal sources for scripts/study-abroad/propose-changes.mjs
 * (`proposalSourceVerdict`, `checkProposalSources`): a proposed `source` or `official_source`
 * must be on the host allowlist or be an exact URL registered in source-checks.json.
 */

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

/** Reduce HTML to visible text: drop scripts and styles, turn tags into spaces, decode entities. */
export function htmlToText(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
            if (code[0] === '#') {
                const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
                return Number.isFinite(n) ? String.fromCodePoint(n) : m;
            }
            return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, code.toLowerCase()) ? NAMED_ENTITIES[code.toLowerCase()] : m;
        });
}

/** Comparable form of a piece of text: one set of spaces, straight quotes, lower case. */
export function normalizeText(text) {
    return String(text || '')
        .replace(/[   ]/g, ' ')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/** True when the host is the allowed domain or a subdomain of it (so lookalikes like ice.gov.evil.com fail). */
export function hostAllowed(url, allowedDomains) {
    let host;
    try { host = new URL(url).hostname.toLowerCase(); } catch { return false; }
    return allowedDomains.some(d => {
        const domain = d.toLowerCase();
        return host === domain || host.endsWith('.' + domain);
    });
}

/** Structural problems in a registry entry, or an empty list. Checked before any fetch. */
export function validateEntry(entry) {
    const problems = [];
    if (!entry || typeof entry !== 'object') return ['entry must be an object'];
    if (!entry.id || !/^[a-z0-9._-]+$/i.test(entry.id)) problems.push('id is required (letters, digits, . _ -)');
    if (!/^https:\/\/\S+$/.test(entry.url || '')) problems.push('url must be an https:// link');
    if (!normalizeText(entry.quote)) problems.push('quote is required');
    if (!normalizeText(entry.value)) problems.push('value is required');
    if (normalizeText(entry.quote) && normalizeText(entry.value) && !normalizeText(entry.quote).includes(normalizeText(entry.value))) {
        problems.push('value must appear inside the quote');
    }
    return problems;
}

/**
 * Check one entry against the fetched HTML.
 * Returns { status: 'pass' | 'fail' | 'unverifiable', reason }.
 */
export function checkEntry(entry, html, allowedDomains) {
    if (!hostAllowed(entry.url, allowedDomains)) {
        return { status: 'fail', reason: `host of ${entry.url} is not on the official allowlist` };
    }
    if (html === null || html === undefined) {
        return { status: 'unverifiable', reason: 'page could not be fetched' };
    }
    const text = normalizeText(htmlToText(html));
    const quote = normalizeText(entry.quote);
    if (!text.includes(quote)) {
        return { status: 'fail', reason: 'quote not found on the page' };
    }
    return { status: 'pass', reason: 'quote and value found on the page' };
}

/** Fetch a page as text. Any non-200 or network error returns null (unverifiable). */
export async function fetchPage(url, { fetchImpl = fetch, timeoutMs = 20000 } = {}) {
    try {
        const res = await fetchImpl(url, {
            signal: AbortSignal.timeout(timeoutMs),
            headers: { 'user-agent': 'india-scholarships-source-check/1.0 (+https://indiascholarships.in)' },
            redirect: 'follow',
        });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

const normValue = v => normalizeText(v);

/**
 * Pre-flight for a proposals file (same shape as propose-changes.mjs input). Pure apart from pageFor.
 *   registry: { entries: [...] }   allowed: [domains]   pageFor(url) -> html | null
 * Rules:
 *   - sa_facts "value" change: needs a registry entry for that fact_key with the same value, and its
 *     quote must be on the live page. Unverifiable pages fail (a value cannot be confirmed without one).
 *   - sa_facts "official_source": host must be on the allowlist.
 *   - any other source host not on the allowlist: warning only (owner decides when to extend the list).
 * Returns { failures: [{key, field, reason}], warnings: [{key, field, reason}] }.
 */
export async function checkProposals(changes, { registry, allowed, pageFor }) {
    const failures = [];
    const warnings = [];
    const entries = (registry && registry.entries) || [];
    for (const change of changes || []) {
        const { table, key } = change;
        const fields = change.fields || {};
        const sourceUrls = [change.source, fields.official_source].filter(Boolean);

        if (table === 'sa_facts' && fields.value !== undefined) {
            const entry = entries.find(e => e.fact_key === key);
            if (!entry) {
                failures.push({ key, field: 'value', reason: 'no entry in data/study-abroad/source-checks.json for this fact; add one after reading the official page' });
            } else if (normValue(entry.value) !== normValue(fields.value)) {
                failures.push({ key, field: 'value', reason: `proposed value "${fields.value}" does not match the registry value "${entry.value}"` });
            } else {
                const result = checkEntry(entry, await pageFor(entry.url), allowed);
                if (result.status !== 'pass') failures.push({ key, field: 'value', reason: `${result.status}: ${result.reason}` });
            }
        }
        for (const url of sourceUrls) {
            if (!hostAllowed(url, allowed)) {
                const severity = table === 'sa_facts' ? failures : warnings;
                severity.push({ key, field: 'source', reason: `${url} is not on the official allowlist` });
            }
        }
    }
    return { failures, warnings };
}

/** True when the URL is registered exactly as a source-checks.json entry URL. */
export function registeredSource(url, registry) {
    const wanted = String(url || '');
    if (!wanted) return false;
    return ((registry && registry.entries) || []).some(entry => String(entry.url || '') === wanted);
}

/**
 * Verdict for one proposal source URL (the D6 next step).
 *   accepted: true when the host is on the official allowlist (subdomains count) or the exact URL is a
 *             registered registry entry URL.
 *   warning:  set when it is accepted only because of the registry, not because of the host.
 */
export function proposalSourceVerdict(url, { allowed = [], registry } = {}) {
    if (!url) return { accepted: false, warning: null };
    if (hostAllowed(url, allowed)) return { accepted: true, warning: null };
    if (registeredSource(url, registry)) {
        return {
            accepted: true,
            warning: `source is registered in source-checks.json but its host is not on the official allowlist (${url}); extend official-domains.json if this domain will be cited again`,
        };
    }
    return { accepted: false, warning: null };
}

/**
 * Proposal pre-flight used by scripts/study-abroad/propose-changes.mjs. Pure apart from pageFor.
 *   changes: the proposals file's "changes" array (change.source overrides defaultSource)
 *   defaultSource: the proposals file's top-level "source"
 *   pageFor: called only for a sa_facts "value" change (no fetch for the plain host check)
 * Refuses (does not warn) an unallowlisted/unregistered source, because a proposal with an unofficial
 * citation must not reach the inbox. Returns { refusals: [{table, key, field, reason}], warnings: [...] };
 * field === null means the whole change is refused.
 */
export async function checkProposalSources(changes, { allowed = [], registry, defaultSource = null, pageFor } = {}) {
    const refusals = [];
    const warnings = [];
    const sourceReason = url => `source host not on the official allowlist and not in source-checks.json (${url})`;

    for (const change of changes || []) {
        const { table, key } = change;
        const fields = change.fields || {};
        const citation = change.source || defaultSource || null;

        if (citation) {
            const verdict = proposalSourceVerdict(citation, { allowed, registry });
            if (!verdict.accepted) {
                refusals.push({ table, key, field: null, reason: sourceReason(citation) });
                continue; // a refused citation must not fetch a page or propose any field of this row
            }
            if (verdict.warning) warnings.push({ table, key, field: 'source', reason: verdict.warning });
        }

        if (Object.prototype.hasOwnProperty.call(fields, 'official_source')) {
            const url = fields.official_source === null || fields.official_source === undefined ? '' : String(fields.official_source).trim();
            // A non-URL value is left to sa-inbox.validateSaValue, which has the specific message for it.
            if (/^https?:\/\//i.test(url)) {
                const verdict = proposalSourceVerdict(url, { allowed, registry });
                if (!verdict.accepted) refusals.push({ table, key, field: 'official_source', reason: sourceReason(url) });
                else if (verdict.warning) warnings.push({ table, key, field: 'official_source', reason: verdict.warning });
            }
        }

        if (table === 'sa_facts' && fields.value !== undefined) {
            if (!pageFor) throw new Error('checkProposalSources needs pageFor for a sa_facts value change');
            const { failures } = await checkProposals([{ ...change, source: citation }], { registry, allowed, pageFor });
            // Source verdicts are already covered above; keep checkProposals' value verdicts.
            for (const failure of failures) {
                if (failure.field === 'value') refusals.push({ table, key, field: 'value', reason: failure.reason });
            }
        }
    }
    return { refusals, warnings };
}
