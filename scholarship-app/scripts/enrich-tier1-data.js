const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const updates = [
    {
        slug: 'reliance-foundation-undergraduate-scholarship',
        amount_annual: 200000,
        amount_min: 50000,
        amount_description: 'Up to ₹2 Lakhs total grant over the duration of the degree programme, disbursed directly to the student\'s bank account.',
        min_marks: 60,
        selection: 'Based on Standard 12th marks, family income priority (preference under ₹2.5 Lakhs), and a mandatory online aptitude test measuring verbal, analytical, and numerical ability.',
        renewal: 'Requires maintaining a minimum CGPA and regular attendance without any backlogs as per the Foundation guidelines.',
        helpline: '+91-7977-100-100, RF.Scholarship@reliancefoundation.org',
        official_source: 'https://scholarships.reliancefoundation.org',
        apply_url: 'https://scholarships.reliancefoundation.org/Undergraduate_Scholarship.aspx',
        faq_json: [
            {
                question: "Can I apply for this if I am already receiving another scholarship?",
                answer: "No, candidates receiving Wipro or other major private/government corporate scholarships are typically not allowed to hold multiple corporate awards simultaneously."
            },
            {
                question: "How do I check my scholarship application status?",
                answer: "Log in to the official Reliance Foundation Scholarships portal using your email and mobile number to track the status of your aptitude test and shortlisting."
            },
            {
                question: "What is the family income limit for eligibility?",
                answer: "Total annual household income must be below ₹15 Lakhs, with priority given to candidates whose family income is below ₹2.5 Lakhs."
            }
        ]
    },
    {
        slug: 'hdfc-bank-parivartan-ecss-scholarship',
        amount_annual: 75000,
        amount_min: 15000,
        amount_description: '₹15,000 to ₹75,000 per year depending on the course level (Schooling, Diploma, ITI, UG, or PG), disbursed directly to the bank account.',
        min_marks: 55,
        selection: 'Merit-cum-need. Preference given to students facing family crisis (death of earning member, terminal illness, job loss) with family income <= ₹2.5 Lakhs.',
        renewal: 'Requires submitting a fresh or renewal application showing continuation of academic criteria (minimum 55% marks) and verification of current family status.',
        helpline: '+91-8527-484-563, hdfcbankecss@buddy4study.com',
        official_source: 'https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme',
        apply_url: 'https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme',
        faq_json: [
            {
                question: "Can I apply for this if I am already receiving another scholarship?",
                answer: "Generally, students receiving any other government or private scholarship for the same academic year are ineligible unless specific permission is granted."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "You can check your application progress and disbursement status through your dashboard on the Buddy4Study portal where you submitted the form."
            },
            {
                question: "What is the family income limit for eligibility?",
                answer: "The annual household income limit is ₹2.5 Lakhs, and applicants must present income certificates and proof of a family crisis."
            }
        ]
    },
    {
        slug: 'e-grantz-kerala-scstoecobc-support',
        amount_annual: 20000,
        amount_min: 5000,
        amount_description: 'Full tuition and exam fee coverage plus a monthly maintenance allowance of ₹500 to ₹1,500 based on hostel and course level.',
        min_marks: 33,
        selection: 'Automatic eligibility for SC/ST/OEC candidates; OBC candidates selected based on family income under ₹1,00,000.',
        renewal: 'Annual renewal on the E-Grantz portal, requiring 75% monthly attendance and passing progression.',
        helpline: '0471-2303230, egrantz.helpdesk@kerala.gov.in',
        official_source: 'https://egrantz.kerala.gov.in',
        apply_url: 'https://egrantz.kerala.gov.in',
        faq_json: [
            {
                question: "Can I apply for this if I am already receiving another scholarship?",
                answer: "No, E-Grantz cannot be combined with other state or central government scholarship schemes."
            },
            {
                question: "How do I check my scholarship status?",
                answer: "Go to the official E-Grantz 3.0 portal (egrantz.kerala.gov.in), log in using your Aadhaar OTR, and click on 'Application Status'."
            },
            {
                question: "What is the family income limit for OBC students?",
                answer: "For OBC/Other Backward Communities, the annual family income limit is ₹1,00,000. SC/ST and OEC candidates are exempt from income limits."
            }
        ]
    },
    {
        slug: 'azim-premji-scholarship',
        amount_annual: 30000,
        amount_min: 30000,
        amount_description: '₹30,000 per year for the entire duration of the undergraduate degree or diploma course, disbursed directly to the bank account.',
        min_marks: 33,
        selection: 'Need-based evaluation prioritising girls from disadvantaged backgrounds who completed Class 10 & 12 from government schools.',
        renewal: 'Annual renewal based on regular attendance and satisfactory academic progression (no backlogs).',
        helpline: '+91 80 3509 9765, 90199-60536 (WhatsApp), scholarship@azimpremjifoundation.org',
        official_source: 'https://azimpremjifoundation.org',
        apply_url: 'https://azimpremjifoundation.org',
        faq_json: [
            {
                question: "Can I apply if I am already receiving another scholarship?",
                answer: "Yes, but preference is given to female students who do not hold any other major scholarship support."
            },
            {
                question: "How do I check my scholarship application status?",
                answer: "Official selections are communicated directly via email/SMS, and you can track updates on the Azim Premji Foundation portal."
            },
            {
                question: "Is there any minimum marks requirement?",
                answer: "No, there is no minimum academic marks cutoff; it is a need-based scholarship to support female students from underprivileged backgrounds."
            }
        ]
    },
    {
        slug: 'ongc-scholarship-csr',
        amount_annual: 48000,
        amount_min: 48000,
        amount_description: '₹48,000 per year paid annually via direct bank transfer, renewable until course completion.',
        min_marks: 60,
        selection: 'Merit-based on previous qualifying exam marks (Class 12 for UG, Graduation for PG) and family income. 50% reservation for female candidates.',
        renewal: 'Requires maintaining a minimum of 60% marks or 6.0 CGPA in annual examinations with clean academic progression.',
        helpline: '011-22406854, 011-22406859, info@ongcfoundation.org',
        official_source: 'https://ongcscholar.org',
        apply_url: 'https://ongcscholar.org',
        step_guide: `### Step-by-Step Application Guide:
1. **Register Online:** Visit the official portal [ongcscholar.org](https://ongcscholar.org) and register.
2. **Fill Details:** Complete personal, academic, and banking information.
3. **Upload Documents:** Attach scanned marksheets, caste/income proof, and admission receipts.
4. **Submit & Print:** Verify and submit. Print the receipt.`,
        docs_needed: JSON.stringify(['Class 10 Marksheet', 'Class 12 Marksheet', 'Income Certificate', 'Caste Certificate (if SC/ST/OBC)', 'Aadhaar Card', 'Admission Letter', 'Bank Passbook Copy']),
        faq_json: [
            {
                question: "Can I apply for this if I am already receiving another scholarship?",
                answer: "No, candidates must not be availing of any other scholarship or financial assistance scheme."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Log in to the ONGC Scholar portal and view the 'Payment Status' dashboard where direct bank transfer transaction details are updated."
            },
            {
                question: "What is the family income limit?",
                answer: "The annual family income limit is ₹2 Lakhs for OBC/General (EWS) students, and ₹4.5 Lakhs for SC/ST students."
            }
        ]
    },
    {
        slug: 'ugc-junior-research-fellowship-jrf',
        amount_annual: 444000,
        amount_min: 444000,
        amount_description: '₹37,000 per month for the first two years (JRF), and ₹42,000 per month for the remaining tenure (SRF), plus HRA and contingency grants.',
        min_marks: 55,
        selection: 'Qualified candidates selected based on merit in the UGC NET National Eligibility Test.',
        renewal: 'Subject to evaluation of research progress by a three-member committee after two years for upgrade to SRF.',
        helpline: '011-40759000, 011-69227700, ugcnet@nta.ac.in',
        official_source: 'https://ugcnet.nta.nic.in',
        apply_url: 'https://ugcnet.nta.nic.in',
        faq_json: [
            {
                question: "What is the qualifying marks percentage?",
                answer: "Candidates must secure at least 55% marks (50% for SC/ST/OBC/PWD) in their Master's degree."
            },
            {
                question: "How do I check my JRF award status?",
                answer: "Qualified candidates can download their JRF Award Letter from the NTA UGC NET official website using their application number and DOB."
            },
            {
                question: "Is there any age limit?",
                answer: "Yes, candidates must be under 30 years of age (relaxations of up to 5 years for SC/ST/OBC/Women/PwD candidates)."
            }
        ]
    },
    {
        slug: 'post-matric-scholarship-for-sc-students-karnataka',
        amount_annual: 25000,
        amount_min: 2500,
        amount_description: 'Full tuition fee reimbursement and maintenance allowance ranging from ₹2,500 to ₹13,500 per year depending on the course group, disbursed directly via SSP.',
        min_marks: 35,
        selection: 'Automatic sanctioning for all eligible SC candidates who satisfy the income limit and verify their certificates on the SSP portal.',
        renewal: 'Requires annual renewal application through the SSP portal, passing the previous academic year with no backlogs, and maintaining required attendance.',
        helpline: '1902 (SSP Helpdesk), postmatrichelp@karnataka.gov.in',
        official_source: 'https://ssp.postmatric.karnataka.gov.in',
        apply_url: 'https://ssp.postmatric.karnataka.gov.in',
        faq_json: [
            {
                question: "Can I apply for this if I am already receiving another scholarship?",
                answer: "No, you cannot hold more than one government post-matric scholarship simultaneously."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Log in to the SSP portal (ssp.karnataka.gov.in), go to the 'Track Student Status' tab, select the academic year, and view your payment and sanction details."
            },
            {
                question: "What is the family income limit?",
                answer: "The annual family income must be below ₹2.5 Lakhs to qualify for the SC category post-matric scheme."
            }
        ]
    },
    {
        slug: 'mukhyamantri-kanya-utthan-yojana-graduation',
        amount_annual: 50000,
        amount_min: 50000,
        amount_description: '₹50,000 one-time incentive grant paid directly via Aadhaar DBT to the student\'s bank account.',
        min_marks: 35,
        selection: 'Direct disbursement to all eligible unmarried female candidates who successfully graduate from a recognized university in Bihar and are on the university upload list.',
        renewal: 'Non-renewable (one-time financial incentive).',
        helpline: 'mkuysnatakhelp@gmail.com, 0612-2230059',
        official_source: 'https://medhasoft.bih.nic.in',
        apply_url: 'https://medhasoft.bih.nic.in',
        faq_json: [
            {
                question: "Is there any minimum graduation marks cutoff?",
                answer: "No, you only need to pass graduation. There is no minimum percentage cutoff."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Visit the Medhasoft portal, click on 'Payment Status', enter your university registration number, and track the DBT sanction."
            },
            {
                question: "Can married graduates apply?",
                answer: "No, the scheme is strictly limited to unmarried female graduates at the time of graduation."
            }
        ]
    },
    {
        slug: 'post-matric-scholarship-for-st-students-odisha',
        amount_annual: 15000,
        amount_min: 5500,
        amount_description: 'Course fee coverage plus maintenance allowance of ₹550/month (day scholars) to ₹1,200/month (hostellers), paid directly via DBT.',
        min_marks: 33,
        selection: 'Direct sanctioning based on ST community status, family income <= ₹2.5 Lakhs, and certificate verification on the Odisha State Scholarship Portal.',
        renewal: 'Requires annual renewal application through the Odisha State Scholarship Portal, showing continuous academic progression.',
        helpline: '155335, 1800-345-6770',
        official_source: 'https://scholarship.odisha.gov.in',
        apply_url: 'https://scholarship.odisha.gov.in',
        faq_json: [
            {
                question: "Is there a minimum marks cutoff?",
                answer: "No, ST students only need to pass their previous class. There is no higher percentage cutoff."
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
        slug: 'krishi-vidya-nidhi-yojana-odisha',
        amount_annual: 100000,
        amount_min: 10000,
        amount_description: 'Full tuition and hostel fee reimbursement up to ₹1,00,000 per year, paid directly to CM-KISAN beneficiary children.',
        min_marks: 33,
        selection: 'Verified agriculture department verification of parent\'s CM-KISAN beneficiary status and student\'s merit-based admission in recognized professional/technical courses.',
        renewal: 'Requires annual renewal application through the Odisha State Scholarship Portal and verification of passing the previous year\'s exam.',
        helpline: '155335, 1800-345-6770',
        official_source: 'https://scholarship.odisha.gov.in',
        apply_url: 'https://scholarship.odisha.gov.in',
        faq_json: [
            {
                question: "Can I apply if I am already receiving another scholarship?",
                answer: "No, students must not be receiving any other state or central government scholarship scheme."
            },
            {
                question: "How do I check my scholarship status?",
                answer: "Log in to the Odisha State Scholarship Portal and check your status under the Krishi Vidya Nidhi scheme dashboard."
            },
            {
                question: "Who is eligible?",
                answer: "Children of Small & Marginal Farmers or Landless Agricultural Households registered under the CM-KISAN scheme pursuing technical/professional degrees."
            }
        ]
    },
    {
        slug: 'boc-scholarship-nirman-shramik-kalyan-yojana-odisha',
        amount_annual: 40000,
        amount_min: 2000,
        amount_description: '₹2,000 to ₹40,000 per year based on educational level (Class 6 to B.Tech/MBBS) for children of registered construction workers. Girls receive 20% extra stipend.',
        min_marks: 33,
        selection: 'Direct merit-cum-status verification of parent\'s registration with OB&OCWWB (minimum 1 year active membership).',
        renewal: 'Requires annual renewal application on the State Scholarship Portal and verification of parent\'s active labor card.',
        helpline: '155335, 1800-345-6770, scholarshiplabour@gmail.com',
        official_source: 'https://scholarship.odisha.gov.in',
        apply_url: 'https://scholarship.odisha.gov.in',
        faq_json: [
            {
                question: "Can I apply for this if my parent is not a registered construction worker?",
                answer: "No, the scholarship is strictly limited to the children of workers registered with the OB&OCWWB with at least 1 year of active registration."
            },
            {
                question: "How do I check my scholarship payment status?",
                answer: "Log in to the Odisha State Scholarship Portal and check the 'Know Your Status' tab to view payment sanctions."
            },
            {
                question: "Do girl students get extra benefits?",
                answer: "Yes, girl students receive an additional 20% stipend over the standard rate starting from Class 8."
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

    console.log('🎉 SQLite Database successfully enriched for Tier 1 Scholarships!');
} catch (err) {
    console.error('❌ Error updating database:', err);
} finally {
    db.close();
}
