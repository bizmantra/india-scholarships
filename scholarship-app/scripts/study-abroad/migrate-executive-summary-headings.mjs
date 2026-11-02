/**
 * Generator script to migrate 94 sa_guides holding '## Executive Summary: ' headings
 * to clean passage-indexing H2s, resolving the sa.BANNED constraint.
 *
 * Usage:
 *   node scripts/study-abroad/migrate-executive-summary-headings.mjs
 */

import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sa = require('../lib/sa-inbox');

const DB_PATH = 'data/scholarships.db';
const PROPOSAL_OUTPUT = 'scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json';

// Query all 94 guides with Executive Summary using strict single-quoted sqlite3 query
const rowsJson = execSync(`sqlite3 '${DB_PATH}' 'SELECT slug, country, title, body_md FROM sa_guides WHERE body_md LIKE "%## Executive Summary: %"' -json`, { maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' });
const guides = JSON.parse(rowsJson);

console.log(`Found ${guides.length} guides with '## Executive Summary: ' headings.`);

const changes = [];

for (const guide of guides) {
    const { slug, body_md } = guide;

    // 1. Replace heading: exact match at the start of the line
    let updatedBody = body_md.replace(/^## Executive Summary:\s*/m, '## ');

    // 2. Clean single legacy banned word
    if (slug === 'germany-daad-scholarships-guide') {
        updatedBody = updatedBody.replace(/the holy grail of studying in Germany/i, 'the premier scholarship for studying in Germany');
    }

    // Propose strictly body_md (0 field overwrites outside body_md, 0 synthetic callouts)
    changes.push({
        table: 'sa_guides',
        key: slug,
        fields: {
            body_md: updatedBody
        }
    });
}

console.log(`Prepared ${changes.length} proposals.`);

const proposalData = {
    agent: 'content-editor',
    notes: `P2: Clean 94 legacy '## Executive Summary' headings across German and US study abroad guides into clean passage-indexed H2s, resolving sa.BANNED constraint.`,
    changes
};

writeFileSync(PROPOSAL_OUTPUT, JSON.stringify(proposalData, null, 2));
console.log(`Wrote proposal file to ${PROPOSAL_OUTPUT}`);
