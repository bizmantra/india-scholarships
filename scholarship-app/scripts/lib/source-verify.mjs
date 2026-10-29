/**
 * Deterministic source checks for Study Abroad facts (Spec D6).
 *
 * A registry entry says: "this number is stated on this official page, in this exact sentence".
 * The check fetches the page and fails unless
 *   1. the URL's host is on the official allowlist,
 *   2. the quote appears on the page (whitespace, case and quote marks normalised),
 *   3. the expected value appears inside that quote.
 * No AI is involved. A page that cannot be fetched is "unverifiable", not a pass.
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
        .replace(/[   ]/g, ' ')
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
