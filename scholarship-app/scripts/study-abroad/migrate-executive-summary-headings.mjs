/**
 * Generator script to migrate 94 sa_guides holding '## Executive Summary: ' headings
 * to clean passage-indexing H2s, while incorporating authoritative official sources.
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
const PROPOSAL_OUTPUT = 'scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json';

// 1. Load existing verified sources
const c2Second = JSON.parse(readFileSync('scripts/study-abroad/proposals/c2-second-pass-sources-2026-11-02.json', 'utf8'));
const c2a = JSON.parse(readFileSync('scripts/study-abroad/proposals/c2a-sources-germany-2026-10-30.json', 'utf8'));
const c2b = JSON.parse(readFileSync('scripts/study-abroad/proposals/c2b-sources-usa-2026-10-30.json', 'utf8'));

const sourcesMap = new Map();
[...c2Second.changes, ...c2a.changes, ...c2b.changes].forEach(c => {
    if (c.table === 'sa_guides' && (c.source || c.fields?.official_source)) {
        sourcesMap.set(c.key, {
            url: c.source || c.fields.official_source,
            anchor: 'Official Portal / Regulations'
        });
    }
});

// Load subagent verified sources if ready
const gerFile = 'scripts/study-abroad/scratch/germany-sources-verified.json';
if (existsSync(gerFile)) {
    const ger = JSON.parse(readFileSync(gerFile, 'utf8'));
    ger.forEach(item => {
        if (item.slug && item.official_source) {
            sourcesMap.set(item.slug, {
                url: item.official_source,
                anchor: item.anchor_text || 'Official Regulations & Requirements'
            });
        }
    });
}

const usaFile = 'scripts/study-abroad/scratch/usa-sources-verified.json';
if (existsSync(usaFile)) {
    const usa = JSON.parse(readFileSync(usaFile, 'utf8'));
    usa.forEach(item => {
        if (item.slug && item.official_source) {
            sourcesMap.set(item.slug, {
                url: item.official_source,
                anchor: item.anchor_text || 'Official Portal & Guidelines'
            });
        }
    });
}

// Query all 94 guides with Executive Summary
const rowsJson = execSync(`sqlite3 ${DB_PATH} 'SELECT slug, country, title, body_md, official_source FROM sa_guides WHERE body_md LIKE "%## Executive Summary: %"' -json`).toString();
const guides = JSON.parse(rowsJson);

console.log(`Found ${guides.length} guides with '## Executive Summary: ' headings.`);

const changes = [];
let missingSourceCount = 0;

for (const guide of guides) {
    const { slug, country, title, body_md, official_source } = guide;
    let sourceInfo = sourcesMap.get(slug);
    if (!sourceInfo && official_source) {
        sourceInfo = { url: official_source, anchor: 'Official Guidelines' };
    }

    if (!sourceInfo) {
        missingSourceCount++;
        // Placeholder or fallback will be reported
        continue;
    }

    // 1. Replace heading
    let updatedBody = body_md.replace('## Executive Summary: ', '## ');

    // 2. Clean any specific legacy banned words
    if (slug === 'germany-daad-scholarships-guide') {
        updatedBody = updatedBody.replace(/the holy grail of studying in Germany/i, 'the premier scholarship for studying in Germany');
    }

    // 3. Ensure official source link is in body_md
    if (!/https?:\/\//.test(updatedBody)) {
        // Add an official citation footnote / callout at the end of the overview section or bottom of article
        const citationBlock = `\n\n> 🔗 **Official Reference**: Review the statutory provisions and requirements at the [${sourceInfo.anchor}](${sourceInfo.url}).`;
        
        // Insert right after the first section (before the next ##) or at end
        const nextHeading = updatedBody.indexOf('\n## ', 4);
        if (nextHeading !== -1) {
            updatedBody = updatedBody.slice(0, nextHeading) + citationBlock + updatedBody.slice(nextHeading);
        } else {
            updatedBody = updatedBody + citationBlock;
        }
    }

    changes.push({
        table: 'sa_guides',
        key: slug,
        source: sourceInfo.url,
        fields: {
            body_md: updatedBody,
            official_source: sourceInfo.url
        }
    });
}

console.log(`Prepared ${changes.length} proposals. Missing sources: ${missingSourceCount}`);

if (missingSourceCount === 0 && changes.length > 0) {
    const proposalData = {
        agent: 'content-editor',
        notes: `P2: Clean 94 legacy '## Executive Summary' headings across German and US study abroad guides into clean passage-indexed H2s, resolving sa.BANNED constraint and adding verified official citations.`,
        changes
    };
    writeFileSync(PROPOSAL_OUTPUT, JSON.stringify(proposalData, null, 2));
    console.log(`Wrote proposal file to ${PROPOSAL_OUTPUT}`);
}
