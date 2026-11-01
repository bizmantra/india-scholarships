/**
 * Check Study Abroad facts against their official pages (Spec D6). Read-only: no database access.
 *
 *   node scripts/study-abroad/verify-sources.mjs [--registry=data/study-abroad/source-checks.json] [--strict]
 *
 * Exit codes:
 *   0  every entry passed (unverifiable entries are reported, not failed, unless --strict)
 *   1  at least one entry failed: quote or value not on the page, or host not on the allowlist
 *   2  registry file is malformed
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEntry, checkEntry, fetchPage } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', '..', 'data', 'study-abroad');

const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const registryPath = arg('registry') ? resolve(arg('registry')) : resolve(dataDir, 'source-checks.json');
const strict = process.argv.includes('--strict');

export async function run({ registryPath: regPath = registryPath, fetchImpl, strictMode = strict, log = console.log } = {}) {
    const registry = JSON.parse(readFileSync(regPath, 'utf8'));
    const allowed = JSON.parse(readFileSync(resolve(dataDir, 'official-domains.json'), 'utf8')).domains;
    const entries = registry.entries || [];

    const bad = entries.flatMap(e => validateEntry(e).map(p => `${e && e.id}: ${p}`));
    if (bad.length) {
        bad.forEach(p => log(`✗ registry: ${p}`));
        return { code: 2, results: [] };
    }

    const pages = new Map();
    for (const url of new Set(entries.map(e => e.url))) {
        pages.set(url, await fetchPage(url, { fetchImpl }));
    }

    const results = entries.map(e => ({ id: e.id, fact_key: e.fact_key, url: e.url, ...checkEntry(e, pages.get(e.url), allowed) }));
    for (const r of results) {
        const mark = r.status === 'pass' ? '✓' : r.status === 'fail' ? '✗' : '?';
        log(`${mark} ${r.id} (${r.status}): ${r.reason}`);
    }
    const failed = results.filter(r => r.status === 'fail').length;
    const unverifiable = results.filter(r => r.status === 'unverifiable').length;
    log(`\n${results.length} checked · ${results.length - failed - unverifiable} passed · ${failed} failed · ${unverifiable} unverifiable`);

    const code = failed > 0 || (strictMode && unverifiable > 0) ? 1 : 0;
    return { code, results };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { code } = await run();
    process.exit(code);
}
