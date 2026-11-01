/**
 * One-off seed: country fact sheet for UK, Canada, Australia, Ireland (plan Step 0, E2).
 * https://www.gov.uk/... , canada.ca, homeaffairs.gov.au, irishimmigration.ie sourced, each with
 * official_source + checked_at as required by recovery rule 4. Safe to re-run (upsert by key).
 *
 * Usage: node scripts/study-abroad/seed-facts-e2.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { ensureStudyAbroadTables } = require('../lib/study-abroad-tables');

const APP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(APP_DIR, 'data', 'scholarships.db');
const CHECKED = '2026-09-28';

// [key, label, country, value, unit, official_source, notes]
const FACTS = [
    // --- UK ---
    ['uk.visa.application_fee_gbp', 'Student visa application fee', 'uk', '558', 'GBP',
        'https://www.gov.uk/student-visa/fees', null],
    ['uk.ihs.annual_gbp', 'Immigration Health Surcharge, per year', 'uk', '776', 'GBP per year',
        'https://www.gov.uk/healthcare-immigration-application/how-much-pay', null],
    ['uk.funds.monthly_outside_london_gbp', 'Maintenance funds required per month, outside London (up to 9 months)', 'uk', '1171', 'GBP per month',
        'https://www.gov.uk/student-visa/money', null],
    ['uk.funds.monthly_london_gbp', 'Maintenance funds required per month, in London (up to 9 months)', 'uk', '1529', 'GBP per month',
        'https://www.gov.uk/student-visa/money', null],
    ['uk.post_study_work.months', 'Graduate Route length after a bachelor’s/master’s degree', 'uk', '24', 'months',
        'https://www.gov.uk/graduate-visa', 'Drops to 18 months for applications made on or after 1 January 2027. PhD graduates get 36 months.'],
    ['uk.english.ielts_min', 'Minimum English level for a Student visa at degree level (CEFR)', 'uk', 'B2', 'CEFR',
        'https://www.gov.uk/student-visa/knowledge-of-english', 'Below-degree-level courses require B1. Universities may set a higher IELTS score for admission.'],
    ['uk.intake.months', 'Main intake months', 'uk', 'September, January', 'months',
        'https://www.gov.uk/student-visa', 'September/October is the main intake; January is the secondary intake for many one-year master’s.'],

    // --- Canada ---
    ['canada.visa.application_fee_cad', 'Study permit application fee', 'canada', '150', 'CAD',
        'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5269-applying-study-permit-outside-canada.html', 'Plus CAD 85 biometrics fee if required.'],
    ['canada.funds.annual_cad', 'Cost-of-living funds required for a single applicant, outside Quebec', 'canada', '22895', 'CAD',
        'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/updates/2025-students-financial-resources.html', 'In addition to first-year tuition and travel costs. IRCC updates this every September 1 against Statistics Canada’s low-income cut-off; effective since September 1, 2025.'],
    ['canada.pgwp.months_max', 'Post-Graduation Work Permit length for programs 2 years or longer', 'canada', '36', 'months',
        'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html', 'Shorter programs (8 months+) get a PGWP up to the program length; master’s programs of at least 8 months also qualify for 36 months since Feb 15, 2024.'],
    ['canada.english.ielts_min', 'Typical IELTS overall score used for PGWP-eligible program admission', 'canada', '6.0', 'IELTS band',
        'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html', 'IRCC does not set a fixed English score for the study permit itself — this is set by the institution/program; 6.0 is the common floor for degree programs.'],
    ['canada.intake.months', 'Main intake months', 'canada', 'September, January, May', 'months',
        'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html', 'September (Fall) is the largest intake; January and May/Summer are smaller intakes offered by many institutions.'],

    // --- Australia ---
    ['australia.visa.application_fee_aud', 'Subclass 500 Student visa application charge (main applicant)', 'australia', '2500', 'AUD',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'Effective for applications lodged on or after 1 July 2026, up from AUD 2,000. Concession rates apply for some ELICOS/ASEAN/Pacific applicants.'],
    ['australia.funds.annual_aud', 'Financial capacity requirement, 12 months living costs, single applicant', 'australia', '29710', 'AUD',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'On top of first-year course fees and travel; add AUD 10,394 for a partner and AUD 4,449 per dependent child.'],
    ['australia.insurance.annual_aud', 'OSHC (Overseas Student Health Cover), single student, indicative annual cost', 'australia', '700', 'AUD per year',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'OSHC is compulsory for the length of the student visa but is bought from a private insurer, so the price varies by provider (roughly AUD 600–800/year for a single student) and is not itself set by Home Affairs.'],
    ['australia.post_study_work.months_max', 'Temporary Graduate (subclass 485) visa length, bachelor/honours/coursework master’s', 'australia', '24', 'months',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485', 'Research master’s and PhD graduates get up to 36 months. The extra 2 years for skill-shortage-area graduates was discontinued in mid-2024.'],
    ['australia.english.ielts_min', 'Minimum IELTS overall score for direct entry to a Subclass 500 visa’s main course', 'australia', '6.0', 'IELTS band',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'Lower scores (5.0–5.5) are accepted with 10–20 weeks of ELICOS/foundation study first. Applies to applications from 23 March 2024 / updated test list from 7 August 2025.'],
    ['australia.intake.months', 'Main intake months', 'australia', 'February, July', 'months',
        'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'February/March is the main intake at most universities; July is the mid-year intake.'],

    // --- Ireland ---
    ['ireland.visa.application_fee_eur', 'Long-stay ‘D’ study visa fee, single journey', 'ireland', '60', 'EUR',
        'https://www.irishimmigration.ie/', 'Multi-journey visa is EUR 100. A separate Irish Residence Permit (IRP) registration fee of EUR 300 applies after arrival.'],
    ['ireland.funds.annual_eur', 'Funds required for courses longer than 8 months, first academic year', 'ireland', '10000', 'EUR',
        'https://www.irishimmigration.ie/', 'Courses of 8 months or less require EUR 833/month up to EUR 6,665. Applicants must also show at least EUR 6,000 already paid toward tuition. Funds must be in an accessible account, not fixed-term/locked savings.'],
    ['ireland.insurance.min_cover_eur', 'Minimum private medical insurance cover required (accident / disease)', 'ireland', '25000', 'EUR',
        'https://www.irishimmigration.ie/', 'EUR 25,000 for accident cover and EUR 25,000 for disease cover, held for the length of the course.'],
    ['ireland.post_study_work.months_max', 'Stamp 1G (Third Level Graduate Programme) length, master’s/doctoral (NFQ 9–10)', 'ireland', '24', 'months',
        'https://www.irishimmigration.ie/', 'Granted as an initial 12 months plus a 12-month renewal. Honours bachelor’s (NFQ 8) graduates get 12 months only.'],
    ['ireland.english.ielts_min', 'IELTS overall score used as the general non-EEA student visa baseline', 'ireland', '6.0', 'IELTS band',
        'https://www.irishimmigration.ie/', 'No individual band below 5.5. Irish Immigration does not publish a single fixed minimum — this reflects the standard used by ILEP-listed institutions; universities often require 6.0–6.5, higher for postgraduate.'],
    ['ireland.intake.months', 'Main intake months', 'ireland', 'September', 'months',
        'https://www.irishimmigration.ie/', 'September is the main intake for most one-year master’s and undergraduate programs; a smaller January intake exists for some courses.'],
];

const db = new Database(DB_PATH);
ensureStudyAbroadTables(db);
const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

const upsert = db.prepare(`
    INSERT INTO sa_facts (key, label, country, value, unit, official_source, checked_at, recheck_after, notes, updated_at)
    VALUES (@key, @label, @country, @value, @unit, @official_source, @checked_at, @recheck_after, @notes, @updated_at)
    ON CONFLICT(key) DO UPDATE SET
        label = excluded.label, country = excluded.country, value = excluded.value, unit = excluded.unit,
        official_source = excluded.official_source, checked_at = excluded.checked_at,
        recheck_after = excluded.recheck_after, notes = excluded.notes, updated_at = excluded.updated_at
`);

let inserted = 0, updated = 0;
const tx = db.transaction(() => {
    for (const [key, label, country, value, unit, official_source, notes] of FACTS) {
        const existed = db.prepare('SELECT 1 FROM sa_facts WHERE key = ?').get(key);
        upsert.run({ key, label, country, value, unit, official_source, checked_at: CHECKED, recheck_after: null, notes, updated_at: now });
        if (existed) updated++; else inserted++;
    }
});
tx();
console.log(`sa_facts seeded: ${inserted} inserted, ${updated} updated (of ${FACTS.length} total).`);
