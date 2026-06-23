const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const updates = [
    {
        slug: 'tamil-nadu-post-matric-scholarship-for-scst',
        amount_annual: 20000,
        amount_min: 4000,
        amount_description: 'Reimbursement of tuition and compulsory non-refundable fees as fixed by the Fee Committee, plus a monthly maintenance allowance via DBT.',
        min_marks: 33,
        selection: 'Based on SC/ST/SCA/SCC community status, enrollment in post-matric courses, and family income limit <= ₹2.5 Lakhs per annum.',
        renewal: 'Annual renewal required on the TN State Scholarship portal, passing the previous academic year with satisfactory progress and attendance.',
        helpline: '1800-345-6770, support.tnscholarship@tn.gov.in',
        official_source: 'https://tn.gov.in',
        apply_url: 'https://tn.gov.in',
        faq_json: [
            {
                question: "What is the family income limit for TN Post-Matric SC/ST scholarship?",
                answer: "The annual family income from all sources must not exceed ₹2.5 Lakhs."
            },
            {
                question: "Do I need to apply online every year?",
                answer: "Yes, fresh candidates must register on the portal, while continuing candidates must submit a renewal application for subsequent years."
            },
            {
                question: "How is the scholarship amount paid?",
                answer: "The fee reimbursement and maintenance allowances are disbursed directly via DBT into the student's Aadhaar-seeded bank account."
            }
        ]
    },
    {
        slug: 'post-matric-scholarship-for-sc-students-odisha',
        amount_annual: 15000,
        amount_min: 5500,
        amount_description: 'Full course fee coverage plus maintenance allowance of ₹550/month (day scholars) to ₹1,200/month (hostellers), paid directly via DBT.',
        min_marks: 33,
        selection: 'Direct sanctioning based on SC community status, family income <= ₹2.5 Lakhs, and certificate verification on the Odisha State Scholarship Portal.',
        renewal: 'Requires annual renewal application through the Odisha State Scholarship Portal, showing continuous academic progression.',
        helpline: '155335, 1800-345-6770',
        official_source: 'https://scholarship.odisha.gov.in',
        apply_url: 'https://scholarship.odisha.gov.in',
        faq_json: [
            {
                question: "Is there a minimum marks cutoff for SC students?",
                answer: "No, SC students only need to pass their previous class. There is no higher percentage cutoff."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Log in to the Odisha State Scholarship Portal, click on 'Know Your Status', select 'Application Status', and enter your Aadhaar/Application Number."
            },
            {
                question: "What is the family income limit?",
                answer: "The annual household income limit from all sources must be less than or equal to ₹2.5 Lakhs."
            }
        ]
    },
    {
        slug: 'bharti-airtel-scholarship-program',
        amount_annual: 150000,
        amount_min: 50000,
        amount_description: '100% tuition fee reimbursement and hostel/mess charges covered for the entire course, plus a new laptop in the first year.',
        min_marks: 75,
        selection: 'Merit-cum-means based on admission to a top 50 NIRF engineering college and family income <= ₹8.5 Lakhs. Preference for girls, single parents, and disabled candidates.',
        renewal: 'Requires maintaining a minimum CGPA and attendance without backlogs as per the Foundation guidelines.',
        helpline: 'info@bhartiairtelfoundation.org',
        official_source: 'https://bhartiairtelfoundation.org',
        apply_url: 'https://bhartiairtelfoundation.org',
        faq_json: [
            {
                question: "Can general category students apply?",
                answer: "Yes, it is open to all categories, provided the student is admitted to a top 50 NIRF-ranked engineering college and family income is under ₹8.5 Lakhs."
            },
            {
                question: "Does it cover private engineering colleges?",
                answer: "Yes, provided the private engineering college is ranked within the top 50 under the NIRF engineering rankings."
            },
            {
                question: "Is there a girl student preference?",
                answer: "Yes, the foundation actively prioritizes girl students, disabled candidates, and orphans during selection."
            }
        ]
    },
    {
        slug: 'post-matric-scholarship-for-obc-students-karnataka',
        amount_annual: 20000,
        amount_min: 4000,
        amount_description: 'Fee reimbursement (tuition and admission fees) and a maintenance allowance ranging from ₹4,000 to ₹20,000+ per year based on course and hostel status.',
        min_marks: 50,
        selection: 'Based on OBC category, family income limits (under ₹1L for OBC 2A/3A/3B, under ₹2.5L for Category 1), and certificate verification on the SSP portal.',
        renewal: 'Requires annual renewal on the SSP portal, passing the previous academic year, and maintaining required attendance.',
        helpline: '1902, 8050770004 / 8050770005',
        official_source: 'https://ssp.postmatric.karnataka.gov.in',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        faq_json: [
            {
                question: "What is the family income limit for OBC students?",
                answer: "The annual income limit is ₹1,00,000 for Category 2A, 3A, and 3B, and ₹2,50,000 for Category 1 students."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Log in to the SSP portal, go to the 'Track Student Status' tab, select the academic year, and check the Backward Classes Welfare Department sanction status."
            },
            {
                question: "Can I apply if I live in a government hostel?",
                answer: "Students residing in government hostels are eligible for fee reimbursement but will receive a reduced maintenance allowance since boarding is already provided."
            }
        ]
    },
    {
        slug: 'pudhumai-penn-scheme-tamil-nadu',
        amount_annual: 12000,
        amount_min: 12000,
        amount_description: '₹1,000 per month (₹12,000 per year) disbursed directly to the student\'s Aadhaar-seeded bank account via Direct Benefit Transfer (DBT).',
        min_marks: 33,
        selection: 'Automatic eligibility for girl students who studied in government schools from Class 6 to 12 and are enrolled in recognized higher education courses in Tamil Nadu.',
        renewal: 'Requires continuous enrollment and verification by college authorities of attendance and regular course progression.',
        helpline: '9150056809, 9150056805, 9150056801, 9150056810',
        official_source: 'https://pudhumpenn.tn.gov.in',
        apply_url: 'https://pudhumpenn.tn.gov.in',
        step_guide: `### Step-by-Step Application & Tracking Guide:
1. **Verification by College:** The application process is initiated by your college nodal officer. Provide them with your Aadhaar, bank passbook, and school transfer certificate (proving study in govt. school from Class 6 to 12).
2. **Data Submission:** The college uploads your details onto the official Pudhumai Penn portal.
3. **Seeding check:** Ensure your bank account is active, Aadhaar-linked, and enabled for Direct Benefit Transfer (DBT).
4. **Status Tracking:** Log in with your registration details on the official portal [pudhumpenn.tn.gov.in](https://pudhumpenn.tn.gov.in) to verify status.`,
        docs_needed: JSON.stringify(['Aadhaar Card', 'Govt School Study Certificate (Class 6-12)', 'College Admission Proof / Fee Receipt', 'Bank Passbook Copy (Aadhaar linked)', 'Passport Size Photo']),
        faq_json: [
            {
                question: "Can I apply if I am already receiving another scholarship?",
                answer: "Yes, the Pudhumai Penn scheme is an incentive and can generally be combined with other government/private scholarship programs."
            },
            {
                question: "Is there any family income limit?",
                answer: "No, there is no annual family income limit to qualify for this incentive scheme."
            },
            {
                question: "Do I need to apply online directly?",
                answer: "No, applications are uploaded directly by your college administration. Students do not need to fill out individual registration forms on the portal."
            }
        ]
    },
    {
        slug: 'infosys-foundation-stem-stars-scholarship-program',
        amount_annual: 100000,
        amount_min: 50000,
        amount_description: 'Up to ₹1,00,000 per year to cover tuition fees, hostel, mess, and study materials, disbursed directly to the student.',
        min_marks: 33,
        selection: 'Merit-based on Class 12 board marks and JEE/NEET entrance ranks, targeting girl candidates with family income <= ₹8 Lakhs.',
        renewal: 'Requires maintaining a clean academic record without backlogs and regular attendance as per the foundation\'s rules.',
        helpline: '011-430-92248 (Ext. 351), infosysstemstars@buddy4study.com',
        official_source: 'https://www.buddy4study.com',
        apply_url: 'https://www.buddy4study.com',
        faq_json: [
            {
                question: "Is this scholarship open to boys?",
                answer: "No, the Infosys Foundation STEM Stars Scholarship is strictly for female candidates pursuing undergraduate degrees in STEM fields."
            },
            {
                question: "What courses are eligible?",
                answer: "First-year undergraduate STEM degrees (Engineering, MBBS, Integrated MSc, B.Arch, etc.) in NIRF-accredited or reputable government-recognized colleges."
            },
            {
                question: "What is the family income limit?",
                answer: "The annual household income limit from all sources must not exceed ₹8 Lakhs."
            }
        ]
    },
    {
        slug: 'punjab-post-matric-scholarship-for-scbc-students',
        amount_annual: 20000,
        amount_min: 4500,
        amount_description: 'Full tuition fee reimbursement and monthly maintenance allowance ranging from ₹380 to ₹760 depending on course level and hostel status.',
        min_marks: 33,
        selection: 'Merit-cum-means selection based on community status (SC/BC) and family income limit (under ₹2.5L for SC, under ₹1.5L for BC) processed via Dr. Ambedkar portal.',
        renewal: 'Requires annual renewal application through the portal, passing the previous academic year with no backlogs, and submission of verified attendance.',
        helpline: '0172-2740335, feedback.sjd@punjab.gov.in',
        official_source: 'https://scholarships.punjab.gov.in',
        apply_url: 'https://scholarships.punjab.gov.in',
        faq_json: [
            {
                question: "What is the family income limit?",
                answer: "The annual household income limit is ₹2.5 Lakhs for SC category candidates, and ranges between ₹1.0 Lakh and ₹1.5 Lakhs for BC/OBC category candidates."
            },
            {
                question: "How do I check my payment status?",
                answer: "Log in to the Dr. Ambedkar Scholarship portal (scholarships.punjab.gov.in), navigate to your student profile, and view your department verification and disbursement status."
            },
            {
                question: "Do I need to submit physical copies?",
                answer: "Yes, after submitting the application online, you must print the form and submit a hard copy set with your certificates to your college's scholarship nodal officer."
            }
        ]
    }
];

try {
    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_annual = ?, 
            amount_min = ?, 
            amount_description = ?, 
            min_marks = ?, 
            selection = ?, 
            renewal = ?, 
            helpline = ?, 
            official_source = ?, 
            apply_url = ?, 
            step_guide = COALESCE(?, step_guide), 
            docs_needed = COALESCE(?, docs_needed),
            faq_json = ?,
            verified_status = 'Verified',
            last_verified = datetime('now')
        WHERE slug = ?
    `);

    db.transaction(() => {
        updates.forEach(u => {
            console.log(`Updating ${u.slug}...`);
            updateStmt.run(
                u.amount_annual,
                u.amount_min,
                u.amount_description,
                u.min_marks,
                u.selection,
                u.renewal,
                u.helpline,
                u.official_source,
                u.apply_url,
                u.step_guide || null,
                u.docs_needed || null,
                JSON.stringify(u.faq_json),
                u.slug
            );
        });
    })();

    console.log('🎉 SQLite Database successfully enriched for Tier 2 Scholarships!');
} catch (err) {
    console.error('❌ Error updating database:', err);
} finally {
    db.close();
}
