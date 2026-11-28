// Daily INR exchange rate for the Study Abroad calculators, read from the RBI home page
// (https://www.rbi.org.in/, "Exchange Rates", marked "Source : FBIL"). Kept free of DB imports so it can be unit tested.
// Nothing is hardcoded as the working rate: the page revalidates daily and the calculator lets the student type their bank's rate.
// If the RBI page cannot be read (down, layout change, or a value that looks wrong), the last rate read by hand is used and the
// page says it is not live.

export const RBI_RATES_URL = 'https://www.rbi.org.in/';

export type RbiCurrency = 'USD' | 'GBP' | 'EUR';

export interface RbiRate {
    currency: RbiCurrency;
    rate: number;          // INR per 1 unit of the currency
    asOf: string;          // YYYY-MM-DD, the date RBI shows next to the rate
    live: boolean;         // false when the saved fallback is used
    sourceUrl: string;
}

// Last values read by hand from the RBI home page: "(As at 1.00pm of November 27, 2026)". Used only when the live read fails.
export const RBI_FALLBACK: Record<RbiCurrency, { rate: number; asOf: string }> = {
    USD: { rate: 92.9139, asOf: '2026-11-27' },
    GBP: { rate: 121.9563, asOf: '2026-11-27' },
    EUR: { rate: 102.0086, asOf: '2026-11-27' },
};

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const toText = (html: string) => html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');

/** Reads "INR / 1 GBP : 121.9563" and the "(As at ... of November 27, 2026)" date from the RBI home page HTML. */
export function parseRbiRate(html: string, currency: RbiCurrency): { rate: number; asOf: string } | null {
    const text = toText(html);
    const row = new RegExp(`INR\\s*/\\s*1\\s+${currency}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i').exec(text);
    if (!row) return null;
    const rate = Number(row[1]);
    // The date sits after the rate rows: "(As at 1.00pm of November 27, 2026)"
    const after = text.slice(row.index);
    const date = /\(\s*As at [^)]*?\bof\s+([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s*\)/i.exec(after);
    if (!date) return null;
    const month = MONTHS.indexOf(date[1].toLowerCase());
    if (month < 0) return null;
    const asOf = `${date[3]}-${String(month + 1).padStart(2, '0')}-${String(Number(date[2])).padStart(2, '0')}`;
    return { rate, asOf };
}

/** A read is believable when it is within 30% of the saved value: guards against a layout change picking up another number. */
export function plausibleRate(currency: RbiCurrency, rate: number): boolean {
    const base = RBI_FALLBACK[currency].rate;
    return Number.isFinite(rate) && rate > base * 0.7 && rate < base * 1.3;
}

export async function getRbiRate(currency: RbiCurrency, fetchImpl: typeof fetch = fetch): Promise<RbiRate> {
    const fallback: RbiRate = { currency, ...RBI_FALLBACK[currency], live: false, sourceUrl: RBI_RATES_URL };
    try {
        const res = await fetchImpl(RBI_RATES_URL, {
            signal: AbortSignal.timeout(8000),
            headers: { 'user-agent': 'india-scholarships-fx/1.0 (+https://www.indiascholarships.in)' },
            // Next.js data cache: read the RBI page at most once a day
            next: { revalidate: 86400 },
        } as RequestInit);
        if (!res.ok) return fallback;
        const parsed = parseRbiRate(await res.text(), currency);
        if (!parsed || !plausibleRate(currency, parsed.rate)) return fallback;
        return { currency, rate: parsed.rate, asOf: parsed.asOf, live: true, sourceUrl: RBI_RATES_URL };
    } catch {
        return fallback;
    }
}
