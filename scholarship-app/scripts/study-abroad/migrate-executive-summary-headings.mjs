/**
 * Generator script to migrate 94 sa_guides holding '## Executive Summary: ' headings
 * to clean passage-indexing H2s, while incorporating authoritative official citations.
 *
 * Reproducible from tracked inputs:
 *   scripts/study-abroad/proposals/heading-migration-sources.json
 *
 * Usage:
 *   node scripts/study-abroad/migrate-executive-summary-headings.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sa = require('../lib/sa-inbox');

const DB_PATH = 'data/scholarships.db';
const SOURCES_TRACKED_FILE = 'scripts/study-abroad/proposals/heading-migration-sources.json';
const PROPOSAL_OUTPUT = 'scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json';

if (!existsSync(SOURCES_TRACKED_FILE)) {
    console.error(`Missing tracked sources file: ${SOURCES_TRACKED_FILE}`);
    process.exit(1);
}

const sourcesMap = JSON.parse(readFileSync(SOURCES_TRACKED_FILE, 'utf8'));

// Query all 94 guides with Executive Summary using strict single-quoted sqlite3 query
const rowsJson = execSync(`sqlite3 '${DB_PATH}' 'SELECT slug, country, title, body_md FROM sa_guides WHERE body_md LIKE "%## Executive Summary: %"' -json`, { maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' });
const guides = JSON.parse(rowsJson);

console.log(`Found ${guides.length} guides with '## Executive Summary: ' headings.`);

const changes = [];
const missingSlugs = [];

for (const guide of guides) {
    const { slug, country, title, body_md } = guide;
    const sourceInfo = sourcesMap[slug];

    if (!sourceInfo) {
        missingSlugs.push(slug);
        continue;
    }

    // 1. Replace heading: exact match at the start of the line
    let updatedBody = body_md.replace(/^## Executive Summary:\s*/m, '## ');

    // 2. Clean any specific legacy banned words
    if (slug === 'germany-daad-scholarships-guide') {
        updatedBody = updatedBody.replace(/the holy grail of studying in Germany/i, 'the premier scholarship for studying in Germany');
    }

    // 3. Ensure official source link is in body_md (inbox validator requirement)
    if (!/https?:\/\//.test(updatedBody)) {
        let calloutPrefix;
        switch (sourceInfo.category) {
            case 'statutory':
                calloutPrefix = '> 🔗 **Statutory Reference**: Official legal provisions and requirements under';
                break;
            case 'government':
                calloutPrefix = '> 🔗 **Official Government Guidance**: Official procedures and regulatory guidelines published by';
                break;
            case 'portal':
                calloutPrefix = '> 🔗 **Official Portal**: Application procedures and admissions documentation available at';
                break;
            case 'university':
                calloutPrefix = '> 🔗 **Institutional Guidelines**: Academic and admission criteria published by';
                break;
            default:
                calloutPrefix = '> 🔗 **Official Reference**: Guidelines and requirements published at';
        }

        const citationBlock = `${calloutPrefix} [${sourceInfo.anchor}](${sourceInfo.url}).`;
        // Append cleanly at the end of the article with proper CommonMark spacing and a horizontal rule
        updatedBody = updatedBody.trimEnd() + '\n\n---\n\n' + citationBlock + '\n';
    }

    // Propose ONLY body_md (0 overwrites of official_source)
    changes.push({
        table: 'sa_guides',
        key: slug,
        source: sourceInfo.url,
        fields: {
            body_md: updatedBody
        }
    });
}

if (missingSlugs.length > 0) {
    console.error(`Error: Missing sources for ${missingSlugs.length} slugs:`, missingSlugs);
    process.exit(1);
}

console.log(`Prepared ${changes.length} proposals. Missing sources: 0`);

const proposalData = {
    agent: 'content-editor',
    notes: `P2: Clean 94 legacy '## Executive Summary' headings across German and US study abroad guides into clean passage-indexed H2s, resolving sa.BANNED constraint and adding verified official citations.`,
    changes
};

writeFileSync(PROPOSAL_OUTPUT, JSON.stringify(proposalData, null, 2));
console.log(`Wrote proposal file to ${PROPOSAL_OUTPUT}`);
