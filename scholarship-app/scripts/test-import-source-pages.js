/**
 * Tests for scripts/import-source-pages.js
 *
 * Covers:
 * - valid official page
 * - home page (rejected for source_pages)
 * - coaching site (rejected)
 * - own site (rejected)
 * - duplicate URLs (deduplicated)
 * - more than 8 pages (capped at 8)
 * - existing pages preserved (merged)
 * - ended-or-replaced & not-found (routed to review file, not DB)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const {
    validateSourcePage,
    validateSecondarySource,
    mergePages,
    processBatch
} = require('./import-source-pages');
const sources = require('./lib/sources');

console.log('🧪 Running tests for import-source-pages.js...\n');

// 1. Valid official page
{
    const res = validateSourcePage({
        url: 'https://scholarships.gov.in/public/schemeGuidelines/NSP_FAQ.pdf',
        facts: ['deadline', 'amount_min'],
        confirmed: '2026-11-05'
    });
    assert.strictEqual(res.ok, true, 'Valid official page should be accepted');
    assert.strictEqual(res.page.url, 'https://scholarships.gov.in/public/schemeGuidelines/NSP_FAQ.pdf');
    assert.deepStrictEqual(res.page.facts, ['deadline', 'amount_min']);
    assert.strictEqual(res.page.confirmed, '2026-11-05');
    console.log('✅ Valid official page test passed');
}

// 2. Home page rejected for source_pages
{
    const res = validateSourcePage({
        url: 'https://scholarships.gov.in/'
    });
    assert.strictEqual(res.ok, false, 'Home page must be rejected for source_pages');
    assert.match(res.error, /Rejected home-page-only URL/i);
    console.log('✅ Home page rejection test passed');
}

// 3. Coaching site rejected
{
    const res1 = validateSourcePage({ url: 'https://byjus.com/scholarship/nsp-test' });
    assert.strictEqual(res1.ok, false, 'Coaching URL must be rejected for source_pages');
    assert.match(res1.error, /Rejected coaching URL/i);

    const res2 = validateSecondarySource({ url: 'https://allen.ac.in/scholarship/tallentex' });
    assert.strictEqual(res2.ok, false, 'Coaching URL must be rejected for secondary_sources');
    assert.match(res2.error, /Rejected coaching URL/i);
    console.log('✅ Coaching site rejection test passed');
}

// 4. Own site rejected
{
    const res = validateSourcePage({ url: 'https://indiascholarships.in/scholarships/nsp-scheme' });
    assert.strictEqual(res.ok, false, 'Own-site URL must be rejected');
    assert.match(res.error, /Rejected invalid\/own-site\/redirect URL/i);
    console.log('✅ Own-site rejection test passed');
}

// 5. Duplicate URLs deduplicated
{
    const existing = [
        { url: 'https://scholarships.gov.in/scheme-a.pdf', facts: ['deadline'], confirmed: '2026-10-01' }
    ];
    const incoming = [
        { url: 'https://scholarships.gov.in/scheme-a.pdf', facts: ['deadline', 'amount_min'], confirmed: '2026-11-05' },
        { url: 'https://scholarships.gov.in/scheme-b.pdf', facts: ['page'], confirmed: '2026-11-05' }
    ];
    const merged = mergePages(existing, incoming);
    assert.strictEqual(merged.length, 2, 'Duplicates should be merged into unique items');
    assert.strictEqual(merged[0].url, 'https://scholarships.gov.in/scheme-a.pdf');
    assert.deepStrictEqual(merged[0].facts, ['deadline', 'amount_min'], 'Incoming update should take precedence');
    console.log('✅ Duplicate URLs test passed');
}

// 6. Capped at 8 pages
{
    const incoming = Array.from({ length: 12 }, (_, i) => ({
        url: `https://scholarships.gov.in/doc-${i + 1}.pdf`,
        facts: ['page'],
        confirmed: '2026-11-05'
    }));
    const merged = mergePages([], incoming);
    assert.strictEqual(merged.length, 8, 'Merged pages must be capped at 8 items');
    assert.strictEqual(merged[0].url, 'https://scholarships.gov.in/doc-1.pdf');
    assert.strictEqual(merged[7].url, 'https://scholarships.gov.in/doc-8.pdf');
    console.log('✅ Max 8 pages cap test passed');
}

// 7. Existing pages preserved
{
    const existing = [
        { url: 'https://scholarships.gov.in/old-guidelines.pdf', facts: ['page'], confirmed: '2026-09-01' }
    ];
    const incoming = [
        { url: 'https://scholarships.gov.in/new-circular.pdf', facts: ['deadline'], confirmed: '2026-11-05' }
    ];
    const merged = mergePages(existing, incoming);
    assert.strictEqual(merged.length, 2, 'Existing pages should be preserved alongside new pages');
    assert.strictEqual(merged[0].url, 'https://scholarships.gov.in/new-circular.pdf', 'New page should be first');
    assert.strictEqual(merged[1].url, 'https://scholarships.gov.in/old-guidelines.pdf', 'Older page should be retained');
    console.log('✅ Existing pages preserved test passed');
}

// 8. End-to-end batch processing against in-memory DB
{
    const testDb = new Database(':memory:');
    testDb.exec(`
        CREATE TABLE scholarships (
            id INTEGER PRIMARY KEY,
            slug TEXT UNIQUE,
            title TEXT,
            apply_url TEXT,
            source_pages TEXT,
            secondary_sources TEXT
        );
        INSERT INTO scholarships (id, slug, title, apply_url, source_pages, secondary_sources)
        VALUES (
            1,
            'test-scholarship-one',
            'Test Scholarship One',
            'https://testportal.gov.in/apply',
            '[{"url":"https://testportal.gov.in/existing.pdf","facts":["page"],"confirmed":"2026-09-01"}]',
            NULL
        );
        INSERT INTO scholarships (id, slug, title, apply_url, source_pages, secondary_sources)
        VALUES (
            2,
            'test-scholarship-two-ended',
            'Test Scholarship Two Ended',
            'https://testportal.gov.in/apply2',
            NULL,
            NULL
        );
    `);

    const tempReviewPath = path.join(__dirname, '..', 'data', 'temp-test-review.md');
    if (fs.existsSync(tempReviewPath)) fs.unlinkSync(tempReviewPath);

    const batch = [
        {
            slug: 'test-scholarship-one',
            outcome: 'found-official',
            source_pages: [
                { url: 'https://testportal.gov.in/new-2026.pdf', facts: ['deadline'], confirmed: '2026-11-05' }
            ],
            secondary_sources: [
                { url: 'https://www.buddy4study.com/scholarship/test-one', tier: 'platform', role: 'info' }
            ]
        },
        {
            slug: 'test-scholarship-two-ended',
            outcome: 'ended-or-replaced',
            evidence: 'Official circular 12/2026 states scheme permanently discontinued.',
            notes: 'Verified via state portal archive'
        }
    ];

    // Dry-run mode first
    const dryReport = processBatch(batch, {
        db: testDb,
        apply: false,
        reviewPath: tempReviewPath
    });

    assert.strictEqual(dryReport.applied, 0, 'Dry-run must not write to DB');
    const row1Before = testDb.prepare('SELECT source_pages FROM scholarships WHERE id = 1').get();
    assert.strictEqual(JSON.parse(row1Before.source_pages).length, 1, 'DB unchanged in dry-run');

    // Apply mode
    const applyReport = processBatch(batch, {
        db: testDb,
        apply: true,
        reviewPath: tempReviewPath
    });

    assert.strictEqual(applyReport.applied, 1, 'One scholarship updated');
    assert.strictEqual(applyReport.skippedReview, 1, 'Ended scheme sent to review');

    const row1After = testDb.prepare('SELECT source_pages, secondary_sources FROM scholarships WHERE id = 1').get();
    const parsedSp = JSON.parse(row1After.source_pages);
    const parsedSec = JSON.parse(row1After.secondary_sources);

    assert.strictEqual(parsedSp.length, 2, 'Should have 2 source pages');
    assert.strictEqual(parsedSp[0].url, 'https://testportal.gov.in/new-2026.pdf');
    assert.strictEqual(parsedSec.length, 1, 'Should have 1 secondary source');
    assert.strictEqual(parsedSec[0].tier, 'platform');

    // Check row 2 was untouched
    const row2After = testDb.prepare('SELECT source_pages, secondary_sources FROM scholarships WHERE id = 2').get();
    assert.strictEqual(row2After.source_pages, null, 'Ended scholarship should not have source_pages written');

    // Check review file was written
    assert.strictEqual(fs.existsSync(tempReviewPath), true, 'Review file must exist');
    const reviewContent = fs.readFileSync(tempReviewPath, 'utf8');
    assert.match(reviewContent, /test-scholarship-two-ended/);
    assert.match(reviewContent, /Likely Closed/);

    if (fs.existsSync(tempReviewPath)) fs.unlinkSync(tempReviewPath);
    testDb.close();
    console.log('✅ End-to-end batch processing test passed');
}

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
