const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

console.log('Connecting to database at:', dbPath);

const updates = [
  {
    slug: 'tata-capital-pankh-scholarship',
    amount_annual: 50000,
    intro_seo: 'Tata Capital Pankh Scholarship 2026 details. Learn about eligibility criteria, scholarship amount up to ₹50,000, required documents list, selection list results, and direct link to apply online.',
    faq_json: JSON.stringify([
      {question: "How do I check the Tata Capital Pankh Scholarship Selection List?", answer: "The selection list and results are published on the official Buddy4Study application portal. Selected candidates receive email/SMS notifications directly from the foundation."},
      {question: "What is the scholarship amount for Tata Capital Pankh?", answer: "The scholarship offers financial assistance of up to ₹50,000 for professional undergraduate courses, up to ₹15,000 for general graduation, and up to ₹12,000 for class 11-12 students."},
      {question: "What are the eligibility marks required?", answer: "Applicants must have scored a minimum of 60% marks in their previous qualifying examination."}
    ])
  },
  {
    slug: 'reliance-foundation-undergraduate-scholarship',
    amount_annual: 200000,
    intro_seo: 'Reliance Foundation Undergraduate Scholarship 2026. Complete guide on the application process, selection list, eligibility criteria, and zero-collateral support.',
    faq_json: JSON.stringify([
      {question: "What is the selection process for the Reliance Foundation Scholarship?", answer: "Selection is based on an online aptitude test, academic merit, and financial background check."},
      {question: "What is the scholarship amount for UG students?", answer: "The scholarship provides up to ₹2,00,000 over the course of the undergraduate degree program, plus access to a strong alumni network and mentorship."},
      {question: "Who can apply for the Reliance Foundation UG Scholarship?", answer: "Students enrolled in the first year of any full-time undergraduate degree program in India with a family income below ₹15 Lakhs are eligible."}
    ])
  },
  {
    slug: 'azim-premji-scholarship',
    intro_seo: 'Azim Premji Scholarship 2026 guide for government school students. Check eligibility, stipend details, mentoring benefits, and the step-by-step application process.',
    faq_json: JSON.stringify([
      {question: "Who is eligible for the Azim Premji Scholarship?", answer: "The scholarship is exclusively for female students who have completed their schooling from government schools and are pursuing undergraduate degrees."},
      {question: "What are the benefits of the Azim Premji Scholarship?", answer: "It provides financial assistance (stipends) along with dedicated mentoring support throughout the degree program."}
    ])
  },
  {
    slug: 'hdfc-bank-parivartan-ecss-scholarship',
    amount_annual: 75000,
    intro_seo: 'HDFC Bank Parivartan ECSS Scholarship 2026. Apply online for school (Class 1-12), general graduation, and professional course categories. Check deadlines and eligibility.',
    faq_json: JSON.stringify([
      {question: "What are the categories under HDFC Parivartan ECSS?", answer: "The scholarship is divided into three categories: School Education (Class 1-12/Diploma/ITI), Undergraduate (General & Professional), and Postgraduate (General & Professional)."},
      {question: "What is the maximum benefit under HDFC Parivartan?", answer: "Selected students can receive up to ₹75,000 per year for professional PG courses, and up to ₹50,000 for professional UG courses."}
    ])
  },
  {
    slug: 'krishi-vidya-nidhi-yojana-odisha',
    amount_annual: 10000,
    intro_seo: 'Krishi Vidya Nidhi Yojana Odisha 2026. Learn about the scholarship amount of up to ₹10,000/year, eligibility criteria for children of farmers, and application status checks.',
    faq_json: JSON.stringify([
      {question: "What is the scholarship amount for Krishi Vidya Nidhi Yojana?", answer: "Selected students receive a scholarship amount of up to ₹10,000 per year to support their higher education."},
      {question: "Who is eligible for this scheme?", answer: "Children of farmers (registered under KALIA) who are pursuing higher education in agriculture, engineering, medicine, and other professional courses in Odisha are eligible."}
    ])
  },
  {
    slug: 'sbi-platinum-jubilee-asha-scholarship',
    amount_annual: 15000,
    intro_seo: 'SBI Asha Scholarship 2026. Financial assistance program for students from low-income families. Check eligibility, benefit details of ₹15,000, and last date to apply.',
    faq_json: JSON.stringify([
      {question: "What is the scholarship amount for SBI Asha?", answer: "Selected students receive a flat one-time scholarship of ₹15,000 to cover academic expenses."},
      {question: "Who is eligible for SBI Asha Scholarship?", answer: "Students studying in classes 6 to 12 with a minimum academic score of 75% in the previous class and annual family income under ₹3 Lakhs are eligible."}
    ])
  },
  {
    slug: 'prime-ministers-research-fellowship-pmrf',
    amount_annual: 960000,
    intro_seo: 'Prime Minister\'s Research Fellowship (PMRF) 2026. Step-by-step application instructions, eligibility criteria for PhD candidates, and fellowship stipend rates.',
    faq_json: JSON.stringify([
      {question: "What is the monthly stipend under PMRF?", answer: "Fellows receive ₹70,000/month for the first two years, ₹75,000/month in the third year, and ₹80,000/month in the fourth and fifth years, plus a research grant of ₹2 Lakhs per year."},
      {question: "How are candidates selected for PMRF?", answer: "Selection is based on a rigorous evaluation of the research proposal, academic record, and performance in interview rounds at nodal institutions."}
    ])
  }
];

db.transaction(() => {
  const stmtAmount = db.prepare('UPDATE scholarships SET amount_annual = ?, intro_seo = ?, faq_json = ? WHERE slug = ?');
  const stmtNoAmount = db.prepare('UPDATE scholarships SET intro_seo = ?, faq_json = ? WHERE slug = ?');

  for (const update of updates) {
    if (update.amount_annual !== undefined) {
      const info = stmtAmount.run(update.amount_annual, update.intro_seo, update.faq_json, update.slug);
      console.log(`Updated ${update.slug}: affected rows = ${info.changes}`);
    } else {
      const info = stmtNoAmount.run(update.intro_seo, update.faq_json, update.slug);
      console.log(`Updated ${update.slug} (no amount change): affected rows = ${info.changes}`);
    }
  }
})();

db.close();
console.log('Database enrichment complete.');
