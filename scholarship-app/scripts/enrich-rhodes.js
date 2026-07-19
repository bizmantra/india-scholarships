const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

const slug = 'rhodes-scholarship-india';

const updateData = {
    amount_description: "Fully funded award covering University and College tuition fees, an annual living stipend (~£20,400/year), economy class travel to/from Oxford, student visa fees, and International Health Surcharge (IHS) coverage.",
    benefits: `- **Tuition Coverage:** Full University and College tuition fees at the University of Oxford.
- **Living Stipend:** An annual stipend of £20,400 (paid in monthly installments) for living expenses.
- **Travel Allowance:** Economy class airfare to Oxford at the start and returning at the end of the scholarship.
- **Additional Expenses:** Coverage for the University of Oxford application fee, student visa application fee, and the UK International Health Surcharge (IHS).
- **Settling-in Allowance:** A one-time settling-in allowance upon arrival in the UK.`,
    step_guide: `1. **Verify Course Eligibility:** Check the entry requirements for your desired graduate course at the University of Oxford.
2. **Register on Portal:** Create an account on the official Rhodes Trust online application portal.
3. **Submit Admission Application:** Apply separately for admission to your chosen full-time postgraduate program at Oxford.
4. **Prepare Personal Statements:** Draft a personal statement (explaining your goals and values) and an academic statement of study.
5. **Secure References:** Nominate 4 to 6 academic or professional referees who can submit recommendation letters directly through the portal.
6. **Upload Documents:** Upload your passport, academic transcripts, and CV, then submit the application before the July deadline.`,
    selection: "Selection is highly competitive and is based on academic excellence, character, leadership potential, and commitment to service. Shortlisted candidates must participate in personal interviews with the Rhodes India Selection Committee. The final selection is announced in late November.",
    renewal: "The scholarship is awarded for the standard duration of the chosen postgraduate course (typically 2 years for Master's programs and 3 years for DPhil/PhD research). Funding is maintained each term contingent upon the scholar's satisfactory academic progress and standing at the University of Oxford.",
    docs_needed: JSON.stringify([
        "Valid Indian Passport",
        "Official Undergraduate Transcripts",
        "Birth Certificate or Proof of Age",
        "Detailed Curriculum Vitae (CV)",
        "Personal Statement (maximum 1,000 words)",
        "Academic Statement of Study (maximum 350 words)",
        "4 to 6 Recommendation Letters (academic/professional)",
        "English Language Proficiency Test Scores (IELTS/TOEFL)"
    ]),
    faq_json: JSON.stringify([
        {
            "question": "Can PIO or OCI cardholders apply for the Rhodes Scholarship (India)?",
            "answer": "No, applicants must be citizens of India holding a valid Indian passport. PIO and OCI cardholders are not eligible to apply under the India constituency."
        },
        {
            "question": "Is there an age limit for the Rhodes Scholarship?",
            "answer": "Yes, applicants must be aged 18 to 23 as of October 1, 2026. However, an extension up to 27 is allowed if you completed your first undergraduate degree later than usual."
        },
        {
            "question": "Do I need an admission offer from Oxford University before applying?",
            "answer": "No, you do not need an admission offer to apply for the scholarship. However, you must apply for admission to Oxford separately, and securing admission is a prerequisite to receiving the scholarship."
        },
        {
            "question": "How many letters of recommendation are required?",
            "answer": "You must provide contact details for 4 to 6 referees who will submit recommendation letters. At least 3 of these referees must be academic contacts who have taught you."
        }
    ]),
    helpline: "india.secretary@rhodestrust.com",
    official_source: "https://www.rhodeshouse.ox.ac.uk/scholarships/apply/india/",
    provider_type: "Trust",
    scholarship_type: "Study Abroad",
    scholarship_scope: "International",
    country_of_study: "United Kingdom"
};

const stmt = db.prepare(`
    UPDATE scholarships 
    SET 
        amount_description = ?,
        benefits = ?,
        step_guide = ?,
        selection = ?,
        renewal = ?,
        docs_needed = ?,
        faq_json = ?,
        helpline = ?,
        official_source = ?,
        provider_type = ?,
        scholarship_type = ?,
        scholarship_scope = ?,
        country_of_study = ?
    WHERE slug = ?
`);

const result = stmt.run(
    updateData.amount_description,
    updateData.benefits,
    updateData.step_guide,
    updateData.selection,
    updateData.renewal,
    updateData.docs_needed,
    updateData.faq_json,
    updateData.helpline,
    updateData.official_source,
    updateData.provider_type,
    updateData.scholarship_type,
    updateData.scholarship_scope,
    updateData.country_of_study,
    slug
);

if (result.changes > 0) {
    console.log("✅ Successfully enriched Rhodes Scholarship record in SQLite!");
} else {
    console.error("❌ Failed to update Rhodes Scholarship record.");
}

db.close();
