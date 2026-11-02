/**
 * Generator script to migrate 92 sa_guides holding '## Executive Summary: ' headings
 * to clean passage-indexing H2s, resolving the sa.BANNED constraint.
 *
 * (92 guides on production: the other 2 of the original 94, germany-german-language-levels
 * and usa-opt-stem-opt-extension, were already migrated in PR #111).
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

// Query all 92 guides with Executive Summary via stdin (immune to shell quote escaping)
const query = `SELECT slug, country, title, body_md FROM sa_guides WHERE body_md LIKE '%## Executive Summary: %';`;
const rowsJson = execSync(`sqlite3 '${DB_PATH}' -json`, {
    input: query,
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf8'
});
const guides = JSON.parse(rowsJson);

console.log(`Found ${guides.length} guides with '## Executive Summary: ' headings.`);

const changes = [];

for (const guide of guides) {
    const { slug, body_md } = guide;

    // 1. Replace heading: exact match at the start of the line without swallowing newlines
    let updatedBody = body_md.replace(/^## Executive Summary:[ \t]*/m, '## ');

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
    notes: `P2: Clean 92 legacy '## Executive Summary' headings across German and US study abroad guides into clean passage-indexed H2s, resolving sa.BANNED constraint. (2 of the original 94 guides were previously migrated in PR #111).`,
    changes
};

writeFileSync(PROPOSAL_OUTPUT, JSON.stringify(proposalData, null, 2));
console.log(`Wrote proposal file to ${PROPOSAL_OUTPUT}`);
