const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

try {
  db.transaction(() => {
    // 1. Delete duplicate FAEA entry
    console.log("Deleting duplicate FAEA entry: sc_corp_faea_001");
    db.prepare("DELETE FROM scholarships WHERE id = 'sc_corp_faea_001'").run();

    // 2. Delete duplicate Reliance PhD entry (after merging)
    console.log("Deleting duplicate Reliance PhD entry: reliance-foundation-phd-scholarship");
    db.prepare("DELETE FROM scholarships WHERE id = 'reliance-foundation-phd-scholarship'").run();

    // 3. Update Aditya Birla Scholarship Programme (premier)
    console.log("Updating Aditya Birla Scholarship Programme (premier)");
    db.prepare(`
      UPDATE scholarships
      SET amount_annual = 300000,
          amount_min = 150000,
          amount_description = ?,
          benefits = ?,
          min_marks = 0,
          selection = ?,
          renewal = ?,
          helpline = ?,
          official_source = ?,
          apply_url = ?,
          docs_needed = ?,
          step_guide = ?,
          faq_json = ?,
          verified_status = 'Verified',
          last_verified = datetime('now'),
          verification_year = 2026
      WHERE slug = 'aditya-birla-scholarship-programme'
    `).run(
      'Management: ₹3,00,000 per annum; Engineering: ₹1,50,000 per annum; Law: ₹1,80,000 per annum (or actual fees, whichever is lower).',
      'Full coverage of tuition fees and hostel fees as per the scholarship terms, disbursed through the partner institute.',
      'Initial shortlisting based on qualifying exam ranks (top 20 at admission), followed by assessment of applications and essays, concluding with personal interviews in Mumbai.',
      'Monitored closely every year based on academic excellence, leadership traits, and extra-curricular contributions, reviewed by the head of the institute.',
      '+91-22-6652-5000, +91-22-2499-5000, adityabirla.scholars@adityabirla.com',
      'https://www.adityabirlascholars.net/',
      'https://www.adityabirlascholars.net/',
      JSON.stringify(["Aditya Birla Scholarship application form", "Letters of recommendation from faculty/director", "Entrance exam scorecard (CAT/JEE/CLAT/etc.)", "Recent passport size photograph", "Short essays as specified by the foundation"]),
      "1. Eligible students (top rankers at admission) receive the application package from their Dean or Director.\n2. Complete the scholarship application form detailing academic and extra-curricular achievements.\n3. Write and submit the essays on topics specified by the Aditya Birla Group.\n4. Submit the completed application package through the institute's administration.\n5. Shortlisted candidates participate in the final personal interviews in Mumbai.",
      JSON.stringify([
        {
          "question": "Who is eligible to apply for the Aditya Birla Scholarship?",
          "answer": "Only students who are among the top 20 rankers at the time of admission in selected premier institutions (IIMs, select IITs, BITS Pilani, XLRI, and top-tier Law schools) are invited to apply."
        },
        {
          "question": "What is the scholarship amount for different streams?",
          "answer": "Management students receive ₹3,00,000 per annum, Engineering (B.Tech) students receive ₹1,50,000 per annum, and Law students receive ₹1,80,000 per annum."
        },
        {
          "question": "How is the selection made?",
          "answer": "The selection involves application screening, evaluation of essays written by candidates, and a final round of personal interviews with a distinguished panel of academicians and industry leaders."
        },
        {
          "question": "Is the scholarship renewable?",
          "answer": "Yes. The scholarship is renewed annually based on a review of the scholar's academic performance, extra-curricular contributions, and leadership traits, monitored by the institute's head."
        }
      ])
    );

    // 4. Update Reliance Foundation Postgraduate Scholarship
    console.log("Updating Reliance Foundation Postgraduate Scholarship");
    db.prepare(`
      UPDATE scholarships
      SET amount_annual = 300000,
          amount_min = 250000,
          amount_description = ?,
          benefits = ?,
          min_marks = 60,
          selection = ?,
          renewal = ?,
          helpline = ?,
          official_source = ?,
          apply_url = ?,
          docs_needed = ?,
          step_guide = ?,
          faq_json = ?,
          verified_status = 'Verified',
          last_verified = datetime('now'),
          verification_year = 2026
      WHERE slug = 'reliance-foundation-postgraduate-scholarship'
    `).run(
      'Up to ₹6 Lakhs over the entire duration of the postgraduate degree programme. 80% is disbursed in advance each year for tuition/fees, and 20% for professional development/conferences.',
      'Up to ₹6 Lakhs financial grant, access to expert mentorship, global interactions, workshops, internships, volunteering, and the Reliance Foundation Alumni network.',
      'Based on application screening (evaluation of academic merit, GATE score/CGPA, essays, and extracurriculars), mandatory online aptitude test, and final virtual interviews.',
      'Subject to maintaining satisfactory academic progress (minimum SGPA/CGPA as prescribed by the foundation), active participation in workshops, and clean disciplinary record.',
      '+91-11-4117-1414, RF.PGScholarships@reliancefoundation.org',
      'https://www.scholarships.reliancefoundation.org',
      'https://www.scholarships.reliancefoundation.org',
      JSON.stringify(["Passport-size photograph", "Proof of permanent address", "Class 10 and 12 marksheets", "UG degree marksheet/transcript (min 7.5 CGPA if no GATE)", "GATE exam scorecard (if applicable, score 550-1000)", "Current year admission proof (fee receipt/bonafide certificate)", "Two letters of recommendation (one academic, one character/leadership)", "Statement of Purpose (SOP)", "Income certificate of family"]),
      "1. Visit the official Reliance Foundation scholarship portal and complete the online eligibility questionnaire.\n2. If eligible, log in and fill out the detailed application form with personal, academic, and extracurricular details.\n3. Upload required documents, including marksheets, admission proof, recommendation letters, and essays.\n4. Take the mandatory 60-minute online aptitude test (logical, verbal, and numerical reasoning).\n5. Review and submit the application before the deadline.",
      JSON.stringify([
        {
          "question": "What is the total grant amount for the Reliance Foundation PG Scholarship?",
          "answer": "Scholars receive up to ₹6 Lakhs over the entire duration of their postgraduate programme."
        },
        {
          "question": "Which disciplines are supported under this scholarship?",
          "answer": "Eligible disciplines include Artificial Intelligence, Computer Sciences, Mathematics & Computing, Electrical/Electronics/Mechanical/Chemical Engineering, Renewable & New Energy, Material Science & Engineering, and Life Sciences."
        },
        {
          "question": "What is the selection process for the PG scholarship?",
          "answer": "Selection is based on application evaluation, mandatory online aptitude test, academic performance/GATE scores, essays, and final virtual interviews."
        },
        {
          "question": "How are the scholarship funds disbursed?",
          "answer": "80% of the funds are provided in advance at the start of each academic year for tuition and direct academic expenses, and the remaining 20% can be requested for professional development or conferences."
        }
      ])
    );

    // 5. Update Sitaram Jindal Foundation Scholarship
    console.log("Updating Sitaram Jindal Foundation Scholarship");
    db.prepare(`
      UPDATE scholarships
      SET amount_annual = 36000,
          amount_min = 6000,
          amount_description = ?,
          verified_status = 'Verified',
          last_verified = datetime('now'),
          verification_year = 2026
      WHERE id = 'sc_corp_jindal_001'
    `).run('Class 11-12: ₹500-₹700/month; ITI: ₹500-₹700/month; Diploma: ₹1,00,000/year limits; Graduation: ₹1,000-₹2,000/month; Post Graduation: ₹2,000-₹3,000/month. Additional hostel subsidy up to ₹800-₹1,200/month is provided.');

    // 6. Update FAEA Scholarship verified status
    console.log("Updating FAEA Scholarship verified status");
    db.prepare(`
      UPDATE scholarships
      SET verified_status = 'Verified',
          last_verified = datetime('now'),
          verification_year = 2026
      WHERE id = 'faea-undergraduate-scholarship'
    `).run();

    // 7. Update Reliance Foundation Undergraduate Scholarship verified status
    console.log("Updating Reliance Foundation Undergraduate Scholarship verified status");
    db.prepare(`
      UPDATE scholarships
      SET verified_status = 'Verified',
          last_verified = datetime('now'),
          verification_year = 2026
      WHERE id = 'sc_corp_reliance_001'
    `).run();

    console.log("Transaction successfully completed!");
  })();
} catch (err) {
  console.error("Error running database updates:", err);
  process.exit(1);
} finally {
  db.close();
}
