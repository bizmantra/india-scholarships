import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { rowForNewInsert } = require('../../scripts/lib/sa-inbox.js');

const NOW = '2026-11-28 10:00:00';

test('sa_facts insert omits status and created_at, and still stamps updated_at', () => {
    const row = rowForNewInsert('sa_facts', 'uk.funds.max_months', {
        key: 'uk.funds.max_months',
        label: 'Maximum months of living costs',
        country: 'uk',
        value: '9',
        unit: 'months',
        official_source: 'https://www.gov.uk/student-visa/money',
        checked_at: '2026-11-28',
        notes: 'ST 12.3',
    }, NOW);
    assert.equal(row.key, 'uk.funds.max_months');
    assert.equal(row.value, '9');
    assert.equal(row.updated_at, NOW);
    assert.equal(row.notes, 'ST 12.3');
    assert.equal('status' in row, false);
    assert.equal('created_at' in row, false);
});

test('a status in an sa_facts payload is dropped, not stored', () => {
    const row = rowForNewInsert('sa_facts', 'uk.funds.hold_days', {
        key: 'uk.funds.hold_days',
        label: 'Hold days',
        country: 'uk',
        value: '28',
        unit: 'days',
        official_source: 'https://www.gov.uk/student-visa/money',
        checked_at: '2026-11-28',
        status: 'published',
    }, NOW);
    assert.equal('status' in row, false);
});

test('universities, guides and programs still insert as draft with created_at and updated_at', () => {
    for (const [table, key, data] of [
        ['sa_universities', 'ucl', { name: 'UCL', country: 'uk', summary: 'A university.', seo_title: 'UCL', meta_description: 'x', body_md: 'y', official_source: 'https://www.ucl.ac.uk', checked_at: '2026-11-28', status: 'published' }],
        ['sa_guides', 'uk-student-visa-guide', { title: 'Visa guide', country: 'uk', kind: 'visa', summary: 'A guide.', seo_title: 'Visa', meta_description: 'x', body_md: 'y', official_source: 'https://www.gov.uk/student-visa', checked_at: '2026-11-28' }],
        ['sa_programs', 'program_ucl-mba', { slug: 'ucl-mba', university_slug: 'ucl', country: 'uk', degree: 'mba', field: 'business', title: 'MBA' }],
    ] as const) {
        const row = rowForNewInsert(table, key, { ...data }, NOW);
        assert.equal(row.status, 'draft', `${table} must be forced to draft`);
        assert.equal(row.created_at, NOW, `${table} must set created_at`);
        assert.equal(row.updated_at, NOW, `${table} must set updated_at`);
    }
});

test('unknown columns are not inserted, even if they arrived in the payload', () => {
    const row = rowForNewInsert('sa_facts', 'uk.funds.hold_window_days', {
        key: 'uk.funds.hold_window_days',
        label: 'Hold window',
        country: 'uk',
        value: '31',
        unit: 'days',
        official_source: 'https://www.gov.uk/student-visa/money',
        checked_at: '2026-11-28',
        invent_me: 'nope',
    }, NOW);
    assert.equal('invent_me' in row, false);
    assert.equal(row.value, '31');
});
