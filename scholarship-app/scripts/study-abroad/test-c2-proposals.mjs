import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProposalSources } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', '..', 'data', 'study-abroad');
const dbPath = resolve(here, '..', '..', 'data', 'scholarships.db');

const allowed = JSON.parse(readFileSync(resolve(dataDir, 'official-domains.json'), 'utf8')).domains;
const registry = JSON.parse(readFileSync(resolve(dataDir, 'source-checks.json'), 'utf8'));

// 1. Guides proposals test
const guidesProposalPath = resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json');
const guidesProposal = JSON.parse(readFileSync(guidesProposalPath, 'utf8'));
console.log(`🧪 Testing C2 Second Pass Guides Proposals (${guidesProposal.changes.length} changes)...`);

// Check proposal against sa-inbox source gate
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

// 2. Validate DB key existence
const dbGuides = JSON.parse(execSync(`sqlite3 -json "${dbPath}" "SELECT slug FROM sa_guides;"`).toString());
const guideSlugs = new Set(dbGuides.map(g => g.slug));
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

// 3. Ensure no commercial provider domains crept in
const forbiddenProviders = ['expatrio.com', 'fintiba.com', 'coracle.de', 'vfsglobal.com', 'liaisonedu.com', 'duolingo.com'];
for (const c of guidesProposal.changes) {
  for (const p of forbiddenProviders) {
    if (c.fields.official_source.includes(p)) {
      console.error(`❌ Forbidden commercial provider found in ${c.key}: ${c.fields.official_source}`);
      process.exit(1);
    }
  }
}

console.log(`✅ All ${guidesProposal.changes.length} guide proposals passed the source gate with 0 refusals!`);
console.log(`✅ All ${guidesProposal.changes.length} slugs verified present in sa_guides database table!`);
console.log(`✅ 0 commercial provider domains present!\n`);
