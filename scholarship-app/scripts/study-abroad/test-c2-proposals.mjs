import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProposalSources } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', '..', 'data', 'study-abroad');

const allowed = JSON.parse(readFileSync(resolve(dataDir, 'official-domains.json'), 'utf8')).domains;
const registry = JSON.parse(readFileSync(resolve(dataDir, 'source-checks.json'), 'utf8'));

// 1. Guides proposals test
const guidesProposal = JSON.parse(readFileSync(resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json'), 'utf8'));
console.log(`🧪 Testing C2 Second Pass Guides Proposals (${guidesProposal.changes.length} changes)...`);

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

console.log(`✅ All ${guidesProposal.changes.length} guide proposals passed with 0 refusals!`);

// 2. Facts freshness proposals test
const factsProposal = JSON.parse(readFileSync(resolve(here, 'proposals', 'c2-facts-freshness-2026-11-02.json'), 'utf8'));
console.log(`\n🧪 Testing C2 Facts Freshness Proposals (${factsProposal.changes.length} changes)...`);

const factsResult = await checkProposalSources(factsProposal.changes, {
  allowed,
  registry,
  defaultSource: factsProposal.source || null,
  pageFor: async () => null,
});

if (factsResult.refusals.length > 0) {
  console.error(`❌ Found ${factsResult.refusals.length} refusals:`);
  for (const r of factsResult.refusals) {
    console.error(`   - [${r.table}:${r.key}] field: ${r.field} -> ${r.reason}`);
  }
  process.exit(1);
}

console.log(`✅ All ${factsProposal.changes.length} facts proposals passed with 0 refusals!\n`);
