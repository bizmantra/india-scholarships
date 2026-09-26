/**
 * Resolves which Turso database a script should talk to.
 *
 *   --target=production  (default) uses TURSO_DATABASE_URL / TURSO_AUTH_TOKEN
 *   --target=staging                uses TURSO_STAGING_DATABASE_URL / TURSO_STAGING_AUTH_TOKEN
 *
 * DB_TARGET=staging in the environment works the same as --target=staging.
 */
const path = require('path');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

function resolveTarget(argv = process.argv) {
    const arg = argv.find(a => a.startsWith('--target='));
    const target = (arg ? arg.split('=')[1] : process.env.DB_TARGET || 'production').toLowerCase();
    if (!['production', 'staging'].includes(target)) {
        throw new Error(`Unknown target "${target}". Use --target=production or --target=staging.`);
    }
    return target;
}

function connect(target) {
    const url = target === 'staging' ? process.env.TURSO_STAGING_DATABASE_URL : process.env.TURSO_DATABASE_URL;
    const authToken = target === 'staging' ? process.env.TURSO_STAGING_AUTH_TOKEN : process.env.TURSO_AUTH_TOKEN;
    if (!url) {
        const name = target === 'staging' ? 'TURSO_STAGING_DATABASE_URL' : 'TURSO_DATABASE_URL';
        throw new Error(`${name} is not set (target: ${target}).`);
    }
    // Guard against a staging run accidentally pointing at the live database
    if (target === 'staging' && url === process.env.TURSO_DATABASE_URL) {
        throw new Error('Staging URL is the same as the production URL. Refusing to continue.');
    }
    return { client: createClient({ url, authToken }), url, target };
}

// Hide the account-specific part of the URL in logs
function describe(url) {
    return url.replace(/^(libsql:\/\/[^-.]+)[^.]*/, '$1***');
}

module.exports = { resolveTarget, connect, describe };
