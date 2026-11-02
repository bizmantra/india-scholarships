/**
 * Offline test suite for heading migration proposals.
 * Asserts:
 * 1. Proposal file exists and covers exactly 92 guides.
 * 2. Only body_md is proposed (0 field overwrites outside body_md).
 * 3. Exact diff identity: removing 'Executive Summary: ' and the single DAAD banned phrase
 *    is the ONLY difference from the live text (0 accidental prose modifications).
 * 4. Heading count is strictly preserved across all 92 guides.
 * 5. Every proposal passes sa.validateSaValue with 0 errors.
 * 6. sa.BANNED regexes evaluate to false for every proposed body_md.
 *
 * Run: node scripts/study-abroad/test-heading-proposals.mjs
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

test('heading migration proposals validation suite', async (t) => {
    if (!existsSync(PROPOSAL_FILE)) {
        throw new Error(`Proposal file not found: ${PROPOSAL_FILE}`);
    }

    const proposal = JSON.parse(readFileSync(PROPOSAL_FILE, 'utf8'));

    const dbRows = JSON.parse(execSync(`sqlite3 '${DB_PATH}' 'SELECT slug, body_md FROM sa_guides;' -json`, { maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' }));
    const liveMap = new Map(dbRows.map(r => [r.slug, r.body_md]));

    await t.test('covers exactly 92 guides', () => {
        assert.equal(proposal.changes.length, 92, `Expected 92 changes, got ${proposal.changes.length}`);
    });

    await t.test('proposes strictly body_md (zero field overwrites outside body_md)', () => {
        for (const change of proposal.changes) {
            const fields = Object.keys(change.fields);
            assert.deepEqual(fields, ['body_md'], `Change for ${change.key} must only propose body_md, got ${fields.join(',')}`);
        }
    });

    await t.test('diff-based integrity: preserves headings count and exact body content identity', () => {
        for (const change of proposal.changes) {
            const { key, fields } = change;
            const originalBody = liveMap.get(key);
            assert.ok(originalBody, `Guide ${key} must exist in database`);

            const proposedBody = fields.body_md;

            // 1. Assert '## Executive Summary' is removed
            assert.equal(proposedBody.includes('## Executive Summary: '), false, `Found '## Executive Summary: ' in ${key}`);

            // 2. Assert heading count is strictly preserved
            const origHeadings = (originalBody.match(/^##\s+/gm) || []).length;
            const propHeadings = (proposedBody.match(/^##\s+/gm) || []).length;
            assert.equal(propHeadings, origHeadings, `Heading count mismatch in ${key}: was ${origHeadings}, now ${propHeadings}`);

            // 3. Assert diff identity (reverting the heading prefix matches original exactly)
            let revertedBody = proposedBody;
            if (key === 'germany-daad-scholarships-guide') {
                revertedBody = revertedBody.replace('the premier scholarship for studying in Germany', 'the holy grail of studying in Germany');
            }
            revertedBody = revertedBody.replace(/^## /m, '## Executive Summary: ');
            assert.equal(revertedBody.trim(), originalBody.trim(), `Unintended content modifications detected in ${key}`);

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
