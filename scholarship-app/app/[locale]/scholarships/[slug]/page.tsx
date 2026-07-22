import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getLocalizedScholarshipBySlug, getRelatedScholarships, getCleanSteps } from '@/lib/db';

export const revalidate = 86400; // Align server revalidation to 24 hours

import { getCanonicalSlugForLevel, getCanonicalSlugForIncome, getCanonicalSlugForCategory, slugify, getScholarshipTypeRoute, sanitizeApplyUrl, formatDeadlineDate } from '@/lib/utils';
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
import LanguageDetector from '@/app/components/LanguageDetector';

const SUBPAGE_METRICS = {
    'eligibility': 'Eligibility',
    'income-limit': 'Income Limit',
    'documents-required': 'Documents',
    'last-date': 'Last Date',
    'selection-process': 'Selection',
    'apply-online': 'How to Apply',
    'renewal-process': 'Renewal'
};
// Generate static params for all scholarships across the 5 localized languages
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    const locales = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];
    const paramsList: any[] = [];
    for (const s of scholarships) {
        for (const l of locales) {
            paramsList.push({ slug: s.slug, locale: l });
        }
    }
    return paramsList;
}

// Generate metadata for SEO with hreflang alternates
export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
    const { slug, locale } = await params;
    const scholarship = await getLocalizedScholarshipBySlug(slug, locale);

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

    const year = scholarship.verification_year || new Date().getFullYear();
    const cleanTitle = title.replace(/\s*(?:20\d{2}(?:-\d{2,4})?)\s*$/, '').trim();
    let seoTitle = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);
    const statusLabel = isDeadlinePassed ? 'Closed' : 'Open';

    // Specific brand overrides for June & July high-opportunity keywords
    if (slug === 'pm-yashasvi-scholarship') {
        seoTitle = isDeadlinePassed
            ? `PM Yashasvi Scholarship Scheme ${year}: Eligibility, Amount & Details`
            : `PM Yashasvi Scholarship Scheme ${year}: Apply Online, Last Date & Eligibility`;
    } else if (slug === 'sitaram-jindal-foundation-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Sitaram Jindal Foundation Scholarship ${year}: Eligibility & Last Date Details`
            : `Sitaram Jindal Foundation Scholarship ${year}: Apply Online & Last Date`;
    } else if (slug === 'tata-capital-pankh-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Tata Capital Pankh Scholarship ${year}: Details, Eligibility & Selection`
            : `Tata Capital Pankh Scholarship ${year}: Up to ₹1 Lakh | Eligibility & Apply Online`;
    } else if (slug === 'mukhyamantri-medhavi-vidyarthi-yojana-mmvy') {
        seoTitle = isDeadlinePassed
            ? `MMVY Scholarship ${year}: Details, Eligibility & Verification Status`
            : `MMVY Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'jharkhand-e-kalyan-post-matric-scholarship') {
        seoTitle = isDeadlinePassed
            ? `e-Kalyan Jharkhand Scholarship ${year}: Details, Eligibility & Verification`
            : `e-Kalyan Jharkhand Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'swami-vivekananda-merit-cum-means-scholarship-svmcm') {
        seoTitle = isDeadlinePassed
            ? `SVMCM Scholarship ${year}: Details, Eligibility & Application Status`
            : `SVMCM Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'e-grantz-kerala-scstoecoobc-support') {
        seoTitle = isDeadlinePassed
            ? `e-Grantz Kerala Scholarship ${year}: Details, Eligibility & Status`
            : `e-Grantz Kerala Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'bitsat-scholarship') {
        seoTitle = `BITSAT Scholarship ${year}: Eligibility & Fee Waiver Details`;
    } else if (slug === 'hdfc-bank-parivartan-ecss-scholarship') {
        seoTitle = isDeadlinePassed
            ? `HDFC Parivartan Scholarship ${year}: Eligibility & Details`
            : `HDFC Parivartan Scholarship ${year}: Up to ₹75,000 | Eligibility & Apply Online`;
    } else if (slug === 'reliance-foundation-undergraduate-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Reliance Foundation Scholarship ${year}: UG Eligibility & Selection`
            : `Reliance Foundation Scholarship ${year}: UG Apply Online, Eligibility & Selection`;
    } else if (slug === 'azim-premji-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Azim Premji Scholarship ${year}: For Govt School Students | Details & Eligibility`
            : `Azim Premji Scholarship ${year}: For Govt School Students | Eligibility & Apply`;
    } else if (slug === 'lic-golden-jubilee-scholarship') {
        seoTitle = isDeadlinePassed
            ? `LIC Golden Jubilee Scholarship ${year}: Eligibility & Last Date Details`
            : `LIC Golden Jubilee Scholarship ${year}: Apply Online, Eligibility & Last Date`;
    } else if (lowerTitle.includes('nabanna')) {
        seoTitle = isDeadlinePassed
            ? `Nabanna Scholarship ${year}: Eligibility & Submission Guide`
            : `Nabanna Scholarship ${year}: Application Form, Eligibility & Submission Guide`;
    } else if (slug === 'krishi-vidya-nidhi-yojana-odisha') {
        seoTitle = `Krishi Vidya Nidhi Yojana Odisha ${year}: Benefit Amount & Eligibility Check`;
    } else if (slug === 'post-matric-scholarship-for-obcsebc-students-odisha') {
        seoTitle = isDeadlinePassed
            ? `Odisha Post Matric OBC/SEBC Scholarship ${year}: Details & Eligibility`
            : `Odisha Post Matric OBC/SEBC Scholarship ${year}: Apply Online & Deadlines`;
    } else if (slug === 'post-matric-scholarship-for-st-students-odisha') {
        seoTitle = isDeadlinePassed
            ? `Odisha Post Matric ST Scholarship ${year}: Details & Eligibility`
            : `Odisha Post Matric ST Scholarship ${year}: Eligibility, Last Date & Apply`;
    } else if (slug === 'boc-scholarship-nirman-shramik-kalyan-yojana-odisha') {
        seoTitle = `Odisha BOC Scholarship ${year}: Nirman Shramik Kalyan Yojana Details`;
    } else if (slug === 'chief-minister-higher-education-scholarship-rajasthan') {
        seoTitle = isDeadlinePassed
            ? `Rajasthan Chief Minister Higher Education Scholarship ${year}: Eligibility & Details`
            : `Rajasthan Chief Minister Higher Education Scholarship ${year}: Apply Online & Status`;
    } else if (slug === 'e-medhabruti-ug-merit-scholarship-odisha') {
        seoTitle = isDeadlinePassed
            ? `e-Medhabruti UG Merit Scholarship Odisha ${year}: Details & Renewal`
            : `e-Medhabruti UG Merit Scholarship Odisha ${year}: Apply Online, Last Date & Renewal`;
    } else if (slug === 'mukhyamantri-yuva-swavalamban-yojana-mysy') {
        seoTitle = isDeadlinePassed
            ? `MYSY Scholarship Gujarat ${year}: Details, Document List & Status`
            : `MYSY Scholarship Gujarat ${year}: Apply Online, Last Date, Document List & Status`;
    } else if (slug === 'jagananna-vidya-deevena-fees-reimbursement') {
        seoTitle = `Jagananna Vidya Deevena (JVD) ${year}: Fees Reimbursement Status & Details`;
    } else if (slug === 'sbi-platinum-jubilee-asha-scholarship') {
        seoTitle = isDeadlinePassed
            ? `SBI Asha Scholarship ${year}: Eligibility & Details`
            : `SBI Asha Scholarship ${year}: ₹15,000 | Eligibility, Last Date & Apply Online`;
    } else if (slug === 'merit-cum-means-mcm-scholarship-for-minorities-professional-and-technical-courses-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Minorities MCM Scholarship ${year}: Professional & Technical Details`
            : `Karnataka Minorities MCM Scholarship ${year}: Professional & Technical Apply Online`;
    } else if (slug === 'post-matric-scholarship-for-minorities-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Post Matric Scholarship for Minorities ${year}: Details & Login`
            : `Karnataka Post Matric Scholarship for Minorities ${year}: Login & Apply Online`;
    } else if (slug === 'vidyasiri-food-and-accommodation-scholarship-for-obc-students-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Vidyasiri Scholarship Karnataka ${year}: Food & Accommodation Status`
            : `Vidyasiri Scholarship Karnataka ${year}: Food & Accommodation Apply Online & Status`;
    } else if (slug === 'post-matric-scholarship-for-st-students-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Post Matric ST Scholarship ${year}: Registration Portal & Details`
            : `Karnataka Post Matric ST Scholarship ${year}: Registration Portal, Login & Apply`;
    } else if (slug === 'prime-ministers-research-fellowship-pmrf') {
        seoTitle = `PMRF Scholarship ${year}: Prime Minister's Research Fellowship Portal`;
    } else if (slug === 'bihar-post-matric-scholarship-bcebc') {
        seoTitle = isDeadlinePassed
            ? `Bihar Post Matric BC/EBC Scholarship ${year}: PMS Online Portal details`
            : `Bihar Post Matric BC/EBC Scholarship ${year}: PMS Online Portal Login & Last Date`;
    } else if (slug === 'central-sector-scheme-of-scholarship-for-college-and-university-students') {
        seoTitle = isDeadlinePassed
            ? `CSSS Scholarship ${year}: Central Sector Scheme details`
            : `CSSS Scholarship ${year}: Central Sector Scheme for College/University Apply Online`;
    } else if (slug === 'up-post-matric-scholarship-dashmottar') {
        seoTitle = isDeadlinePassed
            ? `UP Scholarship Dashmottar ${year}: Post Matric Details & Status Check`
            : `UP Scholarship Dashmottar ${year}: Post Matric Apply Online, Login & Status Check`;
    } else if (isGov) {
        // Dynamic rule for government scholarships
        seoTitle = isDeadlinePassed
            ? `${cleanTitle} ${year}: Details, Eligibility & Status Check`
            : `${cleanTitle} ${year}: Apply Online, Portal Login & Status Check`;
    } else {
        // Dynamic rule for private/corporate/trust scholarships
        seoTitle = isDeadlinePassed
            ? `${cleanTitle} ${year}: Details, Eligibility & Selection Process`
            : `${cleanTitle} ${year}: Application Form, Eligibility & Selection List`;
    }

    return {
        title: seoTitle,
        description: scholarship.intro_seo?.substring(0, 160) || `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
        alternates: {
            canonical: `https://www.indiascholarships.in/${locale}/scholarships/${slug}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/scholarships/${slug}`,
                'en': `https://www.indiascholarships.in/scholarships/${slug}`,
                'hi': `https://www.indiascholarships.in/hi/scholarships/${slug}`,
                'bn': `https://www.indiascholarships.in/bn/scholarships/${slug}`,
                'ta': `https://www.indiascholarships.in/ta/scholarships/${slug}`,
                'te': `https://www.indiascholarships.in/te/scholarships/${slug}`,
                'or': `https://www.indiascholarships.in/or/scholarships/${slug}`,
                'kn': `https://www.indiascholarships.in/kn/scholarships/${slug}`,
            }
        },
        openGraph: {
            title: `${scholarship.title} – ${isDeadlinePassed ? 'Details & Eligibility' : 'Application Open'} (${year})`,
            description: isDeadlinePassed ? `Check ${scholarship.title} details, eligibility, benefits, and expected dates for the next cycle.` : `Apply for ${scholarship.title}. Amount: ₹${scholarship.amount_annual > 0 ? scholarship.amount_annual : 'Variable'}/year. ${scholarship.level} students in ${scholarship.state || 'India'}.`,
            url: `https://www.indiascholarships.in/${locale}/scholarships/${scholarship.slug}`,
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

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const scholarship = await getLocalizedScholarshipBySlug(slug, locale);

    if (!scholarship) {
        notFound();
    }

    const cleanApplyUrl = sanitizeApplyUrl(scholarship.apply_url || scholarship.official_source);
    const cleanOfficialSource = sanitizeApplyUrl(scholarship.official_source || scholarship.apply_url);

    const relatedScholarships = await getRelatedScholarships(scholarship.id, 3);

    // Dynamic deadline check (relative to India's current date boundary: June 25, 2026)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);

    // Helper to display value or "Not specified"
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    // Helper to display helpline
    const displayHelpline = (val: string | null | undefined) => {
        if (!val || val.trim() === '') return 'Refer Official Site';
        const lower = val.trim().toLowerCase();
        if (lower === 'not specified' || lower === 'na' || lower === 'n/a' || lower === 'none') {
            return 'Refer Official Site';
        }
        return val;
    };

    const year = scholarship.verification_year || new Date().getFullYear();

    let faqSchema = null;
    try {
        const faqs = scholarship.faq_json;
        if (Array.isArray(faqs) && faqs.length > 0) {
            const mainEntity = faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question || faq.q || '',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer || faq.a || ''
                }
            })).filter((item: any) => item.name && item.acceptedAnswer.text);

            if (mainEntity.length > 0) {
                faqSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: mainEntity
                };
            }
        }
    } catch (e) {}

    // GovernmentService schema
    let govServiceSchema = null;
    if (scholarship.scholarship_type === 'Government' || scholarship.provider_type === 'Government') {
        govServiceSchema = {
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            name: scholarship.title,
            serviceType: 'Scholarship',
            provider: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            areaServed: {
                '@type': 'AdministrativeArea',
                name: scholarship.state || 'India'
            },
            serviceOperator: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            eligibilityNote: scholarship.residency_requirement || scholarship.level || 'Refer to eligibility guidelines'
        };
    }

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
                .split(/(?<!\b[A-Z])\.\s+(?=[A-Z])|(?<=\.\s+|^)(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
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

            <div className="bg-blue-50 border-b border-blue-100 py-2.5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-blue-700">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>
                        This page has been translated automatically by AI for your convenience. In case of any discrepancy, the official English guidelines remain canonical. 
                        <Link href={`/scholarships/${scholarship.slug}`} className="underline ml-1.5 font-bold hover:text-blue-900">
                            Read English Version
                        </Link>
                    </span>
                </div>
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

            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqSchema)
                    }}
                />
            )}

            {govServiceSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(govServiceSchema)
                    }}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Mobile Navigation Tabs (sticky at top-0 on mobile) */}
                <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 border-b border-gray-200/80 shadow-xs mb-6">
                    <span 
                        className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-blue-600 text-white shadow-sm whitespace-nowrap cursor-default"
                    >
                        Overview
                    </span>
                    {Object.entries(SUBPAGE_METRICS).map(([key, label]) => (
                        <Link 
                            key={key} 
                            href={`/${locale}/scholarships/${scholarship.slug}/${key}`}
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Page Header / Hero Area */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100">
                                    {scholarship.provider_type} Scholarship
                                </span>
                                {isDeadlinePassed ? (
                                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <Clock className="h-4 w-4" />
                                        Previous Cycle (Closed)
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="h-4 w-4" />
                                        Verified for {year}
                                    </span>
                                )}
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
                                        Deadline: <span className={`${isAlwaysOpen ? 'text-emerald-700 font-bold' : isDeadlinePassed ? 'text-gray-500 font-medium' : 'text-red-600 font-bold'}`}>{isAlwaysOpen ? 'Open Year-Round (Continuous)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'short', year: 'numeric' }, 'Open Now')} {isDeadlinePassed && '(Closed)'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isDeadlinePassed && (
                            <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex gap-4">
                                <Info className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-900 mb-1">Status Check</p>
                                    <p className="text-amber-800 text-sm leading-relaxed">
                                        The previous application cycle (2025–26) closed on {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. The upcoming 2026–27 cycle is expected to open soon. We will update the links here as soon as the official notification is released.
                                    </p>
                                    <a href="#similar-opportunities" className="mt-2 inline-block text-xs font-bold text-blue-700 hover:underline">
                                        👉 View active scholarships you can apply for today
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* PM-YASASVI Cross-linking Callout Box */}
                        {['pm-yashasvi-scholarship', 'pm-yasasvi-top-class-education', 'pm-yasasvi-jk-obc'].includes(slug) && (
                            <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-3xl flex gap-4">
                                <Info className="h-6 w-6 text-blue-700 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-900 mb-1">Important: PM-YASASVI Program Variations</p>
                                    {slug === 'pm-yashasvi-scholarship' && (
                                        <div className="text-blue-800 text-sm leading-relaxed">
                                            This is the general national program. If you belong to specialized categories or regions, please see the specific branches:
                                            <span className="block mt-2">
                                                • Studying at an elite empanelled national college (like an IIT, NIT, or top-tier boarding school)? See the <Link href="/scholarships/pm-yasasvi-top-class-education" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Top Class Education Scheme</Link>.
                                            </span>
                                            <span className="block mt-1">
                                                • Resident of Jammu & Kashmir? See the <Link href="/scholarships/pm-yasasvi-jk-obc" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI J&K OBC/EBC/DNT Scheme</Link>.
                                            </span>
                                        </div>
                                    )}
                                    {slug === 'pm-yasasvi-top-class-education' && (
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            This is a specialized branch for students enrolled in notified empanelled institutions of excellence. If you are not studying in a notified top-class school/college, please refer to the general <Link href="/scholarships/pm-yashasvi-scholarship" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Scholarship</Link> or the <Link href="/scholarships/pm-yasasvi-jk-obc" className="font-bold underline text-blue-900 hover:text-blue-700">J&K resident-specific scheme</Link>.
                                        </p>
                                    )}
                                    {slug === 'pm-yasasvi-jk-obc' && (
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            This is the UT-administered branch specifically for residents of Jammu & Kashmir. If you reside outside J&K, please refer to the general <Link href="/scholarships/pm-yashasvi-scholarship" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Scholarship</Link> or the <Link href="/scholarships/pm-yasasvi-top-class-education" className="font-bold underline text-blue-900 hover:text-blue-700">Top Class Education Scheme</Link>.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

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
                        <section className="mb-12 bg-blue-50/40 rounded-3xl p-6 md:p-8 border border-blue-100/70 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <IndianRupee className="w-32 h-32 text-google-blue" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-3 font-typography">
                                <Award className="w-5 h-5 text-google-blue" />
                                Benefits & Financial Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Total scholarship amount</span>
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                                        {formatAmount(scholarship.amount_annual, scholarship.amount_description)}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {scholarship.amount_description
                                            ? scholarship.amount_description
                                            : (scholarship.amount_annual > 0 ? 'Direct financial assistance for tuition and living expenses.' : '')}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-blue-100/50">
                                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-google-green" />
                                        Inclusions
                                    </h3>
                                    <div className="text-gray-700 text-sm space-y-1">
                                        <FormattedText text={scholarship.benefits} />
                                    </div>
                                </div>
                            </div>

                            {scholarship.special_conditions && (
                                <div className="mt-6 p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex gap-3">
                                    <Info className="h-5 w-5 text-google-blue flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-900 mb-0.5 text-xs uppercase tracking-wider">Important Note</p>
                                        <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">{scholarship.special_conditions}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Eligibility Criteria */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-google-blue rounded-full" />
                                Eligibility Criteria
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Educational Qualification</h3>
                                    <p className="text-gray-900 font-bold text-base mb-1">{scholarship.level}</p>
                                    <p className="text-gray-600 leading-relaxed">
                                        Must be enrolled in {scholarship.course_stream.join(', ') || 'relevant courses'}.
                                        {scholarship.min_marks ? ` Minimum ${scholarship.min_marks}% marks required in previous exam.` : ''}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Financial & Category</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase">Income Limit</span>
                                            <span className="text-gray-900 font-bold">
                                                {scholarship.income_limit ? `Up to ₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'No Income Bar'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase">Applicable Category</span>
                                            <span className="text-gray-900 font-bold">{scholarship.caste.join(', ') || 'Open to All'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Selection & Renewal */}
                        <section className="mb-12 pb-8 border-b border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-google-green" />
                                    Selection Process
                                </h3>
                                <div className="text-gray-600 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.selection} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <RefreshCcw className="w-5 h-5 text-google-blue" />
                                    Renewal Policy
                                </h3>
                                <div className="text-gray-600 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.renewal} />
                                </div>
                            </div>
                        </section>

                        {/* Application Step-by-Step */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-google-green rounded-full" />
                                Application Process
                            </h2>
                            <div className="text-gray-700">
                                <FormattedText text={scholarship.step_guide} type="steps" />
                            </div>
                        </section>

                        {/* Required Documents */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-google-green" />
                                Documents Required
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                {scholarship.docs_needed.map((doc: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-100 last:border-0">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-google-green rounded-full flex-shrink-0" />
                                        <span className="text-gray-700 font-medium text-sm">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Important Dates (Detailed) */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-google-red rounded-full" />
                                Important Dates
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-4">
                                    <Calendar className="h-5 w-5 text-google-red flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Application Deadline</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {isAlwaysOpen ? 'Open Year-Round (Continuous Enrollment)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'long', year: 'numeric' }, 'Continuous Enrollment / Check Official Portal')}
                                        </p>
                                        {scholarship.deadline_description && <p className="text-xs text-gray-500 mt-1 italic">{scholarship.deadline_description}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Facts Grid */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-google-blue rounded-full" />
                                Scholarship Quick Facts
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 divide-y divide-gray-100 sm:divide-y-0">
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Provider Type</span>
                                    <span className="text-gray-900 font-bold text-sm">{scholarship.provider_type}</span>
                                </div>
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Education Level</span>
                                    <span className="text-gray-900 font-bold text-sm">{scholarship.level}</span>
                                </div>
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Application Mode</span>
                                    <span className="text-gray-900 font-bold uppercase text-sm">{scholarship.application_mode}</span>
                                </div>
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">State/Region</span>
                                    <span className="text-gray-900 font-bold text-sm">{scholarship.state || 'All India'}</span>
                                </div>
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Income Limit</span>
                                    <span className="text-gray-900 font-bold text-sm">{scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)}L/yr` : 'No Limit'}</span>
                                </div>
                                <div className="py-2">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Last Verified</span>
                                    <span className="text-gray-900 font-bold text-sm">{scholarship.verification_year || '2026'}</span>
                                </div>
                            </div>
                        </section>

                        {/* FAQs */}
                        {scholarship.faq_json && (
                            <section className="mb-12 pb-8 border-b border-gray-150">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                    Common Questions (FAQs)
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        try {
                                            let faqs = scholarship.faq_json;

                                            if (typeof faqs === 'string') {
                                                try { faqs = JSON.parse(faqs); } catch (e) { }
                                            }

                                            if (!faqs || (Array.isArray(faqs) && faqs.length === 0)) return (
                                                <p className="text-gray-500 italic text-sm">Detailed FAQs are being compiled for this scheme.</p>
                                            );

                                            return Array.isArray(faqs) ? faqs.map((faq: any, i: number) => (
                                                <details key={i} className="group border-b border-gray-150 pb-4 [&_summary::-webkit-details-marker]:none">
                                                    <summary className="flex items-center justify-between font-bold text-gray-900 cursor-pointer text-base pr-2">
                                                        <span>Q. {faq.question || faq.q || 'Common Question'}</span>
                                                        <span className="transition group-open:rotate-180 text-google-blue shrink-0 ml-2">▼</span>
                                                    </summary>
                                                    <p className="text-gray-600 text-sm mt-2.5 leading-relaxed pl-4">
                                                        {faq.answer || faq.a || 'Refer to the official portal for details.'}
                                                    </p>
                                                </details>
                                            )) : (
                                                <p className="text-gray-600 text-sm leading-relaxed">{String(faqs)}</p>
                                            );
                                        } catch (e) { return null; }
                                    })()}
                                </div>
                            </section>
                        )}

                        {/* Help & Contact Support */}
                        <section className="mb-12 pb-8 border-b border-gray-150">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-google-blue rounded-full" />
                                Help & Contact Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Official Support</h3>
                                    {cleanOfficialSource ? (
                                        <div className="flex items-center gap-2.5">
                                            <Globe className="h-4 w-4 text-google-blue shrink-0" />
                                            <a href={cleanOfficialSource} target="_blank" rel="noopener noreferrer" className="text-google-blue font-bold truncate hover:underline">
                                                Visit Official Portal ↗
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2.5 text-gray-500">
                                             <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                                             <span className="font-medium">Visit Official Portal (Link Pending)</span>
                                         </div>
                                     )}
                                     <div className="flex items-center gap-2.5 mt-3">
                                         <Users className="h-4 w-4 text-gray-400 shrink-0" />
                                         <span className="text-gray-900 font-medium">Helpline: {displayHelpline(scholarship.helpline)}</span>
                                     </div>
                                 </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Need Application Help?</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                        Check your eligibility or browse our step-by-step application guides.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            href="/guides"
                                            className="px-4 py-2.5 bg-google-blue text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors text-center"
                                        >
                                            Browse Application Guides
                                        </Link>
                                        <Link
                                            href={`/eligibility-checker?level=${encodeURIComponent(scholarship.level || '')}&state=${encodeURIComponent(scholarship.state || '')}&caste=${encodeURIComponent(scholarship.caste?.join(',') || '')}&income=${scholarship.income_limit || ''}`}
                                            className="px-4 py-2.5 bg-surface-gray text-gray-800 border border-gray-200 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors text-center"
                                        >
                                            Check Eligibility
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Legal Disclaimer */}
                        <section className="mt-8 pb-8 border-b border-gray-150">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-gray-400" />
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Legal Disclaimer</h2>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                IndiaScholarships.in attempts to provide accurate information manually curated from official sources.
                                Scholarship details, timelines, and eligibility can change without notice as per the provider's discretion.
                                Applying for a scholarship does not guarantee selection. Always verify all information on the official {scholarship.provider} website before final submission.
                            </p>
                        </section>

                        {/* Related Scholarships */}
                        {relatedScholarships.length > 0 && (
                            <section id="similar-opportunities" className="mt-8 pt-4 scroll-mt-24">
                                <div className="flex items-center gap-2.5 mb-6">
                                    <Award className="h-5 w-5 text-google-blue" />
                                    <h2 className="text-lg font-bold text-gray-900">Similar Opportunities You Can Apply For Today</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {relatedScholarships.map((rel: any) => (
                                        <Link 
                                            key={rel.id} 
                                            href={`/scholarships/${rel.slug}`} 
                                            className="flex flex-col p-4 bg-white border border-gray-200 rounded-2xl hover:border-google-blue transition-all group h-full justify-between"
                                        >
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-google-blue transition-colors line-clamp-2 leading-snug mb-2">
                                                    {rel.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 text-xs font-bold text-google-green">
                                                <span>
                                                    {rel.amount_annual && rel.amount_annual > 0 
                                                        ? `Up to ₹${(rel.amount_annual / 1000).toFixed(0)}k` 
                                                        : (rel.amount_min && rel.amount_min > 0 
                                                            ? `Min. ₹${(rel.amount_min / 1000).toFixed(0)}k` 
                                                            : 'Amount Varies')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sticky Clean Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Clean Direct CTA Box */}
                            <div className="pb-6 border-b border-gray-150">
                                <h3 className="text-base font-extrabold text-gray-900 mb-1">Apply for this Scholarship</h3>
                                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                                    Submit your application directly through the official provider portal.
                                </p>
                                {cleanApplyUrl ? (
                                    <a
                                        href={cleanApplyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3.5 bg-google-blue text-white text-center font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Visit Official Portal ↗
                                    </a>
                                ) : (
                                    <div className="block w-full py-3.5 bg-surface-gray text-gray-400 text-center font-bold text-xs rounded-xl cursor-not-allowed">
                                        Official Link Not Available
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <ShieldCheck className="h-3.5 w-3.5 text-google-green" />
                                    Verified Official Source
                                </div>
                            </div>

                            <ShareButtons
                                title={scholarship.title}
                                url={`https://www.indiascholarships.in/scholarships/${scholarship.slug}`}
                            />

                            {/* Telegram Link */}
                            <div className="py-4 border-b border-gray-150 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-google-blue flex items-center justify-center shrink-0">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.47-1.08 6.16-.13.72-.4 1.15-.65 1.17-.56.05-1.03-.45-1.52-.77-.77-.5-1.21-.81-1.95-1.3-.86-.56-.3-.87.19-1.38.13-.13 2.33-2.14 2.37-2.33.01-.02.01-.11-.04-.16-.05-.05-.12-.03-.18-.02-.07.01-1.25.79-3.53 2.33-.33.23-.64.34-.91.33-.3-.01-.88-.17-1.31-.31-.53-.17-.95-.26-.91-.56.02-.15.22-.31.62-.48 2.43-1.06 4.05-1.76 4.86-2.1 2.31-.97 2.79-1.14 3.1-.14.07.03.22.18.23.28.01.12.01.25 0 .39z"/>
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-gray-900 block">Get Deadline Alerts</span>
                                    <a href="https://t.me/IndiaScholarships1" target="_blank" rel="noopener noreferrer" className="text-google-blue font-bold hover:underline flex items-center gap-1">
                                        Join Telegram Channel <ChevronRight className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>

                            {/* Supporting Guides Link List */}
                            <div className="py-4 border-b border-gray-150">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Supporting Guides</h3>
                                <nav className="space-y-1.5 text-xs font-bold text-gray-700">
                                    <Link href={`/scholarships/${scholarship.slug}/eligibility`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Eligibility Criteria</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/income-limit`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Income Limit</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/documents-required`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Documents Required</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/last-date`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Last Date & Timelines</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/selection-process`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Selection Process</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/apply-online`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>How to Apply Online</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/renewal-process`} className="hover:text-google-blue flex items-center justify-between py-1">
                                        <span>Renewal Process</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                    </Link>
                                </nav>
                            </div>

                            {/* Related Discovery Links (Dynamic) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Discover More</h3>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/scholarships-level/${getCanonicalSlugForLevel(scholarship.level)}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        For {Array.isArray(scholarship.level) ? scholarship.level[0] : (String(scholarship.level || '').split(',')[0] || 'Students')}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-in/${scholarship.state ? slugify(scholarship.state) : 'all-india'}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
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
                                    <Link href={getScholarshipTypeRoute(scholarship.scholarship_type)} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        {scholarship.scholarship_type} Listings
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
