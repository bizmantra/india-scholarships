#!/usr/bin/env node

/**
 * Write Phase 3 Foundation Scholarships to Google Sheets
 * Appends 3 new scholarships with all 30 fields populated
 */

const { appendSheetRow } = require('../lib/google-sheets');

console.log('📤 Writing Phase 3 Foundation Scholarships to Google Sheets\n');

// Helper to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const scholarships = [
    {
        // Azim Premji Scholarship
        id: 'azim-premji-scholarship',
        title: 'Azim Premji Scholarship',
        provider: 'Azim Premji Foundation',
        scholarship_type: 'Private',
        provider_type: 'Foundation',
        state: 'Multiple States',
        residency_requirement: 'Must be from Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Jharkhand, Karnataka, Madhya Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry, Rajasthan, Sikkim, Telangana, Tripura, Uttar Pradesh, or Uttarakhand',
        course_stream: 'All undergraduate courses',
        age_limit: '',
        total_awards: '',
        community: 'All',
        gender: 'Female',
        education_level: 'Undergraduate',
        minimum_marks: 'Passed Class 10 & 12',
        income_limit: '',
        minimum_amount: '30000',
        annual_amount: '30000',
        amount_description: 'Annual scholarship of ₹30,000 for full course duration, disbursed in two installments per year',
        deadline: '2026-01-30',
        deadline_description: 'Round 2 applications: January 10-30, 2026',
        official_website: 'https://azimpremjifoundation.org',
        seo_keywords: 'azim premji scholarship, azim premji foundation scholarship, girl student scholarship',
        special_conditions: 'Only for girl students. Must have passed Class 10 & 12 from government school. Students admitted to Azim Premji University are ineligible.',
        tags: 'girls, undergraduate, foundation, private',
        thumbnail_url: '',
        documents_needed: 'Passport-sized photograph, Signature, Aadhaar card, Bank details, Class 10 marksheet, Class 12 marksheet, Admission proof',
        apply_url: 'https://azimpremjifoundation.org',
        introduction: 'The Azim Premji Scholarship supports girl students from disadvantaged backgrounds in 19 states/UTs to pursue higher education. Provides ₹30,000 annually for the full course duration.',
        benefits: 'Covers tuition fees, examination fees, books, and other academic requirements. Direct bank transfer to Aadhaar-linked account.',
        application_guide: '1. Visit azimpremjifoundation.org 2. Click Apply Now/Register 3. Check eligibility 4. Register with mobile number and verify OTP 5. Login with credentials 6. Complete personal, academic, institutional forms 7. Upload required documents 8. Review and submit',
        selection_process: 'Merit-based selection. Review of academic performance and financial need.',
        faqs: '',
        verified: 'TRUE',
        last_verified: '2026-01-02',
        verification_year: '2026',
        application_mode: 'Online',
        show_homepage: 'FALSE',
        is_featured: 'FALSE',
        is_popular: 'FALSE',
        priority_score: '75',
        status: 'Active',
        time_to_apply: '30',
        renewal: 'Renewable for full course duration',
        helpline: '',
        competitiveness: 'Medium',
        internal_notes: 'Phase 3 foundation scholarship. 9,900 monthly searches, difficulty 21.',
        production_status: 'Research Complete'
    },
    {
        // Atul Maheshwari Scholarship
        id: 'atul-maheshwari-scholarship',
        title: 'Atul Maheshwari Scholarship',
        provider: 'Amar Ujala Foundation',
        scholarship_type: 'Private',
        provider_type: 'Foundation',
        state: 'Multiple States',
        residency_requirement: 'Uttar Pradesh, Himachal Pradesh, Jammu & Kashmir, Chandigarh, Punjab, Haryana, Uttarakhand',
        course_stream: 'All',
        age_limit: '',
        total_awards: '46',
        community: 'All',
        gender: 'All',
        education_level: 'Class 9-12',
        minimum_marks: '60',
        income_limit: '200000',
        minimum_amount: '50000',
        annual_amount: '75000',
        amount_description: 'Classes 9-10: ₹50,000 each. Classes 11-12: ₹75,000 each. One-time award.',
        deadline: '2026-09-15',
        deadline_description: 'Applications typically open mid-August to mid-September',
        official_website: 'https://foundation.amarujala.com',
        seo_keywords: 'atul maheshwari scholarship, amar ujala foundation scholarship, class 9 10 11 12 scholarship',
        special_conditions: 'Only for government or state board students (NOT CBSE, ICSE, ISC). 2 scholarships reserved for visually impaired students. Priority for BPL card holders.',
        tags: 'school, classes 9-12, foundation, private, merit-based',
        thumbnail_url: '',
        documents_needed: 'School ID card, Email ID, Previous class marksheet, Income certificate, Passport photograph, Domicile certificate',
        apply_url: 'https://foundation.amarujala.com',
        introduction: 'The Atul Maheshwari Scholarship by Amar Ujala Foundation supports meritorious students from economically disadvantaged backgrounds in classes 9-12. Awards 46 scholarships annually.',
        benefits: 'Financial assistance of ₹50,000 for classes 9-10 and ₹75,000 for classes 11-12. Helps cover educational expenses.',
        application_guide: '1. Visit foundation.amarujala.com 2. Register or login 3. Fill application form 4. Upload documents (max 1MB each) 5. Submit application 6. Receive admit card via email 7. Select exam center 8. Appear for written exam 9. Attend interview if shortlisted',
        selection_process: 'Written examination in various cities, followed by interviews for shortlisted candidates. Final selection based on exam and interview performance.',
        faqs: '',
        verified: 'TRUE',
        last_verified: '2026-01-02',
        verification_year: '2026',
        application_mode: 'Online',
        show_homepage: 'FALSE',
        is_featured: 'FALSE',
        is_popular: 'FALSE',
        priority_score: '70',
        status: 'Active',
        time_to_apply: '25',
        renewal: 'One-time award',
        helpline: '',
        competitiveness: 'Medium',
        internal_notes: 'Phase 3 foundation scholarship. 9,900 monthly searches.',
        production_status: 'Research Complete'
    },
    {
        // KC Mahindra Scholarship
        id: 'kc-mahindra-scholarship',
        title: 'KC Mahindra Scholarship for Post-Graduate Studies Abroad',
        provider: 'K.C. Mahindra Education Trust',
        scholarship_type: 'Private',
        provider_type: 'Foundation',
        state: 'All India',
        residency_requirement: 'Indian citizen',
        course_stream: 'Engineering, Natural Sciences, Humanities, Medicine, Business Administration, Fine Arts, and other disciplines',
        age_limit: '21-28 years',
        total_awards: '',
        community: 'All',
        gender: 'All',
        education_level: 'Post-Graduate',
        minimum_marks: 'First Class degree or equivalent',
        income_limit: '',
        minimum_amount: '500000',
        annual_amount: '1000000',
        amount_description: 'Interest-free loan. Top 3 KC Mahindra Fellows: ₹10 lakh. Others: ₹5 lakh. One-time grant, must be repaid after course completion.',
        deadline: '2026-03-31',
        deadline_description: 'For courses starting August 2025 - February 2026',
        official_website: 'https://kcmet.org',
        seo_keywords: 'kc mahindra scholarship, mahindra scholarship abroad, post graduate scholarship abroad',
        special_conditions: 'Interest-free loan that must be repaid after course completion. Requires guarantor (parents, guardian, spouse, or relatives). Final year students may apply if they can submit marksheet by June.',
        tags: 'postgraduate, abroad, foundation, private, loan',
        thumbnail_url: '',
        documents_needed: 'University admission letter, Recommendation letters, Statement of Purpose, GRE/GMAT scores, IELTS/TOEFL certificates, Academic transcripts, Rank certificate, Passport copy, CV, Guarantor details',
        apply_url: 'https://kcmet.org',
        introduction: 'KC Mahindra Scholarship supports Indian students pursuing post-graduate studies abroad with an interest-free loan of ₹5-10 lakh. Top 3 fellows receive ₹10 lakh.',
        benefits: 'Interest-free loan (significant financial advantage). Top 3 fellows receive ₹10 lakh, others ₹5 lakh. Flexible repayment after course completion. One-time grant.',
        application_guide: '1. Visit kcmet.org 2. Register and complete application 3. Provide personal and educational details 4. Include overseas admission info 5. Upload all required documents 6. Submit before deadline 7. Attend interview in June if shortlisted',
        selection_process: 'Application review, shortlisting based on academic merit and potential, personal interview in June, final selection and award announcement.',
        faqs: '',
        verified: 'TRUE',
        last_verified: '2026-01-02',
        verification_year: '2026',
        application_mode: 'Online',
        show_homepage: 'FALSE',
        is_featured: 'FALSE',
        is_popular: 'FALSE',
        priority_score: '65',
        status: 'Active',
        time_to_apply: '45',
        renewal: 'One-time grant',
        helpline: '',
        competitiveness: 'High',
        internal_notes: 'Phase 3 foundation scholarship. 1,900 monthly searches. For PG studies abroad.',
        production_status: 'Research Complete'
    }
];

async function writeToGoogleSheets() {
    try {
        for (const scholarship of scholarships) {
            console.log(`\n📝 Writing: ${scholarship.title}`);

            // Prepare row data in correct column order
            const rowData = [
                scholarship.id,
                scholarship.title,
                scholarship.provider,
                scholarship.scholarship_type,
                scholarship.provider_type,
                scholarship.state,
                scholarship.residency_requirement,
                scholarship.course_stream,
                scholarship.age_limit,
                scholarship.total_awards,
                scholarship.community,
                scholarship.gender,
                scholarship.education_level,
                scholarship.minimum_marks,
                scholarship.income_limit,
                scholarship.minimum_amount,
                scholarship.annual_amount,
                scholarship.amount_description,
                scholarship.deadline,
                scholarship.deadline_description,
                scholarship.official_website,
                scholarship.seo_keywords,
                scholarship.special_conditions,
                scholarship.tags,
                scholarship.thumbnail_url,
                scholarship.documents_needed,
                scholarship.apply_url,
                scholarship.introduction,
                scholarship.benefits,
                scholarship.application_guide,
                scholarship.selection_process,
                scholarship.faqs,
                scholarship.verified,
                scholarship.last_verified,
                scholarship.verification_year,
                scholarship.application_mode,
                scholarship.show_homepage,
                scholarship.is_featured,
                scholarship.is_popular,
                scholarship.priority_score,
                scholarship.status,
                scholarship.time_to_apply,
                scholarship.renewal,
                scholarship.helpline,
                scholarship.competitiveness,
                scholarship.internal_notes,
                scholarship.production_status
            ];

            await appendSheetRow(rowData);
            console.log(`✅ Successfully added: ${scholarship.title}`);
        }

        console.log('\n==================================================');
        console.log('✅ All Phase 3 scholarships written to Google Sheets!');
        console.log('   Total: 3 scholarships');
        console.log('==================================================\n');
        console.log('📋 Next steps:');
        console.log('1. Review the data in your Google Sheet');
        console.log('2. Mark as "Ready for Production" when ready');
        console.log('3. Run: node scripts/import-from-google-sheets.js');
        console.log('4. Test pages on localhost\n');

    } catch (error) {
        console.error('❌ Error writing to Google Sheets:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
writeToGoogleSheets();
