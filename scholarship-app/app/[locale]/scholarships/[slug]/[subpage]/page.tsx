import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getLocalizedScholarshipBySlug, getRelatedScholarships, getCleanSteps } from '@/lib/db';

export const revalidate = 86400; // Align server revalidation to 24 hours

import { formatDeadlineDate, sanitizeApplyUrl } from '@/lib/utils';
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
    RefreshCcw,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LanguageDetector from '@/app/components/LanguageDetector';

const SUBPAGE_METRICS: Record<string, { label: string, icon: any }> = {
    'eligibility': { label: 'Eligibility Criteria', icon: CheckCircle2 },
    'income-limit': { label: 'Income Limit', icon: IndianRupee },
    'documents-required': { label: 'Documents Required', icon: ShieldCheck },
    'last-date': { label: 'Last Date & Deadlines', icon: Calendar },
    'selection-process': { label: 'Selection Process', icon: Award },
    'apply-online': { label: 'Apply Online', icon: Globe },
    'renewal-process': { label: 'Renewal Process', icon: RefreshCcw }
};

function getDynamicIntro(subpage: string, scholarship: any, year: number): string {
    const title = scholarship.title || 'this scholarship';
    const provider = scholarship.provider || 'the scholarship provider';
    const state = scholarship.state || 'India';
    const amount = scholarship.amount_annual > 0 
        ? `up to ₹${scholarship.amount_annual.toLocaleString('en-IN')} annually` 
        : 'financial assistance';

    switch (subpage) {
        case 'eligibility':
            return `To qualify for the ${title} ${year} program, candidates must satisfy the eligibility criteria set by ${provider}. This includes academic benchmarks, category-specific requirements, and gender limits for students residing in ${state}.`;
        case 'income-limit':
            return `The family income threshold is a critical selection parameter for the ${title} ${year}. This guide details the maximum annual income limit, parent/guardian occupation parameters, and the official verification rules required for students in ${state}.`;
        case 'documents-required':
            return `Applicants for the ${title} ${year} must prepare and upload a specific set of official documents. Having these certificates, marksheets, and identity cards ready in the correct formats ensures a smooth application verification process.`;
        case 'last-date':
            return `Staying updated on key timelines and deadlines for the ${title} ${year} cycle is crucial to avoid application rejection. Below are the official opening dates, last dates for online submission, and verification schedules.`;
        case 'selection-process':
            return `Candidates for the ${title} ${year} are evaluated and ranked based on pre-defined parameters. Understand how merit lists are generated, income verification priorities, and the final disbursement flow of the ${amount} benefit.`;
        case 'apply-online':
            return `The official application process for the ${title} ${year} is conducted online. Follow this step-by-step registration guide to create an account, fill out the application details, upload documents, and submit your form.`;
        case 'renewal-process':
            return `If you are a past beneficiary of the ${title}, you can renew your scholarship to continue receiving benefits. Learn about the academic performance benchmarks, minimum attendance criteria, and renewal application portals.`;
        default:
            return '';
    }
}

function getFilteredFaqs(faqs: any[], subpage: string): any[] {
    const keywords: Record<string, string[]> = {
        'eligibility': ['eligibility', 'eligible', 'who can', 'marks', 'percentage', 'qualification', 'gender', 'caste', 'income', 'domicile', 'resident', 'qualify'],
        'income-limit': ['income', 'salary', 'annual income', 'certificate', 'family income', 'limit', 'bar'],
        'documents-required': ['document', 'certificate', 'upload', 'aadhaar', 'marksheet', 'bank', 'passbook', 'domicile', 'photo', 'income certificate', 'docs', 'required'],
        'last-date': ['date', 'deadline', 'last date', 'when', 'timeline', 'extend', 'close', 'open'],
        'selection-process': ['selection', 'select', 'merit', 'rank', 'verify', 'verification', 'list', 'shortlist', 'disburse', 'fund'],
        'apply-online': ['apply', 'online', 'register', 'how to', 'link', 'portal', 'website', 'form', 'submit', 'login', 'apply online'],
        'renewal-process': ['renewal', 'renew', 'continue', 'next year', 'second year', 'maintain', 'cgpa', 'attendance']
    };

    const subpageKeywords = keywords[subpage] || [];
    const filtered = faqs.filter(faq => {
        const qText = (faq.question || faq.q || '').toLowerCase();
        const aText = (faq.answer || faq.a || '').toLowerCase();
        return subpageKeywords.some(kw => qText.includes(kw) || aText.includes(kw));
    });

    if (filtered.length === 0) {
        return faqs.slice(0, 2);
    }
    return filtered;
}

// Generate static params dynamically for top scholarships across localized routes
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    const topScholarships = scholarships.slice(0, 20);
    const subpages = Object.keys(SUBPAGE_METRICS);
    const locales = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];

    const params: Array<{ slug: string, subpage: string, locale: string }> = [];
    for (const s of topScholarships) {
        for (const subpage of subpages) {
            for (const locale of locales) {
                params.push({ slug: s.slug, subpage, locale });
            }
        }
    }
    return params;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string, subpage: string, locale: string }> }): Promise<Metadata> {
    const { slug, subpage, locale } = await params;
    const scholarship = await getLocalizedScholarshipBySlug(slug, locale);

    if (!scholarship || !SUBPAGE_METRICS[subpage]) {
        return {
            title: 'Page Not Found',
        };
    }

    const title = scholarship.title;
    const year = scholarship.verification_year || new Date().getFullYear();
    let seoTitle = '';
    let seoDesc = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);


    switch (subpage) {
        case 'eligibility':
            seoTitle = `${title} Eligibility Criteria ${year}: Do You Qualify?`;
            seoDesc = `Detailed eligibility criteria for ${title} ${year} including minimum marks, qualifying levels, category/caste limits, gender rules, and domicile requirements.`;
            break;
        case 'income-limit':
            seoTitle = `${title} Income Limit ${year}: Family Income Rules`;
            seoDesc = `Find the maximum annual family income limit to qualify for ${title} ${year}. Includes required income certificates and validation rules.`;
            break;
        case 'documents-required':
            seoTitle = `${title} Documents Required ${year}: Full Application Checklist`;
            seoDesc = `Complete list of documents required to apply for ${title} ${year}. Seed your Aadhaar, prepare marksheets, certificates, and check format sizes.`;
            break;
        case 'last-date':
            seoTitle = isDeadlinePassed
                ? `${title} Last Date ${year}: Closed Deadline & Previous Timelines`
                : `${title} Last Date ${year}: Application Deadline & Timelines`;
            seoDesc = `Check the official last date to apply online for ${title} ${year}. Includes timeline extensions, portal opening dates, and status check windows.`;
            break;
        case 'selection-process':
            seoTitle = `${title} Selection Process ${year}: How Winners are Selected`;
            seoDesc = `Learn how students are selected and ranked for ${title} ${year}. Details on merit lists, income priority rules, and verification stages.`;
            break;
        case 'apply-online':
            seoTitle = isDeadlinePassed
                ? `${title} Apply Online ${year}: Portal Details & Eligibility Rules`
                : `${title} Apply Online ${year}: Step-by-Step Registration Guide`;
            seoDesc = `Official portal link and registration guide to apply online for ${title} ${year}. Track your application status and check login details.`;
            break;
        case 'renewal-process':
            seoTitle = `${title} Renewal Process ${year}: Continuity Rules & Guidelines`;
            seoDesc = `Renewal rules for ${title} ${year}. Maintain your scholarship with minimum attendance, pass marks, and learn how to re-apply online.`;
            break;
    }

    return {
        title: seoTitle,
        description: seoDesc,
        alternates: {
            canonical: `https://www.indiascholarships.in/${locale}/scholarships/${slug}/${subpage}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/scholarships/${slug}/${subpage}`,
                'en': `https://www.indiascholarships.in/scholarships/${slug}/${subpage}`,
                'hi': `https://www.indiascholarships.in/hi/scholarships/${slug}/${subpage}`,
                'bn': `https://www.indiascholarships.in/bn/scholarships/${slug}/${subpage}`,
                'ta': `https://www.indiascholarships.in/ta/scholarships/${slug}/${subpage}`,
                'te': `https://www.indiascholarships.in/te/scholarships/${slug}/${subpage}`,
                'or': `https://www.indiascholarships.in/or/scholarships/${slug}/${subpage}`,
                'kn': `https://www.indiascholarships.in/kn/scholarships/${slug}/${subpage}`,
            }
        }
    };

}

export default async function ScholarshipSubpage({ params }: { params: Promise<{ slug: string, subpage: string, locale: string }> }) {
    const { slug, subpage, locale } = await params;
    const scholarship = await getLocalizedScholarshipBySlug(slug, locale);

    if (!scholarship || !SUBPAGE_METRICS[subpage]) {
        notFound();
    }

    const metric = SUBPAGE_METRICS[subpage];
    const PageIcon = metric.icon;
    const relatedScholarships = await getRelatedScholarships(scholarship.id, 3);
    const year = scholarship.verification_year || new Date().getFullYear();
    const cleanApplyUrl = sanitizeApplyUrl(scholarship.apply_url || scholarship.official_source);
    const cleanOfficialSource = sanitizeApplyUrl(scholarship.official_source || scholarship.apply_url);

    // Helper to display helpline
    const displayHelpline = (val: string | null | undefined) => {
        if (!val || val.trim() === '') return 'Refer Official Site';
        const lower = val.trim().toLowerCase();
        if (lower === 'not specified' || lower === 'na' || lower === 'n/a' || lower === 'none') {
            return 'Refer Official Site';
        }
        return val;
    };

    let faqSchema: any = null;
    try {
        let faqs = scholarship.faq_json;
        if (typeof faqs === 'string') {
            try { faqs = JSON.parse(faqs); } catch (e) {}
        }
        if (Array.isArray(faqs) && faqs.length > 0) {
            const filteredFaqs = getFilteredFaqs(faqs, subpage);
            const mainEntity = filteredFaqs.map((faq: any) => ({
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

    // HowTo schema for apply-online
    let howToSchema: any = null;
    if (subpage === 'apply-online' && scholarship.step_guide) {
        try {
            const steps = getCleanSteps(scholarship.step_guide);
            if (steps && steps.length > 0) {
                howToSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'HowTo',
                    'name': `How to Apply Online for ${scholarship.title} ${year}`,
                    'step': steps.map((step: string, idx: number) => ({
                        '@type': 'HowToStep',
                        'position': idx + 1,
                        'text': step
                    }))
                };
            }
        } catch (e) {}
    }

    const ContentVerificationFallback = () => (
        <div className="p-8 bg-gray-50 border border-gray-150 rounded-3xl text-center">
            <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Content Verification in Progress</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                The official guidelines, required documents, or step-by-step procedures for this scholarship cycle are currently being audited and verified by our editorial team.
            </p>
            <div className="flex justify-center gap-4">
                <Link href={`/scholarships/${scholarship.slug}`} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    Back to Overview
                </Link>
                {cleanOfficialSource && (
                    <a href={cleanOfficialSource} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                        Visit Official Portal
                    </a>
                )}
            </div>
        </div>
    );

    // Helper to format text lists and parse inline markdown
    const FormattedText = ({ text }: { text: string | null }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;
        
        const renderMarkdown = (txt: string) => {
            const parts = txt.split(/\*\*([\s\S]*?)\*\*/g);
            return parts.map((part, index) => {
                if (index % 2 === 1) {
                    return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
                }
                return part;
            });
        };

        let items: string[] = [];
        let isNumbered = false;

        if (/Step \d+:/i.test(text) || /\b\d+\.\s+/.test(text)) {
            items = getCleanSteps(text);
            isNumbered = true;
        } else {
            items = text
                .split(/\.\s+(?=[A-Z])|(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
        }

        if (items.length <= 1) {
            return <p className="text-gray-700 leading-relaxed">{renderMarkdown(text)}</p>;
        }

        return (
            <ul className="space-y-3 list-none">
                {items.map((item, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed flex items-start gap-3">
                        {isNumbered ? (
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {i + 1}
                            </span>
                        ) : (
                            <div className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                        <p className="flex-1">{renderMarkdown(item)}</p>
                    </li>
                ))}
            </ul>
        );
    };

    // Format list of documents
    const formatDocs = (docs: any) => {
        if (!docs) return <p className="text-gray-400 italic">Not specified</p>;
        
        let docsArray: string[] = [];
        if (Array.isArray(docs)) {
            docsArray = docs;
        } else if (typeof docs === 'string') {
            try {
                const parsed = JSON.parse(docs);
                if (Array.isArray(parsed)) {
                    docsArray = parsed;
                } else {
                    docsArray = [docs];
                }
            } catch (e) {
                docsArray = docs.split('\n').map((s: string) => s.trim()).filter(Boolean);
            }
        }

        if (docsArray.length > 0) {
            return (
                <ul className="space-y-3">
                    {docsArray.map((doc: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span>{doc}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        return <p className="text-gray-400 italic">Not specified</p>;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/scholarships" className="hover:text-blue-700 transition-colors">Scholarships</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={`/scholarships/${scholarship.slug}`} className="hover:text-blue-700 transition-colors max-w-xs truncate">{scholarship.title}</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium truncate">{metric.label}</span>
                </nav>
            </div>

            <LanguageDetector slug={scholarship.slug} />

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: `${scholarship.title} ${metric.label} ${year}`,
                        description: `${metric.label} information for ${scholarship.title}.`,
                        breadcrumb: {
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.indiascholarships.in' },
                                { '@type': 'ListItem', position: 2, name: 'Scholarships', item: 'https://www.indiascholarships.in/scholarships' },
                                { '@type': 'ListItem', position: 3, name: scholarship.title, item: `https://www.indiascholarships.in/scholarships/${scholarship.slug}` },
                                { '@type': 'ListItem', position: 4, name: metric.label }
                            ]
                        }
                    })
                }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            {howToSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back to Parent Banner */}
                <div className="mb-8">
                    <Link href={`/${locale}/scholarships/${scholarship.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Full {scholarship.title} Overview
                    </Link>
                </div>

                {/* Mobile Navigation Tabs (sticky at top-0 on mobile) */}
                <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 border-b border-gray-200/80 shadow-xs mb-6">
                    <Link 
                        href={`/${locale}/scholarships/${scholarship.slug}`}
                        className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-all"
                    >
                        Overview
                    </Link>
                    {Object.entries(SUBPAGE_METRICS).map(([key, value]) => {
                        const isActive = key === subpage;
                        return (
                            <Link 
                                key={key} 
                                href={`/${locale}/scholarships/${scholarship.slug}/${key}`}
                                className={`flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
                                    isActive 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {value.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Title Header */}
                        <div className="mb-10 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {scholarship.provider_type} Scheme
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified for {year}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-2xl flex-shrink-0">
                                    <PageIcon className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                {scholarship.title} {metric.label} {year}
                            </h1>
                        </div>
                        {/* Specific Subpage Content Blocks */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm mb-12">
                            {/* Dynamic Semantic Intro Paragraph */}
                            <p className="text-gray-600 leading-relaxed mb-8 text-base border-l-4 border-blue-600 pl-4 italic bg-blue-50/20 py-3.5 pr-4 rounded-r-2xl">
                                {getDynamicIntro(subpage, scholarship, year)}
                            </p>

                            {subpage === 'eligibility' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Qualifying Mark/Percent</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.min_marks > 0 ? `${scholarship.min_marks}% marks in previous class` : 'Passing marks only'}</span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Target Education Levels</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.level || 'All education levels'}</span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Eligible Caste/Categories</span>
                                            <span className="text-gray-900 font-bold text-lg">
                                                {scholarship.caste.join(', ') || 'All categories (General/OBC/SC/ST)'}
                                            </span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Gender Limit</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.gender || 'Open to all (Boys and Girls)'}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Residency/Domicile Requirements</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">{scholarship.residency_requirement || `Must be a permanent resident of ${scholarship.state || 'India'}.`}</p>
                                    </div>
                                    {scholarship.special_conditions && (
                                        <div className="border-t border-gray-100 pt-6">
                                            <h3 className="font-bold text-gray-900 mb-3 text-lg font-bold">Special Conditions</h3>
                                            <p className="text-gray-700 leading-relaxed">{scholarship.special_conditions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {subpage === 'income-limit' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-red-50/40 rounded-2xl border border-red-100/50 flex gap-4 items-start">
                                        <div className="p-2 bg-red-100 rounded-xl text-red-700 mt-1">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-950 text-lg mb-1">Maximum Annual Family Income</h3>
                                            <p className="text-2xl font-black text-red-800 tracking-tight">{scholarship.income_limit ? `₹${scholarship.income_limit.toLocaleString('en-IN')} per annum` : 'No Income Bar / Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Income Verification Rules</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Applicants must submit a valid annual income certificate issued by a competent revenue officer (such as a Tahsildar, Revenue Inspector, or Sub-Divisional Magistrate).
                                        </p>
                                        <ul className="space-y-3 text-gray-700">
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>The certificate must be in the name of the parent/legal guardian.</span>
                                            </li>
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Income certificates issued by private employers or self-declarations on plain paper are not accepted.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {subpage === 'documents-required' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">Required Documents Checklist</h3>
                                    {!scholarship.docs_needed || (Array.isArray(scholarship.docs_needed) && scholarship.docs_needed.length === 0) || (typeof scholarship.docs_needed === 'string' && scholarship.docs_needed.trim() === '') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            {formatDocs(scholarship.docs_needed)}
                                            <div className="mt-8 p-5 bg-blue-50/40 border border-blue-100 rounded-2xl">
                                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                    <ShieldCheck className="h-5 w-5 text-blue-700" />
                                                    DBT Bank Seeding Warning
                                                </h4>
                                                <p className="text-sm text-blue-950 leading-relaxed">
                                                    Your primary bank account must be active, seeded with your Aadhaar card, and mapped on the NPCI mapper. The government disbursements are made exclusively via Direct Benefit Transfer (DBT).
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {subpage === 'last-date' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-amber-50/40 rounded-2xl border border-amber-100 flex gap-4 items-start mb-6">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-1">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-950 text-lg mb-1">Application Deadline</h3>
                                            <p className="text-2xl font-black text-amber-800 tracking-tight">
                                                {scholarship.always_open === 1 ? 'Open Year-Round (Continuous Enrollment)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            {scholarship.deadline_description && (
                                                <p className="text-sm text-amber-900 mt-1">{scholarship.deadline_description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Timeline Details & Extensions</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Applications must be submitted and finalized before 11:59 PM on the closing date. We advise students to submit applications at least a week in advance to avoid last-minute server bottlenecks.
                                        </p>
                                        <ul className="space-y-3 text-gray-700">
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Institute-level verification continues for 15-30 days after the student application deadline.</span>
                                            </li>
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Incomplete or unfinalized drafts are auto-rejected on the last date.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {subpage === 'selection-process' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">How Candidates are Selected</h3>
                                    {!scholarship.selection || scholarship.selection.trim() === '' || scholarship.selection.toLowerCase().includes('sanctioning depends on') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            <p className="text-gray-700 leading-relaxed mb-6">{scholarship.selection}</p>
                                            <div className="border-t border-gray-100 pt-6">
                                                <h4 className="font-bold text-gray-900 mb-4">Verification Flow</h4>
                                                <div className="space-y-4">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">Institute Nodal Officer Verification</h5>
                                                            <p className="text-sm text-gray-600">Your college/school checks your bonafide status, fees paid, and marks cards against the database.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">District Welfare Officer / State Board Sanction</h5>
                                                            <p className="text-sm text-gray-600">The state/central department approves the budget release for verified records based on category quotas.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">Fund Disbursement via DBT</h5>
                                                            <p className="text-sm text-gray-600">The bank issues direct fund credits to Aadhaar-seeded accounts using treasury payment systems.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {subpage === 'apply-online' && (
                                <div className="space-y-8">
                                    
                                    {/* Verification Status Card */}
                                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-start gap-4 shadow-sm">
                                        <div className="relative flex h-3 w-3 mt-1.5 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-google-green opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-google-green"></span>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-emerald-950 text-base flex items-center gap-2 leading-none">
                                                Official Application Portal Link Verified
                                            </h3>
                                            <p className="text-xs text-emerald-800 leading-relaxed">
                                                Secure redirect connection active. Follow the steps below carefully to prevent common submission mistakes and document rejection.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Secondary CTA: Secure External Portal Redirect */}
                                    {cleanApplyUrl && (
                                        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-200/80 p-5 rounded-2xl bg-emerald-50/20 shadow-xs">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">Official Destination</span>
                                                <p className="text-xs text-gray-600 truncate font-mono block w-full">{cleanApplyUrl}</p>
                                            </div>
                                            <a
                                                href={cleanApplyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-[44px] px-6 bg-google-green hover:bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto shrink-0 shadow-sm cursor-pointer"
                                            >
                                                Go to Official Portal
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}

                                    {/* AdSense Placement (Rendered only when active publisher ID is configured) */}
                                    {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
                                        <div className="my-8 p-4 bg-surface-gray border border-border-gray rounded-3xl flex flex-col items-center justify-center min-h-[180px]">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Advertisement</span>
                                            <div 
                                                dangerouslySetInnerHTML={{
                                                    __html: `
                                                        <ins class="adsbygoogle"
                                                             style="display:block; text-align:center;"
                                                             data-ad-layout="in-article"
                                                             data-ad-format="fluid"
                                                             data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}"
                                                             data-ad-slot="XXXXXXXXXX"></ins>
                                                        <script>
                                                             (adsbygoogle = window.adsbygoogle || []).push({});
                                                        </script>
                                                    `
                                                }}
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Support our free directory by viewing verified ads.</p>
                                        </div>
                                    )}

                                    {/* Step-by-Step Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 text-lg">Application Steps & Portal Guide</h3>
                                        {!scholarship.step_guide || scholarship.step_guide.trim() === '' ? (
                                            <div className="p-6 text-center border border-dashed border-gray-200 bg-gray-50 rounded-2xl text-gray-500 font-medium text-xs">
                                                Portal application instructions verification in progress.
                                            </div>
                                        ) : (
                                            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                                <FormattedText text={scholarship.step_guide} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {subpage === 'renewal-process' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">Renewal Guidelines & Conditions</h3>
                                    {!scholarship.renewal || scholarship.renewal.trim() === '' || scholarship.renewal.toLowerCase().includes('please refer to') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            <p className="text-gray-700 leading-relaxed mb-6">{scholarship.renewal}</p>
                                            
                                            <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-2xl">
                                                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                    <Info className="h-5 w-5" />
                                                    Key Renewal Prerequisites
                                                </h4>
                                                <ul className="space-y-2 text-sm text-amber-950 leading-relaxed list-disc pl-5">
                                                    <li>Must pass the previous annual/semester examination in the first attempt.</li>
                                                    <li>No active backlogs or ATKT are permitted in most professional programs.</li>
                                                    <li>Must maintain regular class attendance (typically 75% or higher) validated by the college.</li>
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FAQs Section */}
                        {(() => {
                            try {
                                let faqs = scholarship.faq_json;
                                if (typeof faqs === 'string') {
                                    try { faqs = JSON.parse(faqs); } catch (e) { }
                                }
                                if (!faqs || (Array.isArray(faqs) && faqs.length === 0)) return null;

                                const filteredFaqs = getFilteredFaqs(faqs, subpage);
                                if (filteredFaqs.length === 0) return null;

                                return (
                                    <section className="mb-12">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                            FAQs for {scholarship.title} ({metric.label})
                                        </h2>
                                        <div className="space-y-4">
                                            {filteredFaqs.map((faq: any, i: number) => (
                                                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                    <h3 className="font-bold text-gray-900 mb-2 text-md flex gap-2">
                                                        <span className="text-blue-600">Q.</span>
                                                        {faq.question || faq.q}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm pl-6">{faq.answer || faq.a}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            } catch (e) { return null; }
                        })()}
                    </div>

                    {/* Right Column: Sidebar Navigation & Related */}
                    <div className="space-y-8">
                        {/* Quick Links Sidebar */}
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8">
                            <h3 className="font-extrabold text-gray-900 text-lg mb-6 tracking-tight uppercase text-xs text-gray-400">Supporting Guides</h3>
                            <nav className="space-y-2">
                                {Object.entries(SUBPAGE_METRICS).map(([key, value]) => {
                                    const isActive = key === subpage;
                                    return (
                                        <Link 
                                            key={key} 
                                            href={`/scholarships/${scholarship.slug}/${key}`}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                                isActive 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                            }`}
                                        >
                                            <span>{value.label}</span>
                                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Helpline Support card */}
                        <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 md:p-8">
                            <h3 className="font-bold text-blue-900 text-md mb-4 uppercase tracking-wider text-xs">Official Support</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Website</span>
                                        {cleanOfficialSource ? (
                                            <a href={cleanOfficialSource} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold text-sm truncate block hover:underline">
                                                Official Portal
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 font-medium text-sm block">Link Pending</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Helpline</span>
                                        <span className="text-gray-900 font-bold text-sm">{displayHelpline(scholarship.helpline)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Opportunities */}
                        {relatedScholarships && relatedScholarships.length > 0 && (
                            <div className="border border-gray-100 rounded-3xl p-6 md:p-8 bg-white shadow-sm">
                                <h3 className="font-extrabold text-gray-900 text-lg mb-6 tracking-tight uppercase text-xs text-gray-400">Related Schemes</h3>
                                <div className="space-y-4">
                                    {relatedScholarships.map((related: any) => (
                                        <div key={related.id} className="group">
                                            <Link href={`/scholarships/${related.slug}`} className="block">
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-sm leading-snug mb-1">
                                                    {related.title}
                                                </h4>
                                                <span className="text-xs text-gray-400">{related.provider_type} Scholarship</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
