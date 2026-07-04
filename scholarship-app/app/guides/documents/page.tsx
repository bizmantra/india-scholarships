import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, ShieldCheck, FileText, Check, HelpCircle } from 'lucide-react';

export const metadata = {
    title: 'Essential Scholarship Documents Checklist 2026 | IndiaScholarships',
    description: 'Complete documents checklist for Indian scholarship applications. Learn about mandatory certificates (Income, Domicile, Caste), Aadhaar mapping, and upload specifications.',
};

export default function DocumentsChecklistGuide() {
    const coreDocuments = [
        {
            name: 'Aadhaar Card (Identity & Address Proof)',
            detail: 'Must be linked to your active mobile number for OTP verification. Crucial: The name on your Aadhaar must match your school board marksheet exactly.',
            importance: 'High'
        },
        {
            name: 'Domicile / Residence Certificate',
            detail: 'Proof that you belong to the state offering the scholarship. Typically issued by local revenue officials (Tehsildar/SDM) online.',
            importance: 'High'
        },
        {
            name: 'Income Certificate (Family Income Proof)',
            detail: 'Must be issued for the current financial year. Check the specific scheme limit (e.g. less than ₹2.5 Lakhs annually). Self-attested declarations are usually not accepted.',
            importance: 'High'
        },
        {
            name: 'Caste Certificate (For SC/ST/OBC/EWS Categories)',
            detail: 'Required if you are applying under category-specific quotas. OBC certificates must verify Non-Creamy Layer (NCL) status for the current year.',
            importance: 'Medium'
        },
        {
            name: 'Previous Academic Marksheets',
            detail: 'Class 10, Class 12, or last semester marksheets showing your aggregate percentage. Many scholarships require a minimum of 50% to 60% marks.',
            importance: 'High'
        },
        {
            name: 'Bonafide Student Certificate',
            detail: 'A certificate issued and signed by your school principal or college registrar confirming your active admission, roll number, and course.',
            importance: 'High'
        },
        {
            name: 'Current Year Fee Receipt',
            detail: 'Official receipt showing tuition fees, admission fees, and other charges paid. Required to calculate fee reimbursement amounts.',
            importance: 'High'
        }
    ];

    const formats = [
        { type: 'File Format', spec: 'PDF or JPEG format is standard.' },
        { type: 'File Size Limit', spec: 'Generally between 100 KB and 200 KB per document.' },
        { type: 'Resolution', spec: 'Ensure the scanned document is legible; blurry text or cut-off seals can cause instant application rejection.' },
        { type: 'Multi-page files', spec: 'For files like semester-wise marksheets, merge them into a single multi-page PDF.' }
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
                        <span className="text-sm text-gray-500">Document Checklist</span>
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
                        Essential Checklist
                    </span>
                    <h1 id="documents-hero" className="text-4xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight font-serif">
                        Essential Scholarship Documents Checklist
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Preparing your documents in the correct formats and ensuring details are accurate is the single most important step to secure your scholarship. Use this checklist to get ready before the application portals open.
                    </p>
                </div>

                {/* Warning Alert */}
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-12 flex gap-4">
                    <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-950 mb-1">Critical Mismatch Warning</h3>
                        <p className="text-sm text-red-900/80 leading-relaxed">
                            Your Name, Date of Birth, and Father\'s Name <strong>must match exactly</strong> across your Class 10 Marksheet, Aadhaar Card, and Bank Account. Even a minor spelling discrepancy or missing middle name will result in automatic rejection during the verification process.
                        </p>
                    </div>
                </div>

                {/* Section: Core Checklist */}
                <section id="mandatory-documents" className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Mandatory Document Checklist</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Ensure you have original, scanned copies of these documents ready:
                    </p>

                    <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        {coreDocuments.map((doc, idx) => (
                            <div key={idx} className={`p-6 flex gap-4 items-start ${idx !== coreDocuments.length - 1 ? 'border-b border-gray-100' : ''} bg-white hover:bg-gray-50/50 transition-colors`}>
                                <div className="mt-1 p-1 bg-green-50 text-green-600 rounded-full shrink-0">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="font-bold text-gray-900 text-base leading-tight">{doc.name}</h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${doc.importance === 'High' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {doc.importance} Priority
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-xs leading-relaxed">{doc.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Sizing and Upload Specifications */}
                <section id="upload-specifications" className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Upload Size & Format Guide</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Online portals have strict size and format constraints. Review these standard guidelines to avoid upload errors:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formats.map((f, idx) => (
                            <div key={idx} className="p-6 border rounded-2xl bg-gray-50/30 flex items-start gap-4">
                                <FileText className="h-6 w-6 text-blue-700 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{f.type}</h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">{f.spec}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: FAQs */}
                <section id="document-faqs" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                What if my family income certificate has expired?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                Most scholarships require the income certificate to be valid for the current financial year (usually issued after April 1st of the application cycle). Do not upload an expired certificate, as it will lead to immediate rejection. Always apply for a fresh certificate from the Tahsildar office or online state portals before starting.
                            </p>
                        </div>
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                Can I upload my internet-generated marksheet copy?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                If you have not received your official physical marksheet, you can upload the internet copy, but it must be **attested (signed and stamped)** by your school Principal or college HOD. Unattested internet-generated marksheets are often flagged as invalid.
                            </p>
                        </div>
                        <div className="p-6 border rounded-2xl bg-white hover:border-blue-100 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2.5 text-base">
                                <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                                Is a bank passbook upload required if my account is seeded with Aadhaar?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed pl-7">
                                Even if your account is Aadhaar seeded, many portals require a scanned copy of the first page of your passbook or a cancelled check to verify bank details (IFSC, Account Number) as a fallback mechanism.
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
