import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, AlertCircle, Info, StepBack, StepForward } from 'lucide-react';

export async function generateStaticParams() {
    return [
        { portal: 'nsp' },
        { portal: 'ssp' },
    ];
}

const portals: Record<string, any> = {
    'nsp': {
        name: 'National Scholarship Portal (NSP)',
        fullTitle: 'Complete Guide to National Scholarship Portal (NSP) 2025-26',
        officialUrl: 'https://scholarships.gov.in',
        description: 'The National Scholarship Portal (NSP) is a one-stop solution for all central government, state government, and UGC/AICTE scholarship schemes across India.',
        steps: [
            { title: 'Onetime Registration (OTR)', description: 'Register with your mobile number and Aadhaar. Get a unique OTR ID.' },
            { title: 'Login & Apply', description: 'Use your OTR ID to login. Select the relevant scheme under Central/State schemes.' },
            { title: 'Document Upload', description: 'Upload essential documents like income certificate, caste certificate, and marksheets.' },
            { title: 'Institute Verification', description: 'Submit the hard copy to your college/school for online verification.' }
        ],
        faqs: [
            { q: 'Is Aadhaar mandatory for NSP?', a: 'Yes, Aadhaar or Aadhaar Enrolment ID is now mandatory for NSP applications.' },
            { q: 'What is OTR in NSP?', a: 'OTR stands for One-Time Registration. It is a unique ID that stays constant throughout your academic life on NSP.' }
        ]
    },
    'ssp': {
        name: 'State Scholarship Portal (SSP) Karnataka',
        fullTitle: 'Complete Guide to SSP Karnataka Portal 2025-26',
        officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
        description: 'The SSP Portal is the primary platform for all post-matric and pre-matric scholarships offered by the Government of Karnataka.',
        steps: [
            { title: 'Aadhaar Linking', description: 'Ensure your Aadhaar is linked to your bank account and mobile number.' },
            { title: 'Kutumba ID', description: 'Students must have a Kutumba ID (Family ID) registered in Karnataka.' },
            { title: 'Account Creation', description: 'Create an account on the SSP portal using your Aadhaar number.' },
            { title: 'Apply for Scholarship', description: 'Fill the education details and let the portal fetch your caste/income data automatically.' }
        ],
        faqs: [
            { q: 'What is Kutumba ID?', a: 'Kutumba is a database of residents in Karnataka. It is mandatory for SSP applications.' },
            { q: 'How to check SSP status?', a: 'Login to SSP, click on "Student Login" -> "Track Status" and select the year.' }
        ]
    }
};

export async function generateMetadata({ params }: { params: Promise<{ portal: string }> }) {
    const { portal } = await params;
    const data = portals[portal.toLowerCase()];
    if (!data) return { title: 'Guide Not Found' };

    return {
        title: `${data.name} - Application Guide 2026 | IndiaScholarships`,
        description: `Step-by-step guide to applying on the ${data.name}. Learn about documents needed, registration process, and common status tracking tips.`,
    };
}

export default async function PortalGuidePage({ params }: { params: Promise<{ portal: string }> }) {
    const { portal } = await params;
    const data = portals[portal.toLowerCase()];

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b bg-white italic">
                <div className="container mx-auto h-14 flex items-center px-4">
                    <Link href="/" className="text-xl font-bold text-blue-700 not-italic">IndiaScholarships</Link>
                    <span className="mx-3 text-gray-300">/</span>
                    <Link href="/guides" className="text-sm text-gray-600 hover:text-blue-700">Guides</Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {data.fullTitle}
                    </h1>
                    <div className="bg-blue-50 border-l-4 border-blue-700 p-6 rounded-r-2xl">
                        <p className="text-blue-900 leading-relaxed font-medium">
                            {data.description}
                        </p>
                        <a
                            href={data.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-700 text-white rounded-full text-sm font-bold hover:bg-black transition-all"
                        >
                            Visit Official {portal.toUpperCase()} Portal <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Important Alert */}
                <div className="flex gap-4 p-5 bg-orange-50 rounded-2xl border border-orange-100 mb-12">
                    <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-orange-900 mb-1">Important Note</h3>
                        <p className="text-sm text-orange-800/80">
                            Always ensure your Aadhaar name exactly matches your school records and bank account to avoid DBT (Direct Benefit Transfer) failures.
                        </p>
                    </div>
                </div>

                {/* Step by Step Guide */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" /> Step-by-Step Registration Process
                </h2>
                <div className="space-y-8 mb-16 relative">
                    <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-gray-100 hidden sm:block"></div>
                    {data.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative pl-0 sm:pl-12">
                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm hidden sm:flex">
                                {idx + 1}
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {data.faqs.map((faq: any, idx: number) => (
                            <div key={idx} className="p-6 border rounded-2xl">
                                <h3 className="font-bold text-gray-900 mb-2">Q: {faq.q}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">A: {faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tracking section */}
                <div className="bg-black text-white p-10 rounded-3xl mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-4">How to Track Your Status?</h2>
                        <p className="text-gray-400 mb-8 max-w-lg leading-relaxed">
                            Once you apply, tracking is crucial. Common statuses include "Sent to PFMS", "Institute Verified", or "Application Pending".
                        </p>
                        <Link href="/guides/tracking" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-blue-200 transition-all">
                            View Status Guide <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Info className="h-32 w-32" />
                    </div>
                </div>
            </main>

            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
