const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../data/scholarships.db');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

// 1. Existing scholarships to enrich
const updates = [
    {
        id: 'kotak-kanya-scholarship',
        title: 'Kotak Kanya Scholarship 2026-27',
        deadline: '2026-08-20',
        deadline_description: 'The application deadline for Kotak Kanya Scholarship 2026-27 is August 20, 2026.',
        amount_annual: 150000,
        amount_min: 150000,
        amount_description: 'Up to ₹1.5 lakh per year to cover tuition fees, hostel, mess, books, and other academic expenses. The scholarship is paid via Direct Bank Transfer (DBT).',
        income_limit: 600000,
        min_marks: 75,
        gender: 'Girls',
        provider_type: 'Corporate',
        scholarship_type: 'Private',
        scholarship_scope: 'Domestic',
        verified_status: 'Verified',
        verification_year: 2026,
        last_verified: '2026-07-19',
        faq_json: JSON.stringify([
            {
                question: "Who can apply for the Kotak Kanya Scholarship?",
                answer: "Only girl students who have secured admission in the first year of professional graduation courses (like Engineering, MBBS, Integrated LLB, Design, etc.) at NAAC/NIRF accredited institutions, scored 75% or above in Class 12, and have a family income of Rs. 6 lakh or less can apply."
            },
            {
                question: "What is the scholarship amount?",
                answer: "Selected scholars will receive financial assistance of up to Rs. 1.5 Lakh per year to cover tuition, hostel, books, and other academic expenses."
            },
            {
                question: "Is this scholarship renewable?",
                answer: "Yes, the scholarship is renewable every year until the completion of the professional graduation course, subject to meeting academic promotion requirements and terms."
            }
        ])
    },
    {
        id: 'sc_corp_bharti_001',
        title: 'Bharti Airtel Scholarship Program 2026-27',
        deadline: '2026-07-31',
        deadline_description: 'The application deadline for Bharti Airtel Scholarship Program 2026-27 is July 31, 2026.',
        amount_annual: 300000,
        amount_min: 100000,
        amount_description: 'Covers 100% of the annual tuition fee, exam fees, hostel and mess fees (or equivalent PG/flat support), and provides a high-end laptop in the first year.',
        income_limit: 800000,
        min_marks: 60,
        provider_type: 'Corporate',
        scholarship_type: 'Private',
        scholarship_scope: 'Domestic',
        verified_status: 'Verified',
        verification_year: 2026,
        last_verified: '2026-07-19',
        faq_json: JSON.stringify([
            {
                question: "Which courses are covered under the Bharti Airtel Scholarship Program?",
                answer: "Undergraduate engineering (B.E./B.Tech) and 5-year integrated technology courses in Electronics, Telecom, IT, Computer Science, Data Science, Aerospace, and emerging fields like AI, IoT, Robotics, AR/VR, and Machine Learning."
            },
            {
                question: "Which institutes are eligible under this program?",
                answer: "Students must be enrolled in the first year of eligible courses in one of the top 50 NIRF-ranked (Engineering category) universities/institutes in India."
            },
            {
                question: "Does the scholarship cover hostel fees?",
                answer: "Yes, the scholarship covers 100% of college tuition fees, exam fees, hostel/mess fees (or equivalent support for off-campus housing), and includes a free high-end laptop in the first year."
            }
        ])
    },
    {
        id: 'azim-premji-scholarship',
        title: 'Azim Premji Scholarship 2026-27',
        deadline: '2026-08-31',
        deadline_description: 'The registration window opens on August 10, 2026, and closes on August 31, 2026.',
        amount_annual: 30000,
        amount_min: 30000,
        amount_description: '₹30,000 per year for the full duration of the undergraduate degree or diploma course.',
        gender: 'Girls',
        provider_type: 'Private',
        scholarship_type: 'Private',
        scholarship_scope: 'Domestic',
        verified_status: 'Verified',
        verification_year: 2026,
        last_verified: '2026-07-19',
        faq_json: JSON.stringify([
            {
                question: "Who is eligible for the Azim Premji Scholarship?",
                answer: "Only girl students who passed Class 10 and Class 12 from a government school, and are enrolled in the first year of an undergraduate degree or diploma program in eligible states are eligible."
            },
            {
                question: "What is the annual scholarship amount?",
                answer: "Selected female scholars will receive Rs. 30,000 per year for the entire duration of their degree or diploma program."
            },
            {
                question: "Which states are covered under this scheme?",
                answer: "It is open to residents of Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Jharkhand, Karnataka, MP, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry, Rajasthan, Sikkim, Telangana, Tripura, UP, and Uttarakhand."
            }
        ])
    }
];

// 2. New scholarships to add
const inserts = [
    {
        id: 'schaeffler-india-hope-engineering-scholarship',
        slug: 'schaeffler-india-hope-engineering-scholarship',
        title: 'Schaeffler India Hope Engineering Scholarship 2026',
        provider: 'Schaeffler India',
        provider_type: 'Corporate',
        state: 'All India',
        level: 'Graduation (UG)',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'Girls',
        course_stream: 'Engineering (B.E./B.Tech)',
        app_type: 'Online',
        amount_annual: 50000,
        amount_min: 50000,
        amount_description: '₹50,000 per year for the full duration of a 4-year engineering program, along with a 6-month industry mentorship program.',
        benefits: 'Annual scholarship of ₹50,000 for tuition fees and academic expenses + career mentorship from Schaeffler India professionals.',
        income_limit: 500000,
        min_marks: 60,
        age_limit: 'Must be enrolled in the first year of engineering.',
        residency_requirement: 'Must be an Indian citizen and resident.',
        docs_needed: JSON.stringify(['Class 10 Marksheet', 'Class 12 Marksheet', 'Engineering Admission Letter / Seat Allotment Letter', 'College Fee Receipt', 'Annual Family Income Certificate', 'Aadhaar Card', 'Bank Passbook copy', 'Disability Certificate (if applicable)']),
        application_mode: 'Online',
        apply_url: 'https://www.buddy4study.com',
        deadline: '2026-08-15',
        deadline_description: 'The application deadline is August 15, 2026.',
        time_min: 30,
        step_guide: '1. Visit the Buddy4Study portal.\n2. Log in or register using mobile/email/Google.\n3. Search for "Schaeffler India Hope Engineering Scholarship".\n4. Click "Start Application" and fill in details.\n5. Upload all mandatory documents.\n6. Review and submit the application.',
        selection: 'Based on meeting the eligibility criteria (girl students, enrolled in 1st year engineering, 60% in Class 12, family income ≤ 5L), academic merit, and document verification. Special preference is given to students with disabilities (PwD).',
        total_awards: 0,
        renewal: 'Renewal is subject to academic promotion and performance verification at the end of each academic year.',
        competitiveness: 'Medium',
        verified_status: 'Verified',
        last_verified: '2026-07-19',
        official_source: 'https://www.buddy4study.com',
        helpline: 'schaeffler@buddy4study.com',
        intro_seo: 'The Schaeffler India Hope Engineering Scholarship Program 2026 offers ₹50,000 per year and professional mentorship to first-year female engineering students with a family income below ₹5 Lakh.',
        faq_json: JSON.stringify([
            { question: "Is there any course preference?", answer: "Preference is given to engineering streams like Automobile, Mechanical, Mechatronics, Electrical, Electronics, CS, and IT." },
            { question: "Can first-year boys apply?", answer: "No, this scholarship is exclusively for female engineering students." },
            { question: "Are students with disabilities eligible?", answer: "Yes, special preference is given to students with disabilities, and their minimum marks criteria is relaxed to 40%." }
        ]),
        scholarship_type: 'Private',
        status: 'Active',
        verification_year: 2026,
        show_on_homepage: 1,
        is_featured: 0,
        is_popular: 1,
        priority_score: 85,
        tags: JSON.stringify(['girls', 'engineering', 'corporate', 'merit-based', 'needs-based']),
        scholarship_scope: 'Domestic',
        always_open: 0
    },
    {
        id: 'raman-kant-munjal-scholarship',
        slug: 'raman-kant-munjal-scholarship',
        title: 'Raman Kant Munjal Scholarship 2026',
        provider: 'Raman Kant Munjal Foundation',
        provider_type: 'Trust',
        state: 'All India',
        level: 'Graduation (UG)',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'Finance / Commerce / Business Management',
        app_type: 'Online',
        amount_annual: 550000,
        amount_min: 40000,
        amount_description: 'Offers financial support ranging from ₹40,000 to ₹5,50,000 per year, depending on the actual college fees, for up to three years of the undergraduate course.',
        benefits: 'Financial assistance of up to ₹5.5 Lakhs per year covering tuition fees, examination fees, books, stationery, and other academic expenses.',
        income_limit: 600000,
        min_marks: 80,
        age_limit: 'Maximum 20 years as of May 31, 2026.',
        residency_requirement: 'Must be an Indian citizen.',
        docs_needed: JSON.stringify(['Class 10 Marksheet', 'Class 12 Marksheet', 'Proof of current academic enrollment (College ID/fee receipt)', "Parent's PAN card & masked Aadhaar card", 'Annual parental income proof (ITR/Income Certificate/salary slips)', "Applicant's bank account details (passbook/cancelled cheque)", 'Bank account statements of parents', 'Affidavit declaring document authenticity', 'LinkedIn Profile URL']),
        application_mode: 'Online',
        apply_url: 'https://www.buddy4study.com',
        deadline: '2026-08-31',
        deadline_description: 'The application deadline is August 31, 2026.',
        time_min: 30,
        step_guide: '1. Visit the Buddy4Study portal.\n2. Register or log in to your account.\n3. Search for "Raman Kant Munjal Scholarship 2026-27".\n4. Fill in the online form and upload required documents including parent bank statements and affidavit.\n5. Click submit to complete application.',
        selection: 'Based on academic merit (minimum 80% marks in Classes 10 & 12), family income (less than ₹6 Lakhs), and verification of parent bank statements and professional eligibility.',
        total_awards: 0,
        renewal: 'Renewal is subject to academic progress and maintaining clean disciplinary and academic records.',
        competitiveness: 'High',
        verified_status: 'Verified',
        last_verified: '2026-07-19',
        official_source: 'https://www.buddy4study.com',
        helpline: 'scholarships@rkmfoundation.org, 011-430-92248',
        intro_seo: 'The Raman Kant Munjal Scholarship 2026 offers up to ₹5.5 Lakhs per year to first-year finance and commerce undergraduate students with family incomes under ₹6 Lakh.',
        faq_json: JSON.stringify([
            { question: "Which courses are eligible?", answer: "Undergraduate finance/commerce courses including BBA, BFIA, B.Com (Hons/Pass), BMS, IPM, B.A. (Economics), and BBS." },
            { question: "Is there age limit?", answer: "Yes, the applicant must be a maximum of 20 years of age as of May 31, 2026." },
            { question: "What documents are unique to this scholarship?", answer: "In addition to income proof and marksheets, you must submit parents' bank account statements and your LinkedIn profile URL." }
        ]),
        scholarship_type: 'Private',
        status: 'Active',
        verification_year: 2026,
        show_on_homepage: 1,
        is_featured: 0,
        is_popular: 1,
        priority_score: 85,
        tags: JSON.stringify(['finance', 'commerce', 'management', 'corporate', 'merit-based']),
        scholarship_scope: 'Domestic',
        always_open: 0
    },
    {
        id: 'gyandhan-scholarship',
        slug: 'gyandhan-scholarship',
        title: 'GyanDhan Scholarship 2026',
        provider: 'GyanDhan',
        provider_type: 'Private',
        state: 'All India',
        level: 'Graduation (UG), Post-Graduation (PG)',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'Any Academic Stream',
        app_type: 'Online',
        amount_annual: 250000,
        amount_min: 250000,
        amount_description: 'One-time merit-based award of ₹2,50,000 paid directly to the student.',
        benefits: 'A one-time award of ₹2,50,000 to cover education expenses for B.Tech/MBA in India or study abroad programs.',
        income_limit: 0,
        min_marks: 0,
        age_limit: 'No age limit specified.',
        residency_requirement: 'Must be an Indian citizen and resident.',
        docs_needed: JSON.stringify(['Aadhaar Card', 'Proof of enrollment/admission for 2026 intake', 'Resume/CV']),
        application_mode: 'Online',
        apply_url: 'https://www.gyandhan.com',
        deadline: '2026-08-29',
        deadline_description: 'The application deadline is August 29, 2026 for India, and August 1, 2026 for study abroad.',
        time_min: 60,
        step_guide: '1. Visit the GyanDhan website and register for the scholarship.\n2. Complete the profile form with educational details.\n3. Upload your admission proof and identity documents.\n4. Take the online proctored aptitude test (60 minutes) covering verbal ability and logical reasoning.',
        selection: 'Entirely based on the candidate\'s performance in the online aptitude test (Logical Reasoning, Verbal Ability) and profile evaluation.',
        total_awards: 8,
        renewal: 'This is a one-time scholarship and is not renewable.',
        competitiveness: 'Medium',
        verified_status: 'Verified',
        last_verified: '2026-07-19',
        official_source: 'https://www.gyandhan.com',
        helpline: 'contact@gyandhan.com, +91 93111 24830',
        intro_seo: 'The GyanDhan Scholarship 2026 is a test-based merit award offering ₹2.5 Lakhs to students planning to enroll in India or abroad for the 2026 intake, with no minimum academic cutoff.',
        faq_json: JSON.stringify([
            { question: "Is there any academic cutoff?", answer: "No. Unlike traditional scholarships, selection is purely based on the proctored aptitude test rather than past grades." },
            { question: "What is the format of the test?", answer: "The test is a 60-minute online proctored exam containing questions on Verbal Ability/Reading Comprehension and Logical Reasoning." },
            { question: "Is it only for studies in India?", answer: "No, it supports both undergraduate/postgraduate studies in India (such as B.Tech/MBA) and international study programs." }
        ]),
        scholarship_type: 'Private',
        status: 'Active',
        verification_year: 2026,
        show_on_homepage: 1,
        is_featured: 0,
        is_popular: 1,
        priority_score: 80,
        tags: JSON.stringify(['aptitude-test', 'study-abroad', 'graduation', 'post-graduation']),
        scholarship_scope: 'Domestic',
        always_open: 0
    },
    {
        id: 'buddy4study-india-foundation-scholarship',
        slug: 'buddy4study-india-foundation-scholarship',
        title: 'Buddy4Study India Foundation Scholarship 2026',
        provider: 'Buddy4Study India Foundation',
        provider_type: 'Private',
        state: 'All India',
        level: 'Class 11-12, Graduation (UG)',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'Any Academic Stream',
        app_type: 'Online',
        amount_annual: 75000,
        amount_min: 6000,
        amount_description: 'Provides financial support ranging from ₹6,000 to ₹75,000 per year based on educational level (Class 11, Class 12, general graduation, or engineering).',
        benefits: 'Stipends/scholarships of ₹6,000 to ₹24,000 for Class 11-12, and ₹25,000 to ₹75,000 for Graduation and Engineering courses.',
        income_limit: 800000,
        min_marks: 60,
        age_limit: 'Must have passed the previous class in 2025 or 2026.',
        residency_requirement: 'Must be an Indian citizen.',
        docs_needed: JSON.stringify(['Previous Class Marksheet', 'Aadhaar Card', 'Current Year Admission Proof (ID Card / Fee Receipt)', 'Passport-size Photo', 'Income Proof / Salary Slip']),
        application_mode: 'Online',
        apply_url: 'https://www.buddy4study.com',
        deadline: '2026-08-15',
        deadline_description: 'The application deadline is August 15, 2026.',
        time_min: 30,
        step_guide: '1. Go to the Buddy4Study website.\n2. Log in or register a new profile.\n3. Search for "Buddy4Study India Foundation Scholarship".\n4. Select your level (Class 11/12, Graduation, Engineering) and start applying.\n5. Fill in information, upload documents, and submit.',
        selection: 'Based on meeting the academic requirement (minimum 60% in previous class), family income limit (≤ ₹8 Lakhs), and verification of academic documents. Special preference given to girls, PwD, orphans, and single-parent children.',
        total_awards: 0,
        renewal: 'Renewable for multi-year courses subject to maintaining 60% marks and verification of active enrollment.',
        competitiveness: 'Medium',
        verified_status: 'Verified',
        last_verified: '2026-07-19',
        official_source: 'https://www.buddy4study.com',
        helpline: 'info@buddy4study.com',
        intro_seo: 'The Buddy4Study India Foundation Scholarship 2026 offers up to ₹75,000 for Class 11, Class 12, general graduation, and engineering students with family incomes below ₹8 Lakh.',
        faq_json: JSON.stringify([
            { question: "Who is eligible?", answer: "Indian students in Class 11, 12, general graduation, or engineering who scored at least 60% in the previous class and have a family income under ₹8 Lakh." },
            { question: "What are the preference criteria?", answer: "Preference is given to female students, students with disabilities, orphans, single-parent children, and those from government schools." },
            { question: "Is it renewable?", answer: "Yes, the scholarship can be renewed annually for the course duration, subject to verification and academic promotion." }
        ]),
        scholarship_type: 'Private',
        status: 'Active',
        verification_year: 2026,
        show_on_homepage: 1,
        is_featured: 0,
        is_popular: 1,
        priority_score: 85,
        tags: JSON.stringify(['graduation', 'school', 'engineering', 'needs-based', 'merit-based']),
        scholarship_scope: 'Domestic',
        always_open: 0
    }
];

// Perform Updates
console.log('🔄 Executing database updates...');
db.transaction(() => {
    const updateStmt = db.prepare(`
        UPDATE scholarships
        SET title = ?, deadline = ?, deadline_description = ?, amount_annual = ?, amount_min = ?, 
            amount_description = ?, income_limit = ?, min_marks = ?, gender = coalesce(?, gender),
            provider_type = ?, scholarship_type = ?, scholarship_scope = ?, verified_status = ?,
            verification_year = ?, last_verified = ?, faq_json = ?
        WHERE id = ?
    `);

    for (const row of updates) {
        const info = updateStmt.run(
            row.title, row.deadline, row.deadline_description, row.amount_annual, row.amount_min,
            row.amount_description, row.income_limit, row.min_marks, row.gender || null,
            row.provider_type, row.scholarship_type, row.scholarship_scope, row.verified_status,
            row.verification_year, row.last_verified, row.faq_json,
            row.id
        );
        console.log(`Updated ${row.id}: ${info.changes} rows changed.`);
    }

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO scholarships (
            id, slug, title, provider, provider_type, state, level, caste, gender, course_stream,
            app_type, amount_annual, amount_min, amount_description, benefits, income_limit, min_marks,
            age_limit, residency_requirement, docs_needed, application_mode, apply_url, deadline,
            deadline_description, time_min, step_guide, selection, total_awards, renewal, competitiveness,
            verified_status, last_verified, official_source, helpline, intro_seo, faq_json, scholarship_type,
            status, verification_year, show_on_homepage, is_featured, is_popular, priority_score, tags,
            scholarship_scope, always_open
        ) VALUES (
            @id, @slug, @title, @provider, @provider_type, @state, @level, @caste, @gender, @course_stream,
            @app_type, @amount_annual, @amount_min, @amount_description, @benefits, @income_limit, @min_marks,
            @age_limit, @residency_requirement, @docs_needed, @application_mode, @apply_url, @deadline,
            @deadline_description, @time_min, @step_guide, @selection, @total_awards, @renewal, @competitiveness,
            @verified_status, @last_verified, @official_source, @helpline, @intro_seo, @faq_json, @scholarship_type,
            @status, @verification_year, @show_on_homepage, @is_featured, @is_popular, @priority_score, @tags,
            @scholarship_scope, @always_open
        )
    `);

    for (const row of inserts) {
        const info = insertStmt.run(row);
        console.log(`Inserted/Replaced ${row.id}: Row ID ${info.lastInsertRowid}`);
    }
})();

console.log('✅ Database updates transaction completed successfully!');
db.close();
