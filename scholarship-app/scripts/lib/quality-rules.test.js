/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Offline tests for the Study Abroad quality rules (Spec D3), focused on rule 4's freshness warning.
 * No network, no database: `auditStudyAbroad` takes the rows directly and an explicit `today`, so the
 * 90-day boundary is deterministic.
 *
 * Run: node --test scripts/lib/quality-rules.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { auditStudyAbroad, auditStudyAbroadLinkGraph } = require('./quality-rules.js');

// Fixed "today" so the age of checked_at never depends on when the test runs.
const TODAY = new Date('2026-10-30T00:00:00Z');

// A published study guide that trips no rule except (when we ask for it) rule 4's stale warning.
const guideRow = (checkedAt, overrides = {}) => ({
    slug: 'offline-test-visa-guide',
    title: 'Offline test visa guide',
    kind: 'visa',
    country: 'germany',
    status: 'published',
    summary: 'A short plain summary used only by the offline quality-rule test.',
    seo_title: 'Offline test visa guide',
    // 118 characters: inside rule 2's 110 to 170 window
    meta_description: 'An offline test meta description that is long enough to satisfy the Study Abroad quality rule for the offline test fixture.',
    body_md: 'Plain article text with no links and no research-note phrases.',
    official_source: 'https://www.auswaertiges-amt.de/en/visa',
    checked_at: checkedAt,
    ...overrides,
});

const auditOneGuide = row => auditStudyAbroad({ guides: [row] }, { today: TODAY });
const staleWarnings = result => result.issues.filter(i => i.rule === 4 && i.code === 'stale_checked_at');

test('rule 4 warns when checked_at is older than 90 days (stale_checked_at)', () => {
    const result = auditOneGuide(guideRow('2025-01-01'));
    const warnings = staleWarnings(result);

    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].severity, 'warning');
    assert.equal(warnings[0].table, 'sa_guides');
    assert.equal(warnings[0].id, 'offline-test-visa-guide');
    assert.match(warnings[0].message, /2025-01-01/);
    assert.match(warnings[0].message, /exceeds 90 days/);

    // The warning is counted as a warning, never as an error.
    assert.equal(result.summary.countsByRule.rule4_warnings, 1);
    assert.equal(result.summary.countsByRule.rule4_errors, 0);
    assert.equal(result.summary.totalWarnings, 1);
    assert.equal(result.summary.totalErrors, 0);
    assert.equal(result.summary.pagesWithWarnings, 1);

    // And it reaches the per-page report the gate reads.
    const page = result.pages.find(p => p.id === 'offline-test-visa-guide');
    assert.deepEqual(page.warnings.map(w => w.code), ['stale_checked_at']);
    assert.deepEqual(page.errors, []);
});

test('rule 4 does not warn at exactly 90 days or newer (the boundary is > 90)', () => {
    assert.equal(staleWarnings(auditOneGuide(guideRow('2026-08-01'))).length, 0); // exactly 90 days
    assert.equal(staleWarnings(auditOneGuide(guideRow('2026-10-01'))).length, 0); // 29 days
});

test('rule 4 warns at 91 days old', () => {
    const warnings = staleWarnings(auditOneGuide(guideRow('2026-07-31'))); // 91 days before TODAY
    assert.equal(warnings.length, 1);
    assert.match(warnings[0].message, /exceeds 90 days/);
});

test('rule 4 warns on a stale sa_facts row too', () => {
    const result = auditStudyAbroad({
        facts: [{
            key: 'offline.test.fact',
            label: 'Offline test fact',
            value: '11904',
            unit: 'EUR',
            official_source: 'https://www.ice.gov/sevis/i901',
            checked_at: '2025-01-01',
        }],
    }, { today: TODAY });

    const warnings = staleWarnings(result);
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].table, 'sa_facts');
    assert.equal(warnings[0].id, 'offline.test.fact');
    assert.equal(warnings[0].severity, 'warning');
    assert.match(warnings[0].message, /exceeds 90 days/);
});

test('a missing checked_at is a rule 4 error, not a stale warning', () => {
    const result = auditStudyAbroad({ guides: [guideRow('')] }, { today: TODAY });
    assert.equal(staleWarnings(result).length, 0);
    assert.equal(result.summary.countsByRule.rule4_errors, 1);
    assert.ok(result.issues.some(i => i.rule === 4 && i.code === 'missing_source' && i.severity === 'error'));
});

test('rule 6 fails on links to redirects, drafts, unlaunched countries, and missing pages', () => {
    const body = [
        '[Redirect](/study-abroad/old-path)',
        '[Draft](/study-abroad/universities/draft-uni)',
        '[Hidden](/study-abroad/study-in/uk)',
        '[Missing](/study-abroad/universities/does-not-exist)',
    ].join(' ');
    const result = auditStudyAbroad({
        guides: [guideRow('2026-10-01', { body_md: body })],
        universities: [{ slug: 'draft-uni', name: 'Draft Uni', country: 'germany', status: 'draft' }],
    }, {
        today: TODAY,
        redirects: [{ source: '/study-abroad/old-path', destination: '/study-abroad/study-in/germany' }],
    });
    const codes = result.issues.filter(i => i.rule === 6).map(i => i.code).sort();
    assert.deepEqual(codes, ['broken_internal_link', 'draft_internal_link', 'redirect_internal_link', 'unlaunched_country_link']);
});

test('link graph check flags published university/course with fewer than 3 incoming links', () => {
    const result = auditStudyAbroadLinkGraph({
        universities: [
            { slug: 'uni-a', name: 'Uni A', country: 'germany', status: 'published' },
            { slug: 'uni-b', name: 'Uni B', country: 'germany', status: 'published' },
        ],
        programs: [
            { id: '1', slug: 'cs', university_slug: 'uni-a', country: 'germany', degree: 'ms', field: 'cs', status: 'published' },
        ],
        guides: [],
    });
    // uni-a gets: country list + cs program + uni-b similar = 3 (passes)
    // uni-b gets: country list + uni-a similar = 2 (fails)
    // cs gets: uni-a only = 1 (fails)
    assert.equal(result.incomingCounts['/study-abroad/universities/uni-a'], 3);
    assert.equal(result.incomingCounts['/study-abroad/universities/uni-b'], 2);
    assert.equal(result.incomingCounts['/study-abroad/program-detail/germany/uni-a/cs'], 1);
    assert.equal(result.summary.lowIncomingErrors, 2);
});
