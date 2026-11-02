/**
 * Propose two new UK scholarships (GREAT Scholarships India, Edinburgh India Merit Scholarship) to the
 * production Inbox as kind 'new_scholarship', the same row shape lib/agent-inbox.js proposeNewScholarship writes.
 * Nothing is published until the owner approves each card in the Command Center.
 *
 *   node scripts/study-abroad/proposals/uk-new-scholarships-2026-11-02.cjs [--go] [--target=production|staging]
 *
 * Without --go it only prints what it would write. Amounts are left empty on purpose: the site stores rupees and the
 * awards are in pounds, so the pound figure goes in amount_description (as the MPOWER Udaan record does).
 */
const { resolveTarget, connect, describe } = require('../../lib/turso-target');

const AGENT = 'content-editor';
const CONFIRMED = '2026-11-02';

const common = {
    provider_type: 'Government',
    state: 'All India',
    level: 'Postgraduate',
    caste: 'All',
    gender: 'All',
    app_type: 'Offline',
    income_limit: null,
    min_marks: null,
    amount_annual: null,
    amount_min: null,
    helpline: null,
    always_open: 0,
    deadline: null,
    scholarship_scope: 'International',
    country_of_study: 'United Kingdom',
};

const great = {
    ...common,
    id: 'great-scholarships-india-2026-27',
    slug: 'great-scholarships-india-2026-27',
    title: 'GREAT Scholarships for Indian Students (UK)',
    provider: 'British Council and participating UK universities',
    provider_type: 'Government',
    course_stream: 'One-year taught postgraduate courses at the 13 participating universities',
    amount_description: '£10,000 towards tuition fees for the 2026-27 academic year.',
    benefits: 'A £10,000 reduction in tuition fees for a one-year taught master\'s course. The money is paid by the university after you register, and can only be used for tuition fees.',
    age_limit: null,
    residency_requirement: 'Indian passport holder and permanent resident of India',
    docs_needed: ['Indian passport', 'Undergraduate degree certificate', 'Proof of English language level (as the university asks)', 'University application and scholarship form'],
    application_mode: 'Offline',
    apply_url: 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/india',
    deadline_description: 'The deadline is different for each university. Check the page of the university you want to apply to. The British Council page lists 13 universities for 2026-27 and gives no 2027-28 dates yet.',
    step_guide: '1. Open the GREAT Scholarships India page on the British Council Study UK site.\n2. Pick a participating university and read its scholarship page for the courses covered.\n3. Apply for the scholarship by following that university\'s instructions.\n4. The university tells you the result and pays the funding after you register.',
    selection: 'Each university decides its own winners. Scholars must be Indian passport holders and permanent residents of India, hold an undergraduate degree, and meet the university\'s English requirement.',
    renewal: 'One-time award for a one-year course',
    official_source: 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/india',
    intro_seo: 'GREAT Scholarships give Indian students £10,000 towards tuition for a one-year master\'s at 13 UK universities in 2026-27. Check each university\'s deadline.',
    faq_json: [
        { question: 'How much is a GREAT Scholarship for Indian students?', answer: 'The British Council page says each scholarship is £10,000 towards tuition fees for 2026-27. Bristol lists its awards at £13,000.' },
        { question: 'Who can apply for a GREAT Scholarship?', answer: 'You must be an Indian passport holder and permanent resident of India, have an undergraduate degree and meet the university\'s English requirement.' },
        { question: 'Where do I apply for a GREAT Scholarship?', answer: 'Apply through the participating university, not the British Council. Each university has its own page and deadline.' },
    ],
    keywords: ['GREAT Scholarships India', 'UK scholarship for Indian students', 'British Council scholarship', 'master\'s in UK scholarship'],
    tags: ['international', 'uk', 'postgraduate', 'tuition'],
    scholarship_type: 'Government',
    source_pages: JSON.stringify([
        { url: 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/india', facts: ['amount_description', 'residency_requirement', 'deadline_description'], confirmed: CONFIRMED },
    ]),
};

const edinburgh = {
    ...common,
    id: 'edinburgh-india-merit-scholarship',
    slug: 'edinburgh-india-merit-scholarship',
    title: 'University of Edinburgh India Merit Scholarship',
    provider: 'University of Edinburgh',
    provider_type: 'Private',
    course_stream: 'Full-time, on-campus postgraduate taught master\'s programmes',
    amount_description: '£5,000 tuition fee reduction for the first year of study (2027/28 entry). It is not paid as cash.',
    benefits: 'A £5,000 reduction in tuition fees, for the first year of study only.',
    age_limit: null,
    residency_requirement: 'Domiciled in India at the time of application, with a degree studied and awarded in India',
    docs_needed: ['Undergraduate degree from India', 'Unconditional offer for a full-time on-campus master\'s'],
    application_mode: 'Online',
    apply_url: 'https://registryservices.ed.ac.uk/student-funding/postgraduate/international/region/asia/india-merit-scholarship',
    deadline_description: 'No separate application and no deadline is given on the official page. The university assesses you when it reviews your programme application. Any deposit deadline is in your offer letter.',
    step_guide: '1. Apply for a full-time, on-campus postgraduate taught master\'s at the University of Edinburgh.\n2. Receive an unconditional offer.\n3. No separate scholarship form is needed. The university checks your eligibility and applies the award.\n4. Pay your deposit by the date in your offer letter, or the scholarship is lost.',
    selection: 'Awarded after an unconditional offer to applicants who are domiciled in India, hold an Indian undergraduate degree at the required grade, have international fee status and are fully or partly self-funded.',
    renewal: 'First year of study only. Deferring your place withdraws the award.',
    official_source: 'https://registryservices.ed.ac.uk/student-funding/postgraduate/international/region/asia/india-merit-scholarship',
    intro_seo: 'The Edinburgh India Merit Scholarship cuts £5,000 from first-year tuition for Indian graduates joining a full-time master\'s. No separate application is needed.',
    faq_json: [
        { question: 'How much is the Edinburgh India Merit Scholarship?', answer: 'The official page says it is a £5,000 tuition fee reduction for the first year of study, for 2027/28 entry.' },
        { question: 'Do I need to apply separately for the India Merit Scholarship?', answer: 'No. The page says no separate application is necessary. Edinburgh checks your eligibility when it reviews your programme application.' },
        { question: 'Can the India Merit Scholarship be paid as cash?', answer: 'No. It is a reduction in your tuition fees and cannot be paid as cash.' },
    ],
    keywords: ['Edinburgh India Merit Scholarship', 'University of Edinburgh scholarship Indian students', 'UK master\'s scholarship India'],
    tags: ['international', 'uk', 'postgraduate', 'tuition', 'university'],
    scholarship_type: 'University',
    source_pages: JSON.stringify([
        { url: 'https://registryservices.ed.ac.uk/student-funding/postgraduate/international/region/asia/india-merit-scholarship', facts: ['amount_description', 'residency_requirement', 'deadline_description'], confirmed: CONFIRMED },
    ]),
};

// verdict / source / quote / officialSource are what the Inbox card reads (EvidenceLine in app/admin/agents/Cards.tsx)
const items = [
    { record: great, source: great.official_source, quote: 'receive £10,000 towards their tuition fees', evidence: ['British Council Study UK, GREAT Scholarships India (read in a browser 2026-11-02): "receive £10,000 towards their tuition fees"; 13 universities listed for 2026-27'], gaps: ['no exact deadline (set by each university)', 'no 2027-28 dates published'] },
    { record: edinburgh, source: edinburgh.official_source, quote: 'The India Merit Scholarship is a £5,000 tuition fee reduction', evidence: ['University of Edinburgh Registry Services (read 2026-11-02): "£5,000 tuition fee reduction"; "No separate application is necessary"'], gaps: ['no exact deadline', 'fee reduction for 2027/28 entry only; 2026/27 wording not read'] },
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
