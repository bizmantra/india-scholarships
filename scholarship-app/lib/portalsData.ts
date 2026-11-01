// Define the portal data type
export interface PortalGuide {
    id: string;
    aliases: string[];
    name: string;
    state: string;
    fullTitle: string;
    seoDesc: string;
    officialUrl: string;
    portalTag: string;
    description: string;
    stats: {
        activeSchemes: string;
        beneficiaries: string;
        disbursementType: string;
        verificationMode: string;
    };
    loginSteps: Array<{ step: string; title: string; desc: string }>;
    statusSteps: Array<{ title: string; desc: string }>;
    documents: Array<{ name: string; format: string; note: string }>;
    topSchemes: Array<{ name: string; slug: string; targetGroup: string; amount: string }>;
    faqs: Array<{ q: string; a: string }>;
    helpline: {
        phone: string;
        email: string;
        address: string;
        hours: string;
    };
}

// /guides/nsp redirects to the NSP article (next.config.ts), so it is never linked as a portal guide
const UNLINKED_PORTALS = new Set(['nsp']);
const hostOf = (url?: string | null) => {
    try { return url ? new URL(url.trim()).host.replace(/^www\./, '') : ''; } catch { return ''; }
};

// The portal guide for a scholarship: listed in the guide's top schemes, or applied for on the guide's portal
export function getPortalGuideForScholarship(s: { slug: string; apply_url?: string | null; official_source?: string | null }): PortalGuide | undefined {
    const guides = Object.values(PORTALS_DATA).filter(g => !UNLINKED_PORTALS.has(g.id));
    const hosts = [hostOf(s.apply_url), hostOf(s.official_source)].filter(Boolean);
    return guides.find(g => g.topSchemes.some(t => t.slug === s.slug))
        || guides.find(g => hosts.includes(hostOf(g.officialUrl)));
}

export const PORTALS_DATA: Record<string, PortalGuide> = {
    'e-kalyan-jharkhand': {
        id: 'e-kalyan-jharkhand',
        aliases: ['e-kalyan', 'ekalyan', 'e-kalyan-status'],
        name: 'e-Kalyan Jharkhand Portal',
        state: 'Jharkhand',
        fullTitle: 'e-Kalyan Jharkhand Portal 2026: Login, Status Check & Application Guide',
        seoDesc: 'Complete guide to e-Kalyan Jharkhand scholarship portal (ekalyan.cgg.gov.in). Learn how to check application status, student login, upload income affidavit, and track PFMS payment.',
        officialUrl: 'https://ekalyan.cgg.gov.in',
        portalTag: 'State Government Portal',
        description: 'The e-Kalyan portal is the official Welfare Department online scholarship system of Jharkhand. It processes Post-Matric and Pre-Matric educational financial aid for SC, ST, and BC category students studying within or outside Jharkhand.',
        stats: {
            activeSchemes: '5+ Active Scholarships',
            beneficiaries: '4.5 Lakh+ Annually',
            disbursementType: 'Direct Benefit Transfer (DBT)',
            verificationMode: 'Institute + DNO Verification'
        },
        loginSteps: [
            { step: '01', title: 'Visit Official Web Portal', desc: 'Go to ekalyan.cgg.gov.in and select "Student Login" (Within State or Outside State).' },
            { step: '02', title: 'Enter Credentials', desc: 'Login using your Mobile Number / Student Name / Email ID and your secret password.' },
            { step: '03', title: 'Fill Registration Form', desc: 'Select your scholarship (Post-Matric Within State or Post-Matric Outside State) and enter academic details.' },
            { step: '04', title: 'Upload Signed Documents', desc: 'Upload scanned copies of Income Certificate (from CO/Tahsildar), Bonafide Certificate, and Marksheet.' }
        ],
        statusSteps: [
            { title: 'Step 1: Open Application Status Tab', desc: 'On the e-Kalyan homepage, click on "Application Status" under the quick links menu.' },
            { title: 'Step 2: Select Academic Year & Mobile No.', desc: 'Choose the current Academic Year (2025-26) and enter your Application ID or Aadhaar Number.' },
            { title: 'Step 3: Decode Portal Status Messages', desc: 'Check if your status shows "Approved by DA Officer", "Pending at Institute", or "Sent to PFMS".' }
        ],
        documents: [
            { name: 'Income Certificate', format: 'PDF (< 150 KB)', note: 'Must be issued by CO / SDO / DC on or after 1st September.' },
            { name: 'Caste Certificate', format: 'PDF (< 150 KB)', note: 'Valid online SC/ST/BC certificate from Tahsildar.' },
            { name: 'Bonafide Certificate', format: 'PDF (< 150 KB)', note: 'Issued by college principal specifying annual fee structure.' },
            { name: 'Marksheet of Previous Exam', format: 'PDF (< 150 KB)', note: 'Attested copy of last passed qualifying exam.' },
            { name: 'Bank Passbook & Aadhaar Link', format: 'PDF (< 150 KB)', note: 'First page of bank passbook with clear account number and IFSC.' }
        ],
        topSchemes: [
            { name: 'Jharkhand Post-Matric SC Scholarship', slug: 'jharkhand-e-kalyan-post-matric-scholarship', targetGroup: 'SC Students (Class 11 to PG)', amount: 'Up to ₹50,000/year' },
            { name: 'Jharkhand Post-Matric ST Scholarship', slug: 'jharkhand-post-matric-st-scholarship', targetGroup: 'ST Students (UG/PG/Diploma)', amount: 'Up to ₹50,000/year' },
            { name: 'Jharkhand Post-Matric BC Scholarship', slug: 'jharkhand-post-matric-bc-scholarship', targetGroup: 'BC / OBC Category Students', amount: 'Up to ₹35,000/year' }
        ],
        faqs: [
            { q: 'How to check e-Kalyan Jharkhand payment status via PFMS?', a: 'Visit pfms.nic.in -> "Know Your Payments" -> Enter your Aadhaar-linked Bank Account number and bank name to check e-Kalyan credit status.' },
            { q: 'What does "Pending at DA Officer" mean in e-Kalyan?', a: 'It means your application has been verified by your college principal and is currently awaiting approval from the District Approval (DA) Officer.' },
            { q: 'Can out-of-state Jharkhand students apply on e-Kalyan?', a: 'Yes, select the "Post-Matric Outside State" option during registration and upload your college bonafide certificate.' },
            { q: 'My e-Kalyan application was rejected due to Income Certificate. What to do?', a: 'Re-upload a fresh Income Certificate issued by CO/SDO dated after September 1st using the "Edit Application" option before the closing date.' }
        ],
        helpline: {
            phone: '+91-8409002912 / +91-7004058916',
            email: 'helpdeskekalyan@gmail.com',
            address: 'Welfare Complex, Morabadi, Ranchi, Jharkhand - 834008',
            hours: '10:00 AM to 5:00 PM (Monday to Saturday)'
        }
    },
    'digital-gujarat-mysy': {
        id: 'digital-gujarat-mysy',
        aliases: ['digital-gujarat', 'mysy', 'gujarat-scholarship'],
        name: 'Digital Gujarat & MYSY Portal',
        state: 'Gujarat',
        fullTitle: 'Digital Gujarat & MYSY Scholarship Portal 2026: Login, Status & Application Guide',
        seoDesc: 'Complete guide to Digital Gujarat (digitalgujarat.gov.in) and MYSY scholarship schemes. Check student portal login, registration status, document checklist, and renewal rules.',
        officialUrl: 'https://www.digitalgujarat.gov.in',
        portalTag: 'State Government Portal',
        description: 'Digital Gujarat is the single-window digital services portal of the Government of Gujarat hosting over 30 post-matric, pre-matric, and higher education assistance schemes alongside the Mukhyamantri Yuva Swavalamban Yojana (MYSY).',
        stats: {
            activeSchemes: '35+ Scholarships',
            beneficiaries: '8 Lakh+ Students',
            disbursementType: 'DBT via Treasury',
            verificationMode: 'Online Document Verification'
        },
        loginSteps: [
            { step: '01', title: 'Register on Digital Gujarat', desc: 'Click "Register" on digitalgujarat.gov.in using your mobile number and email ID.' },
            { step: '02', title: 'Profile Completion', desc: 'Fill personal details, Aadhaar number, bank account info, and caste category.' },
            { step: '03', title: 'Select Scholarship Program', desc: 'Navigate to "Services" -> "Scholarship Services" and select your specific scholarship (SC/ST/OBC/MYSY).' },
            { step: '04', title: 'Upload Files & Final Submit', desc: 'Attach income proof, marksheets, and college fee receipt. Download application PDF.' }
        ],
        statusSteps: [
            { title: 'Step 1: Login to Dashboard', desc: 'Sign in to digitalgujarat.gov.in with your Citizen Login credentials.' },
            { title: 'Step 2: Go to My Applications', desc: 'Click on "Scholarship Application Status" on your dashboard menu.' },
            { title: 'Step 3: Review Verification Stage', desc: 'View status timeline: Pending at Principal -> Verified by District Officer -> Payment Sanctioned.' }
        ],
        documents: [
            { name: 'Income Certificate (Mamlatdar/Tahsildar)', format: 'JPG/PDF (< 200 KB)', note: 'Annual family income must be within scholarship limits.' },
            { name: 'Caste Certificate', format: 'JPG/PDF (< 200 KB)', note: 'For SC/ST/SEBC/OBC applicants.' },
            { name: 'Fee Receipt & Bonafide', format: 'JPG/PDF (< 200 KB)', note: 'Current academic year college fee payment proof.' },
            { name: 'Standard 10th & 12th Marksheets', format: 'JPG/PDF (< 200 KB)', note: 'Showing minimum 80 percentile for MYSY.' },
            { name: 'Aadhaar-Seeded Bank Passbook', format: 'JPG/PDF (< 200 KB)', note: 'Bank account must be NPCI mapped for DBT.' }
        ],
        topSchemes: [
            { name: 'Digital Gujarat Post-Matric SC Scholarship', slug: 'digital-gujarat-post-matric-scholarship-for-sc-students', targetGroup: 'SC Category Students', amount: 'Full Tuition + Maintenance' },
            { name: 'Gujarat Post-Matric OBC Scholarship', slug: 'gujarat-post-matric-scholarship-for-obc', targetGroup: 'OBC / SEBC Students', amount: 'Up to ₹20,000/year' },
            { name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)', slug: 'mukhyamantri-yuva-swavalamban-yojana-mysy', targetGroup: 'Higher Ed Merit Students (80%+)', amount: 'Up to ₹2,00,000/year' }
        ],
        faqs: [
            { q: 'Can I apply for both MYSY and Digital Gujarat scholarships?', a: 'No, students can claim only one government scholarship benefit per academic year.' },
            { q: 'What is the cutoff percentage for MYSY Gujarat?', a: 'Candidates must score at least 80 percentile in Class 12 (Board exam) or Diploma to qualify for MYSY.' },
            { q: 'How to fix "Application Sent Back to Student" in Digital Gujarat?', a: 'Login to your portal dashboard, check the discrepancy remark noted by your principal, upload the corrected document, and resubmit.' }
        ],
        helpline: {
            phone: '18002335500 (Toll Free)',
            email: 'digitalgujarat@gujarat.gov.in',
            address: 'Block No. 1, 7th Floor, Sardar Patel Bhavan, Sachivalaya, Gandhinagar - 382010',
            hours: '10:30 AM to 6:00 PM (Working Days)'
        }
    },
    'nsp': {
        id: 'nsp',
        aliases: ['national-scholarship-portal', 'scholarships-gov-in'],
        name: 'National Scholarship Portal (NSP)',
        state: 'All India (Central)',
        fullTitle: 'National Scholarship Portal (NSP) 2026: OTR Registration, Login & Status Guide',
        seoDesc: 'Complete guide to National Scholarship Portal (scholarships.gov.in). Learn about NSP OTR registration, Face-RD biometric verification, PFMS status tracking, and central scholarships.',
        officialUrl: 'https://scholarships.gov.in',
        portalTag: 'Central Government Portal',
        description: 'The National Scholarship Portal (NSP) is India’s flagship digital platform under the Ministry of Electronics and Information Technology (MeitY) hosting central, state, and autonomous body (UGC/AICTE) scholarships worth over ₹4,000 Crore annually.',
        stats: {
            activeSchemes: '80+ Central & State Scholarships',
            beneficiaries: '1.2 Crore+ Applicants',
            disbursementType: 'DBT via PFMS System',
            verificationMode: 'Aadhaar OTR + Face-RD Verification'
        },
        loginSteps: [
            { step: '01', title: 'Complete OTR Registration', desc: 'Download NSP OTR App or visit scholarships.gov.in to complete Aadhaar Face-RD biometric OTR.' },
            { step: '02', title: 'Get 14-Digit OTR Reference ID', desc: 'Receive your permanent OTR ID on your Aadhaar-registered mobile number.' },
            { step: '03', title: 'Login & Scholarship Matching', desc: 'Sign in to NSP Portal. System automatically matches qualifying scholarships based on your profile.' },
            { step: '04', title: 'Institute & DNO Submission', desc: 'Submit application online and submit physical document set to college Nodal Officer.' }
        ],
        statusSteps: [
            { title: 'Step 1: Login to NSP Portal', desc: 'Go to NSP homepage and click "Student Login" -> "Fresh / Renewal 2025-26".' },
            { title: 'Step 2: Track Application Lifecycle', desc: 'Monitor progress: Application Verified by INO -> Verified by DNO/SNO -> Sent to PFMS for Payment.' },
            { title: 'Step 3: Check Payment Token ID', desc: 'Once status shows "Payment Sanctioned", copy your PFMS Token ID to track bank credit.' }
        ],
        documents: [
            { name: 'Aadhaar Card / Enrolment ID', format: 'Biometric Verified', note: 'Must be linked with active mobile number.' },
            { name: 'Income Certificate', format: 'PDF (< 200 KB)', note: 'Issued by competent State Revenue Authority.' },
            { name: 'Caste / Community Certificate', format: 'PDF (< 200 KB)', note: 'For SC, ST, OBC, and Minority categories.' },
            { name: 'Institution Bonafide Certificate', format: 'PDF (< 200 KB)', note: 'System-generated format printed on college letterhead.' },
            { name: 'Previous Year Marksheet', format: 'PDF (< 200 KB)', note: 'Showing minimum required percentage.' }
        ],
        topSchemes: [
            { name: 'PM Yashasvi Scholarship (Vibrant India)', slug: 'pm-yashasvi-scholarship', targetGroup: 'OBC / EBC / DNT Students', amount: 'Up to ₹1,25,000/year' },
            { name: 'Central Sector Scheme of Scholarship (CSSS)', slug: 'central-sector-scheme-of-scholarship', targetGroup: 'Top 20th Percentile 12th Pass', amount: 'Up to ₹20,000/year' },
            { name: 'National Means-cum-Merit Scholarship (NMMS)', slug: 'national-means-cum-merit-scholarship', targetGroup: 'Class 9 to 12 Merit Students', amount: '₹12,000/year' }
        ],
        faqs: [
            { q: 'What is NSP OTR and why is it mandatory?', a: 'OTR (One-Time Registration) is a unique 14-digit identifier generated via Aadhaar biometric/Face-RD authentication. It replaces annual registration on NSP.' },
            { q: 'How to fix "Application Rejected by INO" on NSP?', a: 'Contact your Institute Nodal Officer (INO) immediately. Request them to unlock or re-verify your application after uploading corrected certificates.' },
            { q: 'Why is my NSP payment status showing "Payment Failed"?', a: 'Payment fails if your bank account is not mapped to your Aadhaar in the NPCI mapper database. Visit your bank branch to request Aadhaar Seeding.' }
        ],
        helpline: {
            phone: '0120-6619540 (NSP Helpdesk)',
            email: 'helpdesk@nsp.gov.in',
            address: 'National Informatics Centre (NIC), CGO Complex, Lodhi Road, New Delhi - 110003',
            hours: '24x7 Help Desk Support'
        }
    },
    'ssp-karnataka': {
        id: 'ssp-karnataka',
        aliases: ['ssp', 'ssp-portal', 'karnataka-scholarship'],
        name: 'SSP Karnataka Portal',
        state: 'Karnataka',
        fullTitle: 'SSP Karnataka Portal 2026: Post-Matric & Pre-Matric Student Login & Status Guide',
        seoDesc: 'Complete guide to SSP Karnataka (ssp.postmatric.karnataka.gov.in). Learn Kutumba ID creation, e-Attestation, student login, status check, and Social Welfare scholarships.',
        officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
        portalTag: 'State Government Portal',
        description: 'The State Scholarship Portal (SSP) of Karnataka automates educational financial assistance across Social Welfare, Tribal Welfare, Backward Classes Welfare, Minorities Welfare, and Technical Education departments.',
        stats: {
            activeSchemes: '12+ State Scholarships',
            beneficiaries: '10 Lakh+ Students',
            disbursementType: 'Direct DBT to Bank Account',
            verificationMode: 'Kutumba Data API Auto-Fetch'
        },
        loginSteps: [
            { step: '01', title: 'Create Kutumba Family ID', desc: 'Ensure your family is registered in the Karnataka Kutumba software portal.' },
            { step: '02', title: 'Register Account on SSP', desc: 'Create SSP student account using Aadhaar, Kutumba ID, and Mobile number.' },
            { step: '03', title: 'Complete e-Attestation', desc: 'Upload study certificates on e-Attestation portal and get them approved by designated officers.' },
            { step: '04', title: 'Submit SSP Application', desc: 'Login to SSP, enter SSLC Registration Number, select college, and submit form.' }
        ],
        statusSteps: [
            { title: 'Step 1: Open Student Login', desc: 'Visit ssp.postmatric.karnataka.gov.in and click "Student Login".' },
            { title: 'Step 2: Enter Student ID & Password', desc: 'Use your SSP Student ID (e.g. 2024001234) and password.' },
            { title: 'Step 3: Click "Track Student Status"', desc: 'View department-wise fee reimbursement and maintenance allowance payment status.' }
        ],
        documents: [
            { name: 'Kutumba Family ID Number', format: 'Digitized Auto-Fetch', note: 'Mandatory for Karnataka residents.' },
            { name: 'Aadhaar Card of Student & Parent', format: 'Biometric Authenticated', note: 'Must be linked to mobile.' },
            { name: 'Caste & Income Certificate (RD Number)', format: '15-Digit RD Number', note: 'Auto-fetched via NadaKacheri database.' },
            { name: 'e-Attestation Approved Document IDs', format: 'Digital IDs', note: 'Mark sheets and fee receipts must be e-attested.' }
        ],
        topSchemes: [
            { name: 'Karnataka Post-Matric SC Scholarship', slug: 'post-matric-scholarship-for-sc-students-karnataka', targetGroup: 'SC Category Students', amount: 'Full Fee Reimbursement + Hostel' },
            { name: 'Karnataka Post-Matric ST Scholarship', slug: 'post-matric-scholarship-for-st-students-karnataka', targetGroup: 'ST Category Students', amount: 'Up to ₹25,000/year' },
            { name: 'Karnataka EPASS OBC Scholarship', slug: 'karnataka-epass-obc-post-matric-scholarship', targetGroup: 'OBC / Backward Classes', amount: 'Tuition Fee Waiver' }
        ],
        faqs: [
            { q: 'What is Kutumba ID in SSP Karnataka?', a: 'Kutumba is the family database portal of Karnataka. SSP automatically pulls family income and caste data using your Kutumba ID.' },
            { q: 'How to resolve "Income Certificate RD Number Not Found" in SSP?', a: 'Ensure your Caste/Income certificate was issued by NadaKacheri in Karnataka and is currently valid (< 5 years old).' }
        ],
        helpline: {
            phone: '080-22536284 / 080-22536285',
            email: 'postmatrichelp@karnataka.gov.in',
            address: 'Social Welfare Department, Vikasa Soudha, Bengaluru - 560001',
            hours: '10:00 AM to 5:30 PM (Monday to Saturday)'
        }
    },
    'aikyashree-west-bengal': {
        id: 'aikyashree-west-bengal',
        aliases: ['aikyashree', 'svmcm', 'wbmdfc'],
        name: 'Aikyashree & West Bengal Welfare Portals',
        state: 'West Bengal',
        fullTitle: 'Aikyashree & West Bengal Scholarship Portals 2026: Login & Status Guide',
        seoDesc: 'Complete guide to West Bengal scholarship portals (Aikyashree WBMDFC, Oasis, SVMCM, Kanyashree). Learn how to check status, portal login, and document submission.',
        officialUrl: 'https://wbmdfc.org/aikyashree',
        portalTag: 'State Government Portal',
        description: 'Aikyashree is the unified scholarship portal managed by the West Bengal Minorities Development and Finance Corporation (WBMDFC) alongside Oasis (SC/ST) and Swami Vivekananda Merit-cum-Means (SVMCM) portals.',
        stats: {
            activeSchemes: '10+ Major Scholarships',
            beneficiaries: '25 Lakh+ Students',
            disbursementType: 'State Treasury Direct Credit',
            verificationMode: 'School/College + BDO Level'
        },
        loginSteps: [
            { step: '01', title: 'Select Portal & Scholarship', desc: 'Choose Aikyashree (Minorities), Oasis (SC/ST), or SVMCM (Merit) based on eligibility.' },
            { step: '02', title: 'Student Registration', desc: 'Enter district, institution, name, mobile number, and bank account details.' },
            { step: '03', title: 'Generate Application ID', desc: 'Save your unique Application ID (e.g. SSP20250100...) and password.' },
            { step: '04', title: 'Upload & Submit Hard Copy', desc: 'Upload marksheets and submit printed application copy to your school/college.' }
        ],
        statusSteps: [
            { title: 'Step 1: Click "Track Application"', desc: 'Go to wbmdfc.org/aikyashree or oasis.gov.in and select "Track Application".' },
            { title: 'Step 2: Enter District & User ID', desc: 'Select your institution district, enter Application ID and year.' },
            { title: 'Step 3: View Payment Credit Date', desc: 'Track stages: Approved by District -> Awaiting IFMS Lot Generation -> Money Credited.' }
        ],
        documents: [
            { name: 'Income Certificate (Gazetted Officer/BDO)', format: 'PDF (< 200 KB)', note: 'Family income proof for SVMCM & Pre-Matric.' },
            { name: 'Previous Year Marksheet (Both Sides)', format: 'PDF (< 200 KB)', note: '60%+ marks required for SVMCM.' },
            { name: 'West Bengal Domicile Certificate', format: 'PDF (< 200 KB)', note: 'Issued by Pradhan / Councillor / BDO.' },
            { name: 'Bank Passbook Front Page', format: 'PDF (< 200 KB)', note: 'Showing clear IFSC and Account number.' }
        ],
        topSchemes: [
            { name: 'Swami Vivekananda Merit-cum-Means (SVMCM)', slug: 'swami-vivekananda-merit-cum-means-scholarship-svmcm', targetGroup: 'Merit Students (60%+ Marks)', amount: 'Up to ₹60,000/year' },
            { name: 'Aikyashree West Bengal Minority Scholarship', slug: 'aikyashree-scholarship-west-bengal-minority', targetGroup: 'Minority Students (Muslim, Christian, etc.)', amount: 'Up to ₹33,000/year' },
            { name: 'Oasis SC/ST Scholarship West Bengal', slug: 'oasis-scholarship-west-bengal', targetGroup: 'SC & ST Students', amount: 'Full Tuition Fee Waiver' }
        ],
        faqs: [
            { q: 'What is IFMS Lot Number in Aikyashree / SVMCM?', a: 'IFMS Lot Number is the payment batch ID generated by the West Bengal Finance Department when releasing funds to your bank account.' },
            { q: 'Where do SC, ST and OBC students of West Bengal apply?', a: 'On the OASIS portal (oasis.gov.in), not Aikyashree. Our separate OASIS West Bengal portal guide covers its login, status check and documents.' },
            { q: 'Can I apply for Aikyashree if I am studying outside West Bengal?', a: 'Yes, WB domicile minority students studying in recognized institutions outside WB can apply under the "Outside State" option.' }
        ],
        helpline: {
            phone: '1800-120-2130 (Toll Free)',
            email: 'help.wbmdfc@gmail.com',
            address: 'AMBER, DD-27E, Salt Lake City, Sector-1, Kolkata - 700064',
            hours: '10:00 AM to 6:00 PM (Monday to Saturday)'
        }
    },
    'talliki-vandanam-ap': {
        id: 'talliki-vandanam-ap',
        aliases: ['talliki-vandanam', 'jagananna', 'ap-scholarship'],
        name: 'Talliki Vandanam & AP Welfare Portal',
        state: 'Andhra Pradesh',
        fullTitle: 'Talliki Vandanam & AP Government Scholarship 2026: Eligibility & Status Guide',
        seoDesc: 'Complete guide to Andhra Pradesh Talliki Vandanam Scheme and Jagananna Vidya Deevena. Check eligibility rules, release dates, NWC status, and mother bank account linking.',
        officialUrl: 'https://jaganannavidyadeevena.ap.gov.in',
        portalTag: 'State Government Portal',
        description: 'Talliki Vandanam (formerly Amma Vodi) is the flagship financial assistance scheme of the Government of Andhra Pradesh providing ₹15,000 annual financial aid to mothers sending their children to school/junior college.',
        stats: {
            activeSchemes: '4+ State Scholarships',
            beneficiaries: '43 Lakh+ Mothers',
            disbursementType: 'Direct Credit to Mother Account',
            verificationMode: 'Gram/Ward Secretariat Verification'
        },
        loginSteps: [
            { step: '01', title: 'School/College Enrollment', desc: 'Student must be enrolled in a recognized school/college in Andhra Pradesh.' },
            { step: '02', title: 'Secretariat Verification', desc: 'Visit your local Gram/Ward Secretariat with Aadhaar details of mother and child.' },
            { step: '03', title: 'E-KYC Verification', desc: 'Complete biometric e-KYC authentication at the Secretariat.' },
            { step: '04', title: 'Bank Account Seeding', desc: 'Ensure mother’s bank account is NPCI-seeded for direct DBT credit.' }
        ],
        statusSteps: [
            { title: 'Step 1: Visit NWC / Navasakam Portal', desc: 'Go to the official AP Grama Sachivalayam / Navasakam portal.' },
            { title: 'Step 2: Enter Mother Aadhaar Number', desc: 'Select "Scholarship Eligibility Status" and input mother\'s 12-digit Aadhaar number.' },
            { title: 'Step 3: Check Payment Sanction Status', desc: 'Status displays: Eligible -> Payment Released -> Bank Credit Confirmed.' }
        ],
        documents: [
            { name: 'Mother & Child Aadhaar Cards', format: 'Biometric Verified', note: 'Names must match school records.' },
            { name: 'Rice Card / White Ration Card', format: 'Digital Verified', note: 'Proof of Below Poverty Line (BPL) status.' },
            { name: 'School/College Bonafide ID', format: 'Paper Copy', note: 'Showing minimum 75% student attendance.' },
            { name: 'Mother NPCI-Linked Bank Passbook', format: 'Passbook Copy', note: 'Must be active single account.' }
        ],
        topSchemes: [
            { name: 'Talliki Vandanam Scheme (AP)', slug: 'talliki-vandanam-scheme-ap', targetGroup: 'Mothers of Class 1-12 Students', amount: '₹15,000/year' },
            { name: 'Jagananna Vidya Deevena (AP)', slug: 'jagananna-vidya-deevena-ap', targetGroup: 'Post-Matric ITI/Polytechnic/UG Students', amount: 'Full Fee Reimbursement' }
        ],
        faqs: [
            { q: 'What is the attendance requirement for Talliki Vandanam AP?', a: 'Students must maintain a minimum of 75% attendance in school/college to qualify for the annual ₹15,000 grant.' },
            { q: 'Whose bank account is required for Talliki Vandanam?', a: 'The financial assistance is strictly credited directly to the mother’s Aadhaar-seeded bank account.' }
        ],
        helpline: {
            phone: '1902 (Grievance Helpline)',
            email: 'support@navasakam.ap.gov.in',
            address: 'Department of School Education, Tadepalli, Guntur, AP - 522501',
            hours: '9:00 AM to 6:00 PM (Monday to Saturday)'
        }
    },
    'mptaas-mmvy-mp': {
        id: 'mptaas-mmvy-mp',
        aliases: ['mptaas', 'mmvy', 'mp-scholarship'],
        name: 'MPTAAS & MMVY Madhya Pradesh Portal',
        state: 'Madhya Pradesh',
        fullTitle: 'MPTAAS & MMVY Madhya Pradesh Portal 2026: Profile Verification & Status Guide',
        seoDesc: 'Complete guide to MPTAAS (tribal.mp.gov.in) and Mukhyamantri Medhavi Vidyarthi Yojana (MMVY). Profile registration, applicant login, status check, and OBC/SC/ST post-matric scholarships.',
        officialUrl: 'https://www.tribal.mp.gov.in/mptaas',
        portalTag: 'State Government Portal',
        description: 'MPTAAS (Madhya Pradesh Tribal Affairs Automation System) and MMVY are the primary digital portals of the MP State Government facilitating higher education tuition assistance and post-matric grants.',
        stats: {
            activeSchemes: '15+ MP State Scholarships',
            beneficiaries: '7 Lakh+ Students',
            disbursementType: 'Treasury e-Payment (DBT)',
            verificationMode: 'Profile ID + Samagra ID Auto-Fetch'
        },
        loginSteps: [
            { step: '01', title: 'Create MPTAAS Profile ID', desc: 'Register using Samagra ID, Aadhaar number, and Caste certificate number.' },
            { step: '02', title: 'Obtain 12-Digit Profile User ID', desc: 'Get permanent User ID (e.g. User12345678) and password via SMS.' },
            { step: '03', title: 'Apply for Post-Matric Scholarship', desc: 'Select course, institute code, admission year, and upload marksheets.' },
            { step: '04', title: 'College Lock & Verification', desc: 'Submit application online and request college nodal officer to lock application.' }
        ],
        statusSteps: [
            { title: 'Step 1: Login to MPTAAS', desc: 'Visit tribal.mp.gov.in/mptaas and enter User ID and Password.' },
            { title: 'Step 2: Navigate to Scholarship Application Status', desc: 'Click "PMS" -> "Application Status".' },
            { title: 'Step 3: Check Disbursement Status', desc: 'View status: Approved by Sanctioning Authority -> Sent to Treasury -> Sanction Order Issued.' }
        ],
        documents: [
            { name: 'Samagra Family & Member ID', format: '9-Digit Member ID', note: 'Mandatory for MP state domicile verification.' },
            { name: 'Digital Caste Certificate (RS-Number)', format: 'Digital Verified', note: 'Issued by MP Lok Seva Kendra.' },
            { name: 'Income Certificate', format: 'PDF (< 200 KB)', note: 'Family income certificate issued by Tehsildar.' },
            { name: 'Class 10th & 12th Marksheets', format: 'PDF (< 200 KB)', note: 'For MMVY 70%+ MP Board / 85%+ CBSE requirement.' }
        ],
        topSchemes: [
            { name: 'Mukhyamantri Medhavi Vidyarthi Yojana (MMVY)', slug: 'mukhyamantri-medhavi-vidyarthi-yojana-mmvy', targetGroup: 'Merit Students (70% MP / 85% CBSE)', amount: 'Full Higher Ed Fee Waiver' },
            { name: 'MP MPTAAS Post-Matric OBC Scholarship', slug: 'mp-mptaas-post-matric-scholarship-for-obc-students', targetGroup: 'OBC Category Students', amount: 'Up to ₹40,000/year' }
        ],
        faqs: [
            { q: 'What is Samagra ID and why is it needed for MPTAAS?', a: 'Samagra ID is the 9-digit resident ID issued by MP Government. MPTAAS uses Samagra ID to verify your family composition and domicile.' },
            { q: 'What is the minimum percentage required for MMVY Madhya Pradesh?', a: 'Students must secure 70% or more in MP Board or 85% or more in CBSE/ICSE Board Class 12 exams.' }
        ],
        helpline: {
            phone: '1800-2333-951 (Toll Free)',
            email: 'helpdesk.mptaas@mp.gov.in',
            address: 'Tribal Welfare Department, Satpura Bhawan, Bhopal, MP - 462004',
            hours: '10:00 AM to 5:00 PM (Working Days)'
        }
    },
    'e-grantz-kerala': {
        id: 'e-grantz-kerala',
        aliases: ['egrantz', 'e-grantz', 'kerala-scholarship'],
        name: 'E-Grantz 3.0 Kerala Portal',
        state: 'Kerala',
        fullTitle: 'E-Grantz 3.0 Kerala Portal 2026: Student Login, Status & Application Guide',
        seoDesc: 'Complete guide to E-Grantz 3.0 Kerala portal (egrantz.kerala.gov.in). Student registration, One-Time Login, status check, Akshaya centre submission, and SC/ST/OBC educational assistance.',
        officialUrl: 'https://egrantz.kerala.gov.in',
        portalTag: 'State Government Portal',
        description: 'E-Grantz 3.0 is the comprehensive Web-based Application for Processing Educational Grants for Post-Matriculation Students belonging to SC, ST, OBC, OEC, and Socially Backward classes in Kerala.',
        stats: {
            activeSchemes: '8+ State Scholarships',
            beneficiaries: '3 Lakh+ Students',
            disbursementType: 'Direct DBT via Akshaya e-Pay',
            verificationMode: 'Akshaya / Institution Online Verification'
        },
        loginSteps: [
            { step: '01', title: 'One-Time Registration (OTR)', desc: 'Register on egrantz.kerala.gov.in using Aadhaar number and active mobile number.' },
            { step: '02', title: 'Fill Personal & Course Details', desc: 'Enter academic qualification, institution name, SSLC registration details, and caste.' },
            { step: '03', title: 'Upload Certificates', desc: 'Attach income certificate, caste certificate, and SSLC marksheet.' },
            { step: '04', title: 'Institution Verification', desc: 'Submit application ID to your college E-Grantz Nodal Officer for approval.' }
        ],
        statusSteps: [
            { title: 'Step 1: Visit Track Application Page', desc: 'Open egrantz.kerala.gov.in and click "Track Application".' },
            { title: 'Step 2: Enter Aadhaar / Application No.', desc: 'Input your 12-digit Aadhaar number or E-Grantz Application ID.' },
            { title: 'Step 3: Review Disbursement Status', desc: 'View status: Verified by College -> Approved by SC/ST Development Officer -> Claim Sent to Bank.' }
        ],
        documents: [
            { name: 'Aadhaar Card', format: 'PDF (< 100 KB)', note: 'Must be linked to mobile number.' },
            { name: 'Income Certificate from Village Officer', format: 'PDF (< 100 KB)', note: 'Must be valid for current financial year.' },
            { name: 'Caste Certificate', format: 'PDF (< 100 KB)', note: 'For SC, ST, OBC, OEC categories.' },
            { name: 'SSLC / Higher Secondary Marksheet', format: 'PDF (< 100 KB)', note: 'Verification of date of birth and academic eligibility.' }
        ],
        topSchemes: [
            { name: 'E-Grantz Kerala SC/ST/OEC Educational Support', slug: 'e-grantz-kerala-scstoecobc-support', targetGroup: 'Post-Matric SC/ST/OEC/OBC Students', amount: 'Full Tuition + Monthly Stipend' }
        ],
        faqs: [
            { q: 'Who is eligible for E-Grantz 3.0 Kerala?', a: 'Post-Matric students in Kerala belonging to SC/ST categories (no income limit) and OBC/OEC categories (with income limits) are eligible.' },
            { q: 'What to do if E-Grantz status shows "Bank Account Rejected"?', a: 'Visit your bank branch to ensure your Aadhaar number is seeded with your account in the NPCI mapper, then update details in E-Grantz portal.' }
        ],
        helpline: {
            phone: '0471-2303706 / 2300301',
            email: 'egrantzhelp@gmail.com',
            address: 'Directorate of Scheduled Castes Development, Museum P.O., Thiruvananthapuram - 695033',
            hours: '10:15 AM to 5:00 PM (Monday to Saturday)'
        }
    },
    'up-scholarship': {
        id: 'up-scholarship',
        aliases: ['up-scholarship-portal', 'saksham-up', 'upscholarship'],
        name: 'UP Scholarship & Fee Reimbursement Portal (Saksham)',
        state: 'Uttar Pradesh',
        fullTitle: 'UP Scholarship Portal 2026: Student Registration, Login, Status & Guidelines',
        seoDesc: 'Comprehensive guide to the Uttar Pradesh Scholarship Portal (scholarship.up.gov.in / Saksham). Student login, Pre-Matric & Post-Matric Dashmottar application status, DIOS verification, and PFMS tracking.',
        officialUrl: 'https://scholarship.up.gov.in',
        portalTag: 'State Government Portal',
        description: 'The UP Scholarship & Fee Reimbursement Online System (Saksham) is the official portal of the Social Welfare, Backward Class Welfare, and Minority Welfare Departments of Uttar Pradesh. It processes educational scholarships and fee waivers for millions of students across Pre-Matric and Post-Matric Dashmottar schemes.',
        stats: {
            activeSchemes: '10+ State Schemes',
            beneficiaries: '50 Lakh+ Students Annually',
            disbursementType: 'Direct Benefit Transfer via PFMS',
            verificationMode: 'Institute + DIOS + DWO Verification'
        },
        loginSteps: [
            { step: '01', title: 'Visit Official Portal & Register', desc: 'Go to scholarship.up.gov.in and click "Student" -> "Registration" (Fresh or Renewal).' },
            { step: '02', title: 'Choose Category & Education Level', desc: 'Select your caste category (General/SC/ST, OBC, or Minority) and educational stage (Pre-Matric, Post-Matric Inter, or Post-Matric Other Than Inter).' },
            { step: '03', title: 'Generate Registration Number', desc: 'Fill in High School board details, mobile number, and create a secure password to generate your UP Scholarship Registration Number.' },
            { step: '04', title: 'DigiLocker Verification & Scrutiny', desc: 'Log in under Student Login, complete DigiLocker authentication, enter e-District income and caste certificate numbers, and submit for institutional scrutiny.' }
        ],
        statusSteps: [
            { title: 'Step 1: Open Application Status Tab', desc: 'Open scholarship.up.gov.in and click on the "Status" dropdown in the main header menu.' },
            { title: 'Step 2: Enter Registration & Birth Date', desc: 'Select your application session and input your Registration Number and Date of Birth.' },
            { title: 'Step 3: Track Verification & PFMS Release', desc: 'View your real-time status: College Scrutiny -> District Inspector of Schools (DIOS) Clearance -> District Welfare Officer (DWO) Approval -> PFMS Disbursed.' }
        ],
        documents: [
            { name: 'Income Certificate (Aay Praman Patra)', format: 'Digital Verified', note: 'Must be issued by UP Revenue Department e-District portal and valid for 3 years.' },
            { name: 'Caste Certificate (Jati Praman Patra)', format: 'Digital Verified', note: 'Mandatory for SC, ST, and OBC categories issued via UP e-District.' },
            { name: 'Domicile Certificate (Niwas Praman Patra)', format: 'Digital Verified', note: 'Proof of permanent Uttar Pradesh state residence.' },
            { name: 'Class 10 Marksheet & Roll Number', format: 'PDF (< 100 KB)', note: 'Used for DigiLocker authentication and birth date validation.' },
            { name: 'College Fee Receipt & Bonafide Slip', format: 'PDF (< 100 KB)', note: 'Current academic session college admission and fee breakdown receipt.' },
            { name: 'Aadhaar-Seeded Bank Passbook', format: 'PDF (< 100 KB)', note: 'Bank account must have active NPCI mapping for DBT scholarship credit.' }
        ],
        topSchemes: [
            { name: 'UP Scholarship Portal (Dashmottar Schemes)', slug: 'up-scholarship-portal', targetGroup: 'Post-Matric & Higher Education Students', amount: 'Full Tuition Fee Waiver' },
            { name: 'UP Pre-Matric Scholarship (General/SC/ST)', slug: 'up-pre-matric-scholarship-general-sc-st', targetGroup: 'Class 9 & 10 SC/ST/General Students', amount: '₹3,000/year' },
            { name: 'UP Pre-Matric Scholarship (OBC)', slug: 'up-pre-matric-scholarship-obc', targetGroup: 'Class 9 & 10 OBC Students', amount: '₹3,000/year' },
            { name: 'UP Pre-Matric Scholarship (Minority)', slug: 'up-pre-matric-scholarship-minority', targetGroup: 'Class 9 & 10 Minority Students', amount: '₹3,000/year' }
        ],
        faqs: [
            { q: 'How can I check my UP Scholarship status online?', a: 'Visit scholarship.up.gov.in, navigate to the Status tab, choose your academic session, enter your Registration Number and Date of Birth, and submit to inspect your live scrutiny status report.' },
            { q: 'What does "Pending at District Scholarship Committee" mean on UP Scholarship?', a: 'It means your application has passed college and DIOS level verification, and is currently pending financial sanction and quota clearance by the District Welfare Officer (DWO).' },
            { q: 'Why is DigiLocker integration required on UP Scholarship portal?', a: 'DigiLocker integration enables automated verification of educational marksheets, caste certificates, and domicile documents directly from official state repositories, preventing fraudulent claims.' },
            { q: 'What should I do if my UP Scholarship status shows "Bank Account Not Mapped with NPCI"?', a: 'Visit your bank branch immediately with an Aadhaar DBT Seeding consent form to activate your NPCI mapper. Payments will fail on PFMS until this mapping is active.' }
        ],
        helpline: {
            phone: '0522-3538700 / Toll Free 1076',
            email: 'helpdesk.upscholarship@gmail.com',
            address: 'Directorate of Social Welfare, Kalyan Bhawan, Prag Narain Road, Lucknow, Uttar Pradesh - 226001',
            hours: '10:00 AM to 5:00 PM (Working Days)'
        }
    },
    'mahadbt-maharashtra': {
        id: 'mahadbt-maharashtra',
        aliases: ['mahadbt', 'mahadbt-status', 'mahadbtmahait'],
        name: 'MahaDBT Scholarship Portal (Maharashtra)',
        state: 'Maharashtra',
        fullTitle: 'MahaDBT Portal 2026: Student Login, Application Status & Schemes Guide',
        seoDesc: 'Complete guide to the Maharashtra MahaDBT scholarship portal (mahadbt.maharashtra.gov.in). Student profile registration, Aadhaar authentication, Rajarshi Shahu Maharaj fee waiver, and PFMS tracking.',
        officialUrl: 'https://mahadbt.maharashtra.gov.in',
        portalTag: 'State Government Portal',
        description: 'MahaDBT (Maharashtra Direct Benefit Transfer) is the unified state welfare portal developed by the Government of Maharashtra. It manages post-matric scholarships, tuition fee waivers, hostel allowances, and educational stipends across Social Justice, Tribal Development, Higher Education, and Technical Education directorates.',
        stats: {
            activeSchemes: '14+ State Departments',
            beneficiaries: '15 Lakh+ Students',
            disbursementType: 'Aadhaar-Based DBT Transfer',
            verificationMode: 'College Desk 1 -> Desk 2 -> Department DDO'
        },
        loginSteps: [
            { step: '01', title: 'New Applicant Registration', desc: 'Visit mahadbt.maharashtra.gov.in and click "Post-Matric Scholarship" -> "New Applicant Registration".' },
            { step: '02', title: 'Aadhaar Biometric/OTP Verification', desc: 'Authenticate using your 12-digit Aadhaar number via OTP sent to your registered mobile number.' },
            { step: '03', title: 'Complete 6-Step Student Profile', desc: 'Log in and fill your Profile tabs: Personal Info, Address, Other Info, Caste, Income, and Past Academic Qualification.' },
            { step: '04', title: 'Select Scheme & Apply', desc: 'Search for your eligible department scheme (e.g., Rajarshi Shahu Maharaj or Post-Matric SC/OBC), link your current academic course, and submit.' }
        ],
        statusSteps: [
            { title: 'Step 1: Log in to MahaDBT Profile', desc: 'Sign in to mahadbt.maharashtra.gov.in using your registered username and secret password.' },
            { title: 'Step 2: Open My Applied Scheme', desc: 'Click on "My Applied Scheme" on the left-hand user dashboard navigation menu.' },
            { title: 'Step 3: Review Verification Stage', desc: 'Track stages: Under Scrutiny -> Approved -> Voucher Generated -> Disbursed via Aadhaar DBT.' }
        ],
        documents: [
            { name: 'Caste Certificate & Validity', format: 'Digital Verified', note: 'Caste Certificate and Caste Validity Certificate (mandatory for professional degrees).' },
            { name: 'Income Certificate from Tahsildar', format: 'Digital Verified', note: 'Annual household income certificate valid for the current financial year.' },
            { name: 'Maharashtra Domicile Certificate', format: 'Digital Verified', note: 'Certifying permanent domicile in Maharashtra state.' },
            { name: 'Previous Year Qualifying Marksheets', format: 'PDF (< 256 KB)', note: 'HSC, SSC, or last passed degree/diploma examination marksheet.' },
            { name: 'College Admission Letter & Fee Receipt', format: 'PDF (< 256 KB)', note: 'Current academic year college bonafide and fee structure slip.' },
            { name: 'Aadhaar-NPCI Seeded Bank Account', format: 'Digital Auto-Fetch', note: 'Account must be NPCI seeded for Aadhaar payment bridge disbursal.' }
        ],
        topSchemes: [
            { name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh', slug: 'maharashtra-rajarshi-shahu', targetGroup: 'EBC / General Merit Students (50% Fee Reimbursement)', amount: 'Up to 50% Tuition Fee Waiver' },
            { name: 'Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta', slug: 'dr-panjabrao-deshmukh-vasatigruh-nirvah-bhatta-yojna', targetGroup: 'Hosteller Children of Farmers & Labourers', amount: 'Up to ₹30,000/year' },
            { name: 'MahaDBT Post-Matric Scholarship (Maharashtra)', slug: 'mahadbt-post-matric-scholarship-maharashtra', targetGroup: 'SC / ST / VJNT / OBC Post-Matric Students', amount: 'Full Tuition + Maintenance' }
        ],
        faqs: [
            { q: 'Who is eligible for the Rajarshi Shahu Maharaj fee reimbursement on MahaDBT?', a: 'Students admitted under general or EBC categories in recognized degree or diploma courses with an annual family income up to ₹8,00,000 receive 50% tuition and exam fee reimbursement.' },
            { q: 'What does "Under Scrutiny" mean on the MahaDBT dashboard?', a: 'It means your application is currently undergoing scrutiny by your college scrutiny officer (Desk 1) and principal (Desk 2) for fee and attendance verification.' },
            { q: 'What is the Dr. Panjabrao Deshmukh hostel allowance on MahaDBT?', a: 'It provides up to ₹30,000 per year (for Mumbai/Pune) and ₹20,000 per year (other regions) to hosteller children of small/marginal farmers and registered labourers pursuing higher professional degrees.' },
            { q: 'What should I do if my MahaDBT application status shows "Send Back to Applicant"?', a: 'Log in to your profile, click on the application, review the specific defect raised by the college scrutiny clerk, update the flagged certificate or marks detail, and re-submit.' }
        ],
        helpline: {
            phone: '022-49150800',
            email: 'mahadbt.helpdesk@maharashtra.gov.in',
            address: 'Directorate of Information Technology, 7th Floor, Mantralaya, Madam Cama Road, Mumbai - 400032',
            hours: '09:00 AM to 06:00 PM (Monday to Saturday)'
        }
    },
    'oasis-west-bengal': {
        id: 'oasis-west-bengal',
        aliases: ['oasis', 'oasis-scholarship', 'oasis-wb', 'oasis-status'],
        name: 'OASIS West Bengal Scholarship Portal',
        state: 'West Bengal',
        fullTitle: 'OASIS Scholarship 2026: Login, Status Check & Documents',
        seoDesc: 'OASIS West Bengal (oasis.gov.in) guide for SC, ST and OBC students: login, status check, NSP OTR, OBC certificate revalidation and documents.',
        officialUrl: 'https://oasis.gov.in',
        portalTag: 'State Government Portal',
        description: 'The OASIS portal is the dedicated scholarship platform administered by the Backward Classes Welfare Department and Tribal Development Department of West Bengal. It is exclusively for processing Pre-Matric and Post-Matric scholarships for SC, ST, and OBC students.',
        stats: {
            activeSchemes: '6 Active Scholarships',
            beneficiaries: 'SC, ST & OBC students of West Bengal',
            disbursementType: 'Aadhaar-seeded bank account (DBT)',
            verificationMode: 'Biometric eKYC & Institute Verification'
        },
        loginSteps: [
            { step: '01', title: 'Complete Mandatory NSP OTR (For ST Students)', desc: 'ST students must first log in to the National Scholarship Portal (NSP) or use the NSP OTR mobile app to generate their One-Time Registration (OTR) via face authentication before applying on OASIS.' },
            { step: '02', title: 'Register or Login on OASIS', desc: 'Visit oasis.wb.gov.in. New users click \'Student\'s registration\' while existing users click \'Registered Student\'s Login\'.' },
            { step: '03', title: 'Select District', desc: 'Choose the district where your institution is located. If studying outside West Bengal, select your permanent address district.' },
            { step: '04', title: 'Fill Details & Perform KYC', desc: 'Enter your Aadhaar number, Khadyasathi number, and Caste Certificate details. Complete Aadhaar OTP validation or Biometric KYC as prompted.' }
        ],
        statusSteps: [
            { title: 'Step 1: Open the Track Application Page', desc: 'Go to the oasis.wb.gov.in homepage and click on the \'Track an application\' button.' },
            { title: 'Step 2: Select Your District', desc: 'Choose the district where your institution is located (or permanent district if studying outside the state).' },
            { title: 'Step 3: Check Verification & Payment', desc: 'Enter the application details the page asks for to see where your application stands: with your institute, at the Block/ULB or district level, or sent for payment.' }
        ],
        documents: [
            { name: 'Aadhaar Card', format: 'Number/KYC', note: 'Aadhaar-based biometric authentication or OTP KYC is mandatory. Must be seeded with your bank account.' },
            { name: 'Caste Certificate', format: 'Certificate No.', note: 'OBC certificates issued before 01.08.2025 must be revalidated on castcertificatewb.gov.in before applying.' },
            { name: 'Khadyasathi Card', format: 'Number', note: 'Students must enter their Khadyasathi number in the designated place on the application.' },
            { name: 'Income & DOB Proof', format: 'Hard Copy', note: 'Income certificate and proof of Date of Birth must be submitted to the Block/Sub-Division/DWO Kolkata office for verification.' },
            { name: 'Bank Passbook', format: 'Aadhaar Seeded Account', note: 'Scholarship amount will be credited to your own Aadhaar seeded bank account via Direct Benefit Transfer.' }
        ],
        topSchemes: [
            { name: 'Oasis Pre-Matric Scholarship for SC Students (West Bengal)', slug: 'oasis-pre-matric-scholarship-for-sc-students-west-bengal', targetGroup: 'SC', amount: 'Up to ₹4,500/year' },
            { name: 'Oasis Post-Matric Scholarship for SC Students (West Bengal)', slug: 'oasis-post-matric-scholarship-for-sc-students-west-bengal', targetGroup: 'SC', amount: 'Up to ₹12,000/year' },
            { name: 'Oasis Pre-Matric Scholarship for ST Students (West Bengal)', slug: 'oasis-pre-matric-scholarship-for-st-students-west-bengal', targetGroup: 'ST', amount: 'Up to ₹4,500/year' },
            { name: 'Oasis Post-Matric Scholarship for ST Students (West Bengal)', slug: 'oasis-post-matric-scholarship-for-st-students-west-bengal', targetGroup: 'ST', amount: 'Up to ₹12,000/year' },
            { name: 'Oasis Pre-Matric Scholarship for OBC Students (West Bengal)', slug: 'oasis-pre-matric-scholarship-for-obc-students-west-bengal', targetGroup: 'OBC', amount: 'Up to ₹3,500/year' },
            { name: 'Oasis Post-Matric Scholarship for OBC Students (West Bengal)', slug: 'oasis-post-matric-scholarship-for-obc-students-west-bengal', targetGroup: 'OBC', amount: 'Up to ₹7,500/year' }
        ],
        faqs: [
            { q: 'How can I check my OASIS scholarship payment status?', a: 'Click \'Track an application\' on oasis.wb.gov.in, choose your district and enter your application details. The scholarship is paid only into your own Aadhaar-seeded bank account, so if the status shows payment but no money has arrived, check with your bank that Aadhaar seeding is active.' },
            { q: 'What is the last date to apply for OASIS scholarships in 2026?', a: 'The portal does not list one common last date on its homepage; dates are announced per scheme in the portal\'s announcements. Each OASIS scholarship page on IndiaScholarships shows the last date we have most recently checked.' },
            { q: 'Are Aikyashree and SVMCM scholarships available on the OASIS portal?', a: 'No, the OASIS portal is strictly for SC, ST, and OBC students. Minority students must apply on the Aikyashree portal, and students seeking merit-based aid should use the SVMCM portal.' },
            { q: 'Why is my OBC caste certificate not being accepted on OASIS?', a: 'If your OBC caste certificate was issued before August 1, 2025 (01.08.2025), you must revalidate it first by visiting castcertificatewb.gov.in before applying on the OASIS portal.' },
            { q: 'Do I need an NSP OTR to apply on the OASIS portal?', a: 'Yes, if you are an ST student. The Ministry of Tribal Affairs (MoTA) requires ST students applying for Pre-Matric or Post-Matric scholarships to generate an OTR on the NSP Portal before applying on oasis.wb.gov.in.' },
            { q: 'Is biometric KYC needed for OASIS SC scholarships?', a: 'Yes for SC students. Following instructions from the Ministry of Social Justice and Empowerment, Aadhaar-based biometric authentication / eKYC is required for the Pre-Matric and Post-Matric scholarships for SC students. Aadhaar OTP validation is also available on the portal.' }
        ],
        helpline: {
            phone: '+91-84 20 02 3311',
            email: 'bcwoasis@gmail.com',
            address: 'Backward Classes Welfare Department, Government of West Bengal',
            hours: ''
        }
    },
    'odisha-state-scholarship-portal': {
        id: 'odisha-state-scholarship-portal',
        aliases: ['odisha-scholarship-portal', 'ossp', 'scholarship-odisha'],
        name: 'Odisha State Scholarship Portal',
        state: 'Odisha',
        fullTitle: 'Odisha Scholarship Portal 2026: Login & Status Check',
        seoDesc: 'Complete guide to the Odisha State Scholarship Portal 2026-27 (scholarship.odisha.gov.in). Learn how to check status, login, apply, and view deadlines.',
        officialUrl: 'https://scholarship.odisha.gov.in',
        portalTag: 'State Government Portal',
        description: 'The Odisha State Scholarship Portal (OSSP) is an integrated platform by the Government of Odisha designed to bridge the gap between scholarship providers and seekers. It hosts various pre-matric, post-matric, and merit schemes including e-Medhabruti, Gopabandhu, and ST/SC Post-Matric scholarships.',
        stats: {
            activeSchemes: '11 schemes open (2026-27)',
            beneficiaries: '9.77 lakh+ applicants (2026-27)',
            disbursementType: 'Direct Benefit Transfer',
            verificationMode: 'Institute & District Welfare Officer'
        },
        loginSteps: [
            { step: '01', title: 'Aadhaar Authentication', desc: 'Visit scholarship.odisha.gov.in and click on Registration. Enter your Aadhaar number and proceed to authenticate via OTP sent to your linked mobile number.' },
            { step: '02', title: 'Receive Login Credentials', desc: 'After successful registration, your Unique User ID and Password will be sent to your registered mobile number and e-mail ID.' },
            { step: '03', title: 'Student Login', desc: 'Click the login button on the portal and enter the provided User ID and password to access the scholarship application dashboard.' },
            { step: '04', title: 'Select Scheme & Apply', desc: 'Choose your Department and Scheme. Fill in all required student, academic, eligibility, and bank details. You can save as a draft before final submission.' }
        ],
        statusSteps: [
            { title: 'Step 1: Locate Status Section', desc: 'On the homepage of the Odisha State Scholarship Portal, find the \'Know Your Status\' section.' },
            { title: 'Step 2: Enter Details', desc: 'Type in your Aadhaar number or Application No. in the text box.' },
            { title: 'Step 3: Verify with OTP', desc: 'Click on \'Get OTP\', enter the password received on your mobile, and view your current application status.' }
        ],
        documents: [
            { name: 'Aadhaar Card', format: '', note: 'Mandatory for registration. Name, Gender, and DOB are fetched automatically from the Aadhaar database and cannot be edited.' },
            { name: 'Bank Information', format: '', note: 'Your own bank account details are entered in the form; the scholarship is paid into this account.' },
            { name: 'Scheme Specific Documents', format: '', note: 'Relevant documents asked in the site to be uploaded while filling up the online application.' }
        ],
        topSchemes: [
            { name: 'Post Matric Scholarship for ST Students (Odisha)', slug: 'post-matric-scholarship-for-st-students-odisha', targetGroup: 'ST Students', amount: 'Up to ₹5,50,000/year' },
            { name: 'Post Matric Scholarship for SC Students (Odisha)', slug: 'post-matric-scholarship-for-sc-students-odisha', targetGroup: 'SC Students', amount: 'Up to ₹1,20,000/year' },
            { name: 'Pre Matric Scholarship for ST Students (Odisha)', slug: 'pre-matric-scholarship-for-st-students-odisha', targetGroup: 'ST Students', amount: 'Up to ₹12,000/year' },
            { name: 'e-Medhabruti UG Merit Scholarship (Odisha)', slug: 'e-medhabruti-ug-merit-scholarship-odisha', targetGroup: 'General, SC, ST, OBC, SEBC, EBC', amount: 'Up to ₹10,000/year' },
            { name: 'Gopabandhu Sikhya Sahayata Yojana (Odisha)', slug: 'gopabandhu-sikhya-sahayata-yojana-odisha', targetGroup: 'All Students', amount: 'Up to ₹20,000/year' }
        ],
        faqs: [
            { q: 'How can I check my Odisha State Scholarship application status?', a: 'Use the \'Know Your Status\' feature on the portal homepage. Enter your Aadhaar number or Application No., request an OTP, and check your status.' },
            { q: 'What happens if I detect a mistake after submitting my application?', a: 'Immediately inform the nodal person dealing with scholarships at your institute. The institute has a \'Revert\' facility. Once they revert it, your application will become active in your login for editing and resubmission.' },
            { q: 'Can I log in without a mobile number linked to my Aadhaar?', a: 'No, Aadhaar authentication is mandatory for OSSP login. You must use a mobile number seeded to your Aadhaar to receive the OTP during registration.' },
            { q: 'Do I have to submit hard copies of my documents to the college?', a: 'According to the portal, submitting hard copies of documents to the institute is not mandatory, but your institute may ask for them, so check with it.' },
            { q: 'How do I renew my scholarship on the OSSP portal?', a: 'Existing users can log in using their credentials and continue by selecting either \'Renewal in new course\' or \'Renewal in same course\' depending on their current academic status.' },
            { q: 'What if my institute or course is missing from the drop-down menu?', a: 'You should approach your institute and ask them to contact the District Welfare Officer (DWO) of the district where the institute is located to register the institution or branch in the portal.' }
        ],
        helpline: {
            phone: '155335 / 1800-345-6770',
            email: 'scholarshipstsc@gmail.com / scholarshipsmed@gmail.com',
            address: 'ST & SC Development, Minorities & Backward Classes Welfare Department, Government of Odisha, Bhubaneswar-751001',
            hours: '9:00 AM to 5:00 PM on all Government official days'
        }
    }
};
