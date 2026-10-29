import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSections, isOpen, sortByPriority, staleDays, TEAM_IDS, categoryLabel, type BacklogItem } from './backlog-types.ts';

const NOW = Date.parse('2026-10-30T00:00:00Z');

const item = (over: Partial<BacklogItem>): BacklogItem => ({
    id: 'IS-1', category: 'dev', title: 't', description: '', impact: 'Medium', status: 'Backlog', type: '',
    due_date: null, note: null, waiting: false, assignee: null, link: null, updated_at: '2026-10-29 00:00:00', ...over,
});

test('open statuses are everything except Done and Parked', () => {
    assert.deepEqual(['Backlog', 'Ready', 'In Progress', 'Review', 'Done', 'Parked'].map(s => isOpen(s as BacklogItem['status'])), [true, true, true, true, false, false]);
});

test('an item in Review is waiting on the owner even without the flag', () => {
    const sections = buildSections([item({ id: 'IS-1', status: 'Review' }), item({ id: 'IS-2' })], NOW);
    assert.deepEqual(sections.waiting.map(i => i.id), ['IS-1']);
    assert.deepEqual(sections.doNext.map(i => i.id), ['IS-2']);
});

test('Ready items count as later work, and show up in the top five', () => {
    const items = [1, 2, 3, 4, 5, 6, 7].map(n => item({ id: `IS-${n}`, status: n === 7 ? 'Ready' : 'Backlog' }));
    const sections = buildSections(items, NOW);
    // Same due date and impact: Ready sorts ahead of Backlog, so IS-7 makes the top five
    assert.ok(sections.doNext.some(i => i.id === 'IS-7'));
    assert.deepEqual(sections.later.map(i => i.id), ['IS-5', 'IS-6']);
});

test('started work sorts before queued work before the rest, at the same impact', () => {
    const sorted = sortByPriority([
        item({ id: 'IS-1', status: 'Backlog' }), item({ id: 'IS-2', status: 'Ready' }), item({ id: 'IS-3', status: 'In Progress' }),
    ], NOW);
    assert.deepEqual(sorted.map(i => i.id), ['IS-3', 'IS-2', 'IS-1']);
});

test('impact still beats status', () => {
    const sorted = sortByPriority([item({ id: 'IS-1', status: 'In Progress', impact: 'Low' }), item({ id: 'IS-2', impact: 'Critical' })], NOW);
    assert.deepEqual(sorted.map(i => i.id), ['IS-2', 'IS-1']);
});

test('staleness uses a shorter limit for Review', () => {
    const eightDaysAgo = '2026-10-22 00:00:00';
    assert.equal(staleDays(item({ status: 'Review', updated_at: eightDaysAgo }), NOW), 8);
    assert.equal(staleDays(item({ status: 'In Progress', updated_at: eightDaysAgo }), NOW), null);
    assert.equal(staleDays(item({ status: 'Done', updated_at: '2020-01-01 00:00:00' }), NOW), null);
});

test('the seven teams are fixed and labelled; older categories get a readable label', () => {
    assert.deepEqual(TEAM_IDS, ['dev', 'content-research', 'content-creation', 'data', 'strategy', 'seo', 'growth']);
    assert.equal(categoryLabel('growth'), 'Growth / Distribution');
    assert.equal(categoryLabel('content'), 'Content (unsorted)');
    assert.equal(categoryLabel('study-abroad'), 'Study abroad');
});
