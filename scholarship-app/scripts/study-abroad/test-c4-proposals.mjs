import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import assert from 'node:assert';

const require = createRequire(import.meta.url);
const { createClient } = require('@libsql/client');
const sa = require('../lib/sa-inbox.js');
const { checkProposalSources } = require('../lib/source-verify.mjs');

const proposalsFile = new URL('proposals/c4-us-universities-2026-11-02.json', import.meta.url);
const input = JSON.parse(readFileSync(proposalsFile, 'utf8'));

console.log('Testing C4 Proposals Offline Validation...');

// 1. Source Gate Check
const dataDir = new URL('../../data/study-abroad/', import.meta.url);
const allowed = JSON.parse(readFileSync(new URL('official-domains.json', dataDir), 'utf8')).domains;
const registry = JSON.parse(readFileSync(new URL('source-checks.json', dataDir), 'utf8'));

const sourceGate = await checkProposalSources(input.changes || [], {
    allowed,
    registry,
    defaultSource: input.source,
});

console.log('Source Gate Result:', {
    refusalsCount: sourceGate.refusals.length,
    warningsCount: sourceGate.warnings.length,
});

assert.strictEqual(sourceGate.refusals.length, 0, 'No source gate refusals allowed');

// 2. Row Validation Check against local database
const dbPath = new URL('../../data/scholarships.db', import.meta.url).pathname;
const client = createClient({ url: `file:${dbPath}` });

for (const change of input.changes) {
    const { table, key, fields } = change;
    console.log(`\nValidating ${table} : ${key}...`);

    const converted = {};
    for (const [k, v] of Object.entries(fields)) {
        converted[k] = sa.toText(v);
    }

    const valErr = sa.validateNewRow(table, converted, {
        universityExists: () => true,
    });
    if (valErr) {
        console.error(`  ✗ Validation Error on ${key}:`, valErr);
    } else {
        console.log(`  ✓ validateNewRow passed for ${key}`);
    }
    assert.strictEqual(valErr, null, `validateNewRow failed for ${key}`);

    const pubErr = sa.validatePublishRow(table, converted);
    if (pubErr) {
        console.error(`  ✗ Publish Gate Error on ${key}:`, pubErr);
    } else {
        console.log(`  ✓ validatePublishRow passed for ${key}`);
    }
    assert.strictEqual(pubErr, null, `validatePublishRow failed for ${key}`);
}

console.log('\n--- ALL C4 PROPOSALS VALIDATED SUCCESSFULLY! ---');
