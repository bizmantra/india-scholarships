const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

const portalScholarships = [
  {
    id: "jnanabhumi-ap-scholarship",
    title: "Jnanabhumi Post-Matric & Pre-Matric Scholarship (Andhra Pradesh)",
    slug: "jnanabhumi-ap-scholarship",
    provider: "Government of Andhra Pradesh",
    provider_type: "Government",
    state: "Andhra Pradesh",
    level: "Class 5 to PhD, UG, PG, Professional Courses",
    caste: "SC, ST, BC, EBC, Minority, Kapu, Differently Abled",
    gender: "All",
    course_stream: "All Courses (General, Technical, Professional, ITI, Poly)",
    app_type: "Online",
    amount_annual: 100000,
    amount_min: 5000,
    amount_description: "Provides full tuition fee reimbursement (RTF) directly to colleges and monthly maintenance charges (MTF) to student bank accounts. MTF ranges from ₹5,000 to ₹20,000 per year depending on course and residency.",
    benefits: "Reimbursement of Tuition Fee (RTF) and Maintenance Fee (MTF) / Food and hostel mess charges.",
    income_limit: 250000,
    min_marks: 0,
    age_limit: "Not Specified",
    residency_requirement: "Permanent resident of Andhra Pradesh",
    docs_needed: JSON.stringify(["Aadhaar Card", "Kutumba/Rice Card", "Caste Certificate", "Income Certificate", "Marksheets of previous examinations", "Bank passbook", "College admission letter / fee structure"]),
    application_mode: "Online",
    apply_url: "https://jnanabhumi.ap.gov.in",
    deadline: "2026-02-28",
    deadline_description: "Usually open from August to October, with extensions up to December/January. Check portal frequently.",
    time_min: null,
    step_guide: "1. Login/Register: Create an account on the Jnanabhumi portal.\n2. Biometric Verification: Complete Aadhaar biometric authentication at the college.\n3. Application Form: Fill academic, bank, and category details.\n4. Verification: Institutional, District, and State officers verify before final approval.",
    selection: "Based on caste category, income certificate verification, active college admission status, and mandatory biometric attendance.",
    total_awards: null,
    renewal: "Requires minimum 75% biometric attendance in the previous academic year, clearing previous semester/annual exams, and submitting the renewal request online.",
    competitiveness: "Medium",
    verified_status: "Verified",
    last_verified: "2026-07-19 04:00:00",
    official_source: "https://jnanabhumi.ap.gov.in",
    helpline: "1902, jnanabhumi.ap@gmail.com",
    intro_seo: "Jnanabhumi is Andhra Pradesh's digital portal for implementing pre-matric and post-matric scholarships, managing student registration, fee reimbursement, and fund release.",
    faq_json: JSON.stringify([
      {
        question: "What is Kutumba ID in Jnanabhumi AP?",
        answer: "Kutumba ID is a family ID database. Jnanabhumi uses it to automatically verify residency, caste, and family income details during registration."
      },
      {
        question: "How can I track my Jnanabhumi scholarship status?",
        answer: "Login to the Jnanabhumi student portal, navigate to 'Print Application Status', enter your Aadhaar/Application ID to see the status of RTF and MTF."
      },
      {
        question: "Is biometric attendance mandatory for Jnanabhumi renewal?",
        answer: "Yes, a minimum of 75% biometric attendance in college is mandatory for the release of fee reimbursement."
      }
    ]),
    notes_actions: "Ingested high-volume portal gap",
    keywords: JSON.stringify(["jnanabhumi", "jnanabhumi ap", "jnanabhumi status", "ap post matric scholarship", "jnanabhumi student login"]),
    scholarship_type: "Government",
    status: "Active",
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: null,
    tags: JSON.stringify(["government", "andhra-pradesh", "post-matric"]),
    thumbnail_url: null,
    created_at: "2026-07-19 04:00:00",
    scholarship_scope: "Domestic",
    country_of_study: "India",
    always_open: 0
  },
  {
    id: "digital-gujarat-scholarship-portal",
    title: "Digital Gujarat Scholarship Portal (Pre-Matric & Post-Matric)",
    slug: "digital-gujarat-scholarship-portal",
    provider: "Government of Gujarat",
    provider_type: "Government",
    state: "Gujarat",
    level: "Class 1 to PhD, UG, PG, Professional Courses",
    caste: "SC, ST, SEBC, OBC, Minority, General (EWS)",
    gender: "All",
    course_stream: "All Courses (General, Technical, Engineering, Medical, ITI, Diploma)",
    app_type: "Online",
    amount_annual: 60000,
    amount_min: 1000,
    amount_description: "Covers Tuition fees plus hosteller food and bill assistance. Post-matric tuition fee coverage ranges from ₹10,000 up to ₹60,000+ depending on the department and category.",
    benefits: "Tuition fee refunds, monthly hostel subsidies, food assistance, and device/book allowances.",
    income_limit: 600000,
    min_marks: 0,
    age_limit: "Not Specified",
    residency_requirement: "Permanent resident of Gujarat",
    docs_needed: JSON.stringify(["Aadhaar Card", "Caste Certificate", "Income Certificate (issued by Mamlatdar/TDO)", "School/College Leaving Certificate", "Hostel Certificate (if applicable)", "Bank passbook page"]),
    application_mode: "Online",
    apply_url: "https://www.digitalgujarat.gov.in",
    deadline: "2026-02-15",
    deadline_description: "Usually opens in September and closes in January/February. Check portal dates regularly.",
    time_min: null,
    step_guide: "1. Register: Sign up at digitalgujarat.gov.in using a phone/email.\n2. Profiling: Complete student profile with details.\n3. Application Form: Fill in category, academic, bank account, and upload documents.\n4. Institute approval: Submit form online for college desk verification.",
    selection: "Based on Gujarat domicile validation, caste/category certificate authentication, and family income verification.",
    total_awards: null,
    renewal: "Requires passing previous year examinations and logging in using previous credentials to submit the renewal request.",
    competitiveness: "Medium",
    verified_status: "Verified",
    last_verified: "2026-07-19 04:00:00",
    official_source: "https://www.digitalgujarat.gov.in",
    helpline: "18002335500",
    intro_seo: "Digital Gujarat Portal is the official unified platform for applying, renewing, and tracking state government scholarships in Gujarat.",
    faq_json: JSON.stringify([
      {
        question: "How do I register on the Digital Gujarat portal?",
        answer: "Visit digitalgujarat.gov.in, click on 'Register', enter your mobile number and email, verify with OTP, and complete your profile."
      },
      {
        question: "What should I do if my bank account validation fails on Digital Gujarat?",
        answer: "Verify that your bank account is seeded with Aadhaar via NPCI. Update your profile with the correct IFSC code and upload a copy of your bank passbook."
      },
      {
        question: "Can outside state students apply through Digital Gujarat?",
        answer: "No, only students residing permanently in Gujarat and studying in registered institutes can apply."
      }
    ]),
    notes_actions: "Ingested high-volume portal gap",
    keywords: JSON.stringify(["digital gujarat", "digital gujarat scholarship", "digital gujarat login", "digital india scholarship gujarat"]),
    scholarship_type: "Government",
    status: "Active",
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: null,
    tags: JSON.stringify(["government", "gujarat", "post-matric"]),
    thumbnail_url: null,
    created_at: "2026-07-19 04:00:00",
    scholarship_scope: "Domestic",
    country_of_study: "India",
    always_open: 0
  },
  {
    id: "national-scholarship-portal-nsp",
    title: "National Scholarship Portal (NSP) — Central & UGC Schemes 2026",
    slug: "national-scholarship-portal-nsp",
    provider: "Ministry of Electronics and Information Technology (MeitY)",
    provider_type: "Government",
    state: "All India",
    level: "Class 1 to PhD, UG, PG, Professional Degrees",
    caste: "SC, ST, OBC, Minority, General, EWS",
    gender: "All",
    course_stream: "All Streams (Arts, Science, Commerce, Engineering, Medical, Technical, Research)",
    app_type: "Online",
    amount_annual: 80000,
    amount_min: 1000,
    amount_description: "Varies significantly by scheme. Pre-matric schemes disburse ₹1,000-₹5,000/year. Post-matric/UGC/CSIS schemes disburse up to ₹80,000/year. Payments are processed via PFMS.",
    benefits: "Direct tuition fee reimbursement, maintenance allowances, hostel fees, and equipment allowances.",
    income_limit: 800000,
    min_marks: 50,
    age_limit: "Not Specified",
    residency_requirement: "Citizen of India",
    docs_needed: JSON.stringify(["Onetime Registration (OTR) ID", "Aadhaar Card / Enrollment ID", "Caste Certificate", "Income Certificate", "Marksheets of qualifying exam", "Domicile Certificate", "Bank passbook page", "Bonafide Student Certificate"]),
    application_mode: "Online",
    apply_url: "https://scholarships.gov.in",
    deadline: "2026-01-31",
    deadline_description: "NSP portals usually open in July/August and close in January. Dates vary per scheme.",
    time_min: null,
    step_guide: "1. OTR Registration: Register with Aadhaar and mobile to generate a 14-digit OTR ID.\n2. Apply: Login with OTR, select matching central/state scheme.\n3. Verify: Institute verifies details online.\n4. Disbursement: Department prepares merit list and forwards to PFMS.",
    selection: "Calculated based on qualifying marks, state/caste/gender quotas, income thresholds, and successful online verification by local institutes.",
    total_awards: null,
    renewal: "Requires submitting a renewal form on the NSP dashboard using previous registration IDs, maintaining required marks, and active enrollment.",
    competitiveness: "High",
    verified_status: "Verified",
    last_verified: "2026-07-19 04:00:00",
    official_source: "https://scholarships.gov.in",
    helpline: "0120-6619540, helpdesk@nsp.gov.in",
    intro_seo: "National Scholarship Portal (NSP) is the central government's unified digital platform for registering, processing, and distributing central, UGC, and state schemes.",
    faq_json: JSON.stringify([
      {
        question: "What is the One-Time Registration (OTR) on NSP?",
        answer: "OTR is a unique 14-digit registration number assigned to students based on Aadhaar verification. It remains active throughout your academic life on NSP."
      },
      {
        question: "How is the NSP merit list calculated?",
        answer: "The merit list is prepared based on the marks secured in the qualifying exam, available scheme slots, state quotas, and family income verification."
      },
      {
        question: "What do the different status indicators mean on NSP?",
        answer: "'Verified by School/Institute' means college checks are complete; 'Sent to Public Financial Management System (PFMS)' means payment is processing."
      }
    ]),
    notes_actions: "Ingested high-volume portal gap",
    keywords: JSON.stringify(["nsp", "national scholarship portal", "portal national scholarship", "nsp scholarship 2024", "nsp scholarship 2025"]),
    scholarship_type: "Government",
    status: "Active",
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: null,
    tags: JSON.stringify(["government", "central", "post-matric"]),
    thumbnail_url: null,
    created_at: "2026-07-19 04:00:00",
    scholarship_scope: "Domestic",
    country_of_study: "India",
    always_open: 0
  },
  {
    id: "up-scholarship-portal",
    title: "UP Scholarship Portal — Pre-Matric, Post-Matric & Dashmesh Schemes",
    slug: "up-scholarship-portal",
    provider: "Social Welfare Department, Uttar Pradesh",
    provider_type: "Government",
    state: "Uttar Pradesh",
    level: "Class 9 to PhD, UG, PG, ITI, Diploma",
    caste: "General, OBC, SC, ST, Minority, EWS",
    gender: "All",
    course_stream: "All academic, technical, and professional streams",
    app_type: "Online",
    amount_annual: 50000,
    amount_min: 1000,
    amount_description: "Provides tuition fee refund and monthly maintenance allowances. Ranges from ₹1,000 for Pre-Matric to ₹50,000+ for professional degree courses.",
    benefits: "Tuition fee reimbursement, annual allowance, and book allowances.",
    income_limit: 250000,
    min_marks: 0,
    age_limit: "Not Specified",
    residency_requirement: "Domicile of Uttar Pradesh",
    docs_needed: JSON.stringify(["Aadhaar Card", "UP Domicile Certificate", "Caste Certificate", "Income Certificate (integrated with e-District portal)", "Fee receipt & enrollment number", "Bank account seeded with Aadhaar"]),
    application_mode: "Online",
    apply_url: "https://scholarship.up.gov.in",
    deadline: "2026-01-10",
    deadline_description: "Pre-matric usually closes in September/October; Post-matric extends to December/January. Check official site.",
    time_min: null,
    step_guide: "1. Registration: Register with Aadhaar and mobile on the portal.\n2. Fill Details: Enter educational, fee, bank and e-District caste/income numbers.\n3. Upload: Add marksheets and photo.\n4. Correction / Submit: Review details, locks form, print and submit hard copy to college.",
    selection: "Based on income certificate validation via e-District api, verification of SATS/school enrollment data, and minimum 75% attendance metrics uploaded by college.",
    total_awards: null,
    renewal: "Submit a renewal application online using previous registration IDs, requiring exam pass certificates and active enrollment status.",
    competitiveness: "Medium",
    verified_status: "Verified",
    last_verified: "2026-07-19 04:00:00",
    official_source: "https://scholarship.up.gov.in",
    helpline: "1900, 1076 (CM Helpline)",
    intro_seo: "UP Scholarship Portal is the official digital platform managed by the Social Welfare Department of Uttar Pradesh for processing state student scholarships.",
    faq_json: JSON.stringify([
      {
        question: "How do I check my UP Scholarship status?",
        answer: "Visit scholarship.up.gov.in, navigate to the 'Status' tab, select the academic year, enter your registration number and date of birth."
      },
      {
        question: "What is the 'UP Scholarship Correction' window?",
        answer: "It is an online correction phase where students can correct 'suspect data' (like marks mismatches or duplicate enrollment numbers) flagged by the department portal."
      },
      {
        question: "Why is my UP Scholarship status showing 'Blocked due to less than 75% attendance'?",
        answer: "Colleges upload attendance percentages. If your attendance is marked below 75%, the portal automatically blocks scholarship disbursement."
      }
    ]),
    notes_actions: "Ingested high-volume portal gap",
    keywords: JSON.stringify(["up scholarship", "up scholarship status", "up scholarship 2024", "scholarship status in up", "up scholarship login"]),
    scholarship_type: "Government",
    status: "Active",
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: null,
    tags: JSON.stringify(["government", "uttar-pradesh", "post-matric"]),
    thumbnail_url: null,
    created_at: "2026-07-19 04:00:00",
    scholarship_scope: "Domestic",
    country_of_study: "India",
    always_open: 0
  },
  {
    id: "post-matric-scholarships-india",
    title: "Post-Matric Scholarships in India — Complete Portal Guide 2026",
    slug: "post-matric-scholarships-india",
    provider: "Various State & Central Ministries",
    provider_type: "Government",
    state: "All India",
    level: "Class 11 to PhD, UG, PG, ITI, Diploma, Professional degrees",
    caste: "SC, ST, OBC, EWS, General, Minorities",
    gender: "All",
    course_stream: "All Streams",
    app_type: "Online",
    amount_annual: 120000,
    amount_min: 2000,
    amount_description: "Varies by state, caste, and course. High-end professional streams (like Engineering or MBBS) disburse up to ₹1,20,000+ per year. Academic intermediate degrees disburse ₹2,000 to ₹10,000.",
    benefits: "Tuition fee reimbursement, annual academic allowances, book grants, and monthly maintenance allowances.",
    income_limit: 250000,
    min_marks: 0,
    age_limit: "Not Specified",
    residency_requirement: "Varies by native state",
    docs_needed: JSON.stringify(["Aadhaar Card", "Income Certificate", "Caste Certificate", "Domicile/Residency Certificate", "Marksheet of qualifying examination", "Bank Account Details"]),
    application_mode: "Online",
    apply_url: "https://www.indiascholarships.in",
    deadline: "2026-02-28",
    deadline_description: "State-wise dates differ; post-matric schemes generally run from August through February.",
    time_min: null,
    step_guide: "1. Locate Portal: Find your native state's scholarship portal (e.g. SSP, UP, e-Kalyan).\n2. Register: Use Aadhaar verification to create an account.\n3. Form: Complete details and upload local certificates.\n4. Submit & SeedTest: Lock form and submit document copies to college office.",
    selection: "Selected based on state residency criteria, caste status, family income caps, and verified institute registrations.",
    total_awards: null,
    renewal: "Submit renewal status on the designated state portal, providing proof of passing previous exams and active college admission status.",
    competitiveness: "Medium",
    verified_status: "Verified",
    last_verified: "2026-07-19 04:00:00",
    official_source: "https://www.indiascholarships.in",
    helpline: "Official State Portal Helplines",
    intro_seo: "Post-Matric Scholarships are state and central government initiatives to fund higher education for financially disadvantaged and reserved category students in India.",
    faq_json: JSON.stringify([
      {
        question: "What is the difference between Pre-Matric and Post-Matric scholarships?",
        answer: "Pre-Matric scholarships are for classes 1 through 10. Post-Matric scholarships are for students studying in class 11, class 12, ITI, Diploma, Graduation, Post-Graduation, or PhD levels."
      },
      {
        question: "Can I apply for a Post-Matric scholarship if I am studying outside my home state?",
        answer: "Yes, most states have a 'Post-Matric Outside State' scheme option on their portals (like UP, Bihar, Jharkhand) for native students studying elsewhere."
      },
      {
        question: "Is bank account validation mandatory for Post-Matric scholarships?",
        answer: "Yes, you must have an active bank account. Payments are processed through the Aadhaar Payment Bridge System (APBS) linked to your Aadhaar."
      }
    ]),
    notes_actions: "Ingested high-volume category gap",
    keywords: JSON.stringify(["post matriculation scholarship", "post matric scholarship", "matric post scholarship", "scholarship by state"]),
    scholarship_type: "Government",
    status: "Active",
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: null,
    tags: JSON.stringify(["government", "central", "post-matric"]),
    thumbnail_url: null,
    created_at: "2026-07-19 04:00:00",
    scholarship_scope: "Domestic",
    country_of_study: "India",
    always_open: 0
  }
];

const insertStmt = db.prepare(`
  INSERT INTO scholarships (
    id, title, slug, provider, provider_type, state, level, caste, gender, course_stream, app_type,
    amount_annual, amount_min, amount_description, benefits, income_limit, min_marks, age_limit,
    residency_requirement, docs_needed, application_mode, apply_url, deadline, deadline_description,
    time_min, step_guide, selection, total_awards, renewal, competitiveness, verified_status,
    last_verified, official_source, helpline, intro_seo, faq_json, notes_actions, keywords,
    scholarship_type, status, verification_year, show_on_homepage, is_featured, is_popular,
    priority_score, special_conditions, tags, thumbnail_url, created_at, scholarship_scope,
    country_of_study, always_open
  ) VALUES (
    @id, @title, @slug, @provider, @provider_type, @state, @level, @caste, @gender, @course_stream, @app_type,
    @amount_annual, @amount_min, @amount_description, @benefits, @income_limit, @min_marks, @age_limit,
    @residency_requirement, @docs_needed, @application_mode, @apply_url, @deadline, @deadline_description,
    @time_min, @step_guide, @selection, @total_awards, @renewal, @competitiveness, @verified_status,
    @last_verified, @official_source, @helpline, @intro_seo, @faq_json, @notes_actions, @keywords,
    @scholarship_type, @status, @verification_year, @show_on_homepage, @is_featured, @is_popular,
    @priority_score, @special_conditions, @tags, @thumbnail_url, @created_at, @scholarship_scope,
    @country_of_study, @always_open
  )
`);

db.transaction(() => {
  for (const s of portalScholarships) {
    // Delete if exists to support clean re-runs
    db.prepare("DELETE FROM scholarships WHERE id = ?").run(s.id);
    insertStmt.run(s);
    console.log(`✅ Ingested portal/hub: "${s.title}" (ID: ${s.id})`);
  }
})();

console.log("🏁 Database ingestion of missing portals completed successfully!");
db.close();
