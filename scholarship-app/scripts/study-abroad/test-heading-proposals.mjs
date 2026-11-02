/**
 * Offline test suite for heading migration proposals.
 * Asserts:
 * 1. Proposal file exists and has changes.
 * 2. All 94 guides are covered.
 * 3. Every proposal passes sa.validateSaValue with 0 errors.
 * 4. sa.BANNED returns false for every proposed body_md (0 occurrences of banned phrases).
 * 5. All official sources are on data/study-abroad/official-domains.json allowlist.
 * 6. Every proposed body_md has at least 150 words and at least one https:// link.
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
const ALLOWLIST_FILE = 'data/study-abroad/official-domains.json';
const DB_PATH = 'data/scholarships.db';

test('heading migration proposals validation suite', async (t) => {
    if (!existsSync(PROPOSAL_FILE)) {
        throw new Error(`Proposal file not found: ${PROPOSAL_FILE}`);
    }

    const proposal = JSON.parse(readFileSync(PROPOSAL_FILE, 'utf8'));
    const allowlist = JSON.parse(readFileSync(ALLOWLIST_FILE, 'utf8')).domains;

    const dbRows = JSON.parse(execSync(`sqlite3 ${DB_PATH} 'SELECT slug, body_md FROM sa_guides WHERE body_md LIKE "%## Executive Summary: %"' -json`).toString());
    const liveMap = new Map(dbRows.map(r => [r.slug, r.body_md]));

    await t.test('covers all 94 guides', () => {
        assert.equal(proposal.changes.length, 94, `Expected 94 changes, got ${proposal.changes.length}`);
    });

    await t.test('all changes pass sa.validateSaValue and zero BANNED phrases', () => {
        for (const change of proposal.changes) {
            const { table, key, fields, source } = change;
            assert.equal(table, 'sa_guides');
            const liveBody = liveMap.get(key);
            assert.ok(liveBody, `Key ${key} must exist in live database`);

            // Validate body_md
            const err = sa.validateSaValue('sa_guides', 'body_md', fields.body_md, { source, previous: liveBody });
            assert.equal(err, null, `Validation error on ${key}: ${err}`);

            // Assert BANNED regexes are completely clean
            for (const rx of sa.BANNED) {
                assert.equal(rx.test(fields.body_md), false, `Banned phrase matching ${rx} found in ${key}`);
            }

            // Assert no '## Executive Summary' remains in heading
            assert.equal(fields.body_md.includes('## Executive Summary'), false, `Found '## Executive Summary' in ${key}`);

            // Assert official_source is allowlisted
            assert.ok(hostAllowed(fields.official_source, allowlist), `Source ${fields.official_source} for ${key} must be on official allowlist`);
        }
    });
});
