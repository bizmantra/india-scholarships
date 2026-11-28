import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRbiRate, plausibleRate, getRbiRate, RBI_FALLBACK } from './rbi-rate.ts';

const PAGE = `<h3><a>Exchange &nbsp;Rates</a></h3><table>
<tr><th>INR / 1 USD</th><td>: 92.9139</td></tr>
<tr><th>INR / 1 GBP</th><td> : 121.9563</td></tr>
<tr><th>INR / 1 EUR</th><td>: 102.0086</td></tr>
<tr><th>INR / 100 JPY</th><td>: 58.3200</td></tr></table>
(As at 1.00pm of November 27, 2026) *(As at 3.00pm of November 27, 2026) (Source : FBIL)`;

test('parses the rate and the as-at date from the RBI page', () => {
    assert.deepEqual(parseRbiRate(PAGE, 'GBP'), { rate: 121.9563, asOf: '2026-11-27' });
    assert.deepEqual(parseRbiRate(PAGE, 'USD'), { rate: 92.9139, asOf: '2026-11-27' });
});

test('returns null when the rate row or the date is missing', () => {
    assert.equal(parseRbiRate('<p>nothing here</p>', 'GBP'), null);
    assert.equal(parseRbiRate('<tr><th>INR / 1 GBP</th><td>: 121.95</td></tr>', 'GBP'), null);
});

test('a rate far from the saved one is not believable', () => {
    assert.equal(plausibleRate('GBP', 121.9), true);
    assert.equal(plausibleRate('GBP', 12.19), false);
    assert.equal(plausibleRate('GBP', NaN), false);
});

test('uses the live rate when RBI answers, and the saved one when it does not', async () => {
    const live = await getRbiRate('GBP', async () => new Response(PAGE.replace('121.9563', '123.1000'), { status: 200 }));
    assert.equal(live.live, true);
    assert.equal(live.rate, 123.1);
    const down = await getRbiRate('GBP', async () => new Response('', { status: 503 }));
    assert.equal(down.live, false);
    assert.equal(down.rate, RBI_FALLBACK.GBP.rate);
    const broken = await getRbiRate('GBP', async () => { throw new Error('offline'); });
    assert.equal(broken.live, false);
    const garbage = await getRbiRate('GBP', async () => new Response(PAGE.replace('121.9563', '1.2'), { status: 200 }));
    assert.equal(garbage.live, false);
});
