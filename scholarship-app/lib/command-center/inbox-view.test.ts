import test from 'node:test';
import assert from 'node:assert/strict';
import { briefingLine, facetsFor, reasonLine } from './inbox-view.ts';

const byAgentCategory = { a: { date_change: 2, wording: 1 }, b: { date_change: 5 } };
const byAgentRisky = { a: 1, b: 0 };

test('facetsFor sums only the listed agents', () => {
    assert.deepEqual(facetsFor(byAgentCategory, byAgentRisky, ['a']), { total: 3, byCategory: { date_change: 2, wording: 1 }, risky: 1 });
});

test('facetsFor with no or unknown agents is empty', () => {
    const empty = { total: 0, byCategory: {}, risky: 0 };
    assert.deepEqual(facetsFor(byAgentCategory, byAgentRisky, []), empty);
    assert.deepEqual(facetsFor(byAgentCategory, byAgentRisky, ['zzz']), empty);
});

const base = { agentLabel: 'Deadline Freshness', kind: 'field_change', field: 'deadline', old_value: null, new_value: null, risk: 'normal' };

test('reasonLine uses the verdict and source host', () => {
    const evidence_json = JSON.stringify({ verdict: 'verified', source: 'https://www.nsp.gov.in/page' });
    assert.equal(reasonLine({ ...base, evidence_json }), 'Deadline Freshness: official source confirms it (nsp.gov.in)');
});

test('reasonLine maps every verdict', () => {
    const say = (verdict: string) => reasonLine({ ...base, evidence_json: JSON.stringify({ verdict }) });
    assert.equal(say('agreed'), 'Deadline Freshness: two checks agree');
    assert.equal(say('secondary'), 'Deadline Freshness: only a listing site confirms it');
    assert.equal(say('uncertain'), 'Deadline Freshness: unsure');
});

test('reasonLine falls back without evidence or with bad JSON', () => {
    assert.equal(reasonLine({ ...base, evidence_json: null }), 'Deadline Freshness: no evidence recorded');
    assert.equal(reasonLine({ ...base, evidence_json: '{bad' }), 'Deadline Freshness: no evidence recorded');
});

test('reasonLine for a new scholarship', () => {
    assert.equal(
        reasonLine({ ...base, agentLabel: 'Scholarship Scout', kind: 'new_scholarship', evidence_json: null }),
        'Scholarship Scout: new scholarship found, no evidence recorded',
    );
});

test('reasonLine flags risky items', () => {
    assert.equal(reasonLine({ ...base, risk: 'high', evidence_json: null }), 'Deadline Freshness: no evidence recorded · risky');
});

const labels = { date_change: 'deadline changes', study_abroad: 'Study Abroad changes', wording: 'wording updates', amount_change: 'amount changes' };

test('briefingLine lists the biggest groups and counts the rest', () => {
    assert.equal(
        briefingLine({ date_change: 165, study_abroad: 24, wording: 10, amount_change: 0 }, labels, 2),
        '165 deadline changes, 24 Study Abroad changes, 10 more',
    );
});

test('briefingLine is empty when nothing is waiting', () => {
    assert.equal(briefingLine({ date_change: 0 }, labels, 2), '');
});
