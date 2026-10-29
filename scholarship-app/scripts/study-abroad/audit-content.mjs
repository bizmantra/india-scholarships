/**
 * Study Abroad content quality audit (Spec D3).
 *
 * READ-ONLY audit script that checks published Study Abroad pages against 7 quality rules:
 *   1. Boilerplate summary (/^\s*complete 20\d\d guide to/i), summary over 220 chars, empty summary
 *   2. seo_title over 70, meta_description outside 110–170, duplicate seo_title across pages
 *   3. Banned phrases anywhere in body_md, summary, faq_json
 *   4. Money/visa fields present without official_source or checked_at; checked_at > 90 days (warning)
 *   5. Identical money values repeated across 4+ universities or programs of the same country (recovery #23)
 *   6. Internal links in body_md that point to routes that do not exist or to unlaunched countries
 *   7. Published sa_programs whose university_slug is missing or draft
 *
 * Writes:
 *   - data/study-abroad/quality-report.md
 *   - data/study-abroad/quality-report.json (one entry per page with the failed rule(s))
 *   - data/study-abroad/quality-baseline.json (when --baseline is specified)
 *
 * Usage:
 *   node scripts/study-abroad/audit-content.mjs [--target=staging|production] [--baseline]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveTarget, connect, describe } = require('../lib/turso-target');
const { auditStudyAbroad } = require('../lib/quality-rules');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', '..', 'data', 'study-abroad');
const REPORT_MD_PATH = join(DATA_DIR, 'quality-report.md');
const REPORT_JSON_PATH = join(DATA_DIR, 'quality-report.json');
const BASELINE_JSON_PATH = join(DATA_DIR, 'quality-baseline.json');

function generateMarkdownReport(target, url, summary, pages, issues) {
    const now = new Date().toISOString();
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    let md = `# Study Abroad Content Quality Report\n\n`;
    md += `**Target:** \`${target}\` (${describe(url)})\n`;
    md += `**Generated at:** ${now}\n`;
    md += `**Pages Checked:** ${summary.totalChecked.totalPages} published pages (${summary.totalChecked.universities} universities, ${summary.totalChecked.guides} guides, ${summary.totalChecked.programs} programs) + ${summary.totalChecked.facts} facts\n`;
    md += `**Total Issues:** ${summary.totalErrors} error(s) (blockers), ${summary.totalWarnings} warning(s) (review)\n`;
    md += `**Pages Flagged:** ${summary.pagesWithErrors} with errors, ${summary.pagesWithWarnings} with warnings\n\n`;

    md += `## Summary by Rule\n\n`;
    md += `| Rule | Description | Severity | Issues Count |\n`;
    md += `|---|---|---|---|\n`;
    md += `| Rule 1 | Boilerplate summary (\`complete 20xx guide to\`), > 220 chars, empty | Error | ${summary.countsByRule.rule1} |\n`;
    md += `| Rule 2 | seo_title > 70, meta_description outside 110–170, duplicate seo_title | Error | ${summary.countsByRule.rule2} |\n`;
    md += `| Rule 3 | Banned phrases in body_md, summary, faq_json | Error | ${summary.countsByRule.rule3} |\n`;
    md += `| Rule 4 | Money/visa fields without official_source or checked_at | Error | ${summary.countsByRule.rule4_errors} |\n`;
    md += `| Rule 4 | Facts checked_at older than 90 days | Warning | ${summary.countsByRule.rule4_warnings} |\n`;
    md += `| Rule 5 | Identical money values repeated across 4+ in country (recovery #23) | Error | ${summary.countsByRule.rule5} |\n`;
    md += `| Rule 6 | Internal links to non-existent routes or unlaunched countries | Error | ${summary.countsByRule.rule6} |\n`;
    md += `| Rule 7 | Published sa_programs whose university_slug is missing or draft | Error | ${summary.countsByRule.rule7} |\n\n`;

    // Rule 1 Breakdown
    const boilerGuides = issues.filter(i => i.table === 'sa_guides' && i.code === 'boilerplate_summary').length;
    const boilerUnis = issues.filter(i => i.table === 'sa_universities' && i.code === 'boilerplate_summary').length;
    const unsourcedGuides = issues.filter(i => i.table === 'sa_guides' && i.code === 'missing_source').length;

    md += `### Key Backlog Metrics\n\n`;
    md += `- **Boilerplate guide summaries:** ${boilerGuides} (expected ~78 in spec)\n`;
    md += `- **Boilerplate university summaries:** ${boilerUnis} (expected ~17 in spec)\n`;
    md += `- **Published guides without sources/checked_at:** ${unsourcedGuides} (expected ~105 in spec)\n\n`;

    md += `## Errors (Blockers)\n\n`;
    if (errors.length === 0) {
        md += `*None. All published pages satisfy the quality gate.*\n\n`;
    } else {
        md += `| Table | ID | Page Path | Rule | Issue Code | Details |\n`;
        md += `|---|---|---|---|---|---|\n`;
        for (const e of errors) {
            const pagePath = e.path || '-';
            const cleanMsg = e.message.replace(/\|/g, '\\|');
            md += `| \`${e.table}\` | \`${e.id}\` | \`${pagePath}\` | Rule ${e.rule} | \`${e.code}\` | ${cleanMsg} |\n`;
        }
        md += `\n`;
    }

    md += `## Warnings (Review)\n\n`;
    if (warnings.length === 0) {
        md += `*None. No freshness or review warnings.*\n\n`;
    } else {
        md += `| Table | ID | Page Path | Rule | Issue Code | Details |\n`;
        md += `|---|---|---|---|---|---|\n`;
        for (const w of warnings) {
            const pagePath = w.path || '-';
            const cleanMsg = w.message.replace(/\|/g, '\\|');
            md += `| \`${w.table}\` | \`${w.id}\` | \`${pagePath}\` | Rule ${w.rule} | \`${w.code}\` | ${cleanMsg} |\n`;
        }
        md += `\n`;
    }

    return md;
}

async function run() {
    const target = resolveTarget();
    const shouldWriteBaseline = process.argv.includes('--baseline') || process.argv.includes('--generate-baseline');

    console.log(`🔎 Study Abroad quality audit starting on ${target}...`);
    const { client, url } = connect(target);
    console.log(`   Connected (read-only) to: ${describe(url)}`);

    // Fetch all rows read-only
    const universities = (await client.execute('SELECT * FROM sa_universities')).rows;
    const guides = (await client.execute('SELECT * FROM sa_guides')).rows;
    const programs = (await client.execute('SELECT * FROM sa_programs')).rows;
    const facts = (await client.execute('SELECT * FROM sa_facts')).rows;

    console.log(`   Fetched: ${universities.length} universities, ${guides.length} guides, ${programs.length} programs, ${facts.length} facts`);

    const result = auditStudyAbroad({ universities, guides, programs, facts });
    const { summary, pages, issues } = result;

    console.log(`\n📊 Audit Summary:`);
    console.log(`   Total published pages checked: ${summary.totalChecked.totalPages} + ${summary.totalChecked.facts} facts`);
    console.log(`   Errors (blocking): ${summary.totalErrors} across ${summary.pagesWithErrors} pages`);
    console.log(`   Warnings (review): ${summary.totalWarnings} across ${summary.pagesWithWarnings} pages`);
    console.log(`   - Rule 1 (Boilerplate/Length): ${summary.countsByRule.rule1}`);
    console.log(`   - Rule 2 (SEO Title/Meta): ${summary.countsByRule.rule2}`);
    console.log(`   - Rule 3 (Banned Phrases): ${summary.countsByRule.rule3}`);
    console.log(`   - Rule 4 (Sources & Dates): ${summary.countsByRule.rule4_errors} errors, ${summary.countsByRule.rule4_warnings} warnings`);
    console.log(`   - Rule 5 (Identical Money): ${summary.countsByRule.rule5}`);
    console.log(`   - Rule 6 (Internal Links): ${summary.countsByRule.rule6}`);
    console.log(`   - Rule 7 (Program University): ${summary.countsByRule.rule7}`);

    const boilerGuides = issues.filter(i => i.table === 'sa_guides' && i.code === 'boilerplate_summary').length;
    const boilerUnis = issues.filter(i => i.table === 'sa_universities' && i.code === 'boilerplate_summary').length;
    const unsourcedGuides = issues.filter(i => i.table === 'sa_guides' && i.code === 'missing_source').length;
    console.log(`\n📌 Key Spec Breakdown:`);
    console.log(`   - Boilerplate guide summaries: ${boilerGuides}`);
    console.log(`   - Boilerplate university summaries: ${boilerUnis}`);
    console.log(`   - Guides without sources/checked_at: ${unsourcedGuides}`);

    mkdirSync(DATA_DIR, { recursive: true });

    // 1. Write quality-report.json (one entry per page with the failed rule(s))
    writeFileSync(REPORT_JSON_PATH, JSON.stringify(pages, null, 2), 'utf8');
    console.log(`\n📝 Wrote ${REPORT_JSON_PATH} (${pages.length} pages flagged)`);

    // 2. Write quality-report.md
    const md = generateMarkdownReport(target, url, summary, pages, issues);
    writeFileSync(REPORT_MD_PATH, md, 'utf8');
    console.log(`📝 Wrote ${REPORT_MD_PATH}`);

    // 3. Write baseline if requested
    if (shouldWriteBaseline) {
        writeFileSync(BASELINE_JSON_PATH, JSON.stringify(pages, null, 2), 'utf8');
        console.log(`🎯 Generated baseline: ${BASELINE_JSON_PATH} (${pages.length} baseline pages)`);
    }

    console.log(`\n✅ Audit complete.`);
}

run().catch(err => {
    console.error(`❌ Audit failed: ${err.message}`);
    process.exit(1);
});
