import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'About Us - IndiaScholarships',
    description: 'Learn about IndiaScholarships, our mission to democratize education funding for Indian students, our verification process, and how we help students discover and secure scholarships.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">About Us</span>
                </nav>

                {/* Hero Section */}
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <span className="text-blue-700 font-extrabold uppercase tracking-widest text-xs px-3 py-1 bg-blue-50 rounded-full">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-6 tracking-tight">
                        Democratizing Access to Education Funding
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        IndiaScholarships is a scholarship decision engine designed to eliminate information asymmetry, helping every eligible student in India find and win the financial aid they deserve.
                    </p>
                </div>

                {/* Visual Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                    <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 text-center">
                        <h3 className="text-blue-700 font-bold mb-1 uppercase tracking-wider text-xs">Verified Schemes</h3>
                        <p className="text-4xl font-black text-blue-900">1,000+</p>
                    </div>
                    <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100 text-center">
                        <h3 className="text-orange-700 font-bold mb-1 uppercase tracking-wider text-xs">Target Audience</h3>
                        <p className="text-4xl font-black text-orange-900">80M+ Eligible</p>
                    </div>
                    <div className="bg-green-50/50 p-8 rounded-3xl border border-green-100 text-center">
                        <h3 className="text-green-700 font-bold mb-1 uppercase tracking-wider text-xs">Data Accuracy</h3>
                        <p className="text-4xl font-black text-green-900">100% Human Verified</p>
                    </div>
                </div>

                {/* Narrative Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-start">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            The Problem We Are Solving
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Every year, Indian students miss out on over <strong className="text-gray-900">₹10,000+ crore</strong> in unclaimed government, corporate, and private scholarships. This massive loss is driven by:
                        </p>
                        <ul className="space-y-3 text-gray-600 list-disc list-inside pl-2">
                            <li><strong className="text-gray-900">Information Scatter:</strong> Opportunities are spread across 50+ government portals and hundreds of corporate CSR websites.</li>
                            <li><strong className="text-gray-900">Eligibility Overload:</strong> Complex qualifications spanning caste, income, state, marks, and gender.</li>
                            <li><strong className="text-gray-900">Outdated Content:</strong> Spam blogs spreading expired deadlines and wrong application procedures.</li>
                        </ul>
                    </div>

                    <div className="space-y-6 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            How We Solve It
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Unlike traditional databases that list basic details, our platform is a <strong>decision engine</strong>. We provide:
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-700 font-bold">✓</span>
                                <div>
                                    <strong className="text-gray-900">29 Enriched Data Fields:</strong> Deep detail for every scholarship, from exact document checklists to principal verifications.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-700 font-bold">✓</span>
                                <div>
                                    <strong className="text-gray-900">Smart Eligibility Checks:</strong> Match your profile instantly against hundreds of active funds.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-700 font-bold">✓</span>
                                <div>
                                    <strong className="text-gray-900">Step-by-Step Application Guides:</strong> Clear screenshots and walk-throughs for complex portals.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Our Principles */}
                <section className="mb-20">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12 tracking-tight">
                        Our Core Principles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Trust First</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We utilize multi-source verification. We would rather mark a field "Unknown" than present unverified data. Zero hallucinations policy.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Decision Support</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We don't just dump lists of scholarships. We rank programs by likelihood of selection, difficulty, and total cash benefits.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Gen Z Design</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Built for mobile devices. Clean, modern, responsive interfaces that make application processes friction-free.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact CTA Section */}
                <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white text-center">
                    <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Have questions or feedback?</h2>
                    <p className="text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
                        We are continuously building and verifying new scholarships. If you are a scholarship provider or have discovered details that need correcting, let us know!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a 
                            href="mailto:contact@indiascholarships.in" 
                            className="px-8 py-4 bg-white text-blue-700 font-extrabold rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
                        >
                            contact@indiascholarships.in
                        </a>
                        <Link 
                            href="/eligibility-checker" 
                            className="px-8 py-4 bg-blue-700 border border-blue-500 text-white font-extrabold rounded-2xl hover:bg-blue-800 transition-all"
                        >
                            Try Eligibility Checker
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
