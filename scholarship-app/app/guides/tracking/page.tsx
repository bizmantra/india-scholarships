import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = {
    title: 'Scholarship Application Status Tracking Guide 2026 | IndiaScholarships',
    description: 'Learn how to track your scholarship application status online. Master PFMS tracking, understand statuses like "Sent to PFMS", "Institute Verified", and solve payment failures.',
};

export default function StatusTrackingGuide() {
    const statuses = [
        {
            name: 'Application Submitted / Pending Verification',
            meaning: 'Your application has been successfully submitted on the portal. It is now in the queue for your institution\'s designated Nodal Officer to verify your academic records.',
            action: 'Ensure your college/school has received your physical documents if they require offline verification to cross-check.'
        },
        {
            name: 'Institute Verified (Defective/Rejected if issues found)',
            meaning: 'Your school/college has verified your application. If there were errors, it might mark it "Defective" (allowing you to edit) or "Rejected".',
            action: 'If marked "Defective", login immediately, correct the details (e.g. upload correct marksheet), and re-submit.'
        },
        {
            name: 'District / State / Ministry Verified',
            meaning: 'Your application has cleared the college level and has been approved by the government district officer or department ministry.',
            action: 'No action needed. Your application is moving to merit list generation and financial sanction.'
        },
        {
            name: 'Sent to PFMS (Public Financial Management System)',
            meaning: 'Your details have been sent to PFMS for bank account validation. The system checks if your Aadhaar is linked to an active bank account for Direct Benefit Transfer (DBT).',
            action: 'Check your Aadhaar-Bank mapping status immediately on the UIDAI portal to ensure DBT is enabled.'
        },
        {
            name: 'Payment File Generated / Disbursed',
            meaning: 'The digital signature has been applied, the funds are approved, and the transfer has been initiated directly to your Aadhaar-linked bank account.',
            action: 'Check the SMS alerts on your Aadhaar-registered mobile number or view your bank statement.'
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
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="container mx-auto h-14 flex items-center px-4 justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-blue-700">IndiaScholarships</Link>
                        <span className="mx-3 text-gray-300">/</span>
                        <Link href="/guides" className="text-sm text-gray-600 hover:text-blue-700">Guides</Link>
                        <span className="mx-3 text-gray-300">/</span>
                        <span className="text-sm text-gray-500">Status Tracking</span>
                    </div>
                </div>
            </header>

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
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.meaning}</p>
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

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
