import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const dbPath = resolve(root, 'data', 'scholarships.db');

const deSources = {
  'germany-national-student-visa': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-residence-permit-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-job-seeker-visa-strategy': 'https://www.gesetze-im-internet.de/aufenthg_2004/__20.html',
  'germany-blue-card-pr-pathway': 'https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html',
  'germany-vfs-appointment-hacks': 'https://india.diplo.de/in-en/service/2546328-2546328',
  'germany-vfs-document-checklist': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-visa-interview-prep': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-student-visa-interview-questions': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-routes-hub-guide': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-visa-routes-hub-guide': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-rejection-analysis-appeal': 'https://india.diplo.de/in-en/abolition-of-remonstration-procedure-2727202',
  'germany-part-time-work-rules': 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
  'germany-securing-werkstudent-jobs': 'https://www.gesetze-im-internet.de/sgb_5/__6.html',
  'germany-blocked-account-manual': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-blocked-account-calc-spec': 'https://www.auswaertiges-amt.de/en/sperrkonto/388600',
  'expatrio-vs-fintiba-vs-coracle': 'https://india.diplo.de/in-en/service/2756350-2756350',
  'germany-health-insurance-guide': 'https://www.tk.de/resource/blob/2098336/8daddb6343be1fb6f8cc46b4313a21e3/beitraege-der-tk--englisch-data.pdf',
  'germany-aps-certificate-guide': 'https://aps-india.de/wp-content/uploads/2026/06/Leaflet_BA_Graduates_English_dMAT_June2026.pdf',
  'aps-india-certificate-verification-step-by-step': 'https://aps-india.de/aps-process/',
  'germany-uni-assist-manual': 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/',
  'germany-uni-assist-portal-walkthrough': 'https://www.uni-assist.de/en/faqs/apply-online/',
  'germany-3yr-bachelor-acceptance': 'https://anabin.kmk.org/db/institutionen',
  'germany-fsp-studienkolleg-guide': 'https://www.uni-assist.de/en/tools/glossary-of-terms/description/term/studienkolleg-preparatory-course/',
  'germany-testas-exam-guide': 'https://www.testas.de/en/teilnehmende/the-digital-testas/the-digital-testas',
  'germany-german-language-exams-guide': 'https://www.testdaf.de/de/teilnehmende/der-digitale-testdaf-ueberblick/',
  'germany-german-language-levels': 'https://www.goethe.de/ins/in/en/spr/prf.html',
  'germany-english-language-tests': 'https://www.tum.de/en/studies/application/application-info-portal/admission-requirements/language-certificates',
  'germany-tum-munich-portal-manual': 'https://www.tum.de/en/studies/application/master/application-master',
  'germany-tum-efv-entrance-exam-guide': 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/',
  'germany-rwth-aachen-portal-manual': 'https://www.rwth-aachen.de/redir/?id=bkjh&lidx=1',
  'germany-bavarian-calculator-spec': 'https://www.tum.de/en/studies/application/application-info-portal/grade-conversion-formula-for-grades-earned-outside-germany',
  'germany-bavarian-grade-matrix': 'https://www.kmk.org/kultusministerkonferenz/uebergreifende-themen/anerkennung-auslaendischer-abschluesse.html',
  'germany-ects-credit-mapping': 'https://education.ec.europa.eu/education-levels/higher-education/inclusive-and-connected-higher-education/european-credit-transfer-and-accumulation-system',
  'germany-ects-evaluator-spec': 'https://education.ec.europa.eu/education-levels/higher-education/inclusive-and-connected-higher-education/european-credit-transfer-and-accumulation-system',
  'germany-winter-vs-summer-intakes': 'https://www.daad.de/en/studying-in-germany/requirements/application-process/',
  'germany-offer-acceptance-payment': 'https://www.daad.de/en/studying-in-germany/requirements/enrolling/',
  'germany-multiple-offers-decision-matrix': 'https://www.hochschulkompass.de/en/study-in-germany.html',
  'germany-sop-europass-cv-guide': 'https://europass.europa.eu/en/create-europass-cv',
  'germany-gre-gmat-germany-guide': 'https://www.rwth-aachen.de/redir/?id=bkjh&lidx=1',
  'germany-gre-gmat-waiver-directory': 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/',
  'germany-top-public-unis-profiles': 'https://www.hochschulkompass.de/en/higher-education-institutions.html',
  'germany-ms-cs-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-ms-data-science-directory': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-engineering-directory': 'https://www.tu9.de/en/',
  'germany-public-vs-private': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-destination-overview': 'https://www.daad.de/en/studying-in-germany/universities/',
  'germany-daad-scholarships-guide': 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  'germany-daad-scholarship-master-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-scholarship-panel-interview-guide': 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  'germany-scholarship-directory-hub-guide': 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
  'germany-university-listing-hub-guide': 'https://www.hochschulkompass.de/en/higher-education-institutions.html',
  'germany-master-university-profile-guide': 'https://www.hochschulkompass.de/en/higher-education-institutions.html',
  'germany-master-program-listing-guide': 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/',
  'germany-anmeldung-tax-id': 'https://service.berlin.de/dienstleistung/120686/',
  'germany-initial-72hr-survival-guide': 'https://www.zoll.de/EN/Private-individuals/Travel/Entering-Germany/entering_germany_node.html',
  'germany-rbi-lrs-tcs-tax-rules': 'https://www.rbi.org.in/Scripts/FAQView.aspx?Id=115',
  'germany-total-cost-breakdown': 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',
  'germany-education-loans-germany': 'https://sbi.bank.in/web/personal-banking/loans/education-loans/global-ed-vantage-scheme',
  'germany-financial-emergency-plan': 'https://www.tum.de/en/studies/fees-and-financial-aid/scholarships/tum-scholarships'
};

const usSources = {
  'us-f1-student-visa-application-checklist': 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
  'usa-f1-student-visa-master-guide': 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
  'usa-ds160-form-filing-manual': 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/ds-160-frequently-asked-questions.html',
  'us-consulate-slot-booking-hacks': 'https://in.usembassy.gov/visas/nonimmigrant-visas/',
  'usa-f1-visa-interview-prep-questions': 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html',
  'usa-initial-72hr-survival-guide': 'https://studyinthestates.dhs.gov/students/travel/getting-to-the-united-states',
  'usa-i20-financial-proof-manual': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-i20-issuance-deposit-payment': 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20',
  'usa-i20-proof-of-funds-calc-spec': 'https://studyinthestates.dhs.gov/students/prepare/financial-ability',
  'usa-routes-hub-guide': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors',
  'usa-visa-routes-hub-guide': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors',
  'usa-on-campus-jobs-20hr-rule': 'https://www.ice.gov/sevis/employment',
  'usa-cpt-internship-rules': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-opt-stem-opt-extension': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-stem-opt-designated-ms-cs': 'https://www.ice.gov/sevis/stem-list',
  'usa-stem-opt-timeline-calc-spec': 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  'usa-fall-vs-spring-intakes': 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
  'usa-h1b-lottery-cap-exempt': 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  'usa-green-card-eb2-niw-pathways': 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  'usa-gre-quant-170-strategy': 'https://www.ets.org/gre/test-takers/general-test/about.html',
  'usa-gre-verbal-awa-prep-guide': 'https://www.ets.org/gre/test-takers/general-test/about.html',
  'usa-gre-gmat-waiver-directory': 'https://cgsnet.org/resources/for-deans/best-practices/',
  'usa-toefl-ielts-preparation-guide': 'https://ielts.org/take-a-test/which-test-to-take/ielts-academic',
  'usa-toefl-ielts-duolingo-cutoffs': 'https://www.ets.org/toefl/test-takers/ibt/about.html',
  'usa-duolingo-det-preparation-guide': 'https://englishtest.duolingo.com/scores',
  'usa-gradcas-commonapp-portals': 'https://liaisonedu.com/centralized-application-services/gradcas/',
  'usa-wes-credential-evaluation-manual': 'https://www.wes.org/credential-evaluation-requirements/',
  'usa-wes-gpa-40-conversion': 'https://www.wes.org/evaluations-and-fees/other/',
  'usa-gpa-conversion-matrix': 'https://www.wes.org/evaluations-and-fees/other/',
  'usa-wes-gpa-calculator-spec': 'https://www.wes.org/calculator/',
  'usa-3yr-bachelor-acceptance': 'https://www.wes.org/evaluations-and-fees/other/',
  'usa-sop-lor-resume-us-standards': 'https://educationusa.state.gov/your-5-steps-us-study/apply-your-admission',
  'usa-priority-vs-rolling-deadlines': 'https://cgsnet.org/resources/for-deans/april-15-resolution/',
  'usa-multiple-offers-decision-matrix': 'https://cgsnet.org/resources/for-deans/april-15-resolution/',
  'usa-rejection-analysis-appeal': 'https://cgsnet.org/resources/for-deans/best-practices/',
  'usa-prerequisites-deficiency-courses': 'https://studyinthestates.dhs.gov/students/prepare/conditional-admission',
  'usa-work-experience-research-paper-points': 'https://cgsnet.org/resources/for-deans/best-practices/',
  'usa-ssn-application-guide': 'https://studyinthestates.dhs.gov/students/work/obtaining-a-social-security-number',
  'usa-health-insurance-waiver-guide': 'https://travel.state.gov/content/travel/en/vccs/j-exchange-visitor-program.html',
  'usa-off-campus-housing-lease': 'https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview',
  'usa-total-cost-breakdown': 'https://nces.ed.gov/ipeds/',
  'us-education-loans-guide': 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11959',
  'prodigy-vs-mpower-vs-sbi-loan-usa': 'https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx?id=10158',
  'collateral-free-loan-approved-universities': 'https://sbi.bank.in/web/personal-banking/loans/education-loans/global-ed-vantage-scheme',
  'section-80e-tax-deduction-worked-example': 'https://incometaxindia.gov.in/pages/acts/income-tax-act.aspx',
  'usa-fulbright-scholarship-master-guide': 'https://www.usief.org.in/Fulbright-Nehru-Master-Fellowships.aspx',
  'usa-fulbright-interview-prep': 'https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx',
  'usa-fulbright-tata-scholarships': 'https://www.jntataendowment.org/loan-scholarship-program/',
  'usa-assistantships-ta-ra-ga': 'https://www.irs.gov/publications/p970',
  'usa-assistantship-interview-guide': 'https://cgsnet.org/resources/for-deans/april-15-resolution/',
  'usa-scholarship-directory-hub-guide': 'https://educationusa.state.gov/find-financial-aid',
  'usa-destination-overview': 'https://studyinthestates.dhs.gov/guide-to-studying-in-the-states',
  'usa-public-vs-private-unis': 'https://nces.ed.gov/ipeds/',
  'usa-top-us-public-r1-unis': 'https://carnegieclassifications.acenet.edu/',
  'usa-ms-data-science-business-analytics': 'https://www.ice.gov/sevis/stem-list',
  'usa-ms-engineering-management-miso': 'https://www.ice.gov/sevis/stem-list',
  'usa-university-listing-hub-guide': 'https://studyinthestates.dhs.gov/school-search',
  'usa-master-university-profile-guide': 'https://nces.ed.gov/ipeds/',
  'usa-master-program-listing-guide': 'https://studyinthestates.dhs.gov/school-search'
};

const rawGuides = JSON.parse(execSync(`sqlite3 -json "${dbPath}" "SELECT slug, country, official_source, checked_at FROM sa_guides ORDER BY country, slug;"`).toString());

const changes = [];
let deUpdated = 0;
let usUpdated = 0;

for (const g of rawGuides) {
  const isDe = g.country === 'germany';
  const mapping = isDe ? deSources[g.slug] : usSources[g.slug];
  if (!mapping) {
    console.warn(`⚠️ No mapping found for ${g.country} guide: ${g.slug}`);
    continue;
  }

  changes.push({
    table: 'sa_guides',
    key: g.slug,
    source: mapping,
    fields: {
      official_source: mapping,
      checked_at: '2026-11-01'
    }
  });

  if (isDe) deUpdated++;
  else usUpdated++;
}

console.log(`Generated changes for ${deUpdated} Germany guides and ${usUpdated} USA guides (total: ${changes.length})`);

const proposal = {
  agent: 'content-editor',
  notes: 'C2 Second Pass: Comprehensive statutory and institutional source mapping for 59 Germany guides and 59 USA guides',
  changes
};

const proposalPath = resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json');
writeFileSync(proposalPath, JSON.stringify(proposal, null, 2), 'utf8');
console.log(`✅ Wrote ${proposalPath}`);
