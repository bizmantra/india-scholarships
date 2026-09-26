/**
 * Make the staging database an exact copy of production.
 *
 * Reads production (never writes to it), then replaces every copied table on staging.
 * Run this before testing a new or changed agent against staging.
 *
 * Usage: node scripts/refresh-staging.js
 */
const os = require('os');
const path = require('path');
const { connect, describe } = require('./lib/turso-target');
const { backup } = require('./backup-turso');
const { restore } = require('./restore-turso');

async function run() {
    const production = connect('production');
    const staging = connect('staging');
    const snapshot = path.join(os.tmpdir(), `turso-production-snapshot-${Date.now()}.db`);

    console.log(`📥 Copying production (${describe(production.url)})...`);
    const copied = await backup(production.client, snapshot);
    if (!copied.scholarships) throw new Error('Production snapshot has no scholarships — aborting.');

    console.log(`📤 Replacing staging (${describe(staging.url)})...`);
    const summary = await restore(staging.client, snapshot);
    Object.entries(summary).forEach(([table, count]) => console.log(`   ${table}: ${count} rows`));
    console.log('✅ Staging now matches production.');
}

run().catch(error => {
    console.error(`❌ Refresh failed: ${error.message}`);
    process.exit(1);
});
