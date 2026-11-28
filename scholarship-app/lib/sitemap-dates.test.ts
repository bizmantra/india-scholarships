import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDbDate, latestDate, scholarshipLastModified } from './sitemap-dates.ts';

test('parseDbDate reads dates, SQLite timestamps and ISO strings as UTC', () => {
    assert.equal(parseDbDate('2026-11-28')?.toISOString(), '2026-11-28T00:00:00.000Z');
    assert.equal(parseDbDate('2026-11-28 10:15:06')?.toISOString(), '2026-11-28T10:15:06.000Z');
    assert.equal(parseDbDate('2026-11-28T10:15:06.907Z')?.toISOString(), '2026-11-28T10:15:06.907Z');
    assert.equal(parseDbDate('2026-11-28T15:45:00+05:30')?.toISOString(), '2026-11-28T10:15:00.000Z');
});

test('parseDbDate returns undefined for empty or invalid values', () => {
    for (const v of [null, undefined, '', '  ', 'not a date', 'Verified']) assert.equal(parseDbDate(v), undefined);
});

test('latestDate picks the newest valid date and ignores junk', () => {
    assert.equal(latestDate(['2026-01-01', null, 'x', '2026-03-01 00:00:00', '2026-02-01'])?.toISOString(), '2026-03-01T00:00:00.000Z');
    assert.equal(latestDate([null, '']), undefined);
    assert.equal(latestDate([]), undefined);
});

test('scholarshipLastModified uses the newest of updated_at, last_verified and created_at, and never invents "now"', () => {
    assert.equal(scholarshipLastModified({ last_verified: '2026-11-20', created_at: '2026-11-28 09:00:00' })?.toISOString(), '2026-11-28T09:00:00.000Z');
    assert.equal(scholarshipLastModified({ last_verified: null, created_at: null }), undefined);
    assert.equal(scholarshipLastModified({}), undefined);
});
