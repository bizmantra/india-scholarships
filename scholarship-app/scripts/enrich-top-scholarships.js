const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
console.log('✏️ Database path:', dbPath);

const db = new Database(dbPath);

// 1. Nabanna Scholarship West Bengal
const nabanna = {
    amount_annual: 10000,
    amount_min: 10000,
    amount_description: '₹10,000 one-time financial assistance grant per academic year.',
    benefits: 'A financial grant of ₹10,000 to cover college fees, books, and educational expenses.',
    min_marks: 50, // 50% to less than 60%
    docs_needed: JSON.stringify([
        'Copy of Marksheets (Madhyamik onwards)',
        'Copy of Admission Receipt for current course',
        'Copy of Bank Passbook (front page showing Account No & IFSC)',
        'Income Certificate from Group-A Gazetted Officer (MLA/MP/BDO)',
        'Self-Declaration Copy attested by school head/principal',
        'Recommendation Letter from local MLA or MP'
    ]),
    step_guide: `### Step-by-Step Application Guide:
1. **Visit the official portal:** Go to the Chief Minister's Relief Fund (CMRF) website at [cmrf.wb.gov.in](https://cmrf.wb.gov.in).
2. **Register Online:** Click on "Apply for Financial Assistance for Education" and register with your mobile number.
3. **Fill the Form:** Log in and fill in all personal, academic, and banking details.
4. **Attestation & Recommendation:** Obtain a recommendation letter from your local MLA/MP. Scan and upload it along with other documents.
5. **Upload Documents:** Upload scanned copies of your marksheet, admission receipt, income certificate, and bank passbook.
6. **Submit:** Double-check your details and submit the application online. Keep a printout of the reference number for tracking.`,
    faq_json: JSON.stringify([
        {
            question: "Who is eligible for the Nabanna Scholarship?",
            answer: "Meritorious students who are permanent residents of West Bengal, studying in a state-recognized institution, with an annual family income of less than ₹1,20,000, and who scored 50% or more but less than 60% (less than 53% for PG) in their last qualifying exam."
        },
        {
            question: "Can I apply if I scored above 60%?",
            answer: "No. If you score 60% or above, you are eligible for the higher-value Swami Vivekananda Scholarship (SVMCM). Nabanna is specifically for students scoring between 50% and 59%."
        },
        {
            question: "What is the application deadline?",
            answer: "There is no fixed deadline. Applications for the Nabanna scholarship are open throughout the year."
        }
    ]),
    helpline: '033-22145555 / 033-22143101, Email: cmwb@nic.in',
    official_source: 'https://cmrf.wb.gov.in',
    apply_url: 'https://cmrf.wb.gov.in'
};

// 2. Swami Vivekananda Merit-cum-Means Scholarship (SVMCM)
const svmcm = {
    amount_annual: 96000,
    amount_min: 12000,
    amount_description: '₹12,000 to ₹96,000 per year (₹1,000 to ₹8,000 per month depending on the course).',
    min_marks: 60,
    helpline: '1800-102-8014, Email: helpdesk.svmcm-wb@gov.in',
    official_source: 'https://svmcm.wb.gov.in',
    apply_url: 'https://svmcm.wb.gov.in'
};

// 3. Mukhyamantri Medhavi Vidyarthi Yojana (MMVY) Madhya Pradesh
const mmvy = {
    amount_annual: 150000, // covers full tuition fees up to caps
    amount_min: 50000,
    amount_description: '100% tuition fee reimbursement for government & private colleges.',
    benefits: 'Covers 100% of college tuition fees for undergraduate engineering, medical, law, and degree courses.',
    helpline: '0755-2660063, Email: mmvyhelpline.dte@mp.gov.in',
    official_source: 'http://shiksha.samagra.gov.in',
    apply_url: 'http://shiksha.samagra.gov.in'
};

// 4. Jharkhand e-Kalyan Post-Matric Scholarship
const ekalyan = {
    amount_annual: 80000,
    amount_min: 15000,
    amount_description: 'Variable amount covering tuition fees and maintenance allowance based on course.',
    min_marks: 50,
    helpline: '040-23120312, Email: helpdesk.ekalyan@gmail.com',
    official_source: 'https://ekalyan.cgc.gov.in',
    apply_url: 'https://ekalyan.cgc.gov.in'
};

try {
    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_annual = ?, amount_min = ?, amount_description = ?, 
            benefits = COALESCE(?, benefits), min_marks = COALESCE(?, min_marks), 
            docs_needed = COALESCE(?, docs_needed), step_guide = COALESCE(?, step_guide), 
            faq_json = COALESCE(?, faq_json), helpline = ?, official_source = ?, apply_url = ?
        WHERE slug = ?
    `);

    // Run updates
    console.log('Updating Nabanna West Bengal...');
    updateStmt.run(
        nabanna.amount_annual, nabanna.amount_min, nabanna.amount_description,
        nabanna.benefits, nabanna.min_marks, nabanna.docs_needed, nabanna.step_guide,
        nabanna.faq_json, nabanna.helpline, nabanna.official_source, nabanna.apply_url,
        'nabanna-scholarship-west-bengal'
    );

    console.log('Updating SVMCM West Bengal...');
    updateStmt.run(
        svmcm.amount_annual, svmcm.amount_min, svmcm.amount_description,
        null, svmcm.min_marks, null, null,
        null, svmcm.helpline, svmcm.official_source, svmcm.apply_url,
        'swami-vivekananda-merit-cum-means-scholarship-svmcm'
    );

    console.log('Updating MMVY Madhya Pradesh...');
    updateStmt.run(
        mmvy.amount_annual, mmvy.amount_min, mmvy.amount_description,
        mmvy.benefits, null, null, null,
        null, mmvy.helpline, mmvy.official_source, mmvy.apply_url,
        'mukhyamantri-medhavi-vidyarthi-yojana-mmvy'
    );

    console.log('Updating e-Kalyan Jharkhand...');
    updateStmt.run(
        ekalyan.amount_annual, ekalyan.amount_min, ekalyan.amount_description,
        null, ekalyan.min_marks, null, null,
        null, ekalyan.helpline, ekalyan.official_source, ekalyan.apply_url,
        'jharkhand-e-kalyan-post-matric-scholarship'
    );

    console.log('🎉 DB Enrichment completed successfully!');
} catch (err) {
    console.error('❌ Database update error:', err);
} finally {
    db.close();
}
