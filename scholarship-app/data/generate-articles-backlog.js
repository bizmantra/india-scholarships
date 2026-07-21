const fs = require('fs');
const path = require('path');

const rawArticles = [
  // Pillar 1: State & Portal Master Guides (1-20)
  { id: 'ART-1', title: 'Karnataka SSP Post-Matric Scholarship: Full Application Guide', slug: 'karnataka-ssp-postmatric-guide-2026', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/karnataka' },
  { id: 'ART-2', title: 'Odisha e-Medhabruti & Kalia Scheme: How to Apply & Check Status', slug: 'odisha-emedhabruti-kalia-guide-2026', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/odisha' },
  { id: 'ART-3', title: 'MahaDBT Scholarship List: Eligibility & Renewal Guide for Maharashtra', slug: 'mahadbt-scholarship-list-2026', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/maharashtra' },
  { id: 'ART-4', title: 'UP Scholarship 2026: Registration, Status Check & PFMS Verification', slug: 'up-scholarship-status-check-2026', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/uttar-pradesh' },
  { id: 'ART-5', title: 'Swami Vivekananda Scholarship (SVMCM) West Bengal: Complete Rules', slug: 'west-bengal-svmcm-scholarship-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/west-bengal' },
  { id: 'ART-6', title: 'Tamil Nadu Post-Matric & Pudhumai Penn Scheme: Full Breakdown', slug: 'tamil-nadu-postmatric-pudhumai-penn', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/tamil-nadu' },
  { id: 'ART-7', title: 'MP TAAS & Portal 2.0 Guide: Madhya Pradesh SC/ST Scholarships', slug: 'mp-taas-scholarship-portal-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/madhya-pradesh' },
  { id: 'ART-8', title: 'AP ePASS & Jagananna Vidya Deevena: Eligibility & Application Steps', slug: 'ap-epass-jagananna-vidya-deevena', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/andhra-pradesh' },
  { id: 'ART-9', title: 'TS ePASS Telangana Post-Matric Scholarship: Renewal & Status Guide', slug: 'telangana-epass-postmatric-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/telangana' },
  { id: 'ART-10', title: 'Rajasthan SJE SJMS Portal: Post-Matric Scholarship Step-by-Step', slug: 'rajasthan-sjms-postmatric-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/rajasthan' },
  { id: 'ART-11', title: 'Bihar Post-Matric Scholarship (PMS): Registration & Document List', slug: 'bihar-postmatric-pms-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/bihar' },
  { id: 'ART-12', title: 'Kerala DCE & E-Grantz 3.0: Post-Matric Scholarship Application Guide', slug: 'kerala-dce-eprantis-scholarships', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/kerala' },
  { id: 'ART-13', title: 'Assam Post-Matric SC/ST/OBC Scholarship: How to Apply Online', slug: 'assam-postmatric-scholarship-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/assam' },
  { id: 'ART-14', title: 'Dr. Ambedkar Post-Matric Scholarship Punjab: Full Rules', slug: 'punjab-postmatric-dr-ambedkar', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/punjab' },
  { id: 'ART-15', title: 'Haryana Har-Chhatravratti Portal: Scholarship List & Application', slug: 'haryana-saral-scholarship-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/haryana' },
  { id: 'ART-16', title: 'Jharkhand e-Kalyan Scholarship: Status Check & Registration Guide', slug: 'jharkhand-ekalyan-scholarship-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/guides/e-kalyan-jharkhand' },
  { id: 'ART-17', title: 'Chhattisgarh Online Post-Matric Scholarship: Application & Dates', slug: 'chhattisgarh-postmatric-portal-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/scholarships-in/chhattisgarh' },
  { id: 'ART-18', title: 'NSP Portal 2026 Registration: Complete Beginner Guide', slug: 'nsp-national-scholarship-portal-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/guides/nsp' },
  { id: 'ART-19', title: 'PFMS Portal Status Check: Know Your Direct Payment Status', slug: 'pfms-scholarship-status-check-guide', pillar: 'Pillar 1: State & Portal Guides', target_link: '/guides/pfms' },
  { id: 'ART-20', title: 'State Portal vs Central NSP: Which One Should You Apply On?', slug: 'state-vs-central-scholarship-rules', pillar: 'Pillar 1: State & Portal Guides', target_link: '/guides/nsp' },

  // Pillar 2: Category, Caste & Income Decoders (21-40)
  { id: 'ART-21', title: 'SC Post-Matric Scholarship: Income Caps & Free-Ship Scheme Explained', slug: 'sc-postmatric-scholarship-income-rules', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/sc' },
  { id: 'ART-22', title: 'ST Post-Matric Scholarship: Eligibility, Hostel Allowance & Rules', slug: 'st-postmatric-scholarship-rules-2026', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/st' },
  { id: 'ART-23', title: 'OBC Non-Creamy Layer Scholarship Rules: Who Qualifies?', slug: 'obc-ncl-scholarship-rules-explained', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/obc' },
  { id: 'ART-24', title: 'EWS Scholarship Guide: Top Government & Private Options', slug: 'ews-scholarship-list-and-eligibility', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/ews' },
  { id: 'ART-25', title: 'NSP Minority Scholarships (Pre-Matric, Post-Matric, MCM): Complete Rules', slug: 'minority-moma-scholarship-guide', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/minority' },
  { id: 'ART-26', title: 'Top Scholarships for Differently-Abled (PwD) Students in India', slug: 'disability-pwd-scholarships-india', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/disability' },
  { id: 'ART-27', title: 'Best Scholarships for Families Earning Under ₹1 Lakh Per Year', slug: 'income-under-1-lakh-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-income/under-2-lakhs' },
  { id: 'ART-28', title: 'Top Scholarships for Families Earning Below ₹2.5 Lakh Annual Income', slug: 'income-under-25-lakh-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-income/under-2-lakhs' },
  { id: 'ART-29', title: 'EWS & General Category Scholarships for Income Under ₹8 Lakhs', slug: 'income-under-8-lakh-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-income/under-8-lakhs' },
  { id: 'ART-30', title: 'Single Girl Child Scholarships in India: Complete Eligibility List', slug: 'single-girl-child-scholarships-list', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/female' },
  { id: 'ART-31', title: 'Top Scholarships for Female Students in Science, Tech & Engineering', slug: 'female-stem-scholarships-india', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/female' },
  { id: 'ART-32', title: 'First Generation College Student Scholarships in India', slug: 'first-generation-learner-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-33', title: 'Scholarships for Orphans & Children of Single Parents in India', slug: 'orphan-single-parent-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-34', title: 'Prime Minister Scholarship Scheme (PMSS) for Ex-Servicemen Children', slug: 'defence-ex-servicemen-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/scholarships-for/general' },
  { id: 'ART-35', title: 'Wards of Beedi, Cine & Non-Coal Mine Workers Scholarship Guide', slug: 'beedi-cinema-mining-worker-scholarships', pillar: 'Pillar 2: Category & Income', target_link: '/guides/nsp' },
  { id: 'ART-36', title: 'Top Sports Scholarships in India for State & National Level Athletes', slug: 'sports-quota-scholarships-india', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-37', title: 'Merit-Cum-Means Scholarships Explained: Marks vs Income Weightage', slug: 'merit-cum-means-scholarships-guide', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-38', title: 'Pre-Matric vs Post-Matric Scholarship: What is the Difference?', slug: 'pre-matric-vs-post-matric-difference', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-39', title: 'Caste Certificate Rules: Do You Need Central or State Certificate?', slug: 'caste-certificate-validity-for-scholarship', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },
  { id: 'ART-40', title: 'Income Certificate Validity: How Old Can Your Income Proof Be?', slug: 'income-certificate-validity-period', pillar: 'Pillar 2: Category & Income', target_link: '/tools/eligibility-checker' },

  // Pillar 3: Course & Degree Blueprints (41-60)
  { id: 'ART-41', title: 'B.Tech & Engineering Scholarships: How to Cover 4-Year Tuition Fees', slug: 'btech-engineering-scholarships-guide', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/engineering' },
  { id: 'ART-42', title: 'Top Scholarships for Diploma & Polytechnic Students', slug: 'diploma-polytechnic-scholarships-india', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/diploma' },
  { id: 'ART-43', title: 'MBBS & Medical Student Scholarships: Private vs Govt Assistance', slug: 'mbbs-medical-scholarships-india', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/medicine' },
  { id: 'ART-44', title: 'BSc Nursing & GNM Scholarships: Top Financial Aid Schemes', slug: 'nursing-bsc-nursing-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/medicine' },
  { id: 'ART-45', title: 'BSc Agriculture & Allied Sciences Scholarships in India', slug: 'bsc-agriculture-scholarships-guide', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/science' },
  { id: 'ART-46', title: 'BCA & MCA Student Scholarships: Technical Skill Financial Aid', slug: 'bca-mca-computer-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/engineering' },
  { id: 'ART-47', title: 'B.Com & BBA Scholarships: Top Corporate & Govt Schemes', slug: 'bcom-bba-commerce-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/commerce' },
  { id: 'ART-48', title: 'BA, MA & Humanities Scholarships: Research & Degree Funding', slug: 'ba-ma-arts-humanities-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/arts' },
  { id: 'ART-49', title: 'ITI & Skill Training Scholarships: Govt Allowances & Stipends', slug: 'iti-skill-development-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/diploma' },
  { id: 'ART-50', title: 'Best Scholarships to Apply Immediately After Passing Class 10', slug: 'class-10-passed-scholarships-list', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/class-10-passed' },
  { id: 'ART-51', title: 'Top Scholarships After Passing Class 12 Board Exams', slug: 'class-12-passed-scholarships-list', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/class-12-passed' },
  { id: 'ART-52', title: 'Law Student Scholarships: Financial Aid for 3-Year & 5-Year LLB', slug: 'llb-law-student-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/law' },
  { id: 'ART-53', title: 'Architecture (B.Arch) Scholarships: Fees & Design Grants', slug: 'barch-architecture-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/engineering' },
  { id: 'ART-54', title: 'B.Ed & D.El.Ed Scholarships: Aid for Future School Teachers', slug: 'bed-deled-teaching-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/post-graduate' },
  { id: 'ART-55', title: 'CA, CS & CMA Student Scholarships: ICAI & Private Grants', slug: 'ca-cs-cma-professional-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/commerce' },
  { id: 'ART-56', title: 'M.Tech GATE Financial Assistance & Non-GATE M.Tech Scholarships', slug: 'mtech-gate-stipend-guide', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/engineering' },
  { id: 'ART-57', title: 'PhD Fellowships in India: CSIR NET, UGC NET & Prime Minister PMRF', slug: 'phd-research-fellowship-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-level/phd' },
  { id: 'ART-58', title: 'Scholarships That Specifically Cover Hostel & Food Fees', slug: 'hostel-fee-reimbursement-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/tools/eligibility-checker' },
  { id: 'ART-59', title: 'Can IGNOU & Distance Education Students Get Govt Scholarships?', slug: 'distance-education-open-university-scholarships', pillar: 'Pillar 3: Course & Degree', target_link: '/tools/eligibility-checker' },
  { id: 'ART-60', title: 'How to Get Fee Reimbursement in Private Engineering Colleges', slug: 'private-college-tuition-fee-reimbursement', pillar: 'Pillar 3: Course & Degree', target_link: '/scholarships-by-course/engineering' },

  // Pillar 4: Corporate & CSR Roundups (61-80)
  { id: 'ART-61', title: 'Top 10 High-Value Corporate CSR Scholarships in India', slug: 'best-corporate-csr-scholarships-2026', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-62', title: 'Tata Capital Pankh Scholarship: Eligibility, Selection & How to Apply', slug: 'tata-capital-pankh-scholarship-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/tata-capital-pankh-scholarship' },
  { id: 'ART-63', title: 'LIC Golden Jubilee Scholarship: Step-by-Step Application Guide', slug: 'lic-golden-jubilee-scholarship-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/lic-golden-jubilee-scholarship' },
  { id: 'ART-64', title: 'PM Yashasvi Scholarship Scheme: Exam Date, Syllabus & Amount', slug: 'pm-yashasvi-scholarship-full-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/pm-yashasvi-scholarship' },
  { id: 'ART-65', title: 'Azim Premji Scholarship 2026: Application Process & Benefits', slug: 'azim-premji-scholarship-full-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/azim-premji-scholarship' },
  { id: 'ART-66', title: 'Glow & Lovely Careers Scholarship for Women: Complete Details', slug: 'glow-and-lovely-careers-scholarship', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/glow-lovely-careers-scholarship-for-women' },
  { id: 'ART-67', title: 'AICTE Pragati, Saksham & Swanath Schemes: Full Comparison', slug: 'aicte-pragati-saksham-swanath-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/scholarships/aicte-pragati-scholarship-for-girl-students' },
  { id: 'ART-68', title: 'Reliance Foundation Undergraduate Scholarship: How to Win', slug: 'reliance-foundation-undergraduate-scholarship', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-69', title: 'HDFC Bank Parivartan ECSS Scholarship: Eligibility & Selection', slug: 'hdfc-badhte-kadam-scholarship-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-70', title: 'Sitaram Jindal Foundation Scholarship: Annexure & Offline Form Guide', slug: 'sitaram-jindal-foundation-scholarship', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-71', title: 'Kotak Kanya Scholarship for Female Engineers: Step-by-Step', slug: 'kotak-kanya-scholarship-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-72', title: 'Aditya Birla Capital Scholarship: Application Guide & Last Date', slug: 'aditya-birla-capital-scholarship', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-73', title: 'SBI Foundation ASHA Scholarship: Registration & Selection Process', slug: 'sbif-asha-scholarship-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-74', title: 'Colgate Keep India Smiling Scholarship: How to Fill Form', slug: 'keep-india-smiling-foundational-scholarship', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-75', title: 'Buddy4Study vs Govt Portals: How to Safely Apply to Private Grants', slug: 'buddy4study-vs-indiascholarships-guide', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-76', title: 'Fast Disbursing Scholarships: Private Grants That Pay Within 60 Days', slug: 'fastest-disbursing-private-scholarships', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-77', title: 'How to Clear Telephonic Interviews for Private CSR Scholarships', slug: 'interview-tips-for-corporate-scholarships', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-78', title: 'How to Write a Winning Statement of Purpose for Scholarships', slug: 'essay-writing-tips-for-scholarships', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },
  { id: 'ART-79', title: 'Scholarships For Students With 50% - 60% Marks (Low Academic Requirement)', slug: 'scholarships-without-minimum-marks', pillar: 'Pillar 4: Corporate & CSR', target_link: '/tools/eligibility-checker' },
  { id: 'ART-80', title: 'How to Renew Corporate Scholarships Year After Year', slug: 'renewing-private-csr-scholarships', pillar: 'Pillar 4: Corporate & CSR', target_link: '/corporate-scholarships' },

  // Pillar 5: Procedural & Document Troubleshooting (81-100)
  { id: 'ART-81', title: 'How to Apply for Income Certificate Online in 10 Indian States', slug: 'how-to-make-income-certificate-online', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-82', title: 'How to Check NPCI Aadhaar Bank Seeding Status on UIDAI Portal', slug: 'npci-aadhaar-bank-seeding-check', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-83', title: 'Download Free Bonafide Certificate Format for College Scholarship', slug: 'bonafide-certificate-scholarship-format', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-84', title: 'Can You Apply for 2 Scholarships at the Same Time? Official Govt Rules', slug: 'can-you-apply-for-two-scholarships', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-85', title: 'NSP Application Pending at School/Institute: How to Get it Verified', slug: 'nsp-application-pending-at-institute-fix', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/nsp/status-check' },
  { id: 'ART-86', title: 'How to Correct Defect Status in NSP & Re-upload Wrong Documents', slug: 'nsp-defect-status-re-upload-guide', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/nsp/documents-list' },
  { id: 'ART-87', title: 'MahaDBT Document Upload Error & Application Sent Back Fix', slug: 'mahadbt-re-upload-documents-guide', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/mahadbt/documents-list' },
  { id: 'ART-88', title: 'Karnataka SSP SATS ID & College Admission Number Linking Error Fix', slug: 'ssp-kats-sats-id-linking-error', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/ssp-karnataka/status-check' },
  { id: 'ART-89', title: 'Scholarship Payment Bounced or Bank Rejected? How to Re-register Bank Details', slug: 'scholarship-bank-account-rejected-dbt', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/pfms' },
  { id: 'ART-90', title: 'Scholarship Money Not Received? How to File Grievance on CPGRAMS & State Portals', slug: 'how-to-file-scholarship-grievance-online', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/pfms' },
  { id: 'ART-91', title: 'Gap Year Affidavit for Scholarship: Download Stamp Paper Format', slug: 'gap-year-affidavit-format-for-scholarship', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-92', title: 'Domicile Certificate Rules: How to Prove Residence for State Scholarships', slug: 'domicile-residence-certificate-guide', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-93', title: 'Self-Declaration Minority Form for NSP & State Portals', slug: 'minority-declaration-affidavit-format', pillar: 'Pillar 5: Procedural & Docs', target_link: '/scholarships-for/minority' },
  { id: 'ART-94', title: 'Hostel Warden Certificate Format for Maintenance Allowance Claim', slug: 'hostel-certificate-format-scholarship', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-95', title: 'How to Track Scholarship Money Disbursed on PFMS Portal', slug: 'how-to-check-pfms-know-your-payment', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/pfms' },
  { id: 'ART-96', title: 'How to Identify Fake Scholarship Portals & Avoid Scam Fees', slug: 'scholarship-scam-warning-fake-portals', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-97', title: 'Do Students Have to Pay Income Tax on Scholarship Money in India?', slug: 'income-tax-on-scholarship-money-rules', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-98', title: 'Aadhaar Name Different From Marksheet? How to Fix Verification Error', slug: 'aadhaar-name-mismatch-in-marksheet', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' },
  { id: 'ART-99', title: 'How to Convert Fresh NSP Application to Renewal Application', slug: 'how-to-renew-nsp-scholarship-online', pillar: 'Pillar 5: Procedural & Docs', target_link: '/guides/nsp' },
  { id: 'ART-100', title: 'How to Compress PDF Documents Under 200KB for Govt Portals', slug: 'scholarship-document-scanner-size-guide', pillar: 'Pillar 5: Procedural & Docs', target_link: '/tools/eligibility-checker' }
];

const formattedArticles = rawArticles.map(a => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  pillar: a.pillar,
  target_link: a.target_link,
  status: 'Backlog',
  impact: 'High',
  type: 'Article'
}));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'backlog-articles.json'), JSON.stringify(formattedArticles, null, 2));

let mdContent = '# 📰 Editorial Articles Backlog (data/backlog-articles.json)\n\n';
mdContent += '| ID | Title | Slug | Pillar | Target Link | Status |\n';
mdContent += '| :--- | :--- | :--- | :--- | :--- | :--- |\n';
formattedArticles.forEach(a => {
  mdContent += `| ${a.id} | ${a.title} | \`${a.slug}\` | ${a.pillar} | \`${a.target_link}\` | ${a.status} |\n`;
});

fs.writeFileSync(path.join(dataDir, 'backlog-articles.md'), mdContent);
console.log('Successfully created data/backlog-articles.json and data/backlog-articles.md!');
