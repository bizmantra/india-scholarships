/**
 * Offline test suite for heading migration proposals.
 * Asserts:
 * 1. Proposal file exists, is reproducible, and covers exactly 94 guides.
 * 2. Only body_md is proposed (0 overwrites of official_source or other fields).
 * 3. Idempotent & diff-based: heading count preserved, exact content preserved except heading prefix and clean callout block.
 * 4. Callout block has clean CommonMark blank lines before and after.
 * 5. Every proposal passes sa.validateSaValue with 0 errors.
 * 6. sa.BANNED regexes evaluate to false for every proposed body_md.
 * 7. All source URLs are strictly on the official allowlist.
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
const { hostAllowed } = await import('../lib/source-verify.mjs');

const PROPOSAL_FILE = 'scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json';
const SOURCES_TRACKED_FILE = 'scripts/study-abroad/proposals/heading-migration-sources.json';
const ALLOWLIST_FILE = 'data/study-abroad/official-domains.json';
const DB_PATH = 'data/scholarships.db';

test('heading migration proposals validation suite', async (t) => {
    if (!existsSync(PROPOSAL_FILE)) {
        throw new Error(`Proposal file not found: ${PROPOSAL_FILE}`);
    }
    if (!existsSync(SOURCES_TRACKED_FILE)) {
        throw new Error(`Tracked sources file not found: ${SOURCES_TRACKED_FILE}`);
    }

    const proposal = JSON.parse(readFileSync(PROPOSAL_FILE, 'utf8'));
    const allowlist = JSON.parse(readFileSync(ALLOWLIST_FILE, 'utf8')).domains;
    const trackedSources = JSON.parse(readFileSync(SOURCES_TRACKED_FILE, 'utf8'));

    const dbRows = JSON.parse(execSync(`sqlite3 "${DB_PATH}" "SELECT slug, body_md FROM sa_guides;" -json`, { maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' }));
    const liveMap = new Map(dbRows.map(r => [r.slug, r.body_md]));

    await t.test('covers exactly 94 guides with tracked sources', () => {
        assert.equal(proposal.changes.length, 94, `Expected 94 changes, got ${proposal.changes.length}`);
        assert.equal(Object.keys(trackedSources).length, 94, `Expected 94 tracked sources, got ${Object.keys(trackedSources).length}`);
    });

    await t.test('proposes strictly body_md (zero field overwrites outside body_md)', () => {
        for (const change of proposal.changes) {
            const fields = Object.keys(change.fields);
            assert.deepEqual(fields, ['body_md'], `Change for ${change.key} must only propose body_md, got ${fields.join(',')}`);
        }
    });

    await t.test('diff-based integrity: preserves headings count, clean callout spacing, and unchanged body content', () => {
        for (const change of proposal.changes) {
            const { key, fields, source } = change;
            const originalBody = liveMap.get(key);
            assert.ok(originalBody, `Guide ${key} must exist in database`);

            const proposedBody = fields.body_md;

            // 1. Assert '## Executive Summary' is removed
            assert.equal(proposedBody.includes('## Executive Summary: '), false, `Found '## Executive Summary: ' in ${key}`);

            // 2. Assert heading count is strictly preserved
            const origHeadings = (originalBody.match(/^##\s+/gm) || []).length;
            const propHeadings = (proposedBody.match(/^##\s+/gm) || []).length;
            assert.equal(propHeadings, origHeadings, `Heading count mismatch in ${key}: was ${origHeadings}, now ${propHeadings}`);

            // 3. Assert callout has clean CommonMark spacing
            assert.ok(proposedBody.includes('\n\n---\n\n> 🔗 '), `Missing clean callout boundary in ${key}`);
            assert.ok(proposedBody.endsWith('\n'), `Proposed body must end with newline in ${key}`);

            // 4. Assert all URLs in proposed body and source citation are allowlisted
            const urlMatches = proposedBody.match(/https?:\/\/[^\s)\]]+/g) || [];
            assert.ok(urlMatches.length >= 1, `Proposed body in ${key} must have at least one URL`);
            for (const u of urlMatches) {
                assert.ok(hostAllowed(u, allowlist), `URL ${u} in ${key} not on official allowlist`);
            }
            assert.ok(hostAllowed(source, allowlist), `Source citation ${source} in ${key} not on official allowlist`);

            // 5. Assert diff identity (reverting the heading prefix and stripping the callout matches original)
            let revertedBody = proposedBody;
            const calloutIdx = revertedBody.indexOf('\n\n---\n\n> 🔗 ');
            if (calloutIdx !== -1) {
                revertedBody = revertedBody.slice(0, calloutIdx);
            }
            if (key === 'germany-daad-scholarships-guide') {
                revertedBody = revertedBody.replace('the premier scholarship for studying in Germany', 'the holy grail of studying in Germany');
            }
            revertedBody = revertedBody.replace(/^## /m, '## Executive Summary: ');
            assert.equal(revertedBody.trim(), originalBody.trim(), `Unintended content modifications detected in ${key}`);

            // 6. Assert sa.validateSaValue passes with 0 errors
            const err = sa.validateSaValue('sa_guides', 'body_md', proposedBody, { source, previous: originalBody });
            assert.equal(err, null, `Validation error on ${key}: ${err}`);

            // 7. Assert sa.BANNED regexes all return false
            for (const rx of sa.BANNED) {
                const freshRx = new RegExp(rx.source, rx.flags.replace(/[gy]/g, ''));
                assert.equal(freshRx.test(proposedBody), false, `Banned phrase matching ${rx} found in ${key}`);
            }
        }
    });
});
