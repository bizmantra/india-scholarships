// Checks that a quote an agent gives really appears on the page it names as its source.
// Agents have produced quotes stitched from several parts of a page (or not on it at all), so the bridge looks for itself.

export type QuoteCheck = 'found' | 'not_found' | 'unchecked';

const MIN_FRAGMENT = 8;

// Lowercase letters and digits only, so spacing, punctuation, quote marks and HTML entities do not matter
const squash = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

export function pageText(html: string): string {
    return html
        .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&quot;|&#39;|&apos;|&rsquo;|&lsquo;/gi, "'");
}

// A quote may use "..." or "…" to skip words; every piece between them must be on the page, in any order
export function quoteInText(quote: string, text: string): boolean {
    const haystack = squash(text);
    const pieces = quote.split(/\.{3,}|…|\[\s*\.{0,3}\s*\]/).map(squash).filter(p => p.length >= MIN_FRAGMENT);
    if (!pieces.length) return false;
    return pieces.every(p => haystack.includes(p));
}

// Web addresses the bridge will not fetch: anything that is not plain public http(s)
export function fetchableUrl(raw: string): boolean {
    let u: URL;
    try { u = new URL(raw); } catch { return false; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return false;
    if (/^\[/.test(h) || /^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return false;
    return true;
}

export async function checkQuote(
    source: string,
    quote: string,
    fetcher: typeof fetch = fetch,
): Promise<QuoteCheck> {
    if (!quote.trim() || !fetchableUrl(source)) return 'unchecked';
    try {
        const res = await fetcher(source, {
            redirect: 'follow',
            signal: AbortSignal.timeout(12000),
            headers: { 'user-agent': 'Mozilla/5.0 (compatible; IndiaScholarshipsBot/1.0; +https://indiascholarships.in)' },
        });
        if (!res.ok) return 'unchecked';
        const type = res.headers.get('content-type') || '';
        if (!/text\/|html|xml|json/i.test(type)) return 'unchecked';
        const body = (await res.text()).slice(0, 3_000_000);
        // Not seen on the page: only a verdict when the page really has text. A page that fills itself in with
        // scripts arrives nearly empty, so that case stays unchecked rather than being called a miss.
        if (quoteInText(quote, pageText(body))) return 'found';
        return squash(pageText(body)).length < 400 ? 'unchecked' : 'not_found';
    } catch {
        return 'unchecked';
    }
}
