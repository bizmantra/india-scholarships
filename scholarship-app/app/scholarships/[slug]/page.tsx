import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getScholarshipBySlug, getRelatedScholarships, getCanonicalSlugForLevel, getCanonicalSlugForIncome, getCanonicalSlugForCategory, getCleanSteps } from '@/lib/db';
import {
    Calendar,
    MapPin,
    Users,
    IndianRupee,
    Globe,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    Info,
    ShieldCheck,
    Clock,
    Award,
    MousePointer2,
    RefreshCcw,
    CreditCard,
    ArrowLeft
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ShareButtons from '@/app/components/ShareButtons';

const TARGET_SLUGS = [
    'pm-yashasvi-scholarship',
    'sitaram-jindal-foundation-scholarship',
    'tata-capital-pankh-scholarship',
    'mukhyamantri-kanya-utthan-yojana-graduation',
    'nabanna-scholarship-west-bengal',
    'hdfc-bank-parivartan-ecss-scholarship',
    'lic-golden-jubilee-scholarship',
    'mukhyamantri-medhavi-vidyarthi-yojana-mmvy',
    'bitsat-scholarship',
    'post-matric-scholarship-for-obcsebc-students-odisha'
];

// Generate static params for all scholarships
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    return scholarships.map((scholarship: any) => ({
        slug: scholarship.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        return {
            title: 'Scholarship Not Found',
        };
    }

    const title = scholarship.title;
    const lowerTitle = title.toLowerCase();
    const isGov = scholarship.scholarship_type === 'Government' || 
                  lowerTitle.includes('yojana') || 
                  lowerTitle.includes('scheme') || 
                  lowerTitle.includes('portal') || 
                  lowerTitle.includes('post matric') || 
                  lowerTitle.includes('post-matric') || 
                  lowerTitle.includes('pre matric') || 
                  lowerTitle.includes('pre-matric');

    let seoTitle = '';

    // Specific brand overrides
    if (lowerTitle.includes('e-kalyan') || lowerTitle.includes('e kalyan')) {
        seoTitle = `e-Kalyan Portal 2026: Application Status, Login & Registration`;
    } else if (lowerTitle.includes('mmvy') || lowerTitle.includes('medhavi')) {
        seoTitle = `MMVY Portal 2026: MP Medhavi Student Login & Registration`;
    } else if (lowerTitle.includes('svmcm') || lowerTitle.includes('vivekananda')) {
        seoTitle = `SVMCM Portal 2026: Swami Vivekananda Scholarship Login & Status`;
    } else if (lowerTitle.includes('nabanna')) {
        seoTitle = `Nabanna Scholarship 2026: Application Form, Eligibility & Guide`;
    } else if (lowerTitle.includes('egrantz') || lowerTitle.includes('e-grantz')) {
        seoTitle = `E-Grantz Portal 2026: Kerala Student Login & Application Status`;
    } else if (lowerTitle.includes('azim premji')) {
        seoTitle = `Azim Premji Scholarship 2026: Application Process, Eligibility & Login`;
    } else if (lowerTitle.includes('reliance foundation')) {
        seoTitle = `Reliance Foundation Scholarship 2026: Apply Online & Selection List`;
    } else if (lowerTitle.includes('ongc')) {
        seoTitle = `ONGC Scholarship 2026: Application Form, Selection List & Guide`;
    } else if (isGov) {
        // Dynamic rule for government scholarships
        seoTitle = `${title} 2026: Apply Online, Portal Login & Status Check`;
    } else {
        // Dynamic rule for private/corporate/trust scholarships
        seoTitle = `${title} 2026: Application Form, Eligibility & Selection List`;
    }

    return {
        title: seoTitle,
        description: scholarship.intro_seo?.substring(0, 160) || `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
        openGraph: {
            title: `${scholarship.title} – Application Open (2026)`,
            description: `Apply for ${scholarship.title}. Amount: ₹${scholarship.amount_annual > 0 ? scholarship.amount_annual : 'Variable'}/year. ${scholarship.level} students in ${scholarship.state || 'India'}.`,
            url: `https://www.indiascholarships.in/scholarships/${scholarship.slug}`,
            type: 'article',
            siteName: 'IndiaScholarships',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${scholarship.title}`,
            description: `Check eligibility and apply for ${scholarship.title}.`,
        }
    };
}

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        notFound();
    }

    const relatedScholarships = await getRelatedScholarships(scholarship.id, 3);

    // Helper to display value or "Not specified"
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    // Format amount
    const formatAmount = (amount: number | null, description: string = '') => {
        if (!amount || amount === 0) {
            return description || 'Check official notification';
        }
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh+`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k+`;
        return `₹${amount}`;
    };

    const FormattedText = ({ text, type = 'list' }: { text: string | null, type?: 'list' | 'steps' }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;

        let items: string[] = [];
        let isSteps = type === 'steps';

        if (isSteps) {
            items = getCleanSteps(text);
        } else {
            items = text
                .split(/\.\s+(?=[A-Z])|(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.match(/^(Selection based on|Renewal conditions):$/i));
        }

        if (items.length <= 1) {
            return <p className="text-gray-700 leading-relaxed">{text}</p>;
        }

        return (
            <ul className="space-y-3 list-none">
                {items.map((item, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                        {isSteps ? (
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                                    {i + 1}
                                </span>
                                <div className="flex-1 pt-1">
                                    {item.includes(':') ? (
                                        <>
                                            <span className="font-bold text-blue-900 border-b border-blue-100 mr-2">
                                                {item.split(':')[0]}
                                            </span>
                                            <p className="mt-1 text-gray-600">{item.split(':').slice(1).join(':').trim()}</p>
                                        </>
                                    ) : (
                                        <p>{item.trim()}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                <p>{item.trim()}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/scholarships" className="hover:text-blue-700 transition-colors">Scholarships</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium truncate">{scholarship.title}</span>
                </nav>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: scholarship.title,
                        description: scholarship.intro_seo,
                        image: 'https://www.indiascholarships.in/icon.png',
                        datePublished: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                        author: {
                            '@type': 'Organization',
                            name: 'IndiaScholarships'
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'IndiaScholarships',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.indiascholarships.in/icon.png'
                            }
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://www.indiascholarships.in/scholarships/${scholarship.slug}`
                        }
                    })
                }}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Page Header / Hero Area */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100">
                                    {scholarship.provider_type} Scholarship
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified for 2026
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                                {scholarship.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-gray-600 border-b border-gray-100 pb-8 text-sm md:text-base">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">{scholarship.provider}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">{scholarship.state || 'All India'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">
                                        Deadline: <span className="text-red-600 font-bold">{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open Now'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        {scholarship.intro_seo && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    About the Program
                                </h2>
                                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg">
                                    <p className="whitespace-pre-line">{scholarship.intro_seo}</p>
                                </div>
                            </section>
                        )}

                        {/* Financial Benefits - Highlight Box */}
                        <section className="mb-12 bg-amber-50 rounded-[2.5rem] p-8 md:p-10 border border-amber-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <IndianRupee className="w-32 h-32 text-amber-900" />
                            </div>
                            <h2 className="text-2xl font-bold text-amber-900 mb-8 relative z-10 flex items-center gap-3 font-typography">
                                <Award className="w-6 h-6" />
                                Benefits & Financial Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1 block">Total scholarship amount</span>
                                    <div className="text-5xl font-black text-gray-900 mb-2">
                                        {formatAmount(scholarship.amount_annual, scholarship.amount_description)}
                                    </div>
                                    <p className="text-amber-800 font-medium leading-relaxed">
                                        {scholarship.amount_description && scholarship.amount_annual > 0
                                            ? scholarship.amount_description
                                            : (scholarship.amount_annual > 0 ? 'Direct financial assistance for tuition and living expenses.' : '')}
                                    </p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-amber-200/50">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 italic">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        Inclusions
                                    </h3>
                                    <div className="text-gray-700 space-y-1">
                                        <FormattedText text={scholarship.benefits} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Eligibility Criteria */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-purple-600 rounded-full" />
                                Eligibility Criteria
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Educational Qualification</h3>
                                    <p className="text-gray-900 font-bold text-lg mb-2">{scholarship.level}</p>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        Must be enrolled in {scholarship.course_stream.join(', ') || 'relevant courses'}.
                                        {scholarship.min_marks ? ` Minimum ${scholarship.min_marks}% marks required in previous exam.` : ''}
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Financial & Category</h3>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Income Limit</span>
                                            <span className="text-gray-900 font-bold">
                                                {scholarship.income_limit ? `Up to ₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'No Income Bar'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Applicable Category</span>
                                            <span className="text-gray-900 font-bold">{scholarship.caste.join(', ') || 'Open to All'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {scholarship.special_conditions && (
                                <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                                    <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-900 mb-1">Important Note</p>
                                        <p className="text-blue-800 text-sm leading-relaxed">{scholarship.special_conditions}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Selection & Renewal */}
                        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-green-50/50 rounded-[2.5rem] border border-green-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Award className="w-5 h-5 text-green-600" />
                                    Selection Process
                                </h3>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.selection} />
                                </div>
                            </div>
                            <div className="p-8 bg-purple-50/50 rounded-[2.5rem] border border-purple-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <RefreshCcw className="w-5 h-5 text-purple-600" />
                                    Renewal Policy
                                </h3>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.renewal} />
                                </div>
                            </div>
                        </section>

                        {/* Application Step-by-Step */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                                Application Process
                            </h2>
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                <FormattedText text={scholarship.step_guide} type="steps" />
                            </div>
                        </section>

                        {/* Required Documents */}
                        <section className="mb-12 bg-gray-50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                Documents Required
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {scholarship.docs_needed.map((doc: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-200/50 last:border-0 hover:border-gray-300 transition-colors">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                                        <span className="text-gray-700 font-medium text-sm">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Important Dates (Detailed) */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-red-600 rounded-full" />
                                Important Dates
                            </h2>
                            <div className="bg-red-50/30 rounded-[2.5rem] p-8 border border-red-100">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Calendar className="h-6 w-6 text-red-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Application Deadline</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Continuous Enrollment / Check Official Portal'}
                                            </p>
                                            {scholarship.deadline_description && <p className="text-sm text-gray-600 mt-1 italic">{scholarship.deadline_description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 pt-4 border-t border-red-100/50">
                                        <Clock className="h-6 w-6 text-gray-400 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                            Dates are subject to change as per the provider's official notification. Applicants are encouraged to apply well before the closing date.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Facts Grid */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                Scholarship Quick Facts
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Provider Type</span>
                                    <span className="text-gray-900 font-bold">{scholarship.provider_type}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Education Level</span>
                                    <span className="text-gray-900 font-bold">{scholarship.level}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Application Mode</span>
                                    <span className="text-gray-900 font-bold uppercase">{scholarship.application_mode}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">State/Region</span>
                                    <span className="text-gray-900 font-bold">{scholarship.state || 'All India'}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Income Limit</span>
                                    <span className="text-gray-900 font-bold">{scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)}L/yr` : 'No Limit'}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Last Verified</span>
                                    <span className="text-gray-900 font-bold">{scholarship.verification_year || '2026'}</span>
                                </div>
                            </div>
                        </section>

                        {/* FAQs */}
                        {scholarship.faq_json && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-purple-600 rounded-full" />
                                    Common Questions (FAQs)
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        try {
                                            let faqs = scholarship.faq_json;

                                            // Handle case where it might be a stringified JSON in some imports
                                            if (typeof faqs === 'string') {
                                                try { faqs = JSON.parse(faqs); } catch (e) { }
                                            }

                                            if (!faqs || (Array.isArray(faqs) && faqs.length === 0)) return (
                                                <p className="p-6 bg-gray-50 rounded-2xl text-gray-400 italic">Detailed FAQs are being compiled for this scheme.</p>
                                            );

                                            return Array.isArray(faqs) ? faqs.map((faq: any, i: number) => (
                                                <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-200 transition-colors">
                                                    <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight flex gap-3">
                                                        <span className="text-blue-600 font-black">Q.</span>
                                                        {faq.question || faq.q || 'Common Question'}
                                                    </h3>
                                                    <p className="text-gray-600 leading-relaxed pl-8">{faq.answer || faq.a || 'Refer to the official portal for details.'}</p>
                                                </div>
                                            )) : (
                                                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                                    <p className="text-gray-600 leading-relaxed">{String(faqs)}</p>
                                                </div>
                                            );
                                        } catch (e) { return null; }
                                    })()}
                                </div>
                            </section>
                        )}

                        {/* Help & Contact Support */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                Help & Contact Support
                            </h2>
                            <div className="bg-blue-50/30 rounded-[2.5rem] p-8 md:p-10 border border-blue-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-4">Official Support</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Globe className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Website</span>
                                                    <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold text-sm truncate block hover:underline">
                                                        Visit Official Portal
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Helpline</span>
                                                    <span className="text-gray-900 font-bold text-sm">{scholarship.helpline || 'Refer Official Site'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-blue-100/50">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-600" />
                                            Need Application Help?
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                            If you have trouble applying, you can join our student community or browse our application guides.
                                        </p>
                                        <Link href="/scholarships" className="text-blue-700 font-bold text-sm hover:underline flex items-center gap-1">
                                            Browse More Scholarships <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <section className="mt-12 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="h-5 w-5 text-gray-400" />
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Legal Disclaimer</h2>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                IndiaScholarships.in attempts to provide accurate information manually curated from official sources.
                                However, scholarship details, timelines, and eligibility can change without notice as per the provider's discretion.
                                Applying for a scholarship does not guarantee selection. Always verify all information on the official {scholarship.provider} website before final submission.
                            </p>
                        </section>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">

                            {/* CTA Card */}
                            <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 border-b-8 border-blue-900 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Users className="w-24 h-24" />
                                </div>
                                <h3 className="text-xl font-extrabold mb-4 relative z-10">Ready to Apply?</h3>
                                <p className="text-blue-100 text-sm mb-8 leading-relaxed relative z-10">
                                    Submit your application through the official portal. Ensure all documents are scanned and ready for upload.
                                </p>
                                <a
                                    href={scholarship.apply_url || scholarship.official_source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 bg-white text-blue-700 text-center font-black rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95 relative z-10"
                                >
                                    Visit Official Portal
                                </a>
                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified Secure Source
                                </div>
                            </div>

                            <ShareButtons
                                title={scholarship.title}
                                url={`https://www.indiascholarships.in/scholarships/${scholarship.slug}`}
                            />

                            {/* Supporting Guides Quick Links Card */}
                            {TARGET_SLUGS.includes(scholarship.slug) && (
                                <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-150 pb-4">Supporting Guides</h3>
                                    <nav className="space-y-2">
                                        <Link href={`/scholarships/${scholarship.slug}/eligibility`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Eligibility Criteria</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/income-limit`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Income Limit</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/documents-required`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Documents Required</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/last-date`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Last Date & Timelines</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/selection-process`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Selection Process</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/apply-online`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>How to Apply Online</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                        <Link href={`/scholarships/${scholarship.slug}/renewal-process`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                            <span>Renewal Process</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                    </nav>
                                </div>
                            )}

                            {/* Verification Stats Card (At a Glance) */}
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">At a Glance</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</span>
                                            <span className="font-bold text-emerald-700 text-sm">Active - {scholarship.verification_year || (scholarship.last_verified ? new Date(scholarship.last_verified).getFullYear() : new Date().getFullYear())}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Verified</span>
                                            <span className="font-bold text-gray-900 text-sm">{scholarship.last_verified ? new Date(scholarship.last_verified).toLocaleDateString('en-IN') : 'Recently'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                            <Info className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Apply Mode</span>
                                            <span className="font-bold text-gray-900 text-sm uppercase">{scholarship.application_mode}</span>
                                        </div>
                                    </div>
                                    {scholarship.total_awards > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 rounded-2xl">
                                                <Award className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awards</span>
                                                <span className="font-bold text-gray-900 text-sm">{scholarship.total_awards.toLocaleString('en-IN')} Students</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Official Help</h4>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <span className="block text-[10px] text-gray-400 uppercase font-black mb-1">Helpline</span>
                                        <span className="text-xs font-bold text-gray-900 break-words">{scholarship.helpline || 'Refer Official Site'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Related Discovery Links (Dynamic) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Discover More</h3>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/scholarships-level/${getCanonicalSlugForLevel(scholarship.level)}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        For {Array.isArray(scholarship.level) ? scholarship.level[0] : (String(scholarship.level || '').split(',')[0] || 'Students')}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-in/${scholarship.state?.toLowerCase().replace(/\s+/g, '-') || 'all-india'}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        In {scholarship.state || 'All India'}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-for/${getCanonicalSlugForCategory(scholarship.caste[0])}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        For {scholarship.caste[0] || 'All Categories'}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-income/${getCanonicalSlugForIncome(scholarship.income_limit)}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        Income Coverage
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/${scholarship.scholarship_type.toLowerCase()}-scholarships`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        {scholarship.scholarship_type} Listings
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Related Scholarships (Small Cards) */}
                            {relatedScholarships.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Similar Opportunities</h3>
                                    <div className="space-y-3">
                                        {relatedScholarships.map((rel: any) => (
                                            <Link key={rel.id} href={`/scholarships/${rel.slug}`} className="block p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                                                        <Award className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                                                            {rel.title}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                                                Up to ₹{(rel.amount_annual / 1000).toFixed(0)}k
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
