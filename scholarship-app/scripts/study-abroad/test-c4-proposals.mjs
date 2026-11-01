import { readFileSync } from 'node:fs';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sa = require('../lib/sa-inbox.js');
const { checkProposalSources } = require('../lib/source-verify.mjs');

console.log('Testing Study Abroad Proposals (C4 & C2) Offline Validation...');

const dataDir = new URL('../../data/study-abroad/', import.meta.url);
const allowed = JSON.parse(readFileSync(new URL('official-domains.json', dataDir), 'utf8')).domains;
const registry = JSON.parse(readFileSync(new URL('source-checks.json', dataDir), 'utf8'));

// 1. Validate C4: 6 US Universities
const c4File = new URL('proposals/c4-us-universities-2026-11-02.json', import.meta.url);
const c4Input = JSON.parse(readFileSync(c4File, 'utf8'));

const c4SourceGate = await checkProposalSources(c4Input.changes || [], {
    allowed,
    registry,
    defaultSource: c4Input.source,
});

console.log('C4 Source Gate Result:', {
    refusalsCount: c4SourceGate.refusals.length,
    warningsCount: c4SourceGate.warnings.length,
});
assert.strictEqual(c4SourceGate.refusals.length, 0, 'No C4 source gate refusals allowed');

for (const change of c4Input.changes) {
    const { table, key, fields } = change;
    console.log(`\nValidating ${table} : ${key}...`);

    const converted = {};
    for (const [k, v] of Object.entries(fields)) {
        converted[k] = sa.toText(v);
    }

    const valErr = sa.validateNewRow(table, converted, {
        universityExists: () => true,
    });
    if (valErr) console.error(`  ✗ Validation Error on ${key}:`, valErr);
    assert.strictEqual(valErr, null, `validateNewRow failed for ${key}`);

    const pubErr = sa.validatePublishRow(table, converted);
    if (pubErr) console.error(`  ✗ Publish Gate Error on ${key}:`, pubErr);
    assert.strictEqual(pubErr, null, `validatePublishRow failed for ${key}`);

    // Arithmetic checks
    if (key === 'illinois-institute-of-technology') {
        assert.strictEqual(fields.tuition_per_year, 1851 * 18, 'IIT tuition math must equal 1851 * 18');
    }
    if (key === 'university-of-central-missouri') {
        assert.strictEqual(fields.tuition_per_year, 520 * 15, 'UCM annual tuition math must equal 520 * 15');
        const infoboxBudget = parseInt(fields.infobox_json.rows.find(r => r.key.includes('Estimated Annual Budget')).value.replace(/[^0-9]/g, ''), 10);
        assert.strictEqual(infoboxBudget, 23100, 'UCM infobox budget must match $23,100');
    }

    console.log(`  ✓ Validation and arithmetic checks passed for ${key}`);
}

// 2. Validate C2: Money Provenance
const c2File = new URL('proposals/c2-money-provenance-2026-11-02.json', import.meta.url);
const c2Input = JSON.parse(readFileSync(c2File, 'utf8'));

const c2SourceGate = await checkProposalSources(c2Input.changes || [], {
    allowed,
    registry,
    defaultSource: c2Input.source,
});

console.log('\nC2 Source Gate Result:', {
    refusalsCount: c2SourceGate.refusals.length,
    warningsCount: c2SourceGate.warnings.length,
});
assert.strictEqual(c2SourceGate.refusals.length, 0, 'No C2 source gate refusals allowed');

for (const change of c2Input.changes) {
    const { table, key, fields } = change;
    console.log(`\nValidating C2 provenance on ${table} : ${key}...`);
    assert(fields.official_source.startsWith('https://'), `C2 source must be https:// URL`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(fields.checked_at), `C2 checked_at must be YYYY-MM-DD`);
    console.log(`  ✓ C2 provenance passed for ${key}`);
}

console.log('\n--- ALL C4 & C2 PROPOSALS VALIDATED SUCCESSFULLY! ---');
