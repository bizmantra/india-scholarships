import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarship Application Status Tracking Guide 2026 | IndiaScholarships',
    description: 'Learn how to track your scholarship application status online. Master PFMS tracking, understand statuses like "Sent to PFMS", "Institute Verified", and solve payment failures.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/guides/tracking',
    }
};


export default function StatusTrackingGuide() {
    const statuses = [
        {
            title: 'Submitted / Pending for Verification',
            detail: 'Your application has been received successfully. It is now in the queue for your school/college institute nodal officer (INO) to review your academic certificates.',
            action: 'Ensure your institution INO logs in to verify before the state institute verification deadline.'
        },
        {
            title: 'Verified by Institute / Pending at District',
            detail: 'Your school/college has verified your documents. The application is now with the District Nodal Officer (DNO) or State Nodal Officer (SNO) for secondary level approval.',
            action: 'No student action needed. DNO/SNO verification typically takes 2–4 weeks after institute validation.'
        },
        {
            title: 'Sent to PFMS / Under Processing',
            detail: 'The department has approved your scholarship and forwarded it to the Public Financial Management System (PFMS) for direct bank transfer disbursement.',
            action: 'Start tracking on the PFMS portal using your Application ID or Bank Account details.'
        },
        {
            title: 'Payment Disbursed / Success',
            detail: 'Funds have been successfully transferred to your Aadhaar-linked active bank account.',
            action: 'Check your bank statements. Note: The amount might go to a different bank account than the one you entered if you have multiple accounts linked to Aadhaar.'
        }
    ];

    const troubleshooting = [
        {
            issue: 'Application Rejected by Institute',
            solution: 'Read the rejection remarks carefully. Most portals allow you to "defect" or re-open the form, correct errors (like uploading a clearer certificate), and re-submit.'
        },
        {
            issue: 'Aadhaar Not Seeded Error',
            solution: 'Visit your bank branch immediately and request Aadhaar-seeding with your active bank account. Verify status on UIDAI portal. Payment will fail if seeding is inactive.'
        },
        {
            issue: 'DNO Verification Delayed',
            solution: 'If verification is pending past the deadline, contact your district social welfare officer domain helplines or submit a query on the portal grievance desk.'
        }
    ];
    const steps = [
        {
            title: 'Visit the Official PFMS Portal',
            desc: 'Go to the official Public Financial Management System site (pfms.nic.in) and look for the "Track NSP Payment" or "Know Your Payment" section.'
        },
        {
            title: 'Enter Verification Details',
            desc: 'You can search by either entering your Bank Name and Account Number, or by entering your NSP Application ID / OTR ID.'
        },
        {
            title: 'Verify OTP',
            desc: 'Enter the captcha code, click on "Send OTP on Registered Mobile Number", and enter the OTP received on the phone linked to your bank account.'
        },
        {
            title: 'View Payment Details',
            desc: 'The portal will display your transaction status, including Sanction Number, Under Process status, or UTR/Ref transaction numbers.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Back Link */}
                <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-blue-700 font-bold mb-8 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to All Guides
                </Link>

                {/* Hero */}
                <div className="mb-12">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        Status & Disbursals
                    </span>
                    <h1 id="tracking-hero" className="text-4xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight font-serif">
                        Scholarship Status Tracking & PFMS Guide
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        After submitting your scholarship application, tracking its progress through various administrative and banking verification steps is essential to ensure your fund disbursement is not blocked.
                    </p>
                </div>

                {/* Critical Alert */}
                <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-12 flex gap-4">
                    <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-orange-900 mb-1">Direct Benefit Transfer (DBT) Requirement</h3>
                        <p className="text-sm text-orange-800/80 leading-relaxed">
                            Under government norms, scholarship funds are credited <strong>only</strong> via Aadhaar-based DBT. If your bank account is not mapped to your Aadhaar (Aadhaar Seeding) or DBT is disabled in your account, your status will fail at the PFMS level.
                        </p>
                    </div>
                </div>

                {/* Section: Common Statuses */}
                <section id="understanding-statuses" className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
                        Understanding Application Statuses
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Your application progresses through multiple levels of checks. Here is a breakdown of what each status means and the necessary actions to take:
                    </p>

                    <div className="space-y-6">
                        {statuses.map((item, idx) => (
                            <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.detail}</p>
                                <div className="p-4 bg-white rounded-xl border border-gray-100/80 flex items-start gap-3">
                                    <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-600 font-medium"><strong>What to do:</strong> {item.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: PFMS Tracking */}
                <section id="pfms-tracking" className="mb-16">
                    <div className="p-8 bg-black text-white rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4 font-serif">How to Track Payments on PFMS</h2>
                            <p className="text-gray-300 mb-8 max-w-xl leading-relaxed text-sm">
                                The Public Financial Management System (PFMS) manages all payment transfers for Central Government Schemes. Use these steps to check the payment history of your application.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1">
                                        <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="https://pfms.nic.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-blue-100 transition-all text-xs"
                            >
                                Open PFMS Portal <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Section: FAQs */}
                <section id="tracking-faqs" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                My status shows "Payment Rejected". What should I do?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                This usually happens due to bank account errors, such as account dormancy, incorrect IFSC codes, or a missing Aadhaar seeding mapping. You must visit your bank branch to verify that your account status is active and mapped for Aadhaar payments (DBT enabled), then update the portal or raise a support ticket.
                            </p>
                        </div>
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                What is the difference between PFMS status and NSP Portal status?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                The NSP portal handles student records, academic verifications, and eligibility validation. PFMS acts as the payment execution system. Once NSP approves a scholarship, the financial details are pushed to PFMS, which manages the bank transaction.
                            </p>
                        </div>
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                How long does it take for money to be disbursed after status changes to "Sent to PFMS"?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                After transition to "Sent to PFMS", it typically takes 15 to 30 days for bank account validation, digital token generation, and the final payment release, depending on the department's treasury fund limits.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
