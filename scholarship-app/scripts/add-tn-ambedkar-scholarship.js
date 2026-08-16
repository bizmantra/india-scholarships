const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log('Adding Annal Ambedkar Overseas Scholarship...');

try {
    const data = {
        id: 'annal-ambedkar-overseas-higher-education-scholarship-scheme',
        slug: 'annal-ambedkar-overseas-higher-education-scholarship-scheme',
        title: 'Annal Ambedkar Overseas Higher Education Scholarship Scheme (Tamil Nadu)',
        provider: 'Adi Dravidar and Tribal Welfare Department, Government of Tamil Nadu',
        scholarship_type: 'Study Abroad',
        provider_type: 'Government',
        state: 'Tamil Nadu',
        residency_requirement: 'Tamil Nadu',
        course_stream: JSON.stringify(['Engineering', 'Medicine', 'Science', 'Management', 'Humanities', 'Social Sciences', 'Arts']),
        age_limit: 35,
        total_awards: null,
        caste: JSON.stringify(['SC', 'ST', 'SCC']),
        gender: 'All',
        level: 'Postgraduate',
        min_marks: 60,
        income_limit: 800000,
        amount_min: null,
        amount_annual: null,
        amount_description: 'Covers 100% of tuition fees, living expenses, travel expenses, visa fees, and health insurance for PG/PhD courses abroad.',
        deadline: '2026-06-05',
        deadline_description: 'The application portal for the 2026-27 cycle closed on June 5, 2026. The next cycle is expected to open in May 2027.',
        official_source: 'https://www.scholarships.tn.gov.in/',
        apply_url: 'https://tnadwscholarship.in/',
        special_conditions: 'Student must have secured admission in a foreign university ranked in the QS World University Rankings.',
        tags: JSON.stringify(['Overseas', 'SC/ST', 'Master\'s', 'PhD', 'Tamil Nadu']),
        thumbnail_url: null,
        docs_needed: JSON.stringify(['Aadhaar Card', 'Community Certificate', 'Income Certificate', 'Passport', 'Unconditional Offer Letter from Foreign University', 'Marks Sheets', 'Statement of Purpose (SOP)', 'Aadhaar-seeded Bank Passbook']),
        intro_seo: 'The Annal Ambedkar Overseas Higher Education Scholarship is a prestigious Tamil Nadu government initiative that provides full financial assistance to SC, ST, and SCC students pursuing postgraduate and doctoral studies abroad.',
        benefits: '100% tuition fee coverage, living expenses allowance, visa fees, health insurance, and return economy airfare.',
        step_guide: '1. Visit the official Tamil Nadu Adi Dravidar scholarship portal (tnadwscholarship.in).\n2. Register using your Aadhaar card, Community Certificate, and Income Certificate.\n3. Fill out the application form with university admission details.\n4. Upload all required documents, including your passport, offer letter, and statement of purpose.\n5. Submit the application and track the status online.',
        selection: 'Based on academic merit in undergraduate degree, university rankings (typically QS Top 500), and family income criteria.',
        faq_json: JSON.stringify([
            { question: 'Who is eligible for the Annal Ambedkar Overseas Scholarship?', answer: 'SC, ST, and Scheduled Caste Converted to Christianity (SCC) students from Tamil Nadu pursuing post-graduation or PhD abroad are eligible.' },
            { question: 'What is the annual income limit?', answer: 'The annual family income limit from all sources must not exceed ₹8 Lakhs.' },
            { question: 'What expenses are covered under this scholarship?', answer: 'It covers tuition fees, living expenses, return airfare, visa fees, and health insurance.' }
        ]),
        verified_status: 'Verified',
        last_verified: new Date().toISOString().split('T')[0],
        verification_year: 2026,
        application_mode: 'Online',
        show_on_homepage: 0,
        is_featured: 1,
        is_popular: 0,
        priority_score: 80,
        status: 'Active',
        time_min: null,
        renewal: 'Subject to academic progress and clearance of semesters without backlogs.',
        helpline: 'Official Department Helpline, State Portal Support',
        competitiveness: 'High'
    };

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO scholarships (
            id, slug, title, provider, scholarship_type, provider_type, state,
            residency_requirement, course_stream, age_limit, total_awards, caste,
            gender, level, min_marks, income_limit, amount_min, amount_annual,
            amount_description, deadline, deadline_description, official_source,
            special_conditions, tags, thumbnail_url, docs_needed,
            apply_url, intro_seo, benefits, step_guide, selection, faq_json,
            verified_status, last_verified, verification_year, application_mode,
            show_on_homepage, is_featured, is_popular, priority_score, status,
            time_min, renewal, helpline, competitiveness
        ) VALUES (
            @id, @slug, @title, @provider, @scholarship_type, @provider_type, @state,
            @residency_requirement, @course_stream, @age_limit, @total_awards, @caste,
            @gender, @level, @min_marks, @income_limit, @amount_min, @amount_annual,
            @amount_description, @deadline, @deadline_description, @official_source,
            @special_conditions, @tags, @thumbnail_url, @docs_needed,
            @apply_url, @intro_seo, @benefits, @step_guide, @selection, @faq_json,
            @verified_status, @last_verified, @verification_year, @application_mode,
            @show_on_homepage, @is_featured, @is_popular, @priority_score, @status,
            @time_min, @renewal, @helpline, @competitiveness
        )
    `);

    stmt.run(data);
    console.log('✅ Successfully added Annal Ambedkar Overseas Scholarship to local database!');
} catch (error) {
    console.error('❌ Failed to add scholarship:', error.message);
} finally {
    db.close();
}
