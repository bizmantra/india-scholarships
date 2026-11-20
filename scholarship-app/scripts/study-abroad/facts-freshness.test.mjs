// Offline tests for the facts-freshness rules (spec D4). No database: `today` is injected.
// Run: node --test scripts/study-abroad/facts-freshness.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STALE_DAYS, classifyFact, classifyMoneyRow, daysSince, summarise } from './facts-freshness.mjs';

const TODAY = '2026-11-01';
const fact = (over = {}) => ({ key: 'usa.visa.sevis_i901_fee_usd', label: 'SEVIS fee', value: '350', unit: 'USD', official_source: 'https://www.ice.gov/sevis/i901', checked_at: '2026-10-29', recheck_after: '2027-01-27', ...over });

test('a sourced, recently checked fact with a future re-check is not flagged', () => {
    const r = classifyFact(fact(), TODAY);
    assert.deepEqual(r.flags, []);
    assert.equal(r.why, '');
    assert.equal(r.age_days, 3);
});

test('a missing official source is flagged', () => {
    assert.deepEqual(classifyFact(fact({ official_source: '' }), TODAY).flags, ['no_source']);
});

test('a missing checked_at is flagged', () => {
    assert.deepEqual(classifyFact(fact({ checked_at: null }), TODAY).flags, ['no_check_date']);
});

test('the stale boundary is strictly older than 90 days', () => {
    assert.equal(daysSince('2026-08-03', TODAY), STALE_DAYS);          // exactly 90 days
    assert.deepEqual(classifyFact(fact({ checked_at: '2026-08-03' }), TODAY).flags, []);
    assert.deepEqual(classifyFact(fact({ checked_at: '2026-08-02' }), TODAY).flags, ['stale_check']);
});

test('a passed recheck_after is flagged, and the reason names the date', () => {
    const r = classifyFact(fact({ recheck_after: '2026-10-01' }), TODAY);
    assert.deepEqual(r.flags, ['recheck_due']);
    assert.match(r.why, /2026-10-01/);
});

test('several problems are reported together, in a readable order', () => {
    const r = classifyFact(fact({ official_source: '', checked_at: null, recheck_after: '2026-01-01' }), TODAY);
    assert.deepEqual(r.flags, ['no_source', 'no_check_date', 'recheck_due']);
    assert.match(r.why, /no official source recorded; no valid check date recorded/);
});

test('an unreadable date counts as no check date rather than as stale', () => {
    assert.equal(daysSince('', TODAY), null);
    assert.equal(daysSince('not a date', TODAY), null);
    assert.deepEqual(classifyFact(fact({ checked_at: 'n/a' }), TODAY).flags, ['no_check_date']);
    assert.deepEqual(classifyFact(fact({ checked_at: '2026-13-45' }), TODAY).flags, ['no_check_date']);
});

test('a published page with money figures and no provenance is flagged', () => {
    const r = classifyMoneyRow({ slug: 'tum', name: 'TUM', country: 'germany', tuition_per_year: 0, tuition_currency: 'EUR', official_source: '', checked_at: '' }, 'sa_universities');
    assert.equal(r.table, 'sa_universities');
    assert.equal(r.key, 'tum');
    assert.deepEqual(r.flags, ['no_provenance']);
    assert.match(r.why, /no official source and no check date/);
});

test('a page with provenance, or with no money figures, is not flagged', () => {
    assert.equal(classifyMoneyRow({ slug: 'tum', tuition_per_year: 3000, official_source: 'https://www.tum.de/x', checked_at: '2026-10-01' }, 'sa_universities'), null);
    assert.equal(classifyMoneyRow({ slug: 'tum', official_source: '', checked_at: '' }, 'sa_universities'), null);
});

test('the summary counts flags, flagged items and money rows', () => {
    const items = [
        classifyFact(fact(), TODAY),
        classifyFact(fact({ key: 'a', official_source: '' }), TODAY),
        classifyFact(fact({ key: 'b', checked_at: null, recheck_after: '2026-01-01' }), TODAY),
    ];
    const s = summarise(items, [{}, {}]);
    assert.equal(s.facts, 3);
    assert.equal(s.flagged, 2);
    assert.deepEqual(s.by_flag, { no_source: 1, no_check_date: 1, recheck_due: 1 });
    assert.equal(s.money_rows_flagged, 2);
    assert.equal(s.worst.length, 2);
});
