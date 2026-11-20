/**
 * Pre-flight verification script for sa-guides-clean-headings-2026-11-02.json
 * to run before approving changes in the Agent Center (/admin/agents).
 *
 * Asserts:
 * 1. Proposal file exists and covers exactly 92 guides.
 * 2. In pre-apply state, asserts 1-to-1 set equality between proposal keys and all DB rows matching '## Executive Summary: '.
 * 3. In post-apply state, asserts 0 remaining guides in the database contain '## Executive Summary: '.
 * 4. Only body_md is proposed (0 field overwrites outside body_md).
 * 5. Exact diff identity: removing 'Executive Summary: ' and the single DAAD banned phrase
 *    is 100% the ONLY difference from the live text (0 accidental prose modifications).
 * 6. Heading count is strictly preserved across all 92 guides.
 * 7. Every proposal passes sa.validateSaValue with 0 errors.
 * 8. sa.BANNED regexes evaluate to false for every proposed body_md.
 *
 * Run: node scripts/study-abroad/preflight-heading-proposals.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sa = require('../lib/sa-inbox');

const PROPOSAL_FILE = 'scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json';
const DB_PATH = 'data/scholarships.db';

test('heading migration proposals pre-flight validation suite', async (t) => {
    if (!existsSync(PROPOSAL_FILE)) {
        throw new Error(`Proposal file not found: ${PROPOSAL_FILE}`);
    }

    const proposal = JSON.parse(readFileSync(PROPOSAL_FILE, 'utf8'));
    const proposalKeys = new Set(proposal.changes.map(c => c.key));

    await t.test('covers exactly 92 guides', () => {
        assert.equal(proposal.changes.length, 92, `Expected 92 changes, got ${proposal.changes.length}`);
    });

    await t.test('proposes strictly body_md (zero field overwrites outside body_md)', () => {
        for (const change of proposal.changes) {
            const fields = Object.keys(change.fields);
            assert.deepEqual(fields, ['body_md'], `Change for ${change.key} must only propose body_md, got ${fields.join(',')}`);
        }
    });

    assert.ok(existsSync(DB_PATH), `Database file ${DB_PATH} is required for pre-flight verification`);

    // 1. Query all guides in DB that currently contain '## Executive Summary: '
    const execSummaryQuery = "SELECT slug FROM sa_guides WHERE body_md LIKE '%## Executive Summary: %';";
    const execSummaryRowsJson = execSync(`sqlite3 '${DB_PATH}' -json`, {
        input: execSummaryQuery,
        maxBuffer: 50 * 1024 * 1024,
        encoding: 'utf8'
    });
    const currentExecSummarySlugs = new Set((execSummaryRowsJson && execSummaryRowsJson.trim() ? JSON.parse(execSummaryRowsJson) : []).map(r => r.slug));

    // Pre-apply: must match proposal keys exactly. Post-apply: must be 0.
    await t.test('database set equality pre-apply or zero remaining post-apply', () => {
        if (currentExecSummarySlugs.size > 0) {
            assert.deepEqual(proposalKeys, currentExecSummarySlugs, 'Proposal keys must match all DB rows holding Executive Summary headings');
        } else {
            assert.equal(currentExecSummarySlugs.size, 0, 'Post-apply verification: zero guides have Executive Summary headings');
        }
    });

    // 2. Query all guides by slug
    const query = 'SELECT slug, body_md FROM sa_guides;';
    const rowsJson = execSync(`sqlite3 '${DB_PATH}' -json`, {
        input: query,
        maxBuffer: 50 * 1024 * 1024,
        encoding: 'utf8'
    });
    const dbRows = rowsJson && rowsJson.trim() ? JSON.parse(rowsJson) : [];
    const liveMap = new Map(dbRows.map(r => [r.slug, r.body_md]));

    await t.test('diff-based integrity and validator rules', () => {
        for (const change of proposal.changes) {
            const { key, fields } = change;
            const originalBody = liveMap.get(key);
            assert.ok(originalBody, `Guide ${key} must exist in database`);

            const proposedBody = fields.body_md;

            // 1. Assert '## Executive Summary' is removed
            assert.equal(proposedBody.includes('## Executive Summary: '), false, `Found '## Executive Summary: ' in ${key}`);

            // 2. Assert heading count is strictly preserved (using [ \t]+ to prevent newline matching)
            const origHeadings = (originalBody.match(/^[ \t]*##[ \t]+/gm) || []).length;
            const propHeadings = (proposedBody.match(/^[ \t]*##[ \t]+/gm) || []).length;
            assert.equal(propHeadings, origHeadings, `Heading count mismatch in ${key}: was ${origHeadings}, now ${propHeadings}`);

            // 3. Line-by-line diff identity pre-apply: only the first heading line (and DAAD line) can differ
            if (originalBody.includes('## Executive Summary: ')) {
                const origLines = originalBody.split('\n');
                const propLines = proposedBody.split('\n');
                assert.equal(propLines.length, origLines.length, `Line count mismatch in ${key}`);

                for (let i = 0; i < origLines.length; i++) {
                    if (origLines[i] === propLines[i]) continue;

                    // Allow heading line modification
                    if (origLines[i].startsWith('## Executive Summary: ') && propLines[i] === origLines[i].replace('## Executive Summary: ', '## ')) {
                        continue;
                    }

                    // Allow DAAD single word swap
                    if (key === 'germany-daad-scholarships-guide' &&
                        origLines[i].includes('the holy grail of studying in Germany') &&
                        propLines[i] === origLines[i].replace('the holy grail of studying in Germany', 'the premier scholarship for studying in Germany')) {
                        continue;
                    }

                    assert.fail(`Unexpected line modification at line ${i + 1} in ${key}:\nOriginal: "${origLines[i]}"\nProposed: "${propLines[i]}"`);
                }
            } else {
                // Post-apply state: proposed body matches live body directly
                assert.equal(proposedBody, originalBody, `Live body already updated for ${key}`);
            }

            // 4. Assert sa.validateSaValue passes with 0 errors
            const err = sa.validateSaValue('sa_guides', 'body_md', proposedBody, { previous: originalBody });
            assert.equal(err, null, `Validation error on ${key}: ${err}`);

            // 5. Assert sa.BANNED regexes all return false
            for (const rx of sa.BANNED) {
                const freshRx = new RegExp(rx.source, rx.flags.replace(/[gy]/g, ''));
                assert.equal(freshRx.test(proposedBody), false, `Banned phrase matching ${rx} found in ${key}`);
            }
        }
    });
});
