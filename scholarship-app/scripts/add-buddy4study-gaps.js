const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const scholarshipsToAdd = [
  {
    id: 'sc_corp_amazon_afe_001',
    title: 'Amazon Future Engineer Scholarship (India) 2026',
    slug: 'amazon-future-engineer-scholarship-india',
    provider: 'Amazon India & Foundation for Excellence (FFE)',
    provider_type: 'Corporate',
    scholarship_type: 'Corporate',
    state: 'All India',
    level: '1st Year Undergraduate (UG)',
    caste: 'All',
    gender: 'Female',
    course_stream: 'Computer Science, Information Technology, Engineering',
    app_type: 'Scholarship',
    amount_annual: 50000,
    amount_min: 50000,
    amount_description: '₹50,000 per year + free laptop + mentoring',
    benefits: '₹50,000 per year until graduation (max 4 years). Includes a free laptop, mentorship, skill-building workshops, and potential internships at Amazon.',
    income_limit: 300000,
    min_marks: 60,
    age_limit: 'Not specified',
    residency_requirement: 'Indian Citizens',
    docs_needed: 'Aadhaar Card, Class 10/12 Marksheet, Income Certificate (Family income < ₹3 Lakhs), Admission Proof (B.E./B.Tech/Integrated M.Tech fee receipt), Entrance Exam Scorecard, Bank Passbook',
    application_mode: 'Online',
    apply_url: 'https://ffe.org/amazon-future-engineer/',
    deadline: '2026-12-31',
    deadline_description: 'December 31, 2026',
    time_min: 30,
    step_guide: '1. Visit the FFE official Amazon Future Engineer page.\n2. Click on the registration link and complete the form.\n3. Fill in academic scores, family income details, and college admission info.\n4. Upload the required documents.\n5. Submit the application.',
    selection: 'Merit-cum-means selection based on state/national level entrance exam rank and family income verification.',
    total_awards: 500,
    renewal: 'Renewable annually based on maintaining academic performance.',
    competitiveness: 'High',
    verified_status: 'Verified',
    last_verified: '2026-07-11',
    official_source: 'https://ffe.org/amazon-future-engineer/',
    helpline: '080-2520 1925 | india_support@ffe.org',
    intro_seo: 'The Amazon Future Engineer Scholarship in India helps girls from low-income families pursue undergraduate studies in computer science and engineering.',
    faq_json: JSON.stringify([
      {
        question: "Is this scholarship open to male students?",
        answer: "No, the Amazon Future Engineer Scholarship in India is strictly for female students pursuing computer science or engineering courses."
      },
      {
        question: "What is the family income limit for this scholarship?",
        answer: "The annual family income from all sources must be less than ₹3,00,000 (3 Lakhs)."
      },
      {
        question: "Are lateral entry diploma students eligible?",
        answer: "No, candidates must be in their first year of B.E./B.Tech or Integrated M.Tech courses. Lateral entry diploma students are not eligible."
      },
      {
        question: "Is the scholarship amount renewable?",
        answer: "Yes, the ₹50,000 annual scholarship is renewable for up to 4 years of study, subject to maintaining the required GPA."
      }
    ]),
    notes_actions: 'Buddy4Study Gap addition July 2026',
    keywords: 'amazon future engineer scholarship, ffe amazon scholarship, coding scholarship for girls, tech scholarship, laptop scholarship',
    status: 'Active',
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 95,
    special_conditions: 'Must be first year engineering student.',
    tags: JSON.stringify(['corporate', 'private', 'engineering', 'girls', 'it']),
    thumbnail_url: '',
    created_at: new Date().toISOString(),
    scholarship_scope: 'National',
    country_of_study: 'India'
  },
  {
    id: 'sc_corp_jsw_udaan_001',
    title: 'JSW Udaan Scholarship 2026',
    slug: 'jsw-udaan-scholarship',
    provider: 'JSW Foundation',
    provider_type: 'Corporate',
    scholarship_type: 'Corporate',
    state: 'All India',
    level: 'Undergraduate (UG), Diploma, ITI',
    caste: 'All',
    gender: 'All',
    course_stream: 'Engineering, Diploma, ITI, General Degree',
    app_type: 'Scholarship',
    amount_annual: 50000,
    amount_min: 10000,
    amount_description: 'Up to ₹50,000 per year based on the course level',
    benefits: 'Financial support up to ₹50,000 per year for B.E./B.Tech, up to ₹20,000 for Diploma, and up to ₹10,000 for ITI courses.',
    income_limit: 800000,
    min_marks: 60,
    age_limit: 'Not specified',
    residency_requirement: 'Indian citizens residing near JSW plant locations (Vijayanagar, Dolvi, Salem, Kalmeshwar, Vasind, etc.)',
    docs_needed: 'Aadhaar Card, Previous Year Marksheet, Income Certificate (Family income <= ₹8 Lakhs), College Bonafide/Fee Receipt, Bank Passbook',
    application_mode: 'Online',
    apply_url: 'https://www.vidyasaarathi.co.in/',
    deadline: '2026-11-30',
    deadline_description: 'November 30, 2026',
    time_min: 30,
    step_guide: '1. Visit the Vidyasaarathi portal.\n2. Complete register/login process.\n3. Search for JSW Udaan Scholarship matching your course.\n4. Complete profile and fill details.\n5. Upload documents and submit.',
    selection: 'Based on merit list (minimum 60% marks) and verification of proximity to JSW plants/family income.',
    total_awards: 1000,
    renewal: 'Renewable based on academic scores in subsequent years.',
    competitiveness: 'Medium',
    verified_status: 'Verified',
    last_verified: '2026-07-11',
    official_source: 'https://www.vidyasaarathi.co.in/',
    helpline: 'vidyasaarathi@nsdl.co.in',
    intro_seo: 'JSW Udaan Scholarship by JSW Foundation offers up to ₹50,000/year to students near JSW plant locations to pursue higher education.',
    faq_json: JSON.stringify([
      {
        question: "Who is eligible for JSW Udaan Scholarship?",
        answer: "Students residing near JSW plant locations (like Vijayanagar, Dolvi, Salem, etc.) who secured min 60% marks and have family income under ₹8,00,000 are eligible."
      },
      {
        question: "How do I apply for this scholarship?",
        answer: "The application is hosted online on the Vidyasaarathi portal (www.vidyasaarathi.co.in)."
      },
      {
        question: "Are JSW employees' children eligible?",
        answer: "No, children of employees of JSW Group companies are not eligible to apply."
      },
      {
        question: "Is there any course restriction?",
        answer: "No, the scholarship supports ITI, Diploma, Undergraduate (Engineering & Non-Engineering), and Postgraduate courses."
      }
    ]),
    notes_actions: 'Buddy4Study Gap addition July 2026',
    keywords: 'jsw scholarship, jsw udaan scholarship, vidyasaarathi jsw, diploma scholarship, iti scholarship',
    status: 'Active',
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 0,
    is_popular: 1,
    priority_score: 85,
    special_conditions: 'Must reside close to JSW plant areas.',
    tags: JSON.stringify(['corporate', 'private', 'diploma', 'iti', 'engineering']),
    thumbnail_url: '',
    created_at: new Date().toISOString(),
    scholarship_scope: 'Regional',
    country_of_study: 'India'
  },
  {
    id: 'sc_corp_google_generation_001',
    title: 'Generation Google Scholarship (APAC) 2026',
    slug: 'generation-google-scholarship-apac',
    provider: 'Google',
    provider_type: 'Corporate',
    scholarship_type: 'Corporate',
    state: 'All India',
    level: '2nd or 3rd Year Undergraduate (UG)',
    caste: 'All',
    gender: 'Female',
    course_stream: 'Computer Science, Computer Engineering, Technical Fields',
    app_type: 'Scholarship',
    amount_annual: 210000,
    amount_min: 210000,
    amount_description: 'USD 2,500 (~₹2,10,000) one-time award',
    benefits: 'USD 2,500 (approx. ₹2,10,000) paid as a one-time award to support tuition fees and educational expenses.',
    income_limit: 600000,
    min_marks: 75,
    age_limit: 'Not specified',
    residency_requirement: 'Indian and APAC citizens',
    docs_needed: 'Aadhaar Card or Passport, Resume/CV highlighting technical projects, Academic transcripts showing GPA/marks, Responses to essay questions regarding leadership and tech inclusion',
    application_mode: 'Online',
    apply_url: 'https://buildyourfuture.withgoogle.com/scholarships',
    deadline: '2026-08-31',
    deadline_description: 'August 31, 2026',
    time_min: 60,
    step_guide: '1. Visit the Google Scholarships / Build Your Future page.\n2. Select Generation Google Scholarship (APAC).\n3. Register and complete the online application form.\n4. Upload your resume, transcripts, and submit answers to the essay prompts.\n5. Submit before the deadline.',
    selection: 'Based on academic merit, commitment to diversity, and evaluation of essays.',
    total_awards: 100,
    renewal: 'Non-renewable (one-time grant).',
    competitiveness: 'Extremely High',
    verified_status: 'Verified',
    last_verified: '2026-07-11',
    official_source: 'https://buildyourfuture.withgoogle.com/scholarships',
    helpline: 'generationgoogle-apac@google.com',
    intro_seo: 'Generation Google Scholarship (APAC) supports aspiring computer scientists with a USD 2,500 award to help them complete their tech degree.',
    faq_json: JSON.stringify([
      {
        question: "Is this scholarship restricted to women?",
        answer: "The program encourages applications from groups underrepresented in technology, particularly women in computer science."
      },
      {
        question: "Are first-year students eligible?",
        answer: "Typically, applicants must be full-time 2nd or 3rd-year undergraduate students at the time of application."
      },
      {
        question: "What is the award amount?",
        answer: "A one-time award of USD 2,500 is provided to the selected candidates."
      },
      {
        question: "Are essay responses required?",
        answer: "Yes, candidates must write short essays answering questions on leadership, problem-solving, and representation in tech."
      }
    ]),
    notes_actions: 'Buddy4Study Gap addition July 2026',
    keywords: 'generation google scholarship apac, google scholarship for girls, computer science scholarship, coding scholarship',
    status: 'Active',
    verification_year: 2026,
    show_on_homepage: 1,
    is_featured: 1,
    is_popular: 1,
    priority_score: 98,
    special_conditions: 'Must be enrolled in full-time CS or related technical degree.',
    tags: JSON.stringify(['corporate', 'private', 'computer-science', 'girls']),
    thumbnail_url: '',
    created_at: new Date().toISOString(),
    scholarship_scope: 'National',
    country_of_study: 'India'
  }
];

const insertStmt = db.prepare(`
  INSERT INTO scholarships (
    id, title, slug, provider, provider_type, scholarship_type, state, level, caste, gender, course_stream,
    app_type, amount_annual, amount_min, amount_description, benefits, income_limit, min_marks, age_limit,
    residency_requirement, docs_needed, application_mode, apply_url, deadline, deadline_description, time_min,
    step_guide, selection, total_awards, renewal, competitiveness, verified_status, last_verified, official_source,
    helpline, intro_seo, faq_json, notes_actions, keywords, status, verification_year, show_on_homepage,
    is_featured, is_popular, priority_score, special_conditions, tags, thumbnail_url, created_at, scholarship_scope,
    country_of_study
  ) VALUES (
    @id, @title, @slug, @provider, @provider_type, @scholarship_type, @state, @level, @caste, @gender, @course_stream,
    @app_type, @amount_annual, @amount_min, @amount_description, @benefits, @income_limit, @min_marks, @age_limit,
    @residency_requirement, @docs_needed, @application_mode, @apply_url, @deadline, @deadline_description, @time_min,
    @step_guide, @selection, @total_awards, @renewal, @competitiveness, @verified_status, @last_verified, @official_source,
    @helpline, @intro_seo, @faq_json, @notes_actions, @keywords, @status, @verification_year, @show_on_homepage,
    @is_featured, @is_popular, @priority_score, @special_conditions, @tags, @thumbnail_url, @created_at, @scholarship_scope,
    @country_of_study
  )
`);

db.transaction(() => {
  for (const s of scholarshipsToAdd) {
    try {
      insertStmt.run(s);
      console.log(`Successfully added: ${s.title}`);
    } catch (e) {
      if (e.message.includes('UNIQUE constraint')) {
        console.log(`Skipped (already exists): ${s.title}`);
      } else {
        throw e;
      }
    }
  }
})();
console.log('Database enrichment done!');
