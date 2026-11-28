/**
 * Propose three Australia scholarships (Melbourne International Graduate Scholarship, Melbourne International Excellence
 * Scholarship (Graduate), Australia Awards India) to the production Inbox as kind 'new_scholarship', the same row shape
 * lib/agent-inbox.js proposeNewScholarship writes. Nothing is published until the owner approves each card.
 *
 *   node scripts/study-abroad/proposals/australia-new-scholarships-2026-11-28.cjs [--go] [--target=production|staging]
 *
 * Without --go it only prints what it would write. DRAFT: not run against any database. Amounts that are percentages
 * or Australian dollars go in amount_description (the site stores rupees), as the UK file does.
 * Every fact is in plans/australia-research/au-batch2-notes.md, sections D and E, with the exact quote and date.
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
    country_of_study: 'Australia',
};

const MIGS_URL = 'https://scholarships.unimelb.edu.au/awards/melbourne-international-graduate-scholarship';
const MIES_URL = 'https://scholarships.unimelb.edu.au/awards/melbourne-international-excellence-scholarship-graduate';
const AAI_URL = 'https://australiaawardsindia.org/opportunities/';
const DFAT_URL = 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships';

const migs = {
    ...common,
    id: 'melbourne-international-graduate-scholarship',
    slug: 'melbourne-international-graduate-scholarship',
    title: 'Melbourne International Graduate Scholarship (University of Melbourne)',
    provider: 'University of Melbourne',
    course_stream: 'Master\'s degrees by coursework at the University of Melbourne (some professional doctorates are excluded)',
    amount_description: '20% off tuition fees for the whole course, for students starting in 2027 or later. At least 300 awards.',
    benefits: 'A 20% tuition fee remission for the length of your master\'s course. At least 300 awards are offered. It is not paid as cash.',
    age_limit: null,
    residency_requirement: 'Citizen of a country with a GDP per capita of US$10,000 or less, based on World Bank data. India is on the university\'s eligible country list.',
    docs_needed: ['Offer for an Overseas Fee place in a master\'s degree at Melbourne'],
    application_mode: 'Online',
    apply_url: MIGS_URL,
    deadline_description: 'No separate application and no scholarship deadline. You are considered when you apply for a course. The outcome comes within five working days of a course offer. Course application dates are on each course page.',
    step_guide: '1. Apply for a master\'s course by coursework at the University of Melbourne. Indian applicants who have studied at a university in India apply through an authorised education agent.\n2. Receive an offer for an Overseas Fee place.\n3. No scholarship form is needed. The university considers you automatically.\n4. Successful applicants hear within five working days of the course offer. Unsuccessful applicants are not told.',
    selection: 'The scholarship goes to the applicants ranked highest on their course entry score.',
    renewal: 'The award runs for the duration of the course. It can be deferred to the following academic year. It cannot be held with another scholarship or sponsorship that gives a fee discount.',
    official_source: MIGS_URL,
    intro_seo: 'The Melbourne International Graduate Scholarship takes 20% off master\'s tuition for citizens of eligible countries, including India. No separate application is needed.',
    faq_json: [
        { question: 'How much is the Melbourne International Graduate Scholarship?', answer: 'The official page says it is a 20% tuition fee remission for the duration of the course, with at least 300 awards, for students starting from 2027.' },
        { question: 'Is India eligible for the Melbourne International Graduate Scholarship?', answer: 'Yes. You must be a citizen of a country with GDP per capita of US$10,000 or less on the World Bank data the university uses. India is on the eligible countries list.' },
        { question: 'Do I need to apply separately for this Melbourne scholarship?', answer: 'No. You are automatically considered if you have applied for a course. Successful applicants hear within five working days of the course offer.' },
        { question: 'Can I hold this scholarship with another one?', answer: 'Not with another scholarship or sponsorship that gives a fee sponsorship or discount. The page says this in its conditions.' },
    ],
    keywords: ['Melbourne International Graduate Scholarship', 'University of Melbourne scholarship for Indian students', 'Australia master\'s scholarship India', 'Melbourne 20% tuition scholarship'],
    tags: ['international', 'australia', 'postgraduate', 'tuition', 'university'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: MIGS_URL, facts: ['amount_description', 'residency_requirement', 'deadline_description', 'selection', 'renewal'], confirmed: CONFIRMED },
        { url: 'https://scholarships.unimelb.edu.au/eligible-countries', facts: ['residency_requirement'], confirmed: CONFIRMED },
    ]),
};

const mies = {
    ...common,
    id: 'melbourne-international-excellence-scholarship-graduate',
    slug: 'melbourne-international-excellence-scholarship-graduate',
    title: 'Melbourne International Excellence Scholarship, Graduate (University of Melbourne)',
    provider: 'University of Melbourne',
    course_stream: 'Master\'s degrees by coursework at the University of Melbourne (some professional doctorates are excluded)',
    amount_description: '20% off tuition fees for the whole course, for students starting in 2027 or later. At least 180 awards.',
    benefits: 'A 20% tuition fee remission for the length of your master\'s course. At least 180 awards are offered. It is not paid as cash.',
    age_limit: null,
    residency_requirement: 'Open to international students. No country condition is listed on the official page.',
    docs_needed: ['Offer for an Overseas Fee place in a master\'s degree at Melbourne'],
    application_mode: 'Online',
    apply_url: MIES_URL,
    deadline_description: 'No separate application and no scholarship deadline. You are considered when you apply for a course. The outcome comes within five working days of a course offer. Course application dates are on each course page.',
    step_guide: '1. Apply for a master\'s course by coursework at the University of Melbourne. Indian applicants who have studied at a university in India apply through an authorised education agent.\n2. Receive an offer for an Overseas Fee place.\n3. No scholarship form is needed. The university considers you automatically.\n4. Successful applicants hear within five working days of the course offer. Unsuccessful applicants are not told.',
    selection: 'The scholarship goes to the applicants ranked highest on their course entry score.',
    renewal: 'The award runs for the duration of the course. It can be deferred to the following academic year. It cannot be held with another scholarship or sponsorship that gives a fee discount.',
    official_source: MIES_URL,
    intro_seo: 'The Melbourne International Excellence Scholarship takes 20% off master\'s tuition for high-achieving international students. No separate application is needed.',
    faq_json: [
        { question: 'How much is the Melbourne International Excellence Scholarship (Graduate)?', answer: 'The official page says it is a 20% tuition fee remission for the duration of the course, with at least 180 awards, for students starting from 2027.' },
        { question: 'Who can get the Melbourne International Excellence Scholarship?', answer: 'Any international student who has an offer for an Overseas Fee place in a master\'s degree. The award goes to those ranked highest on course entry score.' },
        { question: 'Do I apply separately for this scholarship?', answer: 'No. You are automatically considered if you have applied for a course.' },
    ],
    keywords: ['Melbourne International Excellence Scholarship', 'University of Melbourne master\'s scholarship international students', 'Australia master\'s scholarship India'],
    tags: ['international', 'australia', 'postgraduate', 'tuition', 'university'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: MIES_URL, facts: ['amount_description', 'residency_requirement', 'deadline_description', 'selection', 'renewal'], confirmed: CONFIRMED },
    ]),
};

const aai = {
    ...common,
    provider_type: 'Government',
    app_type: null,
    id: 'australia-awards-scholarships-india',
    slug: 'australia-awards-scholarships-india',
    title: 'Australia Awards Scholarships for India (Masters)',
    provider: 'Australian Government (Department of Foreign Affairs and Trade)',
    course_stream: 'Masters-level coursework at participating Australian institutions',
    amount_description: 'India\'s own amounts are not published while applications are closed. The Australian Government says Australia Awards Scholarships generally cover full tuition fees, return air travel, an establishment allowance, a contribution to living expenses and Overseas Student Health Cover.',
    benefits: 'For Australia Awards Scholarships in general, the Department of Foreign Affairs and Trade lists full tuition fees, a return economy airfare, a one-off establishment allowance, a fortnightly contribution to living expenses, an introductory academic program and Overseas Student Health Cover for the award holder. It says these benefits generally apply. The India page does not list its own.',
    age_limit: null,
    residency_requirement: 'Not published for India while applications are closed.',
    docs_needed: [],
    application_mode: null,
    apply_url: AAI_URL,
    deadline_description: 'Applications for India are closed at this time. No future dates are published. The India page says information about future opportunities will be published on that page.',
    step_guide: '1. Open the Australia Awards India opportunities page.\n2. Read the notice. Applications are closed at this time.\n3. Return to the page for future rounds.',
    selection: 'Not published for India while applications are closed.',
    renewal: 'Scholars must leave Australia for at least two years after completing the scholarship, the Department of Foreign Affairs and Trade says.',
    official_source: AAI_URL,
    intro_seo: 'Australia now has a masters-level Australia Awards Scholarship program for India. Applications are closed at this time, and future rounds will be posted on the India page.',
    faq_json: [
        { question: 'Is there an Australia Awards Scholarship for Indian students?', answer: 'Yes. The Australia Awards India page says the Australian Government has introduced a masters-level program for India. Applications are closed at this time.' },
        { question: 'When do Australia Awards applications open for India?', answer: 'No dates are published. The India page says information about future opportunities will be published on that page.' },
        { question: 'What does an Australia Awards Scholarship cover?', answer: 'The Department of Foreign Affairs and Trade lists full tuition fees, return airfare, an establishment allowance, a living-expense contribution and Overseas Student Health Cover. It says these generally apply, so the India terms may differ.' },
    ],
    keywords: ['Australia Awards India', 'Australia Awards Scholarship India masters', 'Australian government scholarship Indian students'],
    tags: ['international', 'australia', 'postgraduate', 'government', 'fully-funded'],
    scholarship_type: 'Government',
    source_pages: JSON.stringify([
        { url: AAI_URL, facts: ['deadline_description', 'intro_seo'], confirmed: CONFIRMED },
        { url: DFAT_URL, facts: ['benefits', 'renewal'], confirmed: CONFIRMED },
    ]),
};

// verdict / source / quote / officialSource are what the Inbox card reads (EvidenceLine in app/admin/agents/Cards.tsx)
const items = [
    { record: migs, source: migs.official_source, quote: 'The scholarship provides a 20 per cent tuition fee sponsorship for the duration of the course.', evidence: ['University of Melbourne scholarships site (read 2026-11-28): "20 per cent tuition fee sponsorship"; "Quantity: At least 300"; India is on the eligible countries page'], gaps: ['no scholarship deadline (automatic with a course application)', 'terms apply to students starting 2027 or later'] },
    { record: mies, source: mies.official_source, quote: 'The scholarship provides a 20 per cent tuition fee sponsorship for the duration of the course.', evidence: ['University of Melbourne scholarships site (read 2026-11-28): "20 per cent tuition fee sponsorship"; "Quantity: At least 180"'], gaps: ['no scholarship deadline (automatic with a course application)', 'terms apply to students starting 2027 or later'] },
    { record: aai, source: aai.official_source, quote: 'Applications for Australia Awards Scholarships for India are closed at this time.', evidence: ['Australia Awards India opportunities page (read 2026-11-28 through a fetch tool; the box sees a bot check): "closed at this time"', 'DFAT Australia Awards Scholarships page (same method): benefits "generally apply"'], gaps: ['no India-specific amounts or eligibility published', 'no application dates', 'India is not on the DFAT participating countries list for the standard program'] },
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
