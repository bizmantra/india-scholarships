import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostAllowed } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const dbPath = process.env.LOCAL_DB_PATH || resolve(root, 'data', 'scholarships.db');
const allowedPath = resolve(root, 'data', 'study-abroad', 'official-domains.json');

if (!existsSync(dbPath)) {
  console.error(`❌ Database not found at ${dbPath}`);
  process.exit(1);
}

const allowed = JSON.parse(readFileSync(allowedPath, 'utf8')).domains;

let dbGuides = [];
try {
  const rawGuides = execFileSync('sqlite3', ['-json', dbPath, 'SELECT slug, country, title, official_source FROM sa_guides ORDER BY country, slug;'], {
    encoding: 'utf8'
  });
  dbGuides = JSON.parse(rawGuides || '[]');
} catch (e) {
  console.error(`❌ Failed to query sa_guides from ${dbPath}: ${e.message}`);
  process.exit(1);
}

const guideMap = new Map(dbGuides.map(g => [g.slug, g]));

// Candidate statutory & institutional mappings (strictly 1-to-1 unique topical matches)
const candidateMappings = {
  // --- GERMANY STATUTORY & INSTITUTIONAL GUIDES ---
  'germany-national-student-visa': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-vfs-appointment-hacks': 'https://india.diplo.de/in-en/service/2546328-2546328',
  'germany-rejection-analysis-appeal': 'https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202',
  'germany-residence-permit-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-job-seeker-visa-strategy': 'https://www.gesetze-im-internet.de/aufenthg_2004/__20.html',
  'germany-blue-card-pr-pathway': 'https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html',
  'germany-uni-assist-manual': 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/',
  'germany-uni-assist-portal-walkthrough': 'https://www.uni-assist.de/en/faqs/apply-online/',
  'germany-fsp-studienkolleg-guide': 'https://www.uni-assist.de/en/tools/glossary-of-terms/description/term/studienkolleg-preparatory-course/',
  'germany-bavarian-calculator-spec': 'https://www.tum.de/en/studies/application/application-info-portal/grade-conversion-formula-for-grades-earned-outside-germany',
  'germany-tum-munich-portal-manual': 'https://www.tum.de/en/studies/application/master/application-master',
  'germany-tum-efv-entrance-exam-guide': 'https://www.tum.de/en/studies/application/application-info-portal/admission-requirements',
  'germany-winter-vs-summer-intakes': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-master-program-listing-guide': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-daad-scholarship-master-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',

  // --- USA STATUTORY & INSTITUTIONAL GUIDES ---
  'usa-f1-student-visa-master-guide': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-initial-72hr-survival-guide': 'https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states',
  'usa-i20-issuance-deposit-payment': 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20',
  'usa-i20-financial-proof-manual': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-on-campus-jobs-20hr-rule': 'https://www.ice.gov/sevis/employment',
  'usa-cpt-internship-rules': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-opt-stem-opt-extension': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-green-card-eb2-niw-pathways': 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  'usa-ssn-application-guide': 'https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number',
  'usa-university-listing-hub-guide': 'https://studyinthestates.dhs.gov/school-search'
};

async function checkUrl(url) {
  try {
    const out = execFileSync('curl', [
      '-s',
      '-L',
      '-o', '/dev/null',
      '-w', '%{http_code}\n%{url_effective}',
      '--max-time', '15',
      url
    ], { encoding: 'utf8' });

    const lines = out.trim().split('\n');
    const code = lines[0];
    const finalUrl = lines[1] || url;

    if (code !== '200') {
      return { ok: false, error: `HTTP ${code}` };
    }

    // Verify final redirected URL is still within allowlist
    if (!hostAllowed(finalUrl, allowed)) {
      return { ok: false, error: `Redirected to disallowed host: ${finalUrl}` };
    }

    return { ok: true, finalUrl };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function run() {
  console.log(`🔍 Verifying ${Object.keys(candidateMappings).length} mapped guides against DB, allowlist, and live HTTP...`);
  const failures = [];
  const verified = [];
  const seenUrls = new Set();

  for (const [slug, url] of Object.entries(candidateMappings)) {
    // 1. Strict 1-to-1 uniqueness check (no shared URLs across guides)
    if (seenUrls.has(url)) {
      failures.push({ slug, url, reason: `URL is duplicated across guides (must be unique 1-to-1 match)` });
      continue;
    }
    seenUrls.add(url);

    // 2. DB existence check
    const guide = guideMap.get(slug);
    if (!guide) {
      failures.push({ slug, url, reason: `Slug does NOT exist in sa_guides database table` });
      continue;
    }

    // 3. Do not overwrite non-empty official_source
    if (guide.official_source && guide.official_source.trim() !== '') {
      failures.push({ slug, url, reason: `Guide already has an existing official_source: ${guide.official_source}` });
      continue;
    }

    // 4. Allowlist domain check
    if (!hostAllowed(url, allowed)) {
      failures.push({ slug, url, reason: `Host is NOT in official-domains.json` });
      continue;
    }

    // 5. Live HTTP check with redirect validation
    const checkResult = await checkUrl(url);
    if (!checkResult.ok) {
      failures.push({ slug, url, reason: `Live check failed: ${checkResult.error}` });
      continue;
    }

    verified.push({ slug, url });
    process.stdout.write('.');
  }

  console.log(`\n\n📊 Audit Complete:`);
  console.log(`   ✅ Verified clean: ${verified.length}`);
  console.log(`   ❌ Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.error(`\nDetailed Failures:`);
    for (const f of failures) {
      console.error(` - [${f.slug}]: ${f.reason} (${f.url})`);
    }
    process.exit(1);
  }

  // Generate verified proposal (checked_at is intentionally omitted so stale facts are not marked verified without fact auditing)
  const proposal = {
    agent: 'content-editor',
    notes: `C2 Second Pass: Primary statutory and institutional sources for ${verified.length} verified study abroad guides with 100% unique 1-to-1 live HTTP 200 checks (strictly existing allowlisted domains, 0 overwrites)`,
    changes: verified.map(v => ({
      table: 'sa_guides',
      key: v.slug,
      source: v.url,
      fields: {
        official_source: v.url
      }
    }))
  };

  const outPath = resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json');
  writeFileSync(outPath, JSON.stringify(proposal, null, 2) + '\n', 'utf8');
  console.log(`\n📝 Successfully generated proposal for ${verified.length} verified guides to ${outPath}\n`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
