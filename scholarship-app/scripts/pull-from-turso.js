/**
 * Download the current Turso database into data/scholarships.db, the local working copy.
 *
 * Turso is the master copy. Every script and agent works like this:
 *   1. node scripts/pull-from-turso.js      ← fresh local copy + a "base" snapshot
 *   2. run scripts that edit data/scholarships.db
 *   3. node scripts/push-to-turso.js        ← sends only what step 2 changed
 *
 * The base snapshot (data/.turso-base-<target>.db) lets the push tell apart what this run
 * changed from what someone else changed on Turso in the meantime, so neither overwrites the other.
 *
 * Usage: node scripts/pull-from-turso.js [--target=production|staging] [--if-configured]
 *   --if-configured  do nothing (exit 0) when no Turso URL is set, e.g. a local build without credentials
 */
const fs = require('fs');
const path = require('path');
const { resolveTarget, connect, describe } = require('./lib/turso-target');
const { backup } = require('./backup-turso');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || path.join(DATA_DIR, 'scholarships.db');
const basePathFor = target => path.join(path.dirname(LOCAL_DB_PATH), `.turso-base-${target}.db`);

async function run() {
    const target = resolveTarget();
    const urlVar = target === 'staging' ? 'TURSO_STAGING_DATABASE_URL' : 'TURSO_DATABASE_URL';
    if (process.argv.includes('--if-configured') && !process.env[urlVar]) {
        if (!fs.existsSync(LOCAL_DB_PATH)) {
            throw new Error(`${urlVar} is not set and there is no local ${path.basename(LOCAL_DB_PATH)}. Set the Turso credentials in .env.local.`);
        }
        console.log(`ℹ️  ${urlVar} not set — using the existing local database file.`);
        return;
    }

    const { client, url } = connect(target);
    const tmp = `${LOCAL_DB_PATH}.downloading`;
    console.log(`📥 Pulling Turso (${target}: ${describe(url)}) → ${path.relative(process.cwd(), LOCAL_DB_PATH)}`);
    const summary = await backup(client, tmp);
    if (!summary.scholarships) {
        fs.rmSync(tmp, { force: true });
        throw new Error('Turso returned no scholarships — refusing to replace the local copy.');
    }

    // Swap in the new copy only once the download is complete
    fs.renameSync(tmp, LOCAL_DB_PATH);
    fs.copyFileSync(LOCAL_DB_PATH, basePathFor(target));
    Object.entries(summary).forEach(([table, count]) => console.log(`   ${table}: ${count} rows`));
    console.log('✅ Local copy is up to date');
}

if (require.main === module) {
    run().catch(error => {
        console.error(`❌ Pull failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { basePathFor };
