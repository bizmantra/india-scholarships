// INR per Korean won, as a live cross rate: RBI USD/INR ÷ Bank of Korea KRW/USD close.
// The Bank of Korea figure is ECOS series 731Y003, item 0000003 ("Won per United States Dollar (Close 15:30)").
// Nothing is hardcoded as the working rate. If either official read fails, use the last rates read by
// hand and mark the result not live.
//
// A page composes it with the existing RBI reader:
//   const [usd, krw] = await Promise.all([getRbiRate('USD'), getBokUsdKrwRate()]);
//   const fx = assembleKrwInrRate(usd, krw);

export const BOK_ECOS_SERIES = '731Y003';
export const BOK_USD_KRW_ITEM = '0000003';
export const BOK_SAMPLE_API = 'https://ecos.bok.or.kr/api/StatisticSearch/sample/json/en';
export const RBI_RATES_URL = 'https://www.rbi.org.in/';

// Last close read by hand from ECOS 731Y003 (15:30), 27 November 2026. Used only when the live read fails.
export const BOK_USD_KRW_FALLBACK = { rate: 1337.9, asOf: '2026-11-27' };

export interface FxLeg {
    rate: number;
    asOf: string;          // YYYY-MM-DD
    live: boolean;
    sourceUrl: string;
}

export interface KrwInrRate {
    rate: number;          // INR per 1 KRW
    asOf: string;          // earlier of the two source dates
    live: boolean;         // true only when both legs are live
    usdInr: FxLeg;
    krwPerUsd: FxLeg;
    sourceUrls: { rbi: string; bok: string };
}

const yyyymmdd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

/** Public ECOS StatisticSearch URL for the last `days` of the official USD/KRW close. */
export function bokSeriesUrl(end = new Date(), days = 21): string {
    const to = yyyymmdd(end);
    const from = yyyymmdd(new Date(end.getTime() - days * 86400 * 1000));
    return `${BOK_SAMPLE_API}/1/14/${BOK_ECOS_SERIES}/D/${from}/${to}/${BOK_USD_KRW_ITEM}`;
}

type BokRow = { STAT_CODE?: string; ITEM_CODE1?: string; TIME?: string; DATA_VALUE?: string | number };

/** Reads the latest 15:30 USD/KRW close from an ECOS StatisticSearch JSON body. */
export function parseBokUsdKrw(payload: unknown): { rate: number; asOf: string } | null {
    let data: unknown = payload;
    if (typeof payload === 'string') {
        try { data = JSON.parse(payload); } catch { return null; }
    }
    const rows = (data as { StatisticSearch?: { row?: BokRow | BokRow[] } } | null)?.StatisticSearch?.row;
    const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
    const usable = list.filter(r => r && r.STAT_CODE === BOK_ECOS_SERIES && r.ITEM_CODE1 === BOK_USD_KRW_ITEM && /^\d{8}$/.test(String(r.TIME || '')) && Number.isFinite(Number(r.DATA_VALUE)));
    if (!usable.length) return null;
    usable.sort((a, b) => String(a.TIME).localeCompare(String(b.TIME)));
    const latest = usable[usable.length - 1];
    const time = String(latest.TIME);
    return {
        rate: Number(latest.DATA_VALUE),
        asOf: `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}`,
    };
}

/** A close is believable when it is within 30% of the saved value. */
export function plausibleBokRate(rate: number): boolean {
    const base = BOK_USD_KRW_FALLBACK.rate;
    return Number.isFinite(rate) && rate > base * 0.7 && rate < base * 1.3;
}

export async function getBokUsdKrwRate(fetchImpl: typeof fetch = fetch): Promise<FxLeg> {
    const sourceUrl = bokSeriesUrl();
    const fallback: FxLeg = { ...BOK_USD_KRW_FALLBACK, live: false, sourceUrl };
    try {
        const res = await fetchImpl(sourceUrl, {
            signal: AbortSignal.timeout(8000),
            headers: { 'user-agent': 'india-scholarships-fx/1.0 (+https://www.indiascholarships.in)' },
            next: { revalidate: 86400 },
        } as RequestInit);
        if (!res.ok) return fallback;
        const parsed = parseBokUsdKrw(await res.json());
        if (!parsed || !plausibleBokRate(parsed.rate)) return fallback;
        return { rate: parsed.rate, asOf: parsed.asOf, live: true, sourceUrl };
    } catch {
        return fallback;
    }
}

export function crossKrwInr(usdInr: number, krwPerUsd: number): number | null {
    if (!Number.isFinite(usdInr) || !Number.isFinite(krwPerUsd) || krwPerUsd <= 0) return null;
    return usdInr / krwPerUsd;
}

/** Combine an RBI USD/INR read with a Bank of Korea USD/KRW close. */
export function assembleKrwInrRate(usdInr: FxLeg, krwPerUsd: FxLeg): KrwInrRate {
    const rate = crossKrwInr(usdInr.rate, krwPerUsd.rate);
    if (rate == null) {
        throw new Error('Cannot build a KRW/INR rate from the given USD legs');
    }
    const asOf = usdInr.asOf <= krwPerUsd.asOf ? usdInr.asOf : krwPerUsd.asOf;
    return {
        rate,
        asOf,
        live: usdInr.live && krwPerUsd.live,
        usdInr,
        krwPerUsd,
        sourceUrls: { rbi: usdInr.sourceUrl || RBI_RATES_URL, bok: krwPerUsd.sourceUrl },
    };
}
