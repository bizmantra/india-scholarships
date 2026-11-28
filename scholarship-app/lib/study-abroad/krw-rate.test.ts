import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBokUsdKrw, plausibleBokRate, getBokUsdKrwRate, assembleKrwInrRate, crossKrwInr, BOK_USD_KRW_FALLBACK, bokSeriesUrl, RBI_RATES_URL } from './krw-rate.ts';

const BOK = {
    StatisticSearch: {
        list_total_count: 2,
        row: [
            { STAT_CODE: '731Y003', ITEM_CODE1: '0000003', ITEM_NAME1: 'Won per United States Dollar (Close 15:30)', TIME: '20261126', DATA_VALUE: '1342.7' },
            { STAT_CODE: '731Y003', ITEM_CODE1: '0000003', ITEM_NAME1: 'Won per United States Dollar (Close 15:30)', TIME: '20261127', DATA_VALUE: '1337.9' },
        ],
    },
};

test('parses the latest official USD/KRW close and its date', () => {
    assert.deepEqual(parseBokUsdKrw(BOK), { rate: 1337.9, asOf: '2026-11-27' });
    assert.deepEqual(parseBokUsdKrw(JSON.stringify(BOK)), { rate: 1337.9, asOf: '2026-11-27' });
});

test('returns null when the series, item or values are missing', () => {
    assert.equal(parseBokUsdKrw({ RESULT: { CODE: 'INFO-200' } }), null);
    assert.equal(parseBokUsdKrw({ StatisticSearch: { row: [{ STAT_CODE: '731Y003', ITEM_CODE1: '0000001', TIME: '20261127', DATA_VALUE: '1337.9' }] } }), null);
    assert.equal(parseBokUsdKrw('not json'), null);
});

test('a close far from the saved one is not believable', () => {
    assert.equal(plausibleBokRate(1337.9), true);
    assert.equal(plausibleBokRate(200), false);
    assert.equal(plausibleBokRate(NaN), false);
});

test('builds a dated ECOS StatisticSearch URL for series 731Y003', () => {
    const url = bokSeriesUrl(new Date('2026-11-28T00:00:00Z'), 21);
    assert.equal(url, 'https://ecos.bok.or.kr/api/StatisticSearch/sample/json/en/1/14/731Y003/D/20261107/20261128/0000003');
});

test('uses the live Bank of Korea close when ECOS answers, and the saved one when it does not', async () => {
    const live = await getBokUsdKrwRate(async () => new Response(JSON.stringify(BOK), { status: 200 }));
    assert.equal(live.live, true);
    assert.equal(live.rate, 1337.9);
    assert.equal(live.asOf, '2026-11-27');
    const down = await getBokUsdKrwRate(async () => new Response('', { status: 503 }));
    assert.equal(down.live, false);
    assert.equal(down.rate, BOK_USD_KRW_FALLBACK.rate);
    const broken = await getBokUsdKrwRate(async () => { throw new Error('offline'); });
    assert.equal(broken.live, false);
    const garbage = await getBokUsdKrwRate(async () => new Response(JSON.stringify({ StatisticSearch: { row: [{ STAT_CODE: '731Y003', ITEM_CODE1: '0000003', TIME: '20261127', DATA_VALUE: '1.2' }] } }), { status: 200 }));
    assert.equal(garbage.live, false);
});

test('cross rate is RBI USD/INR divided by the Bank of Korea KRW/USD close', () => {
    assert.equal(crossKrwInr(92.9139, 1337.9), 92.9139 / 1337.9);
    assert.equal(crossKrwInr(92.9139, 0), null);
});

test('assembleKrwInrRate is live only when both official reads succeed', () => {
    const usdLive = { rate: 92.9139, asOf: '2026-11-27', live: true, sourceUrl: RBI_RATES_URL };
    const bokLive = { rate: 1337.9, asOf: '2026-11-27', live: true, sourceUrl: 'https://ecos.bok.or.kr/api/StatisticSearch/sample/json/en/1/14/731Y003/D/20261107/20261128/0000003' };
    const live = assembleKrwInrRate(usdLive, bokLive);
    assert.equal(live.live, true);
    assert.equal(live.rate, 92.9139 / 1337.9);
    assert.equal(live.asOf, '2026-11-27');

    const mixed = assembleKrwInrRate(usdLive, { ...bokLive, live: false });
    assert.equal(mixed.live, false);
    assert.equal(mixed.rate, 92.9139 / 1337.9);
});
