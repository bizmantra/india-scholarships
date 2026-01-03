'use client';

import Link from 'next/link';
import { ExternalLink, ChevronRight, Bookmark, Share2 } from 'lucide-react';

interface ScholarshipDetailTemplateProps {
    scholarship: any; // Will be typed properly
    isApplicationClosed?: boolean;
}

export default function ScholarshipDetailTemplate({
    scholarship,
    isApplicationClosed = false
}: ScholarshipDetailTemplateProps) {
    // Check if deadline has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline ? new Date(scholarship.deadline) : null;
    const isDeadlinePassed = deadlineDate ? deadlineDate < today : false;
    const applicationStatus = isDeadlinePassed ? 'closed' : 'open';

    // Helper functions
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    const formatAmount = (amount: number | null) => {
        if (!amount) return 'Not specified';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const currentYear = new Date().getFullYear();
    const displayYear = scholarship.verification_year && currentYear <= scholarship.verification_year
        ? currentYear
        : scholarship.verification_year || currentYear;
    const isCurrentYearVerified = currentYear === scholarship.verification_year;
    const isOutdated = scholarship.verification_year && currentYear > scholarship.verification_year;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="text-2xl font-black tracking-tight text-blue-700 font-serif">
                        IndiaScholarships
                    </Link>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
                        <Link href="/scholarships-by-category" className="hover:text-blue-700 transition-colors">Categories</Link>
                        <Link href="/state-scholarships" className="hover:text-blue-700 transition-colors">States</Link>
                        <Link href="/scholarships-by-education" className="hover:text-blue-700 transition-colors">Education</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-10">
                    <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/scholarships" className="hover:text-blue-700 transition-colors">Scholarships</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-semibold truncate">{scholarship.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        {/* Title & Provider */}
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-[1.15] font-serif tracking-tight">
                                {scholarship.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 italic font-serif">i</div>
                                    <span className="font-medium">{scholarship.provider}</span>
                                </div>
                                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-tighter">
                                        {scholarship.provider_type || 'Scheme'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Visual High-Level Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Scholarship Amount</span>
                                <span className="text-xl font-black text-blue-700 block truncate">
                                    {scholarship.amount_min && scholarship.amount_annual
                                        ? `₹${(scholarship.amount_annual / 1000).toFixed(0)}k+`
                                        : formatAmount(scholarship.amount_annual)
                                    }
                                </span>
                            </div>
                            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Application Deadline</span>
                                <span className="text-xl font-black text-red-600 block truncate">
                                    {scholarship.deadline
                                        ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                        : 'Open Now'
                                    }
                                </span>
                            </div>
                            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Target Community</span>
                                <span className="text-xl font-black text-gray-900 block truncate">
                                    {scholarship.caste && scholarship.caste.length > 0 ? scholarship.caste[0] : 'All Categories'}
                                </span>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-16">
                            {/* Overview Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">About the Program</h2>
                                </div>
                                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4 text-lg">
                                    <p>{scholarship.intro_seo || `The ${scholarship.title} is a specialized initiative aimed at providing financial wings to deserving students across India. Managed by ${scholarship.provider}, this program focuses on removing financial barriers for higher education.`}</p>
                                    {scholarship.benefits && <p>{scholarship.benefits}</p>}
                                </div>
                            </section>

                            {/* Detailed Info Grid */}
                            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 font-serif italic">At a Glance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Selection Basis</span>
                                        <span className="font-bold text-gray-900">{displayValue(scholarship.selection)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Application Mode</span>
                                        <span className="font-bold text-gray-900">{displayValue(scholarship.application_mode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Education Level</span>
                                        <span className="font-bold text-gray-900">{displayValue(scholarship.level)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Income Ceiling</span>
                                        <span className="font-bold text-gray-900">{scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/yr` : 'No Limit'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Academic Merit</span>
                                        <span className="font-bold text-gray-900">{scholarship.min_marks ? `Min. ${scholarship.min_marks}%` : 'Standard'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Gender Eligibility</span>
                                        <span className="font-bold text-gray-900">{displayValue(scholarship.gender)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Domicile</span>
                                        <span className="font-bold text-gray-900">{scholarship.state || 'Across India'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500">Age Limit</span>
                                        <span className="font-bold text-gray-900">{displayValue(scholarship.age_limit)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200 col-span-1 md:col-span-2">
                                        <span className="text-gray-500">Category</span>
                                        <span className="font-bold text-gray-900">
                                            {scholarship.caste && scholarship.caste.length > 0 ? scholarship.caste.join(', ') : 'All'}
                                        </span>
                                    </div>
                                    {scholarship.special_conditions && (
                                        <div className="flex flex-col py-2 border-b border-gray-200 col-span-1 md:col-span-2">
                                            <span className="text-gray-500 mb-1">Special Conditions</span>
                                            <span className="font-bold text-gray-900 leading-relaxed">{scholarship.special_conditions}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Required Documents */}
                            {scholarship.docs_needed && scholarship.docs_needed.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">Required Documentation</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {scholarship.docs_needed.map((doc: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                                                <span className="text-gray-700 text-sm leading-relaxed">{doc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Application Steps */}
                            {scholarship.step_guide && (
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">How to Apply</h2>
                                    </div>
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 hidden md:block"></div>
                                        {scholarship.step_guide.split(/\d\./).filter((s: string) => s.trim()).map((step: string, i: number) => (
                                            <div key={i} className="flex items-start gap-6 relative">
                                                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold shrink-0 z-10 shadow-lg shadow-orange-200">
                                                    {i + 1}
                                                </div>
                                                <div className="pt-0.5">
                                                    <p className="text-gray-700 leading-relaxed font-medium">{step.trim()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Selection & Renewal */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">Selection & Renewal</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Selection Criteria</h4>
                                        <p className="text-gray-700 leading-relaxed italic">"{displayValue(scholarship.selection)}"</p>
                                        {scholarship.total_awards && (
                                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                                <span className="text-blue-700 font-bold">Total Awards:</span>
                                                <span className="text-gray-900">{scholarship.total_awards.toLocaleString('en-IN')} scholarships</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Renewal Process</h4>
                                        <p className="text-gray-700 leading-relaxed">{displayValue(scholarship.renewal)}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar / CTA Column */}
                    <aside className="lg:col-span-1 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Main CTA Card */}
                            <div className="p-8 bg-blue-700 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white relative overflow-hidden">
                                {/* Abstract Background Elements */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-50"></div>
                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-blue-800 rounded-full blur-2xl opacity-50"></div>

                                <div className="relative z-10">
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">Status</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${applicationStatus === 'open' ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className="text-xs font-bold uppercase">
                                                {applicationStatus === 'open' ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 font-serif">Ready to Apply?</h3>
                                    <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                                        Ensure you have all required documents scanned and ready before starting the application on the official portal.
                                    </p>

                                    <div className="space-y-3">
                                        <a
                                            href={scholarship.apply_url || scholarship.official_source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                        >
                                            Go to Official Portal
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-blue-800 text-blue-200 text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors">
                                            <Bookmark className="w-3.5 h-3.5" />
                                            Save to Profile
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Card */}
                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                        <Bookmark className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Verified Listing</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Updated {scholarship.verification_year} Cycle</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                    Our editors manually verified this scholarship details from {scholarship.provider}'s official notification. Last checked on {scholarship.last_verified ? new Date(scholarship.last_verified).toLocaleDateString() : 'recently'}.
                                </p>
                                {scholarship.helpline && (
                                    <div className="pt-4 border-t border-gray-50">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Official Helpline</h5>
                                        <p className="text-sm font-bold text-gray-900">{scholarship.helpline}</p>
                                    </div>
                                )}
                            </div>

                            {/* Share & Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-sm font-bold">Share</span>
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 transition-all">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* FAQ & Final Sections */}
                <div className="mt-24 space-y-24 max-w-4xl">
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif leading-tight">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {scholarship.faq_json && scholarship.faq_json.length > 0 ? (
                                scholarship.faq_json.map((faq: any, i: number) => (
                                    <div key={i} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                        <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.q || faq.question}</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{faq.a || faq.answer}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-3xl text-center italic text-gray-400">
                                    Detailed FAQs for this particular scheme are being compiled by our editorial team.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Similar Scholarships */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif leading-tight">Similar Scholarships</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: `Other schemes by ${scholarship.provider_type || 'Provider'}`, href: "/government-scholarships" },
                                { label: `For ${scholarship.level} students`, href: `/scholarships-level/${(scholarship.level || '').toLowerCase().replace(/\s+/g, '-')}` },
                                { label: `For ${scholarship.caste && scholarship.caste[0] ? scholarship.caste[0] : 'All'} category`, href: `/scholarships-for/${scholarship.caste && scholarship.caste[0] ? scholarship.caste[0].toLowerCase().replace(/\s+/g, '-') : 'all-categories'}` },
                                { label: `In ${scholarship.state || 'India'}`, href: `/scholarships-in/${scholarship.state ? scholarship.state.toLowerCase().replace(/\s+/g, '-') : 'india'}` }
                            ].map((link, i) => (
                                <Link key={i} href={link.href} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-700 hover:shadow-lg transition-all group">
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{link.label}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Related Resources */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif leading-tight">Related Resources</h2>
                        <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl">
                            <ul className="space-y-4">
                                {scholarship.official_source && (
                                    <li>
                                        <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
                                            <ExternalLink className="w-4 h-4" />
                                            Official Portal: {scholarship.provider}
                                        </a>
                                    </li>
                                )}
                                <li>
                                    <Link href="/government-scholarships" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
                                        <ExternalLink className="w-4 h-4" />
                                        All Government Scholarship Schemes
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Disclaimer Footer */}
                    <section className="pt-24 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-amber-600 mb-4">
                            <h5 className="text-xs font-black uppercase tracking-[0.2em]">Disclaimer</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl italic">
                            Informational and not an official scholarship guideline. Details are based on official notifications from {scholarship.provider}.
                            We recommend verifying all terms on the official portal before applying. IndiaScholarships does not charge any fee for application assistance.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-black text-white font-serif mb-6 block">IndiaScholarships</span>
                        <p className="text-sm leading-relaxed max-w-sm">
                            Empowering Indian students with verified, timely, and easy-to-access information on educational funding.
                        </p>
                    </div>
                    <div>
                        <h6 className="text-white font-bold text-sm mb-4">Navigation</h6>
                        <ul className="text-xs space-y-2">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/scholarships-by-category" className="hover:text-white transition-colors">Categories</Link></li>
                            <li><Link href="/state-scholarships" className="hover:text-white transition-colors">By State</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-white font-bold text-sm mb-4">Legal</h6>
                        <ul className="text-xs space-y-2">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-gray-800 text-[10px] uppercase tracking-widest text-center">
                    © {currentYear} INDIASCHOLARSHIPS.ALL RIGHTS RESERVED.
                </div>
            </footer>
        </div>
    );
}
