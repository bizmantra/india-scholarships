/**
 * Propose three Canada scholarships (UBC Master of Data Science International Scholarship, SFU Big Data entrance
 * scholarships, Ontario Graduate Scholarship at the University of Toronto) to the production Inbox as kind
 * 'new_scholarship', the same row shape lib/agent-inbox.js proposeNewScholarship writes. Nothing is published until the
 * owner approves each card.
 *
 *   node scripts/study-abroad/proposals/canada-new-scholarships-2026-11-28.cjs [--go] [--target=production|staging]
 *
 * Without --go it only prints what it would write. DRAFT: not run against any database. Amounts in Canadian dollars go
 * in amount_description (the site stores rupees), as the UK and Australia files do.
 * Every fact is in plans/canada-research/ca-batch2-notes.md, section 7, with the exact quote and date.
 */
const { resolveTarget, connect, describe } = require('../../lib/turso-target');

const AGENT = 'content-editor';
const CONFIRMED = '2026-11-28';

const common = {
    provider_type: 'Private',
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
    country_of_study: 'Canada',
};

const UBC_URL = 'https://masterdatascience.ubc.ca/admissions/tuition-and-financial-aid';
const SFU_URL = 'https://www.sfu.ca/fas/study/future-graduates/programs/master-big-data.html';
const OGS_URL = 'https://www.sgs.utoronto.ca/awards/ontario-graduate-scholarship/';

const ubc = {
    ...common,
    id: 'ubc-master-of-data-science-international-scholarship',
    slug: 'ubc-master-of-data-science-international-scholarship',
    title: 'Master of Data Science International Scholarship (UBC)',
    provider: 'University of British Columbia, Master of Data Science',
    course_stream: 'Master of Data Science, Vancouver, Okanagan and Computational Linguistics programmes at UBC',
    amount_description: 'Up to CAD 25,000. One award a year in each of the three Master of Data Science programmes.',
    benefits: 'An entrance scholarship of up to CAD 25,000. UBC offers it each year to one international student in each of the Vancouver, Okanagan and Computational Linguistics programmes.',
    age_limit: null,
    residency_requirement: 'International students. The official page does not list countries, so Indian citizens are not excluded on that page.',
    docs_needed: ['Application to the UBC Master of Data Science'],
    application_mode: 'Online',
    apply_url: UBC_URL,
    deadline_description: 'No separate application. All applicants are automatically considered for the scholarships they are eligible for. Scholarships are announced in the offer letter. Programme deadlines are on the programme page.',
    step_guide: '1. Apply to the UBC Master of Data Science programme.\n2. No scholarship form is needed. The admissions committee considers you automatically.\n3. UBC announces any scholarship in your offer letter.',
    selection: 'The award recognises a student with academic and leadership achievements in their undergraduate or graduate programme, field or industry. It is made on the recommendation of the Master of Data Science Admissions Committee, in consultation with the Faculty of Graduate and Postdoctoral Studies.',
    renewal: 'The official page does not say whether the award renews.',
    official_source: UBC_URL,
    intro_seo: 'UBC offers an entrance scholarship of up to CAD 25,000 to one international student a year in each Master of Data Science programme. No separate application is needed.',
    faq_json: [
        { question: 'How much is the UBC Master of Data Science International Scholarship?', answer: 'UBC says entrance scholarships of up to CAD 25,000 are offered each year to one international student in each of its three Master of Data Science programmes.' },
        { question: 'Do I apply separately for this UBC scholarship?', answer: 'No. UBC says all applicants are automatically considered for the scholarships they are eligible for. Awards are announced in the offer letter.' },
        { question: 'Who gets this UBC scholarship?', answer: 'A student with academic and leadership achievements in their undergraduate or graduate programme, field or industry, chosen by the admissions committee.' },
    ],
    keywords: ['UBC Master of Data Science scholarship', 'UBC scholarship for Indian students', 'Canada master\'s scholarship India', 'UBC MDS international scholarship'],
    tags: ['international', 'canada', 'postgraduate', 'university', 'merit'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: UBC_URL, facts: ['amount_description', 'selection', 'deadline_description'], confirmed: CONFIRMED },
    ]),
};

const sfu = {
    ...common,
    id: 'sfu-master-of-science-big-data-entrance-scholarships',
    slug: 'sfu-master-of-science-big-data-entrance-scholarships',
    title: 'Entrance Scholarships, Master of Science in Big Data (Simon Fraser University)',
    provider: 'Simon Fraser University',
    course_stream: 'Master of Science in Big Data at Simon Fraser University',
    amount_description: 'Up to CAD 15,000 each. SFU says multiple entrance scholarships are offered each year. The number is not stated.',
    benefits: 'Entrance scholarships of up to CAD 15,000 each. SFU says multiple awards are offered every year.',
    age_limit: null,
    residency_requirement: 'The official page does not list a country condition.',
    docs_needed: ['Application to the SFU Master of Science in Big Data'],
    application_mode: 'Online',
    apply_url: SFU_URL,
    deadline_description: 'No separate application is described. SFU says all successful applicants will be considered. The programme page says to apply by 19 January 2027 for Fall 2027.',
    step_guide: '1. Apply to the SFU Master of Science in Big Data by 19 January 2027 for Fall 2027.\n2. SFU says all successful applicants are considered for the entrance scholarships.\n3. Ask SFU how and when awards are announced, because the page does not say.',
    selection: 'Selection is based on academic and professional achievement.',
    renewal: 'The official page does not say whether the award renews.',
    official_source: SFU_URL,
    intro_seo: 'SFU offers multiple entrance scholarships of up to CAD 15,000 each to Master of Science in Big Data students. All successful applicants are considered.',
    faq_json: [
        { question: 'How much are the SFU Big Data entrance scholarships?', answer: 'SFU says multiple entrance scholarships of up to CAD 15,000 each are offered every year.' },
        { question: 'Do I apply separately for the SFU entrance scholarships?', answer: 'The page describes no separate form. It says all successful applicants will be considered.' },
        { question: 'How does SFU choose the winners?', answer: 'Selection is based on academic and professional achievement.' },
    ],
    keywords: ['SFU Big Data scholarship', 'Simon Fraser University scholarship for Indian students', 'Canada master\'s scholarship India'],
    tags: ['international', 'canada', 'postgraduate', 'university', 'merit'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: SFU_URL, facts: ['amount_description', 'selection', 'deadline_description'], confirmed: CONFIRMED },
    ]),
};

const ogs = {
    ...common,
    provider_type: 'Government',
    id: 'ontario-graduate-scholarship-university-of-toronto',
    slug: 'ontario-graduate-scholarship-university-of-toronto',
    title: 'Ontario Graduate Scholarship at the University of Toronto',
    provider: 'University of Toronto School of Graduate Studies',
    course_stream: 'Full-time master\'s and doctoral programmes of two or three terms at the University of Toronto',
    amount_description: 'CAD 5,000 per session. Awards run for two or three sessions, which is CAD 10,000 or CAD 15,000. International students get a set number of awards.',
    benefits: 'CAD 5,000 per session, so CAD 10,000 for two consecutive sessions or CAD 15,000 for three. The graduate unit pays one third of the total award.',
    age_limit: null,
    residency_requirement: 'International students who study or plan to study at U of T on a study permit are eligible for a set number of awards. The permit must be valid by the graduate unit\'s international application deadline, so many students arriving from India may not qualify yet.',
    docs_needed: ['Application through your graduate unit', 'Valid study permit by the unit\'s international deadline (international students)'],
    application_mode: 'Online',
    apply_url: OGS_URL,
    deadline_description: 'Each graduate unit sets its own student deadline. Ask your unit. Units forward only a limited number of international applications to the School of Graduate Studies.',
    step_guide: '1. Check that you will hold a valid study permit by your graduate unit\'s international OGS deadline.\n2. Apply through U of T\'s central online OGS application, following your unit\'s internal deadline.\n3. Your unit picks and forwards a limited number of international applications.\n4. The School of Graduate Studies decides in a central review.',
    selection: 'U of T asks for at least A- (or equal) in each of your last two completed years. A unit may make exceptions for highly meritorious applicants. Units may add their own conditions.',
    renewal: 'Each award is tenable for one year, which means two consecutive or three academic sessions. The unit sets the value and length in the offer letter.',
    official_source: OGS_URL,
    intro_seo: 'The Ontario Graduate Scholarship pays CAD 5,000 a session at the University of Toronto. International students on a study permit can win a set number of awards.',
    faq_json: [
        { question: 'How much is the Ontario Graduate Scholarship at U of T?', answer: 'CAD 5,000 per session. Awardees may get CAD 10,000 for two consecutive sessions or CAD 15,000 for three.' },
        { question: 'Can international students apply for the OGS?', answer: 'Yes. U of T says international students on a study permit are eligible for a set number of awards. The permit must be valid by the unit\'s international deadline.' },
        { question: 'What marks do I need for the OGS?', answer: 'At least A- (or equal) in each of your last two completed years. A unit may make exceptions for highly meritorious applicants.' },
    ],
    keywords: ['Ontario Graduate Scholarship', 'OGS University of Toronto international students', 'Canada master\'s scholarship India'],
    tags: ['international', 'canada', 'postgraduate', 'government', 'merit'],
    scholarship_type: 'Government',
    source_pages: JSON.stringify([
        { url: OGS_URL, facts: ['amount_description', 'residency_requirement', 'deadline_description', 'selection', 'renewal'], confirmed: CONFIRMED },
    ]),
};

// verdict / source / quote / officialSource are what the Inbox card reads (EvidenceLine in app/admin/agents/Cards.tsx)
const items = [
    { record: ubc, source: ubc.official_source, quote: 'Entrance scholarships of up to $25,000 CAD are offered annually to an international student in each of the Master of Data Science Vancouver, Okanagan and Computational Linguistics programs.', evidence: ['UBC Master of Data Science tuition and financial aid page (read 2026-11-28): "All applicants will automatically be considered for the scholarships they are eligible for, hence there is no separate application."'], gaps: ['no country list, so India eligibility is not stated either way', 'one award a year in each programme, so odds are low', 'no renewal terms on the page'] },
    { record: sfu, source: sfu.official_source, quote: 'Multiple entrance scholarships of up to $15,000 CAD each are offered annually.', evidence: ['SFU Master of Science in Big Data page (read 2026-11-28): "Selection is based on academic and professional achievement. All successful applicants will be considered."'], gaps: ['number of awards not stated', 'no country list, so India eligibility is not stated either way', 'no announcement date'] },
    { record: ogs, source: ogs.official_source, quote: 'International students who are studying or plan to study at the University of Toronto under a temporary resident visa (student study permit) are eligible for a set number of OGS awards', evidence: ['U of T School of Graduate Studies OGS page (read 2026-11-28): "The value of the OGS is $5,000 per session."', 'Same page: "Applicants holding a valid study permit by the graduate unit\u2019s OGS international application deadline are eligible to apply"'], gaps: ['number of international awards not stated', 'the permit must be valid by the unit deadline, which is hard for students applying from India', 'unit deadlines are not on the page', 'the page describes the 2027-2028 cycle'] },
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
