import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    FileText, 
    ShieldCheck, 
    Calendar, 
    Globe, 
    HelpCircle, 
    PhoneCall, 
    ArrowRight, 
    ChevronRight, 
    Search,
    IndianRupee,
    UserCheck,
    Clock,
    LayoutGrid,
    ListFilter,
    Award
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { slugify } from '@/lib/utils';

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
        aliases: ['aikyashree', 'oasis', 'svmcm', 'wbmdfc'],
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
    }
};

const PORTAL_NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid, href: '#overview' },
    { key: 'student-login', label: 'Student Login', icon: UserCheck, href: '/student-login' },
    { key: 'status-check', label: 'Status Check', icon: Search, href: '/status-check' },
    { key: 'documents-list', label: 'Documents List', icon: FileText, href: '/documents-list' },
    { key: 'scholarships', label: 'Top Scholarships', icon: Award, href: '/schemes' },
    { key: 'faqs', label: 'FAQs', icon: HelpCircle, href: '#faqs' },
    { key: 'helpdesk', label: 'Helpdesk', icon: PhoneCall, href: '#helpdesk' }
];

// Generate static params for all portal guides + aliases
export async function generateStaticParams() {
    const params: Array<{ portal: string }> = [];
    
    Object.values(PORTALS_DATA).forEach(p => {
        params.push({ portal: p.id });
        p.aliases.forEach(alias => {
            params.push({ portal: alias });
        });
    });

    return params;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ portal: string }> }): Promise<Metadata> {
    const { portal } = await params;
    const key = portal.toLowerCase();
    
    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));

    if (!data) {
        return {
            title: 'Portal Guide Not Found | IndiaScholarships',
            alternates: {
                canonical: `https://www.indiascholarships.in/guides/${portal}`,
            }
        };
    }

    return {
        title: data.fullTitle,
        description: data.seoDesc,
        alternates: {
            canonical: `https://www.indiascholarships.in/guides/${data.id}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/guides/${data.id}`,
                'en': `https://www.indiascholarships.in/guides/${data.id}`,
            }
        }
    };
}

export default async function MasterPortalGuidePage({ params }: { params: Promise<{ portal: string }> }) {
    const { portal } = await params;
    const key = portal.toLowerCase();

    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));

    if (!data) {
        notFound();
    }

    if (key !== data.id) {
        redirect(`/guides/${data.id}`);
    }

    // Generate HowTo Schema
    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': `How to Apply & Login to ${data.name}`,
        'description': data.description,
        'step': data.loginSteps.map((s, idx) => ({
            '@type': 'HowToStep',
            'position': idx + 1,
            'name': s.title,
            'text': s.desc
        }))
    };

    // Generate FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': data.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': f.a
            }
        }))
    };

    return (
        <div className="min-h-screen bg-surface-gray flex flex-col font-sans text-gray-900 antialiased">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Header />

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <Link href="/guides" className="hover:text-google-blue transition-colors">Guides</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-900 font-bold">{data.name}</span>
                </div>
            </div>

            {/* Sticky Navigation Pill Bar (Design Helper) */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm py-2.5 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {PORTAL_NAV_ITEMS.map((item) => {
                        const IconComponent = item.icon;
                        const isHash = item.href.startsWith('#');
                        const targetUrl = isHash ? item.href : `/guides/${data.id}${item.href}`;
                        const isActive = item.key === 'overview';

                        return (
                            <Link
                                key={item.key}
                                href={targetUrl}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                                    isActive
                                        ? 'bg-google-blue text-white border-google-blue shadow-sm'
                                        : 'bg-surface-gray text-gray-700 border-gray-200 hover:border-google-blue hover:text-google-blue'
                                }`}
                            >
                                <IconComponent className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
                
                {/* Hero Header Section */}
                <div id="overview" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3.5 py-1 bg-blue-50 text-google-blue text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-100 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            {data.portalTag}
                        </span>
                        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {data.state}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        {data.fullTitle}
                    </h1>

                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-4xl">
                        {data.description}
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Active Scholarships</span>
                        <span className="text-lg font-black text-gray-900">{data.stats.activeSchemes}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Beneficiaries</span>
                        <span className="text-lg font-black text-gray-900">{data.stats.beneficiaries}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</span>
                        <span className="text-lg font-black text-google-blue">{data.stats.disbursementType}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Verification</span>
                        <span className="text-lg font-black text-emerald-600">{data.stats.verificationMode}</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* Section 1: How to Login & Register */}
                        <section id="student-login" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-google-blue rounded-2xl">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            How to Register & Login on {data.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Follow this 4-step official registration process</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/student-login`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-google-blue hover:underline"
                                >
                                    Full Login Guide <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {data.loginSteps.map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-gray border border-gray-100 hover:border-blue-200 transition-colors">
                                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-google-blue text-white font-black text-sm shrink-0">
                                            {item.step}
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 2: Application & Payment Status Check Guide */}
                        <section id="status-check" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            How to Check Application & PFMS Status
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Track your disbursement stage and approval progress</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/status-check`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:underline"
                                >
                                    Full Status Guide <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-4 mb-6">
                                {data.statusSteps.map((step, i) => (
                                    <div key={i} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-2xl">
                                        <h3 className="font-bold text-emerald-950 text-sm mb-1">{step.title}</h3>
                                        <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                                <Info className="h-5 w-5 text-google-blue shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-900 leading-relaxed">
                                    <strong>Pro-Tip for PFMS Credit Failures:</strong> Ensure your bank account is active and mapped to your Aadhaar number in the NPCI database. Payments via DBT will bounce if Aadhaar seeding is missing at your bank branch.
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Essential Documents Checklist */}
                        <section id="documents" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            Mandatory Document Upload Checklist
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Prepare these files before starting your online application</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/documents-list`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:underline"
                                >
                                    Full Docs List <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider">
                                            <th className="py-3 px-3">Document Name</th>
                                            <th className="py-3 px-3">Format / Size</th>
                                            <th className="py-3 px-3">Verification Rules</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.documents.map((doc, i) => (
                                            <tr key={i} className="hover:bg-surface-gray transition-colors">
                                                <td className="py-3.5 px-3 font-bold text-gray-900">{doc.name}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono text-[11px] font-semibold">{doc.format}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-gray-600 text-xs">{doc.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Section 4: Available Scholarships Hosted on Portal */}
                        <section id="schemes" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                    Top Scholarships Hosted on {data.name}
                                </h2>
                                <Link href={`/scholarships-in/${slugify(data.state)}`} className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1">
                                    View All {data.state} Scholarships <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {data.topSchemes.map((scheme, i) => (
                                    <div key={i} className="p-5 border border-gray-200 rounded-2xl hover:border-google-blue transition-all hover:shadow-md bg-white">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className="font-bold text-base text-gray-900 group-hover:text-google-blue">
                                                <Link href={`/scholarships/${scheme.slug}`}>{scheme.name}</Link>
                                            </h3>
                                            <span className="px-3 py-1 bg-green-50 text-green-700 font-extrabold text-xs rounded-full shrink-0 border border-green-200">
                                                {scheme.amount}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mb-4">{scheme.targetGroup}</p>
                                        <div className="flex items-center gap-4 text-xs font-bold">
                                            <Link href={`/scholarships/${scheme.slug}`} className="text-google-blue hover:underline flex items-center gap-1">
                                                Scholarship Overview <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                            <Link href={`/scholarships/${scheme.slug}/apply-online`} className="text-emerald-600 hover:underline flex items-center gap-1">
                                                Step-by-Step Apply <Globe className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 5: Troubleshooting FAQs */}
                        <section id="faqs" className="scroll-mt-32">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <HelpCircle className="h-6 w-6 text-google-blue" />
                                Frequently Asked Questions & Solutions
                            </h2>

                            <div className="space-y-4">
                                {data.faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:none bg-white">
                                        <summary className="flex items-center justify-between font-bold text-gray-900 cursor-pointer text-sm sm:text-base pr-2">
                                            <span>{faq.q}</span>
                                            <span className="transition group-open:rotate-180 text-google-blue shrink-0 ml-2">▼</span>
                                        </summary>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar (1/3 width) */}
                    <div id="helpdesk" className="space-y-6 scroll-mt-32">
                        
                        {/* Helpline & Office Contact Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                <PhoneCall className="h-5 w-5 text-google-blue" />
                                Official Portal Helpdesk
                            </h3>

                            <div className="space-y-3 text-xs sm:text-sm mb-6">
                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Helpline Phone</span>
                                    <span className="font-bold text-gray-900">{data.helpline.phone}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Support Email</span>
                                    <span className="font-bold text-google-blue font-mono break-all">{data.helpline.email}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Visiting Hours</span>
                                    <span className="font-medium text-gray-700">{data.helpline.hours}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Department Address</span>
                                    <span className="text-xs text-gray-600 leading-normal">{data.helpline.address}</span>
                                </div>
                            </div>

                            {/* External Official Link Moved Here Below Helpdesk */}
                            <a
                                href={data.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-surface-gray hover:bg-gray-100 text-gray-800 font-bold rounded-xl text-xs transition-colors border border-gray-200"
                            >
                                External Link: Official Portal <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                            </a>
                        </div>

                        {/* Fallback Corporate Scholarships Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-extrabold text-gray-900 mb-2">Looking for Private Aid?</h3>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Corporate CSR grants (Jindal, Tata, HDFC) can be claimed alongside government scholarships.
                            </p>

                            <Link
                                href="/private-scholarships"
                                className="flex items-center justify-between p-3.5 bg-surface-gray hover:bg-blue-50 rounded-xl text-xs font-bold text-gray-900 hover:text-google-blue border border-gray-100 transition-colors group"
                            >
                                <span>Explore Corporate Scholarships</span>
                                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
