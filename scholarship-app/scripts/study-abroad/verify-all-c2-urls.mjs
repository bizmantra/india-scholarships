import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostAllowed } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const dbPath = resolve(root, 'data', 'scholarships.db');
const allowedPath = resolve(root, 'data', 'study-abroad', 'official-domains.json');

const allowed = JSON.parse(readFileSync(allowedPath, 'utf8')).domains;
const dbGuides = JSON.parse(execSync(`sqlite3 -json "${dbPath}" "SELECT slug, country, title FROM sa_guides ORDER BY country, slug;"`).toString());
const guideSlugs = new Set(dbGuides.map(g => g.slug));

// Candidate statutory & institutional mappings (strictly using existing official domains in main)
const candidateMappings = {
  // --- GERMANY STATUTORY & INSTITUTIONAL GUIDES ---
  'germany-national-student-visa': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-residence-permit-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-job-seeker-visa-strategy': 'https://www.gesetze-im-internet.de/aufenthg_2004/__20.html',
  'germany-blue-card-pr-pathway': 'https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html',
  'germany-part-time-work-rules': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-securing-werkstudent-jobs': 'https://www.gesetze-im-internet.de/sgb_5/__6.html',
  'germany-routes-hub-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-visa-routes-hub-guide': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-vfs-appointment-hacks': 'https://india.diplo.de/in-en/service/2546328-2546328',
  'germany-vfs-document-checklist': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-visa-interview-prep': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-student-visa-interview-questions': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-rejection-analysis-appeal': 'https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202',
  'germany-blocked-account-manual': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-blocked-account-calc-spec': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-health-insurance-guide': 'https://www.tk.de/resource/blob/2098336/8daddb6343be1fb6f8cc46b4313a21e3/beitraege-der-tk--englisch-data.pdf',
  'germany-aps-certificate-guide': 'https://aps-india.de/aps-process/',
  'aps-india-certificate-verification-step-by-step': 'https://aps-india.de/aps-process/',
  'germany-uni-assist-manual': 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/',
  'germany-uni-assist-portal-walkthrough': 'https://www.uni-assist.de/en/faqs/apply-online/',
  'germany-fsp-studienkolleg-guide': 'https://www.uni-assist.de/en/tools/glossary-of-terms/description/term/studienkolleg-preparatory-course/',
  'germany-bavarian-calculator-spec': 'https://www.tum.de/en/studies/application/application-info-portal/grade-conversion-formula-for-grades-earned-outside-germany',
  'germany-winter-vs-summer-intakes': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-offer-acceptance-payment': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-ms-cs-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-ms-data-science-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-master-program-listing-guide': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-public-vs-private': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-destination-overview': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-total-cost-breakdown': 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',
  'germany-daad-scholarships-guide': 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  'germany-daad-scholarship-master-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-scholarship-panel-interview-guide': 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  'germany-scholarship-directory-hub-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-initial-72hr-survival-guide': 'https://www.daad.de/en/studying-in-germany/living-in-germany/',
  'germany-financial-emergency-plan': 'https://www.tum.de/en/studies/fees-and-financial-aid/scholarships/tum-scholarships',
  'germany-tum-munich-portal-manual': 'https://www.tum.de/en/studies/application/master/application-master',
  'germany-tum-efv-entrance-exam-guide': 'https://www.tum.de/en/studies/application/application-info-portal/admission-requirements',
  'germany-rwth-aachen-portal-manual': 'https://www.informatik.rwth-aachen.de/cms/~mxz/informatik/lidx/1/',
  'germany-gre-gmat-germany-guide': 'https://www.informatik.rwth-aachen.de/cms/~mxz/informatik/lidx/1/',

  // --- USA STATUTORY & INSTITUTIONAL GUIDES ---
  'us-f1-student-visa-application-checklist': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-f1-student-visa-master-guide': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-ds160-form-filing-manual': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'us-consulate-slot-booking-hacks': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-f1-visa-interview-prep-questions': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-initial-72hr-survival-guide': 'https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states',
  'usa-i20-financial-proof-manual': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-i20-issuance-deposit-payment': 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20',
  'usa-i20-proof-of-funds-calc-spec': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-routes-hub-guide': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors',
  'usa-visa-routes-hub-guide': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors',
  'usa-on-campus-jobs-20hr-rule': 'https://www.ice.gov/sevis/employment',
  'usa-cpt-internship-rules': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-opt-stem-opt-extension': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-stem-opt-designated-ms-cs': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-stem-opt-timeline-calc-spec': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-h1b-lottery-cap-exempt': 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  'usa-green-card-eb2-niw-pathways': 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  'usa-ssn-application-guide': 'https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number',
  'usa-destination-overview': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-university-listing-hub-guide': 'https://studyinthestates.dhs.gov/school-search',
  'usa-master-program-listing-guide': 'https://studyinthestates.dhs.gov/school-search',
  'usa-total-cost-breakdown': 'https://www.purdue.edu/bursar/tuition/fee-rates/',
  'usa-public-vs-private-unis': 'https://www.purdue.edu/bursar/tuition/fee-rates/',
  'usa-master-university-profile-guide': 'https://www.purdue.edu/bursar/tuition/fee-rates/'
};

async function run() {
  console.log(`🔍 Verifying ${Object.keys(candidateMappings).length} mapped guides against DB, allowlist, and live HTTP...`);
  const failures = [];
  const verified = [];
  const urlStatusCache = new Map();

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

    // 3. Live HTTP check using curl with URL caching
    let status = urlStatusCache.get(url);
    if (!status) {
      try {
        let code = execSync(`curl -s -I -L -o /dev/null -w "%{http_code}" --max-time 15 "${url}"`, {
          encoding: 'utf8'
        }).trim();

        // If HEAD is rejected with 405 or 403 by bot-check, fallback to GET without body
        if (code === '405' || code === '403') {
          code = execSync(`curl -s -L -o /dev/null -w "%{http_code}" --max-time 15 -H "User-Agent: Mozilla/5.0" "${url}"`, {
            encoding: 'utf8'
          }).trim();
        }

        status = code;
      } catch (e) {
        status = `error: ${e.message}`;
      }
      urlStatusCache.set(url, status);
    }

    if (status !== '200') {
      failures.push({ slug, url, reason: `Live check status: ${status}` });
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

  // Generate verified proposal
  const proposal = {
    agent: 'content-editor',
    notes: `C2 Batch 1: Primary statutory and institutional sources for ${verified.length} verified study abroad guides with 100% live HTTP 200 checks (strictly existing allowlisted domains)`,
    changes: verified.map(v => ({
      table: 'sa_guides',
      key: v.slug,
      source: v.url,
      fields: {
        official_source: v.url,
        checked_at: '2026-11-02'
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
