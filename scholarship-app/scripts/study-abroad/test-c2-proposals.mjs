import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProposalSources, hostAllowed } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const dataDir = resolve(root, 'data', 'study-abroad');
const dbPath = process.env.LOCAL_DB_PATH || resolve(root, 'data', 'scholarships.db');

if (!existsSync(dbPath)) {
  console.error(`❌ Database not found at ${dbPath}`);
  process.exit(1);
}

const allowed = JSON.parse(readFileSync(resolve(dataDir, 'official-domains.json'), 'utf8')).domains;
const registry = JSON.parse(readFileSync(resolve(dataDir, 'source-checks.json'), 'utf8'));

// 1. Guides proposals test
const guidesProposalPath = resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json');
if (!existsSync(guidesProposalPath)) {
  console.error(`❌ Proposal file not found at ${guidesProposalPath}`);
  process.exit(1);
}

const guidesProposal = JSON.parse(readFileSync(guidesProposalPath, 'utf8'));
console.log(`🧪 Testing C2 Second Pass Guides Proposals (${guidesProposal.changes.length} changes)...`);

// 2. Structural & Field Validation
const seenSlugs = new Set();
for (const [idx, c] of guidesProposal.changes.entries()) {
  if (c.table !== 'sa_guides') {
    console.error(`❌ Change #${idx} has invalid table: ${c.table} (expected sa_guides)`);
    process.exit(1);
  }
  if (!c.key || typeof c.key !== 'string') {
    console.error(`❌ Change #${idx} missing key/slug`);
    process.exit(1);
  }
  if (seenSlugs.has(c.key)) {
    console.error(`❌ Change #${idx} has duplicate key: ${c.key}`);
    process.exit(1);
  }
  seenSlugs.add(c.key);

  if (!c.fields || typeof c.fields !== 'object') {
    console.error(`❌ Change #${idx} (${c.key}) missing fields object`);
    process.exit(1);
  }
  if (!c.fields.official_source || typeof c.fields.official_source !== 'string') {
    console.error(`❌ Change #${idx} (${c.key}) missing fields.official_source`);
    process.exit(1);
  }
  if ('checked_at' in c.fields) {
    console.error(`❌ Change #${idx} (${c.key}) must NOT include bulk checked_at stamp without manual fact verification`);
    process.exit(1);
  }
}

// 3. Check proposal against sa-inbox source gate
const guidesResult = await checkProposalSources(guidesProposal.changes, {
  allowed,
  registry,
  defaultSource: guidesProposal.source || null,
  pageFor: async () => null,
});

if (guidesResult.refusals.length > 0) {
  console.error(`❌ Found ${guidesResult.refusals.length} refusals:`);
  for (const r of guidesResult.refusals) {
    console.error(`   - [${r.table}:${r.key}] field: ${r.field} -> ${r.reason}`);
  }
  process.exit(1);
}

// 4. Validate DB key existence via execFileSync (safe against shell injection)
let dbRows = [];
try {
  const rawRows = execFileSync('sqlite3', ['-json', dbPath, 'SELECT slug FROM sa_guides;'], {
    encoding: 'utf8'
  });
  dbRows = JSON.parse(rawRows || '[]');
} catch (e) {
  console.error(`❌ Failed to query database: ${e.message}`);
  process.exit(1);
}

const guideSlugs = new Set(dbRows.map(g => g.slug));
const missingSlugs = [];

for (const c of guidesProposal.changes) {
  if (!guideSlugs.has(c.key)) {
    missingSlugs.push(c.key);
  }
}

if (missingSlugs.length > 0) {
  console.error(`❌ Found ${missingSlugs.length} slugs not in database:`, missingSlugs);
  process.exit(1);
}

// 5. Assert all sources strictly belong to allowlist
for (const c of guidesProposal.changes) {
  if (!hostAllowed(c.fields.official_source, allowed)) {
    console.error(`❌ Source host is not allowlisted in ${c.key}: ${c.fields.official_source}`);
    process.exit(1);
  }
}

console.log(`✅ All ${guidesProposal.changes.length} guide proposals passed structural checks (no duplicates, no checked_at bulk stamp)!`);
console.log(`✅ All ${guidesProposal.changes.length} guide proposals passed the source gate with 0 refusals!`);
console.log(`✅ All ${guidesProposal.changes.length} slugs verified present in sa_guides database table!`);
console.log(`✅ 100% of sources verified strictly against pristine official-domains allowlist!\n`);
