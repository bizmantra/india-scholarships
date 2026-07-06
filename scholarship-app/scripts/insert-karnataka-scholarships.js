const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../data/scholarships.db');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

const newScholarships = [
    {
        id: 'research-guidance-phd-fellowship-for-backward-classes-karnataka',
        slug: 'research-guidance-phd-fellowship-for-backward-classes-karnataka',
        title: 'Research Guidance PhD Fellowship for Backward Classes (Karnataka)',
        provider: 'Backward Classes Welfare Department, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'PhD & Research',
        caste: JSON.stringify(['OBC', 'BC', 'Category 1', 'Category 2A', 'Category 3A', 'Category 3B']),
        gender: 'All',
        course_stream: 'PhD',
        app_type: 'Online',
        amount_annual: 120000,
        amount_min: 120000,
        amount_description: 'Fellowship of ₹10,000 per month stipend for up to 3 years paid via Aadhaar-linked DBT.',
        benefits: 'Monthly fellowship of ₹10,000 for up to 3 years to support full-time doctoral research.',
        income_limit: 450000,
        min_marks: 55,
        age_limit: 'Maximum 35 years',
        residency_requirement: 'Must be a permanent resident of Karnataka and citizen of India',
        docs_needed: JSON.stringify(['Caste Certificate', 'Income Certificate', 'Master degree marksheet', 'PhD Registration Letter', 'Aadhaar Card', 'Bank Account details', 'Research Synopsis']),
        application_mode: 'Online',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        deadline: '2026-12-31',
        deadline_description: 'Applications typically open in October and close by December end.',
        time_min: 60,
        step_guide: '1. Register or log in to the SSP Post-Matric Portal.\n2. Complete Aadhaar-based e-KYC validation.\n3. Fill in academic, personal, and research details.\n4. Upload the required documents including the PhD registration letter.\n5. Submit online and track the institutional validation.',
        selection: 'Based on academic merit in Post-Graduation (min 55% marks) and verification of active PhD registration.',
        total_awards: 1000,
        renewal: 'Renewable annually up to 3 years based on satisfactory progress reports certified by the research guide.',
        competitiveness: 'Medium',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://bcwd.karnataka.gov.in',
        helpline: '8050770004, bcwdhelpline@karnataka.gov.in',
        intro_seo: 'The Research Guidance PhD Fellowship for Backward Classes (Karnataka) offers a monthly stipend of ₹10,000 for 3 years to students from OBC communities pursuing full-time PhD programs in recognized universities.',
        faq_json: JSON.stringify([
            { question: "What is the maximum age limit to apply?", answer: "The applicant must be 35 years old or younger at the time of application." },
            { question: "What is the family income limit?", answer: "For Category 1 candidates, the limit is ₹4.5 lakh. For Category 2A, 3A, and 3B candidates, it is ₹3.5 lakh." },
            { question: "Is there any limit to the number of beneficiaries per family?", answer: "Yes, maximum of two male members per family are eligible. There is no limit for female candidates." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 80
    },
    {
        id: 'mphil-phd-fellowship-for-minority-students-karnataka',
        slug: 'mphil-phd-fellowship-for-minority-students-karnataka',
        title: 'MPhil/PhD Fellowship for Minority Students (Karnataka)',
        provider: 'Directorate of Minorities, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'PhD & Research',
        caste: JSON.stringify(['Minority', 'Muslim', 'Christian', 'Jain', 'Buddhist', 'Sikh', 'Parsi']),
        gender: 'All',
        course_stream: 'MPhil, PhD',
        app_type: 'Online',
        amount_annual: 120000,
        amount_min: 96000,
        amount_description: 'Fellowship of ₹10,000 per month for PhD (₹8,000 per month for MPhil) scholars paid via Aadhaar Direct Benefit Transfer (DBT).',
        benefits: 'Monthly fellowship of ₹10,000 for PhD and ₹8,000 for MPhil scholars to support full-time research.',
        income_limit: 800000,
        min_marks: 55,
        age_limit: 'Maximum 35 years',
        residency_requirement: 'Must be a permanent resident of Karnataka and belong to a notified minority community.',
        docs_needed: JSON.stringify(['Minority Certificate', 'Income Certificate', 'Post-Graduation Marksheet', 'MPhil/PhD Admission Proof', 'Aadhaar Card', 'Bank Passbook']),
        application_mode: 'Online',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        deadline: '2026-12-31',
        deadline_description: 'Deadlines differ annually; check the Directorate of Minorities portal for extensions.',
        time_min: 45,
        step_guide: '1. Visit the SSP Post-Matric Portal.\n2. Create an account and complete Aadhaar verification.\n3. Navigate to the Minority Welfare Department schemes.\n4. Complete the MPhil/PhD fellowship application form.\n5. Upload necessary certificates and submit.',
        selection: 'Merit-based selection of registered scholars, subject to verification of income (under ₹8 lakh) and minority status.',
        total_awards: 500,
        renewal: 'Subject to annual submission of satisfactory research progress report signed by the head of department.',
        competitiveness: 'Medium',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://dom.karnataka.gov.in',
        helpline: '080-35254757, gokdom@gmail.com',
        intro_seo: 'The MPhil/PhD Fellowship for Minority Students in Karnataka provides monthly stipends of up to ₹10,000 to minority scholars pursuing full-time research degrees in recognized universities.',
        faq_json: JSON.stringify([
            { question: "Which communities are eligible?", answer: "Muslim, Christian, Jain, Buddhist, Sikh, and Parsi students residing in Karnataka are eligible." },
            { question: "What is the family income limit?", answer: "The annual family income from all sources must not exceed ₹8 lakh." },
            { question: "Can I receive this along with another government fellowship?", answer: "No, candidates already receiving UGC JRF/SRF or other government fellowships are not eligible." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 80
    },
    {
        id: 'national-overseas-scholarship-for-minority-communities-karnataka',
        slug: 'national-overseas-scholarship-for-minority-communities-karnataka',
        title: 'National Overseas Scholarship for Minority Communities (Karnataka)',
        provider: 'Directorate of Minorities, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'Post-Graduation (PG), PhD & Research',
        caste: JSON.stringify(['Minority', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi']),
        gender: 'All',
        course_stream: 'Master\'s, PhD, Post-Doctoral',
        app_type: 'Online',
        amount_annual: 3000000,
        amount_min: 1500000,
        amount_description: 'Up to ₹30 lakh for students with family income < ₹8 lakh; up to ₹15 lakh for family income ₹8L - ₹16L.',
        benefits: 'Covers foreign university tuition fees, living expenses, and international travel allowance.',
        income_limit: 1600000,
        min_marks: 60,
        age_limit: 'Below 38 years',
        residency_requirement: 'Permanent resident of Karnataka and belong to a notified minority community.',
        docs_needed: JSON.stringify(['Caste/Minority Certificate', 'Income Certificate', 'Passport and Visa', 'Unconditional Offer Letter', 'Aadhaar Card', 'Academic Transcripts']),
        application_mode: 'Online',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        deadline: '2026-11-30',
        deadline_description: 'Applications are usually invited in the second half of the year.',
        time_min: 90,
        step_guide: '1. Secure admission in a recognized foreign university.\n2. Apply online on the Directorate of Minorities portal.\n3. Fill in family income, course, and visa details.\n4. Upload unconditional offer letter, passport, and financial documents.\n5. Submit and submit hard copies to the Directorate office.',
        selection: 'Based on QS World University Rankings of the host institution and academic merit in qualifying exams (min 60%).',
        total_awards: 100,
        renewal: 'Renewable for the duration of the course (typically up to 2 years) subject to satisfactory academic performance.',
        competitiveness: 'High',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://dom.karnataka.gov.in',
        helpline: '080-35254757, gokdom@gmail.com',
        intro_seo: 'The National Overseas Scholarship for Minority Communities in Karnataka offers up to ₹30 lakh in financial support for minority students pursuing Master\'s, PhD, or Post-Doctoral degrees abroad.',
        faq_json: JSON.stringify([
            { question: "What is the maximum amount awarded?", answer: "Up to ₹30 lakh is awarded for family incomes below ₹8 lakh per annum, and up to ₹15 lakh for incomes between ₹8 lakh and ₹16 lakh." },
            { question: "What is the minimum marks required in the previous degree?", answer: "The applicant must have scored at least 60% marks in the qualifying degree." },
            { question: "Is there any age limit?", answer: "Yes, the applicant must be below 38 years of age at the time of application." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 85
    },
    {
        id: 'cm-raitha-vidya-nidhi-farmers-children-scholarship-karnataka',
        slug: 'cm-raitha-vidya-nidhi-farmers-children-scholarship-karnataka',
        title: 'CM Raitha Vidya Nidhi - Farmer\'s Children Scholarship (Karnataka)',
        provider: 'Agriculture Department, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'Class 11 & 12, Graduation (UG), Post-Graduation (PG), PhD & Research, Diploma / Polytechnic, ITI Courses',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'All recognized streams (General & Professional)',
        app_type: 'Online',
        amount_annual: 11000,
        amount_min: 2500,
        amount_description: 'Annual scholarship amount ranging from ₹2,500 to ₹11,000 based on course level and gender, disbursed via DBT.',
        benefits: 'Disburses ₹2,500 to ₹11,000 annually. Girls receive higher stipends to encourage higher education.',
        income_limit: 0,
        min_marks: 0,
        age_limit: 'No age limit',
        residency_requirement: 'Permanent resident of Karnataka. Parent must be a registered farmer owning agricultural land in Karnataka.',
        docs_needed: JSON.stringify(['FRUITS ID (Farmer ID)', 'Aadhaar Card', 'Student ID Proof', 'Previous Year Marksheet', 'Bank Passbook']),
        application_mode: 'Online',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        deadline: '2026-12-31',
        deadline_description: 'Applications run alongside standard SSP portal registrations.',
        time_min: 30,
        step_guide: '1. Register parents on the FRUITS Portal to get a FRUITS ID.\n2. Log in to the SSP Post-Matric Portal.\n3. Apply for the Raitha Vidya Nidhi Scheme.\n4. Enter the parent\'s FRUITS ID.\n5. Submit details to auto-validate land records and complete application.',
        selection: 'Automatic verification of land ownership through the FRUITS database. All eligible children of registered farmers receive benefits.',
        total_awards: 500000,
        renewal: 'Renewable annually by passing exams and registering for the next year of study.',
        competitiveness: 'Low',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://fruits.karnataka.gov.in',
        helpline: '18004253553, raithavidyanidhigrievences@gmail.com',
        intro_seo: 'The CM Raitha Vidya Nidhi Scholarship in Karnataka provides financial assistance between ₹2,500 and ₹11,000 per year to children of registered farmers pursuing higher education after Class 10.',
        faq_json: JSON.stringify([
            { question: "Is there any income limit for Raitha Vidya Nidhi?", answer: "No, there is no annual family income limit for this scholarship." },
            { question: "What is a FRUITS ID?", answer: "It is the Farmer Registration and Unified Beneficiary Information System ID. The land-owning parent must be registered on this portal." },
            { question: "Can failed students apply?", answer: "No, failed students or students repeating the same academic year are not eligible." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 90
    },
    {
        id: 'samagra-shikshana-karnataka-fellowship',
        slug: 'samagra-shikshana-karnataka-fellowship',
        title: 'Samagra Shikshana Karnataka Fellowship',
        provider: 'Department of School Education and Literacy, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'Post-Graduation (PG)',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'Social Sciences, Public Policy, Management (MBA, MSc, MA)',
        app_type: 'Online',
        amount_annual: 840000,
        amount_min: 840000,
        amount_description: 'Monthly stipend of ₹70,000 with a 10% annual increase based on performance.',
        benefits: 'Monthly stipend of ₹70,000 to support fellows working on educational quality policy and literacy initiatives.',
        income_limit: 0,
        min_marks: 0,
        age_limit: 'Maximum 35 years',
        residency_requirement: 'Indian citizen with preference for Karnataka state residents fluent in Kannada.',
        docs_needed: JSON.stringify(['Postgraduate Degree Certificate', 'Work Experience Letters', 'Resume', 'Aadhaar Card', 'Kannada Language Proof']),
        application_mode: 'Online',
        apply_url: 'https://www.dsel-education.gov.in',
        deadline: '2026-12-31',
        deadline_description: 'Note: Scheme is currently closed/inactive. Check portal for next cycle recruitment.',
        time_min: 60,
        step_guide: '1. Keep watch on the School Education department recruitment portal.\n2. Submit online application form with professional details.\n3. Upload CV and statement of purpose.\n4. Shortlisted candidates undergo interviews and case analysis.',
        selection: 'Rigorous selection process including CV shortlisting, group discussions, and personal interviews.',
        total_awards: 20,
        renewal: 'Renewable for one more year based on performance evaluation at the end of Year 1.',
        competitiveness: 'High',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://www.dsel-education.gov.in',
        helpline: '080-23475188',
        intro_seo: 'The Samagra Shikshana Karnataka Fellowship is a prestigious program offering a monthly stipend of ₹70,000 to postgraduates working to improve policy and educational quality.',
        faq_json: JSON.stringify([
            { question: "Is this fellowship currently open?", answer: "No, this fellowship is currently closed/inactive. Check the official department website for future cycles." },
            { question: "What is the stipend amount?", answer: "Fellows receive ₹70,000 per month with provision for a 10% annual increase." },
            { question: "Is Kannada language knowledge mandatory?", answer: "Yes, proficiency in both written and spoken Kannada is required." }
        ]),
        scholarship_type: 'Government',
        status: 'Closed',
        verification_year: 2026,
        priority_score: 50
    },
    {
        id: 'incentive-for-sslc-2nd-puc-students-minorities-karnataka',
        slug: 'incentive-for-sslc-2nd-puc-students-minorities-karnataka',
        title: 'Incentive for SSLC & 2nd PUC Students - Minorities (Karnataka)',
        provider: 'Directorate of Minorities, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'Class 1 to 10, Class 11 & 12',
        caste: JSON.stringify(['Minority', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi']),
        gender: 'All',
        course_stream: 'Class 10 (SSLC), Class 12 (2nd PUC)',
        app_type: 'Online',
        amount_annual: 20000,
        amount_min: 10000,
        amount_description: 'One-time incentive of ₹10,000 for SSLC and ₹20,000 for 2nd PUC toppers scoring 85%+.',
        benefits: 'One-time cash incentive: ₹10,000 for SSLC toppers, ₹20,000 for 2nd PUC toppers.',
        income_limit: 0,
        min_marks: 85,
        age_limit: 'No age limit',
        residency_requirement: 'Permanent resident of Karnataka belonging to a notified minority community.',
        docs_needed: JSON.stringify(['Minority Certificate', 'SSLC/PUC Marksheet', 'Aadhaar Card', 'Bank Passbook', 'Domicile Proof']),
        application_mode: 'Online',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        deadline: '2026-10-31',
        deadline_description: 'Applications open shortly after board results and close around October.',
        time_min: 30,
        step_guide: '1. Wait for board results to be published.\n2. Visit the SSP or Directorate of Minorities website.\n3. Access the SSLC/2nd PUC Incentive Scheme link.\n4. Log in and enter board registration details to fetch marks.\n5. Upload marks card and caste/minority certificate, then submit.',
        selection: 'Merit-based selection of top 1,000 eligible minority students scoring 85% or above in board exams.',
        total_awards: 2000,
        renewal: 'No renewal. This is a one-time incentive award upon passing the boards.',
        competitiveness: 'High',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://dom.karnataka.gov.in',
        helpline: '080-35254757, gokdom@gmail.com',
        intro_seo: 'The Incentive for SSLC & 2nd PUC Students - Minorities (Karnataka) offers a one-time cash award of up to ₹20,000 to top minority students scoring 85% or above in board exams.',
        faq_json: JSON.stringify([
            { question: "What is the minimum marks requirement?", answer: "Students must score at least 85% or more in their SSLC (Class 10) or 2nd PUC (Class 12) board examinations." },
            { question: "What is the incentive amount?", answer: "SSLC students receive ₹10,000 and 2nd PUC students receive ₹20,000." },
            { question: "Are ICSE/CBSE board students eligible?", answer: "The scheme primarily targets students passing state board examinations conducted by Karnataka boards. Check official circulars for CBSE eligibility." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 80
    },
    {
        id: 'labour-department-scheme-for-unorganized-workers-children-karnataka',
        slug: 'labour-department-scheme-for-unorganized-workers-children-karnataka',
        title: 'Labour Department Scheme for Unorganized Workers\' Children (Karnataka)',
        provider: 'Karnataka Labour Welfare Board, Government of Karnataka',
        provider_type: 'State Government',
        state: 'Karnataka',
        level: 'Class 1 to 10, Class 11 & 12, Graduation (UG), Post-Graduation (PG), PhD & Research, Diploma / Polytechnic, ITI Courses',
        caste: JSON.stringify(['General', 'OBC', 'SC', 'ST', 'EWS', 'All']),
        gender: 'All',
        course_stream: 'All recognized streams (Class 1 to PhD)',
        app_type: 'Online',
        amount_annual: 11000,
        amount_min: 1100,
        amount_description: 'Annual educational assistance of ₹1,100 to ₹11,000 depending on course level and category.',
        benefits: 'Annual scholarship assistance: School (Class 1-10): ₹1,100-3,000, PUC/Diploma: ₹4,600, Degrees/Master\'s/PhD: ₹6,000-11,000.',
        income_limit: 420000,
        min_marks: 50,
        age_limit: 'No age limit',
        residency_requirement: 'Permanent resident of Karnataka. Parent must be a registered worker contributing to the Labour Welfare Fund.',
        docs_needed: JSON.stringify(['Labour Card / Contribution Proof', 'Aadhaar Card', 'Student Marksheet', 'College Fee Receipt', 'Bank Passbook']),
        application_mode: 'Online',
        apply_url: 'https://klwbapps.karnataka.gov.in',
        deadline: '2026-12-31',
        deadline_description: 'Applications are processed annually on the KLWB portal.',
        time_min: 40,
        step_guide: '1. Register on the KLWB official portal.\n2. Complete profile registration for student and worker-parent.\n3. Enter Labour Card / Welfare Fund contribution details.\n4. Upload academic transcripts, fees receipt, and labour card.\n5. Submit application and wait for board review.',
        selection: 'Selection is merit-cum-need based. Verification of parent\'s active registration and contribution to the welfare fund is mandatory.',
        total_awards: 10000,
        renewal: 'Renewable annually by submitting fresh academic transcripts and updated labour card details.',
        competitiveness: 'Medium',
        verified_status: 'Official',
        last_verified: '2026-07-06',
        official_source: 'https://klwbapps.karnataka.gov.in',
        helpline: '080-23475188, 8277291175',
        intro_seo: 'The Labour Department Scheme for Unorganized Workers\' Children (Karnataka) provides annual educational assistance from ₹1,100 to ₹11,000 to children of registered workers.',
        faq_json: JSON.stringify([
            { question: "What is the family income limit?", answer: "The monthly family income should not exceed ₹35,000 (annual equivalent: ₹4.20 Lakh)." },
            { question: "What is the minimum marks required?", answer: "General category students require at least 50% marks in their previous exam. SC/ST students require at least 45% marks." },
            { question: "How many children per family can apply?", answer: "The assistance is limited to a maximum of two children per family." }
        ]),
        scholarship_type: 'Government',
        status: 'Active',
        verification_year: 2026,
        priority_score: 80
    }
];

const columns = db.prepare("PRAGMA table_info(scholarships)").all().map(c => c.name);

const insertStmt = db.prepare(`
    INSERT INTO scholarships (${columns.join(', ')})
    VALUES (${columns.map(c => '@' + c).join(', ')})
    ON CONFLICT(id) DO UPDATE SET
        ${columns.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')}
`);

let inserted = 0;
const transaction = db.transaction((rows) => {
    for (const r of rows) {
        // Build data object with defaults for missing columns
        const data = {};
        columns.forEach(col => {
            if (r.hasOwnProperty(col)) {
                data[col] = r[col];
            } else if (col === 'scholarship_type') {
                data[col] = 'Government';
            } else if (col === 'status') {
                data[col] = 'Active';
            } else if (col === 'priority_score') {
                data[col] = 50;
            } else if (col === 'show_on_homepage' || col === 'is_featured' || col === 'is_popular') {
                data[col] = 0;
            } else {
                data[col] = null;
            }
        });
        insertStmt.run(data);
        inserted++;
    }
});

try {
    transaction(newScholarships);
    console.log(`🎉 Successfully inserted/updated ${inserted} Karnataka scholarships in the database.`);
} catch (error) {
    console.error('❌ Database insertion failed:', error);
} finally {
    db.close();
}
