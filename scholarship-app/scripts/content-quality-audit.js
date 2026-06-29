const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

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

// Helper to check if text contains HTML tags
function hasHtmlTags(text) {
    if (!text) return false;
    return /<[a-z][\s\S]*>/i.test(text);
}

// Helper to check if a text contains old year references
function hasOldYear(text) {
    if (!text) return false;
    const matches = text.match(/\b(202[0-5])\b/g);
    return matches && matches.length > 0;
}

// Safe JSON parse
function tryParseJSON(value, fallback) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

// Parse caste/docs field
function parseArrayField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const trimmed = value.trim();
    if (trimmed === '') return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            return JSON.parse(trimmed);
        } catch {}
    }
    // Fallback: split by comma or newline
    if (trimmed.includes('\n')) {
        return trimmed.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

try {
    const scholarships = db.prepare('SELECT * FROM scholarships').all();
    console.log(`Loaded ${scholarships.length} scholarships from database.`);

    const today = new Date('2026-06-26'); // mock date
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
        const issues = [];
        const isLegacy = s.title.startsWith('[LEGACY]') || s.slug.startsWith('legacy-');
        if (isLegacy) stats.legacyCount++;

        // 1. Check Amount
        const amountAnnual = s.amount_annual !== null ? Number(s.amount_annual) : null;
        const amountMin = s.amount_min !== null ? Number(s.amount_min) : null;
        if (amountAnnual === null || amountAnnual === 0) {
            issues.push('Missing Annual Amount (causes "upto 0k" display)');
            stats.missingAmountAnnual++;
        }
        if (amountMin === null || amountMin === 0) {
            issues.push('Missing Min Amount');
            stats.missingAmountMin++;
        }

        // 2. Check Deadline / Dates
        const deadlineVal = s.deadline ? s.deadline.trim() : '';
        if (!deadlineVal || deadlineVal.toLowerCase() === 'not specified' || deadlineVal.toLowerCase() === 'na') {
            issues.push('Missing Deadline Date');
            stats.missingDeadline++;
        } else {
            // Check if deadline is a past date
            const dlDate = new Date(deadlineVal);
            if (!isNaN(dlDate.getTime()) && dlDate < today) {
                issues.push(`Expired Deadline (${deadlineVal})`);
                stats.expiredDeadline++;
            }
        }

        // Check for old year reference
        const deadlineDesc = s.deadline_description || '';
        const titleDesc = s.title || '';
        if (hasOldYear(deadlineDesc) || hasOldYear(titleDesc)) {
            issues.push('Old Year Reference (e.g. 2024 or 2025 in title or description)');
            stats.oldYearReference++;
        }

        // 3. Check Selection
        const selection = s.selection ? s.selection.trim() : '';
        if (!selection || selection.toLowerCase() === 'not specified' || selection.length < 15) {
            issues.push(`Incomplete Selection Criteria (${selection ? 'too short: ' + selection.length + ' chars' : 'empty'})`);
            stats.incompleteSelection++;
        }

        // 4. Check Renewal
        const renewal = s.renewal ? s.renewal.trim() : '';
        if (!renewal || renewal.toLowerCase() === 'not specified' || renewal.length < 15) {
            issues.push(`Incomplete Renewal Policy (${renewal ? 'too short: ' + renewal.length + ' chars' : 'empty'})`);
            stats.incompleteRenewal++;
        }

        // 5. Check Step Guide
        const stepGuide = s.step_guide ? s.step_guide.trim() : '';
        if (!stepGuide || stepGuide.length < 20) {
            issues.push(`Incomplete/Missing Step Guide (${stepGuide ? 'too short: ' + stepGuide.length + ' chars' : 'empty'})`);
            stats.incompleteStepGuide++;
        }

        // 6. Check Docs Needed
        const docs = parseArrayField(s.docs_needed);
        if (docs.length === 0) {
            issues.push('Missing Required Documents');
            stats.missingDocs++;
        }

        // 7. Check Apply URL / Official Source
        const applyUrl = s.apply_url ? s.apply_url.trim() : '';
        const officialSource = s.official_source ? s.official_source.trim() : '';
        if (!applyUrl && !officialSource) {
            issues.push('Missing Apply URL & Official Source');
            stats.missingApplyUrl++;
        } else {
            if (applyUrl && !applyUrl.startsWith('http')) {
                issues.push(`Invalid Apply URL format: "${applyUrl}"`);
            }
            if (officialSource && !officialSource.startsWith('http')) {
                issues.push(`Invalid Official Source format: "${officialSource}"`);
            }
        }

        // 8. Check Helpline
        const helpline = s.helpline ? s.helpline.trim() : '';
        if (!helpline || helpline.toLowerCase() === 'not specified' || helpline.toLowerCase() === 'na' || helpline.toLowerCase() === 'contact') {
            issues.push('Missing Helpline Contact Details');
            stats.missingHelpline++;
        }

        // 9. Check FAQs
        const faqs = tryParseJSON(s.faq_json, []);
        if (faqs.length === 0) {
            issues.push('Missing FAQ Content');
            stats.missingFaqs++;
        }

        // 10. Check HTML tags
        let hasHtml = false;
        ['intro_seo', 'benefits', 'step_guide', 'selection', 'renewal'].forEach(f => {
            if (hasHtmlTags(s[f])) {
                hasHtml = true;
            }
        });
        if (hasHtml) {
            issues.push('Contains Unwanted Raw HTML Tags');
            stats.containsHtml++;
        }

        if (issues.length > 0) {
            stats.totalIssues += issues.length;
            auditData.push({
                id: s.id,
                slug: s.slug,
                title: s.title,
                provider_type: s.provider_type || 'Unknown',
                status: s.status || 'Active',
                isLegacy: isLegacy ? 'Yes' : 'No',
                issuesCount: issues.length,
                issuesList: issues
            });
        }
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
| **Expired Deadline** | ${stats.expiredDeadline} | ${((stats.expiredDeadline / stats.total) * 100).toFixed(1)}% | Deadline is in the past (before 2026-06-26) |
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

