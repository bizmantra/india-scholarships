/**
 * Pre-flight for Study Abroad proposals (Spec D6). Read-only: no database access.
 * Run it before propose-changes.mjs; it does not submit anything.
 *
 *   node scripts/study-abroad/check-proposals.mjs <changes.json>
 *   node scripts/study-abroad/propose-changes.mjs <changes.json> --target=staging   (only if this passes)
 *
 * Exit 0 when no failures (warnings are printed), 1 on any failure, 2 when the input is unreadable.
 * Rules are in scripts/lib/source-verify.mjs (checkProposals).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProposals, fetchPage } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', '..', 'data', 'study-abroad');

const file = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!file) {
    console.error('Usage: node scripts/study-abroad/check-proposals.mjs <changes.json>');
    process.exit(2);
}

let input;
try {
    input = JSON.parse(readFileSync(resolve(file), 'utf8'));
} catch (err) {
    console.error(`✗ cannot read ${file}: ${err.message}`);
    process.exit(2);
}
const registry = JSON.parse(readFileSync(resolve(dataDir, 'source-checks.json'), 'utf8'));
const allowed = JSON.parse(readFileSync(resolve(dataDir, 'official-domains.json'), 'utf8')).domains;

const pages = new Map();
const pageFor = async url => {
    if (!pages.has(url)) pages.set(url, await fetchPage(url));
    return pages.get(url);
};

const { failures, warnings } = await checkProposals(input.changes || [], { registry, allowed, pageFor });
for (const w of warnings) console.log(`! ${w.key} ${w.field}: ${w.reason}`);
for (const f of failures) console.log(`✗ ${f.key} ${f.field}: ${f.reason}`);
console.log(`\n${failures.length} failure(s), ${warnings.length} warning(s)`);
process.exit(failures.length ? 1 : 0);
