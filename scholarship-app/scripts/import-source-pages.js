/**
 * Import and validate scholarship source pages from research batch files.
 * Part C of IS-97 Source Backfill.
 *
 * Usage:
 *   node scripts/import-source-pages.js plans/agy-results/is97-batch-1.json [--apply] [--db=path/to/db] [--allow-production]
 *
 * Defaults to dry-run (prints per-scholarship diff without writing to DB).
 * Pass --apply to persist valid entries to SQLite.
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const { sourceTier, isSecondaryTier } = require('./lib/source-tiers');
const { isSpecificSource } = require('./lib/research');
const sources = require('./lib/sources');

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const DEFAULT_REVIEW_PATH = path.join(__dirname, '..', 'data', 'source-backfill-review.md');
const MAX_PAGES = 8;

const normalizeUrl = (u) => {
    try {
        return u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();
    } catch {
        return String(u).trim().toLowerCase();
    }
};

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Validates a single candidate source page entry.
 * Recomputes tier using sourceTier; never trusts file.
 */
function validateSourcePage(entry) {
    if (!entry || typeof entry !== 'object' || !entry.url) {
        return { ok: false, error: 'Missing or invalid URL' };
    }
    const url = String(entry.url).trim();
    const tier = sourceTier(url);

    if (tier === 'invalid') {
        return { ok: false, error: `Rejected invalid/own-site/redirect URL: ${url}` };
    }
    if (tier === 'coaching') {
        return { ok: false, error: `Rejected coaching URL: ${url}` };
    }
    if (isSecondaryTier(tier)) {
        return { ok: false, error: `Rejected secondary tier (${tier}) in source_pages: ${url}` };
    }
    if (!['official', 'provider'].includes(tier)) {
        return { ok: false, error: `Rejected non-official/non-provider tier (${tier}): ${url}` };
    }
    if (!isSpecificSource(url)) {
        return { ok: false, error: `Rejected home-page-only URL for source_pages: ${url}` };
    }

    const facts = Array.isArray(entry.facts) ? entry.facts.map(f => String(f).trim()).filter(Boolean) : ['page'];
    const confirmed = /^\d{4}-\d{2}-\d{2}$/.test(entry.confirmed) ? entry.confirmed : today();

    return {
        ok: true,
        page: {
            url,
            facts,
            confirmed
        }
    };
}

/**
 * Validates a single candidate secondary source entry.
 */
function validateSecondarySource(entry, applyUrls = []) {
    if (!entry || typeof entry !== 'object' || !entry.url) {
        return { ok: false, error: 'Missing or invalid secondary URL' };
    }
    const url = String(entry.url).trim();
    const tier = sourceTier(url);

    if (tier === 'invalid') {
        return { ok: false, error: `Rejected invalid/own-site/redirect URL: ${url}` };
    }
    if (tier === 'coaching') {
        return { ok: false, error: `Rejected coaching URL: ${url}` };
    }
    if (!isSecondaryTier(tier)) {
        return { ok: false, error: `Tier is ${tier}, not a secondary tier (platform, aggregator, news): ${url}` };
    }

    const role = entry.role === 'apply' || applyUrls.some(u => normalizeUrl(u) === normalizeUrl(url)) ? 'apply' : 'info';
    const out = {
        url,
        tier,
        role
    };
    if (Array.isArray(entry.facts)) out.facts = entry.facts;
    if (entry.confirmed) out.confirmed = entry.confirmed;

    return {
        ok: true,
        page: out
    };
}

/**
 * Merges new pages with existing pages.
 * New pages are placed first, deduplicated by normalized URL, capped at max items.
 */
function mergePages(existingPages, newPages, max = MAX_PAGES) {
    const seen = new Set();
    const merged = [];

    // Add new pages first (preserving order)
    for (const p of newPages) {
        const norm = normalizeUrl(p.url);
        if (!seen.has(norm)) {
            seen.add(norm);
            merged.push(p);
        }
    }

    // Keep existing pages that haven't been updated
    for (const p of existingPages) {
        const norm = normalizeUrl(p.url);
        if (!seen.has(norm)) {
            seen.add(norm);
            merged.push(p);
        }
    }

    return merged.slice(0, max);
}

/**
 * Appends review items (ended-or-replaced, not-found) to review markdown document.
 */
function updateReviewFile(reviewPath, reviewItems) {
    if (!reviewItems.length) return;

    let existingContent = '';
    if (fs.existsSync(reviewPath)) {
        existingContent = fs.readFileSync(reviewPath, 'utf8');
    }

    const categorized = {
        likely_closed: [],
        unconfirmed: [],
        possibly_never_real: []
    };

    for (const item of reviewItems) {
        if (item.outcome === 'ended-or-replaced') {
            categorized.likely_closed.push(item);
        } else {
            const text = `${item.evidence || ''} ${item.notes || ''}`.toLowerCase();
            if (text.includes('never real') || text.includes('never existed') || text.includes('bogus') || text.includes('fake')) {
                categorized.possibly_never_real.push(item);
            } else {
                categorized.unconfirmed.push(item);
            }
        }
    }

    // Create or append to sections
    let content = existingContent;
    if (!content.trim()) {
        content = `# Source Backfill Review (${today()})\n\nManual review list for scholarships needing owner decisions. Neither ended-or-replaced nor not-found records are written directly to scholarship tables.\n\n`;
    }

    const appendSection = (title, headerMarker, items) => {
        if (!items.length) return;
        if (!content.includes(headerMarker)) {
            content += `\n## ${title}\n\n`;
        }
        const lines = items.map(it => {
            const parts = [`- **${it.slug}**`];
            if (it.title) parts.push(`(${it.title})`);
            if (it.outcome) parts.push(`[${it.outcome}]`);
            if (it.evidence) parts.push(`\n  - Evidence: ${it.evidence}`);
            if (it.notes) parts.push(`\n  - Notes: ${it.notes}`);
            return parts.join(' ');
        });
        content += lines.join('\n') + '\n';
    };

    appendSection('Likely Closed', '## Likely Closed', categorized.likely_closed);
    appendSection('Unconfirmed', '## Unconfirmed', categorized.unconfirmed);
    appendSection('Possibly Never Real', '## Possibly Never Real', categorized.possibly_never_real);

    fs.mkdirSync(path.dirname(reviewPath), { recursive: true });
    fs.writeFileSync(reviewPath, content, 'utf8');
}

/**
 * Process a batch of scholarship source page findings.
 */
function processBatch(batchEntries, { db, apply = false, allowProduction = false, reviewPath = DEFAULT_REVIEW_PATH } = {}) {
    const report = {
        total: batchEntries.length,
        applied: 0,
        skippedReview: 0,
        errors: 0,
        details: []
    };

    const reviewItems = [];

    for (const entry of batchEntries) {
        const slug = entry.slug;
        if (!slug) {
            report.errors++;
            report.details.push({ slug: 'unknown', error: 'Missing slug in batch entry' });
            continue;
        }

        const row = db.prepare('SELECT id, slug, title, apply_url, source_pages, secondary_sources FROM scholarships WHERE slug = ?').get(slug);
        if (!row) {
            report.errors++;
            report.details.push({ slug, error: `Scholarship slug not found in database: ${slug}` });
            continue;
        }

        const title = row.title || slug;
        const outcome = entry.outcome || 'unknown';

        // Never write ended-or-replaced or not-found to DB
        if (['ended-or-replaced', 'not-found'].includes(outcome)) {
            report.skippedReview++;
            reviewItems.push({ ...entry, title });
            report.details.push({
                slug,
                title,
                outcome,
                action: 'review_only',
                diff: `Added to review file (${outcome})`
            });
            continue;
        }

        // Validate source_pages
        const validSourcePages = [];
        const sourceWarnings = [];
        for (const sp of (entry.source_pages || [])) {
            const res = validateSourcePage(sp);
            if (res.ok) {
                validSourcePages.push(res.page);
            } else {
                sourceWarnings.push(res.error);
            }
        }

        // Validate secondary_sources
        const applyUrls = sources.splitUrls(row.apply_url);
        const validSecondarySources = [];
        const secondaryWarnings = [];
        for (const sec of (entry.secondary_sources || [])) {
            const res = validateSecondarySource(sec, applyUrls);
            if (res.ok) {
                validSecondarySources.push(res.page);
            } else {
                secondaryWarnings.push(res.error);
            }
        }

        const currentSourcePages = sources.readPages(row, 'source_pages');
        const currentSecondarySources = sources.readPages(row, 'secondary_sources');

        const newMergedSp = mergePages(currentSourcePages, validSourcePages);
        const newMergedSec = mergePages(currentSecondarySources, validSecondarySources);

        const spChanged = JSON.stringify(currentSourcePages) !== JSON.stringify(newMergedSp);
        const secChanged = JSON.stringify(currentSecondarySources) !== JSON.stringify(newMergedSec);

        const diffLines = [];
        if (spChanged) {
            diffLines.push(`source_pages: ${currentSourcePages.length} -> ${newMergedSp.length}`);
            validSourcePages.forEach(p => diffLines.push(`  + ${p.url} (facts: ${p.facts.join(',')}, confirmed: ${p.confirmed})`));
        } else {
            diffLines.push('source_pages: (no change)');
        }

        if (secChanged) {
            diffLines.push(`secondary_sources: ${currentSecondarySources.length} -> ${newMergedSec.length}`);
            validSecondarySources.forEach(p => diffLines.push(`  + ${p.url} (${p.tier}, ${p.role})`));
        } else {
            diffLines.push('secondary_sources: (no change)');
        }

        if (sourceWarnings.length) {
            diffLines.push(`warnings: ${sourceWarnings.join('; ')}`);
        }
        if (secondaryWarnings.length) {
            diffLines.push(`warnings: ${secondaryWarnings.join('; ')}`);
        }

        if (apply && (spChanged || secChanged)) {
            db.prepare('UPDATE scholarships SET source_pages = ?, secondary_sources = ? WHERE id = ?')
                .run(
                    newMergedSp.length ? JSON.stringify(newMergedSp) : null,
                    newMergedSec.length ? JSON.stringify(newMergedSec) : null,
                    row.id
                );
            report.applied++;
        }

        report.details.push({
            slug,
            title,
            outcome,
            action: apply ? (spChanged || secChanged ? 'updated' : 'unchanged') : 'dry_run',
            diff: diffLines.join('\n')
        });
    }

    if (reviewItems.length) {
        updateReviewFile(reviewPath, reviewItems);
    }

    return report;
}

function main() {
    const args = process.argv.slice(2);
    const files = args.filter(a => !a.startsWith('--'));
    const apply = args.includes('--apply');
    const allowProduction = args.includes('--allow-production');
    const dbArg = (args.find(a => a.startsWith('--db=')) || '').split('=')[1];
    const targetArg = (args.find(a => a.startsWith('--target=')) || '').split('=')[1];

    if (!files.length) {
        console.error('Usage: node scripts/import-source-pages.js <batch-file.json> [--apply] [--db=path/to/db] [--allow-production]');
        process.exit(1);
    }

    const dbPath = dbArg || process.env.LOCAL_DB_PATH || DEFAULT_DB_PATH;
    const isProdDb = targetArg === 'production' ||
        process.env.DB_TARGET === 'production' ||
        /production/i.test(dbPath);

    if (isProdDb && apply && !allowProduction) {
        console.error('❌ Refusing to apply changes to a production database without explicit --allow-production flag.');
        process.exit(1);
    }

    if (!fs.existsSync(dbPath)) {
        console.error(`❌ Database file not found at: ${dbPath}`);
        process.exit(1);
    }

    console.log(`📂 Database: ${dbPath}`);
    console.log(`⚙️  Mode: ${apply ? 'APPLY (writing to database)' : 'DRY-RUN (read-only diff)'}`);

    const db = new Database(dbPath);
    sources.ensureColumn(db);

    let allEntries = [];
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`❌ Batch file not found: ${file}`);
            continue;
        }
        try {
            const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
            const list = Array.isArray(raw) ? raw : [raw];
            console.log(`📄 Loaded ${list.length} entries from ${file}`);
            allEntries = allEntries.concat(list);
        } catch (e) {
            console.error(`❌ Failed to parse JSON from ${file}: ${e.message}`);
        }
    }

    const report = processBatch(allEntries, {
        db,
        apply,
        allowProduction
    });

    console.log('\n--- Batch Processing Results ---');
    for (const item of report.details) {
        console.log(`\n[${item.outcome}] ${item.slug} (${item.title})`);
        console.log(item.diff);
    }

    console.log('\n🏁 Summary:');
    console.log(`- Total processed: ${report.total}`);
    console.log(`- Applied: ${report.applied}`);
    console.log(`- Review only (not-found / ended-or-replaced): ${report.skippedReview}`);
    console.log(`- Errors: ${report.errors}`);

    db.close();
}

if (require.main === module) {
    main();
}

module.exports = {
    validateSourcePage,
    validateSecondarySource,
    mergePages,
    processBatch,
    normalizeUrl
};
