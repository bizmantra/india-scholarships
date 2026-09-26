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

// Show which database a URL points at (e.g. india-scholarships-staging-***) while hiding the account name
function describe(url) {
    return url.replace(/^(libsql:\/\/[^.]+)-[^-.]+(\.)/, '$1-***$2');
}

// Safe facts about an auth token for troubleshooting: never prints the token or its signature
function describeToken(token) {
    if (!token) return 'no token set';
    const facts = [`length ${token.length}`];
    if (/\s/.test(token)) facts.push('CONTAINS SPACES OR LINE BREAKS');
    if (/^["']|["']$/.test(token)) facts.push('WRAPPED IN QUOTES');
    try {
        const claims = JSON.parse(Buffer.from(token.trim().split('.')[1], 'base64url').toString('utf8'));
        facts.push(`access ${claims.a || 'full'}`);
        if (claims.iat) facts.push(`issued ${new Date(claims.iat * 1000).toISOString().slice(0, 16)}Z`);
        facts.push(claims.exp ? `expires ${new Date(claims.exp * 1000).toISOString().slice(0, 16)}Z` : 'no expiry');
    } catch {
        facts.push('not a readable Turso token');
    }
    return facts.join(', ');
}

// Explain a 401 in plain terms: which database was tried and what the token looks like
function explainAuthError(error, target) {
    if (!/401|unauthori[sz]ed/i.test(String(error && error.message))) return;
    const urlVar = target === 'staging' ? 'TURSO_STAGING_DATABASE_URL' : 'TURSO_DATABASE_URL';
    const tokenVar = target === 'staging' ? 'TURSO_STAGING_AUTH_TOKEN' : 'TURSO_AUTH_TOKEN';
    console.error(`   Turso rejected the token (HTTP 401).`);
    console.error(`   ${urlVar} → ${describe(process.env[urlVar] || '(not set)')}`);
    console.error(`   ${tokenVar} → ${describeToken(process.env[tokenVar])}`);
    console.error('   Check that the token was created for this same database and has not been invalidated.');
}

module.exports = { resolveTarget, connect, describe, describeToken, explainAuthError };
