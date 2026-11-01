const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { execSync } = require('child_process');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const MD_REPORT_PATH = path.join(__dirname, '..', 'data', 'content-quality-report.md');
const CSV_REPORT_PATH = path.join(__dirname, '..', 'data', 'content-quality-audit.csv');

console.log('🔍 Starting Content Quality Audit...');
console.log(`Database path: ${DB_PATH}`);

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found!');
    process.exit(1);
}

const db = new Database(DB_PATH);

// The per-scholarship checks live in lib/quality-rules.js (shared with the Quality Fixer agent)
const { auditScholarship, isLegacy: legacyRecord } = require('./lib/quality-rules');

// Which summary counter each issue adds to
const STAT_FOR_CODE = {
    missing_amount_annual: 'missingAmountAnnual',
    missing_amount_min: 'missingAmountMin',
    missing_deadline: 'missingDeadline',
    expired_deadline: 'expiredDeadline',
    old_year: 'oldYearReference',
    incomplete_selection: 'incompleteSelection',
    incomplete_renewal: 'incompleteRenewal',
    incomplete_step_guide: 'incompleteStepGuide',
    missing_docs: 'missingDocs',
    missing_links: 'missingApplyUrl',
    missing_helpline: 'missingHelpline',
    missing_faqs: 'missingFaqs',
    contains_html: 'containsHtml',
};

// Check for deleted or renamed slugs by comparing with git HEAD version of the database
function checkDeletedSlugs() {
    try {
        const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
        const dbRepoPath = path.relative(gitRoot, DB_PATH).replace(/\\/g, '/');
        const tempGitDbPath = path.join(path.dirname(DB_PATH), 'scholarships.db.git-base');
        
        // Prefer the snapshot taken by pull-from-turso.js (Turso is the master copy); fall back to git HEAD
        const baseSnapshot = path.join(path.dirname(DB_PATH), '.turso-base-production.db');
        try {
            if (fs.existsSync(baseSnapshot)) {
                fs.copyFileSync(baseSnapshot, tempGitDbPath);
            } else {
                const fileBuffer = execSync(`git show HEAD:${dbRepoPath}`, { maxBuffer: 100 * 1024 * 1024 });
                fs.writeFileSync(tempGitDbPath, fileBuffer);
            }
        } catch (gitErr) {
            console.log('ℹ️ No git history found or could not read database from HEAD, skipping slug deletion check.');
            return;
        }

        if (fs.existsSync(tempGitDbPath)) {
            const oldDb = new Database(tempGitDbPath);
            const oldSlugs = oldDb.prepare('SELECT slug FROM scholarships').all().map(r => r.slug);
            oldDb.close();
            fs.unlinkSync(tempGitDbPath); // Cleanup

            const currentDb = new Database(DB_PATH);
            const currentSlugs = new Set(currentDb.prepare('SELECT slug FROM scholarships').all().map(r => r.slug));
            currentDb.close();

            const missingSlugs = oldSlugs.filter(slug => !currentSlugs.has(slug));

            if (missingSlugs.length > 0) {
                console.warn('\n⚠️  WARNING: The following slugs existed in the previous version of the database but are missing in the current version:');
                missingSlugs.forEach(slug => {
                    console.warn(`   - ${slug}`);
                });
                console.warn('Ensure you have defined corresponding redirect rules in next.config.ts for these slugs or their subpages!\n');
            } else {
                console.log('✅ No active slugs were deleted or renamed.');
            }
        }
    } catch (err) {
        console.error('❌ Failed to run slug deletion check:', err.message);
    }
}

try {
    const scholarships = db.prepare('SELECT * FROM scholarships').all();
    console.log(`Loaded ${scholarships.length} scholarships from database.`);

    const today = new Date();
    const todayLabel = today.toISOString().split('T')[0];
    const auditData = [];

    const stats = {
        total: scholarships.length,
        legacyCount: 0,
        missingAmountAnnual: 0,
        missingAmountMin: 0,
        missingDeadline: 0,
        expiredDeadline: 0,
        oldYearReference: 0,
        incompleteSelection: 0,
        incompleteRenewal: 0,
        incompleteStepGuide: 0,
        missingDocs: 0,
        missingApplyUrl: 0,
        missingHelpline: 0,
        missingFaqs: 0,
        containsHtml: 0,
        totalIssues: 0
    };

    scholarships.forEach(s => {
        const isLegacy = legacyRecord(s);
        if (isLegacy) stats.legacyCount++;
        const found = auditScholarship(s, today);
        found.forEach(issue => { if (STAT_FOR_CODE[issue.code]) stats[STAT_FOR_CODE[issue.code]]++; });
        if (found.length === 0) return;
        stats.totalIssues += found.length;
        auditData.push({
            id: s.id,
            slug: s.slug,
            title: s.title,
            provider_type: s.provider_type || 'Unknown',
            status: s.status || 'Active',
            isLegacy: isLegacy ? 'Yes' : 'No',
            issuesCount: found.length,
            issuesList: found.map(issue => issue.text)
        });
    });

    // Write Markdown Report
    let mdContent = `# 📊 Content Quality Audit Report
Generated on: ${new Date().toISOString().split('T')[0]}
Total Scholarships Audited: **${stats.total}**
Scholarships with Issues: **${auditData.length}** (${((auditData.length / stats.total) * 100).toFixed(1)}%)

---

## 📈 Executive Summary

Below is a breakdown of the content issues discovered across all scholarship pages:

| Metric / Content Area | Number of Affected Scholarships | % of Total | Description |
| :--- | :---: | :---: | :--- |
| **Legacy Flagged** | ${stats.legacyCount} | ${((stats.legacyCount / stats.total) * 100).toFixed(1)}% | Marked with \`[LEGACY]\` in title or slug |
| **Missing Annual Amount** | ${stats.missingAmountAnnual} | ${((stats.missingAmountAnnual / stats.total) * 100).toFixed(1)}% | Missing/0 annual amount (causes "upto 0k" display) |
| **Missing Min Amount** | ${stats.missingAmountMin} | ${((stats.missingAmountMin / stats.total) * 100).toFixed(1)}% | Missing/0 minimum amount |
| **Missing Deadline Date** | ${stats.missingDeadline} | ${((stats.missingDeadline / stats.total) * 100).toFixed(1)}% | Deadline is empty or "Not specified" |
| **Expired Deadline** | ${stats.expiredDeadline} | ${((stats.expiredDeadline / stats.total) * 100).toFixed(1)}% | Deadline is in the past (before ${todayLabel}) |
| **Old Year References** | ${stats.oldYearReference} | ${((stats.oldYearReference / stats.total) * 100).toFixed(1)}% | Mentions 2024, 2025, or earlier cycles |
| **Incomplete Selection Criteria** | ${stats.incompleteSelection} | ${((stats.incompleteSelection / stats.total) * 100).toFixed(1)}% | Missing or under 15 characters |
| **Incomplete Renewal Policy** | ${stats.incompleteRenewal} | ${((stats.incompleteRenewal / stats.total) * 100).toFixed(1)}% | Missing or under 15 characters |
| **Incomplete Step Guide** | ${stats.incompleteStepGuide} | ${((stats.incompleteStepGuide / stats.total) * 100).toFixed(1)}% | Missing or under 20 characters |
| **Missing Documents** | ${stats.missingDocs} | ${((stats.missingDocs / stats.total) * 100).toFixed(1)}% | No required documents listed |
| **Missing / Bad Apply Link** | ${stats.missingApplyUrl} | ${((stats.missingApplyUrl / stats.total) * 100).toFixed(1)}% | No official website or application URLs |
| **Missing Helpline** | ${stats.missingHelpline} | ${((stats.missingHelpline / stats.total) * 100).toFixed(1)}% | Helpline is empty, "Not Specified", or generic |
| **Missing FAQs** | ${stats.missingFaqs} | ${((stats.missingFaqs / stats.total) * 100).toFixed(1)}% | FAQ block is empty or missing |
| **Contains Raw HTML** | ${stats.containsHtml} | ${((stats.containsHtml / stats.total) * 100).toFixed(1)}% | HTML tags (like \`<p>\`, \`<a>\`) in text fields |

---

## 🔍 Detail of Top Affected Scholarships (Sorted by Issue Count)

Here are the scholarships with the highest number of content quality issues:

| Slug | Title | Issues Count | Key Gaps |
| :--- | :--- | :---: | :--- |
`;

    // Sort by issues count descending
    auditData.sort((a, b) => b.issuesCount - a.issuesCount);

    auditData.slice(0, 50).forEach(item => {
        mdContent += `| \`${item.slug}\` | **${item.title}** | ${item.issuesCount} | ${item.issuesList.join('; ')} |\n`;
    });

    if (auditData.length > 50) {
        mdContent += `\n*Note: Showing top 50 rows. A complete list of all ${auditData.length} records is exported to [content-quality-audit.csv](file://${CSV_REPORT_PATH}).*\n`;
    }

    fs.writeFileSync(MD_REPORT_PATH, mdContent);
    console.log(`✅ Saved Markdown report to: ${MD_REPORT_PATH}`);

    // Write CSV Report
    const csvHeaders = ['ID', 'Slug', 'Title', 'Provider Type', 'Status', 'Is Legacy', 'Issues Count', 'Issues List'];
    const csvRows = [csvHeaders.join(',')];

    auditData.forEach(item => {
        const safeTitle = `"${item.title.replace(/"/g, '""')}"`;
        const safeIssuesList = `"${item.issuesList.join(' | ').replace(/"/g, '""')}"`;
        csvRows.push([
            item.id,
            item.slug,
            safeTitle,
            item.provider_type,
            item.status,
            item.isLegacy,
            item.issuesCount,
            safeIssuesList
        ].join(','));
    });

    fs.writeFileSync(CSV_REPORT_PATH, csvRows.join('\n'));
    console.log(`✅ Saved CSV audit spreadsheet to: ${CSV_REPORT_PATH}`);

    // Run the slug deletion/deprecation check
    checkDeletedSlugs();

    // If strict mode is enabled, exit with code 1 if there are active content issues.
    // Excluding legacy flag issues to allow older records while securing new additions.
    const isStrict = process.argv.includes('--strict');
    if (isStrict) {
        const activeIssues = auditData.filter(item => item.status === 'Active' && item.isLegacy === 'No');
        if (activeIssues.length > 0) {
            console.error(`\n❌ Strict Quality Check Failed: Found ${activeIssues.length} active scholarships with critical formatting issues.`);
            console.error('Please check data/content-quality-report.md and fix empty amounts, dead links, or missing FAQs.');
            process.exit(1);
        } else {
            console.log('✅ Content Quality Check Passed! (Strict mode)');
        }
    }

} catch (err) {
    console.error('❌ Error executing content quality audit:', err);
    process.exit(1);
} finally {
    if (db) db.close();
}

