/**
 * Propose three South Korea scholarships (Global Korea Scholarship for graduate degrees, KAIST Global Presidential
 * Scholarship, SNU Global Scholarship) to the production Inbox as kind 'new_scholarship', the same row shape
 * lib/agent-inbox.js proposeNewScholarship writes. Nothing is published until the owner approves each card.
 *
 *   node scripts/study-abroad/proposals/south-korea-new-scholarships-2026-11-28.cjs [--go] [--target=production|staging]
 *
 * Without --go it only prints what it would write. It still opens a database connection to check for duplicates.
 * DRAFT: not run against any database, and it must not be run until the owner approves. Amounts in Korean won go in
 * amount_description (the site stores rupees), as the UK, Australia and Canada files do.
 * Every fact is in plans/south-korea-research/kr-batch2-notes.md, section 5, with the exact quote and date.
 */
const { resolveTarget, connect, describe } = require('../../lib/turso-target');

const AGENT = 'content-editor';
const CONFIRMED = '2026-11-28';

const common = {
    state: 'All India',
    level: 'Postgraduate',
    caste: 'All',
    gender: 'All',
    app_type: 'Online',
    income_limit: null,
    min_marks: null,
    amount_annual: null,
    amount_min: null,
    helpline: null,
    always_open: 0,
    deadline: null,
    scholarship_scope: 'International',
    country_of_study: 'South Korea',
};

const GKS_URL = 'https://www.studyinkorea.go.kr/en/plan/scholarship.do';
const GKS_EMB_URL = 'https://overseas.mofa.go.kr/in-en/brd/m_22090/view.do?seq=761565';
const KGPS_URL = 'https://admission.kaist.ac.kr/intl-graduate/FinancialSupport/Scholarship/KAISTScholarship';
const KAIST_GUIDE_URL = 'https://www.studyinkorea.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000483722&fileSn=1';
const SNU_URL = 'https://gsis.snu.ac.kr/financial-aid/';

const gks = {
    ...common,
    provider_type: 'Government',
    id: 'global-korea-scholarship-graduate-degrees-embassy-track',
    slug: 'global-korea-scholarship-graduate-degrees-embassy-track',
    title: 'Global Korea Scholarship (GKS) for Graduate Degrees, Embassy Track',
    provider: 'Government of the Republic of Korea, National Institute for International Education (NIIED)',
    course_stream: 'Master\'s and doctoral degrees at GKS universities in Korea, after one year of Korean language training',
    amount_description: 'Airfare, Korean language training fees, tuition and a monthly allowance. Study in Korea does not give the allowance amount on the page.',
    benefits: 'Airfare, Korean language training fees, tuition and monthly allowances. The programme lasts 1 year of Korean language training plus 2 years for a master\'s degree or 3 years for a doctoral degree.',
    age_limit: 'Under 40 years of age',
    residency_requirement: 'The applicant and both parents must hold non-Korean citizenship. Indian applicants apply through the Korean Embassy in India (embassy track).',
    docs_needed: ['Online application on the Study in Korea website', 'Documents listed in the yearly GKS-G application guidelines'],
    application_mode: 'Online',
    apply_url: GKS_URL,
    deadline_description: 'The 2026 call closed on 25 February 2026. Study in Korea lists the application period as February. The 2027 dates are not published yet, so check the Embassy and Study in Korea pages in January.',
    step_guide: '1. Read the yearly GKS-G application guidelines on the Study in Korea site and the Embassy of Korea in India news page.\n2. Create an account on Study in Korea and apply online before the Embassy deadline. The 2026 deadline was 25 February 2026. Offline applications were not accepted.\n3. The Embassy and NIIED review applications. Selected candidates are contacted individually.',
    selection: 'Study in Korea lists an average grade of at least 80% in your latest degree, an age under 40 and a bachelor\'s or master\'s degree. The Embassy and NIIED run the selection.',
    renewal: 'The official page does not say how renewal works.',
    official_source: GKS_URL,
    intro_seo: 'The Global Korea Scholarship pays airfare, Korean language training, tuition and a monthly allowance for graduate degrees in Korea. Indian applicants apply through the Korean Embassy.',
    faq_json: [
        { question: 'What does the Global Korea Scholarship cover?', answer: 'Study in Korea lists airfare, Korean language training fees, tuition and monthly allowances. The amount of the allowance is not on the page.' },
        { question: 'Who can apply for the GKS graduate scholarship?', answer: 'The applicant and both parents must hold non-Korean citizenship. Study in Korea also lists an age under 40, a bachelor\'s or master\'s degree, and an average grade of at least 80%.' },
        { question: 'When is the GKS graduate deadline?', answer: 'The 2026 call closed on 25 February 2026. Study in Korea lists February as the application period. The 2027 dates are not published yet.' },
        { question: 'How do Indian students apply for the GKS?', answer: 'Through the embassy track. The Embassy of Korea in India posts the guidelines and the deadline. You apply online on the Study in Korea website.' },
    ],
    keywords: ['Global Korea Scholarship India', 'GKS graduate scholarship for Indian students', 'Korea master\'s scholarship India', 'GKS embassy track India'],
    tags: ['international', 'south-korea', 'postgraduate', 'government', 'merit'],
    scholarship_type: 'Government',
    source_pages: JSON.stringify([
        { url: GKS_URL, facts: ['amount_description', 'benefits', 'age_limit', 'residency_requirement', 'selection', 'deadline_description'], confirmed: CONFIRMED },
        { url: GKS_EMB_URL, facts: ['deadline_description', 'step_guide'], confirmed: CONFIRMED },
    ]),
};

const kgps = {
    ...common,
    provider_type: 'Private',
    id: 'kaist-global-presidential-scholarship',
    slug: 'kaist-global-presidential-scholarship',
    title: 'KAIST Global Presidential Scholarship (KGPS)',
    provider: 'KAIST (Korea Advanced Institute of Science and Technology)',
    course_stream: 'Master\'s and Master\'s-Ph.D. integrated programmes at KAIST, all departments except the GDI-GTIP track',
    amount_description: 'Full tuition and KRW 1,000,000 a month for 4 regular semesters.',
    benefits: 'Full tuition coverage and a monthly stipend of KRW 1,000,000 for 4 regular semesters.',
    age_limit: null,
    residency_requirement: 'International applicants to KAIST. Korean citizens, including dual citizens, cannot use the international admission route.',
    docs_needed: ['Application to KAIST international graduate admission with the KAIST Scholarship chosen as the financial resource'],
    application_mode: 'Online',
    apply_url: KGPS_URL,
    deadline_description: 'No separate application. The deadline is the KAIST admission deadline: 7 January to 5 February 2027 for Fall 2027.',
    step_guide: '1. Apply to a KAIST master\'s programme between 7 January and 5 February 2027 for Fall 2027.\n2. Choose the KAIST Scholarship as your financial resource on the form.\n3. KAIST considers you for the KGPS automatically. The department head recommends only highly competitive applicants.',
    selection: 'KAIST says only highly competitive applicants are recommended by the department head. Decisions on admission and scholarships are made independently.',
    renewal: 'The official page does not say whether the award renews. It covers 4 regular semesters.',
    official_source: KGPS_URL,
    intro_seo: 'The KAIST Global Presidential Scholarship gives full tuition and KRW 1,000,000 a month for 4 semesters to master\'s students. You do not apply separately.',
    faq_json: [
        { question: 'How much is the KAIST Global Presidential Scholarship?', answer: 'Full tuition and a monthly stipend of KRW 1,000,000 for 4 regular semesters.' },
        { question: 'Do I apply separately for the KGPS?', answer: 'No. Choose the KAIST Scholarship on your application and KAIST considers you automatically. The department head recommends only highly competitive applicants.' },
        { question: 'Who is eligible for the KGPS?', answer: 'International applicants to KAIST master\'s and master\'s-Ph.D. integrated programmes who choose the KAIST Scholarship.' },
    ],
    keywords: ['KAIST scholarship for Indian students', 'KGPS KAIST', 'KAIST Global Presidential Scholarship', 'Korea master\'s scholarship India'],
    tags: ['international', 'south-korea', 'postgraduate', 'university', 'merit'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: KGPS_URL, facts: ['amount_description', 'benefits', 'step_guide', 'selection'], confirmed: CONFIRMED },
        { url: KAIST_GUIDE_URL, facts: ['deadline_description', 'selection'], confirmed: CONFIRMED },
    ]),
};

const snu = {
    ...common,
    provider_type: 'Private',
    id: 'snu-global-scholarship',
    slug: 'snu-global-scholarship',
    title: 'SNU Global Scholarship (GS), Seoul National University',
    provider: 'Seoul National University',
    course_stream: 'International students at Seoul National University, including the Graduate School of International Studies',
    amount_description: 'Entire exemption of tuition for 1 or 2 semesters.',
    benefits: 'Entire exemption of tuition for 1 or 2 semesters. SNU says it is only for international students.',
    age_limit: null,
    residency_requirement: 'International students only. The page does not list countries.',
    docs_needed: ['Application for an SNU tuition fee scholarship through GSIS'],
    application_mode: 'Online',
    apply_url: SNU_URL,
    deadline_description: 'The GSIS page gives no deadline for this scholarship. Ask the GSIS administration office.',
    step_guide: '1. Apply to a GSIS master\'s programme.\n2. Apply for the SNU tuition fee scholarship as the GSIS instructions say. GSIS treats it as an application for its own scholarships too.\n3. Contact GSIS (gsisadmin@snu.ac.kr) for the date and form.',
    selection: 'The GSIS page gives no selection rule for the Global Scholarship.',
    renewal: 'The award covers 1 or 2 semesters. The official page does not say more.',
    official_source: SNU_URL,
    intro_seo: 'The SNU Global Scholarship exempts all tuition for 1 or 2 semesters for international students at Seoul National University.',
    faq_json: [
        { question: 'What does the SNU Global Scholarship cover?', answer: 'An entire exemption of tuition for 1 or 2 semesters, for international students only.' },
        { question: 'How do I apply for the SNU Global Scholarship?', answer: 'GSIS says an application for an SNU tuition fee scholarship is also treated as an application for GSIS scholarships. The page gives no date, so ask the GSIS office.' },
    ],
    keywords: ['SNU Global Scholarship', 'Seoul National University scholarship for Indian students', 'Korea master\'s scholarship India'],
    tags: ['international', 'south-korea', 'postgraduate', 'university'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: SNU_URL, facts: ['amount_description', 'benefits', 'step_guide'], confirmed: CONFIRMED },
    ]),
};

// verdict / source / quote / officialSource are what the Inbox card reads (EvidenceLine in app/admin/agents/Cards.tsx)
const items = [
    { record: gks, source: GKS_URL, quote: 'Airfare, Korean language training fees, tuition, and monthly allowances', evidence: ['Study in Korea GKS page (read 2026-11-28): "Nationality: The applicant and both parents must hold non-Korean citizenship." "Age: Must be under 40 years of age." "GPA: Must have an average GPA of at least 80% from the most recent academic program." "Application Period : February"', 'Embassy of Korea in India notice, 2026-02-03 (read 2026-11-28): "submit their applications online before deadline: 25th Feb 2026 (offline submission is NOT accepted)"'], gaps: ['Monthly allowance amount is not on the page', '2027 deadline not published', 'The GKS-G guidelines file was not read'] },
    { record: kgps, source: KGPS_URL, quote: 'Full tuition coverage and a monthly stipend of 1,000,000 KRW for 4 regular semesters', evidence: ['KAIST Scholarship page (read 2026-11-28): "No separate application is necessary, but only highly competitive applicants will be recommended by the department head."', 'KAIST Fall 2027 guide (read 2026-11-28): "Decisions on admission and scholarships are made independently."'], gaps: ['Spring 2027 dates not checked', 'Renewal rules not on the page'] },
    { record: snu, source: SNU_URL, quote: 'Global Scholarship(GS) : Only for international students. Entire exemption of tuition for 1 or 2 semesters.', evidence: ['SNU GSIS financial aid page (read 2026-11-28): "Application for SNU tuition fee scholarship is also considered as application for other GSIS scholarships."'], gaps: ['No deadline, selection rule or country list on the page'] },
];

(async () => {
    const go = process.argv.includes('--go');
    const target = resolveTarget();
    const { client, url } = connect(target);
    console.log(`Database: ${describe(url)} (${target})${go ? '' : '  [dry run]'}`);
    for (const { record, source, quote, evidence, gaps } of items) {
        const evidenceJson = JSON.stringify({ confidence: 'High', verdict: 'verified', source, quote, officialSource: true, tier: 'official', specificSource: true, evidence, gaps });
        const known = await client.execute({
            sql: `SELECT 1 AS hit FROM scholarships WHERE id = ? OR slug = ?
                  UNION ALL SELECT 1 FROM agent_proposals WHERE kind = 'new_scholarship' AND scholarship_id = ? AND status IN ('pending','approved','published','rejected')`,
            args: [record.id, record.slug, record.slug],
        });
        if (known.rows.length) { console.log(`- ${record.title}: already exists or already proposed, skipped`); continue; }
        console.log(`- ${record.title}: ${go ? 'proposing' : 'would propose'} (${Object.keys(record).length} fields, gaps: ${gaps.join('; ')})`);
        if (!go) continue;
        await client.execute({
            sql: `INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, payload_json, category, risk, source_citation, evidence_json)
                  VALUES (?, 'new_scholarship', ?, ?, ?, 'new_scholarship', 'normal', ?, ?)`,
            args: [AGENT, record.slug, record.title, JSON.stringify(record), source, evidenceJson],
        });
    }
})().catch(e => { console.error(String(e.message).slice(0, 300)); process.exit(1); });
