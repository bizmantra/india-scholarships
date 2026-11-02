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
  const rawGuides = execFileSync('sqlite3', ['-json', dbPath, 'SELECT slug, country, title FROM sa_guides ORDER BY country, slug;'], {
    encoding: 'utf8'
  });
  dbGuides = JSON.parse(rawGuides || '[]');
} catch (e) {
  console.error(`❌ Failed to query sa_guides from ${dbPath}: ${e.message}`);
  process.exit(1);
}

const guideSlugs = new Set(dbGuides.map(g => g.slug));

// Candidate statutory & institutional mappings (topic-specific 1-to-1 matches)
const candidateMappings = {
  // --- GERMANY STATUTORY & INSTITUTIONAL GUIDES ---
  'germany-national-student-visa': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-vfs-appointment-hacks': 'https://india.diplo.de/in-en/service/2546328-2546328',
  'germany-rejection-analysis-appeal': 'https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202',
  'germany-residence-permit-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-job-seeker-visa-strategy': 'https://www.gesetze-im-internet.de/aufenthg_2004/__20.html',
  'germany-blue-card-pr-pathway': 'https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html',
  'germany-part-time-work-rules': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-securing-werkstudent-jobs': 'https://www.gesetze-im-internet.de/sgb_5/__6.html',
  'germany-aps-certificate-guide': 'https://aps-india.de/aps-process/',
  'aps-india-certificate-verification-step-by-step': 'https://aps-india.de/aps-process/',
  'germany-uni-assist-manual': 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/',
  'germany-uni-assist-portal-walkthrough': 'https://www.uni-assist.de/en/faqs/apply-online/',
  'germany-fsp-studienkolleg-guide': 'https://www.uni-assist.de/en/tools/glossary-of-terms/description/term/studienkolleg-preparatory-course/',
  'germany-bavarian-calculator-spec': 'https://www.tum.de/en/studies/application/application-info-portal/grade-conversion-formula-for-grades-earned-outside-germany',
  'germany-tum-munich-portal-manual': 'https://www.tum.de/en/studies/application/master/application-master',
  'germany-tum-efv-entrance-exam-guide': 'https://www.tum.de/en/studies/application/application-info-portal/admission-requirements',
  'germany-winter-vs-summer-intakes': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-offer-acceptance-payment': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-ms-cs-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-ms-data-science-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-master-program-listing-guide': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-daad-scholarships-guide': 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  'germany-daad-scholarship-master-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-scholarship-directory-hub-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-total-cost-breakdown': 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',
  'germany-destination-overview': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-public-vs-private': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-initial-72hr-survival-guide': 'https://www.daad.de/en/studying-in-germany/living-in-germany/',

  // --- USA STATUTORY & INSTITUTIONAL GUIDES ---
  'us-f1-student-visa-application-checklist': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-f1-student-visa-master-guide': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-initial-72hr-survival-guide': 'https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states',
  'usa-i20-financial-proof-manual': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-i20-issuance-deposit-payment': 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20',
  'usa-i20-proof-of-funds-calc-spec': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-on-campus-jobs-20hr-rule': 'https://www.ice.gov/sevis/employment',
  'usa-cpt-internship-rules': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-opt-stem-opt-extension': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-stem-opt-timeline-calc-spec': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-h1b-lottery-cap-exempt': 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  'usa-green-card-eb2-niw-pathways': 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  'usa-ssn-application-guide': 'https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number',
  'usa-destination-overview': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-university-listing-hub-guide': 'https://studyinthestates.dhs.gov/school-search',
  'usa-master-program-listing-guide': 'https://studyinthestates.dhs.gov/school-search'
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
  const urlCache = new Map();

  for (const [slug, url] of Object.entries(candidateMappings)) {
    // 1. DB existence check
    if (!guideSlugs.has(slug)) {
      failures.push({ slug, url, reason: `Slug does NOT exist in sa_guides database table` });
      continue;
    }

    // 2. Allowlist domain check
    if (!hostAllowed(url, allowed)) {
      failures.push({ slug, url, reason: `Host is NOT in official-domains.json` });
      continue;
    }

    // 3. Live HTTP check with caching
    let checkResult = urlCache.get(url);
    if (!checkResult) {
      checkResult = await checkUrl(url);
      urlCache.set(url, checkResult);
    }

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

  // Generate verified proposal (NOTE: checked_at is intentionally omitted so stale facts are not marked verified without fact auditing)
  const proposal = {
    agent: 'content-editor',
    notes: `C2 Batch 1: Primary statutory and institutional sources for ${verified.length} verified study abroad guides with 100% live HTTP 200 checks (strictly existing allowlisted domains)`,
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
