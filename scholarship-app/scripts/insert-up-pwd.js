const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../data/scholarships.db'));

const upPwdScholarship = {
  id: 'up-divyangjan-post-matric-scholarship',
  title: 'UP Divyangjan Post-Matric Scholarship & Fee Reimbursement',
  slug: 'up-divyangjan-post-matric-scholarship',
  provider: 'Department of Empowerment of Persons with Disabilities (Divyangjan Sashaktikaran Vibhag), Government of Uttar Pradesh',
  provider_type: 'Government',
  scholarship_type: 'Government',
  scholarship_scope: 'Domestic',
  state: 'Uttar Pradesh',
  level: 'Class 11-12, Graduation (UG), Post Graduation (PG), Diploma, ITI, PhD',
  caste: '["General","OBC","SC","ST","EWS"]',
  gender: 'All',
  course_stream: '["All Streams","Engineering","Medical","Arts","Science","Commerce","Law","Diploma","ITI"]',
  app_type: 'Fresh',
  amount_annual: 50000,
  amount_min: 15000,
  amount_description: 'Full tuition fee reimbursement (up to institute cap of ₹50,000/year) plus monthly maintenance allowance ranging from ₹380 to ₹1,200 per month.',
  benefits: '100% compulsory fee reimbursement plus monthly maintenance stipend paid directly to Aadhaar-seeded bank accounts via Direct Benefit Transfer (DBT).',
  income_limit: 250000,
  min_marks: 50,
  age_limit: 'As per institutional course age norms',
  residency_requirement: 'Must be a bona fide resident of Uttar Pradesh with benchmark disability of 40% or more (UDID Card mandatory).',
  docs_needed: '["Disability Certificate / UDID Card (minimum 40% disability)","Income Certificate issued by Tehsildar (family income under ₹2.5 Lakh/year)","Uttar Pradesh Domicile Certificate","Previous year academic mark sheet","Current academic session Fee Receipt & Admission Registration Number","Aadhaar Card linked with active mobile number","Bank Passbook seeded with NPCI Aadhaar"]',
  application_mode: 'Online',
  apply_url: 'https://scholarship.up.gov.in',
  deadline: '2026-11-30',
  deadline_description: 'Annual online application window operates via scholarship.up.gov.in alongside state post-matric timeline (August to November).',
  time_min: 35,
  step_guide: '1. Visit official UP Scholarship Portal (scholarship.up.gov.in) and register under Student Section.\n2. Select Divyangjan Sashaktikaran Vibhag / Disabled Category option during registration.\n3. Enter Aadhaar details, UDID card number, and course enrollment number.\n4. Upload disability certificate, income certificate, fee receipt, and previous mark sheet.\n5. Submit form online, download draft PDF, and present hard copy to your college scholarship officer for online DIoS approval.',
  selection: 'Direct eligibility-based fee reimbursement for all qualifying UP resident PwD students (40%+ disability) studying in recognized institutions.',
  total_awards: 50000,
  renewal: 'Renewable annually subject to passing previous year examinations and submitting renewal application on the portal.',
  competitiveness: 'Low',
  verified_status: 'Verified',
  last_verified: '2026-07-26',
  official_source: 'https://scholarship.up.gov.in',
  helpline: '18001805139 (Toll-Free Divyangjan & UP Welfare Helpline)',
  intro_seo: 'The UP Divyangjan Post-Matric Scholarship provides 100% fee reimbursement up to ₹50,000 and monthly maintenance stipends for UP students with 40%+ disability.',
  faq_json: JSON.stringify([
    {question: 'What minimum disability percentage is required for UP Divyangjan Scholarship?', answer: 'Applicants must possess a minimum benchmark disability of 40% or more, certified by a competent medical authority or holding a valid UDID Card.'},
    {question: 'What is the family income limit for UP Divyangjan Post-Matric Scholarship?', answer: 'The total annual family income of the candidate from all sources must not exceed ₹2,50,000 (2.5 Lakh per annum).'},
    {question: 'Where can PwD students apply for this state scholarship?', answer: 'Applications are submitted online through the official Uttar Pradesh state portal at scholarship.up.gov.in under the Divyangjan category.'}
  ]),
  notes_actions: 'Verified against UP State Scholarship Portal (scholarship.up.gov.in) and Divyangjan Sashaktikaran Vibhag guidelines.',
  keywords: 'UP Divyangjan Scholarship, UP PwD Scholarship, UP Disability Scholarship, scholarship up gov in disabled, UP Handicap Scholarship',
  status: 'Active',
  verification_year: 2026,
  show_on_homepage: 0,
  is_featured: 0,
  is_popular: 1,
  priority_score: 85,
  special_conditions: 'Must possess minimum 40% disability with valid UDID Card and family income under ₹2.5 Lakh.',
  tags: 'up, pwd, disability, divyangjan, post-matric, ug-pg, government',
  scholarship_scope: 'Domestic',
  always_open: 0,
  last_checked_at: '2026-07-26'
};

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO scholarships (
    id, title, slug, provider, provider_type, state, level, caste, gender, course_stream, app_type,
    amount_annual, amount_min, amount_description, benefits, income_limit, min_marks, age_limit, residency_requirement,
    docs_needed, application_mode, apply_url, deadline, deadline_description, time_min, step_guide, selection,
    total_awards, renewal, competitiveness, verified_status, last_verified, official_source, helpline,
    intro_seo, faq_json, notes_actions, keywords, scholarship_type, status, verification_year, show_on_homepage,
    is_featured, is_popular, priority_score, special_conditions, tags, scholarship_scope, always_open, last_checked_at
  ) VALUES (
    @id, @title, @slug, @provider, @provider_type, @state, @level, @caste, @gender, @course_stream, @app_type,
    @amount_annual, @amount_min, @amount_description, @benefits, @income_limit, @min_marks, @age_limit, @residency_requirement,
    @docs_needed, @application_mode, @apply_url, @deadline, @deadline_description, @time_min, @step_guide, @selection,
    @total_awards, @renewal, @competitiveness, @verified_status, @last_verified, @official_source, @helpline,
    @intro_seo, @faq_json, @notes_actions, @keywords, @scholarship_type, @status, @verification_year, @show_on_homepage,
    @is_featured, @is_popular, @priority_score, @special_conditions, @tags, @scholarship_scope, @always_open, @last_checked_at
  )
`);

insertStmt.run(upPwdScholarship);
console.log('Successfully inserted:', upPwdScholarship.id);

const totalUp = db.prepare("SELECT count(*) as c FROM scholarships WHERE state = 'Uttar Pradesh'").get().c;
console.log('New UP Total Scholarship Count:', totalUp);
db.close();
