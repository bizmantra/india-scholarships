import test from 'node:test';
import assert from 'node:assert/strict';
import { mergePicks, SCHOLARSHIP_PICKS } from './scholarship-picks.ts';

const row = (slug: string) => ({ slug });
const picks = { show: ['b', 'a'], hide: ['dup'] };

test('picked scholarships come first, in the order of show', () => {
    assert.deepEqual(mergePicks([row('a'), row('b')], [row('c')], picks, 10).map(r => r.slug), ['b', 'a', 'c']);
});

test('hidden duplicates and picked entries are dropped from the rest', () => {
    assert.deepEqual(mergePicks([row('a')], [row('dup'), row('a'), row('c')], picks, 10).map(r => r.slug), ['a', 'c']);
});

test('a picked slug that is missing from the database is skipped', () => {
    assert.deepEqual(mergePicks([row('a')], [], picks, 10).map(r => r.slug), ['a']);
});

test('the limit applies after merging', () => {
    assert.deepEqual(mergePicks([row('a'), row('b')], [row('c'), row('d')], picks, 3).map(r => r.slug), ['b', 'a', 'c']);
});

test('repeated rows in the rest appear once', () => {
    assert.deepEqual(mergePicks([], [row('c'), row('c')], picks, 10).map(r => r.slug), ['c']);
});

test('UK picks and hides do not overlap', () => {
    const uk = SCHOLARSHIP_PICKS.uk;
    assert.equal(uk.show.filter(s => uk.hide.includes(s)).length, 0);
});
