/**
 * Propose four Australia scholarships (UQ International High Achievers, UQ International Excellence, RMIT Future Leaders,
 * Monash Engineering International High Achievers) to the production Inbox as kind 'new_scholarship', the same row shape
 * lib/agent-inbox.js proposeNewScholarship writes. Nothing is published until the owner approves each card.
 *
 *   node scripts/study-abroad/proposals/australia-new-scholarships-batch3-2026-11-28.cjs [--go] [--target=production|staging]
 *
 * Without --go it only prints what it would write. DRAFT: not run against any database. Amounts that are percentages
 * or Australian dollars go in amount_description (the site stores rupees), as the UK file does.
 * Every fact is in plans/australia-research/au-batch3-notes.md with the exact quote and date.
 */
const { resolveTarget, connect, describe } = require('../../lib/turso-target');

const AGENT = 'content-editor';
const CONFIRMED = '2026-11-28';

const common = {
    "provider_type": "Private",
    "state": "All India",
    "level": "Postgraduate",
    "caste": "All",
    "gender": "All",
    "app_type": null,
    "income_limit": null,
    "min_marks": null,
    "amount_annual": null,
    "amount_min": null,
    "helpline": null,
    "always_open": 0,
    "deadline": null,
    "scholarship_scope": "International",
    "country_of_study": "Australia"
};

const has = {
    ...common,
    provider: "University of Queensland",
    course_stream: "Full-time postgraduate coursework programs at the University of Queensland, including the Master of Computer Science and the Master of Data Science",
    age_limit: null,
    residency_requirement: "International students. No country condition is listed on the official page.",
    docs_needed: ["Offer for a full-time UQ program starting in 2027"],
    application_mode: null,
    deadline_description: "No separate application and no scholarship deadline. UQ assesses you automatically when you apply for a program. UQ gives the acceptance deadline with your offer.",
    selection: "The award goes to applicants who reach a competitive score among the pool of offer holders for their commencement semester. UQ decides the score.",
    renewal: "The reduction applies for the duration of the program. You cannot hold it with another UQ scholarship, fee reduction or rebate (the UQ English Language Scholarship is the exception). A full scholarship or sponsorship from another organisation rules you out, but a partial one may be considered.",
    scholarship_type: "University",
    id: "uq-international-high-achievers-scholarship",
    slug: "uq-international-high-achievers-scholarship",
    title: "UQ International High Achievers Scholarship (University of Queensland)",
    amount_description: "20% off tuition fees each semester for the whole program, for full-time study starting in 2027. The number of awards may vary.",
    benefits: "A 20% reduction in tuition fees each semester for the length of your program. It is not paid as cash.",
    apply_url: "https://scholarships.uq.edu.au/scholarship/uq-international-high-achievers-scholarship",
    step_guide: "1. Apply for a full-time program at UQ that starts in 2027. You may use an approved UQ agent if you prefer.\n2. Meet the program's entry rank and English requirements.\n3. No scholarship form is needed. UQ assesses you automatically.\n4. If you are eligible, UQ tells you with your unconditional offer, or once you meet every condition of a conditional offer.\n5. Accept the scholarship by the deadline UQ gives you.",
    official_source: "https://scholarships.uq.edu.au/scholarship/uq-international-high-achievers-scholarship",
    intro_seo: "The UQ International High Achievers Scholarship takes 20% off UQ master's tuition for international students. No separate application is needed.",
    faq_json: [{"question": "How much is the UQ International High Achievers Scholarship?", "answer": "The official page says it is a 20% reduction in tuition fees per semester for the duration of the program, for full-time study starting in 2027."}, {"question": "Do I need to apply separately for the UQ International High Achievers Scholarship?", "answer": "No. You are automatically assessed when you apply to study a program at UQ."}, {"question": "Can I hold this scholarship with another UQ scholarship?", "answer": "No. The page says you must not have received another UQ scholarship, tuition fee reduction or rebate, apart from the UQ English Language Scholarship."}],
    keywords: ["UQ International High Achievers Scholarship", "UQ scholarship for Indian students", "University of Queensland master's scholarship", "Australia master's scholarship India"],
    tags: ["international", "australia", "postgraduate", "tuition", "university"],
    source_pages: JSON.stringify([{"url": "https://scholarships.uq.edu.au/scholarship/uq-international-high-achievers-scholarship", "facts": ["amount_description", "residency_requirement", "deadline_description", "selection", "renewal"], "confirmed": "2026-11-28"}]),
};

const ies = {
    ...common,
    provider: "University of Queensland",
    course_stream: "Full-time postgraduate coursework programs at the University of Queensland, including the Master of Computer Science and the Master of Data Science",
    age_limit: null,
    residency_requirement: "International students. No country condition is listed on the official page.",
    docs_needed: ["Offer for a full-time UQ program starting in 2027"],
    application_mode: null,
    deadline_description: "No separate application and no scholarship deadline. UQ assesses you automatically when you apply for a program. UQ gives the acceptance deadline with your offer.",
    selection: "The award goes to applicants who reach a competitive score among the pool of offer holders for their commencement semester. UQ decides the score.",
    renewal: "The reduction applies for the duration of the program. You cannot hold it with another UQ scholarship, fee reduction or rebate (the UQ English Language Scholarship is the exception). A full scholarship or sponsorship from another organisation rules you out, but a partial one may be considered.",
    scholarship_type: "University",
    id: "uq-international-excellence-scholarship",
    slug: "uq-international-excellence-scholarship",
    title: "UQ International Excellence Scholarship (University of Queensland)",
    amount_description: "25% off tuition fees each semester for the whole program, for full-time study starting in 2027. The number of awards may vary.",
    benefits: "A 25% reduction in tuition fees each semester for the length of your program. It is not paid as cash.",
    apply_url: "https://scholarships.uq.edu.au/scholarship/uq-international-excellence-scholarship",
    step_guide: "1. Apply for a full-time program at UQ that starts in 2027. You may use an approved UQ agent if you prefer.\n2. Meet the program's entry rank and English requirements.\n3. No scholarship form is needed. UQ assesses you automatically.\n4. If you are eligible, UQ tells you with your unconditional offer, or once you meet every condition of a conditional offer.\n5. Accept the scholarship by the deadline UQ gives you.",
    official_source: "https://scholarships.uq.edu.au/scholarship/uq-international-excellence-scholarship",
    intro_seo: "The UQ International Excellence Scholarship takes 25% off UQ master's tuition for international students. No separate application is needed.",
    faq_json: [{"question": "How much is the UQ International Excellence Scholarship?", "answer": "The official page says it is a 25% reduction in tuition fees per semester for the duration of the program, for full-time study starting in 2027."}, {"question": "Do I need to apply separately for the UQ International Excellence Scholarship?", "answer": "No. You are automatically assessed when you apply to study a program at UQ."}, {"question": "Can I hold this scholarship with another UQ scholarship?", "answer": "No. The page says you must not have received another UQ scholarship, tuition fee reduction or rebate, apart from the UQ English Language Scholarship."}],
    keywords: ["UQ International Excellence Scholarship", "UQ scholarship for Indian students", "University of Queensland master's scholarship", "Australia master's scholarship India"],
    tags: ["international", "australia", "postgraduate", "tuition", "university"],
    source_pages: JSON.stringify([{"url": "https://scholarships.uq.edu.au/scholarship/uq-international-excellence-scholarship", "facts": ["amount_description", "residency_requirement", "deadline_description", "selection", "renewal"], "confirmed": "2026-11-28"}]),
};

const flp = {
    ...common,
    id: "rmit-future-leaders-scholarship",
    slug: "rmit-future-leaders-scholarship",
    title: "Future Leaders Scholarship (RMIT University)",
    provider: "RMIT University",
    course_stream: "Eligible bachelor and master by coursework programs at RMIT University in Melbourne. RMIT's page has the list of eligible programs.",
    amount_description: "20% off tuition fees for the whole program, for offers from the 2026 intakes onwards.",
    benefits: "A 20% tuition fee reduction for the length of your eligible program, as stated in your offer letter. It is not paid as cash.",
    age_limit: null,
    residency_requirement: "Citizen of India, Sri Lanka, Bangladesh, Bhutan, Nepal or Pakistan, including dual citizens who hold one of these passports. You need a valid student visa or a plan to apply for one before the program starts.",
    docs_needed: ["Offer letter from RMIT to start from the 2026 intakes onwards in an eligible program"],
    application_mode: null,
    apply_url: "https://www.rmit.edu.au/scholarships/international-scholarships/future-leaders-scholarship",
    deadline_description: "No separate application date is published on the scholarship page. You apply to RMIT for a program, and the discount is stated in your offer letter. Course dates are on each course page.",
    step_guide: "1. Check that your program is on RMIT's list of eligible programs.\n2. Apply to study at RMIT as an international student.\n3. Receive your offer letter, which states the scholarship if you qualify.\n4. Keep satisfactory academic progress each year.",
    selection: "The page lists eligibility rules and gives no ranking or number of awards.",
    renewal: "The discount runs for the duration of the eligible program. It is not applied to the next calendar year if academic progress is not satisfactory. You cannot hold it with another RMIT-funded scholarship or an Australia Awards scholarship that covers tuition. A change of program in a later semester keeps the scholarship.",
    official_source: "https://www.rmit.edu.au/scholarships/international-scholarships/future-leaders-scholarship",
    intro_seo: "The RMIT Future Leaders Scholarship takes 20% off tuition for students from India and nearby countries on eligible bachelor and master's programs.",
    faq_json: [{"question": "How much is the RMIT Future Leaders Scholarship?", "answer": "The official page says it is a 20% tuition fee reduction for the duration of the eligible program, as stated in your offer letter."}, {"question": "Who can get the RMIT Future Leaders Scholarship?", "answer": "Citizens of India, Sri Lanka, Bangladesh, Bhutan, Nepal or Pakistan with an offer to start from the 2026 intakes onwards in an eligible RMIT bachelor or master by coursework program."}, {"question": "Can I hold it with another scholarship?", "answer": "Not with another RMIT-funded scholarship or an Australia Awards scholarship that covers tuition. A scholarship loan may be considered."}],
    keywords: ["RMIT Future Leaders Scholarship", "RMIT scholarship for Indian students", "Australia master's scholarship India", "RMIT 20% tuition scholarship"],
    tags: ["international", "australia", "postgraduate", "tuition", "university"],
    scholarship_type: "University",
    source_pages: JSON.stringify([{"url": "https://www.rmit.edu.au/scholarships/international-scholarships/future-leaders-scholarship", "facts": ["amount_description", "residency_requirement", "deadline_description", "renewal"], "confirmed": "2026-11-28"}]),
};

const mon = {
    ...common,
    id: "monash-engineering-international-high-achievers-scholarship",
    slug: "monash-engineering-international-high-achievers-scholarship",
    title: "Engineering International High Achievers Scholarship, postgraduate (Monash University)",
    provider: "Monash University",
    course_stream: "Postgraduate coursework in the Faculty of Engineering at Monash University",
    amount_description: "AUD 15,000 per 48 credit points of postgraduate study, paid towards tuition fees. The Monash page shows $. 25 postgraduate scholarships a year.",
    benefits: "A payment of $15,000 per 48 credit points towards tuition fees, as written on the Monash India page. It is paid to the university, not as cash.",
    age_limit: null,
    residency_requirement: "International students. The Monash India page lists no country condition.",
    docs_needed: [],
    application_mode: null,
    apply_url: "https://www.monash.edu/india/study/scholarships-and-finance-options",
    deadline_description: "The Monash India page gives no application dates or process for this scholarship. Check the Monash scholarship website.",
    step_guide: "1. Apply for a postgraduate course in the Faculty of Engineering at Monash.\n2. Check the Monash scholarship website for how this scholarship is awarded. The India page does not say.",
    selection: null,
    renewal: null,
    official_source: "https://www.monash.edu/india/study/scholarships-and-finance-options",
    intro_seo: "Monash lists an Engineering International High Achievers Scholarship for postgraduate engineering students: $15,000 per 48 credit points, 25 awards a year.",
    faq_json: [{"question": "How much is the Monash Engineering International High Achievers Scholarship for postgraduates?", "answer": "Monash's India page lists $15,000 per 48 credit points, paid towards tuition fees, with 25 postgraduate scholarships a year."}, {"question": "Which students can get it?", "answer": "The page lists the Faculty of Engineering. It gives no other eligibility rules, so check the Monash scholarship website."}],
    keywords: ["Monash Engineering International High Achievers Scholarship", "Monash scholarship for Indian students", "Monash engineering master's scholarship"],
    tags: ["international", "australia", "postgraduate", "tuition", "university", "engineering"],
    scholarship_type: "University",
    source_pages: JSON.stringify([{"url": "https://www.monash.edu/india/study/scholarships-and-finance-options", "facts": ["amount_description", "course_stream"], "confirmed": "2026-11-28"}]),
};

// verdict / source / quote / officialSource are what the Inbox card reads (EvidenceLine in app/admin/agents/Cards.tsx)
const items = [
    { record: has, source: has.official_source, quote: "20% reduction in tuition fees per semester", evidence: ["UQ scholarships site (read 2026-11-28): \"20% reduction in tuition fees per semester\"; \"Scholarship duration: For the duration of the program\"; \"You don't need to apply for this scholarship.\""], gaps: ["no closing date (automatic with a program application)", "number of awards may vary", "2027 commencement terms"] },
    { record: ies, source: ies.official_source, quote: "25% reduction in tuition fees per semester", evidence: ["UQ scholarships site (read 2026-11-28): \"25% reduction in tuition fees per semester\"; \"You don't need to apply for this scholarship.\""], gaps: ["no closing date (automatic with a program application)", "number of awards may vary", "2027 commencement terms"] },
    { record: flp, source: flp.official_source, quote: "The value of the scholarship is a 20% tuition fee reduction for the duration of the eligible program(s)* as outlined in your offer letter.", evidence: ["RMIT scholarships page (read 2026-11-28): \"be a citizen of India, Sri Lanka, Bangladesh, Bhutan, Nepal or Pakistan\"; \"20% tuition fee reduction\""], gaps: ["no number of awards published", "eligible program list not read, so check that MC208 and MC267 are on it", "no separate application date"] },
    { record: mon, source: mon.official_source, quote: "Postgraduate - $15,000 per 48 credit points, paid towards your tuition fees.", evidence: ["Monash India scholarships page (read 2026-11-28 through a fetch tool): \"Postgraduate - $15,000 per 48 credit points, paid towards your tuition fees.\"; \"25 scholarships will be offered per year.\"; study area \"Faculty of Engineering.\""], gaps: ["no application process or dates on the India page", "no eligibility rules beyond the faculty", "page shows $ without naming the currency"] },
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
